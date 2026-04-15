/*
 * DownloadRename - AI 智能下载重命名模组
 * 基于 chrome.downloads.onDeterminingFilename 在下载时动态设置文件名
 *
 * 用法：
 * 1. 修改下方 CONFIG 配置（API 端点、密钥、模型）
 * 2. 复制到 <Vivaldi Dir>/Application/<Version>/resources/vivaldi/
 * 3. 在 window.html 中引入 <script src="DownloadRename.js"></script>
 * 4. 重启 Vivaldi
 */

(() => {
  "use strict";

  // ========== 配置区 ==========
  const CONFIG = {
    // OpenAI Compatible API 端点（末尾不带 /）
    apiEndpoint: "https://open.bigmodel.cn/api/paas/v4",

    // API 密钥
    apiKey: "",

    // 模型
    model: "glm-4-flash",

    // 请求超时（毫秒）
    timeout: 15000,

    // 是否启用 AI 重命名（false 则用原始文件名）
    enabled: true,

    // 跳过白名单关键词（URL 或文件名含这些词时不重命名）
    skipKeywords: ["localhost", "127.0.0.1", "file://"],

    // 跳过的文件扩展名
    skipExtensions: [],
  };
  // ============================

  const LOG_PREFIX = "[DownloadRename]";

  // ---------- 日志工具 ----------
  const log = {
    info: (...args) => console.log(`${LOG_PREFIX} [INFO]`, ...args),
    warn: (...args) => console.warn(`${LOG_PREFIX} [WARN]`, ...args),
    error: (...args) => console.error(`${LOG_PREFIX} [ERROR]`, ...args),
    debug: (...args) => console.log(`${LOG_PREFIX} [DEBUG]`, ...args),
  };

  // ---------- 工具函数 ----------
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
    // 去掉常见后缀
    return (tabTitle || "")
      .replace(
        /\s*[-_|]\s*(YouTube|Gmail|Google|Twitter|Facebook|GitHub|LinkedIn|Notion| Slack|Discord|Telegram|WeChat|WhatsApp).*$/i,
        ""
      )
      .trim();
  }

  function buildUserMessage({ filename, tabTitle, hostname }) {
    // Arc 风格：简洁的元信息
    const lines = [`Original filename: '${filename}'`];
    if (hostname) lines.push(`Source domain: '${hostname}'`);
    if (tabTitle) lines.push(`Source tab title: '${tabTitle}'`);
    return lines.join("\n");
  }

  // Arc 的系统提示词（英文直接用，不翻译保证 AI 理解）
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

  // ---------- AI 请求 ----------
  async function fetchAiRename({ filename, tabTitle, hostname }) {
    if (!CONFIG.enabled) return null;
    if (
      CONFIG.skipKeywords.some(
        (kw) => filename.includes(kw) || hostname?.includes(kw)
      )
    ) {
      log.debug(`跳过白名单: ${filename}`);
      return null;
    }

    const userMsg = buildUserMessage({ filename, tabTitle, hostname });

    const body = {
      temperature: 0,
      max_tokens: 1000,
      stream: true,
      model: CONFIG.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMsg },
      ],
      // Arc 风格：text 而非 json_object，手动解析 JSON
      response_format: { type: "text" },
      stream_options: { include_usage: true },
    };

    log.debug(`AI 请求体:`, body);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);

    try {
      const response = await fetch(`${CONFIG.apiEndpoint}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CONFIG.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const text = await response.text();
        log.error(`AI API 错误 ${response.status}: ${text}`);
        return null;
      }

      // 流式读取
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
            // 忽略解析失败
          }
        }
      }

      log.debug(`AI 原始响应: ${fullText}`);

      // 提取 newName
      const match = /"newName"\s*:\s*"([^"]+)"/.exec(fullText);
      if (match) {
        const newName = match[1].trim();
        // 保留原扩展名
        const ext = getExtension(filename);
        const aiExt = getExtension(newName);
        if (ext && !aiExt) {
          return `${newName}.${ext}`;
        }
        return newName;
      }

      log.warn(`无法从 AI 响应提取 newName: ${fullText}`);
      return null;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        log.error(`AI 请求超时 (${CONFIG.timeout}ms)`);
      } else {
        log.error(`AI 请求失败: ${err.message}`);
      }
      return null;
    }
  }

  // ---------- Tab 信息获取 ----------
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

  // ---------- 核心：下载拦截 ----------
  // 防止同一 downloadId 被处理两次
  const pendingDownloads = new Set();

  function handleDeterminingFilename(downloadItem, suggest) {
    // 防止重复处理
    if (pendingDownloads.has(downloadItem.id)) {
      log.debug(`ID:${downloadItem.id} 已在处理中，跳过`);
      return false;
    }
    pendingDownloads.add(downloadItem.id);

    log.info(
      `[onDeterminingFilename] ID:${downloadItem.id} "${downloadItem.filename}"`
    );
    log.debug(
      `  URL: ${downloadItem.url}, tabId: ${downloadItem.tabId}, MIME: ${downloadItem.mime}`
    );

    // 异步处理，外层同步返回 true 告知 Chrome 等待 suggest
    (async () => {
      try {
        // 跳过指定扩展名
        const skipExt = CONFIG.skipExtensions.map((e) => e.toLowerCase());
        const ext = getExtension(downloadItem.filename).toLowerCase();
        if (skipExt.includes(ext)) {
          log.info(`跳过扩展名: .${ext}，使用默认名`);
          suggest({ filename: null });
          return;
        }

        // 获取 tab 信息
        const { title, url } = await getTabInfo(downloadItem.tabId);
        const hostname = getHostname(
          downloadItem.url || url || downloadItem.referrer || ""
        );
        const tabTitle = extractTabTitle(url, title);
        log.debug(`元信息 — hostname: ${hostname}, tabTitle: ${tabTitle}`);

        // 请求 AI
        const newName = await fetchAiRename({
          filename: downloadItem.filename,
          tabTitle,
          hostname,
        });

        if (newName) {
          log.info(`AI 重命名: "${downloadItem.filename}" -> "${newName}"`);
          suggest({ filename: newName, conflictAction: "uniquify" });
        } else {
          suggest({ filename: null });
        }
      } catch (err) {
        log.error(`处理出错: ${err.message}`);
        suggest({ filename: null });
      } finally {
        pendingDownloads.delete(downloadItem.id);
      }
    })();

    // 关键：同步返回 true，Chrome 会等待 suggest 被调用
    return true;
  }

  // ---------- 事件注册（幂等） ----------
  let initialized = false;
  function init() {
    if (initialized) {
      log.debug(`已注册过，跳过重复初始化`);
      return;
    }
    initialized = true;

    if (typeof chrome.downloads.onDeterminingFilename !== "object") {
      log.error(`chrome.downloads.onDeterminingFilename 不可用`);
      return;
    }

    chrome.downloads.onDeterminingFilename.addListener(
      handleDeterminingFilename
    );
    log.info(`已注册 onDeterminingFilename 监听器`);
  }

  // ---------- 启动 ----------
  log.info(`========== DownloadRename 模组启动 ==========`);
  log.info(`API: ${CONFIG.apiEndpoint}/chat/completions`);
  log.info(`Model: ${CONFIG.model}`);
  log.info(`Enabled: ${CONFIG.enabled}`);
  log.info(`Skip keywords: ${CONFIG.skipKeywords.join(", ")}`);
  log.info(`Skip extensions: ${CONFIG.skipExtensions.join(", ")}`);

  if (CONFIG.apiKey === "YOUR_API_KEY_HERE") {
    log.warn(`⚠️ 请修改 CONFIG.apiKey 为你的 API 密钥！`);
  }

  init();
})();
