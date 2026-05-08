(() => {
  const LAB_KEY = "__arcPeekRelatedTabAdoptionProbe";
  const LOG_PREFIX = "[arcpeek-adoption-probe]";

  if (window[LAB_KEY]?.cleanup) {
    window[LAB_KEY].cleanup();
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const promisifyChrome = (fn, ...args) =>
    new Promise((resolve) => {
      try {
        fn(...args, (result) => {
          const error = chrome.runtime?.lastError?.message || "";
          resolve({ result, error });
        });
      } catch (error) {
        resolve({ result: null, error: error?.message || String(error) });
      }
    });

  const getLastFocusedWindow = async () => {
    const { result, error } = await promisifyChrome(chrome.windows.getLastFocused, {});
    if (error) throw new Error(error);
    return result;
  };

  const queryTabs = async (queryInfo = {}) => {
    const { result, error } = await promisifyChrome(chrome.tabs.query, queryInfo);
    if (error) throw new Error(error);
    return result || [];
  };

  const getTab = async (tabId) => {
    const { result, error } = await promisifyChrome(chrome.tabs.get, Number(tabId));
    return error ? null : result || null;
  };

  const createTab = async (createProperties) => {
    const { result, error } = await promisifyChrome(chrome.tabs.create, createProperties);
    if (error) throw new Error(error);
    return result;
  };

  const updateTab = async (tabId, updateProperties) => {
    const { result, error } = await promisifyChrome(chrome.tabs.update, Number(tabId), updateProperties);
    return { tab: result || null, error };
  };

  const removeTabs = async (tabIds) => {
    if (!tabIds?.length) return { error: "" };
    const { error } = await promisifyChrome(chrome.tabs.remove, tabIds.map(Number));
    return { error };
  };

  const parseVivExtData = (tabOrString) => {
    const raw = typeof tabOrString === "string" ? tabOrString : tabOrString?.vivExtData;
    if (!raw || String(raw).length < 2) return {};
    try {
      return JSON.parse(raw);
    } catch (_) {
      return { __parseError: true, __raw: raw };
    }
  };

  const getTabWrapper = (tabId) =>
    document.querySelector(`.tab-wrapper[data-id="tab-${Number(tabId)}"]`);

  const getWebviewByTabId = (tabId) =>
    document.querySelector(`webview[tab_id="${Number(tabId)}"]`);

  const inspectTabDom = (tabId) => {
    const tabWrapper = getTabWrapper(tabId);
    const webview = getWebviewByTabId(tabId);
    return {
      tabId: Number(tabId),
      hasTabWrapper: !!tabWrapper,
      tabWrapperClasses: tabWrapper?.className || "",
      tabWrapperText: tabWrapper?.textContent?.trim()?.slice(0, 120) || "",
      hasWebview: !!webview,
      webviewName: webview?.getAttribute("name") || webview?.name || "",
      webviewTabId: webview?.getAttribute("tab_id") || webview?.tab_id || "",
      webviewSrc: webview?.getAttribute("src") || webview?.src || "",
    };
  };

  const inspectTab = async (tabId) => {
    const tab = await getTab(tabId);
    return {
      tab,
      viv: parseVivExtData(tab),
      dom: inspectTabDom(tabId),
    };
  };

  const getWebpackRequire = () => {
    const chunkKeys = Object.keys(window).filter((key) => /^webpackChunk/.test(key));
    for (const key of chunkKeys) {
      const chunk = window[key];
      if (!Array.isArray(chunk) || typeof chunk.push !== "function") continue;
      let req = null;
      try {
        const marker = `arcpeek_probe_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        chunk.push([
          [marker],
          {},
          (webpackRequire) => {
            req = webpackRequire;
          },
        ]);
      } catch (_) {}
      if (req?.c) return { key, require: req };
    }
    return { key: "", require: null };
  };

  const ownValues = (value) => {
    if (!value || (typeof value !== "object" && typeof value !== "function")) return [];
    try {
      return Object.values(value);
    } catch (_) {
      return [];
    }
  };

  const hasMethods = (value, methods) =>
    !!value &&
    methods.every((method) => typeof value[method] === "function");

  const describeCandidate = (moduleId, exportPath, value, methods) => ({
    moduleId,
    exportPath,
    methods: methods.filter((method) => typeof value?.[method] === "function"),
    keys: Object.keys(value || {}).slice(0, 50),
  });

  const scanWebpackModules = () => {
    const runtime = getWebpackRequire();
    const req = runtime.require;
    const result = {
      chunkKey: runtime.key || null,
      hasWebpackRequire: !!req,
      cacheSize: req?.c ? Object.keys(req.c).length : 0,
      relatedRegistryCandidates: [],
      pageStoreCandidates: [],
      actionDispatcherCandidates: [],
      notes: [],
    };

    if (!req?.c) {
      result.notes.push("No webpack module cache found from window.webpackChunk*.");
      return result;
    }

    const relatedMethods = ["offerNewTab", "offerUpdatedTab", "offerEraseTabId", "findTabId", "replaceRelatedTab"];
    const placeholderMethods = ["putPanelPlaceholder", "resolveWebWidget"];
    const pageMethods = ["getActivePage", "getPageById", "getPages"];
    const dispatcherMethods = ["dispatch"];

    for (const [moduleId, record] of Object.entries(req.c)) {
      const exportsRoot = record?.exports;
      const candidates = [
        ["exports", exportsRoot],
        ["exports.default", exportsRoot?.default],
        ["exports.Z", exportsRoot?.Z],
        ["exports.ZP", exportsRoot?.ZP],
        ...ownValues(exportsRoot).map((value, index) => [`exports.value${index}`, value]),
      ];

      for (const [path, value] of candidates) {
        if (hasMethods(value, relatedMethods)) {
          result.relatedRegistryCandidates.push(describeCandidate(moduleId, path, value, relatedMethods));
        } else if (hasMethods(value, placeholderMethods)) {
          result.relatedRegistryCandidates.push(describeCandidate(moduleId, path, value, placeholderMethods));
        }

        if (hasMethods(value, pageMethods)) {
          result.pageStoreCandidates.push(describeCandidate(moduleId, path, value, pageMethods));
        }

        if (hasMethods(value, dispatcherMethods)) {
          const keys = Object.keys(value || {});
          if (keys.length <= 20 || keys.includes("dispatch")) {
            result.actionDispatcherCandidates.push(describeCandidate(moduleId, path, value, dispatcherMethods));
          }
        }
      }
    }

    return result;
  };

  const scanWindowObjects = () => {
    const methodGroups = [
      ["offerNewTab", "offerUpdatedTab", "offerEraseTabId", "findTabId", "replaceRelatedTab"],
      ["putPanelPlaceholder", "resolveWebWidget"],
      ["getActivePage", "getPageById", "getPages"],
    ];
    const hits = [];

    for (const key of Object.keys(window)) {
      let value;
      try {
        value = window[key];
      } catch (_) {
        continue;
      }
      if (!value || (typeof value !== "object" && typeof value !== "function")) continue;

      for (const methods of methodGroups) {
        if (hasMethods(value, methods)) {
          hits.push({ path: `window.${key}`, methods, keys: Object.keys(value).slice(0, 50) });
        }
      }
    }
    return hits;
  };

  const getRelatedTabs = async () => {
    const tabs = await queryTabs({});
    return tabs
      .map((tab) => ({ tab, viv: parseVivExtData(tab) }))
      .filter((entry) => entry.viv.panelId || entry.viv.arcPeekRuntime)
      .map((entry) => ({
        id: entry.tab.id,
        windowId: entry.tab.windowId,
        title: entry.tab.title,
        url: entry.tab.url,
        active: entry.tab.active,
        openerTabId: entry.tab.openerTabId,
        viv: entry.viv,
        dom: inspectTabDom(entry.tab.id),
      }));
  };

  const createdTabIds = new Set();

  const createProbeRelatedTab = async (url = "https://example.com/") => {
    const win = await getLastFocusedWindow();
    const panelId = `arcpeek-adoption-probe-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const tab = await createTab({
      url,
      active: false,
      windowId: win.id,
      vivExtData: JSON.stringify({
        panelId,
        arcPeekProbe: {
          createdAt: Date.now(),
          purpose: "related-tab-adoption",
        },
      }),
    });
    if (tab?.id) createdTabIds.add(tab.id);
    await sleep(500);
    const report = await inspectTab(tab.id);
    console.log(LOG_PREFIX, "created related probe tab", { panelId, report });
    return { panelId, tabId: tab.id, report };
  };

  const tryChromeLevelAdoption = async (tabId, options = {}) => {
    const before = await inspectTab(tabId);
    const nextViv = { ...before.viv };
    delete nextViv.panelId;
    nextViv.arcPeekAdoptionProbe = {
      adoptedAt: Date.now(),
      note: "panelId removed by console probe",
    };

    const update = await updateTab(tabId, {
      active: options.active !== false,
      vivExtData: JSON.stringify(nextViv),
    });
    await sleep(options.waitMs || 800);
    const after = await inspectTab(tabId);
    const report = {
      before,
      update,
      after,
      interpretation: {
        enteredTabStrip: !!after.dom.hasTabWrapper,
        activeChanged: !!after.tab?.active,
        panelIdRemovedFromChromeTab: !parseVivExtData(after.tab).panelId,
      },
    };
    console.log(LOG_PREFIX, "chrome-level adoption attempt", report);
    return report;
  };

  const runDisposableAdoptionExperiment = async (url = "https://example.com/") => {
    const created = await createProbeRelatedTab(url);
    const adoption = await tryChromeLevelAdoption(created.tabId);
    return {
      created,
      adoption,
      cleanup: async () => removeTabs([created.tabId]),
    };
  };

  const cleanup = async () => {
    const ids = [...createdTabIds];
    createdTabIds.clear();
    const result = await removeTabs(ids);
    console.log(LOG_PREFIX, "cleanup", { ids, result });
    return result;
  };

  const help = () => {
    const text = `
arcPeekRelatedTabAdoptionProbe API

Read-only / safe:
- arcPeekRelatedTabAdoptionProbe.scanInternals()
- arcPeekRelatedTabAdoptionProbe.scanWindowObjects()
- arcPeekRelatedTabAdoptionProbe.getRelatedTabs()
- arcPeekRelatedTabAdoptionProbe.inspectTab(tabId)

Disposable experiment:
- await arcPeekRelatedTabAdoptionProbe.createProbeRelatedTab("https://example.com/")
- await arcPeekRelatedTabAdoptionProbe.tryChromeLevelAdoption(tabId)
- await arcPeekRelatedTabAdoptionProbe.runDisposableAdoptionExperiment("https://example.com/")
- await arcPeekRelatedTabAdoptionProbe.cleanup()

What to look for:
- relatedRegistryCandidates with offerNewTab/findTabId/replaceRelatedTab
- after adoption: dom.hasTabWrapper === true
- after adoption: tab.active === true

If panelId removal + active update does not produce a tabWrapper, API-level adoption is not enough.
`;
    console.log(text.trim());
    return text.trim();
  };

  const api = {
    help,
    scanInternals: scanWebpackModules,
    scanWindowObjects,
    getRelatedTabs,
    createProbeRelatedTab,
    tryChromeLevelAdoption,
    runDisposableAdoptionExperiment,
    inspectTab,
    cleanup,
  };

  window.arcPeekRelatedTabAdoptionProbe = api;
  window[LAB_KEY] = api;
  console.log(`${LOG_PREFIX} Ready. Run arcPeekRelatedTabAdoptionProbe.help()`);
})();
