<!-- source-commit: 26e5714338d0d9f75afbdc944531c9c5d93019f1 -->
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
    <p>A Curated Community Mod Pack for Vivaldi Browser</p>
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

- [Introduction](#introduction)
- [***Installation](#installation)
- [Latest Updates](#latest-updates)
- [Feature Showcase](#feature-showcase)
- [Vivaldi Max (AI Features)](#vivaldi-maxai-features)
- [Mod List](#mod-list)
- [Community Mods](#community-mods)
- [Documentation](#documentation)

## 简介

此模组包始终随 Vivaldi 浏览器更新，[Vivaldi 8 latest](./Vivaldi8.0Stable) 目前受支持。

> 使用哪个版本的 Vivaldi 浏览器？如果不确定，可在 `vivaldi:about` 查看。

## 安装

1. 一键安装脚本（***实验性***)

Windows（PowerShell）
```powershell

irm https://raw.githubusercontent.com/PaRr0tBoY/Awesome-Vivaldi/main/install.ps1 | iex
```

macOS（bash）
```bash
curl -fsSL https://raw.githubusercontent.com/PaRr0tBoY/Awesome-Vivaldi/main/install.sh | bash
```

卸载时再运行一次脚本。

<img width="919" height="469" alt="image" src="https://github.com/user-attachments/assets/2084ca97-4712-4c12-b3f8-ad79ba124cfb" />

2. 或者如果您电脑上有类似 claude code 的代理，请让它：

```
为我安装 https://github.com/PaRr0tBoY/Awesome-Vivaldi。
```

3. 或者 [Click me](./Vivaldi8.0Stable/README.md) 前往手动安装指南。

## 最新更新

| Showcase                                            | Mods                                   |
| --------------------------------------------------- | -------------------------------------- |
| ![VividToast](./Others/assets/toast.gif)                    | `VividToast.css` + `VividToast.js` |
| ![VividPeek](./Others/assets/VividPeekUpdate.gif)           | `VividPeek.js`                       |
| ![Restore Pinned Tab](./Others/assets/restorepinnedtab.gif) | `restorepinnedtab.js`                |

## 功能展示

| Showcase                                            | Mods                                     |
| --------------------------------------------------- | ---------------------------------------- |
| ![VividPeek](./Others/assets/ArcPeek.gif)           | `VividPeek.css` + `VividPeek.js`     |
| ![VividPlayer](./Others/assets/VividPlayer.gif)     | `VividPlayer.css` + `VividPlayer.js` |
| ![FavouriteTabs](./Others/assets/FavouriteTabs.gif) | `FavouriteTabs.css`                    |
| ![PeekTabbar](./Others/assets/PeekTabbar.gif)       | `PeekTabbar.css`                       |
| ![Quietify](./Others/assets/Quietify.gif)           | `Quietify.css`                         |

## Vivaldi Max（AI 功能）

| Showcase                                            | Mods                                                   |
| --------------------------------------------------- | ------------------------------------------------------ |
| ![TidyTabs](./Others/assets/VivaldiMax.gif)         | `TidyTabs.css` + `TidyTabs.js` + `TidyTitles.js` |
| ![TidyDownloads](./Others/assets/TidyDownloads.gif) | `TidyDownloads.js`                                   |
| ![TidyAddress](./Others/assets/tidyaddress.gif)     | `TidyAddress.js`                                     |
| ![AskOnPage](./Others/assets/AskInPage.png)         | `AskOnPage.js`                                       |

## 模组列表

&nbsp;

### CSS

| File                  | Description                                                 |
| --------------------- | ----------------------------------------------------------- |
| `AdaptiveBF.css`      | 在不必要时隐藏后退/前进按钮                               |
| `VividPeek.css`       | Arc 窥视体验（需搭配 `VividPeek.js`）                       |
| `BetterAnimation.css` | 更平滑的滚动动画                                          |
| `BtnHoverAnime.css`   | 按钮悬停动画 *(默认禁用)*                                   |
| `DownloadPanel.css`   | 下载面板主题                                                |
| `Extensions.css`      | 扩展下拉列表呈现为列表，处理溢出                           |
| `FavouriteTabs.css`   | 类似 Arc 的收藏标签网格（前 9 个固定标签）                 |
| `FindInPage.css`      | 浮动查找栏                                                  |
| `VividQC.css`         | 类似 Arc 的快速命令样式                                     |
| `LineBreak.css`       | 实用工具 / 可省略                                           |
| `PeekTabbar.css`      | 以 2 级堆叠方式在悬停时显示窥视标签栏                      |
| `Quietify.css`        | 更简洁的音频指示器                                          |
| `RemoveClutter.css`   | 隐藏滚动条与视觉杂乱                                         |
| `TabsTrail.css`       | 活动/悬停标签上的绿色轨迹                                   |
| `TidyTabs.css`        | AI 标签分组 *(需* `TidyTabs.js`*)*                           |
| `VivalArc.css`        | Arc 主题移植 *(与此模组包不兼容)*                           |

### Javascripts

| File                     | Description                                                     |
| ------------------------ | --------------------------------------------------------------- |
| `VividPeek.js`           | [Arc peek dialog support](./Doc/mod/VividPeek.md) *(需搭配* `VividPeek.css`*)* |
| `AskOnPage.js`           | [AI side panel for page questions, summaries, and rewrites](./Doc/mod/AskOnPage.md) |
| `AutoHidePanel.js`       | [Auto-hide side panel](./Doc/mod/AutoHidePanel.md) |
| `EasyFiles.js`           | [Opera-inspired file attachment via clipboard &amp; downloads](./Doc/mod/EasyFiles.md) |
| `ModConfig.js`           | [Shared settings panel for AI keys and supported mods](./Doc/mod/ModConfig.md) |
| `MonochromeIcons.js`     | [Monochrome web panel icons to reduce visual noise](./Doc/mod/MonochromeIcons.md) |
| `QuickCapture.js`        | [Auto-select capture area with clipboard/file/default modes](./Doc/mod/QuickCapture.md) |
| `TidyDownloads.js`       | [AI download filename cleanup](./Doc/mod/TidyDownloads.md) |
| `TidyTabs.js`            | [AI tab grouping](./Doc/mod/TidyTabs.md) *(需搭配* `TidyTabs.css`*)* |
| `TidyTitles.js`          | [AI tab title cleanup](./Doc/mod/TidyTitles.md) |
| `TabManager.js`          | [Workspace Board panel for viewing and managing workspace tabs](./Doc/mod/TabManager.md) |
| `TidyAddress.js`         | [Rewrites the visible URL suffix into an AI-generated slug](./Doc/mod/TidyAddress.md) |
| `VividToast.js`          | [Toast notification logic](./Doc/mod/VividToast.md) *(需搭配* `VividToast.css`*)* |


<details>
<summary><h2>社区模组</h2></summary>

### 本模组包包含的社区 JS 模组和 CSS

[📸 Element Capture](https://forum.vivaldi.net/topic/103686/element-capture?_=1758777284963)

> 该模组在截图时自动选择捕获区域。

[Colorful tabs](https://forum.vivaldi.net/topic/96586/colorful-tabs?_=1758775816485)

> 计算图标颜色的代码部分

[Monochrome icons](https://forum.vivaldi.net/topic/102661/monochrome-icons?_=1758775889576)

> 该修改更改了所有网页面板图标的色调并使其单色化。由于网页面板会显得非常繁忙且颜色杂乱无章，因此适当地调低色调并让它们更融合更合适。

[Import Export Command Chains](https://forum.vivaldi.net/topic/93964/import-export-command-chains?page=1)

> 该模组帮助导入和导出 Vivaldi 的命令链。
> 该模组附带从 Vivaldi 论坛代码块（```）导出的直接安装代码的功能。

[📂 Easy Files](https://forum.vivaldi.net/topic/94531/easy-files?page=1)

> 该模组灵感来自 Opera。通过显示剪贴板中的文件和已下载的文件，使附加文件更容易。

[Click to add Blocking list](https://forum.vivaldi.net/topic/45735/click-to-add-blocking-list)

> 该模组支持通过点击类似其他广告拦截器的站点链接来添加屏蔽列表。

[Global Media Controls Panel](https://forum.vivaldi.net/topic/66803/global-media-controls-panel)

> 该模组将在 Vivaldi 的面板中添加类似 Chrome 中全局媒体控制的全局媒体控制。

[Markdown Editor for Notes](https://forum.vivaldi.net/topic/35644/markdown-editor-for-notes)

> 简易 Markdown 编辑器用于笔记编辑器

[Open panels on mouse-over.](https://forum.vivaldi.net/topic/28413/open-panels-on-mouse-over/22?_=1593504963587)

> 当鼠标悬停在 body 上时自动关闭
> 如果鼠标在超时期间之前离开屏幕则不打开
> 根据情况独特的延迟

[Dashboard Camo: Theme Integration for Dashboard Webpages](https://forum.vivaldi.net/topic/102173/dashboard-camo-theme-integration-for-dashboard-webpages/3)

> 将 Vivaldi 根据主题设置的所有自定义 CSS 属性传递给所有网页小部件，您可以在其中用于样式化自定义小部件。

[Colorful Top Loading Bar](https://forum.vivaldi.net/topic/111621/colorful-top-loading-bar?_=1758776810153)

> 当网页加载时，使 Vivaldi 标题栏在视觉上更吸引人。

[Feed icons](https://forum.vivaldi.net/topic/73001/feed-icons?_=1758776884927)

> 该小模组将源文件图标转换为网站图标。

[Address Bar like in Yandex Browser](https://forum.vivaldi.net/topic/96072/address-bar-like-in-yandex-browser?_=1758776929535)

> 使地址栏显示当前页面的标题和域名，单击后跳转到网站首页。

[Open in Dialog mod](https://forum.vivaldi.net/topic/92501/open-in-dialog-mod/95?_=1758776959371)

> 在对话框弹出窗口中打开链接或搜索。

[Auto expand and collapse tabbar for two-level tab stack: Rework](https://forum.vivaldi.net/topic/111893/auto-expand-and-collapse-tabbar-for-two-level-tab-stack-rework?_=1758777265037)

> 自动展开和折叠标签栏

[Auto expand and collapse tabbar for two-level tab stack: Rework](https://forum.vivaldi.net/topic/111893/auto-expand-and-collapse-tabbar-for-two-level-tab-stack-rework?_=1758777265037)

> 自动展开和折叠标签栏

[Theme Previews Plus | Vivaldi Forum](https://forum.vivaldi.net/topic/103422/theme-previews-plus?_=1759122196203)

> 为了正确反映您的标签栏、地址栏和面板栏的实际位置，使主题预览正常工作，同时在启用浮动标签时显示它们。
>
> 注意：此模组仅在设置页面以标签页打开时工作（vivaldi://settings/appearance/ 中启用了“以标签页形式打开设置”）。

[tovifun/VivalArc: With just a few tweaks, you can give Vivaldi that cool Arc vibe](https://github.com/tovifun/VivalArc)

> 本仓库的部分代码被用于。

</details>

---

## 文档

请在 **[Doc](https://parr0tboy.github.io/docs/)** 浏览完整文档门户——设计哲学、模组架构深入分析、API 参考以及逆向工程的 Vivaldi 内部结构。

---

![Alt](https://repobeats.axiom.co/api/embed/4a30f8a4b398404c3c773f672d36c2b52f7865c3.svg "Repobeats analytics image")

```