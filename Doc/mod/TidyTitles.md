English | [简体中文](modzh/TidyTitles.md)

---

# TidyTitles Design and Implementation Analysis

This document is based on [TidyTitles.js](/Vivaldi7.9Stable/Javascripts/TidyTitles.js) in the current workspace.

## 1. Dependencies

### Vivaldi Internal APIs

- `vivaldi.tabsPrivate.get(tabId)` -- Retrieve tab extension data (`vivExtData`)
- `chrome.tabs.query({currentWindow: true})` -- Query tabs in the current window
- `chrome.tabs.sendMessage(tabId, msg)` -- Send messages to a tab (used by `updateTabTitle`)
- See [api.md](/Doc/api/api.md) for details

### External Dependencies

- **OpenAI-compatible Chat Completions API** -- Called via `fetch`, supports GLM / Mimo / OpenRouter / DeepSeek endpoints
- **Browser native APIs**: `navigator.storage.getDirectory()` (OPFS), `chrome.i18n.getUILanguage()`

### Inter-mod Dependencies

- **VividToast** (`window.VividToast.show`) -- Toast notification system
- **TidyTabs** -- TidyTitles reads `vivExtData.tidyStackOwner === "TidyTabs"` to identify tab stacks managed by TidyTabs and avoid duplicate renaming

## 2. Features

TidyTitles is an AI-assisted tab title optimization and tab stack auto-renaming system.

### Feature 1: AI Title Optimization

For newly opened tabs, calls the AI API to generate a concise title, strips SEO noise and site names, and writes the result to `vivExtData.fixedTitle`.

| Property | Description |
|----------|-------------|
| Auto-trigger | MutationObserver monitors `.tab-strip` `childList` changes; new tabs are processed automatically |
| Deduplication | `processedTabs` Set records processed tabIds to avoid duplicate requests |
| Skip existing | Skips processing if `vivExtData.fixedTitle` already exists and not in forced mode |
| Loading animation | Adds `tidy-title-loading` CSS class to tabs being processed, showing a shimmer animation |
| Pinned tab handling | Re-processes pinned tabs when the `pinned-tab-url-replaced` event fires |
| Multi-language support | Detects browser language via `chrome.i18n.getUILanguage()`; AI responds in the corresponding language |

### Feature 2: Tab Stack Auto-Renaming

When a tab stack's member count changes, AI automatically generates a stack name, writes it to `vivExtData.fixedGroupTitle`, and optionally assigns a random color.

| Property | Description |
|----------|-------------|
| Trigger condition | Stack member count reaches a multiple of `dynamicRenameGap` (default: triggers every 5 tabs) |
| Cooldown protection | `STACK_RENAME_COOLDOWN_MS = 60s`, prevents frequent renaming |
| TidyTabs exclusion | Skips renaming if the stack is managed by TidyTabs (`tidyStackOwner === "TidyTabs"`) |
| Color assignment | When `enableStackColor` is on, selects from `STACK_COLORS` using weighted random, avoiding consecutive same colors |
| Shimmer animation | Stacks being renamed display the `tidy-stack-loading` CSS class |

### Configuration

| Key | Default | Description |
|-----|---------|-------------|
| `ai.apiEndpoint` | `https://open.bigmodel.cn/api/paas/v4/chat/completions` | AI API endpoint |
| `ai.apiKey` | `""` | API key (empty = skip title generation) |
| `ai.model` | `"glm-4-flash"` | Model name |
| `ai.temperature` | `0.1` | Temperature parameter |
| `ai.maxTokens` | `500` | Maximum token count |
| `tidySeries.enableStackColor` | -- | Whether to assign colors to tab stacks |
| `tidySeries.dynamicRenameGap` | `5` | Tab count interval for stack renaming |

Configuration is persisted via OPFS `.askonpage/config.json`, supporting a layered override structure with `ai.default` + `ai.overrides.tidyTitles`.

## 3. Usage

1. Fill in `apiKey` in `AI_CONFIG`, or configure via `.askonpage/config.json`
2. Place `TidyTitles.js` in the `Javascripts/` directory of the Vivaldi resources folder
3. Include the script in `window.html`
4. Newly opened tabs will automatically receive AI-optimized titles
5. When organizing tab stacks, stack names are generated automatically

## 4. Design Rationale

### AI Prompt Engineering

Key design points for the title optimization prompt:

1. **Role definition**: "You are a perfect editor, summarizer and translator"
2. **Task clarity**: Remove site names, SEO garbage, maintain specificity
3. **Output format**: JSON `{"title": "..."}` structured output with `response_format: {type: "json_object"}`
4. **Language adaptation**: `Write responses in ${languageName}` ensures output language matches the browser
5. **GLM special handling**: Detects `bigmodel.cn` endpoints and adds `thinking: "disabled"` and `include_reasoning: false` parameters

The stack name generation prompt collects all member tabs' `[hostname] title` list and asks the AI to return `{"name": "1-3 words"}` format. It additionally cleans GLM model chain-of-thought output wrapped in `<thought>` tags.

### vivExtData Field Usage

| Field | Writer | Description |
|-------|--------|-------------|
| `fixedTitle` | TidyTitles | AI-optimized tab title |
| `fixedGroupTitle` | TidyTitles | AI-generated stack name |
| `groupColor` | TidyTitles | Stack color (randomly assigned) |
| `tidyStackOwner` | TidyTabs | Stack manager identifier |
| `tidyStackId` | TidyTabs | Stack ID managed by TidyTabs |
| `group` | Vivaldi native | Tab stack UUID |
| `workspaceId` | Vivaldi native | Workspace ID |

### Double-Layer Observer Architecture

**Outer Observer** (`outerObserver`):
- Anchored to `#tabs-container` (persistent ancestor)
- Monitors `childList` + `subtree`
- Responsibility: Detect when `.tab-strip` is rebuilt, re-bind the inner Observer on rebuild

**Inner Observer** (`innerObserver`):
- Anchored to `.tab-strip`
- Monitors `childList` + `attributes` (class changes) + `attributeOldValue`
- Responsibility:
  - Newly added `.tab-wrapper` nodes trigger `processSingleTab`
  - `class` attribute changes restore the shimmer animation (`restoreShimmer`)
  - `.tab-position` transitioning from non-pinned to pinned triggers `processPinnedTabPosition`

### Shimmer Animation Restoration Mechanism

Vivaldi's JS directly modifies `.tab-wrapper`'s `className` (e.g., adding/removing `active`), which overwrites the `tidy-title-loading` class added by TidyTitles. `restoreShimmer()` checks and restores on every `attributes` change:

- Distinguishes numeric tabIds from UUID stackIds via the `data-id` attribute
- Numeric ID -> checks `processingTabs` Set
- UUID -> checks `stackIdsRenaming` Set

### Stack Member Tracking

Uses three Maps to maintain stack membership relationships:

```
tabToStack: Map<tabId, stackId>     -- Stack a tab belongs to
stackToTabs: Map<stackId, Set<tabId>> -- Set of members in a stack
stackColors: Map<stackId, groupColor> -- Color of a stack
```

`handleStackMembershipChange()` updates these indexes when a tab's `vivExtData.group` changes, and triggers rename scheduling for the old/new stacks.

### Language Detection Mapping

`getBrowserLanguage()` obtains the language code from `chrome.i18n.getUILanguage()`, and `getLanguageName()` maps it to an AI-readable language name (e.g., `"zh-CN"` -> `"Chinese"`, `"en"` -> `"English"`). Defaults to `"Chinese"` as fallback.

### Error Handling Strategy

- API 429 (rate limited): Silently skipped, `console.warn` instead of `console.error`
- API 401 (unauthorized): Error logged but does not block
- Empty response / format error: Returns the original title, allows retry (not added to `processedTabs`)
- Non-HTTP URLs: Skipped directly (`chrome://` and other special pages)

### Color Weight System

The `STACK_COLORS` array defines available colors, and `COLOR_WEIGHTS` defines the selection weight for each color. `randomStackColor()` uses weighted random selection, and the `RESTRICTED` set limits consecutive occurrences of certain colors.
