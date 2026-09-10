# SlimBookmarks Design and Implementation Analysis

A bookmark bar that lives *inside* the address bar toolbar instead of taking a
row of its own: top-level bookmarks as toolbar buttons, folders as native-looking
dropdown menus, with drag & drop, a context menu, an edit dialog and folder
creation. One file, no CSS mod, no dependencies —
[SlimBookmarks.js](/Vivaldi8.0Stable/Javascripts/SlimBookmarks.js).

## 1. Dependencies

### Chromium Extension APIs

- **`chrome.bookmarks.getTree`**: the whole tree, read once per (re)build
- **`chrome.bookmarks.getChildren`**: resolve the insertion index for a new folder
  at the moment it is created, not at the moment it was requested
- **`chrome.bookmarks.create` / `update` / `move`**: new folder, edit dialog, drag & drop
- **`chrome.bookmarks.remove` / `removeTree`**: Delete (a folder goes as a whole tree,
  the same call the native bar makes — into Vivaldi's bookmark trash, not gone)
- **`chrome.bookmarks.onCreated` / `onRemoved` / `onChanged` / `onMoved` /
  `onChildrenReordered`**: every change, from anywhere, rebuilds the bar (debounced 200 ms)
- **`chrome.tabs.update` / `create`**: opening a bookmark (the UI window has no
  `window.location` of its own to navigate)
- **`chrome.i18n.getMessage`**: context menu labels in the user's Vivaldi language
- **`chrome://favicon2` / `chrome://favicon`**: favicons, with a globe SVG as the
  last resort

### Vivaldi Private APIs

- **`vivaldi.prefs.get` / `onChanged`**: Vivaldi's own Bookmarks settings (see §2)
- **`vivaldi.prefs.set`**: written for exactly one thing — the toolbar layout pref,
  when a toolbar button is dropped onto the bar
- **`vivaldi.bookmarksPrivate.onMetaInfoChanged`**: picking a different bar folder
  changes `meta_info`, not the tree, so `chrome.bookmarks.*` events never fire
- **`vivaldi.contextMenu.show` + `vivaldi.menubarMenu.onOpen` / `onAction` /
  `onClose`**: the OS-drawn context menu (§5)
- **`vivaldi.utilities.emulateUserInput`**: keepalive while that menu is up
- **React fiber walk**: the toolbar's layout pref name is a prop of Vivaldi's own
  `Toolbar` component — the fiber is walked up to the node with an `editToolbar`
  method and its `props.name` is read

### Browser APIs

- **HTML5 Drag & Drop**: bookmarks, folders, the bar itself, and Vivaldi's toolbar
  buttons dropped onto it
- **SVG filters**: the favicon halo (§5)
- **MutationObserver ×2**: the toolbar's child list (React re-renders drop our node
  out of place) and `#browser`'s class list (toolbar customization mode)
- **ResizeObserver**: on the *parent* toolbar — how much room the bar has is the
  toolbar's decision
- **OPFS**: mod settings, read from `.askonpage/config.json` like every other mod

### Inter-Mod Dependencies

- **`ModConfig.js`** — the settings panel (`mods.slimBookmarks`). Optional at
  runtime: a missing config file is the normal case and the mod falls back to the
  defaults baked into `settings`.
- No `VividAI` / `VividMarkdown` / `VividToast` use — not an AI mod.
- No CSS file: the whole stylesheet is a template literal injected as
  `#custom-bookmark-style`. `Import.css` needs no entry.

## 2. Concepts

### Which folder the bar shows

Resolved on every rebuild, first match wins:

1. **`barFolderId`** from the mod's settings — the manual override, for when the two
   automatic sources below get it wrong
2. **`meta_info.Bookmarkbar === 'true'`** — Vivaldi's own flag on the folder the user
   picked as their bookmark bar; it can sit at any depth, not only in the root
3. **`vivaldi.bookmarks.bar.folder_ids`** — the same choice as a pref, which is the
   only source left on builds whose tree snapshot carries no `meta_info`
4. **the stock bar folder** (id `'1'`)

The bookmark trash (id `'4'`) is excluded from the search: it collects stale
"Bookmarks Bar" folders that still carry the flag.

### Where the bar stands in the toolbar

Vivaldi keeps a toolbar's layout as a list of item names in a pref and renders it
with React — and the renderer is a `switch` over known names, so the bar can never
be a member of that list. React therefore inserts every new button *before its own
next sibling*, which means anything the user adds "after the address field" is
rendered after our node, never between the field and the bar.

So the bar's place is the mod's own to keep: **the setting `barAnchor` is the name
of the toolbar item the bar stands after** (`AddressField` by default, `<start>` for
"before everything"). Three code paths keep it true:

- `insertBar()` places the bar after the anchor's node — or at the end when nothing
  in this toolbar carries a name the anchor could refer to
- a MutationObserver on the toolbar's children re-inserts the bar whenever a React
  re-render leaves it somewhere else
- dragging the bar in customization mode, or dropping a toolbar button on its left
  half, rewrites the anchor and calls `saveBarAnchor()` (a read-modify-write of the
  shared config file — the mod is the only writer of this one key)

### Vivaldi's own Bookmarks settings are followed, not duplicated

The panel deliberately has no toggles that already exist in
`Settings > Bookmarks`. Three prefs are read and re-read on `prefs.onChanged`:

| Pref | Used for |
|---|---|
| `vivaldi.bookmarks.open_in_new_tab` | plain click → this tab or a new one |
| `vivaldi.bookmarks.bar.display` | the display mode, while the mod's own is `vivaldi` |
| `vivaldi.bookmarks.bar.folder_ids` | which folder the bar is built from |

Not read, and why: `bar.visible` / `bar.position` describe the placement of
*Vivaldi's* bar and say nothing about one living in the address bar toolbar;
`confirm_opening*` guards "Open All Bookmarks", which these menus do not offer;
`single_click_opens` and `bar.sorting` belong to the manager and the panel.

The same list, in the same words, is the read-only `note` field at the bottom of
the mod's ModConfig panel — the two are meant to stay in step.

## 3. Features

### The bar

- Top-level children of the bar folder as toolbar buttons; folders open a menu
- **Overflow chevron**: whatever does not fit inside `maxBarWidth` moves under a `»`
  button at the end, from the end. Neither the display mode nor the title width is
  touched while fitting — both are the user's choice, so a button that stays on the
  bar looks the same at every bar width. The pass is monotonic (always starts from
  "everything visible"), so the result never depends on history.
- **Display modes**: `vivaldi` (follow `bar.display`), `titleAndIcon`, `titleOnly`,
  `iconOnly`, `iconExceptFolders`
- **Tooltip**: title on the first line, URL on the second — in icons-only mode the
  bare URL made buttons unidentifiable
- Clicks: plain → open (per `open_in_new_tab`), **Ctrl/⌘ or middle** → new background
  tab, second click on an open folder → close it (as the native bar does)
- Right click on the free space between buttons → the bar folder's own menu, which is
  the only way to add a folder to the top level

### The menus

- Unlimited submenu depth, one `div` per level in a shared `position: fixed` layer
- Hover opens a folder after `hoverDelay`; hovering a neighbour switches folders;
  hovering a bookmark closes the folder next to it
- A row inside a menu deliberately does **not** toggle on a second click: a submenu
  may be covering the row that opened it, and collapsing the path under the cursor
  loses the user's place. Only bar buttons — which stay put under the cursor — close.
- Submenus flip to the left, and menus clamp to the viewport, when there is no room
- Empty folders still render (an "Empty" row) and still accept drops — otherwise
  there would be no way to put anything into one

### Editing

- **Context menu**: Edit, Add Folder, Delete. Shorter than Vivaldi's on purpose —
  a click, the middle button and Ctrl/⌘ already cover opening. Labels come from
  Vivaldi's own locale (§5).
- **Add Folder** reads the click position: on a folder → a subfolder at its end;
  on a bookmark → a sibling right after it; on the background → the end of the
  folder that background belongs to
- **Edit dialog**: the mod's own (Vivaldi's lives in an unreachable React store) —
  Name, plus URL for a bookmark; Enter saves, Escape or a backdrop click cancels.
  An empty URL is never written: a node without one would silently become a folder.

### Appearance

Not one colour of the mod's own. Container, row, selection, hover and shadow values
are copied from Vivaldi's native menus (`.menu > ul`, `.menu > ul li a`,
`.bookmark-bar button`) and every value is a theme variable, so the bar follows the
user's theme, density (`--densityGap`) and radii. The stylesheet is injected once and
shared by the bar and every menu; the only per-setting value, `maxBarWidth`, is a
custom property (`--sb-max-bar-width`) so that changing it cannot restart the
transitions of an open menu.

## 4. Drag & Drop Design

HTML5 drag & drop throughout — Blink draws the preview and scrolls long menus by
itself. Mouse events do not arrive during a drag, so both the insertion point and
the auto-opening of the folder under the cursor are decided in `dragover`. The
dragged node is kept in `dragNode`: `dataTransfer` cannot be read in `dragover`, and
the drop zones depend on whether a folder or a bookmark is in flight.

### Zones

Each button (axis `x`) and each menu row (axis `y`) is a drop target split by
`EDGE_RATIO = 0.25`:

| Cursor over | Result |
|---|---|
| the outer 25% of a target | insert next to it (a 2px line marks the exact edge) |
| the middle 50% of a **folder** | drop *inside* it (the folder is outlined, and opens after `dragOpenDelay`) |
| the free space of the bar | the end of the bar folder |
| the free space of a menu | the end of that folder |
| the bar, holding a Vivaldi toolbar button | the toolbar layout (see below) |

Rejected by `canDrop`: released where it was picked up (that is a cancelled drag,
not a drop, in every zone) and a folder into its own subtree.

### Four races this design had to survive

1. **The menu that eats its own drag.** Between `mousedown` and the first move Blink
   is still deciding whether the gesture is a drag, and it resolves the source by hit
   testing. A hover timer that fires in that window puts a menu over the cursor and
   the gesture is dropped — so `mousedown` kills the pending timer. The same class of
   bug made bar buttons draggable only about one time in four: blurring the focus ring
   inside the focus a `mousedown` produces aborts the drag, so the blur moved to
   `mouseup`.
2. **The reload that closes the menus mid-drop.** The move the drop just made comes
   back as `onMoved` and the bar answers with `closeAll()` + `load()` — the whole
   stack vanishes from under the cursor. So `applyDrop` writes the open path down as
   folder ids (`captureMenuPath`) *before* sending the move, and the rebuilt bar walks
   it back open (`restoreMenuPath`). Any step that no longer exists just ends the
   walk. Only a drop does this: a change made in the bookmark manager still closes
   the menus, as before.
3. **Folder rows that would not pick up.** A drag carrying only a custom MIME type is
   not reliably started by the OS drag session. Bookmark rows also carried their URL
   and worked; folder rows did not — so `text/plain` is now always set.
4. **Stale targets after a rebuild.** `render()` replaces every button, so a live
   drag is aborted there, and the deferred folder-open checks `el.isConnected` before
   opening a menu anchored to a node that has left the document.

`document`-level `dragend`/`drop` handlers release the state for drags that die
anywhere else — dropped on Vivaldi's own UI, cancelled with Escape, ended over a
target that never saw the drop. They are in the **bubble** phase deliberately: in
capture they would clear `dragNode` before a real target's handler ran, and every
drop would silently do nothing.

### Taking in Vivaldi's toolbar buttons

Vivaldi's toolbar accepts a dropped button only on top of another button — everywhere
else its `onDragOver` sets `dropEffect: 'none'`, so the stretch the bar occupies used
to swallow every drop without a trace (measured: the layout pref stayed untouched).
The bar therefore takes such a drop itself:

- the drag's three Vivaldi types (`vivaldi/x-button-toolbar`, `x-toolbar-name`,
  `x-button-index`) are read synchronously, while the event is still being dispatched
- the button is spliced out of its old index — the index, not the name, because
  spacers and separators legitimately repeat — and re-inserted right after the bar's
  anchor
- **which half of the bar** the drop landed on decides where the bar ends up: on the
  left half the button goes between the anchor and the bar, which is exactly "the bar
  now stands after this button", so the anchor is rewritten
- a button dragged in from *another* toolbar is declined and left to Vivaldi, which
  removes it from its old toolbar in its own `dragend` — swallowing that drop would
  leave a duplicate behind

## 5. Key Implementation Details

### `biscuit-setting-version`, an internal class used as a marker

`Toolbar.getButtonIndex()` resolves a Space or a Separator to an index by counting
the toolbar's DOM children, skipping only `.window-buttongroup` and
`.biscuit-setting-version`. The bar is a child like any other, so without that class
every spacer standing after it is off by one — measured in a scratch profile: the
Space at index 6 resolved to 7, the Extensions button, and dragging that Space moved
its neighbour instead. The same class is also what the edit-mode jiggle animation in
`common.css` leaves alone. The three properties `common.css` hangs on it are all
overridden in the bar's own rule, so it is a marker only; if a future build drops the
class, the bar simply goes back to being counted and everything outside Vivaldi's own
toolbar editor keeps working.

### Toolbar customization mode

The bar used to be removed for the duration of the mode. It stays now — the mode
shows the toolbar as it really is, and a bar that vanishes exactly while its place is
being arranged is the opposite of that. What it must not do there is *act*: Vivaldi
turns its own buttons into inert previews, so the bar gets `is-preview`, open menus
close, and `bar.draggable` is true only in this mode, because that is where toolbar
items are arranged. Entering and leaving repaints the toolbar and can wipe the
insertion, so `sync()` retries at 200 ms and 600 ms, and every successful insertion
re-points both observers at the current parent and recomputes the fit.

### The native context menu

Vivaldi draws its menus not in HTML but through a private API, and the result is an
OS-drawn window — platform metrics, mnemonics, keyboard handling, and no clipping by
the browser window. The call and the item shape are copied from Vivaldi's own:

```
children: [ { item: { id, name, type: 'command', enabled } } | { separator: {} } ]
```

The chosen item does not come back through `show()`'s callback but through
`menubarMenu.onAction`, so the three listeners are armed around the call and torn
down in `onClose`. Two details this needs: a `emulateUserInput` keepalive every
2000 ms (the interval Vivaldi itself uses — without it the menu is dismissed from
under the user), and `window.blur` must not close the bar's menus while a native menu
is up, since the OS menu takes the focus away from the UI window.

Everything there is private API, so nothing is assumed: a synchronous throw or a
`lastError` sets `nativeMenuBroken` for the rest of the session and every later right
click gets the mod's own HTML menu, which is kept for exactly that reason.

### Labels from Vivaldi's locale

A key in `_locales/<lang>/messages.json` is an encoded English string: lowercase
letters and digits survive, everything else becomes `_<charCode>_`, with a `0`
appended and an optional context prefix separated by `_4_`.

```
'Open in New Tab'    -> _79_pen_32_in_32__78_ew_32__84_ab0
'verb' + 'Delete'    -> verb_4__68_elete0
```

`buildLabels()` runs on every menu build rather than once: `chrome.i18n` may not be
ready when the script loads, and `label()` does not throw on failure — every label
would then be stuck on its English fallback forever. Localization is an improvement,
never a prerequisite.

### The favicon halo

Dark favicons drown in a dark theme. The fix is an SVG filter that outlines *only*
the pixels that are too dark, per pixel, without reading the image in JS (a canvas
over `chrome://favicon2` may come out tainted, and judging the icon as a whole is too
coarse anyway):

```
luminanceToAlpha  → alpha = luminance
feComponentTransfer → full halo at luminance ≤ 0.125, fading out to 0.375
feComposite in    → opaque pixels only (transparent ones read as black)
feMorphology dilate 1px
feComposite out   → keep only what spilled outside the icon
feFlood + in      → paint the mask (colour from CSS)
feMerge           → mask underneath the original icon
```

The threshold is on luminance itself, not on `1 - luminance`: saturated colours have
low luminance (`#ff6600` → 0.50) and a linear inversion drew an edge around orange
and grey icons. The filter computes in `sRGB` because the threshold was tuned there.
Two identical filters exist, differing only by id, because the fill colour comes from
CSS and the icon sits on `--colorBg` in menus and on `--colorAccentBg` on the bar.

### Why the menu layer lives inside `#browser`

Vivaldi's theme variables (`--colorBg`, `--colorFg`, `--radius*`, `--densityGap`) are
declared on `#browser`, by the window's inline style and by `common.css`. They are
not inherited into `<body>`, so a menu placed there picked up system colours and
stayed light in a dark theme. `#browser` has no `transform`/`filter`/`contain`, so
`position: fixed` inside it still resolves against the viewport.

### Startup

A 300 ms interval, up to 30 attempts, waiting for both the toolbar and
`chrome.bookmarks`; a throw inside the build leaves the interval alive for the next
attempt. Settings are read *after* the bar exists, and `loadModConfig()` races the
build — whichever finishes second finds the other through `onSettingsChanged`, the
single place both paths meet. `prefs.onChanged` fires for every pref in the browser,
so a re-read applies a change only when the value really moved: a pointless rebuild
would close whatever menu the user has open.

## 6. Usage

### Enabling

1. Run the installer (`install.sh` / `install.ps1`) and pick **Slim Bookmarks** —
   it is **off by default**, since it duplicates a bar Vivaldi already has
2. Or drop `SlimBookmarks.js` into `user_mods/js/`; there is no CSS file to import
3. Vivaldi's own bookmark bar can then be turned off in
   `Settings > Bookmarks > Bookmark Bar` — the mod does not touch it either way

### User interaction

| Gesture | Result |
|---|---|
| Click a bookmark | open (this tab or a new one, per Vivaldi's setting) |
| Ctrl/⌘ + click, middle click | open in a new background tab |
| Click a folder | open its menu; click again to close |
| Hover a folder while a menu is open | switch to it |
| Drag a bookmark or folder | reorder, or drop into a folder (hold over it to open) |
| Right click | Edit / Add Folder / Delete |
| Right click the bar's free space | Add Folder at the top level |
| Drag a toolbar button onto the bar | it lands next to the bar, on the side you dropped |
| Customize Toolbars → drag the bar | move the bar to another slot in the toolbar |
| Escape | close the menus, the dialog, or cancel a drag |

### Configuration

`vivaldi://settings/appearance/` → **Awesome Vivaldi** → **Slim Bookmarks**
(stored in OPFS, `.askonpage/config.json`, under `mods.slimBookmarks`):

| Key | Default | Description |
|---|---|---|
| `maxBarWidth` | `600` px | Ceiling for the whole bar, so the address field keeps its room. The overflow goes under `»`. |
| `barLabelWidth` | `105` px | Ceiling for one bar button's title; the full title stays in the tooltip |
| `menuLabelWidth` | `300` px | Ceiling for one menu row's title — this is what sets how wide a folder menu gets |
| `displayMode` | `vivaldi` | `vivaldi` follows `Settings > Bookmarks > Bookmark Bar > Display`; the other four force one look |
| `hoverDelay` | `medium` | Folder open / switch on hover — `fast` 50 ms, `medium` 120 ms, `slow` 300 ms |
| `dragOpenDelay` | `medium` | Folder open while dragging — `fast` 200 ms, `medium` 400 ms, `slow` 800 ms. Slower than hover on purpose: while dragging you pass over folders on the way elsewhere. |
| `barFolderId` | *(empty)* | Overrides the bar folder. The number in `vivaldi://bookmarks/?id=…`. Leave empty unless auto-detection picks the wrong one. |
| `barAnchor` | `AddressField` | The toolbar item the bar stands after, by Vivaldi's internal name (`Reload`, `Spacer`, `Extensions`, …); `<start>` puts it first. Normally written by dragging the bar in Customize Toolbars, not typed. |

Both timings are a choice of three speeds rather than a number of milliseconds: what
the user wants to say is "sooner" or "let me pass over it first", and a free number
invited values that made the menus either impossible to cross or unbearably slow. The
`medium` column is the value each timing had while it was a constant, so the default
behaviour is unchanged.

The number fields are **clamped**, not rejected (`maxBarWidth` 120–4000,
`barLabelWidth` 0–600, `menuLabelWidth` 80–1200): ModConfig's number inputs accept
anything, and a bar with a 0 px ceiling would just silently vanish with no hint as to
why.
