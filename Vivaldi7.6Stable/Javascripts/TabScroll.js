// Tab Scroll
// version 2024.9.2
// https://forum.vivaldi.net/post/214898
// Clicking on an active tab scrolls page to top, clicking it again returns to
// previous scroll position. Credits to tam710562 from Vivaldi Forum for coming
// up with the sessionStorage solution, which made this possible.

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
    chrome.tabs.executeScript(
      parseInt(tab.parentNode.id.replace(/\D/g, ""), 10),
      {
        code: `(${script})("${scb}")`,
      }
    );
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
