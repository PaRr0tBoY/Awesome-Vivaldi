// ModConfig.js
// 在 Vivaldi 设置页面注入模组配置面板

(function modConfig() {
  const SETTINGS_URL = "chrome-extension://mpognobbkildjkofajifpdfhcoklimli/components/settings/settings.html";

  function injectModSection() {
    const container = document.querySelector(".sync-setup");
    if (!container || container.querySelector("#mod-config-section")) return;

    const section = document.createElement("div");
    section.id = "mod-config-section";
    section.innerHTML = `
      <h2>Mod Config</h2>
      <div class="setting-group">
        <div class="setting-single">
          <span class="setting-label">Mod Configuration</span>
        </div>
      </div>
    `;

    container.appendChild(section);
  }

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!changeInfo.url?.includes("settings.html?path=sync")) return;
    setTimeout(injectModSection, 300);
  });
})();
