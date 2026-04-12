/**
 * v5 (Refactored Lifecycle & Memory Leak Fixes)
 * Opens links in a peek panel, either by key combinations, holding the middle mouse button or context menu
 * Forum link: https://forum.vivaldi.net/topic/92501/open-in-dialog-mod?_=1717490394230
 */
(() => {
  const DEBUG = {
    enabled: false,
    prefix: "[ArcPeek]",
  };

  const debugLog = (...args) => {
    if (DEBUG.enabled) {
      console.log(DEBUG.prefix, ...args);
    }
  };

  const ICON_CONFIG = {
    linkIcon: "",
    linkIconInteractionOnHover: true,
    showIconDelay: 250,
    showPeekOnHoverDelay: 100,
    rightClickHoldTime: 400,
    rightClickHoldDelay: 200,
  };

  setTimeout(function waitPeek() {
    const browser = document.getElementById("browser");
    if (!browser) {
      return setTimeout(waitPeek, 300);
    }
    new PeekMod();
  }, 300);

  class PeekMod {
    ARC_CONFIG = Object.freeze({
      steps: 36,
      maxArcHeight: 25,
      arcHeightRatio: 0.2,
      glanceAnimationDuration: 320,
      previewSwapDeadline: 100,
      openingPreviewRemoveLeadTime: 55,
      closingPreviewMountDelay: 75,
      previewCacheLimit: 48,
    });
    webviews = new Map();
    previewCache = new Map();
    previewCaptureTasks = new Map();
    closeShortcutGuard = null;
    postClosePointerGuard = null;
    iconUtils = new IconUtils();
    READER_VIEW_URL =
      "https://app.web-highlights.com/reader/open-website-in-reader-mode?url=";

    constructor() {
      this.hasPeekCSS = this.checkPeekCSSSupport();
      this.registerPeekCloseShortcuts();
      this.registerPeekCloseGuard();

      new WebsiteInjectionUtils(
        (navigationDetails) => this.getWebviewConfig(navigationDetails),
        (url, fromPanel, rect) => this.openPeek(url, fromPanel, rect),
        ICON_CONFIG
      );
    }

    checkPeekCSSSupport() {
      try {
        const webpageStack = document.querySelector("#browser #webpage-stack");
        if (!webpageStack) return false;
        return true;
      } catch (e) {
        console.warn("peek CSS support check failed:", e);
        return false;
      }
    }

    getWebviewConfig(navigationDetails) {
      if (navigationDetails.frameType !== "outermost_frame")
        return { webview: null, fromPanel: false };

      const navigationTabId = Number(navigationDetails.tabId);
      if (!Number.isFinite(navigationTabId) || navigationTabId <= 0) {
        return { webview: null, fromPanel: false };
      }

      let webview = document.querySelector(
        `webview[tab_id="${navigationTabId}"]`
      );
      if (webview?.closest?.(".peek-panel")) {
        return { webview: null, fromPanel: false };
      }
      if (webview)
        return { webview, fromPanel: webview.name === "vivaldi-webpanel" };

      const activeWebview = document.querySelector(".active.visible.webpageview webview");
      const activeTabId = Number(activeWebview?.tab_id);
      if (
        activeWebview &&
        activeTabId === navigationTabId &&
        !activeWebview.closest?.(".peek-panel")
      ) {
        return {
          webview: activeWebview,
          fromPanel: activeWebview.name === "vivaldi-webpanel",
        };
      }

      return { webview: null, fromPanel: false };
    }

    /**
     * Reconciles peeks to fix stuck/fake-death states.
     * Cleans up orphaned DOM nodes, removes dead entries, and ensures only one active peek.
     */
    reconcilePeeks() {
      let alivePeeks = [];
      for (const [id, data] of this.webviews.entries()) {
        if (!data.divContainer || !document.body.contains(data.divContainer)) {
          this.disposePeek(id, { animated: false, closeRuntimeTab: false, force: true });
        } else {
          alivePeeks.push(id);
        }
      }

      while (alivePeeks.length > 1) {
        const idToKill = alivePeeks.shift();
        this.disposePeek(idToKill, { animated: false, closeRuntimeTab: true, force: true });
      }

      if (this.webviews.size === 0 && this.hasPeekCSS) {
        document.body.classList.remove("peek-open");
      }
    }

    /**
     * Unified destruction entry point for all peeks.
     */
    async disposePeek(webviewId, options = {}) {
      const { animated = true, closeRuntimeTab = true, force = false } = options;
      const data = this.webviews.get(webviewId);
      
      if (!data) return;
      if (data.isDisposing && !force) return;
      data.isDisposing = true;

      Object.values(data.timers || {}).forEach(clearTimeout);

      if (data.tabCloseListener) {
        chrome.tabs.onRemoved.removeListener(data.tabCloseListener);
      }
      if (data.panelPointerBlocker && data.fromPanel) {
        document.body.removeEventListener("pointerdown", data.panelPointerBlocker);
      }
      if (data.backdropCleanup) {
        data.backdropCleanup();
      }

      const container = data.divContainer;
      const panel = container?.querySelector(".peek-panel");

      if (this.webviews.size <= 1 && this.hasPeekCSS) {
        document.body.classList.remove("peek-open");
      }

      const finishCleanup = async () => {
        try {
          data.webview?.stop?.();
        } catch (_) {}

        if (closeRuntimeTab) {
          await this.closePeekRuntimeTab(webviewId);
        }
        if (panel) this.removePreviewLayer(panel);
        
        container?.classList.remove("open", "closing", "pre-open");
        container?.remove();
        
        this.webviews.delete(webviewId);
        this.clearCloseShortcutGuard();

        if (this.webviews.size === 0) {
          chrome.runtime.sendMessage({ type: "peek-closed" });
        }
      };

      if (!animated || !container || !panel) {
        await finishCleanup();
        return;
      }

      const hasClosingPreview = !!data.sourcePreviewUrl;
      if (hasClosingPreview) {
        this.hidePeekContent(panel);
      } else {
        this.showPeekContent(panel);
      }
      container.classList.remove("open");
      container.classList.add("closing");
      container.style.setProperty(
        "--peek-backdrop-duration",
        `${this.getBackdropDuration("closing")}ms`
      );

      if (hasClosingPreview) {
        data.timers.closingPreviewMount = window.setTimeout(() => {
          if (!panel.isConnected || !container.classList.contains("closing")) return;
          this.mountPreviewLayer(panel, data.sourcePreviewUrl, data.linkRect);
        }, this.ARC_CONFIG.closingPreviewMountDelay);
      } else if (data.previewCapturePromise) {
        data.previewCapturePromise
          .then((latePreviewUrl) => {
            if (!latePreviewUrl) return;
            if (!panel.isConnected || !container.classList.contains("closing")) return;
            data.sourcePreviewUrl = latePreviewUrl;
            this.mountPreviewLayer(panel, latePreviewUrl, data.linkRect);
          })
          .catch(() => {});
      }

      const sourceRect = data.sourceRect || this.resolveSourceRect(data.linkRect);
      
      try {
        await this.animatePeekMotion(panel, "closing", sourceRect);
      } catch (error) {
        console.warn(DEBUG.prefix, "closing animation failed", error);
      } finally {
        await finishCleanup();
      }
    }

    registerPeekCloseShortcuts() {
      const handleCloseShortcut = (event) => {
        if (!this.webviews.size) return false;

        const isEscape = event.key === "Escape";
        const isCloseTabShortcut =
          (event.metaKey || event.ctrlKey) &&
          !event.altKey &&
          !event.shiftKey &&
          String(event.key).toLowerCase() === "w";

        if (!isEscape && !isCloseTabShortcut) return false;

        if (isCloseTabShortcut) {
          this.armCloseShortcutGuard();
        }
        event.preventDefault?.();
        event.stopPropagation?.();
        event.stopImmediatePropagation?.();
        this.closeLastPeek();
        return true;
      };

      document.addEventListener("keydown", handleCloseShortcut, true);

      if (
        window.vivaldi?.tabsPrivate?.onKeyboardShortcut &&
        typeof vivaldi.tabsPrivate.onKeyboardShortcut.addListener === "function"
      ) {
        vivaldi.tabsPrivate.onKeyboardShortcut.addListener((id, combination) => {
          if (!this.webviews.size || typeof combination !== "string") return;
          const normalized = combination.toLowerCase();
          const isCloseTabShortcut =
            normalized === "cmd+w" ||
            normalized === "meta+w" ||
            normalized === "ctrl+w";
          if (normalized === "esc" || isCloseTabShortcut) {
            if (isCloseTabShortcut) {
              this.armCloseShortcutGuard();
            }
            this.closeLastPeek();
          }
        });
      }
    }

    registerPeekCloseGuard() {
      chrome.tabs.onRemoved.addListener((removedTabId) => {
        const guard = this.closeShortcutGuard;
        if (!guard) return;
        if (removedTabId !== guard.tabId) return;
        if (Date.now() - guard.startedAt > 1500) {
          this.clearCloseShortcutGuard();
          return;
        }
        this.restoreRecentlyClosedTab();
      });
    }

    armPostClosePointerGuard() {
      if (this.postClosePointerGuard) {
        this.postClosePointerGuard.cleanup();
      }

      let cleaned = false;
      const swallow = (event) => {
        event.preventDefault?.();
        event.stopPropagation?.();
        event.stopImmediatePropagation?.();
      };
      const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        [
          "pointermove",
          "mousemove",
          "selectstart",
          "dragstart",
          "click",
          "auxclick",
          "contextmenu",
          "pointerup",
          "mouseup",
        ].forEach((eventName) => {
          document.removeEventListener(eventName, handlers[eventName], true);
        });
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (this.postClosePointerGuard?.cleanup === cleanup) {
          this.postClosePointerGuard = null;
        }
      };
      const handlers = {
        pointermove: swallow,
        mousemove: swallow,
        selectstart: swallow,
        dragstart: swallow,
        click: swallow,
        auxclick: swallow,
        contextmenu: swallow,
        pointerup: (event) => {
          swallow(event);
          cleanup();
        },
        mouseup: (event) => {
          swallow(event);
          cleanup();
        },
      };

      Object.entries(handlers).forEach(([eventName, handler]) => {
        document.addEventListener(eventName, handler, true);
      });

      const timeoutId = window.setTimeout(cleanup, 700);
      this.postClosePointerGuard = { cleanup };
    }

    async armCloseShortcutGuard() {
      try {
        const [activeTab] = await this.queryTabs({
          active: true,
          currentWindow: true,
        });
        if (!activeTab?.id) return;
        this.closeShortcutGuard = {
          tabId: activeTab.id,
          startedAt: Date.now(),
        };
        window.setTimeout(() => {
          if (
            this.closeShortcutGuard &&
            Date.now() - this.closeShortcutGuard.startedAt >= 1400
          ) {
            this.clearCloseShortcutGuard();
          }
        }, 1450);
      } catch (error) {
        console.warn(DEBUG.prefix, "armCloseShortcutGuard failed", error);
      }
    }

    clearCloseShortcutGuard() {
      this.closeShortcutGuard = null;
    }

    restoreRecentlyClosedTab() {
      const guard = this.closeShortcutGuard;
      this.clearCloseShortcutGuard();
      if (!chrome.sessions || typeof chrome.sessions.restore !== "function") {
        return;
      }
      chrome.sessions.restore(undefined, () => {
        if (chrome.runtime.lastError) {
          console.warn(DEBUG.prefix, "restoreRecentlyClosedTab failed", {
            guard,
            error: chrome.runtime.lastError.message,
          });
        }
      });
    }

    async findPeekRuntimeTab(webviewId) {
      const tabs = await this.queryTabs({});
      return (
        tabs.find((tab) =>
          tab?.vivExtData?.includes?.(`${webviewId}tabId`)
        ) || null
      );
    }

    async closePeekRuntimeTab(webviewId) {
      const runtimeTab = await this.findPeekRuntimeTab(webviewId);
      if (!runtimeTab?.id) return "missing";

      return new Promise((resolve) => {
        let settled = false;
        const finish = (result) => {
          if (settled) return;
          settled = true;
          chrome.tabs.onRemoved.removeListener(handleRemoved);
          resolve(result);
        };

        const handleRemoved = (removedTabId) => {
          if (removedTabId !== runtimeTab.id) return;
          finish("removed");
        };

        chrome.tabs.onRemoved.addListener(handleRemoved);
        chrome.tabs.remove(runtimeTab.id, () => {
          if (chrome.runtime.lastError) {
            finish("error");
            return;
          }
          window.setTimeout(() => finish("removed"), 250);
        });
      });
    }

    async closeLastPeek() {
      this.reconcilePeeks();
      if (!this.webviews.size) return;

      const webviewValues = Array.from(this.webviews.values());
      let webviewData = webviewValues.at(-1);
      
      if (!webviewData.fromPanel) {
        const activeWebview = document.querySelector(".active.visible.webpageview webview");
        const tabId = Number(activeWebview?.tab_id);
        const matchedPeek = webviewValues.findLast((_data) => _data.tabId === tabId);
        if (matchedPeek) {
          webviewData = matchedPeek;
        }
      }

      if (webviewData) {
        const webviewId = Array.from(this.webviews.entries()).find(
          ([_, data]) => data === webviewData
        )?.[0];
        
        if (webviewId) {
          this.armPostClosePointerGuard();
          this.disposePeek(webviewId, { animated: true, closeRuntimeTab: true });
        }
      }
    }

    dismissPeekInstant(webviewId) {
      this.disposePeek(webviewId, { animated: false, closeRuntimeTab: true });
    }

    waitForTabComplete(tabId, timeoutMs = 12000) {
      return new Promise((resolve) => {
        let settled = false;
        let timeoutId = null;

        const finish = (result) => {
          if (settled) return;
          settled = true;
          chrome.tabs.onUpdated.removeListener(handleUpdated);
          chrome.tabs.onRemoved.removeListener(handleRemoved);
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          resolve(result);
        };

        const handleUpdated = (updatedTabId, changeInfo) => {
          if (updatedTabId !== tabId) return;
          if (changeInfo.status === "complete") {
            finish("complete");
          }
        };

        const handleRemoved = (removedTabId) => {
          if (removedTabId !== tabId) return;
          finish("removed");
        };

        chrome.tabs.onUpdated.addListener(handleUpdated);
        chrome.tabs.onRemoved.addListener(handleRemoved);
        timeoutId = setTimeout(() => finish("timeout"), timeoutMs);

        chrome.tabs.get(tabId, (tab) => {
          if (chrome.runtime.lastError) {
            finish("missing");
            return;
          }
          if (tab?.status === "complete") {
            finish("complete");
          }
        });
      });
    }

    queryTabs(queryInfo) {
      return new Promise((resolve) => chrome.tabs.query(queryInfo, resolve));
    }

    getTab(tabId) {
      return new Promise((resolve) => chrome.tabs.get(tabId, resolve));
    }

    createTab(createProperties) {
      return new Promise((resolve) =>
        chrome.tabs.create(createProperties, resolve)
      );
    }

    updateTab(tabId, updateProperties) {
      return new Promise((resolve) =>
        chrome.tabs.update(tabId, updateProperties, resolve)
      );
    }

    parseVivExtData(tab) {
      if (!tab?.vivExtData) return {};
      try {
        return JSON.parse(tab.vivExtData);
      } catch (error) {
        return {};
      }
    }

    async updateTabVivExtData(tabId, updater) {
      const tab = await this.getTab(tabId);
      if (chrome.runtime.lastError || !tab) {
        throw new Error(chrome.runtime.lastError?.message || `Unable to load tab ${tabId}`);
      }

      const currentViv = this.parseVivExtData(tab);
      const nextViv = typeof updater === "function" ? updater(currentViv, tab) : updater;
      await this.updateTab(tabId, { vivExtData: JSON.stringify(nextViv) });
      if (chrome.runtime.lastError) {
        throw new Error(chrome.runtime.lastError.message);
      }
      return nextViv;
    }

    openPeek(linkUrl, fromPanel = undefined, rect = undefined, meta = undefined) {
      this.reconcilePeeks();
      if (this.webviews.size > 0) return;

      chrome.windows.getLastFocused((window) => {
        if (
          window.id === vivaldiWindowId &&
          window.state !== chrome.windows.WindowState.MINIMIZED
        ) {
          this.showPeek(linkUrl, fromPanel, rect, meta);
        }
      });
    }

    showPeek(linkUrl, fromPanel, linkRect = undefined, meta = undefined) {
      this.buildPeek(linkUrl, fromPanel, linkRect, meta).catch((error) => {
        console.error(DEBUG.prefix, "showPeek failed", error);
      });
    }

    async buildPeek(linkUrl, fromPanel, linkRect = undefined, meta = undefined) {
      const peekContainer = document.createElement("div"),
        peekPanel = document.createElement("div"),
        peekContent = document.createElement("div"),
        sidebarControls = document.createElement("div"),
        webview = document.createElement("webview"),
        webviewId = `peek-${this.getWebviewId()}`,
        pendingUrl = linkUrl,
        optionsContainer = document.createElement("div");

      if (fromPanel === undefined && this.webviews.size !== 0) {
        fromPanel = Array.from(this.webviews.values()).at(-1).fromPanel;
      }

      const activeWebview = document.querySelector(".active.visible.webpageview webview");
      const tabId = !fromPanel && activeWebview ? Number(activeWebview.tab_id) : null;
      const previewCacheKey = this.getPreviewCacheKey(linkUrl, linkRect);
      const cachedPreviewUrl = this.getCachedPreviewUrl(previewCacheKey);

      this.webviews.set(webviewId, {
        divContainer: peekContainer,
        webview: webview,
        fromPanel: fromPanel,
        tabId: tabId,
        linkRect: linkRect,
        sourcePreviewUrl: cachedPreviewUrl,
        sourceRect: null,
        isDisposing: false,
        timers: {},
        panelPointerBlocker: null,
        tabCloseListener: null,
        backdropCleanup: null,
        previewCacheKey: previewCacheKey,
        previewCapturePromise: null,
        openingCompleted: false,
        openingContentRevealStarted: false,
      });

      if (!fromPanel) {
        const clearWebviews = (closedTabId) => {
          if (tabId === closedTabId) {
            this.webviews.forEach((view, key) => {
               if (view.tabCloseListener === clearWebviews) {
                  this.disposePeek(key, { animated: false, closeRuntimeTab: false });
               }
            });
          }
        };
        this.webviews.get(webviewId).tabCloseListener = clearWebviews;
        chrome.tabs.onRemoved.addListener(clearWebviews);
      }

      peekPanel.setAttribute("class", "peek-panel");
      peekContent.setAttribute("class", "peek-content");

      if (activeWebview) {
        const rect = activeWebview.getBoundingClientRect();
        const webviewContainerRect = document.getElementById("webview-container")?.getBoundingClientRect();
        const targetWidth = rect.width * 0.8;
        const targetHeight = webviewContainerRect?.height || rect.height;

        peekPanel.style.width = targetWidth + "px";
        peekPanel.style.height = targetHeight + "px";

        if (linkRect) {
          const startX = rect.left + linkRect.left + linkRect.width / 2;
          const startY = rect.top + linkRect.top + linkRect.height / 2;
          peekPanel.style.setProperty("--start-x", `${startX}px`);
          peekPanel.style.setProperty("--start-y", `${startY}px`);
          peekPanel.style.setProperty("--start-width", `${linkRect.width}px`);
          peekPanel.style.setProperty("--start-height", `${linkRect.height}px`);
          peekPanel.style.setProperty("--end-width", `${targetWidth}px`);
          peekPanel.style.setProperty("--end-height", `${targetHeight}px`);
        }
      }

      optionsContainer.setAttribute("class", "options-container");
      optionsContainer.hidden = true;
      sidebarControls.setAttribute("class", "peek-sidebar-controls");
      this.showSidebarControls(webviewId, sidebarControls);

      webview.id = webviewId;
      webview.tab_id = `${webviewId}tabId`;
      webview.setAttribute("src", "about:blank");
      webview.dataset.pendingSrc = pendingUrl;

      webview.addEventListener("loadstart", () => {
        webview.style.backgroundColor = "var(--colorBorder)";
        const input = document.getElementById(`input-${webview.id}`);
        if (input !== null) {
          input.value = webview.src;
        }
      });
      fromPanel && webview.addEventListener("mousedown", (event) => event.stopPropagation());

      peekContainer.setAttribute("class", "peek-container");
      peekContainer.dataset.motion = "js";
      if (tabId !== null) {
        peekContainer.dataset.tabId = `${tabId}`;
      }
      peekContainer.classList.add("pre-open");

      let stopEvent = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.target.id === `input-${webviewId}`) {
          const inputElement = event.target;
          const offsetX = event.clientX - inputElement.getBoundingClientRect().left;
          const context = document.createElement("canvas").getContext("2d");
          context.font = window.getComputedStyle(inputElement).font;
          let cursorPosition = 0, textWidth = 0;
          for (let i = 0; i < inputElement.value.length; i++) {
            const charWidth = context.measureText(inputElement.value[i]).width;
            if (textWidth + charWidth > offsetX) {
              cursorPosition = i;
              break;
            }
            textWidth += charWidth;
            cursorPosition = i + 1;
          }
          inputElement.focus({ preventScroll: true });
          inputElement.setSelectionRange(cursorPosition, cursorPosition);
        }
      };

      if (fromPanel) {
        document.body.addEventListener("pointerdown", stopEvent);
        this.webviews.get(webviewId).panelPointerBlocker = stopEvent;
      }

      let backdropClosePending = false;
      const swallowBackdropEvent = (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();
      };
      
      const cleanupBackdropCloseListeners = () => {
        window.removeEventListener("pointerup", finalizeBackdropClose, true);
        window.removeEventListener("mouseup", finalizeBackdropClose, true);
        window.removeEventListener("click", swallowBackdropEvent, true);
      };
      this.webviews.get(webviewId).backdropCleanup = cleanupBackdropCloseListeners;

      const finalizeBackdropClose = (event) => {
        if (!backdropClosePending) return;
        backdropClosePending = false;
        swallowBackdropEvent(event);
        this.disposePeek(webviewId, { animated: true, closeRuntimeTab: true });
      };

      const armBackdropClose = (event) => {
        if (event.target !== peekContainer) return;
        if (typeof event.button === "number" && event.button !== 0) return;
        swallowBackdropEvent(event);
        if (backdropClosePending) return;
        backdropClosePending = true;
        window.addEventListener("pointerup", finalizeBackdropClose, true);
        window.addEventListener("mouseup", finalizeBackdropClose, true);
        window.addEventListener("click", swallowBackdropEvent, true);
      };

      peekContainer.addEventListener("pointerdown", armBackdropClose, true);
      peekContainer.addEventListener("mousedown", armBackdropClose, true);

      peekPanel.appendChild(optionsContainer);
      peekContent.appendChild(webview);
      peekPanel.appendChild(peekContent);
      peekContainer.appendChild(peekPanel);
      peekContainer.appendChild(sidebarControls);

      document.querySelector("#browser").appendChild(peekContainer);

      const geometry = this.applyPeekAnimationGeometry(peekContainer, peekPanel, linkRect);
      this.webviews.get(webviewId).sourceRect = geometry?.sourceRect || null;
      if (cachedPreviewUrl) {
        this.mountPreviewLayer(peekPanel, cachedPreviewUrl, linkRect);
      } else {
        this.setPreviewPending(peekPanel, true);
      }
      this.hidePeekContent(peekPanel);
      
      peekContainer.style.setProperty("--peek-backdrop-duration", `${this.getBackdropDuration("opening")}ms`);
      
      requestAnimationFrame(() => {
        peekContainer.classList.remove("pre-open");
        peekContainer.classList.add("open");
      });
      
      const sourceRect = this.webviews.get(webviewId).sourceRect || this.resolveSourceRect(linkRect);
      const openingStartedAt = performance.now();
      
      this.startPeekNavigation(webview, webviewId);

      if (cachedPreviewUrl) {
        this.webviews.get(webviewId).openingContentRevealStarted = true;
        this.animatePeekContentIn(peekPanel);
      }
      
      this.animatePeekMotion(peekPanel, "opening", sourceRect)
        .then(() => {
          this.finalizePeekOpening(peekPanel, webviewId);
        })
        .catch((error) => {
          console.warn(DEBUG.prefix, "opening animation failed", error);
          this.finalizePeekOpening(peekPanel, webviewId);
        });
        
      this.captureAndSwapPreview(peekPanel, webviewId, linkRect, fromPanel, openingStartedAt);

      if (this.hasPeekCSS) {
        document.body.classList.add("peek-open");
      }
    }

    getActivePageWebview() {
      return document.querySelector(".active.visible.webpageview webview");
    }

    normalizeCaptureRect(rect, bounds = {}) {
      if (!rect) return null;

      const viewportWidth = Math.floor(bounds.width || window.innerWidth);
      const viewportHeight = Math.floor(bounds.height || window.innerHeight);

      const left = Math.max(0, Math.floor(rect.left));
      const top = Math.max(0, Math.floor(rect.top));
      const right = Math.min(viewportWidth, Math.ceil(rect.left + rect.width));
      const bottom = Math.min(viewportHeight, Math.ceil(rect.top + rect.height));
      const width = Math.max(1, right - left);
      const height = Math.max(1, bottom - top);

      if (!Number.isFinite(width) || !Number.isFinite(height)) return null;

      return {
        rect: { left, top, width, height },
        bounds: { viewportWidth, viewportHeight },
      };
    }

    buildCaptureCandidates(linkRect) {
      if (!linkRect) return [];

      const activeWebview = this.getActivePageWebview();
      const webviewRect = activeWebview?.getBoundingClientRect?.();
      const contentViewportWidth = Math.floor(
        linkRect.viewportWidth || activeWebview?.clientWidth || webviewRect?.width || window.innerWidth
      );
      const contentViewportHeight = Math.floor(
        linkRect.viewportHeight || activeWebview?.clientHeight || webviewRect?.height || window.innerHeight
      );
      const dpr = Number(linkRect.devicePixelRatio || window.devicePixelRatio || 1);
      const vvScale = Number(linkRect.visualViewportScale || 1);
      const vvOffsetLeft = Number(linkRect.visualViewportOffsetLeft || 0);
      const vvOffsetTop = Number(linkRect.visualViewportOffsetTop || 0);

      const candidates = [
        {
          basis: "content-viewport",
          candidate: this.normalizeCaptureRect(
            { left: linkRect.left, top: linkRect.top, width: linkRect.width, height: linkRect.height },
            { width: contentViewportWidth, height: contentViewportHeight }
          ),
        },
        {
          basis: "content-viewport+visualViewportOffset",
          candidate: this.normalizeCaptureRect(
            { left: linkRect.left + vvOffsetLeft, top: linkRect.top + vvOffsetTop, width: linkRect.width, height: linkRect.height },
            { width: contentViewportWidth, height: contentViewportHeight }
          ),
        },
        {
          basis: "content-viewport*dpr",
          candidate: this.normalizeCaptureRect(
            { left: linkRect.left * dpr, top: linkRect.top * dpr, width: linkRect.width * dpr, height: linkRect.height * dpr },
            { width: contentViewportWidth * dpr, height: contentViewportHeight * dpr }
          ),
        },
        {
          basis: "content-viewport*visualViewportScale",
          candidate: this.normalizeCaptureRect(
            { left: linkRect.left * vvScale, top: linkRect.top * vvScale, width: linkRect.width * vvScale, height: linkRect.height * vvScale },
            { width: contentViewportWidth * vvScale, height: contentViewportHeight * vvScale }
          ),
        },
      ];

      if (webviewRect) {
        candidates.push({
          basis: "browser-ui-webview-offset",
          candidate: this.normalizeCaptureRect(
            { left: webviewRect.left + linkRect.left, top: webviewRect.top + linkRect.top, width: linkRect.width, height: linkRect.height },
            { width: window.innerWidth, height: window.innerHeight }
          ),
        });
      }

      return candidates
        .filter((candidate) => candidate.candidate?.rect)
        .map((candidate) => ({
          basis: candidate.basis,
          rect: candidate.candidate.rect,
          bounds: candidate.candidate.bounds,
        }));
    }

    async isUsablePreviewUrl(url) {
      if (!url || typeof url !== "string") return false;
      if (!url.startsWith("data:image/")) return false;

      const image = new Image();
      image.decoding = "sync";
      image.src = url;

      try {
        if (typeof image.decode === "function") {
          await image.decode();
        } else if (!image.complete) {
          await new Promise((resolve) => {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", resolve, { once: true });
          });
        }
      } catch (error) {
        return false;
      }

      return image.naturalWidth > 0 && image.naturalHeight > 0;
    }

    getVivaldiWindowId() {
      const windowId = Number(window.vivaldiWindowId);
      return Number.isFinite(windowId) ? windowId : null;
    }

    buildUICaptureRect(linkRect) {
      const sourceRect = this.resolveSourceRect(linkRect);
      if (!sourceRect) return null;

      return {
        left: Math.max(0, Math.round(sourceRect.left)),
        top: Math.max(0, Math.round(sourceRect.top)),
        width: Math.max(1, Math.round(sourceRect.width)),
        height: Math.max(1, Math.round(sourceRect.height)),
      };
    }

    captureUIArea(rect) {
      return new Promise((resolve, reject) => {
        const windowId = this.getVivaldiWindowId();
        if (!window.vivaldi || !vivaldi.thumbnails || typeof vivaldi.thumbnails.captureUI !== "function") {
          reject(new Error("vivaldi.thumbnails.captureUI is unavailable"));
          return;
        }
        if (windowId === null) {
          reject(new Error("window.vivaldiWindowId is unavailable"));
          return;
        }
        if (!rect) {
          reject(new Error("captureUIArea requires a rect"));
          return;
        }

        const params = {
          windowId,
          posX: rect.left,
          posY: rect.top,
          width: rect.width,
          height: rect.height,
          encodeFormat: "png",
          saveToDisk: false,
        };

        vivaldi.thumbnails.captureUI(params, (success, url) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          if (!success) {
            reject(new Error("captureUI returned false"));
            return;
          }
          resolve(url || null);
        });
      });
    }

    captureTabArea(rect) {
      return new Promise((resolve, reject) => {
        if (!window.vivaldi || !vivaldi.thumbnails || typeof vivaldi.thumbnails.captureTab !== "function") {
          reject(new Error("vivaldi.thumbnails.captureTab is unavailable"));
          return;
        }

        const params = { rect, encodeFormat: "png", saveToDisk: false };
        vivaldi.thumbnails.captureTab(0, params, (url) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(url || null);
        });
      });
    }

    getPreviewCacheKey(linkUrl, linkRect) {
      const rawKey = typeof linkRect?.href === "string" && linkRect.href ? linkRect.href : linkUrl;
      if (typeof rawKey !== "string" || !rawKey) return null;

      try {
        const url = new URL(rawKey, window.location.href);
        url.hash = "";
        return url.toString();
      } catch (error) {
        return rawKey;
      }
    }

    getCachedPreviewUrl(cacheKey) {
      if (!cacheKey || !this.previewCache.has(cacheKey)) return null;
      const cachedPreviewUrl = this.previewCache.get(cacheKey);
      this.previewCache.delete(cacheKey);
      this.previewCache.set(cacheKey, cachedPreviewUrl);
      return cachedPreviewUrl;
    }

    storePreviewUrl(cacheKey, sourcePreviewUrl) {
      if (!cacheKey || !sourcePreviewUrl) return;
      if (this.previewCache.has(cacheKey)) {
        this.previewCache.delete(cacheKey);
      }
      this.previewCache.set(cacheKey, sourcePreviewUrl);

      while (this.previewCache.size > this.ARC_CONFIG.previewCacheLimit) {
        const oldestKey = this.previewCache.keys().next().value;
        if (!oldestKey) break;
        this.previewCache.delete(oldestKey);
      }
    }

    async captureSourcePreview(linkRect, fromPanel, cacheKey = null) {
      if (fromPanel) return null;

      const uiRect = this.buildUICaptureRect(linkRect);
      if (uiRect) {
        try {
          const sourcePreviewUrl = await this.captureUIArea(uiRect);
          const usable = await this.isUsablePreviewUrl(sourcePreviewUrl);
          if (usable) {
            this.storePreviewUrl(cacheKey, sourcePreviewUrl);
            return sourcePreviewUrl;
          }
        } catch (error) {
          debugLog("captureUI preview capture failed", error);
        }
      }

      const candidates = this.buildCaptureCandidates(linkRect);
      if (!candidates.length) return null;

      for (const candidate of candidates) {
        try {
          const sourcePreviewUrl = await this.captureTabArea(candidate.rect);
          const usable = await this.isUsablePreviewUrl(sourcePreviewUrl);
          if (usable) {
            this.storePreviewUrl(cacheKey, sourcePreviewUrl);
            return sourcePreviewUrl;
          }
        } catch (error) {}
      }
      return null;
    }

    startPreviewCapture(cacheKey, linkRect, fromPanel) {
      const cachedPreviewUrl = this.getCachedPreviewUrl(cacheKey);
      if (cachedPreviewUrl) {
        return Promise.resolve(cachedPreviewUrl);
      }

      if (cacheKey && this.previewCaptureTasks.has(cacheKey)) {
        return this.previewCaptureTasks.get(cacheKey);
      }

      const previewTask = this.captureSourcePreview(linkRect, fromPanel, cacheKey)
        .finally(() => {
          if (cacheKey) this.previewCaptureTasks.delete(cacheKey);
        });

      if (cacheKey) {
        this.previewCaptureTasks.set(cacheKey, previewTask);
      }

      return previewTask;
    }

    resolveSourceRect(linkRect) {
      if (!linkRect) return null;
      const activeWebview = this.getActivePageWebview();
      if (!activeWebview) return null;

      const webviewRect = activeWebview.getBoundingClientRect();
      const width = Math.max(linkRect.width || 0, 36);
      const height = Math.max(linkRect.height || 0, 24);

      return {
        left: webviewRect.left + linkRect.left,
        top: webviewRect.top + linkRect.top,
        width,
        height,
      };
    }

    applyPeekAnimationGeometry(peekContainer, peekPanel, linkRect) {
      const finalRect = peekPanel.getBoundingClientRect();
      if (!finalRect.width || !finalRect.height) return;

      const sourceRect = this.resolveSourceRect(linkRect);
      const scaleX = sourceRect ? Math.min(Math.max(sourceRect.width / finalRect.width, 0.08), 1) : 0.92;
      const scaleY = sourceRect ? Math.min(Math.max(sourceRect.height / finalRect.height, 0.06), 1) : 0.9;
      const translateX = sourceRect ? sourceRect.left - finalRect.left : 0;
      const translateY = sourceRect ? sourceRect.top - finalRect.top : Math.min(-(finalRect.height * 0.42), -96);
      const sourceRadius = sourceRect ? Math.min(Math.max(sourceRect.height / 2, 8), 18) : 18;
      const backdropOriginX = sourceRect ? sourceRect.left + sourceRect.width / 2 : finalRect.left + finalRect.width / 2;
      const backdropOriginY = sourceRect ? sourceRect.top + sourceRect.height / 2 : finalRect.top + Math.min(finalRect.height * 0.18, 96);

      peekContainer.style.setProperty("--peek-panel-top", `${finalRect.top}px`);
      peekContainer.style.setProperty("--peek-panel-right", `${finalRect.right}px`);
      peekPanel.style.setProperty("--peek-translate-x", `${translateX}px`);
      peekPanel.style.setProperty("--peek-translate-y", `${translateY}px`);
      peekPanel.style.setProperty("--peek-scale-x", scaleX.toFixed(4));
      peekPanel.style.setProperty("--peek-scale-y", scaleY.toFixed(4));
      peekPanel.style.setProperty("--peek-source-radius", `${sourceRadius.toFixed(2)}px`);
      peekContainer.style.setProperty("--peek-backdrop-origin-x", `${backdropOriginX}px`);
      peekContainer.style.setProperty("--peek-backdrop-origin-y", `${backdropOriginY}px`);

      return { sourceRect, finalRect, backdropOriginX, backdropOriginY };
    }

    createPreviewLayer(sourcePreviewUrl, linkRect) {
      const preview = linkRect?.preview || {};
      const previewLayer = document.createElement("div");
      const imageLayer = document.createElement("img");
      const sheenLayer = document.createElement("div");
      const labelLayer = document.createElement("div");
      const hasPreview = !!sourcePreviewUrl;

      previewLayer.className = "peek-source-preview";
      imageLayer.className = "peek-source-preview-image";
      sheenLayer.className = "peek-source-preview-sheen";
      labelLayer.className = "peek-source-preview-label";

      previewLayer.style.setProperty("--preview-bg", preview.backgroundColor || "rgba(255,255,255,0.94)");
      previewLayer.style.setProperty("--preview-fg", preview.color || "rgba(18,18,18,0.92)");
      previewLayer.style.setProperty("--preview-border-color", preview.borderColor || "rgba(255,255,255,0.08)");
      previewLayer.style.setProperty("--preview-font-weight", preview.fontWeight || "600");
      previewLayer.classList.toggle("has-preview-image", hasPreview);
      previewLayer.classList.toggle("is-placeholder", !hasPreview);
      
      if (hasPreview) {
        imageLayer.src = sourcePreviewUrl;
        imageLayer.alt = "";
        imageLayer.decoding = "sync";
      }

      labelLayer.textContent = hasPreview ? "" : preview.text || "";
      labelLayer.style.fontFamily = preview.fontFamily || "";
      labelLayer.style.fontSize = preview.fontSize || "";
      labelLayer.style.fontWeight = preview.fontWeight || "";
      labelLayer.style.lineHeight = preview.lineHeight || "";

      previewLayer.appendChild(imageLayer);
      previewLayer.appendChild(sheenLayer);
      previewLayer.appendChild(labelLayer);
      return previewLayer;
    }

    setPreviewPending(peekPanel, isPending) {
      peekPanel?.classList.toggle("preview-pending", !!isPending);
    }

    mountPreviewLayer(peekPanel, sourcePreviewUrl, linkRect) {
      if (!peekPanel) return null;
      this.removePreviewLayer(peekPanel);
      const previewLayer = this.createPreviewLayer(sourcePreviewUrl, linkRect);
      peekPanel.prepend(previewLayer);
      return previewLayer;
    }

    removePreviewLayer(peekPanel) {
      peekPanel?.querySelector(".peek-source-preview")?.remove();
    }

    finalizePeekOpening(peekPanel, webviewId) {
      const data = this.webviews.get(webviewId);
      if (data) {
        data.openingCompleted = true;
      }
      this.removePreviewLayer(peekPanel);
      this.showPeekContent(peekPanel);
    }

    scheduleOpeningPreviewRemoval(peekPanel, webviewId, openingStartedAt) {
      const removeDelay = Math.max(
        0,
        this.getGlanceDuration("opening") - this.ARC_CONFIG.openingPreviewRemoveLeadTime - (performance.now() - openingStartedAt)
      );

      const data = this.webviews.get(webviewId);
      if (data) {
        data.timers.openingPreviewRemoval = window.setTimeout(() => {
          if (!peekPanel?.isConnected) return;
          this.removePreviewLayer(peekPanel);
        }, removeDelay);
      }
    }

    startPeekNavigation(webview, webviewId = "") {
      if (!webview || webview.src !== "about:blank" || !webview.dataset.pendingSrc) return;
      webview.src = webview.dataset.pendingSrc;
    }

    async captureAndSwapPreview(peekPanel, webviewId, linkRect, fromPanel, openingStartedAt) {
      const data = this.webviews.get(webviewId);
      if (!data) return;

      if (data.sourcePreviewUrl) return;

      data.previewCapturePromise = this.startPreviewCapture(data.previewCacheKey, linkRect, fromPanel);
      const sourcePreviewUrl = await data.previewCapturePromise;
      if (!sourcePreviewUrl) return;

      data.sourcePreviewUrl = sourcePreviewUrl;
      if (!peekPanel?.isConnected) return;
      if (data.openingCompleted) return;

      const elapsed = performance.now() - openingStartedAt;
      if (elapsed > this.ARC_CONFIG.previewSwapDeadline) return;
      if (data?.isDisposing) return;

      const previewLayer = this.mountPreviewLayer(peekPanel, sourcePreviewUrl, linkRect);
      await this.waitForPreviewLayer(previewLayer);
      
      if (!peekPanel?.isConnected || data?.isDisposing) return;
      if (data.openingCompleted) {
        this.removePreviewLayer(peekPanel);
        return;
      }

      const elapsedAfterDecode = performance.now() - openingStartedAt;
      if (elapsedAfterDecode > this.ARC_CONFIG.previewSwapDeadline) return;
      if (!data.openingContentRevealStarted) {
        data.openingContentRevealStarted = true;
        this.animatePeekContentIn(peekPanel);
      }
    }

    async waitForPreviewLayer(previewLayer) {
      const imageElement = previewLayer?.querySelector(".peek-source-preview-image");
      if (!(imageElement instanceof HTMLImageElement) || !imageElement.src) return;

      try {
        if (typeof imageElement.decode === "function") {
          await imageElement.decode();
          return;
        }
      } catch (error) {}

      await new Promise((resolve) => {
        if (imageElement.complete) {
          resolve();
          return;
        }
        imageElement.addEventListener("load", resolve, { once: true });
        imageElement.addEventListener("error", resolve, { once: true });
      });
    }

    hidePeekContent(peekPanel) {
      const peekContent = peekPanel?.querySelector(".peek-content");
      if (!peekContent) return;
      peekContent.getAnimations?.().forEach((animation) => animation.cancel());
      peekContent.style.display = "none";
      peekContent.style.opacity = "0";
    }

    showPeekContent(peekPanel) {
      const peekContent = peekPanel?.querySelector(".peek-content");
      if (!peekContent) return;
      peekContent.getAnimations?.().forEach((animation) => animation.cancel());
      peekContent.style.display = "";
      peekContent.style.opacity = "1";
      this.setPreviewPending(peekPanel, false);
    }

    animatePeekContentIn(peekPanel) {
      const peekContent = peekPanel?.querySelector(".peek-content");
      if (!peekContent || typeof peekContent.animate !== "function") {
        this.showPeekContent(peekPanel);
        return;
      }

      peekContent.getAnimations().forEach((animation) => animation.cancel());
      peekContent.style.display = "";
      peekContent.style.opacity = "0";
      this.setPreviewPending(peekPanel, false);
      const animation = peekContent.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: this.getGlanceDuration("opening") / 4,
        easing: "ease-in-out",
        fill: "forwards",
      });

      animation.finished.then(() => {
        if (!peekPanel?.isConnected) return;
        peekContent.style.opacity = "1";
      }).catch(() => {});
    }

    animatePeekContentOut(peekPanel) {
      const peekContent = peekPanel?.querySelector(".peek-content");
      if (!peekContent || typeof peekContent.animate !== "function") {
        this.hidePeekContent(peekPanel);
        return;
      }

      peekContent.getAnimations().forEach((animation) => animation.cancel());
      peekContent.style.opacity = "0";
      peekContent.style.display = "none";
    }

    easeOutBack(x) {
      const c1 = 0.5;
      const c3 = c1 + 1;
      return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2;
    }

    easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 6);
    }

    createGlanceArcKeyframes(peekPanel, direction, sourceRect) {
      const finalRect = peekPanel.getBoundingClientRect();
      const finalRadius = Number.parseFloat(getComputedStyle(peekPanel).borderRadius) || Math.min(finalRect.height / 2, 18);
      const fallbackSource = {
        left: finalRect.left,
        top: finalRect.top - Math.min(finalRect.height * 0.35, 120),
        width: finalRect.width * 0.9,
        height: Math.max(finalRect.height * 0.22, 42),
      };
      
      const startRect = direction === "opening" ? sourceRect || fallbackSource : finalRect;
      const endRect = direction === "opening" ? finalRect : sourceRect || fallbackSource;
      const startCenterX = startRect.left + startRect.width / 2;
      const startCenterY = startRect.top + startRect.height / 2;
      const endCenterX = endRect.left + endRect.width / 2;
      const endCenterY = endRect.top + endRect.height / 2;
      const distanceX = endCenterX - startCenterX;
      const distanceY = endCenterY - startCenterY;
      const distance = Math.hypot(distanceX, distanceY);
      const arcHeight = Math.min(distance * this.ARC_CONFIG.arcHeightRatio, this.ARC_CONFIG.maxArcHeight);
      const arcDirection = startCenterY > endCenterY ? -1 : 1;
      const easing = direction === "opening" ? this.easeOutBack.bind(this) : this.easeOutCubic.bind(this);
      const frames = [];

      for (let i = 0; i <= this.ARC_CONFIG.steps; i++) {
        const progress = i / this.ARC_CONFIG.steps;
        const eased = easing(progress);
        const width = startRect.width + (endRect.width - startRect.width) * eased;
        const height = startRect.height + (endRect.height - startRect.height) * eased;
        const centerX = startCenterX + distanceX * eased;
        const centerY = startCenterY + distanceY * eased + arcDirection * arcHeight * (1 - (2 * eased - 1) ** 2);
        const left = centerX - width / 2;
        const top = centerY - height / 2;
        const scaleX = width / finalRect.width;
        const scaleY = height / finalRect.height;

        frames.push({
          transform: `translate(${left - finalRect.left}px, ${top - finalRect.top}px) scale(${scaleX}, ${scaleY})`,
          borderRadius: `${Math.min(Math.max(height / 2, 8), 18) + (finalRadius - Math.min(Math.max(height / 2, 8), 18)) * eased}px`,
          offset: progress,
        });
      }

      const finalRadiusCss = `${finalRadius}px`;
      frames[frames.length - 1].borderRadius = finalRadiusCss;
      if (direction === "closing") frames[0].borderRadius = finalRadiusCss;

      return frames;
    }

    animatePeekMotion(peekPanel, direction, sourceRect) {
      if (typeof peekPanel.animate !== "function") return Promise.resolve();

      peekPanel.getAnimations().forEach((animation) => animation.cancel());
      const keyframes = this.createGlanceArcKeyframes(peekPanel, direction, sourceRect);
      const animation = peekPanel.animate(keyframes, {
        duration: this.getGlanceDuration(direction),
        easing: "linear",
        fill: "forwards",
      });

      return animation.finished;
    }

    getGlanceDuration(_direction) {
      return this.ARC_CONFIG.glanceAnimationDuration;
    }

    getBackdropDuration(direction) {
      return this.getGlanceDuration(direction);
    }

    showSidebarControls(webviewId, thisElement) {
      if (!thisElement || thisElement.childElementCount > 0) return;

      const buttons = [
        {
          content: this.iconUtils.close,
          action: () => this.closeLastPeek(),
          cls: "peek-sidebar-button close-button",
          label: "Close",
        },
        {
          content: this.iconUtils.newTab,
          action: () => this.openNewTab(webviewId, true),
          cls: "peek-sidebar-button expand-button",
          label: "Expand",
        },
        {
          content: this.iconUtils.splitView,
          action: () => this.openInSplitView(webviewId),
          cls: "peek-sidebar-button split-button",
          label: "Split View",
        },
      ];

      const fragment = document.createDocumentFragment();
      buttons.forEach((button) => {
        const element = this.createOptionsButton(
          button.content,
          () => {
            this.hideSidebarControls(thisElement);
            button.action();
          },
          button.cls
        );
        element.setAttribute("aria-label", button.label);
        element.setAttribute("title", button.label);
        fragment.appendChild(element);
      });

      thisElement.appendChild(fragment);
    }

    hideSidebarControls(container) {
      if (!container) return;
      container.style.opacity = "0";
      container.style.pointerEvents = "none";
    }

    createOptionsButton(content, clickListenerCallback, cls = "") {
      const button = document.createElement("button");
      button.setAttribute("class", `options-button ${cls}`.trim());
      button.addEventListener("click", clickListenerCallback);

      if (typeof content === "string") {
        button.innerHTML = content;
      } else {
        button.appendChild(content);
      }
      return button;
    }

    getWebviewId() {
      return Math.floor(Math.random() * 10000) + (new Date().getTime() % 1000);
    }

    showReaderView(webview) {
      if (webview.src.includes(this.READER_VIEW_URL)) {
        webview.src = webview.src.replace(this.READER_VIEW_URL, "");
      } else {
        webview.src = this.READER_VIEW_URL + webview.src;
      }
    }

    getPeekUrl(webviewId) {
      const data = this.webviews.get(webviewId);
      if (!data?.webview) return "";
      return data.webview.dataset.pendingSrc || data.webview.src || "";
    }

    openNewTab(webviewId, active) {
      const url = this.getPeekUrl(webviewId);
      if (!url) return;

      if (!active) {
        chrome.tabs.create({ url: url, active: false });
        setTimeout(() => this.closeLastPeek(), 100);
        return;
      }

      const data = this.webviews.get(webviewId);
      if (!data) return;

      const peekContainer = data.divContainer;
      const peekPanel = peekContainer.querySelector(".peek-panel");
      if (!peekPanel) return;
      
      peekContainer.classList.add("expanding-to-tab");
      peekContainer.style.pointerEvents = "none";
      if (this.hasPeekCSS) {
        document.body.classList.remove("peek-open");
      }

      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.backgroundColor = "#1C2220";
      overlay.style.opacity = "0";
      overlay.style.zIndex = "999999998";
      overlay.style.transition = "opacity 0.3s ease-in-out";
      overlay.style.pointerEvents = "none";
      document.body.appendChild(overlay);

      let activeWebview = document.querySelector(".active.visible.webpageview webview");
      if (activeWebview) {
        const currentRect = peekPanel.getBoundingClientRect();
        const rect = activeWebview.getBoundingClientRect();
        const webviewContainerRect = document.getElementById("webview-container")?.getBoundingClientRect();
        const targetWidth = webviewContainerRect?.width || rect.width;
        const targetLeft = webviewContainerRect?.left ?? Math.round((window.innerWidth - targetWidth) / 2);

        peekPanel.style.position = "fixed";
        peekPanel.style.left = `${currentRect.left}px`;
        peekPanel.style.top = `${currentRect.top}px`;
        peekPanel.style.width = `${currentRect.width}px`;
        peekPanel.style.height = `${currentRect.height}px`;
        peekPanel.style.margin = "0";
        peekPanel.style.transition = "none";
        void peekPanel.offsetWidth;
        peekPanel.style.transition = "width 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), left 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)";
        requestAnimationFrame(() => {
          peekPanel.style.width = `${targetWidth}px`;
          peekPanel.style.left = `${targetLeft}px`;
        });
      }

      setTimeout(() => overlay.style.opacity = "1", 10);

      chrome.tabs.create({ url: url, active: true }, async (tab) => {
        if (tab?.id) {
          await this.waitForTabComplete(tab.id);
        }
        setTimeout(() => {
          this.dismissPeekInstant(webviewId); // This directly uses disposePeek now and cleans the runtime tab
        }, 120);

        setTimeout(() => {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 100);
      });
    }

    async openInSplitView(webviewId) {
      const url = this.getPeekUrl(webviewId);
      if (!url) return;

      try {
        const [currentTab] = await this.queryTabs({ active: true, currentWindow: true });
        if (!currentTab?.id) return;

        const currentFresh = await this.getTab(currentTab.id);
        const currentViv = this.parseVivExtData(currentFresh);
        const existingTiling = currentViv.tiling;
        const tileId = existingTiling?.id || crypto.randomUUID();
        const layout = "row";

        let nextIndex = 1;
        if (existingTiling?.id) {
          const allTabs = await this.queryTabs({ currentWindow: true });
          nextIndex = allTabs
            .map((tab) => this.parseVivExtData(tab).tiling)
            .filter((tiling) => tiling && tiling.id === tileId)
            .reduce((maxIndex, tiling) => Math.max(maxIndex, tiling.index ?? -1), -1) + 1;
        }

        const newTab = await this.createTab({
          url,
          active: true,
          index: typeof currentFresh.index === "number" ? currentFresh.index + 1 : undefined,
          openerTabId: currentFresh.id,
        });
        if (!newTab?.id) return;

        if (!existingTiling) {
          await this.updateTabVivExtData(currentFresh.id, (viv) => ({
            ...viv,
            tiling: { id: tileId, index: 0, layout, type: "selection" },
          }));
        }

        await this.updateTabVivExtData(newTab.id, (viv) => ({
          ...viv,
          tiling: { id: tileId, index: nextIndex, layout, type: "selection" },
        }));

        await this.updateTab(currentFresh.id, { active: true, highlighted: true });
        await this.updateTab(newTab.id, { highlighted: true });

        this.dismissPeekInstant(webviewId); // This directly uses disposePeek now and cleans the runtime tab
      } catch (error) {
        console.error(DEBUG.prefix, "openInSplitView failed", { webviewId, url, error });
      }
    }
  }

  class WebsiteInjectionUtils {
    constructor(getWebviewConfig, openPeek, iconConfig) {
      this.iconConfig = JSON.stringify(iconConfig);

      const injectForNavigation = (navigationDetails) => {
        const { webview, fromPanel } = getWebviewConfig(navigationDetails);
        if (webview && this.isInjectableWebview(webview)) {
          this.injectCode(webview, fromPanel);
        }
      };

      chrome.webNavigation.onCompleted.addListener(injectForNavigation);

      window.setTimeout(() => {
        const activeWebview = document.querySelector(".active.visible.webpageview webview");
        if (activeWebview && this.isInjectableWebview(activeWebview)) {
          this.injectCode(activeWebview, activeWebview.name === "vivaldi-webpanel");
        }
      }, 350);

      chrome.runtime.onMessage.addListener((message) => {
        if (message.url) {
          openPeek(message.url, message.fromPanel, message.rect, message.meta);
        }
      });
    }

    isInjectableWebview(webview) {
      if (!webview?.isConnected) return false;
      if (webview.closest?.(".peek-panel")) return false;

      const rawTabId = webview.getAttribute("tab_id") || webview.tab_id;
      const tabId = Number(rawTabId);
      if (!Number.isFinite(tabId) || tabId <= 0) return false;

      const src = webview.getAttribute("src") || webview.src || "";
      if (!src || src === "about:blank" || src.startsWith("about:blank")) return false;

      return true;
    }

    injectCode(webview, fromPanel) {
      const handler = WebsiteLinkInteractionHandler.toString(),
        instantiationCode = `
                if (!this.peekEventListenerSet) {
                    new (${handler})(${fromPanel}, ${this.iconConfig});
                    this.peekEventListenerSet = true;
                }
            `;
      try {
        webview.executeScript({ code: instantiationCode }, () => {
          if (chrome.runtime.lastError) {
            debugLog("injectCode skipped", {
              tabId: webview.getAttribute("tab_id") || webview.tab_id,
              src: webview.getAttribute("src") || webview.src || "",
              error: chrome.runtime.lastError.message,
            });
          }
        });
      } catch (error) {
        debugLog("injectCode failed", error);
      }
    }
  }

  class WebsiteLinkInteractionHandler {
    #abortController = new AbortController();
    #messageListener = null;
    #beforeUnloadListener = null;
    #styleElement = null;

    constructor(fromPanel, config) {
      this.fromPanel = fromPanel;
      this.config = config;

      this.icon = null;
      this.longPressLink = null;

      this.timers = {
        showIcon: null,
        showPeekIntent: null,
        hideIcon: null,
        suppressNativeOpen: null,
      };

      this.isLongPress = false;
      this.peekTriggered = false;
      this.activeLinkRect = null;
      this.lastRecordedLinkData = null;
      this.suppressPointerSequence = false;
      this.selectionSuppressed = false;
      this.pendingLeftButtonRelease = false;

      this.#beforeUnloadListener = this.#cleanup.bind(this);
      window.addEventListener("beforeunload", this.#beforeUnloadListener, { signal: this.#abortController.signal });

      this.#initialize();

      this.#messageListener = (message) => {
        if (message.type === "peek-closed") {
          this.isLongPress = false;
          this.#releasePointerSuppression();
        }
      };
      chrome.runtime.onMessage.addListener(this.#messageListener);
    }

    #initialize() {
      this.#setupMouseHandling();
      this.#createIconStyle();
    }

    #cleanup() {
      this.#stopLinkHoldFeedback();

      Object.values(this.timers).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
      if (this.visibilityDelayTimer) {
        clearTimeout(this.visibilityDelayTimer);
        this.visibilityDelayTimer = null;
      }

      this.#releasePointerSuppression();
      this.isLongPress = false;

      // New Cleanup Logic
      this.#abortController.abort();
      if (this.#messageListener) {
        chrome.runtime.onMessage.removeListener(this.#messageListener);
      }
      if (this.#styleElement && this.#styleElement.parentNode) {
        this.#styleElement.parentNode.removeChild(this.#styleElement);
      }
    }

    #releasePointerSuppression() {
      this.peekTriggered = false;
      this.suppressPointerSequence = false;
      this.pendingLeftButtonRelease = false;
      this.#restoreSelection();
    }

    #setupMouseHandling() {
      let holdTimerForMiddleClick;
      let holdTimer;
      const signalOptions = { signal: this.#abortController.signal, capture: true };

      const suppressNativeEvent = (event) => {
        if (!this.peekTriggered && !this.suppressPointerSequence) return;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      };

      [
        "pointerup", "pointermove", "mouseup", "mousemove", "click",
        "auxclick", "contextmenu", "selectstart", "dragstart",
      ].forEach((eventName) => {
        document.addEventListener(eventName, suppressNativeEvent, signalOptions);
      });

      document.addEventListener("pointerdown", (event) => {
        const link = this.#getLinkElement(event);
        if (link) {
          this.#recordLinkSnapshot(event, link);
        }

        if ((event.altKey || event.metaKey || event.ctrlKey) && event.button === 0) {
          this.pendingLeftButtonRelease = true;
          this.#openPeekFromEvent(event);
          this.preventAllClicks();
        } else if (event.button === 1) {
          holdTimerForMiddleClick = setTimeout(() => this.#openPeekFromEvent(event), 500);
        } else if (event.button === 0) {
          if (link) {
            this.isLongPress = true;
            const effectiveHoldTime = this.config.rightClickHoldTime - this.config.rightClickHoldDelay;

            this.visibilityDelayTimer = setTimeout(() => {
              this.#startLinkHoldFeedback(link, effectiveHoldTime);
            }, this.config.rightClickHoldDelay);

            holdTimer = setTimeout(() => {
              event.preventDefault();
              event.stopPropagation();
              this.pendingLeftButtonRelease = true;
              this.#openPeekFromEvent(event);
              this.preventAllClicks();
              this.#stopLinkHoldFeedback();
              if (this.visibilityDelayTimer) clearTimeout(this.visibilityDelayTimer);
            }, this.config.rightClickHoldTime);
          }
        }
      }, { signal: this.#abortController.signal });

      document.addEventListener("pointerup", (event) => {
        if (event.button === 1) clearTimeout(holdTimerForMiddleClick);
        if (event.button === 0) {
          clearTimeout(holdTimer);
          this.#stopLinkHoldFeedback();
          if (this.visibilityDelayTimer) {
            clearTimeout(this.visibilityDelayTimer);
            this.visibilityDelayTimer = null;
          }
          if (this.pendingLeftButtonRelease) {
            this.#releasePointerSuppression();
            return;
          }
          if (!this.peekTriggered) {
            this.#restoreSelection();
          }
        }
      }, { signal: this.#abortController.signal });
    }

    #startLinkHoldFeedback(link, duration = 1) {
      this.#stopLinkHoldFeedback();
      this.longPressLink = link;
      link.style.setProperty("--peek-hold-progress", "0");
      link.style.setProperty("--peek-hold-depth", "0");
      link.classList.add("peek-hold-press");
      const startTime = performance.now();
      const tick = (now) => {
        if (!this.longPressLink || this.longPressLink !== link) return;
        const progress = Math.min((now - startTime) / Math.max(duration, 1), 1);
        const depth = 1 - Math.pow(1 - progress, 1.75);
        link.style.setProperty("--peek-hold-progress", progress.toFixed(3));
        link.style.setProperty("--peek-hold-depth", depth.toFixed(3));
        if (progress < 1) {
          this.holdFeedbackFrame = requestAnimationFrame(tick);
        } else {
          this.holdFeedbackFrame = null;
        }
      };
      this.holdFeedbackFrame = requestAnimationFrame(tick);
    }

    #stopLinkHoldFeedback() {
      if (this.holdFeedbackFrame) {
        cancelAnimationFrame(this.holdFeedbackFrame);
        this.holdFeedbackFrame = null;
      }
      if (this.longPressLink) {
        this.longPressLink.classList.remove("peek-hold-press");
        this.longPressLink.style.removeProperty("--peek-hold-progress");
        this.longPressLink.style.removeProperty("--peek-hold-depth");
        this.longPressLink = null;
      }
    }

    #getLinkElement(event) {
      return event.target.closest('a[href]:not([href="#"])');
    }

    #getEventRecordTarget(event) {
      return event.originalTarget || event.composedPath?.()[0] || event.target;
    }

    #getPreviewRect(target, link) {
      const fallbackRect = link?.getBoundingClientRect?.();
      if (!fallbackRect) return null;

      const targetRect = target && typeof target.getBoundingClientRect === "function" ? target.getBoundingClientRect() : null;
      if (!targetRect) return fallbackRect;

      const targetArea = targetRect.width * targetRect.height;
      const linkArea = fallbackRect.width * fallbackRect.height;
      return targetArea > linkArea ? targetRect : fallbackRect;
    }

    #recordLinkSnapshot(event, link = this.#getLinkElement(event)) {
      if (!link) return null;

      const recordTarget = this.#getEventRecordTarget(event);
      const rect = this.#getPreviewRect(recordTarget, link);
      if (!rect) return null;

      const visualViewport = window.visualViewport;
      const computed = window.getComputedStyle(link);
      const parentComputed = window.getComputedStyle(link.parentElement || link);
      const snapshot = {
        href: link.href,
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        visualViewportOffsetLeft: visualViewport?.offsetLeft || 0,
        visualViewportOffsetTop: visualViewport?.offsetTop || 0,
        visualViewportScale: visualViewport?.scale || 1,
        preview: {
          text: (link.innerText || link.textContent || "").replace(/\s+/g, " ").trim().slice(0, 140),
          color: computed.color,
          backgroundColor: computed.backgroundColor && computed.backgroundColor !== "rgba(0, 0, 0, 0)" ? computed.backgroundColor : parentComputed.backgroundColor,
          borderColor: computed.borderColor,
          fontFamily: computed.fontFamily,
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight,
          lineHeight: computed.lineHeight,
        },
        recordedAt: Date.now(),
      };

      this.lastRecordedLinkData = snapshot;
      return snapshot;
    }

    #sendPeekMessage(url, rect) {
      chrome.runtime.sendMessage({ url, fromPanel: this.fromPanel, rect });
    }

    #openPeekFromEvent(event) {
      let link = this.#getLinkElement(event);
      if (link) {
        event.preventDefault();
        event.stopPropagation();
        this.peekTriggered = true;

        const cachedRect =
          this.lastRecordedLinkData &&
          this.lastRecordedLinkData.href === link.href &&
          Date.now() - this.lastRecordedLinkData.recordedAt < 2000
            ? this.lastRecordedLinkData
            : null;
        const rect = cachedRect || this.#recordLinkSnapshot(event, link);
        this.#sendPeekMessage(link.href, {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          viewportWidth: rect.viewportWidth,
          viewportHeight: rect.viewportHeight,
          devicePixelRatio: rect.devicePixelRatio,
          visualViewportOffsetLeft: rect.visualViewportOffsetLeft,
          visualViewportOffsetTop: rect.visualViewportOffsetTop,
          visualViewportScale: rect.visualViewportScale,
          preview: rect.preview,
        });
      }
    }

    preventAllClicks() {
      clearTimeout(this.timers.suppressNativeOpen);
      this.peekTriggered = true;
      this.suppressPointerSequence = true;
      this.#suppressSelection();
      this.timers.suppressNativeOpen = setTimeout(() => {
        this.#releasePointerSuppression();
      }, 1400);
    }

    #suppressSelection() {
      if (this.selectionSuppressed) return;
      this.selectionSuppressed = true;
      document.documentElement.classList.add("arcpeek-no-select");
      try {
        window.getSelection()?.removeAllRanges();
      } catch (_) {}
    }

    #restoreSelection() {
      if (!this.selectionSuppressed) return;
      this.selectionSuppressed = false;
      document.documentElement.classList.remove("arcpeek-no-select");
      try {
        window.getSelection()?.removeAllRanges();
      } catch (_) {}
    }

    #createIconStyle() {
      this.#styleElement = document.createElement("style");
      this.#styleElement.textContent = `
                html.arcpeek-no-select,
                html.arcpeek-no-select * {
                    user-select: none !important;
                    -webkit-user-select: none !important;
                }

                a.peek-hold-press {
                    display: inline-block;
                    transform-origin: center center;
                    transform:
                        scaleX(calc(1 - var(--peek-hold-depth, 0) * 0.028))
                        scaleY(calc(1 - var(--peek-hold-depth, 0) * 0.05));
                    opacity: calc(1 - var(--peek-hold-depth, 0) * 0.12);
                    transition:
                        transform 55ms linear,
                        opacity 55ms linear;
                }
            `;
      document.head.appendChild(this.#styleElement);
    }

    debounce(fn, delay) {
      let timer = null;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(fn.bind(this, ...args), delay);
      };
    }
  }

  class IconUtils {
    static SVG = {
      ellipsis: '<svg xmlns="http://www.w3.org/2000/svg" height="2em" viewBox="0 0 448 512"><path d="M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z"/></svg>',
      close: '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>',
      readerView: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M3 4h10v1H3zM3 6h10v1H3zM3 8h10v1H3zM3 10h6v1H3z"></path></svg>',
      newTab: '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z"/></svg>',
      splitView: '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M64 64C28.7 64 0 92.7 0 128V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H64zm160 64V384H64V128H224zm64 256V128H448V384H288z"/></svg>',
      backgroundTab: '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M384 32c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96C0 60.7 28.7 32 64 32H384zM160 144c-13.3 0-24 10.7-24 24s10.7 24 24 24h94.1L119 327c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l135-135V328c0 13.3 10.7 24 24 24s24-10.7 24-24V168c0-13.3-10.7-24-24-24H160z"/></svg>',
    };

    static VIVALDI_BUTTONS = [
      { name: "back", buttonName: "Back", fallback: '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>' },
      { name: "forward", buttonName: "Forward", fallback: '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg>' },
      { name: "reload", buttonName: "Reload", fallback: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z"/></svg>' },
    ];

    #initialized = false;
    #iconMap = new Map();

    constructor() {
      this.#initializeStaticIcons();
    }

    #initializeStaticIcons() {
      Object.entries(IconUtils.SVG).forEach(([key, value]) => {
        this.#iconMap.set(key, value);
      });
    }

    #initializeVivaldiIcons() {
      if (this.#initialized) return;
      IconUtils.VIVALDI_BUTTONS.forEach((button) => {
        this.#iconMap.set(button.name, this.#getVivaldiButton(button.buttonName, button.fallback));
      });
      this.#initialized = true;
    }

    #getVivaldiButton(buttonName, fallbackSVG) {
      const svg = document.querySelector(`.button-toolbar [name="${buttonName}"] svg`);
      return svg ? svg.cloneNode(true).outerHTML : fallbackSVG;
    }

    getIcon(name) {
      if (!this.#initialized && IconUtils.VIVALDI_BUTTONS.some((btn) => btn.name === name)) {
        this.#initializeVivaldiIcons();
      }
      return this.#iconMap.get(name) || "";
    }

    get ellipsis() { return this.getIcon("ellipsis"); }
    get back() { return this.getIcon("back"); }
    get forward() { return this.getIcon("forward"); }
    get reload() { return this.getIcon("reload"); }
    get readerView() { return this.getIcon("readerView"); }
    get close() { return this.getIcon("close"); }
    get newTab() { return this.getIcon("newTab"); }
    get splitView() { return this.getIcon("splitView"); }
    get backgroundTab() { return this.getIcon("backgroundTab"); }
  }
})();
