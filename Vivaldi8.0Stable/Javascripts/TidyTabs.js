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
    apiEndpoint: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    apiKey: "",
    model: "glm-4-flash",
    timeout: 0,
    temperature: 0,
    maxTokens: 2048,
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
    } catch (_error) {}
  }

  loadSharedAiConfig();
  window.addEventListener("vivaldi-mod-ai-config-updated", (event) => {
    applySharedAiConfig(event.detail || {});
  });

  // ==================== Script Configuration ====================

  const CONFIG = {
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

  let debounceTimer = null;
  const processingSeparators = new Set();
  const TIDY_TABS_STACK_OWNER = "TidyTabs";

  // ==================== Utility Functions ====================

  const getBrowserLanguage = () =>
    chrome.i18n?.getUILanguage?.() || navigator.language || "zh-CN";

  const getLanguageName = (langCode) =>
    LANGUAGE_MAP[langCode] || LANGUAGE_MAP[langCode.split("-")[0]] || "English";

  const getOthersName = () => {
    const lang = getLanguageName(getBrowserLanguage());
    return OTHERS_MAP[lang] || "Others";
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
        } catch {}
        
        Object.assign(viv, fields);
        
        chrome.tabs.update(tabId, { vivExtData: JSON.stringify(viv) }, () => {
          if (chrome.runtime.lastError) {
            console.error("[TidyTabs] [chrome.tabs.update] Error:", chrome.runtime.lastError.message);
          } else {
            console.log(`[TidyTabs] [updateTabProperties] Updated tabId=${tabId} vivExtData:`, JSON.stringify(viv));
          }
          resolve();
        });
      });
    });
  };

  const addTabToStack = async (tabId, stackId, stackName, stackColor, parentExtId) => {
    console.log(`[TidyTabs] [addTabToStack] Starting for tabId=${tabId}, stackId=${stackId}, stackName="${stackName}", stackColor="${stackColor}", parentExtId="${parentExtId || ''}"`);
    
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
    console.log(`[TidyTabs] [addTabToStack] Verified tabId=${tabId} vivExtData after update:`, JSON.stringify(verifyTab?.vivExtData));
    
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

    return `You are a meticulous expert organizer who follows instructions concisely. I have some tabs! Please help me sort them into groups. I'll provide you with a list of tabs, with their IDs (e.g. google.com/3), their titles, and the tab they were opened from if applicable (e.g. \u21b3 google.com/0). Think about the groupings of my browsing, and then choose a descriptive group name for each. Group based on keywords in common, domain, website purpose, and referring tab. If a tab has a unique keyword in common with tabs in a group, include it in that group. Use the unique keyword in the group name. Some tabs may be in a group of their own, but you should try to include each tab in a group if possible.

Treat every tab below as raw material for a fresh regrouping. Ignore any previous browser tab stack membership or previous stack names.

My tabs:
${tabLines}

**Rules:**
1. Create new groups from the supplied tabs only.
2. Group names: concise, specific, in ${languageName}.
3. Tabs that don't fit any group go to "${othersName}".
4. Each tab in exactly one group.
5. Output strictly valid JSON only, no explanation:

{"groups":[{"name":"Group name","tab_ids":[0,1,2]},{"name":"${othersName}","tab_ids":[3]}]}

The tab_ids correspond to the number after the domain slash (e.g. google.com/3 \u2192 tab_id is 3).`;
  };

  const parseAIResponse = (content) => {
    let s = content.trim();
    if (!s) return null;
    const m = s.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (m) s = m[1].trim();
    const first = s.indexOf("{"),
      last = s.lastIndexOf("}");
    if (first !== -1 && last !== -1) s = s.substring(first, last + 1);
    try {
      return JSON.parse(s);
    } catch (e) {
      console.error("[TidyTabs] JSON parse error:", e.message, "Content:", s.substring(0, 200));
      return null;
    }
  };

  const validateAIGroups = (result) => {
    if (!result?.groups || !Array.isArray(result.groups)) return false;
    return result.groups.every(
      (g) => g.name && typeof g.name === "string" && Array.isArray(g.tab_ids)
    );
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

  const getAIGrouping = async (tabs, existingStacks = []) => {
    if (!AI_CONFIG.apiKey) {
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

      const isGLM = AI_CONFIG.apiEndpoint?.includes("bigmodel.cn");
      const isOpenRouter = AI_CONFIG.apiEndpoint?.includes("openrouter.ai");
      const payload = {
        model: AI_CONFIG.model,
        messages: [
          {
            role: "user",
            content: buildAIPrompt(tabs, existingStacks, languageName),
          },
        ],
        temperature: AI_CONFIG.temperature,
        max_tokens: AI_CONFIG.maxTokens,
        stream: false,
        response_format: { type: "json_object" },
      };
      if (isGLM) {
        payload.thinking = { type: "disabled" };
      } else if (isOpenRouter) {
        payload.include_reasoning = false;
      }

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

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      if (data?.error) throw new Error(`API error: ${data.error.message || JSON.stringify(data.error)}`);

      const raw = data.choices?.[0]?.message?.content || "";
      const cleaned = raw.replace(/<(thought|reasoning)>[\s\S]*?<\/\1>/gi, "").trim();
      const result = parseAIResponse(cleaned);
      if (!result || !validateAIGroups(result)) return null;

      const groups = mapAIResultsToGroups(result, tabs, existingStacks);
      handleOrphanTabs(groups, tabs, existingStacks);
      return groups.length > 0 ? groups : null;
    } catch (error) {
      console.error("[TidyTabs] AI error:", error.message);
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
    const byHost = {};
    tabs.forEach((tab) => {
      const host = getHostname(tab.url);
      (byHost[host] ||= []).push(tab);
    });
    return Object.entries(byHost)
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
      const isGLM = AI_CONFIG.apiEndpoint?.includes("bigmodel.cn");
      const payload = {
        model: AI_CONFIG.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 64,
        stream: false,
        response_format: { type: "json_object" },
      };
      if (isGLM) {
        payload.thinking = { type: "disabled" };
      } else if (AI_CONFIG.apiEndpoint?.includes("openrouter.ai")) {
        payload.include_reasoning = false;
      }

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

        const raw = data.choices?.[0]?.message?.content || "";
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
      } catch {}
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
      } catch {}
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
      console.log(`[TidyTabs] Grouping tabIds natively via tabsPrivate.move:`, JSON.stringify(tabIds));
      
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
      } catch {}
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
  };

  // ==================== Core ====================

  const autoStackWorkspace = async (workspaceId) => {
    if (!(await isAutoStackAllowed(workspaceId))) return;
    const tabs = await getTabsByWorkspace(workspaceId);
    if (tabs.length < 2) return;

    let groups =
      CONFIG.enableAIGrouping && AI_CONFIG.apiKey
        ? (await getAIGrouping(tabs))
        : null;
    if (!groups) {
      groups = groupByDomain(tabs);
      handleOrphanTabs(groups, tabs);
    }

    if (groups.length > 0) {
      const othersGroup = groups.find((g) => OTHERS_NAMES.includes(g.name));
      await createTabStacks(groups);
      if (othersGroup) await moveGroupToEnd(othersGroup);
      showToast(`Successfully grouped ${groups.length} stacks`, { type: "success" });
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

      let groups =
        CONFIG.enableAIGrouping && AI_CONFIG.apiKey
          ? (await getAIGrouping(tabs, []))
          : null;
      if (!groups) {
        groups = groupByDomain(tabs);
        handleOrphanTabs(groups, tabs, []);
      }

      if (groups.length > 0) {
        const othersGroup = groups.find((g) => OTHERS_NAMES.includes(g.name));
        await createTabStacks(groups);
        if (othersGroup) await moveGroupToEnd(othersGroup);
        showToast(`Successfully grouped ${groups.length} stacks`, { type: "success" });
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

  const init = () => {
    console.log("[TidyTabs] ✓ Initialization complete");
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
