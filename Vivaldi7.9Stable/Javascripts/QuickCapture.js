// ==UserScript==
// @name         Quick Capture
// @description  Captures the hovered element region using clipboard, file, or Vivaldi screenshot selection modes.
// @version      2026.4.17
// @author       Tam710562, maubg, PaRr0tBoY
// ==/UserScript==

/*
 * Quick Capture
 * Based on Element Capture by Tam710562
 * Animation is based on Zen Browser by maubg
 */

(() => {
  'use strict';

  const QUICK_CAPTURE_CONFIG = {
    // Available modes: 'clipboard', 'file', 'default'.
    // clipboard: capture the hovered element region directly to clipboard.
    // file: capture the hovered element region through Vivaldi's file capture path.
    // default: auto-select the region, then let Vivaldi's screenshot selector handle output.
    mode: 'default',
    encodeFormat: 'png',
    encodeQuality: 85,
    showFileInPath: true,
    saveFilePattern: '',
  };
  const MOD_CONFIG_KEY = 'quickCapture';
  const MOD_CONFIG_FILE = 'config.json';
  const MOD_CONFIG_DIR = '.askonpage';

  function applySharedModConfig(raw) {
    const source = raw?.mods?.[MOD_CONFIG_KEY] && typeof raw.mods[MOD_CONFIG_KEY] === 'object'
      ? raw.mods[MOD_CONFIG_KEY]
      : {};
    if (typeof source.mode === 'string') {
      QUICK_CAPTURE_CONFIG.mode = source.mode;
    }
    if (typeof source.encodeFormat === 'string') {
      QUICK_CAPTURE_CONFIG.encodeFormat = source.encodeFormat;
    }
    if (Number.isFinite(Number(source.encodeQuality))) {
      QUICK_CAPTURE_CONFIG.encodeQuality = Number(source.encodeQuality);
    }
    if (typeof source.showFileInPath === 'boolean') {
      QUICK_CAPTURE_CONFIG.showFileInPath = source.showFileInPath;
    }
    if (typeof source.saveFilePattern === 'string') {
      QUICK_CAPTURE_CONFIG.saveFilePattern = source.saveFilePattern;
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

  loadSharedModConfig();
  window.addEventListener('vivaldi-mod-config-updated', (event) => {
    applySharedModConfig(event.detail || {});
  });

  const CAPTURE_MODES = new Set(['clipboard', 'file', 'default']);

  const gnoh = {
    getReactProps(element) {
      if (typeof element === 'string') {
        element = document.querySelector(element);
      }
      if (!element || element.ownerDocument !== document) {
        return;
      }
      if (!this.reactPropsKey) {
        this.reactPropsKey = Object.keys(element).find((key) => key.startsWith('__reactProps'));
      }
      return element[this.reactPropsKey];
    },
    promise: {
      delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      },
    },
    element: {
      getStyle(element) {
        return getComputedStyle(element);
      },
      executeScript(element, details, callback) {
        if (details.func) {
          details.code = `(${details.func})(${JSON.stringify(details.args || []).slice(1, -1)})`;
          delete details.func;
          delete details.args;
        }

        if (!callback) {
          return new Promise((resolve) => {
            element.executeScript(details, (results) => {
              resolve(results);
            });
          });
        }
        element.executeScript(details, callback);
      },
    },
    override(obj, functionName, callback, skipApply, runBefore) {
      this._overrides = this._overrides || {};
      let subKey = '';
      try {
        if (obj.ownerDocument === document) {
          this._overrides._elements = this._overrides._elements || [];
          const element = this._overrides._elements.find((item) => item.element === obj);
          let id;
          if (element) {
            id = element.id;
          } else {
            id = this.uuid.generate(this._overrides._elements.map((item) => item.id));
            this._overrides._elements.push({
              element: obj,
              id,
            });
          }
          subKey = '_' + id;
        }
      } catch (e) { }
      const key = functionName + '_' + obj.constructor.name + subKey;
      if (!this._overrides[key]) {
        this._overrides[key] = [];
        obj[functionName] = ((_super) => function () {
          let result;
          let skipApply = true;
          for (let i = 0; i < gnoh._overrides[key].length; i++) {
            skipApply = skipApply
              && (typeof gnoh._overrides[key][i].skipApply !== 'function'
                && gnoh._overrides[key][i].skipApply !== false || typeof gnoh._overrides[key][i].skipApply === 'function'
                && !!gnoh._overrides[key][i].skipApply.apply(this, arguments)
              );
            if (skipApply !== false && gnoh._overrides[key][i].runBefore === true) {
              gnoh._overrides[key][i].callback.apply(this, arguments);
            }
          }
          if (skipApply) {
            result = _super.apply(this, arguments);
          }
          for (let i = 0; i < gnoh._overrides[key].length; i++) {
            if (gnoh._overrides[key][i].runBefore !== true) {
              const args = Array.from(arguments);
              args.push(result);
              gnoh._overrides[key][i].callback.apply(this, args);
            }
          }
          return result;
        })(obj[functionName]);
      }

      this._overrides[key].push({
        callback,
        skipApply,
        runBefore,
      });
      return key;
    },
    uuid: {
      generate(ids) {
        let d = Date.now() + performance.now();
        let r;
        const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          r = (d + Math.random() * 16) % 16 | 0;
          d = Math.floor(d / 16);
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });

        if (Array.isArray(ids) && ids.includes(id)) {
          return this.generate(ids);
        }
        return id;
      },
    },
  };

  let rect = null;
  let pointerDownEvent = null;
  let isCapturing = false;
  let activeCaptureArea = null;
  let nativeSelectorCaptureArea = null;
  let nativeSelectorMonitor = null;
  let captureSessionId = 0;
  const nativeCaptureAreaStyleState = new WeakMap();
  const nativeCaptureAreaStyleProps = [
    'background',
    'border-color',
    'border-width',
    'visibility',
    'pointer-events',
  ];
  const captureAreaId = 'capture-area';
  const captureOverlayId = 'quick-capture-overlay';
  const captureStyleId = 'quick-capture-style';
  const captureDelay = 120;

  function getRect(element) {
    const rect = element.getBoundingClientRect();

    return {
      left: Math.round(Math.max(rect.left, 0)),
      top: Math.round(Math.max(rect.top, 0)),
      right: Math.round(Math.min(rect.right, window.innerWidth)),
      bottom: Math.round(Math.min(rect.bottom, window.innerHeight)),
    };
  }

  function getElement(x, y) {
    const elements = document.elementsFromPoint(x, y);
    return elements.find(el => el.id !== captureAreaId && el.id !== captureOverlayId);
  }

  function getCaptureMode() {
    return Array.from(document.forms).find(f => f.classList.contains('ControlPanel'))?.elements.modePicker?.value;
  }

  function getQuickCaptureMode() {
    const mode = String(QUICK_CAPTURE_CONFIG.mode || '').toLowerCase();
    return CAPTURE_MODES.has(mode) ? mode : 'clipboard';
  }

  function rectToCaptureParams(rect, mode = getQuickCaptureMode()) {
    const left = Math.max(0, Math.round(rect.left));
    const top = Math.max(0, Math.round(rect.top));
    const right = Math.min(window.innerWidth, Math.round(rect.right));
    const bottom = Math.min(window.innerHeight, Math.round(rect.bottom));
    const width = Math.max(1, right - left);
    const height = Math.max(1, bottom - top);
    const copyToClipboard = mode === 'clipboard';
    const saveToDisk = mode === 'file';
    const params = {
      windowId: Number(window.vivaldiWindowId),
      posX: left,
      posY: top,
      width,
      height,
      encodeFormat: QUICK_CAPTURE_CONFIG.encodeFormat,
      encodeQuality: QUICK_CAPTURE_CONFIG.encodeQuality,
      saveToDisk,
      showFileInPath: saveToDisk && !!QUICK_CAPTURE_CONFIG.showFileInPath,
      copyToClipboard,
    };

    if (saveToDisk && QUICK_CAPTURE_CONFIG.saveFilePattern) {
      params.saveFilePattern = QUICK_CAPTURE_CONFIG.saveFilePattern;
    }

    return params;
  }

  function getCaptureAreaProps(captureArea) {
    return captureArea ? gnoh.getReactProps(captureArea) : null;
  }

  function getCaptureOverlay() {
    let overlay = document.getElementById(captureOverlayId);
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = captureOverlayId;
      Object.assign(overlay.style, {
        position: 'fixed',
        zIndex: '1003',
        pointerEvents: 'none',
        display: 'none',
        boxSizing: 'border-box',
        border: '2px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.3) inset',
        borderRadius: '6px',
        transition: 'left 0.1s ease, top 0.1s ease, width 0.1s ease, height 0.1s ease',
      });
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  function ensureCaptureStyle() {
    if (document.getElementById(captureStyleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = captureStyleId;
    style.textContent = `
      .ControlPanel {
        z-index: 1004 !important;
      }
    `;
    document.head.appendChild(style);
  }

  function keepControlPanelAboveOverlay() {
    ensureCaptureStyle();
    const controlPanel = document.querySelector('.ControlPanel')
      || Array.from(document.forms).find(f => f.classList.contains('ControlPanel'));
    if (controlPanel?.style) {
      controlPanel.style.setProperty('z-index', '1004', 'important');
    }
  }

  function showCaptureOverlay(rect) {
    if (!rect) {
      return;
    }

    restoreCaptureOverlayShade();
    keepControlPanelAboveOverlay();
    const left = Math.max(0, Math.round(rect.left));
    const top = Math.max(0, Math.round(rect.top));
    const right = Math.min(window.innerWidth, Math.round(rect.right));
    const bottom = Math.min(window.innerHeight, Math.round(rect.bottom));
    const overlay = getCaptureOverlay();

    Object.assign(overlay.style, {
      display: 'block',
      left: `${left}px`,
      top: `${top}px`,
      width: `${Math.max(1, right - left)}px`,
      height: `${Math.max(1, bottom - top)}px`,
    });
  }

  function hideCaptureOverlay() {
    const overlay = document.getElementById(captureOverlayId);
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  function restoreCaptureOverlayShade() {
    const overlay = document.getElementById(captureOverlayId);
    if (overlay) {
      overlay.style.boxShadow = '0 0 0 1px rgba(255, 255, 255, 0.3) inset';
    }
  }

  function rememberNativeCaptureAreaStyle(captureArea, property) {
    if (!captureArea?.style || !nativeCaptureAreaStyleProps.includes(property)) {
      return;
    }

    const state = nativeCaptureAreaStyleState.get(captureArea) || {};
    if (!Object.prototype.hasOwnProperty.call(state, property)) {
      state[property] = {
        value: captureArea.style.getPropertyValue(property),
        priority: captureArea.style.getPropertyPriority(property),
      };
    }
    nativeCaptureAreaStyleState.set(captureArea, state);
  }

  function setNativeCaptureAreaStyle(captureArea, property, value, priority = '') {
    if (!captureArea?.style) {
      return;
    }

    rememberNativeCaptureAreaStyle(captureArea, property);
    captureArea.style.setProperty(property, value, priority);
  }

  function makeNativeCaptureAreaTransparent(captureArea) {
    if (!captureArea?.style) {
      return;
    }

    setNativeCaptureAreaStyle(captureArea, 'background', 'transparent');
    setNativeCaptureAreaStyle(captureArea, 'border-color', 'transparent');
    setNativeCaptureAreaStyle(captureArea, 'border-width', '0');
  }

  function restoreNativeCaptureArea(captureArea) {
    if (!captureArea?.style) {
      return;
    }

    const state = nativeCaptureAreaStyleState.get(captureArea);
    if (!state) {
      return;
    }

    Object.keys(state).forEach((property) => {
      const propertyState = state[property];
      if (propertyState?.value) {
        captureArea.style.setProperty(property, propertyState.value, propertyState.priority || '');
      } else {
        captureArea.style.removeProperty(property);
      }
    });
    nativeCaptureAreaStyleState.delete(captureArea);
  }

  function cleanupCaptureListeners(captureArea) {
    if (captureArea) {
      captureArea.removeEventListener('pointerdown', pointerDownEventHandler, true);
      captureArea.removeEventListener('pointermove', pointerMoveEventHandler, true);
      captureArea.removeEventListener('pointerup', pointerUpEventHandler, true);
      captureArea.removeEventListener('pointerleave', pointerLeaveEventHandler, true);
    }
    document.removeEventListener('keydown', keyDownEventHandler, true);
    if (activeCaptureArea === captureArea) {
      activeCaptureArea = null;
    }
  }

  function clearNativeSelectorMonitor(captureArea) {
    if (nativeSelectorMonitor) {
      clearInterval(nativeSelectorMonitor);
      nativeSelectorMonitor = null;
    }
    if (!captureArea || nativeSelectorCaptureArea === captureArea) {
      nativeSelectorCaptureArea = null;
    }
    restoreNativeCaptureArea(captureArea);
    hideCaptureOverlay();
    restoreCaptureOverlayShade();
  }

  function armCaptureArea(captureArea) {
    if (nativeSelectorCaptureArea && isCaptureAreaInactive(nativeSelectorCaptureArea)) {
      clearNativeSelectorMonitor(nativeSelectorCaptureArea);
    }

    if (!captureArea || nativeSelectorCaptureArea === captureArea || activeCaptureArea === captureArea) {
      return;
    }

    cleanupCaptureListeners(activeCaptureArea);
    rect = null;
    pointerDownEvent = null;
    isCapturing = false;
    activeCaptureArea = captureArea;
    captureSessionId += 1;
    hideCaptureOverlay();
    restoreCaptureOverlayShade();
    restoreNativeCaptureArea(captureArea);

    document.addEventListener('keydown', keyDownEventHandler, true);
    captureArea.addEventListener('pointerdown', pointerDownEventHandler, { once: true, capture: true });
    captureArea.addEventListener('pointermove', pointerMoveEventHandler, true);
    captureArea.addEventListener('pointerup', pointerUpEventHandler, true);
    captureArea.addEventListener('pointerleave', pointerLeaveEventHandler, true);
  }

  function isCaptureAreaInactive(captureArea) {
    if (!captureArea?.isConnected || captureArea.hidden) {
      return true;
    }

    const style = window.getComputedStyle(captureArea);
    return style.visibility === 'hidden' || style.display === 'none';
  }

  function isActiveCaptureSession(captureArea, sessionId) {
    return activeCaptureArea === captureArea && captureSessionId === sessionId;
  }

  function monitorNativeCaptureEnd(captureArea) {
    let attempts = 0;
    nativeSelectorCaptureArea = captureArea;
    if (nativeSelectorMonitor) {
      clearInterval(nativeSelectorMonitor);
    }

    const monitor = setInterval(() => {
      if (nativeSelectorMonitor !== monitor) {
        clearInterval(monitor);
        return;
      }

      attempts += 1;
      if (getCaptureMode() !== 'area' || isCaptureAreaInactive(captureArea) || attempts > 1200) {
        clearNativeSelectorMonitor(captureArea);
      }
    }, 100);

    nativeSelectorMonitor = monitor;
  }

  async function closeCaptureArea(captureArea, restoreAfterDelay = true) {
    hideCaptureOverlay();
    restoreCaptureOverlayShade();
    cleanupCaptureListeners(captureArea);

    const captureAreaProps = getCaptureAreaProps(captureArea);
    if (captureAreaProps?.onKeyDown) {
      captureAreaProps.onKeyDown(new KeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        which: 27,
        bubbles: true,
        cancelable: true,
      }));
    }

    if (captureArea?.style) {
      setNativeCaptureAreaStyle(captureArea, 'visibility', 'hidden');
      setNativeCaptureAreaStyle(captureArea, 'pointer-events', 'none');
    }

    await gnoh.promise.delay(captureDelay);
    if (restoreAfterDelay) {
      restoreNativeCaptureArea(captureArea);
    }
  }

  function keyDownEventHandler(event) {
    if (event.key !== 'Escape' && event.keyCode !== 27) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    void closeCaptureArea(activeCaptureArea || document.getElementById(captureAreaId));
  }

  function captureUI(params) {
    return new Promise((resolve, reject) => {
      if (!window.vivaldi?.thumbnails || typeof vivaldi.thumbnails.captureUI !== 'function') {
        reject(new Error('vivaldi.thumbnails.captureUI is unavailable'));
        return;
      }
      if (!Number.isFinite(params.windowId)) {
        reject(new Error('window.vivaldiWindowId is unavailable'));
        return;
      }

      vivaldi.thumbnails.captureUI(params, (success, dataUrl) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!success) {
          reject(new Error('captureUI returned false'));
          return;
        }
        resolve(dataUrl || null);
      });
    });
  }

  async function simulateSelect(captureArea, retryCount = 0) {
    if (!captureArea || !captureArea.parentElement || !rect) {
      return false;
    }

    const captureAreaProps = getCaptureAreaProps(captureArea);
    if (!captureAreaProps?.onPointerDown || !captureAreaProps?.onPointerMove || !captureAreaProps?.onPointerUp) {
      return false;
    }

    captureAreaProps.onPointerDown(new PointerEvent('pointerdown', {
      view: window,
      bubbles: true,
      cancelable: true,
      buttons: 1,
      pointerType: 'mouse',
      clientX: rect.left,
      clientY: rect.top,
      pointerId: 1,
    }));

    await gnoh.promise.delay(10);
    captureAreaProps.onPointerMove(new PointerEvent('pointermove', {
      view: window,
      bubbles: true,
      cancelable: true,
      buttons: 1,
      pointerType: 'mouse',
      clientX: rect.right,
      clientY: rect.bottom,
    }));

    await gnoh.promise.delay(10);
    captureAreaProps.onPointerUp(new PointerEvent('pointerup', {
      view: window,
      bubbles: true,
      cancelable: true,
      buttons: 1,
      pointerType: 'mouse',
      pointerId: 1,
    }));

    await gnoh.promise.delay(10);
    const style = window.getComputedStyle(captureArea);
    const selectionMismatch = [
      [rect.top, parseFloat(style.borderTopWidth)],
      [rect.left, parseFloat(style.borderLeftWidth)],
      [window.innerHeight - rect.bottom, parseFloat(style.borderBottomWidth)],
      [window.innerWidth - rect.right, parseFloat(style.borderRightWidth)],
    ].some(([expected, actual]) => Number.isFinite(actual) && Math.abs(expected - actual) >= 10);

    if (selectionMismatch && retryCount < 3) {
      return simulateSelect(captureArea, retryCount + 1);
    }

    return !selectionMismatch;
  }

  async function delegateToVivaldiSelector(captureArea) {
    if (isCapturing || !rect) {
      return;
    }

    isCapturing = true;

    try {
      cleanupCaptureListeners(captureArea);
      restoreNativeCaptureArea(captureArea);
      const didSelect = await simulateSelect(captureArea);
      if (!didSelect) {
        restoreNativeCaptureArea(captureArea);
        hideCaptureOverlay();
        restoreCaptureOverlayShade();
        console.warn('[QuickCapture] Failed to select region in Vivaldi screenshot selector');
        return;
      }
      restoreNativeCaptureArea(captureArea);
      hideCaptureOverlay();
      restoreCaptureOverlayShade();
      monitorNativeCaptureEnd(captureArea);
      console.info('[QuickCapture] Delegated selected region to Vivaldi screenshot selector');
    } catch (error) {
      console.error('[QuickCapture] Failed to delegate region', error);
    } finally {
      isCapturing = false;
      rect = null;
      pointerDownEvent = null;
    }
  }

  async function quickCapture(captureArea) {
    if (isCapturing || !rect) {
      return;
    }

    isCapturing = true;
    const mode = getQuickCaptureMode();
    const params = rectToCaptureParams(rect, mode);

    try {
      await closeCaptureArea(captureArea, false);
      await captureUI(params);
      console.info(`[QuickCapture] Captured region in ${mode} mode`, params);
    } catch (error) {
      console.error('[QuickCapture] Failed to capture region', error);
    } finally {
      restoreNativeCaptureArea(captureArea);
      isCapturing = false;
      rect = null;
      pointerDownEvent = null;
    }
  }

  function pointerDownEventHandler(event) {
    pointerDownEvent = event;
    event.preventDefault();
    event.stopPropagation();
  }

  async function updateCaptureRect(captureArea, clientX, clientY, sessionId = captureSessionId) {
    if (!isActiveCaptureSession(captureArea, sessionId)) {
      return false;
    }

    const element = getElement(clientX, clientY);

    if (!element) {
      rect = null;
      return false;
    }

    let nextRect = null;

    if (element.closest('webview')) {
      const webview = element.closest('webview');
      const webviewRect = getRect(webview);
      const zoom = parseFloat(gnoh.element.getStyle(element).getPropertyValue('--uiZoomLevel')) || 1;
      const webviewZoom = await new Promise((resolve) => {
        webview.getZoom((res) => {
          resolve(res || 1);
        });
      });

      if (!isActiveCaptureSession(captureArea, sessionId)) {
        return false;
      }

      const results = await gnoh.element.executeScript(webview, {
        func: inject,
        args: [
          {
            x: (clientX - webviewRect.left) * zoom / webviewZoom,
            y: (clientY - webviewRect.top) * zoom / webviewZoom,
          }
        ],
      });

      if (!isActiveCaptureSession(captureArea, sessionId)) {
        return false;
      }

      if (results?.[0]) {
        nextRect = results[0];
        nextRect.left = nextRect.left / zoom * webviewZoom + webviewRect.left;
        nextRect.top = nextRect.top / zoom * webviewZoom + webviewRect.top;
        nextRect.right = nextRect.right / zoom * webviewZoom + webviewRect.left;
        nextRect.bottom = nextRect.bottom / zoom * webviewZoom + webviewRect.top;
      } else {
        nextRect = webviewRect;
      }
    } else {
      nextRect = getRect(element);
    }

    if (nextRect && isActiveCaptureSession(captureArea, sessionId)) {
      rect = nextRect;
      makeNativeCaptureAreaTransparent(captureArea);
      showCaptureOverlay(rect);
      return true;
    }

    return false;
  }

  async function pointerMoveEventHandler(event) {
    if (getCaptureMode() !== 'area') {
      return;
    }

    if (
      pointerDownEvent
      && Math.abs(event.pageX - pointerDownEvent.clientX) > 4
      && Math.abs(event.pageY - pointerDownEvent.clientY) > 4
    ) {
      cleanupCaptureListeners(this);

      const captureAreaProps = getCaptureAreaProps(this);
      hideCaptureOverlay();
      restoreCaptureOverlayShade();
      restoreNativeCaptureArea(this);
      captureAreaProps?.onPointerDown?.(pointerDownEvent);
      return;
    }

    await updateCaptureRect(this, event.clientX, event.clientY, captureSessionId);
  }

  async function pointerUpEventHandler(event) {
    event.preventDefault();
    event.stopPropagation();

    if (event.which === 3 || event.button === 2) {
      cleanupCaptureListeners(this);
      await closeCaptureArea(this);
      return;
    }

    if (!rect) {
      await updateCaptureRect(this, event.clientX, event.clientY, captureSessionId);
    }

    cleanupCaptureListeners(this);
    if (!rect) {
      hideCaptureOverlay();
      restoreCaptureOverlayShade();
      restoreNativeCaptureArea(this);
      return;
    }

    if (getQuickCaptureMode() === 'default') {
      await delegateToVivaldiSelector(this);
    } else {
      await quickCapture(this);
    }
  }

  function pointerLeaveEventHandler(event) {
    event.preventDefault();
    event.stopPropagation();

    hideCaptureOverlay();
    restoreCaptureOverlayShade();
    restoreNativeCaptureArea(this);
    cleanupCaptureListeners(this);
  }

  function inject({ x, y }) {
    const element = document.elementFromPoint(x, y);
    if (!element) {
      return null;
    }

    const rect = element.getBoundingClientRect();

    return {
      left: Math.round(Math.max(rect.left, 0)),
      top: Math.round(Math.max(rect.top, 0)),
      right: Math.round(Math.min(rect.right, window.innerWidth)),
      bottom: Math.round(Math.min(rect.bottom, window.innerHeight)),
    };
  }

  gnoh.override(HTMLDivElement.prototype, 'appendChild', async (element) => {
    if (element.id === captureAreaId) {
      armCaptureArea(element);
    }
  });
})();
