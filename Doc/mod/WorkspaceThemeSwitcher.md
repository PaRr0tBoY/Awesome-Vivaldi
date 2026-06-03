English | [简体中文](modzh/WorkspaceThemeSwitcher.md)

---

# WorkspaceThemeSwitcher Design and Implementation Analysis

This document is based on [WorkspaceThemeSwitcher.js](/Vivaldi7.9Stable/Javascripts/WorkspaceThemeSwitcher.js) in the current workspace.

## 1. Dependencies

### Vivaldi Internal APIs
- `vivaldi.prefs.get()` - Read theme configuration and workspace info
- `vivaldi.prefs.set()` - Switch current theme
- `vivaldi.prefs.onChanged` - Listen for preference changes
- Configuration paths: `vivaldi.themes.current`, `vivaldi.themes.system`, `vivaldi.themes.user`, `vivaldi.workspaces`

### External Dependencies
- `navigator.storage.getDirectory()` (OPFS) - Persist configuration file (`.askonpage/config.json`)
- `chrome.i18n.getUILanguage()` - UI language detection

### Inter-Module Dependencies
- **VModToast** (`VividToast.js`) - Displays theme switch notifications via `window.VModToast?.show()`
- **ModConfig system** - Listens for `vivaldi-mod-config-updated` events to respond to config changes
- No corresponding CSS file

## 2. Features

### Core Functionality

Automatically applies preset theme color schemes when switching Workspaces in Vivaldi, achieving a one-to-one binding between workspaces and themes.

### Key Features

1. **Workspace-Theme mapping** - Assigns an independent theme to each Workspace; automatically switches themes when switching Workspaces
2. **Default theme memory** - Automatically records the current theme as the default on first use; Workspaces without mappings use the default theme
3. **Theme transition animation** - Creates a full-screen overlay on switch, captures the current background screenshot, and performs a 300ms gradient transition (cubic-bezier(0.22, 1, 0.36, 1))
4. **Theme resolution** - Supports referencing themes by theme ID or theme name, automatically searching system and user themes for matches
5. **Smart matching** - Workspace name matching supports exact and fuzzy matching (sorted by name length, takes the longest match)
6. **Multi-language support** - Detects language via `chrome.i18n.getUILanguage()`; Toast text supports Chinese and English
7. **Configuration persistence** - Default theme ID is persisted to `.askonpage/config.json` via OPFS

### Expected Behavior

- When switching Workspaces, the theme transitions smoothly to the preset theme within 300ms
- Workspaces without configured mappings use the default theme
- Toast notifications display the switch result (e.g., "Theme switched: Work -> Arc Dark")
- Configuration file updates trigger automatic reload of mapping relationships

## 3. Usage

### Installation

1. Copy `WorkspaceThemeSwitcher.js` to the Vivaldi resources directory
2. Add to `window.html`: `<script src="WorkspaceThemeSwitcher.js"></script>`
3. Depends on `VividToast.js` (must be loaded first)

### Configuration

Configure workspace-theme mapping through the ModConfig system (`.askonpage/config.json`):

```json
{
  "mods": {
    "workspaceThemeSwitcher": {
      "defaultThemeId": "theme-id",
      "workspaces": {
        "Work": "Arc Dark",
        "Study": "theme-id-xxx"
      }
    }
  }
}
```

- `workspaces` object: keys are Workspace names, values are theme IDs or theme names
- `defaultThemeId`: Default theme ID, automatically written on first run
- Theme references support IDs (e.g., `"1697534923"`) or names (e.g., `"Arc Dark"`)

### User Interaction

- Automatically triggered when switching Workspaces
- Edit mappings through ModConfig
- Toast notifications display switch results

### Tips

- Theme name matching is case-insensitive
- If multiple Workspace names contain the same substring (e.g., "Work" and "Workspace"), the longer name is matched first
- Config file modifications trigger the `vivaldi-mod-config-updated` event; no restart needed

## 4. Design Rationale

### Design Intent

Vivaldi's Workspace feature allows organizing tabs by context, but theme switching requires manual operation. This mod binds Workspaces to themes, reinforcing the contextual feel of workspaces through visual differentiation.

### Core Architecture Decisions

1. **OPFS configuration storage** - Uses `navigator.storage.getDirectory()` instead of `chrome.storage`, consistent with the ModConfig system; the config file can be shared across mods
2. **Theme caching and invalidation** - Caches the theme list (system themes + user themes); clears the cache via `invalidateThemeCache()` on config updates
3. **Transition animation design** - Captures the current theme background color to create an overlay, fades in the overlay first, switches the theme, then fades out; the 300ms cubic-bezier curve provides a natural easing effect
4. **Duplicate switch prevention** - Records `lastWorkspaceName` and `lastThemeId`; the same combination does not trigger repeatedly
5. **Workspace name matching** - Extracts the current Workspace name from `.workspace-name` or `[data-name="WorkspaceButton"]`, adapting to various DOM structures

### Key Implementation Details

- **Theme background extraction**: `extractThemeBackground()` reads the background color from theme configuration, used for the transition animation overlay
- **Workspace identification**: Obtains the Workspace list and currently active Workspace by parsing Vivaldi's vivExtData attribute
- **Async initialization**: `configReady` is a Promise, ensuring configuration is fully loaded before processing theme switches
- **Debouncing**: `lastWorkspaceName + lastThemeId` combination deduplication prevents repeated triggers from Workspace list changes

### Collaboration with Other Mods

- **VModToast** - Uses its `show()` method to display switch notifications; uses optional chaining `window.VModToast?.show()` to avoid hard dependencies
- **ModConfig** - Listens for `vivaldi-mod-config-updated` events for hot-reload support
- **OPFS sharing** - The config file path `.askonpage/config.json` is shared with other mods using ModConfig

---

*Source code approximately 327 lines, author: PaRr0tBoY*
