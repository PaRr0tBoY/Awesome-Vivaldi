English | [简体中文](modzh/AutoHidePanel.md)

---

# AutoHidePanel Design and Implementation Analysis

This document is based on [AutoHidePanel.js](/Vivaldi7.9Stable/Javascripts/AutoHidePanel.js) in the current workspace.

## 1. Dependencies

### Vivaldi Internal APIs

No direct chrome.* / vivaldi.* API calls. All interaction is done through DOM events and simulated clicks.

### External Dependencies

- **PointerEvent API**: Used to simulate the full click event chain
- **CSSStyleSheet API**: Dynamic stylesheet injection (`adoptedStyleSheets`)
- **`setInterval` / `clearTimeout`**: Timers for delayed panel open and close

### Inter-Mod Dependencies

- **AskInPage / ModConfig System**: Read shared config file `.askonpage/config.json` `mods.autoHidePanel` field via the `vivaldi-mod-config-updated` event

## 2. Features

Automatically opens the corresponding panel when the mouse hovers over a sidebar panel button, and automatically closes the panel when the mouse moves back to the web content area.

### Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `auto_close` | `true` | Whether to auto-close the panel when the mouse returns to web content |
| `close_fixed` | `true` | Whether to also auto-close fixed (non-overlay) panels |
| `open_delay` | `300` ms | Delay before opening the panel after hover |
| `switch_delay` | `40` ms | Delay when switching panels |
| `close_delay` | `280` ms | Close delay in overlay mode |
| `close_delay_fixed` | `3000` ms | Close delay in fixed mode (longer, to avoid accidental closes) |

### Expected Behavior

1. Mouse hovers over panel button (without Alt/Ctrl/Shift/Meta modifier keys) -> triggers click to open panel after `open_delay`
2. Mouse moves away from panel button -> cancels pending open timer
3. Mouse enters `#webview-container` -> starts close timer
4. Mouse returns to `#panels-container` -> cancels close timer
5. Drag enters panel button -> switches panel immediately (no delay)
6. Webview `delay_visibility` animation starts -> triggers close

## 3. Usage

### Enable

Place `AutoHidePanel.js` in Vivaldi's resource directory and add as a `<script>` tag in `window.html`.

### Configuration

Write to `.askonpage/config.json` via the ModConfig system:

```json
{
  "mods": {
    "autoHidePanel": {
      "auto_close": true,
      "close_fixed": true,
      "open_delay": 300,
      "switch_delay": 40,
      "close_delay": 280,
      "close_delay_fixed": 3000
    }
  }
}
```

After modifying the config at runtime, the `vivaldi-mod-config-updated` event triggers a reload.

### Tips

- Holding Alt/Ctrl/Shift/Meta while hovering will not trigger panel open, convenient for drag operations
- `close_delay_fixed` is set to 3000ms to avoid frequent accidental closes in fixed panel mode; reduce this value for faster response

## 4. Design Rationale

### Design Intent

Vivaldi's sidebar panels default to requiring a click to open/close. AutoHidePanel simulates a hover-to-open, leave-to-close workflow, reducing interaction steps.

### Core Architecture

```
waitForElement(#browser)
  -> waitForElement(#panels)
  -> waitForElement(#webview-container)
  -> fixWebViewMouseEvent()
  -> panelMouseOver()
```

During initialization, waits for three key DOM elements to be ready in sequence, then injects CSS fixes and event listeners.

### Key Implementation Details

**Simulated Click**: Vivaldi's panel buttons do not respond to simple `element.click()`. A full PointerEvent chain must be dispatched: `pointerdown -> mousedown -> pointerup -> mouseup -> click`.

**WebView Mouse Event Pass-Through Fix**: When the panel container is in hover state, CSS `#main:has(#panels-container:hover) #webview-container { pointer-events: none }` prevents the webview from stealing mouse events. This is the standard approach for handling `webview` elements intercepting mouse events in Vivaldi.

**Button Selector**: Uses `:is([data-name^="Panel"], [data-name^="WEBPANEL_"], ...)` to uniformly match both native panel and Web Panel buttons, while excluding the `PanelWeb` button.

**Panel Mode Detection**: `isOverlayPanel()` checks for `#panels-container.overlay` to determine which close delay to use. Overlay mode panels cover the web content area when expanded and can be closed quickly; fixed mode panels are always visible and use a longer delay to avoid accidental closure.
