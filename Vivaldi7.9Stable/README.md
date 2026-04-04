### Feature

This folder is a collection of my css mods specifically for Vivaldi 7.9 Stable.
The modification is listed as follow:

- Replace auto-hide animation with a smoother overscroll animation like Arc/Zen.
- Introduce Favourite Tabs,inspired by Arc. Treat first 9 pinned tabs as Application and turn them into grids.
- Better 2 level tab stack. You can now peek the main tabbar by hovering mouse over when in a tab stack. It's always a pain in the ass
  to have to fit two level tab stack in a thin tabbar.
- Better looking quick command panel
- Tab trail indicator
- Floating find bar
- Better extensions panel and download panel mod from the community
- Toolbar button hover animation mod from the community
- and more,see it for yourself.

## Mod List

### CSS

| File                  | Description                                                 |
| --------------------- | ----------------------------------------------------------- |
| `AdaptiveBF.css`      | Hide back/forward buttons when unnecessary                  |
| `ArcPeek.css`         | Arc peek experience (pair with `DialogTab.js`)              |
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
| `DialogTab.js`           | Arc peek dialog support _(pairs with `ArcPeek.css`)_     |
| `EasyFiles.js`           | Opera-inspired file attachment via clipboard & downloads |
| `ElementCapture.js`      | Auto-select capture area for screenshots                 |
| `GlobalMediaControls.js` | Global Media Controls panel (Chrome-like)                |
| `MonochromeIcons.js`     | Monochrome web panel icons to reduce visual noise        |
| `TabScroll.js`           | Click active tab: scroll to top / previous position      |
| `TidyTabs.js`            | AI tab grouping _(pairs with `TidyTabs.css`)_            |
| `TidyTitles.js`          | AI tab title cleanup                                     |
| `YbAddressBar.js`        | Address bar enhancements(buggy)                          |


### Dev (incomplete / buggy / WIP)

| File                    | Status |
| ----------------------- | ------ |
| `Addressbar.css`        | WIP    |
| `AdressFieldExpand.css` | WIP    |
| `ArcFolder.css` / `.js` | WIP    |
| `BraveStyleTabs.css`    | WIP    |
| `FuckClutter.css`       | WIP    |
| `Panel.css`             | WIP    |
| `StatusBar.css`         | WIP    |
| `Tabbar.css`            | WIP    |

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
