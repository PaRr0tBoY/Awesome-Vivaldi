English | [简体中文](modzh/EasyFiles.md)

---

# EasyFiles Design and Implementation Analysis

This document is based on [EasyFiles.js](/Vivaldi7.9Stable/Javascripts/EasyFiles.js) in the current workspace. There is no separate CSS file; styles are dynamically injected via JS.

## 1. Dependencies

### Vivaldi Internal APIs
- `vivaldi.tabsPrivate.onWebviewClickCheck` -- Listen for mouse click events inside webviews (Vivaldi private API)
- `vivaldi.tabsPrivate.onKeyboardShortcut` -- Listen for keyboard shortcuts (used for ESC to close dialog)
- `vivaldi.tabsPrivate.onWebviewMouseDown` -- Listen for mouse down events (used for click-outside-to-close on dialogs)
- `vivaldiWindowId` -- Current window ID (Vivaldi global variable)
- `chrome.scripting.executeScript` -- Inject content scripts into pages (MV3 API)
- `chrome.tabs.sendMessage` -- Send messages to content scripts
- `chrome.tabs.query` -- Query tabs
- `chrome.runtime.onMessage` -- Receive messages from content scripts
- `chrome.webNavigation.onCommitted` -- Listen for navigation events to inject scripts
- `chrome.i18n.getMessage` -- Internationalization text

### Browser APIs
- `Clipboard API` (`navigator.clipboard.read`) -- Read clipboard files
- `CompressionStream` / `DecompressionStream` -- gzip compress/decompress file data
- `DataTransfer` -- Simulate file paste operations
- `FileReader` -- Read files as base64
- `document.execCommand('paste')` -- Trigger paste events (fallback approach)

### Inter-Module Dependencies
- None. EasyFiles is a standalone mod with no dependency on ModConfig or other mods.

## 2. Features

### Core Functionality

**Clipboard File Paste**
- When a page contains `<input type="file">`, clicking the button next to the input field reads files from the clipboard
- Supports images (image/png, image/jpeg, image/gif, image/webp) and file paths
- After reading, injects into the file input's `change` event via `DataTransfer`
- Shows a prompt when no matching content is found in the clipboard

**Download File Selection**
- Scans recent files in the Vivaldi downloads directory
- Displays in a grid dialog with image previews and file icons
- Automatically injects selected files into the file input

**Chunked File Transfer**
- Large files are gzip-compressed and transferred in chunks (10MB each)
- Content script receives chunks, reassembles, decompresses, and restores to File objects
- Sent chunk by chunk via `chrome.tabs.sendMessage`

**Custom Dialog System**
- `gnoh.dialog()` provides a complete modal dialog implementation
- Supports ESC to close, click-outside-to-close, and button callbacks
- Uses Vivaldi private APIs for keyboard and mouse event listening

**Content Script Injection**
- Injected into all scriptable pages via `chrome.scripting.executeScript`
- Injection timing: on page navigation commit + on initialization for existing tabs
- URL filtering: excludes `chrome://`, `vivaldi://`, `chrome-extension://` and other privileged pages

### UI Components

- **File selection dialog**: Grid layout displaying files with 120x120px thumbnails/icons
- **File icons**: Colorful file icons generated based on file extension, with folded corner effect
- **Show more button**: Collapsible display when clipboard/download lists are too long

## 3. Usage

### Installation
1. Place `EasyFiles.js` in the Vivaldi resources directory
2. Add `<script src="EasyFiles.js"></script>` to `window.html`

### How to Use
1. Navigate to a web page containing `<input type="file">`
2. Click the file input field; EasyFiles automatically intercepts the click event
3. A dialog pops up; select the "Clipboard" or "Downloads" tab
4. After selecting a file, it is automatically filled into the file input
5. Submit the form as usual

### Limitations
- File size limit: 5MB (`maxAllowedSize`)
- Chunk size: 10MB (`chunkSize`)
- Only supports scriptable URLs (excludes privileged pages)

## 4. Design Rationale

### Dual-Layer Architecture: window.html + Content Script

EasyFiles uses a classic dual-layer architecture:

**window.html layer** (main script):
- Registers `chrome.webNavigation.onCommitted` to listen for navigation
- Registers `chrome.runtime.onMessage` to receive content script requests
- Reads clipboard and downloads directory
- Displays file selection dialog
- Sends selected files in chunks to the content script

**Content script layer** (`inject` function):
- Intercepts `click` events on `<input type="file">`
- Sends a "click" message to the main script
- Receives file data, reassembles and decompresses
- Injects files via `DataTransfer` + `change` event

The two layers communicate through `chrome.tabs.sendMessage` / `chrome.runtime.onMessage`.

### File Compression Transfer Pipeline

```
Clipboard/Disk -> ArrayBuffer -> gzip compress -> base64 encode -> chunk (10MB) -> sendMessage per chunk
                                                                              |
file input <- change event <- DataTransfer <- File object <- decompress <- reassemble <- receive chunks
```

gzip compression is chosen because base64 encoding inflates data by 33%; compression significantly reduces transfer volume. Chunking avoids oversized single messages.

### gnoh Utility Library

EasyFiles embeds a lightweight utility library `gnoh` that provides:
- `stream.compress/decompress` -- gzip compression/decompression
- `file.*` -- File size formatting, extension extraction, MIME validation
- `array.chunks` -- Array chunking
- `string.*` -- String utilities
- `color.*` -- Color calculation (for generating file icon colors)
- `createElement` -- DOM element creation factory
- `dialog` -- Modal dialog system
- `timeOut` -- Timeout utility with conditional waiting
- `uuid.generate` -- UUID generation

This utility library is self-contained with no external npm dependencies.

### isScriptableUrl Filtering

Strict URL filtering before injection, excluding all privileged pages:
- `chrome://`, `vivaldi://`, `chrome-extension://`, `devtools://`
- `about:blank`, `about:srcdoc`
- `data:` URLs

The filtering logic is used for both initialization injection and navigation event injection, ensuring consistency.

### inject Function Event Interception

The `inject` function in the content script intercepts file selection through the following steps:
1. Listens for `click` events and checks if the target is `<input type="file">`
2. Calls `event.preventDefault()` to block the native file picker
3. Sends a message to the main script, carrying the input's accept attribute
4. After the main script returns file data, constructs a `DataTransfer` object
5. Replaces the input's `files` property with the new file and triggers a `change` event

This pattern makes web applications completely unaware of the change in file source.
