English | [简体中文](modzh/TidyTabs.md)

---

# TidyTabs Design and Implementation Analysis

This document is based on [TidyTabs.js](/Vivaldi7.9Stable/Javascripts/TidyTabs.js) in the current workspace, used alongside CSS files `TidyTabs.css` and `ClearTabs.css`.

## 1. Dependencies

### Vivaldi Internal APIs
- `chrome.tabs.query` -- Query all tabs in the current window
- `chrome.tabs.move` -- Move tabs to a specified position
- `chrome.tabs.update` -- Update tab's `vivExtData` (stack name, color, etc.)
- `chrome.tabs.get` -- Get details of a single tab
- `chrome.tabs.remove` -- Close tabs
- `chrome.webNavigation.onCommitted` -- Listen for navigation events to trigger auto-stack grouping
- `chrome.runtime.lastError` -- Error checking

### Browser APIs
- `MutationObserver` -- Monitor `.tab-strip` DOM changes (tab additions/removals, stack structure changes)
- `navigator.storage.getDirectory()` (OPFS) -- Read shared configuration file
- `fetch` -- Call LLM API (OpenAI-compatible format)
- `crypto.randomUUID` -- Generate stack IDs

### Inter-Module Dependencies
- **ModConfig** -- Reads AI configuration and mod settings via OPFS file `.askonpage/config.json`
  - Listens for `vivaldi-mod-ai-config-updated` events to receive AI config changes
  - Listens for `vivaldi-mod-config-updated` events to receive mod setting changes
- **CSS dependencies**: `TidyTabs.css` (tab stack styles), `ClearTabs.css` (clear button styles)

## 2. Features

### Core Functionality

**AI Smart Grouping**
- Calls OpenAI-compatible API to semantically group all tabs in the current window by topic
- Supports any OpenAI-compatible endpoint (GLM, OpenRouter, DeepSeek, Groq, Mimo, etc.)
- AI returns a JSON-formatted grouping plan containing group names and tab index lists
- Tabs not grouped by AI are placed in the "Others" group
- Skips AI grouping when API key is empty

**Domain-based Grouping**
- Groups by URL base domain; tabs from the same domain are placed in the same group
- Serves as an alternative to AI grouping

**Automatic Stack Creation**
- Converts grouping results into Vivaldi Tab Stacks
- Sets stack ID, group name, and color via `chrome.tabs.update`'s `vivExtData`
- Moves tabs to target positions first, then performs stack operations

**Stack Naming**
- AI smart naming: calls LLM to generate short descriptive names for unnamed stacks
- Writes to `vivExtData.fixedGroupTitle`
- Multi-language support: adjusts "Others" group name based on browser language

**Stack Coloring**
- Automatically assigns random colors to colorless stacks
- Colors are written to `vivExtData.groupColor`
- Controlled by ModConfig's `enableStackColor` setting

**Tab Cleanup**
- "Close Below" button next to separators, one-click close all tabs below that separator
- "Tidy" button next to separators, triggers the grouping operation

**Workspace Auto-Stack**
- Configure `autoStackWorkspaces` list; switching to specified workspaces automatically triggers grouping
- Workspace switching is detected via `chrome.webNavigation.onCommitted`

### UI Components

- **Tidy button**: Inserted next to separators in `.tab-strip`, triggers grouping
- **Clear button**: Inserted next to separators, closes tabs below
- Buttons are attached via `scheduleAttachButtons` with delay to avoid conflicts with Vivaldi DOM operations

## 3. Usage

### Installation
1. Place `TidyTabs.js` in the Vivaldi resources directory
2. Add `<script src="TidyTabs.js"></script>` to `window.html`
3. Also import `TidyTabs.css` and `ClearTabs.css`

### Configure AI
Configure through the ModConfig settings panel (recommended):
- Provider: Select a preset provider or Custom
- API Endpoint: Full chat completions URL
- API Key: Provider API key
- Model: Model name

You can also directly modify the `AI_CONFIG` object in the script (not recommended, will be overridden by ModConfig).

### Configure Mod Behavior
Through ModConfig's Tidy Series panel:
- `enableStackColor`: Whether to automatically color stacks
- `autoStackWorkspaces`: Array of workspace names that need auto-stack grouping

### Trigger Methods
- Click the **Tidy** button next to a separator
- Switch to a workspace configured for auto-stacking

## 4. Design Rationale

### Dual-Channel Configuration Architecture

TidyTabs reads configuration from OPFS via two paths:

1. **AI config** (`applySharedAiConfig`): Takes base values from `ai.default`, overridden by `ai.overrides.tidyTabs`
2. **Mod settings** (`applyModSettings`): Reads behavior toggles from `mods.tidySeries`

Both paths independently read the same file, each taking the fields it needs. Configuration changes are pushed in real-time via CustomEvent, no polling required.

### Separator-Driven UI Model

In the Vivaldi tab bar, separators (`.separator`) naturally divide different tab groups. TidyTabs leverages this structure:
- Separators = group boundaries
- Buttons are attached after the separator DOM node
- `getSeparatorKey` generates unique keys in `owned::index` format to locate separators

### Dual-Layer Observer Pattern

When Vivaldi switches workspaces, it rebuilds the `.tab-strip` DOM. A single-layer MutationObserver would lose its anchor.

Solution:
1. **Outer Observer**: Monitors `#browser` (persistent ancestor) to detect when `.tab-strip` is rebuilt
2. **Inner Observer**: Monitors changes inside `.tab-strip` (tab additions/removals, stack structure changes)

When the outer layer detects a rebuild, it disconnects the old inner Observer and re-binds to the new `.tab-strip`.

### Sequential Guarantee for Stack Operations

In `createTabStabcks`, tab movement and stack operations must execute strictly sequentially (`await` one by one), not in parallel. Reasons:
- `chrome.tabs.move` changes tab indices; parallel execution causes position errors
- `vivExtData` writes depend on the previous step completing

### Fault Tolerance in AI Grouping

- Timeout control: Supports optional `timeout` parameter; automatically aborts on timeout
- Response parsing: Extracts JSON from LLM-returned text, tolerating markdown code block wrapping
- Result validation: `validateAIGroups` checks grouping structure legality
- Orphan handling: Tabs not grouped by AI are automatically placed in "Others"
- Silent failure: API call failures trigger a toast notification without blocking subsequent operations

### processingSeparators Debounce

Uses a `Set` to track separators currently being processed, preventing duplicate grouping operations. After completion, calls `scheduleAttachButtons` with a delay to re-attach buttons.
