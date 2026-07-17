# Vivaldi Browser — Reverse-Engineered Source

> 基于 Vivaldi 8.1.4087.40 安装包逆向分析，服务于 Awesome Vivaldi 模组开发

## 概述

Vivaldi 浏览器代码分为三层：
- **Chromium 层**（92%，开源）
- **C++ 后端层**（3%，BSD 开源 → `../Vivaldi-browser/`）
- **UI 层**（5%，闭源）← **本目录的重点**

UI 层由 `main.html` 加载两个 webpack bundle：
1. `background-common-bundle.js`（1.9 MB）— 先加载，定义核心 API 和数据层
2. `bundle.js`（6.5 MB）— 后加载，包含 React UI 组件树

两个 bundle 都属于同一个 webpack 应用 `gapp_browser_react`。

## 目录结构

```
Others/Reverse/
├── README.md                   ← 本文件
├── bundle/                     ← bundle.js 解包（主 UI）
│   ├── modules/                ← 396 个独立模块
│   ├── index.json              ← 按大小排序的模块索引
│   ├── catalog.json            ← 分类索引（JSON）
│   └── catalog.md              ← 分类索引（Markdown）
├── background-common/          ← background-common-bundle.js 解包（API 桥接层）
│   ├── modules/                ← 509 个独立模块
│   ├── index.json
│   ├── catalog.json
│   └── catalog.md
├── api-surface.json            ← JS 端 vivaldi.* API 调用统计
├── api-surface.md              ← API 调用统计（Markdown）
├── cpp-api-raw.txt             ← C++ 端 DECLARE_EXTENSION_FUNCTION 全量提取
├── prefs/
│   ├── prefs-constants.js      ← 所有偏好路径常量（kAcceptLanguages → vivaldi...）
│   └── prefs-defaults.js       ← 所有偏好的默认值
├── api/                        ← （待构建）结构化 API 文档
└── components/                 ← （待构建）UI 组件映射
```

## 关键技术发现

### 1. API 桥接层

```
JS 端：self.vivaldi.* （模块 7064  = self.vivaldi）
       ↓ 通过 Chrome Extension API 绑定
C++ 端：DECLARE_EXTENSION_FUNCTION("prefs.get", PREFS_GET)
       ↓ 实现位于 extensions/api/<模块名>/
```

**API 模块列表**（C++ 端，共 40+ 模块）：
`accessKeys`, `autoUpdate`, `bookmarks`, `bookmarkContextMenu`, `calendar`,
`contacts`, `contentBlocking`, `contextMenu`, `devtools`, `directMatch`,
`doh`, `editcommand`, `events`, `extensionActionUtils`, `guestView`,
`history`, `importData`, `infobars`, `mail`, `menuContent`, `menubar`,
`menubarMenu`, `notes`, `omnibox`, `pageActions`, `pipPrivate`, `prefs`,
`protonvpn`, `readingList`, `runtime`, `savedpasswords`, `searchEngines`,
`sessions`, `settings`, `sitePermissions`, `sync`, `tabs`, `theme`,
`thumbnails`, `translateHistory`, `vivaldiAccount`, `vivaldiUtilities`,
`webview`, `window`, `zoom`

### 2. JS 模块分类（bundle.js 主 UI，396 个模块）

| 分类 | 模块数 | 说明 |
|------|--------|------|
| vivaldi-ui-window | 95 | 窗口管理 |
| mail | 49 | 邮件客户端 |
| vivaldi-ui-startpage | 46 | 起始页/快速拨号 |
| vivaldi-ui-panels | 39 | 侧边面板 |
| vivaldi-ui-menus | 37 | 菜单系统 |
| calendar | 30 | 日历 |
| vivaldi-ui-addressbar | 27 | 地址栏 |
| vivaldi-ui-settings | 27 | 设置页面 |
| vivaldi-ui-toolbar | 27 | 工具栏 |
| vivaldi-ui-extensions | 26 | 扩展管理 |
| vivaldi-ui-tabs | 20 | 标签页 |
| vivaldi-ui-themes | 19 | 主题 |
| vivaldi-ui-bookmarks | 17 | 书签 |
| vivaldi-ui-statusbar | 14 | 状态栏 |
| notes | 12 | 笔记 |
| feed | 12 | RSS/Feed |
| translate | 10 | 翻译 |
| 第三方库 | ~50 | React, D3, Redux, Immer, Moment, Lodash 等 |

### 3. 关键模块速查

#### 主 Bundle (bundle.js)

| 模块 ID | 大小 | 内容 |
|---------|------|------|
| 39248 | 1.96 MB | 第三方库合集（D3, markdown, highlight.js 等） |
| 96787 | 175 KB | React Core |
| 93196 | 98 KB | Vivaldi 主 UI 编排（导入 30+ 模块） |
| 7149 | 73 KB | 命令/动作系统（DOCUMENT_CONTAINER_AV, COMMAND_FULLSCREEN 等） |
| 35369 | 63 KB | 不可变数据结构库 |
| 45926 | 27 KB | 命令系统详情 |
| 59322 | 30 KB | 窗口/工具栏布局 |

#### Background Bundle (background-common-bundle.js)

| 模块 ID | 大小 | 内容 |
|---------|------|------|
| 54993 | 149 KB | 全局 Store/Reducer（EXPAND_MAIL_PANEL, HISTORY_MANAGER_STATE 等） |
| 98118 | 108 KB | **所有偏好的默认值** |
| 17885 | 92 KB | **所有偏好路径常量**（kAcceptLanguages, kActions 等） |
| 78134 | 71 KB | 邮件搜索/过滤逻辑 |
| 48764 | 24 KB | 加密/哈希工具（lW 导出） |
| 7064 | 50 B | **`self.vivaldi` 全局对象引用** ← 所有 API 的入口 |
| 92292 | 49 B | `chrome.tabs` 等 Chrome API 引用 |
| 37441 | 496 B | 书签扩展数据更新 |

### 4. 偏好系统

Vivaldi 的偏好系统有三层：

1. **C++ 定义**：`prefs/vivaldi_prefs_definitions.h` → 注册到 Chromium PrefService
2. **JS 常量**：模块 17885 定义所有 `k*` 常量映射到 `vivaldi.*.*` 路径
3. **JS 默认值**：模块 98118 定义所有偏好的默认值

调用方式：
```javascript
// JS 端读取偏好
vivaldi.prefs.get("vivaldi.address_bar.autocomplete.enabled", callback)
// 或 Promise 风格
const value = await vivaldi.prefs.get(path)

// 内部模块通过常量引用
const path = kAddressBarAutocompleteEnabled  // → "vivaldi.address_bar.autocomplete.enabled"
```

## 使用指南

### 查找特定功能

1. **API 方法**：查看 `cpp-api-raw.txt`（C++ 定义）或 `api-surface.md`（JS 调用统计）
2. **偏好路径**：查看 `prefs/prefs-constants.js`（模块 17885）
3. **UI 组件**：在 `bundle/catalog.md` 中找到对应分类，然后查看模块文件
4. **数据层**：查看 `background-common/catalog.md`

### 模块文件格式

每个 `.js` 文件是 webpack 模块的函数体（去掉外层的 `(e,t,n)=>{...}` 包装）：

```javascript
// 原始 webpack 模块：50564:(e,t,n)=>{"use strict"; ...}
// 提取后的文件内容："use strict"; ...（去掉函数包装，保留模块代码）
```

- `e` → 模块自身引用
- `t` → 模块导出对象
- `n` → `__webpack_require__` 函数，`n(模块ID)` 导入其他模块
- `n.d(t,{X:()=>Y})` → 定义导出 `t.X = Y`
- `n.r(t)` → 标记模块为 ES module

### 从 JS 模块追踪 API

```javascript
// 模块 37441 展示了典型的 API 调用模式
var a = n(92292),  // → chrome.tabs API
    r = n(7064);   // → self.vivaldi API

// 调用 vivaldi.utilities.storeImage()
r.Z.utilities.storeImage({url: e})

// 调用 chrome.tabs.update()
a.Z.tabs.update(e, {vivExtData: n})
```

## 工具脚本

```
scripts/
├── deconstruct-webpack.js   ← 解包 webpack bundle（98%+ 提取率）
├── categorize-modules.js    ← 自动分类模块
└── extract-api.js           ← 提取 API 调用统计
```

## 外部参考

- **Vivaldi C++ 源码**：`../Vivaldi-browser/`
- **现有 API 文档**：`../Doc/EveryAPI.txt`（Lonm's VivaldiModdersAPI）
- **内部 API 文档**：`../Doc/BundleReverse/api.md`
- **Vivaldi 安装目录**：`D:/Package/软件/Application/8.1.4087.40/resources/vivaldi/`
- **Vivaldi Modders API**：https://lonmcgregor.github.io/VivaldiModdersAPI/
