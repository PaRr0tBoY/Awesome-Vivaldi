English | [简体中文](modzh/TidyAddress.md)

---

# TidyAddress Design and Implementation Analysis

This document is based on [TidyAddress.js](/Vivaldi7.9Stable/Javascripts/TidyAddress.js) in the current workspace.

## 1. Dependencies

### Vivaldi Internal APIs

- **`chrome.tabs.get`**: Get active tab title for AI slug generation
- **`chrome.tabs.query`**: Query current active tab

### External Dependencies

- **MutationObserver**: Watch `#browser` DOM changes, `#urlFieldInput` attribute changes, `<title>` element changes
- **fetch API**: Call AI Chat Completions endpoint
- **localStorage**: Cache generated slugs (key: `vivid-address-cache-v1`, limit 600 entries)
- **navigator.storage.getDirectory()**: Read ModConfig shared configuration

### Inter-Mod Dependencies

- **AskInPage / ModConfig AI System**: Read `ai.tidyAddress` config from `.askonpage/config.json` via the `vivaldi-mod-ai-config-updated` event

## 2. Features

Replaces verbose URL paths in the address bar with AI-generated readable slugs, while keeping the actual URL unchanged.

### Core Features

- AI generates concise 1-4 word slugs, rendered after the domain in the address bar
- Local cache (600 entry limit, LRU eviction), avoids redundant API calls
- Multi-source triggers: URL change, tab switch, DOM rebuild
- Auto-skip for non-HTTP pages (chrome://, about:, etc.)
- Falls back to raw path when apiKey is empty

### AI Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `apiEndpoint` | GLM API | Chat Completions endpoint |
| `apiKey` | Empty | API key, falls back when empty |
| `model` | `glm-4-flash` | Model name |
| `timeout` | 0 (no timeout) | Fetch timeout |
| `temperature` | 0.1 | Generation temperature |
| `maxTokens` | 80 | Maximum token count |

Supported API endpoints: GLM, Mimo, OpenRouter, DeepSeek, and other OpenAI-compatible interfaces.

### Cache State Machine

```
[New URL] -> loading -> ready (has slug)
                     -> fallback (no slug, has path)
                     -> skip (no slug, root path / no path)
```

## 3. Usage

### Enable

1. Place `TidyAddress.js` in Vivaldi's resource directory and add to `window.html`
2. Configure AI key in `.askonpage/config.json`

### Configuration

```json
{
  "ai": {
    "default": {
      "apiEndpoint": "https://open.bigmodel.cn/api/paas/v4/chat/completions",
      "apiKey": "your-key",
      "model": "glm-4-flash"
    },
    "overrides": {
      "tidyAddress": {
        "model": "deepseek-chat"
      }
    }
  }
}
```

`overrides.tidyAddress` overrides matching fields in `default`.

### Visual Effects

- Loading state: hides original path portion, shows loading indicator
- Ready state: domain + AI slug (grey lowlight color), original path hidden by CSS
- When clicking the address bar to edit, full URL is shown (slug node hidden by CSS)

## 4. Design Rationale

### Design Intent

Modern web URLs are often long and meaningless (e.g., `/articles/2026/05/08/a1b2c3d4`). TidyAddress uses AI to extract page semantics, generating readable identifiers like "Vivaldi CSS Mod Guide" to help users quickly identify the current page.

### Core Architecture

The **VividAddress class** is the core of the mod, managing:

1. **Observer Layer**: Three MutationObservers watching `#browser` (DOM rebuild), `#urlFieldInput` (URL change), and `<title>` (title change)
2. **Sync Layer**: `scheduleSync()` uses `requestAnimationFrame` debounce, `sync()` polls every 400ms as a fallback
3. **AI Layer**: `requestSlug()` -> `generateSlug()` -> `buildPrompt()` -> fetch API
4. **Cache Layer**: `loadCache()` / `saveCache()` persists via localStorage

### Key Implementation Details

**Multi-Source URL Detection**: `getCurrentContext()` prioritizes reading `#urlFieldInput.value`, falling back to `webpageview.active.visible webview[src]`. This ensures correct URL retrieval for both address bar input and tab switching.

**AI Prompt Design**: Requests JSON `{"slug":"..."}` format, paired with `response_format: { type: "json_object" }`. Prompt rules are explicit: no domain, no protocol, no query parameters, 1-4 words.

**API Compatibility**: Sets `thinking: { type: "disabled" }` for GLM API to disable chain-of-thought; sets `include_reasoning: false` for other APIs. Determined by regex `/bigmodel\.cn/`.

**Style Injection Strategy**: Uses `data-vivid-address-state` attribute to drive CSS state transitions:
- `loading`: hides original path, shows slug node (hidden state)
- `ready`: hides original path, shows slug node
- No attribute: restores original display

**UrlObfuscationWarning Hiding**: Vivaldi's built-in URL obfuscation warning is hidden via `display: none` to avoid conflict with slug display.
