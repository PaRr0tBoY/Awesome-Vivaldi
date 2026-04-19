<div align="center">
    <img width="200" height="200" src="../Others/Image/IMG5682.png">
</div>

<div align="center">
    <h1>Awesome Vivaldi</h1>
<div align="center">

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/PaRr0tBoY/Awesome-Vivaldi)
[![Vivaldi Forum](https://img.shields.io/badge/Vivaldi-Forum-red)](https://forum.vivaldi.net/topic/112064/modpack-community-essentials-mods-collection?_=1761221602450)
![GitHub Repo stars](https://img.shields.io/github/stars/PaRr0tBoY/Awesome-Vivaldi)

</div>
    <p>A Curated Community Mod Pack for Vivaldi Browser</p>

<div align="center">

**English** | [简体中文](../Others/READMEZH/README79.md)

</div>

<!-- <img src="" width="32%" alt="home" />
<img src="" width="32%" alt="home" />
<img src="" width="32%" alt="home" />
<br/>
<img src="" width="96%" alt="home" />
<br/> -->

</div>

<br/>

## Table of Contents

- [Latest Updates](#latest-updates)
- [Feature Showcase](#feature-showcase)
- [Mod List](#mod-list)
  - [CSS](#css)
  - [Javascripts](#javascripts)
- [How to install](#how-to-install)
  - [Vivaldi Settings](#vivaldi-settings) 
  - [CSS Mods](#to-install-css-mods)
  - [Javascripts Mods](#to-install-javascripts-mods)
- [Frequently Asked Questions](#faq)

## Latest Updates

| Demo                                                | Mods                                                              |
| --------------------------------------------------- | ----------------------------------------------------------------- |
| ![VividPlayer](../Others/assets/VividPlayer.gif)             | `VidPlayer.css` + `VividPlayer.js`                                      |
| ![ArcPeek](../Others/assets/ArcPeek.gif)             | `ArcPeek.css` + `ArcPeek.js`                                      |
| ![AskInPage](../Others/assets/AskInPage.png) | `AskInPage.js`                                                |


## Feature Showcase

| Showcase                                             | Mods                                                              |
| :--------------------------------------------------- | :---------------------------------------------------------------- |
| ![FavouriteTabs](../Others/assets/FavouriteTabs.gif) | `FavouriteTabs.css`                                               |
| ![VivaldiMax](../Others/assets/VivaldiMax.gif)       | `TidyTabs.css` + `TidyTabs.js` + `TidyTitles.js`                 |
| ![TidyDownloads](../Others/assets/TidyDownloads.gif) | `TidyDownloads.js`                                                |
| ![PeekTabbar](../Others/assets/PeekTabbar.gif)       | `PeekTabbar.css`                                                  |
| ![Quietify](../Others/assets/Quietify.gif)           | `Quietify.css`                                                    |

## Mod List

### CSS

| File                  | Description                                                 |
| --------------------- | ----------------------------------------------------------- |
| `AdaptiveBF.css`      | Hide back/forward buttons when unnecessary                  |
| `ArcPeek.css`         | Arc peek experience (pair with `ArcPeek.js`)                |
| `BetterAnimation.css` | Smoother overscroll animation                               |
| `BtnHoverAnime.css`   | Button hover animation _(disabled by default)_              |
| `DownloadPanel.css`   | Download panel theming                                      |
| `Extensions.css`      | Extensions dropdown as list, overflow handling              |
| `FavouriteTabs.css`   | Arc-like favorite tabs grid (first 9 pinned tabs)           |
| `FindInPage.css`      | Floating find bar                                           |
| `FluidQC.css`         | Arc-like quick command styling                              |
| `LineBreak.css`       | Utility / omit it                                           |
| `PeekTabbar.css`      | Peek tabbar on hover with 2-level stacking                  |
| `Quietify.css`        | Sleeker audio indicator                                     |
| `RemoveClutter.css`   | Hide scrollbars & visual clutter                            |
| `TabsTrail.css`       | Green trail on active/hovered tabs                          |
| `TidyTabs.css`        | AI tab grouping _(requires `TidyTabs.js`)_                    |
| `VivalArc.css`        | Arc theme port _(incompatible with this modpack)_           |

### Javascripts

| File                     | Description                                                     |
| ------------------------ | --------------------------------------------------------------- |
| `ArcPeek.js`             | Arc peek dialog support _(pairs with `ArcPeek.css`)_            |
| `AskInPage.js`           | AI side panel for page questions, summaries, and rewrites       |
| `AutoHidePanel.js`       | Auto-hide side panel                                            |
| `EasyFiles.js`           | Opera-inspired file attachment via clipboard & downloads        |
| `GlobalMediaControls.js` | Global Media Controls panel (Chrome-like)                       |
| `MonochromeIcons.js`     | Monochrome web panel icons to reduce visual noise               |
| `QuickCapture.js`        | Auto-select capture area with clipboard/file/default modes      |
| `SelectCloseTabs.js`     | Mark tabs in the tab cycler, then close them in one batch       |
| `TabScroll.js`           | Click active tab: scroll to top / previous position             |
| `TidyDownloads.js`       | AI download filename cleanup                                    |
| `TidyTabs.js`            | AI tab grouping _(pairs with `TidyTabs.css`)_                   |
| `TidyTitles.js`          | AI tab title cleanup                                            |
| `WorkspaceTabManager.js` | Workspace Board panel for viewing and managing workspace tabs   |
| `YbAddressBar.js`        | Address bar enhancements (buggy)                                |

## How to install

### Vivaldi Settings
- Go to `vivaldi:settings/appearance/` -> `UI AUTO-HIDE`, Toggle `Enable UI Auto-hide` on.
- Go to `vivaldi:settings/tabs/` -> `Tab Stacking`, Switch `Tab Stacking` to Two-Level . (Don't `Use Compact Display Style`)
- Go to `vivaldi:settings/tabs/` -> `New Tab Position`, Toggle to `As Tab Stack with Related Tab`.
- Go to `vivaldi:settings/qc/` -> `Quick Command Options`, Toggle `Open Links in New Tab` on.

### To Install CSS Mods

1. Open the url `vivaldi://flags/#vivaldi-css-mods`
2. Enable the flag, restart the browser as prompted
3. Open Appearance section in Settings
4. Under "Custom UI Modifications" choose the folder you want to use
5. In this modpack, we use `Import.css` as css mods manager.
6. Select the folder where `Import.css` is under as css folder to install.
7. Restart Vivaldi to see them in effect

IMPORTANT:
The CSS files can't have spaces in the filename or they won't work. Spaces in directory/path names should work but try to avoid it just in case.

In addition, make sure the file(s) actually have the extension .css - if you're on Windows make sure file name extensions are set to show

Important Note for 7.7+ users!
All experiments are now located under vivaldi://flags/
To enable CSS mods use the search field with "vivaldi-" or go to
chrome://flags/#vivaldi-css-mods and set to Enabled.

### To Install Javascripts Mods

#### Install Automatically

1. If you're on windows, use [Vivaldi Mod Manager](https://github.com/eximido/vivaldimodmanager)
2. If you're on linux, see [Vivaldi-Autoinject-Custom-js-ui](https://aur.archlinux.org/vivaldi-autoinject-custom-js-ui.git) for more info
3. See also [Patching Vivaldi with batch scripts](https://forum.vivaldi.net/topic/10592/patching-vivaldi-with-batch-scripts/21?page=2) for all platform
4. If you're on macOS use [macOS_Patch_Scripts | upviv](https://github.com/PaRr0tBoY/Vivaldi-Mods/blob/8a1e9f8a63f195f67f27ab2e5b86c4aff0081096/MacOSPatchScripts/upviv) as a reference for patchscript

#### Install Manually

There is only one single file in Vivaldi that you should ever need to modify. This file is called window.html and located at:

<YOURVIVALDIDIRECTORY>\Application\<VERSION>\resources\vivaldi

⚠ You should back it up before you fiddle with it.
==Especially window.html. If it's falsely configured your browser might break.==

To install, Just copy all the content under ./Javascripts/ to your `<YOURVIVALDIDIRECTORY>`\Application\<VERSI0N>\resources\vivaldi\

##### What It Does?

1. All the javascripts mods is copied to `<YOURVIVALDIDIRECTORY>`\Application\<VERSI0N>\resources\vivaldi.
2. Under the same folder, a window.html has been modified,which injected javascripts mods to your browser.
3. Restart to see the effect
4. You can confirm your installation at vivaldi:inspect/#apps.
 a. Click on the blue inspect button of window.HTML and open a console windlw
 b. Check the elements tab. If you see the js mods list. It's installed.
`Modified window.html` looks like this.

```html
<!-- Vivaldi window document -->
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Vivaldi</title>
    <link rel="stylesheet" href="style/common.css" />
    <link rel="stylesheet" href="chrome://vivaldi-data/css-mods/css" />
  </head>

  <body>
    <script src="TidyTitles.js"></script>
    <script src="TidyTabs.js"></script>
    <script src="TidyDownloads.js"></script>
    <script src="AskInPage.js"></script>
    <script src="TabScroll.js"></script>
    <script src="MonochromeIcons.js"></script>
    <script src="YbAddressBar.js"></script>
    <script src="QuickCapture.js"></script>
    <script src="GlobalMediaControls.js"></script>
    <script src="EasyFiles.js"></script>
    <script src="ArcPeek.js"></script>
  </body>
</html>
```

3. That's it! Restart browser to see the effect. If any other issues please report it at [Issues · PaRr0tBoY/Awesome-Vivaldi](https://github.com/PaRr0tBoY/Awesome-Vivaldi/issues?q=sort%3Aupdated-desc+is%3Aissue+is%3Aopen) and I'll ~~probably~~ fix it at weekend.

> Optionally, get an free OpenAI-Compatible Api Key here for AI features [cheahjs/free-llm-api-resources](https://github.com/cheahjs/free-llm-api-resources?tab=readme-ov-file#opencode-zen).

## FAQ

### ❓ What is OpenAI-compatible API?

[See the explanation here](https://bentoml.com/llm/llm-inference-basics/openai-compatible-api#:~:text=What%20is%20an,across%20various%20industries.)

### ❓ I installed everything, but nothing changed

**Check these first:**
- [ ] Enable **CSS Customization** at `vivaldi://flags`
- [ ] Set correct folder path  
  → `Settings > Appearance > Custom UI Modifications`  
  → `Awesome-Vivaldi-main\Vivaldi7.9Stable`
- [ ] Copied all the **contents** under [./Javascripts](./Javascripts/) to your `<YOURVIVALDIDIRECTORY>\Application\<VERSI0N>\resources\vivaldi\`

---

### ❓ Why are some features missing?

#### 🤖 AI features not working
These mods **do NOT work out of the box**.

You must configure your own **OpenAI-compatible API**  
→ Edit the first few lines in the script files.

---

#### ⭐ FavouriteTabs not showing
- Only **first 9 pinned tabs / tab stacks** are turned into grids.
- Which means you need to pin at least one tabs to see it take effect.
- This mod often causes side effect, for instance, break location of tabs' popup thumbnails.

---

### ❓ I installed it correctly, but still don’t see changes

That’s normal.

- Many mods run **in the background**
- Effects may be subtle or only appear in specific situations

👉 Check the [Mod List](#mod-list) to understand what each one does

---

### ❓ Some features seem disabled

Some mods are intentionally turned off (buggy / unfinished)

**Enable them manually:**
- CSS mods → [Import.css](./Import.css)
- JS mods → [window.html](./Javascripts/window.html)

---

### ❓ Still not working?

- Restart Vivaldi
- Double-check file paths (most common issue)
- Make sure files were actually replaced (not copied alongside)
