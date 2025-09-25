(function universal_web_panel() {
  "use strict";

  const PANEL_ID = "WEBPANEL_uwp00000-0000-0000-0000-000000000000";
  const TITLE = "Universal Web Panel";

  const HTML = "<title>Universal Web Panel</title>";
  const HTML_DATA_URL = "data:text/html," + encodeURIComponent(HTML);

  const ICON_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="padding: 4px"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>';
  const ICON_SPAN = `<span class="button-icon">${ICON_SVG}</span>`;
  const ICON_DATA_URL = `data:image/svg+xml, ${ICON_SVG}`;

  const BOOKMARKS_FOLDER = "UWP";
  const BOOKMARKS_ICON_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="padding: 2px"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>';

  const STYLE = `
    .UwpToolbar {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding-top: 2px;
      padding-bottom: 2px;
    }

    .UwpInputRow {
      display: flex;
      gap: 2px;
    }

    .UwpInput {
      width: 100%;
    }

    .UwpBookmarks {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }

    .UwpBookmarks.Hidden {
      display: none;
    }
  `;

  const UWP_TOOLBAR_HTML = `
    <div class="UwpToolbar toolbar-default full-width">
      <div class="UwpInputRow">
        <input class="UwpInput" type="text" placeholder="Paste your link, html or javascript">
        <div class="button-toolbar">
          <button class="UwpBookmarksButton button-toolbar">${BOOKMARKS_ICON_SVG}</button>
        </div>
      </div>
      <div class="UwpBookmarks Hidden"></div>
    </div>
  `;

  const UWP_BOOKMARK_HTML = `
    <div class="UwpBookmark button-toolbar">
      <button class="UwpBookmarkButton button-toolbar">
        <img src="">
        <span></span>
      </button>
    </div>
  `;

  const TOOLBARS = [
    "vivaldi.toolbars.panel",
    "vivaldi.toolbars.navigation",
    "vivaldi.toolbars.status",
    "vivaldi.toolbars.mail",
    "vivaldi.toolbars.mail_message",
    "vivaldi.toolbars.mail_composer",
  ];

  class UWP {
    #prefs = new Preferences();
    #observers = [];

    constructor() {
      this.#addStyle();
      this.#createWebPanel().then(() => {
        if (this.#panel) {
          this.#listenToPanelChange();
          this.#register();
        } else {
          this.#listenToPanelStackChange();
        }
      });
    }

    #register() {
      if (!this.#isVisible) return;
      this.#listenToHomeButtonClick();
      if (!this.#input) {
        this.#listenToWebpanelButtonAppearInPanels();
        this.#listenToWebpanelButtonAppearInToolbarEditor();
        this.#createUwpToolbar();
        this.#listenToInputEvents();
      }
      this.#focusInput();
    }

    // listeners

    #listenToPanelStackChange() {
      const observer = new MutationObserver((records) => {
        if (this.#panel) {
          this.#observers.push(this.#listenToPanelChange());
          this.#register();
        }
      });
      observer.observe(this.#panelStack, { childList: true });
      this.#observers.push(observer);
    }

    #listenToPanelChange() {
      const observer = new MutationObserver((records) => {
        this.#register();
      });
      observer.observe(this.#panel, {
        attributes: true,
        attributeFilter: ["class"],
      });
      this.#observers.push(observer);
    }

    #listenToInputEvents() {
      this.#input.addEventListener("input", () =>
        this.#handleInput(this.#input.value.trim()),
      );
    }

    #listenToWebpanelButtonAppearInPanels() {
      for (toolbar of this.#toolbars) {
        const observer = new MutationObserver(() => {
          const button = toolbar.querySelector(`button[name="${PANEL_ID}"]`);
          if (button) button.innerHTML = ICON_SPAN;
        });
        observer.observe(toolbar, { childList: true });
        this.#observers.push(observer);
      }
    }

    #listenToWebpanelButtonAppearInToolbarEditor() {
      const observer = new MutationObserver(() => {
        if (this.#panelButtonInToolbarEditor)
          this.#panelButtonInToolbarEditor.innerHTML = ICON_SPAN;
      });
      observer.observe(this.#browser, { childList: true });
      this.#observers.push(observer);
    }

    #listenToHomeButtonClick() {
      const homeButton = this.#panel?.querySelector("button.home");
      if (homeButton) {
        homeButton.onclick = () => {
          this.#title = TITLE;
          setTimeout(() => {
            if (this.#webview) {
              this.#webview.src = HTML_DATA_URL;
            }
          }, 100);
          this.#showWebview();
        };
      }
    }

    // builders

    #createStyle() {
      const style = document.createElement("style");
      style.innerHTML = STYLE;
      return style;
    }

    async #createWebPanel() {
      const webpanels = await this.#prefs.getWebpanels();
      var webpanel = webpanels.find((p) => p.id == PANEL_ID);
      if (!webpanel) {
        webpanel = {
          activeUrl: HTML_DATA_URL,
          faviconUrl: ICON_DATA_URL,
          faviconUrlValid: true,
          floating: true,
          id: PANEL_ID,
          mobileMode: true,
          origin: "user",
          resizable: true,
          title: TITLE,
          url: HTML_DATA_URL,
          width: 650,
          zoom: 1,
        };
        webpanels.push(webpanel);
        await this.#prefs.setWebpanels(webpanels);
      }

      const toolbars = await Promise.all(
        TOOLBARS.map((path) => this.#prefs.get(path)),
      );
      const hasUwp = toolbars.some((toolbar) =>
        toolbar.some((id) => id === PANEL_ID),
      );

      if (!hasUwp) {
        const panelToolbar = toolbars[0];
        const panelIndex = panelToolbar.findIndex((panel) =>
          panel.startsWith("WEBPANEL_"),
        );
        panelToolbar.splice(panelIndex, 0, PANEL_ID);
        await this.#prefs.setPanelToolbar(panelToolbar);
      }

      setTimeout(() => (this.#panelButton.innerHTML = ICON_SPAN), 1000);
    }

    #createUwpToolbar() {
      this.#panel.insertAdjacentHTML("beforeend", UWP_TOOLBAR_HTML);
      this.#createBookmarks();
    }

    #createBookmarks() {
      this.#fillBookmarks();
      this.#uwpBookmarksButton.onclick = () => {
        this.#uwpBookmarks.classList.toggle("Hidden");
      };

      chrome.bookmarks.onCreated.addListener(() => this.#fillBookmarks());
      chrome.bookmarks.onChanged.addListener(() => this.#fillBookmarks());
      chrome.bookmarks.onMoved.addListener(() => this.#fillBookmarks());
      chrome.bookmarks.onRemoved.addListener(() => this.#fillBookmarks());
    }

    #fillBookmarks() {
      this.#uwpBookmarks.innerHTML = "";
      chrome.bookmarks.search(BOOKMARKS_FOLDER, (results) => {
        if (results.length == 0) return;
        const folder = results[0];
        this.#fillBookmarksFromFolder(folder.id);
      });
    }

    #fillBookmarksFromFolder(id) {
      chrome.bookmarks.getChildren(id, (results) => {
        if (results.length == 0) return;
        for (const bookmark of results) {
          if (bookmark.url) {
            const template = document.createElement("div");
            template.insertAdjacentHTML("beforeend", UWP_BOOKMARK_HTML);
            const uwpBookmark = template.querySelector(".UwpBookmark");

            const icon = uwpBookmark.querySelector("img");
            icon.src = "chrome://favicon/" + bookmark.url;

            const title = uwpBookmark.querySelector("span");
            title.innerText = bookmark.title;

            const button = uwpBookmark.querySelector("button");
            button.onclick = () => {
              this.#openUrl(bookmark.url);
            };

            this.#uwpBookmarks.appendChild(uwpBookmark);
          } else {
            this.#fillBookmarksFromFolder(bookmark.id);
          }
        }
      });
    }

    #createHtmlview() {
      const htmlview = document.createElement("div");
      htmlview.id = "htmlview";
      htmlview.style.height = "100%";
      htmlview.style.overflow = "auto";
      return htmlview;
    }

    // getters

    get #browser() {
      return document.querySelector("#browser");
    }

    get #head() {
      return document.querySelector("head");
    }

    get #toolbars() {
      return document.querySelectorAll(".toolbar");
    }

    get #panelStack() {
      return document.querySelector(".webpanel-stack");
    }

    get #panel() {
      const selector = `webview[tab_id^="${PANEL_ID}"], webview[vivaldi_view_type^="${PANEL_ID}"`;
      return document.querySelector(selector)?.parentElement?.parentElement;
    }

    get #panelButton() {
      return document.querySelector(`button[name="${PANEL_ID}"]`);
    }

    get #panelButtonInToolbarEditor() {
      return document.querySelector(
        `.toolbar-editor button[name="${PANEL_ID}"]`,
      );
    }

    get #content() {
      const content = this.#panel?.querySelector(".webpanel-content");
      if (!content) {
        console.warn("Web panel content not found");
      }
      return content;
    }

    get #title() {
      const titleElement = this.#panel?.querySelector(".webpanel-title")?.querySelector("span");
      if (!titleElement) {
        console.warn("Web panel title not found");
        return { innerText: "" };
      }
      return titleElement;
    }

    get #htmlview() {
      return this.#panel?.querySelector("#htmlview");
    }

    get #webview() {
      return this.#panel?.querySelector("webview");
    }

    get #input() {
      return this.#panel?.querySelector(".UwpInput");
    }

    get #uwpBookmarks() {
      return this.#panel?.querySelector(".UwpBookmarks");
    }

    get #uwpBookmarksButton() {
      return this.#panel?.querySelector(".UwpBookmarksButton");
    }

    get #isVisible() {
      return this.#panel?.classList.contains("visible") || false;
    }

    // setters

    set #title(title) {
      setTimeout(() => {
        if (this.#title) {
          this.#title.innerText = title;
        }
      }, 100);
    }

    // handlers

    #handleInput(value) {
      if (
        value.startsWith("http://") ||
        value.startsWith("https://") ||
        value.startsWith("file://") ||
        value.startsWith("vivaldi://") ||
        value.startsWith("chrome://") ||
        value.startsWith("chrome-extension://") ||
        value.startsWith("about:")
      ) {
        this.#openUrl(value);
      } else if (value.startsWith("(()") && value.endsWith(")()")) {
        this.#executeScript(value);
      } else {
        this.#showHtml(value);
      }
      this.#clearInput();
    }

    #openUrl(url) {
      this.#showWebview();
      this.#webview.src = url;
    }

    #executeScript(script) {
      this.#showWebview();
      this.#webview.executeScript({ code: script });
    }

    #showHtml(html) {
      this.#hideWebview();
      if (!this.#htmlview) {
        const htmlview = this.#createHtmlview();
        if (this.#content) {
          this.#content.appendChild(htmlview);
        } else {
          console.warn("Web panel content not found, cannot create htmlview");
          return;
        }
      }
      if (this.#htmlview) {
        this.#htmlview.innerHTML = html;
        this.#title = TITLE;
      }
    }

    // actions

    #addStyle() {
      this.#head.appendChild(this.#createStyle());
    }

    #showWebview() {
      if (this.#webview.style.display === "none") {
        if (this.#htmlview) {
          try {
            this.#htmlview.remove();
          } catch (e) {
            console.warn("Failed to remove htmlview:", e);
          }
        }
        this.#webview.style.display = "";
      }
    }

    #hideWebview() {
      this.#webview.style.display = "none";
    }

    #clearInput() {
      if (this.#input) {
        this.#input.value = "";
      }
    }

    #focusInput() {
      setTimeout(() => {
        if (this.#input) {
          this.#input.focus();
        }
      }, 100);
    }

    async reset() {
      var webpanels = await this.#prefs.getWebpanels();
      var webpanel = webpanels.find((p) => p.id == PANEL_ID);
      if (webpanel) {
        webpanels = webpanels.filter((w) => w.id !== PANEL_ID);
        await this.#prefs.setWebpanels(webpanels);
      }

      for (const path of TOOLBARS) {
        var toolbar = await this.#prefs.get(path);
        if (toolbar.includes(PANEL_ID)) {
          toolbar = toolbar.filter((id) => id !== PANEL_ID);
          await this.#prefs.set({ path: path, value: toolbar });
        }
      }
    }
  }

  class Preferences {
    async get(path) {
      return await vivaldi.prefs.get(path);
    }

    async set({ path, value }) {
      await vivaldi.prefs.set({ path, value });
    }

    async getWebpanels() {
      return await vivaldi.prefs.get("vivaldi.panels.web.elements");
    }

    async setWebpanels(webpanels) {
      await vivaldi.prefs.set({
        path: "vivaldi.panels.web.elements",
        value: webpanels,
      });
    }

    async getPanelToolbar() {
      return await vivaldi.prefs.get("vivaldi.toolbars.panel");
    }

    async setPanelToolbar(toolbar) {
      await vivaldi.prefs.set({
        path: "vivaldi.toolbars.panel",
        value: toolbar,
      });
    }

    async addOnWebpanelsChangedListner(cb) {
      vivaldi.prefs.onChanged.addListener(async (event) => {
        if (event.path === "vivaldi.panels.web.elements") {
          await cb();
        }
      });
    }
  }

  var interval = setInterval(() => {
    if (document.querySelector("#browser")) {
      window.uwp = new UWP();
      clearInterval(interval);
    }
  }, 100);
})();
