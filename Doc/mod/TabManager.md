English | [简体中文](modzh/TabManager.md)

---

# TabManager Design and Implementation Analysis

This document is based on [TabManager.js](/Vivaldi7.9Stable/Javascripts/TabManager.js) in the current workspace.

## 1. Dependencies

### Vivaldi Internal APIs

- `vivaldi.prefs.get(path)` / `vivaldi.prefs.set({path, value})` -- Read/write Vivaldi preferences, used to get workspace list and register WebPanels
- `vivaldi.prefs.onChanged.addListener()` -- Listen for preference changes
- `vivaldi.tabsPrivate.get(tabId)` -- Get tab extended data (`vivExtData`)
- See [api.md](/Doc/api/api.md)

### Chrome Extension APIs

- `chrome.tabs.query({})` -- Query all tabs
- `chrome.tabs.update(tabId, {active})` -- Activate tab
- `chrome.tabs.remove(tabId)` -- Close tab
- `chrome.tabs.onActivated` / `onCreated` / `onRemoved` / `onMoved` / `onUpdated` etc. -- Tab event listeners
- `chrome.windows.getCurrent()` / `chrome.windows.update()` -- Window operations

### External Dependencies

No external CDN dependencies. All CSS is dynamically injected via JS.

### Inter-Mod Dependencies

No direct dependencies. However, it reads the `fixedTitle` field from `vivExtData` (written by TidyTitles) to display custom titles.

## 2. Features

Workspace Tab Manager is a cross-workspace virtual tab kanban board that displays tabs from all workspaces in a grid layout within a Vivaldi sidebar WebPanel.

### Core Features

| Feature | Description |
|---------|-------------|
| Workspace Overview | Grid layout showing all workspaces simultaneously, one workspace per column |
| Tab Operations | Click to activate tab (auto-switches workspace), close tab |
| Tab Stack Display | Identifies `groupId` groupings, renders as collapsible tab stacks (with color dots) |
| Live Refresh | Listens to all tab events + preference changes, auto-refreshes with 120ms debounce |
| Snapshot Dedup | Generates snapshot key based on `stableStringify`, avoids redundant rendering when nothing changes |

### Displayed Information

Each tab shows: favicon (first letter fallback), title (prefers `fixedTitle`), audio/pinned status badges. Each workspace shows: icon/emoji/first letter, name, tab count.

## 3. Usage

1. Place `TabManager.js` into the `Javascripts/` directory of Vivaldi's resource folder
2. Include the script in `window.html`
3. The script automatically registers a WebPanel named "Workspace Board" in the sidebar
4. Click the board icon in the sidebar to open the cross-workspace tab kanban

## 4. Design Rationale

### WebPanel Registration Mechanism

Reads the existing WebPanel list via `vivaldi.prefs.get('vivaldi.panels.web.elements')`, and inserts a new entry if the target panel does not exist. Uses a fixed `webPanelId` (`WEBPANEL_workspace-board-b7d71f8f`) to ensure idempotency.

Also checks `vivaldi.toolbars.panel` and other toolbar configurations to ensure the panel button is registered. If not registered, finds the first `WEBPANEL_` position to insert.

### Native Webview Hiding

In `ensurePanelUI()`, the native webview is `blur()`-ed and set to `tabIndex = -1`, while `.webpanel-header` and `.webpanel-content` are hidden via CSS, replaced by custom `.workspace-board-content`.

### React Props Bridge

Vivaldi's UI is built on React. `getReactProps(element)` accesses React component event handlers by dynamically discovering the `__reactProps` key. This is key to enabling workspace switching:

1. `ensureWorkspacePopupOpen()` opens the workspace popup via React props' `onPointerUp`/`onClick`
2. `cacheHandlers()` caches the `onClick` handler for each workspace item in the popup
3. `activateWorkspaceByUI()` uses the cached handler to call directly, avoiding opening the popup each time

### synthPointer Synthetic Events

`synthPointer(target)` creates a simulated `PointerEvent` with correct `clientX`/`clientY` (obtained from the target element's `getClientRects()`), used to invoke React event handlers.

### Snapshot Dedup Rendering

`renderBoard()` uses `stableStringify` to generate a hash key of the current state, comparing it with the previous `currentSnapshotKey`. DOM is only rebuilt when the snapshot changes or `force=true`, avoiding performance issues from frequent events.

### DOM Builder Utility

`el(tagName, attrs, parent, children)` is a lightweight DOM factory function supporting:
- `text` / `html` properties for content
- `style` object for inline styles
- `events` object for event listener binding
- Nested child elements

### CSS Design Principles

- All CSS class names use the `wtm-` prefix to avoid conflicts with `common.css`
- Fully reuses Vivaldi CSS variables (`--colorTabBar`, `--colorFg`, `--colorBorder` etc.), automatically adapts to themes
- Tab row height 28px, favicon 16px, matching Vivaldi's native dimensions
- Responsive design: `@media (max-width: 600px)` reduces column width

### Observer Keep-Alive

`observe()` watches `#panels .webpanel-stack` for DOM changes (`childList` + `subtree`), calling `scheduleUpdatePanel()` to rebind UI when the panel rebuilds. Uses `requestAnimationFrame` debounce to avoid synchronous loops.
