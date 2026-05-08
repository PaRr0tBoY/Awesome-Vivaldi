English | [简体中文](modzh/VividToast.md)

---

# VividToast Design and Implementation Analysis

This document is based on [VividToast.js](/Vivaldi7.9Stable/Javascripts/VividToast.js) and [VividToast.css](/Vivaldi7.9Stable/CSS/VividToast.css) in the current workspace.

## 1. Dependencies

### Vivaldi Internal APIs
- `chrome.tabs.update()` -- Activate a tab (click action on background tab notifications)
- `chrome.tabs.remove()` -- Close a tab (undo action)
- `chrome.tabs.onCreated` -- Listen for new tab creation (background tab notifications)
- `chrome.windows.update()` -- Focus a window

### External Dependencies
- `MutationObserver` -- Monitor Tabbar DOM attribute changes to detect tab bar position
- `ResizeObserver` -- Monitor Tabbar size changes (used indirectly via positionObserver)
- `window.addEventListener("resize")` -- Update Toast position on viewport size changes
- `getBoundingClientRect()` -- Get element position and dimensions

### Inter-Mod Dependencies
- No JS mod dependencies
- **VividToast.css** -- Required style file, defines Toast container, animations, and type styles

## 2. Features

### Core Functionality

The unified Toast notification system for the Vivaldi mod ecosystem. Provides lightweight, position-adaptive, interactive notification popups for all mods.

### Key Features

1. **Four notification types** -- `success` (green), `info` (blue), `warning` (yellow), `error` (red), each with independent auto-dismiss durations
2. **Position adaptation** -- Automatically detects Tabbar position (left/right/top/bottom); the Toast container always appears on the opposite side of the Tabbar
3. **Background tab notifications** -- Automatically shows a notification when a new background tab is created, supporting click-to-activate and undo-to-close
4. **Interactive Toasts** -- Supports click callbacks (`onClick`) and text copying (`copyText`)
5. **Button support** -- Action buttons can be added to Toasts (e.g., "Undo")
6. **Deduplication** -- Toasts with the same ID are not duplicated; instead, the existing Toast's content is updated
7. **Multi-language** -- Supports Chinese and English (`zh` / `en`)
8. **Position detection logging** -- Built-in debug logging that records position detection source and snapshot data

### Notification Types and Default Durations

| Type | Default Duration | Purpose |
|------|----------|------|
| `error` | 5000ms | Error notifications |
| `warning` | 4000ms | Warning notifications |
| `success` | 2500ms | Operation success |
| `info` | 2000ms | General information |

### Behavioral Expectations

- Toast slides in from the top (opacity + translateY animation) and auto-slides out on expiry
- Toast position automatically adjusts with Tabbar position changes (left Tabbar -> Toast on right, and vice versa)
- Background tab Toast displays "New background tab opened" with an "Undo" button
- Clicking a Toast executes a custom action (e.g., switching to the tab)
- Toasts reduce opacity when the window loses focus

## 3. Usage

### Enabling

1. Copy `VividToast.js` to the Vivaldi resources directory
2. Copy `VividToast.css` to the CSS directory and import it
3. Import in `window.html`: `<script src="VividToast.js"></script>`

### Global API

```javascript
// Show a Toast
window.VModToast.show(message, {
  type: "success",       // success | info | warning | error
  module: "ModuleName",  // Source module identifier
  title: "Title",        // Optional title
  description: "Desc",   // Optional description
  duration: 3000,        // Custom duration (ms)
  onClick: () => {},     // Click callback
  copyText: "text",      // Copy to clipboard
  button: {              // Action button
    text: "Undo",
    onClick: () => {}
  },
  id: "unique-id"        // For deduplication
});

// Show background tab notification
window.VModToast.showBackgroundTab(tab);

// Activate a tab
window.VModToast.activateTab(tabId, windowId);

// Close a tab
window.VModToast.dismiss(el);

// Debug position info
window.VModToast.debugPosition();
```

### Configuration Options

- `FEATURE_CONFIG.backgroundTabToast` -- Whether to enable background tab notifications (default `true`)
- `DEBUG` -- Whether to enable debug logging (default `true`)

### Tips

- Setting the `id` parameter enables Toast deduplication; Toasts with the same ID update rather than duplicate
- `duration` can override the default duration; passing `0` prevents auto-dismiss
- `copyText` automatically copies text to clipboard on click

## 4. Design Rationale

### Design Intent

Multiple mods in the Vivaldi mod ecosystem need to display notifications (theme switching, download renaming, error prompts, etc.). A unified Toast system is needed to avoid each mod reimplementing notifications, while adapting to Vivaldi's unique multi-position Tabbar layout.

### Core Architecture Decisions

1. **Global singleton** -- Mounted on `window.VModToast`, all mods call through the same interface; container element ID is fixed as `vmod-toast-container`
2. **Position detection system** -- Three-layer detection strategy:
   - CSS class detection (`.left` / `.right`) takes priority
   - Element geometry detection (width/height comparison) is secondary
   - Viewport position inference is the fallback
3. **MutationObserver dual-layer listening** -- Inner layer monitors Tabbar attribute changes; outer layer monitors `#browser` to detect Tabbar rebuilds (workspace switching destroys and rebuilds the Tabbar)
4. **CSS animations over JS animations** -- Uses `opacity + visibility + translateY` combination for slide-in/slide-out, triggered via CSS class toggling, outperforming JS animations
5. **Toast lifecycle management** -- Each Toast element carries private properties like `_vmodTimeout`, `_vmodToastId`, `_vmodDuration`, with auto-dismiss managed via `setTimeout`

### Key Implementation Details

- **Position Snapshot** -- `getPositionSnapshot()` generates a position description combining Tabbar class names, geometric dimensions, and viewport width, used for logging and debugging
- **Hover pause** -- Hovering over a Toast clears the auto-dismiss timer; moving away resets it
- **Background tab deduplication** -- Uses the `_vmodToastId` property for marking, preventing multiple notifications when new tabs are created in rapid succession
- **HTML escaping** -- `escapeHtml()` prevents XSS; all user input is escaped before DOM insertion
- **Animation end cleanup** -- Listens for the `transitionend` event, removing the DOM element after the animation completes

### Collaboration with Other Mods

- **WorkspaceThemeSwitcher** -- Calls `VModToast.show()` to display theme switch notifications
- **TidyDownloads** -- Calls `VModToast.show()` to display download rename notifications
- **Any mod** -- Calls via `window.VModToast.show()` uniformly, requiring no additional dependencies

---

*Source approximately 430 lines (JS) + style file, author: PaRr0tBoY*
