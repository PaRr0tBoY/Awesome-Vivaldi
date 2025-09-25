# Preview
![Auto Hide Tab](/Preview/autoHideTwoLevelTab.gif)
![Auto Hide Bookmark Bar](/Preview/autoHideBookmarkBar.gif)
![Auto Hide Panel](/Preview/autoHidePanel.gif)
![link preview like Arc Peek](/Preview/Vivaldi-Arc-Peek.gif)

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
<script src="color_tabs.js"></script>
<script src="monochrome-icons.js"></script>
<script src="import-export-command-chains.js"></script>
<script src="chroma.min.js"></script>
<script src="easy-files.js"></script>
<script src="element-capture.js"></script>
<script src="global-media-controls.js"></script>
<script src="widgets.js"></script>
<script src="ribbon_theme.js"></script>
<script src="yb_address_bar.js"></script>
</body>
```

3. Or else you can patch vivaldi with batch scripts. To learn more check [Patching Vivaldi with batch scripts | Vivaldi Forum](https://forum.vivaldi.net/topic/10592/patching-vivaldi-with-batch-scripts/21?page=2)
4. If you're on macOS see [macOS_Patch_Scripts | upviv](https://github.com/PaRr0tBoY/Vivaldi-Mods/blob/8a1e9f8a63f195f67f27ab2e5b86c4aff0081096/macOS_Patch_Scripts/upviv) as a reference
