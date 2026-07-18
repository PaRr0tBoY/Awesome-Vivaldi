# Awesome Vivaldi — Documentation

> Community modpack documentation hub.  
> **Live:** [parr0tboy.github.io/docs/](https://parr0tboy.github.io/docs/) &nbsp;|&nbsp; **Local:** [index.html](index.html) (`python -m http.server`)

## Directory Structure

```
Doc/
├── README.md              ← You are here
├── index.html             ← Visual documentation portal
├── EveryAPI.txt           ← Complete Vivaldi API quick reference (329 KB)
│
├── design/                ← Design Philosophy
│   ├── DESIGN.md          │   Color strategy, typography, spacing, radius, shadows, motion, components, anti-patterns
│   └── PRODUCT.md         │   User personas, brand personality, product positioning, anti-references
│
├── dev/                   ← Development
│   └── installer-design.md│   Installer v3 full design spec (TUI, i18n, path discovery, deploy sequencing)
│
├── mod/                   ← Mod Documentation (English)
│   ├── ArcPeek.md         │   Arc Peek internal architecture
│   ├── AskOnPage.md       │   AI sidebar
│   ├── AutoHidePanel.md   │   Auto-collapse side panel
│   ├── EasyFiles.md       │   Quick file attach
│   ├── InteractionFeedback.md│  Click micro-feedback animations
│   ├── ModConfig.md       │   Shared settings system
│   ├── MonochromeIcons.md │   Web panel monochrome icons
│   ├── PinnedTabRestore.md│   Pinned tab restore
│   ├── QuickCapture.md    │   Smart screenshot area selection
│   ├── TabManager.md      │   Tab management panel
│   ├── tabtree.md         │   Tab tree data structure
│   ├── TidyAddress.md     │   AI URL rewriting
│   ├── TidyDownloads.md   │   AI download filename cleanup
│   ├── TidyTabs.md        │   AI tab grouping
│   ├── TidyTitles.md      │   AI title condensing
│   ├── VividPeek.md       │   Arc-style popup preview
│   ├── VividPlayer.md     │   Floating video player
│   ├── VividToast.md      │   Toast notifications
│   ├── WorkspaceThemeSwitcher.md│  Per-workspace theme switching
│   └── modzh/             ← Chinese translations (one-to-one with above)
│
├── BundleReverse/         ← Vivaldi Internal Reverse Engineering
│   ├── api.md             │   Internal API reference
│   ├── pref.md            │   Preferences system
│   ├── tabdrag.md         │   Tab drag implementation
│   ├── tile.md            │   Tile/tiling layout
│   ├── autohide.md        │   UI autohide mechanics
│   ├── Sync.md            │   Sync system internals
│   ├── captureTab-reference.md│  Screenshot API reference
│   └── ConsoleScripts/    │   Browser console debugging scripts
│
├── LonmDoc/               ← Lonm's Vivaldi Modders API Docs
│   └── vivaldi.*.txt ×41  │   vivaldi.tabsPrivate, .prefs, .bookmarks, .notes, …
│
└── READMEZH/              ← README Chinese Translations
    ├── READMEMAIN.md
    ├── README76.md
    ├── README79.md
    └── README80.md
```

## Navigation by Use Case

### I want to understand the design system

→ [`design/DESIGN.md`](design/DESIGN.md) — Color variables, typographic scale, spacing grid, radius, elevation, motion curves, component specs, anti-pattern checklist
→ [`design/PRODUCT.md`](design/PRODUCT.md) — Target users, brand personality, product positioning

### I want to build a new mod

→ [`design/DESIGN.md`](design/DESIGN.md) — Start with the design spec
→ [`mod/VividPeek.md`](mod/VividPeek.md) — Most complex mod; study the architecture patterns
→ [`mod/ModConfig.md`](mod/ModConfig.md) — Shared config system used by all AI mods
→ [`BundleReverse/api.md`](BundleReverse/api.md) — Vivaldi internal APIs
→ [`EveryAPI.txt`](EveryAPI.txt) — Quick API reference

### I want to understand the installer

→ [`dev/installer-design.md`](dev/installer-design.md) — Full design spec: TUI interaction, i18n, path discovery, deploy sequencing

### I want to debug Vivaldi internals

→ [`BundleReverse/`](BundleReverse/) — Reverse-engineered docs (tab drag, tiling, sync, preferences)
→ [`BundleReverse/ConsoleScripts/`](BundleReverse/ConsoleScripts/) — Browser console debugging scripts
→ [`LonmDoc/`](LonmDoc/) — Complete `vivaldi.*` API documentation

### I want to read the Chinese docs

→ [`mod/modzh/`](mod/modzh/) — Chinese translations of all mod documentation
→ [`READMEZH/`](READMEZH/) — Chinese translations of README files
