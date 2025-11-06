// Activate Tab On Hover
// version 2024.9.0
// https://forum.vivaldi.net/post/395460
// Activates tab on hover.

(function activateTab() {
  "use strict"

  function hover(e, tab) {
    if (
      !tab.parentNode.classList.contains("active") &&
      !e.shiftKey &&
      !e.ctrlKey
    ) {
      tab.addEventListener("mouseleave", function () {
        clearTimeout(wait);
        tab.removeEventListener("mouseleave", tab);
      });
      wait = setTimeout(function () {
        const id = Number(tab.parentNode.parentNode.id.replace(/^\D+/g, ""));
        chrome.tabs.update(id, { active: true, highlighted: true });
      }, delay);
    }
  }

  let wait;
  const delay = 300; //pick a time in milliseconds
  let appendChild = Element.prototype.appendChild;
  Element.prototype.appendChild = function () {
    if (
      arguments[0].tagName === "DIV" &&
      arguments[0].classList.contains("tab-header")
    ) {
      setTimeout(
        function () {
          const trigger = (event) => hover(event, arguments[0]);
          arguments[0].addEventListener("mouseenter", trigger);
        }.bind(this, arguments[0])
      );
    }
    return appendChild.apply(this, arguments);
  };
})();
