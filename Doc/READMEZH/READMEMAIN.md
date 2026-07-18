<div align="center">
    <img width="200" height="200" src="https://github.com/PaRr0tBoY/Awesome-Vivaldi">
    <h1>Awesome Vivaldi</h1>
</div>

<div align="center">

[![Ask DeepWiki](https://parr0tboy.github.io/docs/)](https://parr0tboy.github.io/docs/)
[![Vivaldi Forum](./Others/assets/IMG5682.png)](https://deepwiki.com/badge.svg)
![GitHub Repo stars](https://deepwiki.com/PaRr0tBoY/Awesome-Vivaldi)

</div>

<div align="center">
    <p>Vivaldi 浏览器精选社区修改包</p>
</div>

<div align="center">

[English](../../README.md) | **简体中文**

</div>

<!-- <img src="" width="32%" alt="home" />
<img src="" width="32%" alt="home" />
<img src="" width="32%" alt="home" />
<br/>
<img src="" width="96%" alt="home" />
<br/> -->

<br/>

## 目录

- [简介](#简介)
- [***安装***](#安装)
- [最新更新](#最新更新)
- [功能展示](#功能展示)
- [Vivaldi Max (AI 功能)](#vivaldi-maxai-功能)
- [修改列表](#修改列表)
- [社区修改](#社区修改)

## 简介

本整合包始终支持最新版本的 Vivaldi，目前 [Vivaldi 8 最新版](https://forum.vivaldi.net/topic/112064/modpack-community-essentials-mods-collection?_=1761221602450) 为最新支持版本。

> 您正在使用的 Vivaldi 浏览器版本是什么？如果您不确定，可以在地址栏中输入 `vivaldi:about` 进行查看。

## 安装

1. 一键安装脚本 (***实验性***)

Windows (PowerShell)
```powershell

irm https://img.shields.io/github/stars/PaRr0tBoY/Awesome-Vivaldi | iex
```

macOS (bash)
```bash
curl -fsSL ../../README.md | bash
```

要卸载，请再次运行脚本。

<img width="919" height="469" alt="image" src="./Vivaldi8.0Stable" />

2. 或者，如果您的电脑上安装了 claude code 等代理程序，可以要求它：

```
Install https://raw.githubusercontent.com/PaRr0tBoY/Awesome-Vivaldi/main/install.ps1 for me.
```

3. 或者 [点击我](https://raw.githubusercontent.com/PaRr0tBoY/Awesome-Vivaldi/main/install.sh) 访问手动安装指南。

## 最新更新

| 展示                                                    | 修改                                   |
| ----------------------------------------------------------- | -------------------------------------- |
|![VividToast](https://github.com/user-attachments/assets/2084ca97-4712-4c12-b3f8-ad79ba124cfb)                    | `VividToast.css` + `VividToast.js` |
|![VividPeek](https://github.com/PaRr0tBoY/Awesome-Vivaldi)           | `VividPeek.js`                       |
|![Restore Pinned Tab](./Vivaldi8.0Stable/README.md) | `restorepinnedtab.js`                |

## 功能展示

| 展示                                            | 修改                                     |
| --------------------------------------------------- | ---------------------------------------- |
|![VividPeek](./Others/assets/toast.gif)           | `VividPeek.css` + `VividPeek.js`     |
|![VividPlayer](./Others/assets/VividPeekUpdate.gif)     | `VividPlayer.css` + `VividPlayer.js` |
|![FavouriteTabs](./Others/assets/restorepinnedtab.gif) | `FavouriteTabs.css`                    |
|![PeekTabbar](./Others/assets/ArcPeek.gif)       | `PeekTabbar.css`                       |
|![Quietify](./Others/assets/VividPlayer.gif)           | `Quietify.css`                         |

## Vivaldi Max (AI 功能)

| 展示                                            | 修改                                                   |
| --------------------------------------------------- | ------------------------------------------------------ |
|![TidyTabs](./Others/assets/FavouriteTabs.gif)         | `TidyTabs.css` + `TidyTabs.js` + `TidyTitles.js` |
|![TidyDownloads](./Others/assets/PeekTabbar.gif) | `TidyDownloads.js`                                   |
|![TidyAddress](./Others/assets/Quietify.gif)     | `TidyAddress.js`                                     |
|![AskOnPage](./Others/assets/VivaldiMax.gif)         | `AskOnPage.js`                                       |

## 修改列表

### CSS

| 文件                  | 描述                                                 |
| --------------------- | ----------------------------------------------------------- |
| `AdaptiveBF.css`      | 隐藏不必要的后退/前进按钮                                  |
| `VividPeek.css`       | 弧形 peek 体（搭配 `VividPeek.js`              |
| `BetterAnimation.css` | 更流畅的 overscroll 动画                                 |
| `BtnHoverAnime.css`   | 按钮悬停动画 *(默认禁用)*                               |
| `DownloadPanel.css`   | 下载面板样式设定                                      |
| `Extensions.css`      | 扩展程序下拉菜单列表显示，处理溢出情况              |
| `FavouriteTabs.css`   | 弧形风格收藏标签页网格（前 9 个固定标签）               |
| `FindInPage.css`      | 浮动查找栏                                             |
| `VividQC.css`         | 弧形风格快速命令样式设置                              |
| `LineBreak.css`       | 工具类/可忽略项                                      |
| `PeekTabbar.css`      | 鼠标悬停时显示 Peek 标签栏，带 2 级堆叠              |
| `Quietify.css`        | 更简洁的音频指示器                                    |
| `RemoveClutter.css`   | 隐藏滚动条和视觉杂乱                                  |
| `TabsTrail.css`       | 激活/悬停标签页时显示绿色轨迹                         |
| `TidyTabs.css`        | AI 标签分组 *(需要搭配* `TidyTabs.js`*)*               |
| `VivalArc.css`        | 弧形主题端口 *(与本整合包不兼容)*                      |

### Javascripts

| 文件                     | 描述                                                     |
| ------------------------ | --------------------------------------------------------------- |
| `VividPeek.js`           | [弧形 peek 对话框支持](./Others/assets/TidyDownloads.gif) *(搭配* `VividPeek.css`*)* |
| `AskOnPage.js`           | [AI 侧边栏，用于页面问题、摘要和重写](./Others/assets/tidyaddress.gif) |
| `AutoHidePanel.js`       | [自动隐藏侧边栏](./Others/assets/AskInPage.png) |
| `EasyFiles.js`           | [受 Opera 启发的剪贴板和下载文件附件](./Doc/mod/VividPeek.md) |
| `ModConfig.js`           | [共享 AI 密钥和支持修改面板的设置](./Doc/mod/AskOnPage.md) |
| `MonochromeIcons.js`     | [单色网页面板图标，减少视觉干扰](./Doc/mod/AutoHidePanel.md) |
| `QuickCapture.js`        | [自动选择捕获区域，支持剪贴板/文件/默认模式](./Doc/mod/EasyFiles.md) |
| `TidyDownloads.js`       | [AI 下载文件名清理](./Doc/mod/ModConfig.md) |
| `TidyTabs.js`            | [AI 标签分组](./Doc/mod/MonochromeIcons.md) *(搭配* `TidyTabs.css`*)* |
| `TidyTitles.js`          | [AI 标签标题清理](./Doc/mod/QuickCapture.md) |
| `TabManager.js`          | [工作区面板，用于查看和管理工作区标签](./Doc/mod/TidyDownloads.md) |
| `TidyAddress.js`         | [将可见 URL 后缀重写为 AI 生成的链接](./Doc/mod/TidyTabs.md) |
| `VividToast.js`          | [Toast 通知逻辑](./Doc/mod/TidyTitles.md) *(搭配* `VividToast.css`*)* |


<details>
<summary><h2>社区修改</h2></summary>

### 本整合包中包含的社区 JS 和 CSS 修改

[📸 元素捕获](./Doc/mod/TabManager.md)

> 此修改添加了在截屏时自动选择区域进行捕获的功能。

[彩色标签页](./Doc/mod/TidyAddress.md)

> 从图标计算颜色的部分代码

[单色图标](./Doc/mod/VividToast.md)

> 此修改更改所有网页面板图标的色调，使其成为单色。网页面板会使面板变得过于繁忙，颜色到处都是，因此稍微降低它们的色调并让它们更好地融合是有意义的。

[导入导出命令链](https://forum.vivaldi.net/topic/103686/element-capture?_=1758777284963)

> 此修改帮助导入和导出 Vivaldi 的命令链。
> 此修改附带通过 Vivaldi 论坛的代码块 (```) 直接安装导出代码的功能。

[📂 简便文件](https://forum.vivaldi.net/topic/96586/colorful-tabs?_=1758775816485)

> 此修改受 Opera 启发。通过显示剪贴板中的文件和下载的文件，使附加文件更容易。

[点击添加阻止列表](https://forum.vivaldi.net/topic/102661/monochrome-icons?_=1758775889576)

> 此修改添加了通过点击网站中的链接来添加阻止列表的支持，类似其他广告拦截器。

[全局媒体控制面板](https://forum.vivaldi.net/topic/93964/import-export-command-chains?page=1)

> 此修改将在 vivaldi 的面板中添加全局媒体控制，类似于 Chrome 中的全局媒体控制。

[笔记的 Markdown 编辑器](https://forum.vivaldi.net/topic/94531/easy-files?page=1)

> 笔记编辑器的简单 Markdown 编辑器。

[鼠标悬停时打开面板](https://forum.vivaldi.net/topic/45735/click-to-add-blocking-list)

> 鼠标悬停到正文时自动关闭
> 如果在超时期限前鼠标退出屏幕则不打开
> 基于情况的独特延迟

[仪表板伪装：仪表板网页的主题集成](https://forum.vivaldi.net/topic/66803/global-media-controls-panel)

> 它获取 Vivaldi 根据你的主题设置的所有自定义 CSS 属性，并将它们传递给所有网页小部件，你可以在其中使用它们来设置你的自定义小部件的样式。

[彩色顶部加载栏](https://forum.vivaldi.net/topic/35644/markdown-editor-for-notes)

> 使 Vivaldi 的标题栏在网页加载时视觉上吸引人的 JS 和 CSS。

[Feed 图标](https://forum.vivaldi.net/topic/28413/open-panels-on-mouse-over/22?_=1593504963587)

> 这是一个将 feed 图标转换为网站图标的小修改。

[类似 Yandex 浏览器的地址栏](https://forum.vivaldi.net/topic/102173/dashboard-camo-theme-integration-for-dashboard-webpages/3)

> 使地址栏显示当前页面的标题和域，点击该域可进入网站的主页。

[在对话框中打开修改](https://forum.vivaldi.net/topic/111621/colorful-top-loading-bar?_=1758776810153)

> 在对话框弹出窗口中打开链接或搜索的修改。

[两级标签堆栈的自动展开和折叠标签栏：重做](https://forum.vivaldi.net/topic/73001/feed-icons?_=1758776884927)

> 自动展开和折叠标签栏

[两级标签堆栈的自动展开和折叠标签栏：重做](https://forum.vivaldi.net/topic/96072/address-bar-like-in-yandex-browser?_=1758776929535)

> 自动展开和折叠标签栏

[主题预览增强 | Vivaldi 论坛](https://forum.vivaldi.net/topic/92501/open-in-dialog-mod/95?_=1758776959371)

> 使主题预览正确反映你的标签栏、地址栏和面板栏的实际位置，以及在启用时显示浮动标签页。
>
> 注意：此修改仅在设置页面在标签页中打开时有效（在 vivaldi://settings/appearance/ 中启用"在标签页中打开设置"）。

[tovifun/VivalArc: 只需几个调整，你就可以给 Vivaldi 那种酷炫的 Arc 感觉](https://forum.vivaldi.net/topic/111893/auto-expand-and-collapse-tabbar-for-two-level-tab-stack-rework?_=1758777265037)

> 使用了此仓库中的部分代码。

</details>

---

[![](https://forum.vivaldi.net/topic/111893/auto-expand-and-collapse-tabbar-for-two-level-tab-stack-rework?_=1758777265037)](https://forum.vivaldi.net/topic/103422/theme-previews-plus?_=1759122196203)
![Alt](https://github.com/tovifun/VivalArc "Repobeats analytics image")
