// Internal Page Theme
// version 2021.9.0
// https://forum.vivaldi.net/topic/57420/theme-internal-pages
// Injects CSS into the internal pages vivaldi://about and about:blank, uses
// native theme colors. Relies on chrome.tabs restore method
// ☛ https://forum.vivaldi.net/topic/57191/restore-methods-for-chrome-tabs

(function () {
  function intpages(id, page) {
    const bg = document.documentElement.style.getPropertyValue("--colorBg");
    const bgdark =
      document.documentElement.style.getPropertyValue("--colorBgDark");
    const fg = document.documentElement.style.getPropertyValue("--colorFg");
    const fgintense =
      document.documentElement.style.getPropertyValue("--colorFgIntense");
    const hi =
      document.documentElement.style.getPropertyValue("--colorHighlightBg");
    if (page === "chrome://version/") {
      var sendit = `
        html {
            background-image: linear-gradient(to bottom, transparent 50%, ${bg} 50%), linear-gradient(to right, ${bgdark} 50%, ${bg} 50%) !important;
            background-size: 10px 10px, 10px 10px !important;
        }
        .label, #company {
            color: ${fgintense};
            font-size: 0.9em !important;
        }
        .version, #slogan {
            color: ${fg} !important;
            font-size: 0.85em !important;
        }
        .version, #useragent {
            font-family: unset !important;
        }
        #copyright {
            font-size: 0.8em !important;
        }
        a {
            color: ${hi};
        }
      `;
    } else if (page === "about:blank") {
      var sendit = `
        body {
            background-image: linear-gradient(to bottom, transparent 50%, ${bg} 50%), linear-gradient(to right, ${bgdark} 50%, ${bg} 50%);
            background-size: 10px 10px, 10px 10pt;
        }
      `;
    }
    chrome.tabs.insertCSS(id, { code: sendit });
  }

  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (
      changeInfo.url === "chrome://version/" ||
      changeInfo.title === "About Version" ||
      changeInfo.url === "about:blank"
    ) {
      intpages(tabId, changeInfo.url);
    }
  });
})();
