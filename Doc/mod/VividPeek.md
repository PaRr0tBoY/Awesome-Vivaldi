English | [简体中文](modzh/VividPeek.md)

---

# VividPeek Design and Implementation Analysis

This document is based on [VividPeek.js](/Vivaldi7.9Stable/Javascripts/VividPeek.js) and [ArcPeek.css](/Vivaldi7.9Stable/Dev/ArcPeek.css) in the current workspace.

## 1. Dependencies

### Vivaldi Internal APIs

- `vivaldi.thumbnails.captureTab` -- Full-page screenshot for preview cache
- `vivaldi.thumbnails.captureUI` -- Precise UI-area screenshot for source-rect capture and handoff snapshots
- `vivaldi.prefs.get / set` -- Read/write mod configuration (`mod.arcpeek.*`)
- `vivaldi.prefs.onChanged` -- Listen for configuration changes
- `chrome.tabs.query / get / create / update / remove` -- Tab lifecycle management
- `chrome.tabs.onActivated / onUpdated / onRemoved` -- Tab event listeners
- `chrome.windows.getLastFocused` -- Confirm window visibility
- `chrome.webNavigation.onCommitted / onDOMContentLoaded / onCompleted` -- Page navigation events, triggering injection
- `chrome.runtime.sendMessage / onMessage` -- Communication between host and page scripts
- `chrome.sessions.restore` -- Restore accidentally closed tabs (close guard mechanism)

### Browser APIs

- `webview.executeScript` -- Inject `WebsiteLinkInteractionHandler` into pages
- `MutationObserver` -- Monitor DOM changes on `#webview-container` / `#browser` / `#tabs-container` etc., sync layout
- `ResizeObserver` -- Monitor webview-container size changes, trigger layout sync
- `Element.animate()` -- Peek panel open/close/move animations (Web Animations API)
- `IntersectionObserver` -- Detect Peek panel visibility
- `visualViewport` -- Handle coordinate transformation under page zoom
- `crypto.randomUUID` -- Generate tile IDs and source tokens

### Inter-Mod Dependencies

- CSS file: `ArcPeek.css` provides all styles for the Peek container, panel, sidebar buttons, Nebula loading effect, etc.

## 2. Features

### Core Functionality

VividPeek (internal name ArcPeek) implements a "Peek" preview feature similar to Arc Browser: by using a modifier key + clicking a link (or long-pressing / middle-clicking), a floating panel with an embedded webview loading the target link pops up above the current page. Pages can be "lifted" from the panel into a new tab, split view, or opened in the current tab.

### Key Features

1. **Multiple trigger modes** -- Supports modifier key + click (Alt/Shift/Ctrl/Meta configurable), middle click, right click, and long-press triggers. Configured via `clickOpenModifiers` / `triggerButtons` / `longPressButtons` / `longPressDurationMs` in `ICON_CONFIG`
2. **Preview screenshot cache** -- `previewCache` generates a cache key from URL + text + geometry info, caching `captureUI` screenshots. On cache hit, it opens instantly in "preview mode" to avoid white screens. Cache limit is 48 entries, TTL 10 minutes
3. **Nebula loading animation** -- On open, the content area applies `blur + saturate + brightness` CSS filters, gradually reducing as the page loads (blur 2.2->0, saturate 18%->100%, brightness 90%->100%), combined with a progress bar to create an "emerging from fog" effect
4. **Source rect animation** -- `animatePeekMotion()` calculates geometric parameters (translate + scale + borderRadius) based on the source link's position on the page, creating a transition animation that "grows" from the link position to the panel's final position
5. **Sidebar control buttons** -- Floating on the right side of the panel, including: close (red on hover), new tab, split view, Reader View, copy link, and navigation (back/forward/refresh)
6. **Multi-Peek management** -- Supports opening multiple Peek panels simultaneously, `reconcilePeeks()` ensures consistency, `closeLastPeek()` closes the most recent one
7. **Related Tab Adoption** -- Optional feature; the webview inside a Peek is associated with a "runtime tab". When closing the Peek, the tab can be "lifted" to the tab bar, preserving browsing history and state
8. **Background Page Scaling** -- Optional feature; when Peek opens, a `peek-open` class is added to `body`, applying scale + filter effects to the background page
9. **Close Guard** -- `registerPeekCloseGuard()` detects accidental Cmd/Ctrl+W tab closures. If the closed tab within 1.5 seconds is the Peek's runtime tab, it automatically restores it (`chrome.sessions.restore`)
10. **Keyboard shortcuts** -- When Peek is open, intercepts Escape (close), Cmd+W (close), Cmd+R (refresh), Cmd+F (find), while preventing these shortcuts from bubbling to the host page

### Behavioral Expectations

- Peek panel is fixed within the webview-container viewport area, 80% width and 100% height
- Open animation uses `cubic-bezier(0.16, 0.88, 0.22, 1)` easing, duration approximately 400ms
- On close, executes a reverse animation back to the source link position, then removes the DOM
- The webview inside the panel is driven by a runtime tab created via `chrome.tabs.create`
- Link clicks inside Peek do not trigger new Peeks (`isInjectableWebview` excludes webviews inside `.peek-panel`)
- Peeks originating from panels (web panels) use `panelPointerBlocker` to prevent pointer event passthrough inside the panel

## 3. Usage

### Enabling

- Place `VividPeek.js` in the `Javascripts/` directory under the Vivaldi resources directory
- Place `ArcPeek.css` in the `CSS/` directory and import it in `Import.css`
- Add `<script src="Javascripts/VividPeek.js"></script>` in `window.html`
- Enable "Allow CSS Modification" in `vivaldi://experiments`

### User Interaction

- **Open Peek**: Alt + click a link (default), or middle-click, or long-press a link (mobile-friendly)
- **Close Peek**: Click the background area outside the panel, press Escape, press Cmd/Ctrl+W, or click the sidebar close button
- **Navigate**: Back/forward/refresh buttons in the sidebar
- **Open in new tab**: Click the new tab button in the sidebar; Peek content opens in a new tab and the panel closes
- **Split view**: Click the split button; the current tab and Peek content are displayed side by side
- **Reader View**: Click the Reader button; renders through web-highlights.com's reader mode
- **Copy link**: Click the copy button; writes the current Peek URL to the clipboard

### Configuration Options

Configuration object at the top of the code:

| Constant | Default | Description |
|---|---|---|
| `clickOpenModifiers` | `["alt"]` | Modifier key combinations that trigger Peek |
| `triggerButtons` | `["middle"]` | Mouse buttons that trigger Peek |
| `longPressButtons` | `["middle"]` | Buttons that trigger long-press |
| `longPressDurationMs` | `400` | Long-press trigger threshold (ms) |
| `autoOpenList` | `[]` | URL pattern list for auto-opening Peek |
| `scaleBackgroundPage` | `true` | Scale the background page when Peek opens |
| `PEEK_RELATED_TAB_ADOPTION_CONFIG.enabled` | `true` | Enable related tab adoption |

Animation parameters in `PeekMod.ARC_CONFIG`:

| Key | Default | Description |
|---|---|---|
| `glanceOpenAnimationDuration` | `400` | Open animation duration (ms) |
| `glanceCloseAnimationDuration` | `400` | Close animation duration (ms) |
| `previewFadeInRatio` | `0.18` | Preview fade-in as a ratio of total duration |
| `previewCacheLimit` | `48` | Preview cache entry limit |
| `previewCacheTtlMs` | `600000` | Preview cache TTL (10 minutes) |
| `webviewRevealSettleMs` | `120` | Settle wait before webview reveal |

### Tips

- Long-pressing a link shows a `peek-hold-press` visual feedback (CSS-driven press depth animation)
- After Peek opens, the source link is hidden (`arcpeek-source-hidden` class) and restored on close
- Adding URL patterns to `autoOpenList` enables automatic Peek for specific sites

## 4. Design Rationale

### Design Intent

Port Arc Browser's Peek preview experience to Vivaldi. Core goal: preview link content without leaving the current page, reducing the decision cost of creating tabs. Users can "take a glance" before deciding whether to truly open it.

### Core Architecture

**Three main classes collaborating**:

```
PeekMod (host side)
  ├── Manages webviews Map (master lifecycle state table)
  ├── Creates/destroys Peek DOM and webview
  ├── Animation engine (animatePeekMotion)
  ├── Preview cache (previewCache)
  └── Keyboard shortcuts and close guard

WebsiteInjectionUtils (injection management)
  ├── Listens to webNavigation events
  ├── MutationObserver detects new webviews
  ├── Injects WebsiteLinkInteractionHandler into active webviews
  └── Manages injection throttling and retries

WebsiteLinkInteractionHandler (page side)
  ├── Listens to pointerdown/pointerup/mouseup events
  ├── Detects modifier key + click combinations
  ├── Long-press detection and visual feedback
  ├── Records source link snapshot (position, size, viewport info)
  └── Notifies host via chrome.runtime.sendMessage
```

**Message flow**:

```
Page link event → WebsiteLinkInteractionHandler
  → chrome.runtime.sendMessage({ url, fromPanel, rect, meta })
  → PeekMod.openPeek()
  → PeekMod.showPeek() → buildPeek()
```

### Key Implementations

**Preview cache strategy**: `getPreviewCacheKey()` concatenates URL + link text + position/size as the key. `ensurePreviewAsset()` returns the cache first; otherwise initiates a `captureUI` screenshot task, deduplicated via the `previewCaptureTasks` Map. Cache uses an LRU strategy (`previewCacheLimit: 48`), with expired entries auto-cleaned.

**Nebula loading effect**: In `buildPeek()`, CSS filter values are gradually adjusted across the webview's `loadstart` / `loadcommit` / `contentload` / `loadstop` events. The 4-stage filter parameters progress: initial blur (blur 2.2, sat 18%) -> after commit (blur 1.05, sat 48%) -> after content (blur 0.25, sat 88%) -> complete (blur 0, sat 100%). `disperseNebulaLayer()` executes a center-expanding clip-path animation on completion.

**Source rect resolution**: `resolveSourceRect()` handles multi-coordinate-system transformations. Page coordinates -> host UI coordinates require: getting the webview's `getBoundingClientRect` -> adding the page rect offset to the webview rect -> accounting for `visualViewport`'s offsetLeft/offsetTop and scale. `sourceViewportHint` stores the source rect's ratio relative to the viewport, used for re-projection after panel layout changes.

**Unified close path**: All close paths (Escape, Cmd+W, background click, sidebar button, source tab close) ultimately converge at `disposePeek()`. This function handles: re-entry prevention (`isDisposing` flag), cleanup of listeners and timers, executing the close animation, deleting the DOM, restoring source link visibility, closing the runtime tab, and sending a `peek-closed` message.

**Close Guard against accidental closure**: `registerPeekCloseGuard()` listens to `chrome.tabs.onRemoved`. If the closed tab within 1.5 seconds is the Peek's runtime tab, it calls `chrome.sessions.restore()` to restore it. Simultaneously, `lockPeekPanelLayout()` freezes the panel layout during the guard's active period to prevent layout flickering during the restore process.

### Collaboration Patterns

- `WebsiteInjectionUtils` injects `WebsiteLinkInteractionHandler` via `webview.executeScript`. Injection points include `onCommitted`, `onDOMContentLoaded`, `onCompleted`, and when `MutationObserver` detects new webviews
- Injection has a throttling mechanism (`injectThrottleState` WeakMap) to avoid repeated injection from high-frequency navigation events
- `isInjectableWebview()` excludes webviews inside Peek panels (those within `.peek-panel`) and non-scriptable tabs
- `IconUtils` preferentially clones native SVG icons from the Vivaldi UI (e.g., back, forward, refresh), falling back to inline SVGs
- Related Tab Adoption uses `vivExtData` to mark ArcPeek source info on tabs, supporting cross-Peek tab reuse
