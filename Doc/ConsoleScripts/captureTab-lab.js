(() => {
  const LAB_KEY = "__captureTabLab";

  if (window[LAB_KEY]?.stopHoverLinkProbe) {
    try {
      window[LAB_KEY].stopHoverLinkProbe();
    } catch (_) {}
  }

  const clampNumber = (value, fallback = 0) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  };

  const roundRect = (rect) => ({
    left: Math.round(clampNumber(rect?.left)),
    top: Math.round(clampNumber(rect?.top)),
    width: Math.max(0, Math.round(clampNumber(rect?.width))),
    height: Math.max(0, Math.round(clampNumber(rect?.height))),
  });

  const rectArea = (rect) => Math.max(0, clampNumber(rect?.width) * clampNumber(rect?.height));

  const rectToStyle = (rect) => {
    const normalized = roundRect(rect);
    return `left:${normalized.left}px; top:${normalized.top}px; width:${normalized.width}px; height:${normalized.height}px;`;
  };

  const dataUrlToImageSize = (dataUrl) =>
    new Promise((resolve) => {
      if (!dataUrl) {
        resolve(null);
        return;
      }

      const image = new Image();
      image.onload = () =>
        resolve({
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
        });
      image.onerror = () => resolve(null);
      image.src = dataUrl;
    });

  const captureTab = (tabId, params) =>
    new Promise((resolve, reject) => {
      if (!window.vivaldi?.thumbnails?.captureTab) {
        reject(new Error("vivaldi.thumbnails.captureTab is unavailable in this console context"));
        return;
      }

      window.vivaldi.thumbnails.captureTab(tabId, params, (dataUrl) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(dataUrl || null);
      });
    });

  const captureUI = (params) =>
    new Promise((resolve, reject) => {
      if (!window.vivaldi?.thumbnails?.captureUI) {
        reject(new Error("vivaldi.thumbnails.captureUI is unavailable in this console context"));
        return;
      }

      window.vivaldi.thumbnails.captureUI(params, (success, dataUrl) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!success) {
          reject(new Error("captureUI returned false"));
          return;
        }
        resolve(dataUrl || null);
      });
    });

  const getActiveWebview = () =>
    document.querySelector(".active.visible.webpageview webview");

  const getUiZoom = (webview) => {
    const source = webview || document.documentElement;
    const computed = window.getComputedStyle(source);
    const cssZoom = parseFloat(computed.getPropertyValue("--uiZoomLevel"));
    return Number.isFinite(cssZoom) && cssZoom > 0 ? cssZoom : 1;
  };

  const getWebviewZoom = (webview) =>
    new Promise((resolve) => {
      if (!webview?.getZoom) {
        resolve(1);
        return;
      }

      webview.getZoom((zoom) => {
        resolve(clampNumber(zoom, 1));
      });
    });

  const serializeForInjection = (value) => JSON.stringify(value ?? null);

  const executeInWebview = (webview, func, args = []) =>
    new Promise((resolve, reject) => {
      if (!webview?.executeScript) {
        reject(new Error("Active webview is unavailable"));
        return;
      }

      const source = `(${func.toString()}).apply(null, ${serializeForInjection(args)})`;

      webview.executeScript({ code: source }, (results) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(results?.[0]);
      });
    });

  const previewImage = (dataUrl, label = "captureTab preview") => {
    if (!dataUrl) {
      console.log("[captureTab-lab] No preview to display");
      return;
    }

    console.groupCollapsed(`[captureTab-lab] ${label}`);
    console.log(
      "%c ",
      [
        "font-size: 1px",
        "padding: 140px 220px",
        `background: url(${dataUrl}) no-repeat center center / contain`,
        "background-color: #111",
        "border: 1px solid rgba(255,255,255,0.15)",
      ].join("; ")
    );
    console.groupEnd();
  };

  const HOVER_TRACKER_ID = "__capture_tab_lab_hover_tracker";

  const injectHoverTracker = async (webview) =>
    executeInWebview(
      webview,
      (trackerId) => {
        const existing = window[trackerId];
        if (existing?.stop) existing.stop();

        const state = {
          lastSample: null,
          active: true,
        };

        const round = (value) => {
          const numeric = Number(value);
          return Number.isFinite(numeric) ? Math.round(numeric) : 0;
        };

        const rectToObject = (rect) => ({
          left: round(rect?.left),
          top: round(rect?.top),
          width: Math.max(0, round(rect?.width)),
          height: Math.max(0, round(rect?.height)),
        });

        const area = (rect) => Math.max(0, rect.width * rect.height);

        const chooseRect = (targetRect, linkRect) => {
          if (!area(targetRect)) return linkRect;
          if (!area(linkRect)) return targetRect;
          return area(targetRect) <= area(linkRect) * 1.25 ? targetRect : linkRect;
        };

        const updateFromEvent = (event) => {
          if (!state.active) return;

          const path = event.composedPath?.() || [];
          const elementFromPath = path.find(
            (node) => node && node.nodeType === Node.ELEMENT_NODE
          );
          const target =
            elementFromPath ||
            (event.target?.nodeType === Node.ELEMENT_NODE ? event.target : null);
          const link = target?.closest?.("a[href]") || null;

          if (!link) {
            state.lastSample = null;
            return;
          }

          const targetRect = rectToObject(target.getBoundingClientRect());
          const linkRect = rectToObject(link.getBoundingClientRect());
          const chosenPageRect = rectToObject(chooseRect(targetRect, linkRect));

          state.lastSample = {
            href: link.href,
            text: (link.innerText || link.textContent || "")
              .replace(/\s+/g, " ")
              .trim()
              .slice(0, 180),
            targetTag: target.tagName,
            targetRect,
            linkRect,
            chosenPageRect,
            pointer: {
              clientX: round(event.clientX),
              clientY: round(event.clientY),
            },
            pageMetrics: {
              innerWidth: round(window.innerWidth),
              innerHeight: round(window.innerHeight),
              scrollX: round(window.scrollX),
              scrollY: round(window.scrollY),
              devicePixelRatio: Number(window.devicePixelRatio || 1),
              visualViewport: window.visualViewport
                ? {
                    offsetLeft: Number(window.visualViewport.offsetLeft || 0),
                    offsetTop: Number(window.visualViewport.offsetTop || 0),
                    width: Number(window.visualViewport.width || window.innerWidth),
                    height: Number(window.visualViewport.height || window.innerHeight),
                    scale: Number(window.visualViewport.scale || 1),
                  }
                : {
                    offsetLeft: 0,
                    offsetTop: 0,
                    width: round(window.innerWidth),
                    height: round(window.innerHeight),
                    scale: 1,
                  },
            },
            sampledAt: Date.now(),
          };
        };

        const clear = () => {
          state.lastSample = null;
        };

        const onVisibilityChange = () => {
          if (document.hidden) clear();
        };

        const stop = () => {
          if (!state.active) return true;
          state.active = false;
          window.removeEventListener("pointermove", updateFromEvent, true);
          window.removeEventListener("mouseover", updateFromEvent, true);
          window.removeEventListener("scroll", clear, true);
          window.removeEventListener("blur", clear, true);
          document.removeEventListener("visibilitychange", onVisibilityChange, true);
          delete window[trackerId];
          return true;
        };

        window.addEventListener("pointermove", updateFromEvent, true);
        window.addEventListener("mouseover", updateFromEvent, true);
        window.addEventListener("scroll", clear, true);
        window.addEventListener("blur", clear, true);
        document.addEventListener("visibilitychange", onVisibilityChange, true);

        window[trackerId] = {
          getState: () => state.lastSample,
          stop,
        };

        return { ok: true, trackerId };
      },
      [HOVER_TRACKER_ID]
    );

  const readHoverTrackerState = async (webview) =>
    executeInWebview(
      webview,
      (trackerId) => window[trackerId]?.getState?.() || null,
      [HOVER_TRACKER_ID]
    );

  const removeHoverTracker = async (webview) =>
    executeInWebview(
      webview,
      (trackerId) => window[trackerId]?.stop?.() || false,
      [HOVER_TRACKER_ID]
    );

  const createOverlay = () => {
    const overlay = document.createElement("div");
    overlay.id = "capture-tab-lab-overlay";
    overlay.style.cssText = [
      "position: fixed",
      "z-index: 2147483646",
      "pointer-events: none",
      "box-sizing: border-box",
      "border: 2px solid rgba(255, 82, 82, 0.95)",
      "background: rgba(255, 82, 82, 0.14)",
      "box-shadow: 0 0 0 1px rgba(255,255,255,0.28), inset 0 0 0 1px rgba(255,255,255,0.2)",
      "backdrop-filter: saturate(1.1)",
      "display: none",
    ].join("; ");

    const label = document.createElement("div");
    label.style.cssText = [
      "position: absolute",
      "left: 0",
      "top: 0",
      "transform: translateY(calc(-100% - 6px))",
      "padding: 4px 8px",
      "border-radius: 999px",
      "font: 12px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace",
      "color: white",
      "background: rgba(12, 12, 12, 0.88)",
      "white-space: nowrap",
      "box-shadow: 0 8px 22px rgba(0,0,0,0.22)",
    ].join("; ");

    overlay.appendChild(label);
    document.body.appendChild(overlay);

    return { overlay, label };
  };

  const rectVariantBuilders = {
    raw: (snapshot) => roundRect(snapshot.chosenPageRect),
    scrollOffset: (snapshot) =>
      roundRect({
        left: snapshot.chosenPageRect.left + snapshot.pageMetrics.scrollX,
        top: snapshot.chosenPageRect.top + snapshot.pageMetrics.scrollY,
        width: snapshot.chosenPageRect.width,
        height: snapshot.chosenPageRect.height,
      }),
    dpr: (snapshot) =>
      roundRect({
        left: snapshot.chosenPageRect.left * snapshot.pageMetrics.devicePixelRatio,
        top: snapshot.chosenPageRect.top * snapshot.pageMetrics.devicePixelRatio,
        width: snapshot.chosenPageRect.width * snapshot.pageMetrics.devicePixelRatio,
        height: snapshot.chosenPageRect.height * snapshot.pageMetrics.devicePixelRatio,
      }),
    visualViewportOffset: (snapshot) =>
      roundRect({
        left:
          snapshot.chosenPageRect.left + snapshot.pageMetrics.visualViewport.offsetLeft,
        top:
          snapshot.chosenPageRect.top + snapshot.pageMetrics.visualViewport.offsetTop,
        width: snapshot.chosenPageRect.width,
        height: snapshot.chosenPageRect.height,
      }),
    visualViewportOffsetDpr: (snapshot) =>
      roundRect({
        left:
          (snapshot.chosenPageRect.left +
            snapshot.pageMetrics.visualViewport.offsetLeft) *
          snapshot.pageMetrics.devicePixelRatio,
        top:
          (snapshot.chosenPageRect.top +
            snapshot.pageMetrics.visualViewport.offsetTop) *
          snapshot.pageMetrics.devicePixelRatio,
        width: snapshot.chosenPageRect.width * snapshot.pageMetrics.devicePixelRatio,
        height: snapshot.chosenPageRect.height * snapshot.pageMetrics.devicePixelRatio,
      }),
    uiOffsetDpr: (snapshot) =>
      roundRect({
        left:
          (snapshot.chosenPageRect.left +
            (snapshot.uiMetrics?.webviewRect?.left || 0)) *
          snapshot.pageMetrics.devicePixelRatio,
        top:
          (snapshot.chosenPageRect.top +
            (snapshot.uiMetrics?.webviewRect?.top || 0)) *
          snapshot.pageMetrics.devicePixelRatio,
        width: snapshot.chosenPageRect.width * snapshot.pageMetrics.devicePixelRatio,
        height: snapshot.chosenPageRect.height * snapshot.pageMetrics.devicePixelRatio,
      }),
    uiZoomRatio: (snapshot) =>
      roundRect({
        left: snapshot.chosenPageRect.left * snapshot.pageMetrics.zoomRatio,
        top: snapshot.chosenPageRect.top * snapshot.pageMetrics.zoomRatio,
        width: snapshot.chosenPageRect.width * snapshot.pageMetrics.zoomRatio,
        height: snapshot.chosenPageRect.height * snapshot.pageMetrics.zoomRatio,
      }),
  };

  const helpText = `
captureTabLab API

- captureTabLab.captureBasic()
- captureTabLab.captureRect({ left, top, width, height }, options?)
- captureTabLab.captureUIRect({ left, top, width, height }, options?)
- captureTabLab.captureRectVariants(baseRect, options?)
- captureTabLab.createCalibrationTarget(options?)
- captureTabLab.removeCalibrationTarget()
- captureTabLab.inspectPoint(clientX, clientY)
- captureTabLab.captureCurrentHover(options?)
- captureTabLab.runRectVariantMatrix(options?)
- captureTabLab.runOutputSizeMatrix(rect, options?)
- captureTabLab.runBoundaryMatrix(rect, options?)
- captureTabLab.startHoverLinkProbe(options?)
- captureTabLab.stopHoverLinkProbe()

Useful hover probe options
- variant: "raw" | "scrollOffset" | "dpr" | "visualViewportOffset" | "visualViewportOffsetDpr" | "uiOffsetDpr" | "uiZoomRatio"
- captureApi: "tab" | "ui"
- holdDelayMs: default 3000
- previewOnCapture: default true
`;

  const lab = {
    version: "1.0.0",
    rectVariants: Object.keys(rectVariantBuilders),
    hoverProbe: null,

    help() {
      console.log(helpText.trim());
      return this.rectVariants;
    },

    async getEnvironmentSnapshot() {
      const webview = getActiveWebview();
      const webviewRect = webview?.getBoundingClientRect?.() || null;
      const uiZoom = getUiZoom(webview);
      const webviewZoom = await getWebviewZoom(webview);
      const activeTabId = Number(webview?.tab_id || 0) || 0;

      return {
        timestamp: new Date().toISOString(),
        locationHref: window.location.href,
        activeTabId,
        uiZoom,
        webviewZoom,
        zoomRatio: webviewZoom / uiZoom,
        windowInnerWidth: window.innerWidth,
        windowInnerHeight: window.innerHeight,
        webviewRect: webviewRect
          ? {
              left: webviewRect.left,
              top: webviewRect.top,
              width: webviewRect.width,
              height: webviewRect.height,
            }
          : null,
      };
    },

    async captureBasic(params = {}) {
      const finalParams = {
        encodeFormat: "png",
        saveToDisk: false,
        ...params,
      };

      const dataUrl = await captureTab(0, finalParams);
      const imageSize = await dataUrlToImageSize(dataUrl);
      previewImage(dataUrl, "Basic capture");
      const result = { tabId: 0, params: finalParams, imageSize, dataUrl };
      console.log("[captureTab-lab] captureBasic", result);
      return result;
    },

    async captureRect(rect, options = {}) {
      const {
        tabId = 0,
        preview = true,
        label = "Rect capture",
        ...rest
      } = options;

      const params = {
        rect: roundRect(rect),
        saveToDisk: false,
        encodeFormat: "png",
        ...rest,
      };

      const dataUrl = await captureTab(tabId, params);
      const imageSize = await dataUrlToImageSize(dataUrl);
      if (preview) {
        previewImage(dataUrl, label);
      }

      const result = { tabId, params, imageSize, dataUrl };
      console.log("[captureTab-lab] captureRect", result);
      return result;
    },

    async captureUIRect(rect, options = {}) {
      const {
        windowId = window.vivaldiWindowId,
        preview = true,
        label = "UI capture",
        ...rest
      } = options;

      if (windowId == null) {
        throw new Error("window.vivaldiWindowId is unavailable");
      }

      const normalized = roundRect(rect);
      const params = {
        windowId,
        posX: normalized.left,
        posY: normalized.top,
        width: normalized.width,
        height: normalized.height,
        saveToDisk: false,
        encodeFormat: "png",
        ...rest,
      };

      const dataUrl = await captureUI(params);
      const imageSize = await dataUrlToImageSize(dataUrl);
      if (preview) {
        previewImage(dataUrl, label);
      }

      const result = { windowId, params, imageSize, dataUrl };
      console.log("[captureTab-lab] captureUIRect", result);
      return result;
    },

    async captureRectVariants(baseRect, options = {}) {
      const rect = roundRect(baseRect);
      const variants = [
        { name: "raw", rect },
        { name: "scrollOffset", rect: roundRect({ left: rect.left + window.scrollX, top: rect.top + window.scrollY, width: rect.width, height: rect.height }) },
        { name: "dpr", rect: roundRect({ left: rect.left * window.devicePixelRatio, top: rect.top * window.devicePixelRatio, width: rect.width * window.devicePixelRatio, height: rect.height * window.devicePixelRatio }) },
        { name: "visualViewportOffset", rect: roundRect({ left: rect.left + (window.visualViewport?.offsetLeft || 0), top: rect.top + (window.visualViewport?.offsetTop || 0), width: rect.width, height: rect.height }) },
      ];

      const results = [];
      for (const variant of variants) {
        try {
          const capture = await this.captureRect(variant.rect, {
            ...options,
            preview: false,
            label: `Variant ${variant.name}`,
          });
          results.push({ variant: variant.name, rect: variant.rect, ...capture });
        } catch (error) {
          results.push({ variant: variant.name, rect: variant.rect, error: error.message });
        }
      }

      console.table(
        results.map((entry) => ({
          variant: entry.variant,
          rect: `${entry.rect.left},${entry.rect.top},${entry.rect.width}x${entry.rect.height}`,
          image: entry.imageSize
            ? `${entry.imageSize.naturalWidth}x${entry.imageSize.naturalHeight}`
            : entry.error || "n/a",
        }))
      );
      return results;
    },

    async createCalibrationTarget(options = {}) {
      const webview = getActiveWebview();
      if (!webview) {
        throw new Error("No active webview found");
      }

      const settings = {
        size: options.size || 100,
        left: options.left || 120,
        top: options.top || 120,
        color: options.color || "#ff4d4f",
        label: options.label || "captureTab",
      };

      const result = await executeInWebview(
        webview,
        (payload) => {
          const id = "__capture_tab_lab_target";
          document.getElementById(id)?.remove();

          const el = document.createElement("div");
          el.id = id;
          el.textContent = payload.label;
          el.style.cssText = [
            "position: fixed",
            `left: ${payload.left}px`,
            `top: ${payload.top}px`,
            `width: ${payload.size}px`,
            `height: ${payload.size}px`,
            `background: ${payload.color}`,
            "color: white",
            "font: 13px/1.2 sans-serif",
            "display: flex",
            "align-items: center",
            "justify-content: center",
            "z-index: 2147483647",
            "border-radius: 12px",
            "box-shadow: 0 10px 28px rgba(0,0,0,0.22)",
          ].join("; ");

          document.documentElement.appendChild(el);
          const rect = el.getBoundingClientRect();
          return {
            rect: {
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
            },
            metrics: {
              innerWidth: window.innerWidth,
              innerHeight: window.innerHeight,
              scrollX: window.scrollX,
              scrollY: window.scrollY,
              devicePixelRatio: window.devicePixelRatio,
              visualViewport: window.visualViewport
                ? {
                    offsetLeft: window.visualViewport.offsetLeft,
                    offsetTop: window.visualViewport.offsetTop,
                    width: window.visualViewport.width,
                    height: window.visualViewport.height,
                    scale: window.visualViewport.scale,
                  }
                : null,
            },
          };
        },
        [settings]
      );

      console.log("[captureTab-lab] createCalibrationTarget", result);
      return result;
    },

    async removeCalibrationTarget() {
      const webview = getActiveWebview();
      if (!webview) return false;

      await executeInWebview(
        webview,
        () => {
          document.getElementById("__capture_tab_lab_target")?.remove();
          return true;
        },
        []
      );
      console.log("[captureTab-lab] Calibration target removed");
      return true;
    },

    async inspectPoint(clientX, clientY) {
      const webview = getActiveWebview();
      if (!webview) {
        throw new Error("No active webview found");
      }

      const webviewRect = webview.getBoundingClientRect();
      const uiZoom = getUiZoom(webview);
      const webviewZoom = await getWebviewZoom(webview);
      const pageX = ((clientX - webviewRect.left) * uiZoom) / webviewZoom;
      const pageY = ((clientY - webviewRect.top) * uiZoom) / webviewZoom;

      const result = await executeInWebview(
        webview,
        ({ pageX: x, pageY: y, uiZoomValue, webviewZoomValue }) => {
          const target = document.elementFromPoint(x, y);
          const link = target?.closest?.("a[href]") || null;
          if (!link) return null;

          const targetRect = target.getBoundingClientRect();
          const linkRect = link.getBoundingClientRect();
          const targetArea = targetRect.width * targetRect.height;
          const linkArea = linkRect.width * linkRect.height;

          const chosenRect =
            targetArea > 0 && targetArea <= linkArea * 1.25 ? targetRect : linkRect;

          return {
            href: link.href,
            text: (link.innerText || link.textContent || "").trim().slice(0, 180),
            targetTag: target.tagName,
            targetRect: {
              left: targetRect.left,
              top: targetRect.top,
              width: targetRect.width,
              height: targetRect.height,
            },
            linkRect: {
              left: linkRect.left,
              top: linkRect.top,
              width: linkRect.width,
              height: linkRect.height,
            },
            chosenPageRect: {
              left: chosenRect.left,
              top: chosenRect.top,
              width: chosenRect.width,
              height: chosenRect.height,
            },
            pageMetrics: {
              innerWidth: window.innerWidth,
              innerHeight: window.innerHeight,
              scrollX: window.scrollX,
              scrollY: window.scrollY,
              devicePixelRatio: window.devicePixelRatio,
              visualViewport: window.visualViewport
                ? {
                    offsetLeft: window.visualViewport.offsetLeft,
                    offsetTop: window.visualViewport.offsetTop,
                    width: window.visualViewport.width,
                    height: window.visualViewport.height,
                    scale: window.visualViewport.scale,
                  }
                : {
                    offsetLeft: 0,
                    offsetTop: 0,
                    width: window.innerWidth,
                    height: window.innerHeight,
                    scale: 1,
                  },
              uiZoom: uiZoomValue,
              webviewZoom: webviewZoomValue,
              zoomRatio: webviewZoomValue / uiZoomValue,
            },
          };
        },
        [{ pageX, pageY, uiZoomValue: uiZoom, webviewZoomValue: webviewZoom }]
      );

      if (!result) return null;

      const chosenUiRect = {
        left: (result.chosenPageRect.left / uiZoom) * webviewZoom + webviewRect.left,
        top: (result.chosenPageRect.top / uiZoom) * webviewZoom + webviewRect.top,
        width: (result.chosenPageRect.width / uiZoom) * webviewZoom,
        height: (result.chosenPageRect.height / uiZoom) * webviewZoom,
      };

      return {
        ...result,
        chosenUiRect,
        uiMetrics: {
          clientX,
          clientY,
          uiZoom,
          webviewZoom,
          zoomRatio: webviewZoom / uiZoom,
          webviewRect: {
            left: webviewRect.left,
            top: webviewRect.top,
            width: webviewRect.width,
            height: webviewRect.height,
          },
        },
      };
    },

    async captureCurrentHover(options = {}) {
      const webview = getActiveWebview();
      if (!webview) {
        throw new Error("No active webview found");
      }

      const pageState = await readHoverTrackerState(webview);
      if (!pageState) {
        throw new Error("No hover target is currently tracked");
      }

      const webviewRect = webview.getBoundingClientRect();
      const uiZoom = getUiZoom(webview);
      const webviewZoom = await getWebviewZoom(webview);
      const snapshot = {
        href: pageState.href,
        text: pageState.text,
        targetTag: pageState.targetTag,
        targetRect: pageState.targetRect,
        linkRect: pageState.linkRect,
        chosenPageRect: pageState.chosenPageRect,
        pageMetrics: {
          ...pageState.pageMetrics,
          uiZoom,
          webviewZoom,
          zoomRatio: webviewZoom / uiZoom,
        },
        uiMetrics: {
          clientX: pageState.pointer?.clientX ?? null,
          clientY: pageState.pointer?.clientY ?? null,
          uiZoom,
          webviewZoom,
          zoomRatio: webviewZoom / uiZoom,
          webviewRect: {
            left: webviewRect.left,
            top: webviewRect.top,
            width: webviewRect.width,
            height: webviewRect.height,
          },
        },
        sampledAt: pageState.sampledAt,
      };

      snapshot.chosenUiRect = {
        left: (snapshot.chosenPageRect.left / uiZoom) * webviewZoom + webviewRect.left,
        top: (snapshot.chosenPageRect.top / uiZoom) * webviewZoom + webviewRect.top,
        width: (snapshot.chosenPageRect.width / uiZoom) * webviewZoom,
        height: (snapshot.chosenPageRect.height / uiZoom) * webviewZoom,
      };

      return this.captureHoverSnapshot(snapshot, options);
    },

    buildVariantRect(snapshot, variant = "raw") {
      const builder = rectVariantBuilders[variant] || rectVariantBuilders.raw;
      return builder(snapshot);
    },

    async runRectVariantMatrix(options = {}) {
      const calibration = await this.createCalibrationTarget(options.calibration || {});
      const baseRect = roundRect(calibration.rect);
      const environment = await this.getEnvironmentSnapshot();
      const matrix = [];

      for (const variant of this.rectVariants) {
        const syntheticSnapshot = {
          chosenPageRect: baseRect,
          pageMetrics: {
            scrollX: calibration.metrics.scrollX,
            scrollY: calibration.metrics.scrollY,
            devicePixelRatio: calibration.metrics.devicePixelRatio,
            visualViewport: calibration.metrics.visualViewport || {
              offsetLeft: 0,
              offsetTop: 0,
            },
            zoomRatio: environment.zoomRatio,
          },
        };

        const rect = this.buildVariantRect(syntheticSnapshot, variant);
        try {
          const capture = await this.captureRect(rect, {
            preview: false,
            label: `Variant ${variant}`,
          });
          matrix.push({
            variant,
            rect,
            imageSize: capture.imageSize,
          });
        } catch (error) {
          matrix.push({
            variant,
            rect,
            error: error.message,
          });
        }
      }

      console.table(
        matrix.map((entry) => ({
          variant: entry.variant,
          rect: `${entry.rect.left},${entry.rect.top},${entry.rect.width}x${entry.rect.height}`,
          image: entry.imageSize
            ? `${entry.imageSize.naturalWidth}x${entry.imageSize.naturalHeight}`
            : entry.error || "n/a",
        }))
      );
      return { calibration, environment, matrix };
    },

    async runOutputSizeMatrix(rect, options = {}) {
      const normalizedRect = roundRect(rect);
      const cases = [
        { name: "rect-only", params: { rect: normalizedRect } },
        { name: "rect+width", params: { rect: normalizedRect, width: 160 } },
        { name: "rect+height", params: { rect: normalizedRect, height: 160 } },
        { name: "rect+width+height", params: { rect: normalizedRect, width: 160, height: 120 } },
        { name: "fullPage+rect", params: { rect: normalizedRect, fullPage: true } },
        { name: "fullPage:false+rect", params: { rect: normalizedRect, fullPage: false } },
      ];

      const results = [];
      for (const testCase of cases) {
        try {
          const capture = await this.captureRect(normalizedRect, {
            preview: false,
            ...testCase.params,
          });
          results.push({
            name: testCase.name,
            params: testCase.params,
            imageSize: capture.imageSize,
          });
        } catch (error) {
          results.push({
            name: testCase.name,
            params: testCase.params,
            error: error.message,
          });
        }
      }

      console.table(
        results.map((entry) => ({
          test: entry.name,
          output: entry.imageSize
            ? `${entry.imageSize.naturalWidth}x${entry.imageSize.naturalHeight}`
            : entry.error || "n/a",
        }))
      );
      return results;
    },

    async runBoundaryMatrix(rect, options = {}) {
      const normalizedRect = roundRect(rect);
      const cases = [
        { name: "negative-origin", rect: { left: -20, top: -20, width: normalizedRect.width, height: normalizedRect.height } },
        { name: "zero-width", rect: { ...normalizedRect, width: 0 } },
        { name: "zero-height", rect: { ...normalizedRect, height: 0 } },
        { name: "tiny", rect: { left: normalizedRect.left, top: normalizedRect.top, width: 1, height: 1 } },
        { name: "oversized", rect: { left: normalizedRect.left, top: normalizedRect.top, width: normalizedRect.width * 8, height: normalizedRect.height * 8 } },
      ];

      const results = [];
      for (const testCase of cases) {
        try {
          const capture = await this.captureRect(testCase.rect, {
            preview: false,
            ...options,
          });
          results.push({
            name: testCase.name,
            rect: roundRect(testCase.rect),
            imageSize: capture.imageSize,
          });
        } catch (error) {
          results.push({
            name: testCase.name,
            rect: roundRect(testCase.rect),
            error: error.message,
          });
        }
      }

      console.table(
        results.map((entry) => ({
          test: entry.name,
          rect: `${entry.rect.left},${entry.rect.top},${entry.rect.width}x${entry.rect.height}`,
          output: entry.imageSize
            ? `${entry.imageSize.naturalWidth}x${entry.imageSize.naturalHeight}`
            : entry.error || "n/a",
        }))
      );
      return results;
    },

    async captureHoverSnapshot(snapshot, options = {}) {
      const variant = options.variant || "raw";
      const captureApi = options.captureApi || "tab";
      const rect =
        captureApi === "ui"
          ? roundRect(snapshot.chosenUiRect)
          : this.buildVariantRect(snapshot, variant);
      const capture =
        captureApi === "ui"
          ? await this.captureUIRect(rect, {
              preview: options.previewOnCapture !== false,
              label: `Hover capture (${captureApi}:${variant})`,
            })
          : await this.captureRect(rect, {
              preview: options.previewOnCapture !== false,
              label: `Hover capture (${captureApi}:${variant})`,
            });

      const report = {
        href: snapshot.href,
        rect,
        variant,
        captureApi,
        hrefText: snapshot.text,
        pageMetrics: snapshot.pageMetrics,
        uiMetrics: snapshot.uiMetrics,
        targetRect: snapshot.targetRect,
        linkRect: snapshot.linkRect,
        chosenPageRect: snapshot.chosenPageRect,
        chosenUiRect: snapshot.chosenUiRect,
        imageSize: capture.imageSize,
        timestamp: new Date().toISOString(),
      };

      console.log("[captureTab-lab] Hover capture report", report);
      return { ...capture, report };
    },

    async startHoverLinkProbe(options = {}) {
      this.stopHoverLinkProbe();

      const webview = getActiveWebview();
      if (!webview) {
        throw new Error("No active webview found");
      }

      await injectHoverTracker(webview);

      const probe = {
        webview,
        activeVariant: options.variant || "raw",
        captureApi: options.captureApi || "tab",
        holdDelayMs: clampNumber(options.holdDelayMs, 2000),
        previewOnCapture: options.previewOnCapture !== false,
        overlayHandle: createOverlay(),
        lastTargetKey: null,
        lastSnapshot: null,
        timerId: null,
        pollId: null,
        captureLock: false,
        stopped: false,
      };

      const getSnapshotKey = (snapshot) => {
        if (!snapshot) return null;
        const rect = roundRect(snapshot.chosenPageRect);
        return [
          snapshot.href || "",
          rect.left,
          rect.top,
          rect.width,
          rect.height,
        ].join("|");
      };

      const renderOverlay = (snapshot) => {
        const { overlay, label } = probe.overlayHandle;
        if (!snapshot) {
          overlay.style.display = "none";
          return;
        }

        overlay.style.display = "block";
        overlay.style.left = `${Math.round(snapshot.chosenUiRect.left)}px`;
        overlay.style.top = `${Math.round(snapshot.chosenUiRect.top)}px`;
        overlay.style.width = `${Math.round(snapshot.chosenUiRect.width)}px`;
        overlay.style.height = `${Math.round(snapshot.chosenUiRect.height)}px`;
        label.textContent =
          `${probe.activeVariant} | ${Math.round(snapshot.chosenPageRect.left)}, ${Math.round(snapshot.chosenPageRect.top)}, ` +
          `${Math.round(snapshot.chosenPageRect.width)}x${Math.round(snapshot.chosenPageRect.height)}`;
      };

      const clearTimer = () => {
        if (probe.timerId) {
          clearTimeout(probe.timerId);
          probe.timerId = null;
        }
      };

      const resetProbe = () => {
        clearTimer();
        probe.lastTargetKey = null;
        probe.lastSnapshot = null;
        probe.captureLock = false;
        renderOverlay(null);
      };

      const scheduleCapture = () => {
        clearTimer();
        if (!probe.lastSnapshot) return;
        const scheduledKey = probe.lastTargetKey;
        probe.timerId = window.setTimeout(async () => {
          if (probe.stopped || !probe.lastSnapshot || probe.captureLock) return;
          if (scheduledKey !== probe.lastTargetKey) return;
          try {
            probe.captureLock = true;
            await this.captureHoverSnapshot(probe.lastSnapshot, {
              variant: probe.activeVariant,
              captureApi: probe.captureApi,
              previewOnCapture: probe.previewOnCapture,
            });
          } catch (error) {
            console.error("[captureTab-lab] Hover capture failed", error);
          } finally {
            probe.captureLock = false;
          }
        }, probe.holdDelayMs);
      };

      const handlePoint = async () => {
        try {
          const pageState = await readHoverTrackerState(probe.webview);
          if (!pageState) {
            resetProbe();
            return;
          }

          const webviewRect = probe.webview.getBoundingClientRect();
          const uiZoom = getUiZoom(probe.webview);
          const webviewZoom = await getWebviewZoom(probe.webview);

          const snapshot = {
            href: pageState.href,
            text: pageState.text,
            targetTag: pageState.targetTag,
            targetRect: pageState.targetRect,
            linkRect: pageState.linkRect,
            chosenPageRect: pageState.chosenPageRect,
            pageMetrics: {
              ...pageState.pageMetrics,
              uiZoom,
              webviewZoom,
              zoomRatio: webviewZoom / uiZoom,
            },
            uiMetrics: {
              clientX: pageState.pointer?.clientX ?? null,
              clientY: pageState.pointer?.clientY ?? null,
              uiZoom,
              webviewZoom,
              zoomRatio: webviewZoom / uiZoom,
              webviewRect: {
                left: webviewRect.left,
                top: webviewRect.top,
                width: webviewRect.width,
                height: webviewRect.height,
              },
            },
            sampledAt: pageState.sampledAt,
          };

          snapshot.chosenUiRect = {
            left: (snapshot.chosenPageRect.left / uiZoom) * webviewZoom + webviewRect.left,
            top: (snapshot.chosenPageRect.top / uiZoom) * webviewZoom + webviewRect.top,
            width: (snapshot.chosenPageRect.width / uiZoom) * webviewZoom,
            height: (snapshot.chosenPageRect.height / uiZoom) * webviewZoom,
          };

          probe.lastSnapshot = snapshot;
          renderOverlay(snapshot);
          const snapshotKey = getSnapshotKey(snapshot);

          if (snapshotKey !== probe.lastTargetKey) {
            probe.lastTargetKey = snapshotKey;
            console.log("[captureTab-lab] Hover target", {
              href: snapshot.href,
              text: snapshot.text,
              variant: probe.activeVariant,
              captureApi: probe.captureApi,
              targetRect: snapshot.targetRect,
              linkRect: snapshot.linkRect,
              chosenPageRect: snapshot.chosenPageRect,
              chosenUiRect: snapshot.chosenUiRect,
              pageMetrics: snapshot.pageMetrics,
              uiMetrics: snapshot.uiMetrics,
            });
            scheduleCapture();
          }
        } catch (error) {
          console.error("[captureTab-lab] Hover probe failed", error);
          resetProbe();
        }
      };

      const onBlur = () => resetProbe();
      const onVisibilityChange = () => {
        if (document.hidden) resetProbe();
      };

      probe.listeners = [
        ["blur", onBlur, true],
        ["visibilitychange", onVisibilityChange, true],
      ];

      for (const [type, handler, capture] of probe.listeners) {
        window.addEventListener(type, handler, capture);
      }

      probe.pollId = window.setInterval(() => {
        handlePoint();
      }, 90);

      probe.stop = () => {
        if (probe.stopped) return;
        probe.stopped = true;
        clearTimer();
        if (probe.pollId) {
          clearInterval(probe.pollId);
          probe.pollId = null;
        }
        for (const [type, handler, capture] of probe.listeners) {
          window.removeEventListener(type, handler, capture);
        }
        removeHoverTracker(probe.webview).catch(() => {});
        probe.overlayHandle.overlay.remove();
      };

      this.hoverProbe = probe;

      console.log("[captureTab-lab] Hover probe started", {
        variant: probe.activeVariant,
        captureApi: probe.captureApi,
        holdDelayMs: probe.holdDelayMs,
        variants: this.rectVariants,
      });

      return probe;
    },

    stopHoverLinkProbe() {
      if (!this.hoverProbe) return false;
      this.hoverProbe.stop();
      this.hoverProbe = null;
      console.log("[captureTab-lab] Hover probe stopped");
      return true;
    },
  };

  window[LAB_KEY] = lab;
  window.captureTabLab = lab;

  console.log("[captureTab-lab] Ready. Run captureTabLab.help() for commands.");
})();
