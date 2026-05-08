English | [简体中文](modzh/AskOnPage.md)

---

# AskOnPage Design and Implementation Analysis

This document is based on the [AskOnPage.js](/Users/acid/Desktop/VivaldiModpack/Vivaldi7.9Stable/Javascripts/AskOnPage.js) in the current workspace.

> **Scale**: 10424 lines / 447KB, the largest single-file mod in the project.
> **Version**: v2026.4.18 / UI v74
> **Author**: PaRr0tBoY

---

## 1. Dependencies

### 1.1 Vivaldi Internal APIs

| API | Purpose | Line |
|-----|---------|------|
| `vivaldi.prefs.get/set` | WebPanel registration, workspace data reading | L2760, L10240, L10264 |
| `vivaldi.tabsPrivate.get` | Retrieve tab extension data | L2782 |
| `vivaldi.historyPrivate` | Browsing history search (for history attachment) | L4694 |
| `chrome.contextMenus` | Context menu "Ask About Selection" / "Ask About Page" | L1475 |
| `chrome.scripting.executeScript` | Inject content extraction script into target tab | L3188 |
| `chrome.tabs` | `query`/`update`/`onActivated`/`onUpdated`/`onRemoved` | L733, L10369 |
| `chrome.runtime.onMessage` | Runtime message bridging (panel <-> content) | L1524 |
| `chrome.downloads.search` | Search downloaded files (for file attachment) | L3582 |

Reference: [Doc/api/api.md](/Users/acid/Desktop/VivaldiModpack/Doc/api/api.md)

### 1.2 Browser APIs

| API | Purpose |
|-----|---------|
| `indexedDB` | Persist directory handle (database name `ask-in-page-storage`, store `keyval`) |
| `FileSystem Access API` | Read/write conversation history and config files (directory `.askonpage`) |
| `navigator.clipboard` | Read files from clipboard (images/text) |
| `ReadableStream` + `getReader()` | SSE streaming read of AI responses |
| `AbortController` | Cancel in-progress API requests |
| `ResizeObserver` | Panel size change listener |
| `MutationObserver` | Detect DOM changes in `#panels .webpanel-stack`, trigger UI updates |
| `requestAnimationFrame` | Typewriter animation, scroll alignment |

### 1.3 Inter-Mod Dependencies

| Mod | Relationship | Description |
|-----|-------------|-------------|
| `VModToast` | Optional | Called via `window.VModToast?.show()`, silently degrades if unavailable |

No external JS library dependencies. Fully self-contained.

---

## 2. Features

### 2.1 Core Feature Overview

| Feature | Description |
|---------|-------------|
| AI Chat | Streaming SSE conversation with typewriter animation |
| Page Content Extraction | Auto-extract main body content from current tab (Readability algorithm) |
| Selection Ask | Floating "Ask" button appears after text selection |
| Context Menu | "Ask About Selection" / "Ask About Page" |
| @ Command Panel | Attach tabs, files, notes, browsing history as context |
| / Command System | 9 predefined slash commands (Analyze, Summarize, etc.) |
| Session History | IndexedDB + FileSystem Access API persistence, import/export support |
| Session Memory | Auto-summarize and compress long conversations, memory context injection |
| Markdown Rendering | Full markdown + LaTeX math formulas + code highlighting |
| Reasoning Display | Collapsible display for thinking/reasoning sections |
| Multi-language i18n | 12 languages (zh/en/ja/ko/es/fr/de/ru/pt/ar/hi) |
| WebPanel Registration | Auto-register as Vivaldi sidebar WebPanel |
| Standalone Tab Mode | Support opening in a dedicated tab (full-page mode) |

### 2.2 Slash Commands (/ Command System)

| ID | Name | Trigger | Aliases | Purpose |
|----|------|---------|---------|---------|
| `analyze` | Analyze | `/analyze` | ana, an, research | Analyze content for bias, patterns, trends, correlations |
| `summarize` | Summarize | `/summarize` | sum, summary, tl;dr | Concise summary |
| `explain` | Explain | `/explain` | exp, ex | Explain concepts in plain language |
| `rewrite` | Rewrite | `/rewrite` | reword, polish, revise | Rewrite to improve clarity and fluency |
| `shorter` | Shorter | `/shorter` | short, trim, compress | Compress without losing information |
| `translate` | Translate | `/translate` | translation, tl | Translate while preserving original meaning |
| `make-table` | Make table | `/maketable` | table, tabulate, grid | Reorganize content into a table |
| `extract-action-items` | Extract action items | `/extractactionitems` | actions, todo, nextsteps | Extract next steps and action items |
| `wrap-today` | Wrap today | `/wraptoday` | wrap today, today | Summarize browsing from the past 24 hours |

### 2.3 @ Command Panel (Attachment System)

Type `@` in the input box to trigger the suggestion panel. The following content types can be attached:

| Type | Description | Data Source |
|------|-------------|-------------|
| Tabs | Attach content snapshots from other tabs | `chrome.tabs.query` + `chrome.scripting.executeScript` |
| Files | Attach downloaded files, clipboard files, local files | `chrome.downloads.search` / `navigator.clipboard` / File Picker |
| Notes | Attach Vivaldi notes | `vivaldi.notesPrivate` API |
| History | Attach browsing history from the past 24 hours | `vivaldi.historyPrivate` |
| Formats | Attach formatting capability instructions | Built-in capability definitions |

---

## 3. Usage

### 3.1 Installation

1. Place `AskOnPage.js` in the Vivaldi resources directory:
   ```
   <Vivaldi Dir>/Application/<Version>/resources/vivaldi/
   ```
2. Add a script tag in `window.html`:
   ```html
   <script src="AskOnPage.js"></script>
   ```
3. Restart Vivaldi

### 3.2 AI Configuration

The `AI_CONFIG` object at the top of the file controls API connectivity:

```javascript
const AI_CONFIG = {
  apiEndpoint: "https://api.xiaomimimo.com/v1/chat/completions",
  apiKey: "sk-...",
  model: "mimo-v2-flash",
  timeout: 90000,
  temperature: 0.5,
  maxTokens: 4096,
};
```

Supported API providers (OpenAI-compatible format):
- GLM (bigmodel.cn) - Auto-enables thinking mode
- Groq, OpenRouter, DeepSeek, Xiaomi MiMo, etc.

Configuration can be overridden at runtime via `config.json` (stored in the `.askonpage` directory), and also supports hot-reload through `ask-in-page-config-updated` and `vivaldi-mod-ai-config-updated` events.

### 3.3 Basic Usage

1. **Sidebar Mode**: Click the Ask in Page icon in the sidebar to open the panel
2. **Selection Ask**: Select text on any page, a floating "Ask" button appears; clicking it auto-attaches the selected text
3. **Context Menu**: Right-click on selected text or a blank area of the page, choose "Ask About Selection" or "Ask About Page"
4. **Standalone Tab**: Open via the `vivaldi://ask-in-page` URL in a dedicated tab (supports `?sessionId=xxx` to restore sessions)

### 3.4 Input Box Operations

| Action | Description |
|--------|-------------|
| Type directly | Ask about the current page content |
| `@` | Open attachment suggestion panel (tab/file/note/history) |
| `/` | Open command panel (slash commands) |
| `@` + search term | Filter suggestion list |
| Enter | Send message |
| Shift+Enter | New line |

---

## 4. Design Rationale

### 4.1 Overall Architecture

```
waitForBrowser()
  |
  +-- injectStyles()           // Inject ~3000 lines of CSS
  +-- loadAskInPageConfig()    // Read config.json from FileSystem
  |
  +-- [standalone mode]        // vivaldi://ask-in-page URL
  |     +-- ensureStandaloneUI()
  |           +-- initPanelState()
  |
  +-- [panel mode]             // Normal browsing mode
  |     +-- createWebPanel()   // Register WebPanel to vivaldi.prefs
  |     +-- scheduleUpdatePanel()
  |     |     +-- ensurePanelUI()
  |     |           +-- initPanelState()
  |     +-- ensureSelectionAskButton()  // Floating Ask button
  |     +-- MutationObserver            // Monitor panel DOM changes
  |
  +-- registerAskInPageRuntimeBridge()  // chrome.runtime.onMessage
  +-- registerAskInPageContextMenus()   // Context menus
  |
  +-- chrome.tabs.onActivated  // Sync context on tab switch
  +-- chrome.tabs.onUpdated    // Prefetch snapshot on page load
  +-- chrome.tabs.onRemoved    // Clean up tab binding index
```

### 4.2 Dual-Mode Operation

The module supports two host modes, determined by `isAskInPageTabUrl(location.href)`:

**Panel Mode** (default):
- Registers as a Vivaldi WebPanel (`vivaldi.panels.web.elements`)
- UI mounts to `.webpanel-content` inside `#panels .webpanel-stack`
- Hides native webpanel header and content, replaces with custom UI
- Uses MutationObserver to detect panel rebuilds and re-mount

**Standalone Mode**:
- URL format: `vivaldi://ask-in-page[?sessionId=xxx&tabId=xxx]`
- UI mounts directly to `document.body`, hiding all other child elements
- Supports restoring a specific session via URL parameters

### 4.3 WebPanel Registration Flow

```javascript
// L10227 - createWebPanel()
vivaldi.prefs.get('vivaldi.panels.web.elements', (elements) => {
  // 1. Find existing element or create a new one
  element = {
    activeUrl: code,        // data:text/html encoded empty page
    faviconUrl: panelIcon,  // SVG icon
    id: webPanelId,         // 'WEBPANEL_ask-in-page-a1b2c3d4e5f6'
    mobileMode: true,
    resizable: false,
    title: name,            // 'Ask in Page'
    ...
  };
  // 2. Write to prefs
  vivaldi.prefs.set({ path: 'vivaldi.panels.web.elements', value: elementsArr });
  // 3. Ensure the panel toolbar contains this panel
  // Check vivaldi.toolbars.panel / navigation / status etc.
});
```

### 4.4 Content Extraction Algorithm

`getTabContentSnapshot()` injects a script into the target tab via `chrome.scripting.executeScript`:

1. **Noise Filtering**: Uses `IGNORED_SELECTORS` to exclude navigation, sidebars, comments, ads, etc.
2. **Candidate Scoring**: Iterates through `article, main, [role="main"], section, div` and similar elements, computing text density scores
3. **Best Candidate**: Selects the highest-scoring node as the main content
4. **Metadata Extraction**: `<title>`, `<meta description>`, JSON-LD, `<h1>-<h3>` headings, `<img alt>`
5. **Important Links**: Extracts `<a[href]>` links from the best candidate node
6. **Lightweight Prefetch**: `prefetchLightTabSnapshot()` provides title/URL preview for tab suggestions

### 4.5 Conversation Message Construction

When the user sends a message, `buildUserTurnPayload()` assembles multi-layered context:

```
System Prompt (role definition + language + instructions)
  |
  +-- <memory-context> (session memory summary)
  +-- <history-context> (browsing history, optional)
  +-- Previous conversation summary (buildConversationSummary)
  +-- Last N turns of conversation (CONVERSATION_MEMORY_CONFIG.recentTurns)
  |
  +-- Current user message:
      +-- Visible text (visibleText)
      +-- Attachment tokens (tab snapshots / files / notes / history)
      +-- Selected text (selected-text)
      +-- Text context (text-context)
      +-- Referenced Page (page snapshot: title, headings, mainText, metadata, links)
      +-- Referenced File (file preview)
```

### 4.6 Streaming Response Handling

```
fetch(apiEndpoint, { body, signal })
  |
  +-- ReadableStream.getReader()
  |     +-- SSE parsing: split by line, parse "data:" prefix
  |     +-- JSON parsing: delta.content / delta.reasoning_content
  |
  +-- Response Normalization Pipeline
  |     +-- createResponseNormalizationState()
  |     +-- appendNormalizedChunk() (accumulate per chunk)
  |     +-- finalizeNormalizedResponse()
  |           +-- splitTaggedThinkingContent() (separate <think> tags)
  |           +-- cleanModelText() (clean residual markers)
  |
  +-- Typewriter Animation (STREAM_UI_CONFIG)
  |     +-- charsPerSecond: base rate
  |     +-- punctuationPause: pause on punctuation
  |     +-- newlinePause: pause on newlines
  |     +-- requestAnimationFrame driven
  |
  +-- renderStreamingMarkdown() (incremental rendering)
        +-- splitStableMarkdown() (separate stable/unstable parts)
        +-- renderMarkdownToHtml() (full render)
```

### 4.7 Session Memory System

Long conversations are compressed via summarization to avoid exceeding the context window:

```
CONVERSATION_MEMORY_CONFIG:
  recentTurns: keep the last N turns as full conversation
  summaryChunkTurns: number of turns per summarization chunk

Flow:
  1. Take all turn nodes before targetIndex
  2. buildConversationSummary(): compress older turns into a summary
  3. Keep only the last recentTurns turns as full user/assistant messages
  4. Inject summary as a system message
```

### 4.8 Storage Architecture

Dual-layer storage design:

**IndexedDB** (lightweight key-value):
- Database: `ask-in-page-storage`
- Store: `keyval`
- Stores: persistent reference to FileSystem directory handle

**FileSystem Access API** (structured files):
- Root directory: user-selected directory (default `.askonpage`)
- Structure:
  ```
  .askonpage/
  +-- manifest.json        // Version metadata
  +-- config.json          // AI configuration overrides
  +-- indexes/
  |   +-- tabs.json        // Tab binding index
  |   +-- pages.json       // Page session index
  +-- sessions/
      +-- <sessionId>.json // Full session data
  ```

### 4.9 Token Payload System

Attachments (tabs, files, notes) are passed via serialized tokens:

```javascript
// Serialization: attachment -> URL-encoded JSON token
serializeTokenPayload(item) => encodeURIComponent(JSON.stringify({
  key, kind, title, iconText, refId, subtitle, content,
  textContextId, tokenRole, capabilityId, capabilityType, ...
}))

// Token DOM in the input box:
<span data-token="...">Tab Title</span>

// On send: parse all tokens, extract payloads, build user message
```

### 4.10 CSS Architecture

All styles are injected inline via `injectStyles()` (~94 `<style>` elements), using CSS variables with the `--aip-*` namespace:

| Variable | Purpose |
|----------|---------|
| `--aip-bg` | Panel background color |
| `--aip-surface` / `--aip-surface-strong` | Card/input box background |
| `--aip-elevated` | Floating layer background |
| `--aip-text-primary/secondary/muted` | Text color hierarchy |
| `--aip-accent` / `--aip-accent-dim` | Accent color |
| `--aip-border` / `--aip-border-hover` | Border |
| `--aip-chip-bg` | Tag/chip background |
| `--aip-shadow-base/mid/strong` | Shadow hierarchy |
| `--aip-r-xs/sm/md/lg/pill/full` | Border-radius presets |

Color values map to Vivaldi native variables (e.g., `--colorBg`, `--colorAccentBg`) to ensure consistency with the browser theme.

### 4.11 Key Design Decisions

1. **Single-file architecture**: All JS/CSS/HTML inlined in one file for easy distribution and installation
2. **OpenAI-compatible API**: Uses standard `/v1/chat/completions` format, compatible with any provider
3. **bigmodel.cn special handling**: Auto-detects GLM endpoint and enables `thinking: { type: 'enabled' }`
4. **uiVersion guard**: Increment `uiVersion` on each update; auto-cleans old UI on panel rebuild
5. **Duplicate initialization prevention**: `ASK_IN_PAGE_STORAGE_RUNTIME` singleton caches DB connection and directory handle
6. **Silent error degradation**: All async operations use `.catch(() => {})` to avoid unhandled Promise rejections
7. **promisifyChrome**: Unified conversion of callback-style Chrome APIs to Promises
