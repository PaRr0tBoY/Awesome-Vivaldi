// ==UserScript==
// @name         Workspace Theme Switcher
// @description  Automatically applies custom themes when switching workspaces.
// @version      2026.5.7
// @author       PaRr0tBoY
// ==/UserScript==

(() => {
  "use strict";

  const CONFIG_DIR = ".askonpage";
  const CONFIG_FILE = "config.json";

  let workspaceThemeMap = {};
  let defaultThemeId = "";
  let lastWorkspaceName = "";
  let lastThemeId = "";
  let timer = null;
  let busy = false;
  let themeCache = null;
  let configReady = null;

  const isEnglishUi = () => {
    const lang = chrome.i18n?.getUILanguage?.() || navigator.language || "";
    return String(lang).toLowerCase().startsWith("en");
  };

  const toastText = (key, data = {}) => {
    const en = isEnglishUi();
    const text = {
      switched: en
        ? `Theme switched: ${data.workspaceName} -> ${data.themeName}`
        : `主题已切换: ${data.workspaceName} -> ${data.themeName}`,
    };
    return text[key] || key;
  };

  const showToast = (message, options = {}) => {
    window.VModToast?.show(message, { module: "WorkspaceThemeSwitcher", ...options });
  };

  // ==================== Config Loading ====================

  async function getConfigFileHandle(create) {
    const root = await navigator.storage.getDirectory();
    const dir = await root.getDirectoryHandle(CONFIG_DIR, { create: true });
    return dir.getFileHandle(CONFIG_FILE, { create });
  }

  function applySwitcherConfig(raw) {
    const settings = raw?.mods?.workspaceThemeSwitcher || {};
    const map = settings.workspaceThemeMap;
    workspaceThemeMap = map && typeof map === "object" && !Array.isArray(map) ? map : {};
    defaultThemeId = typeof settings.defaultThemeId === "string" ? settings.defaultThemeId.trim() : "";
  }

  async function loadConfig() {
    try {
      const fileHandle = await getConfigFileHandle(false);
      const file = await fileHandle.getFile();
      const raw = JSON.parse(await file.text());
      applySwitcherConfig(raw);
    } catch (_error) {}
  }

  async function saveDefaultThemeId(themeId) {
    if (!themeId) return;
    let raw = {};
    try {
      const existingHandle = await getConfigFileHandle(false);
      const file = await existingHandle.getFile();
      raw = JSON.parse(await file.text());
    } catch (_error) {}

    raw.schemaVersion = Math.max(3, Number(raw.schemaVersion) || 3);
    raw.ai = raw.ai && typeof raw.ai === "object" ? raw.ai : { default: {}, overrides: {} };
    raw.mods = raw.mods && typeof raw.mods === "object" ? raw.mods : {};
    raw.mods.workspaceThemeSwitcher =
      raw.mods.workspaceThemeSwitcher && typeof raw.mods.workspaceThemeSwitcher === "object"
        ? raw.mods.workspaceThemeSwitcher
        : {};
    raw.mods.workspaceThemeSwitcher.defaultThemeId = themeId;

    const fileHandle = await getConfigFileHandle(true);
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(raw, null, 2));
    await writable.close();
  }

  async function ensureDefaultThemeId() {
    if (defaultThemeId) return defaultThemeId;
    const currentTheme = await getPref("vivaldi.themes.current");
    if (typeof currentTheme === "string" && currentTheme.trim()) {
      defaultThemeId = currentTheme.trim();
      try {
        await saveDefaultThemeId(defaultThemeId);
      } catch (error) {
        console.warn("[WorkspaceThemeSwitcher] failed to save default theme", error);
      }
    }
    return defaultThemeId;
  }

  configReady = loadConfig();
  window.addEventListener("vivaldi-mod-config-updated", (event) => {
    applySwitcherConfig(event.detail);
    lastWorkspaceName = "";
    lastThemeId = "";
    scheduleApply();
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

  async function resolveTheme(themeRef) {
    if (!themeCache) {
      await resolveThemeId(themeRef);
    }
    const theme = themeCache.find((item) => item.id === themeRef || item.name === themeRef);
    return {
      id: theme ? theme.id : themeRef,
      name: theme ? theme.name : themeRef,
    };
  }

  function invalidateThemeCache() {
    themeCache = null;
  }

  // ==================== Theme Transition ====================

  function captureCurrentBackground() {
    const candidates = ["#browser", ".webpagestack", "#main", "body"];
    for (const sel of candidates) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const bg = getComputedStyle(el).backgroundColor;
      if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") return bg;
    }
    return null;
  }

  async function extractThemeBackground(themeId) {
    const [systemThemes, userThemes] = await Promise.all([
      getPref("vivaldi.themes.system"),
      getPref("vivaldi.themes.user"),
    ]);
    const allThemes = [...(systemThemes || []), ...(userThemes || [])];
    const theme = allThemes.find((t) => t.id === themeId);
    const settings = theme?.settings;
    if (!Array.isArray(settings)) return null;
    const bg = settings.find((s) => s.name === "colorBg");
    return bg?.value || null;
  }

  async function applyThemeForCurrentWorkspace() {
    if (busy) return;
    busy = true;

    try {
      await configReady;
      await ensureDefaultThemeId();

      const workspaces = await getPref("vivaldi.workspaces.list");
      const workspace =
        await getWorkspaceFromActiveTab(workspaces || []) ||
        getWorkspaceFromButton(workspaces || []);

      const workspaceName = workspace ? workspace.name : "__default";
      const themeRef = workspaceThemeMap[workspaceName] || defaultThemeId;
      if (!themeRef) return;

      const theme = await resolveTheme(themeRef);
      const themeId = theme.id;
      if (!themeId) return;
      if (workspaceName === lastWorkspaceName && themeId === lastThemeId) return;

      const currentThemeId = await getPref("vivaldi.themes.current");
      if (currentThemeId === themeId) {
        lastWorkspaceName = workspaceName;
        lastThemeId = themeId;
        return;
      }

      // Smooth crossfade transition (Zen-style dual-layer overlay)
      const TRANSITION_MS = 300;
      const oldBg = captureCurrentBackground();
      const newBg = await extractThemeBackground(themeId);

      let overlay = null;
      let overlayDone = null;

      if (oldBg && newBg && oldBg !== newBg) {
        overlay = document.createElement("div");
        overlay.id = "workspace-theme-overlay";
        Object.assign(overlay.style, {
          position: "fixed",
          inset: "0",
          zIndex: "999999",
          backgroundColor: newBg,
          opacity: "0",
          pointerEvents: "none",
          transition: `opacity ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        });
        document.body.appendChild(overlay);

        // Force paint before starting transition
        void overlay.offsetWidth;
        overlay.style.opacity = "1";

        overlayDone = new Promise((resolve) => {
          overlay.addEventListener("transitionend", resolve, { once: true });
        });
      }

      await setPref("vivaldi.themes.current", themeId);

      if (overlay) {
        const timeout = new Promise((r) => setTimeout(r, TRANSITION_MS + 50));
        await Promise.race([overlayDone, timeout]);
        overlay.remove();
      }

      showToast(toastText("switched", {
        workspaceName: workspace ? workspaceName : "Default",
        themeName: theme.name || themeId,
      }), { type: "success" });

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
