English | [简体中文](modzh/VividPlayer.md)

---

# VividPlayer Design and Implementation Analysis

This document is based on [VividPlayer.js](/Vivaldi7.9Stable/Javascripts/VividPlayer.js) and [VividPlayer.css](/Vivaldi7.9Stable/CSS/VividPlayer.css) in the current workspace.

## 1. Dependencies

### Vivaldi Internal APIs

- `chrome.scripting.executeScript` -- Injects `injectMain` (MAIN world) and `injectBridge` (isolated world) into pages, using MV3 API (`chrome.tabs.executeScript` is not available)
- `chrome.tabs.query / get / update / remove` -- Query tab state, switch focus tab, close tabs
- `chrome.tabs.onActivated / onUpdated / onRemoved` -- Listen to tab lifecycle events
- `chrome.webNavigation.onCommitted` -- Listen to main frame navigation, reset media state
- `chrome.runtime.onMessage` -- Receive media state and global-media-controls events from injected page scripts
- `chrome.windows.getLastFocused` -- Confirm current window visibility
- `vivaldi.tabsPrivate.get` -- Get tab extended info (alert states, etc.)

### Browser APIs

- `MutationObserver` -- Monitor DOM changes in `#tabs-container`, ensure the UI mount point stays alive
- `ResizeObserver` -- Monitor container size changes, update compact mode
- `requestAnimationFrame` -- Frame driver for title overflow scroll animation and note animation
- `navigator.mediaSession` -- Read MediaSession metadata (title/artist/artwork)
- `document.pictureInPictureElement` / `requestPictureInPicture` -- PiP functionality
- `window.postMessage` -- Message bridge between MAIN world and isolated world

### Inter-Mod Dependencies

- No direct inter-mod dependencies
- CSS file: `VividPlayer.css` provides all styles; the JS also dynamically injects stack-related styles (`ensureStackStyles()`)

## 2. Features

### Core Functionality

VividPlayer is a media controller at the bottom of the sidebar, inspired by Zen Browser. It automatically detects media (audio/video) playing in the browser and displays a card-style controller at the bottom of the vertical tab bar, supporting play/pause, next/previous track, mute, PiP, volume control, and other operations. It manages up to 3 media sources simultaneously, presented as stacked cards.

### Key Features

1. **Automatic media discovery** -- Through dual-layer injection (injectMain + injectBridge), monitors `<video>` / `<audio>` element events and MediaSession state on pages, automatically identifying meaningful media sources
2. **Media significance scoring** -- `computeMediaSignificance()` scores based on video area, controls attribute, MediaSession metadata, duration, etc., filtering out UI sound effects, ad clips, and decorative videos
3. **Candidate source selection** -- `chooseCandidateSource()` selects up to 3 active media sources from all tabs, excluding the current active tab, PiP tab, and suppressed sources
4. **Auto PiP** -- When switching tabs, if the departed tab is playing video, automatically triggers picture-in-picture (`tryAutoPip()`), using a `pendingPip` flag to prevent flickering
5. **Stacked card layout** -- Multiple media sources are displayed as stacked cards; hovering expands all cards, moving away collapses them (`computeStackLayouts()` / `applyExpandedStackLayout()` / `applyCollapsedStackLayout()`)
6. **Title overflow scroll** -- When a title exceeds the width, it automatically plays a back-and-forth scroll animation (`startTitleScroll()`), driven by RAF in a 5-phase cycle: initial delay -> scroll -> end pause -> reverse -> start pause
7. **Floating note animation** -- While media is playing, note symbols randomly float up from above the favicon button (`spawnNote()`), stopping on hover, with a max of 2 concurrent notes
8. **Compact mode** -- Automatically switches to a compact layout when window width is insufficient
9. **Suppress state management** -- After a user closes a media card, it is marked as suppressed to prevent immediate reappearance; new playback events can clear the suppressed state
10. **Global Media Controls integration** -- Receives `global-media-controls` type messages, syncing external media state changes

### Behavioral Expectations

- Only mounts in vertical tab mode (`isVerticalTabsMode()`)
- When no media is playing, the controller automatically hides (with fade-out animation)
- Displays up to 3 media source cards, sorted by priority
- Scripts injected from MAIN world communicate with the host via `window.postMessage`; the bridge relays in the isolated world
- Media state for a tab is automatically reset on main frame navigation
- Title scroll animation pauses when hovering over a card

## 3. Usage

### Enabling

- Place `VividPlayer.js` in the `Javascripts/` directory under the Vivaldi resources directory
- Place `VividPlayer.css` in the `CSS/` directory and import it in `Import.css`
- Add `<script src="Javascripts/VividPlayer.js"></script>` in `window.html`
- Enable "Allow CSS Modification" in `vivaldi://experiments`

### User Interaction

- **Play/Pause**: Click the play button in the center of the card
- **Previous/Next**: Click the skip buttons on either side of the card
- **Mute/Unmute**: Click the mute button
- **Picture-in-Picture**: Click the PiP button (only available for video sources)
- **Focus source tab**: Click the favicon button on the left to jump back to the source tab and scroll the media element into view
- **Close media source**: Click the close button; the source will be suppressed
- **Expand stack**: Hover over the card area; when multiple media sources exist, all are expanded

### Configuration Options

The `VIVID_PLAYER_CONFIG` object at the top of the code:

| Key | Default | Description |
|---|---|---|
| `autoPipOnSwitch` | `true` | Automatically trigger PiP when switching tabs |
| `minMediaDurationSec` | `8` | Media shorter than this (in seconds) is considered non-primary content |
| `minVideoArea` | `30000` | Video smaller than this pixel area is considered decorative |
| `progressUpdateMinMs` | `700` | Minimum progress update interval |
| `stackGap` | `6` | Stacked card gap (px) |
| `hideAnimationMs` | `260` | Hide animation duration |
| `stackTransitionMs` | `320` | Stack expand/collapse transition duration |
| `noteMaxConcurrent` | `2` | Maximum concurrent notes |

### Tips

- The stacked cards' hover hitbox is larger than the visual area (extended 20px/10px top/bottom), making it easier to trigger expansion
- Title scroll uses an easing function (ease-in-out) for a more natural visual effect
- Notes float out from the center of the favicon button, creating a "bubbling out of the icon" feel

## 4. Design Rationale

### Design Intent

Provide an always-available media control entry point in vertical tab mode that doesn't take up extra space. Users can control playback without switching to the media source tab, similar to Zen Browser's bottom bar media controller experience.

### Core Architecture

Uses a **dual-layer injection + message bridge** architecture:

```
Host (window.html)
  ├── injectMain (world: 'MAIN')  ──→  Page context
  │     Intercepts media.play/pause
  │     Listens to MediaSession
  │     Reads media element state
  │
  └── injectBridge (isolated world)  ──→  chrome.runtime bridge
        window.postMessage ←→ chrome.runtime.sendMessage
```

The host side maintains `stateByTabId` (Map), with each tab's media state tracked independently. `chooseCandidateSource()` is the core scheduling function, re-evaluated after every tab switch, media event, and tab close.

### Key Implementations

**Media filtering strategy**: `computeMediaSignificance()` uses a multi-dimensional scoring system (area, duration, controls, MediaSession) to filter noisy media. `isEligibleMedia()` supports condition combinations like `requireAudible` / `requireSignificant` / `requirePip`, with different strictness levels for different scenarios.

**pendingPip anti-flicker**: `tryAutoPip()` sets `pendingPip = true` immediately after sending a PiP request, excluding the pendingPip source in `chooseCandidateSource()`. On PiP success, it is confirmed via the `enterpictureinpicture` event; on failure, it is auto-cleared after 800ms.

**Suppress state machine**: `reconcileSuppressedState()` handles the clearing logic for suppressed state. User-initiated close (`user-close`) is not auto-cleared; non-user suppressed sources can be cleared after detecting a playback event. `awaitingQuietAfterSuppress` waits for media silence before allowing reappearance.

**Stack layout engine**: `computeStackLayouts()` calculates each slot's position/bottom/left/right/opacity/zIndex/transform based on the expanded state. Collapsed state uses fixed offsets (`stackCollapsedOffset1/2`) and decreasing opacity (0.72/0.45). Expanded state measures precise heights via `measurePrimaryHeight()` clone measurement.

### Collaboration Patterns

- Each tab is injected once with injectMain + injectBridge, deduplicated via the `injectedTabIds` Set
- MediaSession metadata is hijacked (defineProperty), synchronizing via postMessage on write
- `HTMLVideoElement.prototype.play` / `HTMLAudioElement.prototype.play` are intercepted, automatically attaching to newly created media elements
- `Document.prototype.createElement` and the `window.Audio` constructor are also intercepted to capture dynamically created media elements
- Button event handlers reference `refs.tabId` via closures, requiring no external tabId injection
