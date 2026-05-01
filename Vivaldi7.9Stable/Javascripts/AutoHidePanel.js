// ==UserScript==
// @name         Auto Hide Panel
// @description  Opens Vivaldi panels on mouse over and optionally closes them when focus returns to the page.
// @version      2026.4.18
// @author       MasterLeo29, mbuch, nafumofu, PaRr0tBoY
// @website https://forum.vivaldi.net/topic/28413/open-panels-on-mouse-over/22?_=1593504963587
// ==/UserScript==

(async () => {
  "use strict";

  const config = {
    // Automatically close the panel when the mouse pointer enters the WebView or when the focus moves to the WebView (true: enabled, false: disabled)
    auto_close: true,

    // Automatically close the panel in fixed display mode (true: enabled, false: disabled)
    close_fixed: true,

    // Delay time before opening the panel (milliseconds)
    open_delay: 280,

    // Delay time before switching the panel (milliseconds)
    switch_delay: 40,

    // Delay time before closing the panel (milliseconds)
    close_delay: 280,

    // Delay time before closing the panel in fixed display mode (milliseconds)
    close_delay_fixed: 3000,
  };
  const MOD_CONFIG_KEY = "autoHidePanel";
  const MOD_CONFIG_FILE = "config.json";
  const MOD_CONFIG_DIR = ".askonpage";

  function applySharedModConfig(raw) {
    const source = raw?.mods?.[MOD_CONFIG_KEY] && typeof raw.mods[MOD_CONFIG_KEY] === "object"
      ? raw.mods[MOD_CONFIG_KEY]
      : {};
    ["auto_close", "close_fixed"].forEach((key) => {
      if (typeof source[key] === "boolean") {
        config[key] = source[key];
      }
    });
    ["open_delay", "switch_delay", "close_delay", "close_delay_fixed"].forEach((key) => {
      const value = Number(source[key]);
      if (Number.isFinite(value)) {
        config[key] = value;
      }
    });
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

  const addStyleSheet = (css) => {
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(css);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];
  };

  const fixWebViewMouseEvent = () => {
    addStyleSheet(`
            #main:has(#panels-container:hover) #webview-container {
                pointer-events: none !important;
            }
        `);
  };

  const waitForElement = (selector, startNode = document) => {
    return new Promise((resolve) => {
      const timerId = setInterval(() => {
        const elem = startNode.querySelector(selector);

        if (elem) {
          clearInterval(timerId);
          resolve(elem);
        }
      }, 100);
    });
  };

  const simulateClick = (element) => {
    element.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true, pointerId: 1 })
    );
    element.dispatchEvent(
      new PointerEvent("mousedown", { bubbles: true, detail: 1 })
    );
    element.dispatchEvent(
      new PointerEvent("pointerup", { bubbles: true, pointerId: 1 })
    );
    element.dispatchEvent(
      new PointerEvent("mouseup", { bubbles: true, detail: 1 })
    );
    element.dispatchEvent(new PointerEvent("click", { bubbles: true }));
  };

  const getActiveButton = () =>
    document.querySelector("#panels .active > button");

  const isOverlayPanel = () =>
    document.querySelector("#panels-container.overlay");

  const getCloseDelay = () =>
    isOverlayPanel() ? config.close_delay : config.close_delay_fixed;

  const togglePanel = (button, doDelay) => {
    const delay = doDelay
      ? getActiveButton()
        ? config.switch_delay
        : config.open_delay
      : 0;

    clearTimeout(showToken);
    showToken = setTimeout(() => {
      simulateClick(button);
    }, delay);
  };

  let closeToken;
  const cancelClosePanel = () => {
    clearTimeout(closeToken);
    closeToken = undefined;
  };

  const closePanel = () => {
    if (!config.auto_close) return;
    if (!config.close_fixed && !isOverlayPanel()) return;

    cancelClosePanel();
    closeToken = setTimeout(() => {
      closeToken = undefined;
      if (document.querySelector("#panels-container:hover")) return;

      const activeButton = getActiveButton();
      if (activeButton) {
        simulateClick(activeButton);
      }
    }, getCloseDelay());
  };

  const getPanelButton = (element) =>
    element.closest?.(
      'button:is([data-name^="Panel"], [data-name^="WEBPANEL_"], [name^="Panel"], [name^="WEBPANEL_"]):not([data-name="PanelWeb"]):not([name="PanelWeb"])'
    );

  let showToken;
  const panelMouseOver = () => {
    const eventHandler = (event) => {
      const button = getPanelButton(event.target);

      if (
        button &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.metaKey
      ) {
        switch (event.type) {
          case "mouseenter":
            cancelClosePanel();
            togglePanel(button, true);
            break;
          case "mouseleave":
            clearTimeout(showToken);
            break;
          case "dragenter":
            togglePanel(button, false);
            break;
        }
      }
    };

    const panelsContainer = document.querySelector("#panels-container");
    const webviewContainer = document.querySelector("#webview-container");
    panelsContainer.addEventListener("mouseenter", cancelClosePanel);
    webviewContainer.addEventListener("mouseenter", closePanel);
    webviewContainer.addEventListener("animationstart", (event) => {
      if (
        event.target.matches("webview") &&
        event.animationName === "delay_visibility"
      ) {
        closePanel();
      }
    });

    const panels = document.querySelector("#panels");
    panels.addEventListener("mouseenter", eventHandler, { capture: true });
    panels.addEventListener("mouseleave", eventHandler, { capture: true });
    panels.addEventListener("dragenter", eventHandler, { capture: true });
  };

  await waitForElement("#browser");
  await waitForElement("#panels");
  await waitForElement("#webview-container");
  fixWebViewMouseEvent();
  panelMouseOver();
})();
