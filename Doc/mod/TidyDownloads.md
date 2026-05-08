English | [简体中文](modzh/TidyDownloads.md)

---

# TidyDownloads Design and Implementation Analysis

This document is based on [TidyDownloads.js](/Vivaldi7.9Stable/Javascripts/TidyDownloads.js) and [DownloadPanel.css](/Vivaldi7.9Stable/CSS/DownloadPanel.css) in the current workspace.

## 1. Dependencies

### Vivaldi Internal APIs
- `chrome.downloads.onDeterminingFilename` -- Intercepts the download filename determination event for dynamic renaming
- `chrome.tabs.get()` -- Retrieves download source tab information
- `chrome.tabs.query()` -- Queries the currently focused tab (fallback source info)

### External Dependencies
- `fetch()` -- Calls AI API for filename renaming
- `AbortController` / `AbortSignal.timeout()` -- Request timeout control
- `ReadableStream` -- Processes SSE streaming responses
- `TextDecoder` -- Decodes streaming response data
- `navigator.storage.getDirectory()` (OPFS) -- Reads AI configuration files
- `chrome.i18n.getUILanguage()` -- UI language detection

### Inter-mod Dependencies
- **VModToast** (`VividToast.js`) -- Displays rename result notifications via `window.VModToast?.show()`
- **ModConfig / AI Config System** -- Shares configuration through OPFS (`.askonpage/config.json`), supports hot-reload via `vivaldi-mod-ai-config-updated` event
- **DownloadPanel.css** -- Download panel style enhancements (progress bars, text shadows, etc.)

## 2. Features

### Core Functionality

When Vivaldi downloads a file, uses AI (large language models) to automatically rename the downloaded file to a more readable, meaningful name.

### Key Features

1. **AI-driven renaming** -- Calls LLM API to analyze the filename, tab title, and source domain, generating a concise and readable new filename
2. **Streaming response** -- Uses SSE (Server-Sent Events) to stream AI responses, reducing perceived latency
3. **Multiple AI provider support** -- Configuration presets multiple API endpoints:
   - GLM (Zhipu): `open.bigmodel.cn`
   - Mimo: `api.xiaomimimo.com`
   - OpenRouter: `openrouter.ai`
   - DeepSeek: `api.deepseek.com`
4. **Smart skip** -- Downloads from local addresses (localhost, 127.0.0.1, file://) are not renamed
5. **Extension preservation** -- After AI renaming, automatically checks and appends the original file extension
6. **Toast notification** -- Shows a notification after successful renaming (e.g., "Renamed: Arc 1.6.0.dmg")
7. **Duplicate registration prevention** -- Module-level `initialized` guard prevents duplicate listener registration when window.html re-executes
8. **Pending download tracking** -- `pendingDownloads` Set tracks download IDs currently being processed

### AI Renaming Rules (System Prompt)

- Preserves meaningful parts of the original filename
- Supplements context from tab title or website information
- Removes machine-generated IDs, hashes, serial numbers
- Normalizes date formats for brevity and readability
- Unifies casing and spacing
- Outputs a concise 2-4 word name
- Forces JSON format response: `{"newName": "string"}`

### Behavioral Expectations

- When a user downloads a file, the filename is AI-renamed before saving
- The renaming process is transparent to the user (streaming response, 15-second timeout)
- Toast displays original name vs. new name comparison
- Falls back to the original filename when API key is empty
- Uses the original filename on request failure, without blocking the download

## 3. Usage

### Installation

1. Copy `TidyDownloads.js` to the Vivaldi resources directory
2. Include in `window.html`: `<script src="TidyDownloads.js"></script>`
3. Include `DownloadPanel.css` in the CSS directory (optional, enhances download panel visuals)
4. Depends on `VividToast.js` (must be loaded first)

### Configuration

Configure via OPFS config file (`.askonpage/config.json`) or `AI_CONFIG` constant:

```javascript
const AI_CONFIG = {
  apiEndpoint: "https://open.bigmodel.cn/api/paas/v4/chat/completions", // API endpoint
  apiKey: "",           // API key (empty = disable renaming)
  model: "glm-4-flash", // Model name
  timeout: 15000,       // Request timeout (ms)
  temperature: 0.1,     // Generation temperature (lower = more deterministic)
  maxTokens: 1000,      // Maximum token count
};
```

```javascript
const CONFIG = {
  enabled: true,                              // Master switch
  skipKeywords: ["localhost", "127.0.0.1", "file://"], // Skip keywords
};
```

### Configuration Hot-Reload

Listens for the `vivaldi-mod-ai-config-updated` event; new configuration is applied automatically after the config file updates, without restarting the browser.

### Tips

- `temperature: 0.1` ensures highly deterministic renaming results
- `skipKeywords` is extensible; add domains that don't need renaming
- If the AI-returned name lacks an extension, the original extension is automatically appended
- Timeout is set to 15 seconds, balancing responsiveness and network fluctuation

## 4. Design Rationale

### Design Motivation

Browser download filenames often contain machine-generated IDs, timestamps, hashes, and other meaningless information (e.g., `document(1).pdf`, `a3f2b1c.zip`). This mod leverages AI to understand file context and automatically generate human-readable filenames.

### Core Architecture Decisions

1. **`onDeterminingFilename` API** -- This is the only Chrome API that can modify filenames before saving. Key constraint: the callback must synchronously return `true`, then asynchronously call `suggest()`. Incorrect Promise return patterns cause `suggest` to be ignored
2. **Streaming response handling** -- Uses SSE streaming to reduce perceived latency, decodes chunk by chunk and concatenates, extracts JSON from the complete response using regex
3. **Source info three-level fallback** -- Priority for obtaining tab info: focused tab > download tabId > download url > referrer > none
4. **JSON format enforcement** -- System Prompt requires AI to return `{"newName": "string"}` format, combined with low temperature for stable output, extracted via regex `\{"newName"\s*:\s*"([^"]+)"\}`
5. **Module-level initialization guard** -- `initialized` variable prevents duplicate `onDeterminingFilename` listener registration when window.html re-executes (this API can only be registered once)

### Key Implementation Details

- **Async suggest pattern**: `handleDeterminingFilename` synchronously returns `true` and calls `suggest()` inside an async IIFE. This is a Chrome API requirement
- **Extension protection**: AI may omit extensions (e.g., renaming `report.pdf` to `Quarterly Report`); the code checks the AI-returned extension and appends the original if missing
- **pendingDownloads Set**: Tracks download IDs currently being processed, preventing the same download from being processed multiple times
- **AbortController timeout**: Uses `AbortSignal.timeout(AI_CONFIG.timeout)` to control request timeout; falls back to the original filename on timeout
- **Response stream parsing**: Parses SSE data line by line (`data: ` prefix), concatenates all `choices[0].delta.content` fragments

### Collaboration with Other Mods

- **VModToast** -- Calls `VModToast.show()` to display notifications on rename success/failure
- **ModConfig System** -- Shares configuration via OPFS config file, supports runtime configuration updates
- **DownloadPanel.css** -- Provides visual enhancements for the download panel (progress bar styles, text shadows, animations), complementary to TidyDownloads.js functionality but not a hard dependency

---

*Source: approximately 467 lines (JS) + style file, author: PaRr0tBoY*
