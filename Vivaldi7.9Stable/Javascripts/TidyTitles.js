// ==UserScript==
// @name         Vivaldi AI Title
// @description  AI-assisted title generation for Vivaldi tabs.
// @version      2026.4.17
// @author       PaRr0tBoY
// ==/UserScript==

// Vivaldi AI Title
(function () {
  "use strict";

  // ==================== AI Configuration ====================
  // 1. Fill in apiKey.
  // 2. Set apiEndpoint to the full chat completions URL.
  // 3. Adjust model / timeout / maxTokens if needed.
  // 4. If apiKey is empty, title generation will be skipped.
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
    temperature: 0.1,
    maxTokens: 500,
  };
  const MOD_AI_CONFIG_KEY = "tidyTitles";
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

  // Stack color setting
  let enableStackColor = false;

  function applyModSettings(raw) {
    const mods = raw?.mods && typeof raw.mods === "object" ? raw.mods : {};
    const tidySeries = mods.tidySeries && typeof mods.tidySeries === "object" ? mods.tidySeries : {};
    if (typeof tidySeries.enableStackColor === "boolean") {
      enableStackColor = tidySeries.enableStackColor;
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

  const showToast = (message, options = {}) => {
    window.VModToast?.show(message, { module: "TidyTitles", ...options });
  };

  const isEnglishUi = () => {
    const lang = chrome.i18n?.getUILanguage?.() || navigator.language || "";
    return String(lang).toLowerCase().startsWith("en");
  };

  const toastText = (key, data = {}) => {
    const en = isEnglishUi();
    const text = {
      stackRenamed: en
        ? `Tab stack renamed: ${data.newName}`
        : `标签栈已重命名: ${data.newName}`,
      untitledStack: en ? "Untitled stack" : "未命名标签栈",
    };
    return text[key] || key;
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

  // Reprocess tab title when PinnedTabRestore replaces pinned URL
  document.addEventListener("pinned-tab-url-replaced", (event) => {
    const { tabId } = event.detail || {};
    if (!tabId) return;
    processedTabs.delete(tabId);
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) return;
      let viv = {};
      try { viv = tab.vivExtData ? JSON.parse(tab.vivExtData) : {}; } catch {}
      // Overwrite fixedTitle with raw title (shows something while AI generates)
      viv.fixedTitle = tab.title || "";
      chrome.tabs.update(tabId, { vivExtData: JSON.stringify(viv) }, () => {
        const wrapper = getLiveTabElement(tabId);
        if (wrapper) processSingleTab(wrapper, true); // force re-generation
      });
    });
  });

  // Language mapping
  const LANGUAGE_MAP = {
    zh: "Chinese",
    "zh-CN": "Simplified Chinese",
    "zh-TW": "Traditional Chinese",
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

  // Set to store processed tab IDs to prevent duplicate processing
  const processedTabs = new Set();

  // Set to track tabs currently awaiting AI response.
  // Used to re-apply loading animation when Vivaldi mutates tab-wrapper className.
  const processingTabs = new Set();

  // ========== Utility Functions ==========

  const injectStyles = () => {
    if (document.getElementById("tidy-titles-styles")) return;
    const style = document.createElement("style");
    style.id = "tidy-titles-styles";
    style.textContent = `
      .tab-wrapper.tidy-title-loading .title {
        background: linear-gradient(90deg, currentColor 25%, transparent 50%, currentColor 75%);
        background-size: 200% 100%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: tidyTitleShimmer 1.5s infinite linear;
      }
      @keyframes tidyTitleShimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      .tab-strip .tab-wrapper.tidy-stack-loading .title,
      .tab-strip .tab-wrapper.tidy-stack-loading .stack-counter {
        background: linear-gradient(90deg, currentColor 25%, transparent 50%, currentColor 75%);
        background-size: 200% 100%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: tidyTitleShimmer 1.5s infinite linear;
      }
    `;
    document.head.appendChild(style);
  };

  const getBrowserLanguage = () =>
    chrome.i18n?.getUILanguage?.() || navigator.language || "zh-CN";

  const getHostname = (url) => {
    try { return new URL(url).hostname; } catch { return ""; }
  };

  const getLanguageName = (langCode) =>
    LANGUAGE_MAP[langCode] || LANGUAGE_MAP[langCode.split("-")[0]] || "English";

  const parseAIResponse = (content) => {
    if (!content) return null;
    let s = content.trim();
    // Match JSON blocks
    const m = s.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i);
    if (m) s = m[1].trim();
    // Find first { and last }
    const first = s.indexOf("{"),
      last = s.lastIndexOf("}");
    if (first !== -1 && last !== -1) {
      s = s.substring(first, last + 1);
    }
    try {
      return JSON.parse(s);
    } catch (e) {
      console.error(
        "[TidyTitles] JSON parse failed for content:",
        s.substring(0, 100) + "..."
      );
      return null;
    }
  };

  /**
   * Queries the live DOM element for a given numeric tabId.
   * Always returns the current node, not a stale reference.
   */
  function getLiveTabElement(tabId) {
    return document.querySelector(`.tab-wrapper[data-id="tab-${tabId}"]`);
  }

  /**
   * Re-applies the loading animation class to all currently processing tabs.
   * Called after tab-strip rebuilds to restore animations on live DOM nodes.
   */
  function reapplyLoadingClasses() {
    for (const tabId of processingTabs) {
      getLiveTabElement(tabId)?.classList.add("tidy-title-loading");
    }
  }

  /**
   * Calls the AI API to generate an optimized title
   */
  async function generateOptimizedTitle(originalTitle, url) {
    if (!AI_CONFIG.apiKey) {
      console.warn("[TidyTitles] AI API key not configured, skipping.");
      showToast("AI API key 未配置", {
        type: "error",
        button: { text: "前往设置", action: openSettings },
      });
      return originalTitle;
    }

    // Skip special/internal URLs that cause permission errors
    if (!url || (!url.startsWith("http") && !url.startsWith("https"))) {
      console.log(`[TidyTitles] Skipping non-web URL: ${url}`);
      return originalTitle;
    }

    const languageName = getLanguageName(getBrowserLanguage());
    const title = originalTitle.replace(/`/g, "\\`").replace(/\${/g, "\\${");
    const prompt = `You are a perfect editor, summarizer and translator.
I am bookmarking a tab in my browser.

The title is \`${title}\`.

- Remove the name of the site (e.g. youtube.com, github.com), if it's not the only thing there).
- Remove other SEO cruft.
- Don't make the title too general. As specific as possible without going over the word count.
- If the page is about a proper noun (personal site, restaurant homepage, brand homepage), the new title should always include the proper noun along with context. For example, "Individualized Eng Expectations - Anna Delvey" would translate to "Anna's Eng Expectations", and "Arc by the Browser Company: Monetization Strategy" would translate to "Arc Monetization".
- Remove words that describe the 'kind of page' (video, recipe, guide, etc).
- Err on the side of keeping the subject, main verb, and direct object. Remove other parts of speech.

Return a response using JSON, according to this schema:
\`\`\`
{
    "filtered": string // The title translated and filtered to remove the cruft. No word limit.
    "rewritten": string // The title rewritten in 1-3 words
}
\`\`\`

Write responses (but not JSON keys) in ${languageName}.`;

    let timeoutId = null;

    try {
      const isGLM = AI_CONFIG.apiEndpoint?.includes("bigmodel.cn");
      const payload = {
        model: AI_CONFIG.model,
        messages: [{ role: "user", content: prompt }],
        temperature: AI_CONFIG.temperature,
        max_tokens: AI_CONFIG.maxTokens,
        stream: false,
        response_format: { type: "json_object" },
      };

      if (isGLM) {
        payload.thinking = { type: "disabled" };
      } else {
        payload.include_reasoning = false;
      }

      console.log(`[TidyTitles] API Request:`, payload);

      const controller =
        AI_CONFIG.timeout > 0 ? new AbortController() : null;
      timeoutId =
        AI_CONFIG.timeout > 0
          ? setTimeout(() => controller.abort(), AI_CONFIG.timeout)
          : null;

      const response = await fetch(AI_CONFIG.apiEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AI_CONFIG.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://github.com/Gershom-Chen/VivaldiModpack",
          "X-Title": "Vivaldi TidyTitles",
        },
        body: JSON.stringify(payload),
        signal: controller?.signal,
      });

      const data = await response.json();
      console.log(`[TidyTitles] API Response:`, data);

      // Handle common "pseudo-200" errors or non-OK responses
      if (!response.ok || (data && data.error)) {
        const status = response.status;
        const errMsg =
          data?.error?.message || data?.error || `Status ${status}`;

        // Suppress noisy logs for common issues like 429 or 401
        if (status === 429) {
          console.warn(
            `[TidyTitles] API rate limit reached (429). Skipping for now.`
          );
          showToast("API 请求频率过高 (429)", { type: "warning" });
        } else {
          console.error(`[TidyTitles] API error (${status}): ${errMsg}`);
          showToast(`API 错误 (${status}): ${errMsg}`, {
            type: "error",
            copyText: `TidyTitles API error ${status}: ${errMsg}`,
          });
        }
        return originalTitle;
      }

      if (!data || !data.choices || data.choices.length === 0) {
        console.warn(
          "[TidyTitles] API response missing choices:",
          JSON.stringify(data)
        );
        return originalTitle;
      }

      // Robustly extract content from various OpenAI-compatible formats
      let rawContent = "";
      const choice = data.choices[0];

      if (choice.message) {
        rawContent = choice.message.content || choice.message.refusal || "";
      } else if (choice.text) {
        rawContent = choice.text;
      }

      // Debug log for empty results
      if (!rawContent) {
        console.log(
          `[TidyTitles] AI returned empty content. Choice:`,
          JSON.stringify(choice)
        );
      }

      console.log(`[TidyTitles] AI raw response: "${rawContent || "EMPTY"}"`);

      // Clean up potential thinking/thought tags
      rawContent = (rawContent || "")
        .replace(/<(thought|reasoning)>[\s\S]*?<\/\1>/gi, "")
        .trim();

      const parsed = parseAIResponse(rawContent);
      if (parsed && parsed.rewritten) {
        return parsed.rewritten;
      }

      return originalTitle;
    } catch (error) {
      console.error("[TidyTitles] API call exception:", error.message);
      showToast(`API 调用异常: ${error.message}`, {
        type: "error",
        copyText: error.message,
      });
      return originalTitle;
    } finally {
      if (typeof timeoutId !== "undefined" && timeoutId) clearTimeout(timeoutId);
    }
  }

  /**
   * Updates the fixedTitle of a tab
   */
  function updateTabTitle(tabId, newTitle) {
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) return;

      let vivExtData = {};
      try {
        vivExtData = tab.vivExtData ? JSON.parse(tab.vivExtData) : {};
      } catch (e) {
        /* ignore */
      }

      vivExtData.fixedTitle = newTitle;

      chrome.tabs.update(
        tabId,
        { vivExtData: JSON.stringify(vivExtData) },
        () => {
          if (chrome.runtime.lastError) {
            console.error(
              "[TidyTitles] Failed to update tab:",
              chrome.runtime.lastError.message
            );
          } else {
            console.log(`[TidyTitles] ✓ ${tabId} → ${newTitle}`);
            processedTabs.add(tabId);
          }
        }
      );
    });
  }

  /**
   * Processes a single tab
   */
  async function processTabById(tabId, force = false) {
    if (processedTabs.has(tabId) && !force) {
      console.log(
        `[TidyTitles] Tab ${tabId} has already been processed, skipping.`
      );
      return;
    }

    console.log(`[TidyTitles] Start processing tab ID: ${tabId}`);

    return new Promise((resolve) => {
      chrome.tabs.get(tabId, async (tab) => {
        if (chrome.runtime.lastError) {
          console.warn(
            `[TidyTitles] Could not get info for tab ${tabId}:`,
            chrome.runtime.lastError.message
          );
          resolve();
          return;
        }

        let vivExtData = {};
        try {
          vivExtData = tab.vivExtData ? JSON.parse(tab.vivExtData) : {};
        } catch (e) {
          /* ignore */
        }

        // Skip if it already has a fixedTitle (unless forced re-generation)
        if (vivExtData.fixedTitle && !force) {
          console.log(
            `[TidyTitles] Tab ${tabId} already has custom title ("${vivExtData.fixedTitle}"), skipping.`
          );
          processedTabs.add(tabId);
          resolve();
          return;
        }

        // Mark as in-progress and apply loading animation via live DOM query.
        // Do NOT hold a reference to tabElement here — Vivaldi may mutate the
        // node's className directly (e.g. removing "active") which can wipe our
        // class if it replaces the full className string. The innerObserver will
        // detect this and re-add "tidy-title-loading" automatically.
        processingTabs.add(tabId);
        getLiveTabElement(tabId)?.classList.add("tidy-title-loading");

        console.log(
          `[TidyTitles] Requesting AI generated title for tab ${tabId} ("${tab.title}")...`
        );

        try {
          const optimizedTitle = await generateOptimizedTitle(
            tab.title || "",
            tab.url || ""
          );

          if (optimizedTitle === tab.title) {
            console.log(
              `[TidyTitles] AI returned title is identical or generation failed, no changes made (${tabId})`
            );
            // Do not add to processed list on failure, allowing retry
            return;
          }

          updateTabTitle(tabId, optimizedTitle);
        } finally {
          // Always clean up: remove from in-progress set and strip the animation
          // class from whichever node is currently live in the DOM.
          processingTabs.delete(tabId);
          getLiveTabElement(tabId)?.classList.remove("tidy-title-loading");
          resolve();
        }
      });
    });
  }

  async function processSingleTab(tabElement, force = false) {
    const tabIdStr = tabElement.getAttribute("data-id");
    if (!tabIdStr) return;

    // data-id 有两种格式：
    //   数字型: "tab-89946916"       → 真实标签
    //   UUID型: "tab-7e0556d7-9d40-..." → 标签组（substack），跳过
    // parseInt 遇到 UUID 会截断（"7e0556d7" → 7），导致 chrome.tabs.get(7) 报错
    const rawId = tabIdStr.replace(/^tab-/, "");
    if (rawId.includes("-")) return; // UUID 格式，直接跳过

    const tabId = parseInt(rawId, 10);
    if (!Number.isInteger(tabId) || tabId <= 0) return;

    await processTabById(tabId, force);
  }

  async function processStackTabs(stackId, force = true) {
    if (!stackId) return;
    const tabs = await getTabsInStackForTitleRename(stackId);
    console.log(`[TidyTitles] Pinned stack "${stackId}": processing ${tabs.length} tabs`);
    for (const tab of tabs) {
      await processTabById(tab.id, force);
    }
  }

  function getStackIdFromWrapper(wrapper) {
    const raw = wrapper?.getAttribute("data-id")?.replace(/^tab-/, "") || "";
    return raw.includes("-") ? raw : "";
  }

  function processPinnedTabPosition(tabPosition) {
    const tabWrapper = tabPosition.querySelector(".tab-wrapper");
    if (!tabWrapper) return;

    if (tabPosition.classList.contains("is-substack") || tabPosition.classList.contains("is-stack")) {
      processStackTabs(getStackIdFromWrapper(tabWrapper), true);
      return;
    }

    processSingleTab(tabWrapper);
  }

  /**
   * Checks and processes pinned tabs (used during initialization)
   */
  async function checkPinnedTabs() {
    const pinnedTabPositions = document.querySelectorAll(
      ".tab-position.is-pinned"
    );

    console.log(
      `[TidyTitles] Init: detected ${pinnedTabPositions.length} pinned tabs/stacks`
    );

    for (const tabPosition of pinnedTabPositions) {
      processPinnedTabPosition(tabPosition);
    }
  }

  let innerObserver = null;
  let observedTabStrip = null;

  /**
   * Listener for tab pinned events (bound internally to .tab-strip).
   *
   * Also handles the case where Vivaldi mutates a .tab-wrapper's className
   * in-place (e.g. adding/removing "active") and inadvertently wipes our
   * "tidy-title-loading" class. When that happens we immediately re-add it.
   */
  function observeTabStripInner(tabStrip) {
    if (innerObserver) innerObserver.disconnect();
    observedTabStrip = tabStrip;

    function restoreShimmer(wrapper) {
      const raw = wrapper.getAttribute("data-id")?.replace(/^tab-/, "");
      if (!raw) return;
      const isUuid = raw.includes("-");

      if (isUuid) {
        if (stackIdsRenaming.has(raw) && !wrapper.classList.contains("tidy-stack-loading")) {
          wrapper.classList.add("tidy-stack-loading");
        }
      } else {
        const tabId = parseInt(raw, 10);
        if (Number.isInteger(tabId) && processingTabs.has(tabId) && !wrapper.classList.contains("tidy-title-loading")) {
          wrapper.classList.add("tidy-title-loading");
        }
      }
    }

    innerObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // ── childList: DOM rebuild → restore shimmer on new wrappers ──────
        if (mutation.type === "childList") {
          for (const node of mutation.addedNodes) {
            if (node.nodeType !== 1) continue;
            if (node.classList?.contains("tab-wrapper")) {
              restoreShimmer(node);
            } else if (node.querySelector) {
              node.querySelectorAll(".tab-wrapper").forEach(restoreShimmer);
            }
          }
          continue;
        }

        // ── attributes: class overwritten → restore shimmer ──────────────
        if (mutation.attributeName !== "class") continue;
        const target = mutation.target;

        if (target.classList?.contains("tab-wrapper")) {
          restoreShimmer(target);
          continue;
        }

        // ── .tab-position class mutated (is-pinned detection) ────────────
        if (!target.classList?.contains("tab-position")) continue;

        const isPinnedNow = target.classList.contains("is-pinned");
        const wasPinnedBefore =
          mutation.oldValue?.includes("is-pinned") || false;

        if (isPinnedNow && !wasPinnedBefore) {
          processPinnedTabPosition(target);
        }
      }
    });

    innerObserver.observe(tabStrip, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
      attributeOldValue: true,
    });
  }

  /**
   * Outer listener to prevent event loss due to .tab-strip recreation
   */
  function observeRoot() {
    const root = document.getElementById("browser") || document.body;
    new MutationObserver(() => {
      const tabStrip = document.querySelector(".tab-strip");
      if (tabStrip && tabStrip !== observedTabStrip) {
        console.log("[TidyTitles] .tab-strip rebuilt, reattaching");
        observeTabStripInner(tabStrip);
        // Restore loading animations on all tabs still awaiting AI response
        reapplyLoadingClasses();
      }
    }).observe(root, { childList: true, subtree: true });
  }

  /**
   * Initialization entry point
   */
  function init() {
    console.log("[TidyTitles] ✓ AI Tab Title Optimization module started");
    console.log("[TidyTitles] ✓ Stack rename enabled (skips TidyTabs stacks)");

    injectStyles();

    const tabStrip = document.querySelector(".tab-strip");
    if (tabStrip) observeTabStripInner(tabStrip);

    observeRoot();
    observeStacks();

    // Build initial stack membership index. This is only a baseline; later
    // renames are driven by membership changes, not by rescanning all stacks.
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      for (const t of tabs) {
        const viv = parseVivExtData(t.vivExtData);
        const stackId = getStackIdFromViv(viv);
        if (stackId) {
          setTabStack(t.id, stackId);
          rememberStackColor(stackId, viv);
        }
      }
      checkPinnedTabs();
    });
  }

  // ========== Stack Rename ==========

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

  const stackRenamesPending = new Set();
  const stackIdsRenaming = new Set();
  const stackRenameTimers = new Map();
  const stackLastRenameAt = new Map();
  const tabToStack = new Map(); // tabId → stackId
  const stackToTabs = new Map(); // stackId → Set<tabId>
  const stackColors = new Map(); // stackId → groupColor
  const TIDY_TABS_STACK_OWNER = "TidyTabs";
  const STACK_RENAME_COOLDOWN_MS = 60 * 1000;
  let dynamicRenameGap = 3;

  function parseVivExtData(raw) {
    if (!raw) return {};
    try {
      return typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      return {};
    }
  }

  function getStackIdFromViv(viv) {
    return typeof viv.group === "string" && viv.group ? viv.group : "";
  }

  function rememberStackColor(stackId, viv) {
    if (stackId && typeof viv.groupColor === "string" && viv.groupColor) {
      stackColors.set(stackId, viv.groupColor);
    }
  }

  function setTabStack(tabId, stackId) {
    if (!Number.isInteger(tabId) || !stackId) return;
    const oldStackId = tabToStack.get(tabId);
    if (oldStackId === stackId) return;

    if (oldStackId) {
      const oldMembers = stackToTabs.get(oldStackId);
      oldMembers?.delete(tabId);
      if (oldMembers && oldMembers.size === 0) stackToTabs.delete(oldStackId);
    }

    tabToStack.set(tabId, stackId);
    if (!stackToTabs.has(stackId)) stackToTabs.set(stackId, new Set());
    stackToTabs.get(stackId).add(tabId);
  }

  function removeTabFromStackIndex(tabId) {
    const stackId = tabToStack.get(tabId);
    if (!stackId) return "";

    tabToStack.delete(tabId);
    const members = stackToTabs.get(stackId);
    members?.delete(tabId);
    if (members && members.size === 0) {
      stackToTabs.delete(stackId);
      stackColors.delete(stackId);
    }
    return stackId;
  }

  function tabHasFixedGroupTitle(tab) {
    const viv = parseVivExtData(tab?.vivExtData);
    return typeof viv.fixedGroupTitle === "string" && viv.fixedGroupTitle.trim();
  }

  function getStackDisplayName(tabs, stackId) {
    for (const tab of tabs || []) {
      const viv = parseVivExtData(tab?.vivExtData);
      const title = typeof viv.fixedGroupTitle === "string" ? viv.fixedGroupTitle.trim() : "";
      if (title) return title;
    }
    return stackId || toastText("untitledStack");
  }

  function isTidyTabsManagedStackViv(viv, stackId) {
    return (
      viv?.tidyStackOwner === TIDY_TABS_STACK_OWNER &&
      viv?.tidyStackId === stackId &&
      viv?.group === stackId
    );
  }

  function stackHasTidyTabsOwner(tabs, stackId) {
    return tabs.some((tab) => isTidyTabsManagedStackViv(parseVivExtData(tab.vivExtData), stackId));
  }

  function loadDynamicRenameGap() {
    try {
      navigator.storage.getDirectory().then(root => {
        root.getDirectoryHandle(".askonpage", { create: false }).then(dir => {
          dir.getFileHandle("config.json", { create: false }).then(fh => {
            fh.getFile().then(file => {
              file.text().then(text => {
                const cfg = JSON.parse(text);
                const val = cfg?.mods?.tidySeries?.dynamicRenameGap;
                if (Number.isFinite(val) && val >= 1) dynamicRenameGap = val;
              });
            });
          });
        });
      });
    } catch {}
  }

  loadDynamicRenameGap();
  window.addEventListener("vivaldi-mod-config-updated", (e) => {
    const val = e.detail?.mods?.tidySeries?.dynamicRenameGap;
    if (Number.isFinite(val) && val >= 1) dynamicRenameGap = val;
  });

  function applyStackShimmer(stackId, on) {
    const el = document.querySelector(`.tab-wrapper[data-id="tab-${stackId}"]`);
    if (el) el.classList.toggle("tidy-stack-loading", on);
  }

  async function getTabsInStack(stackId) {
    const indexedIds = [...(stackToTabs.get(stackId) || [])];
    const tabs = await Promise.all(indexedIds.map((tabId) => new Promise((resolve) => {
      chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError || !tab) {
          removeTabFromStackIndex(tabId);
          resolve(null);
          return;
        }

        const viv = parseVivExtData(tab.vivExtData);
        if (viv.group !== stackId || tab.pinned || viv.panelId) {
          removeTabFromStackIndex(tabId);
          if (viv.group) setTabStack(tab.id, viv.group);
          resolve(null);
          return;
        }

        rememberStackColor(stackId, viv);
        resolve(tab);
      });
    })));

    return tabs.filter(Boolean);
  }

  async function getTabsInStackForTitleRename(stackId) {
    const indexedIds = [...(stackToTabs.get(stackId) || [])];
    if (indexedIds.length) {
      const tabs = await Promise.all(indexedIds.map((tabId) => new Promise((resolve) => {
        chrome.tabs.get(tabId, (tab) => {
          if (chrome.runtime.lastError || !tab) {
            removeTabFromStackIndex(tabId);
            resolve(null);
            return;
          }

          const viv = parseVivExtData(tab.vivExtData);
          if (viv.group !== stackId || viv.panelId) {
            removeTabFromStackIndex(tabId);
            if (viv.group) setTabStack(tab.id, viv.group);
            resolve(null);
            return;
          }

          rememberStackColor(stackId, viv);
          resolve(tab);
        });
      })));

      return tabs.filter(Boolean);
    }

    return new Promise((resolve) => {
      chrome.tabs.query({ currentWindow: true }, (tabs) => {
        const members = [];
        for (const tab of tabs) {
          const viv = parseVivExtData(tab.vivExtData);
          if (viv.group !== stackId || viv.panelId) continue;
          setTabStack(tab.id, stackId);
          rememberStackColor(stackId, viv);
          members.push(tab);
        }
        resolve(members);
      });
    });
  }

  async function generateStackName(tabs) {
    const languageName = getLanguageName(getBrowserLanguage());
    const tabInfo = tabs.map((t, i) => `${i + 1}. [${getHostname(t.url || "")}] ${t.title || "Untitled"}`).join("\n");

    console.log(`[TidyTitles] Stack name prompt data:\n${tabInfo}`);

    const prompt = `You are naming a browser tab group. Analyze the tabs to infer what task or project the user is working on, then give it a concise thematic name.

Guidelines:
- Think about WHY these tabs are grouped together — what work is the user doing?
- Name the WORK, not the websites. E.g. tabs about React hooks + React docs → "React学习", not "React网站合集"
- Capture the topic or goal, e.g. "论文调研", "旅行规划", "API集成开发"
- 1-4 words, in ${languageName}
- Be specific but not verbose

Tabs:
${tabInfo}

Return JSON: {"name":"the group name"}`;

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
      if (isGLM) payload.thinking = { type: "disabled" };
      else payload.include_reasoning = false;

      const controller = AI_CONFIG.timeout > 0 ? new AbortController() : null;
      const timeoutId = AI_CONFIG.timeout > 0 ? setTimeout(() => controller.abort(), AI_CONFIG.timeout) : null;

      try {
        const response = await fetch(AI_CONFIG.apiEndpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${AI_CONFIG.apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/Gershom-Chen/VivaldiModpack",
            "X-Title": "Vivaldi TidyTitles",
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
      console.warn("[TidyTitles] Stack name generation failed:", e.message);
    }
    return null;
  }

  async function renameStack(stackId, withColor, knownTabs = null) {
    if (stackIdsRenaming.has(stackId)) return false;

    const tabs = knownTabs || await getTabsInStack(stackId);
    if (tabs.length < 2) return false;

    console.log(`[TidyTitles] Stack "${stackId}" raw tabs:`, tabs.map(t => ({ id: t.id, url: t.url, title: t.title })));

    stackIdsRenaming.add(stackId);
    applyStackShimmer(stackId, true);

    try {
      const oldName = getStackDisplayName(tabs, stackId);
      const name = await generateStackName(tabs);
      if (!name) return false;

      let color = null;
      if (withColor && enableStackColor) {
        const neighborColor = [...stackColors.entries()]
          .filter(([id]) => id !== stackId)
          .map(([, value]) => value)
          .pop() || "";
        color = randomStackColor(neighborColor || lastAssignedColor);
      }

      const applyToAll = async (fields) => {
        let updated = 0;
        for (const tab of tabs) {
          await new Promise((resolve) => {
            chrome.tabs.get(tab.id, (t) => {
              if (chrome.runtime.lastError) { resolve(); return; }
              let viv = {};
              try { viv = t.vivExtData ? JSON.parse(t.vivExtData) : {}; } catch {}
              Object.assign(viv, fields);
              chrome.tabs.update(tab.id, { vivExtData: JSON.stringify(viv) }, () => {
                updated++;
                resolve();
              });
            });
          });
        }
        return updated;
      };

      const updated = await applyToAll({ fixedGroupTitle: name, ...(color ? { groupColor: color } : {}) });
      if (color) stackColors.set(stackId, color);
      console.log(`[TidyTitles] Stack "${name}" (${updated} tabs)${color ? " color=" + color : ""}`);
      if (updated > 0) {
        showToast(toastText("stackRenamed", { oldName, newName: name }), { type: "success" });
      }
      return updated > 0;
    } finally {
      stackIdsRenaming.delete(stackId);
      applyStackShimmer(stackId, false);
    }
  }

  function scheduleStackRename(stackId, { withColor = false, requireGap = true, requireMissingTitle = false, delay = 500 } = {}) {
    if (!stackId) return;
    if (stackRenameTimers.has(stackId)) clearTimeout(stackRenameTimers.get(stackId));

    const timer = setTimeout(async () => {
      stackRenameTimers.delete(stackId);

      const elapsed = Date.now() - (stackLastRenameAt.get(stackId) || 0);
      if (elapsed < STACK_RENAME_COOLDOWN_MS) {
        scheduleStackRename(stackId, {
          withColor,
          requireGap,
          requireMissingTitle,
          delay: STACK_RENAME_COOLDOWN_MS - elapsed,
        });
        return;
      }

      if (stackRenamesPending.has(stackId) || stackIdsRenaming.has(stackId)) {
        scheduleStackRename(stackId, { withColor, requireGap, requireMissingTitle, delay: 800 });
        return;
      }

      const tabs = await getTabsInStack(stackId);
      const count = tabs.length;
      if (count < 2) return;
      if (stackHasTidyTabsOwner(tabs, stackId)) return;
      if (requireMissingTitle && tabs.some(tabHasFixedGroupTitle)) return;
      if (requireGap && count % dynamicRenameGap !== 0) return;

      stackRenamesPending.add(stackId);
      try {
        const renamed = await renameStack(stackId, withColor, tabs);
        if (renamed) stackLastRenameAt.set(stackId, Date.now());
      } finally {
        stackRenamesPending.delete(stackId);
      }
    }, delay);

    stackRenameTimers.set(stackId, timer);
  }

  function handleStackMembershipChange(tabId, oldStackId, newStackId, viv) {
    if (oldStackId === newStackId) return;

    if (oldStackId) {
      removeTabFromStackIndex(tabId);
      scheduleStackRename(oldStackId, { requireGap: true, delay: 600 });
    }

    if (!newStackId) return;
    setTabStack(tabId, newStackId);

    if (isTidyTabsManagedStackViv(viv, newStackId)) return;

    // A stack created by Vivaldi has no fixedGroupTitle yet. TidyTitles owns
    // only that stack and can name/color it immediately once it has 2+ tabs.
    if (!viv.fixedGroupTitle) {
      scheduleStackRename(newStackId, { withColor: true, requireGap: false, requireMissingTitle: true });
      return;
    }

    scheduleStackRename(newStackId, { requireGap: true });
  }

  function observeStacks() {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
      if (!changeInfo.vivExtData) return;
      const viv = parseVivExtData(changeInfo.vivExtData);
      const newStackId = getStackIdFromViv(viv);
      const oldStackId = tabToStack.get(tabId) || "";
      rememberStackColor(newStackId, viv);

      // Ignore ordinary fixedTitle/groupTitle/color writes. Only a real group
      // membership transition can schedule a stack count check.
      if (oldStackId === newStackId) return;

      handleStackMembershipChange(tabId, oldStackId, newStackId, viv);
    });

    chrome.tabs.onRemoved.addListener((removedTabId) => {
      const stackId = removeTabFromStackIndex(removedTabId);
      if (stackId) scheduleStackRename(stackId, { requireGap: true, delay: 600 });
    });
  }

  // ========== Start ==========
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
