/**
 * v5
 * Opens links in a peek panel, either by key combinations, holding the middle mouse button or context menu
 * Forum link: https://forum.vivaldi.net/topic/92501/open-in-dialog-mod?_=1717490394230
 *
 * New feature: Long-press left click to open pop-up
 * - Holding left click for 400ms opens links in a peek panel
 * - Features link text pulsing feedback that speeds up near trigger time
 * - Configuration options:
 *   - rightClickHoldTime: Total long-press duration (400ms)
 *   - rightClickHoldDelay: Delay before showing hold feedback (200ms)
 */
(() => {
  const DEBUG = {
    enabled: true,
    prefix: "[ArcPeek]",
  };

  const debugLog = (...args) => {
    if (DEBUG.enabled) {
      console.log(DEBUG.prefix, ...args);
    }
  };

  const ICON_CONFIG = {
      linkIcon: "", // disabled: do not render a hover trigger button next to links
      linkIconInteractionOnHover: true, // legacy-disabled: old hover trigger path
      showIconDelay: 250, // set to 0 to disable - delays showing the icon on hovering a link
      showPeekOnHoverDelay: 100, // legacy-disabled: kept only as config placeholder for old hover-trigger path
      rightClickHoldTime: 400, // Long-press duration (in milliseconds) to open the peek panel
      rightClickHoldDelay: 200, // Long-press the right button to delay the display of the progress ring (milliseconds)
    },
    CONTEXT_MENU_CONFIG = {
      menuPrefix: "[Peek]",
      linkMenuTitle: "Show Popup",
      searchMenuTitle: 'Search "%s"',
      selectSearchMenuTitle: "Search With ...",
    };

  // Wait for the browser to come to a ready state
  setTimeout(function waitPeek() {
    const browser = document.getElementById("browser");
    if (!browser) {
      return setTimeout(waitPeek, 300);
    }
    new PeekMod();
  }, 300);

  class PeekMod {
    ARC_CONFIG = Object.freeze({
      steps: 400,
      maxArcHeight: 25,
      arcHeightRatio: 0.2,
      glanceAnimationDuration: 350,
    });
    webviews = new Map();
    iconUtils = new IconUtils();
    searchEngineUtils = new SearchEngineUtils(
      (url, meta) => this.openPeek(url, undefined, meta?.rect, meta),
      (engineId, searchText) => this.openPeekSearch(engineId, searchText),
      CONTEXT_MENU_CONFIG
    );
    KEYBOARD_SHORTCUTS = {
      "Ctrl+Alt+Period": this.searchForSelectedText.bind(this),
      "Ctrl+Shift+F": this.searchForSelectedText.bind(this),
      Esc: () => this.closeLastPeek(),
    };
    // 'https://clearthis.page/?u='; stopped service?
    // change also in ArcPeek.css => &:has(webview[src^="READER_VIEW_URL"]) .reader-view-toggle
    // alternative => https://www.smry.ai/proxy?url=
    READER_VIEW_URL =
      "https://app.web-highlights.com/reader/open-website-in-reader-mode?url=";

    constructor() {
      // Check if peek CSS is supported
      this.hasPeekCSS = this.checkPeekCSSSupport();

      // Setup keyboard shortcuts
      vivaldi.tabsPrivate.onKeyboardShortcut.addListener(
        this.keyCombo.bind(this)
      );

      new WebsiteInjectionUtils(
        (navigationDetails) => this.getWebviewConfig(navigationDetails),
        (url, fromPanel, rect) => this.openPeek(url, fromPanel, rect),
        ICON_CONFIG
      );
    }

    /**
     * Check if peek CSS is supported
     */
    checkPeekCSSSupport() {
      try {
        const webpageStack = document.querySelector("#browser #webpage-stack");
        if (!webpageStack) return false;

        // The old detection read inline styles, so it always failed even when
        // the stylesheet rule existed. We only need to know whether the target
        // container is present before toggling body.peek-open.
        return true;
      } catch (e) {
        console.warn("peek CSS support check failed:", e);
        return false;
      }
    }

    /**
     * Finds the correct configuration for showing the peek
     */
    getWebviewConfig(navigationDetails) {
      if (navigationDetails.frameType !== "outermost_frame")
        return { webview: null, fromPanel: false };

      // first peek source from tab or webpanel
      let webview = document.querySelector(
        `webview[tab_id="${navigationDetails.tabId}"]`
      );
      if (webview?.closest?.(".peek-panel")) {
        return { webview: null, fromPanel: false };
      }
      if (webview)
        return { webview, fromPanel: webview.name === "vivaldi-webpanel" };

      // follow-up peek from the webpanel
      webview = Array.from(this.webviews.values()).find(
        (view) => view.fromPanel
      )?.webview;
      if (webview) return { webview, fromPanel: true };

      // follow-up peek from tab
      const activeTabId = Number(
        document.querySelector(".active.visible.webpageview webview")?.tab_id
      );
      const lastWebviewId = Array.from(this.webviews.entries()).findLast(
        ([_, data]) => !data.fromPanel && data.tabId === activeTabId
      )?.[0];
      return {
        webview: this.webviews.get(lastWebviewId)?.webview,
        fromPanel: false,
      };
    }

    /**
     * Open default search engine in peek and search for the selected text
     * @returns {Promise<void>}
     */
    async searchForSelectedText() {
      const tabs = await chrome.tabs.query({ active: true });
      vivaldi.utilities.getSelectedText(tabs[0].id, (text) =>
        this.openPeekSearch(this.searchEngineUtils.defaultSearchId, text)
      );
    }

    /**
     * Prepares url for search, then opens the peek
     * @param {String} engineId engine id of the engine to be used
     * @param {int} selectionText the text to search
     */
    async openPeekSearch(engineId, selectionText) {
      let searchRequest = await vivaldi.searchEngines.getSearchRequest(
        engineId,
        selectionText
      );
      this.openPeek(searchRequest.url);
    }

    /**
     * Handle a potential keyboard shortcut (copy from KeyboardMachine)
     * @param {number} id I don't know what this does, but it's an extra argument
     * @param {String} combination written in the form (CTRL+SHIFT+ALT+KEY)
     */
    keyCombo(id, combination) {
      const customShortcut = this.KEYBOARD_SHORTCUTS[combination];
      if (customShortcut) {
        customShortcut();
      }
    }

    /**
     * Removes the peek for a given webview
     * @param webviewId The id of the webview
     */
    removePeek(webviewId) {
      const data = this.webviews.get(webviewId);
      if (data) {
        chrome.tabs.query({}, (tabs) => {
          const tab = tabs.find(
            (tab) =>
              tab.vivExtData && tab.vivExtData.includes(`${webviewId}tabId`)
          );
          if (tab) chrome.tabs.remove(tab.id);
        });

        data.divContainer.remove();
        chrome.tabs.onRemoved.removeListener(data.tabCloseListener);
        this.webviews.delete(webviewId);
      }
    }

    /**
     * Closes the last opened peek panel
     */
    closeLastPeek() {
      if (!this.webviews.size) return;

      const webviewValues = Array.from(this.webviews.values());
      let webviewData = webviewValues.at(-1);
      if (!webviewData.fromPanel) {
        const activeWebview = document.querySelector(
          ".active.visible.webpageview webview"
        );
        const tabId = Number(activeWebview?.tab_id);
        const matchedPeek = webviewValues.findLast(
          (_data) => _data.tabId === tabId
        );
        if (matchedPeek) {
          webviewData = matchedPeek;
        }
      }

      if (webviewData) {
        const peekContainer = webviewData.divContainer;
        const panelEl = peekContainer.querySelector(".peek-panel");
        const sourceRect = webviewData.sourceRect || this.resolveSourceRect(webviewData.linkRect);
        const previewUrl = webviewData.sourcePreviewUrl || null;

        peekContainer.classList.remove("open");
        peekContainer.classList.add("closing");
        peekContainer.style.setProperty(
          "--peek-backdrop-duration",
          `${this.getBackdropDuration("closing")}ms`
        );
        this.mountPreviewLayer(panelEl, previewUrl, webviewData.linkRect);
        this.animatePeekContentOut(panelEl);
        if (this.hasPeekCSS) {
          document.body.classList.remove("peek-open");
        }
        this.animatePeekMotion(panelEl, "closing", sourceRect)
          .catch((error) => console.warn(DEBUG.prefix, "closing animation failed", error))
          .finally(() => {
            this.removePreviewLayer(panelEl);
            peekContainer.remove();
            const webviewId = Array.from(this.webviews.entries()).find(
              ([_, data]) => data.divContainer === peekContainer
            )?.[0];
            if (webviewId) {
              this.webviews.delete(webviewId);
            }
            chrome.runtime.sendMessage({ type: "peek-closed" });
          });
      }
    }

    dismissPeekInstant(webviewId) {
      const data = this.webviews.get(webviewId);
      if (!data) return;

      if (this.hasPeekCSS) {
        document.body.classList.remove("peek-open");
      }

      data.divContainer.remove();
      chrome.tabs.onRemoved.removeListener(data.tabCloseListener);
      this.webviews.delete(webviewId);
      chrome.runtime.sendMessage({ type: "peek-closed" });
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
        console.warn(DEBUG.prefix, "Failed to parse vivExtData", {
          tabId: tab?.id,
          error,
        });
        return {};
      }
    }

    async updateTabVivExtData(tabId, updater) {
      const tab = await this.getTab(tabId);
      if (chrome.runtime.lastError || !tab) {
        throw new Error(
          chrome.runtime.lastError?.message || `Unable to load tab ${tabId}`
        );
      }

      const currentViv = this.parseVivExtData(tab);
      const nextViv = typeof updater === "function" ? updater(currentViv, tab) : updater;
      await this.updateTab(tabId, { vivExtData: JSON.stringify(nextViv) });
      if (chrome.runtime.lastError) {
        throw new Error(chrome.runtime.lastError.message);
      }
      return nextViv;
    }

    /**
     * Checks if the current window is the correct window to show the peek and then opens it
     * @param {string} linkUrl the url to load
     * @param {boolean} fromPanel indicates whether the peek is opened from a panel
     * @param {Object} rect the bounding rect of the link
     */
    openPeek(linkUrl, fromPanel = undefined, rect = undefined, meta = undefined) {
      debugLog("peek request", {
        linkUrl,
        fromPanel,
        rect,
        meta,
      });
      if (this.webviews.size > 0) {
        debugLog("peek request ignored", {
          reason: "peek-already-open",
          linkUrl,
          fromPanel,
          meta,
        });
        return;
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

    /**
     * Opens a link in a peek-like display in the current visible tab
     * @param {string} linkUrl the url to load
     * @param {boolean} fromPanel indicates whether the peek is opened from a panel
     * @param {Object} linkRect coordinates of the link that triggered the peek
     */
    showPeek(linkUrl, fromPanel, linkRect = undefined, meta = undefined) {
      this.buildPeek(linkUrl, fromPanel, linkRect, meta).catch((error) => {
        console.error(DEBUG.prefix, "showPeek failed", error, {
          linkUrl,
          fromPanel,
          linkRect,
          meta,
        });
      });
    }

    async buildPeek(linkUrl, fromPanel, linkRect = undefined, meta = undefined) {
      debugLog("showPeek start", {
        linkUrl,
        fromPanel,
        linkRect,
        meta,
      });
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

      const activeWebview = document.querySelector(
        ".active.visible.webpageview webview"
      );
      const tabId =
        !fromPanel && activeWebview ? Number(activeWebview.tab_id) : null;

      // ESC key closing logic is in closeLastPeek method

      this.webviews.set(webviewId, {
        divContainer: peekContainer,
        webview: webview,
        fromPanel: fromPanel,
        tabId: tabId,
        linkRect: linkRect, // Store for closing animation
        sourcePreviewUrl: null,
        sourceRect: null,
      });

      // remove peeks when tab is closed without closing them explicitly
      if (!fromPanel) {
        const clearWebviews = (closedTabId) => {
          if (tabId === closedTabId) {
            this.webviews.forEach(
              (view, key) =>
                view.tabCloseListener === clearWebviews &&
                this.closeLastPeek()
            );
            chrome.tabs.onRemoved.removeListener(clearWebviews);
          }
        };
        this.webviews.get(webviewId).tabCloseListener = clearWebviews;
        chrome.tabs.onRemoved.addListener(clearWebviews);
      }

      //#region peek panel properties
      peekPanel.setAttribute("class", "peek-panel");
      peekContent.setAttribute("class", "peek-content");

      if (activeWebview) {
        const rect = activeWebview.getBoundingClientRect();
        const webviewContainerRect = document
          .getElementById("webview-container")
          ?.getBoundingClientRect();
        const targetWidth = rect.width * 0.8;
        const targetHeight = webviewContainerRect?.height || rect.height;

        peekPanel.style.width = targetWidth + "px";
        peekPanel.style.height = targetHeight + "px";

        if (linkRect) {
          // linkRect is relative to webview viewport.
          // rect is the webview's position relative to the browser window.
          const startX = rect.left + linkRect.left + linkRect.width / 2;
          const startY = rect.top + linkRect.top + linkRect.height / 2;

          // Variables for animation. Since .peek-panel is centered in .peek-container (fixed 0,0,0,0),
          // its base position is (window.innerWidth/2, window.innerHeight/2).
          peekPanel.style.setProperty("--start-x", `${startX}px`);
          peekPanel.style.setProperty("--start-y", `${startY}px`);
          peekPanel.style.setProperty("--start-width", `${linkRect.width}px`);
          peekPanel.style.setProperty("--start-height", `${linkRect.height}px`);

          peekPanel.style.setProperty("--end-width", `${targetWidth}px`);
          peekPanel.style.setProperty("--end-height", `${targetHeight}px`);
        }
      }

      //#endregion

      //#region optionsContainer properties
      optionsContainer.setAttribute("class", "options-container");
      optionsContainer.hidden = true;
      sidebarControls.setAttribute("class", "peek-sidebar-controls");
      this.showSidebarControls(webviewId, sidebarControls);
      //#endregion

      //#region webview properties
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
      fromPanel &&
        webview.addEventListener("mousedown", (event) =>
          event.stopPropagation()
        );
      //#endregion

      //#region peek container properties
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

          // Calculate the cursor position based on the click location
          const offsetX =
            event.clientX - inputElement.getBoundingClientRect().left;

          // Create a canvas to measure text width
          const context = document.createElement("canvas").getContext("2d");
          context.font = window.getComputedStyle(inputElement).font;

          // Measure the width of the text up to each character
          let cursorPosition = 0,
            textWidth = 0;
          for (let i = 0; i < inputElement.value.length; i++) {
            const charWidth = context.measureText(inputElement.value[i]).width;
            if (textWidth + charWidth > offsetX) {
              cursorPosition = i;
              break;
            }
            textWidth += charWidth;
            cursorPosition = i + 1;
          }

          // Manually focus the input element and set the cursor position
          inputElement.focus({ preventScroll: true });
          inputElement.setSelectionRange(cursorPosition, cursorPosition);
        }
      };

      fromPanel && document.body.addEventListener("pointerdown", stopEvent);

      peekContainer.addEventListener("click", (event) => {
        if (event.target === peekContainer) {
          fromPanel &&
            document.body.removeEventListener("pointerdown", stopEvent);
          this.closeLastPeek();
        }
      });

      //#endregion

      peekPanel.appendChild(optionsContainer);
      peekContent.appendChild(webview);
      peekPanel.appendChild(peekContent);

      peekContainer.appendChild(peekPanel);
      peekContainer.appendChild(sidebarControls);

      // Always mount at #browser level so the peek can overflow the scaled
      // webpage stack instead of being clipped by webpage-stack/pageview.
      document.querySelector("#browser").appendChild(peekContainer);

      const geometry = this.applyPeekAnimationGeometry(peekContainer, peekPanel, linkRect);
      this.webviews.get(webviewId).sourceRect = geometry?.sourceRect || null;
      const sourcePreviewUrl = await this.captureSourcePreview(linkRect, fromPanel);
      this.webviews.get(webviewId).sourcePreviewUrl = sourcePreviewUrl || null;
      const previewLayer = this.mountPreviewLayer(peekPanel, sourcePreviewUrl, linkRect);
      await this.waitForPreviewLayer(previewLayer);
      if (sourcePreviewUrl) {
        this.hidePeekContent(peekPanel);
      } else {
        this.showPeekContent(peekPanel);
      }
      if (webview.src === "about:blank" && webview.dataset.pendingSrc) {
        debugLog("loading webview before opening animation", {
          webviewId,
          url: webview.dataset.pendingSrc,
        });
        webview.src = webview.dataset.pendingSrc;
      }
      peekContainer.style.setProperty(
        "--peek-backdrop-duration",
        `${this.getBackdropDuration("opening")}ms`
      );
      requestAnimationFrame(() => {
        peekContainer.classList.remove("pre-open");
        peekContainer.classList.add("open");
      });
      const sourceRect = this.webviews.get(webviewId).sourceRect || this.resolveSourceRect(linkRect);
      if (sourcePreviewUrl) {
        this.animatePeekContentIn(peekPanel);
      }
      this.animatePeekMotion(peekPanel, "opening", sourceRect)
        .then(() => {
          this.removePreviewLayer(peekPanel);
          this.showPeekContent(peekPanel);
        })
        .catch((error) =>
          console.warn(DEBUG.prefix, "opening animation failed", error)
        );

      // Only modify body class if corresponding CSS is supported to avoid layout issues
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
            {
              left: linkRect.left,
              top: linkRect.top,
              width: linkRect.width,
              height: linkRect.height,
            },
            { width: contentViewportWidth, height: contentViewportHeight }
          ),
        },
        {
          basis: "content-viewport+visualViewportOffset",
          candidate: this.normalizeCaptureRect(
            {
              left: linkRect.left + vvOffsetLeft,
              top: linkRect.top + vvOffsetTop,
              width: linkRect.width,
              height: linkRect.height,
            },
            { width: contentViewportWidth, height: contentViewportHeight }
          ),
        },
        {
          basis: "content-viewport*dpr",
          candidate: this.normalizeCaptureRect(
            {
              left: linkRect.left * dpr,
              top: linkRect.top * dpr,
              width: linkRect.width * dpr,
              height: linkRect.height * dpr,
            },
            { width: contentViewportWidth * dpr, height: contentViewportHeight * dpr }
          ),
        },
        {
          basis: "content-viewport*visualViewportScale",
          candidate: this.normalizeCaptureRect(
            {
              left: linkRect.left * vvScale,
              top: linkRect.top * vvScale,
              width: linkRect.width * vvScale,
              height: linkRect.height * vvScale,
            },
            { width: contentViewportWidth * vvScale, height: contentViewportHeight * vvScale }
          ),
        },
      ];

      if (webviewRect) {
        candidates.push({
          basis: "browser-ui-webview-offset",
          candidate: this.normalizeCaptureRect(
            {
              left: webviewRect.left + linkRect.left,
              top: webviewRect.top + linkRect.top,
              width: linkRect.width,
              height: linkRect.height,
            },
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
        debugLog("isUsablePreviewUrl decode failed", { error });
        return false;
      }

      return image.naturalWidth > 0 && image.naturalHeight > 0;
    }

    captureTabArea(rect) {
      return new Promise((resolve, reject) => {
        if (
          !window.vivaldi ||
          !vivaldi.thumbnails ||
          typeof vivaldi.thumbnails.captureTab !== "function"
        ) {
          reject(new Error("vivaldi.thumbnails.captureTab is unavailable"));
          return;
        }

        const params = {
          rect,
          encodeFormat: "png",
          saveToDisk: false,
        };

        debugLog("captureTabArea request", params);
        vivaldi.thumbnails.captureTab(0, params, (url) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(url || null);
        });
      });
    }

    async captureSourcePreview(linkRect, fromPanel) {
      if (fromPanel) {
        debugLog("captureSourcePreview skipped", {
          reason: "panel-source-not-supported-yet",
          fromPanel,
        });
        return null;
      }

      const sourceRect = this.resolveSourceRect(linkRect);
      const candidates = this.buildCaptureCandidates(linkRect);
      if (!candidates.length) {
        debugLog("captureSourcePreview skipped", {
          reason: "no-capture-candidates",
          linkRect,
          sourceRect,
        });
        return null;
      }

      debugLog("captureSourcePreview candidates", {
        linkRect,
        sourceRect,
        activeWebviewRect: this.getActivePageWebview()?.getBoundingClientRect?.(),
        candidates,
      });

      for (const candidate of candidates) {
        try {
          const sourcePreviewUrl = await this.captureTabArea(candidate.rect);
          const usable = await this.isUsablePreviewUrl(sourcePreviewUrl);
          debugLog("captureSourcePreview attempt", {
            basis: candidate.basis,
            rect: candidate.rect,
            hasPreview: !!sourcePreviewUrl,
            usable,
            previewKind: sourcePreviewUrl?.slice?.(0, 32) || null,
          });
          if (usable) {
            debugLog("captureSourcePreview success", {
              linkRect,
              sourceRect,
              captureRect: candidate.rect,
              captureBasis: candidate.basis,
              hasPreview: true,
            });
            return sourcePreviewUrl;
          }
        } catch (error) {
          console.warn(DEBUG.prefix, "captureSourcePreview attempt failed", {
            error,
            basis: candidate.basis,
            rect: candidate.rect,
            linkRect,
            sourceRect,
          });
        }
      }

      console.warn(DEBUG.prefix, "captureSourcePreview failed", {
        reason: "all-candidates-unusable",
        linkRect,
        sourceRect,
        candidates,
      });
      return null;
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
      if (!sourceRect) {
        console.warn(
          DEBUG.prefix,
          "No source rect for animation; using fallback origin",
          {
            linkRect,
            finalRect: {
              left: finalRect.left,
              top: finalRect.top,
              width: finalRect.width,
              height: finalRect.height,
            },
          }
        );
      }
      const scaleX = sourceRect
        ? Math.min(Math.max(sourceRect.width / finalRect.width, 0.08), 1)
        : 0.92;
      const scaleY = sourceRect
        ? Math.min(Math.max(sourceRect.height / finalRect.height, 0.06), 1)
        : 0.9;
      const translateX = sourceRect
        ? sourceRect.left - finalRect.left
        : 0;
      const translateY = sourceRect
        ? sourceRect.top - finalRect.top
        : Math.min(-(finalRect.height * 0.42), -96);
      const sourceRadius = sourceRect
        ? Math.min(Math.max(sourceRect.height / 2, 8), 18)
        : 18;
      const backdropOriginX = sourceRect
        ? sourceRect.left + sourceRect.width / 2
        : finalRect.left + finalRect.width / 2;
      const backdropOriginY = sourceRect
        ? sourceRect.top + sourceRect.height / 2
        : finalRect.top + Math.min(finalRect.height * 0.18, 96);

      debugLog("applyPeekAnimationGeometry", {
        linkRect,
        sourceRect,
        activeWebviewRect: this.getActivePageWebview()?.getBoundingClientRect?.(),
        finalRect: {
          left: finalRect.left,
          top: finalRect.top,
          width: finalRect.width,
          height: finalRect.height,
        },
        translateX,
        translateY,
        scaleX,
        scaleY,
        backdropOriginX,
        backdropOriginY,
      });

      peekContainer.style.setProperty(
        "--peek-panel-top",
        `${finalRect.top}px`
      );
      peekContainer.style.setProperty(
        "--peek-panel-right",
        `${finalRect.right}px`
      );

      peekPanel.style.setProperty("--peek-translate-x", `${translateX}px`);
      peekPanel.style.setProperty("--peek-translate-y", `${translateY}px`);
      peekPanel.style.setProperty("--peek-scale-x", scaleX.toFixed(4));
      peekPanel.style.setProperty("--peek-scale-y", scaleY.toFixed(4));
      peekPanel.style.setProperty(
        "--peek-source-radius",
        `${sourceRadius.toFixed(2)}px`
      );

      peekContainer.style.setProperty(
        "--peek-backdrop-origin-x",
        `${backdropOriginX}px`
      );
      peekContainer.style.setProperty(
        "--peek-backdrop-origin-y",
        `${backdropOriginY}px`
      );

      return {
        sourceRect,
        finalRect,
        backdropOriginX,
        backdropOriginY,
      };
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

      previewLayer.style.setProperty(
        "--preview-bg",
        preview.backgroundColor || "rgba(255,255,255,0.94)"
      );
      previewLayer.style.setProperty(
        "--preview-fg",
        preview.color || "rgba(18,18,18,0.92)"
      );
      previewLayer.style.setProperty(
        "--preview-border-color",
        preview.borderColor || "rgba(255,255,255,0.08)"
      );
      previewLayer.style.setProperty(
        "--preview-font-weight",
        preview.fontWeight || "600"
      );
      previewLayer.classList.toggle("has-preview-image", hasPreview);
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

    mountPreviewLayer(peekPanel, sourcePreviewUrl, linkRect) {
      if (!peekPanel) return null;

      this.removePreviewLayer(peekPanel);
      const previewLayer = this.createPreviewLayer(sourcePreviewUrl, linkRect);
      peekPanel.prepend(previewLayer);
      debugLog("mountPreviewLayer", {
        hasPreview: !!sourcePreviewUrl,
        linkRect,
        previewKind: sourcePreviewUrl?.slice?.(0, 32) || null,
      });
      return previewLayer;
    }

    removePreviewLayer(peekPanel) {
      peekPanel?.querySelector(".peek-source-preview")?.remove();
    }

    async waitForPreviewLayer(previewLayer) {
      const imageElement = previewLayer?.querySelector(".peek-source-preview-image");
      if (!(imageElement instanceof HTMLImageElement) || !imageElement.src) {
        return;
      }

      try {
        if (typeof imageElement.decode === "function") {
          await imageElement.decode();
          return;
        }
      } catch (error) {
        debugLog("waitForPreviewLayer decode fallback", { error });
      }

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
      peekContent.style.opacity = "0";
    }

    showPeekContent(peekPanel) {
      const peekContent = peekPanel?.querySelector(".peek-content");
      if (!peekContent) return;
      peekContent.getAnimations?.().forEach((animation) => animation.cancel());
      peekContent.style.opacity = "1";
    }

    animatePeekContentIn(peekPanel) {
      const peekContent = peekPanel?.querySelector(".peek-content");
      if (!peekContent || typeof peekContent.animate !== "function") {
        this.showPeekContent(peekPanel);
        return;
      }

      peekContent.getAnimations().forEach((animation) => animation.cancel());
      peekContent.style.opacity = "0";
      const animation = peekContent.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        {
          duration: this.getGlanceDuration("opening") / 4,
          easing: "ease-in-out",
          fill: "forwards",
        }
      );

      animation.finished
        .then(() => {
          if (!peekPanel?.isConnected) return;
          peekContent.style.opacity = "1";
        })
        .catch(() => {});
    }

    animatePeekContentOut(peekPanel) {
      const peekContent = peekPanel?.querySelector(".peek-content");
      if (!peekContent || typeof peekContent.animate !== "function") {
        this.hidePeekContent(peekPanel);
        return;
      }

      peekContent.getAnimations().forEach((animation) => animation.cancel());
      const animation = peekContent.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        {
          duration: Math.min(160, this.getGlanceDuration("closing") / 4),
          easing: "ease-in-out",
          fill: "forwards",
        }
      );

      animation.finished
        .then(() => {
          if (!peekPanel?.isConnected) return;
          peekContent.style.opacity = "0";
        })
        .catch(() => {});
    }

    easeOutBack(x) {
      const c1 = 0.4;
      const c3 = c1 + 1;
      return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2;
    }

    easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 6);
    }

    createGlanceArcKeyframes(peekPanel, direction, sourceRect) {
      const finalRect = peekPanel.getBoundingClientRect();
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
      const arcHeight = Math.min(
        distance * this.ARC_CONFIG.arcHeightRatio,
        this.ARC_CONFIG.maxArcHeight
      );
      const arcDirection = startCenterY > endCenterY ? -1 : 1;
      const easing =
        direction === "opening"
          ? this.easeOutBack.bind(this)
          : this.easeOutCubic.bind(this);
      const frames = [];

      for (let i = 0; i <= this.ARC_CONFIG.steps; i++) {
        const progress = i / this.ARC_CONFIG.steps;
        const eased = easing(progress);
        const width = startRect.width + (endRect.width - startRect.width) * eased;
        const height =
          startRect.height + (endRect.height - startRect.height) * eased;
        const centerX = startCenterX + distanceX * eased;
        const centerY =
          startCenterY +
          distanceY * eased +
          arcDirection * arcHeight * (1 - (2 * eased - 1) ** 2);
        const left = centerX - width / 2;
        const top = centerY - height / 2;
        const scaleX = width / finalRect.width;
        const scaleY = height / finalRect.height;

        frames.push({
          transform: `translate(${left - finalRect.left}px, ${
            top - finalRect.top
          }px) scale(${scaleX}, ${scaleY})`,
          borderRadius: `${
            Math.min(Math.max(height / 2, 8), 18) +
            (Number.parseFloat(getComputedStyle(peekPanel).borderRadius) -
              Math.min(Math.max(height / 2, 8), 18)) *
              eased
          }px`,
          filter:
            progress < 0.8 ? "saturate(0.96) brightness(1.03)" : "none",
          offset: progress,
        });
      }

      const finalRadius =
        getComputedStyle(peekPanel).borderRadius || `${Math.min(finalRect.height / 2, 18)}px`;
      frames[frames.length - 1].borderRadius = finalRadius;
      if (direction === "closing") {
        frames[0].borderRadius = finalRadius;
      }

      debugLog("createGlanceArcKeyframes", {
        direction,
        sourceRect,
        startRect,
        endRect,
        distance,
        arcHeight,
        arcDirection,
      });

      return frames;
    }

    animatePeekMotion(peekPanel, direction, sourceRect) {
      if (typeof peekPanel.animate !== "function") {
        return Promise.resolve();
      }

      peekPanel.getAnimations().forEach((animation) => animation.cancel());
      const keyframes = this.createGlanceArcKeyframes(
        peekPanel,
        direction,
        sourceRect
      );
      const animation = peekPanel.animate(keyframes, {
        duration:
          this.getGlanceDuration(direction),
        easing: "linear",
        fill: "forwards",
      });

      return animation.finished;
    }

    getGlanceDuration(_direction) {
      return this.ARC_CONFIG.glanceAnimationDuration;
    }

    getBackdropDuration(direction) {
      const baseDuration = this.getGlanceDuration(direction);
      return direction === "closing" ? baseDuration / 1.5 : baseDuration;
    }

    /**
     * Displays open in tab buttons and current url in input element
     * @param {string} webviewId is the id of the webview
     * @param {Object} thisElement the current instance divOptionContainer (div) element
     */
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

    /**
     * Create a button with default style for the web view options.
     * @param {Node | string} content the content of the button to display
     * @param {Function} clickListenerCallback the click listeners callback function
     * @param {string} cls optional additional class for the button
     */
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

    /**
     * Returns a random, verified id.
     */
    getWebviewId() {
      return Math.floor(Math.random() * 10000) + (new Date().getTime() % 1000);
    }

    /**
     * Sets the webviews content to a reader version
     *
     * @param {webview} webview the webview to update
     */
    showReaderView(webview) {
      if (webview.src.includes(this.READER_VIEW_URL)) {
        webview.src = webview.src.replace(this.READER_VIEW_URL, "");
      } else {
        webview.src = this.READER_VIEW_URL + webview.src;
      }
    }

    /**
     * Opens a new Chrome tab with specified active boolean value and closes the current peek
     * @param {string} inputId is the id of the input containing current url
     * @param {boolean} active indicates whether the tab is active or not (background tab)
     */
    getPeekUrl(webviewId) {
      const data = this.webviews.get(webviewId);
      if (!data?.webview) return "";

      return data.webview.dataset.pendingSrc || data.webview.src || "";
    }

    openNewTab(webviewId, active) {
      const url = this.getPeekUrl(webviewId);
      if (!url) return;

      // For background tabs, just create the tab and close peek immediately
      if (!active) {
        chrome.tabs.create({ url: url, active: false });
        // Use normal closing animation
        setTimeout(() => {
          this.closeLastPeek();
        }, 100);
        return;
      }

      // Get the current peek element
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

      // Create overlay element
      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.backgroundColor = "#1C2220";
      overlay.style.opacity = "0";
      overlay.style.zIndex = "999999998"; // Below peek but above everything else
      overlay.style.transition = "opacity 0.3s ease-in-out";
      overlay.style.pointerEvents = "none";
      document.body.appendChild(overlay);

      // Get target dimensions from active webview
      let activeWebview = document.querySelector(
        ".active.visible.webpageview webview"
      );
      if (activeWebview) {
        const currentRect = peekPanel.getBoundingClientRect();
        const rect = activeWebview.getBoundingClientRect();
        const webviewContainerRect = document
          .getElementById("webview-container")
          ?.getBoundingClientRect();
        const targetWidth = webviewContainerRect?.width || rect.width;
        const targetLeft =
          webviewContainerRect?.left ??
          Math.round((window.innerWidth - targetWidth) / 2);

        // Freeze current geometry before expanding. This was the first
        // effective fix: keep height fixed, then animate left+width toward the
        // full-page target without recomputing against the live flex layout.
        peekPanel.style.position = "fixed";
        peekPanel.style.left = `${currentRect.left}px`;
        peekPanel.style.top = `${currentRect.top}px`;
        peekPanel.style.width = `${currentRect.width}px`;
        peekPanel.style.height = `${currentRect.height}px`;
        peekPanel.style.margin = "0";
        peekPanel.style.transition = "none";
        void peekPanel.offsetWidth;
        peekPanel.style.transition =
          "width 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), left 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)";
        requestAnimationFrame(() => {
          peekPanel.style.width = `${targetWidth}px`;
          peekPanel.style.left = `${targetLeft}px`;
        });
      }

      // Animate overlay opacity from 0 to 1
      setTimeout(() => {
        overlay.style.opacity = "1";
      }, 10);

      // Start loading immediately, but keep the cached preview on screen until
      // the new tab has finished loading to reduce reload perception.
      chrome.tabs.create({ url: url, active: true }, async (tab) => {
        const waitResult = tab?.id
          ? await this.waitForTabComplete(tab.id)
          : "missing";
        debugLog("openNewTab waitForTabComplete", {
          webviewId,
          createdTabId: tab?.id,
          waitResult,
        });
        setTimeout(() => {
          this.dismissPeekInstant(webviewId);
        }, 120);

        setTimeout(() => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
        }, 100);
      });
    }

    async openInSplitView(webviewId) {
      const url = this.getPeekUrl(webviewId);
      if (!url) return;

      try {
        const [currentTab] = await this.queryTabs({
          active: true,
          currentWindow: true,
        });
        if (!currentTab?.id) {
          return;
        }

        const currentFresh = await this.getTab(currentTab.id);
        const currentViv = this.parseVivExtData(currentFresh);
        const existingTiling = currentViv.tiling;
        const tileId = existingTiling?.id || crypto.randomUUID();
        const layout = "row";

        let nextIndex = 1;
        if (existingTiling?.id) {
          const allTabs = await this.queryTabs({ currentWindow: true });
          nextIndex =
            allTabs
              .map((tab) => this.parseVivExtData(tab).tiling)
              .filter((tiling) => tiling && tiling.id === tileId)
              .reduce(
                (maxIndex, tiling) => Math.max(maxIndex, tiling.index ?? -1),
                -1
              ) + 1;
        }

        const newTab = await this.createTab({
          url,
          active: true,
          index:
            typeof currentFresh.index === "number"
              ? currentFresh.index + 1
              : undefined,
          openerTabId: currentFresh.id,
        });
        if (!newTab?.id) {
          return;
        }

        if (!existingTiling) {
          await this.updateTabVivExtData(currentFresh.id, (viv) => ({
            ...viv,
            tiling: {
              id: tileId,
              index: 0,
              layout,
              type: "selection",
            },
          }));
        }

        await this.updateTabVivExtData(newTab.id, (viv) => ({
          ...viv,
          tiling: {
            id: tileId,
            index: nextIndex,
            layout,
            type: "selection",
          },
        }));

        await this.updateTab(currentFresh.id, {
          active: true,
          highlighted: true,
        });
        await this.updateTab(newTab.id, {
          highlighted: true,
        });

        debugLog("openInSplitView tiled tabs", {
          currentTabId: currentFresh.id,
          newTabId: newTab.id,
          tileId,
          layout,
          nextIndex,
          existingTiling,
        });

        this.dismissPeekInstant(webviewId);
      } catch (error) {
        console.error(DEBUG.prefix, "openInSplitView failed", {
          webviewId,
          url,
          error,
        });
      }
    }
  }

  class WebsiteInjectionUtils {
    constructor(getWebviewConfig, openPeek, iconConfig) {
      this.iconConfig = JSON.stringify(iconConfig);

      // inject detection of click observers
      chrome.webNavigation.onCompleted.addListener((navigationDetails) => {
        const { webview, fromPanel } = getWebviewConfig(navigationDetails);
        webview && this.injectCode(webview, fromPanel);
      });

      // react on demand to open a peek
      chrome.runtime.onMessage.addListener((message) => {
        if (message.url) {
          debugLog("runtime message received in browser UI", message);
          openPeek(message.url, message.fromPanel, message.rect, message.meta);
        } else if (message.type === "arcpeek-debug") {
          debugLog("page debug", message.payload);
        }
      });
    }

    injectCode(webview, fromPanel) {
      const handler = WebsiteLinkInteractionHandler.toString(),
        instantiationCode = `
                if (!this.peekEventListenerSet) {
                    new (${handler})(${fromPanel}, ${this.iconConfig});
                    this.peekEventListenerSet = true;
                }
            `;

      webview.executeScript({ code: instantiationCode });
    }
  }

  class WebsiteLinkInteractionHandler {
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

      this.isLongPress = false; // Flag for long press
      this.peekTriggered = false; // Flag for peek trigger
      this.activeLinkRect = null;
      this.lastRecordedLinkData = null;
      this.suppressPointerSequence = false;
      this.selectionSuppressed = false;

      window.addEventListener("beforeunload", this.#cleanup.bind(this));

      this.#initialize();

      // Listen for peek close message and reset state
      chrome.runtime.onMessage.addListener((message) => {
        if (message.type === "peek-closed") {
          this.peekTriggered = false;
          this.isLongPress = false;
        }
      });
    }

    #debugToBrowserUI(label, payload = {}) {
      chrome.runtime.sendMessage({
        type: "arcpeek-debug",
        payload: {
          label,
          fromPanel: this.fromPanel,
          ...payload,
        },
      });
    }

    /**
     * Checks if a link is clicked by the middle mouse while pressing Ctrl + Alt, then fires an event with the Url
     */
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

      // Reset flags
      this.peekTriggered = false;
      this.isLongPress = false;
      this.#restoreSelection();
    }

    /**
     * Setup mouse event listeners
     */
    #setupMouseHandling() {
      let holdTimerForMiddleClick;
      let holdTimer;

      const suppressNativeEvent = (event) => {
        if (!this.peekTriggered && !this.suppressPointerSequence) return;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      };

      ["pointerup", "mouseup", "click", "auxclick", "contextmenu", "selectstart"].forEach((eventName) => {
        document.addEventListener(eventName, suppressNativeEvent, true);
      });

      document.addEventListener("pointerdown", (event) => {
        const link = this.#getLinkElement(event);
        if (link) {
          this.#recordLinkSnapshot(event, link);
        }

        this.#debugToBrowserUI("pointerdown", {
          button: event.button,
          altKey: event.altKey,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          shiftKey: event.shiftKey,
          targetTag: event.target?.tagName,
          hasLink: !!link,
        });

        // Check if the Ctrl key, Alt key, and mouse button were pressed
        if ((event.altKey || event.metaKey || event.ctrlKey) && event.button === 0) {
          this.#debugToBrowserUI("pointerdown matched alt shortcut", {
            button: event.button,
            altKey: event.altKey,
            metaKey: event.metaKey,
            ctrlKey: event.ctrlKey,
          });
          this.#openPeekFromEvent(event);
          this.preventAllClicks();
        } else if (event.button === 1) {
          this.#debugToBrowserUI("pointerdown middle-click timer armed");
          holdTimerForMiddleClick = setTimeout(
            () => this.#openPeekFromEvent(event),
            500
          );
        } else if (event.button === 0) {
          // Only create and show text blink feedback on long press over a link
          if (link) {
            this.#debugToBrowserUI("pointerdown long-press candidate", {
              href: link.href,
              button: event.button,
            });
            this.isLongPress = true;

            const effectiveHoldTime =
              this.config.rightClickHoldTime - this.config.rightClickHoldDelay;

            this.visibilityDelayTimer = setTimeout(() => {
              this.#startLinkHoldFeedback(link, effectiveHoldTime);

              const startTime = Date.now();
              this.holdFeedbackInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / effectiveHoldTime, 1);
                const depth = 1 - Math.pow(1 - progress, 1.75);
                link.style.setProperty(
                  "--peek-hold-progress",
                  progress.toFixed(3)
                );
                link.style.setProperty(
                  "--peek-hold-depth",
                  depth.toFixed(3)
                );

                if (progress >= 1) {
                  clearInterval(this.holdFeedbackInterval);
                  this.holdFeedbackInterval = null;
                }
              }, 16); // ~60fps
            }, this.config.rightClickHoldDelay);

            holdTimer = setTimeout(() => {
              event.preventDefault();
              event.stopPropagation();
              this.#openPeekFromEvent(event);
              this.preventAllClicks();
              this.#stopLinkHoldFeedback();
              if (this.visibilityDelayTimer)
                clearTimeout(this.visibilityDelayTimer);
            }, this.config.rightClickHoldTime);
          }
        }
      });

      document.addEventListener("pointerup", (event) => {
        if (event.button === 1) clearTimeout(holdTimerForMiddleClick);
        if (event.button === 0) {
          clearTimeout(holdTimer);
          this.#stopLinkHoldFeedback();
          if (this.visibilityDelayTimer) {
            clearTimeout(this.visibilityDelayTimer);
            this.visibilityDelayTimer = null;
          }
          if (!this.peekTriggered) {
            this.#restoreSelection();
          }
        }
      });
    }

    #startLinkHoldFeedback(link) {
      this.#stopLinkHoldFeedback();
      this.longPressLink = link;
      link.style.setProperty("--peek-hold-progress", "0");
      link.style.setProperty("--peek-hold-depth", "0");
      link.classList.add("peek-hold-press");
    }

    #stopLinkHoldFeedback() {
      if (this.holdFeedbackInterval) {
        clearInterval(this.holdFeedbackInterval);
        this.holdFeedbackInterval = null;
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

      const targetRect =
        target && typeof target.getBoundingClientRect === "function"
          ? target.getBoundingClientRect()
          : null;
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
          text: (link.innerText || link.textContent || "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 140),
          color: computed.color,
          backgroundColor:
            computed.backgroundColor && computed.backgroundColor !== "rgba(0, 0, 0, 0)"
              ? computed.backgroundColor
              : parentComputed.backgroundColor,
          borderColor: computed.borderColor,
          fontFamily: computed.fontFamily,
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight,
          lineHeight: computed.lineHeight,
        },
        recordedAt: Date.now(),
      };

      this.lastRecordedLinkData = snapshot;
      this.#debugToBrowserUI("recordLinkSnapshot", {
        href: link.href,
        rect: snapshot,
        recordTargetTag: recordTarget?.tagName,
      });
      return snapshot;
    }

    #sendPeekMessage(url, rect) {
      this.#debugToBrowserUI("sendPeekMessage", {
        url,
        rect,
      });
      chrome.runtime.sendMessage({ url, fromPanel: this.fromPanel, rect });
    }

    #openPeekFromEvent(event) {
      let link = this.#getLinkElement(event);
      this.#debugToBrowserUI("openPeekFromEvent invoked", {
        button: event.button,
        altKey: event.altKey,
        hasLink: !!link,
        targetTag: event.target?.tagName,
      });
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
        this.#debugToBrowserUI("openPeekFromEvent captured link rect", {
          href: link.href,
          rect,
          snapshotSource: cachedRect ? "pointerdown-cache" : "fallback-live",
        });
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

    /**
     * Prevent all click events to avoid accidentally opening the original link
     */
    preventAllClicks() {
      clearTimeout(this.timers.suppressNativeOpen);
      this.peekTriggered = true;
      this.suppressPointerSequence = true;
      this.#suppressSelection();
      this.timers.suppressNativeOpen = setTimeout(() => {
        this.peekTriggered = false;
        this.suppressPointerSequence = false;
        this.#restoreSelection();
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
      const style = document.createElement("style");
      style.textContent = `
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
                    filter:
                        brightness(calc(1 - var(--peek-hold-depth, 0) * 0.12))
                        saturate(calc(1 - var(--peek-hold-depth, 0) * 0.06));
                    box-shadow:
                        0 calc(var(--peek-hold-depth, 0) * 1.5px) calc(var(--peek-hold-depth, 0) * 6px) rgba(0, 0, 0, 0.16),
                        inset 0 calc(var(--peek-hold-depth, 0) * 1px) 0 rgba(255, 255, 255, 0.05),
                        inset 0 calc(var(--peek-hold-depth, 0) * -5px) calc(var(--peek-hold-depth, 0) * 9px) rgba(0, 0, 0, 0.16);
                    text-shadow:
                        0 calc(var(--peek-hold-depth, 0) * 0.5px) 0 rgba(255, 255, 255, 0.04);
                    transition:
                        transform 55ms linear,
                        filter 55ms linear,
                        text-shadow 55ms linear,
                        box-shadow 55ms linear;
                }
            `;
      document.head.appendChild(style);
    }

    debounce(fn, delay) {
      let timer = null;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(fn.bind(this, ...args), delay);
      };
    }
  }

  /**
   * Utility class for adding and updating context menu items
   */
  class SearchEngineUtils {
    /**
     * Constructor for SearchEngineUtils
     * @param {Function} openLinkCallback - Callback for opening links
     * @param {Function} searchCallback - Callback for searching
     * @param {Object} [config={}] - Configuration options
     * @param {string} [config.menuPrefix] - Prefix for the context menu item
     * @param {string} [config.linkMenuTitle] - Titel for the link menu
     * @param {string} [config.searchMenuTitle] - title for the search menu
     * @param {string} [config.selectSearchMenuTitle] - title for the select search menu
     */
    constructor(openLinkCallback, searchCallback, config = {}) {
      this.openLinkCallback = openLinkCallback;
      this.searchCallback = searchCallback;

      this.menuPrefix = config.menuPrefix;
      this.linkMenuTitle = config.linkMenuTitle;
      this.searchMenuTitle = config.searchMenuTitle;
      this.selectSearchMenuTitle = config.selectSearchMenuTitle;

      this.createdContextMenuMap = new Map();
      this.searchEngineCollection = [];
      this.defaultSearchId = null;
      this.privateSearchId = null;

      // Cache static IDs for frequent access
      this.SEARCH_ID = "search-peek";
      this.SELECT_SEARCH_ID = "select-search-peek";

      this.#initialize();
    }

    /**
     * Initializes the context menu and listeners
     * @returns {Promise<void>}
     */
    async #initialize() {
      // Create context menu items
      this.#createContextMenuOption();

      // Initialize search engines and context menus
      this.#updateSearchEnginesAndContextMenu();

      // Update context menus when search engines change
      vivaldi.searchEngines.onTemplateUrlsChanged.addListener(() => {
        this.#removeContextMenuSelectSearch();
        this.#updateSearchEnginesAndContextMenu();
      });
    }

    /**
     * Creates context menu items to open a peek search
     */
    #createContextMenuOption() {
      chrome.contextMenus.create({
        id: this.SEARCH_ID,
        title: `${this.menuPrefix} ${this.searchMenuTitle}`,
        contexts: ["selection"],
      });
      chrome.contextMenus.create({
        id: this.SELECT_SEARCH_ID,
        title: `${this.menuPrefix} ${this.selectSearchMenuTitle}`,
        contexts: ["selection"],
      });

      chrome.contextMenus.onClicked.addListener((itemInfo) => {
        const { menuItemId, parentMenuItemId, linkUrl, selectionText } =
          itemInfo;

        if (menuItemId === this.SEARCH_ID) {
          const engineId = window.incognito
            ? this.privateSearchId
            : this.defaultSearchId;
          this.searchCallback(engineId, selectionText);
        } else if (parentMenuItemId === this.SELECT_SEARCH_ID) {
          const engineId = menuItemId.substr(parentMenuItemId.length);
          this.searchCallback(engineId, selectionText);
        }
      });
    }

    /**
     * Updates the search engines and context menu
     */
    async #updateSearchEnginesAndContextMenu() {
      const searchEngines = await vivaldi.searchEngines.getTemplateUrls();
      this.searchEngineCollection = searchEngines.templateUrls;
      this.defaultSearchId = searchEngines.defaultSearch;
      this.privateSearchId = searchEngines.defaultPrivate;

      this.#createContextMenuSelectSearch();
    }

    /**
     * Removes sub-context menu items for select search engine menu item
     */
    #removeContextMenuSelectSearch() {
      this.createdContextMenuMap.forEach((_, engineId) => {
        const menuId = this.SELECT_SEARCH_ID + engineId;
        chrome.contextMenus.remove(menuId);
      });

      this.createdContextMenuMap.clear();
    }

    /**
     * Creates sub-context menu items for select search engine menu item
     */
    #createContextMenuSelectSearch() {
      this.searchEngineCollection.forEach((engine) => {
        const menuId = this.SELECT_SEARCH_ID + engine.guid;
        // Ensure idempotency: remove first if exists, then create
        // This prevents "duplicate id" errors when Map and actual menu state desync
        try {
          chrome.contextMenus.remove(menuId);
        } catch (e) {
          // Ignore errors from remove (item might not exist)
        }
        chrome.contextMenus.create({
          id: menuId,
          parentId: this.SELECT_SEARCH_ID,
          title: engine.name,
          contexts: ["selection"],
        });
        this.createdContextMenuMap.set(engine.guid, true);
      });
    }
  }

  /**
   * Utility class to manage SVG icons
   * @class
   */
  class IconUtils {
    // Static icons
    static SVG = {
      ellipsis:
        '<svg xmlns="http://www.w3.org/2000/svg" height="2em" viewBox="0 0 448 512"><path d="M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z"/></svg>',
      close:
        '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>',
      readerView:
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M3 4h10v1H3zM3 6h10v1H3zM3 8h10v1H3zM3 10h6v1H3z"></path></svg>',
      newTab:
        '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z"/></svg>',
      splitView:
        '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M64 64C28.7 64 0 92.7 0 128V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H64zm160 64V384H64V128H224zm64 256V128H448V384H288z"/></svg>',
      backgroundTab:
        '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M384 32c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96C0 60.7 28.7 32 64 32H384zM160 144c-13.3 0-24 10.7-24 24s10.7 24 24 24h94.1L119 327c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l135-135V328c0 13.3 10.7 24 24 24s24-10.7 24-24V168c0-13.3-10.7-24-24-24H160z"/></svg>',
    };

    // Vivaldi icons
    static VIVALDI_BUTTONS = [
      {
        name: "back",
        buttonName: "Back",
        fallback:
          '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>',
      },
      {
        name: "forward",
        buttonName: "Forward",
        fallback:
          '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg>',
      },
      {
        name: "reload",
        buttonName: "Reload",
        fallback:
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z"/></svg>',
      },
    ];

    #initialized = false;
    #iconMap = new Map();

    constructor() {
      this.#initializeStaticIcons();
    }

    /**
     * Initializes static icons
     */
    #initializeStaticIcons() {
      Object.entries(IconUtils.SVG).forEach(([key, value]) => {
        this.#iconMap.set(key, value);
      });
    }

    /**
     * Initialize Vivaldi icons from the DOM or use fallback
     */
    #initializeVivaldiIcons() {
      if (this.#initialized) return;

      IconUtils.VIVALDI_BUTTONS.forEach((button) => {
        this.#iconMap.set(
          button.name,
          this.#getVivaldiButton(button.buttonName, button.fallback)
        );
      });

      this.#initialized = true;
    }

    /**
     * Gets the SVG of a Vivaldi button or returns the fallback
     * @param {string} buttonName - name of the button in Vivali ui
     * @param {string} fallbackSVG - fallback svg if no icon is found
     * @returns {string} - the SVG as a string
     */
    #getVivaldiButton(buttonName, fallbackSVG) {
      const svg = document.querySelector(
        `.button-toolbar [name="${buttonName}"] svg`
      );
      return svg ? svg.cloneNode(true).outerHTML : fallbackSVG;
    }

    /**
     * Get icon by name
     * @param {string} name - Name of the icon
     * @returns {string} - Icon as SVG string
     */
    getIcon(name) {
      if (
        !this.#initialized &&
        IconUtils.VIVALDI_BUTTONS.some((btn) => btn.name === name)
      ) {
        this.#initializeVivaldiIcons();
      }

      return this.#iconMap.get(name) || "";
    }

    get ellipsis() {
      return this.getIcon("ellipsis");
    }

    get back() {
      return this.getIcon("back");
    }

    get forward() {
      return this.getIcon("forward");
    }

    get reload() {
      return this.getIcon("reload");
    }

    get readerView() {
      return this.getIcon("readerView");
    }

    get close() {
      return this.getIcon("close");
    }

    get newTab() {
      return this.getIcon("newTab");
    }

    get splitView() {
      return this.getIcon("splitView");
    }

    get backgroundTab() {
      return this.getIcon("backgroundTab");
    }
  }
})();
