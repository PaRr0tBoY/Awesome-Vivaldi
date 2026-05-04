// ==UserScript==
// @name         Arc Peek
// @description  Opens links in a peek panel by holding the middle/right mouse button or modifier-clicking links.
// @requirement  ArcPeek.css
// @version      2026.4.17
// @author       biruktes, tam710562, oudstand, PaRr0tBoY
// @website      https://forum.vivaldi.net/post/897615
// ==/UserScript==

(async () => {
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
    // Log related-tab lifecycle and open-action handoff diagnostics.
    logOpenActions: true,
  };
  const PEEK_RELATED_TAB_ADOPTION_CONFIG = {
    // Public chrome.tabs.update cannot currently detach Vivaldi related tabs into
    // tab strip tabs; keep this disabled until an internal dispatcher path is proven.
    enabled: false,
  };
  const LOADING_ANIMATION_CONFIG = {
    // Available: "skeleton", "breath", "real", "none"
    mode: "skeleton",
  };
  const MOD_CONFIG_KEY = "arcPeek";
  const MOD_CONFIG_FILE = "config.json";
  const MOD_CONFIG_DIR = ".askonpage";

  function normalizeList(value, fallback) {
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }
    if (typeof value === "string") {
      return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
    }
    return fallback;
  }

  function applySharedModConfig(raw) {
    const source = raw?.mods?.[MOD_CONFIG_KEY] && typeof raw.mods[MOD_CONFIG_KEY] === "object"
      ? raw.mods[MOD_CONFIG_KEY]
      : {};
    ICON_CONFIG.clickOpenModifiers = normalizeList(source.clickOpenModifiers, ICON_CONFIG.clickOpenModifiers);
    ICON_CONFIG.longPressButtons = normalizeList(source.longPressButtons, ICON_CONFIG.longPressButtons);
    ICON_CONFIG.autoOpenList = normalizeList(source.autoOpenList, ICON_CONFIG.autoOpenList);
    ["longPressHoldTime", "longPressHoldDelay"].forEach((key) => {
      const value = Number(source[key]);
      if (Number.isFinite(value)) {
        ICON_CONFIG[key] = value;
      }
    });
    if (source.foregroundMode === "default" || source.foregroundMode === "theme") {
      PEEK_FOREGROUND_CONFIG.mode = source.foregroundMode;
    }
    if (["skeleton", "breath", "real", "none"].includes(source.loadingAnimation)) {
      LOADING_ANIMATION_CONFIG.mode = source.loadingAnimation;
    }
    if (typeof source.scaleBackgroundPage === "boolean") {
      PEEK_BACKGROUND_CONFIG.scaleBackgroundPage = source.scaleBackgroundPage;
    }
  }

  async function loadSharedModConfig() {
    try {
      const root = await navigator.storage.getDirectory();
      const dir = await root.getDirectoryHandle(MOD_CONFIG_DIR, { create: true });
      const fileHandle = await dir.getFileHandle(MOD_CONFIG_FILE, { create: false });
      const file = await fileHandle.getFile();
      applySharedModConfig(JSON.parse(await file.text()));
    } catch (_error) {}
  }

  await loadSharedModConfig();
  window.addEventListener("vivaldi-mod-config-updated", (event) => {
    applySharedModConfig(event.detail || {});
  });

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
    realSkeletonCache = new Map();
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
      window.ArcPeekDebug = this;
      this.registerPeekCloseShortcuts();
      this.registerPeekCloseGuard();
      this.initializePeekLayoutTracking();

      new WebsiteInjectionUtils(
        (navigationDetails) => this.getWebviewConfig(navigationDetails),
        (url, fromPanel, rect) => this.openPeek(url, fromPanel, rect),
        ICON_CONFIG
      );
    }

    logOpenAction(stage, details = {}) {
      if (!PEEK_DEBUG_CONFIG.logOpenActions && window.ArcPeekDebug !== this) return;
      try {
        console.info("[ArcPeek]", stage, details);
      } catch (_) {}
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
            target?.id === "tabs-container" ||
            target?.id === "tabs-subcontainer" ||
            target?.classList?.contains?.("tab-strip") ||
            target?.classList?.contains?.("tab-position") ||
            target?.classList?.contains?.("tab-wrapper") ||
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
        childList: true,
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
      if (data?.handoffInProgress) return true;
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
      this.syncPeekTabButtons();
    }

    getTabWrapperElement(tabId) {
      if (!Number.isFinite(Number(tabId)) || Number(tabId) <= 0) return null;
      return document.querySelector(`.tab-wrapper[data-id="tab-${Number(tabId)}"]`);
    }

    getPeekFaviconUrl(data) {
      const url = this.normalizePeekHistoryUrl(
        data?.currentUrl || data?.initialUrl || ""
      );
      if (!url) return "";
      return `chrome://favicon/size/16/${url}`;
    }

    syncPeekTabButtons() {
      const expected = new Map();
      for (const [webviewId, data] of this.webviews.entries()) {
        if (!data || data.isDisposing) continue;
        const ownerTabId = this.getOwningTabId(data);
        if (!Number.isFinite(ownerTabId) || ownerTabId <= 0) continue;
        expected.set(webviewId, { data, ownerTabId });
      }

      document.querySelectorAll(".arcpeek-tab-button").forEach((button) => {
        const webviewId = button.getAttribute("data-arcpeek-webview-id") || "";
        const expectedEntry = expected.get(webviewId);
        const tabWrapper = expectedEntry
          ? this.getTabWrapperElement(expectedEntry.ownerTabId)
          : null;
        if (!expectedEntry || !tabWrapper || !tabWrapper.contains(button)) {
          button.remove();
        }
      });

      const ownerIndexes = new Map();
      for (const [webviewId, { data, ownerTabId }] of expected.entries()) {
        const tabWrapper = this.getTabWrapperElement(ownerTabId);
        if (!tabWrapper) continue;
        const mountTarget =
          tabWrapper.querySelector(".tab-header") ||
          tabWrapper.querySelector(".tab") ||
          tabWrapper;
        const index = ownerIndexes.get(ownerTabId) || 0;
        ownerIndexes.set(ownerTabId, index + 1);

        let button = tabWrapper.querySelector(
          `.arcpeek-tab-button[data-arcpeek-webview-id="${webviewId}"]`
        );
        if (!button) {
          button = document.createElement("button");
          button.type = "button";
          button.className = "arcpeek-tab-button";
          button.setAttribute("data-arcpeek-webview-id", webviewId);
          button.setAttribute("aria-label", "Open Peek");
          const image = document.createElement("img");
          image.className = "arcpeek-tab-button-favicon";
          image.alt = "";
          image.draggable = false;
          image.addEventListener("error", () => {
            button.classList.add("arcpeek-tab-button-fallback");
          });
          button.appendChild(image);
          button.addEventListener("pointerdown", (event) => {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation?.();
          });
          button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation?.();
            this.updateTab(ownerTabId, { active: true });
            window.setTimeout(() => {
              this.updatePeekTabVisibility();
              this.focusPeekWebview(webviewId);
            }, 80);
          });
          mountTarget.appendChild(button);
        } else if (button.parentElement !== mountTarget) {
          mountTarget.appendChild(button);
        }

        const faviconUrl = this.getPeekFaviconUrl(data);
        const image = button.querySelector(".arcpeek-tab-button-favicon");
        if (image && faviconUrl && image.getAttribute("src") !== faviconUrl) {
          button.classList.remove("arcpeek-tab-button-fallback");
          image.src = faviconUrl;
        }
        button.style.setProperty("--arcpeek-tab-button-index", String(index));
        button.title = this.getPeekUrl(webviewId) || data.currentUrl || "Peek";
      }
    }

    syncOpenPeekLayouts() {
      this.updatePeekTabVisibility();
      this.webviews.forEach((data, webviewId) => {
        if (!data || data.isDisposing || data.closingMode) return;
        if (data.handoffInProgress) return;
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
      return 0;
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
      const handleShortcut = (event) => {
        const activePeekId = this.getTopVisiblePeekWebviewId();
        if (!activePeekId) return false;

        const isEscape = event.key === "Escape";
        const key = String(event.key || "").toLowerCase();
        const hasCommandModifier = event.metaKey || event.ctrlKey;
        const isCloseTabShortcut =
          hasCommandModifier &&
          !event.altKey &&
          !event.shiftKey &&
          key === "w";
        const isReloadShortcut =
          hasCommandModifier &&
          !event.altKey &&
          !event.shiftKey &&
          key === "r";
        const isFindShortcut =
          hasCommandModifier &&
          !event.altKey &&
          !event.shiftKey &&
          key === "f";

        if (!isEscape && !isCloseTabShortcut && !isReloadShortcut && !isFindShortcut) {
          return false;
        }

        if (isCloseTabShortcut) {
          this.armCloseShortcutGuard();
        }
        event.preventDefault?.();
        event.stopPropagation?.();
        event.stopImmediatePropagation?.();
        if (isEscape || isCloseTabShortcut) {
          this.closeLastPeek();
        } else if (isReloadShortcut) {
          this.reloadPeek(activePeekId);
          this.focusPeekWebview(activePeekId);
        } else if (isFindShortcut) {
          this.focusPeekWebview(activePeekId);
          this.startPeekFind(activePeekId);
        }
        return true;
      };

      document.addEventListener("keydown", handleShortcut, true);

      if (
        window.vivaldi?.tabsPrivate?.onKeyboardShortcut &&
        typeof vivaldi.tabsPrivate.onKeyboardShortcut.addListener === "function"
      ) {
        vivaldi.tabsPrivate.onKeyboardShortcut.addListener((id, combination) => {
          const activePeekId = this.getTopVisiblePeekWebviewId();
          if (!activePeekId || typeof combination !== "string") return;
          const normalized = combination.toLowerCase();
          const isCloseTabShortcut =
            normalized === "cmd+w" ||
            normalized === "meta+w" ||
            normalized === "ctrl+w";
          const isReloadShortcut =
            normalized === "cmd+r" ||
            normalized === "meta+r" ||
            normalized === "ctrl+r";
          const isFindShortcut =
            normalized === "cmd+f" ||
            normalized === "meta+f" ||
            normalized === "ctrl+f";
          if (normalized === "esc" || isCloseTabShortcut) {
            if (isCloseTabShortcut) {
              this.armCloseShortcutGuard();
            }
            this.closeLastPeek();
          } else if (isReloadShortcut) {
            this.reloadPeek(activePeekId);
            this.focusPeekWebview(activePeekId);
          } else if (isFindShortcut) {
            this.focusPeekWebview(activePeekId);
            this.startPeekFind(activePeekId);
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
      const data = this.webviews.get(webviewId);
      if (data?.relatedTabId) {
        const tab = await this.getTab(data.relatedTabId);
        if (!chrome.runtime.lastError && tab?.id) return tab;
      }
      const tabs = await this.queryTabs({});
      return (
        tabs.find((tab) => {
          const viv = this.parseVivExtData(tab);
          return (
            viv?.arcPeekRuntime?.webviewId === webviewId ||
            tab?.vivExtData?.includes?.(`${webviewId}tabId`)
          );
        }) || null
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
          window.__arcPeekOpening = false;
          chrome.tabs.onRemoved.removeListener(handleRemoved);
          resolve(result);
        };

        const handleRemoved = (removedTabId) => {
          if (removedTabId !== runtimeTab.id) return;
          finish("removed");
        };

        chrome.tabs.onRemoved.addListener(handleRemoved);
        window.__arcPeekOpening = true;
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

      const entry = this.getTopVisiblePeekEntry();
      const webviewValues = Array.from(this.webviews.values());
      let webviewData = entry?.data || webviewValues.at(-1);
      
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

    getTopVisiblePeekEntry() {
      const entries = Array.from(this.webviews.entries());
      for (let index = entries.length - 1; index >= 0; index -= 1) {
        const [webviewId, data] = entries[index];
        if (!data?.divContainer?.isConnected) continue;
        if (data.isDisposing || data.closingMode) continue;
        if (!this.isPeekVisibleForCurrentTab(data)) continue;
        return { webviewId, data };
      }
      return null;
    }

    getTopVisiblePeekWebviewId() {
      return this.getTopVisiblePeekEntry()?.webviewId || "";
    }

    focusPeekWebview(webviewId = this.getTopVisiblePeekWebviewId()) {
      const data = this.webviews.get(webviewId);
      const webview = data?.webview;
      if (!webview?.isConnected) return false;

      try {
        data.divContainer?.focus?.({ preventScroll: true });
      } catch (_) {}
      try {
        webview.focus?.();
      } catch (_) {}
      if (!data.pageStable) return true;
      try {
        webview.executeScript(
          {
            code: `
              (() => {
                try {
                  window.focus();
                  if (document.activeElement === document.body || !document.activeElement) {
                    document.body?.focus?.({ preventScroll: true });
                  }
                  return true;
                } catch (_) {
                  return false;
                }
              })();
            `,
            runAt: "document_idle",
          },
          () => {
            void chrome.runtime.lastError;
          }
        );
      } catch (_) {}
      return true;
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
        relatedTabId: null,
        relatedPanelId: null,
        handoffInProgress: false,
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
      window.__arcPeekOpening = true;
      const runtime = await this.createPeekRuntimeTab(webviewId, pendingUrl);
      if (runtime?.tab?.id) {
        webview.tab_id = String(runtime.tab.id);
        webview.setAttribute("tab_id", String(runtime.tab.id));
        webview.setAttribute("parent_tab_id", "0");
        webview.setAttribute("name", "vivaldi-arcpeek");
        const currentData = this.webviews.get(webviewId);
        if (currentData) {
          currentData.relatedTabId = runtime.tab.id;
          currentData.relatedPanelId = runtime.panelId;
        }
      } else {
        webview.tab_id = `${webviewId}tabId`;
        webview.setAttribute("src", "about:blank");
      }
      if (!runtime?.tab?.id) {
        webview.dataset.pendingSrc = pendingUrl;
      }

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
        const current = this.webviews.get(webviewId);
        if (current && !current.pageStable) current.pageStable = true;
        this.installPeekWebviewShortcutGuard(webviewId);
        this.focusPeekWebview(webviewId);
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
      ["pointerdown", "mousedown", "click"].forEach((eventName) => {
        webview.addEventListener(
          eventName,
          () => {
            this.focusPeekWebview(webviewId);
          },
          true
        );
      });

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
      window.__arcPeekOpening = false;
      peekContainer.tabIndex = -1;
      window.setTimeout(() => this.focusPeekWebview(webviewId), 0);

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
        effectiveLinkRect,
        webviewId
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

    buildPeekPanelId(webviewId) {
      return `arcpeek-${webviewId}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
    }

    async createPeekRuntimeTab(webviewId, url) {
      const windowId = this.getVivaldiWindowId();
      const panelId = this.buildPeekPanelId(webviewId);
      const vivExtData = {
        panelId,
        arcPeekRuntime: {
          createdBy: "ArcPeek",
          webviewId,
          createdAt: Date.now(),
        },
      };
      const createProperties = {
        url: url || "about:blank",
        active: false,
        vivExtData: JSON.stringify(vivExtData),
      };
      if (windowId !== null) {
        createProperties.windowId = windowId;
      }

      this.logOpenAction("runtime-tab:create:start", {
        webviewId,
        panelId,
        url,
        windowId,
      });

      const tab = await this.createTab(createProperties);
      const error = chrome.runtime.lastError?.message || "";
      this.logOpenAction("runtime-tab:create:done", {
        webviewId,
        panelId,
        tabId: tab?.id || null,
        status: tab?.status || null,
        url: tab?.url || "",
        error,
      });

      if (error || !tab?.id) return null;
      return { tab, panelId };
    }

    findTabStripNode(tabId) {
      if (!tabId) return null;
      return (
        document.querySelector(`.tab-wrapper[data-id="tab-${tabId}"]`) ||
        document.querySelector(`.tab-position[data-id="tab-${tabId}"]`) ||
        document.querySelector(`.tab[data-id="tab-${tabId}"]`) ||
        document.querySelector(`[data-id="tab-${tabId}"]`) ||
        document.querySelector(`[data-tab-id="${tabId}"]`)
      );
    }

    async waitForTabStripNode(tabId, timeoutMs = 800) {
      const startedAt = Date.now();
      while (Date.now() - startedAt < timeoutMs) {
        const node = this.findTabStripNode(tabId);
        if (node) return node;
        await new Promise((resolve) => window.setTimeout(resolve, 50));
      }
      return this.findTabStripNode(tabId);
    }

    async detachPeekRuntimeTab(webviewId, options = {}) {
      const { active = true, reason = "open-action" } = options;
      const data = this.webviews.get(webviewId);
      const runtimeTabId = Number(data?.relatedTabId);
      if (!runtimeTabId) {
        this.logOpenAction("runtime-tab:detach:skip", {
          webviewId,
          reason,
          message: "missing relatedTabId",
        });
        return null;
      }

      let before = null;
      try {
        before = await this.getTab(runtimeTabId);
      } catch (_) {}
      if (chrome.runtime.lastError || !before?.id) {
        this.logOpenAction("runtime-tab:detach:missing", {
          webviewId,
          runtimeTabId,
          reason,
          error: chrome.runtime.lastError?.message || "",
        });
        return null;
      }

      const nextViv = this.parseVivExtData(before);
      delete nextViv.panelId;
      nextViv.arcPeekAdopted = {
        createdBy: "ArcPeek",
        webviewId,
        reason,
        adoptedAt: Date.now(),
      };

      this.logOpenAction("runtime-tab:detach:start", {
        webviewId,
        runtimeTabId,
        reason,
        active,
        before: {
          url: before.url,
          status: before.status,
          vivExtData: before.vivExtData || "",
        },
      });

      const updated = await this.updateTab(runtimeTabId, {
        active: !!active,
        vivExtData: JSON.stringify(nextViv),
      });
      const error = chrome.runtime.lastError?.message || "";
      await this.waitForTabStripNode(runtimeTabId);
      let after = null;
      try {
        after = await this.getTab(runtimeTabId);
      } catch (_) {}

      const adopted = !!this.findTabStripNode(runtimeTabId);
      const afterViv = this.parseVivExtData(after);
      this.logOpenAction("runtime-tab:detach:done", {
        webviewId,
        runtimeTabId,
        reason,
        active,
        adopted,
        panelIdStillPresent: !!afterViv.panelId,
        error,
        updated: updated
          ? {
              id: updated.id,
              active: updated.active,
              status: updated.status,
              url: updated.url,
              vivExtData: updated.vivExtData || "",
            }
          : null,
        after: after
          ? {
              id: after.id,
              active: after.active,
              status: after.status,
              url: after.url,
              vivExtData: after.vivExtData || "",
            }
          : null,
      });

      if (error || !after?.id) return null;
      return {
        tab: after,
        adopted,
        wasRelatedTab: true,
      };
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

    createPreviewLayer(sourcePreviewUrl, linkRect, webviewId = "") {
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

      if (!hasPreview) {
        const mode = LOADING_ANIMATION_CONFIG.mode;
        if (mode === "breath") {
          previewLayer.classList.add("breath-loading");
        } else if (mode === "real") {
          const cached = this.getCachedRealSkeleton(linkRect?.href || "");
          if (cached) {
            previewLayer.appendChild(cached);
          }
        } else if (mode === "skeleton") {
          previewLayer.appendChild(this.createSkeletonShimmer());
        }
        // "none": no loading indicator
      }

      return previewLayer;
    }

    createSkeletonShimmer() {
      const sk = (cls) => {
        const el = document.createElement("div");
        el.className = `sk ${cls}`;
        return el;
      };

      const root = document.createElement("div");
      root.className = "peek-skeleton";

      // ① Header
      const header = document.createElement("div");
      header.className = "sk-zone-header";
      const navGroup = document.createElement("div");
      navGroup.className = "sk-nav-group";
      navGroup.append(sk("sk-nav-item"), sk("sk-nav-item"), sk("sk-nav-item"), sk("sk-nav-item"));
      header.append(sk("sk-logo"), navGroup, sk("sk-header-btn"));

      // ② Hero
      const hero = document.createElement("div");
      hero.className = "sk-zone-hero";
      hero.appendChild(sk("sk-hero-bg"));
      const heroContent = document.createElement("div");
      heroContent.className = "sk-hero-content";
      heroContent.append(
        sk("sk-hero-tag"), sk("sk-hero-title"), sk("sk-hero-title2"),
        sk("sk-hero-sub"), sk("sk-hero-sub2"), sk("sk-hero-cta"),
      );
      hero.appendChild(heroContent);

      // ③ Sub-nav
      const subnav = document.createElement("div");
      subnav.className = "sk-zone-subnav";
      for (let i = 0; i < 6; i++) subnav.appendChild(sk("sk-subnav-item"));

      // ④ Body (main + sidebar)
      const body = document.createElement("div");
      body.className = "sk-zone-body";

      // Main content
      const main = document.createElement("div");
      main.className = "sk-zone-main";

      // Card grid
      const cardGrid = document.createElement("div");
      cardGrid.className = "sk-card-grid";
      for (let i = 0; i < 3; i++) {
        const card = document.createElement("div");
        card.className = "sk-card";
        card.append(sk("sk-card-img"), sk("sk-card-tag"), sk("sk-card-t1"), sk("sk-card-t2"), sk("sk-card-meta"));
        cardGrid.appendChild(card);
      }

      // Article list
      const articleList = document.createElement("div");
      articleList.className = "sk-article-list";
      for (let i = 0; i < 3; i++) {
        const item = document.createElement("div");
        item.className = "sk-article-item";
        const right = document.createElement("div");
        right.className = "sk-article-right";
        right.append(sk("sk-art-t"), sk("sk-art-t2"), sk("sk-art-desc"), sk("sk-art-desc2"), sk("sk-art-meta"));
        item.append(sk("sk-article-thumb"), right);
        articleList.appendChild(item);
      }

      main.append(sk("sk-section-title"), cardGrid, sk("sk-section-title"), articleList);

      // Sidebar
      const sidebar = document.createElement("div");
      sidebar.className = "sk-zone-sidebar";

      // Featured card
      const sideFeatured = document.createElement("div");
      sideFeatured.append(sk("sk-sidebar-title"), sk("sk-sidebar-card"));

      // Ranking
      const sideRanking = document.createElement("div");
      sideRanking.appendChild(sk("sk-sidebar-title"));
      for (let i = 0; i < 4; i++) {
        const item = document.createElement("div");
        item.className = "sk-sidebar-item";
        item.append(sk("sk-sidebar-num"), sk("sk-sidebar-line"));
        sideRanking.appendChild(item);
      }

      // Tags
      const sideTags = document.createElement("div");
      sideTags.appendChild(sk("sk-sidebar-title"));
      const tagGroup = document.createElement("div");
      tagGroup.className = "sk-tag-group";
      [60, 78, 48, 66, 86, 52].forEach((w) => {
        const tag = sk("sk-sidebar-tag");
        tag.style.width = `${w}px`;
        tagGroup.appendChild(tag);
      });
      sideTags.appendChild(tagGroup);

      sidebar.append(sideFeatured, sideRanking, sideTags);

      body.append(main, sidebar);

      // ⑤ Footer
      const footer = document.createElement("div");
      footer.className = "sk-zone-footer";
      const footerGrid = document.createElement("div");
      footerGrid.className = "sk-footer-grid";
      for (let i = 0; i < 4; i++) {
        const col = document.createElement("div");
        col.className = "sk-footer-col";
        col.append(sk("sk-footer-title"), sk("sk-footer-link"), sk("sk-footer-link2"), sk("sk-footer-link3"), sk("sk-footer-link2"));
        footerGrid.appendChild(col);
      }
      const footerBottom = document.createElement("div");
      footerBottom.className = "sk-footer-bottom";
      const footerSocial = document.createElement("div");
      footerSocial.className = "sk-footer-social";
      footerSocial.append(sk("sk-footer-icon"), sk("sk-footer-icon"), sk("sk-footer-icon"));
      footerBottom.append(sk("sk-footer-copy"), footerSocial);
      footer.append(footerGrid, footerBottom);

      root.append(header, hero, subnav, body, footer);
      return root;
    }

    /* ── Real skeleton: cache + DOM analysis ── */

    getRealSkeletonCacheKey(href) {
      if (!href) return "";
      try {
        return new URL(href).origin;
      } catch (_) {
        return href;
      }
    }

    getCachedRealSkeleton(href) {
      const key = this.getRealSkeletonCacheKey(href);
      if (!key || !this.realSkeletonCache.has(key)) return null;
      const cached = this.realSkeletonCache.get(key);
      if (Date.now() - cached.createdAt > 10 * 60 * 1000) {
        this.realSkeletonCache.delete(key);
        return null;
      }
      const container = document.createElement("div");
      container.innerHTML = cached.html;
      return container.firstElementChild;
    }

    storeRealSkeleton(href, layout) {
      const key = this.getRealSkeletonCacheKey(href);
      if (!key) return;
      const skeleton = this.generateRealSkeletonFromLayout(layout);
      this.realSkeletonCache.set(key, {
        html: skeleton.outerHTML,
        createdAt: Date.now(),
      });
      return skeleton;
    }

    generateRealSkeletonFromLayout(blocks) {
      const container = document.createElement("div");
      container.style.cssText = "position:absolute;inset:0;pointer-events:none;overflow:hidden;";

      const maxBlocks = 40;
      const sorted = blocks
        .filter((b) => b.w > 20 && b.h > 8)
        .sort((a, b) => a.y - b.y || a.x - b.x)
        .slice(0, maxBlocks);

      sorted.forEach((block, i) => {
        const el = document.createElement("div");
        el.className = block.img ? "sk-real-block sk-real-img" : "sk-real-block";
        el.style.cssText =
          `left:${block.x}px;top:${block.y}px;width:${block.w}px;height:${block.h}px;` +
          `animation-delay:${(i * 0.04).toFixed(2)}s;`;
        container.appendChild(el);
      });

      return container;
    }

    mountPreviewLayer(peekPanel, sourcePreviewUrl, linkRect, webviewId) {
      if (!peekPanel) return null;
      this.removePreviewLayer(peekPanel);
      const previewLayer = this.createPreviewLayer(sourcePreviewUrl, linkRect, webviewId);
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
      this.focusPeekWebview(webviewId);
    }

    async startPeekNavigation(webview, webviewId = "") {
      const pendingSrc = webview?.dataset?.pendingSrc;
      if (!webview || !pendingSrc) return;
      const data = this.webviews.get(webviewId);
      if (data && this.isUsablePeekUrl(pendingSrc)) {
        data.currentUrl = pendingSrc;
      }
      if (data?.relatedTabId) {
        this.logOpenAction("runtime-tab:navigate", {
          webviewId,
          tabId: data.relatedTabId,
          url: pendingSrc,
        });
        await this.updateTab(data.relatedTabId, { url: pendingSrc });
        delete webview.dataset.pendingSrc;
        return;
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

      if (LOADING_ANIMATION_CONFIG.mode === "real") {
        webview.addEventListener("loadstop", () => {
          this.analyzeRealSkeletonThenReveal(webview, webviewId, markStable);
        }, { once: true });
      } else {
        webview.addEventListener("loadstop", markStable, { once: true });
      }
    }

    analyzeRealSkeletonThenReveal(webview, webviewId, markStable) {
      const data = this.webviews.get(webviewId);
      const href = data?.currentUrl || data?.initialUrl || "";

      if (this.getCachedRealSkeleton(href)) {
        markStable();
        return;
      }

      const analysisCode = `
        (() => {
          const vw = window.innerWidth || 800;
          const vh = window.innerHeight || 600;
          const blocks = [];
          const skip = new Set(['SCRIPT','STYLE','LINK','META','NOSCRIPT','SVG','PATH','BR','HR']);
          const walk = (el, depth) => {
            if (!el || depth > 8 || skip.has(el.tagName)) return;
            const r = el.getBoundingClientRect();
            if (!r.width || !r.height || r.width < 24 || r.height < 10) return;
            if (r.bottom < -10 || r.top > vh + 10 || r.right < -10 || r.left > vw + 10) return;
            const area = r.width * r.height;
            const pageArea = vw * vh;
            if (area / pageArea > 0.92) { for (const c of el.children) walk(c, depth + 1); return; }
            const isImg = el.tagName === 'IMG' || el.tagName === 'PICTURE' || el.tagName === 'VIDEO';
            const big = r.height > 80 && r.width > 160 && el.children.length >= 2;
            blocks.push({
              x: Math.round(Math.max(0, r.left)),
              y: Math.round(Math.max(0, r.top)),
              w: Math.round(Math.min(r.width, vw)),
              h: Math.round(Math.min(r.height, vh)),
              img: isImg,
            });
            if (big && !isImg) { for (const c of el.children) walk(c, depth + 1); }
          };
          const root = document.querySelector('main, [role="main"], #root > div, #app > div, body > div, body > section');
          if (root) { for (const c of root.children) walk(c, 0); }
          else { for (const c of document.body.children) walk(c, 0); }
          return { blocks, vw, vh };
        })()
      `;

      try {
        webview.executeScript({ code: analysisCode, runAt: "document_idle" }, (results) => {
          if (chrome.runtime.lastError) { markStable(); return; }
          const result = Array.isArray(results) ? results[0] : results;
          if (result?.blocks?.length) {
            const skeleton = this.storeRealSkeleton(href, result.blocks);
            if (skeleton) {
              const previewLayer = this.webviews.get(webviewId)?.divContainer
                ?.querySelector?.(":scope > .peek-panel > .peek-source-preview");
              if (previewLayer && !previewLayer.querySelector(".sk-real-block")) {
                const existing = previewLayer.querySelector(".peek-skeleton");
                if (existing) existing.remove();
                previewLayer.appendChild(skeleton);
              }
            }
          }
          markStable();
        });
      } catch (_) {
        markStable();
      }
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
          const webview = data?.webview;
          if (webview?.isConnected) {
            try {
              webview.executeScript({
                code: `void document.body?.offsetHeight;`,
                runAt: "document_idle",
              }, () => { void chrome.runtime.lastError; });
            } catch (_) {}
          }
          await this.waitForAnimationFrames(3);
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
          const previewLayer = currentPanel.querySelector(":scope > .peek-source-preview");
          if (previewLayer && typeof previewLayer.animate === "function") {
            const anim = previewLayer.animate(
              [{ opacity: 1 }, { opacity: 0 }],
              { duration: 240, easing: "ease-out", fill: "forwards" }
            );
            anim.finished
              .then(() => this.removePreviewLayer(currentPanel))
              .catch(() => this.removePreviewLayer(currentPanel));
          } else {
            this.removePreviewLayer(currentPanel);
          }
          current.webviewRevealed = true;
          this.installPeekWebviewShortcutGuard(webviewId);
          this.focusPeekWebview(webviewId);
        })
        .finally(() => {
          const current = this.webviews.get(webviewId);
          if (current) {
            current.webviewRevealPending = false;
          }
        });
    }

    installPeekWebviewShortcutGuard(webviewId) {
      const data = this.webviews.get(webviewId);
      const webview = data?.webview;
      if (!webview?.isConnected) return;
      try {
        webview.executeScript(
          {
            code: `
              (() => {
                if (window.__arcPeekShortcutGuardInstalled) return true;
                window.__arcPeekShortcutGuardInstalled = true;
                document.addEventListener("keydown", (event) => {
                  const key = String(event.key || "").toLowerCase();
                  const command = event.metaKey || event.ctrlKey;
                  if (!command || event.altKey || event.shiftKey) return;
                  if (key !== "w" && key !== "r" && key !== "f") return;
                  event.preventDefault();
                  event.stopPropagation();
                  event.stopImmediatePropagation?.();
                  if (key === "r") {
                    try {
                      window.location.reload();
                    } catch (_) {}
                  }
                }, true);
                return true;
              })();
            `,
            runAt: "document_start",
          },
          () => {
            void chrome.runtime.lastError;
          }
        );
      } catch (_) {}
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
        {
          content: this.iconUtils.copyLink,
          action: () => this.copyPeekUrl(webviewId),
          cls: "peek-sidebar-button copy-link-button",
          label: "Copy Link",
          keepControlsOpen: true,
        },
      ];

      const fragment = document.createDocumentFragment();
      buttons.forEach((button) => {
        const element = this.createOptionsButton(
          button.content,
          () => {
            if (!button.keepControlsOpen) {
              this.hideSidebarControls(thisElement);
            }
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
          (event) => {
            this.hideSidebarControls(controlsContainer);
            action(event);
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
          (event) => {
            action(event);
            const feedbackType = event?.currentTarget?.dataset?.arcpeekFeedback || "";
            if (feedbackType === "back" || feedbackType === "forward") {
              this.syncPeekNavigationControls(webviewId, {
                delayDisabledButtons: [feedbackType],
              });
              return;
            }
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
        (event) => {
          this.triggerButtonFeedback(event?.currentTarget, "reload");
          this.reloadPeek(webviewId);
        },
        "reload-button"
      );
      const menu = document.createElement("div");
      menu.setAttribute("class", "peek-open-actions-menu peek-navigation-actions-menu");

      const backButton = createAction(
        this.iconUtils.back,
        "Back",
        (event) => {
          this.triggerButtonFeedback(event?.currentTarget, "back");
          this.goPeekBack(webviewId);
        },
        "back-button"
      );
      backButton.dataset.arcpeekFeedback = "back";
      const forwardButton = createAction(
        this.iconUtils.forward,
        "Forward",
        (event) => {
          this.triggerButtonFeedback(event?.currentTarget, "forward");
          this.goPeekForward(webviewId);
        },
        "forward-button"
      );
      forwardButton.dataset.arcpeekFeedback = "forward";
      backButton.disabled = true;
      forwardButton.disabled = true;

      menu.appendChild(backButton);
      menu.appendChild(forwardButton);
      group.appendChild(reloadButton);
      group.appendChild(menu);
      return group;
    }

    triggerButtonFeedback(button, type) {
      if (!button) return;
      const className = `arcpeek-feedback-${type}`;
      button.classList.remove(className);
      void button.offsetWidth;
      button.classList.add(className);
      const duration = this.getButtonFeedbackDuration(type);
      window.setTimeout(() => {
        button.classList.remove(className);
      }, duration);
    }

    triggerCopyButtonFeedback(button) {
      if (!button) return;
      const originalIcon = button.dataset.originalIcon || button.innerHTML;
      button.dataset.originalIcon = originalIcon;
      this.triggerButtonFeedback(button, "copy");
      button.innerHTML = this.iconUtils.check;
      window.clearTimeout(button._arcPeekCopyFeedbackTimer);
      button._arcPeekCopyFeedbackTimer = window.setTimeout(() => {
        if (!button.isConnected) return;
        button.innerHTML = button.dataset.originalIcon || originalIcon;
        button.classList.remove("arcpeek-feedback-copy");
      }, 1200);
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
        if (button.disabled) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation?.();
          return;
        }
        actionTriggered = true;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();
        if (button.classList.contains("copy-link-button")) {
          this.triggerCopyButtonFeedback(button);
        }
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

    async copyTextToClipboard(text) {
      const value = String(text || "");
      if (!value) return false;

      try {
        await navigator.clipboard.writeText(value);
        return true;
      } catch (_) {}

      try {
        const selection = window.getSelection();
        const previousRanges = [];
        if (selection) {
          for (let index = 0; index < selection.rangeCount; index += 1) {
            previousRanges.push(selection.getRangeAt(index).cloneRange());
          }
        }

        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand("copy");
        textarea.remove();

        if (selection) {
          selection.removeAllRanges();
          previousRanges.forEach((range) => selection.addRange(range));
        }

        return copied;
      } catch (_) {}

      return false;
    }

    copyPeekUrl(webviewId) {
      const url = this.getPeekUrl(webviewId);
      if (!url) return Promise.resolve(false);
      return this.copyTextToClipboard(url);
    }

    async animatePeekExpandToViewport(webviewId) {
      const data = this.webviews.get(webviewId);
      if (!data) return null;
      const activeWebview = document.querySelector(".active.visible.webpageview webview");
      const targetRect = this.getPeekViewportRect(activeWebview);
      await this.animatePeekPanelToRect(webviewId, targetRect, {
        durationMs: 340,
        stage: "expand",
      });
      return targetRect;
    }

    getTabbarDockInfo() {
      const tabbar = document.getElementById("tabs-tabbar-container");
      const rect = tabbar?.getBoundingClientRect?.();
      const classList = tabbar?.classList;
      const side =
        classList?.contains("right")
          ? "right"
          : classList?.contains("left")
            ? "left"
            : classList?.contains("bottom")
              ? "bottom"
              : "top";
      return {
        element: tabbar || null,
        rect: rect?.width && rect?.height ? this.rectToPlainObject(rect) : null,
        side,
      };
    }

    getBackgroundTabHandoffRect(panelRect) {
      const dock = this.getTabbarDockInfo();
      const width = Math.max(96, Math.min(panelRect.width * 0.24, 220));
      const height = Math.max(72, Math.min(panelRect.height * 0.18, 180));
      const tabbarRect = dock.rect;
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth || panelRect.right;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || panelRect.bottom;
      const centerX = tabbarRect ? tabbarRect.left + tabbarRect.width / 2 : viewportWidth / 2;
      const centerY = tabbarRect ? tabbarRect.top + tabbarRect.height / 2 : viewportHeight / 2;

      if (dock.side === "right") {
        return {
          left: (tabbarRect?.left || viewportWidth) + Math.min(36, width * 0.28),
          top: centerY - height / 2,
          width,
          height,
        };
      }
      if (dock.side === "left") {
        return {
          left: (tabbarRect?.right || 0) - width - Math.min(36, width * 0.28),
          top: centerY - height / 2,
          width,
          height,
        };
      }
      if (dock.side === "bottom") {
        return {
          left: centerX - width / 2,
          top: (tabbarRect?.top || viewportHeight) + Math.min(28, height * 0.24),
          width,
          height,
        };
      }
      return {
        left: centerX - width / 2,
        top: (tabbarRect?.bottom || 0) - height - Math.min(28, height * 0.24),
        width,
        height,
      };
    }

    getSplitHandoffRect() {
      const activeWebview = document.querySelector(".active.visible.webpageview webview");
      const viewportRect = this.getPeekViewportRect(activeWebview);
      if (!viewportRect?.width || !viewportRect?.height) return null;
      return {
        left: Math.round(viewportRect.left + viewportRect.width / 2),
        top: Math.round(viewportRect.top),
        width: Math.max(1, Math.round(viewportRect.width / 2)),
        height: Math.max(1, Math.round(viewportRect.height)),
      };
    }

    async animatePeekPanelToRect(webviewId, targetRect, options = {}) {
      const {
        durationMs = 300,
        easing = "cubic-bezier(0.16, 0.88, 0.22, 1)",
        fadeOut = false,
        borderRadius = "0",
        boxShadow = "none",
        stage = "handoff",
      } = options;
      const data = this.webviews.get(webviewId);
      const peekContainer = data?.divContainer;
      const peekPanel = peekContainer?.querySelector(".peek-panel");
      if (!data || !peekContainer || !peekPanel || !targetRect) return null;

      const currentRect = peekPanel.getBoundingClientRect();
      if (!currentRect?.width || !currentRect?.height) return null;
      data.handoffInProgress = true;
      data.disableSourceCloseAnimation = true;
      peekPanel.getAnimations?.().forEach((animation) => animation.cancel());
      peekPanel.removeAttribute("data-has-finished-animation");
      peekPanel.style.position = "fixed";
      peekPanel.style.left = `${currentRect.left}px`;
      peekPanel.style.top = `${currentRect.top}px`;
      peekPanel.style.width = `${currentRect.width}px`;
      peekPanel.style.height = `${currentRect.height}px`;
      peekPanel.style.margin = "0";
      peekPanel.style.right = "auto";
      peekPanel.style.bottom = "auto";
      peekPanel.style.transform = "none";
      peekPanel.style.transformOrigin = "center center";
      peekPanel.style.transition = "none";
      peekPanel.style.opacity = "1";
      void peekPanel.offsetWidth;

      peekContainer.classList.add("expanding-to-tab");
      peekContainer.style.pointerEvents = "none";
      if (this.shouldScaleBackgroundPage()) {
        document.body.classList.remove("peek-open");
      }
      this.updatePeekTabVisibility();
      await this.waitForAnimationFrames(2);

      this.logOpenAction(`open-action:${stage}:animation:start`, {
        webviewId,
        currentRect: this.rectToPlainObject(currentRect),
        targetRect,
      });

      const keyframes = [
        {
          left: `${currentRect.left}px`,
          top: `${currentRect.top}px`,
          width: `${currentRect.width}px`,
          height: `${currentRect.height}px`,
          opacity: 1,
          borderRadius: getComputedStyle(peekPanel).borderRadius,
          boxShadow: getComputedStyle(peekPanel).boxShadow,
        },
        {
          left: `${targetRect.left}px`,
          top: `${targetRect.top}px`,
          width: `${targetRect.width}px`,
          height: `${targetRect.height}px`,
          opacity: fadeOut ? 0 : 1,
          borderRadius,
          boxShadow,
        },
      ];

      try {
        const animation = peekPanel.animate(keyframes, {
          duration: durationMs,
          easing,
          fill: "forwards",
        });
        await animation.finished;
      } catch (_) {
      } finally {
        peekPanel.style.left = `${targetRect.left}px`;
        peekPanel.style.top = `${targetRect.top}px`;
        peekPanel.style.width = `${targetRect.width}px`;
        peekPanel.style.height = `${targetRect.height}px`;
        peekPanel.style.opacity = fadeOut ? "0" : "1";
        peekPanel.style.borderRadius = borderRadius;
        peekPanel.style.boxShadow = boxShadow;
        peekPanel.style.transition = "none";
      }

      this.logOpenAction(`open-action:${stage}:animation:done`, { webviewId });
      return targetRect;
    }

    async createHandoffSnapshotOverlay(rect, options = {}) {
      const { label = "handoff", tabId = null } = options;
      if (!rect?.width || !rect?.height) return null;
      let dataUrl = null;
      try {
        dataUrl = await this.captureUIArea({
          left: Math.max(0, Math.round(rect.left)),
          top: Math.max(0, Math.round(rect.top)),
          width: Math.max(1, Math.round(rect.width)),
          height: Math.max(1, Math.round(rect.height)),
        });
      } catch (error) {
        this.logOpenAction("open-action:snapshot:capture-failed", {
          label,
          tabId,
          message: error?.message || String(error),
        });
        return null;
      }
      if (!dataUrl) return null;

      const overlay = document.createElement("div");
      overlay.className = "arcpeek-handoff-snapshot";
      overlay.dataset.arcpeekSnapshot = label;
      if (tabId) overlay.dataset.tabId = String(tabId);
      overlay.style.position = "fixed";
      overlay.style.left = `${Math.round(rect.left)}px`;
      overlay.style.top = `${Math.round(rect.top)}px`;
      overlay.style.width = `${Math.max(1, Math.round(rect.width))}px`;
      overlay.style.height = `${Math.max(1, Math.round(rect.height))}px`;
      overlay.style.zIndex = "2";
      overlay.style.pointerEvents = "none";
      overlay.style.backgroundImage = `url("${dataUrl}")`;
      overlay.style.backgroundSize = "100% 100%";
      overlay.style.backgroundRepeat = "no-repeat";
      overlay.style.backgroundPosition = "center";
      overlay.style.opacity = "1";
      overlay.style.transition = "opacity 160ms ease";
      overlay.style.contain = "layout paint style";
      document.getElementById("browser")?.appendChild(overlay);
      this.logOpenAction("open-action:snapshot:created", {
        label,
        tabId,
        rect,
      });
      return overlay;
    }

    releaseHandoffSnapshotOverlay(overlay) {
      if (!overlay?.isConnected) return;
      overlay.style.opacity = "0";
      window.setTimeout(() => overlay.remove(), 180);
    }

    async holdSnapshotUntilTabReady(overlay, tabId, options = {}) {
      const { timeoutMs = 9000, minHoldMs = 180 } = options;
      if (!overlay) return;
      const startedAt = Date.now();
      if (tabId) {
        await this.waitForTabComplete(tabId, timeoutMs);
      } else {
        await new Promise((resolve) => window.setTimeout(resolve, minHoldMs));
      }
      const elapsed = Date.now() - startedAt;
      if (elapsed < minHoldMs) {
        await new Promise((resolve) => window.setTimeout(resolve, minHoldMs - elapsed));
      }
      this.releaseHandoffSnapshotOverlay(overlay);
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

    getButtonFeedbackDuration(type) {
      if (type === "copy") return 1200;
      if (type === "reload") return 780;
      if (type === "back" || type === "forward") return 520;
      return 520;
    }

    syncPeekNavigationControls(webviewId, options = {}) {
      const data = this.webviews.get(webviewId);
      const container = data?.divContainer;
      if (!container?.isConnected) return;
      const delayed = new Set([
        ...(data.navigationDisableDelayDirections || []),
        ...(options.delayDisabledButtons || []),
      ]);

      const navigationGroup = container.querySelector(
        `.peek-navigation-actions[data-peek-webview-id="${webviewId}"]`
      );
      if (!navigationGroup) return;

      const backButton = navigationGroup.querySelector(".back-button");
      const forwardButton = navigationGroup.querySelector(".forward-button");
      const applyButtonState = (button, direction) => {
        if (!button) return;
        window.clearTimeout(button._arcPeekDelayedDisableTimer);
        const shouldDisable = !this.canNavigatePeek(webviewId, direction);
        if (!shouldDisable || !delayed.has(direction)) {
          button.disabled = shouldDisable;
          return;
        }
        button.disabled = false;
        button._arcPeekDelayedDisableTimer = window.setTimeout(() => {
          data.navigationDisableDelayDirections?.delete(direction);
          button.disabled = !this.canNavigatePeek(webviewId, direction);
        }, this.getButtonFeedbackDuration(direction));
      };
      applyButtonState(backButton, "back");
      applyButtonState(forwardButton, "forward");
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

    startPeekFind(webviewId) {
      const webview = this.webviews.get(webviewId)?.webview;
      if (!webview?.isConnected) return false;
      try {
        if (typeof webview.find === "function") {
          webview.find("", { findNext: false }, () => {
            void chrome.runtime.lastError;
          });
          return true;
        }
      } catch (_) {}
      this.logOpenAction("shortcut:find:blocked", {
        webviewId,
        message: "No reliable peek find UI is available; shortcut was intercepted to protect the source tab.",
      });
      return false;
    }

    goPeekBack(webviewId) {
      const data = this.webviews.get(webviewId);
      if (!data || !this.canNavigatePeek(webviewId, "back")) return;

      data.navigationDisableDelayDirections =
        data.navigationDisableDelayDirections || new Set();
      data.navigationDisableDelayDirections.add("back");
      data.navigationIndex -= 1;
      const targetUrl = data.navigationHistory[data.navigationIndex];
      if (targetUrl) this.navigatePeekToUrl(webviewId, targetUrl, { recordHistory: false });
    }

    goPeekForward(webviewId) {
      const data = this.webviews.get(webviewId);
      if (!data || !this.canNavigatePeek(webviewId, "forward")) return;

      data.navigationDisableDelayDirections =
        data.navigationDisableDelayDirections || new Set();
      data.navigationDisableDelayDirections.add("forward");
      data.navigationIndex += 1;
      const targetUrl = data.navigationHistory[data.navigationIndex];
      if (targetUrl) this.navigatePeekToUrl(webviewId, targetUrl, { recordHistory: false });
    }

    async openNewTab(webviewId, active) {
      const url = this.getPeekUrl(webviewId);
      if (!url) return;

      this.logOpenAction("open-action:new-tab:start", {
        webviewId,
        active,
        url,
        relatedTabId: this.webviews.get(webviewId)?.relatedTabId || null,
      });

      if (!active) {
        const adopted = PEEK_RELATED_TAB_ADOPTION_CONFIG.enabled
          ? await this.detachPeekRuntimeTab(webviewId, {
              active: false,
              reason: "background-tab",
            })
          : null;
        if (adopted?.adopted && adopted?.tab?.id) {
          await this.disposePeek(webviewId, { animated: false, closeRuntimeTab: false });
          return;
        }
        const tab = await this.createTab({ url: url, active: false });
        this.logOpenAction("open-action:new-tab:fallback-create", {
          webviewId,
          active,
          tabId: tab?.id || null,
          error: chrome.runtime.lastError?.message || "",
        });
        const panelRect = this.webviews.get(webviewId)?.divContainer
          ?.querySelector(".peek-panel")
          ?.getBoundingClientRect?.();
        const targetRect = panelRect ? this.getBackgroundTabHandoffRect(panelRect) : null;
        await this.animatePeekPanelToRect(webviewId, targetRect, {
          durationMs: 440,
          fadeOut: true,
          borderRadius: "12px",
          stage: "background-tab",
        });
        await this.disposePeek(webviewId, { animated: false, closeRuntimeTab: true });
        return;
      }

      const data = this.webviews.get(webviewId);
      if (!data) return;

      const targetRect = await this.animatePeekExpandToViewport(webviewId);
      const overlay = await this.createHandoffSnapshotOverlay(targetRect, {
        label: "new-tab",
      });
      const adopted = PEEK_RELATED_TAB_ADOPTION_CONFIG.enabled
        ? await this.detachPeekRuntimeTab(webviewId, {
            active: true,
            reason: "foreground-tab",
          })
          : null;
      if (adopted?.adopted && adopted?.tab?.id) {
        await this.disposePeek(webviewId, { animated: false, closeRuntimeTab: false });
        void this.holdSnapshotUntilTabReady(overlay, adopted.tab.id);
        return;
      }
      const tab = await this.createTab({ url: url, active: true });
      this.logOpenAction("open-action:new-tab:fallback-create", {
        webviewId,
        active,
        tabId: tab?.id || null,
        error: chrome.runtime.lastError?.message || "",
      });
      await this.disposePeek(webviewId, { animated: false, closeRuntimeTab: true });
      void this.holdSnapshotUntilTabReady(overlay, tab?.id || null);
    }

    async openInSourceTab(webviewId) {
      const url = this.getPeekUrl(webviewId);
      if (!url) return;

      const data = this.webviews.get(webviewId);
      if (!data) return;

      const sourceTabId = this.getOwningTabId(data);
      if (!sourceTabId) return;

      this.logOpenAction("open-action:source-tab:start", {
        webviewId,
        sourceTabId,
        relatedTabId: data.relatedTabId || null,
        url,
      });

      const targetRect = await this.animatePeekExpandToViewport(webviewId);
      const overlay = await this.createHandoffSnapshotOverlay(targetRect, {
        label: "source-tab",
        tabId: sourceTabId,
      });
      await this.updateTab(sourceTabId, { url, active: true });
      this.logOpenAction("open-action:source-tab:update-source", {
        webviewId,
        sourceTabId,
        error: chrome.runtime.lastError?.message || "",
      });
      await this.disposePeek(webviewId, {
        animated: false,
        closeRuntimeTab: true,
      });
      void this.holdSnapshotUntilTabReady(overlay, sourceTabId);
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
      this.logOpenAction("open-action:split:start", {
        webviewId,
        relatedTabId: data?.relatedTabId || null,
        url,
      });

      try {
        const [currentTab] = await this.queryTabs({ active: true, currentWindow: true });
        if (!currentTab?.id) return;

        const currentFresh = await this.getTab(currentTab.id);
        const tileId = crypto.randomUUID();
        const layout = "row";

        await this.closeArcPeekSplitTabs(currentFresh.id);

        const splitTargetRect = this.getSplitHandoffRect();
        const animationPromise = this.animatePeekPanelToRect(webviewId, splitTargetRect, {
          durationMs: 320,
          borderRadius: "0",
          stage: "split",
        });
        const adopted = PEEK_RELATED_TAB_ADOPTION_CONFIG.enabled
          ? await this.detachPeekRuntimeTab(webviewId, {
              active: true,
              reason: "split-tab",
            })
          : null;
        let newTab = adopted?.adopted ? adopted.tab : null;
        if (!newTab?.id) {
          newTab = await this.createTab({
            url,
            active: true,
            index: typeof currentFresh.index === "number" ? currentFresh.index + 1 : undefined,
            openerTabId: currentFresh.id,
          });
          this.logOpenAction("open-action:split:fallback-create", {
            webviewId,
            tabId: newTab?.id || null,
            error: chrome.runtime.lastError?.message || "",
          });
        }
        if (!newTab?.id) return;

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
        await animationPromise;
        const overlay = await this.createHandoffSnapshotOverlay(splitTargetRect, {
          label: "split-tab",
          tabId: newTab.id,
        });
        await this.disposePeek(webviewId, {
          animated: false,
          closeRuntimeTab: !adopted?.adopted,
        });
        void this.holdSnapshotUntilTabReady(overlay, newTab.id);
        this.logOpenAction("open-action:split:done", {
          webviewId,
          sourceTabId: currentFresh.id,
          splitTabId: newTab.id,
          adopted: !!adopted?.adopted,
        });
      } catch (error) {
        this.logOpenAction("open-action:split:error", {
          webviewId,
          message: error?.message || String(error),
        });
      }
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

    #shouldAutoOpenLinkEvent(event, link) {
      if (!event || event.button !== 0) return false;

      const autoOpenList = this.#getAutoOpenList();
      if (!autoOpenList.length) return false;

      if (
        autoOpenList.includes("pin") &&
        this.#isCurrentTabPinned()
      ) {
        if (link) {
          try {
            const linkUrl = new URL(link.href, window.location.href);
            const linkHostname = linkUrl.hostname.toLowerCase();
            const currentHostname = window.location.hostname.toLowerCase();
            if (linkHostname === currentHostname) return false;
          } catch (_e) {}
        }
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

        if (link && this.#shouldAutoOpenLinkEvent(event, link)) {
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

      try {
        const url = new URL(link.href);
        const key = `preconnect-${url.origin}`;
        if (!document.getElementById(key)) {
          const preconnect = document.createElement("link");
          preconnect.id = key;
          preconnect.rel = "preconnect";
          preconnect.href = url.origin;
          (document.head || document.documentElement).appendChild(preconnect);
        }
      } catch (_) {}

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
      copyLink: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" style="padding:3;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link2-icon lucide-link-2"><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/></svg>',
      check: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" style="padding:3;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon"><path d="M20 6 9 17l-5-5"/></svg>',
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
    get copyLink() { return this.getIcon("copyLink"); }
    get check() { return this.getIcon("check"); }
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
