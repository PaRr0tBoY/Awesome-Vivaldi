<!-- source-commit: e7697d46592f870540ab19416010aefd111555ea -->


<div align="center">
    <img width="200" height="200" src="../Others/assets/IMG5682.png">
</div>

<div align="center">
    <h1>Awesome Vivaldi</h1>
<div align="center">

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/PaRr0tBoY/Awesome-Vivaldi)
[![Vivaldi Forum](https://img.shields.io/badge/Vivaldi-Forum-red)](https://forum.vivaldi.net/topic/112064/modpack-community-essentials-mods-collection?_=1761221602450)
![GitHub Repo stars](https://img.shields.io/github/stars/PaRr0tBoY/Awesome-Vivaldi)

</div>
    <p>为 Vivaldi 浏览器的精选社区扩展包</p>

<div align="center">

**English** | [简体中文](../Doc/READMEZH/README80.md)

</div>

<!-- <img src="" width="32%" alt="主页" />
<img src="" width="32%" alt="主页" />
<img src="" width="32%" alt="主页" />
<br/>
<img src="" width="96%" alt="主页" />
<br/> -->

</div>

<br/>

## 目录

- [How to install](#how-to-install)
  - [Vivaldi Settings](#vivaldi-settings) 
  - [CSS Mods](#to-install-css-mods)
  - [Javascripts Mods](#to-install-javascripts-mods)
- [Update](#update)
- [Development](#development)
- [Frequently Asked Questions](#faq)


## 安装指南

### Vivaldi 设置
- 进入 `vivaldi:settings/appearance/` -> `UI 自动隐藏`, 打开 `启用 UI 自动隐藏`。
- 进入 `vivaldi:settings/tabs/` -> `标签堆叠`, 切换 `标签堆叠` 为两层堆叠。（不要选择 `使用紧凑显示模式`）
- 进入 `vivaldi:settings/tabs/` -> `新标签位置`, 切换为 `与相关标签栈好好显示`。
- 进入 `vivaldi:settings/qc/` -> `快捷命令选项`, 打开 `在新标签打开链接`。

### 安装 CSS 扩展

1. 打开网址 `vivaldi://flags/#vivaldi-css-mods`
2. 启用标志，按提示重启浏览器
3. 打开设置中的外观板块
4. 在 "自定义 UI 修改" 部分选择你想使用的文件夹
5. 在这个扩展包中，我们使用 `Import.css` 作为 CSS 修改管理器。
6. 选择 `Import.css` 所在的文件夹作为 CSS 文件夹进行安装
7. 重启 Vivaldi 以看到效果

重要提示：
CSS 文件不能有空格在文件名中，否则无法工作。目录/路径名中的空格可以工作但最好避免以防万一。

此外，确保文件确实有 .css 扩展名 - 如果你在 Windows 上，确保显示文件名扩展名

对于 7.7+ 用户！
所有实验现在位于 vivaldi://flags/
要启用 CSS 扩展，使用搜索框输入 "vivaldi-" 或去 https://chrome.ff.txt/#vivaldi-css-mods 设置为已启用。

### 安装 JavaScript 扩展

#### 自动安装

1. 如果你在 Windows 上，使用 [Vivaldi Mod Manager](https://github.com/eximido/vivaldimodmanager)
2. 如果你在 Linux 上，参考 [Vivaldi-Autoinject-Custom-js-ui](https://aur.archlinux.org/vivaldi-autoinject-custom-js-ui.git) 获取更多信息
3. 参见 [Patching Vivaldi with batch scripts](https://forum.vivaldi.net/topic/10592/patching-vivaldi-with-batch-scripts/21?page=2) 所有系统
4. 如果你在 macOS 上，使用 [macOS_Patch_Scripts | upviv](https://github.com/PaRr0tBoY/Vivaldi-Mods/blob/8a1e9f8a63f195f67f27ab2e5b86c4aff0081096/MacOSPatchScripts/upviv) 作为安装脚本的参考

#### 手动安装

你应该永远只修改 Vivaldi 中一个文件。这个文件名为 window.html，位于：

<YOURVIVALDIDIRECTORY>\Application\<版本>\resources\vivaldi

⚠ 在修改之前备份它。
==尤其是 window.html。如果配置错误您的浏览器可能崩溃。==

安装方法：将 ./Javascripts/ 下的所有内容复制到你的 `<YOURVIVALDIDIRECTORY>`\Application\<VERSI0N>\resources\vivaldi\

##### 它做了什么？

1. 所有 JavaScript 扩展被复制到 `<YOURVIVALDIDIRECTORY>`\Application\<VERSI0N>\resources\vivaldi。
2. 同一文件夹中，window.html 被修改，以在浏览器中注入 JavaScript 扩展。
3. 重启即可看到效果
4. 你可以通过 src="TidyTitles.js" 确认安装
 a. 点击窗口.HTML 的蓝色检查按钮，打开控制台窗口
 b. 检查元素标签。如果看到 JS 扩展列表就安装成功

`修改后的 window.html` 看起来如下。

```html
<!-- Vivaldi 窗口文档 -->
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
    <script src="AskOnPage.js"></script>
    <script src="TabScroll.js"></script>
    <script src="MonochromeIcons.js"></script>
    <script src="VividAddress.js"></script>
    <script src="QuickCapture.js"></script>
    <script src="GlobalMediaControls.js"></script>
    <script src="EasyFiles.js"></script>
    <script src="ModConfig.js"></script>
    <script src="VividPeek.js"></script>
  </body>
</html>
```

3. 这就是全部！重启浏览器以看到效果。如果遇到任何问题，请在 [Issues · PaRr0tBoY/Awesome-Vivaldi](https://github.com/PaRr0tBoY/Awesome-Vivaldi/issues?q=sort%3Aupdated-desc+is%3Aissue+is%3Aopen) 举报，我会~~可能~~在周末修复。

> 可选地，为 AI 功能获取一个免费兼容 OpenAI 的 API 密钥在这里 [cheahjs/free-llm-api-resources](https://github.com/cheahjs/free-llm-api-resources?tab=readme-ov-file#opencode-zen)。

### 设置面板

`ModConfig.js` 向 Vivaldi 的外观设置页面添加了 Awesome Vivaldi 选项。使用它：

1. 同时安装 `ModConfig.js` 和其他 JavaScript 扩展，并重启 Vivaldi。
2. 打开 `vivaldi:settings/appearance/`。
3. 找到 Awesome Vivaldi 设置部分。
4. 使用 **AI 配置** 设置共享的兼容 OpenAI 的端点、API 密钥、模型和每个扩展的个性化设置。
5. 使用 **Arc Peek** 配置 Peek 触发器：
   - `点击修饰键`: 普通左键点击 Peek 的修饰键
   - `长按按钮`: 长按后打开 Peek 的鼠标按钮
   - `持续时间` / `延迟`: 毫秒数的长按时长
   - `自动打开列表`: `pin` 表示书签标签，或域模式如 `*.google.com`
   - `前台模式`: 空白层样式
   - `缩放背景`: Peek 开启时是否隐藏原始页面
6. 使用 **快捷截图** 和 **自动隐藏面板** 进行相应的设置。
7. 修改后点击 **保存**。使用 **导入** / **导出** 在个人资料之间移动同配置。

设置存储在浏览器的本地原始私有文件系统中，位于 `.askonpage/config.json`，支持扩展会自动重新加载保存的值。

## 更新

如果你之前安装过这个扩展包，可以通过克隆仓库并重新运行安装来更新到最新版本：

```bash
# 克隆或拉取最新更改
git clone https://github.com/PaRr0tBoY/Awesome-Vivaldi.git
# 如果你已经克隆过：
cd 路径/to/Awesome-Vivaldi
git pull

# 再次安装 CSS 扩展
# 将 Vivaldi8.0Stable 文件夹的内容复制到你的 Vivaldi CSS 扩展文件夹

# 再次安装 JavaScript 扩展
# 将 Vivaldi8.0Stable/Javascripts 文件夹的内容复制到你的 Vivaldi 资源文件夹
# 然后用任何新的脚本引用更新 window.html
```

## 开发

### 架构概述

- **CSS 扩展**: 通过 `@import` 在 `Import.css` 中引用。将新的 CSS 文件放在 `CSS/` 文件夹，并在 `Import.css` 添加导入语句。
- **JavaScript 扩展**: 在 `window.html` 中通过 `<script>` 标签引用。将新的 JS 文件放在 `Javascripts/` 文件夹内，并在 `window.html` 添加脚本引用。

### 文件元数据

每个文件应在文件顶部包含元数据以描述其用途、作者和使用方式：

#### CSS 文件（用户样式格式）

```css
/* ==UserStyle==
 * @name         你的扩展名
 * @description  简短描述该扩展的功能
 * @version      YYYY.MM.DD
 * @author       你的名字
 * @website      https://github.com/PaRr0tBoY/Awesome-Vivaldi
 * ==/UserStyle==
 */
```

#### JavaScript 文件（用户脚本格式）

```javascript
// ==UserScript==
// @name         你的扩展
// @description  简短描述该扩展的功能
// @version      YYYY.MM.DD
// @author       你的名字
// ==/UserScript==
```

### 检查 Vivaldi UI

使用 `vivaldi:inspect/#apps` 检查 Vivaldi 的内部 UI 元素。点击窗口.HTML 的蓝色 **检查** 按钮以打开 DevTools 进行浏览器栏目。[Vivaldi UI Inspect Tutorial](https://forum.vivaldi.net/post/135732) 详细说明了这一点。

### CSS 陷阱

- **CSS 变量可能在版本之间破坏**：始终通过 DevTools 的计算样式进行验证。固定 `px` 值比依赖 `var()` 更安全。
- **CSS 锚定位不稳定**：Vivaldi 支持不完整。使用 `left: 50%; transform: translateX(-50%)` 而不是 `anchor-center`。
- **`:has()` 可向后选择**：当后续 DOM 元素需要样式 early 元素时（常见于 Vivaldi 的 DOM 顺序），在公共祖先使用 `:has()`。
- **Vivaldi 通过 JS 设置内联样式**：使用 `position: fixed !important` 或 `!important` 覆盖来逃离内联 `top`/`left` 计算。

### JavaScript 陷阱

- **window.html 脚本像 MV3 类**：`chrome.scripting.executeScript` 有效，但 `chrome.tabs.executeScript` 无效。
- **MutationObserver 需持久锚点**：工作区切换会重建 `.tab-strip`。将观察者附加到 `#browser`（安全锚点）并重新绑定内部观察者当剪带重建时。
- **在注入前验证 URL**：`chrome.tabs.executeScript` 在 `chrome://` / `vivaldi://` 页面上会抛出错误。始终检查 `tab.url` 先。

### 资源

要了解 Vivaldi 的内部 API 以贡献扩展包，查看：

- **[PrettyBundle.js](../Others/UsefulResources/Source/source/pretty-bundle.js)** 和 **[common.css](../Others/UsefulResources/Source/source/common.css)** — Vivaldi 的核心捆绑文件揭示内部 API
- **[Docs](https://parr0tboy.github.io/docs/)** — Vivaldi JavaScript 扩展 API 的文档网站
- **Vivaldi 浏览器源代码**：https://github.com/ric2b/Vivaldi-browser
- **DeepWiki (Vivaldi 源代码)**：https://deepwiki.com/ric2b/Vivaldi-browser
- **Lonm 的 Vivaldi 扩展 API 参考**：https://lonmcgregor.github.io/VivaldiModdersAPI/OfficialApi/everything.html

### Vivaldi CSS 变量

Vivaldi 暴露用户主题感知的 CSS 自定义属性在 `#browser` 上。这些属性跟随用户的活动主题 — 值在主题更改时变化，只通过 `var()` 名称引用。

| 类别                             | 关键变量                                                                                                                                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **背景**                 | `--colorBg`, `--colorBgAlpha`, `--colorBgDark`/`--colorBgDarker`, `--colorBgLight`/`--colorBgLighter`, `--colorBgIntense`/`--colorBgIntenser`, `--colorBgInverse`, `--colorBgFaded` |
| **前景**                 | `--colorFg`, `--colorFgIntense`, `--colorFgFaded`/`--colorFgFadedMore`/`--colorFgFadedMost`                                                                                                   |
| **强调** (主次色)         | `--colorHighlightBg`, `--colorHighlightFg`, `--colorHighlightBgDark`, `--colorHighlightBgAlpha`                                                                                                 |
| **辅助** (次色)           | `--colorAccentBg`, `--colorAccentFg`, `--colorAccentBorder`, `--colorAccentBgDark`/`--colorAccentBgDarker`                                                                                    |
| **边框**                     | `--colorBorder`, `--colorBorderSubtle`, `--colorBorderIntense`, `--colorBorderDisabled`                                                                                                         |
| **语义**                   | `--colorSuccessBg`/`Fg`, `--colorWarningBg`/`Fg`, `--colorErrorBg`/`Fg`                                                                                                                     |
| **半径**                     | `--radius`, `--radiusHalf`, `--radiusCap`, `--radiusRound`, `--radiusRounded`                                                                                                                 |
| **其他**                   | `--colorTabBar`, `--densityGap`, `--scrollbarWidth`, `--monospaceFont`, `--sansSerifFont`, `--uiZoomLevel`                                                                                  |
---

## 常见问题

### ❓ 什么是兼容 OpenAI 的 API？

[See the explanation here](https://bentoml.com/llm/llm-inference-basics/openai-compatible-api#:~:text=What%20is%20an,across%20various%20industries.)

### ❓ 安装所有内容后没有变化

**首先检查以下内容：**
- [ ] 在 `vivaldi://flags` 中启用 **CSS 自定义**
- [ ] 设置正确的文件夹路径  
  → `设置 > 外观 > 自定义 UI 修改`  
  → `Awesome-Vivaldi-main\Vivaldi8.0Stable`
- [ ] 复制了 [./Javascripts](./Javascripts/) 下的**所有内容**到你的 `<YOURVIVALDIDIRECTORY>\Application\<VERSI0N>\resources\vivaldi\`

---

### ❓ 为什么一些功能缺失？

#### 🤖 AI 功能没有工作
这些扩展 **默认不工作**。

你必须配置自己的 **兼容 OpenAI 的 API**  
→ 在脚本文件的前几行编辑。

---

#### ⭐ FavouriteTabs 没有显示
- 只将**前 9 个书签标签/标签堆**转换为网格。
- 这意味着你需要先打开至少一条书签标签才能看到效果。
- 这个扩展经常会有副作用，例如破坏标签弹出栏图标的位置。

---

### ❓ 我正确安装了但仍不显示变化

这是正常的。

- 许多扩展在**后台运行**
- 效果可能是微妙的或仅在特定情况下出现

👉 查看 [Mod List](#mod-list) 了解每个扩展的功能

---

### ❓ 有些功能似乎被禁用

一些扩展被有意禁用（破损/未完成）

**手动启用它们：**
- CSS 扩展 → [Import.css](./Import.css)
- JS 扩展 → [window.html](./Javascripts/window.html)

---

### ❓ 仍然不工作？

- 重启 Vivaldi
- 双重检查文件路径（最常见问题）
- 确保文件实际被替换（未仅复制旁边）

```
