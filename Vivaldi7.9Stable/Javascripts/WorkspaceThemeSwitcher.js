(() => {
  "use strict";

  const CONFIG_DIR = ".askonpage";
  const CONFIG_FILE = "config.json";

  let workspaceThemeMap = {};
  let lastWorkspaceName = "";
  let lastThemeId = "";
  let timer = null;
  let busy = false;
  let themeCache = null;

  // ==================== Config Loading ====================

  async function loadConfig() {
    try {
      const root = await navigator.storage.getDirectory();
      const dir = await root.getDirectoryHandle(CONFIG_DIR, { create: true });
      const fileHandle = await dir.getFileHandle(CONFIG_FILE, { create: false });
      const file = await fileHandle.getFile();
      const raw = JSON.parse(await file.text());
      const map = raw?.mods?.workspaceThemeSwitcher?.workspaceThemeMap;
      if (map && typeof map === "object") {
        workspaceThemeMap = map;
      }
    } catch (_error) {}
  }

  loadConfig();
  window.addEventListener("vivaldi-mod-config-updated", (event) => {
    const map = event.detail?.mods?.workspaceThemeSwitcher?.workspaceThemeMap;
    if (map && typeof map === "object") {
      workspaceThemeMap = map;
    }
  });

  // ==================== Theme Logic ====================

  const unwrap = (value) => value && value.value !== undefined ? value.value : value;

  async function getPref(path) {
    return unwrap(await vivaldi.prefs.get(path));
  }

  async function setPref(path, value) {
    return await vivaldi.prefs.set({ path, value });
  }

  function parseVivExtData(value) {
    if (!value) return {};
    if (typeof value === "object") return value;
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }

  async function getWorkspaceFromActiveTab(workspaces) {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab || typeof activeTab.id !== "number") return null;

    try {
      const extra = await vivaldi.tabsPrivate.get(activeTab.id);
      const ext = parseVivExtData(extra && extra.vivExtData);
      if (ext.workspaceId == null) return null;
      return workspaces.find((ws) => ws.id === ext.workspaceId) || null;
    } catch {
      return null;
    }
  }

  function getWorkspaceFromButton(workspaces) {
    const candidates = Array.from(document.querySelectorAll(
      ".button-toolbar.workspace-popup, .button-toolbar.workspace-popup button, .button-toolbar.workspace-popup .ToolbarButton-Button"
    ));

    const text = candidates
      .filter((el) => el.getClientRects().length > 0)
      .map((el) => (el.textContent || "").trim())
      .find(Boolean) || "";

    const exact = workspaces.find((ws) => text === ws.name);
    if (exact) return exact;

    const sorted = [...workspaces].sort((a, b) => String(b.name).length - String(a.name).length);
    return sorted.find((ws) => text.includes(ws.name)) || null;
  }

  async function resolveThemeId(themeRef) {
    if (!themeCache) {
      const [systemThemes, userThemes] = await Promise.all([
        getPref("vivaldi.themes.system"),
        getPref("vivaldi.themes.user"),
      ]);
      themeCache = [...(systemThemes || []), ...(userThemes || [])];
    }

    const theme = themeCache.find((item) => item.id === themeRef || item.name === themeRef);
    return theme ? theme.id : themeRef;
  }

  function invalidateThemeCache() {
    themeCache = null;
  }

  async function applyThemeForCurrentWorkspace() {
    if (busy) return;
    busy = true;

    try {
      const workspaces = await getPref("vivaldi.workspaces.list");
      const workspace =
        await getWorkspaceFromActiveTab(workspaces || []) ||
        getWorkspaceFromButton(workspaces || []);

      const workspaceName = workspace ? workspace.name : "__default";
      const themeRef = workspaceThemeMap[workspaceName];

      // No mapping for this workspace — skip, don't touch user's theme
      if (!themeRef) {
        lastWorkspaceName = workspaceName;
        return;
      }

      if (workspaceName === lastWorkspaceName) return;

      const themeId = await resolveThemeId(themeRef);
      if (!themeId || themeId === lastThemeId) return;

      await setPref("vivaldi.themes.current", themeId);

      lastWorkspaceName = workspaceName;
      lastThemeId = themeId;
    } catch (error) {
      invalidateThemeCache();
      console.warn("[WorkspaceThemeSwitcher] failed", error);
    } finally {
      busy = false;
    }
  }

  function scheduleApply() {
    clearTimeout(timer);
    timer = setTimeout(applyThemeForCurrentWorkspace, 250);
  }

  function init() {
    chrome.tabs.onActivated.addListener(scheduleApply);
    chrome.tabs.onUpdated.addListener(scheduleApply);

    const header = document.querySelector("#header") || document.body;
    new MutationObserver(scheduleApply).observe(header, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    setInterval(applyThemeForCurrentWorkspace, 1200);
    applyThemeForCurrentWorkspace();
  }

  if (document.body) {
    init();
  } else {
    window.addEventListener("DOMContentLoaded", init);
  }
})();
