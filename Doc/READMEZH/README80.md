<!-- source-commit: 2fde65ddc6e930b6452ab57678317d35ce834fc5 -->
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
    <p>为 Vivaldi 浏览器精心整理的社区修改合集</p>

<div align="center">

**English** | [简体中文](../Doc/READMEZH/README80.md)

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

- [How to install](#how-to-install)
  - [Vivaldi Settings](#vivaldi-settings) 
  - [CSS Mods](#to-install-css-mods)
  - [Javascripts Mods](#to-install-javascripts-mods)
- [Update](#update)
- [Development](#development)
- [Frequently Asked Questions](#faq)


## 如何安装

### Vivaldi 设置
- 前往 `vivaldi:settings/appearance/` -> `UI 自动隐藏`，开启 `启用 UI 自动隐藏`。
- 前往 `vivaldi:settings/tabs/` -> `标签堆叠`，将 `标签堆叠` 切换为两级式。（不要 `使用紧凑显示样式`）
- 前往 `vivaldi:settings/tabs/` -> `新标签位置`，切换为 `与相关标签组成标签堆叠`。
- 前往 `vivaldi:settings/qc/` -> `快速命令选项`，开启 `在新标签中打开链接`。

### 安装 CSS 修改

1. 打开网址 `vivaldi://flags/#vivaldi-css-mods`
2. 启用该实验特性，按提示重启浏览器
3. 打开设置中的外观部分
4. 在“自定义 UI 修改”下选择你想使用的文件夹
5. 在本修改合集中，我们使用 `Import.css` 作为 CSS 修改管理器。
6. 选择 `Import.css` 所在的文件夹作为 CSS 文件夹进行安装。
7. 重启 Vivaldi 以查看效果

重要：
CSS 文件名中不能包含空格，否则将无法生效。目录/路径名称中的空格通常可以工作，但为避免意外请尽量避免。

此外，请确保文件确实具有 .css 扩展名——如果你使用的是 Windows，请务必设置显示文件扩展名。

7.7+ 用户的重要提示！
所有实验特性现在都位于 vivaldi://flags/ 下
要启用 CSS 修改，请使用搜索框输入“vivaldi-”，或前往
chrome://flags/#vivaldi-css-mods 并设置为已启用。

### 安装 JavaScript 修改

#### 自动安装

1. 如果你使用的是 Windows，请使用 [Vivaldi Mod Manager](https://github.com/eximido/vivaldimodmanager)
2. 如果你使用的是 Linux，请参阅 [Vivaldi-Autoinject-Custom-js-ui](https://aur.archlinux.org/vivaldi-autoinject-custom-js-ui.git) 了解更多信息
3. 所有平台亦可参见 [Patching Vivaldi with batch scripts](https://forum.vivaldi.net/topic/10592/patching-vivaldi-with-batch-scripts/21?page=2)
4. 如果你使用的是 macOS，请参考 [macOS_Patch_Scripts | upviv](https://github.com/PaRr0tBoY/Vivaldi-Mods/blob/8a1e9f8a63f195f67f27ab2e5b86c4aff0081096/MacOSPatchScripts/upviv) 中的补丁脚本

#### 手动安装

在 Vivaldi 中你只需要修改一个文件。该文件名为 window.html，位于：

<YOURVIVALDIDIRECTORY>\Application\<VERSION>\resources\vivaldi

⚠ 在改动之前你应该先备份它。
==尤其是 window.html。如果配置错误，你的浏览器可能会崩溃。==

要安装，只需将 ./Javascripts/ 下的所有内容复制到你的 `<YOURVIVALDIDIRECTORY>`\Application\<VERSI0N>\resources\vivaldi\

##### 它做了什么？

1. 所有 JavaScript 修改会被复制到 `<YOURVIVALDIDIRECTORY>`\Application\<VERSI0N>\resources\vivaldi。
2. 在同一文件夹下，window.html 已被修改，将 JavaScript 修改注入到你的浏览器中。
3. 重启以查看效果
4. 你可以在 vivaldi:inspect/#apps 确认安装情况。
 a. 点击 window.HTML 的蓝色检查按钮并打开控制台窗口
 b. 检查元素标签页。如果你看到了 js 修改列表，说明已安装。
`修改后的 window.html` 如下所示。

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
    <script src="Diabar.js"></script>
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

3. 就是这样！重启浏览器以查看效果。如果有任何其他问题，请在 [Issues · PaRr0tBoY/Awesome-Vivaldi](https://github.com/PaRr0tBoY/Awesome-Vivaldi/issues?q=sort%3Aupdated-desc+is%3Aissue+is%3Aopen) 反馈，我会 ~~大概~~ 在周末修复。

> 或者，可在此处获取免费的 OpenAI 兼容 API 密钥以使用 AI 功能 [cheahjs/free-llm-api-resources](https://github.com/cheahjs/free-llm-api-resources?tab=readme-ov-file#opencode-zen)。

### 设置面板

`ModConfig.js` 会在 Vivaldi 的外观设置页面中添加一个 Awesome Vivaldi 分区。使用方法：

1. 将 `ModConfig.js` 与其他 JavaScript 修改一起安装，并重启 Vivaldi。
2. 打开 `vivaldi:settings/appearance/`。
3. 找到 Awesome Vivaldi 设置分区。
4. 使用 **AI Config** 配置共享的 OpenAI 兼容端点、API 密钥、模型以及各修改的覆盖项。
5. 使用 **Arc Peek** 配置 Peek 触发器：
   - `Click Modifiers`：普通左键点击打开 Peek 的修饰键。
   - `Long Press Buttons`：长按后打开 Peek 的鼠标按键。
   - `Hold Time` / `Hold Delay`：长按计时（毫秒）。
   - `Auto Open List`：固定标签填 `pin`，或域名模式如 `*.google.com`。
   - `Foreground Mode`：空白加载层样式。
   - `Scale Background`：Peek 打开时底层页面是否下沉。
6. 使用 **Quick Capture** 和 **Auto Hide Panel** 配置其对应的行为设置。
7. 更改设置后点击 **保存**。使用 **导入** / **导出** 在配置文件间迁移相同配置。

设置存储在浏览器的本地源私有文件系统（Origin Private File System）下的 `.askonpage/config.json` 中，受支持的修改会自动重新加载已保存的值。

## 更新

如果你之前已安装此修改合集，可以通过克隆仓库并重新运行安装来更新到最新版本：

```bash
# 克隆或拉取最新更改
git clone https://github.com/PaRr0tBoY/Awesome-Vivaldi.git
# 或者如果你已经克隆过：
cd path/to/Awesome-Vivaldi
git pull

# 重新安装 CSS 修改
# 将 Vivaldi8.0Stable/ 的内容复制到你的 Vivaldi CSS 修改文件夹

# 重新安装 JavaScript 修改
# 将 Vivaldi8.0Stable/Javascripts/ 的内容复制到你的 Vivaldi 资源目录
# 然后更新 window.html 以加入任何新的脚本引用
```

## 开发

### 架构概览

- **CSS 修改**：通过 `Import.css` 中的 `@import` 引用。将新的 CSS 文件放入 `CSS/` 文件夹，并在 `Import.css` 中添加 import 语句。
- **JavaScript 修改**：通过 `window.html` 中的 `<script>` 标签引用。将新的 JS 文件放入 `Javascripts/` 文件夹，并在 `window.html` 中添加脚本引用。

### 文件元数据

每个文件应在顶部包含元数据，以说明其用途、作者和使用方式：

#### CSS 文件（UserStyle 格式）

```css
/* ==UserStyle==
 * @name         Your Mod Name
 * @description  Brief description of what this mod does
 * @version      YYYY.MM.DD
 * @author       Your Name
 * @website      https://github.com/PaRr0tBoY/Awesome-Vivaldi
 * ==/UserStyle==
 */
```

#### JavaScript 文件（UserScript 格式）

```javascript
// ==UserScript==
// @name         YourMod
// @description  Brief description of what this mod does
// @version      YYYY.MM.DD
// @author       Your Name
// ==/UserScript==
```

### 检查 Vivaldi UI

使用 `vivaldi:inspect/#apps` 检查 Vivaldi 自身的 UI 元素。点击 `window.html` 的蓝色 **检查** 按钮，为浏览器外壳打开 DevTools。[Vivaldi UI Inspect Tutorial](https://forum.vivaldi.net/post/135732) 对此有详细说明。

### CSS 注意事项

- **CSS 变量可能跨版本失效**：始终在 DevTools 的 Computed Styles 中验证。硬编码的 `px` 值比依赖 `var()` 回退更安全。
- **CSS 锚点定位不可靠**：Vivaldi 支持不完整。请使用 `left: 50%; transform: translateX(-50%)` 代替 `anchor-center`。
- **`:has()` 支持反向选择**：当后面的 DOM 元素需要为前面的元素设置样式时（在 Vivaldi 的 DOM 顺序中很常见），可在公共父级上使用 `:has()`。
- **Vivaldi 通过 JS 设置内联样式**：使用 `position: fixed !important` 或 `!important` 覆盖来摆脱内联的 `top`/`left` 计算。

### JavaScript 注意事项

- **window.html 脚本类似 MV3**：`chrome.scripting.executeScript` 可用，但 `chrome.tabs.executeScript` 不可用。
- **MutationObserver 需要持久锚点**：工作区切换会重建 `.tab-strip`。将观察者挂载到 `#browser`（安全锚点），并在标签条重建时重新绑定内部观察者。
- **注入前验证 URL**：`chrome.tabs.executeScript` 在 `chrome://` / `vivaldi://` 页面上会报错。务必先检查 `tab.url`。

### 资源

要了解 Vivaldi 的内部 API 并为修改合集做贡献，请查看：

- **[PrettyBundle.js](../Others/UsefulResources/Source/source/pretty-bundle.js)** 和 **[common.css](../Others/UsefulResources/Source/source/common.css)** — 揭示内部 API 的 Vivaldi 核心打包文件
- **[Docs](https://parr0tboy.github.io/docs/)** — Vivaldi JavaScript 修改 API 文档门户
- **Vivaldi 浏览器源码**：https://github.com/ric2b/Vivaldi-browser
- **DeepWiki（Vivaldi 源码）**：https://deepwiki.com/ric2b/Vivaldi-browser
- **Lonm 的 Vivaldi 修改者 API 参考**：https://lonmcgregor.github.io/VivaldiModdersAPI/OfficialApi/everything.html

### Vivaldi CSS 变量

Vivaldi 在 `#browser` 上暴露了主题感知的 CSS 自定义属性。这些值跟随用户当前主题变化，因此只能通过 `var()` 名称引用。

| Category                             | Key variables                                                                                                                                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **背景**                 | `--colorBg`, `--colorBgAlpha`, `--colorBgDark`/`--colorBgDarker`, `--colorBgLight`/`--colorBgLighter`, `--colorBgIntense`/`--colorBgIntenser`, `--colorBgInverse`, `--colorBgFaded` |
| **前景**                 | `--colorFg`, `--colorFgIntense`, `--colorFgFaded`/`--colorFgFadedMore`/`--colorFgFadedMost`                                                                                                   |
| **高亮**（主强调色） | `--colorHighlightBg`, `--colorHighlightFg`, `--colorHighlightBgDark`, `--colorHighlightBgAlpha`                                                                                                 |
| **强调**（次强调色）         | `--colorAccentBg`, `--colorAccentFg`, `--colorAccentBorder`, `--colorAccentBgDark`/`--colorAccentBgDarker`                                                                                    |
| **边框**                     | `--colorBorder`, `--colorBorderSubtle`, `--colorBorderIntense`, `--colorBorderDisabled`                                                                                                         |
| **语义色**                   | `--colorSuccessBg`/`Fg`, `--colorWarningBg`/`Fg`, `--colorErrorBg`/`Fg`                                                                                                                     |
| **圆角**                     | `--radius`, `--radiusHalf`, `--radiusCap`, `--radiusRound`, `--radiusRounded`                                                                                                                 |
| **其他**                      | `--colorTabBar`, `--densityGap`, `--scrollbarWidth`, `--monospaceFont`, `--sansSerifFont`, `--uiZoomLevel`                                                                                  |
---

## 常见问题

### ❓ 什么是 OpenAI 兼容 API？

[See the explanation here](https://bentoml.com/llm/llm-inference-basics/openai-compatible-api#:~:text=What%20is%20an,across%20various%20industries.)

### ❓ 我安装了所有内容，但什么都没变

**请先检查这些：**
- [ ] 在 `vivaldi://flags` 启用 **CSS 自定义**
- [ ] 设置正确的文件夹路径  
  → `设置 > 外观 > 自定义 UI 修改`  
  → `Awesome-Vivaldi-main\Vivaldi8.0Stable`
- [ ] 将 [./Javascripts](./Javascripts/) 下的所有 **内容** 复制到你的 `<YOURVIVALDIDIRECTORY>\Application\<VERSI0N>\resources\vivaldi\`

---

### ❓ 为什么缺少一些功能？

#### 🤖 AI 功能无法使用
这些修改 **无法开箱即用**。

你必须配置自己的 **OpenAI 兼容 API**  
→ 编辑脚本文件的前几行。

---

#### ⭐ 收藏标签（FavouriteTabs）未显示
- 仅 **前 9 个固定标签 / 标签堆叠** 会被转换为网格。
- 也就是说你需要至少固定一个标签才能看到效果。
- 此修改常导致副作用，例如破坏标签弹出缩略图的位置。

---

### ❓ 我安装正确了，但仍看不到变化

这很正常。

- 许多修改在 **后台运行**
- 效果可能很微妙，或仅在特定情况下出现

👉 查看 [Mod List](#mod-list) 以了解每个修改的作用

---

### ❓ 有些功能似乎被禁用了

部分修改被有意关闭（有 bug / 未完成）

**手动启用它们：**
- CSS 修改 → [Import.css](./Import.css)
- JS 修改 → [window.html](./Javascripts/window.html)

---

### ❓ 还是不行？

- 重启 Vivaldi
- 仔细检查文件路径（最常见的问题）
- 确保文件确实被替换了（而不是被复制到了一旁）

```