// Backup Search Engines
// version 2025.1.0
// https://forum.vivaldi.net/post/277594
// Adds functionality to backup and restore search engines in
// vivaldi://settings/search.

(function backupSearchEngines() {
  function msg(print) {
    clearTimeout(msgTimeout);
    if (print === "backup") {
      info.innerText = "Backup copied to clipboard";
    } else if (print === "restore") {
      info.innerText = "Search engines restored";
    } else {
      info.innerText = "Code error, aborted";
    }
    msgTimeout = setTimeout(() => (info.innerText = ""), 5000);
  }

  function bringingItAllBackHome(remains, defaultsArray) {
    vivaldi.searchEngines.getTemplateUrls((engines) => {
      const getKeys = engines.templateUrls.map((e) => e.keyword);
      for (let i = 0; i < defaultsArray.length; i++) {
        const index = getKeys.lastIndexOf(defaultsArray[i][0]);
        const id = engines.templateUrls[index].guid.toString();
        const ds = defaultsArray[i][1];
        vivaldi.searchEngines.setDefault(ds, id);
      }
      remains.forEach((remove) => {
        vivaldi.searchEngines.removeTemplateUrl(remove);
      });
      msg("restore");
    });
  }

  function exec(collection) {
    vivaldi.searchEngines.getTemplateUrls((engines) => {
      const oldDefaults = [
        engines.defaultImage,
        engines.defaultPrivate,
        engines.defaultSearch,
      ];
      const newDefaults = [
        collection.defaultImage,
        collection.defaultPrivate,
        collection.defaultSearch,
        collection.defaultSearchField,
        collection.defaultSearchFieldPrivate,
        collection.defaultSpeeddials,
        collection.defaultSpeeddialsPrivate,
      ];
      engines.templateUrls.forEach((engine) => {
        if (oldDefaults.indexOf(engine.guid) === -1) {
          vivaldi.searchEngines.removeTemplateUrl(engine.guid);
        }
      });
      console.info("restoring search engines...");
      const defaultsArray = [];
      collection.templateUrls.forEach((collect) => {
        vivaldi.searchEngines.addTemplateUrl(collect, () => {
          console.info(` \u2022 ${collect.name}`);
          if (newDefaults.indexOf(collect.guid) > -1) {
            const indeces = newDefaults
              .map((e, i) => (e === collect.guid ? i : ""))
              .filter(String);
            indeces.forEach((index) => {
              let ds;
              if (index === 0) {
                ds = vivaldi.searchEngines.DefaultType.DEFAULT_IMAGE;
              } else if (index === 1) {
                ds = vivaldi.searchEngines.DefaultType.DEFAULT_PRIVATE;
              } else if (index === 2) {
                ds = vivaldi.searchEngines.DefaultType.DEFAULT_SEARCH;
              } else if (index === 3) {
                ds = vivaldi.searchEngines.DefaultType.DEFAULT_SEARCH_FIELD;
              } else if (index === 4) {
                ds = vivaldi.searchEngines.DefaultType.DEFAULT_SEARCH_FIELD_PRIVATE;
              } else if (index === 5) {
                ds = vivaldi.searchEngines.DefaultType.DEFAULT_SPEEDDIALS;
              } else {
                ds = vivaldi.searchEngines.DefaultType.DEFAULT_SPEEDDIALS_PRIVATE;
              }
              const tunnel = [collect.keyword, ds];
              defaultsArray.push(tunnel);
            });
          }
        });
      });
      const remains = [...new Set(oldDefaults)];
      bringingItAllBackHome(remains, defaultsArray);
    });
  }

  function restore(e) {
    e.preventDefault();
    e.stopPropagation();
    let backupCode;
    let collection;
    if (e.type === "paste") {
      const clipboardData = e.clipboardData;
      backupCode = clipboardData.getData("text");
    } else {
      backupCode = e.dataTransfer.getData("text");
    }
    try {
      collection = JSON.parse(backupCode);
    } catch (err) {
      msg("error");
      return;
    }
    if (
      "defaultImage" in collection &&
      "defaultPrivate" in collection &&
      "defaultSearch" in collection
    ) {
      exec(collection);
    } else {
      msg("error");
    }
  }

  function backup() {
    vivaldi.searchEngines.getTemplateUrls((engines) => {
      const backupCode = JSON.stringify(engines, null, 2);
      navigator.clipboard.writeText(backupCode);
      msg("backup");
    });
  }

  function ui() {
    const check = document.getElementById("vm-bse-backup");
    if (!check) {
      const place = document.querySelector(
        ".setting-section > div > .setting-group.unlimited > .setting-single"
      );
      const btn = document.createElement("input");
      btn.setAttribute("type", "button");
      btn.setAttribute("value", "Backup");
      btn.classList.add("vm-bse-backup");
      place.insertBefore(btn, place.lastChild);
      btn.addEventListener("click", backup);
      const input = document.createElement("input");
      input.setAttribute("type", "text");
      input.setAttribute("placeholder", "Restore Backup");
      input.classList.add("vm-bse-restore");
      place.insertBefore(input, place.lastChild);
      input.addEventListener("paste", restore);
      input.addEventListener("drop", restore);
      info = document.createElement("span");
      info.classList.add("vm-bse-msg");
      place.insertBefore(info, place.lastChild);
    }
  }

  const css = `
    .vm-bse-restore {
      width: 130px;
      margin-left: 6px;
      margin-top: 6px;
    }
    .vm-bse-restore::-webkit-input-placeholder {
      opacity: 1;
      color: var(--colorHighlightBg);
      text-align: center;
    }
    .vm-bse-msg {
      margin-left: 12px;
    }
  `;

  let msgTimeout;
  const settingsUrl =
    "chrome-extension://mpognobbkildjkofajifpdfhcoklimli/components/settings/settings.html?path=";
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url === `${settingsUrl}search`) {
      setTimeout(ui, 100);
      const check = document.getElementById("vm-bse-css");
      if (!check) {
        const style = document.createElement("style");
        style.id = "vm-bse-css";
        style.innerHTML = css;
        document.getElementsByTagName("head")[0].appendChild(style);
      }
    }
  });
})();
