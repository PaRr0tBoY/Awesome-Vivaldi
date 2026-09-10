// ==UserScript==
// @name         Slim Bookmarks
// @description  Custom bookmark bar rendered inline in the address bar toolbar, with folder menus, drag & drop of bookmarks and folders, context menu, edit dialog and folder creation.
// @version      2026.8.27
// @author       superdevmike
// ==/UserScript==

(function vivaldiBookmarksMod() {
    'use strict';

    console.log('🔍 [SlimBookmarks] Script loaded');

    const BAR_CLASS = 'custom-bookmark-bar';
    const BTN_CLASS = 'custom-bookmark-bar-button';
    const MENU_CLASS = 'custom-bookmark-menu';
    const ROW_CLASS = 'custom-bookmark-menu-row';
    const LAYER_ID = 'custom-bookmark-layer';
    const STYLE_ID = 'custom-bookmark-style';
    // halo filters for dark favicons: over --colorBg and over --colorAccentBg
    const HALO_FG_ID = 'custom-bookmark-halo-fg';
    const HALO_ACCENT_ID = 'custom-bookmark-halo-accent';
    const ACTIVE_CLASS = 'is-active';   // highlighted menu row
    const OPEN_CLASS = 'is-open';       // bar button whose menu is open
    const GAP = 4;              // menu offset from the screen edge
    // Extra offset when the menu unfolds away from the cursor (upwards or
    // leftwards). A plain GAP leaves only its own 4px between the cursor and
    // the menu edge — enough near a normal screen edge, but when the menu
    // unfolds "away from the cursor" its last row (Delete for the context
    // menu, or deleting a whole subtree for a folder) can end up within
    // those same 4px of the click point. A couple of pixels of mouse jitter
    // after a right click would then delete the node with no chance to
    // undo. Vivaldi's own menus never keep rows under the cursor — this
    // offset reproduces the same behaviour.
    const CTX_FLIP_MARGIN = 8;
    const BTN_GAP = 2;          // gap between bar buttons
    const TRASH_ID = '4';       // the trash holds stale "Bookmarks Bar" folders
    // Vivaldi keeps menus at z-index 101 and dialogs at 1000..1002
    const MENU_Z_INDEX = 1010;
    const SEP_CLASS = 'custom-bookmark-menu-sep';
    const CTX_DEPTH = 100;      // context menu depth: z-index above submenus
    const DIALOG_CLASS = 'custom-bookmark-dialog';
    const DRAG_MIME = 'application/x-vivaldi-mod-bookmark';
    const DROP_LINE_CLASS = 'custom-bookmark-drop-line';
    const DROP_INTO_CLASS = 'is-drop-into';
    const EDGE_RATIO = 0.25;        // share of a button/row that means "insert next to"
    const ICON_CLASS = MENU_CLASS + '-icon';    // shared by the favicon <img> and the fallback <svg>
    const ICONS_CLASS = 'is-icons';             // display: icons only
    const TEXT_CLASS = 'is-text';               // display: titles only
    const ICONS_NF_CLASS = 'is-icons-no-folders';   // display: icons, except folders
    const FOLDER_BTN_CLASS = 'is-folder';       // marks a bar button that is a folder
    const CHEVRON_CLASS = 'custom-bookmark-bar-chevron';   // the "the rest" button
    const PREVIEW_CLASS = 'is-preview';         // the bar while the toolbar editor is open

    // Vivaldi's own marker for "a toolbar child that is not a toolbar button".
    // Two things in the browser key off it, and the bar needs both:
    //   * Toolbar.getButtonIndex() resolves a Space or a Separator to its index
    //     by counting the toolbar's DOM children, skipping only
    //     .window-buttongroup and .biscuit-setting-version. Our bar is a child
    //     like any other, so without the class every spacer standing after it
    //     is off by one, and dragging that Space in the toolbar editor moves
    //     (or deletes) its neighbour instead. Measured in a scratch profile:
    //     the Space at index 6 resolved to 7, which is the Extensions button.
    //     This is not specific to customization — Vivaldi also makes its
    //     buttons draggable while Ctrl is held.
    //   * The edit-mode "jiggle" animation in common.css lists the same class
    //     among the elements it leaves alone.
    // It is an internal class, so it is used here as a marker only: the three
    // properties common.css hangs on it (display / padding / max-width) are
    // all overridden in the bar's own rule below. If a future build drops the
    // class, the bar simply goes back to being counted — everything outside
    // Vivaldi's own toolbar editor keeps working.
    const NOT_A_BUTTON_CLASS = 'biscuit-setting-version';

    // ------------------------------------------------------------------
    // Where the bar stands in the toolbar.
    //
    // Vivaldi keeps a toolbar's layout as a plain list of item names in a pref
    // and renders it with React; our bar is not in that list and never can be
    // (the renderer is a switch over known names). So React always inserts a
    // new button before its own next sibling — which means anything the user
    // adds "after the address field" is rendered *after* our node, never
    // between the address field and the bar. The bar's own place therefore has
    // to be ours to decide: it is stored as the name of the toolbar item the
    // bar stands after, and it is what dragging the bar in customization mode
    // writes down.
    // ------------------------------------------------------------------
    const DEFAULT_ANCHOR = 'AddressField';  // where the bar has always been
    const ANCHOR_START = '<start>';         // ... or before every toolbar item

    // Vivaldi's own drag types for a toolbar button (bundle.js): the name of
    // the button, the toolbar it was picked up from and its index there.
    // Reading them is what lets the bar accept a button dropped onto it.
    const VIVALDI_BTN_MIME = 'vivaldi/x-button-toolbar';
    const VIVALDI_TOOLBAR_MIME = 'vivaldi/x-toolbar-name';
    const VIVALDI_BTN_INDEX_MIME = 'vivaldi/x-button-index';
    // ... and ours, for dragging the bar itself. Deliberately not Vivaldi's:
    // its toolbar reads only its own type and leaves this drag alone.
    const BAR_DRAG_MIME = 'application/x-vivaldi-mod-bookmark-bar';

    // When the user picks a custom folder for the bookmark bar, Vivaldi flags
    // it in Bookmarks with meta_info.Bookmarkbar = 'true'. It can sit at any
    // depth, not only in the root with id '1'.
    // If auto-detection somehow fails, put the folder id here (or, better,
    // fill in "Bar Folder ID" in the mod's settings panel).
    const FORCE_FOLDER_ID = null;

    // ------------------------------------------------------------------
    // Vivaldi's own Bookmarks settings.
    //
    // Paths and types come from prefs_definitions.json. The mod deliberately
    // follows the native settings instead of duplicating them: whatever the
    // user has already configured for Vivaldi's own bookmark bar keeps working
    // here. Everything read below is listed, in the same words, in the
    // "Vivaldi Settings" note of the mod's ModConfig panel — keep the two in
    // step when adding a pref.
    //
    //   open_in_new_tab   boolean   Settings > Bookmarks > Open Bookmark in New Tab
    //   bar.display       enum      Settings > Bookmarks > Bookmark Bar > Display
    //                               (default | text | icon | iconexceptfolders)
    //   bar.folder_ids    list      Settings > Bookmarks > Bookmark Bar > Folder
    //
    // Not read, and why:
    //   bar.visible / bar.position — our bar lives inside the address bar
    //     toolbar, so Vivaldi's own bar placement says nothing about it.
    //   confirm_opening, confirm_opening_threshold — they guard "Open All
    //     Bookmarks", an action this mod's menus do not offer.
    //   single_click_opens, bar.sorting — they belong to the bookmark manager
    //     and the panel, not to the bar.
    // ------------------------------------------------------------------
    const PREF_OPEN_NEW_TAB = 'vivaldi.bookmarks.open_in_new_tab';
    const PREF_BAR_DISPLAY = 'vivaldi.bookmarks.bar.display';
    const PREF_BAR_FOLDERS = 'vivaldi.bookmarks.bar.folder_ids';

    // Vivaldi's enum -> our display modes
    const VIVALDI_DISPLAY_MODES = {
        default: 'titleAndIcon',
        text: 'titleOnly',
        icon: 'iconOnly',
        iconexceptfolders: 'iconExceptFolders',
    };

    // Not named openInNewTab: that is the name of the "Open in New Tab"
    // context menu action (see the "Context menu" section) — matching names
    // would collide as duplicate declarations.
    let openInNewTabPref = false;   // cached value of the Vivaldi setting
    let barDisplayPref = 'default'; // cached vivaldi.bookmarks.bar.display
    let barFolderIdsPref = [];      // cached vivaldi.bookmarks.bar.folder_ids

    // ------------------------------------------------------------------
    // Mod settings (ModConfig).
    //
    // The panel lives in vivaldi:settings/appearance -> Awesome Vivaldi ->
    // Slim Bookmarks; the values are stored in OPFS under
    // .askonpage/config.json, in mods.slimBookmarks. The defaults below are
    // duplicated as defaultValue in MOD_SETTING_SCHEMAS.slimBookmarks
    // (ModConfig.js) — the two lists must stay in step.
    // ------------------------------------------------------------------
    const MOD_CONFIG_KEY = 'slimBookmarks';
    const MOD_CONFIG_DIR = '.askonpage';
    const MOD_CONFIG_FILE = 'config.json';

    const settings = {
        maxBarWidth: 600,       // px, ceiling for the whole bar
        barLabelWidth: 105,     // px, ceiling for one bar button's title
        menuLabelWidth: 300,    // px, ceiling for one menu row's title
        displayMode: 'vivaldi', // vivaldi | titleAndIcon | titleOnly | iconOnly | iconExceptFolders
        hoverDelay: 'medium',       // fast | medium | slow, see DELAY_PRESETS
        dragOpenDelay: 'medium',    // fast | medium | slow, see DELAY_PRESETS
        barFolderId: '',        // overrides the folder the bar is built from
        barAnchor: DEFAULT_ANCHOR,  // the toolbar item the bar stands after
    };

    // key -> [min, max]. Values are clamped rather than rejected: ModConfig's
    // number inputs happily accept anything, and a bar with a 0 px ceiling
    // would just silently vanish with no hint as to why.
    const SETTING_LIMITS = {
        maxBarWidth: [120, 4000],
        barLabelWidth: [0, 600],
        menuLabelWidth: [80, 1200],
    };
    const DISPLAY_MODES = ['vivaldi', 'titleAndIcon', 'titleOnly', 'iconOnly', 'iconExceptFolders'];

    // The two timings are a choice of three speeds rather than a number of
    // milliseconds: what the user actually wants to say is "sooner" or "let me
    // pass over it first", and a free number invited values that made the menus
    // either impossible to cross or unbearably slow. The medium column is the
    // value each timing had while it was a number, so the default behaviour is
    // unchanged. The stored setting is the name; the milliseconds are resolved
    // at every use through delayOf().
    const DELAY_SPEEDS = ['fast', 'medium', 'slow'];
    const DELAY_PRESETS = {
        hoverDelay: { fast: 50, medium: 120, slow: 300 },
        dragOpenDelay: { fast: 200, medium: 400, slow: 800 },
    };

    const delayOf = (key) => DELAY_PRESETS[key][settings[key]] ?? DELAY_PRESETS[key].medium;

    // Set by createBookmarkBar once the bar exists. The config may arrive
    // either before or after that — this is the single place both paths meet.
    let onSettingsChanged = null;

    let attempts = 0;
    const timer = setInterval(() => {
        attempts++;

        const toolbar = findToolbar();
        const isApiReady = typeof chrome !== 'undefined' && chrome.bookmarks;

        if (toolbar && isApiReady) {
            if (document.querySelector('.' + BAR_CLASS)) { clearInterval(timer); return; }

            console.log('✅ [SlimBookmarks] Inserting the bookmark bar...');
            try {
                injectStyles();
                createBookmarkBar();
            } catch (err) {
                // keep the interval alive: next attempt in 300 ms
                console.error('[SlimBookmarks] failed to build the bar:', err);
                return;
            }
            clearInterval(timer);
            // settings are read last — they no longer affect the bar itself
            watchVivaldiPrefs();
            return;
        }

        if (attempts >= 30) clearInterval(timer);
    }, 300);

    // ------------------------------------------------------------------
    // Vivaldi settings
    // ------------------------------------------------------------------
    // Some builds return the value itself, others an object {path, value}
    const unwrapPref = (v) => (v && typeof v === 'object' && 'value' in v ? v.value : v);

    function prefsApi() {
        try {
            const prefs = (typeof vivaldi !== 'undefined' && vivaldi.prefs) || null;
            return prefs && typeof prefs.get === 'function' ? prefs : null;
        } catch {
            return null;
        }
    }

    // Reads one pref, hands the raw value to apply(), and calls done() — on
    // success, on failure and when the API stays silent alike. done() is what
    // openBookmark waits on, so it must never be left hanging; apply(), on the
    // other hand, only runs when there really is a value, so a failure simply
    // leaves the last known one in place.
    function readPref(path, apply, done) {
        const finishOnce = (() => {
            let settled = false;
            return () => { if (!settled) { settled = true; (done || (() => {}))(); } };
        })();

        const prefs = prefsApi();
        if (!prefs) { finishOnce(); return; }

        const receive = (value) => {
            if (chrome.runtime.lastError) {
                console.warn('[SlimBookmarks] could not read', path, chrome.runtime.lastError.message);
            } else {
                apply(unwrapPref(value));
            }
            finishOnce();
        };

        // if no answer arrives — carry on with the last known value
        setTimeout(finishOnce, 400);

        try {
            // the prefs.get signature differs between builds: some take an
            // object {path}, some a plain string — try both
            try {
                prefs.get({ path }, receive);
            } catch {
                prefs.get(path, receive);
            }
        } catch (err) {
            console.warn('[SlimBookmarks] reading the setting failed:', err);
            finishOnce();
        }
    }

    // Writing a Vivaldi pref. Only one pref is ever written from here — the
    // layout of the toolbar the bar lives in, when a button is dropped onto the
    // bar — and it is written exactly the way Vivaldi's own toolbar editor
    // writes it. The signature differs between builds (a promise in current
    // ones, a callback in older), so both are tolerated.
    function writePref(path, value) {
        const prefs = prefsApi();
        if (!prefs || typeof prefs.set !== 'function') return false;
        const report = (err) => console.warn('[SlimBookmarks] could not write', path, err);
        try {
            // current builds take the value alone and answer with a promise;
            // passing a callback to those is rejected outright ("no matching
            // signature"), so the one-argument form is tried first
            let result;
            try {
                result = prefs.set({ path, value });
            } catch {
                result = prefs.set({ path, value }, () => {
                    if (chrome.runtime.lastError) report(chrome.runtime.lastError.message);
                });
            }
            if (result && typeof result.catch === 'function') result.catch(report);
            return true;
        } catch (err) {
            report(err);
            return false;
        }
    }

    // Re-reads the setting and calls done() in every case. Nothing here may get
    // in the way of opening a bookmark.
    function readOpenInNewTab(done) {
        readPref(PREF_OPEN_NEW_TAB, (value) => { openInNewTabPref = !!value; }, done);
    }

    // The two prefs that shape the bar itself. Unlike open_in_new_tab they gate
    // no user action, so there is nothing to wait for — whatever arrives is
    // applied through onSettingsChanged, exactly like a ModConfig change.
    function readBarPrefs() {
        readPref(PREF_BAR_DISPLAY, (value) => {
            const mode = String(value || '').toLowerCase();
            // onChanged fires for every pref in Vivaldi, not just ours, so the
            // bar is rebuilt only when the value really moved — otherwise any
            // unrelated setting would close the menu the user has open
            if (!VIVALDI_DISPLAY_MODES[mode] || mode === barDisplayPref) return;
            barDisplayPref = mode;
            if (onSettingsChanged) onSettingsChanged();
        });
        readPref(PREF_BAR_FOLDERS, (value) => {
            if (!Array.isArray(value)) return;
            const ids = value.map(String).filter(Boolean);
            // the bar is rebuilt only when the choice actually changed: a
            // pointless reload closes whatever menu the user has open
            if (ids.join(',') === barFolderIdsPref.join(',')) return;
            barFolderIdsPref = ids;
            if (onSettingsChanged) onSettingsChanged();
        });
    }

    // Nothing here may break the bar: on any error we stay with the defaults
    // and log to the console.
    function watchVivaldiPrefs() {
        try {
            if (!prefsApi()) {
                console.warn('[SlimBookmarks] vivaldi.prefs unavailable — Vivaldi\'s own Bookmarks settings are not read');
                return;
            }

            readOpenInNewTab(() => {
                console.log('⚙️ [SlimBookmarks] Open in a new tab:', openInNewTabPref);
            });
            readBarPrefs();

            // The onChanged payload shape differs between builds, so we do not
            // parse it at all — any change simply triggers a re-read.
            prefsApi().onChanged?.addListener?.(() => {
                readOpenInNewTab(() => {});
                readBarPrefs();
            });
        } catch (err) {
            console.warn('[SlimBookmarks] subscribing to settings failed:', err);
        }
    }

    // ------------------------------------------------------------------
    // Mod settings (ModConfig)
    //
    // The same contract every other mod in the pack follows: read
    // .askonpage/config.json out of OPFS once at startup, then listen for
    // ModConfig's broadcast. A missing file is the normal case — the user has
    // simply never opened the panel — so it is not an error.
    // ------------------------------------------------------------------
    function applyModConfig(raw) {
        const source = raw?.mods?.[MOD_CONFIG_KEY] && typeof raw.mods[MOD_CONFIG_KEY] === 'object'
            ? raw.mods[MOD_CONFIG_KEY]
            : {};

        Object.keys(SETTING_LIMITS).forEach((key) => {
            const value = Number(source[key]);
            if (!Number.isFinite(value)) return;
            const [min, max] = SETTING_LIMITS[key];
            settings[key] = clamp(value, min, max);
        });
        if (DISPLAY_MODES.includes(source.displayMode)) {
            settings.displayMode = source.displayMode;
        }
        Object.keys(DELAY_PRESETS).forEach((key) => {
            if (DELAY_SPEEDS.includes(source[key])) settings[key] = source[key];
        });
        if (typeof source.barFolderId === 'string') {
            settings.barFolderId = source.barFolderId.trim();
        }
        if (typeof source.barAnchor === 'string' && source.barAnchor.trim()) {
            settings.barAnchor = source.barAnchor.trim();
        }
    }

    async function loadModConfig() {
        try {
            const root = await navigator.storage.getDirectory();
            const dir = await root.getDirectoryHandle(MOD_CONFIG_DIR, { create: true });
            const fileHandle = await dir.getFileHandle(MOD_CONFIG_FILE, { create: false });
            const file = await fileHandle.getFile();
            applyModConfig(JSON.parse(await file.text()));
        } catch (err) {
            console.warn('[SlimBookmarks] mod config not loaded, using defaults:', err);
        }
    }

    // The one setting the mod writes itself: dragging the bar has to survive a
    // restart, and there is no way to ask ModConfig to store a value for us.
    // Read-modify-write of the shared config file, the same way
    // WorkspaceThemeSwitcher saves its captured default theme. No
    // vivaldi-mod-config-updated is dispatched afterwards: the value is already
    // live in `settings`, and the broadcast would make every other mod re-read
    // its own config for nothing.
    async function saveBarAnchor(anchor) {
        try {
            const root = await navigator.storage.getDirectory();
            const dir = await root.getDirectoryHandle(MOD_CONFIG_DIR, { create: true });
            let raw = {};
            try {
                const handle = await dir.getFileHandle(MOD_CONFIG_FILE, { create: false });
                raw = JSON.parse(await (await handle.getFile()).text()) || {};
            } catch {
                // no config file yet — the user has never opened the panel
            }
            if (!raw.mods || typeof raw.mods !== 'object') raw.mods = {};
            if (!raw.mods[MOD_CONFIG_KEY] || typeof raw.mods[MOD_CONFIG_KEY] !== 'object') {
                raw.mods[MOD_CONFIG_KEY] = {};
            }
            raw.mods[MOD_CONFIG_KEY].barAnchor = anchor;
            const handle = await dir.getFileHandle(MOD_CONFIG_FILE, { create: true });
            const writable = await handle.createWritable();
            await writable.write(JSON.stringify(raw, null, 2));
            await writable.close();
        } catch (err) {
            console.warn('[SlimBookmarks] could not save the bar position:', err);
        }
    }

    // The config load races the bar's own construction; whichever finishes
    // second finds the other side ready through onSettingsChanged.
    loadModConfig().then(() => { if (onSettingsChanged) onSettingsChanged(); });
    window.addEventListener('vivaldi-mod-config-updated', (event) => {
        applyModConfig(event.detail || {});
        if (onSettingsChanged) onSettingsChanged();
    });

    // The display mode every bar button is drawn in.
    function baseDisplayMode() {
        if (settings.displayMode !== 'vivaldi') return settings.displayMode;
        return VIVALDI_DISPLAY_MODES[barDisplayPref] || 'titleAndIcon';
    }

    // ------------------------------------------------------------------
    // Appearance.
    //
    // Not a single colour of our own: everything comes from Vivaldi's theme
    // variables (style/common.css + the inline style on #browser). Geometry
    // and highlight values are copied from Vivaldi's native menus:
    //   container : .menu > ul            — colorBg/colorFg, radiusCap, padding 4px
    //   row       : .menu > ul li a       — 24px + densityGap, padding 0 9px, radiusHalf
    //   selection : the row under the cursor — colorBgDark, as in the native
    //                                       bookmark bar menus (the accent
    //                                       colour is used there only for the
    //                                       item selected with the keyboard)
    //   button    : .bookmark-bar button  — hover colorBgDark / colorAccentBgDark
    // Vivaldi's shadows are defined in black with transparency and do not
    // depend on the theme — we take exactly the same values as the native menus.
    // ------------------------------------------------------------------
    const STYLESHEET = `
        #${LAYER_ID} {
            position: fixed;
            top: 0;
            left: 0;
            width: 0;
            height: 0;
            overflow: visible;
            /* Window drag region. With disable-titlebar + address-top Vivaldi
               marks .mainbar as -webkit-app-region: drag, and such regions are
               handled outside hit testing: the menu is painted on top, but the
               window swallows mouse events over the toolbar strip — neither
               highlighting nor clicks worked. Vivaldi declares the same
               exception for its own interactive elements (common.css: button,
               input, .topmenu…); our menu rows are plain divs, so we declare
               the exception ourselves, for the whole layer. */
            -webkit-app-region: no-drag;
            /* The z-index is required exactly here. The layer is positioned, and
               such an element forms its own stacking context in Blink, so the
               z-index values of the menus inside the layer are only compared
               against each other. Without raising the layer itself it stays at
               auto, and Vivaldi's toolbar (common.css: .mainbar
               .toolbar-mainbar, z-index: 4) covers the top of a menu opened at
               the cursor over a bar button — it looks like a translucent strip
               on top of the menu. */
            z-index: ${MENU_Z_INDEX};
        }

        .${BAR_CLASS} {
            display: flex;
            align-items: center;
            flex-wrap: nowrap;
            gap: ${BTN_GAP}px;
            margin-left: 6px;
            /* flex: 0 1 auto + min-width: 0 -> the bar stops at its ceiling and
               yields room to the address field instead of squeezing it out */
            flex: 0 1 auto;
            min-width: 0;
            /* the fallbacks are only for the split second before
               applyBarVars() runs — the real values come from the settings */
            max-width: var(--sb-max-bar-width, 600px);
            /* common.css gives .biscuit-setting-version a padding of its own;
               display and max-width above already override the rest of it */
            padding: 0;
            overflow: hidden;
            /* same as the native .bookmark-bar */
            font-size: 11.5px;
        }

        /* While the toolbar editor is open the bar stays visible but stops
           acting — Vivaldi turns its own buttons into previews there, and a
           bookmark menu opening over the editor's dialog would be absurd.
           The icon opacity is Vivaldi's own value for a preview button
           (common.css: .button-disabled-preview.button-toolbar > button svg). */
        /* The bar itself stays hit-testable — it is what the user grabs to move
           it — while everything inside goes inert, so a folder cannot be opened
           and a bookmark cannot be dragged out of a bar that is being placed. */
        .${BAR_CLASS}.${PREVIEW_CLASS} {
            cursor: grab;
        }
        .${BAR_CLASS}.${PREVIEW_CLASS} > * {
            pointer-events: none;
        }
        .${BAR_CLASS}.${PREVIEW_CLASS} .${ICON_CLASS} {
            opacity: 0.65;
        }

        .${BTN_CLASS} {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            text-align: left;
            gap: 6px;
            padding: 0 6px;
            height: 22px;
            /* flex: 0 0 auto — a button is always its natural width: a bar out
               of room hides whole buttons (fitBar) instead of squeezing the
               titles of the ones that stay */
            flex: 0 0 auto;
            box-sizing: border-box;
            appearance: none;
            -webkit-appearance: none;
            border: none;
            outline: none;
            box-shadow: none;
            border-radius: var(--radiusHalf);
            background-color: transparent;
            color: inherit;
            fill: currentColor;
            font: inherit;
            white-space: nowrap;
            cursor: default;
        }

        /* The focus ring is Vivaldi's global rule (common.css: :focus-visible),
           and its specificity matches ours — so it is neutralised explicitly.
           The bar is not keyboard-navigable (the button gives focus up on
           mouseup), so no navigation cue is lost here. */
        .${BTN_CLASS}:focus,
        .${BTN_CLASS}:focus-visible {
            outline: none;
            box-shadow: none;
        }

        /* [hidden] loses to the button's display: flex, hence the explicit rule */
        .${BTN_CLASS}[hidden] {
            display: none;
        }

        /* Rule order = priority: base hover, then the theme variants, then the
           opened button. Their specificity is identical. */
        .${BTN_CLASS}:hover {
            background-color: var(--colorBgDark);
        }
        #browser.color-behind-tabs-on .${BTN_CLASS}:hover {
            background-color: var(--colorBgDark);
        }
        #browser.color-behind-tabs-off .${BTN_CLASS}:hover {
            background-color: var(--colorAccentBgDark);
        }
        #browser.unified-ui .${BTN_CLASS}:hover {
            background-color: var(--colorBgAlphaHeavier);
        }

        .${BTN_CLASS}.${OPEN_CLASS} {
            background-color: var(--colorBgDarker);
        }
        #browser.color-behind-tabs-off .${BTN_CLASS}.${OPEN_CLASS} {
            background-color: var(--colorAccentBgDarker);
        }
        #browser.unified-ui .${BTN_CLASS}.${OPEN_CLASS} {
            background-color: var(--colorBgAlphaHeavy);
        }

        /* app-region inheritance is not guaranteed, so we repeat the exception
           on everything inside the layer. */
        #${LAYER_ID} * {
            -webkit-app-region: no-drag;
        }

        .${MENU_CLASS} {
            /* position: fixed -> coordinates relative to the viewport, nothing
               can clip it. Scrolling is safe here: submenus live in the layer,
               not inside this menu. */
            position: fixed;
            top: 0;
            left: 0;
            visibility: hidden;
            text-align: left;
            color: var(--colorFg);
            /* In some Vivaldi themes --colorBg is translucent: the native menus
               hide that with a backdrop blur (--backgroundBlur), while in our
               case the toolbar simply showed through the menu. We take only the
               RGB from the theme and drop the alpha — same colour, but the menu
               is opaque. The first line is a fallback for builds without
               relative colour syntax, where the menu stays as it was. */
            background-color: var(--colorBg);
            background-color: rgb(from var(--colorBg) r g b / 1);
            fill: currentColor;
            border: none;
            border-radius: var(--radiusCap);
            padding: 4px;
            font: inherit;
            font-size: 13px;
            box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1), 0 3px 10px rgba(0, 0, 0, 0.3);
            min-width: 150px;
            max-width: 420px;
            max-height: 80vh;
            overflow-x: hidden;
            overflow-y: auto;
        }

        /* The contents of a row or a button take no part in hover: the target
           must be the row itself. Otherwise Vivaldi does not repaint its
           background when a descendant is hovered — the computed style is
           already :hover, but the painted fill stays the old one. */
        .${ROW_CLASS} > *,
        .${BTN_CLASS} > * {
            pointer-events: none;
        }

        .${ROW_CLASS} {
            display: flex;
            align-items: center;
            gap: 9px;
            height: calc(24px + var(--densityGap, 0px));
            padding: 0 9px;
            border-radius: var(--radiusHalf);
            color: inherit;
            background-color: transparent;
            white-space: nowrap;
            overflow: hidden;
            cursor: default;
        }

        .${SEP_CLASS} {
            height: 1px;
            margin: 4px 9px;
            background-color: var(--colorBorder);
        }

        /* Edit dialog. Vivaldi's native dialog is unreachable from a mod, but
           the geometry and colours are taken from its own theme, so the window
           looks native. The z-index is above the context menu: the dialog opens
           on top of it. */
        .${DIALOG_CLASS} {
            position: fixed;
            inset: 0;
            z-index: ${MENU_Z_INDEX + 300};
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(0, 0, 0, 0.35);
        }

        .${DIALOG_CLASS}-box {
            display: flex;
            flex-direction: column;
            gap: 12px;
            min-width: 320px;
            max-width: 90vw;
            padding: 16px;
            color: var(--colorFg);
            background-color: var(--colorBg);
            background-color: rgb(from var(--colorBg) r g b / 1);
            border-radius: var(--radiusCap);
            box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1), 0 6px 24px rgba(0, 0, 0, 0.4);
            font: inherit;
            font-size: 13px;
        }

        .${DIALOG_CLASS}-heading {
            font-weight: 600;
        }

        .${DIALOG_CLASS}-field {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .${DIALOG_CLASS}-field > span {
            color: var(--colorFgFadedMore);
        }
        .${DIALOG_CLASS}-field > input {
            height: 26px;
            padding: 0 8px;
            color: inherit;
            background-color: var(--colorBgDark);
            background-color: rgb(from var(--colorBgDark) r g b / 1);
            border: 1px solid var(--colorBorder);
            border-radius: var(--radiusHalf);
            font: inherit;
            font-size: 13px;
        }
        .${DIALOG_CLASS}-field > input:focus {
            outline: 2px solid var(--colorHighlightBg);
            outline-offset: -1px;
        }

        .${DIALOG_CLASS}-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 4px;
        }
        .${DIALOG_CLASS}-button {
            height: 26px;
            padding: 0 14px;
            appearance: none;
            -webkit-appearance: none;
            color: inherit;
            background-color: var(--colorBgDark);
            border: none;
            border-radius: var(--radiusHalf);
            font: inherit;
            font-size: 13px;
            cursor: default;
        }
        .${DIALOG_CLASS}-button:hover {
            background-color: var(--colorBgDarker);
        }
        .${DIALOG_CLASS}-button.is-primary {
            color: var(--colorHighlightFg);
            background-color: var(--colorHighlightBg);
        }
        .${DIALOG_CLASS}-button.is-primary:hover {
            filter: brightness(1.1);
        }


        /* Row highlight: the theme's grey background, as in the native bookmark
           bar menus. In practice it is applied by setRowActive writing into the
           element's inline style — inside Vivaldi's UI window the rule below
           does not repaint the row. The rule is kept as a fallback for
           environments where painting behaves. */
        .${ROW_CLASS}:hover,
        .${ROW_CLASS}.${ACTIVE_CLASS} {
            background-color: var(--colorBgDark);
        }

        .${MENU_CLASS}-icon {
            display: block;
            flex: 0 0 16px;
            width: 16px;
            height: 16px;
        }
        img.${MENU_CLASS}-icon {
            border-radius: 3px;
            object-fit: contain;
        }
        svg.${MENU_CLASS}-icon {
            opacity: 0.85;
        }

        /* A halo for favicons that get lost on a dark background (a dark glyph
           on a transparent background — the GitHub case). The trick is borrowed
           from Vivaldi, where it is applied to the active tab's favicon:
             .theme-dark .tab.active .tab-header .favicon:not(.svg)
           But the native rule puts an outline around the whole icon, so the edge
           shows up even on bright icons that do not need it. That is why the
           shadow is replaced with an SVG filter: it finds the dark pixels by
           itself, and for a bright icon the mask comes out empty. The graph is
           broken down at makeHaloDefs.

           The halo colour is set here rather than in the filter markup:
           flood-color understands var(), and the <feFlood> elements themselves
           live in <defs> inside #browser, so the theme variables are available
           to them. The 75% opacity is the native one.

           The selectors only target img: the SVG placeholders (folder, globe)
           are painted with currentColor and need no highlight.

           The background behind the icon depends on the location, hence three
           rules:
             menu — always --colorBg;
             bar  — also --colorBg, except in "accent on the address bar" mode,
                    where the toolbar is filled with --colorAccentBg.
           The cross cases resolve themselves: dark theme + light accent -> a
           halo only in the menu, and vice versa. */
        #${HALO_FG_ID} feFlood {
            flood-color: var(--colorFg);
            flood-opacity: 0.75;
        }
        #${HALO_ACCENT_ID} feFlood {
            flood-color: var(--colorAccentFg);
            flood-opacity: 0.75;
        }
        #browser.theme-dark .${MENU_CLASS} img.${MENU_CLASS}-icon,
        #browser.theme-dark:not(.color-behind-tabs-off) .${BAR_CLASS} img.${MENU_CLASS}-icon {
            filter: url(#${HALO_FG_ID});
        }
        #browser.acc-dark.color-behind-tabs-off .${BAR_CLASS} img.${MENU_CLASS}-icon {
            filter: url(#${HALO_ACCENT_ID});
        }

        .${MENU_CLASS}-label {
            display: block;
            /* line-height exactly the icon height: otherwise the text box sits
               below the image and the label visually drifts downwards */
            line-height: 16px;
            height: 16px;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            text-align: left;
        }

        /* A bar title is never narrowed by a lack of room: its only limit is
           the Bar Title Width setting (max-width, set inline by makeLabel),
           and a title longer than that is cut with an ellipsis at every bar
           width alike. Whatever no longer fits leaves the bar for the chevron
           menu — see fitBar. */
        .${BAR_CLASS} .${MENU_CLASS}-label {
            flex: 0 0 auto;
        }
        .${BAR_CLASS}.${ICONS_CLASS} .${MENU_CLASS}-label {
            display: none;
        }

        /* Display modes that Vivaldi's own bookmark bar offers, reproduced
           here (Settings > Bookmarks > Bookmark Bar > Display), plus the same
           choices as explicit overrides in the mod's own settings. */
        /* :not(chevron) — the overflow button is nothing but its icon, so
           hiding icons wholesale would leave an empty square at the end */
        .${BAR_CLASS}.${TEXT_CLASS} .${BTN_CLASS}:not(.${CHEVRON_CLASS}) .${ICON_CLASS} {
            display: none;
        }
        .${BAR_CLASS}.${ICONS_NF_CLASS} .${BTN_CLASS}:not(.${FOLDER_BTN_CLASS}) .${MENU_CLASS}-label {
            display: none;
        }

        /* The native submenu arrow: --svgArrow is declared on :root in
           common.css and points down, so we rotate it towards the unfold side. */
        .${MENU_CLASS}-arrow {
            flex: 0 0 16px;
            width: 16px;
            height: 16px;
            margin-left: auto;
            background-color: currentColor;
            mask-image: var(--svgArrow);
            mask-repeat: no-repeat;
            mask-position: center;
            mask-size: 16px 16px;
            rotate: -90deg;
            opacity: 0.65;
        }
        #browser.RTL .${MENU_CLASS}-arrow {
            rotate: 90deg;
        }

        .${MENU_CLASS}-empty {
            display: flex;
            align-items: center;
            height: calc(24px + var(--densityGap, 0px));
            padding: 0 9px;
            color: var(--colorFgFadedMore);
        }

        .${DROP_LINE_CLASS} {
            position: fixed;
            display: none;
            z-index: ${MENU_Z_INDEX + 200};
            background-color: var(--colorHighlightBg);
            border-radius: 1px;
            pointer-events: none;
        }

        /* "into the folder" — outline the target so it cannot be confused with
           the insertion line for "next to" */
        .${BTN_CLASS}.${DROP_INTO_CLASS},
        .${ROW_CLASS}.${DROP_INTO_CLASS} {
            outline: 2px solid var(--colorHighlightBg);
            outline-offset: -2px;
        }
    `;

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = STYLESHEET;
        (document.head || document.documentElement).appendChild(style);
    }

    // ------------------------------------------------------------------
    // Halo filter.
    //
    // The goal: outline in a light colour only those favicon pixels that drown
    // in a dark background, and leave bright icons alone. The solution is
    // per-pixel, without reading the image in JS (a canvas over
    // chrome://favicon2 may turn out tainted, and the "whole icon at once"
    // approach is too coarse anyway).
    //
    // Filter graph:
    //   1. luminanceToAlpha       -> alpha = pixel luminance
    //   2. feComponentTransfer    -> threshold: full halo at luminance <= 0.125,
    //                                fading out towards 0.375, nothing beyond.
    //      The threshold is on luminance itself, not on "1 - luminance":
    //      saturated colours have low luminance (#ff6600 -> 0.50), and a linear
    //      inversion would draw an edge around orange and grey icons.
    //   3. feComposite in         -> keep only the opaque pixels (transparent
    //                                ones have zero RGB and would read as black)
    //   4. feMorphology dilate    -> grow the mask by 1px
    //   5. feComposite out        -> keep only what spilled outside the icon:
    //                                the outline appears where a dark pixel
    //                                borders on emptiness
    //   6. feFlood + in           -> paint the mask (colour comes from CSS)
    //   7. feMerge                -> the filled mask underneath the original icon
    //
    // Hence the behaviour, with no heuristics at all: an opaque light tile gets
    // no edge (there are no dark pixels), an opaque dark one does (it gets lost
    // too), a dark glyph on a transparent background is outlined along its
    // silhouette, and a grey glyph — proportionally to how dark it is.
    // ------------------------------------------------------------------
    const SVG_NS = 'http://www.w3.org/2000/svg';

    function svgEl(tag, attrs, children) {
        const el = document.createElementNS(SVG_NS, tag);
        Object.entries(attrs || {}).forEach(([k, v]) => el.setAttribute(k, v));
        (children || []).forEach(child => el.appendChild(child));
        return el;
    }

    // The two filters differ only by id: the fill colour comes from STYLESHEET
    function haloFilter(id) {
        return svgEl('filter', {
            id,
            // the filter region is larger than the dilation: otherwise the
            // outline would be clipped
            x: '-50%', y: '-50%', width: '200%', height: '200%',
            // filters compute in linearRGB by default, while the luminance
            // threshold was tuned in sRGB
            'color-interpolation-filters': 'sRGB',
        }, [
            svgEl('feColorMatrix', { in: 'SourceGraphic', type: 'luminanceToAlpha', result: 'lum' }),
            svgEl('feComponentTransfer', { in: 'lum', result: 'dark' }, [
                svgEl('feFuncA', { type: 'table', tableValues: '1 1 0.3 0 0 0 0 0 0' }),
            ]),
            svgEl('feComposite', { in: 'dark', in2: 'SourceGraphic', operator: 'in', result: 'darkOpaque' }),
            svgEl('feMorphology', { in: 'darkOpaque', operator: 'dilate', radius: '1', result: 'spread' }),
            svgEl('feComposite', { in: 'spread', in2: 'SourceGraphic', operator: 'out', result: 'ring' }),
            svgEl('feFlood', { result: 'flood' }),
            svgEl('feComposite', { in: 'flood', in2: 'ring', operator: 'in', result: 'halo' }),
            svgEl('feMerge', {}, [
                svgEl('feMergeNode', { in: 'halo' }),
                svgEl('feMergeNode', { in: 'SourceGraphic' }),
            ]),
        ]);
    }

    function makeHaloDefs() {
        const svg = svgEl('svg', { width: '0', height: '0', 'aria-hidden': 'true' }, [
            svgEl('defs', {}, [haloFilter(HALO_FG_ID), haloFilter(HALO_ACCENT_ID)]),
        ]);
        svg.style.cssText = 'position: absolute; width: 0; height: 0; overflow: hidden;';
        return svg;
    }

    // ------------------------------------------------------------------
    // Menu layer.
    //
    // It lives inside #browser, and that is essential: Vivaldi's theme
    // variables (--colorBg, --colorFg, --colorHighlightBg, --radius*,
    // --densityGap) are declared exactly on #browser — by the window's inline
    // style and by common.css rules. They are not inherited into <body>, so a
    // menu placed there picked up system colours and stayed light in a dark
    // theme.
    // Nothing can clip the layer: #browser has no transform/filter/contain, so
    // position: fixed inside it is still resolved against the viewport.
    // ------------------------------------------------------------------
    function layerHost() {
        return document.getElementById('browser') || document.body;
    }

    function getLayer() {
        const host = layerHost();
        let layer = document.getElementById(LAYER_ID);
        if (!layer) {
            layer = document.createElement('div');
            layer.id = LAYER_ID;
            // <defs> are kept right here: the layer lives inside #browser, so
            // flood-color sees the theme variables, and the defs travel along
            // with the layer if it ever has to be recreated
            layer.appendChild(makeHaloDefs());
        }
        // a window repaint could have pulled the layer out of the tree or left
        // it in its previous parent — check every time and put it back
        if (layer.parentElement !== host) host.appendChild(layer);
        return layer;
    }

    const openMenus = [];   // stack: [top-level menu, submenu, ...]
    let hoverTimer = null;
    let activeBarBtn = null;

    // Reopening the menus after a reload.
    //
    // Every bookmark change — including the move our own drop just made — comes
    // back as an onMoved/onChildrenReordered event, and the bar answers it with
    // closeAll() + load(): the whole stack of menus vanishes from under the
    // cursor right after a successful drag. So before the move is sent the open
    // path is written down, and the freshly rendered bar reopens it.
    // Only a drop fills this in: a change made anywhere else (the bookmark
    // manager, another window) still closes the menus, as it did before.
    // The two functions are the bar's own — they need its buttons — and are
    // installed here by createBookmarkBar.
    let captureMenuPath = () => null;
    let restoreMenuPath = () => {};
    let pendingMenuPath = null;

    // A menu holding a live drag source is never closed: removing the node the
    // drag started from kills the drag, and the user is left holding nothing.
    // The loop stops at that menu rather than skipping it — the menus above it
    // are its own submenus, and closing those while keeping this one would
    // leave the stack inconsistent.
    // Deliberately unconditional, including while a drag is in flight. Closing
    // the menu a drag started from does not cancel that drag — Blink captured
    // the payload at dragstart and the session outlives the source node — and
    // the folder that auto-opens under a dragged item comes through
    // openBarMenu(), which closes the whole stack first. An exception for the
    // drag source here made that opened folder refuse every drop.
    function closeFrom(depth) {
        while (openMenus.length > depth) {
            const menu = openMenus.pop();
            if (menu === ctxMenu) ctxMenu = null;
            menu.remove();
            // The row this submenu belonged to keeps its highlight while the
            // submenu is open (see ownsOpenSubmenu), so it has to be released
            // here — unless the cursor is standing on that very row, where the
            // ordinary hover highlight is the correct state.
            if (menu._ownerRow && !menu._ownerRow.matches(':hover')) setRowActive(menu._ownerRow, false);
        }
        if (!openMenus.length && activeBarBtn) {
            activeBarBtn.classList.remove(OPEN_CLASS);
            activeBarBtn = null;
        }
    }

    // Closes the menus and nothing else. It must stay drag-neutral: dragging an
    // item onto a bar folder auto-opens that folder through openBarMenu(),
    // which starts here — ending the drag at that point left the folder open
    // but inert, with no insertion line and no drop.
    function closeAll() {
        clearTimeout(hoverTimer);
        highlightBg = null;     // the theme may have changed between sessions
        closeFrom(0);
    }

    // true if the element's content does not fit its current box — exactly what
    // overflow: hidden in STYLESHEET produces, but measurable from JS
    const overflowing = (el) => el.scrollWidth > el.clientWidth + 1;

    // ------------------------------------------------------------------
    // Bookmark bar: top-level items as buttons in the toolbar
    // ------------------------------------------------------------------
    function createBookmarkBar() {
        const bar = document.createElement('div');
        // no Vivaldi classes: their rules centre the text, impose a min-width
        // and draw a focus ring — because of them labels got clipped in the
        // middle. The one exception is NOT_A_BUTTON_CLASS, which is a marker
        // rather than a style — see its declaration.
        bar.className = BAR_CLASS + ' ' + NOT_A_BUTTON_CLASS;

        let barButtons = [];    // top-level buttons
        let barFolderId = null; // id of the folder the bar was built from
        let barItems = [];      // children of the bar folder in their current order

        // The one size setting the stylesheet needs. It is a custom property
        // rather than a re-injected stylesheet: the sheet is shared by the bar
        // and by every menu in the layer, and replacing it under an open menu
        // would restart its transitions.
        function applyBarVars() {
            bar.style.setProperty('--sb-max-bar-width', settings.maxBarWidth + 'px');
        }

        function render(items) {
            // rebuilding the bar pulls every button out of the tree, including
            // the ones a current drag may be bound to (the source and/or the
            // "into the folder" target) — a stale reference would keep the
            // outline/timer on an element outside the document and would keep
            // accepting further dragover events against an already outdated
            // snapshot of the tree, so a live drag is simply aborted here
            if (dragNode) endDrag();
            barItems = items;
            barButtons.forEach(b => b.remove());
            barButtons = [];

            items.forEach((item) => {
                const btn = makeBarButton();
                const isFolder = !item.url;

                btn.append(makeIcon(item), makeLabel(item, settings.barLabelWidth));
                btn.title = tooltipOf(item);
                btn._node = item;   // the node is needed by the context menu and by dragging
                btn.addEventListener('contextmenu', (e) => {
                    // without preventDefault the toolbar menu shows up over ours
                    e.preventDefault();
                    e.stopPropagation();
                    showContextMenu({ node: item, parentId: barFolderId }, e.clientX, e.clientY, 0);
                });
                makeDraggable(btn, item);
                makeDropTarget(btn, {
                    node: item,
                    parentId: barFolderId,
                    axis: 'x',
                    openFolder: isFolder
                        ? () => openBarMenu(btn, item.children || [], item.id)
                        : null,
                });

                if (isFolder) {
                    // the marker the "icons except folders" display mode selects on
                    btn.classList.add(FOLDER_BTN_CLASS);
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        clearTimeout(hoverTimer);
                        // a second click on the folder that is already open
                        // closes it, the way the native bookmark bar does
                        if (activeBarBtn === btn) { closeAll(); return; }
                        openBarMenu(btn, item.children || [], item.id);
                    });
                    btn.addEventListener('mouseenter', () => {
                        if (ctxMenu || dragNode) return;    // the context menu and a live drag keep focus
                        // if a menu is already open — hovering switches the
                        // folder, as in the native bookmark bar
                        if (!openMenus.length || activeBarBtn === btn) return;
                        clearTimeout(hoverTimer);
                        hoverTimer = setTimeout(() => openBarMenu(btn, item.children || [], item.id), delayOf('hoverDelay'));
                    });
                } else {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        // Ctrl/⌘ — open in the background, without switching
                        openBookmark(item.url, e.ctrlKey || e.metaKey);
                        closeAll();
                    });
                    btn.addEventListener('auxclick', (e) => {
                        if (e.button !== 1) return;
                        e.stopPropagation();
                        openBookmark(item.url, true);   // middle click — in the background
                        closeAll();
                    });
                    btn.addEventListener('mouseenter', () => {
                        if (ctxMenu || dragNode) return;    // the context menu and a live drag keep focus
                        if (!openMenus.length) return;
                        clearTimeout(hoverTimer);
                        hoverTimer = setTimeout(closeAll, delayOf('hoverDelay'));
                    });
                }

                barButtons.push(btn);
                bar.appendChild(btn);
            });

            bar.appendChild(chevron);   // the buttons were appended after it
            fitBar();
        }

        function openBarMenu(btn, items, folderId) {
            if (activeBarBtn === btn) return;   // already opened by this button
            closeAll();
            const menu = buildMenu(items, 0, folderId);
            getLayer().appendChild(menu);
            openMenus.push(menu);
            positionRoot(menu, btn);
            activeBarBtn = btn;
            btn.classList.add(OPEN_CLASS);
        }

        // The open path as folder ids: the bar button's folder first, then one
        // id per submenu. Ids rather than elements — render() replaces every
        // button and every row, so nothing captured here survives the reload.
        captureMenuPath = () => {
            if (!openMenus.length || !activeBarBtn) return null;
            return {
                chevron: activeBarBtn === chevron,
                ids: openMenus.map(m => m.dataset.folderId || ''),
            };
        };

        // Walks the captured path down the rebuilt bar. Any step that no longer
        // exists (the folder was dropped into another one, the button moved
        // under the chevron) simply ends the walk: whatever was reopened stays,
        // and the rest is gone — which is exactly what the tree now looks like.
        restoreMenuPath = (path) => {
            if (!path || !path.ids.length) return;
            const btn = path.chevron ? chevron : barButtons.find(b => b._node?.id === path.ids[0]);
            if (!btn || btn.hidden) return;
            if (path.chevron) openBarMenu(chevron, hiddenItems, barFolderId);
            else openBarMenu(btn, btn._node.children || [], btn._node.id);

            for (let depth = 1; depth < path.ids.length; depth++) {
                const menu = openMenus[depth - 1];
                if (!menu) return;
                const row = [...menu.children].find(el => el._node?.id === path.ids[depth]);
                if (!row || !row._openSub) return;
                row._openSub();
            }
        };

        // Fitting the bar into its ceiling. The only lever is which buttons
        // stay: the ones that do not fit move under the chevron, from the end.
        // Neither the display mode nor the title width is touched — both are
        // the user's choice (ours or Vivaldi's own pref), so a button that
        // stays on the bar looks exactly the same at every bar width.
        // Monotonic: we always start from every button visible, otherwise the
        // result would depend on history.
        let fitting = false;
        function fitBar() {
            if (fitting || !bar.isConnected) return;
            fitting = true;

            // always start from the fullest look — otherwise the result would
            // depend on what had been hidden earlier
            const mode = baseDisplayMode();
            bar.classList.remove(ICONS_CLASS, TEXT_CLASS, ICONS_NF_CLASS);
            if (mode === 'titleOnly') bar.classList.add(TEXT_CLASS);
            if (mode === 'iconOnly') bar.classList.add(ICONS_CLASS);
            if (mode === 'iconExceptFolders') bar.classList.add(ICONS_NF_CLASS);
            barButtons.forEach((btn) => { btn.hidden = false; });
            chevron.hidden = true;
            hiddenItems = [];

            if (overflowing(bar)) {
                // whatever does not fit moves under the chevron,
                // starting from the end
                chevron.hidden = false;
                for (let i = barButtons.length - 1; i >= 0; i--) {
                    barButtons[i].hidden = true;
                    hiddenItems.unshift(barButtons[i]._node);
                    if (!overflowing(bar)) break;
                }
            }

            fitting = false;
        }

        // ------------------------------------------------------------------
        // Moving the bar, and taking in Vivaldi's own toolbar buttons.
        //
        // Vivaldi's toolbar accepts a dropped button only on top of another
        // button: everywhere else its onDragOver sets dropEffect 'none', so the
        // stretch the bar occupies used to swallow every drop without a trace
        // (measured: dragging a button onto the bar left the layout pref
        // untouched). Both halves of the problem live here — the bar takes such
        // a drop itself and rewrites the layout pref the way the editor would,
        // and the bar can be dragged to a new place in customization mode.
        // ------------------------------------------------------------------
        let barDragging = false;

        // The pref the toolbar keeps its layout in. It is a prop of Vivaldi's
        // own Toolbar component, so it comes off the React fiber. Without it the
        // drop is not touched at all: Vivaldi's own behaviour beats writing to a
        // guessed pref path.
        function toolbarPrefName(toolbar) {
            try {
                const key = Object.keys(toolbar).find(k => k.startsWith('__reactFiber$'));
                let fiber = key ? toolbar[key] : null;
                while (fiber && !fiber.stateNode?.editToolbar) fiber = fiber.return;
                return fiber?.stateNode?.props?.name || null;
            } catch (err) {
                console.warn('[SlimBookmarks] could not read the toolbar pref name:', err);
                return null;
            }
        }

        const isButtonDrag = (e) => !!e.dataTransfer
            && Array.from(e.dataTransfer.types).includes(VIVALDI_BTN_MIME);

        // The children the bar can stand between: the named ones only, since
        // the anchor is stored as a name. An unnamed child (the extensions
        // container) is not a stop of its own — a drop past it anchors to the
        // last named item before it.
        function anchorCandidates() {
            const toolbar = bar.parentElement;
            if (!toolbar) return [];
            return Array.from(toolbar.children).filter(el =>
                el !== bar && toolbarItemName(el) && el.getBoundingClientRect().width > 0);
        }

        // The item an insertion at this x lands after, or null for "first".
        function slotBefore(x) {
            let after = null;
            for (const el of anchorCandidates()) {
                const r = el.getBoundingClientRect();
                if (x >= r.left + r.width / 2) after = el; else break;
            }
            return after;
        }

        function showSlotFeedback(x) {
            const target = slotBefore(x);
            if (target) { showDropFeedback(target, { after: true }, 'x'); return; }
            const first = anchorCandidates()[0];
            if (first) showDropFeedback(first, { after: false }, 'x');
        }

        // A Vivaldi button dropped on the bar. The insertion index is the same
        // for both halves of the bar — right after the bar's own anchor — and
        // what differs is where the bar ends up standing: a drop on the left
        // half means the button goes between the anchor and the bar, which is
        // exactly "the bar now stands after this button".
        function takeButtonDrop(e, before) {
            const toolbar = bar.parentElement;
            if (!toolbar) return false;
            // Everything the drag carries is read right here, while the event is
            // still being dispatched: a DataTransfer goes empty the moment the
            // handler returns, and the layout below is fetched asynchronously.
            const name = e.dataTransfer.getData(VIVALDI_BTN_MIME);
            const from = e.dataTransfer.getData(VIVALDI_TOOLBAR_MIME);
            const at = parseInt(e.dataTransfer.getData(VIVALDI_BTN_INDEX_MIME), 10);
            if (!name) return false;
            const pref = toolbarPrefName(toolbar);
            if (!pref) return false;
            // A button dragged in from another toolbar: Vivaldi drops it from
            // its old toolbar in its own dragend, and only when its own drop
            // handler has run. Swallowing that drop would leave a duplicate
            // behind, so those are left to Vivaldi.
            if (from && from !== pref) return false;

            readPref(pref, (value) => {
                if (!Array.isArray(value)) return;
                const list = value.slice();
                // A move inside this toolbar. The source index is what tells the
                // old place apart from a brand-new button of the same name —
                // the spacers and the separator may legitimately repeat, so the
                // name alone is not enough to find what to remove.
                if (Number.isInteger(at) && list[at] === name) list.splice(at, 1);

                const anchor = settings.barAnchor || DEFAULT_ANCHOR;
                const found = anchor === ANCHOR_START ? -1 : list.indexOf(anchor);
                const index = anchor === ANCHOR_START ? 0 : (found >= 0 ? found + 1 : list.length);
                list.splice(index, 0, name);
                writePref(pref, list);
                // A drop on the left half moves the bar behind the button. Its
                // node usually does not exist yet — React renders it once the
                // pref change lands — and then insertBar() finds nothing and
                // leaves the bar where it is; the observer over the toolbar's
                // children puts it in place as soon as the node shows up. When
                // the button was already in this toolbar the node is there and
                // the bar moves at once.
                if (before) {
                    settings.barAnchor = name;
                    insertBar(bar);
                    fitBar();
                    saveBarAnchor(name);
                }
            });
            return true;
        }

        bar.addEventListener('dragstart', (e) => {
            // the bar itself only, and only where toolbar items are arranged —
            // a bookmark dragged out of a bar button brings its own dragstart
            if (e.target !== bar || !bar.draggable) return;
            e.stopPropagation();
            barDragging = true;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData(BAR_DRAG_MIME, '1');
            // as for bookmarks: a drag carrying nothing the platform recognises
            // is not reliably started by the OS drag session
            e.dataTransfer.setData('text/plain', 'Slim Bookmarks');
        });
        bar.addEventListener('dragend', () => {
            if (!barDragging) return;
            barDragging = false;
            clearDropFeedback();
        });

        // The bar is dropped onto the toolbar, so the feedback and the drop
        // itself hang on the toolbar. Both are attached on every (re-)insertion
        // of the bar; a repeated addEventListener with the same function is a
        // no-op, so they never pile up.
        function onToolbarDragOver(e) {
            if (!barDragging) return;
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';
            showSlotFeedback(e.clientX);
        }
        function onToolbarDrop(e) {
            if (!barDragging) return;
            e.preventDefault();
            e.stopPropagation();
            barDragging = false;
            clearDropFeedback();
            const target = slotBefore(e.clientX);
            const anchor = target ? toolbarItemName(target) : ANCHOR_START;
            if (!anchor || anchor === settings.barAnchor) return;
            settings.barAnchor = anchor;
            insertBar(bar);
            fitBar();
            saveBarAnchor(anchor);
        }

        // A right click on the free space between/after the buttons = the
        // context menu of the bar folder itself, so that a new folder can be
        // added to the top level of the bar. An event from a button never
        // reaches here: there is a stopPropagation over there.
        bar.addEventListener('contextmenu', (e) => {
            if (!barFolderId) return;   // no folder resolved yet -> leave the native menu alone
            e.preventDefault();
            e.stopPropagation();
            showContextMenu({ node: null, parentId: barFolderId }, e.clientX, e.clientY, 0);
        });

        // A drop on the free space to the right of the buttons = to the end of
        // the bar folder. An event from a button never reaches here: there is a
        // stopPropagation over there.
        bar.addEventListener('dragover', (e) => {
            if (isButtonDrag(e)) {
                // Vivaldi's own toolbar button. The bar takes the drop rather
                // than letting it fall through to the toolbar, which refuses
                // everything outside its buttons; the line shows which side of
                // the bar the button will land on.
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = 'move';
                const r = bar.getBoundingClientRect();
                showDropFeedback(bar, { after: e.clientX >= r.left + r.width / 2 }, 'x');
                return;
            }
            if (!dragNode || !barFolderId) return;
            const dest = { parentId: barFolderId };
            if (!canDrop(dragNode, dest)) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            // after: true -> the line stands at the bar's right edge, that is,
            // exactly where the item will end up
            showDropFeedback(bar, { parentId: barFolderId, index: barItems.length, after: true }, 'x');
        });
        bar.addEventListener('drop', (e) => {
            if (isButtonDrag(e)) {
                const r = bar.getBoundingClientRect();
                // takeButtonDrop declines what it must not touch (a button from
                // another toolbar); then the event is left to bubble on to
                // Vivaldi's own handler untouched
                if (takeButtonDrop(e, e.clientX < r.left + r.width / 2)) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                clearDropFeedback();
                return;
            }
            e.preventDefault();
            // the drop location is recomputed from this very drop event: the
            // cursor may have last been over another element
            const dest = dragNode && barFolderId ? { parentId: barFolderId } : null;
            if (dragNode && dest && canDrop(dragNode, dest)) applyDrop(dragNode, dest);
            endDrag();
        });
        bar.addEventListener('dragleave', (e) => {
            if (!bar.contains(e.relatedTarget)) clearDropFeedback();
        });

        // Whatever did not fit on the bar moves into this button's menu. The
        // button itself is never hidden and is not part of barButtons,
        // otherwise fitBar could hide it too.
        let hiddenItems = [];   // items that did not fit into the bar
        const chevron = makeBarButton();
        chevron.classList.add(CHEVRON_CLASS);
        chevron.appendChild(chevronIcon());
        chevron.title = 'Other bookmarks';
        chevron.hidden = true;
        chevron.addEventListener('click', (e) => {
            e.stopPropagation();
            clearTimeout(hoverTimer);
            if (activeBarBtn === chevron) { closeAll(); return; }   // a second click closes it
            openBarMenu(chevron, hiddenItems, barFolderId);
        });
        chevron.addEventListener('mouseenter', () => {
            if (ctxMenu || dragNode) return;
            if (!openMenus.length || activeBarBtn === chevron) return;
            clearTimeout(hoverTimer);
            hoverTimer = setTimeout(() => openBarMenu(chevron, hiddenItems, barFolderId), delayOf('hoverDelay'));
        });
        bar.appendChild(chevron);

        insertBar(bar);
        // We observe the parent: the toolbar decides how much free space there
        // is, while changes to the bar itself are caused by us — otherwise it
        // would be a loop. The same observer is reused on every (re-)insertion
        // of the bar: disconnect() stops watching the previous parent before
        // starting to watch the new one — without that, repeated insertions
        // (leaving toolbar customization mode) would pile up observers, and only
        // the very first one — possibly attached to a parent already detached
        // from the document — would be considered current.
        const resizeObserver = new ResizeObserver(fitBar);
        // React rebuilds the toolbar's own children on every layout change, and
        // our node keeps whatever position it had — which after a rearrangement
        // may no longer be the one next to the anchor. This puts it back, and it
        // is also what moves the bar to a button that has just been dropped on
        // it. Our own insertion mutates the child list too, but by then the bar
        // is anchored and insertBar() does nothing, so it settles in one pass.
        const anchorObserver = new MutationObserver(() => {
            if (bar.isConnected && !barIsAnchored(bar)) { insertBar(bar); fitBar(); }
        });
        const rewatchParent = () => {
            resizeObserver.disconnect();
            anchorObserver.disconnect();
            const toolbar = bar.parentElement;
            if (!toolbar) return;
            resizeObserver.observe(toolbar);
            anchorObserver.observe(toolbar, { childList: true });
            toolbar.addEventListener('dragover', onToolbarDragOver);
            toolbar.addEventListener('drop', onToolbarDrop);
        };
        rewatchParent();
        // after every re-insertion of the bar (leaving toolbar customization
        // mode) we need both to recompute which buttons fit for the current
        // size and to move the observation to the current parent — without that
        // the bar sticks in a state computed for the previous size until the
        // next "real" window resize
        watchToolbarEditMode(bar, () => { rewatchParent(); fitBar(); });
        // the bar's own icons need the filter right away, without waiting for
        // the first menu
        getLayer();

        // --- data and its updates ---
        function load() {
            chrome.bookmarks.getTree((tree) => {
                const folder = resolveBarFolder(tree);
                console.log('📚 [SlimBookmarks] Bar folder:', folder?.id, folder?.title);
                barFolderId = folder?.id || null;
                render(folder?.children || []);
                // after render: the buttons the path is walked through exist
                // only now, and fitBar has already decided which of them stayed
                const path = pendingMenuPath;
                pendingMenuPath = null;
                if (path) restoreMenuPath(path);
            });
        }

        let reloadTimer = null;
        const scheduleReload = () => {
            clearTimeout(reloadTimer);
            reloadTimer = setTimeout(() => { closeAll(); load(); }, 200);
        };
        ['onCreated', 'onRemoved', 'onChanged', 'onMoved', 'onChildrenReordered']
            .forEach(ev => chrome.bookmarks[ev]?.addListener(scheduleReload));

        // changing the bar folder itself changes meta_info, not the bookmark structure
        if (typeof vivaldi !== 'undefined') {
            vivaldi.bookmarksPrivate?.onMetaInfoChanged?.addListener(scheduleReload);
        }

        applyBarVars();
        load();

        // Settings changed — from ModConfig or from Vivaldi's own Bookmarks
        // page. A full reload rather than a targeted update: the label widths
        // are baked into the buttons at build time, and the folder the bar is
        // built from may have changed too. Open menus go first — they were
        // built against the old widths.
        onSettingsChanged = () => {
            applyBarVars();
            closeAll();
            // the position may have been typed into the panel by hand
            insertBar(bar);
            load();
        };

        // --- global closing ---
        document.addEventListener('click', (e) => {
            // while the context menu is open, a click outside only dismisses it
            if (ctxMenu && !ctxMenu.contains(e.target)) {
                e.preventDefault();
                e.stopPropagation();
                // the index is a safeguard in case the "ctxMenu is in openMenus"
                // invariant is ever broken: -1 in closeFrom would reach
                // undefined.remove()
                closeFrom(Math.max(0, openMenus.indexOf(ctxMenu)));
                return;
            }
            if (bar.contains(e.target)) return;
            if (openMenus.some(m => m.contains(e.target))) return;
            closeAll();
        }, true);
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            // the one place a drag really is being cancelled by the user
            endDrag();
            closeAll();
            closeEditDialog();
        });
        // A native context menu takes the focus away from the UI window, and
        // the menu the right click came from must survive that — otherwise it
        // vanishes from under the native menu that is describing its own row.
        window.addEventListener('blur', () => { if (!nativeMenu) closeAll(); });
        window.addEventListener('resize', () => { closeAll(); fitBar(); });
    }

    // ------------------------------------------------------------------
    // Bar insertion and toolbar customization mode
    //
    // Vivaldi determines where to insert its own elements by the indices of the
    // toolbar's children, so our extra node shifts everything by one. Hiding it
    // with display: none is useless — the node stays in the DOM and is still
    // counted. While editing is in progress we remove the bar from the tree
    // entirely.
    // ------------------------------------------------------------------
    function findToolbar() {
        return document.querySelector('.toolbar-addressbar')
            || document.querySelector('.toolbar-mainbar')
            || document.querySelector('[role="toolbar"]')
            || document.querySelector('.UrlBar-AddressField')?.parentElement
            || null;
    }

    // A toolbar item is a direct child of the toolbar. Its name sits on the
    // element carrying data-name, which is the child itself for the address
    // field and the inner <button> for a button. Some children have no name at
    // all (the extensions container), and those cannot serve as an anchor.
    function toolbarItemName(child) {
        if (child.dataset && child.dataset.name) return child.dataset.name;
        return child.querySelector?.('[data-name]')?.dataset.name || null;
    }

    function toolbarItemNode(toolbar, name) {
        for (const child of toolbar.children) {
            if (toolbarItemName(child) === name) return child;
        }
        return null;
    }

    // What must stand immediately before the bar. Three answers, and they are
    // three different placements:
    //   a toolbar child — the bar goes right after it;
    //   null           — the anchor is ANCHOR_START, the bar comes first;
    //   undefined      — nothing in this toolbar carries a name the anchor
    //                    could refer to, so the bar goes to the end, which is
    //                    where it went before its position became a setting.
    // A named-but-missing anchor falls back to the address field: the user may
    // have dragged the item the bar was anchored to out of the toolbar.
    function barPredecessor(toolbar) {
        const wanted = settings.barAnchor || DEFAULT_ANCHOR;
        if (wanted === ANCHOR_START) return null;
        return toolbarItemNode(toolbar, wanted)
            || toolbarItemNode(toolbar, DEFAULT_ANCHOR)
            || undefined;
    }

    function barIsAnchored(bar) {
        const toolbar = bar.parentElement;
        if (!toolbar) return false;
        const before = barPredecessor(toolbar);
        if (before === undefined) return bar.nextElementSibling === null;
        return bar.previousElementSibling === before;
    }

    function insertBar(bar) {
        const toolbar = findToolbar();
        if (!toolbar) return false;
        // already where it belongs — say so without touching the DOM: this also
        // runs from a MutationObserver on the toolbar, and a pointless move
        // would wake that observer again
        if (bar.parentElement === toolbar && barIsAnchored(bar)) return true;
        const before = barPredecessor(toolbar);
        if (before === undefined) toolbar.appendChild(bar);
        else if (before === null) toolbar.insertBefore(bar, toolbar.firstChild);
        else toolbar.insertBefore(bar, before.nextSibling);
        return true;
    }

    function watchToolbarEditMode(bar, onInserted) {
        // the class sits on the root <div id="browser">
        const root = document.getElementById('browser');
        if (!root) {
            console.warn('[SlimBookmarks] #browser not found — customization mode is not tracked');
            return;
        }

        const isEditing = () => root.classList.contains('toolbar-edit-mode');

        const sync = () => {
            // The bar used to be removed for the duration of customization mode.
            // It stays now: the mode shows the toolbar as it really is, and a
            // bar that vanishes exactly while its place is being arranged is the
            // opposite of that. What it must not do there is act — Vivaldi turns
            // its own buttons into inert previews, so the bar follows (see
            // PREVIEW_CLASS in the stylesheet), and any open menu is closed.
            const editing = isEditing();
            bar.classList.toggle(PREVIEW_CLASS, editing);
            // customization mode is where toolbar items are moved, so that is
            // where the bar itself can be picked up — and nowhere else
            bar.draggable = editing;
            if (editing) closeAll();
            // entering and leaving the mode repaints the toolbar, and our
            // insertion may be wiped by the next render — hence a couple of
            // extra attempts. After every (including deferred) successful
            // insertion, onInserted() recomputes which buttons fit and moves the
            // ResizeObserver to the current parent — without that the bar stays
            // in a state computed for the previous size, until the user touches
            // the window manually
            if (!bar.isConnected && insertBar(bar)) onInserted();
            [200, 600].forEach(delay => setTimeout(() => {
                if (!bar.isConnected && insertBar(bar)) onInserted();
            }, delay));
        };

        new MutationObserver(sync).observe(root, {
            attributes: true,
            attributeFilter: ['class'],
        });

        sync();
    }

    // ------------------------------------------------------------------
    // Finding the folder the user picked as the bookmark bar
    // ------------------------------------------------------------------
    function isBarFolder(node) {
        if (node.url) return false;
        // a Vivaldi build may expose the flag both as meta_info and as a node property
        const meta = node.meta_info || node.metaInfo;
        if (meta && String(meta.Bookmarkbar) === 'true') return true;
        return node.bookmarkbar === true || String(node.bookmarkbar) === 'true';
    }

    function findNode(node, predicate) {
        if (predicate(node)) return node;
        for (const child of node.children || []) {
            const hit = findNode(child, predicate);
            if (hit) return hit;
        }
        return null;
    }

    function resolveBarFolder(tree) {
        const roots = (tree[0]?.children || []).filter(r => r.id !== TRASH_ID);
        const findById = (id) => {
            for (const root of roots) {
                const hit = findNode(root, n => n.id === String(id));
                if (hit) return hit;
            }
            return null;
        };

        // the explicit override wins over everything: it exists precisely for
        // the case where the two automatic sources below get it wrong
        const forcedId = String(settings.barFolderId || FORCE_FOLDER_ID || '').trim();
        if (forcedId) {
            const forced = findById(forcedId);
            if (forced) return forced;
            console.warn('[SlimBookmarks] Bar Folder ID not found:', forcedId);
        }

        for (const root of roots) {
            const flagged = findNode(root, isBarFolder);
            if (flagged) return flagged;
        }

        // Vivaldi's own "Bookmark Bar folder" setting. meta_info comes first
        // because that is what Vivaldi writes when the folder is picked from
        // the bar itself; the pref is the same choice as stored in settings,
        // and it is the only source left when the tree snapshot this build
        // hands us carries no meta_info at all.
        for (const id of barFolderIdsPref) {
            const picked = findById(id);
            if (picked) return picked;
        }

        // no custom folder picked — the stock bookmark bar (id '1')
        return roots.find(r => r.id === '1') || roots[0] || null;
    }

    function makeBarButton() {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = BTN_CLASS;
        // Vivaldi draws a focus ring on toolbar buttons — it is out of place here.
        // The blur has to happen on mouseup, not on focus: blurring inside the
        // focus that a mousedown produces aborts the drag Blink is about to
        // start, so dragging a bar button only worked about one time in four.
        // After a drop no mouseup is dispatched at all, so this cannot interfere
        // with a drag; the ring itself is suppressed in STYLESHEET.
        btn.addEventListener('mouseup', () => btn.blur());
        return btn;
    }

    // Menu row highlight: a class, with the colours for it picked in STYLESHEET
    // following the rules of Vivaldi's native menus.
    // The row highlight colour matches Vivaldi's native bookmark bar menus: the
    // theme's grey background, with the text keeping its own colour. The accent
    // --colorHighlightBg is reserved there for the item selected with the
    // keyboard (selectedItem), not for the one under the cursor.
    // getComputedStyle(#browser) forces a style recalculation of Vivaldi's whole
    // UI tree, and this is called from mousemove — so it used to run on every
    // single pointer movement across a menu. The colour cannot change while a
    // menu is open, so it is read once per menu session and dropped in
    // closeAll(), where the next session begins.
    let highlightBg = null;

    function rowHighlightColors() {
        if (highlightBg === null) {
            highlightBg = getComputedStyle(layerHost()).getPropertyValue('--colorBgDark').trim();
        }
        return { bg: highlightBg, fg: '' };
    }

    // The highlight is written straight into the element's style, not only as a
    // class. Inside Vivaldi's UI window the rule from our stylesheet does not
    // repaint the row under the cursor: its computed style is already
    // highlighted, but it is painted with the old background. Writing into the
    // element's style always produces a repaint. The class stays: the code uses
    // it to tell which row is active.
    function setRowActive(row, on) {
        row.classList.toggle(ACTIVE_CLASS, on);
        if (!on) {
            row.style.backgroundColor = '';
            row.style.color = '';
            return;
        }
        const { bg, fg } = rowHighlightColors();
        if (bg) row.style.backgroundColor = bg;
        if (fg) row.style.color = fg;
    }

    // A folder row whose submenu is open keeps its highlight even though the
    // cursor has left it: while the user is inside the submenu, that row is the
    // path they took to get there, and without the highlight the trail through
    // the nested folders disappears. The highlight is released in closeFrom(),
    // when the submenu goes away.
    const ownsOpenSubmenu = (row) => openMenus.some((m) => m._ownerRow === row);

    // Highlighting follows the actual cursor position rather than a chain of
    // mouseenter events: the menu often appears underneath an already stationary
    // cursor, and then no row-entered event arrives at all.
    function trackRowUnderPointer(menu) {
        menu.addEventListener('mousemove', (e) => {
            const row = e.target.closest ? e.target.closest('.' + ROW_CLASS) : null;
            menu.querySelectorAll('.' + ROW_CLASS + '.' + ACTIVE_CLASS)
                .forEach((other) => { if (other !== row && !ownsOpenSubmenu(other)) setRowActive(other, false); });
            if (row) setRowActive(row, true);
        });
    }

    // ------------------------------------------------------------------
    // Icons and labels
    // ------------------------------------------------------------------
    const ICON_SIZE = 16;

    function svgIcon(pathD) {
        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 16 16');
        svg.setAttribute('class', ICON_CLASS);
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '1.3');
        svg.setAttribute('stroke-linejoin', 'round');
        const path = document.createElementNS(ns, 'path');
        path.setAttribute('d', pathD);
        svg.appendChild(path);
        return svg;
    }

    const folderIcon = () => svgIcon('M1.8 4.3a1.3 1.3 0 0 1 1.3-1.3h2.7l1.4 1.7h5.9a1.3 1.3 0 0 1 1.3 1.3v6a1.3 1.3 0 0 1-1.3 1.3H3.1a1.3 1.3 0 0 1-1.3-1.3V4.3Z');
    const globeIcon = () => svgIcon('M8 1.6a6.4 6.4 0 1 0 0 12.8A6.4 6.4 0 0 0 8 1.6Zm0 0c-1.8 1.5-2.7 3.6-2.7 6.4S6.2 12.9 8 14.4c1.8-1.5 2.7-3.6 2.7-6.4S9.8 3.1 8 1.6ZM1.8 8h12.4');
    const chevronIcon = () => svgIcon('M4.5 4l4 4-4 4M9.5 4l4 4-4 4');

    function makeIcon(item) {
        if (!item.url) return folderIcon();

        const img = document.createElement('img');
        img.className = ICON_CLASS;
        // chrome://favicon2 is the current scheme; chrome://favicon is a legacy fallback
        const sources = [
            `chrome://favicon2/?size=${ICON_SIZE}&scaleFactor=2x&pageUrl=${encodeURIComponent(item.url)}&allowGoogleServerFallback=0`,
            `chrome://favicon/size/${ICON_SIZE}@2x/${item.url}`,
        ];
        let attempt = 0;
        img.addEventListener('error', () => {
            attempt++;
            if (attempt < sources.length) img.src = sources[attempt];
            else img.replaceWith(globeIcon());   // no favicon — a neutral globe
        });
        img.src = sources[0];
        return img;
    }

    function makeLabel(item, maxWidth) {
        const label = document.createElement('span');
        label.className = MENU_CLASS + '-label';
        label.style.maxWidth = maxWidth + 'px';
        label.textContent = titleOf(item);
        return label;
    }

    function titleOf(item) {
        if (item.title) return item.title;
        if (!item.url) return 'Untitled';
        try { return new URL(item.url).hostname; } catch { return item.url; }
    }

    // Bar button tooltip: it used to be a bare URL, and in icons-only mode (with
    // the label hidden) the button was impossible to identify. The title on the
    // first line and the link on the second — the way Vivaldi's native bookmark
    // bar does it.
    function tooltipOf(item) {
        if (!item.url) return titleOf(item);
        return titleOf(item) + '\n' + item.url;
    }

    // ------------------------------------------------------------------
    // Building a single menu level
    // ------------------------------------------------------------------
    function makeMenuShell(depth) {
        const menu = document.createElement('div');
        menu.className = MENU_CLASS;
        menu.dataset.depth = String(depth);
        menu.style.zIndex = String(MENU_Z_INDEX + depth);
        trackRowUnderPointer(menu);
        return menu;
    }

    function makeMenuRow() {
        const row = document.createElement('div');
        row.className = ROW_CLASS;
        row.onmouseleave = () => { if (!ownsOpenSubmenu(row)) setRowActive(row, false); };
        return row;
    }

    function buildMenu(items, depth, folderId) {
        const menu = makeMenuShell(depth);
        // the folder id is needed while dragging: it doubles as the parentId for insertion
        menu.dataset.folderId = folderId || '';

        if (!items || !items.length) {
            const empty = document.createElement('div');
            empty.className = MENU_CLASS + '-empty';
            empty.textContent = 'Empty';
            menu.appendChild(empty);
            // no return: an empty folder must accept drops too — that is the only
            // way to put something into it through its own menu
        }

        (items || []).forEach(item => {
            const row = makeMenuRow();

            const isFolder = !item.url;
            row._node = item;   // the node id is how a reopened menu finds this row again
            row.append(makeIcon(item), makeLabel(item, settings.menuLabelWidth));
            row.title = item.url || titleOf(item);
            row.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // depth + 1: the menu holding the row stays open
                showContextMenu({ node: item, parentId: folderId }, e.clientX, e.clientY, depth + 1);
            });

            // openSub is declared below, inside the isFolder branch, but dragging
            // needs it before that branch (makeDropTarget is called once for both
            // branches) — the branch itself copies it here if this is a folder
            let openSubForDrag = null;

            if (isFolder) {
                const arrow = document.createElement('span');
                arrow.className = MENU_CLASS + '-arrow';
                row.appendChild(arrow);

                const openSub = () => {
                    // this row's submenu is already open — bail out without
                    // recreating it: recreation was exactly what caused the
                    // flicker on click/hover
                    if (openMenus[depth + 1]?._ownerRow === row) return;
                    closeFrom(depth + 1);
                    const sub = buildMenu(item.children || [], depth + 1, item.id);
                    sub._ownerRow = row;
                    getLayer().appendChild(sub);
                    openMenus.push(sub);
                    positionSub(sub, row, menu);
                    // hovering has already done this, but a submenu reopened
                    // after a drop has seen no mouseenter at all
                    if (!dragNode) setRowActive(row, true);
                };
                openSubForDrag = openSub;
                row._openSub = openSub;

                row.onmouseenter = () => {
                    if (ctxMenu || dragNode) return;    // the context menu and a live drag keep focus
                    setRowActive(row, true);
                    clearTimeout(hoverTimer);
                    hoverTimer = setTimeout(openSub, delayOf('hoverDelay'));
                };
                row.addEventListener('click', (e) => {
                    e.stopPropagation();
                    clearTimeout(hoverTimer);
                    // Deliberately not a toggle. Only the folders on the bar
                    // itself close on a second click: there the button stays put
                    // under the cursor, so clicking it again reads as "put this
                    // away". A row inside a menu is a step along a path — the
                    // submenu the user is heading into may well be covering the
                    // row they just clicked, and collapsing the path under the
                    // cursor there loses their place. openSub() bails out on its
                    // own when this row's submenu is already open.
                    openSub();
                });
            } else {
                row.onmouseenter = () => {
                    if (ctxMenu || dragNode) return;    // the context menu and a live drag keep focus
                    setRowActive(row, true);
                    clearTimeout(hoverTimer);
                    // hovering a bookmark -> close the neighbouring folder's submenu
                    hoverTimer = setTimeout(() => closeFrom(depth + 1), delayOf('hoverDelay'));
                };
                row.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openBookmark(item.url, e.ctrlKey || e.metaKey);
                    closeAll();
                });
                row.addEventListener('auxclick', (e) => {
                    if (e.button !== 1) return;
                    e.stopPropagation();
                    openBookmark(item.url, true);
                    closeAll();
                });
            }

            makeDraggable(row, item);
            makeDropTarget(row, {
                node: item,
                parentId: folderId,
                axis: 'y',
                openFolder: isFolder ? openSubForDrag : null,
            });

            menu.appendChild(row);
        });

        // A right click past the rows (an empty folder, or the space below the
        // last row) = the context menu of this folder itself. This is the only
        // way into a folder that has nothing in it yet: there is no row to aim
        // at. Rows stop propagation in their own handler, so only events from
        // the menu's background get here.
        menu.addEventListener('contextmenu', (e) => {
            if (!folderId) return;
            e.preventDefault();
            e.stopPropagation();
            showContextMenu({ node: null, parentId: folderId }, e.clientX, e.clientY, depth + 1);
        });

        // A drop past the rows (an empty folder, or the space below the last row)
        // = to the end of this folder. On target rows makeDropTarget already
        // calls stopPropagation in both branches (accept and reject), so only
        // events from the menu's own background reach here.
        menu.addEventListener('dragover', (e) => {
            if (!dragNode || !folderId) return;
            const dest = { parentId: folderId };
            if (!canDrop(dragNode, dest)) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            // after: true -> the line along the menu's bottom edge: the item goes
            // to the end
            showDropFeedback(menu, { parentId: folderId, index: (items || []).length, after: true }, 'y');
        });
        menu.addEventListener('drop', (e) => {
            e.preventDefault();
            // the drop location is recomputed from this very drop event: the
            // cursor may have last been over another row
            const dest = dragNode && folderId ? { parentId: folderId } : null;
            if (dragNode && dest && canDrop(dragNode, dest)) applyDrop(dragNode, dest);
            endDrag();
        });
        menu.addEventListener('dragleave', (e) => {
            if (!menu.contains(e.relatedTarget)) clearDropFeedback();
        });

        return menu;
    }

    // ------------------------------------------------------------------
    // Labels from Vivaldi's locale.
    //
    // The key in _locales/<language>/messages.json is an encoded English
    // string: lowercase letters and digits stay as they are, everything else
    // (uppercase, spaces, punctuation) becomes _<char code>_, with a 0 appended
    // at the end; an optional context prefix is separated by _4_.
    //   'Open in New Tab' -> _79_pen_32_in_32__78_ew_32__84_ab0
    //   'verb' + 'Delete' -> verb_4__68_elete0
    // If chrome.i18n stays silent, the hardcoded English text remains: that way
    // localization is an improvement rather than a prerequisite for working.
    // ------------------------------------------------------------------
    function localeKey(text, prefix) {
        const body = text.replace(/[^a-z0-9]/g, (ch) => `_${ch.charCodeAt(0)}_`);
        return (prefix ? prefix + '_4_' : '') + body + '0';
    }

    function label(text, prefix, fallback) {
        try {
            const msg = chrome.i18n?.getMessage?.(localeKey(text, prefix));
            if (msg) return msg;
        } catch (err) {
            console.warn('[SlimBookmarks] chrome.i18n unavailable:', err);
        }
        return fallback;
    }

    // the test harness needs access to the key encoding; unused in the browser
    window.__bookmarkModLocaleKey = localeKey;

    // ------------------------------------------------------------------
    // Context menu.
    //
    // The menu itself is normally drawn by the browser, not from here — see
    // showNativeContextMenu below; what follows is the item list both paths
    // share, and the HTML menu that stands in when the native one cannot be
    // shown.
    //
    // Its contents are deliberately shorter than Vivaldi's native menu: the
    // open and copy-link entries are dropped — a plain click, the middle button
    // and Ctrl/⌘ already cover opening. Editing and deleting are what is left.
    // Styling, the layer, closing and positioning are taken from the folder
    // menus — only the contents and the group separator are specific here.
    // ------------------------------------------------------------------
    // A function rather than a constant: chrome.i18n may not be ready yet inside
    // Vivaldi's UI window when the script loads, and label() does not throw on
    // failure — all labels would then silently and permanently be stuck on the
    // hardcoded English fallback. We call it anew on every menu build so that
    // localization is picked up as soon as the API is ready.
    function buildLabels() {
        return {
            edit: label('Edit', 'command', 'Edit'),
            addFolder: label('Add Folder', null, 'Add Folder'),
            newFolder: label('New Folder', 'command', 'New Folder'),
            remove: label('Delete', 'verb', 'Delete'),
            // Vivaldi's locale has no strings for our own dialog's fields —
            // the native edit dialog lives in a React store and is unreachable.
            editBookmarkTitle: 'Edit Bookmark',
            editFolderTitle: 'Edit Folder',
            fieldName: 'Name',
            fieldUrl: 'URL',
            save: 'Save',
            cancel: 'Cancel',
        };
    }

    let ctxMenu = null;     // the open context menu, if any

    // target = { node, parentId }: the node that was right clicked (null for a
    // click on the bar's or a menu's background) and the folder that node —
    // or that background — belongs to.
    //
    // Edit and Delete are the same for a bookmark and a folder: the difference
    // is only inside the edit dialog (a folder has no URL field). Add Folder is
    // the one entry that reads the click position, so that the new folder lands
    // where the user pointed:
    //   right click on a folder   -> a subfolder inside it (at its end)
    //   right click on a bookmark -> a folder next to it, in the same folder
    //   right click on background -> at the end of the folder that background
    //                                shows (the bar folder, or the open menu's)
    function contextItems(target) {
        const LABELS = buildLabels();
        const node = target.node;
        const intoNode = node && !node.url;      // a folder takes the new folder inside itself

        const addFolder = (intoNode || target.parentId)
            ? {
                label: LABELS.addFolder,
                // afterId is null for "at the end": a subfolder goes to the end
                // of its new parent, a sibling goes right after the clicked node
                run: () => showNewFolderDialog(intoNode ? node.id : target.parentId,
                                               intoNode ? null : (node ? node.id : null)),
            }
            : null;

        // background click — nothing to edit or delete, only the one entry
        if (!node) return addFolder ? [addFolder] : [];

        const items = [{ label: LABELS.edit, run: () => showEditDialog(node) }];
        if (addFolder) items.push(addFolder);
        items.push(null, { label: LABELS.remove, run: () => removeNode(node) });
        return items;
    }

    // ------------------------------------------------------------------
    // The native context menu.
    //
    // Vivaldi draws its own menus not in HTML but through a private API, and
    // the result is an OS-drawn window: the platform's own metrics, mnemonics,
    // keyboard handling and shadow, and no clipping by the browser window. The
    // call below is the very one Vivaldi's UI makes for its menus, and the item
    // shape is copied from there:
    //     children: [ { item: {...}, children: [...] } | { separator: {} } ]
    // The chosen item does not come back through show()'s callback but through
    // menubarMenu.onAction, as { id, state: { shift, ctrl, alt, command, left,
    // right, center }, persistent } — hence the listeners around the call.
    //
    // Everything here is a private API, so nothing is assumed: a browser update
    // may rename or drop it, and showContextMenu() then falls back to the mod's
    // own HTML menu — which is why that one is kept.
    // ------------------------------------------------------------------
    const NATIVE_KEEPALIVE = 2000;      // ms, the interval Vivaldi itself uses

    // Set once the API turns out to be broken rather than merely absent: a
    // schema change is reported asynchronously, through lastError, so the menu
    // of that first right click is lost either way — but the next one goes
    // straight to the HTML menu instead of failing again.
    let nativeMenuBroken = false;
    let nativeMenu = null;              // the menu currently on screen, if any

    function nativeMenuApi() {
        if (nativeMenuBroken) return null;
        const v = window.vivaldi;
        if (!v?.contextMenu?.show || !v?.menubarMenu?.onAction) return null;
        const windowId = Number(window.vivaldiWindowId);
        if (!Number.isFinite(windowId)) return null;
        return { v, windowId };
    }

    // Vivaldi keeps the window from going idle for as long as one of its menus
    // is up; without it the menu is dismissed from under the user.
    function startNativeKeepalive(v, windowId) {
        return setInterval(() => {
            try {
                v.utilities?.emulateUserInput?.(windowId);
            } catch (err) {
                console.warn('[SlimBookmarks] emulateUserInput failed:', err);
            }
        }, NATIVE_KEEPALIVE);
    }

    function endNativeMenu() {
        if (!nativeMenu) return;
        const { v, onOpen, onClose, onAction, keepalive } = nativeMenu;
        nativeMenu = null;
        clearInterval(keepalive);
        v.menubarMenu.onOpen.removeListener(onOpen);
        v.menubarMenu.onClose.removeListener(onClose);
        v.menubarMenu.onAction.removeListener(onAction);
    }

    // items — the same [{ label, run } | null] list the HTML menu is built
    // from; null is a separator. Returns false when the menu could not be
    // shown at all, and the caller draws the HTML one instead.
    function showNativeContextMenu(items, x, y) {
        const api = nativeMenuApi();
        if (!api) return false;
        const { v, windowId } = api;

        // one native menu at a time — the API refuses a second one, and the
        // listeners of the first would still be armed
        endNativeMenu();

        const runs = new Map();
        const children = items.map((item, i) => {
            if (!item) return { separator: {} };
            runs.set(i, item.run);
            return { item: { id: i, name: item.label, type: 'command', enabled: true } };
        });

        let acted = false;
        const onOpen = () => {
            if (!nativeMenu || nativeMenu.keepalive) return;
            nativeMenu.keepalive = startNativeKeepalive(v, windowId);
        };
        const onAction = (action) => {
            const run = runs.get(action?.id);
            if (!run) return;   // an action of somebody else's menu
            acted = true;
            // the menus the right click came from have served their purpose —
            // closed before the action so that a dialog opens over a clean bar
            closeAll();
            run();
        };
        const onClose = () => {
            endNativeMenu();
            // the click that dismissed the menu was eaten by the OS and never
            // reached our document, so the menus underneath have to be closed
            // from here rather than by the global click handler
            if (!acted) closeAll();
        };

        nativeMenu = { v, onOpen, onClose, onAction, keepalive: null };
        v.menubarMenu.onOpen.addListener(onOpen);
        v.menubarMenu.onClose.addListener(onClose);
        v.menubarMenu.onAction.addListener(onAction);

        try {
            v.contextMenu.show({
                windowId,
                documentId: -1,
                // both as in Vivaldi's own call for a menu opened by the mouse:
                // the menu unfolds from the cursor, and the browser window is
                // left to pick the toolkit it draws the menu with
                forceViews: false,
                origin: 'pointer',
                rect: { x: Math.round(x), y: Math.round(y), width: 0, height: 0 },
                icons: [],
                children,
            }, () => {
                const err = chrome.runtime.lastError;
                if (!err) return;
                // the API is there but no longer speaks our schema: give up on
                // it for the rest of this UI session
                console.warn('[SlimBookmarks] native context menu refused, falling back to the mod menu:', err.message);
                nativeMenuBroken = true;
                endNativeMenu();
            });
        } catch (err) {
            // a synchronous throw is the bindings rejecting our arguments —
            // there is no menu, so the HTML one can still take this very click
            console.warn('[SlimBookmarks] native context menu unavailable, using the mod menu:', err);
            nativeMenuBroken = true;
            endNativeMenu();
            return false;
        }
        return true;
    }

    // keepDepth — how many already open menus to keep: 0 for a bar button,
    // depth + 1 for a menu row (the row itself must stay on screen).
    function showContextMenu(target, x, y, keepDepth) {
        const items = contextItems(target);
        if (!items.length) return;
        closeFrom(keepDepth);
        clearTimeout(hoverTimer);

        // the native menu is the same list of items in the platform's own
        // window; the HTML menu below is what is left when it cannot be shown
        if (showNativeContextMenu(items, x, y)) return;

        const menu = makeMenuShell(CTX_DEPTH);
        items.forEach((item) => {
            if (!item) {
                const sep = document.createElement('div');
                sep.className = SEP_CLASS;
                menu.appendChild(sep);
                return;
            }
            const row = makeMenuRow();
            const label = document.createElement('span');
            label.className = MENU_CLASS + '-label';
            label.textContent = item.label;
            row.appendChild(label);
            row.onmouseenter = () => setRowActive(row, true);
            row.addEventListener('click', (e) => {
                e.stopPropagation();
                closeAll();
                item.run();
            });
            menu.appendChild(row);
        });

        getLayer().appendChild(menu);
        openMenus.push(menu);
        ctxMenu = menu;
        positionAt(menu, x, y);
    }

    // The menu unfolds from the cursor, and near the right or bottom edge — in
    // the opposite direction, like Vivaldi's native menus.
    function positionAt(menu, x, y) {
        const m = menu.getBoundingClientRect();
        const flipX = x + m.width > window.innerWidth - GAP;
        const flipY = y + m.height > window.innerHeight - GAP;
        // when flipping we step away from the click point by CTX_FLIP_MARGIN on
        // top of the usual GAP — see the comment on the constant
        const left = flipX ? x - m.width - CTX_FLIP_MARGIN : x;
        const top = flipY ? y - m.height - CTX_FLIP_MARGIN : y;
        place(menu, clamp(left, GAP, window.innerWidth - m.width - GAP),
                    clamp(top, GAP, window.innerHeight - m.height - GAP));
    }

    // ------------------------------------------------------------------
    // Context menu actions.
    // ------------------------------------------------------------------
    function reportError() {
        if (chrome.runtime.lastError) {
            console.warn('[SlimBookmarks] action failed:', chrome.runtime.lastError.message);
        }
    }

    // In Vivaldi the regular delete moves the node to the bookmark trash — this
    // is the same call the native bar makes.
    function removeNode(node) {
        if (node.url) chrome.bookmarks.remove(node.id, reportError);
        else chrome.bookmarks.removeTree(node.id, reportError);
    }

    // afterId — the node the new folder must follow, or null for "at the end".
    // The index is resolved here rather than taken from the tree snapshot the
    // bar was rendered from: between the right click and the Save button the
    // folder may well have been reordered from elsewhere, and an index that no
    // longer fits its parent makes chrome.bookmarks.create fail outright.
    function createFolder(parentId, afterId, title) {
        if (!afterId) {
            chrome.bookmarks.create({ parentId, title }, reportError);
            return;
        }
        chrome.bookmarks.getChildren(parentId, (children) => {
            if (chrome.runtime.lastError) { reportError(); return; }
            const at = (children || []).findIndex(c => c.id === afterId);
            const details = { parentId, title };
            // the sibling is gone — fall back to the end of the folder
            if (at >= 0) details.index = at + 1;
            chrome.bookmarks.create(details, reportError);
        });
    }

    // ------------------------------------------------------------------
    // Edit dialog.
    //
    // Vivaldi's native dialog is unreachable: it is shown through an internal
    // React store. Hence our own — in the same layer as the menus and on the
    // same theme variables. The edit goes to chrome.bookmarks.update, and the
    // bar rebuilds itself on the onChanged event.
    // ------------------------------------------------------------------
    let editDialog = null;

    function closeEditDialog() {
        if (!editDialog) return;
        editDialog.remove();
        editDialog = null;
    }

    // The shell shared by editing and by creating a folder: both are a heading,
    // a text field or two, and a Save/Cancel pair — only what Save does differs.
    // onApply receives the field values in the order they were declared.
    function showDialog(heading, fieldSpecs, onApply) {
        closeAll();
        closeEditDialog();

        const LABELS = buildLabels();

        const overlay = document.createElement('div');
        overlay.className = DIALOG_CLASS;
        const box = document.createElement('div');
        box.className = DIALOG_CLASS + '-box';

        const headingEl = document.createElement('div');
        headingEl.className = DIALOG_CLASS + '-heading';
        headingEl.textContent = heading;
        box.appendChild(headingEl);

        const fields = fieldSpecs.map((spec) => {
            const field = makeDialogField(spec.label, spec.value || '');
            box.appendChild(field.row);
            return field;
        });

        const buttons = document.createElement('div');
        buttons.className = DIALOG_CLASS + '-buttons';
        const cancel = makeDialogButton(LABELS.cancel, false);
        const save = makeDialogButton(LABELS.save, true);
        buttons.append(cancel, save);

        box.appendChild(buttons);
        overlay.appendChild(box);
        getLayer().appendChild(overlay);
        editDialog = overlay;

        const apply = () => {
            const values = fields.map(f => f.input.value);
            closeEditDialog();
            onApply(values);
        };

        save.addEventListener('click', apply);
        cancel.addEventListener('click', closeEditDialog);
        // a click on the dim backdrop outside the box = cancel, as in the native dialogs
        overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) closeEditDialog(); });
        box.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); apply(); }
            if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeEditDialog(); }
        });

        fields[0]?.input.focus();
        fields[0]?.input.select();
    }

    function showEditDialog(node) {
        const LABELS = buildLabels();
        const isFolder = !node.url;

        const specs = [{ label: LABELS.fieldName, value: node.title || '' }];
        if (!isFolder) specs.push({ label: LABELS.fieldUrl, value: node.url || '' });

        showDialog(isFolder ? LABELS.editFolderTitle : LABELS.editBookmarkTitle, specs, (values) => {
            const changes = { title: values[0] };
            // an empty URL is not saved: a node without a url would turn into a folder
            if (!isFolder && values[1].trim()) changes.url = values[1].trim();
            chrome.bookmarks.update(node.id, changes, reportError);
        });
    }

    // The name is pre-filled with Vivaldi's own "New Folder" and selected, so
    // that Enter alone is enough to get the same result as the native menu.
    function showNewFolderDialog(parentId, afterId) {
        const LABELS = buildLabels();
        showDialog(LABELS.newFolder, [{ label: LABELS.fieldName, value: LABELS.newFolder }], (values) => {
            createFolder(parentId, afterId, values[0].trim() || LABELS.newFolder);
        });
    }

    function makeDialogField(labelText, value) {
        const row = document.createElement('label');
        row.className = DIALOG_CLASS + '-field';
        const caption = document.createElement('span');
        caption.textContent = labelText;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = value;
        input.spellcheck = false;
        row.append(caption, input);
        return { row, input };
    }

    function makeDialogButton(text, primary) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = DIALOG_CLASS + '-button' + (primary ? ' is-primary' : '');
        btn.textContent = text;
        return btn;
    }

    // ------------------------------------------------------------------
    // Dragging.
    //
    // HTML5 drag & drop: the browser draws the preview itself and scrolls long
    // menus itself. Mouse events do not arrive during a drag, so both picking
    // the insertion point and opening the folder under the cursor are done in
    // dragover. The node is remembered in dragNode: dataTransfer must not be
    // read in dragover, and the drop zones depend on whether a folder or a
    // bookmark is being dragged.
    // ------------------------------------------------------------------
    let dragNode = null;
    let dropLine = null;
    let dropInto = null;        // the highlighted "into the folder" target
    let dragOpenTimer = null;
    let dragOpenEl = null;

    // A shared reset of the drag state: used both in dragend and in drop — after
    // applying (or declining) a drop the state is always the same.
    function endDrag() {
        dragNode = null;
        clearDropFeedback();
    }

    function makeDraggable(el, node) {
        el.draggable = true;
        // Between the press and the first move Blink is still deciding whether
        // this gesture becomes a drag, and it resolves the drag source by hit
        // testing. A menu that opens in that window lands on top of the element
        // under the cursor and the gesture is dropped — the press ends up doing
        // nothing at all. So the pending hover timer dies with the press: this
        // is the same class of bug as the focus ring blur that used to abort
        // drags on bar buttons.
        el.addEventListener('mousedown', () => clearTimeout(hoverTimer));
        el.addEventListener('dragstart', (e) => {
            clearTimeout(hoverTimer);
            // a bar button is dragged with the menus closed, a menu row is not:
            // closing would remove the row itself and break the drag. This runs
            // before the state below is claimed: closeAll() ends any drag.
            if (el.classList.contains(BTN_CLASS)) closeAll();
            dragNode = node;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData(DRAG_MIME, node.id);
            // text/plain is always set, folders included. DRAG_MIME alone is a
            // custom type, and a drag carrying nothing the platform recognises
            // is not reliably started by the OS drag session — which is the one
            // difference there was between folder rows (custom type only) and
            // bookmark rows (which also carried their URL), and folder rows
            // were exactly the ones that would not pick up.
            e.dataTransfer.setData('text/plain', node.url || titleOf(node));
        });
        el.addEventListener('dragend', endDrag);
    }

    // A drag that dies anywhere else — dropped on Vivaldi's own UI, cancelled
    // with Escape, ended over a target that never saw the drop — still has to
    // release the state.
    //
    // Bubble phase, deliberately: in capture this runs BEFORE the drop target's
    // own handler and would clear dragNode out from under it, so every drop
    // would silently do nothing. Our own targets stop propagation after they
    // have applied the drop (and call endDrag themselves), so what reaches here
    // is only the drops that landed on nothing.
    document.addEventListener('dragend', endDrag);
    document.addEventListener('drop', endDrag);

    // ctx: { node, parentId, axis, openFolder }
    //   node       — the node under the cursor
    //   parentId   — the folder node lives in (the parent for inserting next to it)
    //   axis       — 'x' for the bar, 'y' for menu rows
    //   openFolder — how to open the folder under the cursor, if there is one
    function makeDropTarget(el, ctx) {
        el.addEventListener('dragover', (e) => {
            if (!dragNode) return;
            const dest = resolveDrop({ el, ...ctx }, e);
            if (!canDrop(dragNode, dest)) {
                // a rejection on this particular target must not bubble up to the
                // parent (the bar, for instance) and turn into an allowed drop
                // there by the coarse "the whole bar folder" rule
                e.stopPropagation();
                e.dataTransfer.dropEffect = 'none';
                clearDropFeedback();
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';
            showDropFeedback(el, dest, ctx.axis);
            if (dest.into && ctx.openFolder) scheduleDragOpen(el, ctx.openFolder);
        });
        el.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // the drop location is recomputed from this very drop event: the
            // cursor may have last been over a neighbouring element before the
            // button was released here
            const dest = dragNode ? resolveDrop({ el, ...ctx }, e) : null;
            if (dragNode && dest && canDrop(dragNode, dest)) applyDrop(dragNode, dest);
            endDrag();
        });
    }

    function resolveDrop(ctx, e) {
        const r = ctx.el.getBoundingClientRect();
        const size = (ctx.axis === 'x' ? r.width : r.height) || 1;
        const offset = ctx.axis === 'x' ? e.clientX - r.left : e.clientY - r.top;
        const pos = offset / size;
        const isFolder = !ctx.node.url;
        // targetId — the node under the cursor: needed so canDrop can tell
        // "dropped where it was picked up" (a cancel gesture) from a real drop
        if (isFolder && pos > EDGE_RATIO && pos < 1 - EDGE_RATIO) {
            return { parentId: ctx.node.id, into: true, targetId: ctx.node.id };
        }
        const after = pos >= 0.5;
        return { parentId: ctx.parentId, index: ctx.node.index + (after ? 1 : 0), after, targetId: ctx.node.id };
    }

    function canDrop(node, dest) {
        if (!node || !dest || !dest.parentId) return false;
        // released where it was picked up — that is a cancelled drag, not a drop:
        // disallowed in any zone ("next to" and "into" alike)
        if (dest.targetId === node.id) return false;
        // a folder cannot move inside its own subtree (the "into itself" case is
        // already cut off by the targetId check above)
        if (!node.url && isDescendant(dest.parentId, node)) return false;
        return true;
    }

    function isDescendant(id, node) {
        if (id === node.id) return true;
        return (node.children || []).some(child => isDescendant(id, child));
    }

    // The index is passed as is: when reordering within one folder, Chromium
    // accounts for the node's removal itself — the native Vivaldi bar does the
    // same (bundle.js, BookmarksService.move).
    function applyDrop(node, dest) {
        const dst = { parentId: dest.parentId };
        // the index is only set when it is a number: without it Chromium appends
        // to the end of the folder, and an undefined in the object fails
        // chrome.* validation
        if (typeof dest.index === 'number') dst.index = dest.index;
        // written down before the move: the reload it sets off closes the menus,
        // and the path has to be read while they are still open
        pendingMenuPath = captureMenuPath();
        chrome.bookmarks.move(node.id, dst, reportError);
    }

    function dropLineEl() {
        if (!dropLine) {
            dropLine = document.createElement('div');
            dropLine.className = DROP_LINE_CLASS;
        }
        const layer = getLayer();
        if (dropLine.parentElement !== layer) layer.appendChild(dropLine);
        return dropLine;
    }

    function showDropFeedback(el, dest, axis) {
        clearDropInto();
        if (dest.into) {
            if (dropLine) dropLine.style.display = 'none';
            el.classList.add(DROP_INTO_CLASS);
            dropInto = el;
            return;
        }
        // the cursor left "into the folder" for a regular insert-next-to point —
        // cancel the pending auto-open of the previous folder: otherwise it would
        // fire after the remaining time (up to the drag-open delay) even though the
        // cursor is no longer over that folder
        clearDragOpenTimer();
        const r = el.getBoundingClientRect();
        const line = dropLineEl();
        line.style.display = 'block';
        if (axis === 'x') {
            line.style.left = (dest.after ? r.right : r.left) + 'px';
            line.style.top = r.top + 'px';
            line.style.width = '2px';
            line.style.height = r.height + 'px';
        } else {
            line.style.left = r.left + 'px';
            line.style.top = (dest.after ? r.bottom : r.top) + 'px';
            line.style.width = r.width + 'px';
            line.style.height = '2px';
        }
    }

    function clearDropInto() {
        if (dropInto) dropInto.classList.remove(DROP_INTO_CLASS);
        dropInto = null;
    }

    function clearDropFeedback() {
        clearDropInto();
        clearDragOpenTimer();
        if (dropLine) dropLine.style.display = 'none';
    }

    function clearDragOpenTimer() {
        clearTimeout(dragOpenTimer);
        dragOpenEl = null;
    }

    // dragover fires dozens of events — the timer is set once per target
    function scheduleDragOpen(el, openFolder) {
        if (dragOpenEl === el) return;
        dragOpenEl = el;
        clearTimeout(dragOpenTimer);
        dragOpenTimer = setTimeout(() => {
            // while we were waiting, a bar rebuild (render()) could have removed
            // el from the document — a menu anchored to an element outside the
            // tree must not be opened: it would land in the screen corner on top
            // of everything
            if (el.isConnected) openFolder();
        }, delayOf('dragOpenDelay'));
    }

    // ------------------------------------------------------------------
    // Positioning (after insertion into the DOM, so the real sizes are known)
    // ------------------------------------------------------------------
    function positionRoot(menu, anchor) {
        const a = anchor.getBoundingClientRect();
        const m = menu.getBoundingClientRect();
        const left = clamp(a.left, GAP, window.innerWidth - m.width - GAP);
        const top = clamp(a.bottom + 2, GAP, window.innerHeight - m.height - GAP);
        place(menu, left, top);
    }

    function positionSub(menu, row, parentMenu) {
        const r = row.getBoundingClientRect();
        const p = parentMenu.getBoundingClientRect();
        const m = menu.getBoundingClientRect();

        // to the right of the parent by default, to the left when there is not
        // enough room
        let left = p.right - 2;
        if (left + m.width > window.innerWidth - GAP) left = p.left - m.width + 2;
        left = clamp(left, GAP, window.innerWidth - m.width - GAP);
        const top = clamp(r.top - 6, GAP, window.innerHeight - m.height - GAP);
        place(menu, left, top);
    }

    function place(menu, left, top) {
        menu.style.left = Math.round(left) + 'px';
        menu.style.top = Math.round(top) + 'px';
        menu.style.visibility = 'visible';
    }

    function clamp(v, min, max) {
        return Math.max(min, Math.min(v, Math.max(min, max)));
    }

    // ------------------------------------------------------------------
    // Opening a bookmark.
    //   setting off + plain click -> current tab
    //   setting on  + plain click -> new tab, immediately active
    //   Ctrl/⌘ or middle button   -> new background tab, always
    // window.location.href is not an option: the script lives in Vivaldi's UI window.
    // ------------------------------------------------------------------
    function openBookmark(url, modifier) {
        if (!url) return;
        // the setting may have just been toggled, so we do not rely on the value
        // read at startup
        readOpenInNewTab(() => doOpenBookmark(url, modifier));
    }

    function doOpenBookmark(url, modifier) {
        const fallback = (reason) => {
            console.warn('[SlimBookmarks] could not open a tab:', reason);
            window.open(url, '_blank');
        };

        // chrome.tabs errors arrive asynchronously, in lastError, so a single
        // try/catch is not enough
        const done = () => {
            if (chrome.runtime.lastError) fallback(chrome.runtime.lastError.message);
        };

        try {
            if (!openInNewTabPref && !modifier) chrome.tabs.update({ url }, done);
            else chrome.tabs.create({ url, active: !modifier }, done);
        } catch (err) {
            fallback(err);
        }
    }
})();
