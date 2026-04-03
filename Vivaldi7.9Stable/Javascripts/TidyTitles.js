// Vivaldi AI Title
(function () {
  "use strict";

  // ========== CONFIG ==========
  const CONFIG = {
    // === GLM(free) ===
    BASE_URL: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    API_TOKEN: "",
    MODEL: "glm-4.7-flash",

    // === Mimo ===
    // BASE_URL: "https://api.xiaomimimo.com/v1/chat/completions",
    // API_TOKEN: "",
    // MODEL: "mimo-v2-flash",

    // === Openrouter/Free Quite Buggy===
    // BASE_URL: "https://openrouter.ai/api/v1/chat/completions",
    // API_TOKEN: "",
    // MODEL: "openrouter/free",

    // === Deepseek ===
    // BASE_URL: 'https://api.deepseek.com/v1/chat/completions',
    // API_TOKEN: "",
    // MODEL: 'deepseek-chat',
  };

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
    `;
    document.head.appendChild(style);
  };

  const getBrowserLanguage = () =>
    chrome.i18n?.getUILanguage?.() || navigator.language || "zh-CN";

  const getLanguageName = (langCode) =>
    LANGUAGE_MAP[langCode] ||
    LANGUAGE_MAP[langCode.split("-")[0]] ||
    "English";

  const parseAIResponse = (content) => {
    if (!content) return null;
    let s = content.trim();
    // Match JSON blocks
    const m = s.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i);
    if (m) s = m[1].trim();
    // Find first { and last }
    const first = s.indexOf("{"), last = s.lastIndexOf("}");
    if (first !== -1 && last !== -1) {
      s = s.substring(first, last + 1);
    }
    try { 
      return JSON.parse(s); 
    } catch (e) { 
      console.error("[TidyTitles] JSON parse failed for content:", s.substring(0, 100) + "...");
      return null; 
    }
  };

  /**
   * Calls the AI API to generate an optimized title
   */
  async function generateOptimizedTitle(originalTitle, url) {
    // Skip special/internal URLs that cause permission errors
    if (!url || (!url.startsWith('http') && !url.startsWith('https'))) {
      console.log(`[TidyTitles] Skipping non-web URL: ${url}`);
      return originalTitle;
    }

    const languageName = getLanguageName(getBrowserLanguage());

    const prompt = `
Return a response strictly using JSON, according to this schema:
{
  "filtered": "string",
  "rewritten": "string"
}

The title is "${originalTitle}".
The URL is "${url}".
Write responses (but not JSON keys) in ${languageName}. Ensure the "rewritten" field contains the final short title.

Rules:
- Remove the name of the site from the title, if it's not the only thing there.
- Remove other SEO cruft.
- Don't make the title too general. As specific as possible.
- If the page is about a proper noun (personal site, restaurant, brand homepage), the new title should always include the proper noun along with context. For example, "Individualized Eng Expectations - Anna Delvey" would translate to "Anna's Eng Expectations", and "Arc by the Browser Company: Monetization Strategy" would translate to "Arc Monetization".
- Remove words that describe the 'kind of page' (video, recipe, guide, etc).
- Err on the side of keeping the subject, main verb, and direct object. Remove other parts of speech.
`;

    try {
      const isGLM = CONFIG.BASE_URL?.includes("bigmodel.cn");
      const payload = {
        model: CONFIG.MODEL,
        messages: [
          { role: "system", content: "You are a professional editor. You must output valid JSON. No conversation, no preamble, no thinking." },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 500,
        stream: false,
        // Standard OpenAI JSON mode
        response_format: { type: "json_object" }
      };

      if (isGLM) {
        payload.thinking = { type: "disabled" };
      } else {
        payload.include_reasoning = false;
      }

      console.log(`[TidyTitles] API Request:`, payload);

      const response = await fetch(CONFIG.BASE_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CONFIG.API_TOKEN}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://github.com/Gershom-Chen/VivaldiModpack",
          "X-Title": "Vivaldi TidyTitles",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log(`[TidyTitles] API Response:`, data);

      // Handle common "pseudo-200" errors or non-OK responses
      if (!response.ok || (data && data.error)) {
        const status = response.status;
        const errMsg = data?.error?.message || data?.error || `Status ${status}`;
        
        // Suppress noisy logs for common issues like 429 or 401
        if (status === 429) {
          console.warn(`[TidyTitles] API rate limit reached (429). Skipping for now.`);
        } else {
          console.error(`[TidyTitles] API error (${status}): ${errMsg}`);
        }
        return originalTitle;
      }
      
      if (!data || !data.choices || data.choices.length === 0) {
        console.warn("[TidyTitles] API response missing choices:", JSON.stringify(data));
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
        console.log(`[TidyTitles] AI returned empty content. Choice:`, JSON.stringify(choice));
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
      return originalTitle;
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

      chrome.tabs.update(tabId, { vivExtData: JSON.stringify(vivExtData) }, () => {
        if (chrome.runtime.lastError) {
          console.error("[TidyTitles] Failed to update tab:", chrome.runtime.lastError.message);
        } else {
          console.log(`[TidyTitles] ✓ ${tabId} → ${newTitle}`);
          processedTabs.add(tabId);
        }
      });
    });
  }

  /**
   * Processes a single tab
   */
  async function processSingleTab(tabElement) {
    const tabIdStr = tabElement.getAttribute("data-id");
    if (!tabIdStr) return;

    const tabId = parseInt(tabIdStr.replace("tab-", ""));
    
    if (processedTabs.has(tabId)) {
      console.log(`[TidyTitles] Tab ${tabId} has already been processed, skipping.`);
      return;
    }

    console.log(`[TidyTitles] Start processing tab ID: ${tabId}`);

    chrome.tabs.get(tabId, async (tab) => {
      if (chrome.runtime.lastError) {
        console.warn(`[TidyTitles] Could not get info for tab ${tabId}:`, chrome.runtime.lastError.message);
        return;
      }

      let vivExtData = {};
      try {
        vivExtData = tab.vivExtData ? JSON.parse(tab.vivExtData) : {};
      } catch (e) {
        /* ignore */
      }

      // Skip if it already has a fixedTitle
      if (vivExtData.fixedTitle) {
        console.log(`[TidyTitles] Tab ${tabId} already has custom title ("${vivExtData.fixedTitle}"), skipping.`);
        processedTabs.add(tabId);
        return;
      }

      // Add loading animation class
      tabElement.classList.add("tidy-title-loading");

      console.log(`[TidyTitles] Requesting AI generated title for tab ${tabId} ("${tab.title}")...`);

      try {
        const optimizedTitle = await generateOptimizedTitle(
          tab.title || "",
          tab.url || "",
        );
        
        if (optimizedTitle === tab.title) {
          console.log(`[TidyTitles] AI returned title is identical or generation failed, no changes made (${tabId})`);
          // Do not add to processed list on failure, allowing retry
          return;
        }

        updateTabTitle(tabId, optimizedTitle);
      } finally {
        // Remove loading animation after request finishes
        tabElement.classList.remove("tidy-title-loading");
      }
    });
  }

  /**
   * Checks and processes pinned tabs (used during initialization)
   */
  async function checkPinnedTabs() {
    const pinnedTabElements = document.querySelectorAll(
      ".tab-position.is-pinned:not(.is-substack) .tab-wrapper",
    );

    console.log(`[TidyTitles] Init: detected ${pinnedTabElements.length} pinned tabs`);

    for (const tabElement of pinnedTabElements) {
      await processSingleTab(tabElement);
    }
  }

  let innerObserver = null;
  let observedTabStrip = null;

  /**
   * Listener for tab pinned events (bound internally to .tab-strip)
   */
  function observeTabStripInner(tabStrip) {
    if (innerObserver) innerObserver.disconnect();
    observedTabStrip = tabStrip;

    innerObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== "attributes" || mutation.attributeName !== "class") continue;

        const target = mutation.target;
        if (!target.classList?.contains("tab-position")) continue;
        if (target.classList.contains("is-substack")) continue;

        const isPinnedNow = target.classList.contains("is-pinned");
        const wasPinnedBefore = mutation.oldValue?.includes("is-pinned") || false;

        if (isPinnedNow && !wasPinnedBefore) {
          const tabWrapper = target.querySelector(".tab-wrapper");
          if (tabWrapper) processSingleTab(tabWrapper);
        }
      }
    });

    innerObserver.observe(tabStrip, {
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
      }
    }).observe(root, { childList: true, subtree: true });
  }

  /**
   * Initialization entry point
   */
  function init() {
    console.log("[TidyTitles] ✓ AI Tab Title Optimization module started");
    
    injectStyles();

    const tabStrip = document.querySelector(".tab-strip");
    if (tabStrip) observeTabStripInner(tabStrip);
    
    observeRoot();
    checkPinnedTabs();
  }

  // ========== Start ==========
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
