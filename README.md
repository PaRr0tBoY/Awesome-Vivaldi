<p align="center">
  <img src="./Others/assets/hero.svg" width="100%" alt="Volante — Mods that turn Vivaldi Browser into Arc">
</p>

<div align="center">

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/PaRr0tBoY/Awesome-Vivaldi)
[![Vivaldi Forum](https://img.shields.io/badge/Vivaldi-Forum-red)](https://forum.vivaldi.net/topic/112064/modpack-community-essentials-mods-collection?_=1761221602450)
[![LINUX DO](https://img.shields.io/badge/LINUX-DO-1c1c1e?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHZlcnNpb249IjEuMiIgYmFzZVByb2ZpbGU9InRpbnktcHMiIHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiB2aWV3Qm94PSIwIDAgMTIwIDEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU%2BTElOVVggRE8gTG9nbzwvdGl0bGU%2BPGNsaXBQYXRoIGlkPSJhIj48Y2lyY2xlIGN4PSI2MCIgY3k9IjYwIiByPSI0NyIvPjwvY2xpcFBhdGg%2BPGNpcmNsZSBmaWxsPSIjZjBmMGYwIiBjeD0iNjAiIGN5PSI2MCIgcj0iNTAiLz48cmVjdCBmaWxsPSIjMWMxYzFlIiBjbGlwLXBhdGg9InVybCgjYSkiIHg9IjEwIiB5PSIxMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIzMCIvPjxyZWN0IGZpbGw9IiNmMGYwZjAiIGNsaXAtcGF0aD0idXJsKCNhKSIgeD0iMTAiIHk9IjQwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIi8%2BPHJlY3QgZmlsbD0iI2ZmYjAwMyIgY2xpcC1wYXRoPSJ1cmwoI2EpIiB4PSIxMCIgeT0iODAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMzAiLz48L3N2Zz4%3D "Proudly from LINUX DO")](https://linux.do)
[![Awesome](https://awesome.re/badge.svg)](https://awesome.re)
![GitHub Repo stars](https://img.shields.io/github/stars/PaRr0tBoY/Awesome-Vivaldi)

**English** | [简体中文](./Doc/READMEZH/READMEMAIN.md)

</div>

---

## Quick Start

Works with [Vivaldi 8.0+](./Vivaldi8.0Stable). Check your version at `vivaldi:about`.

**Windows** (PowerShell):

```powershell
irm https://raw.githubusercontent.com/PaRr0tBoY/Awesome-Vivaldi/main/install.ps1 | iex
```

**macOS** (bash):

```bash
curl -fsSL https://raw.githubusercontent.com/PaRr0tBoY/Awesome-Vivaldi/main/install.sh | bash
```

**Linux** (bash):

```bash
curl -fsSL https://raw.githubusercontent.com/PaRr0tBoY/Awesome-Vivaldi/main/install.sh | sudo bash
```

To uninstall, run the same script again.

> Prefer manual setup? See the **[Installation Guide](./Vivaldi8.0Stable/README.md)**.
> Have a coding agent? Ask it: `Install https://github.com/PaRr0tBoY/Awesome-Vivaldi for me.`

<p align="center">
  <img width="800" alt="Installer preview" src="https://github.com/user-attachments/assets/2084ca97-4712-4c12-b3f8-ad79ba124cfb" />
</p>

---

<p align="center">
  <img src="./Others/assets/section-showcase.svg" width="100%" alt="Feature Showcase">
</p>

| Feature                                         | Mod Files                            | What it does                                                                                 |
|:----------------------------------------------- |:------------------------------------ |:-------------------------------------------------------------------------------------------- |
| ![VividPeek](./Others/assets/ArcPeek.gif)       | `VividPeek.css` + `VividPeek.js`     | Arc-style peek dialog — preview tabs in a floating overlay without leaving your current page |
| ![VividPlayer](./Others/assets/VividPlayer.gif) | `VividPlayer.css` + `VividPlayer.js` | Media player popover with progress bar, artwork, and playback controls                       |
| ![PeekTabbar](./Others/assets/PeekTabbar.gif)   | `PeekTabbar.css`                     | Auto-hide tabbar that expands on hover, with two-level stacking                              |
| ![SlimBookmarks](./Others/assets/SlimBookmarks.gif) | `SlimBookmarks.js`                   | Bookmark bar folded into the address bar toolbar — folder menus, drag & drop, no extra row   |

---

<p align="center">
  <img src="./Others/assets/section-max.svg" width="100%" alt="Vivaldi MAX AI Features">
</p>

Requires an [OpenAI-compatible API key](https://github.com/cheahjs/free-llm-api-resources?tab=readme-ov-file#opencode-zen). Configure in `vivaldi:settings/appearance/` → Volante settings.

| Feature                                             | Mod Files                        | What it does                                                       |
|:--------------------------------------------------- |:-------------------------------- |:------------------------------------------------------------------ |
| ![TidyTabs](./Others/assets/VivaldiMax.gif)         | `TidyTabs.js` + `TidyTitles.js`  | AI-powered tab grouping and title cleanup                          |
| ![TidyDownloads](./Others/assets/TidyDownloads.gif) | `TidyDownloads.js`               | Rename messy download filenames into readable names                |
| ![TidyAddress](./Others/assets/tidyaddress.gif)     | `TidyAddress.js`                 | Rewrite URL suffixes into human-readable slugs                     |
| ![AskOnPage](./Others/assets/AskInPage.png)         | `AskOnPage.js` + `AskOnPage.css` | Ctrl+F AI page search — find or ask anything with inline citations |

---

## Mod List

### CSS Mods

| File                      | Description                                             |
|:------------------------- |:------------------------------------------------------- |
| `VividToast.css`          | Toast notification theming                              |
| `VividPeek.css`           | Arc peek overlay styling*(requires `VividPeek.js`)*     |
| `PeekTabbar.css`          | Auto-hide tabbar with two-level stacking on hover       |
| `VividPlayer.css`         | Media player popover styling                            |
| `VividQC.css`             | Arc-like quick command styling                          |
| `TidyTabs.css`            | AI tab grouping visual output*(requires `TidyTabs.js`)* |
| `AskOnPage.css`           | Floating AI find bar styling                            |
| `Quietify.css`            | Sleeker audio indicator                                 |
| `TabsTrail.css`           | Green trail on active/hovered tabs                      |
| `AdaptiveBF.css`          | Hide back/forward buttons when unnecessary              |
| `BetterAnimation.css`     | Smoother overscroll animation                           |
| `RemoveClutter.css`       | Hide scrollbars and visual clutter                      |
| `PinnedTabRestore.css`    | Restore pinned tab state on restart                     |
| `InteractionFeedback.css` | Hover and click micro-interactions                      |
| `DownloadPanel.css`       | Download panel theming                                  |
| `Extensions.css`          | Extensions dropdown as list                             |
| `FavouriteTabs.css`       | Arc-like favourite tabs grid*(first 9 pinned tabs)*     |
| `BtnHoverAnime.css`       | Button hover animation*(disabled by default)*           |

### JavaScript Mods

| File                 | Description                                                                |
|:-------------------- |:-------------------------------------------------------------------------- |
| `VividPeek.js`       | [Arc peek dialog](./Doc/mod/VividPeek.md) — preview tabs without switching |
| `AskOnPage.js`       | Ctrl+F AI page search with inline citations                                |
| `Diabar.js`          | [AI sidebar chat](./Doc/mod/Diabar.md) — page Q&A, summaries, rewrites     |
| `TidyTabs.js`        | [AI tab grouping](./Doc/mod/TidyTabs.md)                                   |
| `TidyTitles.js`      | [AI tab title cleanup](./Doc/mod/TidyTitles.md)                            |
| `TidyDownloads.js`   | [AI download filename cleanup](./Doc/mod/TidyDownloads.md)                 |
| `TidyAddress.js`     | [URL suffix → readable slug](./Doc/mod/TidyAddress.md)                     |
| `ModConfig.js`       | [Shared settings panel](./Doc/mod/ModConfig.md) for AI keys and mod config |
| `VividToast.js`      | [Toast notification logic](./Doc/mod/VividToast.md)                        |
| `QuickCapture.js`    | [Auto-select capture area](./Doc/mod/QuickCapture.md)                      |
| `SlimBookmarks.js`   | [Bookmark bar in the address bar](./Doc/mod/SlimBookmarks.md)              |
| `MonochromeIcons.js` | [Monochrome web panel icons](./Doc/mod/MonochromeIcons.md)                 |
| `EasyFiles.js`       | [Opera-inspired file attachment](./Doc/mod/EasyFiles.md)                   |
| `TabManager.js`      | [Workspace board panel](./Doc/mod/TabManager.md)                           |
| `AutoHidePanel.js`   | [Auto-hide side panel](./Doc/mod/AutoHidePanel.md)                         |

---

## Documentation

Browse the full docs at **[parr0tboy.github.io/docs](https://parr0tboy.github.io/docs/)** — design philosophy, mod architecture deep-dives, API references, and reverse-engineered Vivaldi internals.

---

<details>
<summary><h2>Community Mods</h2></summary>

These mods come from the [Vivaldi Forum](https://forum.vivaldi.net/) and are included in the pack:

| Mod                          | Source                                                                                                                                       |
|:---------------------------- |:-------------------------------------------------------------------------------------------------------------------------------------------- |
| Element Capture              | [Forum](https://forum.vivaldi.net/topic/103686/element-capture) — auto-select capture area for screenshots                                   |
| Colorful Tabs                | [Forum](https://forum.vivaldi.net/topic/96586/colorful-tabs) — icon-derived tab coloring                                                     |
| Monochrome Icons             | [Forum](https://forum.vivaldi.net/topic/102661/monochrome-icons) — tone down web panel icons                                                 |
| Easy Files                   | [Forum](https://forum.vivaldi.net/topic/94531/easy-files) — clipboard + downloads file picker                                                |
| Command Chains Import/Export | [Forum](https://forum.vivaldi.net/topic/93964/import-export-command-chains) — import/export command chains                                   |
| Click to Add Blocking List   | [Forum](https://forum.vivaldi.net/topic/45735/click-to-add-blocking-list) — one-click adblock list install                                   |
| Global Media Controls        | [Forum](https://forum.vivaldi.net/topic/66803/global-media-controls-panel) — Chrome-style media panel                                        |
| Markdown Editor for Notes    | [Forum](https://forum.vivaldi.net/topic/35644/markdown-editor-for-notes) — markdown editing in notes                                         |
| Open Panels on Mouse-Over    | [Forum](https://forum.vivaldi.net/topic/28413/open-panels-on-mouse-over) — auto-open/close panels on hover                                   |
| Dashboard Camo               | [Forum](https://forum.vivaldi.net/topic/102173/dashboard-camo-theme-integration-for-dashboard-webpages) — theme-aware widget styling         |
| Colorful Top Loading Bar     | [Forum](https://forum.vivaldi.net/topic/111621/colorful-top-loading-bar) — animated title bar on page load                                   |
| Feed Icons                   | [Forum](https://forum.vivaldi.net/topic/73001/feed-icons) — convert feed icons to favicons                                                   |
| Address Bar (Yandex-style)   | [Forum](https://forum.vivaldi.net/topic/96072/address-bar-like-in-yandex-browser) — title + domain display                                   |
| Open in Dialog               | [Forum](https://forum.vivaldi.net/topic/92501/open-in-dialog-mod) — open links in popup dialogs                                              |
| Tab Stack Auto-Expand        | [Forum](https://forum.vivaldi.net/topic/111893/auto-expand-and-collapse-tabbar-for-two-level-tab-stack-rework) — auto expand/collapse tabbar |
| Theme Previews Plus          | [Forum](https://forum.vivaldi.net/topic/103422/theme-previews-plus) — accurate theme preview in settings                                     |
| VivalArc                     | [GitHub](https://github.com/tovifun/VivalArc) — Arc theme port                                                                               |

</details>

---

## Tip

<details>
<summary>Create a one-click restart button (useful for mod development)</summary>

1. Go to `vivaldi://vivaldi-urls/` → enable **internal debugging pages**
2. Create a Quick Command at `vivaldi:settings/qc/`: **Open Link in Current Tab** → `chrome://restart`
3. Add it to the toolbar via **customize toolbar**
4. Optionally change the icon at `vivaldi:settings/themes/`

</details>

---

Special thanks to the [LINUX DO](https://linux.do) community for the support.
![Repo activity](https://repobeats.axiom.co/api/embed/4a30f8a4b398404c3c773f672d36c2b52f7865c3.svg "Repobeats analytics")
