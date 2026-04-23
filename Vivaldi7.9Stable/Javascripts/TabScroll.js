(function tabScroll() {
  "use strict";

  // EDIT START
  // choose scroll behavior, instant or smooth
  const scb = "smooth";
  // EDIT END

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      if (m.target.classList.contains("active")) {
        m.target.dataset.activatedAt = Date.now();
      }
    });
  });

  const initialActive = document.querySelector(".tab.active");
  if (initialActive) initialActive.dataset.activatedAt = 1;

  function cleanup(e) {
    const tab = e.currentTarget || e;
    tab.removeEventListener("mousemove", cleanup);
    tab.removeEventListener("click", triggerHandler);
  }

  function triggerHandler(e) {
    const tab = e.currentTarget;
    trigger(tab);
    cleanup(tab);
  }

  function trigger(tab) {
    const tabId = parseInt(tab.parentNode.id.replace(/\D/g, ""), 10);
    const webview = document.querySelector(`webview[tab_id="${tabId}"]`);
    if (webview) {
      webview.executeScript({
        code: `(${script})("${scb}")`,
      });
    }
  }

  function react(e, tab) {
    const activatedAt = parseInt(tab.dataset.activatedAt) || 0;
    const timeSinceActive = Date.now() - activatedAt;

    if (
      tab.classList.contains("active") &&
      timeSinceActive > 100 &&
      e.which === 1 &&
      !(e.target.nodeName === "path" || e.target.nodeName === "svg") &&
      !e.shiftKey &&
      !e.ctrlKey &&
      !e.altKey &&
      !e.metaKey
    ) {
      cleanup(tab);
      tab.addEventListener("mousemove", cleanup);
      tab.addEventListener("click", triggerHandler);
    }
  }

  const script = (scb) => {
    const getTarget = () => {
      // Specific selectors for Google Docs and Sheets found in their DOM
      const selectors = [
        ".kix-appview-editor",            // Google Docs
        ".native-scrollbar-y",            // Google Sheets
        ".docs-ui-container-scrollable",  // Google Docs (alternate)
        ".grid-scrollable-wrapper"        // Google Sheets (alternate)
      ];

      for (const s of selectors) {
        const el = document.querySelector(s);
        if (el && el.scrollHeight > el.clientHeight) return el;
      }

      // Default to window if it's scrolled or as final fallback
      if (window.scrollY > 0) return window;

      // Scan for any scrolled element if we are at the top
      const divs = document.getElementsByTagName("div");
      for (let i = 0; i < divs.length; i++) {
        if (divs[i].scrollTop > 0) return divs[i];
      }

      return window;
    };

    const target = getTarget();
    const isWin = target === window;
    const offset = isWin ? window.scrollY : target.scrollTop;

    if (offset > 0) {
      window.sessionStorage.setItem("tabScrollOffset", offset);
      target.scrollTo({ top: 0, behavior: scb });
    } else {
      const savedOffset = window.sessionStorage.getItem("tabScrollOffset") || 0;
      target.scrollTo({ top: parseInt(savedOffset), behavior: scb });
    }
  };

  let appendChild = Element.prototype.appendChild;
  Element.prototype.appendChild = function () {
    if (
      arguments[0].tagName === "DIV" &&
      arguments[0].classList.contains("tab")
    ) {
      const tab = arguments[0];
      if (!tab.dataset.tabScrollInitialized) {
        tab.dataset.tabScrollInitialized = "true";
        setTimeout(function () {
          const ts = function (e) {
            react(e, tab);
          };
          tab.addEventListener("mousedown", ts);
          observer.observe(tab, { attributes: true, attributeFilter: ["class"] });
        });
      }
    }
    return appendChild.apply(this, arguments);
  };
})();
