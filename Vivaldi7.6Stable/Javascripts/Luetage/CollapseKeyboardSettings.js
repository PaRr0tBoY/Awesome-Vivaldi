// Collapse Keyboard Settings
// version 2022.4.0
// https://forum.vivaldi.net/post/501591
// Automatically collapses the keyboard settings items in
// vivaldi://settings/keyboard.

(function collapseKeyboardSettings() {
  const settingsUrl =
    "chrome-extension://mpognobbkildjkofajifpdfhcoklimli/components/settings/settings.html?path=";
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url === `${settingsUrl}keyboard`) {
      setTimeout(() => {
        document.querySelector(".category.show button").click();
      }, 100);
    }
  });
})();
