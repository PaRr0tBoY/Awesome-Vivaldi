# Community JS Mods and CSS used in this repository
[📸 Element Capture](https://forum.vivaldi.net/topic/103686/element-capture?_=1758777284963)
> This mod adds the function of automatically selecting the area to capture when taking screenshots.

[Colorful tabs](https://forum.vivaldi.net/topic/96586/colorful-tabs?_=1758775816485)
> Part of the code that calculates the color from an icon

[Monochrome icons](https://forum.vivaldi.net/topic/102661/monochrome-icons?_=1758775889576)
> This modification changes the hue of all web panel icons and makes them monochrome. The panel becomes overtly busy and the colors are all over the place with web panels, therefore it makes sense toning them down somewhat and letting them blend in more.

[Import Export Command Chains](https://forum.vivaldi.net/topic/93964/import-export-command-chains?page=1)
> This mods helps import and export command chains for Vivaldi.
> This mod comes with the ability to directly install code exported through the code block (```) of the Vivaldi forum.

[📂 Easy Files](https://forum.vivaldi.net/topic/94531/easy-files?page=1)
> This mod is inspired by opera. It makes attaching files easier by displaying files in the clipboard and downloaded files.

[Click to add Blocking list](https://forum.vivaldi.net/topic/45735/click-to-add-blocking-list)
> This mod add support for adding the block list by clicking on the link in sites like other adblock.

[Global Media Controls Panel](https://forum.vivaldi.net/topic/66803/global-media-controls-panel)
> This mod will add a Global Media Controls in vivaldi's panel similar to Global Media Controls in chrome

[Markdown Editor for Notes](https://forum.vivaldi.net/topic/35644/markdown-editor-for-notes)
> Simple Markdown Editor for Notes Editor

[Open panels on mouse-over.](https://forum.vivaldi.net/topic/28413/open-panels-on-mouse-over/22?_=1593504963587)
> Auto-close when you mouse over to body
> Don't open if mouse exits screen before timeout period
> Unique delays based on situation

[Dashboard Camo: Theme Integration for Dashboard Webpages](https://forum.vivaldi.net/topic/102173/dashboard-camo-theme-integration-for-dashboard-webpages/3)
> It takes all the custom CSS properties which Vivaldi sets according to your theme and passes them to all webpage widgets, where you can use them for styling your custom widgets.

[Colorful Top Loading Bar](https://forum.vivaldi.net/topic/111621/colorful-top-loading-bar?_=1758776810153)
> A JS and CSS that make Vivaldi's Title bar visually appealing when a webpage is loading.

[Feed icons](https://forum.vivaldi.net/topic/73001/feed-icons?_=1758776884927)
> This is a small mod that converts feed icons into website icons.

[Address Bar like in Yandex Browser](https://forum.vivaldi.net/topic/96072/address-bar-like-in-yandex-browser?_=1758776929535)
> Make address bar displays the title of the current page and the domain, clicking on which leads to the homepage of the website.

[Open in Dialog mod](https://forum.vivaldi.net/topic/92501/open-in-dialog-mod/95?_=1758776959371)
> A mod to open links or a search in a dialog popup.

[Auto expand and collapse tabbar for two-level tab stack: Rework](https://forum.vivaldi.net/topic/111893/auto-expand-and-collapse-tabbar-for-two-level-tab-stack-rework?_=1758777265037)
> Auto expand and collapse tabbar

[tovifun/VivalArc: With just a few tweaks, you can give Vivaldi that cool Arc vibe](https://github.com/tovifun/VivalArc)
> Part of codes in this repo is used.

# Preview
![link preview like Arc Peek](/Preview/Vivaldi-Arc-Peek.gif)
![Auto Hide Tab](/Preview/autoHideTwoLevelTab.gif)
![Auto Hide Bookmark Bar](/Preview/autoHideBookmarkBar.gif)
![Auto Hide Panel](/Preview/autoHidePanel.gif)

# INSTALLATION
To install CSS:

1. Open Vivaldi://experiments in Vivaldi and check Allow CSS Modification
2. Restart Vivaldi
3. Goto Settings->Appearance and you'll see CUSTOM UI MODIFICATIONS. Select file location as "/path/to/Vivaldi-Mods/CSS"
4. Restart Vivaldi, you're all set!

To install Javascript moddings:

1. Duplicate js in moddings to <YOURVIVALDIDIRECTORY>\Application\<VERSI0N>\resources\vivaldi
2. Under the same folder, there's a window.html  and you should fill in your js file name one by one in <body> like this

```html
<body>
<script src="color_tabs.js"></script>\
<script src="monochrome-icons.js"></script>\
<script src="import-export-command-chains.js"></script>\
<script src="chroma.min.js"></script>\
<script src="easy-files.js"></script>\
<script src="element-capture.js"></script>\
<script src="global-media-controls.js"></script>\
<script src="AdaptiveWebPanelHeaders.js"></script>\
<script src="vivaldi-dashboard-camo.js"></script>\
<script src="autoHidePanel.js"></script>\
<script src="ClickAddBlockList.js"></script>\
<script src="colorful_loading_top_bar.js"></script>\
<script src="feedIcon.js"></script>\
<script src="mdNotes.js"></script>\
<script src="yb_address_bar.js"></script>\
<script src="dialogTab.js"></script>\
</body>
```

3. Or else you can patch vivaldi with batch scripts. To learn more check [Patching Vivaldi with batch scripts](https://forum.vivaldi.net/topic/10592/patching-vivaldi-with-batch-scripts/21?page=2)
4. If you're on macOS see [macOS_Patch_Scripts | upviv](https://github.com/PaRr0tBoY/Vivaldi-Mods/blob/8a1e9f8a63f195f67f27ab2e5b86c4aff0081096/macOS_Patch_Scripts/upviv) as a reference
