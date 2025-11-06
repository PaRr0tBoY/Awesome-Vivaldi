// Tab Lock
// version 2025.5.0
// https://forum.vivaldi.net/post/241508
// Custom page action. Throws a warning when you try to navigate.

(function () {
  window.addEventListener("beforeunload", (event) => {
    event.preventDefault();
  });
  window.addEventListener("popstate", () => console.log("block navigation"));
})();

