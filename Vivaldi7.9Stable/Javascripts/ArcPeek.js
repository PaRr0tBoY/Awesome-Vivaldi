/**
 * v5 (Refactored Lifecycle & Memory Leak Fixes)
 * Opens links in a peek panel, either by key combinations, holding the middle mouse button or context menu
 * Forum link: https://forum.vivaldi.net/topic/92501/open-in-dialog-mod?_=1717490394230
 */
(() => {
  const ICON_CONFIG = {
    linkIcon: "",
    linkIconInteractionOnHover: true,
    showIconDelay: 250,
    showPeekOnHoverDelay: 100,
    // Long-press trigger buttons.
    // Available values: "left", "middle", "right"
    // Examples:
    // ["left"] => only left-button long press opens Peek
    // ["right"] => only right-button long press opens Peek
    // ["left", "right"] => left and right long press both open Peek
    // ["middle"] => only middle-button long press opens Peek
    // [] or "none" => disable long-press open entirely
    longPressButtons: ["middle"],
    longPressHoldTime: 400,
    longPressHoldDelay: 200,
  };

  class PeekMod {
    ARC_CONFIG = Object.freeze({
      glanceOpenAnimationDuration: 400,
      glanceCloseAnimationDuration: 400,
      previewFadeInRatio: 0.18,
      previewFadeOutDelayRatio: 0.06,
      previewFadeOutRatio: 0.16,
      previewRevealDelayRatio: 0,
      previewRevealRatio: 0,
      contentHideRatio: 0,
      previewCacheLimit: 48,
      previewCacheTtlMs: 10 * 60 * 1000,
      lastRecordedLinkTtlMs: 2000,
    });
    webviews = new Map();
    previewCache = new Map();
    previewCaptureTasks = new Map();
    lastRecordedLinkData = null;
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
      } catch (_) {
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
        return { webview, fromPanel: this.isPanelWebview(webview) };

      webview = Array.from(this.webviews.values()).find(
        (view) => view.fromPanel
      )?.webview;
      if (webview) {
        return { webview, fromPanel: true };
      }

      const activeWebview = document.querySelector(".active.visible.webpageview webview");
      const activeTabId = Number(activeWebview?.tab_id);
      if (
        activeWebview &&
        activeTabId === navigationTabId &&
        !activeWebview.closest?.(".peek-panel")
      ) {
        return {
          webview: activeWebview,
          fromPanel: this.isPanelWebview(activeWebview),
        };
      }

      return { webview: null, fromPanel: false };
    }

    isPanelWebview(webview) {
      if (!webview) return false;
      if (webview.closest?.(".peek-panel")) return false;

      const name = String(webview.name || webview.getAttribute?.("name") || "");
      if (name === "vivaldi-webpanel" || name.includes("webpanel")) return true;

      if (
        webview.closest?.(
          "#panels-container, .panel-group, .panel.webpanel, .webpanel-stack, .webpanel-content"
        )
      ) {
        return true;
      }

      const rawTabId = webview.getAttribute?.("tab_id") || webview.tab_id;
      const tabId = Number(rawTabId);
      if (!Number.isFinite(tabId) || tabId <= 0) return true;

      return false;
    }

    cancelAnimations(elements = []) {
      for (const element of elements) {
        element?.getAnimations?.().forEach((animation) => animation.cancel());
      }
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
      const shouldReleasePeekBackdrop = this.webviews.size <= 1 && this.hasPeekCSS;
      if (shouldReleasePeekBackdrop) {
        document.body.classList.remove("peek-open");
        if (animated) {
          await this.waitForAnimationFrames(1);
        }
      }
      const sourceRect = animated
        ? await this.getPeekClosingSourceRect(data)
        : null;

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

        this.setPeekSourceLinkVisibility(data.sourceToken, false);
        this.webviews.delete(webviewId);
        this.clearCloseShortcutGuard();

        if (this.webviews.size === 0) {
          chrome.runtime.sendMessage({ type: "peek-closed" });
        }
      };

      if (!animated || !container || !panel || !sourceRect) {
        await finishCleanup();
        return;
      }

      this.cancelAnimations([
        panel,
        ...panel.querySelectorAll(".peek-content, .peek-source-preview"),
      ]);
      await this.ensurePreviewAsset(data, { maxWaitMs: 1200 });
      data.closingMode =
        data.previewAssetUrl && data.previewAssetTrusted ? "preview" : "live";
      if (data.closingMode !== "preview") {
        this.showPeekContent(panel);
      }
      container.classList.remove("open");
      container.classList.add("closing");
      container.style.setProperty(
        "--peek-backdrop-duration",
        `${this.getBackdropDuration("closing")}ms`
      );

      if (data.closingMode === "preview") {
        let previewLayer = panel.querySelector(":scope > .peek-source-preview");
        if (!previewLayer) {
          previewLayer = this.mountPreviewLayer(
            panel,
            data.previewAssetUrl,
            data.linkRect
          );
        }
        await this.waitForPreviewLayer(previewLayer);
        await this.flushPreviewLayerForClosing(panel, previewLayer);
        this.setPreviewAnimationState(panel, false);
        this.preparePreviewLayerForClosing(panel);
        this.hideSidebarControls(panel.querySelector(".peek-sidebar-controls"));
        this.suppressPeekContentForClosing(panel);
        this.animatePreviewLayerIn(panel);
        this.setPreviewClosingState(panel, true);
        await this.waitForAnimationFrames(1);
        this.setPreviewClosingMatteState(panel, true);
      }

      try {
        await this.animatePeekMotion(panel, "closing", sourceRect);
      } catch (_) {
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
      if (this.postClosePointerGuard) return;

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
          "pointerdown",
          "mousedown",
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
        pointerdown: () => {
          cleanup();
        },
        mousedown: () => {
          cleanup();
        },
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
      } catch (_) {}
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
        void guard;
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
      if (rect?.href || linkUrl) {
        this.lastRecordedLinkData = {
          ...rect,
          href: rect?.href || linkUrl,
          recordedAt: rect?.recordedAt || Date.now(),
        };
      }

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
      this.buildPeek(linkUrl, fromPanel, linkRect, meta).catch(() => {
        this.setPeekSourceLinkVisibility(linkRect?.sourceToken, false);
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

      const effectiveLinkRect = linkRect || this.getRecentLinkSnapshot(linkUrl);
      const previewCacheKey = this.getPreviewCacheKey(linkUrl, effectiveLinkRect);
      const previewAsset = this.getCachedPreviewAsset(previewCacheKey);
      const previewCapturePromise =
        !previewAsset && effectiveLinkRect && !fromPanel
          ? this.startPreviewCapture(previewCacheKey, effectiveLinkRect, fromPanel)
          : null;

      const activeWebview = document.querySelector(".active.visible.webpageview webview");
      const peekViewportRect = this.getPeekViewportRect(activeWebview);
      const activeTabId = Number(activeWebview?.tab_id);
      const tabId =
        !fromPanel && Number.isFinite(activeTabId) && activeTabId > 0
          ? activeTabId
          : null;

      this.webviews.set(webviewId, {
        divContainer: peekContainer,
        webview: webview,
        fromPanel: fromPanel,
        tabId: tabId,
        linkRect: effectiveLinkRect,
        previewAssetUrl: previewAsset?.dataUrl || null,
        previewAssetTrusted: !!previewAsset?.dataUrl,
        sourceToken: effectiveLinkRect?.sourceToken || null,
        openingSourceRect: null,
        sourceRect: null,
        isDisposing: false,
        timers: {},
        panelPointerBlocker: null,
        tabCloseListener: null,
        backdropCleanup: null,
        previewCacheKey: previewCacheKey,
        previewCapturePromise,
        openingMode: previewAsset?.dataUrl ? "preview" : "live",
        openingState: "starting",
        closingMode: null,
        disableSourceCloseAnimation: false,
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
      peekPanel.dataset.peekWebviewId = webviewId;
      peekPanel.removeAttribute("data-has-finished-animation");
      peekContent.setAttribute("class", "peek-content");

      if (peekViewportRect) {
        const rect = activeWebview?.getBoundingClientRect?.() || peekViewportRect;
        const targetWidth = peekViewportRect.width * 0.8;
        const targetHeight = peekViewportRect.height;
        const targetLeft =
          peekViewportRect.left + (peekViewportRect.width - targetWidth) / 2;
        const targetTop =
          peekViewportRect.top + (peekViewportRect.height - targetHeight) / 2;

        peekPanel.style.width = targetWidth + "px";
        peekPanel.style.height = targetHeight + "px";
        peekPanel.style.left = `${targetLeft}px`;
        peekPanel.style.top = `${targetTop}px`;

        peekContainer.style.left = `${peekViewportRect.left}px`;
        peekContainer.style.top = `${peekViewportRect.top}px`;
        peekContainer.style.width = `${peekViewportRect.width}px`;
        peekContainer.style.height = `${peekViewportRect.height}px`;
        peekContainer.style.right = "auto";
        peekContainer.style.bottom = "auto";

        if (effectiveLinkRect) {
          const startX = rect.left + effectiveLinkRect.left + effectiveLinkRect.width / 2;
          const startY = rect.top + effectiveLinkRect.top + effectiveLinkRect.height / 2;
          peekPanel.style.setProperty("--start-x", `${startX}px`);
          peekPanel.style.setProperty("--start-y", `${startY}px`);
          peekPanel.style.setProperty("--start-width", `${effectiveLinkRect.width}px`);
          peekPanel.style.setProperty("--start-height", `${effectiveLinkRect.height}px`);
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
        chrome.runtime.sendMessage({ type: "peek-will-close" });
        this.armPostClosePointerGuard();
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
      peekPanel.appendChild(sidebarControls);
      peekContainer.appendChild(peekPanel);

      document.querySelector("#browser").appendChild(peekContainer);

      const geometry = this.applyPeekAnimationGeometry(
        peekContainer,
        peekPanel,
        effectiveLinkRect
      );
      this.webviews.get(webviewId).openingSourceRect = geometry?.sourceRect || null;
      this.webviews.get(webviewId).sourceRect = geometry?.sourceRect || null;
      this.setPeekSourceLinkVisibility(effectiveLinkRect?.sourceToken, true);
      if (previewAsset?.dataUrl) {
        this.mountPreviewLayer(peekPanel, previewAsset.dataUrl, effectiveLinkRect);
        this.setPreviewAnimationState(peekPanel, true);
        this.preparePeekContentForPreview(peekPanel);
      } else {
        this.showPeekContent(peekPanel);
      }
      
      peekContainer.style.setProperty("--peek-backdrop-duration", `${this.getBackdropDuration("opening")}ms`);
      
      requestAnimationFrame(() => {
        peekContainer.classList.remove("pre-open");
        peekContainer.classList.add("open");
      });

      // Start navigation once the webview is attached so it does not get stuck
      // on about:blank while the opening animation is still running.
      requestAnimationFrame(() => {
        const currentData = this.webviews.get(webviewId);
        if (!currentData || currentData.isDisposing) return;
        this.startPeekNavigation(webview, webviewId);
      });
      
      const sourceRect = this.webviews.get(webviewId).sourceRect || this.resolveSourceRect(effectiveLinkRect);

      if (previewAsset?.dataUrl) {
        const handoffOptions = {
          delayRatio: 0,
          durationRatio: 0.25,
        };
        this.animatePeekContentIn(peekPanel, handoffOptions);
        this.animatePreviewLayerOut(peekPanel, {
          delayRatio: 0,
          durationRatio: 0.25,
        });
      }

      this.webviews.get(webviewId).openingState = "animating";
      this.webviews.get(webviewId).timers.startNavigation = window.setTimeout(() => {
        const currentData = this.webviews.get(webviewId);
        if (!currentData || currentData.isDisposing) return;
        this.startPeekNavigation(webview, webviewId);
      }, Math.max(0, this.getGlanceDuration("opening") - 80));
      
      this.animatePeekMotion(peekPanel, "opening", sourceRect)
        .then(() => {
          this.finalizePeekOpening(peekPanel, webviewId);
        })
        .catch(() => {
          this.finalizePeekOpening(peekPanel, webviewId);
        });
        
      if (this.hasPeekCSS) {
        document.body.classList.add("peek-open");
      }
    }

    getActivePageWebview() {
      return document.querySelector(".active.visible.webpageview webview");
    }

    getActivePageTabId() {
      const tabId = Number(this.getActivePageWebview()?.tab_id);
      if (!Number.isFinite(tabId) || tabId <= 0) return null;
      return tabId;
    }

    isPeekOnOriginalSourceTab(data) {
      if (data?.fromPanel) return true;
      const sourceTabId = Number(data?.tabId);
      if (!Number.isFinite(sourceTabId) || sourceTabId <= 0) return false;
      return this.getActivePageTabId() === sourceTabId;
    }

    async getPeekClosingSourceRect(data) {
      if (!data || data.disableSourceCloseAnimation) return null;
      if (!this.isPeekOnOriginalSourceTab(data)) return null;
      if (data.openingSourceRect?.width && data.openingSourceRect?.height) {
        return data.openingSourceRect;
      }
      const liveLinkRect = await this.requestSourceLinkRect(data.sourceToken);
      if (liveLinkRect) {
        return this.resolveSourceRect(liveLinkRect);
      }
      return data.sourceRect || this.resolveSourceRect(data.linkRect);
    }

    setPeekSourceLinkVisibility(sourceToken, hidden) {
      if (!sourceToken) return;
      chrome.runtime.sendMessage({
        type: "peek-source-link-state",
        sourceToken,
        hidden: !!hidden,
      });
    }

    requestSourceLinkRect(sourceToken) {
      if (!sourceToken) return Promise.resolve(null);

      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: "peek-source-rect-request",
            sourceToken,
          },
          (response) => {
            if (chrome.runtime.lastError) {
              resolve(null);
              return;
            }

            const rect = response?.rect;
            if (!rect?.width || !rect?.height) {
              resolve(null);
              return;
            }

            resolve({
              ...rect,
              sourceToken,
            });
          }
        );
      });
    }

    getPeekViewportRect(activeWebview = null) {
      const webviewContainer = document.getElementById("webview-container");
      const sourceRect =
        webviewContainer?.getBoundingClientRect?.() ||
        activeWebview?.getBoundingClientRect?.() ||
        this.getActivePageWebview()?.getBoundingClientRect?.() ||
        document.getElementById("browser")?.getBoundingClientRect?.();

      if (!sourceRect?.width || !sourceRect?.height) return null;

      return {
        left: Math.round(sourceRect.left),
        top: Math.round(sourceRect.top),
        width: Math.max(1, Math.round(sourceRect.width)),
        height: Math.max(1, Math.round(sourceRect.height)),
      };
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

    getPreviewCacheKey(linkUrl, linkRect) {
      const rawKey = typeof linkRect?.href === "string" && linkRect.href ? linkRect.href : linkUrl;
      if (typeof rawKey !== "string" || !rawKey) return null;

      try {
        const url = new URL(rawKey, window.location.href);
        url.hash = "";
        const text = String(linkRect?.preview?.text || "").replace(/\s+/g, " ").trim().slice(0, 120);
        const left = Math.round(linkRect?.left || 0);
        const top = Math.round(linkRect?.top || 0);
        const width = Math.round(linkRect?.width || 0);
        const height = Math.round(linkRect?.height || 0);
        return `${url.toString()}|${text}|${left},${top},${width}x${height}`;
      } catch (error) {
        const text = String(linkRect?.preview?.text || "").replace(/\s+/g, " ").trim().slice(0, 120);
        const left = Math.round(linkRect?.left || 0);
        const top = Math.round(linkRect?.top || 0);
        const width = Math.round(linkRect?.width || 0);
        const height = Math.round(linkRect?.height || 0);
        return `${rawKey}|${text}|${left},${top},${width}x${height}`;
      }
    }

    getRecentLinkSnapshot(linkUrl) {
      const snapshot = this.lastRecordedLinkData;
      if (!snapshot?.href) return null;
      if (snapshot.href !== linkUrl) return null;
      if (Date.now() - (snapshot.recordedAt || 0) > this.ARC_CONFIG.lastRecordedLinkTtlMs) return null;
      return snapshot;
    }

    getCachedPreviewAsset(cacheKey) {
      if (!cacheKey || !this.previewCache.has(cacheKey)) return null;
      const cachedPreviewAsset = this.previewCache.get(cacheKey);
      if (!cachedPreviewAsset?.dataUrl) {
        this.previewCache.delete(cacheKey);
        return null;
      }
      if (Date.now() - cachedPreviewAsset.createdAt > this.ARC_CONFIG.previewCacheTtlMs) {
        this.previewCache.delete(cacheKey);
        return null;
      }
      this.previewCache.delete(cacheKey);
      this.previewCache.set(cacheKey, cachedPreviewAsset);
      return cachedPreviewAsset;
    }

    storePreviewAsset(cacheKey, sourcePreviewUrl, linkRect = null) {
      if (!cacheKey || !sourcePreviewUrl) return null;
      const previewAsset = {
        dataUrl: sourcePreviewUrl,
        createdAt: Date.now(),
        width: Math.max(0, Math.round(linkRect?.width || 0)),
        height: Math.max(0, Math.round(linkRect?.height || 0)),
      };
      if (this.previewCache.has(cacheKey)) {
        this.previewCache.delete(cacheKey);
      }
      this.previewCache.set(cacheKey, previewAsset);

      while (this.previewCache.size > this.ARC_CONFIG.previewCacheLimit) {
        const oldestKey = this.previewCache.keys().next().value;
        if (!oldestKey) break;
        this.previewCache.delete(oldestKey);
      }
      return previewAsset;
    }

    async captureSourcePreview(linkRect, fromPanel, cacheKey = null) {
      if (fromPanel) return null;
      if (!linkRect) return null;

      const uiRect = this.buildUICaptureRect(linkRect);
      if (uiRect) {
        try {
          const sourcePreviewUrl = await this.captureUIArea(uiRect);
          const usable = await this.isUsablePreviewUrl(sourcePreviewUrl);
          if (usable) {
            return this.storePreviewAsset(cacheKey, sourcePreviewUrl, linkRect);
          }
        } catch (_) {}
      }
      return null;
    }

    startPreviewCapture(cacheKey, linkRect, fromPanel) {
      const cachedPreviewAsset = this.getCachedPreviewAsset(cacheKey);
      if (cachedPreviewAsset) {
        return Promise.resolve(cachedPreviewAsset);
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
      const viewportRect = this.getPeekViewportRect();
      if (!viewportRect) return null;
      const width = Math.max(linkRect.width || 0, 1);
      const height = Math.max(linkRect.height || 0, 1);

      return {
        left: Math.max(0, Math.round(viewportRect.left + linkRect.left)),
        top: Math.max(0, Math.round(viewportRect.top + linkRect.top)),
        width: Math.max(1, Math.round(width)),
        height: Math.max(1, Math.round(height)),
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
      peekPanel.style.left = `${finalRect.left}px`;
      peekPanel.style.top = `${finalRect.top}px`;
      peekPanel.style.transform = "translate(0, 0)";
      peekPanel.style.setProperty("--peek-translate-x", `${translateX}px`);
      peekPanel.style.setProperty("--peek-translate-y", `${translateY}px`);
      peekPanel.style.setProperty("--peek-scale-x", scaleX.toFixed(4));
      peekPanel.style.setProperty("--peek-scale-y", scaleY.toFixed(4));
      peekPanel.style.setProperty("--peek-source-radius", `${sourceRadius.toFixed(2)}px`);
      peekContainer.style.setProperty("--peek-backdrop-origin-x", `${backdropOriginX}px`);
      peekContainer.style.setProperty("--peek-backdrop-origin-y", `${backdropOriginY}px`);

      return { sourceRect, finalRect, backdropOriginX, backdropOriginY };
    }

    captureAndStorePreview(webviewId, linkRect, fromPanel) {
      const data = this.webviews.get(webviewId);
      if (!data || data.previewAssetUrl || !linkRect) return;

      data.previewCapturePromise =
        data.previewCapturePromise ||
        this.startPreviewCapture(data.previewCacheKey, linkRect, fromPanel);
      data.previewCapturePromise
        .then((previewAsset) => {
          if (!previewAsset?.dataUrl) return;
          const current = this.webviews.get(webviewId);
          if (!current || current.isDisposing) return;
          if (current.openingState !== "starting") return;
          current.previewAssetUrl = previewAsset.dataUrl;
          current.previewAssetTrusted = true;
        })
        .catch(() => {});
    }

    async ensurePreviewAsset(data, { maxWaitMs = 120 } = {}) {
      if (!data) return null;
      if (data.previewAssetUrl) {
        return data.previewAssetUrl;
      }

      const cachedPreviewAsset = this.getCachedPreviewAsset(data.previewCacheKey);
      if (cachedPreviewAsset?.dataUrl) {
        data.previewAssetUrl = cachedPreviewAsset.dataUrl;
        data.previewAssetTrusted = true;
        return data.previewAssetUrl;
      }

      if (data.previewCapturePromise) {
        try {
          const previewAsset = await Promise.race([
            data.previewCapturePromise,
            new Promise((resolve) =>
              window.setTimeout(() => resolve(null), Math.max(0, maxWaitMs))
            ),
          ]);
          if (previewAsset?.dataUrl) {
            if (data.openingState !== "starting") {
              return null;
            }
            data.previewAssetUrl = previewAsset.dataUrl;
            data.previewAssetTrusted = true;
            return data.previewAssetUrl;
          }
        } catch (_) {}
      }
      return null;
    }

    createPreviewLayer(sourcePreviewUrl, linkRect) {
      const previewLayer = document.createElement("div");
      const imageLayer = document.createElement("img");
      const hasPreview = !!sourcePreviewUrl;
      const previewWidth = Math.max(1, Math.round(linkRect?.width || 1));
      const previewHeight = Math.max(1, Math.round(linkRect?.height || 1));

      previewLayer.className = "peek-source-preview";
      imageLayer.className = "peek-source-preview-image";
      previewLayer.style.setProperty(
        "--preview-bg",
        hasPreview ? "rgba(255, 255, 255, 0.1)" : "rgba(255,255,255,0.1)"
      );
      imageLayer.style.aspectRatio = `${previewWidth} / ${previewHeight}`;
      
      if (hasPreview) {
        imageLayer.src = sourcePreviewUrl;
        imageLayer.alt = "";
        imageLayer.decoding = "sync";
        imageLayer.draggable = false;
        previewLayer.style.backgroundImage = `url("${sourcePreviewUrl}")`;
        previewLayer.style.backgroundRepeat = "no-repeat";
        previewLayer.style.backgroundPosition = "center";
        previewLayer.style.backgroundSize = "contain";
      }

      previewLayer.appendChild(imageLayer);
      return previewLayer;
    }

    mountPreviewLayer(peekPanel, sourcePreviewUrl, linkRect) {
      if (!peekPanel) return null;
      this.removePreviewLayer(peekPanel);
      const previewLayer = this.createPreviewLayer(sourcePreviewUrl, linkRect);
      peekPanel.prepend(previewLayer);
      return previewLayer;
    }

    removePreviewLayer(peekPanel) {
      peekPanel?.querySelector(":scope > .peek-source-preview")?.remove();
    }

    getFittedPreviewRect(peekPanel, linkRect) {
      const panelRect = peekPanel?.getBoundingClientRect?.();
      const sourceWidth = Math.max(1, Number(linkRect?.width) || 1);
      const sourceHeight = Math.max(1, Number(linkRect?.height) || 1);
      if (!panelRect?.width || !panelRect?.height) return null;

      const widthScale = panelRect.width / sourceWidth;
      const heightScale = panelRect.height / sourceHeight;
      const fitScale = Math.min(widthScale, heightScale);
      const fittedWidth = Math.max(1, Math.round(sourceWidth * fitScale));
      const fittedHeight = Math.max(1, Math.round(sourceHeight * fitScale));
      const fittedLeft = Math.round((panelRect.width - fittedWidth) / 2);
      const fittedTop = Math.round((panelRect.height - fittedHeight) / 2);

      return {
        left: fittedLeft,
        top: fittedTop,
        width: fittedWidth,
        height: fittedHeight,
      };
    }

    async waitForPreviewLayer(previewLayer, timeoutMs = 400) {
      const imageElement = previewLayer?.querySelector(
        ".peek-source-preview-image"
      );
      if (!(imageElement instanceof HTMLImageElement) || !imageElement.src) return;

      if (imageElement.complete && imageElement.naturalWidth > 0) return;

      await Promise.race([
        new Promise((resolve) => {
          const finish = () => resolve();
          imageElement.addEventListener("load", finish, { once: true });
          imageElement.addEventListener("error", finish, { once: true });
          if (typeof imageElement.decode === "function") {
            imageElement.decode().then(finish).catch(finish);
          }
        }),
        new Promise((resolve) => window.setTimeout(resolve, timeoutMs)),
      ]);
    }

    finalizePeekOpening(peekPanel, webviewId) {
      const data = this.webviews.get(webviewId);
      if (!data || data.isDisposing || data.closingMode || !peekPanel?.isConnected) {
        return;
      }
      if (data) {
        data.openingState = "finished";
      }
      this.startPeekNavigation(data.webview, webviewId);
      peekPanel?.setAttribute("data-has-finished-animation", "true");
      this.setPreviewAnimationState(peekPanel, false);
      this.setPreviewClosingState(peekPanel, false);
      this.removePreviewLayer(peekPanel);
      this.showPeekContent(peekPanel);
    }

    startPeekNavigation(webview, webviewId = "") {
      const pendingSrc = webview?.dataset?.pendingSrc;
      if (!webview || !pendingSrc) return;
      webview.setAttribute("src", pendingSrc);
      webview.src = pendingSrc;
      delete webview.dataset.pendingSrc;
    }

    hidePeekContent(peekPanel) {
      const peekContent = peekPanel?.querySelector(".peek-content");
      if (!peekContent) return;
      peekContent.getAnimations?.().forEach((animation) => animation.cancel());
      peekContent.style.display = "none";
      peekContent.style.opacity = "0";
      peekContent.style.visibility = "hidden";
      const webview = peekContent.querySelector("webview");
      if (webview) {
        webview.style.display = "none";
        webview.style.opacity = "0";
        webview.style.visibility = "hidden";
      }
    }

    suppressPeekContentForClosing(peekPanel) {
      const peekContent = peekPanel?.querySelector(".peek-content");
      if (!peekContent) return;
      peekContent.getAnimations?.().forEach((animation) => animation.cancel());
      peekContent.style.display = "";
      peekContent.style.opacity = "0";
      peekContent.style.visibility = "hidden";
      peekContent.style.pointerEvents = "none";
      const webview = peekContent.querySelector("webview");
      if (webview) {
        webview.getAnimations?.().forEach((animation) => animation.cancel());
        webview.style.display = "";
        webview.style.opacity = "0";
        webview.style.visibility = "hidden";
        webview.style.pointerEvents = "none";
      }
    }

    detachPeekContentForClosing(peekPanel) {
      const peekContent = peekPanel?.querySelector(".peek-content");
      if (!peekContent) return;
      peekContent.getAnimations?.().forEach((animation) => animation.cancel());
      peekContent.remove();
    }

    preparePeekContentForPreview(peekPanel) {
      const peekContent = peekPanel?.querySelector(".peek-content");
      if (!peekContent) return;
      peekContent.getAnimations?.().forEach((animation) => animation.cancel());
      peekContent.style.display = "";
      peekContent.style.opacity = "0";
      peekContent.style.visibility = "";
      peekContent.style.pointerEvents = "none";
      const webview = peekContent.querySelector("webview");
      if (webview) {
        webview.style.display = "";
        webview.style.opacity = "1";
        webview.style.visibility = "";
      }
    }

    showPeekContent(peekPanel) {
      const peekContent = peekPanel?.querySelector(".peek-content");
      if (!peekContent) return;
      peekContent.getAnimations?.().forEach((animation) => animation.cancel());
      peekContent.style.display = "";
      peekContent.style.opacity = "1";
      peekContent.style.visibility = "";
      peekContent.style.pointerEvents = "";
      const webview = peekContent.querySelector("webview");
      if (webview) {
        webview.style.display = "";
        webview.style.opacity = "1";
        webview.style.visibility = "";
        webview.style.pointerEvents = "";
      }
    }

    animatePeekContentIn(
      peekPanel,
      { delayRatio = 0, durationRatio = this.ARC_CONFIG.previewFadeInRatio } = {}
    ) {
      const peekContent = peekPanel?.querySelector(".peek-content");
      if (!peekContent || typeof peekContent.animate !== "function") {
        this.showPeekContent(peekPanel);
        return;
      }

      const delay = Math.max(
        0,
        this.getGlanceDuration("opening") * delayRatio
      );
      const duration = Math.max(
        1,
        this.getGlanceDuration("opening") * Math.max(durationRatio, 0)
      );

      peekContent.getAnimations().forEach((animation) => animation.cancel());
      peekContent.style.display = "";
      peekContent.style.opacity = "0";
      const animation = peekContent.animate([{ opacity: 0 }, { opacity: 1 }], {
        delay,
        duration,
        easing: "ease-in-out",
        fill: "forwards",
      });

      animation.finished.then(() => {
        if (!peekPanel?.isConnected) return;
        peekContent.style.opacity = "1";
        peekContent.style.pointerEvents = "";
      }).catch(() => {});
    }

    animatePeekContentOut(
      peekPanel,
      { delayRatio = 0, durationRatio = 0 } = {}
    ) {
      const peekContent = peekPanel?.querySelector(".peek-content");
      if (!peekContent || typeof peekContent.animate !== "function") {
        this.hidePeekContent(peekPanel);
        return;
      }

      const duration = Math.max(
        0,
        this.getGlanceDuration("closing") * (durationRatio || this.ARC_CONFIG.contentHideRatio)
      );
      const delay = Math.max(
        0,
        this.getGlanceDuration("closing") * delayRatio
      );

      if (duration <= 0 && delay <= 0) {
        this.hidePeekContent(peekPanel);
        return;
      }

      peekContent.getAnimations().forEach((animation) => animation.cancel());
      const animation = peekContent.animate([{ opacity: 1 }, { opacity: 0 }], {
        delay,
        duration: Math.max(1, duration),
        easing: "ease-out",
        fill: "forwards",
      });

      animation.finished.then(() => {
        if (!peekPanel?.isConnected) return;
        peekContent.style.opacity = "0";
        peekContent.style.display = "none";
      }).catch(() => {});
    }

    animatePreviewLayerOut(
      peekPanel,
      {
        delayRatio = this.ARC_CONFIG.previewFadeOutDelayRatio,
        durationRatio = this.ARC_CONFIG.previewFadeOutRatio,
      } = {}
    ) {
      const previewLayer = peekPanel?.querySelector(":scope > .peek-source-preview");
      if (!previewLayer) return;
      if (typeof previewLayer.animate !== "function") {
        previewLayer.style.opacity = "0";
        return;
      }

      previewLayer.getAnimations?.().forEach((animation) => animation.cancel());
      previewLayer.style.opacity = "1";
      const animation = previewLayer.animate([{ opacity: 1 }, { opacity: 0 }], {
        delay: this.getGlanceDuration("opening") * delayRatio,
        duration: Math.max(
          1,
          this.getGlanceDuration("opening") * Math.max(durationRatio, 0)
        ),
        easing: "ease-out",
        fill: "forwards",
      });

      animation.finished.then(() => {
        if (!previewLayer.isConnected) return;
        previewLayer.style.opacity = "0";
      }).catch(() => {});
    }

    preparePreviewLayerForClosing(peekPanel) {
      const previewLayer = peekPanel?.querySelector(":scope > .peek-source-preview");
      if (!previewLayer) return;
      previewLayer.getAnimations?.().forEach((animation) => animation.cancel());
      previewLayer.style.opacity = "1";
      previewLayer.style.zIndex = "3";
      previewLayer.style.visibility = "visible";
    }

    async flushPreviewLayerForClosing(peekPanel, previewLayer) {
      if (!peekPanel || !previewLayer) return;
      previewLayer.style.transform = "translateZ(0)";
      void previewLayer.offsetHeight;
      void peekPanel.offsetHeight;
      await this.waitForAnimationFrames(2);
    }

    animatePreviewLayerIn(peekPanel) {
      const previewLayer = peekPanel?.querySelector(":scope > .peek-source-preview");
      if (!previewLayer) return;
      if (this.ARC_CONFIG.previewRevealRatio <= 0) {
        previewLayer.getAnimations?.().forEach((animation) => animation.cancel());
        previewLayer.style.opacity = "1";
        return;
      }
      if (typeof previewLayer.animate !== "function") {
        previewLayer.style.opacity = "1";
        return;
      }

      previewLayer.getAnimations?.().forEach((animation) => animation.cancel());
      previewLayer.style.opacity = "1";
      const animation = previewLayer.animate([{ opacity: 1 }, { opacity: 1 }], {
        delay: this.getGlanceDuration("closing") * this.ARC_CONFIG.previewRevealDelayRatio,
        duration: this.getGlanceDuration("closing") * this.ARC_CONFIG.previewRevealRatio,
        easing: "ease-out",
        fill: "forwards",
      });

      animation.finished.then(() => {
        if (!previewLayer.isConnected) return;
        previewLayer.style.opacity = "1";
      }).catch(() => {});
    }

    setPreviewAnimationState(peekPanel, enabled) {
      if (!peekPanel) return;
      peekPanel.classList.toggle("preview-animating", !!enabled);
    }

    setPreviewClosingState(peekPanel, enabled) {
      if (!peekPanel) return;
      peekPanel.classList.toggle("preview-closing", !!enabled);
    }

    setPreviewClosingMatteState(peekPanel, enabled) {
      if (!peekPanel) return;
      peekPanel.classList.toggle("preview-closing-matte", !!enabled);
    }

    getPeekPanelLinkRect(peekPanel) {
      const webviewId =
        peekPanel?.dataset?.peekWebviewId ||
        peekPanel?.querySelector("webview")?.id;
      return this.webviews.get(webviewId || "")?.linkRect || null;
    }

    getPanelRectMotionGeometry(peekPanel, sourceRect) {
      const finalRect = peekPanel?.getBoundingClientRect?.();
      if (!finalRect?.width || !finalRect?.height || !sourceRect?.width || !sourceRect?.height) {
        return null;
      }

      const finalRadius =
        Number.parseFloat(getComputedStyle(peekPanel).borderRadius) ||
        Math.min(finalRect.height / 2, 18);
      const sourceRadius = `${Math.min(Math.max(sourceRect.height / 2, 8), 18)}px`;
      const targetRect = {
        left: finalRect.left,
        top: finalRect.top,
        width: finalRect.width,
        height: finalRect.height,
      };

      return {
        sourceRect,
        targetRect,
        sourceRadius,
        targetRadius: `${finalRadius}px`,
        openingKeyframes: [
          {
            left: `${sourceRect.left}px`,
            top: `${sourceRect.top}px`,
            width: `${sourceRect.width}px`,
            height: `${sourceRect.height}px`,
            borderRadius: sourceRadius,
            opacity: 1,
          },
          {
            left: `${targetRect.left}px`,
            top: `${targetRect.top}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
            borderRadius: `${finalRadius}px`,
            opacity: 1,
          },
        ],
        closingKeyframes: [
          {
            left: `${targetRect.left}px`,
            top: `${targetRect.top}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
            borderRadius: `${finalRadius}px`,
            opacity: 1,
          },
          {
            left: `${sourceRect.left}px`,
            top: `${sourceRect.top}px`,
            width: `${sourceRect.width}px`,
            height: `${sourceRect.height}px`,
            borderRadius: sourceRadius,
            opacity: 1,
          },
        ],
      };
    }

    getPanelScaleMotionGeometry(peekPanel, sourceRect, linkRect = null) {
      const finalRect = peekPanel?.getBoundingClientRect?.();
      if (!finalRect?.width || !finalRect?.height) return null;

      const fittedRect = this.getFittedPreviewRect(peekPanel, linkRect) || {
        left: 0,
        top: 0,
        width: finalRect.width,
        height: finalRect.height,
      };
      const panelAbsoluteRect = {
        left: finalRect.left,
        top: finalRect.top,
        width: finalRect.width,
        height: finalRect.height,
      };
      const fittedAbsoluteRect = {
        left: panelAbsoluteRect.left + fittedRect.left,
        top: panelAbsoluteRect.top + fittedRect.top,
        width: fittedRect.width,
        height: fittedRect.height,
      };
      const fallbackSource = {
        left: fittedAbsoluteRect.left,
        top: fittedAbsoluteRect.top,
        width: fittedAbsoluteRect.width,
        height: fittedAbsoluteRect.height,
      };
      const originRect = sourceRect || fallbackSource;
      const sourceCenterX = originRect.left + originRect.width / 2;
      const sourceCenterY = originRect.top + originRect.height / 2;
      const uniformScale = Math.min(
        Math.max(originRect.width / fittedAbsoluteRect.width, 0.06),
        Math.max(originRect.height / fittedAbsoluteRect.height, 0.06),
        1
      );
      const fittedCenterOffsetX =
        (fittedRect.left + fittedRect.width / 2) * uniformScale;
      const fittedCenterOffsetY =
        (fittedRect.top + fittedRect.height / 2) * uniformScale;
      const panelTranslateX =
        sourceCenterX - (panelAbsoluteRect.left + fittedCenterOffsetX);
      const panelTranslateY =
        sourceCenterY - (panelAbsoluteRect.top + fittedCenterOffsetY);
      const finalRadius =
        Number.parseFloat(getComputedStyle(peekPanel).borderRadius) ||
        Math.min(finalRect.height / 2, 18);
      const sourceRadius = `${Math.min(Math.max(originRect.height / 2, 8), 18)}px`;

      return {
        finalRadius: `${finalRadius}px`,
        sourceRadius,
        openingKeyframes: [
          {
            transform: `translate(${panelTranslateX}px, ${panelTranslateY}px) scale(${uniformScale})`,
            borderRadius: sourceRadius,
            opacity: 0.94,
          },
          {
            transform: "translate(0, 0) scale(1.008)",
            borderRadius: `${finalRadius}px`,
            opacity: 1,
            offset: 0.92,
          },
          {
            transform: "translate(0, 0) scale(1)",
            borderRadius: `${finalRadius}px`,
            opacity: 1,
          },
        ],
        closingKeyframes: [
          {
            transform: "translate(0, 0) scale(1)",
            borderRadius: `${finalRadius}px`,
            opacity: 1,
          },
          {
            transform: "translate(0, 0) scale(1.006)",
            borderRadius: `${finalRadius}px`,
            opacity: 1,
            offset: 0.14,
          },
          {
            transform: `translate(${panelTranslateX}px, ${panelTranslateY}px) scale(${uniformScale})`,
            borderRadius: sourceRadius,
            opacity: 1,
          },
        ],
      };
    }

    animatePanelTransformMotion(peekPanel, direction, sourceRect) {
      const linkRect = this.getPeekPanelLinkRect(peekPanel);
      const geometry = this.getPanelScaleMotionGeometry(
        peekPanel,
        sourceRect,
        linkRect
      );
      if (!geometry) return Promise.resolve();
      const keyframes =
        direction === "opening"
          ? geometry.openingKeyframes
          : geometry.closingKeyframes;

      peekPanel.getAnimations?.().forEach((animation) => animation.cancel());
      peekPanel.style.transformOrigin = "top left";

      if (typeof peekPanel.animate !== "function") {
        const lastFrame = keyframes[keyframes.length - 1];
        peekPanel.style.transform = lastFrame.transform;
        peekPanel.style.borderRadius = lastFrame.borderRadius;
        peekPanel.style.opacity = String(lastFrame.opacity ?? 1);
        return Promise.resolve();
      }

      const panelAnimation = peekPanel.animate(keyframes, {
        duration: this.getGlanceDuration(direction),
        easing:
          direction === "opening"
            ? "cubic-bezier(0.16, 0.88, 0.22, 1)"
            : "cubic-bezier(0.2, 0.82, 0.24, 1)",
        fill: "forwards",
      });
      return panelAnimation.finished;
    }

    animatePanelRectMotion(peekPanel, direction, sourceRect) {
      const geometry = this.getPanelRectMotionGeometry(peekPanel, sourceRect);
      if (!geometry) return Promise.resolve();
      const keyframes =
        direction === "opening"
          ? geometry.openingKeyframes
          : geometry.closingKeyframes;

      peekPanel.getAnimations?.().forEach((animation) => animation.cancel());
      peekPanel.style.transform = "none";
      peekPanel.style.transformOrigin = "top left";

      if (typeof peekPanel.animate !== "function") {
        const lastFrame = keyframes[keyframes.length - 1];
        peekPanel.style.left = lastFrame.left;
        peekPanel.style.top = lastFrame.top;
        peekPanel.style.width = lastFrame.width;
        peekPanel.style.height = lastFrame.height;
        peekPanel.style.borderRadius = lastFrame.borderRadius;
        return Promise.resolve();
      }

      const panelAnimation = peekPanel.animate(keyframes, {
        duration: this.getGlanceDuration(direction),
        easing: "cubic-bezier(0.16, 0.88, 0.22, 1)",
        fill: "forwards",
      });
      return panelAnimation.finished;
    }

    animatePeekMotion(peekPanel, direction, sourceRect) {
      if (!peekPanel) return Promise.resolve();
      if (
        sourceRect &&
        peekPanel.querySelector(":scope > .peek-source-preview")
      ) {
        return this.animatePanelRectMotion(peekPanel, direction, sourceRect);
      }
      return this.animatePanelTransformMotion(peekPanel, direction, sourceRect);
    }

    getGlanceDuration(direction) {
      return direction === "closing"
        ? this.ARC_CONFIG.glanceCloseAnimationDuration
        : this.ARC_CONFIG.glanceOpenAnimationDuration;
    }

    getBackdropDuration(direction) {
      return this.getGlanceDuration(direction);
    }

    waitForAnimationFrames(frameCount = 1) {
      const totalFrames = Math.max(1, Number(frameCount) || 1);
      return new Promise((resolve) => {
        let remaining = totalFrames;
        const step = () => {
          remaining -= 1;
          if (remaining <= 0) {
            resolve();
            return;
          }
          requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }

    showSidebarControls(webviewId, thisElement) {
      if (!thisElement || thisElement.childElementCount > 0) return;
      thisElement.style.opacity = "1";
      thisElement.style.pointerEvents = "auto";

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
      button.setAttribute("class", cls.trim());
      button.setAttribute("type", "button");
      let actionTriggered = false;
      const resetTriggerState = () => {
        window.setTimeout(() => {
          actionTriggered = false;
        }, 0);
      };
      button.addEventListener("pointerdown", (event) => {
        actionTriggered = false;
        event.stopPropagation();
        event.stopImmediatePropagation?.();
      });
      button.addEventListener("mousedown", (event) => {
        event.stopPropagation();
        event.stopImmediatePropagation?.();
      });
      const invoke = (event) => {
        if (actionTriggered) return;
        actionTriggered = true;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();
        clickListenerCallback(event);
        resetTriggerState();
      };
      button.addEventListener("pointerup", invoke);
      button.addEventListener("mouseup", invoke);
      button.addEventListener("click", invoke);

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
      data.disableSourceCloseAnimation = true;
      
      peekContainer.classList.add("expanding-to-tab");
      peekContainer.style.pointerEvents = "auto";
      if (this.hasPeekCSS) {
        document.body.classList.remove("peek-open");
      }

      let activeWebview = document.querySelector(".active.visible.webpageview webview");
      const targetRect = this.getPeekViewportRect(activeWebview);
      const expandDurationMs = 300;
      if (targetRect) {
        const currentRect = peekPanel.getBoundingClientRect();
        const easing = "cubic-bezier(0.2, 0.8, 0.2, 1)";

        // Lock the current on-screen box first, then interpolate to the tab viewport.
        peekPanel.getAnimations?.().forEach((animation) => animation.cancel());
        peekPanel.style.position = "fixed";
        peekPanel.style.left = `${currentRect.left}px`;
        peekPanel.style.top = `${currentRect.top}px`;
        peekPanel.style.width = `${currentRect.width}px`;
        peekPanel.style.height = `${currentRect.height}px`;
        peekPanel.style.margin = "0";
        peekPanel.style.right = "auto";
        peekPanel.style.bottom = "auto";
        peekPanel.style.transform = "none";
        peekPanel.style.transition = "none";
        void peekPanel.offsetWidth;
        peekPanel.style.transition =
          [
            `left ${expandDurationMs}ms ${easing}`,
            `top ${expandDurationMs}ms ${easing}`,
            `width ${expandDurationMs}ms ${easing}`,
            `height ${expandDurationMs}ms ${easing}`,
          ].join(", ");
        requestAnimationFrame(() => {
          peekPanel.style.left = `${targetRect.left}px`;
          peekPanel.style.top = `${targetRect.top}px`;
          peekPanel.style.width = `${targetRect.width}px`;
          peekPanel.style.height = `${targetRect.height}px`;
        });
      }

      chrome.tabs.create({ url: url, active: true }, async (tab) => {
        if (tab?.id) {
          await this.waitForTabComplete(tab.id);
        }
        this.dismissPeekInstant(webviewId);
      });
    }

    async openInSplitView(webviewId) {
      const url = this.getPeekUrl(webviewId);
      if (!url) return;
      const data = this.webviews.get(webviewId);
      if (data) {
        data.disableSourceCloseAnimation = true;
      }

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

        // Remove the peek as soon as the split tab exists; the tiling metadata can finish in background.
        this.dismissPeekInstant(webviewId);

        const tilingUpdates = [];
        if (!existingTiling) {
          tilingUpdates.push(this.updateTabVivExtData(currentFresh.id, (viv) => ({
            ...viv,
            tiling: { id: tileId, index: 0, layout, type: "selection" },
          })));
        }

        tilingUpdates.push(this.updateTabVivExtData(newTab.id, (viv) => ({
          ...viv,
          tiling: { id: tileId, index: nextIndex, layout, type: "selection" },
        })));
        await Promise.all(tilingUpdates);

        await Promise.all([
          this.updateTab(currentFresh.id, { active: true, highlighted: true }),
          this.updateTab(newTab.id, { highlighted: true }),
        ]);
      } catch (_) {}
    }
  }

  class WebsiteInjectionUtils {
    constructor(getWebviewConfig, openPeek, iconConfig) {
      this.iconConfig = JSON.stringify(iconConfig);
      this.injectRetryTimers = new Map();
      this.injectThrottleState = new WeakMap();
      this.webviewObserver = null;

      const injectForNavigation = (navigationDetails) => {
        const { webview, fromPanel } = getWebviewConfig(navigationDetails);
        if (webview && this.isInjectableWebview(webview)) {
          this.injectCode(webview, fromPanel);
        }
      };

      chrome.webNavigation.onCommitted.addListener(injectForNavigation);
      chrome.webNavigation.onDOMContentLoaded.addListener(injectForNavigation);
      chrome.webNavigation.onCompleted.addListener(injectForNavigation);

      [0, 32, 120, 300].forEach((delay) => {
        window.setTimeout(() => {
          this.injectActiveWebview();
        }, delay);
      });

      this.observeWebviewLifecycle();

      chrome.runtime.onMessage.addListener((message) => {
        if (message.url) {
          openPeek(message.url, message.fromPanel, message.rect, message.meta);
        }
      });
    }

    scheduleActiveWebviewInjection(delay = 0) {
      if (this.injectRetryTimers.has(delay)) return;
      const timeoutId = window.setTimeout(() => {
        this.injectRetryTimers.delete(delay);
        this.injectActiveWebview();
      }, delay);
      this.injectRetryTimers.set(delay, timeoutId);
    }

    observeWebviewLifecycle() {
      const observerTarget = document.getElementById("browser") || document.body || document.documentElement;
      if (!observerTarget) return;

      this.webviewObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "attributes") {
            const target = mutation.target;
            if (
              target?.tagName === "WEBVIEW" ||
              target?.classList?.contains?.("webpageview")
            ) {
              this.scheduleActiveWebviewInjection(0);
              return;
            }
          }

          if (mutation.type === "childList") {
            const addedNodes = [...mutation.addedNodes];
            if (
              addedNodes.some((node) => {
                if (node?.tagName === "WEBVIEW") return true;
                return node?.querySelector?.("webview");
              })
            ) {
              this.scheduleActiveWebviewInjection(0);
              return;
            }
          }
        }
      });

      this.webviewObserver.observe(observerTarget, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "src", "tab_id"],
      });

      this.scheduleActiveWebviewInjection(0);
      this.scheduleActiveWebviewInjection(200);
      this.scheduleActiveWebviewInjection(800);
    }

    injectActiveWebview() {
      const activeWebview = document.querySelector(".active.visible.webpageview webview");
      if (activeWebview && this.isInjectableWebview(activeWebview)) {
        this.injectCode(activeWebview, activeWebview.name === "vivaldi-webpanel");
      }
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
        const src = webview.getAttribute("src") || webview.src || "";
        const lastInject = this.injectThrottleState.get(webview);
        const now = Date.now();
        if (
          lastInject &&
          lastInject.src === src &&
          now - lastInject.at < 250
        ) {
          return;
        }
        this.injectThrottleState.set(webview, { src, at: now });
        webview.executeScript({ code: instantiationCode, runAt: "document_start" }, () => {
          void chrome.runtime.lastError;
        });
      } catch (_) {}
    }
  }

  class WebsiteLinkInteractionHandler {
    #abortController = new AbortController();
    #messageListener = null;
    #beforeUnloadListener = null;
    #styleElement = null;
    #hiddenPeekSourceLink = null;
    #hiddenPeekSourceToken = null;

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
      this.pendingSuppressedButton = null;
      this.postClosePointerGuardActive = false;
      this.postClosePointerGuardSawPrimaryDown = false;

      this.#beforeUnloadListener = this.#cleanup.bind(this);
      window.addEventListener("beforeunload", this.#beforeUnloadListener, { signal: this.#abortController.signal });

      this.#initialize();

      this.#messageListener = (message, _sender, sendResponse) => {
        if (message.type === "peek-closed") {
          this.isLongPress = false;
          this.#restorePeekSourceLink();
          if (!this.postClosePointerGuardActive) {
            this.#armPostClosePointerGuard();
          }
          return;
        }

        if (message.type === "peek-will-close") {
          this.#armPostClosePointerGuard();
          return;
        }

        if (message.type === "peek-source-link-state") {
          this.#setPeekSourceLinkVisibility(message.sourceToken, message.hidden);
          return;
        }

        if (message.type === "peek-source-rect-request") {
          const rect = this.#getPeekSourceRect(message.sourceToken);
          if (rect) {
            sendResponse({ rect });
          }
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
      this.#restorePeekSourceLink();
    }

    #releasePointerSuppression() {
      clearTimeout(this.timers.postClosePointerGuardRelease);
      clearTimeout(this.timers.suppressNativeOpen);
      this.peekTriggered = false;
      this.suppressPointerSequence = false;
      this.pendingLeftButtonRelease = false;
      this.pendingSuppressedButton = null;
      this.postClosePointerGuardActive = false;
      this.postClosePointerGuardSawPrimaryDown = false;
      this.#restoreSelection();
    }

    #armPostClosePointerGuard() {
      clearTimeout(this.timers.suppressNativeOpen);
      clearTimeout(this.timers.postClosePointerGuardRelease);
      this.peekTriggered = false;
      this.suppressPointerSequence = true;
      this.pendingLeftButtonRelease = false;
      this.postClosePointerGuardActive = true;
      this.postClosePointerGuardSawPrimaryDown = false;
      this.#suppressSelection();
    }

    #getConfiguredLongPressButtons() {
      const raw = this.config?.longPressButtons;
      const values = Array.isArray(raw) ? raw : [raw];
      const normalized = values
        .flatMap((value) => String(value || "").toLowerCase().split(","))
        .map((value) => value.trim())
        .filter(Boolean)
        .filter((value) => value !== "none");
      return new Set(normalized);
    }

    #isConfiguredLongPressButton(button) {
      const longPressButtons = this.#getConfiguredLongPressButtons();
      if (button === 0) return longPressButtons.has("left");
      if (button === 1) return longPressButtons.has("middle");
      if (button === 2) return longPressButtons.has("right");
      return false;
    }

    #setupMouseHandling() {
      let holdTimer;
      const signalOptions = { signal: this.#abortController.signal, capture: true };

      const suppressNativeEvent = (event) => {
        if (!this.peekTriggered && !this.suppressPointerSequence) return;

        if (
          (event.type === "pointerup" || event.type === "mouseup") &&
          typeof this.pendingSuppressedButton === "number" &&
          event.button === this.pendingSuppressedButton
        ) {
          clearTimeout(this.timers.suppressNativeOpen);
          this.timers.suppressNativeOpen = setTimeout(() => {
            if (typeof this.pendingSuppressedButton === "number") {
              this.#releasePointerSuppression();
            }
          }, 450);
        }

        if (event.type === "pointerup" && event.button === 0) {
          if (
            this.postClosePointerGuardActive &&
            this.postClosePointerGuardSawPrimaryDown
          ) {
            clearTimeout(this.timers.postClosePointerGuardRelease);
            this.timers.postClosePointerGuardRelease = setTimeout(() => {
              this.#releasePointerSuppression();
            }, 80);
          }
        }

        if (
          (event.type === "click" ||
            event.type === "auxclick" ||
            event.type === "contextmenu") &&
          (
            typeof this.pendingSuppressedButton === "number" ||
            this.postClosePointerGuardActive
          )
        ) {
          clearTimeout(this.timers.postClosePointerGuardRelease);
          clearTimeout(this.timers.suppressNativeOpen);
          this.#releasePointerSuppression();
        }

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
        if (this.postClosePointerGuardActive) {
          if (event.button === 0) {
            this.postClosePointerGuardSawPrimaryDown = true;
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
          }
          return;
        }

        const link = this.#getLinkElement(event);
        if (link) {
          this.#recordLinkSnapshot(event, link);
        }

        if ((event.altKey || event.metaKey || event.ctrlKey) && event.button === 0) {
          this.pendingLeftButtonRelease = true;
          this.pendingSuppressedButton = 0;
          this.#openPeekFromEvent(event);
          this.preventAllClicks();
        } else if (this.#isConfiguredLongPressButton(event.button)) {
          if (link) {
            this.isLongPress = true;
            this.#suppressSelection();
            const effectiveHoldTime =
              this.config.longPressHoldTime - this.config.longPressHoldDelay;

            this.visibilityDelayTimer = setTimeout(() => {
              this.#startLinkHoldFeedback(link, effectiveHoldTime);
            }, this.config.longPressHoldDelay);

            holdTimer = setTimeout(() => {
              this.pendingLeftButtonRelease = true;
              this.pendingSuppressedButton = event.button;
              this.#openPeekFromEvent(event);
              this.preventAllClicks();
              this.#stopLinkHoldFeedback();
              if (this.visibilityDelayTimer) clearTimeout(this.visibilityDelayTimer);
            }, this.config.longPressHoldTime);
          }
        }
      }, { signal: this.#abortController.signal });

      document.addEventListener("pointerup", (event) => {
        if (this.#isConfiguredLongPressButton(event.button)) {
          clearTimeout(holdTimer);
          this.#stopLinkHoldFeedback();
          if (this.visibilityDelayTimer) {
            clearTimeout(this.visibilityDelayTimer);
            this.visibilityDelayTimer = null;
          }
          if (this.pendingLeftButtonRelease) {
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
      link.style.setProperty("--peek-hold-depth", "0");
      link.classList.add("peek-hold-press");
      const startTime = performance.now();
      const tick = (now) => {
        if (!this.longPressLink || this.longPressLink !== link) return;
        const progress = Math.min((now - startTime) / Math.max(duration, 1), 1);
        const depth = 1 - Math.pow(1 - progress, 1.75);
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

    #ensurePeekSourceToken(link) {
      if (!link) return "";
      if (!link.dataset.arcpeekSourceToken) {
        const token =
          typeof crypto?.randomUUID === "function"
            ? crypto.randomUUID()
            : `arcpeek-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        link.dataset.arcpeekSourceToken = token;
      }
      return link.dataset.arcpeekSourceToken;
    }

    #getPeekSourceElement(sourceToken) {
      if (!sourceToken) return null;
      if (
        this.#hiddenPeekSourceToken === sourceToken &&
        this.#hiddenPeekSourceLink?.isConnected
      ) {
        return this.#hiddenPeekSourceLink;
      }
      return document.querySelector(
        `[data-arcpeek-source-token="${sourceToken}"]`
      );
    }

    #setPeekSourceLinkVisibility(sourceToken, hidden) {
      if (!sourceToken) return;
      const link = this.#getPeekSourceElement(sourceToken);
      if (!link) return;

      if (hidden) {
        if (
          this.#hiddenPeekSourceLink &&
          this.#hiddenPeekSourceLink !== link
        ) {
          this.#restorePeekSourceLink();
        }
        link.classList.add("arcpeek-source-hidden");
        this.#hiddenPeekSourceLink = link;
        this.#hiddenPeekSourceToken = sourceToken;
        return;
      }

      link.classList.remove("arcpeek-source-hidden");
      if (this.#hiddenPeekSourceToken === sourceToken) {
        this.#hiddenPeekSourceLink = null;
        this.#hiddenPeekSourceToken = null;
      }
    }

    #restorePeekSourceLink() {
      if (this.#hiddenPeekSourceLink?.isConnected) {
        this.#hiddenPeekSourceLink.classList.remove("arcpeek-source-hidden");
      }
      this.#hiddenPeekSourceLink = null;
      this.#hiddenPeekSourceToken = null;
    }

    #getPeekSourceRect(sourceToken) {
      const link = this.#getPeekSourceElement(sourceToken);
      const rect = link?.getBoundingClientRect?.();
      if (!rect?.width || !rect?.height) return null;
      return {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };
    }

    #recordLinkSnapshot(event, link = this.#getLinkElement(event)) {
      if (!link) return null;

      const recordTarget = this.#getEventRecordTarget(event);
      const rect = this.#getPreviewRect(recordTarget, link);
      if (!rect) return null;
      const linkRect = link.getBoundingClientRect();
      const targetRect =
        recordTarget && typeof recordTarget.getBoundingClientRect === "function"
          ? recordTarget.getBoundingClientRect()
          : null;
      const sourceElement =
        targetRect &&
        targetRect.width * targetRect.height > linkRect.width * linkRect.height
          ? recordTarget
          : link;

      const visualViewport = window.visualViewport;
      const computed = window.getComputedStyle(link);
      const parentComputed = window.getComputedStyle(link.parentElement || link);
      const sourceToken = this.#ensurePeekSourceToken(sourceElement);
      const snapshot = {
        href: link.href,
        sourceToken,
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
          sourceToken: rect.sourceToken,
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
                    position: relative;
                    transform-origin: center center;
                    transform:
                        translateY(calc(var(--peek-hold-depth, 0) * 3px))
                        scaleX(calc(1 - var(--peek-hold-depth, 0) * 0.1))
                        scaleY(calc(1 - var(--peek-hold-depth, 0) * 0.1));
                    opacity: calc(1 - var(--peek-hold-depth, 0) * 0.08);
                    transition:
                        transform 55ms linear,
                        opacity 55ms linear;
                }

                .arcpeek-source-hidden {
                    opacity: 0 !important;
                    transition: opacity 120ms linear !important;
                    pointer-events: none !important;
                }
            `;
      const mountStyle = () => {
        if (!this.#styleElement || this.#styleElement.isConnected) return;
        const styleHost = document.head || document.documentElement;
        if (!styleHost) return;
        styleHost.appendChild(this.#styleElement);
      };

      mountStyle();
      if (!this.#styleElement.isConnected) {
        document.addEventListener("DOMContentLoaded", mountStyle, {
          once: true,
          signal: this.#abortController.signal,
        });
      }
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

  function bootstrapPeekMod() {
    if (window.__arcPeekInitialized) return true;
    const browser = document.getElementById("browser");
    if (!browser) return false;
    window.__arcPeekInitialized = true;
    new PeekMod();
    return true;
  }

  if (!bootstrapPeekMod()) {
    const observerTarget = document.documentElement || document;
    const observer = new MutationObserver(() => {
      if (bootstrapPeekMod()) {
        observer.disconnect();
      }
    });

    observer.observe(observerTarget, { childList: true, subtree: true });

    let rafAttempts = 0;
    const retryBootstrap = () => {
      if (bootstrapPeekMod()) {
        observer.disconnect();
        return;
      }
      if (rafAttempts++ < 120) {
        window.requestAnimationFrame(retryBootstrap);
      }
    };
    window.requestAnimationFrame(retryBootstrap);
  }
})();
