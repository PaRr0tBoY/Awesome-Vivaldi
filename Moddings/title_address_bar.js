(function yb_address_bar() {
  "use strict";

  const STYLE = `
        .UrlBar-AddressField:has(.YBTitle) .UrlFragment--Lowlight,
        .UrlBar-AddressField:has(.YBTitle) .UrlFragment-LinkWrapper,
        .UrlBar-AddressField:has(.YBTitle) .UrlFragment--Highlight:not(.YBTitle) {
            display: none;
        }

        .UrlFragments:has(.YBTitle) {
            display: flex;
        }

        .UrlBar-UrlObfuscationWarning {
            display: none;
        }

        .YBTitle {
            width: 100vw;
            margin-left: 10px;
            margin-right: 10px;
            text-align: center;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 26px;
            font-size: 14px;
        }
    `;

  class YBAddressBar {
    _currentWebview = null;
    _listeners = [];
    _monitorInterval = null;

    constructor() {
      this.#addStyle();
      this.#placeYBTitle(); // initial attempt
      this.#startWebviewMonitor();
    }

    // --- monitor active webview (tabs change) ---
    #startWebviewMonitor() {
      this._monitorInterval = setInterval(() => {
        const w = this.#activeWebview;
        if (w !== this._currentWebview) {
          if (this._currentWebview)
            this.#removeWebviewListeners(this._currentWebview);
          this._currentWebview = w;
          if (this._currentWebview)
            this.#attachWebviewListeners(this._currentWebview);
          this.#placeYBTitle();
        }
      }, 300);
    }

    #attachWebviewListeners(webview) {
      if (!webview) return;
      const handler = () => this.#placeYBTitle();
      const events = [
        "page-title-updated",
        "did-navigate",
        "did-navigate-in-page",
        "dom-ready",
      ];
      events.forEach((ev) => {
        try {
          webview.addEventListener(ev, handler);
          this._listeners.push({ node: webview, ev, handler });
        } catch (e) {
          // ignore if not supported
        }
      });
    }

    #removeWebviewListeners(webview) {
      this._listeners = this._listeners.filter((item) => {
        if (item.node === webview) {
          try {
            item.node.removeEventListener(item.ev, item.handler);
          } catch (e) {}
          return false;
        }
        return true;
      });
    }

    // --- builders ---
    #createStyle() {
      const style = document.createElement("style");
      style.innerHTML = STYLE;
      return style;
    }

    async #createYbTitle() {
      const title = await this.#resolveTitleForDisplay();
      const ybTitle = document.createElement("div");
      ybTitle.className = "UrlFragment--Highlight YBTitle";
      ybTitle.innerText = title ?? "";
      return ybTitle;
    }

    // --- actions ---
    async #placeYBTitle() {
      if (!this.#urlFragmentWrapper) return;
      if (this.#ybTitle) {
        try {
          this.#urlFragmentWrapper.removeChild(this.#ybTitle);
        } catch (e) {}
      }
      if (!this.#title) return;

      const ybTitle = await this.#createYbTitle();
      this.#urlFragmentWrapper.appendChild(ybTitle);
    }

    #addStyle() {
      const head = this.#head;
      if (head) head.appendChild(this.#createStyle());
    }

    // --- title resolution logic ---
    async #resolveTitleForDisplay() {
      const uiTitle = this.#title?.innerText ?? "";
      const webview = this._currentWebview;
      const src = webview?.getAttribute?.("src") ?? "";

      // 1) try webview internal title (best)
      if (webview) {
        try {
          if (typeof webview.getTitle === "function") {
            const t = webview.getTitle();
            if (t && t.trim() && t !== "Vivaldi") return t.trim();
          }
        } catch (e) {}
        try {
          // execute inside webview to get document.title
          const docTitle = await webview.executeJavaScript(
            "document.title",
            false,
          );
          if (docTitle && docTitle.trim() && docTitle !== "Vivaldi")
            return docTitle.trim();
        } catch (e) {}
      }

      // 2) fallback to UI <title> if meaningful
      if (uiTitle && uiTitle !== "Vivaldi") return uiTitle;

      // 3) parse src and produce readable title for special schemes
      const parsed = await this.#parseUrlDomain(src);

      if (!parsed || !parsed.type) return uiTitle || src || "";

      switch (parsed.type) {
        case "vivaldi": {
          // vivaldi://page[/subpath] -> use page or subpath
          const m = src.match(/^vivaldi:\/\/([^\/]+)(?:\/(.*))?/);
          const page = m ? m[2] || m[1] : parsed.domain;
          return this.#makeReadable(page);
        }

        case "about": {
          // about:flags -> show 'flags' or full about: string
          return parsed.domain.replace(/^about:/, "") || parsed.domain;
        }

        case "extension": {
          // prefer extension name + page
          const pageSegment = parsed.path ? parsed.path.split("/").pop() : "";
          const pageName = pageSegment
            ? pageSegment.replace(/\.[^/.]+$/, "")
            : "";
          const readablePage = pageName
            ? this.#makeReadable(decodeURIComponent(pageName))
            : "";
          const extName = parsed.domain || parsed.id || "extension";
          return readablePage ? `${extName} — ${readablePage}` : extName;
        }

        case "file": {
          // file:///.../name.ext -> name
          try {
            const fn = src.split("/").pop() || "file";
            return this.#makeReadable(
              decodeURIComponent(fn.replace(/\.[^/.]+$/, "")),
            );
          } catch (e) {
            return "file";
          }
        }

        case "url": {
          // normal http(s) -> try last path segment or hostname
          try {
            const u = new URL(src);
            const segs = u.pathname.split("/").filter(Boolean);
            const last = segs.length ? segs.pop() : u.hostname;
            return this.#makeReadable(
              decodeURIComponent(last.replace(/\.[^/.]+$/, "")),
            );
          } catch (e) {
            return parsed.domain || src;
          }
        }

        default:
          return parsed.domain || src || uiTitle || "";
      }
    }

    // --- helpers ---
    #makeReadable(s) {
      if (!s) return s;
      const t = String(s)
        .replace(/[-_]+/g, " ")
        .replace(/\+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return t.replace(/\b\w/g, (c) => c.toUpperCase());
    }

    #parseVivaldiDomain(url) {
      const regexp = /vivaldi:\/\/([^\/]*)/;
      const m = url.match(regexp);
      return m ? m[1] : url;
    }

    async #parseUrlDomain(url) {
      if (!url) return { type: null, domain: null };

      if (url.startsWith("vivaldi:")) {
        const m = url.match(/^vivaldi:\/\/([^\/]+)(?:\/(.*))?/);
        const domain = m ? m[1] : this.#parseVivaldiDomain(url);
        const path = m && m[2] ? m[2] : "";
        return { type: "vivaldi", domain, path };
      } else if (url.startsWith("file://")) {
        return {
          type: "file",
          domain: "file",
          path: url.replace(/^file:\/\//, ""),
        };
      } else if (url.startsWith("about:")) {
        return { type: "about", domain: url };
      } else if (url.startsWith("chrome-extension://")) {
        const m = url.match(/^chrome-extension:\/\/([^\/]+)(?:\/(.*))?/);
        const id = m ? m[1] : null;
        const path = m && m[2] ? m[2] : "";
        if (
          id &&
          typeof chrome !== "undefined" &&
          chrome.management &&
          typeof chrome.management.get === "function"
        ) {
          try {
            const extension = await chrome.management.get(id);
            return {
              type: "extension",
              id,
              domain: extension?.name || id,
              path,
            };
          } catch (e) {
            return { type: "extension", id, domain: id, path };
          }
        } else {
          return { type: "extension", id, domain: id, path };
        }
      } else {
        return { type: "url", domain: url, path: url };
      }
    }

    // --- getters ---
    get #head() {
      return document.querySelector("head");
    }

    get #title() {
      return document.querySelector("title");
    }

    get #activeWebview() {
      return document.querySelector(".webpageview.active.visible webview");
    }

    get #urlFragmentWrapper() {
      return document.querySelector(
        ".UrlBar-AddressField .UrlFragment-Wrapper",
      );
    }

    get #ybTitle() {
      return document.querySelector(".YBTitle");
    }
  }

  // start when browser UI exists
  const interval = setInterval(() => {
    if (document.querySelector("#browser")) {
      window.ybAddressBar = new YBAddressBar();
      clearInterval(interval);
    }
  }, 100);
})();
