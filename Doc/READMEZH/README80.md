

<div align="center">
    <img width="200" height="200" src="../Others/assets/IMG5682.png">
</div>

<div align="center">
    <h1>酷炫 Vivaldi</h1>
<div align="center">

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/PaRr0tBoY/Awesome-Vivaldi)
[![Vivaldi 论坛](https://img.shields.io/badge/Vivaldi-Forum-red)](https://forum.vivaldi.net/topic/112064/modpack-community-essentials-mods-collection?_=1761221602450)
![GitHub 仓库星级](https://img.shields.io/github/stars/PaRr0tBoY/Awesome-Vivaldi)

</div>
    <p>为 Vivaldi 浏览器精选的社区修改包</p>

<div align="center">

[English](../../Vivaldi8.0Stable/README.md) | **简体中文**

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

- [如何安装](#如何安装)
  - [Vivaldi 设置](#vivaldi-设置) 
  - [安装 CSS 修改](#to-install-css-修改)
  - [安装 Javascript 修改](#to-install-javascripts-修改)
- [更新](#更新)
- [开发](#开发)
- [常见问题](#faq)


## 如何安装

### Vivaldi 设置
- 进入 `vivaldi:settings/appearance/` -> `UI 自动隐藏`，勾选 `启用 UI 自动隐藏`。
- 进入 `vivaldi:settings/tabs/` -> `标签堆叠`，切换 `标签堆叠` 为 Two-Level . (不使用 `简约显示样式`)
- 进入 `vivaldi:settings/tabs/` -> `新标签页位置`，切换为 `作为相关标签相一行堆叠`。
- 进入 `vivaldi:settings/qc/` -> `快速命令选项`，勾选 `在新标签页打开链接`。

### 安装 CSS 修改

1. 打开 url `vivaldi://flags/#vivaldi-css-mods`
2. 激活旗标，按照提示重启浏览器
3. 打开设置中的主题部分
4. 在 "自定义 UI 修改" 中选择你想使用的文件夹
5. 在这个修改包中，我们使用 `Import.css` 作为 CSS 修改管理器。
6. 选择 `Import.css` 所在文件夹作为 CSS 文件夹进行安装。
7. 重启 Vivaldi 以看到效果

重要说明：
CSS 文件不能包含文字空格或它们将无法工作。目录/路径中的空格可能可以工作，但避免使用就更稳妥。

另外，确保文件确实具有 .css 扩展名 - 在 Windows 上确保文件名扩展名可见

7.7+ 用户的重要说明！
所有实验现在都位于 vivaldi://flags/
要启用 CSS 修改，使用搜索框输入 "vivaldi-" 或直接去
chrome://flags/#vivaldi-css-mods 并设置为启用。

### 安装 Javascript 修改

#### 自动安装

1. 如果你是 windows 用户，使用 [Vivaldi 修改管理器](https://github.com/eximido/vivaldimodmanager)
2. 如果你是 linux 用户，查看 [Vivaldi-Autoinject-Custom-js-ui](https://aur.archlinux.org/vivaldi-autoinject-custom-js-ui.git) 获取更多信息
3. anche参考 [使用批处理脚本修改 Vivaldi](https://forum.vivaldi.net/topic/10592/patching-vivaldi-with-batch-scripts/21?page=2) 所有平台
4. 如果你是 macOS 用户，参考 [macOS_Patch_Scripts | upviv](https://github.com/PaRr0tBoY/Vivaldi-Mods/blob/8a1e9f8a63f195f67f27ab2e5b86c4aff0081096/MacOSPatchScripts/upviv) 作为脚本修改的参考

#### 手动安装

只有一个 Vivaldi 文件你需要修改。这个文件是叫 `window.html`，位于：

`<YOURVIVALDIDIRECTORY>\Application\<VERSION>\resources\vivaldi`

⚠ 在修改之前你应该备份它。特别是 `window.html`。如果配置错误你的浏览器可能会失误。

要安装，只需复制所有内容到 `<YOURVIVALDIDIRECTORY>`\Application\<VERSI0N>\resources\vivaldi\下面

##### 它做什么？

1. 所有 JavaScript 修改被复制到 `<YOURVIVALDIDIRECTORY>`\Application\<VERSI0N>\resources\vivaldi.
2. 同一文件夹中，`window.html` 被修改，它将 JavaScript 修改注入浏览器。
3. 重启以看到效果
4. 你可以在 vivaldi:inspect/#apps 验证安装
 a. 在 `window.HTML` 上点击蓝色检查按钮，打开控制台窗口
 b. 查看元素标签。如果你看到 JS 修改列表。它们已经安装。
`Modified window.html` 看起来像这样。

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

3. 就是这样！重启浏览器以看到效果。如果有其他问题，请在 [Issues · PaRr0tBoY/Awesome-Vivaldi](https://github.com/PaRr0tBoY/Awesome-Vivaldi/issues?q=sort%3Aupdated-desc+is%3Aissue+is%3Aopen) 报告，我会尽量修复。

> 可选地，获取一个免费的 OpenAI 兼容 API 密钥用于 AI 功能 [cheahjs/free-llm-api-resources](https://github.com/cheahjs/free-llm-api-resources?tab=readme-ov-file#opencode-zen).

### 主题面板

`ModConfig.js` 向 Vivaldi 的主题设置页面添加了 Acid Arc 部分。使用它的方法：

1. 同时安装 `ModConfig.js` 和其他 JavaScript 修改，重启 Vivaldi。
2. 打开 `vivaldi:settings/appearance/`.
3. 找到 Acid Arc 设置部分。
4. 使用 **AI 配置** 为共享的 OpenAI 兼容端点，API 密钥，模型和每个修改的重写进行配置。
5. 使用 **Arc Peek** 配置 Peek 触发器：
   - `点击修饰符`：普通左键点击 Peek 打开的修饰符键。
   - `长按按钮`：在按住后打开 Peek 的鼠标按钮。
   - `保持时间` / `延迟`：按住时间以毫秒为单位。
   - `自动打开列表`：`pin` 为锚定标签，或域模式如 `*.google.com`。
   - `前景模式`：空层样式。
   - `缩放背景`：Peek 开启时是否隐藏底层页面。
6. 使用 **快速捕获** 和 **自动隐藏面板** 进行匹配行为设置。
7. 修改后点击 **保存**。使用 **导入** / **导出** 在配置之间转移。

配置存储在浏览器的本地 Origin 私有文件系统下的 `.askonpage/config.json`，支持的修改会自动重新加载保存的值。

## 更新

如果你之前已经安装了这个修改包，你可以通过克隆仓库并重新运行安装来更新到最新版本：

```bash
# 克隆或拉取最新更改
git clone https://github.com/PaRr0tBoY/Awesome-Vivaldi.git
# 如果你已经克隆过：
cd path/to/Awesome-Vivaldi
git pull

# 重新安装 CSS 修改
# 将 Vivaldi8.0Stable/ 文件夹的内容复制到你的 Vivaldi CSS 修改文件夹

# 重新安装 JavaScript 修改
# 将 Vivaldi8.0Stable/Javascripts/ 文件夹的内容复制到你的 Vivaldi 资源文件夹
# 然后用窗口.html 中的任何新脚本引用更新 window.html
```

## 开发

### 架构概述

- **CSS 修改**：通过 `@import` 在 `Import.css` 中引用。将新的 CSS 文件放在 `CSS/` 文件夹，并在 `Import.css` 中添加导入语句。
- **JavaScript 修改**：通过 `<script>` 标签在 `window.html` 中引用。将新的 JS 文件放在 `Javascripts/` 文件夹，并在 `window.html` 中添加脚本引用。

### 文件元数据

每个文件应该在顶部包含元数据以描述其用途、作者和使用方法：

#### CSS 文件（用户样式格式）

```css
/* ==UserStyle==
 * @name         你的修改名称
 * @description  简要描述该修改的功能
 * @version      YYYY.MM.DD
 * @author       你的名字
 * @website      https://github.com/PaRr0tBoY/Awesome-Vivaldi
 * ==/UserStyle==
 */
```

#### JavaScript 文件（用户脚本格式）

```javascript
// ==UserScript==
// @name         你的修改
// @description  简要描述该修改的功能
// @version      YYYY.MM.DD
// @author       你的名字
// ==/UserScript==
```

### 检查 Vivaldi UI

使用 `vivaldi:inspect/#apps` 检查 Vivaldi 的 UI 元素。点击 `window.html` 的蓝色 **检查** 按钮以打开浏览器内核的 DevTools。[Vivaldi UI 检查教程](https://forum.vivaldi.net/post/135732) 详细介绍了这一��。

### CSS 陷阱

- **CSS 变量可能在版本之间破坏**：始终使用 DevTools 的计算样式进行验证。硬编码 `px` 值比依赖 `var()` 后退更安全。
- **CSS 锚定定位不可靠**：Vivaldi 支持不完整。使用 `left: 50%; transform: translateX(-50%)` 而不是 `anchor-center`。
- **`:has()` 使后代选择增强**：当后代 DOM 元素需要样式化之前的元素（在 Vivaldi 的 DOM 顺序中常见）时，在共同父级上使用 `:has()`。
- **Vivaldi 通过 JS 设置内联样式**：使用 `position: fixed !important` 或 `!important` 重写来逃离内联 `top`/`left` 计算。

### JavaScript 陷阱

- **window.html 脚本类似 MV3**：`chrome.scripting.executeScript` 有效，但 `chrome.tabs.executeScript` 无效。
- **MutationObserver 需要持久锚点**：工作区切换会重新构建 `.tab-strip`。将观察者附着到 `#browser`（安全锚点）上，并在堆叠重建时重新绑定内部观察者。
- **在注入前验证 URL**：`chrome.tabs.executeScript` 在 `chrome://` / `vivaldi://` 页面上会抛出错误。始终先检查 `tab.url`。

### 资源

要了解 Vivaldi 的内部 API 并为修改包做出贡献，请查看：

- **[PrettyBundle.js](../Others/UsefulResources/Source/source/pretty-bundle.js)** 和 **[common.css](../Others/UsefulResources/Source/source/common.css)** — Vivaldi 的核心捆绑文件，揭示内部 API
- **[Doc/](../Doc/)** — 有关 Vivaldi JavaScript 修改 API 的文档
- **Vivaldi 浏览器源代码**：https://github.com/ric2b/Vivaldi-browser
- **DeepWiki (Vivaldi 源代码)**：https://deepwiki.com/ric2b/Vivaldi-browser
- **Lonm 的 Vivaldi 修改者 API 参考**：https://lonmcgregor.github.io/VivaldiModdersAPI/OfficialApi/everything.html

### Vivaldi CSS 变量

Vivaldi 暴露了用户主题感知的 CSS 自定义属性在 `#browser` 上。这些属性跟随用户的活动主题 — 值会随着主题改变，因此仅通过 `var()` 名称引用。

| 分类                             | 关键变量                                                                                                                                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **背景**                 | `--colorBg`, `--colorBgAlpha`, `--colorBgDark`/`--colorBgDarker`, `--colorBgLight`/`--colorBgLighter`, `--colorBgIntense`/`--colorBgIntenser`, `--colorBgInverse`, `--colorBgFaded` |
| **前景**                 | `--colorFg`, `--colorFgIntense`, `--colorFgFaded`/`--colorFgFadedMore`/`--colorFgFadedMost`                                                                                                   |
| **突出显示** (主次调色)     | `--colorHighlightBg`, `--colorHighlightFg`, `--colorHighlightBgDark`, `--colorHighlightBgAlpha`                                                                                                 |
| **辅助颜色** (次次级)       | `--colorAccentBg`, `--colorAccentFg`, `--colorAccentBorder`, `--colorAccentBgDark`/`--colorAccentBgDarker`                                                                                    |
| **边框**                     | `--colorBorder`, `--colorBorderSubtle`, `--colorBorderIntense`, `--colorBorderDisabled`                                                                                                         |
| **语义**                   | `--colorSuccessBg`/`Fg`, `--colorWarningBg`/`Fg`, `--colorErrorBg`/`Fg`                                                                                                                     |
| **半径**                     | `--radius`, `--radiusHalf`, `--radiusCap`, `--radiusRound`, `--radiusRounded`                                                                                                                 |
| **其他**                      | `--colorTabBar`, `--densityGap`, `--scrollbarWidth`, `--monospaceFont`, `--sansSerifFont`, `--uiZoomLevel`                                                                                  |
---

## 常见问题

### ❓ 什么是 OpenAI 兼容的 API？

[这里详细说明](https://bentoml.com/llm/llm-inference-basics/openai-compatible-api#:~:text=What%20is%20an,across%20various%20industries.)

### ❓ 我安装了所有内容，但没有变化

**先检查这些：**
- [ ] 启用 **CSS 自定义** 在 `vivaldi://flags`
- [ ] 设置正确的文件夹路径  
  → `设置 > 主题 > 自定义 UI 修改`  
  → `Awesome-Vivaldi-main\Vivaldi8.0Stable`
- [ ] 复制了 [./Javascripts](./Javascripts/) 下的**所有内容**到你的 `<YOURVIVALDIDIRECTORY>\Application\<VERSI0N>\resources\vivaldi\`

---

### ❓ 有些功能缺失

#### 🤖 AI 功能不工作
这些修改 **默认情况下不工作**。

你必须配置自己的 **OpenAI 兼容 API**  
→ 编辑脚本文件中的前几行。

---

#### ⭐ FavouriteTabs 不显示
- 仅将 **前 9 个锚定标签 / 标签堆栈** 转换为网格。
- 这意味着你需要至少锚定一个标签��能看到��果���
- 此修改经常导致副作用，例如破坏标签弹出图标的位置。

---

### ❓ 我正确安装了却仍没有看到变化

这是正常的。

- 许多修改在 **后台运行**
- 效果可能微妙或只在特定情况下出现

👉 检查 [修改列表](#修改列表) 了解每个修改的作用

---

### ❓ 某些功能似乎禁用

一些修改是故意关闭的（故障 / 未完成）

**手动启用它们：**
- CSS 修改 → [Import.css](./Import.css)
- JS 修改 → [window.html](./Javascripts/window.html)

---

### ❓ 仍然不工作？

- 重启 Vivaldi
- 再次检查文件路径（最常见问题）
- 确保文件确实被替换（而不是并列复制）

```
