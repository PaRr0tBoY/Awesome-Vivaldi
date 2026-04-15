# ArcPeek 设计与实现分析

本文基于当前工作区中的 [ArcPeek.js](/Users/acid/Desktop/VivaldiModpack/Vivaldi7.9Stable/Javascripts/ArcPeek.js) 和 [ArcPeek.css](/Users/acid/Desktop/VivaldiModpack/Vivaldi7.9Stable/CSS/ArcPeek.css) 进行分析，重点说明 ArcPeek 的功能、架构、事件调用链、动画路径、按钮实现和关键技术依赖。

## 0. ArcPeek 的简要功能介绍和架构设计

ArcPeek 的目标是把普通链接打开行为改造成“预览式打开”。用户不必直接跳转页面，而是可以通过快捷组合、鼠标中键按住、左键长按等方式，把链接先打开到一个浮层式的 Peek 面板中，在当前标签页上下文内完成快速查看、关闭、展开到新标签页或分屏。

从职责上看，ArcPeek 分成两层：

1. 宿主层 `PeekMod`
   位置：`ArcPeek.js` 中 `class PeekMod`
   负责 Vivaldi 宿主界面内的 Peek 生命周期管理，包括：
   - 创建和销毁 `peek-container / peek-panel / webview`
   - 管理预览图缓存、截图任务、打开关闭动画
   - 控制关闭快捷键、背景点击关闭、关闭后的指针保护
   - 创建功能按钮并调用 Vivaldi Tab API

2. 页面注入层 `WebsiteInjectionUtils + WebsiteLinkInteractionHandler`
   位置：`ArcPeek.js` 中 `class WebsiteInjectionUtils`、`class WebsiteLinkInteractionHandler`
   负责向当前网页 `webview` 注入脚本，在页面内部截获链接交互，并把“链接 URL + 源元素矩形 + 预览样式信息 + sourceToken”通过 `chrome.runtime.sendMessage` 发回宿主层。

3. 样式与动画层 `ArcPeek.css`
   负责：
   - 定义 Peek 容器、面板、内容区和侧边按钮样式
   - 定义打开/关闭关键帧
   - 定义背景压暗和网页栈缩放
   - 定义 preview 图层与关闭阶段的 matte 处理

### 结构关系

整体架构可以概括为：

`用户在网页中操作链接`
-> `WebsiteLinkInteractionHandler 记录源链接几何信息`
-> `chrome.runtime.sendMessage`
-> `PeekMod.openPeek()`
-> `PeekMod.buildPeek()`
-> `创建 peek-panel + webview`
-> `执行 opening motion`
-> `在 Peek 中加载目标 URL`
-> `用户通过背景/快捷键/按钮关闭或展开`
-> `disposePeek() 统一销毁`

### 数据结构

`PeekMod` 内部几组状态是实现的核心：

- `webviews: Map`
  以 `webviewId` 为 key，保存当前 Peek 容器、webview、来源 tab、来源矩形、预览图状态、监听器和定时器，是整个生命周期的主状态表。
- `previewCache: Map`
  以链接 URL + 文本 + 几何信息生成的 cache key 保存预览截图，避免重复抓图。
- `previewCaptureTasks: Map`
  用来去重异步截图任务，防止同一个链接来源重复触发 UI capture。
- `lastRecordedLinkData`
  保存最近一次记录的链接快照，解决用户触发打开时，宿主层和页面层之间的短时间数据衔接问题。

## 1. ArcPeek 的事件调用链和关键代码

这一部分按“初始化 -> 注入 -> 触发打开 -> 构建面板 -> 关闭销毁”的顺序说明。

### 1.1 初始化与注入

入口在 `bootstrapPeekMod()`，它会等待 `#browser` 存在后实例化 `new PeekMod()`。

关键点：

- `new PeekMod()` 中先调用：
  - `checkPeekCSSSupport()`
  - `registerPeekCloseShortcuts()`
  - `registerPeekCloseGuard()`
- 然后创建 `new WebsiteInjectionUtils(...)`

对应代码位置：

- `bootstrapPeekMod()`：`ArcPeek.js` 2744 行附近
- `PeekMod.constructor()`：`ArcPeek.js` 40 行附近

`WebsiteInjectionUtils` 的职责是把页面事件监听器注入到活动 `webview` 中：

- 监听 `chrome.webNavigation.onCommitted / onDOMContentLoaded / onCompleted`
- 监听 DOM 变化 `MutationObserver`
- 检测活动 `webview` 是否可注入
- 用 `webview.executeScript({ code, runAt: "document_start" })` 注入 `WebsiteLinkInteractionHandler`

关键函数：

- `injectActiveWebview()`
- `isInjectableWebview()`
- `injectCode()`

对应代码位置：

- `ArcPeek.js` 2076 行附近开始

### 1.2 页面内触发 Peek 的调用链

页面内真正接管链接交互的是 `WebsiteLinkInteractionHandler.#setupMouseHandling()`。

它在页面文档级别绑定了一组捕获阶段事件：

- `pointerdown`
- `pointerup`
- `pointermove`
- `mouseup`
- `mousemove`
- `click`
- `auxclick`
- `contextmenu`
- `selectstart`
- `dragstart`

它支持三类主要触发方式：

1. 修饰键 + 左键
   条件：`altKey || metaKey || ctrlKey` 且 `event.button === 0`
   行为：直接 `#openPeekFromEvent(event)`，并用 `preventAllClicks()` 阻止原始点击继续打开页面。

2. 中键按住
   条件：`event.button === 1`
   行为：`setTimeout(..., 500)`，超过 500ms 打开 Peek。

3. 左键长按
   条件：`event.button === 0` 且目标是链接
   行为：
   - 先 `#recordLinkSnapshot(event, link)` 记录来源矩形与预览信息
   - `rightClickHoldDelay` 之后启动视觉按压反馈 `#startLinkHoldFeedback()`
   - `rightClickHoldTime` 到达后调用 `#openPeekFromEvent(event)`

关键函数链：

- `#setupMouseHandling()`
- `#recordLinkSnapshot()`
- `#openPeekFromEvent()`
- `#sendPeekMessage()`

其中 `#recordLinkSnapshot()` 除了记录 `left/top/width/height`，还会生成：

- `sourceToken`
- `preview.text`
- `preview.color`
- `preview.backgroundColor`
- `preview.borderColor`
- `fontFamily / fontSize / fontWeight / lineHeight`

这些数据一部分用于找回源链接，一部分用于预览图层与动画过渡。

对应代码位置：

- `ArcPeek.js` 2289 行附近开始
- `#recordLinkSnapshot()`：2517 行附近
- `#openPeekFromEvent()`：2572 行附近

### 1.3 页面层到宿主层的消息桥接

页面内通过：

```js
chrome.runtime.sendMessage({ url, fromPanel: this.fromPanel, rect });
```

把消息发回宿主。

宿主侧在 `WebsiteInjectionUtils` 构造函数里注册：

```js
chrome.runtime.onMessage.addListener((message) => {
  if (message.url) {
    openPeek(message.url, message.fromPanel, message.rect, message.meta);
  }
});
```

因此调用链变成：

`#openPeekFromEvent()`
-> `#sendPeekMessage()`
-> `chrome.runtime.onMessage`
-> `PeekMod.openPeek()`

### 1.4 宿主层打开 Peek 的调用链

宿主侧打开流程的主链条是：

`openPeek()`
-> `showPeek()`
-> `buildPeek()`
-> `applyPeekAnimationGeometry()`
-> `startPeekNavigation()`
-> `animatePeekMotion("opening")`
-> `finalizePeekOpening()`

各函数职责如下：

- `openPeek()`
  先 `reconcilePeeks()` 做一致性修复，保证同一时刻只保留一个 Peek；再确认当前窗口处于可见状态后调用 `showPeek()`。

- `buildPeek()`
  这是核心构建函数，负责：
  - 创建 DOM：`peekContainer / peekPanel / peekContent / sidebarControls / webview`
  - 准备 preview 缓存与 preview 抓图任务
  - 写入 `webviews` 状态表
  - 绑定背景点击关闭逻辑
  - 调用 `showSidebarControls()` 生成按钮
  - 计算 opening 动画几何参数
  - 根据是否命中 preview 缓存，决定是“preview 模式打开”还是“live 模式打开”
  - 启动 webview 导航并执行 opening 动画

- `finalizePeekOpening()`
  打开动画结束后：
  - 标记 `openingState = "finished"`
  - 设置 `data-has-finished-animation="true"`
  - 移除 preview 图层
  - 显示真实 webview 内容

对应代码位置：

- `openPeek()`：549 行附近
- `buildPeek()`：576 行附近
- `finalizePeekOpening()`：1288 行附近

### 1.5 关闭 Peek 的调用链

关闭入口主要有四类：

1. 键盘快捷键
   - `Esc`
   - `Ctrl/Cmd + W`
   由 `registerPeekCloseShortcuts()` 处理，并调用 `closeLastPeek()`

2. 点击背景
   - `buildPeek()` 中给 `peekContainer` 绑定 `pointerdown/mousedown`
   - 用户在 backdrop 上按下后，进入 `armBackdropClose()`
   - 在 `pointerup/mouseup` 触发 `finalizeBackdropClose()`
   - 最终调用 `disposePeek()`

3. 点击侧边关闭按钮
   - `showSidebarControls()` 中的 Close 按钮动作是 `this.closeLastPeek()`

4. 来源 tab 被关闭
   - `buildPeek()` 中给来源 tab 注册 `chrome.tabs.onRemoved`
   - 回调中对关联 Peek 执行 `disposePeek(..., { animated: false, closeRuntimeTab: false })`

最终统一进入：

`closeLastPeek()`
-> `disposePeek(webviewId, options)`

`disposePeek()` 是真正的统一销毁入口，负责：

- 去重：防止重复销毁
- 清理所有计时器和监听器
- 如有必要，等待关闭源矩形 `getPeekClosingSourceRect()`
- 如果具备 preview 资产，则切到 `preview-closing` 分支
- 调用 `animatePeekMotion(panel, "closing", sourceRect)`
- 收尾删除 DOM、恢复源链接可见性、关闭 runtime tab、发送 `peek-closed`

这里的设计重点是：ArcPeek 把所有关闭路径最终汇总到 `disposePeek()`，这样不会出现“某个关闭入口忘记清状态”的分叉式泄漏。

对应代码位置：

- `registerPeekCloseShortcuts()`：235 行附近
- `closeLastPeek()`：429 行附近
- `disposePeek()`：129 行附近

## 2. ArcPeek 的动画路径设计和播放顺序

ArcPeek 的动画不是单一的 CSS 动画，而是“CSS 基础效果 + JS 几何插值 + preview 图层切换”三层配合。

### 2.1 动画总体目标

它试图实现的是 Arc 风格的“从链接位置长出来，再收回到链接位置”的空间感：

- 打开时：从源链接矩形扩展到居中大面板
- 关闭时：从大面板收缩回来源链接
- 若能拿到源预览图，则优先用截图图层做更连贯的形态过渡
- 若拿不到，则退化为普通 transform/scale 动画

### 2.2 CSS 动画基线

`ArcPeek.css` 中定义了两个关键帧：

- `@keyframes peek-pop-in`
- `@keyframes peek-pop-out`

对应样式：

- `.peek-container.open .peek-panel`
- `.peek-container.closing .peek-panel`

但 JS 在构建时主动写入：

```js
peekContainer.dataset.motion = "js";
```

因此下面两条规则会让纯 CSS 关键帧失效：

- `.peek-container[data-motion="js"].open .peek-panel { animation: none; }`
- `.peek-container[data-motion="js"].closing .peek-panel { animation: none; }`

这说明 CSS 关键帧更像兜底方案，当前主路径由 JS Web Animations API 驱动。

### 2.3 打开动画的几何设计

几何准备发生在 `applyPeekAnimationGeometry()`。

这个函数会根据最终面板矩形和源链接矩形，计算一组 CSS 变量和几何参数：

- `--peek-translate-x`
- `--peek-translate-y`
- `--peek-scale-x`
- `--peek-scale-y`
- `--peek-source-radius`
- `--peek-backdrop-origin-x`
- `--peek-backdrop-origin-y`

核心思路：

- `sourceRect` 是源链接在宿主坐标系中的绝对矩形
- `finalRect` 是 Peek 面板最终停留位置
- 打开时需要从 `sourceRect` 变换到 `finalRect`
- 关闭时反向执行

其中：

- `translateX / translateY` 表示从来源位置到最终面板的平移差
- `scaleX / scaleY` 表示来源矩形与最终面板尺寸的比例
- `sourceRadius` 让小链接起点时更接近 pill/button 的圆角观感

### 2.4 两种 motion 路径

`animatePeekMotion()` 会根据是否存在 preview 图层，选择两种不同动画方案。

#### 路径 A：有 preview 图层时走矩形插值

条件：

```js
sourceRect && peekPanel.querySelector(":scope > .peek-source-preview")
```

调用：

`animatePanelRectMotion()`

特点：

- 直接对 `left/top/width/height/borderRadius` 做关键帧插值
- 开启动画从 `sourceRect` 长成 `targetRect`
- 关闭动画从 `targetRect` 收回 `sourceRect`
- 由于 preview 图层是静态截图，矩形插值不会暴露 live webview 内容抖动

对应几何函数：

- `getPanelRectMotionGeometry()`

#### 路径 B：无 preview 图层时走 transform 缩放路径

调用：

`animatePanelTransformMotion()`

特点：

- 通过 `translate(...) scale(...)` 做统一变换
- 动画对象主要是整个 `peekPanel`
- 打开关键帧带一个轻微 overshoot：
  - 先到 `scale(1.008)`，再回到 `scale(1)`
- 关闭关键帧也有很轻的反向过冲：
  - 先到 `scale(1.006)`，再收回来源位置

对应几何函数：

- `getPanelScaleMotionGeometry()`

### 2.5 打开时的播放顺序

打开阶段的实际顺序如下：

1. `buildPeek()` 创建 DOM，容器先进入 `pre-open`
2. 计算目标面板大小，默认宽度约为视口的 `80%`，高度基本占满内容区
3. 调用 `applyPeekAnimationGeometry()` 记录来源矩形和几何参数
4. 如果命中 preview 缓存：
   - `mountPreviewLayer()`
   - `setPreviewAnimationState(true)`
   - `preparePeekContentForPreview()`，先把真实内容隐藏
5. `requestAnimationFrame()` 后把容器从 `pre-open` 切到 `open`
6. `startPeekNavigation()` 把 `about:blank` 切到真实 URL
7. 如果有 preview：
   - `animatePeekContentIn()` 让真实内容淡入
   - `animatePreviewLayerOut()` 让 preview 图层淡出
8. `animatePeekMotion("opening")`
9. 结束后 `finalizePeekOpening()`：
   - 清除 preview 相关 class
   - 删除 preview 图层
   - 显示真实内容

### 2.6 关闭时的播放顺序

关闭阶段在 `disposePeek()` 中完成，顺序略复杂：

1. 清理计时器、tab 监听器、背景监听器
2. 如果最后一个 Peek 正在关闭，则先去掉 `body.peek-open`，让背景网页缩放开始恢复
3. 通过 `getPeekClosingSourceRect()` 找关闭的目标矩形
   - 优先用 opening 阶段记录的矩形
   - 否则向页面层请求最新的源链接矩形 `peek-source-rect-request`
4. 如果当前可用 preview 图：
   - `ensurePreviewAsset()`
   - `mountPreviewLayer()`（必要时重新挂载）
   - `flushPreviewLayerForClosing()`
   - `setPreviewAnimationState(false)`
   - `preparePreviewLayerForClosing()`
   - `hideSidebarControls()`
   - `suppressPeekContentForClosing()`
   - `animatePreviewLayerIn()`
   - `setPreviewClosingState(true)`
   - 下一帧后 `setPreviewClosingMatteState(true)`
5. 执行 `animatePeekMotion("closing", sourceRect)`
6. 在 `finally` 中调用 `finishCleanup()`：
   - 停止 webview
   - 关闭 runtime tab
   - 删除 preview 层
   - 删除容器
   - 恢复源链接可见性
   - 发 `peek-closed`

### 2.7 背景和网页栈的辅助动画

除了面板自身，CSS 还做了两个辅助空间效果：

1. `body.peek-open #browser #webpage-stack`
   - `transform: scale(0.97)`
   - 增加圆角和阴影
   - 让原始页面像被“压到后面”

2. `.peek-container::before`
   - 半透明深色遮罩
   - 打开时 `opacity: 1`
   - 关闭时 `opacity: 0`

因此最终视觉感不是单纯一个面板浮出来，而是“前景面板放大、背景网页略缩小并暗化”。

## 3. ArcPeek 的功能按钮实现

当前 Peek 面板右侧只真正生成了三枚功能按钮，它们都在 `showSidebarControls()` 中定义。

### 3.1 按钮生成机制

`showSidebarControls(webviewId, thisElement)` 会在 `peek-sidebar-controls` 容器中插入按钮：

- Close
- Expand
- Split View

按钮统一通过 `createOptionsButton()` 创建。

`createOptionsButton()` 做了几件重要的事：

- 使用 `button` 元素承载 SVG
- 在 `pointerdown / mousedown / pointerup / mouseup / click` 上都做事件阻断
- 用 `actionTriggered` 防止一次按压触发多次
- 执行回调前统一 `preventDefault + stopPropagation + stopImmediatePropagation`

这套处理非常重要，因为 Peek 本身就是覆盖在浏览器界面上的，如果按钮事件继续冒泡，很容易触发背景关闭、webview 焦点变化或底层链接点击。

### 3.2 Close 按钮

定义：

```js
{
  content: this.iconUtils.close,
  action: () => this.closeLastPeek(),
  cls: "peek-sidebar-button close-button",
  label: "Close",
}
```

实现要点：

- 图标来自 `IconUtils.close`
- 点击后直接走统一关闭入口 `closeLastPeek()`
- 最终由 `disposePeek()` 完成动画和清理

CSS 上它有独立 hover 态：

```css
.peek-container .peek-sidebar-button.close-button:hover {
  background: rgb(220, 53, 69);
  color: white;
}
```

因此 Close 是唯一有危险色反馈的按钮。

### 3.3 Expand 按钮

定义：

```js
{
  content: this.iconUtils.newTab,
  action: () => this.openNewTab(webviewId, true),
  cls: "peek-sidebar-button expand-button",
  label: "Expand",
}
```

`openNewTab(webviewId, active)` 的实现逻辑：

1. 用 `getPeekUrl(webviewId)` 取到当前 Peek 的目标 URL
2. 设置 `disableSourceCloseAnimation = true`
   目的是告诉关闭流程：这次不是收回来源链接，而是扩展成真正标签页，不要再做 source close animation
3. 给容器加 `expanding-to-tab`
   同时移除 `body.peek-open`
4. 计算当前 Peek 面板和目标标签页视口矩形
5. 通过 `left/top/width/height` 的 CSS transition，把 Peek 面板扩展到页面内容区
6. `chrome.tabs.create({ url, active: true })`
7. 等待新标签页 `complete`
8. 调用 `dismissPeekInstant(webviewId)` 立即清除旧 Peek

这是一个“视觉展开 + 真正切到标签页”的组合操作，不是单纯开新 tab。

### 3.4 Split View 按钮

定义：

```js
{
  content: this.iconUtils.splitView,
  action: () => this.openInSplitView(webviewId),
  cls: "peek-sidebar-button split-button",
  label: "Split View",
}
```

`openInSplitView(webviewId)` 的实现依赖 Vivaldi 的标签 tiling 元数据：

1. 获取当前活动 tab
2. 读取当前 tab 的 `vivExtData`
3. 检查已有 tiling 信息，没有则创建新的 `tileId`
4. `createTab({ url, active: true, index: current + 1, openerTabId })`
5. 立即 `dismissPeekInstant(webviewId)`
6. 用 `updateTabVivExtData()` 更新当前 tab 和新 tab 的 `tiling` 字段：
   - `id`
   - `index`
   - `layout: "row"`
   - `type: "selection"`
7. 最后把两个 tab 标记为 `highlighted`

这说明 ArcPeek 的 Split View 并不是 CSS 双栏，而是直接借助 Vivaldi 原生的标签平铺系统。

### 3.5 IconUtils 的作用

`IconUtils` 统一管理按钮图标：

- 静态 SVG：
  - `ellipsis`
  - `close`
  - `readerView`
  - `newTab`
  - `splitView`
  - `backgroundTab`
- 动态从 Vivaldi 现有按钮克隆：
  - `back`
  - `forward`
  - `reload`

当前 ArcPeek 真正使用的是：

- `close`
- `newTab`
- `splitView`

`readerView/back/forward/reload/backgroundTab` 目前更像预留能力，类中已经有图标和个别辅助方法，例如 `showReaderView(webview)`，但在当前侧边按钮组里没有挂接出来。

## 4. ArcPeek 的关键技术依赖

ArcPeek 不是单纯的前端动画组件，它强依赖 Vivaldi 宿主环境提供的扩展 API 和嵌入式页面容器。

### 4.1 DOM 与 Vivaldi UI 结构依赖

关键依赖节点：

- `#browser`
- `#webpage-stack`
- `#webview-container`
- `.active.visible.webpageview webview`

这些节点用于：

- 判断初始化时机
- 计算 Peek 面板的最终视口矩形
- 给背景网页做缩放与阴影
- 找到当前活动 tab 对应的 `webview`

也就是说，ArcPeek 的实现绑定了 Vivaldi 当前 UI 结构，脱离该 DOM 结构不能直接工作。

### 4.2 `webview` 注入能力

页面层功能依赖：

- `webview.executeScript(...)`

这使得宿主可以把 `WebsiteLinkInteractionHandler` 注入到网页内部，并监听真实链接事件。如果没有 `webview` 注入权限，就无法在页面侧拿到精准的源链接矩形、文本和样式快照。

### 4.3 Chrome/Vivaldi 扩展 API

ArcPeek 直接依赖下列 API：

- `chrome.runtime.sendMessage`
  页面层与宿主层通信
- `chrome.runtime.onMessage`
  接收打开、关闭、源链接显隐、源矩形查询消息
- `chrome.webNavigation.*`
  监听页面导航，决定何时重注入页面处理器
- `chrome.tabs.query/get/create/update/remove`
  读取和操作标签页
- `chrome.tabs.onUpdated/onRemoved`
  跟踪来源 tab、runtime tab、关闭快捷键误伤等状态
- `chrome.sessions.restore`
  在 `Ctrl/Cmd + W` 误关原 tab 时尝试恢复
- `chrome.windows.getLastFocused`
  确保只在当前 Vivaldi 窗口中打开 Peek

### 4.4 Vivaldi 私有 API

ArcPeek 还用了多个 Vivaldi 扩展接口：

- `vivaldi.tabsPrivate.onKeyboardShortcut`
  用于捕获 Vivaldi 内部快捷键形式的 `Esc / Ctrl+W / Cmd+W`
- `vivaldi.thumbnails.captureUI`
  抓取来源链接区域截图，生成 preview 图层
- `window.vivaldiWindowId`
  为 `captureUI` 指定窗口

其中 `captureUI` 是整个 Arc 式预览过渡体验的关键。如果没有它，ArcPeek 仍能工作，但开关动画会退化到纯 transform 路径。

### 4.5 Web Animations API

ArcPeek 的主要运动逻辑依赖：

- `element.animate(...)`
- `animation.finished`
- `element.getAnimations()`

用法包括：

- 面板 opening / closing 几何插值
- preview 图层淡出
- 内容层淡入
- 动画冲突时先 cancel 旧动画

这比单纯依赖 CSS class 切换更可控，尤其适合打开和关闭时使用不同几何源点。

### 4.6 现代浏览器能力

还依赖一些现代 Web 能力：

- `AbortController`
  用于页面注入层统一解绑事件
- `crypto.randomUUID()`
  给源链接生成唯一 `sourceToken`
- `visualViewport`
  记录可视视口偏移和缩放信息
- `requestAnimationFrame`
  实现按压反馈和动画帧同步
- `Image.decode()`
  预览图可用性检查

### 4.7 状态一致性与防误触机制

除了 API，ArcPeek 的稳定性还依赖几套内部机制：

- `reconcilePeeks()`
  清理孤儿 Peek，保证同一时刻只有一个有效 Peek
- `closeShortcutGuard`
  处理 `Ctrl/Cmd + W` 关闭 Peek 时可能误关原 tab 的问题
- `postClosePointerGuard`
  防止刚关闭 Peek 时，原来的鼠标释放事件继续打到底层页面
- `sourceToken + peek-source-rect-request`
  在关闭阶段重新定位源链接，保证回收动画能尽量回到正确位置

这些机制不是表层功能，但它们决定了 ArcPeek 是否“像原生功能一样稳”。

## 总结

ArcPeek 的实现重点不在“把链接打开到一个弹层”，而在于把这个弹层做成一个带空间连续性的浏览器原生交互：

- 页面注入层负责捕获“从哪里打开”
- 宿主层负责构建“打开到哪里、如何关闭、如何转正为 tab”
- 预览截图层负责让打开和关闭更像从源链接生长/收回
- Vivaldi 私有 API 和 Web Animations API 则承担了体验落地的关键能力

从现有代码看，ArcPeek 已经具备比较完整的生命周期治理：统一销毁、动画降级、截图缓存、快捷键保护、事件抑制都已经覆盖。当前按钮层面则以 `Close / Expand / Split View` 为主，其他图标和辅助方法更像后续扩展位。
