// ==UserScript==
// @name         Tab Scroll
// @description  Clicking an active tab scrolls the page to top; clicking it again returns to the previous scroll position.
// @version      2024.9.2
// @author       luetage
// @website      https://forum.vivaldi.net/post/214898
// ==/UserScript==

(function tabScroll() {
  "use strict";

  // EDIT START
  // choose scroll behavior, instant or smooth
  const scb = "smooth";
  // EDIT END

  function exit(tab) {
    tab.removeEventListener("mousemove", exit);
    tab.removeEventListener("click", trigger);
  }

  function trigger(tab) {
    const tabId = parseInt(tab.parentNode.id.replace(/\D/g, ""), 10);
    const webview = document.querySelector(`webview[tab_id="${tabId}"]`);
    if (webview) {
      webview.executeScript({
        code: `(${script})("${scb}")`,
      });
    }
    exit(tab);
  }

  function react(e, tab) {
    if (
      tab.classList.contains("active") &&
      e.which === 1 &&
      !(e.target.nodeName === "path" || e.target.nodeName === "svg") &&
      !e.shiftKey &&
      !e.ctrlKey &&
      !e.altKey &&
      !e.metaKey
    ) {
      tab.addEventListener("mousemove", () => exit(tab));
      tab.addEventListener("click", () => trigger(tab));
    }
  }

  const script = (scb) => {
    let offset = window.scrollY;
    if (offset > 0) {
      window.sessionStorage.setItem("offset", offset);
      window.scrollTo({ top: 0, behavior: scb });
    } else {
      window.scrollTo({
        top: window.sessionStorage.getItem("offset") || 0,
        behavior: scb,
      });
    }
  };

  let appendChild = Element.prototype.appendChild;
  Element.prototype.appendChild = function () {
    if (
      arguments[0].tagName === "DIV" &&
      arguments[0].classList.contains("tab")
    ) {
      const tab = arguments[0];
      setTimeout(function () {
        const ts = function (e) {
          react(e, tab);
        };
        tab.addEventListener("mousedown", ts);
      });
    }
    return appendChild.apply(this, arguments);
  };
})();
