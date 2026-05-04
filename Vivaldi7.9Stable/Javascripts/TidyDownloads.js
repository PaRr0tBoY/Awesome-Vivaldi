// ==UserScript==
// @name         TidyDownloads
// @description  Uses chrome.downloads.onDeterminingFilename to dynamically rename downloads.
// @version      2026.4.17
// @author       PaRr0tBoY
// ==/UserScript==

/*
 * Usage:
 * 1. Modify AI_CONFIG below, then adjust CONFIG if needed
 * 2. Copy to <Vivaldi Dir>/Application/<Version>/resources/vivaldi/
 * 3. Include in window.html: <script src="TidyDownloads.js"></script>
 * 4. Restart Vivaldi
 */

(() => {
  "use strict";

  // ==================== AI Configuration ====================
  // 1. Fill in apiKey.
  // 2. Set apiEndpoint to the full chat completions URL.
  // 3. Adjust model / timeout / maxTokens if needed.
  // 4. If apiKey is empty, download renaming will fall back to the original filename.
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
    timeout: 15000,
    temperature: 0.1,
    maxTokens: 1000,
  };
  const MOD_AI_CONFIG_KEY = "tidyDownloads";
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

  function logStartupInfo() {
    log.info(`========== TidyDownloads Module Starting ==========`);
    log.info(`API: ${AI_CONFIG.apiEndpoint}`);
    log.info(`Model: ${AI_CONFIG.model}`);
    log.info(`Enabled: ${CONFIG.enabled}`);
    log.info(`Prefer focused tab context: ${CONFIG.preferFocusedTabContext}`);
    log.info(`Skip keywords: ${CONFIG.skipKeywords.join(", ")}`);
    log.info(`Skip extensions: ${CONFIG.skipExtensions.join(", ")}`);
    if (!AI_CONFIG.apiKey) {
      log.warn(`Please set AI_CONFIG.apiKey to your API key.`);
    }
  }

  async function loadSharedAiConfig() {
    try {
      const root = await navigator.storage.getDirectory();
      const dir = await root.getDirectoryHandle(MOD_AI_CONFIG_DIR, { create: true });
      const fileHandle = await dir.getFileHandle(MOD_AI_CONFIG_FILE, { create: false });
      const file = await fileHandle.getFile();
      applySharedAiConfig(JSON.parse(await file.text()));
    } catch (_error) {}
    logStartupInfo();
  }

  loadSharedAiConfig();
  window.addEventListener("vivaldi-mod-ai-config-updated", (event) => {
    applySharedAiConfig(event.detail || {});
    logStartupInfo();
  });

  // ==================== Script Configuration ====================
  const CONFIG = {
    // Enable AI renaming (false = use original filename)
    enabled: true,

    // Prefer the currently focused tab as rename context.
    // Useful when downloads come from CDNs or blob/object URLs.
    preferFocusedTabContext: true,

    // Skip keywords whitelist (skip rename if URL or filename contains these)
    skipKeywords: ["localhost", "127.0.0.1", "file://"],

    // Skip file extensions
    skipExtensions: [],
  };
  // ============================

  const LOG_PREFIX = "[TidyDownloads]";

  // ---------- Logging utilities ----------
  const log = {
    info: (...args) => console.log(`${LOG_PREFIX} [INFO]`, ...args),
    warn: (...args) => console.warn(`${LOG_PREFIX} [WARN]`, ...args),
    error: (...args) => console.error(`${LOG_PREFIX} [ERROR]`, ...args),
    debug: (...args) => console.log(`${LOG_PREFIX} [DEBUG]`, ...args),
  };

  // ---------- Utilities ----------
  function getHostname(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  function getExtension(filename) {
    const m = /\.([^.]+)$/.exec(filename);
    return m ? m[1] : "";
  }

  function extractTabTitle(tabUrl, tabTitle) {
    // Strip common suffixes
    return (tabTitle || "")
      .replace(
        /\s*[-_|]\s*(YouTube|Gmail|Google|Twitter|Facebook|GitHub|LinkedIn|Notion| Slack|Discord|Telegram|WeChat|WhatsApp).*$/i,
        ""
      )
      .trim();
  }

  function buildUserMessage({ filename, tabTitle, hostname }) {
    // Arc-style: concise metadata
    const lines = [`Original filename: '${filename}'`];
    if (hostname) lines.push(`Source domain: '${hostname}'`);
    if (tabTitle) lines.push(`Source tab title: '${tabTitle}'`);
    return lines.join("\n");
  }

  // Arc system prompt (keep in English for AI comprehension)
  const SYSTEM_PROMPT = `I am downloading a file. Rewrite its filename to be helpful, concise and readable. 2-4 words.
- Keep informative names mostly the same. For non-informative names, add information from the tab title or website.
- Remove machine-generated cruft, like IDs, (1), (copy), etc.
- Clean up messy text, especially dates. Make timestamps concise, human readable, and remove seconds.
- Clean up text casing and letter spacing to make it easier to read.

Some examples, in the form "original name, tab title, domain -> new name"
- 'Arc-1.6.0-41215.dmg', 'Arc from The Browser Company', 'arc.net' -> 'Arc 1.6.0 41215.dmg' (same info, easier to read)
- 'swift-chat-main.zip', 'huggingface/swift-chat: Mac app to demonstrate swift-transformers', 'github.com' -> 'swift-chat main.zip' (same info, easier to read)
- 'folio_option3_6691488.PDF', 'Your Guest Stay Folio from the LINE LA 08-14-23', 'mail.google.com' -> 'Line LA Folio, Aug 14.pdf' (remove ID numbers, make easier to read, add helpful info from tab title)
- 'image.png', 'Feedback: Card border radius - nateparro2t@gmail.com - Gmail', 'mail.google.com' -> 'Card border radius feedback.png' (remove non-useful words like 'image', add helpful info from tab title)
- 'Brooklyn_Bridge_September_2022_008.jpg', 'nyc bridges - Google Images', 'images.google.com' -> 'Brooklyn Bridge Sept 2022.jpg' (keep useful information, clean up formatting, remove '008' ID)
- 'AdobeStock_184679416.jpg', 'ladybug - Google Images', 'images.google.com' -> 'Ladybug.jpg' (add info from title, remove 'AdobeStock' cruft)
- 'CleanShot 2023-08-17 at 19.51.05@2x.png', 'dogfooding - The Browser Company - Slack', 'app.slack.com' -> 'CleanShot Aug 17 from dogfooding.png' (keep useful info, trim date, add source from title)
- 'Screenshot 2023-09-26 at 11.12.18 PM', 'DM with Nate - Twitter', 'twitter.com' -> 'Sept 26 Screenshot from Nate.png' (keep useful info, trim date, add source from title)
- 'image0.png', 'Nate - Slack', 'files.slack.com' -> 'Image from Nate via Slack.png' (add info from title, add useful context from title)

Return a response using JSON, according to this schema:
\`\`\`
{
    newName: string // The new filename
}
\`\`\`
Write responses (but not JSON keys) in English.`;

  // ---------- AI Request ----------
  async function fetchAiRename({ filename, tabTitle, hostname }) {
    if (!CONFIG.enabled || !AI_CONFIG.apiKey) return null;
    if (
      CONFIG.skipKeywords.some(
        (kw) => filename.includes(kw) || hostname?.includes(kw)
      )
    ) {
      log.debug(`Skipping whitelist: ${filename}`);
      return null;
    }

    const userMsg = buildUserMessage({ filename, tabTitle, hostname });

    const body = {
      temperature: AI_CONFIG.temperature,
      max_tokens: AI_CONFIG.maxTokens,
      stream: true,
      model: AI_CONFIG.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMsg },
      ],
      // Arc-style: text instead of json_object, parse JSON manually
      response_format: { type: "text" },
      stream_options: { include_usage: true },
    };

    log.debug(`AI request body:`, body);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.timeout);

    try {
      const response = await fetch(AI_CONFIG.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AI_CONFIG.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const text = await response.text();
        log.error(`AI API error ${response.status}: ${text}`);
        return null;
      }

      // Stream reading
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) fullText += content;
          } catch {
            // Ignore parse failures
          }
        }
      }

      log.debug(`AI raw response: ${fullText}`);

      // Extract newName
      const match = /"newName"\s*:\s*"([^"]+)"/.exec(fullText);
      if (match) {
        const newName = match[1].trim();
        // Preserve original extension
        const ext = getExtension(filename);
        const aiExt = getExtension(newName);
        if (ext && !aiExt) {
          return `${newName}.${ext}`;
        }
        return newName;
      }

      log.warn(`Could not extract newName from AI response: ${fullText}`);
      return null;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        log.error(`AI request timeout (${AI_CONFIG.timeout}ms)`);
      } else {
        log.error(`AI request failed: ${err.message}`);
      }
      return null;
    }
  }

  // ---------- Tab Info Fetch ----------
  function getTabInfo(tabId) {
    return new Promise((resolve) => {
      if (!tabId) return resolve({ title: null, url: null });
      chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError || !tab) {
          resolve({ title: null, url: null });
        } else {
          resolve({ title: tab.title || null, url: tab.url || null });
        }
      });
    });
  }

  function getFocusedActiveTabInfo() {
    return new Promise((resolve) => {
      chrome.tabs.query(
        { active: true, lastFocusedWindow: true },
        (tabs = []) => {
          if (chrome.runtime.lastError || !tabs.length) {
            resolve({ title: null, url: null, id: null });
            return;
          }

          const tab = tabs[0];
          resolve({
            title: tab.title || null,
            url: tab.url || null,
            id: tab.id || null,
          });
        }
      );
    });
  }

  async function getRenameContext(downloadItem) {
    const downloadTab = await getTabInfo(downloadItem.tabId);
    const focusedTab = CONFIG.preferFocusedTabContext
      ? await getFocusedActiveTabInfo()
      : { title: null, url: null, id: null };

    const preferredTitle = focusedTab.title || downloadTab.title || null;
    const preferredUrl =
      focusedTab.url ||
      downloadTab.url ||
      downloadItem.url ||
      downloadItem.referrer ||
      "";

    return {
      hostname: getHostname(preferredUrl),
      tabTitle: extractTabTitle(preferredUrl, preferredTitle),
      contextSource: focusedTab.url
        ? `focused-tab${focusedTab.id ? `#${focusedTab.id}` : ""}`
        : downloadItem.tabId
          ? `download-tab#${downloadItem.tabId}`
          : downloadItem.url
            ? "download-url"
            : downloadItem.referrer
              ? "referrer"
              : "none",
      debug: {
        focusedTabTitle: focusedTab.title || "",
        focusedTabUrl: focusedTab.url || "",
        downloadTabTitle: downloadTab.title || "",
        downloadTabUrl: downloadTab.url || "",
      },
    };
  }

  // ---------- Core: Download Interception ----------
  // Prevent same downloadId from being processed twice
  const pendingDownloads = new Set();

  function handleDeterminingFilename(downloadItem, suggest) {
    // Prevent duplicate processing
    if (pendingDownloads.has(downloadItem.id)) {
      log.debug(`ID:${downloadItem.id} already processing, skip`);
      return false;
    }
    pendingDownloads.add(downloadItem.id);

    log.info(
      `[onDeterminingFilename] ID:${downloadItem.id} "${downloadItem.filename}"`
    );
    log.debug(
      `  URL: ${downloadItem.url}, tabId: ${downloadItem.tabId}, MIME: ${downloadItem.mime}`
    );

    // Async processing, outer sync return true tells Chrome to wait for suggest
    (async () => {
      try {
        // Skip specified extensions
        const skipExt = CONFIG.skipExtensions.map((e) => e.toLowerCase());
        const ext = getExtension(downloadItem.filename).toLowerCase();
        if (skipExt.includes(ext)) {
          log.info(`Skipping extension: .${ext}, using default name`);
          suggest({ filename: null });
          return;
        }

        const { hostname, tabTitle, contextSource, debug } =
          await getRenameContext(downloadItem);
        log.debug(
          `Metadata — source: ${contextSource}, hostname: ${hostname}, tabTitle: ${tabTitle}`
        );
        log.debug(
          `Context details — focusedTabUrl: ${debug.focusedTabUrl}, focusedTabTitle: ${debug.focusedTabTitle}, downloadTabUrl: ${debug.downloadTabUrl}, downloadTabTitle: ${debug.downloadTabTitle}`
        );

        // Request AI
        const newName = await fetchAiRename({
          filename: downloadItem.filename,
          tabTitle,
          hostname,
        });

        if (newName) {
          log.info(`AI rename: "${downloadItem.filename}" -> "${newName}"`);
          suggest({ filename: newName, conflictAction: "uniquify" });
        } else {
          suggest({ filename: null });
        }
      } catch (err) {
        log.error(`Processing error: ${err.message}`);
        suggest({ filename: null });
      } finally {
        pendingDownloads.delete(downloadItem.id);
      }
    })();

    // Critical: return true synchronously, Chrome waits for suggest to be called
    return true;
  }

  // ---------- Event Registration (Idempotent) ----------
  let initialized = false;
  function init() {
    if (initialized) {
      log.debug(`Already registered, skip duplicate init`);
      return;
    }
    initialized = true;

    if (typeof chrome.downloads.onDeterminingFilename !== "object") {
      log.error(`chrome.downloads.onDeterminingFilename not available`);
      return;
    }

    chrome.downloads.onDeterminingFilename.addListener(
      handleDeterminingFilename
    );
    log.info(`Registered onDeterminingFilename listener`);
  }

  // ---------- Startup ----------
  init();
})();
