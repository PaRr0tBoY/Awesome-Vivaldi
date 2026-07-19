// ==UserScript==
// @name         Tidy Tabs
// @description  AI-assisted tab grouping and cleanup for Vivaldi.
// @requirements TidyTabs.css, ClearTabs.css
// @version      2026.5.7
// @author       PaRr0tBoY
// ==/UserScript==

(function () {
  "use strict";

  // ==================== AI Configuration ====================
  // 1. Fill in apiKey.
  // 2. Set apiEndpoint to the full chat completions URL.
  // 3. Adjust model / timeout / maxTokens if needed.
  // 4. If apiKey is empty, AI grouping will be skipped.
  //
  // Common examples:
  // GLM: https://open.bigmodel.cn/api/paas/v4/chat/completions
  // Mimo: https://api.xiaomimimo.com/v1/chat/completions
  // OpenRouter: https://openrouter.ai/api/v1/chat/completions
  // DeepSeek: https://api.deepseek.com/chat/completions
  const AI_CONFIG = {
    apiEndpoint: "https://openrouter.ai/api/v1/chat/completions",
    apiKey: "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",
    model: "openrouter/free",
    timeout: 0,
    temperature: 0,
    maxTokens: 8192,
  };
  const MOD_AI_CONFIG_KEY = "tidyTabs";
  const MOD_AI_CONFIG_FILE = "config.json";
  const MOD_AI_CONFIG_DIR = ".askonpage";

  function applySharedAiConfig(raw) {
    const aiRoot = raw?.ai && typeof raw.ai === "object" ? raw.ai : raw || {};
    const base = aiRoot.default && typeof aiRoot.default === "object" ? aiRoot.default : aiRoot;
    const override = aiRoot.overrides?.[MOD_AI_CONFIG_KEY] && typeof aiRoot.overrides[MOD_AI_CONFIG_KEY] === "object"
      ? aiRoot.overrides[MOD_AI_CONFIG_KEY]
      : {};
    const source = Object.assign({}, base, override);
    ["apiEndpoint", "apiKey", "model"].forEach((key) => {
      if (typeof source[key] === "string") {
        AI_CONFIG[key] = source[key].trim();
      }
    });
  }

  async function loadSharedAiConfig() {
    try {
      const root = await navigator.storage.getDirectory();
      const dir = await root.getDirectoryHandle(MOD_AI_CONFIG_DIR, { create: true });
      const fileHandle = await dir.getFileHandle(MOD_AI_CONFIG_FILE, { create: false });
      const file = await fileHandle.getFile();
      applySharedAiConfig(JSON.parse(await file.text()));
      console.log("[TidyTabs] [AI] Shared config loaded. apiKey configured:", !!AI_CONFIG.apiKey, "endpoint:", AI_CONFIG.apiEndpoint, "model:", AI_CONFIG.model);
    } catch (_error) {
      console.log("[TidyTabs] [AI] No shared config file found (config.json missing). apiKey configured:", !!AI_CONFIG.apiKey);
    }
  }

  loadSharedAiConfig();
  window.addEventListener("vivaldi-mod-ai-config-updated", (event) => {
    applySharedAiConfig(event.detail || {});
  });

  // ==================== Script Configuration ====================

  const CONFIG = {
    debug: false,
    autoStackWorkspaces: [],
    enableAIGrouping: true,
    enableStackColor: false,
    maxTabsForAI: 50,
    delays: {
      init: 500,
      mutation: 50,
      workspaceSwitch: 100,
      retry: 500,
      reattach: 500,
      debounce: 150,
      autoStack: 1000,
    },
  };

  function applyModSettings(raw) {
    const mods = raw?.mods && typeof raw.mods === "object" ? raw.mods : {};
    const tidySeries = mods.tidySeries && typeof mods.tidySeries === "object" ? mods.tidySeries : {};
    if (typeof tidySeries.enableStackColor === "boolean") {
      CONFIG.enableStackColor = tidySeries.enableStackColor;
    }
  }

  async function loadModSettings() {
    try {
      const root = await navigator.storage.getDirectory();
      const dir = await root.getDirectoryHandle(MOD_AI_CONFIG_DIR, { create: true });
      const fileHandle = await dir.getFileHandle(MOD_AI_CONFIG_FILE, { create: false });
      const file = await fileHandle.getFile();
      applyModSettings(JSON.parse(await file.text()));
    } catch (_error) {}
  }

  loadModSettings();
  window.addEventListener("vivaldi-mod-config-updated", (event) => {
    applyModSettings(event.detail || {});
  });

  const SELECTORS = {
    TAB_STRIP: ".tab-strip",
    SEPARATOR: ".tab-strip .separator",
    TAB_WRAPPER: ".tab-wrapper",
    TAB_POSITION: ".tab-position",
    STACK_COUNTER: ".stack-counter",
    TAB_STACK: ".svg-tab-stack",
    SUBSTACK: ".tab-position.is-substack, .tab-position.is-stack",
    ACTIVE: ".active",
  };

  const CLASSES = {
    TIDY_BUTTON: "tidy-tabs-below-button",
    CLEAR_BUTTON: "clear-tabs-below-button",
    LOADING: "tidy-loading",
    PINNED: "is-pinned",
    SUBSTACK: "is-substack",
  };

  const LANGUAGE_MAP = {
    zh: "Chinese",
    "zh-CN": "Chinese",
    "zh-TW": "Chinese",
    en: "English",
    "en-US": "English",
    "en-GB": "English",
    ja: "Japanese",
    "ja-JP": "Japanese",
    ko: "Korean",
    "ko-KR": "Korean",
    es: "Spanish",
    fr: "French",
    de: "German",
    ru: "Russian",
    pt: "Portuguese",
    it: "Italian",
    ar: "Arabic",
    hi: "Hindi",
  };

  const OTHERS_NAMES = [
    "其它", "Others", "その他", "Other",
    "Outros", "Andere", "Autres", "Autre",
    "Altri", "Другое", "다른", "أخرى", "अन्य",
  ];

  const OTHERS_MAP = {
    Chinese: "其它",
    Japanese: "その他",
    English: "Others",
    Korean: "다른",
    Spanish: "Otros",
    French: "Autres",
    German: "Andere",
    Russian: "Другое",
    Portuguese: "Outros",
    Italian: "Altri",
    Arabic: "أخرى",
    Hindi: "अन्य",
  };

  const SUGGESTED_CLOSE_MAP = {
    Chinese: "建议关闭的标签页",
    Japanese: "閉じる提案",
    English: "Suggested to Close",
    French: "Fermer suggéré",
    German: "Schließen vorgeschlagen",
    Spanish: "Cerrar sugerido",
    Italian: "Chiudere suggerito",
  };

  const SUGGESTED_PIN_MAP = {
    Chinese: "建议固定的标签页",
    Japanese: "固定する提案",
    English: "Suggested to Pin",
    French: "Épingler suggéré",
    German: "Anheften vorgeschlagen",
    Spanish: "Fijar sugerido",
    Italian: "Fissare suggerito",
  };

  const SUGGESTED_CLOSE_NAMES = Object.values(SUGGESTED_CLOSE_MAP);
  const SUGGESTED_PIN_NAMES = Object.values(SUGGESTED_PIN_MAP);

  const getSuggestedCloseName = () => {
    const lang = getLanguageName(getBrowserLanguage());
    return SUGGESTED_CLOSE_MAP[lang] || "Suggested to Close";
  };

  const getSuggestedPinName = () => {
    const lang = getLanguageName(getBrowserLanguage());
    return SUGGESTED_PIN_MAP[lang] || "Suggested to Pin";
  };

  const isSpecialCategory = (name) =>
    SUGGESTED_CLOSE_NAMES.includes(name) || SUGGESTED_PIN_NAMES.includes(name) || OTHERS_NAMES.includes(name);

  const debugLog = (...args) => { if (CONFIG.debug) console.log(...args); };
  const debugWarn = (...args) => { if (CONFIG.debug) console.warn(...args); };

  let debounceTimer = null;
  const processingSeparators = new Set();
  const TIDY_TABS_STACK_OWNER = "TidyTabs";

  // ==================== Utility Functions ====================

  const parseVivExtData = (tab) => {
    if (!tab?.vivExtData) return {};
    if (typeof tab.vivExtData === "string") {
      try { return JSON.parse(tab.vivExtData); } catch (_) { return {}; }
    }
    return tab.vivExtData;
  };

  const getBrowserLanguage = () =>
    chrome.i18n?.getUILanguage?.() || navigator.language || "zh-CN";

  const getLanguageName = (langCode) =>
    LANGUAGE_MAP[langCode] || LANGUAGE_MAP[langCode.split("-")[0]] || "English";

  const getOthersName = () => {
    const lang = getLanguageName(getBrowserLanguage());
    return OTHERS_MAP[lang] || "Others";
  };

  // ==================== Tab Scoring for "Suggested to Close" ====================

  const CLOSE_SCORE = {
    DISCARDED: 30,
    IDLE_24H: 25,
    SEARCH_RESULT: 20,
    DUPLICATE_URL: 15,
    AGE_7D: 10,
    NO_STACK: 5,
    AUDIBLE: -30,
    ACTIVE: -50,
  };
  const CLOSE_THRESHOLD = 40;

  const SEARCH_URL_PATTERNS = [
    /google\.[a-z.]+\/search/i,
    /baidu\.com\/s\b/i,
    /bing\.com\/search/i,
    /duckduckgo\.com\/\?q=/i,
    /yahoo\.com\/search/i,
    /yandex\.[a-z]+\/search/i,
    /sogou\.com\/web/i,
    /so\.com\/s\b/i,
    /zhihu\.com\/search/i,
    /bilibili\.com\/search/i,
    /youtube\.com\/results/i,
    /github\.com\/search/i,
    /stackoverflow\.com\/search/i,
  ];

  const isSearchResultPage = (url) => {
    if (!url) return false;
    return SEARCH_URL_PATTERNS.some((p) => p.test(url));
  };

  // ── Tab age tracking via OPFS ──────────────────────────────────────────

  const TAB_AGE_FILE = "tabAge.json";

  const loadTabAgeData = async () => {
    try {
      const root = await navigator.storage.getDirectory();
      const dir = await root.getDirectoryHandle(MOD_AI_CONFIG_DIR, { create: true });
      const fh = await dir.getFileHandle(TAB_AGE_FILE, { create: true });
      const file = await fh.getFile();
      const text = await file.text();
      return text ? JSON.parse(text) : {};
    } catch (_) { return {}; }
  };

  const saveTabAgeData = async (data) => {
    try {
      const root = await navigator.storage.getDirectory();
      const dir = await root.getDirectoryHandle(MOD_AI_CONFIG_DIR, { create: true });
      const fh = await dir.getFileHandle(TAB_AGE_FILE, { create: true });
      const writable = await fh.createWritable();
      await writable.write(JSON.stringify(data));
      await writable.close();
    } catch (_) { /* non-critical */ }
  };

  // Record current activation time for open tabs (call periodically)
  const recordTabActivation = async () => {
    try {
      const tabs = await new Promise((r) => chrome.tabs.query({ currentWindow: true }, r));
      const data = await loadTabAgeData();
      const now = Date.now();
      let changed = false;
      for (const tab of tabs) {
        if (tab.id < 0 || !tab.url || tab.pinned) continue;
        const key = String(tab.id);
        if (!data[key]) { data[key] = { created: now, lastActive: now, activationCount: 0, totalActiveMs: 0 }; changed = true; }
      }
      if (changed) await saveTabAgeData(data);
    } catch (_) { /* non-critical */ }
  };

  let currentActiveTabId = null;
  let currentActiveSince = null;

  const updateTabActiveTime = async (tabId, isActivating = true) => {
    try {
      const data = await loadTabAgeData();
      const key = String(tabId);
      const now = Date.now();
      if (!data[key]) data[key] = { created: now, lastActive: now, activationCount: 0, totalActiveMs: 0 };
      if (isActivating) {
        data[key].activationCount = (data[key].activationCount || 0) + 1;
      }
      data[key].lastActive = now;
      await saveTabAgeData(data);
    } catch (_) { /* non-critical */ }
  };

  // Track active time: when switching away from a tab, record how long it was active
  const flushActiveTime = async () => {
    if (currentActiveTabId == null || currentActiveSince == null) return;
    const elapsed = Date.now() - currentActiveSince;
    if (elapsed < 1000) return; // ignore <1s
    try {
      const data = await loadTabAgeData();
      const key = String(currentActiveTabId);
      if (!data[key]) data[key] = { created: Date.now(), lastActive: Date.now(), activationCount: 0, totalActiveMs: 0 };
      data[key].totalActiveMs = (data[key].totalActiveMs || 0) + elapsed;
      await saveTabAgeData(data);
    } catch (_) { /* non-critical */ }
  };

  chrome.tabs?.onActivated?.addListener(async (activeInfo) => {
    if (activeInfo.tabId && activeInfo.tabId !== -1) {
      await flushActiveTime();
      currentActiveTabId = activeInfo.tabId;
      currentActiveSince = Date.now();
      updateTabActiveTime(activeInfo.tabId, true);
    }
  });

  // ── Score a single tab ──────────────────────────────────────────────────

  const scoreTab = (tab, allTabs, stacksMap, ageData) => {
    if (!tab || tab.pinned) return -999; // pinned tabs excluded
    let score = 0;
    const reasons = [];

    // Positive signals
    if (tab.discarded) { score += CLOSE_SCORE.DISCARDED; reasons.push("discarded"); }

    const key = String(tab.id);
    const age = ageData[key];
    const idleMs = age ? Date.now() - age.lastActive : 0;
    if (idleMs > 24 * 60 * 60 * 1000) { score += CLOSE_SCORE.IDLE_24H; reasons.push("idle>24h"); }

    if (isSearchResultPage(tab.url)) { score += CLOSE_SCORE.SEARCH_RESULT; reasons.push("searchResult"); }

    const dupes = allTabs.filter((t) => t.url === tab.url && t.id !== tab.id);
    if (dupes.length > 0) { score += CLOSE_SCORE.DUPLICATE_URL; reasons.push("duplicateUrl"); }

    const createdMs = age ? Date.now() - age.created : 0;
    if (createdMs > 7 * 24 * 60 * 60 * 1000) { score += CLOSE_SCORE.AGE_7D; reasons.push("age>7d"); }

    if (!stacksMap.has(tab.id)) { score += CLOSE_SCORE.NO_STACK; reasons.push("noStack"); }

    // Negative signals (only subtract, never add for absence)
    if (tab.audible) { score += CLOSE_SCORE.AUDIBLE; reasons.push("audible"); }
    if (tab.active) { score += CLOSE_SCORE.ACTIVE; reasons.push("active"); }

    return { score, reasons };
  };

  // ── Build a map of tabId → stackId for all tabs ────────────────────────

  const buildStackMap = (allTabs) => {
    const map = new Map();
    for (const tab of allTabs) {
      try {
        const viv = typeof tab.vivExtData === "string" ? JSON.parse(tab.vivExtData) : (tab.vivExtData || {});
        if (viv.group) map.set(tab.id, viv.group);
      } catch (_) { /* skip */ }
    }
    return map;
  };

  // ── Score all tabs and return those above threshold ─────────────────────

  const findSuggestedCloseTabs = async (tabs) => {
    const allTabs = await new Promise((r) => chrome.tabs.query({ currentWindow: true }, r));
    const stacksMap = buildStackMap(allTabs);
    const ageData = await loadTabAgeData();
    const scored = tabs.map((tab) => ({ tab, ...scoreTab(tab, allTabs, stacksMap, ageData) }));
    const closeTabs = new Set();

    // 1. Handle duplicate URLs: keep the best one (most recently active), close the rest
    const urlGroups = new Map();
    for (const s of scored) {
      const url = s.tab.url;
      if (!url) continue;
      if (!urlGroups.has(url)) urlGroups.set(url, []);
      urlGroups.get(url).push(s);
    }
    for (const [, group] of urlGroups) {
      if (group.length < 2) continue;
      // Sort by: not discarded first, then most recently active, then highest score (least close-worthy)
      group.sort((a, b) => {
        if (a.tab.discarded !== b.tab.discarded) return a.tab.discarded ? 1 : -1;
        const aActive = (ageData[String(a.tab.id)]?.lastActive) || 0;
        const bActive = (ageData[String(b.tab.id)]?.lastActive) || 0;
        return bActive - aActive; // most recent first
      });
      // Keep the first (best) one, close the rest
      for (let i = 1; i < group.length; i++) {
        closeTabs.add(group[i].tab);
      }
      console.log("[TidyTabs] [scoring] Duplicate URL — keeping tab", group[0].tab.id, "closing", group.length - 1, "duplicates");
    }

    // 2. Score-based: tabs above threshold (that aren't already from duplicates)
    for (const s of scored) {
      if (closeTabs.has(s.tab)) continue;
      if (s.score >= CLOSE_THRESHOLD) {
        closeTabs.add(s.tab);
      }
    }

    const result = [...closeTabs];
    if (result.length > 0) {
      const details = result.map((t) => {
        const s = scored.find((x) => x.tab.id === t.id);
        return { id: t.id, score: s?.score, reasons: s?.reasons };
      });
      console.log("[TidyTabs] [scoring] Suggested close tabs:", details);
    }
    return result;
  };

  // ── Behavior-based "Suggested to Pin" scoring ──────────────────────────

  const PIN_SCORE = {
    RESTORED: 35,         // Tab survived browser restart (restoreStatus)
    HIGH_ACTIVATION: 25,  // Activated many times
    LONG_ACTIVE_TIME: 20, // Spent significant time on this tab
    OLD_AGE: 15,          // Tab created long ago, never closed
    FREQUENT_URL: 5,      // URL also appears frequently in history (weak signal)
  };
  const PIN_THRESHOLD = 40;

  const scoreTabForPin = (tab, ageData, frequentUrls) => {
    if (!tab || tab.pinned) return { score: -999, reasons: [] };
    let score = 0;
    const reasons = [];

    // 1. Restored tab (survived browser restart — user chose not to close it)
    try {
      const viv = typeof tab.vivExtData === "string" ? JSON.parse(tab.vivExtData) : (tab.vivExtData || {});
      if (viv.restoreStatus === "restored") { score += PIN_SCORE.RESTORED; reasons.push("restored"); }
    } catch (_) { /* skip */ }

    // 2. Activation count
    const key = String(tab.id);
    const age = ageData[key];
    const activations = age?.activationCount || 0;
    if (activations >= 10) { score += PIN_SCORE.HIGH_ACTIVATION; reasons.push("activations:" + activations); }

    // 3. Total active time
    const activeMs = age?.totalActiveMs || 0;
    if (activeMs > 30 * 60 * 1000) { score += PIN_SCORE.LONG_ACTIVE_TIME; reasons.push("activeTime>30m"); }

    // 4. Tab age (always open, never closed)
    const createdMs = age ? Date.now() - age.created : 0;
    if (createdMs > 14 * 24 * 60 * 60 * 1000) { score += PIN_SCORE.OLD_AGE; reasons.push("age>14d"); }

    // 5. Frequent URL (weak auxiliary signal)
    if (frequentUrls?.length) {
      const urlSet = new Set(frequentUrls);
      try { if (urlSet.has(new URL(tab.url).href)) { score += PIN_SCORE.FREQUENT_URL; reasons.push("frequentUrl"); } }
      catch (_) { /* skip */ }
    }

    return { score, reasons };
  };

  // Weak auxiliary signal — frequent URLs from history
  const getFrequentUrls = async (minVisits = 8, daysBack = 14) => {
    try {
      if (!vivaldi?.historyPrivate?.visitSearch) return [];
      const now = Date.now();
      const startTime = now - daysBack * 24 * 60 * 60 * 1000;
      const historyItems = await new Promise((resolve) => {
        vivaldi.historyPrivate.visitSearch({ startTime, endTime: now }, (result) => {
          resolve(chrome.runtime.lastError ? [] : (result || []));
        });
      }).catch(() => []);
      if (!historyItems?.length) return [];
      const count = {};
      for (const item of historyItems) {
        if (!item.url) continue;
        count[item.url] = (count[item.url] || 0) + 1;
      }
      return Object.entries(count)
        .filter(([, c]) => c >= minVisits)
        .map(([url]) => url);
    } catch (_) { return []; }
  };

  const findSuggestedPinTabs = (tabs, ageData, frequentUrls) => {
    const scored = tabs.map((tab) => ({ tab, ...scoreTabForPin(tab, ageData, frequentUrls) }));
    const qualifying = scored.filter((s) => s.score >= PIN_THRESHOLD);

    // Deduplicate by URL: keep only the best tab per URL
    const urlGroups = new Map();
    for (const s of qualifying) {
      const url = s.tab.url || "";
      if (!urlGroups.has(url)) urlGroups.set(url, []);
      urlGroups.get(url).push(s);
    }
    const deduped = [];
    for (const [, group] of urlGroups) {
      if (group.length > 1) {
        // Keep highest score; tie-break by most recent activation
        group.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          const aActive = (ageData[String(a.tab.id)]?.lastActive) || 0;
          const bActive = (ageData[String(b.tab.id)]?.lastActive) || 0;
          return bActive - aActive;
        });
        console.log("[TidyTabs] [scoring] Pin URL dedup — keeping tab", group[0].tab.id, "dropping", group.length - 1, "duplicate(s) of", (group[0].tab.url || "").substring(0, 50));
      }
      deduped.push(group[0]);
    }

    if (deduped.length > 0) {
      console.log("[TidyTabs] [scoring] Suggested pin tabs:", deduped.map((s) => ({ id: s.tab.id, score: s.score, reasons: s.reasons })));
    }
    return deduped.map((s) => s.tab);
  };

  const getUrlFragments = (url) => {
    try {
      if (vivaldi?.utilities?.getUrlFragments)
        return vivaldi.utilities.getUrlFragments(url);
    } catch (e) {
      /* fallback */
    }
    try {
      const u = new URL(url);
      const parts = u.hostname.split(".");
      return {
        hostForSecurityDisplay: u.hostname,
        tld: parts.length > 1 ? parts[parts.length - 1] : "",
      };
    } catch (e) {
      return { hostForSecurityDisplay: "", tld: "" };
    }
  };

  const getBaseDomain = (url) => {
    const { hostForSecurityDisplay, tld } = getUrlFragments(url);
    const match = hostForSecurityDisplay.match(`([^.]+\\.${tld})$`);
    return match ? match[1] : hostForSecurityDisplay;
  };

  const getHostname = (url) => getUrlFragments(url).hostForSecurityDisplay;

  const getTabStrip = () => document.querySelector(SELECTORS.TAB_STRIP);

  const getSeparatorIndex = (separator) => {
    const tabStrip = separator?.closest(SELECTORS.TAB_STRIP);
    if (!tabStrip) return -1;
    return Array.from(tabStrip.querySelectorAll(":scope > .separator")).indexOf(
      separator
    );
  };

  const getSeparatorKey = (separator) => {
    const tabStrip = separator?.closest(SELECTORS.TAB_STRIP);
    const index = getSeparatorIndex(separator);
    if (!tabStrip || index < 0) return null;
    return `${tabStrip.getAttribute("aria-owns") || ""}::${index}`;
  };

  const findLiveSeparatorByKey = (key) => {
    const [owned = "", indexRaw = "-1"] = String(key || "").split("::");
    const index = Number.parseInt(indexRaw, 10);
    if (!Number.isInteger(index) || index < 0) return null;

    const tabStrip = getTabStrip();
    if (!tabStrip) return null;
    const currentOwned = tabStrip.getAttribute("aria-owns") || "";
    if (owned && currentOwned && owned !== currentOwned) return null;

    return tabStrip.querySelectorAll(":scope > .separator")[index] || null;
  };

  const setSeparatorLoadingState = (key, loading) => {
    if (!key) return;
    const separator = findLiveSeparatorByKey(key);
    if (!separator) return;
    separator.classList.toggle(CLASSES.LOADING, loading);
  };

  const reapplyLoadingStates = () => {
    for (const key of processingSeparators) {
      setSeparatorLoadingState(key, true);
    }
  };

  const getTab = (tabId) =>
    new Promise((resolve) => {
      chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError) {
          resolve(null);
          return;
        }
        if (tab.vivExtData) {
          try {
            tab.vivExtData = JSON.parse(tab.vivExtData);
          } catch (e) {
            /* ignore */
          }
        }
        resolve(tab);
      });
    });

  const getWorkspaceName = (workspaceId) => {
    if (!workspaceId) return Promise.resolve("<default_workspace>");
    return new Promise((resolve) => {
      if (vivaldi?.prefs) {
        vivaldi.prefs.get("vivaldi.workspaces.list", (list) => {
          const ws = list.find((w) => w.id === workspaceId);
          resolve(ws ? ws.name : "<unknown_workspace>");
        });
      } else resolve("<unknown_workspace>");
    });
  };

  const isAutoStackAllowed = async (workspaceId) => {
    if (CONFIG.autoStackWorkspaces.length === 0) return false;
    return CONFIG.autoStackWorkspaces.includes(
      await getWorkspaceName(workspaceId)
    );
  };

  const getTabsByWorkspace = (workspaceId) =>
    new Promise((resolve) => {
      chrome.tabs.query({ currentWindow: true }, async (tabs) => {
        if (chrome.runtime.lastError) {
          resolve([]);
          return;
        }
        const valid = [];
        for (const tab of tabs) {
          if (tab.id === -1 || !tab.vivExtData) continue;
          try {
            const viv = JSON.parse(tab.vivExtData);
            if (
              viv.workspaceId === workspaceId &&
              !tab.pinned &&
              !viv.panelId
            ) {
              valid.push({ ...tab, vivExtData: viv });
            }
          } catch (e) {
            /* skip */
          }
        }
        resolve(valid);
      });
    });

  const STACK_COLORS = Array.from({ length: 9 }, (_, i) => `color${i + 1}`);
  const COLOR_WEIGHTS = { color2: 3, color5: 3, color8: 3 };
  const RESTRICTED = new Set(["color3", "color6", "color4", "color9", "color7"]);
  let lastAssignedColor = "";

  const randomStackColor = (overrideLast) => {
    const last = overrideLast || lastAssignedColor;
    const candidates = STACK_COLORS.filter(c => {
      if (!last || !RESTRICTED.has(last)) return true;
      return !RESTRICTED.has(c);
    });
    const weighted = candidates.flatMap(c => Array(COLOR_WEIGHTS[c] || 1).fill(c));
    const pick = weighted[Math.floor(Math.random() * weighted.length)] || candidates[0];
    lastAssignedColor = pick;
    return pick;
  };



  const updateTabProperties = async (tabId, fields) => {
    // 1. Keep compatibility metadata written via standard chrome.tabs.update
    return new Promise((resolve) => {
      chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError || !tab) {
          resolve();
          return;
        }
        let viv = {};
        try {
          viv = typeof tab.vivExtData === "string" ? JSON.parse(tab.vivExtData) : (tab.vivExtData || {});
        } catch (e) { console.warn("[TidyTabs] Failed to parse vivExtData:", e); }

        Object.assign(viv, fields);
        
        chrome.tabs.update(tabId, { vivExtData: JSON.stringify(viv) }, () => {
          if (chrome.runtime.lastError) {
            console.error("[TidyTabs] [chrome.tabs.update] Error:", chrome.runtime.lastError.message);
          } else {
            debugLog(`[TidyTabs] [updateTabProperties] Updated tabId=${tabId}`);
          }
          resolve();
        });
      });
    });
  };

  const addTabToStack = async (tabId, stackId, stackName, stackColor, parentExtId) => {
    debugLog(`[TidyTabs] [addTabToStack] tabId=${tabId}, stackId=${stackId}, stackName="${stackName}"`);
    
    const freshTab = await getTab(tabId);
    let viv = {};
    if (freshTab?.vivExtData) {
      viv = typeof freshTab.vivExtData === "string" ? JSON.parse(freshTab.vivExtData) : freshTab.vivExtData;
    }
    
    const extId = viv.ext_id || crypto.randomUUID();
    
    const fields = {
      ext_id: extId,
      group: stackId,
      tidyStackOwner: TIDY_TABS_STACK_OWNER,
      tidyStackId: stackId
    };
    if (stackName) fields.fixedGroupTitle = stackName;
    if (stackColor) fields.groupColor = stackColor;
    if (parentExtId) {
      fields.parent_ext_id = parentExtId;
    } else {
      fields.parent_ext_id = null;
    }
    
    await updateTabProperties(tabId, fields);
    
    const verifyTab = await getTab(tabId);
    debugLog(`[TidyTabs] [addTabToStack] Verified tabId=${tabId}`);
    
    return extId;
  };

  const showToast = (message, options = {}) => {
    window.VModToast?.show(message, { module: "TidyTabs", ...options });
  };

  const openSettings = () => {
    chrome.tabs.query({ url: "vivaldi://settings/*" }, (tabs) => {
      if (tabs?.length) {
        chrome.tabs.update(tabs[0].id, { active: true });
        chrome.windows.update(tabs[0].windowId, { focused: true });
      } else {
        window.location.assign("vivaldi://settings/?path=appearance");
      }
    });
  };

  // ==================== Existing Stack Detection ====================

  // Detect named stacks (user set a title) from a set of tabs
  const detectNamedStacks = (tabs) => {
    const stacksMap = new Map();
    for (const tab of tabs) {
      let viv;
      try { viv = typeof tab.vivExtData === "string" ? JSON.parse(tab.vivExtData) : (tab.vivExtData || {}); } catch (_) { continue; }
      if (!viv.group) continue;
      if (!stacksMap.has(viv.group)) {
        stacksMap.set(viv.group, {
          id: viv.group,
          name: viv.fixedGroupTitle || null,
          tabIds: [],
        });
      }
      stacksMap.get(viv.group).tabIds.push(tab.id);
    }
    return [...stacksMap.values()].filter((s) => s.name && s.tabIds.length >= 2);
  };

  // Find unnamed stack group IDs (stacks without a custom title)
  const findUnnamedStackIds = (tabs) => {
    const stackInfo = new Map();
    for (const tab of tabs) {
      let viv;
      try { viv = typeof tab.vivExtData === "string" ? JSON.parse(tab.vivExtData) : (tab.vivExtData || {}); } catch (_) { continue; }
      if (!viv.group) continue;
      if (!stackInfo.has(viv.group)) {
        stackInfo.set(viv.group, { named: !!viv.fixedGroupTitle, count: 0 });
      }
      stackInfo.get(viv.group).count++;
    }
    return [...stackInfo.entries()]
      .filter(([, info]) => !info.named && info.count >= 2)
      .map(([id]) => id);
  };

  // Dismantle an unnamed stack, returning its tabs back to the pool
  const dismantleStack = async (groupId) => {
    // Collect tab IDs BEFORE dismantling
    const allTabs = await new Promise((r) => chrome.tabs.query({ currentWindow: true }, r));
    const stackTabIds = allTabs.filter((t) => {
      try {
        const viv = typeof t.vivExtData === "string" ? JSON.parse(t.vivExtData) : (t.vivExtData || {});
        return viv.group === groupId;
      } catch (_) { return false; }
    }).map((t) => t.id);

    if (stackTabIds.length < 2) return stackTabIds;

    await _unstackGroup(groupId);
    console.log("[TidyTabs] Dismantled unnamed stack:", groupId.slice(0, 8), "→", stackTabIds.length, "tabs freed");
    return stackTabIds;
  };

  // ==================== AI Grouping ====================

  const buildAIPrompt = (tabs, existingStacks, languageName) => {
    // Build a map from chrome tab.id → local index for opener reference
    const chromeIdToIndex = {};
    tabs.forEach((tab, i) => {
      chromeIdToIndex[tab.id] = i;
    });

    const tabsInfo = tabs.map((tab, i) => ({
      id: i,
      title: tab.title || "Untitled",
      domain: getHostname(tab.url),
      openerIndex:
        tab.openerTabId != null ? chromeIdToIndex[tab.openerTabId] : undefined,
    }));

    // Format each tab as "domain/id: title" with optional "↳ opener_domain/opener_id"
    const tabLines = tabsInfo
      .map((t) => {
        let line = `${t.domain}/${t.id}: ${t.title}`;
        if (t.openerIndex !== undefined) {
          const opener = tabsInfo[t.openerIndex];
          if (opener) line = `${line}\n  \u21b3 ${opener.domain}/${opener.id}`;
        }
        return line;
      })
      .join("\n");

    const othersName = getOthersName();

    let prompt = `You are a meticulous expert organizer who follows instructions concisely. I have some tabs! Please help me sort them into groups. I'll provide you with a list of tabs, with their IDs (e.g. google.com/3), their titles, and the tab they were opened from if applicable (e.g. \u21b3 google.com/0).

IMPORTANT \u2014 Group primarily by page CONTENT and TOPIC, not by domain. Domain names in the IDs are for identification only. Example: "github.com/1: React docs" and "example.com/5: React tutorial" should group together under "React", NOT under separate "Github" and "Example" domain groups. Look at TITLES to find semantic connections. Domain is the LAST thing you should consider \u2014 only use it when titles have absolutely nothing in common. If a tab has a unique keyword in common with tabs in a group, include it in that group. Use the most descriptive keyword as the group name. Some tabs may be in a group of their own, but you should try to include each tab in a group if possible.

`;

    if (existingStacks && existingStacks.length > 0) {
      prompt += `Some tabs already belong to user-named stacks. These stacks should be preserved — you may add matching ungrouped tabs into them:
`;
      for (const s of existingStacks) {
        prompt += `- "${s.name}": currently has tab_ids [${s.existingTabIds.join(",")}]
`;
      }
      prompt += `If ungrouped tabs fit these existing stacks' themes, assign them to those stacks using the exact same name. Do NOT create new stacks with these names.

`;
    } else {
      prompt += `Treat every tab below as raw material for a fresh regrouping. Ignore any previous browser tab stack membership or previous stack names.

`;
    }

    prompt += `My tabs:
${tabLines}

**Rules:**
1. ${existingStacks?.length ? "Preserve existing named stacks; create new groups for remaining tabs." : "Create new groups from the supplied tabs only."}
2. Group names: concise, specific, in ${languageName}.
3. Tabs that don't fit any group go to "${othersName}".
4. Each tab in exactly one group.
5. Output strictly valid JSON only, no explanation:

{"groups":[{"name":"Group name","tab_ids":[0,1,2]},{"name":"${othersName}","tab_ids":[3]}]}

The tab_ids correspond to the number after the domain slash (e.g. google.com/3 \u2192 tab_id is 3).`;
    return prompt;
  };

  const parseAIResponse = (content) => {
    let s = content.trim();
    if (!s) {
      console.warn("[TidyTabs] [AI] parseAIResponse: empty content");
      return null;
    }
    const m = s.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (m) s = m[1].trim();
    const first = s.indexOf("{"),
      last = s.lastIndexOf("}");
    if (first !== -1 && last !== -1) s = s.substring(first, last + 1);
    try {
      const parsed = JSON.parse(s);
      console.log("[TidyTabs] [AI] parseAIResponse success — groups:", parsed.groups?.length, "keys:", Object.keys(parsed));
      return parsed;
    } catch (e) {
      console.error("[TidyTabs] [AI] JSON parse error:", e.message, "Content:", s.substring(0, 200));
      return null;
    }
  };

  const validateAIGroups = (result) => {
    if (!result?.groups || !Array.isArray(result.groups)) {
      console.warn("[TidyTabs] [AI] validateAIGroups failed: missing or invalid 'groups' array. result keys:", result ? Object.keys(result) : "null");
      return false;
    }
    const invalid = result.groups.filter(
      (g) => !g.name || typeof g.name !== "string" || !Array.isArray(g.tab_ids)
    );
    if (invalid.length > 0) {
      console.warn("[TidyTabs] [AI] validateAIGroups failed:", invalid.length, "invalid group(s):", JSON.stringify(invalid));
      return false;
    }
    console.log("[TidyTabs] [AI] validateAIGroups passed —", result.groups.length, "groups");
    return true;
  };

  const mapAIResultsToGroups = (aiResult, tabs, existingStacks) => {
    return aiResult.groups
      .map((group) => {
        const existing = existingStacks.find((s) => s.name === group.name);
        return {
          name: group.name,
          tabs: group.tab_ids.map((id) => tabs[id]).filter(Boolean),
          stackId: existing ? existing.id : crypto.randomUUID(),
          isExisting: !!existing,
        };
      })
      .filter((g) => g.isExisting || g.tabs.length > 1);
  };

  const handleOrphanTabs = (groupedTabs, tabs, existingStacks = []) => {
    const grouped = new Set();
    groupedTabs.forEach((g) => g.tabs.forEach((t) => grouped.add(t.id)));
    const orphans = tabs.filter((t) => !grouped.has(t.id));
    if (orphans.length === 0) return;

    let othersGroup = groupedTabs.find((g) => OTHERS_NAMES.includes(g.name));
    if (othersGroup) {
      othersGroup.tabs.push(...orphans);
    } else {
      const existing = existingStacks.find((s) =>
        OTHERS_NAMES.includes(s.name)
      );
      if (existing) {
        groupedTabs.push({
          name: existing.name,
          tabs: orphans,
          stackId: existing.id,
          isExisting: true,
        });
      } else if (orphans.length > 0) {
        groupedTabs.push({
          name: getOthersName(),
          tabs: orphans,
          stackId: crypto.randomUUID(),
          isExisting: false,
        });
      }
    }
  };

  const applyProviderPayloadOptions = (payload) => {
    if (AI_CONFIG.apiEndpoint?.includes("openrouter.ai")) {
      payload.include_reasoning = false;
    } else {
      payload.thinking = { type: "disabled" };
    }
    return payload;
  };

  const getAIGrouping = async (tabs, existingStacks = []) => {
    console.log("[TidyTabs] [AI] getAIGrouping called — tabs:", tabs.length, "existingStacks:", existingStacks.length, "apiKey configured:", !!AI_CONFIG.apiKey);

    if (!AI_CONFIG.apiKey) {
      console.warn("[TidyTabs] [AI] Skipped — no API key configured. Will fall back to domain grouping.");
      showToast("AI API key Unconfigured", {
        type: "error",
        button: { text: "Go to Settings", action: openSettings },
      });
      return null;
    }
    if (tabs.length > CONFIG.maxTabsForAI)
      tabs = tabs.slice(0, CONFIG.maxTabsForAI);

    const languageName = getLanguageName(getBrowserLanguage());

    let timeoutId = null;

    try {
      const controller =
        AI_CONFIG.timeout > 0 ? new AbortController() : null;
      timeoutId =
        AI_CONFIG.timeout > 0
          ? setTimeout(() => controller.abort(), AI_CONFIG.timeout)
          : null;

      const promptText = buildAIPrompt(tabs, existingStacks, languageName);

      const payload = applyProviderPayloadOptions({
        model: AI_CONFIG.model,
        messages: [
          {
            role: "user",
            content: promptText,
          },
        ],
        temperature: AI_CONFIG.temperature,
        max_tokens: AI_CONFIG.maxTokens,
        stream: false,
        response_format: { type: "json_object" },
      });
      console.log("[TidyTabs] [AI] Sending request...");
      const response = await fetch(AI_CONFIG.apiEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AI_CONFIG.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://github.com/Gershom-Chen/VivaldiModpack",
          "X-Title": "Vivaldi TidyTabs",
        },
        body: JSON.stringify(payload),
        signal: controller?.signal,
      });

      if (timeoutId) clearTimeout(timeoutId);

      console.log("[TidyTabs] [AI] Response status:", response.status);

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      if (data?.error) throw new Error(`API error: ${data.error.message || JSON.stringify(data.error)}`);

      const msg = data.choices?.[0]?.message || {};
      // Try content first, then reasoning_content (DeepSeek reasoning models put output there),
      // then check if content was cut off (finish_reason === "length" means max_tokens exceeded)
      let raw = msg.content || "";
      if (!raw && msg.reasoning_content) {
        console.log("[TidyTabs] [AI] content is empty, attempting to extract JSON from reasoning_content");
        raw = msg.reasoning_content;
      }
      if (!raw) {
        console.warn("[TidyTabs] [AI] Both content and reasoning_content are empty. finish_reason:", data.choices?.[0]?.finish_reason, "usage:", JSON.stringify(data.usage));
        // If model hit token limit, the JSON was never generated — return null to fall back
        return null;
      }

      debugLog("[TidyTabs] [AI] Raw output (first 500 chars):", raw.substring(0, 500));
      debugLog("[TidyTabs] [AI] finish_reason:", data.choices?.[0]?.finish_reason, "completion_tokens:", data.usage?.completion_tokens);
      const cleaned = raw.replace(/<(thought|reasoning)>[\s\S]*?<\/\1>/gi, "").trim();
      const result = parseAIResponse(cleaned);
      debugLog("[TidyTabs] [AI] Parsed result:", JSON.stringify(result));
      if (!result) {
        console.warn("[TidyTabs] [AI] parseAIResponse returned null. Will fall back to domain grouping.");
        return null;
      }
      if (!validateAIGroups(result)) {
        console.warn("[TidyTabs] [AI] validateAIGroups failed. Result structure:", JSON.stringify(result));
        return null;
      }

      const groups = mapAIResultsToGroups(result, tabs, existingStacks);
      debugLog("[TidyTabs] [AI] Mapped groups:", groups.map(g => ({ name: g.name, tabCount: g.tabs.length, isExisting: g.isExisting })));
      handleOrphanTabs(groups, tabs, existingStacks);
      const final = groups.length > 0 ? groups : null;
      return final;
    } catch (error) {
      console.error("[TidyTabs] [AI] Error:", error.message);
      showToast(`AI call failed: ${error.message}`, {
        type: "error",
        copyText: error.message,
      });
      return null;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  };

  const groupByDomain = (tabs) => {
    console.log("[TidyTabs] [fallback] groupByDomain called — grouping", tabs.length, "tabs by hostname only (no AI)");
    const byHost = {};
    tabs.forEach((tab) => {
      const host = getHostname(tab.url);
      (byHost[host] ||= []).push(tab);
    });
    const groups = Object.entries(byHost)
      .filter(([, t]) => t.length > 1)
      .map(([, t]) => {
        const base = getBaseDomain(t[0].url).split(".")[0];
        return {
          name: base.charAt(0).toUpperCase() + base.slice(1),
          tabs: t,
          stackId: crypto.randomUUID(),
          isExisting: false,
        };
      });
    console.log("[TidyTabs] [fallback] groupByDomain result:", groups.map(g => ({ name: g.name, tabCount: g.tabs.length })));
    return groups;
  };

  const generateStackName = async (tabs) => {
    const languageName = getLanguageName(getBrowserLanguage());
    const tabInfo = tabs.map((t, i) =>
      `${i + 1}. [${getHostname(t.url || "")}] ${t.title || "Untitled"}`
    ).join("\n");

    const prompt = `Name this browser tab group in 1-4 words. Be concise and specific.
Language: ${languageName}.

Tabs:
${tabInfo}

Return JSON strictly in this format, with no markdown backticks: {"name":"the group name"}`;

    try {
      const payload = applyProviderPayloadOptions({
        model: AI_CONFIG.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 128,
        stream: false,
        response_format: { type: "json_object" },
      });

      const controller = AI_CONFIG.timeout > 0 ? new AbortController() : null;
      const timeoutId = AI_CONFIG.timeout > 0
        ? setTimeout(() => controller.abort(), AI_CONFIG.timeout) : null;

      try {
        const response = await fetch(AI_CONFIG.apiEndpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${AI_CONFIG.apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/Gershom-Chen/VivaldiModpack",
            "X-Title": "Vivaldi TidyTabs",
          },
          body: JSON.stringify(payload),
          signal: controller?.signal,
        });

        const data = await response.json();
        if (!response.ok || data?.error) return null;

        const msg = data.choices?.[0]?.message || {};
        let raw = msg.content || "";
        if (!raw && msg.reasoning_content) raw = msg.reasoning_content;
        if (!raw) return null;

        const cleaned = raw.replace(/<(thought|reasoning)>[\s\S]*?<\/\1>/gi, "").trim();
        const m = cleaned.match(/\{[\s\S]*?\}/);
        if (m) {
          const parsed = JSON.parse(m[0]);
          if (parsed.name && typeof parsed.name === "string") return parsed.name.trim();
        }
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    } catch (e) {
      console.warn("[TidyTabs] Stack name generation failed:", e.message);
    }
    return null;
  };

  const renameUnnamedStacks = async () => {
    if (!AI_CONFIG.apiKey) return;

    const allTabs = await new Promise((resolve) => {
      chrome.tabs.query({ currentWindow: true }, resolve);
    });

    // Group tabs by their stack ID
    const stacksMap = {};
    for (const tab of allTabs) {
      if (!tab.vivExtData) continue;
      try {
        const viv = typeof tab.vivExtData === "string"
          ? JSON.parse(tab.vivExtData) : tab.vivExtData;
        if (viv.group && !tab.pinned && !viv.panelId) {
          if (!stacksMap[viv.group]) stacksMap[viv.group] = { tabs: [], hasName: false };
          stacksMap[viv.group].tabs.push(tab);
          if (viv.fixedGroupTitle) stacksMap[viv.group].hasName = true;
        }
      } catch (e) { console.warn("[TidyTabs] Failed to parse vivExtData:", e); }
    }

    // Rename stacks that have no fixedGroupTitle
    for (const [stackId, { tabs, hasName }] of Object.entries(stacksMap)) {
      if (hasName || tabs.length < 2) continue;

      const name = await generateStackName(tabs);
      if (!name) continue;

      for (const tab of tabs) {
        await updateTabProperties(tab.id, { fixedGroupTitle: name });
      }
      
      // Natively rename the tab stack in Vivaldi UI
      if (window.vivaldi?.tabsPrivate?.setGroupProperties) {
        try {
          await new Promise((resolve) => {
            window.vivaldi.tabsPrivate.setGroupProperties({ groupExtId: stackId, groupTitle: name }, () => {
              resolve();
            });
          });
        } catch (e) {
          console.warn("[TidyTabs] renameUnnamedStacks setGroupProperties threw:", e.message);
        }
      }

      console.log(`[TidyTabs] Named unnamed stack: "${name}" (${tabs.length} tabs)`);
    }
  };

  const colorUncoloredStacks = async () => {
    if (!CONFIG.enableStackColor) return;

    const allTabs = await new Promise((resolve) => {
      chrome.tabs.query({ currentWindow: true }, resolve);
    });

    const stacksMap = {};
    for (const tab of allTabs) {
      if (!tab.vivExtData) continue;
      try {
        const viv = typeof tab.vivExtData === "string"
          ? JSON.parse(tab.vivExtData) : tab.vivExtData;
        if (viv.group && !tab.pinned && !viv.panelId) {
          if (!stacksMap[viv.group]) stacksMap[viv.group] = { tabs: [], hasColor: false };
          stacksMap[viv.group].tabs.push(tab);
          if (viv.groupColor) stacksMap[viv.group].hasColor = true;
        }
      } catch (e) { console.warn("[TidyTabs] Failed to parse vivExtData:", e); }
    }

    for (const [stackId, { tabs, hasColor }] of Object.entries(stacksMap)) {
      if (hasColor || tabs.length < 2) continue;

      const color = randomStackColor();
      for (const tab of tabs) {
        await updateTabProperties(tab.id, { groupColor: color });
      }
      
      // Natively color the tab stack in Vivaldi UI
      if (window.vivaldi?.tabsPrivate?.setGroupProperties) {
        try {
          await new Promise((resolve) => {
            window.vivaldi.tabsPrivate.setGroupProperties({ groupExtId: stackId, groupColor: color }, () => {
              resolve();
            });
          });
        } catch (e) {
          console.warn("[TidyTabs] colorUncoloredStacks setGroupProperties threw:", e.message);
        }
      }

      console.log(`[TidyTabs] Colored stack ${stackId.slice(0, 8)}... → ${color}`);
    }
  };

  // Add tabs to an existing named stack (without recreating it)
  const addTabsToExistingStack = async (groupId, groupName, newTabs) => {
    if (!newTabs.length) return;
    // Get existing stack tabs to find target position
    const allTabs = await new Promise((r) => chrome.tabs.query({ currentWindow: true }, r));
    const existingTabs = allTabs.filter((t) => {
      try {
        const viv = typeof t.vivExtData === "string" ? JSON.parse(t.vivExtData) : (t.vivExtData || {});
        return viv.group === groupId;
      } catch (_) { return false; }
    });
    const targetTab = existingTabs[existingTabs.length - 1] || newTabs[0];
    if (!targetTab) return;

    // Move new tabs adjacent to the existing stack (right after the last tab)
    const targetIndex = targetTab.index;
    for (let i = 0; i < newTabs.length; i++) {
      await new Promise((resolve) => {
        chrome.tabs.move(newTabs[i].id, { index: targetIndex + 1 + i }, () => {
          if (chrome.runtime.lastError) console.warn("[TidyTabs] move failed:", chrome.runtime.lastError.message);
          resolve();
        });
      });
    }
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Re-group: move all tabs (existing + new) together to recreate the stack
    const allIds = [...existingTabs.map((t) => t.id), ...newTabs.map((t) => t.id)];
    const firstId = existingTabs[0]?.id || newTabs[0]?.id;
    if (vivaldi?.tabsPrivate?.move && allIds.length >= 2) {
      try {
        const newGroupId = await new Promise((resolve) => {
          const promiseOrVal = vivaldi.tabsPrivate.move({
            tabIds: allIds,
            target: firstId,
            tweaks: ["do-not-reparent", "create-new-group", "target-is-tab"],
            debug: "TidyTabs.addToExisting"
          }, (res) => resolve(chrome.runtime.lastError ? null : (res?.group || null)));
          if (promiseOrVal && typeof promiseOrVal.then === "function") {
            promiseOrVal.then((res) => resolve(res?.group || null));
          }
        });
        // Re-apply group properties if group was recreated
        if (newGroupId && groupName && vivaldi?.tabsPrivate?.setGroupProperties) {
          vivaldi.tabsPrivate.setGroupProperties({ groupExtId: String(newGroupId), groupTitle: groupName }, () => {});
        }
        // Update vivExtData for new tabs
        for (const tab of newTabs) {
          await updateTabProperties(tab.id, {
            group: newGroupId || groupId,
            fixedGroupTitle: groupName,
            tidyStackOwner: TIDY_TABS_STACK_OWNER,
            tidyStackId: newGroupId || groupId,
          });
        }
        console.log(`[TidyTabs] [stacks] Added ${newTabs.length} tabs to stack "${groupName}"`);
      } catch (e) {
        console.warn("[TidyTabs] [stacks] Failed to add tabs to existing stack:", e.message);
      }
    }
  };

  // ==================== Tab Stack Operations ====================

  const createTabStacks = async (groups) => {
    let lastColor = "";
    for (const group of groups) {
      const color = group.isExisting ? null : (CONFIG.enableStackColor ? randomStackColor(lastColor) : null);
      if (color) lastColor = color;
      group.tabs.sort((a, b) => a.index - b.index);
      const targetIndex = group.tabs[0].index;

      // 1. Move all tabs in this group to be adjacent first
      for (let i = 0; i < group.tabs.length; i++) {
        const tab = group.tabs[i];
        await new Promise((resolve) => {
          chrome.tabs.move(tab.id, { index: targetIndex + i }, () => {
            if (chrome.runtime.lastError)
              console.error("[TidyTabs]", chrome.runtime.lastError.message);
            resolve();
          });
        });
      }

      // 2. Wait for Vivaldi React UI to settle and process the moves
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 3. Group tabs natively using Vivaldi's private tabsPrivate.move stacking API
      const tabIds = group.tabs.map((t) => t.id);
      debugLog(`[TidyTabs] Grouping tabIds natively via tabsPrivate.move:`, JSON.stringify(tabIds));
      
      const vivaldiGroupId = await new Promise(async (resolve) => {
        try {
          const params = {
            tabIds: tabIds,
            target: tabIds[0],
            tweaks: ["do-not-reparent", "create-new-group", "target-is-tab"],
            debug: "TidyTabs.createTabStack"
          };
          
          const promiseOrVal = window.vivaldi.tabsPrivate.move(params, (res) => {
            if (chrome.runtime.lastError) {
              console.error("[TidyTabs] tabsPrivate.move callback error:", chrome.runtime.lastError.message);
              resolve(null);
            } else {
              console.log("[TidyTabs] tabsPrivate.move callback success, native group ID =", res?.group);
              resolve(res?.group || null);
            }
          });
          
          if (promiseOrVal && typeof promiseOrVal.then === "function") {
            const res = await promiseOrVal;
            console.log("[TidyTabs] tabsPrivate.move promise success, native group ID =", res?.group);
            resolve(res?.group || null);
          }
        } catch (err) {
          console.error("[TidyTabs] tabsPrivate.move exception:", err.message);
          resolve(null);
        }
      });

      // 4. Update the tabs metadata (ext_id, parent_ext_id, tidyStackOwner, etc.) for compatibility with custom scripts
      if (vivaldiGroupId !== null) {
        // Set group title and color natively via vivaldi.tabsPrivate.setGroupProperties
        if (window.vivaldi?.tabsPrivate?.setGroupProperties) {
          try {
            await new Promise((resolve) => {
              const gIdStr = String(vivaldiGroupId);
              window.vivaldi.tabsPrivate.setGroupProperties({ groupExtId: gIdStr, groupTitle: group.name }, () => {
                if (chrome.runtime.lastError) {
                  console.warn("[TidyTabs] Native setGroupProperties for title failed:", chrome.runtime.lastError.message);
                } else {
                  console.log("[TidyTabs] Native group title set successfully:", group.name);
                }
                if (color) {
                  window.vivaldi.tabsPrivate.setGroupProperties({ groupExtId: gIdStr, groupColor: color }, () => {
                    if (chrome.runtime.lastError) {
                      console.warn("[TidyTabs] Native setGroupProperties for color failed:", chrome.runtime.lastError.message);
                    } else {
                      console.log("[TidyTabs] Native group color set successfully:", color);
                    }
                    resolve();
                  });
                } else {
                  resolve();
                }
              });
            });
          } catch (e) {
            console.warn("[TidyTabs] setGroupProperties threw exception:", e.message);
          }
        }

        // Apply metadata sequentially
        let parentExtId = "";
        for (let i = 0; i < group.tabs.length; i++) {
          const tab = group.tabs[i];
          const isParent = i === 0;
          
          if (isParent) {
            parentExtId = await addTabToStack(tab.id, String(vivaldiGroupId), group.name, color, null);
          } else {
            await addTabToStack(tab.id, String(vivaldiGroupId), group.name, color, parentExtId);
          }
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      } else {
        // Safe Fallback: if tabsPrivate.move is not supported or failed, fall back to our metadata writes
        console.warn("[TidyTabs] Stacking failed, falling back to metadata writes.");
        const stackId = group.stackId || crypto.randomUUID();
        let parentExtId = "";
        for (let i = 0; i < group.tabs.length; i++) {
          const tab = group.tabs[i];
          const isParent = i === 0;
          
          if (isParent) {
            parentExtId = await addTabToStack(tab.id, stackId, group.name, color, null);
          } else {
            await addTabToStack(tab.id, stackId, group.name, color, parentExtId);
          }
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      }
    }
  };

  const moveGroupToEnd = async (group) => {
    if (!group || !group.tabs.length) return;
    const allTabs = await new Promise((r) =>
      chrome.tabs.query({ currentWindow: true }, r)
    );
    const targetIndex = allTabs.length;
    for (let i = 0; i < group.tabs.length; i++) {
      await new Promise((resolve) => {
        chrome.tabs.move(group.tabs[i].id, { index: targetIndex + i }, () => {
          if (chrome.runtime.lastError)
            console.error("[TidyTabs]", chrome.runtime.lastError.message);
          resolve();
        });
      });
    }
  };

  const detectExistingStacks = async (nextElement) => {
    const stacks = [];
    while (nextElement) {
      if (nextElement.tagName === "SPAN") {
        const isStack =
          nextElement.querySelector(SELECTORS.STACK_COUNTER) ||
          nextElement.querySelector(SELECTORS.TAB_STACK) ||
          nextElement.querySelector(SELECTORS.SUBSTACK);

        if (isStack) {
          const wrapper = nextElement.querySelector(SELECTORS.TAB_WRAPPER);
          const stackTabId = wrapper
            ?.getAttribute("data-id")
            ?.replace("tab-", "");
          if (stackTabId) {
            const allTabs = await new Promise((r) =>
              chrome.tabs.query({ currentWindow: true }, r)
            );
            const stackTab = allTabs.find((t) => {
              try {
                const d = JSON.parse(t.vivExtData || "{}");
                return d.group && t.vivExtData.includes(stackTabId.slice(0, 8));
              } catch {
                return false;
              }
            });
            if (stackTab) {
              const viv = JSON.parse(stackTab.vivExtData);
              stacks.push({
                id: viv.group,
                name: viv.fixedGroupTitle || stackTab.title || "Unnamed",
                tabId: stackTab.id,
              });
            }
          }
        }
      }
      nextElement = nextElement.nextElementSibling;
    }
    return stacks;
  };

  const collectTabsFromSeparator = async (separator) => {
    const tabs = [];
    const seenTabIds = new Set();
    const allTabs = await new Promise((resolve) => {
      chrome.tabs.query({ currentWindow: true }, (queriedTabs) => {
        resolve(chrome.runtime.lastError ? [] : queriedTabs);
      });
    });
    const allTabsWithViv = allTabs.map((tab) => {
      let vivExtData = {};
      try {
        vivExtData = tab.vivExtData
          ? JSON.parse(tab.vivExtData)
          : {};
      } catch (e) { console.warn("[TidyTabs] Failed to parse vivExtData:", e); }
      return { ...tab, vivExtData };
    });

    const addTabId = (tabId) => {
      if (!Number.isInteger(tabId) || seenTabIds.has(tabId)) return;
      const tab = allTabsWithViv.find((item) => item.id === tabId);
      if (!tab || tab.pinned || tab.vivExtData.panelId) return;
      seenTabIds.add(tabId);
      tabs.push({ id: tabId });
    };

    const getStackGroupId = (element) => {
      const wrapper = element.querySelector(SELECTORS.TAB_WRAPPER);
      const stackDomId = wrapper
        ?.getAttribute("data-id")
        ?.replace("tab-", "");
      if (!stackDomId) return "";

      const exact = allTabsWithViv.find((tab) => tab.vivExtData.group === stackDomId);
      if (exact) return exact.vivExtData.group;

      const shortId = stackDomId.slice(0, 8);
      const matched = allTabsWithViv.find((tab) => {
        const group = tab.vivExtData.group;
        return typeof group === "string" && group.includes(shortId);
      });
      return matched?.vivExtData.group || "";
    };

    let el = separator.nextElementSibling;
    while (el) {
      if (el.tagName === "SPAN") {
        const isStack =
          el.querySelector(SELECTORS.STACK_COUNTER) ||
          el.querySelector(SELECTORS.TAB_STACK) ||
          el.querySelector(SELECTORS.SUBSTACK);
        const pos = el.querySelector(SELECTORS.TAB_POSITION);
        if (isStack) {
          const stackId = getStackGroupId(el);
          allTabsWithViv
            .filter((tab) =>
              tab.vivExtData.group === stackId &&
              !tab.pinned &&
              !tab.vivExtData.panelId
            )
            .sort((a, b) => a.index - b.index)
            .forEach((tab) => addTabId(tab.id));
        } else if (pos && !pos.classList.contains(CLASSES.PINNED)) {
          const wrapper = el.querySelector(SELECTORS.TAB_WRAPPER);
          const id = wrapper?.getAttribute("data-id");
          if (id) {
            const num = parseInt(id.replace("tab-", ""));
            if (!isNaN(num)) addTabId(num);
          }
        }
      }
      el = el.nextElementSibling;
    }
    return tabs;
  };

  const isTabStack = (element) => {
    const tabPosition = element.querySelector(SELECTORS.TAB_POSITION);
    return (
      tabPosition?.classList.contains(CLASSES.SUBSTACK) ||
      element.querySelector(SELECTORS.TAB_STACK) !== null
    );
  };

  const isTabActive = (tabPosition) =>
    tabPosition.querySelector(SELECTORS.ACTIVE) !== null;

  const extractTabId = (tabWrapper) => {
    if (!tabWrapper) return null;
    const dataId = tabWrapper.getAttribute("data-id");
    if (!dataId) return null;
    const numericId = Number.parseInt(dataId.replace("tab-", ""), 10);
    return Number.isNaN(numericId) ? null : numericId;
  };

  const collectTabsToClose = (separator) => {
    const tabIds = [];
    let element = separator.nextElementSibling;

    while (element) {
      if (element.tagName === "SPAN") {
        if (isTabStack(element)) {
          element = element.nextElementSibling;
          continue;
        }

        const tabPosition = element.querySelector(SELECTORS.TAB_POSITION);
        if (
          tabPosition &&
          !tabPosition.classList.contains(CLASSES.PINNED) &&
          !isTabActive(tabPosition)
        ) {
          const tabId = extractTabId(
            element.querySelector(SELECTORS.TAB_WRAPPER)
          );
          if (tabId !== null) {
            tabIds.push(tabId);
          }
        }
      }
      element = element.nextElementSibling;
    }

    return tabIds;
  };

  const closeTabsBelow = (separator) => {
    const tabIds = collectTabsToClose(separator);
    if (tabIds.length === 0) return;

    chrome.tabs.remove(tabIds, () => {
      if (chrome.runtime.lastError) {
        console.error("[TidyTabs]", chrome.runtime.lastError.message);
        return;
      }
      scheduleAttachButtons(CONFIG.delays.reattach);
    });
  };

  // ==================== UI Components ====================

  const createTidyButton = () => {
    const btn = document.createElement("div");
    btn.className = CLASSES.TIDY_BUTTON;
    btn.textContent = "Tidy";
    return btn;
  };

  const createClearButton = () => {
    const btn = document.createElement("div");
    btn.className = CLASSES.CLEAR_BUTTON;
    btn.textContent = "Clear";
    return btn;
  };

  const scheduleAttachButtons = (delay = CONFIG.delays.debounce) => {
    if (debounceTimer !== null) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      attachButtons();
      debounceTimer = null;
    }, delay);
  };

  const ensureSeparatorButton = (separator, className, factory, onClick) => {
    let button = separator.querySelector(`.${className}`);
    if (button) return button;
    button = factory();
    separator.appendChild(button);
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      onClick(separator);
    });
    return button;
  };

  const decorateSeparator = (separator) => {
    ensureSeparatorButton(
      separator,
      CLASSES.TIDY_BUTTON,
      createTidyButton,
      tidyTabsBelow
    );
    ensureSeparatorButton(
      separator,
      CLASSES.CLEAR_BUTTON,
      createClearButton,
      closeTabsBelow
    );
    const key = getSeparatorKey(separator);
    separator.classList.toggle(CLASSES.LOADING, Boolean(key && processingSeparators.has(key)));
  };

  const attachButtons = () => {
    document.querySelectorAll(SELECTORS.SEPARATOR).forEach((separator) => {
      decorateSeparator(separator);
    });
    injectStackActionButtons();
  };

  // ==================== Stack Action Buttons (Pin / Close Stack) ====================

  const STACK_BTN = {
    EDIT: "tidy-edit-stack-btn",
    UNSTACK: "tidy-unstack-stack-btn",
    PIN: "tidy-pin-stack-btn",
    CLOSE: "tidy-close-stack-btn",
  };

  const getStackTabIds = async (tabId) => {
    try {
      const tab = await getTab(tabId);
      if (!tab) return [];
      const { group: groupId } = parseVivExtData(tab);
      if (!groupId) return [];
      const allTabs = await new Promise((r) => chrome.tabs.query({ currentWindow: true }, r));
      return allTabs.filter((t) => {
        try { return parseVivExtData(t).group === groupId; } catch (_) { return false; }
      }).map((t) => t.id);
    } catch (_) { return []; }
  };

  // Shared unstack helper — hoisted function so all callers can use it
  async function _unstackGroup(groupId) {
    if (!groupId || !vivaldi?.tabsPrivate?.unstack) return;
    try {
      const result = vivaldi.tabsPrivate.unstack(groupId);
      if (result && typeof result.then === "function") await result;
    } catch (_) { /* non-critical */ }
  }

  const togglePinTabStack = async (tabId, pinBtn) => {
    const stackIds = await getStackTabIds(tabId);
    if (stackIds.length === 0) return;
    const tab = await getTab(tabId);
    const isPinned = tab?.pinned;
    const groupId = tab?.vivExtData?.group;
    const stackName = tab?.vivExtData?.fixedGroupTitle || "";
    const isSuggestedPin = SUGGESTED_PIN_NAMES.includes(stackName);
    const newPinned = !isPinned;

    await Promise.all(stackIds.map((id) =>
      new Promise((r) => chrome.tabs.update(id, { pinned: newPinned }, r))
    ));

    if (newPinned) {
      if (isSuggestedPin) await _unstackGroup(groupId);
      showToast(`📌 Pinned ${stackIds.length} tabs${isSuggestedPin ? "" : " (stack kept)"}`, { type: "success" });
    } else {
      showToast(`Unpinned ${stackIds.length} tabs`, { type: "success" });
    }

    // Update button visual state directly — no DOM query needed
    if (pinBtn) {
      pinBtn.classList.toggle("is-pinned", newPinned);
      pinBtn.title = newPinned ? "Unpin tab stack" : "Pin tab stack";
    }
  };

  const closeEntireStack = async (tabId) => {
    const stackIds = await getStackTabIds(tabId);
    if (stackIds.length === 0) return;
    await new Promise((r) => chrome.tabs.remove(stackIds, r));
    showToast(`Closed ${stackIds.length} tabs`, { type: "success" });
  };

  const unstackTabStack = async (tabId) => {
    const tab = await getTab(tabId);
    const groupId = tab?.vivExtData?.group;
    if (!groupId) return;
    const freed = await dismantleStack(groupId);
    showToast(`Dissolved stack, ${freed.length} tabs kept`, { type: "success" });
  };

  const editStackProperties = (groupId) => {
    // Walk React fiber tree from .tab-strip to trigger Vivaldi's native StackEditor
    if (!groupId) return;
    const tabStrip = document.querySelector(".tab-strip");
    if (!tabStrip) return;
    const fiberKey = Object.keys(tabStrip).find((k) => k.startsWith("__reactFiber$") || k.startsWith("__reactInternalInstance$"));
    if (!fiberKey) return;

    let fiber = tabStrip[fiberKey];
    for (let depth = 0; fiber && depth < 50; depth++, fiber = fiber.return) {
      if (fiber.stateNode && typeof fiber.stateNode.setAwaitingEdit === "function") {
        fiber.stateNode.setAwaitingEdit(groupId, true);
        return;
      }
    }
  };

  const injectStackActionButtons = async () => {
    const stackEls = document.querySelectorAll(`${SELECTORS.SUBSTACK}`);
    debugLog("[TidyTabs] [buttons] injectStackActionButtons: found", stackEls.length, "stack elements");
    if (!stackEls.length) return;

    // Pre-fetch all tabs once to map ext_id → tab.id for stack elements
    const allTabs = await new Promise((r) => chrome.tabs.query({ currentWindow: true }, r));
    const extIdToTabId = new Map();
    const groupToTabMap = new Map(); // group → first tab.id
    for (const t of allTabs) {
      try {
        const viv = parseVivExtData(t);
        if (viv.ext_id) extIdToTabId.set(viv.ext_id, t.id);
        if (viv.group && !groupToTabMap.has(viv.group)) groupToTabMap.set(viv.group, t.id);
      } catch (_) { /* skip */ }
    }
    debugLog("[TidyTabs] [buttons] extIdToTabId map size:", extIdToTabId.size, "groupToTabMap size:", groupToTabMap.size);

    for (const stackEl of stackEls) {
      if (stackEl.querySelector(`.${STACK_BTN.PIN}`)) continue;

      const tabWrapper = stackEl.querySelector(SELECTORS.TAB_WRAPPER);
      if (!tabWrapper) continue;
      const dataId = tabWrapper.getAttribute("data-id")?.replace("tab-", "");
      const elementId = tabWrapper.getAttribute("id")?.replace("tab-", "");
      if (!dataId && !elementId) continue;

      const uuid = dataId || elementId;
      let tabId = Number(uuid);
      if (!Number.isFinite(tabId) || tabId <= 0) {
        tabId = extIdToTabId.get(uuid);
        if (!tabId) {
          for (const t of allTabs) {
            try {
              const viv = parseVivExtData(t);
              if (viv.ext_id === uuid || viv.group === uuid) { tabId = t.id; break; }
            } catch (_) { /* skip */ }
          }
        }
      }
      if (!Number.isFinite(tabId) || tabId <= 0) continue;

      const isPinned = allTabs.find((t) => t.id === tabId)?.pinned || false;
      const tabData = allTabs.find((t) => t.id === tabId);
      const groupId = tabData ? parseVivExtData(tabData).group : null;
      const tabHeader = stackEl.querySelector(".tab-header");
      const stackCounter = stackEl.querySelector(SELECTORS.STACK_COUNTER);
      if (!tabHeader) continue;

      const block = (e) => { e.stopPropagation(); e.preventDefault(); };
      const btnContainer = document.createElement("span");
      btnContainer.className = "tidy-stack-actions";

      const PIN_ICON = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABGUlEQVR4nO2UvWoCURCFvxDskk4X0scmVYpg5wNY2fsCYl4ghdhYWecN8gDxCezyBP6AnaCNTSQRLIKQKANHGJZNXPenigeW3b137jecmeHCf1YLCPKCPwI7YJxXkgCY5ZXkAngCvpXAnilwkwX8CngV1BJ0Bc/Eya0gBlsDda0bdJLEiZ+SGvAhiMHKodi2K1csJ35Kuq7efeA6FFsFtsAPMFecnf9TgSvHTgk6arCXlWOpmJ7OmfNY8kk+gfvQfgF40/4AuCSBSsBIEOvBg9t71vpCcYl153rwLicN/X8BlTTwIjB0fbD3Ctjou5kVfCgnvvEvaeClELwY0ZPE18Nv8KjpOjrvp8IPOmnevUYx4KmUK/wsorQHoDJfgvBzBQEAAAAASUVORK5CYII=" alt="pin" width="12" height="12">';
      const UNSTACK_ICON = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAABVklEQVR4nO2YQWrCQBiFX8xBWvQOehM9SjcW3Nmd1k1X9Qz2GvEK3SoeoJUuhMiUP/CTjjKx8zJE/g8GEknemy8xIQlgGK3QA7AC8AXgVdY705EBeANQqrGOLJGxOnzBsSUyVse14FgSGasjJPi/ErQOt+F7LSBkvYkEtWN5YUf9m28CiwYC1I7jBWsd5DuK3w0EqB0vAH7EVp+yenhVsJDt5w0E2uj4gy88NiWzwwQCKE3gCiYQQGkC9yxwUuE5IT9X+a4rOntV0CfkD1T+jpCPD1UwJeQ/q/wNIR+T2kPVMGL2SDKr/DEIuIeqbU1iKqf+lmvC7TOQI68nX5A+GvzyCODgeWOKNQ4AHliT1xIFYfKFZLdCT66Jjdwx9C02dLh9dpIxZv5tbmWmJuuWO8fMBBJjAqkxgdSYQGpMIDUmkBoTSM2TEnDLnaMP4FMG4zOMYSACZ6f6URZiN6bcAAAAAElFTkSuQmCC" alt="split" width="12" height="12">';
      const EDIT_ICON = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAABVUlEQVR4nO2ZMU7DMBSGvwzkGOUa7GUAJi6DYIIJDkBRVS4Ct2CDsYXCiih7pYcieTIJJH7PMUjvk96UyP4/x44jBxzHcZzvVMAF8AE8AXso2QUWwCuwBURZK+Dwh/A30f2PmvD7wKdB6LiawegTvql3zcjnCN8mUAGzjnvPUwUWmcIvgYOe4WfhehLrqLETYAdbqlzhaVmwNf8oPC2NWtKEu+4If2sRPqfAKOFzCYwWPofAqOGtBYYs2CPgLVTXjj2qwNCRX0V7RlGBlGkjVk9e21DqnJe/IKBZsFJaQPu2kdICx8rPAyktcKV8z0tpgXvlJiWlBR6AO+AyTKehO6yUFtAiLhBwgUTEBQIukIi4wEjHKm3UUZ9NBqwOtk4zS9TAWdTns6bBXEeLQ2quEch5uNunNsAEJdNCEpvQtwmT8ChfjH5wdNU29DG3GHnHcRyH3/gCgfr8P+7Sf1YAAAAASUVORK5CYII=" alt="edit" width="12" height="12">';
      const CLOSE_ICON = '<svg width="10" height="10" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 11.708-.708L8 7.293l5.146-5.147a.5.5 0 01.708.708L8.707 8l5.147 5.146a.5.5 0 01-.708.708L8 8.707l-5.146 5.147a.5.5 0 01-.708-.708L7.293 8 2.146 2.854z" fill="currentColor"/></svg>';

      // Button factory — data-driven to avoid copy-paste
      const makeBtn = (cls, title, html, handler) => {
        const btn = document.createElement("span");
        btn.className = cls;
        btn.title = title;
        btn.innerHTML = html;
        btn.addEventListener("mousedown", block);
        btn.addEventListener("click", (e) => { block(e); handler(); });
        return btn;
      };

      let pinBtn;
      const buttons = [
        makeBtn(STACK_BTN.EDIT, "Edit stack name / color", EDIT_ICON, () => editStackProperties(groupId)),
        makeBtn(STACK_BTN.UNSTACK, "Dissolve tab stack", UNSTACK_ICON, () => unstackTabStack(tabId)),
      ];
      // Pin button needs special handling (toggle state, pass ref for live update)
      pinBtn = document.createElement("span");
      pinBtn.className = STACK_BTN.PIN;
      pinBtn.title = isPinned ? "Unpin tab stack" : "Pin tab stack";
      if (isPinned) pinBtn.classList.add("is-pinned");
      pinBtn.innerHTML = PIN_ICON;
      pinBtn.addEventListener("mousedown", block);
      pinBtn.addEventListener("click", (e) => { block(e); togglePinTabStack(tabId, pinBtn); });
      buttons.push(pinBtn);
      buttons.push(makeBtn(STACK_BTN.CLOSE, "Close tab stack", CLOSE_ICON, () => closeEntireStack(tabId)));

      btnContainer.append(...buttons);
      if (stackCounter) stackCounter.before(btnContainer);
      else tabHeader.appendChild(btnContainer);
    }
  };

  // ==================== Core ====================

  const buildSpecialGroups = (pinTabs, closeTabs) => {
    const groups = [];
    if (pinTabs.length > 0) {
      groups.push({ name: getSuggestedPinName(), tabs: pinTabs, stackId: crypto.randomUUID(), isExisting: false, isSpecial: true });
    }
    if (closeTabs.length > 0) {
      groups.push({ name: getSuggestedCloseName(), tabs: closeTabs, stackId: crypto.randomUUID(), isExisting: false, isSpecial: true });
    }
    return groups;
  };

  const autoStackWorkspace = async (workspaceId) => {
    if (!(await isAutoStackAllowed(workspaceId))) return;
    const tabs = await getTabsByWorkspace(workspaceId);
    if (tabs.length < 2) return;

    console.log("[TidyTabs] [decision] autoStackWorkspace — enableAIGrouping:", CONFIG.enableAIGrouping, "apiKey:", !!AI_CONFIG.apiKey, "tabs:", tabs.length);

    // Step 1: Extract special stacks (建议固定, 建议关闭)
    const ageData = await loadTabAgeData();
    const frequentUrls = await getFrequentUrls();
    const suggestedPinTabs = findSuggestedPinTabs(tabs, ageData, frequentUrls);
    const remainingAfterPin = suggestedPinTabs.length
      ? tabs.filter((t) => !suggestedPinTabs.find((p) => p.id === t.id))
      : tabs;
    const suggestedCloseTabs = await findSuggestedCloseTabs(remainingAfterPin);
    const remainingTabs = suggestedCloseTabs.length
      ? remainingAfterPin.filter((t) => !suggestedCloseTabs.find((c) => c.id === t.id))
      : remainingAfterPin;

    // Step 2: Build special groups
    const specialGroups = buildSpecialGroups(suggestedPinTabs, suggestedCloseTabs);

    // Step 3: AI-group remaining tabs
    let aiGroups = null;
    if (remainingTabs.length >= 2) {
      aiGroups =
        CONFIG.enableAIGrouping && AI_CONFIG.apiKey
          ? (await getAIGrouping(remainingTabs))
          : null;
    }
    if (!aiGroups) {
      if (remainingTabs.length >= 2) {
        aiGroups = groupByDomain(remainingTabs);
        handleOrphanTabs(aiGroups, remainingTabs);
      } else {
        // Single remaining tab — put it in Others
        aiGroups = [];
        if (remainingTabs.length === 1) {
          aiGroups.push({ name: getOthersName(), tabs: remainingTabs, stackId: crypto.randomUUID(), isExisting: false });
        }
      }
    }

    // Step 4: Create stacks, then move special stacks to bottom
    const othersGroup = aiGroups.find((g) => OTHERS_NAMES.includes(g.name));
    const normalGroups = aiGroups.filter((g) => !OTHERS_NAMES.includes(g.name));
    const allGroups = [...normalGroups, ...specialGroups, ...(othersGroup ? [othersGroup] : [])];
    if (allGroups.length > 0) {
      await createTabStacks(allGroups);
      for (const g of [...specialGroups].reverse()) {
        await moveGroupToEnd(g);
      }
      if (othersGroup) await moveGroupToEnd(othersGroup);
      showToast(`Successfully grouped ${allGroups.length} stacks`, { type: "success" });
    }
  };

  const tidyTabsBelow = async (separator) => {
    const separatorKey = getSeparatorKey(separator);
    const tabsInfo = await collectTabsFromSeparator(separator);

    if (tabsInfo.length < 2) return;

    if (separatorKey) {
      processingSeparators.add(separatorKey);
      setSeparatorLoadingState(separatorKey, true);
    } else {
      separator.classList.add(CLASSES.LOADING);
    }

    try {
      const tabs = (
        await Promise.all(tabsInfo.map((t) => getTab(t.id)))
      ).filter(Boolean);
      if (tabs.length < 1) return;

      console.log("[TidyTabs] [decision] tidyTabsBelow — enableAIGrouping:", CONFIG.enableAIGrouping, "apiKey:", !!AI_CONFIG.apiKey, "tabs:", tabs.length);

      // Step 0: Handle existing stacks — dismantle unnamed, preserve named
      let namedStacks = detectNamedStacks(tabs);
      const unnamedIds = findUnnamedStackIds(tabs);
      let pool = tabs;
      if (unnamedIds.length > 0) {
        console.log("[TidyTabs] [stacks] Dismantling", unnamedIds.length, "unnamed stack(s)");
        for (const gid of unnamedIds) await dismantleStack(gid);
        // Re-fetch tabs after dismantling (vivExtData.group may be cleared)
        const refreshed = (await Promise.all(pool.map((t) => getTab(t.id)))).filter(Boolean);
        pool = refreshed;
      }
      // Exclude tabs in named stacks from the grouping pool
      if (namedStacks.length > 0) {
        const namedTabIds = new Set(namedStacks.flatMap((s) => s.tabIds));
        pool = pool.filter((t) => !namedTabIds.has(t.id));
        console.log("[TidyTabs] [stacks] Preserving", namedStacks.length, "named stack(s), excluding", namedTabIds.size, "tabs from pool. Pool size:", pool.length);
        for (const s of namedStacks) {
          console.log(`[TidyTabs] [stacks]   Named stack "${s.name}": tabs [${s.tabIds.join(",")}]`);
        }
      }

      // Step 1: Extract special stacks from pool AND from inside named stacks
      const ageData = await loadTabAgeData();
      const frequentUrls = await getFrequentUrls();

      // Scan pool tabs — PIN takes priority over CLOSE
      const suggestedPinTabs = findSuggestedPinTabs(pool, ageData, frequentUrls);
      const remainingAfterPin = suggestedPinTabs.length
        ? pool.filter((t) => !suggestedPinTabs.find((p) => p.id === t.id))
        : pool;
      const suggestedCloseTabs = await findSuggestedCloseTabs(remainingAfterPin);
      const remainingTabs = suggestedCloseTabs.length
        ? remainingAfterPin.filter((t) => !suggestedCloseTabs.find((c) => c.id === t.id))
        : remainingAfterPin;

      // Detect tabs that qualified for both PIN and CLOSE (PIN wins)
      if (suggestedPinTabs.length > 0) {
        const bothCheck = await findSuggestedCloseTabs(suggestedPinTabs);
        if (bothCheck.length > 0) {
          console.log("[TidyTabs] [scoring] ⚠️", bothCheck.length, "tab(s) qualify for both PIN & CLOSE → PIN takes priority:",
            bothCheck.map((t) => ({ id: t.id, title: (t.title || "").substring(0, 50) })));
        }
      }

      // Scan inside named stacks — extract tabs that should be closed or pinned
      if (namedStacks.length > 0) {
        const allNamedTabIds = new Set(namedStacks.flatMap((s) => s.tabIds));
        const namedTabs = tabs.filter((t) => allNamedTabIds.has(t.id));
        if (namedTabs.length > 0) {
          console.log("[TidyTabs] [stacks] Scanning", namedTabs.length, "tabs inside named stacks for close/pin suggestions...");
          const namedPin = findSuggestedPinTabs(namedTabs, ageData, frequentUrls);
          const namedClose = await findSuggestedCloseTabs(
            namedTabs.filter((t) => !namedPin.find((p) => p.id === t.id))
          );

          // Track which named stacks had tabs extracted
          const extractedIds = new Set([...namedPin.map((t) => t.id), ...namedClose.map((t) => t.id)]);
          const modifiedStackIds = new Set();

          for (const s of namedStacks) {
            const before = s.tabIds.length;
            s.tabIds = s.tabIds.filter((id) => !extractedIds.has(id));
            if (s.tabIds.length !== before) {
              modifiedStackIds.add(s.id);
              console.log(`[TidyTabs] [stacks]   "${s.name}": extracted ${before - s.tabIds.length} tabs, ${s.tabIds.length} remain`);
            }
          }

          // Dismantle modified stacks — put remaining tabs back in the pool
          for (const s of namedStacks) {
            if (!modifiedStackIds.has(s.id)) continue;
            await dismantleStack(s.id);
            for (const tabId of s.tabIds) {
              const t = namedTabs.find((nt) => nt.id === tabId);
              if (t && !remainingTabs.find((rt) => rt.id === t.id)) {
                remainingTabs.push(t);
              }
            }
          }

          // Remove dismantled stacks from namedStacks
          namedStacks = namedStacks.filter((s) => !modifiedStackIds.has(s.id));

          // Add extracted tabs to special categories
          if (namedPin.length > 0) {
            console.log("[TidyTabs] [stacks]   →", namedPin.length, "tabs moved to 建议固定");
            suggestedPinTabs.push(...namedPin);
          }
          if (namedClose.length > 0) {
            console.log("[TidyTabs] [stacks]   →", namedClose.length, "tabs moved to 建议关闭");
            suggestedCloseTabs.push(...namedClose);
          }
          console.log("[TidyTabs] [stacks] After scanning,", namedStacks.length, "named stacks remain, pool size:", remainingTabs.length + suggestedPinTabs.length + suggestedCloseTabs.length - namedPin.length - namedClose.length);
        }
      }

      // Step 2: Build special groups
      const specialGroups = buildSpecialGroups(suggestedPinTabs, suggestedCloseTabs);

      // Step 3: AI-group remaining tabs, passing named stacks so AI can add tabs to them
      // Build existingStacks for AI with existingTabIds for prompt
      const aiExistingStacks = namedStacks.map((s) => ({ id: s.id, name: s.name, existingTabIds: s.tabIds }));
      let aiGroups = null;
      if (remainingTabs.length >= 2) {
        aiGroups =
          CONFIG.enableAIGrouping && AI_CONFIG.apiKey
            ? (await getAIGrouping(remainingTabs, aiExistingStacks))
            : null;
      }
      if (!aiGroups) {
        if (remainingTabs.length >= 2) {
          console.log("[TidyTabs] [decision] AI grouping returned null, falling back to groupByDomain");
          aiGroups = groupByDomain(remainingTabs);
          handleOrphanTabs(aiGroups, remainingTabs, []);
        } else {
          aiGroups = [];
          if (remainingTabs.length === 1) {
            aiGroups.push({ name: getOthersName(), tabs: remainingTabs, stackId: crypto.randomUUID(), isExisting: false });
          }
        }
      } else {
        console.log("[TidyTabs] [decision] Using AI-generated groups:", aiGroups.map(g => g.name));
      }

      // Step 4: Combine — special groups first, then AI groups
      // Handle named stack groups: they need to merge into existing stacks, not create new ones
      const newAiGroups = [];
      for (const g of aiGroups) {
        if (g.isExisting) {
          // Tabs assigned by AI to an existing named stack — add them to it
          console.log("[TidyTabs] [stacks] Adding", g.tabs.length, "tabs to existing stack:", g.name);
          await addTabsToExistingStack(g.stackId, g.name, g.tabs);
        } else {
          newAiGroups.push(g);
        }
      }

      // Create all stacks, then move special stacks to bottom
      const othersGroup = newAiGroups.find((g) => OTHERS_NAMES.includes(g.name));
      const normalGroups = newAiGroups.filter((g) => !OTHERS_NAMES.includes(g.name));
      const allGroups = [...normalGroups, ...specialGroups, ...(othersGroup ? [othersGroup] : [])];
      if (allGroups.length > 0) {
        await createTabStacks(allGroups);
        // Move to bottom in order: 建议固定 → 建议关闭 → Others
        // Move to bottom: 建议固定 first, then 建议关闭, then Others last
        for (const g of specialGroups) {
          await moveGroupToEnd(g);
        }
        if (othersGroup) await moveGroupToEnd(othersGroup);
        showToast(`Successfully grouped ${allGroups.length} stacks`, { type: "success" });
      }

      // Name any existing stacks that lack fixedGroupTitle
      await renameUnnamedStacks();
      // Color any existing stacks that lack groupColor
      await colorUncoloredStacks();
    } finally {
      if (separatorKey) {
        processingSeparators.delete(separatorKey);
        setSeparatorLoadingState(separatorKey, false);
      } else {
        separator.classList.remove(CLASSES.LOADING);
      }
      scheduleAttachButtons(CONFIG.delays.reattach);
    }
  };

  // ==================== Event Listeners ====================

  const setupAutoStackListener = () => {
    if (!chrome.webNavigation) return;
    chrome.webNavigation.onCommitted.addListener(async (details) => {
      if (details.tabId !== -1 && details.frameType === "outermost_frame") {
        const tab = await getTab(details.tabId);
        if (tab && !tab.pinned && tab.vivExtData && !tab.vivExtData.panelId) {
          setTimeout(
            () => autoStackWorkspace(tab.vivExtData.workspaceId),
            CONFIG.delays.autoStack
          );
        }
      }
    });
  };

  // ==================== DOM Observers ====================

  let observedTabStrip = null;
  let tabStripObserver = null;

  // Listen to inner changes of .tab-strip (tab additions/deletions, workspace switching)
  const observeTabStripInner = (tabStrip) => {
    if (tabStripObserver) tabStripObserver.disconnect();
    observedTabStrip = tabStrip;

    tabStripObserver = new MutationObserver((mutations) => {
      let changed = false,
        wsSwitch = false;
      for (const m of mutations) {
        if (m.type === "childList" && m.addedNodes.length > 0) {
          for (const n of m.addedNodes) {
            if (n.nodeType === Node.ELEMENT_NODE && n.tagName === "SPAN") {
              changed = true;
              break;
            }
          }
        }
        if (m.type === "attributes" && m.attributeName === "aria-owns")
          wsSwitch = true;
        if (
          m.type === "attributes" &&
          m.attributeName === "class" &&
          m.target?.classList?.contains("separator")
        ) {
          const key = getSeparatorKey(m.target);
          if (
            key &&
            processingSeparators.has(key) &&
            !m.target.classList.contains(CLASSES.LOADING)
          ) {
            m.target.classList.add(CLASSES.LOADING);
          }
        }
        if (changed && wsSwitch) break;
      }
      if (changed || wsSwitch) {
        scheduleAttachButtons(
          wsSwitch ? CONFIG.delays.workspaceSwitch : CONFIG.delays.mutation
        );
      }
    });

    tabStripObserver.observe(tabStrip, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-owns", "class"],
      attributeOldValue: true,
    });
  };

  // Listen to subtree changes of #browser to detect if .tab-strip is destroyed and rebuilt
  const observeStructure = () => {
    const root = document.getElementById("browser") || document.body;

    new MutationObserver(() => {
      const tabStrip = document.querySelector(SELECTORS.TAB_STRIP);
      if (!tabStrip) return;

      // .tab-strip changed (rebuilt), rebind
      if (tabStrip !== observedTabStrip) {
        console.log("[TidyTabs] .tab-strip rebuilt, reattaching");
        observeTabStripInner(tabStrip);
        scheduleAttachButtons(CONFIG.delays.init);
        reapplyLoadingStates();
        return;
      }

      // Buttons lost, reattach
      const seps = tabStrip.querySelectorAll(".separator");
      const tidyButtons = tabStrip.querySelectorAll(`.${CLASSES.TIDY_BUTTON}`);
      const clearButtons = tabStrip.querySelectorAll(`.${CLASSES.CLEAR_BUTTON}`);
      if (
        seps.length > 0 &&
        (tidyButtons.length < seps.length || clearButtons.length < seps.length)
      ) {
        scheduleAttachButtons(200);
      }
    }).observe(root, { childList: true, subtree: true });
  };

  // Periodic refresh of tab age data (every 5 minutes)
  setInterval(recordTabActivation, 5 * 60 * 1000);

  const init = () => {
    console.log("[TidyTabs] ✓ Initialization complete");
    // Initial tab age snapshot
    recordTabActivation();
    setTimeout(attachButtons, CONFIG.delays.init);

    // Try binding current .tab-strip first
    const tabStrip = document.querySelector(SELECTORS.TAB_STRIP);
    if (tabStrip) observeTabStripInner(tabStrip);

    // Listen for structural changes (e.g. auto-hide toggle causing .tab-strip rebuild)
    observeStructure();
    setupAutoStackListener();
  };

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
