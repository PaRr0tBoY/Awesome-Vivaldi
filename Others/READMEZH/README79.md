<div align="center">
    <img width="200" height="200" src="../../Others/Image/IMG5682.png">
</div>

<div align="center">
    <h1>Awesome Vivaldi</h1>
<div align="center">

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/PaRr0tBoY/Awesome-Vivaldi)
[![Vivaldi Forum](https://img.shields.io/badge/Vivaldi-Forum-red)](https://forum.vivaldi.net/topic/112064/modpack-community-essentials-mods-collection?_=1761221602450)
![GitHub Repo stars](https://img.shields.io/github/stars/PaRr0tBoY/Awesome-Vivaldi)

</div>
    <p>Vivaldi 浏览器精选社区修改包</p>

<div align="center">

[English](../../Vivaldi7.9Stable/README.md) | **简体中文**

</div>

<!-- <img src="" width="32%" alt="home" />
<img src="" width="32%" alt="home" />
<img src="" width="32%" alt="home" />
<br/>
<img src="" width="96%" alt="home" />
<br/> -->

</div>

<br/>

## 目录

- [最新更新](#最新更新)
- [功能展示](#功能展示)
- [修改列表](#修改列表)
  - [CSS](#css)
  - [JavaScripts](#javascripts)
- [如何安装](#如何安装)
  - [Vivaldi 设置](#vivaldi-设置)
  - [安装 CSS 修改](#安装-css-修改)
  - [安装 JavaScripts 修改](#安装-javascripts-修改)
- [常见问题](#常见问题)

## 最新更新

| 演示                                                   | 修改                              |
| ------------------------------------------------------ | --------------------------------- |
| ![ArcPeek](../../Others/assets/ArcPeek.gif)            | `ArcPeek.css` + `ArcPeek.js`      |
| ![AskInPage](../../Others/assets/AskInPage.png)        | `AskInPage.js`                    |
| ![TidyDownloads](../../Others/assets/TidyDownloads.gif) | `TidyDownloads.js`                |


## 功能展示

| 演示                                                    | 修改                                                              |
| :------------------------------------------------------ | :---------------------------------------------------------------- |
| ![FavouriteTabs](../../Others/assets/FavouriteTabs.gif) | `FavouriteTabs.css`                                               |
| ![VivaldiMax](../../Others/assets/VivaldiMax.gif)       | `TidyTabs.css` + `TidyTabs.js` + `TidyTitles.js`                 |
| ![PeekTabbar](../../Others/assets/PeekTabbar.gif)       | `PeekTabbar.css`                                                  |
| ![Quietify](../../Others/assets/Quietify.gif)           | `Quietify.css`                                                    |

## 修改列表

### CSS

| 文件                  | 描述                                                  |
| :-------------------- | :---------------------------------------------------- |
| `AdaptiveBF.css`      | 在不需要时隐藏前进/后退按钮                           |
| `ArcPeek.css`         | Arc 预览体验（需配合 `ArcPeek.js`）                   |
| `BetterAnimation.css` | 更流畅的滚动动画                                      |
| `BtnHoverAnime.css`   | 按钮悬停动画 _（默认禁用）_                           |
| `DownloadPanel.css`   | 下载面板主题                                          |
| `Extensions.css`      | 扩展下拉列表样式，溢出处理                            |
| `FavouriteTabs.css`   | Arc 风格收藏标签网格（前 9 个固定标签）               |
| `FindInPage.css`      | 浮动查找栏                                            |
| `FluidQC.css`         | Arc 风格快速命令样式                                  |
| `LineBreak.css`       | 工具类 / 可忽略                                       |
| `PeekTabbar.css`      | 悬停时预览标签栏，支持两级堆叠                        |
| `Quietify.css`        | 更精致的音频指示器                                    |
| `RemoveClutter.css`   | 隐藏滚动条和视觉杂乱                                  |
| `TabsTrail.css`       | 活动/悬停标签的绿色轨迹                               |
| `TidyTabs.css`        | AI 标签分组 _（需要 `TidyTabs.js`）_                  |
| `VivalArc.css`        | Arc 主题移植 _（与此修改包不兼容）_                   |

### JavaScripts

| 文件                     | 描述                                             |
| :----------------------- | :----------------------------------------------- |
| `ArcPeek.js`             | Arc 预览对话框支持 _（配合 `ArcPeek.css`）_      |
| `AskInPage.js`           | 用于页面问答、摘要和改写的 AI 侧边栏             |
| `AutoHidePanel.js`       | 自动隐藏侧边栏                                   |
| `EasyFiles.js`           | Opera 风格的文件附件，支持剪贴板和下载内容       |
| `GlobalMediaControls.js` | 全局媒体控制面板（Chrome 风格）                  |
| `MonochromeIcons.js`     | 网页面板图标单色化，减少视觉噪音                 |
| `QuickCapture.js`        | 自动框选区域，支持剪贴板/文件/默认模式           |
| `SelectCloseTabs.js`     | 在标签切换器里标记多个标签，然后批量关闭         |
| `TabScroll.js`           | 点击活动标签：滚动到顶部/上一位置                |
| `TidyDownloads.js`       | 用 AI 清理下载文件名                             |
| `TidyTabs.js`            | AI 标签分组 _（配合 `TidyTabs.css`）_            |
| `TidyTitles.js`          | AI 标签标题清理                                  |
| `WorkspaceTabManager.js` | Workspace Board 面板，用来查看和管理工作区标签   |
| `YbAddressBar.js`        | 地址栏增强（有 bug）                             |

## 如何安装

### Vivaldi 设置

- 打开 `vivaldi:settings/appearance/` -> `UI AUTO-HIDE`，启用 `Enable UI Auto-hide`。
- 打开 `vivaldi:settings/tabs/` -> `Tab Stacking`，把 `Tab Stacking` 设为 Two-Level。（不要启用 `Use Compact Display Style`）
- 打开 `vivaldi:settings/tabs/` -> `New Tab Position`，切换到 `As Tab Stack with Related Tab`。
- 打开 `vivaldi:settings/qc/` -> `Quick Command Options`，启用 `Open Links in New Tab`。

### 安装 CSS 修改

1. 打开 URL `vivaldi://flags/#vivaldi-css-mods`
2. 启用该标志，按提示重启浏览器
3. 在设置中打开外观部分
4. 在"自定义 UI 修改"下选择你要使用的文件夹
5. 在此修改包中，我们使用 `Import.css` 作为 css 修改管理器
6. 选择 `Import.css` 所在文件夹作为 css 文件夹来安装
7. 重启 Vivaldi 即可生效

**重要**：
CSS 文件名不能有空格，否则无法工作。目录/路径名中的空格应该可以工作，但尽量避免。

另外，确保文件扩展名确实是 `.css`——如果你在 Windows 上，请确保文件扩展名设置为显示。

**7.7+ 用户注意事项！**
所有实验功能现在位于 `vivaldi://flags/`
要启用 CSS 修改，在搜索框中使用"vivaldi-"查找，或前往
`chrome://flags/#vivaldi-css-mods` 设置为启用。

### 安装 JavaScripts 修改

- 自动安装

1. 如果你在 Windows 上，使用 [Vivaldi Mod Manager](https://github.com/eximido/vivaldimodmanager)
2. 如果你在 Linux 上，请参阅 [Vivaldi-Autoinject-Custom-js-ui](https://aur.archlinux.org/vivaldi-autoinject-custom-js-ui.git) 获取更多信息
3. 另请参阅 [使用批处理脚本修补 Vivaldi](https://forum.vivaldi.net/topic/10592/patching-vivaldi-with-batch-scripts/21?page=2) 适用于所有平台
4. 如果你在 macOS 上，使用 [macOS_Patch_Scripts | upviv](https://github.com/PaRr0tBoY/Vivaldi-Mods/blob/8a1e9f8a63f195f67f27ab2e5b86c4aff0081096/MacOSPatchScripts/upviv) 作为修补脚本的参考

- 手动安装

Vivaldi 中你唯一需要修改的文件是 window.html，它位于：

`<YOURVIVALDIDIRECTORY>\Application\<VERSION>\resources\vivaldi`

⚠ 在修改之前你应该备份它。
==特别是 window.html。如果配置错误，你的浏览器可能会损坏。==

要安装，只需将 ./Javascripts/ 下的所有内容复制到你的 `<YOURVIVALDIDIRECTORY>`\Application\<VERSI0N>\resources\vivaldi\

**它做了什么？**

1. 所有 javascript 修改都被复制到 `<YOURVIVALDIDIRECTORY>`\Application\<VERSI0N>\resources\vivaldi。
2. 在同一文件夹下，window.html 已被修改，其中注入了 javascript 修改。
3. 重启以查看效果
4. 你可以在 `vivaldi:inspect/#apps` 确认安装状态。
   a. 点击 window.HTML 的蓝色 inspect 按钮，打开控制台窗口。
   b. 检查 elements 标签页。如果能看到 js 修改列表，就说明安装成功。

**修改后的 window.html 如下：**

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

就这样！重启浏览器即可生效。如果有任何其他问题，请在 [Issues · PaRr0tBoY/Awesome-Vivaldi](https://github.com/PaRr0tBoY/Awesome-Vivaldi/issues?q=sort%3Aupdated-desc+is%3Aissue+is%3Aopen) 报告，我会在周末~~可能~~修复它。

> 可选：可以在这里找免费的 OpenAI 兼容 API Key，用于 AI 功能：[cheahjs/free-llm-api-resources](https://github.com/cheahjs/free-llm-api-resources?tab=readme-ov-file#opencode-zen)。

## 常见问题

### ❓ OpenAI 兼容 API 是什么？

[这里有解释](https://bentoml.com/llm/llm-inference-basics/openai-compatible-api#:~:text=What%20is%20an,across%20various%20industries.)

### ❓ 我都装好了，但什么都没变

**先检查这些：**

- [ ] 在 `vivaldi://flags` 启用 **CSS Customization**
- [ ] 设置了正确的文件夹路径
  → `Settings > Appearance > Custom UI Modifications`
  → `Awesome-Vivaldi-main\Vivaldi7.9Stable`
- [ ] 已经把 [./Javascripts](../../Vivaldi7.9Stable/Javascripts/) 里的所有**内容**复制到 `<YOURVIVALDIDIRECTORY>\Application\<VERSI0N>\resources\vivaldi\`

---

### ❓ 为什么有些功能缺失？

#### 🤖 AI 功能无法使用

这些修改**不会开箱即用**。

你需要配置自己的 **OpenAI 兼容 API**
→ 编辑脚本文件开头的几行配置。

---

#### ⭐ FavouriteTabs 没显示

- 只有**前 9 个固定标签 / 标签堆叠**会变成网格。
- 所以你至少要固定一个标签，才能看到效果。
- 这个修改经常会有副作用，比如破坏标签页缩略图弹窗的位置。

---

### ❓ 我确认装对了，但还是看不到变化

这是正常的。

- 很多修改在后台运行
- 有些效果很细微，或只会在特定场景出现

👉 可以看 [修改列表](#修改列表)，确认每个修改具体做什么。

---

### ❓ 有些功能看起来被禁用了

有些修改会被刻意关掉，因为它们还有 bug 或没做完。

**手动启用：**

- CSS 修改 → [Import.css](../../Vivaldi7.9Stable/Import.css)
- JS 修改 → [window.html](../../Vivaldi7.9Stable/Javascripts/window.html)

---

### ❓ 还是不行？

- 重启 Vivaldi
- 再检查一次文件路径，这是最常见的问题
- 确认文件是真的被替换了，不是被复制到旁边
