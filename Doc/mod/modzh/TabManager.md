[English](../TabManager.md) | 简体中文

---

# TabManager 设计与实现分析

本文基于当前工作区中的 [TabManager.js](/Vivaldi7.9Stable/Javascripts/TabManager.js)。

## 1. 依赖

### Vivaldi 内部 API

- `vivaldi.prefs.get(path)` / `vivaldi.prefs.set({path, value})` -- 读写 Vivaldi 首选项，用于获取工作区列表和注册 WebPanel
- `vivaldi.prefs.onChanged.addListener()` -- 监听首选项变化
- `vivaldi.tabsPrivate.get(tabId)` -- 获取标签页扩展数据（`vivExtData`）
- 详见 [api.md](/Doc/api/api.md)

### Chrome 扩展 API

- `chrome.tabs.query({})` -- 查询所有标签页
- `chrome.tabs.update(tabId, {active})` -- 激活标签页
- `chrome.tabs.remove(tabId)` -- 关闭标签页
- `chrome.tabs.onActivated` / `onCreated` / `onRemoved` / `onMoved` / `onUpdated` 等 -- 标签页事件监听
- `chrome.windows.getCurrent()` / `chrome.windows.update()` -- 窗口操作

### 外部依赖

无外部 CDN 依赖。所有 CSS 通过 JS 动态注入。

### 模组间依赖

无直接依赖。但读取 `vivExtData` 中的 `fixedTitle` 字段（由 TidyTitles 写入）来显示自定义标题。

## 2. 功能

Workspace Tab Manager 是一个跨工作区的虚拟标签看板，在 Vivaldi 侧边栏 WebPanel 中以网格布局展示所有工作区的标签页。

### 核心功能

| 功能 | 说明 |
|------|------|
| 工作区总览 | 网格布局同时展示所有工作区，每列一个工作区 |
| 标签页操作 | 点击激活标签页（自动切换工作区）、关闭标签页 |
| 标签栈展示 | 识别 `groupId` 分组，渲染为可折叠的标签栈（带颜色圆点） |
| 实时刷新 | 监听所有标签页事件 + 首选项变化，120ms 防抖自动刷新 |
| 快照去重 | 基于 `stableStringify` 生成快照 key，避免无变化时重复渲染 |

### 展示信息

每个标签页显示：favicon（首字母兜底）、标题（优先 `fixedTitle`）、音频/固定状态徽章。每个工作区显示：图标/emoji/首字母、名称、标签数量。

## 3. 使用方法

1. 将 `TabManager.js` 放入 Vivaldi 资源目录的 `Javascripts/` 下
2. 在 `window.html` 中引入脚本
3. 脚本自动注册名为 "Workspace Board" 的 WebPanel 到侧边栏
4. 点击侧边栏的看板图标即可打开跨工作区标签看板

## 4. 设计思路

### WebPanel 注册机制

通过 `vivaldi.prefs.get('vivaldi.panels.web.elements')` 读取现有 WebPanel 列表，如果目标 panel 不存在则插入新条目。使用固定的 `webPanelId` (`WEBPANEL_workspace-board-b7d71f8f`) 确保幂等性。

同时检查 `vivaldi.toolbars.panel` 等工具栏配置，确保 panel 按钮已注册。如果未注册，找到第一个 `WEBPANEL_` 位置插入。

### 原生 Webview 隐藏

`ensurePanelUI()` 中将原生 webview 的 `blur()` + `tabIndex = -1`，并在 CSS 中隐藏 `.webpanel-header` 和 `.webpanel-content`，用自定义的 `.workspace-board-content` 替代。

### React Props Bridge

Vivaldi UI 基于 React 构建。`getReactProps(element)` 通过动态发现 `__reactProps` 键来访问 React 组件的事件处理器。这是实现工作区切换的关键：

1. `ensureWorkspacePopupOpen()` 通过 React props 的 `onPointerUp`/`onClick` 打开工作区弹窗
2. `cacheHandlers()` 缓存弹窗中每个工作区项的 `onClick` 处理器
3. `activateWorkspaceByUI()` 使用缓存的处理器直接调用，避免每次都打开弹窗

### synthPointer 合成事件

`synthPointer(target)` 创建一个模拟的 `PointerEvent`，包含正确的 `clientX`/`clientY`（从目标元素的 `getClientRects()` 获取），用于调用 React 事件处理器。

### 快照去重渲染

`renderBoard()` 使用 `stableStringify` 生成当前状态的哈希 key，与上次渲染的 `currentSnapshotKey` 比较。只有在快照变化或 `force=true` 时才重新构建 DOM，避免频繁事件导致的性能问题。

### DOM 构建工具

`el(tagName, attrs, parent, children)` 是一个轻量 DOM 工厂函数，支持：
- `text` / `html` 属性设置内容
- `style` 对象设置内联样式
- `events` 对象绑定事件监听器
- 嵌套子元素

### CSS 设计原则

- 所有 CSS 类名使用 `wtm-` 前缀，避免与 `common.css` 冲突
- 完全复用 Vivaldi CSS 变量（`--colorTabBar`, `--colorFg`, `--colorBorder` 等），自动适配主题
- 标签行高 28px、favicon 16px，匹配 Vivaldi 原生尺寸
- 响应式设计：`@media (max-width: 600px)` 缩小列宽

### Observer 保活

`observe()` 监听 `#panels .webpanel-stack` 的 DOM 变化（`childList` + `subtree`），在面板重建时调用 `scheduleUpdatePanel()` 重新绑定 UI。使用 `requestAnimationFrame` 防抖避免同步循环。
