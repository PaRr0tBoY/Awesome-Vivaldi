To install CSS:

1. Open Vivaldi://experiments in Vivaldi and check Allow CSS Modification
2. Restart Vivaldi
3. Goto Settings->Appearance and you'll see CUSTOM UI MODIFICATIONS. Select file location where your css file is in.
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
