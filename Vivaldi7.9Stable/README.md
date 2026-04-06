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

- [Feature Showcase](#feature-showcase)
- [Mod List](#mod-list)
  - [CSS](#css)
  - [Javascripts](#javascripts)
- [How to install](#how-to-install)
  - [CSS Mods](#to-install-css-mods)
  - [Javascripts Mods](#to-install-javascripts-mods)

## Feature Showcase

| Showcase                                             | Mods                                                              |
| :--------------------------------------------------- | :---------------------------------------------------------------- |
| ![FavouriteTabs](../Others/assets/FavouriteTabs.gif) | `FavouriteTabs.css`                                               |
| ![VivaldiMax](../Others/assets/VivaldiMax.gif)       | `TidyTabs.css` + `TidyTabs.js` + `ClearTabs.js` + `TidyTitles.js` |
| ![PeekTabbar](../Others/assets/PeekTabbar.gif)       | `PeekTabbar.css`                                                  |
| ![ArcPeek](../Others/assets/ArcPeek.gif)             | `ArcPeek.css` + `ArcPeek.js`                                      |
| ![Quietify](../Others/assets/Quietify.gif)           | `Quietify.css`                                                    |
| ![TidyDownloads](../Others/assets/TidyDownloads.gif) | `TidyDownloads.js`                                                |

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
| `TidyTabs.css`        | AI tab grouping _(requires `TidyTabs.js` + `ClearTabs.js`)_ |
| `VivalArc.css`        | Arc theme port _(incompatible with this modpack)_           |

### Javascripts

| File                     | Description                                              |
| ------------------------ | -------------------------------------------------------- |
| `AutoHidePanel.js`       | Auto-hide side panel                                     |
| `ClearTabs.js`           | Clean tab separators _(pairs with `TidyTabs.css`)_       |
| `ArcPeek.js`             | Arc peek dialog support _(pairs with `ArcPeek.css`)_     |
| `EasyFiles.js`           | Opera-inspired file attachment via clipboard & downloads |
| `ElementCapture.js`      | Auto-select capture area for screenshots                 |
| `GlobalMediaControls.js` | Global Media Controls panel (Chrome-like)                |
| `MonochromeIcons.js`     | Monochrome web panel icons to reduce visual noise        |
| `TabScroll.js`           | Click active tab: scroll to top / previous position      |
| `TidyTabs.js`            | AI tab grouping _(pairs with `TidyTabs.css`)_            |
| `TidyTitles.js`          | AI tab title cleanup                                     |
| `YbAddressBar.js`        | Address bar enhancements(buggy)                          |

## How to install

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
    <script src="tidyTitles.js"></script>
    <script src="tidyTabs.js"></script>
    <script src="clearTabs.js"></script>
    <script src="tabScroll.js"></script>
    <script src="monochromeIcons.js"></script>
    <script src="ybAddressBar.js"></script>
    <script src="elementCapture.js"></script>
    <script src="globalMediaControls.js"></script>
    <script src="easyFiles.js"></script>
    <script src="dialogTab.js"></script>
    <script src="autoHidePanel.js"></script>
  </body>
</html>
```

3. That's it! Restart browser to see the effect. If any other issues please report it at [Issues · PaRr0tBoY/Awesome-Vivaldi](https://github.com/PaRr0tBoY/Awesome-Vivaldi/issues?q=sort%3Aupdated-desc+is%3Aissue+is%3Aopen) and I'll ~~probably~~ fix it at weekend.

> Optionally, get an glm api key here for AI features [here](https://open.bigmodel.cn/usercenter/proj-mgmt/apikeys). FYI, It's experimental and not stable though. You can use other AI providers' api as well as long as it's compatible with OpenAI api.
