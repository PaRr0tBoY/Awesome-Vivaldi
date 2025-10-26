/**
 * v5
 * Opens links in a dialog, either by key combinations, holding the middle mouse button or context menu
 * Forum link: https://forum.vivaldi.net/topic/92501/open-in-dialog-mod?_=1717490394230
 *
 * New feature: Long-press right click to open pop-up
 * - Holding right click for 400ms opens links in a pop-up dialog
 * - Features a 200ms-delayed circular progress indicator to prevent accidental triggers
 * - Supports customization of progress ring size, stroke width, color and delay time
 * - Configuration options:
 *   - rightClickHoldTime: Total long-press duration (400ms)
 *   - rightClickHoldDelay: Delay before showing progress ring (200ms)
 *   - progressRingRadius: Progress ring radius (20px)
 *   - progressRingWidth: Progress ring stroke width (3px)
 *   - ringColor: Progress ring color ("default" for gradient or specific color value like "#ff0000")
 */
(() => {
  const ICON_CONFIG = {
      linkIcon: "fa-solid fa-arrow-up-right-from-square", // if set, an icon shows up after links - example values 'fa-solid fa-up-right-from-square', 'fa-solid fa-circle-info', 'fa-regular fa-square' search for other icons: https://fontawesome.com/search?o=r&ic=free&s=solid&ip=classic
      linkIconInteractionOnHover: true, // if false, you have to click the icon to show the dialog - if true, the dialog shows on mouseenter
      showIconDelay: 250, // set to 0 to disable - delays showing the icon on hovering a link
      showDialogOnHoverDelay: 100, // set to 0 to disable - delays showing the dialog on hovering the linkIcon
      rightClickHoldTime: 400, // Long-press duration (in milliseconds) to open dialogTab
      rightClickHoldDelay: 200, // Long-press the right button to delay the display of the progress ring (milliseconds)
      progressRingRadius: 20, // Radius of the progress ring
      progressRingWidth: 3, // The line width of the progress ring
      ringColor: "#40E0D0", // Progress ring color: Specify a color value (e.g., "#ff0000") or use "default" for a gradient color.
    },
    CONTEXT_MENU_CONFIG = {
      menuPrefix: "[Peek]",
      linkMenuTitle: "Show Popup",
      searchMenuTitle: 'Search "%s"',
      selectSearchMenuTitle: "Search With ...",
    };

  // Wait for the browser to come to a ready state
  setTimeout(function waitDialog() {
    const browser = document.getElementById("browser");
    if (!browser) {
      return setTimeout(waitDialog, 300);
    }
    new DialogMod();
  }, 300);

  class DialogMod {
    webviews = new Map();
    iconUtils = new IconUtils();
    searchEngineUtils = new SearchEngineUtils(
      (url) => this.dialogTab(url),
      (engineId, searchText) => this.dialogTabSearch(engineId, searchText),
      CONTEXT_MENU_CONFIG,
    );
    KEYBOARD_SHORTCUTS = {
      "Ctrl+Alt+Period": this.searchForSelectedText.bind(this),
      "Ctrl+Shift+F": this.searchForSelectedText.bind(this),
      Esc: () => this.closeLastDialog(),
    };
    // 'https://clearthis.page/?u='; stopped service?
    // change also in dialog.css => &:has(webview[src^="READER_VIEW_URL"]) .reader-view-toggle
    // alternative => https://www.smry.ai/proxy?url=
    READER_VIEW_URL =
      "https://app.web-highlights.com/reader/open-website-in-reader-mode?url=";

    constructor() {
      // 检测是否有dialogTab.css支持
      this.hasDialogCSS = this.checkDialogCSSSupport();

      // Setup keyboard shortcuts
      vivaldi.tabsPrivate.onKeyboardShortcut.addListener(
        this.keyCombo.bind(this),
      );

      new WebsiteInjectionUtils(
        (navigationDetails) => this.getWebviewConfig(navigationDetails),
        (url, fromPanel) => this.dialogTab(url, fromPanel),
        ICON_CONFIG,
      );
    }

    /**
     * 检测是否有dialogTab.css支持
     */
    checkDialogCSSSupport() {
      try {
        // 检查是否存在dialog-open相关的CSS规则
        const style = document.createElement('style');
        style.textContent = `
          body.dialog-open #browser #webpage-stack {
            transform: scale(0.985) !important;
          }
        `;
        document.head.appendChild(style);

        // 检查样式是否被应用
        const webpageStack = document.querySelector('#browser #webpage-stack');
        const originalTransform = webpageStack ? webpageStack.style.transform : '';

        // 触发重绘
        if (webpageStack) {
          webpageStack.style.transform = 'scale(0.98)';
          webpageStack.offsetHeight; // 强制重绘
        }

        document.body.classList.add('dialog-open');
        const hasCSS = webpageStack && webpageStack.style.transform === 'scale(0.985)';

        // 清理
        document.body.classList.remove('dialog-open');
        document.head.removeChild(style);
        if (webpageStack) {
          webpageStack.style.transform = originalTransform;
        }

        return hasCSS;
      } catch (e) {
        console.warn('dialogTab CSS support check failed:', e);
        return false;
      }
    }

    /**
     * Finds the correct configuration for showing the dialog
     */
    getWebviewConfig(navigationDetails) {
      if (navigationDetails.frameType !== "outermost_frame")
        return { webview: null, fromPanel: false };

      // first dialog from tab or webpanel
      let webview = document.querySelector(
        `webview[tab_id="${navigationDetails.tabId}"]`,
      );
      if (webview)
        return { webview, fromPanel: webview.name === "vivaldi-webpanel" };

      // follow-up dialog from the webpanel
      webview = Array.from(this.webviews.values()).find(
        (view) => view.fromPanel,
      )?.webview;
      if (webview) return { webview, fromPanel: true };

      // follow-up dialog from tab
      const lastWebviewId = document.querySelector(
        ".active.visible.webpageview .dialog-container:last-of-type webview",
      )?.id;
      return {
        webview: this.webviews.get(lastWebviewId)?.webview,
        fromPanel: false,
      };
    }

    /**
     * Open Default Search Engine in Dialog and search for the selected text
     * @returns {Promise<void>}
     */
    async searchForSelectedText() {
      const tabs = await chrome.tabs.query({ active: true });
      vivaldi.utilities.getSelectedText(tabs[0].id, (text) =>
        this.dialogTabSearch(this.searchEngineUtils.defaultSearchId, text),
      );
    }

    /**
     * Prepares url for search, calls dailogTab function
     * @param {String} engineId engine id of the engine to be used
     * @param {int} selectionText the text to search
     */
    async dialogTabSearch(engineId, selectionText) {
      let searchRequest = await vivaldi.searchEngines.getSearchRequest(
        engineId,
        selectionText,
      );
      this.dialogTab(searchRequest.url);
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
     * Removes the dialog for a giveb webview
     * @param webviewId The id of the webview
     */
    removeDialog(webviewId) {
      const data = this.webviews.get(webviewId);
      if (data) {
        chrome.tabs.query({}, (tabs) => {
          const tab = tabs.find(
            (tab) =>
              tab.vivExtData && tab.vivExtData.includes(`${webviewId}tabId`),
          );
          if (tab) chrome.tabs.remove(tab.id);
        });

        data.divContainer.remove();
        chrome.tabs.onRemoved.removeListener(data.tabCloseListener);
        this.webviews.delete(webviewId);
      }
    }

    /**
     * 关闭最后一个打开的 dialogTab
     */
    closeLastDialog() {
      if (!this.webviews.size) return;

      const webviewValues = Array.from(this.webviews.values());
      let webviewData = webviewValues.at(-1);
      if (!webviewData.fromPanel) {
        const tabId = Number(
          document.querySelector(".active.visible.webpageview webview").tab_id,
        );
        webviewData = webviewValues.findLast((_data) => _data.tabId === tabId);
      }

      if (webviewData) {
        const dialogContainer = webviewData.divContainer;
        dialogContainer.classList.remove("open");
        dialogContainer.classList.add("closing");

        // 背景网页恢复 - 仅在有对应的CSS时才操作body类
        if (this.hasDialogCSS) {
            document.body.classList.remove("dialog-open");
        }

        // 监听动画结束（只等子元素 dialog-tab 动画结束即可）
        const tabEl = dialogContainer.querySelector(".dialog-tab");
        tabEl.addEventListener(
          "animationend",
          () => {
            // 移除整个容器（遮罩+内容）
            dialogContainer.remove();
            // 从 webviews 集合里清理
            const webviewId = Array.from(this.webviews.entries()).find(
              ([_, data]) => data.divContainer === dialogContainer,
            )?.[0];
            if (webviewId) {
              this.webviews.delete(webviewId);
            }
            // 通知 link interaction handler 关闭完成
            chrome.runtime.sendMessage({ type: 'dialog-closed' });
          },
          { once: true },
        );
      }
    }

    /**
     * Checks if the current window is the correct window to show the dialog and then opens the dialog
     * @param {string} linkUrl the url to load
     * @param {boolean} fromPanel indicates whether the dialog is opened from a panel
     */
    dialogTab(linkUrl, fromPanel = undefined) {
      chrome.windows.getLastFocused((window) => {
        if (
          window.id === vivaldiWindowId &&
          window.state !== chrome.windows.WindowState.MINIMIZED
        ) {
          this.showDialog(linkUrl, fromPanel);
        }
      });
    }

    /**
     * Opens a link in a dialog like display in the current visible tab
     * @param {string} linkUrl the url to load
     * @param {boolean} fromPanel indicates whether the dialog is opened from a panel
     */
    showDialog(linkUrl, fromPanel) {
      const dialogContainer = document.createElement("div"),
        dialogTab = document.createElement("div"),
        webview = document.createElement("webview"),
        webviewId = `dialog-${this.getWebviewId()}`,
        progressBar = new ProgressBar(webviewId),
        optionsContainer = document.createElement("div");

      if (fromPanel === undefined && this.webviews.size !== 0) {
        fromPanel = Array.from(this.webviews.values()).at(-1).fromPanel;
      }

      const tabId = !fromPanel
        ? Number(
            document.querySelector(".active.visible.webpageview webview")
              .tab_id,
          )
        : null;

      // ESC 键关闭逻辑已移到 closeLastDialog 方法中

      this.webviews.set(webviewId, {
        divContainer: dialogContainer,
        webview: webview,
        fromPanel: fromPanel,
        tabId: tabId,
      });

      // remove dialogs when tab is closed without closing dialogs
      if (!fromPanel) {
        const clearWebviews = (closedTabId) => {
          if (tabId === closedTabId) {
            this.webviews.forEach(
              (view, key) =>
                view.tabCloseListener === clearWebviews &&
                this.closeLastDialog(),
            );
            chrome.tabs.onRemoved.removeListener(clearWebviews);
          }
        };
        this.webviews.get(webviewId).tabCloseListener = clearWebviews;
        chrome.tabs.onRemoved.addListener(clearWebviews);
      }

      //#region dialogTab properties
      dialogTab.setAttribute("class", "dialog-tab");

      let activeWebview = document.querySelector(
        ".active.visible.webpageview webview",
      );
      if (activeWebview) {
        const rect = activeWebview.getBoundingClientRect();

        dialogTab.style.width = rect.width / 2 + "px";

        dialogTab.style.height = rect.height + 5 + "px";

        dialogTab.style.margin = "5px 0";
      }

      //#endregion

      //#region optionsContainer properties
      optionsContainer.setAttribute("class", "options-container");
      // optionsContainer.innerHTML = this.iconUtils.ellipsis;

      // let timeout;
      // optionsContainer.addEventListener("mouseover", () => {
      //   if (optionsContainer.children.length === 1) {
      //     optionsContainer.innerHTML = "";
      //     this.showWebviewOptions(webviewId, optionsContainer);
      //   }
      //   clearTimeout(timeout);
      // });
      // optionsContainer.addEventListener("mouseleave", () => {
      //   timeout = setTimeout(() => optionsContainer.innerHTML = this.iconUtils.ellipsis, 1500);
      // });

      // 默认显示所有操作按钮和URL栏，不再使用悬浮显示
      optionsContainer.innerHTML = "";
      this.showWebviewOptions(webviewId, optionsContainer);
      //#endregion

      //#region webview properties
      webview.id = webviewId;
      webview.tab_id = `${webviewId}tabId`;
      webview.setAttribute("src", linkUrl);

      webview.addEventListener("loadstart", () => {
        webview.style.backgroundColor = "var(--colorBorder)";
        progressBar.start();

        const input = document.getElementById(`input-${webview.id}`);
        if (input !== null) {
          input.value = webview.src;
        }
      });
      webview.addEventListener("loadstop", () => progressBar.clear(true));
      fromPanel &&
        webview.addEventListener("mousedown", (event) =>
          event.stopPropagation(),
        );
      //#endregion

      //#region dialogContainer properties
      dialogContainer.setAttribute("class", "dialog-container");

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

      dialogContainer.addEventListener("click", (event) => {
        if (event.target === dialogContainer) {
          fromPanel &&
            document.body.removeEventListener("pointerdown", stopEvent);
          this.closeLastDialog();
        }
      });

      //#endregion

      dialogTab.appendChild(optionsContainer);
      dialogTab.appendChild(progressBar.element);
      dialogTab.appendChild(webview);

      dialogContainer.appendChild(dialogTab);

      // Get for current tab and append divContainer
      fromPanel
        ? document.querySelector("#browser").appendChild(dialogContainer)
        : document
            .querySelector(".active.visible.webpageview")
            .appendChild(dialogContainer);

      dialogContainer.classList.add("open");

      // 仅在有对应的CSS时才操作body类，避免在没有CSS时影响网页布局
      if (this.hasDialogCSS) {
          document.body.classList.add("dialog-open");
      }
    }

    /**
     * Displays open in tab buttons and current url in input element
     * @param {string} webviewId is the id of the webview
     * @param {Object} thisElement the current instance divOptionContainer (div) element
     */
    showWebviewOptions(webviewId, thisElement) {
      let inputId = `input-${webviewId}`,
        data = this.webviews.get(webviewId),
        webview = data ? data.webview : undefined;
      if (webview && document.getElementById(inputId) === null) {
        const input = document.createElement("input", "text"),
          VALID_URL_PREFIXES = ["http://", "https://", "file://", "vivaldi://"],
          isValidUrl = (url) =>
            VALID_URL_PREFIXES.some(
              (prefix) => url.startsWith(prefix) || url === "about:blank",
            );

        input.value = webview.src;
        input.id = inputId;
        input.setAttribute("class", "dialog-input");

        input.addEventListener("keydown", async (event) => {
          if (event.key === "Enter") {
            let value = input.value;
            if (isValidUrl(value)) {
              webview.src = value;
            } else {
              const searchRequest =
                await vivaldi.searchEngines.getSearchRequest(
                  this.searchEngineUtils.defaultSearchId,
                  value,
                );
              webview.src = searchRequest.url;
            }
          }
        });

        const fragment = document.createDocumentFragment(),
          buttons = [
            { content: this.iconUtils.back, action: () => webview.back() },
            {
              content: this.iconUtils.forward,
              action: () => webview.forward(),
            },
            { content: this.iconUtils.reload, action: () => webview.reload() },
            {
              content: this.iconUtils.readerView,
              action: this.showReaderView.bind(this, webview),
              cls: "reader-view-toggle",
            },
            {
              content: this.iconUtils.newTab,
              action: this.openNewTab.bind(this, inputId, true),
            },
            {
              content: this.iconUtils.backgroundTab,
              action: this.openNewTab.bind(this, inputId, false),
            },
          ];

        buttons.forEach((button) =>
          fragment.appendChild(
            this.createOptionsButton(
              button.content,
              button.action,
              button.cls || "",
            ),
          ),
        );
        fragment.appendChild(input);

        thisElement.append(fragment);
      }
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
     * Opens a new Chrome tab with specified active boolean value and closes the current dialog
     * @param {string} inputId is the id of the input containing current url
     * @param {boolean} active indicates whether the tab is active or not (background tab)
     */
    openNewTab(inputId, active) {
      const url = document.getElementById(inputId).value;

      // For background tabs, just create the tab and close dialog immediately
      if (!active) {
        chrome.tabs.create({ url: url, active: false });
        // Use normal closing animation
        setTimeout(() => {
          this.closeLastDialog();
        }, 100);
        return;
      }

      // Get the current dialog element
      const webviewId = inputId.replace("input-", "");
      const data = this.webviews.get(webviewId);
      if (!data) return;

      const dialogContainer = data.divContainer;
      const dialogTab = dialogContainer.querySelector(".dialog-tab");
      if (!dialogTab) return;

      // Create overlay element
      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.backgroundColor = "#1C2220";
      overlay.style.opacity = "0";
      overlay.style.zIndex = "999999998"; // Below dialog but above everything else
      overlay.style.transition = "opacity 0.3s ease-in-out";
      overlay.style.pointerEvents = "none";
      document.body.appendChild(overlay);

      // Get target dimensions from active webview
      let activeWebview = document.querySelector(
        ".active.visible.webpageview webview",
      );
      if (activeWebview) {
        const rect = activeWebview.getBoundingClientRect();

        // Store original styles for cleanup
        const originalTransition = dialogTab.style.transition;
        const originalWidth = dialogTab.style.width;
        const originalHeight = dialogTab.style.height;
        const originalMargin = dialogTab.style.margin;

        // Apply animation to scale dialog to normal tab size
        dialogTab.style.transition = "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)";
        dialogTab.style.width = rect.width + "px";
        dialogTab.style.height = rect.height + "px";
        dialogTab.style.margin = "0";
      }

      // Animate overlay opacity from 0 to 1
      setTimeout(() => {
        overlay.style.opacity = "1";
      }, 10);

      // Create new tab and close dialog after animation
      setTimeout(() => {
        chrome.tabs.create({ url: url, active: true });
        this.closeLastDialog();

        // Remove overlay after a short delay
        setTimeout(() => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
        }, 100);
      }, 300);
    }
  }

  class WebsiteInjectionUtils {
    constructor(getWebviewConfig, openDialog, iconConfig) {
      this.iconConfig = JSON.stringify(iconConfig);

      // inject detection of click observers
      chrome.webNavigation.onCompleted.addListener((navigationDetails) => {
        const { webview, fromPanel } = getWebviewConfig(navigationDetails);
        webview && this.injectCode(webview, fromPanel);
      });

      // react on demand to open a dialog
      chrome.runtime.onMessage.addListener((message) => {
        if (message.url) {
          openDialog(message.url, message.fromPanel);
        }
      });
    }

    injectCode(webview, fromPanel) {
      const handler = WebsiteLinkInteractionHandler.toString(),
        instantiationCode = `
                if (!this.dialogEventListenerSet) {
                    new (${handler})(${fromPanel}, ${this.iconConfig});
                    this.dialogEventListenerSet = true;
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
      this.rightClickFeedbackElement = null;

      this.timers = {
        showIcon: null,
        showDialog: null,
        hideIcon: null,
      };

      this.isLongPress = false; // 标记是否是长按操作
      this.dialogTriggered = false; // 标志是否已触发 dialogTab

      window.addEventListener("beforeunload", this.#cleanup.bind(this));

      this.#initialize();

      // 监听 dialog 关闭消息，重置状态
      chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'dialog-closed') {
          this.dialogTriggered = false;
          this.isLongPress = false;
        }
      });
    }

    /**
     * Checks if a link is clicked by the middle mouse while pressing Ctrl + Alt, then fires an event with the Url
     */
    #initialize() {
      this.#setupMouseHandling();

      if (this.config.linkIcon) {
        this.#setupIconHandling();
      }
    }

    #cleanup() {
      if (this.rightClickFeedbackElement) {
        this.rightClickFeedbackElement.remove();
        this.rightClickFeedbackElement = null;
        this.progressCircle = null;
        this.progressCircumference = null;
      }

      Object.values(this.timers).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });

      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }
      if (this.visibilityDelayTimer) {
        clearTimeout(this.visibilityDelayTimer);
        this.visibilityDelayTimer = null;
      }

      // 重置标志
      this.dialogTriggered = false;
      this.isLongPress = false;
    }

    /**
     * Richtet die Maus-Event-Listener ein
     */
    #setupMouseHandling() {
      let holdTimerForMiddleClick;
      let holdTimerForRightClick;

      document.addEventListener("pointerdown", (event) => {
        // Check if the Ctrl key, Alt key, and mouse button were pressed
        if (event.altKey && [0, 1].includes(event.button)) {
          this.#callDialog(event);
        } else if (event.button === 1) {
          holdTimerForMiddleClick = setTimeout(
            () => this.#callDialog(event),
            500,
          );
        } else if (event.button === 2) {
          // 只有在链接上长按时才创建并显示进度条
          const link = this.#getLinkElement(event);
          if (link) {
            // 标记这是一个长按操作
            this.isLongPress = true;

            if (!this.rightClickFeedbackElement) {
              this.rightClickFeedbackElement = document.createElement("div");
              this.rightClickFeedbackElement.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: ${this.config.progressRingRadius * 2 + 10}px;
                height: ${this.config.progressRingRadius * 2 + 10}px;
                z-index: 10000;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s ease;
              `;

              // 创建SVG进度环
              const svg = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "svg",
              );
              svg.setAttribute(
                "width",
                this.config.progressRingRadius * 2 + 10,
              );
              svg.setAttribute(
                "height",
                this.config.progressRingRadius * 2 + 10,
              );
              svg.setAttribute(
                "viewBox",
                `0 0 ${this.config.progressRingRadius * 2 + 10} ${this.config.progressRingRadius * 2 + 10}`,
              );

              const bgCircle = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "circle",
              );
              bgCircle.setAttribute("cx", this.config.progressRingRadius + 5);
              bgCircle.setAttribute("cy", this.config.progressRingRadius + 5);
              bgCircle.setAttribute("r", this.config.progressRingRadius);
              bgCircle.setAttribute("fill", "none");
              bgCircle.setAttribute("stroke", "rgba(0, 0, 0, 0.3)");
              bgCircle.setAttribute(
                "stroke-width",
                this.config.progressRingWidth,
              );

              const progressCircle = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "circle",
              );
              progressCircle.setAttribute(
                "cx",
                this.config.progressRingRadius + 5,
              );
              progressCircle.setAttribute(
                "cy",
                this.config.progressRingRadius + 5,
              );
              progressCircle.setAttribute("r", this.config.progressRingRadius);
              progressCircle.setAttribute("fill", "none");
              progressCircle.setAttribute("stroke", "#ffffff");
              progressCircle.setAttribute(
                "stroke-width",
                this.config.progressRingWidth,
              );
              progressCircle.setAttribute("stroke-linecap", "round");

              const circumference =
                2 * Math.PI * this.config.progressRingRadius;
              progressCircle.setAttribute("stroke-dasharray", circumference);
              progressCircle.setAttribute("stroke-dashoffset", circumference);
              progressCircle.setAttribute(
                "transform",
                `rotate(-90 ${this.config.progressRingRadius + 5} ${this.config.progressRingRadius + 5})`,
              );

              svg.appendChild(bgCircle);
              svg.appendChild(progressCircle);
              this.rightClickFeedbackElement.appendChild(svg);

              this.progressCircle = progressCircle;
              this.progressCircumference = circumference;

              document.body.appendChild(this.rightClickFeedbackElement);
            }

            const effectiveHoldTime =
              this.config.rightClickHoldTime - this.config.rightClickHoldDelay;

            this.visibilityDelayTimer = setTimeout(() => {
              this.progressCircle.setAttribute(
                "stroke-dashoffset",
                this.progressCircumference,
              );
              this.rightClickFeedbackElement.style.opacity = "1";
              this.rightClickFeedbackElement.style.left = event.clientX + "px";
              this.rightClickFeedbackElement.style.top = event.clientY + "px";

              const startTime = Date.now();
              this.progressInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / effectiveHoldTime, 1);
                const offset =
                  this.progressCircumference -
                  this.progressCircumference * progress;
                this.progressCircle.setAttribute("stroke-dashoffset", offset);

                if (this.config.ringColor !== "default") {
                  this.progressCircle.setAttribute(
                    "stroke",
                    this.config.ringColor,
                  );
                } else {
                  const hue = 120 * progress;
                  const saturation = 100;
                  const lightness = 50 + 50 * (1 - progress);
                  this.progressCircle.setAttribute(
                    "stroke",
                    `hsl(${hue}, ${saturation}%, ${lightness}%)`,
                  );
                }

                if (progress >= 1) {
                  clearInterval(this.progressInterval);
                }
              }, 16); // ~60fps
            }, this.config.rightClickHoldDelay);

            holdTimerForRightClick = setTimeout(() => {
              event.preventDefault();
              event.stopPropagation();
              this.#callDialog(event);
              this.rightClickFeedbackElement.style.opacity = "0";
              if (this.progressInterval) clearInterval(this.progressInterval);
              if (this.visibilityDelayTimer)
                clearTimeout(this.visibilityDelayTimer);
            }, this.config.rightClickHoldTime);
          }
        }
      });

      document.addEventListener("pointerup", (event) => {
        if (event.button === 1) clearTimeout(holdTimerForMiddleClick);
        if (event.button === 2) {
          clearTimeout(holdTimerForRightClick);
          if (this.rightClickFeedbackElement && this.progressCircle) {
            this.rightClickFeedbackElement.style.opacity = "0";
            this.progressCircle.setAttribute(
              "stroke-dashoffset",
              this.progressCircumference || "157",
            );
            if (this.progressInterval) {
              clearInterval(this.progressInterval);
              this.progressInterval = null;
            }
            if (this.visibilityDelayTimer) {
              clearTimeout(this.visibilityDelayTimer);
              this.visibilityDelayTimer = null;
            }
          }
        }
      });
    }

    #setupIconHandling() {
      this.#createIcon();
      this.#createIconStyle();

      document.addEventListener(
        "mouseover",
        this.debounce((event) => {
          const link = this.#getLinkElement(event);
          if (!link) return;

          clearTimeout(this.timers.hideIcon);

          requestAnimationFrame(() => {
            const rect = link.getBoundingClientRect();
            Object.assign(this.icon.style, {
              display: "block",
              left: `${rect.right + 5}px`,
              top: `${rect.top + window.scrollY}px`,
            });
          });

          this.icon.dataset.targetUrl = link.href;

          link.addEventListener("mouseleave", this.#hideLinkIcon.bind(this));
        }, this.config.showIconDelay),
      );
    }

    #createIcon() {
      const icon = document.createElement("div");
      icon.className = `link-icon ${this.config.linkIcon}`;
      icon.style.display = "none";

      if (this.config.linkIconInteractionOnHover) {
        icon.addEventListener("mouseenter", () => {
          this.timers.showDialog = setTimeout(
            () => this.#sendDialogMessage(this.icon.dataset.targetUrl),
            this.config.showDialogOnHoverDelay,
          );
        });
        icon.addEventListener("mouseleave", () =>
          clearTimeout(this.timers.showDialog),
        );
      } else {
        icon.addEventListener("click", () =>
          this.#sendDialogMessage(this.icon.dataset.targetUrl),
        );
        icon.addEventListener("mouseenter", () =>
          clearTimeout(this.timers.hideIcon),
        );
        icon.addEventListener("mouseleave", this.#hideLinkIcon.bind(this));
      }

      this.icon = icon;
      document.body.appendChild(this.icon);
    }

    #hideLinkIcon() {
      this.timers.hideIcon = setTimeout(
        () => {
          this.icon.style.display = "none";
          clearTimeout(this.timers.showIcon);
        },
        this.config.linkIconInteractionOnHover ? 300 : 600,
      );
    }

    #getLinkElement(event) {
      return event.target.closest('a[href]:not([href="#"])');
    }

    #sendDialogMessage(url) {
      chrome.runtime.sendMessage({ url, fromPanel: this.fromPanel });
    }

    #callDialog(event) {
      let link = this.#getLinkElement(event);
      if (link) {
        event.preventDefault();
        event.stopPropagation();
        this.dialogTriggered = true;
        this.#sendDialogMessage(link.href);
      }
    }

    /**
     * 阻止所有点击事件，防止误触打开原链接
     */
    preventAllClicks() {
      // 只阻止下一次点击事件（仅一次）
      document.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }, { capture: true, once: true });
    }

    #createIconStyle() {
      const style = document.createElement("style");
      style.textContent = `
                .link-icon {
                    position: absolute;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                    cursor: pointer;
                    z-index: 9999;
                    transition: opacity 0.2s ease;
                }

                .link-icon:hover {
                    opacity: 0.9;
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
      this.LINK_ID = "dialog-tab-link";
      this.SEARCH_ID = "search-dialog-tab";
      this.SELECT_SEARCH_ID = "select-search-dialog-tab";

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
     * Creates context menu items to open a dialog tab
     */
    #createContextMenuOption() {
      chrome.contextMenus.create({
        id: this.LINK_ID,
        title: `${this.menuPrefix} ${this.linkMenuTitle}`,
        contexts: ["link"],
      });
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

        if (menuItemId === this.LINK_ID) {
          this.openLinkCallback(linkUrl);
        } else if (menuItemId === this.SEARCH_ID) {
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
        if (!this.createdContextMenuMap.has(engine.guid)) {
          chrome.contextMenus.create({
            id: this.SELECT_SEARCH_ID + engine.guid,
            parentId: this.SELECT_SEARCH_ID,
            title: engine.name,
            contexts: ["selection"],
          });
          this.createdContextMenuMap.set(engine.guid, true);
        }
      });
    }
  }

  class ProgressBar {
    constructor(webviewId) {
      this.webviewId = webviewId;
      this.progress = 0;
      this.interval = null;
      this.element = this.#createProgressBar(webviewId);
    }

    #createProgressBar(webviewId) {
      const progressBar = document.createElement("div");
      progressBar.setAttribute("class", "progress-bar");
      progressBar.id = `progressBar-${webviewId}`;
      return progressBar;
    }

    start() {
      this.element.style.visibility = "visible";
      this.progress = 0;

      if (!this.interval) {
        this.interval = setInterval(() => {
          if (this.progress >= 100) {
            this.clear();
          } else {
            this.progress++;
            this.element.style.width = this.progress + "%";
          }
        }, 10);
      }
    }

    clear(loadStop = false) {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }

      if (loadStop) {
        this.element.style.width = "100%";

        setTimeout(() => {
          this.progress = 0;
          this.element.style.visibility = "hidden";
          this.element.style.width = this.progress + "%";
        }, 250);
      }
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
      readerView:
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M3 4h10v1H3zM3 6h10v1H3zM3 8h10v1H3zM3 10h6v1H3z"></path></svg>',
      newTab:
        '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z"/></svg>',
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
          this.#getVivaldiButton(button.buttonName, button.fallback),
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
        `.button-toolbar [name="${buttonName}"] svg`,
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

    get newTab() {
      return this.getIcon("newTab");
    }

    get backgroundTab() {
      return this.getIcon("backgroundTab");
    }
  }
})();
