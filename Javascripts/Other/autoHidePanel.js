// https://forum.vivaldi.net/topic/28413/open-panels-on-mouse-over/22?_=1593504963587
// @author MasterLeo29,mbuch,nafumofu
(async () => {
  "use strict";

  const config = {
    // WebView にマウスポインターが入るか、WebView にフォーカスが移ると自動的にパネルを閉じる (true: 有効, false: 無効)
    // Automatically close the panel when the mouse pointer enters the WebView or when the focus moves to the WebView (true: enabled, false: disabled)
    auto_close: true,

    // 固定表示モードで自動的にパネルを閉じる (true: 有効, false: 無効)
    // Automatically close the panel in fixed display mode (true: enabled, false: disabled)
    close_fixed: false,

    // パネルを開くまでの遅延時間 (ミリ秒)
    // Delay time before opening the panel (milliseconds)
    open_delay: 280,

    // パネルを切り替えるまでの遅延時間 (ミリ秒)
    // Delay time before switching the panel (milliseconds)
    switch_delay: 40,

    // パネルを閉じるまでの遅延時間 (ミリ秒)
    // Delay time before closing the panel (milliseconds)
    close_delay: 280,
  };

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
      new PointerEvent("pointerdown", { bubbles: true, pointerId: 1 }),
    );
    element.dispatchEvent(
      new PointerEvent("mousedown", { bubbles: true, detail: 1 }),
    );
    element.dispatchEvent(
      new PointerEvent("pointerup", { bubbles: true, pointerId: 1 }),
    );
    element.dispatchEvent(
      new PointerEvent("mouseup", { bubbles: true, detail: 1 }),
    );
    element.dispatchEvent(new PointerEvent("click", { bubbles: true }));
  };

  const getActiveButton = () =>
    document.querySelector("#panels .active > button");

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

  const closePanel = () => {
    if (
      !config.close_fixed &&
      !document.querySelector("#panels-container.overlay")
    )
      return;

    setTimeout(() => {
      const activeButton = getActiveButton();
      if (activeButton) {
        simulateClick(activeButton);
      }
    }, config.close_delay);
  };

  const isPanelButton = (element) =>
    element.matches(
      'button:is([name^="Panel"], [name^="WEBPANEL_"]):not([name="PanelWeb"])',
    );

  let showToken;
  const panelMouseOver = () => {
    const eventHandler = (event) => {
      if (
        isPanelButton(event.target) &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.metaKey
      ) {
        switch (event.type) {
          case "mouseenter":
            togglePanel(event.target, true);
            break;
          case "mouseleave":
            clearTimeout(showToken);
            break;
          case "dragenter":
            togglePanel(event.target, false);
            break;
        }
      }
    };

    if (config.auto_close) {
      document
        .querySelector("#webview-container")
        .addEventListener("mouseenter", closePanel);
      document
        .querySelector("#webview-container")
        .addEventListener("animationstart", (event) => {
          if (
            event.target.matches("webview") &&
            event.animationName === "delay_visibility"
          ) {
            closePanel();
          }
        });
    }

    const panels = document.querySelector("#panels");
    panels.addEventListener("mouseenter", eventHandler, { capture: true });
    panels.addEventListener("mouseleave", eventHandler, { capture: true });
    panels.addEventListener("dragenter", eventHandler, { capture: true });
  };

  await waitForElement("#browser");
  fixWebViewMouseEvent();
  panelMouseOver();
})();
