<!-- source-commit: 2fde65ddc6e930b6452ab57678317d35ce834fc5 -->
<div align="center">
    <img width="200" height="200" src="./Others/assets/IMG5682.png">
    <h1>Awesome Vivaldi</h1>
</div>

<div align="center">

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/PaRr0tBoY/Awesome-Vivaldi)
[![Vivaldi Forum](https://img.shields.io/badge/Vivaldi-Forum-red)](https://forum.vivaldi.net/topic/112064/modpack-community-essentials-mods-collection?_=1761221602450)
![GitHub Repo stars](https://img.shields.io/github/stars/PaRr0tBoY/Awesome-Vivaldi)

</div>

<div align="center">
    <p>为 Vivaldi 浏览器精心整理的社区模组合集</p>
</div>

<div align="center">

**English** | [简体中文](./Doc/READMEZH/READMEMAIN.md)

</div>

<!-- <img src="" width="32%" alt="home" />
<img src="" width="32%" alt="home" />
<img src="" width="32%" alt="home" />
<br/>
<img src="" width="96%" alt="home" />
<br/> -->

<br/>

## 目录

- [Introduction](#introduction)
- [***Installation](#installation)
- [Latest Updates](#latest-updates)
- [Feature Showcase](#feature-showcase)
- [Vivaldi Max (AI Features)](#vivaldi-maxai-features)
- [Mod List](#mod-list)
- [Community Mods](#community-mods)
- [Documentation](#documentation)

## 简介

该模组合集会随 Vivaldi 持续更新，目前支持 [Vivaldi 8 latest](./Vivaldi8.0Stable)。

> 你正在使用哪个版本的 Vivaldi 浏览器？如果不确定，可在 `vivaldi:about` 页面查看。

## 安装

1. 一键命令安装脚本（***实验性***）

Windows (PowerShell)
```powershell

irm https://raw.githubusercontent.com/PaRr0tBoY/Awesome-Vivaldi/main/install.ps1 | iex
```

macOS (bash)
```bash
curl -fsSL https://raw.githubusercontent.com/PaRr0tBoY/Awesome-Vivaldi/main/install.sh | bash
```

如需卸载，再次运行上述脚本即可。

<img width="919" height="469" alt="image" src="https://github.com/user-attachments/assets/2084ca97-4712-4c12-b3f8-ad79ba124cfb" />

2. 或者，如果你的电脑上有 claude code 之类的智能体，可以让它：

```
Install https://github.com/PaRr0tBoY/Awesome-Vivaldi for me.
```

3. 或者 [Click me](./Vivaldi8.0Stable/README.md) 查看手动安装指南。

## 最新更新

| 展示                                                    | 模组                                   |
| ----------------------------------------------------------- | -------------------------------------- |
| ![VividToast](./Others/assets/toast.gif)                    | `VividToast.css` + `VividToast.js` |
| ![VividPeek](./Others/assets/VividPeekUpdate.gif)           | `VividPeek.js`                       |
| ![Restore Pinned Tab](./Others/assets/restorepinnedtab.gif) | `restorepinnedtab.js`                |

## 功能展示

| 展示                                            | 模组                                     |
| --------------------------------------------------- | ---------------------------------------- |
| ![VividPeek](./Others/assets/ArcPeek.gif)           | `VividPeek.css` + `VividPeek.js`     |
| ![VividPlayer](./Others/assets/VividPlayer.gif)     | `VividPlayer.css` + `VividPlayer.js` |
| ![FavouriteTabs](./Others/assets/FavouriteTabs.gif) | `FavouriteTabs.css`                    |
| ![PeekTabbar](./Others/assets/PeekTabbar.gif)       | `PeekTabbar.css`                       |
| ![Quietify](./Others/assets/Quietify.gif)           | `Quietify.css`                         |

## Vivaldi Max（AI 功能）

| 展示                                            | 模组                                                   |
| --------------------------------------------------- | ------------------------------------------------------ |
| ![TidyTabs](./Others/assets/VivaldiMax.gif)         | `TidyTabs.css` + `TidyTabs.js` + `TidyTitles.js` |
| ![TidyDownloads](./Others/assets/TidyDownloads.gif) | `TidyDownloads.js`                                   |
| ![TidyAddress](./Others/assets/tidyaddress.gif)     | `TidyAddress.js`                                     |
| ![AskOnPage](./Others/assets/AskInPage.png)         | `AskOnPage.js`                                       |

## 模组列表

&nbsp;

### CSS

| 文件                  | 描述                                                 |
| --------------------- | ----------------------------------------------------------- |
| `AdaptiveBF.css`      | 在不需要时隐藏后退/前进按钮                  |
| `VividPeek.css`       | Arc 式预览体验（需配合 `VividPeek.js`）              |
| `BetterAnimation.css` | 更流畅的惯性滚动动画                               |
| `BtnHoverAnime.css`   | 按钮悬停动画 *(默认禁用)*              |
| `DownloadPanel.css`   | 下载面板主题化                                      |
| `Extensions.css`      | 扩展下拉以列表显示，溢出处理              |
| `FavouriteTabs.css`   | 类 Arc 收藏标签网格（前 9 个固定标签）           |
| `AskOnPage.css`      | Ask on Page 样式 —— 浮动 AI 查找栏              |
| `VividQC.css`         | 类 Arc 快速命令样式                              |
| `LineBreak.css`       | 工具类 / 可忽略                                           |
| `PeekTabbar.css`      | 悬停时预览标签栏，支持两级堆叠                  |
| `Quietify.css`        | 更简洁的音频指示器                                     |
| `RemoveClutter.css`   | 隐藏滚动条与视觉杂乱                            |
| `TabsTrail.css`       | 活动/悬停标签上的绿色轨迹                          |
| `TidyTabs.css`        | AI 标签分组 *(需要* `TidyTabs.js`*)*                    |
| `VivalArc.css`        | Arc 主题移植 *(与本模组合集不兼容)*           |

### Javascripts

| 文件                     | 描述                                                     |
| ------------------------ | --------------------------------------------------------------- |
| `VividPeek.js`           | [Arc peek dialog support](./Doc/mod/VividPeek.md) *(配合* `VividPeek.css`*使用)* |
| `AskOnPage.js`           | Ctrl+F AI 页面搜索 —— 查找或询问任何内容，行内引用 |
| `Diabar.js`              | AI 侧边栏聊天 —— 页面问答、摘要、重写 |
| `AutoHidePanel.js`       | [Auto-hide side panel](./Doc/mod/AutoHidePanel.md) |
| `EasyFiles.js`           | [Opera-inspired file attachment via clipboard &amp; downloads](./Doc/mod/EasyFiles.md) |
| `ModConfig.js`           | [Shared settings panel for AI keys and supported mods](./Doc/mod/ModConfig.md) |
| `MonochromeIcons.js`     | [Monochrome web panel icons to reduce visual noise](./Doc/mod/MonochromeIcons.md) |
| `QuickCapture.js`        | [Auto-select capture area with clipboard/file/default modes](./Doc/mod/QuickCapture.md) |
| `TidyDownloads.js`       | [AI download filename cleanup](./Doc/mod/TidyDownloads.md) |
| `TidyTabs.js`            | [AI tab grouping](./Doc/mod/TidyTabs.md) *(配合* `TidyTabs.css`*使用)* |
| `TidyTitles.js`          | [AI tab title cleanup](./Doc/mod/TidyTitles.md) |
| `TabManager.js`          | [Workspace Board panel for viewing and managing workspace tabs](./Doc/mod/TabManager.md) |
| `TidyAddress.js`         | [Rewrites the visible URL suffix into an AI-generated slug](./Doc/mod/TidyAddress.md) |
| `VividToast.js`          | [Toast notification logic](./Doc/mod/VividToast.md) *(配合* `VividToast.css`*使用)* |


<details>
<summary><h2>社区模组</h2></summary>

### 本模组合集包含的社区 JS 模组与 CSS

[📸 Element Capture](https://forum.vivaldi.net/topic/103686/element-capture?_=1758777284963)

> 该模组新增了截图时自动选择截取区域的功能。

[Colorful tabs](https://forum.vivaldi.net/topic/96586/colorful-tabs?_=1758775816485)

> 从图标计算颜色的部分代码

[Monochrome icons](https://forum.vivaldi.net/topic/102661/monochrome-icons?_=1758775889576)

> 此修改会改变所有网页面板图标的色调，使其变为单色。使用网页面板时，面板会显得过于杂乱、颜色杂乱无章，因此适当淡化它们、让其更融合是合理的。

[Import Export Command Chains](https://forum.vivaldi.net/topic/93964/import-export-command-chains?page=1)

> 该模组帮助导入和导出 Vivaldi 的命令链。
> 该模组支持通过 Vivaldi 论坛代码块（```）直接安装导出的代码。

[📂 Easy Files](https://forum.vivaldi.net/topic/94531/easy-files?page=1)

> 该模组灵感来自 Opera。它通过显示剪贴板中的文件和已下载文件，让附件更简单。

[Click to add Blocking list](https://forum.vivaldi.net/topic/45735/click-to-add-blocking-list)

> 该模组支持像其他广告拦截器一样，通过点击网站中的链接来添加屏蔽列表。

[Global Media Controls Panel](https://forum.vivaldi.net/topic/66803/global-media-controls-panel)

> 该模组会在 Vivaldi 的面板中添加类似 Chrome 的全局媒体控制。

[Markdown Editor for Notes](https://forum.vivaldi.net/topic/35644/markdown-editor-for-notes)

> 笔记编辑器的简易 Markdown 编辑器

[Open panels on mouse-over.](https://forum.vivaldi.net/topic/28413/open-panels-on-mouse-over/22?_=1593504963587)

> 鼠标移到主体时自动关闭
> 在超时前鼠标离开屏幕则不打开
> 基于场景的独特延迟

[Dashboard Camo: Theme Integration for Dashboard Webpages](https://forum.vivaldi.net/topic/102173/dashboard-camo-theme-integration-for-dashboard-webpages/3)

> 它会获取 Vivaldi 根据你的主题设置的所有自定义 CSS 属性，并将其传递给所有网页小部件，供你为自定义小部件设置样式使用。

[Colorful Top Loading Bar](https://forum.vivaldi.net/topic/111621/colorful-top-loading-bar?_=1758776810153)

> 让 Vivaldi 标题栏在网页加载时视觉上更美观的 JS 与 CSS。

[Feed icons](https://forum.vivaldi.net/topic/73001/feed-icons?_=1758776884927)

> 一个将订阅源图标转换为网站图标的小模组。

[Address Bar like in Yandex Browser](https://forum.vivaldi.net/topic/96072/address-bar-like-in-yandex-browser?_=1758776929535)

> 让地址栏显示当前页面的标题与域名，点击可前往网站主页。

[Open in Dialog mod](https://forum.vivaldi.net/topic/92501/open-in-dialog-mod/95?_=1758776959371)

> 在对话框弹窗中打开链接或搜索的模组。

[Auto expand and collapse tabbar for two-level tab stack: Rework](https://forum.vivaldi.net/topic/111893/auto-expand-and-collapse-tabbar-for-two-level-tab-stack-rework?_=1758777265037)

> 自动展开与折叠标签栏

[Auto expand and collapse tabbar for two-level tab stack: Rework](https://forum.vivaldi.net/topic/111893/auto-expand-and-collapse-tabbar-for-two-level-tab-stack-rework?_=1758777265037)

> 自动展开与折叠标签栏

[Theme Previews Plus | Vivaldi Forum](https://forum.vivaldi.net/topic/103422/theme-previews-plus?_=1759122196203)

> 让主题预览正确反映标签栏、地址栏和面板栏的实际位置，并在启用时显示浮动标签。
>
> 注意：仅当设置页面在标签中打开时生效（在 vivaldi://settings/appearance/ 中启用“在标签中打开设置”）。

[tovifun/VivalArc: With just a few tweaks, you can give Vivaldi that cool Arc vibe](https://github.com/tovifun/VivalArc)

> 本仓库部分代码被使用。

</details>

---

## 文档

完整文档门户请浏览 **[Doc](https://parr0tboy.github.io/docs/)** —— 包含设计理念、模组架构深入解析、API 参考以及逆向工程的 Vivaldi 内部原理。

---
## 每日小贴士

```
1. 前往 vivaldi://vivaldi-urls/，开启“启用内部调试页面”。
2. 接着，进入 vivaldi:settings/qc/ 并新建一条快速命令，内容如下：
3. 在当前标签打开链接，URL 为：chrome://restart
4. 之后，自定义工具栏并添加此重启按钮
5. 现在你可以一键重启 Vivaldi。如果你是模组开发者，在需要重新加载使模组生效时会很方便。
6. 你也可以在 vivaldi:settings/themes/ 修改工具栏按钮的图标
```

<img width="800" height="160" alt="image" src="https://github.com/user-attachments/assets/cca14862-42c6-4f30-a63d-d0af6ec16756" />

---

![Alt](https://repobeats.axiom.co/api/embed/4a30f8a4b398404c3c773f672d36c2b52f7865c3.svg "Repobeats analytics image")