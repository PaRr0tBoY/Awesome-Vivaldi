English | [简体中文](modzh/PinnedTabRestore.md)

---

# PinnedTabRestore Design and Implementation Analysis

This document is based on [PinnedTabRestore.js](/Vivaldi7.9Stable/Javascripts/PinnedTabRestore.js) and [PinnedTabRestore.css](/Vivaldi7.9Stable/CSS/PinnedTabRestore.css) in the current workspace.

## 1. Dependencies

### Vivaldi Internal APIs

- **`chrome.tabs.get`**: Get tab info and `vivExtData`
- **`chrome.tabs.update`**: Modify tab `vivExtData` and restore URL
- **`chrome.tabs.query`**: Query all tabs in the current window
- **`chrome.tabs.onUpdated`**: Listen for tab pin/unpin and URL changes
- **`chrome.scripting.executeScript`**: Inject modifier key tracker into page MAIN world
- **`tab.vivExtData`**: Vivaldi extension data field, used to store original URL

### External Dependencies

- **MutationObserver**: Listen for changes inside `.tab-strip` and structural changes in `#browser`
- **requestAnimationFrame**: Modifier key polling loop
- **Google Favicon API**: `https://www.google.com/s2/favicons?domain=...&sz=32` for fetching the original URL's favicon

### Inter-Mod Dependencies

No direct inter-mod dependencies.

## 2. Features

Tracks URL changes on pinned tabs, providing visual indicators and one-click restore when the URL is navigated to another page.

### Core Features

- Automatically record original URL to `vivExtData.originalPinnedUrl` when a tab is pinned
- Show a Zen-style visual indicator on the tab when URL changes (favicon area overlay button + divider + original URL sublabel)
- Dynamically switch sublabel text based on modifier keys on hover
- Right-click context menu with three operations: restore to original URL / replace original URL with current / detach as independent tab
- Auto-scan and restore all modified pinned tabs on startup
- Dual-layer MutationObserver ensures re-binding after `.tab-strip` rebuilds

### Modifier Key Behavior (on hover)

| Key | Sublabel Text | Click Behavior |
|-----|---------------|----------------|
| None | "Back to pinned url" | Restore to original URL |
| Alt | "Replace pinned url with current" | Set current URL as the new pinned URL |
| Cmd/Ctrl | "Separate from pinned tab" | Unpin and keep current URL |

## 3. Usage

### Enable

1. Place `PinnedTabRestore.js` in Vivaldi's resource directory and add to `window.html`
2. Place `PinnedTabRestore.css` in the CSS directory

### Interaction

- After a pinned tab's URL is modified, a reset button appears in the favicon area
- Hover over the tab header to see the original URL sublabel
- Click the reset button to restore the original URL
- Right-click the tab header to open a context menu for operation selection

### Startup Restore

When `RESTORE_ON_STARTUP = true`, the first scan after browser startup automatically restores all modified pinned tabs to their original URLs.

## 4. Design Rationale

### Design Intent

Vivaldi's pinned tabs do not automatically restore when navigating to a new page. A user might pin a tab for their email, then follow links within that tab, causing the pinned tab to "get lost." PinnedTabRestore records the original URL at pin time, providing one-click rollback.

### Core Architecture

```
init()
  -> setupTabListeners()     // chrome.tabs.onUpdated for pin/unpin
  -> setupContextMenu()      // Right-click menu injection
  -> observeTabStripInner()  // Inner Observer: watch .tab-strip child node changes
  -> observeStructure()      // Outer Observer: watch #browser for .tab-strip rebuild
  -> scanAllPinnedTabs(true) // First scan + restore
```

### Key Implementation Details

**Data Persistence**: Uses Vivaldi's `vivExtData` field (written via `chrome.tabs.update` as a JSON string) to store `originalPinnedUrl`. This is more reliable than localStorage because data is bound to the specific tab and persists across windows.

**Modifier Key Tracking**: Since `window.html` scripts cannot directly receive in-page keyboard events, an injection approach is used:
1. `injectModTracker()` injects event listeners into the active tab via `chrome.scripting.executeScript({ world: 'MAIN' })`
2. `pollModifiers()` reads the `window.__ptr_modifiers` state on the page through a `requestAnimationFrame` loop
3. A `_modTrackGen` algebraic counter prevents stale async callbacks from corrupting state

**Dual-Layer Observer**:
- Inner (`observeTabStripInner`): Watches `.tab-strip` child node changes, triggers re-tagging
- Outer (`observeStructure`): Watches `#browser` subtree changes, detects if `.tab-strip` has been rebuilt (e.g., workspace switch). On rebuild, rebinds the inner Observer and calls `scanAllPinnedTabs(false)` (tag only, no restore)

**Startup Restore vs DOM Rebuild Distinction**: The `restore` parameter of `scanAllPinnedTabs(restore)` controls whether to actually call `chrome.tabs.update` to restore URLs. At startup `restore=true`; on DOM rebuild `restore=false` only re-injects the UI.

**UI Injection Structure**:
```
.tab-wrapper[pinned-changed="true"]
  -> .tab
    -> .tab-header
      -> .tab-reset-pin-button  (absolute overlay on favicon, shows original favicon)
      -> .pinned-tab-divider    (vertical line separator)
      -> .favicon
      -> .title
      -> .pinned-tab-sublabel   (shows original URL path)
```

**URL Comparison**: Ignores hash fragments (`split("#")[0]`), preventing anchor changes from being misidentified as URL modifications.
