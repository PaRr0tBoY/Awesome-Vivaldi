/* Tab Drag Indicator Mod (Premium Version)
 * Enables Chrome-style drag-and-drop for text/links on Vivaldi Tab Bar.
 * - Center zone: Navigate current tab.
 * - Edge zones: Insert new tab.
 */
(function () {
  "use strict";

  /* ── Config ────────────────────────────────────────────────── */
  const EDGE_FRACTION = 0.35; // Size of the insertion zones (35% each side)
  const TAG = "[TabDragInd+]";
  /* ──────────────────────────────────────────────────────────── */

  let indicator = null;
  let hoveredTabEl = null;
  let activeAction = null; // { type: 'insert'|'replace', chromeId, index, rect }
  let lastDefaultEngine = null;

  function updateSearchEngine() {
    if (window.vivaldi && vivaldi.searchEngines) {
      vivaldi.searchEngines.getTemplateUrls((res) => {
        lastDefaultEngine = res.templateUrls.find(e => e.guid === res.defaultSearch);
      });
    }
  }

  function resolveNativeTemplate(text) {
    if (!lastDefaultEngine || !lastDefaultEngine.url) return null;
    let url = lastDefaultEngine.url;
    
    // 1. Resolve Chromium/Vivaldi internal placeholders
    // Google: {google:baseURL} -> https://google.com/
    url = url.replace("{google:baseURL}", "https://www.google.com/");
    
    // 2. Resolve generic search paths (Yandex, Bing, etc.)
    // {yandex:searchPath} -> search
    url = url.replace(/{[a-z]+:searchPath}/gi, "search");
    
    // 3. Clean up remaining internal engine tokens (sourceId, clid, etc.)
    url = url.replace(/{[a-z]+:[^}]*}/gi, "");
    
    // 4. Resolve the query itself
    return url.replace(/%s|{searchTerms}/g, encodeURIComponent(text));
  }

  function createIndicator() {
    if (indicator && document.body.contains(indicator)) return indicator;
    indicator = document.createElement("div");
    indicator.className = "tab-drag-indicator";
    document.body.appendChild(indicator);
    return indicator;
  }

  function getTabContainers() {
    const strips = document.querySelectorAll(".tab-strip");
    const containers = new Set();
    strips.forEach(s => {
      let p = s.parentElement;
      while (p && p !== document.body) {
        if (p.id?.includes("tabs") || p.classList.contains("tabbar-wrapper") || p.id === "tabs-subcontainer") {
          containers.add(p);
          break;
        }
        p = p.parentElement;
      }
      if (!p) containers.add(s); // Fallback to strip itself
    });
    return Array.from(containers).filter(el => el.offsetParent !== null);
  }

  let activeContainer = null;

  function isValidDrag(e) {
    const types = e.dataTransfer.types;
    
    // 1. Aggressive check for internal tab-related types
    const internalTypes = ["application/vnd.chromium.tab-group", "vivaldi/tab-id", "vivaldi/tab-group", "application/x-vivaldi-tab", "application/vnd.chromium.tab-item"];
    if (internalTypes.some(t => types.includes(t))) return false;

    // 2. Vivaldi tabs often have complex types but no text/html
    const hasInternal = Array.from(types).some(t => t.includes("vivaldi") || t.includes("chromium"));
    if (hasInternal && !types.includes("text/html")) return false;

    return types.includes("text/plain") || types.includes("text/uri-list") || types.includes("Text") || types.includes("Files");
  }

  function resolveUrl(text) {
    const clean = text.replace(/[.,!?;:'")\]}>]+$/, "").trim();
    if (/^https?:\/\//i.test(clean) || /^ftp:\/\//i.test(clean)) return clean;
    if (/^localhost(?::\d+)?(\/.*)?$/i.test(clean) || /^\d{1,3}(?:\.\d{1,3}){3}(?::\d+)?(\/.*)?$/.test(clean)) return "https://" + clean;
    if (/^www\./i.test(clean)) return "https://" + clean;
    if (!/\s/.test(clean) && /\./.test(clean) && /(?:^|[^.])\.([a-z]{2,})(?:[/?#:]|$)/i.test(clean)) return "https://" + clean;
    return null; 
  }

  function getChromeId(el) {
    if (!el) return null;
    // Recursive search: check self, children, and parents for the data-id
    const target = el.dataset.id ? el : (el.querySelector?.("[data-id]") || el.closest?.("[data-id]"));
    if (!target) return null;
    const raw = target.dataset.id || "";
    const m = raw.match(/^tab-(\d+)$/);
    return m ? parseInt(m[1], 10) : null;
  }

  function onDragOver(e) {
    if (!isValidDrag(e)) return;

    const containers = getTabContainers();
    let hoveredContainer = null;
    let sr = null;
    let isVertical = false;

    // Find which row we are aiming for (Universal Bounding Box Check)
    for (let i = containers.length - 1; i >= 0; i--) {
      const c = containers[i];
      sr = c.getBoundingClientRect();
      const inRangeX = (e.clientX >= sr.left && e.clientX <= sr.right);
      const inRangeY = (e.clientY >= sr.top && e.clientY <= sr.bottom);
      
      if (inRangeX && inRangeY) {
        hoveredContainer = c;
        isVertical = c.classList.contains("left") || c.classList.contains("right");
        break;
      }
    }

    if (!hoveredContainer) {
      if (indicator) indicator.classList.remove("visible");
      if (hoveredTabEl) {
        hoveredTabEl.classList.remove("tab-drag-navigation-hover");
        hoveredTabEl = null;
      }
      activeContainer = null;
      return;
    }

    activeContainer = hoveredContainer;

    // Force allow drop in the active row area to kill the "blocking" cursor
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";

    const strip = hoveredContainer.querySelector(".tab-strip");
    // Target tab-position (Main Bar) and direct .tab elements (Group Bar)
    // CRITICAL: Filter out UI buttons like the "New Tab" (+) button so we only target REAL tabs for IDs
    const tabs = [...(strip || hoveredContainer).querySelectorAll(".tab-position, .tab-wrapper, #tabs-subcontainer .tab")]
      .filter(el => {
        const isActuallyTab = el.classList.contains("tab") || el.classList.contains("tab-position") || el.classList.contains("tab-wrapper");
        const isNewTabButton = el.classList.contains("newtab") || el.classList.contains("button-tab") || el.querySelector(".newtab");
        return el.offsetParent !== null && isActuallyTab && !isNewTabButton && !el.classList.contains("tab-header");
      });
    
    const ind = createIndicator();
    let info = null;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // 2. Pass 1: Direct Tab Collision
    for (let i = 0; i < tabs.length; i++) {
      const r = tabs[i].getBoundingClientRect();
      if (mouseX < r.left || mouseX > r.right || mouseY < r.top || mouseY > r.bottom) continue;

      const edgeSize = (isVertical ? r.height : r.width) * EDGE_FRACTION;
      const pos = isVertical ? mouseY : mouseX;
      const start = isVertical ? r.top : r.left;
      const end = isVertical ? r.bottom : r.right;

      if (pos < start + edgeSize) {
        info = { type: "insert", indexOffset: 0, targetTabId: getChromeId(tabs[i]), rect: r, edge: "start" };
      } else if (pos > end - edgeSize) {
        info = { type: "insert", indexOffset: 1, targetTabId: getChromeId(tabs[i]), rect: r, edge: "end" };
      } else {
        info = { type: "replace", targetTabId: getChromeId(tabs[i]), el: tabs[i], rect: r };
      }
      break;
    }

    // 3. Pass 2: Trailing Space Snapping
    if (!info && tabs.length > 0) {
      const lastTab = tabs[tabs.length - 1];
      const lr = lastTab.getBoundingClientRect();
      
      const firstTab = tabs[0];
      const fr = firstTab.getBoundingClientRect();
      const isPastLast = isVertical ? (mouseY > lr.top + lr.height / 2) : (mouseX > lr.left + lr.width / 2);
      const isBeforeFirst = isVertical ? (mouseY < fr.top + fr.height / 2) : (mouseX < fr.left + fr.width / 2);

      // Determine if we are dragging on the Group Row (sub-container)
      const isSubBar = hoveredContainer.id === "tabs-subcontainer" || 
                       hoveredContainer.closest("#tabs-subcontainer") ||
                       hoveredContainer.classList.contains("tab-subcontainer");

      if (isBeforeFirst) {
        info = { type: "insert", indexOffset: 0, targetTabId: getChromeId(firstTab), rect: fr, edge: "start" };
      } else if (isPastLast || isSubBar) {
        // For Group Rows, we force the group context everywhere in the empty trailing space.
        // This ensures the link lands in the group even if dropped on a far-right spacer.
        info = { type: "insert", indexOffset: 1, targetTabId: getChromeId(lastTab), rect: lr, edge: "end" };
      }
    }
    
    // Add container context to the action for emergency recovery in onDrop
    if (info) {
      info.containerId = hoveredContainer.id || (hoveredContainer.closest("[id]")?.id);
    }

    // Update visuals
    if (hoveredTabEl) hoveredTabEl.classList.remove("tab-drag-navigation-hover");
    
    if (info && info.type === "replace") {
      ind.classList.remove("visible");
      info.el.classList.add("tab-drag-navigation-hover");
      hoveredTabEl = info.el;
    } else {
      ind.classList.add("visible");
      if (info && info.type === "insert") {
        const offset = info.edge === "start" ? 0 : (isVertical ? info.rect.height : info.rect.width);
        if (isVertical) {
          ind.style.width = info.rect.width + "px"; ind.style.height = "2px";
          ind.style.left = info.rect.left + "px"; ind.style.top = (info.rect.top + offset) + "px";
        } else {
          ind.style.width = "2px"; ind.style.height = info.rect.height + "px";
          ind.style.top = info.rect.top + "px"; ind.style.left = (info.rect.left + offset) + "px";
        }
      } else {
        // Fallback for empty spaces
        const stripRect = (strip || hoveredContainer).getBoundingClientRect();
        if (isVertical) {
          ind.style.width = stripRect.width + "px"; ind.style.height = "2px";
          ind.style.left = stripRect.left + "px"; ind.style.top = mouseY + "px";
        } else {
          ind.style.width = "2px"; ind.style.height = stripRect.height + "px";
          ind.style.top = stripRect.top + "px"; ind.style.left = mouseX + "px";
        }
      }
    }
    activeAction = info;
  }

  function onDragLeave(e) {
    // If leaving the document or switching to a non-header element, hide
    if (!e.relatedTarget) {
      if (indicator) indicator.classList.remove("visible");
      if (hoveredTabEl) hoveredTabEl.classList.remove("tab-drag-navigation-hover");
      activeAction = null;
      document.getElementById("browser")?.classList.remove("mod-active-drag");
    }
  }

  async function onDrop(e) {
    if (indicator) indicator.classList.remove("visible");
    if (hoveredTabEl) hoveredTabEl.classList.remove("tab-drag-navigation-hover");
    document.getElementById("browser")?.classList.remove("mod-active-drag");
    
    if (!isValidDrag(e)) return;

    // Fix: Ensure we only intercept drops that are actually intended for the tab bar.
    // Drops on the address bar or web pages should be handled natively by Chromium.
    const isTabBarArea = activeContainer || e.target.closest(".tab-strip, #tabs-subcontainer, .tabbar-wrapper, #tabs-tabbar-container");
    if (!isTabBarArea) {
      activeAction = null;
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const text = (e.dataTransfer.getData("text/plain") || e.dataTransfer.getData("Text") || "").trim();
    if (!text) return;

    const url = resolveUrl(text) || resolveNativeTemplate(text);
    let action = activeAction;
    activeAction = null;

    if (!url) return;

    // Fix: Defer the tab navigation to allow the native drag-and-drop cycle to complete.
    // This ensures the source webpage receives the `dragend` event and clears the text selection highlight.
    setTimeout(() => {
      // Emergency Recovery: If the action lost its targetTabId but we know we dropped in a sub-container
      if (!action || !action.targetTabId) {
        const sub = e.target.closest("#tabs-subcontainer");
        if (sub) {
          const lastValidTab = [...sub.querySelectorAll(".tab-position, .tab-wrapper, .tab")]
            .filter(el => el.dataset.id || el.querySelector("[data-id]")).pop();
          if (lastValidTab) {
            action = { type: "insert", indexOffset: 1, targetTabId: getChromeId(lastValidTab) };
          }
        }
      }
  
      if (!action || !action.targetTabId) {
        chrome.tabs.create({ url });
        return;
      }
  
      chrome.tabs.get(action.targetTabId, (tab) => {
        if (chrome.runtime.lastError || !tab) {
          chrome.tabs.create({ url });
          return;
        }
  
        if (action.type === "replace") {
          chrome.tabs.update(tab.id, { url });
        } else {
          const createProps = { 
            url, 
            index: tab.index + action.indexOffset,
            windowId: tab.windowId,
            openerTabId: tab.id // Helps Vivaldi auto-stack with neighbor
          };
          
          // Full Protocol Mirror: Clone every hidden property from the neighbor
          if (tab.vivExtData) {
            try {
              const data = JSON.parse(tab.vivExtData);
              // We strip only unique ids, but keep EVERYTHING else 
              // (group, groupId, workspaceId, tiling, layer, etc.)
              delete data.ext_id; 
              createProps.vivExtData = JSON.stringify(data);
            } catch (e) { /* fallback to original string if parse fails */ 
              createProps.vivExtData = tab.vivExtData;
            }
          }
          
          chrome.tabs.create(createProps, (newTab) => {
            if (!chrome.runtime.lastError && newTab && createProps.index !== undefined) {
              // Force precise index move as a secondary safety handshake
              chrome.tabs.move(newTab.id, { index: createProps.index });
            }
          });
        }
      });
    }, 0);
  }

  function setup() {
    updateSearchEngine();
    if (window.vivaldi && vivaldi.searchEngines && vivaldi.searchEngines.onTemplateUrlsChanged) {
      vivaldi.searchEngines.onTemplateUrlsChanged.addListener(updateSearchEngine);
    }

    // Globally attach listeners only once
    if (window.__tabDragListenersAttached) return;
    window.__tabDragListenersAttached = true;

    document.addEventListener("dragenter", (e) => {
      if (isValidDrag(e)) {
        updateSearchEngine();
        document.getElementById("browser")?.classList.add("mod-active-drag");
        const containers = getTabContainers();
        for (let i = containers.length - 1; i >= 0; i--) {
          const sr = containers[i].getBoundingClientRect();
          if (e.clientX >= sr.left && e.clientX <= sr.right && e.clientY >= sr.top && e.clientY <= sr.bottom) {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = "copy";
            break;
          }
        }
      }
    }, true);
    document.addEventListener("dragover", onDragOver, true);
    document.addEventListener("dragleave", onDragLeave, true);
    document.addEventListener("drop", onDrop, true);
    document.addEventListener("dragend", () => {
      document.getElementById("browser")?.classList.remove("mod-active-drag");
    }, true);
    // Safety cleanup for window switching
    window.addEventListener("blur", () => {
      document.getElementById("browser")?.classList.remove("mod-active-drag");
    });
    console.log(TAG, "Global Header Mod Ready");
  }

  function init() {
    if (!document.getElementById("browser")) { setTimeout(init, 500); return; }
    setup();
    new MutationObserver(() => setup()).observe(document.getElementById("browser"), { childList: true });
  }

  init();
})();
