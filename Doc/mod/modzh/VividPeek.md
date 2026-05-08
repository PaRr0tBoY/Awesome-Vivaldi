[English](../VividPeek.md) | 简体中文

---

# VividPeek 设计与实现分析

本文基于当前工作区中的 [VividPeek.js](/Vivaldi7.9Stable/Javascripts/VividPeek.js) 和 [ArcPeek.css](/Vivaldi7.9Stable/Dev/ArcPeek.css)。

## 1. 依赖

### Vivaldi 内部 API

- `vivaldi.thumbnails.captureTab` -- 全页截图用于预览缓存
- `vivaldi.thumbnails.captureUI` -- UI 区域精确截图，用于源矩形截取和 handoff 快照
- `vivaldi.prefs.get / set` -- 读写模组配置（`mod.arcpeek.*`）
- `vivaldi.prefs.onChanged` -- 监听配置变更
- `chrome.tabs.query / get / create / update / remove` -- 标签生命周期管理
- `chrome.tabs.onActivated / onUpdated / onRemoved` -- 标签事件监听
- `chrome.windows.getLastFocused` -- 确认窗口可见性
- `chrome.webNavigation.onCommitted / onDOMContentLoaded / onCompleted` -- 页面导航事件，触发注入
- `chrome.runtime.sendMessage / onMessage` -- 宿主与页面脚本间通信
- `chrome.sessions.restore` -- 恢复被误关的标签（close guard 机制）

### 浏览器 API

- `webview.executeScript` -- 向页面注入 `WebsiteLinkInteractionHandler`
- `MutationObserver` -- 监听 `#webview-container` / `#browser` / `#tabs-container` 等 DOM 变化，同步布局
- `ResizeObserver` -- 监听 webview-container 尺寸变化，触发布局同步
- `Element.animate()` -- Peek 面板的开/关/移动动画（Web Animations API）
- `IntersectionObserver` -- 检测 Peek 面板可见性
- `visualViewport` -- 处理页面缩放下的坐标转换
- `crypto.randomUUID` -- 生成 tile ID 和 source token

### 模组间依赖

- CSS 文件：`ArcPeek.css` 提供 Peek 容器、面板、侧边栏按钮、Nebula 加载效果等全部样式

## 2. 功能

### 核心功能

VividPeek（内部名称 ArcPeek）实现类似 Arc Browser 的"Peek"预览功能：通过修饰键+点击链接（或长按/中键点击），在当前页面上方弹出一个浮动面板，内嵌 webview 加载目标链接。支持从面板中将页面"提升"为新标签、分屏视图或在当前标签中打开。

### 主要特性

1. **多触发模式** -- 支持修饰键+点击（Alt/Shift/Ctrl/Meta 可配置）、中键点击、右键点击、长按触发。通过 `ICON_CONFIG` 中的 `clickOpenModifiers` / `triggerButtons` / `longPressButtons` / `longPressDurationMs` 配置
2. **预览截图缓存** -- `previewCache` 以 URL+文本+几何信息生成 cache key，缓存 `captureUI` 截图。命中缓存时以"preview 模式"瞬间打开，避免白屏。缓存上限 48 条，TTL 10 分钟
3. **Nebula 加载动画** -- 打开时内容区域应用 `blur + saturate + brightness` CSS filter，随页面加载进度逐级减弱（blur 2.2->0, saturate 18%->100%, brightness 90%->100%），配合进度条实现"雾中显现"效果
4. **源矩形动画** -- `animatePeekMotion()` 根据源链接在页面中的位置计算几何参数（translate + scale + borderRadius），实现从链接位置"生长"到面板最终位置的过渡动画
5. **侧边栏控制按钮** -- 悬浮在面板右侧，包含：关闭（红色 hover）、新标签、分屏视图、Reader View、复制链接、导航（后退/前进/刷新）
6. **多 Peek 管理** -- 支持同时打开多个 Peek 面板，`reconcilePeeks()` 保证一致性，`closeLastPeek()` 关闭最近一个
7. **Related Tab Adoption** -- 可选功能，Peek 内的 webview 关联一个"runtime tab"，关闭 Peek 时可将该标签"提升"到标签栏，保留浏览历史和状态
8. **Background Page Scaling** -- 可选功能，Peek 打开时给 `body` 添加 `peek-open` class，背景页面应用 scale + filter 效果
9. **关闭守卫** -- `registerPeekCloseGuard()` 检测 Cmd/Ctrl+W 误关标签事件，如果在 1.5 秒内检测到关闭的是 Peek 的 runtime tab，自动恢复（`chrome.sessions.restore`）
10. **键盘快捷键** -- Peek 打开时拦截 Escape（关闭）、Cmd+W（关闭）、Cmd+R（刷新）、Cmd+F（查找），同时阻止这些快捷键冒泡到宿主页面

### 行为预期

- Peek 面板固定在 webview-container 视口区域内，宽度为视口 80%，高度 100%
- 打开动画使用 `cubic-bezier(0.16, 0.88, 0.22, 1)` 缓动，时长约 400ms
- 关闭时执行反向动画回到源链接位置，然后删除 DOM
- 面板内的 webview 通过 `chrome.tabs.create` 创建的 runtime tab 驱动
- Peek 内的链接点击不会触发新的 Peek（`isInjectableWebview` 排除 `.peek-panel` 内的 webview）
- 来源面板（web panel）的 Peek 使用 `panelPointerBlocker` 阻止面板内的 pointer 事件穿透

## 3. 使用方法

### 启用方式

- 将 `VividPeek.js` 放入 Vivaldi 资源目录的 `Javascripts/` 下
- 将 `ArcPeek.css` 放入 `CSS/` 目录并在 `Import.css` 中引入
- 在 `window.html` 中添加 `<script src="Javascripts/VividPeek.js"></script>`
- 需在 `vivaldi://experiments` 中启用 "Allow CSS Modification"

### 用户交互

- **打开 Peek**：Alt+点击链接（默认），或中键点击，或长按链接（移动端友好）
- **关闭 Peek**：点击面板外部背景区域、按 Escape、按 Cmd/Ctrl+W、点击侧边栏关闭按钮
- **导航**：侧边栏的后退/前进/刷新按钮
- **新标签打开**：点击侧边栏的新标签按钮，Peek 内容以新标签打开并关闭面板
- **分屏视图**：点击分屏按钮，当前标签与 Peek 内容并排显示
- **Reader View**：点击 Reader 按钮，通过 web-highlights.com 的 reader mode 渲染
- **复制链接**：点击复制按钮，将当前 Peek URL 写入剪贴板

### 配置选项

代码顶部的配置对象：

| 常量 | 默认值 | 说明 |
|---|---|---|
| `clickOpenModifiers` | `["alt"]` | 触发 Peek 的修饰键组合 |
| `triggerButtons` | `["middle"]` | 触发 Peek 的鼠标按钮 |
| `longPressButtons` | `["middle"]` | 长按触发的按钮 |
| `longPressDurationMs` | `400` | 长按触发阈值（ms） |
| `autoOpenList` | `[]` | 自动打开 Peek 的 URL 模式列表 |
| `scaleBackgroundPage` | `true` | Peek 打开时缩放背景页面 |
| `PEEK_RELATED_TAB_ADOPTION_CONFIG.enabled` | `true` | 启用 related tab adoption |

动画参数在 `PeekMod.ARC_CONFIG` 中：

| 键 | 默认值 | 说明 |
|---|---|---|
| `glanceOpenAnimationDuration` | `400` | 打开动画时长（ms） |
| `glanceCloseAnimationDuration` | `400` | 关闭动画时长（ms） |
| `previewFadeInRatio` | `0.18` | preview 淡入占总时长比例 |
| `previewCacheLimit` | `48` | 预览缓存条目上限 |
| `previewCacheTtlMs` | `600000` | 预览缓存 TTL（10 分钟） |
| `webviewRevealSettleMs` | `120` | webview 显示前的稳定等待 |

### 使用技巧

- 长按链接时会显示 `peek-hold-press` 视觉反馈（CSS 驱动的按压深度动画）
- Peek 打开后来源链接会被隐藏（`arcpeek-source-hidden` class），关闭后恢复
- 在 autoOpenList 中添加 URL 模式可实现特定站点的自动 Peek

## 4. 设计思路

### 设计初衷

将 Arc Browser 的 Peek 预览体验移植到 Vivaldi。核心目标：不离开当前页面即可快速预览链接内容，减少标签创建的决策成本。用户可以"瞥一眼"再决定是否真正打开。

### 核心架构

**三大类协作**：

```
PeekMod (宿主侧)
  ├── 管理 webviews Map（生命周期主状态表）
  ├── 创建/销毁 Peek DOM 和 webview
  ├── 动画引擎（animatePeekMotion）
  ├── 预览缓存（previewCache）
  └── 键盘快捷键和关闭守卫

WebsiteInjectionUtils (注入管理)
  ├── 监听 webNavigation 事件
  ├── MutationObserver 检测新 webview
  ├── 向活动 webview 注入 WebsiteLinkInteractionHandler
  └── 管理注入节流和重试

WebsiteLinkInteractionHandler (页面侧)
  ├── 监听 pointerdown/pointerup/mouseup 等事件
  ├── 检测修饰键+点击组合
  ├── 长按检测和视觉反馈
  ├── 记录源链接快照（位置、尺寸、viewport 信息）
  └── 通过 chrome.runtime.sendMessage 通知宿主
```

**消息流**：

```
页面链接事件 → WebsiteLinkInteractionHandler
  → chrome.runtime.sendMessage({ url, fromPanel, rect, meta })
  → PeekMod.openPeek()
  → PeekMod.showPeek() → buildPeek()
```

### 关键实现

**预览缓存策略**：`getPreviewCacheKey()` 将 URL + 链接文本 + 位置尺寸拼接为 key。`ensurePreviewAsset()` 优先返回缓存，否则发起 `captureUI` 截图任务，通过 `previewCaptureTasks` Map 去重。缓存采用 LRU 策略（`previewCacheLimit: 48`），过期自动清理。

**Nebula 加载效果**：`buildPeek()` 中在 webview 的 `loadstart` / `loadcommit` / `contentload` / `loadstop` 事件中逐级调整 CSS filter 值。4 个阶段的 filter 参数渐进变化：初始模糊（blur 2.2, sat 18%）-> commit 后（blur 1.05, sat 48%）-> content 后（blur 0.25, sat 88%）-> 完成（blur 0, sat 100%）。`disperseNebulaLayer()` 在完成时执行一个从中心扩散的 clip-path 动画。

**源矩形解析**：`resolveSourceRect()` 处理多坐标系转换。页面坐标 -> 宿主 UI 坐标需要：获取 webview 的 `getBoundingClientRect` -> 将页面 rect 偏移加到 webview rect 上 -> 考虑 `visualViewport` 的 offsetLeft/offsetTop 和 scale。`sourceViewportHint` 保存源 rect 相对于 viewport 的比例，用于面板布局变化后重新投影。

**关闭路径统一**：所有关闭路径（Escape、Cmd+W、背景点击、侧边栏按钮、来源标签关闭）最终汇聚到 `disposePeek()`。该函数负责：防止重入（`isDisposing` 标记）、清理监听器和计时器、执行关闭动画、删除 DOM、恢复源链接可见性、关闭 runtime tab、发送 `peek-closed` 消息。

**Close Guard 防误关**：`registerPeekCloseGuard()` 监听 `chrome.tabs.onRemoved`，如果在 1.5 秒内被关闭的标签恰好是 Peek 的 runtime tab，调用 `chrome.sessions.restore()` 恢复。同时 `lockPeekPanelLayout()` 在 guard 激活期间冻结面板布局，防止恢复过程中布局闪烁。

### 协作方式

- `WebsiteInjectionUtils` 通过 `webview.executeScript` 注入 `WebsiteLinkInteractionHandler`，注入点包括 `onCommitted`、`onDOMContentLoaded`、`onCompleted` 以及 `MutationObserver` 检测到新 webview 时
- 注入有节流机制（`injectThrottleState` WeakMap），避免高频导航事件导致重复注入
- `isInjectableWebview()` 排除 Peek 面板内的 webview（`.peek-panel` 内的）和不可 scriptable 的标签
- `IconUtils` 优先从 Vivaldi UI 中 clone 原生 SVG 图标（如后退、前进、刷新），fallback 到内联 SVG
- Related Tab Adoption 使用 `vivExtData` 在标签上标记 ArcPeek 来源信息，支持跨 Peek 的标签复用
