English | [简体中文](modzh/ModConfig.md)

---

# ModConfig Design and Implementation Analysis

This document is based on [ModConfig.js](/Vivaldi7.9Stable/Javascripts/ModConfig.js) in the current workspace. There is no separate CSS file; styles are dynamically injected via JS.

## 1. Dependencies

### Vivaldi Internal APIs
- `chrome.tabs.query` -- Queries the current active tab to determine if the user is on the settings page
- `chrome.tabs.onUpdated` -- Monitors tab URL changes to detect settings page visibility
- `chrome.tabs.onActivated` -- Monitors tab switching to refresh settings panel injection state

### Browser APIs
- `navigator.storage.getDirectory()` (OPFS) -- Configuration file persistent storage
- `File System Access API` (`getFileHandle`, `getDirectoryHandle`) -- Read/write OPFS files
- `navigator.storage.estimate()` -- Query storage usage
- `CustomEvent` -- Configuration change notification mechanism

### Inter-mod Dependencies
- ModConfig is the configuration hub and is **depended on by other mods** (one-directional):
  - **TidyTabs** -- Listens for `vivaldi-mod-ai-config-updated` and `vivaldi-mod-config-updated`
  - **AskInPage** -- Listens for `ask-in-page-config-updated`
  - **Other Tidy-series mods** (TidyTitles, TidyDownloads, TidyAddress) -- Read AI configuration from the same config file
- ModConfig itself does not depend on any other mod.

## 2. Features

### Core Functionality

**Unified Configuration Panel**
- Injected below the "Appearance" section in the Vivaldi settings page
- Multi-panel switching: AI Config, Quick Capture, Arc Peek, Auto Hide Panel, Tidy Series, Workspace Theme
- Panels switch via a dropdown menu; each panel manages its corresponding mod's settings

**AI Configuration Management**
- Centralized management of API configuration for all AI mods
- Supports multiple provider presets: Custom, Z.ai, OpenRouter, DeepSeek, Groq, Mimo
- Each provider auto-fills apiEndpoint, modelsUrl, apiKeyUrl
- Supports per-module overrides (`ai.overrides`); different mods can use different APIs
- API Key show/hide toggle (eye button)
- Model selection: click "Fetch Models" to pull available model list from the API endpoint

**Mod Settings Management**
- Schema-based settings rendering: each input type (text, number, toggle, select, slider) is automatically rendered as the corresponding UI
- Independent settings panel for each mod (defined via `CONFIG_PANELS`)
- Settings changes are saved to OPFS in real-time

**Storage Management**
- OPFS file read/write (`.askonpage/config.json`)
- Storage usage and quota display
- Config export/import (JSON file)
- Restore default configuration

**Configuration Change Notifications**
- Dispatches three CustomEvents after saving:
  - `vivaldi-mod-ai-config-updated` -- AI configuration changed
  - `vivaldi-mod-config-updated` -- Mod settings changed
  - `ask-in-page-config-updated` -- AskInPage specific

### UI Components

- **Panel switch dropdown**: Custom dropdown component with keyboard navigation support
- **Settings input controls**: Text, number, toggle, dropdown, slider, color picker
- **Info button**: (i) icon next to each setting, shows help text on hover
- **Status bar**: Displays save status and error messages
- **Storage summary**: Shows OPFS usage/quota

## 3. Usage

### Installation
1. Place `ModConfig.js` in the Vivaldi resources directory
2. Include in `window.html`: `<script src="ModConfig.js"></script>`
3. ModConfig should be loaded before other AI mods

### Usage
1. Open Vivaldi settings (`vivaldi://settings`)
2. Navigate to the "Appearance" page
3. Scroll to the bottom and find the "MOD CONFIG" section
4. Use the panel switch dropdown to select the mod to configure
5. Changes are automatically saved to OPFS after modification

### Configuration File Location
- OPFS path: `.askonpage/config.json`
- Can be exported as a JSON file via the "Export" button
- Configuration can be imported via the "Import" button

## 4. Design Rationale

### Configuration Data Structure

```javascript
{
  schemaVersion: 3,
  ai: {
    default: {           // Base config shared by all AI mods
      provider: "",
      apiEndpoint: "",
      apiKey: "",
      model: "",
    },
    overrides: {         // Per-module overrides
      tidyTabs: { apiEndpoint: "...", model: "..." },
      askInPage: { apiKey: "..." },
    }
  },
  mods: {
    quickCapture: { ... },
    arcPeek: { ... },
    autoHidePanel: { ... },
    tidySeries: { enableStackColor: false },
    // ... other mod settings
  }
}
```

`ai.default` provides global defaults, while `ai.overrides` allows individual mods to override specific fields. When reading, both are merged (`Object.assign(base, override)`).

### OPFS as Configuration Storage

Reasons for choosing OPFS (Origin Private File System) over `chrome.storage`:
- File System API supports directory structures, making it easy to extend
- Not subject to the 100KB limit of `chrome.storage.sync`
- Isolated from the Vivaldi resources directory, not interfering with browser data
- Supports `navigator.storage.estimate()` for usage monitoring

### Settings Panel Injection Strategy

ModConfig injects into the Vivaldi settings page using the following strategy:

1. **Anchor positioning**: Finds the second element of `.setting-group.unlimited` as the insertion anchor
2. **Visibility detection**: Monitors `chrome.tabs.onUpdated` and `chrome.tabs.onActivated` to determine if the current tab is on `vivaldi://settings/appearance`
3. **Retry mechanism**: `scheduleInjectModSection` retries up to 8 times (150ms intervals) to handle delayed DOM rendering
4. **Auto-cleanup**: Automatically removes injected DOM when switching away from the settings page

### Schema-Driven Settings Rendering

`MOD_SETTING_SCHEMAS` defines each mod's settings. Format:

```javascript
{
  title: "Panel Title",
  settings: [
    { key: "enableStackColor", label: "Stack Color", type: "toggle", defaultValue: false },
    { key: "maxTabsForAI", label: "Max Tabs", type: "number", min: 1, max: 200, defaultValue: 50 },
  ]
}
```

The renderer automatically selects input controls based on the `type` field:
- `text` -> `<input type="text">`
- `number` -> `<input type="number">` (with min/max/step)
- `toggle` -> Custom toggle switch
- `select` -> Dropdown menu
- `slider` -> Range slider
- `color` -> Color picker

Setting DOM nodes carry a `data-mod-config` attribute; when saving, all nodes with this attribute are traversed to collect values.

### Provider Preset System

The `PROVIDERS` array defines preset AI provider configurations. When a provider is selected:
1. Auto-fills `apiEndpoint`
2. Sets `modelsUrl` (used by the Fetch Models feature)
3. Sets `apiKeyUrl` (used for the "Get API key" link)

The `deriveModelsUrl` function derives the models URL from the endpoint (replacing `chat/completions` with `models`).

### Configuration Merge Strategy

The `mergeConfig` function handles version compatibility for the config file:
1. Validates `schemaVersion`; uses default config if it doesn't match
2. Preserves unknown `mods` keys (forward compatibility)
3. Fills in default values for keys defined in `MOD_SETTING_SCHEMAS` but missing in the config
4. Supports both `EXPORT_FORMAT` wrapper and bare JSON when importing
