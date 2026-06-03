English | [简体中文](modzh/InteractionFeedback.md)

---

# InteractionFeedback Design and Implementation Analysis

This document is based on [InteractionFeedback.js](/Vivaldi7.9Stable/Javascripts/InteractionFeedback.js) and [InteractionFeedback.css](/Vivaldi7.9Stable/CSS/InteractionFeedback.css) in the current workspace.

## 1. Dependencies

### Vivaldi Internal APIs

- **`chrome.tabs.query`**: Queries all tabs in the current window (tiled tab detection)
- **`chrome.tabs.get`**: Retrieves tab information
- **`chrome.tabs.onCreated` / `onRemoved` / `onActivated` / `onUpdated`**: Tab event listeners (auto-hide pulse)
- **`chrome.scripting.executeScript`**: Injects gesture trail renderer into the page's MAIN world
- **`tab.vivExtData`**: Reads tiling information

### External Dependencies

- **MutationObserver**: Monitors `#webpage-stack` child node changes (tiled tab detection)
- **Canvas API**: Gesture trail rendering
- **requestAnimationFrame**: Trail point sampling and fade-out animation

### Inter-mod Dependencies

- **ArcPeek**: The `autoHidePulse` feature checks the `window.__arcPeekOpening` flag to avoid triggering the pulse when ArcPeek is opening

## 2. Features

Four independent interaction feedback sub-features, individually toggled via the top-level `CONFIG` object.

### Feature 1: Tiled Tab Indicator

Vivaldi tiled tabs are already side-by-side in the tab bar; this feature adds Zen-style visual merging:
- Detects tiled groups (dual-source detection via DOM and vivExtData.tiling)
- Injects a unified background element (`.if-tiled-bg`)
- Adds connector classes (`.if-tiled-connector`), position classes (`.if-tiled-first/middle/last`), active class (`.if-tiled-active`)
- First and last tabs have rounded corners removed; middle tabs have both sides' rounded corners removed
- Vertical separators displayed between tabs within a tiled group
- Active tab highlighted background

Default: `enabled: false`, requires manual activation.

### Feature 2: Mouse Gesture Trail

Draws a fading trail line on the page during right-click drag:
- Injected into the current active tab via `chrome.scripting.executeScript({ world: 'MAIN' })`
- Uses `requestAnimationFrame` to poll mouse position (Vivaldi's gesture system intercepts mousemove; polling bypasses this)
- Full-screen Canvas overlay with `pointer-events: none` to avoid blocking interaction
- 300ms fade-out animation after releasing the right mouse button

Default: `enabled: false`, requires manual activation.

### Feature 3: Drag Avoidance

When dragging a tab to the edge of the web content area, displays a semi-transparent gradient overlay indicating the tiling direction:
- Listens for `dragover` events on `#webpage-stack`
- Detects whether a tab is being dragged (`.tab-position.dragging` / `#drag-image`)
- `calculateDropSide()` determines if the mouse is within the edge zone (default 25% threshold)
- Creates a gradient overlay on the corresponding edge (150ms animation)

Default: `enabled: false`, requires manual activation.

### Feature 4: Auto Hide Pulse

When the tab bar is in auto-hide state, tab change events trigger a brief display of the tab bar:
- Listens for `chrome.tabs.onCreated` / `onRemoved` / `onActivated` / `onUpdated` (pinned state changes)
- Adds `.show` class to `.auto-hide-wrapper.has-tabbar`
- Displayed for 1000ms then removed, with a 1500ms cooldown to prevent frequent triggers
- Checks `window.__arcPeekOpening` to avoid conflicts with ArcPeek

Default: `enabled: true`.

### Configuration Overview

```javascript
CONFIG = {
  gestureTrail: {
    enabled: false,
    strokeColor: "rgba(120, 160, 255, 0.7)",
    strokeWidth: 3,
    fadeDurationMs: 300,
    maxPoints: 200,
  },
  tiledTabIndicator: {
    enabled: false,
    autoPinMixedGroups: true,  // Auto-pin when mixed tiled group detected
  },
  dragAvoidance: {
    enabled: false,
    edgeThreshold: 0.25,       // Edge trigger zone as proportion of width/height
    animationDurationMs: 150,
  },
  autoHidePulse: {
    enabled: true,
    showDurationMs: 1000,
    cooldownMs: 1500,
  },
}
```

## 3. Usage

### Installation

1. Place `InteractionFeedback.js` in the Vivaldi resources directory and add it to `window.html`
2. Place `InteractionFeedback.css` in the CSS directory
3. Set `enabled` to `true` for desired features in the `CONFIG` object

### Tips

- `autoHidePulse` works out of the box (enabled by default), ideal for users with auto-hide tab bar
- `tiledTabIndicator` is suitable for users who frequently use the tiling feature, providing clearer visual boundaries for tiled groups
- `gestureTrail` requires the page to be scriptable (excludes chrome:// etc.), only works on the active tab
- `dragAvoidance` provides direction preview during tab dragging, preventing accidental tiling

## 4. Design Rationale

### Design Motivation

Vivaldi's interaction feedback has several blind spots: tiled tabs have blurred visual boundaries in the tab bar, drag-tiling direction is not intuitive, and auto-hidden tab bars provide no visual feedback when new tabs are created. InteractionFeedback aggregates these independent interaction enhancements into a single mod.

### Core Architecture

Each of the four sub-features is an independent IIFE module (`TiledFeature` / `GestureTrailFeature` / `DragAvoidanceFeature` / `AutoHidePulseFeature`), launched through a unified `init()` function.

### Key Implementations

**Tiled tab dual-source detection**: `detectGroupsFromDOM()` parses `.webpageview[data-id]` attributes in `#webpage-stack`; `detectGroupsFromAPI()` reads `tab.vivExtData.tiling`. Both are merged and deduplicated, ensuring detection regardless of whether tiling was created via drag or menu.

**Tiled tab contiguity check**: `renderMergeIndicators()` only applies merge styles to tiled tabs that are consecutively arranged in `.tab-strip`. Non-contiguous tiled groups (with regular tabs in between) are not visually merged.

**CSS class namespacing**: All dynamic classes use the `if-` prefix (abbreviation of InteractionFeedback) to avoid conflicts with other mods:
- `.if-tiled-connector`: Tiled tab connector
- `.if-tiled-first/middle/last`: Position identifiers
- `.if-tiled-active`: Active tiled tab
- `.if-tiled-bg`: Unified background element
- `.if-drag-avoidance-overlay`: Drag avoidance overlay

**Gesture trail Vivaldi compatibility**: Vivaldi's mouse gesture system intercepts `mousemove` events during right-click drag. The solution uses a dual strategy of `requestAnimationFrame` polling + capture-phase `mousemove`. Polling serves as a fallback; coordinates are updated when events fire.

**Gesture trail injection isolation**: The `INJECT_FLAG = "__ifGestureTrailInjected"` flag prevents duplicate injection. Injected into `world: 'MAIN'` to receive right-click events; the injection flag is cleared and re-injected on URL changes.

**Auto-hide pulse debounce**: `cooldownMs: 1500` ensures rapid consecutive tab operations (e.g., quickly closing multiple tabs) don't repeatedly trigger the pulse. `showDurationMs: 1000` gives users enough time to notice the tab bar appearing.
