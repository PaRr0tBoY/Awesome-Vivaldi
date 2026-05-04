// ==UserScript==
// @name         Pinned Tab Restore
// @description  Zen-style pinned tab URL change tracking with reset button and visual indicators.
// @requirements PinnedTabRestore.css
// @version      2026.5.4
// @author       PaRr0tBoY
// ==/UserScript==

(() => {
  "use strict";

  const LOG = "[PinnedTabRestore]";
  const ATTR = "pinned-changed";
  const DATA_KEY = "originalPinnedUrl";
  const RESTORE_ON_STARTUP = true;
  let initialScanDone = false;

  function getTab(tabId) {
    return new Promise((resolve) => {
      chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError) return resolve(null);
        if (tab?.vivExtData && typeof tab.vivExtData === "string") {
          try { tab.vivExtData = JSON.parse(tab.vivExtData); } catch {}
        }
        resolve(tab);
      });
    });
  }

  function updateTabExtData(tabId, viv) {
    return new Promise((resolve) => {
      chrome.tabs.update(tabId, { vivExtData: JSON.stringify(viv) }, () => {
        if (chrome.runtime.lastError) console.warn(LOG, chrome.runtime.lastError.message);
        resolve();
      });
    });
  }

  function getOriginalFaviconUrl(originalUrl) {
    try {
      return `https://www.google.com/s2/favicons?domain=${new URL(originalUrl).hostname}&sz=32`;
    } catch { return ""; }
  }

  function getTabWrapper(tabId) {
    return document.querySelector(`.tab-wrapper[data-id="tab-${tabId}"]`);
  }

  // ── State ────────────────────────────────────────────────────────

  async function recordOriginalUrl(tabId, url) {
    const tab = await getTab(tabId);
    if (!tab) return;
    const viv = tab.vivExtData || {};
    if (!viv[DATA_KEY]) {
      viv[DATA_KEY] = url;
      await updateTabExtData(tabId, viv);
    }
  }

  async function clearOriginalUrl(tabId) {
    const tab = await getTab(tabId);
    if (!tab) return;
    const viv = tab.vivExtData || {};
    if (viv[DATA_KEY]) {
      delete viv[DATA_KEY];
      await updateTabExtData(tabId, viv);
    }
  }

  function markChanged(wrapper, originalUrl) {
    if (!wrapper || wrapper.getAttribute(ATTR) === "true") return;
    wrapper.setAttribute(ATTR, "true");
    injectUI(wrapper, originalUrl);
  }

  function unmarkChanged(wrapper) {
    if (!wrapper) return;
    wrapper.removeAttribute(ATTR);
    wrapper.querySelector(".tab-reset-pin-button")?.remove();
    wrapper.querySelector(".pinned-tab-divider")?.remove();
    wrapper.querySelector(".pinned-tab-sublabel")?.remove();
  }

  // ── Modifier key → sublabel text ──────────────────────────────────
  // Vivaldi window.html is a separate frame; keyboard events from web
  // content don't reach it. Inject a content script into each tab to
  // track modifier keys, then read the shared state via executeScript.

  let _hoveredWrapper = null;
  let _modPollId = null;
  let _lastModState = { alt: false, accel: false };
  let _activeTabId = null;
  let _modTrackGen = 0; // generation counter to prevent stale async calls

  function applySublabel(wrapper, alt, accel) {
    const label = wrapper?.querySelector(".pinned-tab-sublabel");
    if (!label) return;
    if (alt) label.textContent = "Replace pinned url with current";
    else if (accel) label.textContent = "Separate from pinned tab";
    else label.textContent = "Back to pinned url";
  }

  function getTabIdFromWrapper(wrapper) {
    const dataId = wrapper?.getAttribute("data-id");
    if (!dataId) return null;
    const id = parseInt(dataId.replace("tab-", ""), 10);
    return isNaN(id) ? null : id;
  }

  // Inject modifier tracker into a tab (idempotent)
  async function injectModTracker(tabId) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        world: "MAIN",
        func: () => {
          if (window.__ptr_modTracker) return;
          window.__ptr_modTracker = true;
          window.__ptr_modifiers = { alt: false, meta: false, ctrl: false };
          const update = (e) => {
            window.__ptr_modifiers = { alt: e.altKey, meta: e.metaKey, ctrl: e.ctrlKey };
          };
          document.addEventListener("keydown", update, true);
          document.addEventListener("keyup", update, true);
          document.addEventListener("mousemove", update, true);
        },
      });
    } catch {}
  }

  async function readModifiersFromPage(tabId) {
    try {
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId },
        world: "MAIN",
        func: () => window.__ptr_modifiers || { alt: false, meta: false, ctrl: false },
      });
      return result || { alt: false, meta: false, ctrl: false };
    } catch {
      return { alt: false, meta: false, ctrl: false };
    }
  }

  async function pollModifiers() {
    if (!_hoveredWrapper || !_hoveredWrapper.isConnected) {
      _hoveredWrapper = null;
      return;
    }
    // Always read from the focused tab (keyboard events only fire there)
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true }).catch(() => []);
    if (activeTab && activeTab.id !== _activeTabId) {
      _activeTabId = activeTab.id;
      injectModTracker(_activeTabId);
    }
    if (_activeTabId) {
      const mods = await readModifiersFromPage(_activeTabId);
      const accel = mods.meta || mods.ctrl;
      if (mods.alt !== _lastModState.alt || accel !== _lastModState.accel) {
        _lastModState = { alt: mods.alt, accel };
        applySublabel(_hoveredWrapper, mods.alt, accel);
      }
    }
    _modPollId = requestAnimationFrame(pollModifiers);
  }

  async function startModTracking(wrapper) {
    const gen = ++_modTrackGen;
    _hoveredWrapper = wrapper;
    _lastModState = { alt: false, accel: false };
    _activeTabId = null;
    if (_modPollId) cancelAnimationFrame(_modPollId);
    pollModifiers();
  }

  function stopModTracking() {
    _modTrackGen++;
    if (_modPollId) { cancelAnimationFrame(_modPollId); _modPollId = null; }
    if (_hoveredWrapper) {
      const label = _hoveredWrapper.querySelector(".pinned-tab-sublabel");
      if (label) label.textContent = "Back to pinned url";
    }
    _hoveredWrapper = null;
    _activeTabId = null;
  }

  // ── UI injection ─────────────────────────────────────────────────
  // DOM: .tab-wrapper > .tab > .tab-header > (.favicon > img) + (.title)

  function injectUI(wrapper, originalUrl) {
    const tabHeader = wrapper.querySelector(".tab-header");
    if (!tabHeader) return;

    const favicon = tabHeader.querySelector(".favicon");
    const titleEl = tabHeader.querySelector(".title");

    // Reset button: first child of .tab-header, absolute overlay on favicon
    if (!tabHeader.querySelector(".tab-reset-pin-button")) {
      const btn = document.createElement("div");
      btn.className = "tab-reset-pin-button";
      btn.title = "Back to pinned url";
      btn.setAttribute("role", "button");
      btn.setAttribute("tabindex", "-1");

      const img = document.createElement("img");
      img.src = getOriginalFaviconUrl(originalUrl);
      img.alt = "";
      img.draggable = false;
      btn.appendChild(img);

      // Poll modifier keys while hovering the reset button
      btn.addEventListener("mouseenter", () => { startModTracking(wrapper); });
      btn.addEventListener("mouseleave", () => { stopModTracking(); });

      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        e.preventDefault();
        const dataId = wrapper.getAttribute("data-id");
        if (!dataId) return;
        const tabId = parseInt(dataId.replace("tab-", ""), 10);
        if (isNaN(tabId)) return;

        const tabData = await getTab(tabId);
        if (!tabData) return;
        const origUrl = (tabData.vivExtData || {})[DATA_KEY];
        if (!origUrl) return;

        if (e.altKey) {
          // Alt+click: Replace pinned URL with current
          const viv = tabData.vivExtData || {};
          viv[DATA_KEY] = tabData.url;
          await updateTabExtData(tabId, viv);
          unmarkChanged(wrapper);
          // TidyTitles clears fixedTitle itself (chrome.tabs.update can't delete properties)
          document.dispatchEvent(new CustomEvent("pinned-tab-url-replaced", { detail: { tabId } }));
        } else if (e.metaKey || e.ctrlKey) {
          // Cmd/Ctrl+click: Open current URL in new unpinned tab, restore pinned tab
          chrome.tabs.create({ url: tabData.url, pinned: false, index: tabData.index + 1 }, () => {
            if (chrome.runtime.lastError) { console.warn(LOG, chrome.runtime.lastError.message); return; }
            chrome.tabs.update(tabId, { url: origUrl });
          });
        } else {
          // Plain click: Restore to original URL
          chrome.tabs.update(tabId, { url: origUrl });
        }
      });

      tabHeader.insertBefore(btn, tabHeader.firstChild);
    }

    // Slash divider: between favicon and title
    if (!tabHeader.querySelector(".pinned-tab-divider") && favicon) {
      const divider = document.createElement("span");
      divider.className = "pinned-tab-divider";
      divider.textContent = " / ";
      favicon.after(divider);
    }

    // Sublabel: after .title
    if (!tabHeader.querySelector(".pinned-tab-sublabel") && titleEl) {
      const label = document.createElement("span");
      label.className = "pinned-tab-sublabel";
      label.textContent = "Back to pinned url";
      label.title = originalUrl;
      titleEl.after(label);
    }
  }

  // ── Navigation monitoring ────────────────────────────────────────

  async function checkPinnedTabUrl(tabId, url) {
    const tab = await getTab(tabId);
    if (!tab || !tab.pinned) return;

    const viv = tab.vivExtData || {};
    const originalUrl = viv[DATA_KEY];

    if (!originalUrl) {
      await recordOriginalUrl(tabId, url);
      return;
    }

    const wrapper = getTabWrapper(tabId);
    if (!wrapper) return;

    const cleanCurrent = url.split("#")[0];
    const cleanOriginal = originalUrl.split("#")[0];

    if (cleanCurrent !== cleanOriginal) {
      markChanged(wrapper, originalUrl);
    } else {
      unmarkChanged(wrapper);
    }
  }

  // ── Restore on discard ──────────────────────────────────────────

  async function restoreOnDiscard(tabId) {
    // Immediately clean up UI to prevent flicker
    const wrapper = getTabWrapper(tabId);
    if (wrapper && wrapper.getAttribute(ATTR) === "true") {
      unmarkChanged(wrapper);
    }

    const tab = await getTab(tabId);
    if (!tab || !tab.pinned) return;

    const viv = tab.vivExtData || {};
    const originalUrl = viv[DATA_KEY];
    if (!originalUrl) return;

    const cleanCurrent = (tab.url || "").split("#")[0];
    const cleanOriginal = originalUrl.split("#")[0];

    if (cleanCurrent !== cleanOriginal) {
      console.log(LOG, `Discard restore: tab ${tabId} → ${originalUrl}`);
      chrome.tabs.update(tabId, { url: originalUrl });
    }
  }

  // ── Tab listeners ────────────────────────────────────────────────

  function setupTabListeners() {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.pinned === true) {
        recordOriginalUrl(tabId, tab.url || changeInfo.url || "");
        injectModTracker(tabId);
      }
      if (changeInfo.pinned === false) {
        clearOriginalUrl(tabId);
        unmarkChanged(getTabWrapper(tabId));
      }
      if (changeInfo.url && tab.pinned) {
        checkPinnedTabUrl(tabId, changeInfo.url);
      }
      // Restore pinned tab on discard/sleep
      if ((changeInfo.discarded === true || changeInfo.status === "unloaded") && tab.pinned) {
        restoreOnDiscard(tabId);
      }
    });

    if (chrome.webNavigation) {
      chrome.webNavigation.onCommitted.addListener((details) => {
        if (details.frameType !== "outermost_frame") return;
        getTab(details.tabId).then((tab) => {
          if (tab && tab.pinned) {
            checkPinnedTabUrl(details.tabId, details.url);
          }
        });
      });
    }
  }

  // ── Context menu ─────────────────────────────────────────────────

  function setupContextMenu() {
    // Track which tab was right-clicked
    document.addEventListener("contextmenu", (e) => {
      const wrapper = e.target.closest(".tab-wrapper");
      if (!wrapper) {
        window._ptrTabId = null;
        return;
      }
      const dataId = wrapper.getAttribute("data-id");
      if (!dataId) return;
      window._ptrTabId = parseInt(dataId.replace("tab-", ""), 10);
      window._ptrIsChanged = wrapper.getAttribute(ATTR) === "true";

      // Poll for menu appearance (Vivaldi renders it async via React)
      pollForMenu(0);
    }, true);
  }

  function pollForMenu(attempt) {
    if (attempt > 10) return; // Give up after ~150ms
    setTimeout(() => {
      const menu = document.querySelector(".menu:not([data-ptr-injected])");
      if (menu) {
        menu.setAttribute("data-ptr-injected", "true");
        injectMenuItems(menu);
      } else {
        pollForMenu(attempt + 1);
      }
    }, 15);
  }

  function injectMenuItems(menu) {
    const tabId = window._ptrTabId;
    const isChanged = window._ptrIsChanged;
    if (tabId == null) return;

    getTab(tabId).then((tab) => {
      if (!tab || !tab.pinned) return;
      const viv = tab.vivExtData || {};
      const originalUrl = viv[DATA_KEY];
      if (!originalUrl) return;

      const pinItem = Array.from(menu.querySelectorAll(".menu-item")).find(
        (item) => item.textContent?.includes("Pin")
      );
      const insertAfter = pinItem || menu.querySelector(".menu-item:last-child");
      if (!insertAfter) return;

      const sep = document.createElement("div");
      sep.className = "menu-separator";
      sep.setAttribute("role", "separator");

      const resetItem = createMenuItem(
        isChanged ? "Reset Pinned Tab" : "Reset Pinned Tab (unchanged)",
        () => { chrome.tabs.update(tabId, { url: originalUrl }); },
        !isChanged
      );

      const replaceItem = createMenuItem(
        "Replace Pinned URL with Current",
        async () => {
          const freshTab = await getTab(tabId);
          if (!freshTab) return;
          const viv = freshTab.vivExtData || {};
          viv[DATA_KEY] = freshTab.url;
          await updateTabExtData(tabId, viv);
          unmarkChanged(getTabWrapper(tabId));
        },
        false
      );

      insertAfter.after(sep, resetItem, replaceItem);
    });
  }

  function createMenuItem(label, onClick, disabled) {
    const item = document.createElement("div");
    item.className = "menu-item" + (disabled ? " disabled" : "");
    item.setAttribute("role", "menuitem");
    item.setAttribute("tabindex", "-1");

    const content = document.createElement("span");
    content.className = "menu-item-content";
    content.textContent = label;
    item.appendChild(content);

    if (!disabled) {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        onClick();
        item.closest(".menu")?.remove();
      });
    }

    return item;
  }

  // ── DOM observer ─────────────────────────────────────────────────

  let observedTabStrip = null;
  let tabStripObserver = null;

  function observeTabStripInner(tabStrip) {
    if (tabStripObserver) tabStripObserver.disconnect();
    observedTabStrip = tabStrip;

    tabStripObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        // Handle new tab wrappers added to DOM
        if (m.type === "childList") {
          for (const node of m.addedNodes) {
            if (node.nodeType !== Node.ELEMENT_NODE) continue;
            const wrappers = node.classList?.contains("tab-wrapper")
              ? [node]
              : Array.from(node.querySelectorAll?.(".tab-wrapper") || []);
            for (const wrapper of wrappers) {
              const dataId = wrapper.getAttribute("data-id");
              if (!dataId) continue;
              const tabId = parseInt(dataId.replace("tab-", ""), 10);
              if (isNaN(tabId)) continue;
              getTab(tabId).then((tab) => {
                if (!tab || !tab.pinned) return;
                injectModTracker(tabId);
                const viv = tab.vivExtData || {};
                const originalUrl = viv[DATA_KEY];
                if (!originalUrl) {
                  recordOriginalUrl(tabId, tab.url);
                  return;
                }
                const cleanCurrent = (tab.url || "").split("#")[0];
                const cleanOriginal = originalUrl.split("#")[0];
                if (cleanCurrent !== cleanOriginal) {
                  markChanged(wrapper, originalUrl);
                }
              });
            }
          }
        }
        // Handle class changes (isdiscarded) on pinned-changed tabs
        if (m.type === "attributes" && m.attributeName === "class") {
          const wrapper = m.target.closest?.(".tab-wrapper");
          if (!wrapper || wrapper.getAttribute(ATTR) !== "true") continue;
          if (!m.target.classList.contains("isdiscarded")) continue;
          const dataId = wrapper.getAttribute("data-id");
          if (!dataId) continue;
          const tabId = parseInt(dataId.replace("tab-", ""), 10);
          if (isNaN(tabId)) continue;
          restoreOnDiscard(tabId);
        }
      }
    });

    tabStripObserver.observe(tabStrip, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }

  function observeStructure() {
    const root = document.getElementById("browser") || document.body;
    new MutationObserver(() => {
      const tabStrip = document.querySelector(".tab-strip");
      if (!tabStrip) return;
      if (tabStrip !== observedTabStrip) {
        console.log(LOG, ".tab-strip rebuilt, reattaching");
        observeTabStripInner(tabStrip);
        // Don't restore on DOM rebuild (e.g. auto-hide toggle), just mark changed
        scanAllPinnedTabs(false);
      }
    }).observe(root, { childList: true, subtree: true });
  }

  // ── Initial scan ─────────────────────────────────────────────────

  async function scanAllPinnedTabs(restore = false) {
    const tabs = await new Promise((resolve) => {
      chrome.tabs.query({ currentWindow: true }, (tabs) => resolve(tabs || []));
    });

    for (const tab of tabs) {
      if (!tab.pinned || !tab.url) continue;
      injectModTracker(tab.id);

      const viv = (() => {
        if (!tab.vivExtData) return {};
        if (typeof tab.vivExtData === "object") return tab.vivExtData;
        try { return JSON.parse(tab.vivExtData); } catch { return {}; }
      })();

      if (!viv[DATA_KEY]) {
        viv[DATA_KEY] = tab.url;
        updateTabExtData(tab.id, viv);
        continue;
      }

      const cleanCurrent = tab.url.split("#")[0];
      const cleanOriginal = viv[DATA_KEY].split("#")[0];

      // Only restore on first scan (startup), not on DOM rebuild
      if (restore && RESTORE_ON_STARTUP && cleanCurrent !== cleanOriginal) {
        console.log(LOG, `Restoring pinned tab ${tab.id}: ${tab.url} → ${viv[DATA_KEY]}`);
        chrome.tabs.update(tab.id, { url: viv[DATA_KEY] });
        continue;
      }

      if (cleanCurrent !== cleanOriginal) {
        const wrapper = getTabWrapper(tab.id);
        if (wrapper) markChanged(wrapper, viv[DATA_KEY]);
      }
    }
  }

  // ── Init ─────────────────────────────────────────────────────────

  function init() {
    console.log(LOG, "✓ Initialization complete");
    setupTabListeners();
    setupContextMenu();

    setTimeout(() => {
      const tabStrip = document.querySelector(".tab-strip");
      if (tabStrip) observeTabStripInner(tabStrip);
      observeStructure();
      // First scan: restore pinned tabs to original URLs
      scanAllPinnedTabs(true);
    }, 500);
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
