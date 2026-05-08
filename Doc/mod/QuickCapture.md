English | [简体中文](modzh/QuickCapture.md)

---

# QuickCapture Design and Implementation Analysis

This document is based on [QuickCapture.js](/Vivaldi7.9Stable/Javascripts/QuickCapture.js) in the current workspace.

## 1. Dependencies

### Vivaldi Internal APIs

- `vivaldi.thumbnails.captureUI(params, callback)` -- Core screenshot API, captures screen content by UI coordinate region. See [captureTab-reference.md](/Doc/api/captureTab-reference.md)
- `window.vivaldiWindowId` -- Current window ID, required parameter for `captureUI`

### External Dependencies

- **Browser Native APIs**: `fetch`, `navigator.clipboard`, `navigator.storage.getDirectory()` (OPFS config persistence)
- **VividToast** (`window.VividToast.show`) -- Toast notification system for screenshot success/failure feedback

### Inter-Mod Dependencies

- **VividToast.js** -- Toast notification on screenshot completion (`window.VividToast.show`)

### Embedded Utility Library

QuickCapture embeds a `gnoh` namespace providing the following utilities:

| Method | Purpose |
|--------|---------|
| `gnoh.getReactProps(element)` | Read `__reactProps` of a DOM element, used to hijack Vivaldi's native screenshot area event handlers |
| `gnoh.overrideFunction(obj, fnName, callback, opts)` | Function hijacking framework, supports `runBefore`/`skipApply` chain overrides |
| `gnoh.uuid.generate(ids)` | Generate unique UUIDs for override system element identification |
| `gnoh.promise.delay(ms)` | Delay Promise |
| `gnoh.element.getStyle(element)` | Get computed style |

## 2. Features

### Three Screenshot Modes

| Mode | Behavior |
|------|----------|
| `clipboard` | Capture the hovered element area, write directly to system clipboard |
| `file` | Capture the hovered element area, output via Vivaldi file save dialog |
| `default` | Auto-select area, then delegate to Vivaldi's native screenshot selector for output |

### Core Interaction Flow

1. **Element Hover**: When the mouse hovers over Vivaldi's screenshot area (`#capture-area`), the hovered element's `getBoundingClientRect()` is calculated in real time
2. **Overlay Display**: Create a `#quick-capture-overlay` floating layer, precisely positioned at the hovered element, with white border + shadow indicating the selection
3. **Selection Confirmation**: Mouse click confirms the selection, executing different branches based on mode
4. **Screenshot Execution**: Call `vivaldi.thumbnails.captureUI()` to perform the actual capture

### Configuration

| Key | Default | Description |
|-----|---------|-------------|
| `mode` | `'default'` | Screenshot mode: `clipboard` / `file` / `default` |
| `encodeFormat` | `'png'` | Encoding format |
| `encodeQuality` | `85` | Encoding quality (0-100) |
| `showFileInPath` | `true` | Whether to show file path in file mode |
| `saveFilePattern` | `''` | Filename pattern for file mode |

Configuration is persisted to `.askonpage/config.json` via OPFS (`navigator.storage.getDirectory()`) and listens for the `vivaldi-mod-config-updated` event for live reloading.

## 3. Usage

1. Place `QuickCapture.js` into the `Javascripts/` directory of Vivaldi's resource folder
2. Include the script in `window.html`
3. Open Vivaldi's screenshot feature (shortcut or menu), hover the mouse over the target element -- the overlay will automatically highlight
4. Click to confirm the selection, screenshot outputs according to the configured mode

## 4. Design Rationale

### Native Screenshot Area Hijacking

The core challenge of QuickCapture: Vivaldi's screenshot selector has its own `#capture-area` element and event handlers. The mod needs to overlay its own hover detection and selection logic without breaking native functionality.

**Solution**: Use `gnoh.getReactProps()` to read the native `captureArea`'s React event handlers (`onPointerDown`/`onPointerMove`/`onPointerUp`), selectively calling or skipping native handlers within custom event processing.

### Style Save/Restore Mechanism

Uses a `WeakMap` (`nativeCaptureAreaStyleState`) to save the native `captureArea`'s style properties (`background`, `border-color`, `border-width`, `visibility`, `pointer-events`), precisely restoring them after screenshot completion to avoid affecting Vivaldi's native UI.

### Overlay Implementation

`#quick-capture-overlay` is a `position: fixed`, `z-index: 1003` floating layer. `boxShadow: '0 0 9999px rgba(0,0,0,0.5)'` creates a large-area mask effect, with a white border indicating the selection range. `transition` enables smooth selection change animations.

### delegateToVivaldiSelector Mode

In `default` mode, the mod does not directly take a screenshot. Instead, it uses `simulateSelect()` to simulate the native screenshot selector's interaction (`onPointerDown` -> `onPointerMove` -> `onPointerUp`), delegating the selection to Vivaldi's native handler. This allows users to use Vivaldi's editing/annotation features after confirming the selection.

### Webview Zoom Compensation

In `updateCaptureRect()`, the `--uiZoomLevel` CSS variable is read to calculate the actual zoom ratio, ensuring the overlay aligns precisely with webview content at different zoom levels.

### Escape Key Cancellation

A global `keydown` event listener triggers `closeCaptureArea()` on the Escape key, cleaning up all state and restoring native styles.

### Re-Entry Protection

The `isCapturing` flag prevents concurrent screenshot operations. `captureSessionId` is monotonically incremented, ensuring that old sessions do not interfere with new ones during async operations.

### Event Cleanup

`cleanupCaptureListeners()` removes all event listeners after each screenshot completion or cancellation to prevent memory leaks. `pointerdown` uses `{ once: true, capture: true }` to ensure it only triggers once.
