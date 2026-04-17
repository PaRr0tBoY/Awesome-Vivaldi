// ==UserScript==
// @name         Arc Peek
// @description  Opens links in a peek panel by holding the middle/right mouse button or modifier-clicking links.
// @requirement  ArcPeek.css
// @version      2026.4.17
// @author       biruktes, tam710562, oudstand, PaRr0tBoY
// @website      https://forum.vivaldi.net/post/897615
// ==/UserScript==

(() => {
  // =========================
  // Trigger Config
  // =========================
  const ICON_CONFIG = {
    // Modifier keys that allow left click to open Peek.
    // Available values: "alt", "shift", "ctrl", "meta"
    // Examples:
    // ["alt"] => Alt + click opens Peek
    // ["shift"] => Shift + click opens Peek
    // ["meta"] => Command (macOS) / Windows key + click opens Peek
    // ["ctrl", "shift"] => Ctrl + click OR Shift + click both open Peek
    // [] or "none" => disable modifier + click opening
    clickOpenModifiers: ["alt"],

    // Long-press trigger buttons.
    // Available values: "middle", "right"
    // Examples:
    // ["right"] => only right-button long press opens Peek
    // ["middle"] => only middle-button long press opens Peek
    // ["middle", "right"] => middle and right long press both open Peek
    // [] or "none" => disable long-press open entirely
    longPressButtons: ["middle"],

    // How long the button must be held before Peek opens, in milliseconds.
    // Example: 400
    longPressHoldTime: 400,

    // Delay before the hold feedback animation starts, in milliseconds.
    // Example: 200
    longPressHoldDelay: 200,

    // Auto-open rules for normal left click on links.
    // Available values:
    // "*.baidu.com" => any matching hostname auto-opens Peek
    // "example.com" => exact hostname match auto-opens Peek
    // "pin" => all links inside pinned tabs auto-open Peek
    // Examples:
    // ["pin"] => only pinned tabs auto-open Peek
    // ["pin", "*.baidu.com"] => pinned tabs and all baidu subdomains auto-open Peek
    // [] => disable auto-open
    // The list can be long:
    // autoOpenList: [
    //   "pin",
    //   "*.baidu.com",
    //   "*.google.com",
    //   "*.bilibili.com",
    //   "*.x.com",
    // ],
    autoOpenList: [
      "pin",
      "*.google.com",
    ],
  };

  // =========================
  // Visual Config
  // =========================
  const PEEK_FOREGROUND_CONFIG = {
    // Foreground blank layer shown while the webview loads behind it.
    // Available values:
    // "default" => light/dark blank color that follows system appearance
    // "theme" => uses Vivaldi theme color var(--colorBgFaded)
    mode: "theme",
  };

  const PEEK_BACKGROUND_CONFIG = {
    // Whether the background webpage should scale/sink while Peek is open.
    // true => add body.peek-open and apply the CSS effect
    // false => keep the background webpage static
    scaleBackgroundPage: true,
  };

  // =========================
  // Debug Config
  // =========================
  const PEEK_DEBUG_CONFIG = {
    // Log candidate coordinate systems during open/close for auto-hide debugging.
    logCoordinateSystems: false,
    // Log sourceToken -> live rect request/response path.
    logSourceRectRequests: false,
    // Log split-view source rect mapping diagnostics.
    logSplitRectDiagnostics: false,
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
      webviewRevealSettleMs: 120,
      webviewRevealSettleMsWindows: 220,
      previewCacheLimit: 48,
      previewCacheTtlMs: 10 * 60 * 1000,
      lastRecordedLinkTtlMs: 2000,
    });
    webviews = new Map();
    previewCache = new Map();
    previewCaptureTasks = new Map();
    lastRecordedLinkData = null;
    closeShortcutGuard = null;
    iconUtils = new IconUtils();
    READER_VIEW_URL =
      "https://app.web-highlights.com/reader/open-website-in-reader-mode?url=";

    constructor() {
      this.hasPeekCSS = this.checkPeekCSSSupport();
      this.peekLayoutSyncQueued = false;
      this.peekLayoutObserver = null;
      this.peekResizeObserver = null;
      this.registerPeekCloseShortcuts();
      this.registerPeekCloseGuard();
      this.initializePeekLayoutTracking();

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

    shouldScaleBackgroundPage() {
      return this.hasPeekCSS && PEEK_BACKGROUND_CONFIG.scaleBackgroundPage;
    }

    rectToPlainObject(rect) {
      if (!rect) return null;
      return {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        right:
          typeof rect.right === "number"
            ? Math.round(rect.right)
            : Math.round(rect.left + rect.width),
        bottom:
          typeof rect.bottom === "number"
            ? Math.round(rect.bottom)
            : Math.round(rect.top + rect.height),
      };
    }

    getCoordinateSystemSnapshot() {
      const candidates = {
        browser: document.getElementById("browser"),
        main: document.getElementById("main"),
        inner: document.querySelector("#main > .inner"),
        webviewContainer: document.getElementById("webview-container"),
        webpageStack: document.getElementById("webpage-stack"),
        activeWebpageView: document.querySelector(".active.visible.webpageview"),
      };

      return Object.fromEntries(
        Object.entries(candidates).map(([key, element]) => [
          key,
          this.rectToPlainObject(element?.getBoundingClientRect?.()),
        ])
      );
    }

    logCoordinateSystems(label, extra = {}) {
      if (!PEEK_DEBUG_CONFIG.logCoordinateSystems) return;

      const payload = {
        autoHideRootClass:
          document.querySelector("#app > div")?.className || null,
        viewportRect: this.getPeekViewportRect(),
        candidates: this.getCoordinateSystemSnapshot(),
        ...extra,
      };

      console.groupCollapsed(`[ArcPeek] ${label}`);
      console.log(payload);
      console.groupEnd();
    }

    logSourceRectRequest(label, extra = {}) {
      if (!PEEK_DEBUG_CONFIG.logSourceRectRequests) return;
      console.groupCollapsed(`[ArcPeek] source-rect ${label}`);
      console.log(extra);
      console.groupEnd();
    }

    logSplitRectDiagnostic(label, payload = {}) {
      if (!PEEK_DEBUG_CONFIG.logSplitRectDiagnostics) return;
      console.groupCollapsed(`[ArcPeek] split-rect ${label}`);
      console.log(payload);
      console.groupEnd();
    }

    initializePeekLayoutTracking() {
      const queueSync = () => this.queuePeekLayoutSync();

      this.peekResizeObserver = new ResizeObserver(queueSync);
      const webviewContainer = document.getElementById("webview-container");
      if (webviewContainer) {
        this.peekResizeObserver.observe(webviewContainer);
      }

      this.peekLayoutObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          const target = mutation.target;
          if (
            target?.id === "webview-container" ||
            target?.id === "browser" ||
            target?.classList?.contains?.("auto-hide-wrapper") ||
            target?.classList?.contains?.("auto-hide") ||
            target?.classList?.contains?.("auto-hide-off")
          ) {
            queueSync();
            return;
          }
        }
      });

      this.peekLayoutObserver.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "style"],
      });

      window.addEventListener("resize", queueSync);
      window.visualViewport?.addEventListener("resize", queueSync);
      document.addEventListener("transitionrun", queueSync, true);
      document.addEventListener("transitionend", queueSync, true);
    }

    queuePeekLayoutSync() {
      if (this.peekLayoutSyncQueued) return;
      this.peekLayoutSyncQueued = true;
      requestAnimationFrame(() => {
        this.peekLayoutSyncQueued = false;
        this.syncOpenPeekLayouts();
      });
    }

    getOwningTabId(data) {
      const ownerTabId = Number(data?.ownerTabId);
      if (Number.isFinite(ownerTabId) && ownerTabId > 0) return ownerTabId;
      const sourceTabId = Number(data?.tabId);
      if (Number.isFinite(sourceTabId) && sourceTabId > 0) return sourceTabId;
      return null;
    }

    isPeekVisibleForCurrentTab(data) {
      const ownerTabId = this.getOwningTabId(data);
      if (!Number.isFinite(ownerTabId) || ownerTabId <= 0) return true;
      return this.getActivePageTabId() === ownerTabId;
    }

    shouldCountPeekForBackdrop(data) {
      if (!this.isPeekVisibleForCurrentTab(data)) return false;
      if (data?.isDisposing) return false;
      if (data?.closingMode) return false;
      return true;
    }

    updatePeekTabVisibility() {
      let hasVisiblePeek = false;
      for (const data of this.webviews.values()) {
        const container = data?.divContainer;
        if (!container?.isConnected) continue;
        const isVisible = this.isPeekVisibleForCurrentTab(data);
        container.style.display = isVisible ? "" : "none";
        container.setAttribute("aria-hidden", isVisible ? "false" : "true");
        if (this.shouldCountPeekForBackdrop(data)) hasVisiblePeek = true;
      }

      if (this.hasPeekCSS) {
        document.body.classList.toggle(
          "peek-open",
          this.shouldScaleBackgroundPage() && hasVisiblePeek
        );
      }
    }

    syncOpenPeekLayouts() {
      this.updatePeekTabVisibility();
      this.webviews.forEach((data, webviewId) => {
        if (!data || data.isDisposing || data.closingMode) return;
        if (!this.isPeekVisibleForCurrentTab(data)) return;
        this.syncPeekLayout(data, webviewId);
      });
    }

    syncPeekLayout(data, webviewId = "") {
      const peekContainer = data?.divContainer;
      const peekPanel = peekContainer?.querySelector?.(":scope > .peek-panel");
      if (!peekContainer?.isConnected || !peekPanel?.isConnected) return;

      const activeWebview = this.getActivePageWebview();
      const viewportRect = this.getPeekViewportRect(activeWebview);
      if (!viewportRect?.width || !viewportRect?.height) return;

      const targetWidth = viewportRect.width * 0.8;
      const targetHeight = viewportRect.height;
      const targetLeft = (viewportRect.width - targetWidth) / 2;
      const targetTop = 0;

      peekContainer.style.left = `${viewportRect.left}px`;
      peekContainer.style.top = `${viewportRect.top}px`;
      peekContainer.style.width = `${viewportRect.width}px`;
      peekContainer.style.height = `${viewportRect.height}px`;
      peekContainer.style.right = "auto";
      peekContainer.style.bottom = "auto";

      if (peekPanel.getAttribute("data-has-finished-animation") === "true") {
        this.releasePeekPanelLayout(peekPanel);
        return;
      }

      peekPanel.style.width = `${targetWidth}px`;
      peekPanel.style.height = `${targetHeight}px`;
      peekPanel.style.left = `${targetLeft}px`;
      peekPanel.style.top = `${targetTop}px`;
      peekPanel.style.setProperty("--end-width", `${targetWidth}px`);
      peekPanel.style.setProperty("--end-height", `${targetHeight}px`);

      if (data.openingState === "finished") {
        const panelRect = {
          left: viewportRect.left + targetLeft,
          top: viewportRect.top + targetTop,
          width: targetWidth,
          height: targetHeight,
          right: viewportRect.left + targetLeft + targetWidth,
        };
        peekContainer.style.setProperty("--peek-panel-top", `${panelRect.top}px`);
        peekContainer.style.setProperty("--peek-panel-right", `${panelRect.right}px`);

        const backdropOriginX = panelRect.left + panelRect.width / 2;
        const backdropOriginY = panelRect.top + Math.min(panelRect.height * 0.18, 96);
        peekContainer.style.setProperty("--peek-backdrop-origin-x", `${backdropOriginX}px`);
        peekContainer.style.setProperty("--peek-backdrop-origin-y", `${backdropOriginY}px`);
      }
    }

    getWebviewRevealSettleDelay() {
      const isWindows =
        navigator.userAgentData?.platform === "Windows" ||
        /Windows/i.test(navigator.platform || "");
      return isWindows
        ? this.ARC_CONFIG.webviewRevealSettleMsWindows
        : this.ARC_CONFIG.webviewRevealSettleMs;
    }

    getPeekForegroundBackground() {
      if (PEEK_FOREGROUND_CONFIG.mode === "theme") {
        return "var(--colorBg)";
      }

      const isDarkMode = window.matchMedia?.(
        "(prefers-color-scheme: dark)"
      )?.matches;
      return isDarkMode ? "rgb(28, 28, 30)" : "rgb(247, 247, 248)";
    }

    getPanelPointerBlockerTarget() {
      return document.querySelector(
        "#panels-container, .panel-group, .panel.webpanel, .webpanel-stack, .webpanel-content"
      );
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
     * Cleans up orphaned DOM nodes and refreshes per-tab visibility.
     */
    reconcilePeeks() {
      for (const [id, data] of this.webviews.entries()) {
        if (!data.divContainer || !document.body.contains(data.divContainer)) {
          this.disposePeek(id, { animated: false, closeRuntimeTab: false, force: true });
        }
      }
      this.updatePeekTabVisibility();
    }

    /**
     * Unified destruction entry point for all peeks.
     */
    async disposePeek(webviewId, options = {}) {
      const { animated = true, closeRuntimeTab = true, force = false } = options;
      const data = this.webviews.get(webviewId);
      
      if (!data) return;
      // Always clean up window-level backdrop listeners before the isDisposing guard.
      // If armBackdropClose fires during a closing animation (isDisposing=true), its
      // window.click/pointerup/mouseup listeners must still be removed; otherwise they
      // leak permanently and block all subsequent click events (including Vivaldi UI buttons).
      if (data.backdropCleanup) {
        data.backdropCleanup();
        data.backdropCleanup = null;
      }
      if (data.isDisposing && !force) return;
      data.isDisposing = true;

      Object.values(data.timers || {}).forEach(clearTimeout);

      if (data.tabCloseListener) {
        chrome.tabs.onRemoved.removeListener(data.tabCloseListener);
      }
      if (data.panelPointerBlocker && data.fromPanel) {
        (
          data.panelPointerBlockerTarget ||
          document.querySelector("#panels-container")
        )?.removeEventListener("pointerdown", data.panelPointerBlocker, true);
      }
      // backdropCleanup already called above; this is now a no-op but kept for safety.
      if (data.backdropCleanup) {
        data.backdropCleanup();
      }

      const container = data.divContainer;
      const panel = container?.querySelector(".peek-panel");
      const sourceRect = animated
        ? await this.getPeekClosingSourceRect(data)
        : null;
      this.logCoordinateSystems("close", {
        webviewId,
        animated,
        fromPanel: data.fromPanel,
        linkRect: data.linkRect || null,
        openingSourceRect: data.openingSourceRect || null,
        closingSourceRect: sourceRect || null,
      });

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
        this.updatePeekTabVisibility();
        this.clearCloseShortcutGuard();

        if (this.webviews.size === 0) {
          chrome.runtime.sendMessage({ type: "peek-closed" });
        }
      };

      if (!animated || !container || !panel || !sourceRect) {
        await finishCleanup();
        return;
      }

      this.lockPeekPanelLayout(panel);
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

      let closingHandoffPromise = Promise.resolve();

      if (data.closingMode === "preview") {
        let previewLayer = panel.querySelector(":scope > .peek-source-preview");
        if (!previewLayer) {
          previewLayer = this.mountPreviewLayer(
            panel,
            data.previewAssetUrl,
            data.linkRect
          );
          if (previewLayer) {
            previewLayer.style.opacity = "0";
            previewLayer.style.visibility = "hidden";
          }
        }
        await this.waitForPreviewLayer(previewLayer);
        await this.flushPreviewLayerForClosing(panel, previewLayer);
        this.setPreviewAnimationState(panel, false);
        this.preparePreviewLayerForClosing(panel);
        this.hideSidebarControls(panel.querySelector(".peek-sidebar-controls"));
        await this.waitForAnimationFrames(1);
        const contentFadeDurationRatio = 0.16;
        const contentFadeOut = this.animatePeekContentOut(panel, {
          delayRatio: 0,
          durationRatio: contentFadeDurationRatio,
          hideOnFinish: false,
        });
        const previewFadeDelayMs = Math.round(
          this.getGlanceDuration("closing") * contentFadeDurationRatio * 0.2
        );
        const previewFadeIn = this.animatePreviewLayerIn(panel, {
          delayMs: previewFadeDelayMs,
        });
        this.setPreviewClosingState(panel, true);
        await this.waitForAnimationFrames(1);
        this.setPreviewClosingMatteState(panel, true);
        closingHandoffPromise = Promise.allSettled([
          contentFadeOut,
          previewFadeIn,
        ]).then(() => {
          if (!panel?.isConnected) return;
          this.suppressPeekContentForClosing(panel);
        });
      }

      this.updatePeekTabVisibility();

      try {
        await Promise.allSettled([
          this.animatePeekMotion(panel, "closing", sourceRect),
          closingHandoffPromise,
        ]);
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

    lockPeekPanelLayout(peekPanel) {
      if (!peekPanel?.isConnected) return null;

      const containerRect =
        peekPanel.closest(".peek-container")?.getBoundingClientRect?.();
      const panelRect = peekPanel.getBoundingClientRect?.();
      if (!containerRect || !panelRect) return null;

      peekPanel.removeAttribute("data-has-finished-animation");
      peekPanel.style.position = "absolute";
      peekPanel.style.left = `${panelRect.left - containerRect.left}px`;
      peekPanel.style.top = `${panelRect.top - containerRect.top}px`;
      peekPanel.style.width = `${panelRect.width}px`;
      peekPanel.style.height = `${panelRect.height}px`;
      peekPanel.style.right = "auto";
      peekPanel.style.bottom = "auto";
      peekPanel.style.margin = "0";
      peekPanel.style.transform = "none";
      return { containerRect, panelRect };
    }

    releasePeekPanelLayout(peekPanel) {
      if (!peekPanel) return;

      peekPanel.style.position = "";
      peekPanel.style.left = "";
      peekPanel.style.top = "";
      peekPanel.style.width = "";
      peekPanel.style.height = "";
      peekPanel.style.right = "";
      peekPanel.style.bottom = "";
      peekPanel.style.margin = "";
      peekPanel.style.transform = "";
      peekPanel.style.transition = "";
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
        const matchedPeek = webviewValues.findLast(
          (_data) => this.getOwningTabId(_data) === tabId
        );
        if (matchedPeek) {
          webviewData = matchedPeek;
        }
      }

      if (webviewData) {
        const webviewId = Array.from(this.webviews.entries()).find(
          ([_, data]) => data === webviewData
        )?.[0];
        
        if (webviewId) {
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

    removeTab(tabIds) {
      return new Promise((resolve) => chrome.tabs.remove(tabIds, resolve));
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
      if (effectiveLinkRect && !fromPanel) {
        effectiveLinkRect.sourceViewportHint =
          effectiveLinkRect.sourceViewportHint ||
          this.createSourceViewportHint(
            Number(effectiveLinkRect.sourceTabId) || Number(meta?.sourceTabId) || null
          );
      }
      const previewCacheKey = this.getPreviewCacheKey(linkUrl, effectiveLinkRect);
      const previewAsset = this.getCachedPreviewAsset(previewCacheKey);
      const previewCapturePromise =
        !previewAsset && effectiveLinkRect && !fromPanel
          ? this.startPreviewCapture(previewCacheKey, effectiveLinkRect, fromPanel)
          : null;

      const activeWebview = document.querySelector(".active.visible.webpageview webview");
      const peekViewportRect = this.getPeekViewportRect(activeWebview);
      const metaSourceTabId = Number(meta?.sourceTabId);
      const rectSourceTabId = Number(linkRect?.sourceTabId);
      const activeTabId = Number(activeWebview?.tab_id);
      const sourceTabId =
        Number.isFinite(metaSourceTabId) && metaSourceTabId > 0
          ? metaSourceTabId
          : Number.isFinite(rectSourceTabId) && rectSourceTabId > 0
            ? rectSourceTabId
          : Number.isFinite(activeTabId) && activeTabId > 0
            ? activeTabId
            : null;
      const ownerTabId = sourceTabId;
      const tabId =
        !fromPanel && Number.isFinite(sourceTabId) && sourceTabId > 0
          ? sourceTabId
          : null;

      if (ownerTabId !== null) {
        for (const [existingId, existingData] of this.webviews.entries()) {
          if (this.getOwningTabId(existingData) !== ownerTabId) continue;
          await this.disposePeek(existingId, {
            animated: false,
            closeRuntimeTab: true,
          });
        }
      }

      this.webviews.set(webviewId, {
        divContainer: peekContainer,
        webview: webview,
        fromPanel: fromPanel,
        ownerTabId: ownerTabId,
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
        panelPointerBlockerTarget: null,
        tabCloseListener: null,
        backdropCleanup: null,
        previewCacheKey: previewCacheKey,
        previewCapturePromise,
        initialUrl: pendingUrl,
        currentUrl: pendingUrl,
        navigationHistory: this.isUsablePeekUrl(pendingUrl) ? [String(pendingUrl).trim()] : [],
        navigationIndex: this.isUsablePeekUrl(pendingUrl) ? 0 : -1,
        openingMode: previewAsset?.dataUrl ? "preview" : "live",
        openingState: "starting",
        pageStable: false,
        webviewRevealPending: false,
        webviewRevealed: false,
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
        const targetLeft = (peekViewportRect.width - targetWidth) / 2;
        const targetTop = (peekViewportRect.height - targetHeight) / 2;

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
      this.hideSidebarControls(sidebarControls);

      webview.id = webviewId;
      webview.tab_id = `${webviewId}tabId`;
      webview.setAttribute("src", "about:blank");
      webview.dataset.pendingSrc = pendingUrl;

      const updateCurrentPeekUrl = (event, options = {}) => {
        const { fallbackToWebviewSrc = false, requireTopLevel = false } = options;
        if (requireTopLevel && event?.isTopLevel !== true) return;
        if (event?.isTopLevel === false) return;

        const eventUrl = String(event?.url || "").trim();
        const nextUrl = eventUrl || (fallbackToWebviewSrc ? String(webview.src || "").trim() : "");
        if (this.isUsablePeekUrl(nextUrl)) {
          this.recordPeekNavigation(webviewId, nextUrl);
        }
      };
      webview.addEventListener("loadstart", (event) => {
        void event;
        this.syncPeekNavigationControls(webviewId);
        const input = document.getElementById(`input-${webview.id}`);
        if (input !== null) {
          input.value = webview.src;
        }
      });
      webview.addEventListener("loadcommit", (event) => {
        updateCurrentPeekUrl(event, { requireTopLevel: true });
        this.syncPeekNavigationControls(webviewId);
      });
      ["did-navigate", "did-navigate-in-page"].forEach((eventName) => {
        webview.addEventListener(eventName, (event) => {
          updateCurrentPeekUrl(event);
          this.syncPeekNavigationControls(webviewId);
        });
      });
      webview.addEventListener("loadstop", (event) => {
        updateCurrentPeekUrl(event, { fallbackToWebviewSrc: true });
        this.syncPeekNavigationControls(webviewId);
      });
      webview.addEventListener("newwindow", (event) => {
        const nextUrl = String(
          event?.url || event?.targetUrl || event?.src || ""
        ).trim();
        if (!nextUrl || nextUrl === "about:blank") return;

        event.preventDefault?.();
        this.navigatePeekToUrl(webviewId, nextUrl);
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
        const panelPointerBlockerTarget = this.getPanelPointerBlockerTarget();
        panelPointerBlockerTarget?.addEventListener(
          "pointerdown",
          stopEvent,
          true
        );
        this.webviews.get(webviewId).panelPointerBlocker = stopEvent;
        this.webviews.get(webviewId).panelPointerBlockerTarget =
          panelPointerBlockerTarget;
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
        // Guard: if the peek is already being disposed (e.g. closing animation in progress),
        // do not arm the backdrop-close path.  Doing so would register a window-level
        // click-swallow listener that disposePeek's early-return (isDisposing) would skip,
        // leaving it permanently attached and blocking all subsequent click events.
        const peekData = this.webviews.get(webviewId);
        if (!peekData || peekData.isDisposing) return;
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
        effectiveLinkRect,
        { tabId }
      );
      this.webviews.get(webviewId).openingSourceRect = geometry?.sourceRect || null;
      this.webviews.get(webviewId).sourceRect = geometry?.sourceRect || null;
      this.logCoordinateSystems("open", {
        webviewId,
        fromPanel,
        ownerTabId,
        linkRect: effectiveLinkRect || null,
        openingSourceRect: geometry?.sourceRect || null,
      });
      this.setPeekSourceLinkVisibility(effectiveLinkRect?.sourceToken, true);
      this.mountPreviewLayer(
        peekPanel,
        previewAsset?.dataUrl || null,
        effectiveLinkRect
      );
      this.preparePeekContentForPreview(peekPanel);
      this.setPeekWebviewVisibility(peekPanel, false);
      this.armPeekWebviewReveal(peekPanel, webviewId);
      if (previewAsset?.dataUrl) {
        this.setPreviewAnimationState(peekPanel, true);
      }
      
      peekContainer.style.setProperty("--peek-backdrop-duration", `${this.getBackdropDuration("opening")}ms`);
      
      requestAnimationFrame(() => {
        peekContainer.classList.remove("pre-open");
        peekContainer.classList.add("open");
      });
      
      const sourceRect =
        this.webviews.get(webviewId).sourceRect ||
        this.resolveSourceRect(effectiveLinkRect, {
          tabId,
        });

      this.webviews.get(webviewId).openingState = "animating";
      this.startPeekNavigation(webview, webviewId);
      if (previewAsset?.dataUrl) {
        this.animatePreviewImageOut(peekPanel, {
          delayRatio: 0,
          durationRatio: 0.28,
        });
      }
      
      this.animatePeekMotion(peekPanel, "opening", sourceRect)
        .then(() => {
          this.finalizePeekOpening(peekPanel, webviewId);
        })
        .catch(() => {
          this.finalizePeekOpening(peekPanel, webviewId);
        });
        
      this.updatePeekTabVisibility();
    }

    getActivePageWebview() {
      return document.querySelector(".active.visible.webpageview webview");
    }

    getVisiblePageWebviews() {
      return Array.from(
        document.querySelectorAll(".visible.webpageview webview")
      ).filter((webview) => webview?.isConnected && !webview.closest?.(".peek-panel"));
    }

    isSplitViewActive() {
      return this.getVisiblePageWebviews().length > 1;
    }

    getPageWebviewByTabId(tabId) {
      if (!Number.isFinite(tabId) || tabId <= 0) return null;
      const webview = document.querySelector(`webview[tab_id="${tabId}"]`);
      if (!webview?.isConnected || webview.closest?.(".peek-panel")) return null;
      return webview;
    }

    getPageViewportRectByTabId(tabId) {
      const sourceWebview = this.getPageWebviewByTabId(tabId);
      const rect = sourceWebview?.getBoundingClientRect?.();
      if (!rect?.width || !rect?.height) return null;
      return {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.max(1, Math.round(rect.width)),
        height: Math.max(1, Math.round(rect.height)),
      };
    }

    getStableSourceViewportRect() {
      const stableRect =
        document.getElementById("webview-container")?.getBoundingClientRect?.() ||
        this.getPeekViewportRect();

      if (!stableRect?.width || !stableRect?.height) return null;

      return {
        left: Math.round(stableRect.left),
        top: Math.round(stableRect.top),
        width: Math.max(1, Math.round(stableRect.width)),
        height: Math.max(1, Math.round(stableRect.height)),
      };
    }

    createSourceViewportHint(tabId) {
      const sourceRect = this.getPageViewportRectByTabId(Number(tabId));
      const stableRect = this.getStableSourceViewportRect();
      if (!sourceRect || !stableRect) return null;
      if (!stableRect.width || !stableRect.height) return null;

      return {
        stableRect,
        sourceRect,
        leftRatio: (sourceRect.left - stableRect.left) / stableRect.width,
        topRatio: (sourceRect.top - stableRect.top) / stableRect.height,
        widthRatio: sourceRect.width / stableRect.width,
        heightRatio: sourceRect.height / stableRect.height,
      };
    }

    projectSourceViewportHintToStableRect(viewportHint, stableRect) {
      if (!viewportHint || !stableRect?.width || !stableRect?.height) return null;
      return {
        left: Math.round(stableRect.left + stableRect.width * viewportHint.leftRatio),
        top: Math.round(stableRect.top + stableRect.height * viewportHint.topRatio),
        width: Math.max(1, Math.round(stableRect.width * viewportHint.widthRatio)),
        height: Math.max(1, Math.round(stableRect.height * viewportHint.heightRatio)),
      };
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
      return !!this.getPageViewportRectByTabId(sourceTabId);
    }

    async getPeekClosingSourceRect(data) {
      if (!data || data.disableSourceCloseAnimation) return null;
      if (!this.isPeekOnOriginalSourceTab(data)) return null;

      const shouldPreferStableContainer = this.shouldScaleBackgroundPage();
      const currentSourceViewportRect = this.getPeekSourceViewportRect({
        preferStableContainer: shouldPreferStableContainer,
        tabId: Number(data?.tabId) || null,
      });
      const recordedViewportWidth = Math.round(data.linkRect?.viewportWidth || 0);
      const recordedViewportHeight = Math.round(data.linkRect?.viewportHeight || 0);
      const viewportChanged =
        !!currentSourceViewportRect &&
        (
          Math.abs(currentSourceViewportRect.width - recordedViewportWidth) > 1 ||
          Math.abs(currentSourceViewportRect.height - recordedViewportHeight) > 1
        );

      const liveLinkRect = await this.requestSourceLinkRect(
        data.sourceToken,
        Number(data?.tabId) || null
      );
      if (liveLinkRect) {
        const resolvedLiveRect = this.resolveSourceRect(liveLinkRect, {
          preferStableContainer: shouldPreferStableContainer,
          tabId: Number(data?.tabId) || null,
          viewportHint: data?.linkRect?.sourceViewportHint || null,
        });
        if (PEEK_DEBUG_CONFIG.logSplitRectDiagnostics) {
          this.logSplitRectDiagnostic("close-live", {
            webviewId: data?.webview?.id || null,
            tabId: Number(data?.tabId) || null,
            shouldPreferStableContainer,
            currentSourceViewportRect,
            liveLinkRect,
            resolvedLiveRect,
          });
        }
        return resolvedLiveRect;
      }

      const originalResolvedRect = this.resolveSourceRect(data.linkRect, {
        preferStableContainer: shouldPreferStableContainer,
        tabId: Number(data?.tabId) || null,
        viewportHint: data?.linkRect?.sourceViewportHint || null,
      });
      if (PEEK_DEBUG_CONFIG.logSplitRectDiagnostics) {
        this.logSplitRectDiagnostic("close-fallback", {
          webviewId: data?.webview?.id || null,
          tabId: Number(data?.tabId) || null,
          shouldPreferStableContainer,
          currentSourceViewportRect,
          recordedLinkRect: data.linkRect || null,
          openingSourceRect: data.openingSourceRect || null,
          sourceRect: data.sourceRect || null,
          originalResolvedRect: originalResolvedRect || null,
          viewportChanged,
        });
      }
      if (originalResolvedRect?.width && originalResolvedRect?.height && !viewportChanged) {
        return originalResolvedRect;
      }

      return (
        data.openingSourceRect ||
        data.sourceRect ||
        this.resolveSourceRect(data.linkRect, {
          preferStableContainer: shouldPreferStableContainer,
          tabId: Number(data?.tabId) || null,
          viewportHint: data?.linkRect?.sourceViewportHint || null,
        })
      );
    }

    setPeekSourceLinkVisibility(sourceToken, hidden) {
      if (!sourceToken) return;
      chrome.runtime.sendMessage({
        type: "peek-source-link-state",
        sourceToken,
        hidden: !!hidden,
      });
    }

    requestSourceLinkRect(sourceToken, tabId = null) {
      if (!sourceToken) return Promise.resolve(null);

      return new Promise((resolve) => {
        const targetWebview =
          this.getPageWebviewByTabId(Number(tabId)) || this.getActivePageWebview();
        if (
          targetWebview &&
          typeof targetWebview.executeScript === "function"
        ) {
          const tokenLiteral = JSON.stringify(String(sourceToken));
          this.logSourceRectRequest("execute-script:request", {
            sourceToken,
            tabId:
              Number(targetWebview.getAttribute("tab_id") || targetWebview.tab_id || 0) ||
              null,
          });
          targetWebview.executeScript(
            {
              code: `(() => {
                const token = ${tokenLiteral};
                const element = document.querySelector('[data-arcpeek-source-token="' + token + '"]');
                if (!element) {
                  return { ok: false, reason: "not-found", viewportWidth: window.innerWidth, viewportHeight: window.innerHeight };
                }
                const rect = element.getBoundingClientRect();
                if (!rect || !rect.width || !rect.height) {
                  return {
                    ok: false,
                    reason: "empty-rect",
                    viewportWidth: window.innerWidth,
                    viewportHeight: window.innerHeight,
                    rect: rect
                      ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
                      : null,
                  };
                }
                return {
                  ok: true,
                  left: rect.left,
                  top: rect.top,
                  width: rect.width,
                  height: rect.height,
                  viewportWidth: window.innerWidth,
                  viewportHeight: window.innerHeight,
                  devicePixelRatio: window.devicePixelRatio,
                  visualViewportOffsetLeft: window.visualViewport?.offsetLeft || 0,
                  visualViewportOffsetTop: window.visualViewport?.offsetTop || 0,
                  visualViewportScale: window.visualViewport?.scale || 1,
                };
              })();`,
            },
            (results) => {
              if (chrome.runtime.lastError) {
                this.logSourceRectRequest("execute-script:error", {
                  sourceToken,
                  error: chrome.runtime.lastError.message,
                });
              } else {
                const result = Array.isArray(results) ? results[0] : results;
                this.logSourceRectRequest("execute-script:response", {
                  sourceToken,
                  result: result || null,
                });
                if (result?.ok && result.width && result.height) {
                  resolve({
                    ...result,
                    sourceToken,
                  });
                  return;
                }
              }

              this.logSourceRectRequest("request", {
                sourceToken,
                activeTabId: this.getActivePageTabId?.() || null,
                targetTabId: Number(tabId) || null,
              });
              chrome.runtime.sendMessage(
                {
                  type: "peek-source-rect-request",
                  sourceToken,
                },
                (response) => {
                  if (chrome.runtime.lastError) {
                    this.logSourceRectRequest("response:error", {
                      sourceToken,
                      error: chrome.runtime.lastError.message,
                    });
                    resolve(null);
                    return;
                  }

                  const rect = response?.rect;
                  if (!rect?.width || !rect?.height) {
                    this.logSourceRectRequest("response:empty", {
                      sourceToken,
                      response: response || null,
                    });
                    resolve(null);
                    return;
                  }

                  this.logSourceRectRequest("response:success", {
                    sourceToken,
                    rect,
                  });
                  resolve({
                    ...rect,
                    sourceToken,
                  });
                }
              );
            }
          );
          return;
        }

        this.logSourceRectRequest("request", {
          sourceToken,
          activeTabId: this.getActivePageTabId?.() || null,
        });
        chrome.runtime.sendMessage(
          {
            type: "peek-source-rect-request",
            sourceToken,
          },
          (response) => {
            if (chrome.runtime.lastError) {
              this.logSourceRectRequest("response:error", {
                sourceToken,
                error: chrome.runtime.lastError.message,
              });
              resolve(null);
              return;
            }

            const rect = response?.rect;
            if (!rect?.width || !rect?.height) {
              this.logSourceRectRequest("response:empty", {
                sourceToken,
                response: response || null,
              });
              resolve(null);
              return;
            }

            this.logSourceRectRequest("response:success", {
              sourceToken,
              rect,
            });
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
      const sourceRect = this.resolveSourceRect(linkRect, {
        tabId: Number(linkRect?.sourceTabId) || null,
      });
      if (PEEK_DEBUG_CONFIG.logSplitRectDiagnostics) {
        this.logSplitRectDiagnostic("capture-ui", {
          tabId: Number(linkRect?.sourceTabId) || null,
          linkRect: linkRect
            ? {
                left: Math.round(Number(linkRect.left) || 0),
                top: Math.round(Number(linkRect.top) || 0),
                width: Math.round(Number(linkRect.width) || 0),
                height: Math.round(Number(linkRect.height) || 0),
                viewportWidth: Math.round(Number(linkRect.viewportWidth) || 0),
                viewportHeight: Math.round(Number(linkRect.viewportHeight) || 0),
              }
            : null,
          resolvedSourceRect: sourceRect,
        });
      }
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

    getPeekSourceViewportRect({ preferStableContainer = false, tabId = null } = {}) {
      const sourceTabViewportRect = this.getPageViewportRectByTabId(Number(tabId));
      if (sourceTabViewportRect && this.isSplitViewActive()) {
        return sourceTabViewportRect;
      }

      if (preferStableContainer) {
        const stableRect = this.getStableSourceViewportRect();

        if (!stableRect?.width || !stableRect?.height) return null;
        return stableRect;
      }

      const activeWebpageView =
        document.querySelector(".active.visible.webpageview") ||
        document.getElementById("webpage-stack");
      const sourceRect =
        activeWebpageView?.getBoundingClientRect?.() ||
        this.getActivePageWebview()?.getBoundingClientRect?.() ||
        this.getPeekViewportRect();

      if (!sourceRect?.width || !sourceRect?.height) return null;

      return {
        left: Math.round(sourceRect.left),
        top: Math.round(sourceRect.top),
        width: Math.max(1, Math.round(sourceRect.width)),
        height: Math.max(1, Math.round(sourceRect.height)),
      };
    }

    resolveSourceRect(linkRect, options = {}) {
      if (!linkRect) return null;
      const tabId =
        Number(options?.tabId) ||
        Number(linkRect?.sourceTabId) ||
        null;
      const stableViewportRect = this.getStableSourceViewportRect();
      const viewportHint = options?.viewportHint || linkRect?.sourceViewportHint || null;
      const hintedViewportRect =
        options?.preferStableContainer && this.isSplitViewActive()
          ? this.projectSourceViewportHintToStableRect(viewportHint, stableViewportRect)
          : null;
      const viewportRect = this.getPeekSourceViewportRect({
        ...options,
        tabId,
      }) || hintedViewportRect;
      const chosenViewportRect = hintedViewportRect || viewportRect;
      if (!chosenViewportRect) return null;
      const recordedViewportWidth = Math.max(
        Number(linkRect.viewportWidth) || 0,
        1
      );
      const recordedViewportHeight = Math.max(
        Number(linkRect.viewportHeight) || 0,
        1
      );
      const scaleX = chosenViewportRect.width / recordedViewportWidth;
      const scaleY = chosenViewportRect.height / recordedViewportHeight;
      const width = Math.max((Number(linkRect.width) || 0) * scaleX, 1);
      const height = Math.max((Number(linkRect.height) || 0) * scaleY, 1);
      const left = (Number(linkRect.left) || 0) * scaleX;
      const top = (Number(linkRect.top) || 0) * scaleY;
      const resolvedRect = {
        left: Math.max(0, Math.round(chosenViewportRect.left + left)),
        top: Math.max(0, Math.round(chosenViewportRect.top + top)),
        width: Math.max(1, Math.round(width)),
        height: Math.max(1, Math.round(height)),
      };

      if (PEEK_DEBUG_CONFIG.logSplitRectDiagnostics) {
        this.logSplitRectDiagnostic("resolve", {
          tabId,
          preferStableContainer: !!options?.preferStableContainer,
          isSplitViewActive: this.isSplitViewActive(),
          linkRect: linkRect
            ? {
                sourceTabId: Number(linkRect.sourceTabId) || null,
                left: Math.round(Number(linkRect.left) || 0),
                top: Math.round(Number(linkRect.top) || 0),
                width: Math.round(Number(linkRect.width) || 0),
                height: Math.round(Number(linkRect.height) || 0),
                viewportWidth: Math.round(Number(linkRect.viewportWidth) || 0),
                viewportHeight: Math.round(Number(linkRect.viewportHeight) || 0),
              }
            : null,
          sourceWebviewRect: this.getPageViewportRectByTabId(tabId),
          stableViewportRect,
          sourceViewportHint: viewportHint || null,
          projectedViewportRect: hintedViewportRect,
          chosenViewportRect,
          scaleX: Number(scaleX.toFixed(4)),
          scaleY: Number(scaleY.toFixed(4)),
          resolvedRect,
        });
      }

      return resolvedRect;
    }

    applyPeekAnimationGeometry(peekContainer, peekPanel, linkRect, options = {}) {
      const finalRect = peekPanel.getBoundingClientRect();
      if (!finalRect.width || !finalRect.height) return;

      const sourceRect = this.resolveSourceRect(linkRect, options);
      const scaleX = sourceRect ? Math.min(Math.max(sourceRect.width / finalRect.width, 0.08), 1) : 0.92;
      const scaleY = sourceRect ? Math.min(Math.max(sourceRect.height / finalRect.height, 0.06), 1) : 0.9;
      const translateX = sourceRect ? sourceRect.left - finalRect.left : 0;
      const translateY = sourceRect ? sourceRect.top - finalRect.top : Math.min(-(finalRect.height * 0.42), -96);
      const sourceRadius = sourceRect ? Math.min(Math.max(sourceRect.height / 2, 8), 18) : 18;
      const backdropOriginX = sourceRect ? sourceRect.left + sourceRect.width / 2 : finalRect.left + finalRect.width / 2;
      const backdropOriginY = sourceRect ? sourceRect.top + sourceRect.height / 2 : finalRect.top + Math.min(finalRect.height * 0.18, 96);

      peekContainer.style.setProperty("--peek-panel-top", `${finalRect.top}px`);
      peekContainer.style.setProperty("--peek-panel-right", `${finalRect.right}px`);
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
      previewLayer.classList.toggle("has-source-preview", hasPreview);
      previewLayer.style.setProperty(
        "--preview-bg",
        this.getPeekForegroundBackground()
      );
      imageLayer.style.aspectRatio = `${previewWidth} / ${previewHeight}`;
      
      if (hasPreview) {
        imageLayer.src = sourcePreviewUrl;
        imageLayer.alt = "";
        imageLayer.decoding = "sync";
        imageLayer.draggable = false;
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
      peekPanel?.setAttribute("data-has-finished-animation", "true");
      this.releasePeekPanelLayout(peekPanel);
      this.setPreviewAnimationState(peekPanel, false);
      this.setPreviewClosingState(peekPanel, false);
      this.showSidebarControls(
        webviewId,
        peekPanel.querySelector(".peek-sidebar-controls")
      );
      this.maybeRevealPeekWebview(webviewId);
    }

    startPeekNavigation(webview, webviewId = "") {
      const pendingSrc = webview?.dataset?.pendingSrc;
      if (!webview || !pendingSrc) return;
      const data = this.webviews.get(webviewId);
      if (data && this.isUsablePeekUrl(pendingSrc)) {
        data.currentUrl = pendingSrc;
      }
      webview.setAttribute("src", pendingSrc);
      webview.src = pendingSrc;
      delete webview.dataset.pendingSrc;
    }

    setPeekWebviewVisibility(peekPanel, visible) {
      const webview = peekPanel?.querySelector("webview");
      if (!webview) return;
      webview.style.display = "";
      webview.style.opacity = visible ? "1" : "0";
      webview.style.visibility = visible ? "" : "hidden";
      webview.style.pointerEvents = visible ? "" : "none";
    }

    armPeekWebviewReveal(peekPanel, webviewId) {
      const data = this.webviews.get(webviewId);
      const webview = data?.webview;
      if (!peekPanel || !webview || !data) return;
      const markStable = () => {
        const current = this.webviews.get(webviewId);
        if (!current || current.isDisposing) return;
        current.pageStable = true;
        this.maybeRevealPeekWebview(webviewId);
      };

      webview.addEventListener("loadstop", markStable, { once: true });
    }

    maybeRevealPeekWebview(webviewId) {
      const data = this.webviews.get(webviewId);
      const peekPanel = data?.divContainer?.querySelector?.(":scope > .peek-panel");
      if (
        !data ||
        data.isDisposing ||
        data.closingMode ||
        data.webviewRevealPending ||
        data.webviewRevealed ||
        data.openingState !== "finished" ||
        !data.pageStable ||
        !peekPanel?.isConnected
      ) {
        return;
      }

      data.webviewRevealPending = true;
      Promise.resolve()
        .then(async () => {
          const settleDelay = this.getWebviewRevealSettleDelay();
          if (settleDelay > 0) {
            await new Promise((resolve) =>
              window.setTimeout(resolve, settleDelay)
            );
          }
          await this.waitForAnimationFrames(2);
          const current = this.webviews.get(webviewId);
          const currentPanel =
            current?.divContainer?.querySelector?.(":scope > .peek-panel");
          if (
            !current ||
            current.isDisposing ||
            current.closingMode ||
            current.webviewRevealed ||
            current.openingState !== "finished" ||
            !current.pageStable ||
            !currentPanel?.isConnected
          ) {
            return;
          }
          this.showPeekContent(currentPanel);
          this.setPeekWebviewVisibility(currentPanel, true);
          await this.fadeForegroundLayerOut(currentPanel);
          this.removePreviewLayer(currentPanel);
          current.webviewRevealed = true;
        })
        .finally(() => {
          const current = this.webviews.get(webviewId);
          if (current) {
            current.webviewRevealPending = false;
          }
        });
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
      { delayRatio = 0, durationRatio = 0, hideOnFinish = true } = {}
    ) {
      const peekContent = peekPanel?.querySelector(".peek-content");
      if (!peekContent || typeof peekContent.animate !== "function") {
        if (hideOnFinish) {
          this.hidePeekContent(peekPanel);
        } else {
          const webview = peekContent?.querySelector?.("webview");
          peekContent.style.opacity = "0";
          peekContent.style.pointerEvents = "none";
          if (webview) {
            webview.style.opacity = "0";
            webview.style.pointerEvents = "none";
          }
        }
        return Promise.resolve();
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
        if (hideOnFinish) {
          this.hidePeekContent(peekPanel);
        } else {
          const webview = peekContent.querySelector("webview");
          peekContent.style.opacity = "0";
          peekContent.style.pointerEvents = "none";
          if (webview) {
            webview.style.opacity = "0";
            webview.style.pointerEvents = "none";
          }
        }
        return Promise.resolve();
      }

      peekContent.getAnimations().forEach((animation) => animation.cancel());
      const animation = peekContent.animate([{ opacity: 1 }, { opacity: 0 }], {
        delay,
        duration: Math.max(1, duration),
        easing: "ease-out",
        fill: "forwards",
      });

      return animation.finished.then(() => {
        if (!peekPanel?.isConnected) return;
        peekContent.style.opacity = "0";
        peekContent.style.pointerEvents = "none";
        const webview = peekContent.querySelector("webview");
        if (webview) {
          webview.style.opacity = "0";
          webview.style.pointerEvents = "none";
        }
        if (hideOnFinish) {
          peekContent.style.display = "none";
        }
      }).catch(() => {});
    }

    animatePreviewImageOut(
      peekPanel,
      {
        delayRatio = this.ARC_CONFIG.previewFadeOutDelayRatio,
        durationRatio = this.ARC_CONFIG.previewFadeOutRatio,
      } = {}
    ) {
      const previewImage = peekPanel?.querySelector(
        ":scope > .peek-source-preview .peek-source-preview-image"
      );
      if (!previewImage) return;
      if (typeof previewImage.animate !== "function") {
        previewImage.style.opacity = "0";
        return;
      }

      previewImage.getAnimations?.().forEach((animation) => animation.cancel());
      previewImage.style.opacity = "1";
      const animation = previewImage.animate([{ opacity: 1 }, { opacity: 0 }], {
        delay: this.getGlanceDuration("opening") * delayRatio,
        duration: Math.max(
          1,
          this.getGlanceDuration("opening") * Math.max(durationRatio, 0)
        ),
        easing: "ease-out",
        fill: "forwards",
      });

      animation.finished.then(() => {
        if (!previewImage.isConnected) return;
        previewImage.style.opacity = "0";
      }).catch(() => {});
    }

    fadeForegroundLayerOut(peekPanel, durationMs = 140) {
      const previewLayer = peekPanel?.querySelector(":scope > .peek-source-preview");
      if (!previewLayer || typeof previewLayer.animate !== "function") {
        this.removePreviewLayer(peekPanel);
        return Promise.resolve();
      }

      previewLayer.getAnimations?.().forEach((animation) => animation.cancel());
      previewLayer.style.opacity = "1";
      const animation = previewLayer.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: Math.max(1, durationMs),
        easing: "ease-out",
        fill: "forwards",
      });

      return animation.finished.then(() => {
        if (!previewLayer.isConnected) return;
        previewLayer.style.opacity = "0";
      }).catch(() => {});
    }

    preparePreviewLayerForClosing(peekPanel) {
      const previewLayer = peekPanel?.querySelector(":scope > .peek-source-preview");
      if (!previewLayer) return;
      previewLayer.getAnimations?.().forEach((animation) => animation.cancel());
      const previewImage = previewLayer.querySelector(".peek-source-preview-image");
      previewImage?.getAnimations?.().forEach((animation) => animation.cancel());
      if (previewImage && previewLayer.classList.contains("has-source-preview")) {
        previewImage.style.opacity = "1";
      }
      previewLayer.style.opacity = "0";
      previewLayer.style.zIndex = "3";
      previewLayer.style.visibility = "visible";
      previewLayer.style.transition = "opacity 100ms ease-out";
    }

    async flushPreviewLayerForClosing(peekPanel, previewLayer) {
      if (!peekPanel || !previewLayer) return;
      previewLayer.style.transform = "translateZ(0)";
      void previewLayer.offsetHeight;
      void peekPanel.offsetHeight;
      await this.waitForAnimationFrames(2);
    }

    async animatePreviewLayerIn(peekPanel, { delayMs = 0 } = {}) {
      const previewLayer = peekPanel?.querySelector(":scope > .peek-source-preview");
      if (!previewLayer) return;
      previewLayer.getAnimations?.().forEach((animation) => animation.cancel());
      void previewLayer.offsetHeight;
      await this.waitForAnimationFrames(1);
      if (delayMs > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, delayMs));
      }
      previewLayer.style.opacity = "1";
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

      const containerRect =
        peekPanel?.closest?.(".peek-container")?.getBoundingClientRect?.() || {
          left: 0,
          top: 0,
        };

      const finalRadius =
        Number.parseFloat(getComputedStyle(peekPanel).borderRadius) ||
        Math.min(finalRect.height / 2, 18);
      const sourceRadius = `${Math.min(Math.max(sourceRect.height / 2, 8), 18)}px`;
      const targetRect = {
        left: finalRect.left - containerRect.left,
        top: finalRect.top - containerRect.top,
        width: finalRect.width,
        height: finalRect.height,
      };
      const relativeSourceRect = {
        left: sourceRect.left - containerRect.left,
        top: sourceRect.top - containerRect.top,
        width: sourceRect.width,
        height: sourceRect.height,
      };

      return {
        sourceRect: relativeSourceRect,
        targetRect,
        sourceRadius,
        targetRadius: `${finalRadius}px`,
        openingKeyframes: [
          {
            left: `${relativeSourceRect.left}px`,
            top: `${relativeSourceRect.top}px`,
            width: `${relativeSourceRect.width}px`,
            height: `${relativeSourceRect.height}px`,
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
            left: `${relativeSourceRect.left}px`,
            top: `${relativeSourceRect.top}px`,
            width: `${relativeSourceRect.width}px`,
            height: `${relativeSourceRect.height}px`,
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

      const geometry = {
        finalRadius: `${finalRadius}px`,
        sourceRadius,
        fittedRect,
        fittedAbsoluteRect,
        originRect,
        panelAbsoluteRect,
        panelTranslateX,
        panelTranslateY,
        uniformScale,
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

      if (PEEK_DEBUG_CONFIG.logCoordinateSystems) {
        console.groupCollapsed("[ArcPeek] motion-geometry transform");
        console.log({
          directionHint: "opening/closing",
          linkRect: linkRect || null,
          sourceRect: sourceRect || null,
          fittedRect,
          fittedAbsoluteRect,
          originRect,
          panelAbsoluteRect,
          panelTranslateX,
          panelTranslateY,
          uniformScale,
        });
        console.groupEnd();
      }

      return geometry;
    }

    animatePanelTransformMotion(peekPanel, direction, sourceRect) {
      const linkRect = this.getPeekPanelLinkRect(peekPanel);
      const geometry = this.getPanelScaleMotionGeometry(
        peekPanel,
        sourceRect,
        linkRect
      );
      if (!geometry) return Promise.resolve();
      if (PEEK_DEBUG_CONFIG.logCoordinateSystems) {
        console.groupCollapsed(`[ArcPeek] motion-branch transform:${direction}`);
        console.log({
          direction,
          linkRect: linkRect || null,
          sourceRect: sourceRect || null,
          geometry,
        });
        console.groupEnd();
      }
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
      if (PEEK_DEBUG_CONFIG.logCoordinateSystems) {
        console.groupCollapsed(`[ArcPeek] motion-branch rect:${direction}`);
        console.log({
          direction,
          sourceRect: sourceRect || null,
          geometry,
        });
        console.groupEnd();
      }
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
        if (button.cls.includes("close-button")) {
          fragment.appendChild(this.createOpenActionsGroup(webviewId, thisElement));
        }
        if (button.cls.includes("split-button")) {
          fragment.appendChild(this.createNavigationActionsGroup(webviewId));
        }
      });

      thisElement.appendChild(fragment);
      this.syncPeekNavigationControls(webviewId);
    }

    createOpenActionsGroup(webviewId, controlsContainer) {
      const group = document.createElement("div");
      group.setAttribute("class", "peek-open-actions");

      const createAction = (content, label, action, cls) => {
        const element = this.createOptionsButton(
          content,
          () => {
            this.hideSidebarControls(controlsContainer);
            action();
          },
          `peek-sidebar-button ${cls}`
        );
        element.setAttribute("aria-label", label);
        element.setAttribute("title", label);
        return element;
      };

      const primaryButton = createAction(
        this.iconUtils.newTab,
        "Open in New Tab",
        () => this.openNewTab(webviewId, true),
        "expand-button"
      );
      const menu = document.createElement("div");
      menu.setAttribute("class", "peek-open-actions-menu");
      menu.appendChild(
        createAction(
          this.iconUtils.openHere,
          "Open Here",
          () => this.openInSourceTab(webviewId),
          "open-here-button"
        )
      );
      menu.appendChild(
        createAction(
          this.iconUtils.backgroundTab,
          "Open in Background",
          () => this.openNewTab(webviewId, false),
          "background-button"
        )
      );

      group.appendChild(primaryButton);
      group.appendChild(menu);
      return group;
    }

    createNavigationActionsGroup(webviewId) {
      const group = document.createElement("div");
      group.setAttribute("class", "peek-open-actions peek-navigation-actions");
      group.dataset.peekWebviewId = webviewId;

      const createAction = (content, label, action, cls) => {
        const element = this.createOptionsButton(
          content,
          () => {
            action();
            this.syncPeekNavigationControls(webviewId);
          },
          `peek-sidebar-button ${cls}`
        );
        element.setAttribute("aria-label", label);
        element.setAttribute("title", label);
        return element;
      };

      const reloadButton = createAction(
        this.iconUtils.reload,
        "Reload",
        () => this.reloadPeek(webviewId),
        "reload-button"
      );
      const menu = document.createElement("div");
      menu.setAttribute("class", "peek-open-actions-menu peek-navigation-actions-menu");

      const backButton = createAction(
        this.iconUtils.back,
        "Back",
        () => this.goPeekBack(webviewId),
        "back-button"
      );
      const forwardButton = createAction(
        this.iconUtils.forward,
        "Forward",
        () => this.goPeekForward(webviewId),
        "forward-button"
      );
      backButton.hidden = true;
      forwardButton.hidden = true;

      menu.appendChild(backButton);
      menu.appendChild(forwardButton);
      group.appendChild(reloadButton);
      group.appendChild(menu);
      return group;
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

    isUsablePeekUrl(url) {
      const normalized = String(url || "").trim();
      if (!normalized) return false;
      try {
        const parsed = new URL(normalized);
        return ![
          "about:",
          "javascript:",
          "data:",
          "blob:",
          "chrome:",
          "vivaldi:",
          "devtools:",
        ].includes(parsed.protocol);
      } catch (_) {
        return false;
      }
    }

    normalizePeekHistoryUrl(url) {
      const normalized = String(url || "").trim();
      return this.isUsablePeekUrl(normalized) ? normalized : "";
    }

    recordPeekNavigation(webviewId, url) {
      const data = this.webviews.get(webviewId);
      const nextUrl = this.normalizePeekHistoryUrl(url);
      if (!data || !nextUrl) return;

      if (!Array.isArray(data.navigationHistory)) {
        data.navigationHistory = [];
      }
      if (typeof data.navigationIndex !== "number") {
        data.navigationIndex = data.navigationHistory.length - 1;
      }

      const currentUrl = data.navigationHistory[data.navigationIndex] || "";
      if (currentUrl === nextUrl) {
        data.currentUrl = nextUrl;
        return;
      }

      if (data.navigationIndex < data.navigationHistory.length - 1) {
        data.navigationHistory = data.navigationHistory.slice(0, data.navigationIndex + 1);
      }

      data.navigationHistory.push(nextUrl);
      data.navigationIndex = data.navigationHistory.length - 1;
      data.currentUrl = nextUrl;
    }

    getPeekUrl(webviewId) {
      const data = this.webviews.get(webviewId);
      if (!data?.webview) return "";
      const historyUrl =
        Array.isArray(data.navigationHistory) &&
        Number.isFinite(Number(data.navigationIndex))
          ? data.navigationHistory[Number(data.navigationIndex)]
          : "";
      const candidates = [
        data.webview.dataset.pendingSrc,
        historyUrl,
        data.currentUrl,
        data.initialUrl,
        data.webview.getAttribute("src"),
        data.webview.src,
      ];
      return candidates.find((url) => this.isUsablePeekUrl(url)) || "";
    }

    navigatePeekToUrl(webviewId, url, options = {}) {
      const { recordHistory = true } = options;
      const nextUrl = String(url || "").trim();
      if (!nextUrl) return;

      const data = this.webviews.get(webviewId);
      const webview = data?.webview;
      if (!webview) return;

      webview.dataset.pendingSrc = nextUrl;
      if (recordHistory) {
        this.recordPeekNavigation(webviewId, nextUrl);
      } else {
        data.currentUrl = nextUrl;
      }
      data.pageStable = false;
      this.startPeekNavigation(webview, webviewId);
      this.syncPeekNavigationControls(webviewId);
    }

    canNavigatePeek(webviewId, direction) {
      const data = this.webviews.get(webviewId);
      const history = data?.navigationHistory;
      const index = Number(data?.navigationIndex);
      if (!Array.isArray(history) || !Number.isFinite(index)) return false;

      if (direction === "back") return index > 0;
      if (direction === "forward") return index >= 0 && index < history.length - 1;
      return false;
    }

    syncPeekNavigationControls(webviewId) {
      const data = this.webviews.get(webviewId);
      const container = data?.divContainer;
      if (!container?.isConnected) return;

      const navigationGroup = container.querySelector(
        `.peek-navigation-actions[data-peek-webview-id="${webviewId}"]`
      );
      if (!navigationGroup) return;

      const backButton = navigationGroup.querySelector(".back-button");
      const forwardButton = navigationGroup.querySelector(".forward-button");
      if (backButton) backButton.hidden = !this.canNavigatePeek(webviewId, "back");
      if (forwardButton) forwardButton.hidden = !this.canNavigatePeek(webviewId, "forward");
    }

    reloadPeek(webviewId) {
      const webview = this.webviews.get(webviewId)?.webview;
      if (!webview) return;

      try {
        if (typeof webview.reload === "function") {
          webview.reload();
          return;
        }
      } catch (_) {}

      const url = this.getPeekUrl(webviewId);
      if (url) this.navigatePeekToUrl(webviewId, url);
    }

    goPeekBack(webviewId) {
      const data = this.webviews.get(webviewId);
      if (!data || !this.canNavigatePeek(webviewId, "back")) return;

      data.navigationIndex -= 1;
      const targetUrl = data.navigationHistory[data.navigationIndex];
      if (targetUrl) this.navigatePeekToUrl(webviewId, targetUrl, { recordHistory: false });
    }

    goPeekForward(webviewId) {
      const data = this.webviews.get(webviewId);
      if (!data || !this.canNavigatePeek(webviewId, "forward")) return;

      data.navigationIndex += 1;
      const targetUrl = data.navigationHistory[data.navigationIndex];
      if (targetUrl) this.navigatePeekToUrl(webviewId, targetUrl, { recordHistory: false });
    }

    openNewTab(webviewId, active) {
      const url = this.getPeekUrl(webviewId);
      if (!url) return;

      if (!active) {
        chrome.tabs.create({ url: url, active: false });
        this.disposePeek(webviewId, { animated: true, closeRuntimeTab: true });
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
      if (this.shouldScaleBackgroundPage()) {
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

    async openInSourceTab(webviewId) {
      const url = this.getPeekUrl(webviewId);
      if (!url) return;

      const data = this.webviews.get(webviewId);
      if (!data) return;

      const sourceTabId = this.getOwningTabId(data);
      if (!sourceTabId) return;

      const closePromise = this.disposePeek(webviewId, {
        animated: true,
        closeRuntimeTab: true,
      });
      await this.updateTab(sourceTabId, { url, active: true });
      await closePromise;
    }

    isArcPeekSplitTab(tab, ownerTabId = null) {
      const viv = this.parseVivExtData(tab);
      const marker = viv.arcPeekSplit;
      if (!marker || marker.createdBy !== "ArcPeek") return false;
      if (ownerTabId === null) return true;
      return Number(marker.ownerTabId) === Number(ownerTabId);
    }

    async closeArcPeekSplitTabs(ownerTabId) {
      const tabs = await this.queryTabs({ currentWindow: true });
      const tabIds = tabs
        .filter((tab) => tab?.id && tab.id !== ownerTabId)
        .filter((tab) => this.isArcPeekSplitTab(tab, ownerTabId))
        .map((tab) => tab.id);

      if (!tabIds.length) return;
      await this.removeTab(tabIds);
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
        const tileId = crypto.randomUUID();
        const layout = "row";

        await this.closeArcPeekSplitTabs(currentFresh.id);

        const newTab = await this.createTab({
          url,
          active: true,
          index: typeof currentFresh.index === "number" ? currentFresh.index + 1 : undefined,
          openerTabId: currentFresh.id,
        });
        if (!newTab?.id) return;

        // Remove the peek as soon as the split tab exists; the tiling metadata can finish in background.
        this.dismissPeekInstant(webviewId);

        await Promise.all([
          this.updateTabVivExtData(currentFresh.id, (viv) => ({
            ...viv,
            tiling: { id: tileId, index: 0, layout, type: "selection" },
          })),
          this.updateTabVivExtData(newTab.id, (viv) => ({
            ...viv,
            arcPeekSplit: {
              createdBy: "ArcPeek",
              ownerTabId: currentFresh.id,
              createdAt: Date.now(),
            },
            tiling: { id: tileId, index: 1, layout, type: "selection" },
          })),
        ]);

        await Promise.all([
          this.updateTab(currentFresh.id, { active: true, highlighted: true }),
          this.updateTab(newTab.id, { highlighted: true }),
        ]);
      } catch (_) {}
    }
  }

  class WebsiteInjectionUtils {
    constructor(getWebviewConfig, openPeek, triggerConfig) {
      this.triggerConfig = triggerConfig;
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
            if (target?.classList?.contains?.("tab-position")) {
              this.syncPinnedStateForTabPosition(target);
            }
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

    getTabWrapperByTabId(tabId) {
      if (!Number.isFinite(tabId) || tabId <= 0) return null;
      return document.querySelector(`.tab-wrapper[data-id="tab-${tabId}"]`);
    }

    isPinnedTabId(tabId) {
      const tabWrapper = this.getTabWrapperByTabId(tabId);
      return !!tabWrapper?.closest?.(".tab-position.is-pinned");
    }

    updateInjectedPinnedState(webview, isPinned) {
      if (!webview?.isConnected) return;
      webview.executeScript(
        {
          code: `window.__arcpeekCurrentTabIsPinned = ${isPinned ? "true" : "false"};`,
          runAt: "document_start",
        },
        () => {
          void chrome.runtime.lastError;
        }
      );
    }

    syncPinnedStateForTabPosition(tabPositionElement) {
      if (!tabPositionElement?.classList?.contains?.("tab-position")) return;
      const dataId = tabPositionElement.querySelector(".tab-wrapper")?.getAttribute?.("data-id") || "";
      const match = /^tab-(\d+)$/.exec(dataId);
      const tabId = Number(match?.[1] || 0);
      if (!Number.isFinite(tabId) || tabId <= 0) return;
      const webview = document.querySelector(`webview[tab_id="${tabId}"]`);
      if (!webview || !this.isInjectableWebview(webview)) return;
      this.updateInjectedPinnedState(
        webview,
        tabPositionElement.classList.contains("is-pinned")
      );
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

        const handler = WebsiteLinkInteractionHandler.toString();
        const rawTabId = webview.getAttribute("tab_id") || webview.tab_id;
        const tabId = Number(rawTabId);
        const finalizeInjection = (currentTabIsPinned = false) => {
          const pageConfig = JSON.stringify({
            ...this.triggerConfig,
            currentTabIsPinned,
            currentTabId: Number.isFinite(tabId) && tabId > 0 ? tabId : null,
          });
          const instantiationCode = `
                window.__arcpeekCurrentTabIsPinned = ${currentTabIsPinned ? "true" : "false"};
                if (!this.peekEventListenerSet) {
                    new (${handler})(${fromPanel}, ${pageConfig});
                    this.peekEventListenerSet = true;
                }
            `;

          webview.executeScript({ code: instantiationCode, runAt: "document_start" }, () => {
            void chrome.runtime.lastError;
          });
        };

        finalizeInjection(this.isPinnedTabId(tabId));
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

    #shouldLogSourceRectRequests() {
      return (
        typeof PEEK_DEBUG_CONFIG !== "undefined" &&
        !!PEEK_DEBUG_CONFIG?.logSourceRectRequests
      );
    }

    constructor(fromPanel, config) {
      this.fromPanel = fromPanel;
      this.config = config;

      this.longPressLink = null;

      this.timers = {
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

      this.#beforeUnloadListener = this.#cleanup.bind(this);
      window.addEventListener("beforeunload", this.#beforeUnloadListener, { signal: this.#abortController.signal });

      this.#initialize();

      this.#messageListener = (message, _sender, sendResponse) => {
        if (message.type === "peek-closed") {
          this.isLongPress = false;
          this.#restorePeekSourceLink();
          return;
        }

        if (message.type === "peek-source-link-state") {
          this.#setPeekSourceLinkVisibility(message.sourceToken, message.hidden);
          return;
        }

        if (message.type === "peek-source-rect-request") {
          const rect = this.#getPeekSourceRect(message.sourceToken);
          if (this.#shouldLogSourceRectRequests()) {
            console.groupCollapsed("[ArcPeek] source-rect page-response");
            console.log({
              sourceToken: message.sourceToken,
              rect,
            });
            console.groupEnd();
          }
          if (rect) {
            sendResponse({ rect });
          } else {
            sendResponse({ rect: null });
          }
          return true;
        }
      };
      chrome.runtime.onMessage.addListener(this.#messageListener);
    }

    #initialize() {
      this.#setupMouseHandling();
      this.#createStyle();
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
      clearTimeout(this.timers.suppressNativeOpen);
      this.peekTriggered = false;
      this.suppressPointerSequence = false;
      this.pendingLeftButtonRelease = false;
      this.pendingSuppressedButton = null;
      this.#restoreSelection();
    }

    #getConfiguredLongPressButtons() {
      const raw = this.config?.longPressButtons;
      const values = Array.isArray(raw) ? raw : [raw];
      const normalized = values
        .flatMap((value) => String(value || "").toLowerCase().split(","))
        .map((value) => value.trim())
        .filter(Boolean)
        .filter((value) => value !== "left")
        .filter((value) => value !== "none");
      return new Set(normalized);
    }

    #isConfiguredLongPressButton(button) {
      const longPressButtons = this.#getConfiguredLongPressButtons();
      if (button === 0) return false;
      if (button === 1) return longPressButtons.has("middle");
      if (button === 2) return longPressButtons.has("right");
      return false;
    }

    #getConfiguredClickOpenModifiers() {
      const raw = this.config?.clickOpenModifiers;
      const values = Array.isArray(raw) ? raw : [raw];
      return new Set(
        values
          .flatMap((value) => String(value || "").toLowerCase().split(","))
          .map((value) => value.trim())
          .filter(Boolean)
          .filter((value) => value !== "none")
          .filter((value) =>
            value === "alt" ||
            value === "shift" ||
            value === "ctrl" ||
            value === "meta"
          )
      );
    }

    #isConfiguredClickOpenModifierEvent(event) {
      if (!event || event.button !== 0) return false;
      const modifiers = this.#getConfiguredClickOpenModifiers();
      if (!modifiers.size) return false;
      return (
        (modifiers.has("alt") && !!event.altKey) ||
        (modifiers.has("shift") && !!event.shiftKey) ||
        (modifiers.has("ctrl") && !!event.ctrlKey) ||
        (modifiers.has("meta") && !!event.metaKey)
      );
    }

    #getAutoOpenList() {
      const raw = this.config?.autoOpenList;
      const values = Array.isArray(raw) ? raw : [raw];
      return values
        .flatMap((value) => String(value || "").toLowerCase().split(","))
        .map((value) => value.trim())
        .filter(Boolean)
        .filter((value) => value !== "none");
    }

    #hostnameMatchesPattern(hostname, pattern) {
      if (!hostname || !pattern || pattern === "pin") return false;
      if (pattern.startsWith("*.")) {
        const suffix = pattern.slice(2);
        return !!suffix && hostname.endsWith(`.${suffix}`);
      }
      return hostname === pattern;
    }

    #isCurrentTabPinned() {
      if (typeof window.__arcpeekCurrentTabIsPinned === "boolean") {
        return window.__arcpeekCurrentTabIsPinned;
      }
      return !!this.config?.currentTabIsPinned;
    }

    #shouldAutoOpenLinkEvent(event) {
      if (!event || event.button !== 0) return false;

      const autoOpenList = this.#getAutoOpenList();
      if (!autoOpenList.length) return false;

      if (
        autoOpenList.includes("pin") &&
        this.#isCurrentTabPinned()
      ) {
        return true;
      }

      const hostname = String(window.location.hostname || "").toLowerCase();
      if (!hostname) return false;

      return autoOpenList.some((pattern) =>
        this.#hostnameMatchesPattern(hostname, pattern)
      );
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

        if (
          (event.type === "click" ||
            event.type === "auxclick" ||
            event.type === "contextmenu") &&
          typeof this.pendingSuppressedButton === "number"
        ) {
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
        const link = this.#getLinkElement(event);
        if (link) {
          this.#recordLinkSnapshot(event, link);
        }

        if (link && this.#shouldAutoOpenLinkEvent(event)) {
          this.pendingLeftButtonRelease = true;
          this.pendingSuppressedButton = 0;
          this.#openPeekFromEvent(event);
          this.preventAllClicks();
        } else if (this.#isConfiguredClickOpenModifierEvent(event)) {
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
      const element = document.querySelector(
        `[data-arcpeek-source-token="${sourceToken}"]`
      );
      if (this.#shouldLogSourceRectRequests()) {
        console.groupCollapsed("[ArcPeek] source-rect page-lookup");
        console.log({
          sourceToken,
          hiddenSourceToken: this.#hiddenPeekSourceToken,
          usedHiddenLink:
            this.#hiddenPeekSourceToken === sourceToken &&
            !!this.#hiddenPeekSourceLink?.isConnected,
          found: !!element,
          tagName: element?.tagName || null,
          className: element?.className || null,
          isConnected: !!element?.isConnected,
        });
        console.groupEnd();
      }
      return element;
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
      if (!rect?.width || !rect?.height) {
        if (this.#shouldLogSourceRectRequests()) {
          console.groupCollapsed("[ArcPeek] source-rect page-rect-miss");
          console.log({
            sourceToken,
            foundElement: !!link,
            rect: rect
              ? {
                  left: rect.left,
                  top: rect.top,
                  width: rect.width,
                  height: rect.height,
                }
              : null,
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight,
            },
          });
          console.groupEnd();
        }
        return null;
      }
      const resolvedRect = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };
      if (this.#shouldLogSourceRectRequests()) {
        console.groupCollapsed("[ArcPeek] source-rect page-rect-hit");
        console.log({
          sourceToken,
          rect: resolvedRect,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        });
        console.groupEnd();
      }
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
        sourceTabId: Number(this.config?.currentTabId) || null,
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
      chrome.runtime.sendMessage({
        url,
        fromPanel: this.fromPanel,
        rect,
        meta: {
          sourceTabId: Number(this.config?.currentTabId) || null,
        },
      });
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
          sourceTabId: rect.sourceTabId,
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

    #createStyle() {
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
  }

  class IconUtils {
    static SVG = {
      ellipsis: '<svg xmlns="http://www.w3.org/2000/svg" height="2em" viewBox="0 0 448 512"><path d="M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z"/></svg>',
      close: '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>',
      readerView: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M3 4h10v1H3zM3 6h10v1H3zM3 8h10v1H3zM3 10h6v1H3z"></path></svg>',
      newTab: '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z"/></svg>',
      splitView: '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M64 64C28.7 64 0 92.7 0 128V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H64zm160 64V384H64V128H224zm64 256V128H448V384H288z"/></svg>',
      openHere: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M200-120q-33 0-56.5-23.5T120-200v-120h80v120h560v-480H200v120h-80v-200q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm260-140-56-56 83-84H120v-80h367l-83-84 56-56 180 180-180 180Z"/></svg>',
      backgroundTab: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M320-80q-33 0-56.5-23.5T240-160v-80h-80q-33 0-56.5-23.5T80-320v-80h80v80h80v-320q0-33 23.5-56.5T320-720h320v-80h-80v-80h80q33 0 56.5 23.5T720-800v80h80q33 0 56.5 23.5T880-640v480q0 33-23.5 56.5T800-80H320Zm0-80h480v-480H320v480ZM80-480v-160h80v160H80Zm0-240v-80q0-33 23.5-56.5T160-880h80v80h-80v80H80Zm240-80v-80h160v80H320Zm0 640v-480 480Z"/></svg>',
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
    get openHere() { return this.getIcon("openHere"); }
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
