[English](../VividPlayer.md) | 简体中文

---

# VividPlayer 设计与实现分析

本文基于当前工作区中的 [VividPlayer.js](/Vivaldi7.9Stable/Javascripts/VividPlayer.js) 和 [VividPlayer.css](/Vivaldi7.9Stable/CSS/VividPlayer.css)。

## 1. 依赖

### Vivaldi 内部 API

- `chrome.scripting.executeScript` -- 向页面注入 `injectMain`（MAIN world）和 `injectBridge`（隔离 world），使用 MV3 API（`chrome.tabs.executeScript` 不可用）
- `chrome.tabs.query / get / update / remove` -- 查询标签状态、切换焦点标签、关闭标签
- `chrome.tabs.onActivated / onUpdated / onRemoved` -- 监听标签生命周期事件
- `chrome.webNavigation.onCommitted` -- 监听主框架导航，重置媒体状态
- `chrome.runtime.onMessage` -- 接收页面注入脚本发回的媒体状态和 global-media-controls 事件
- `chrome.windows.getLastFocused` -- 确认当前窗口可见性
- `vivaldi.tabsPrivate.get` -- 获取标签扩展信息（alert states 等）

### 浏览器 API

- `MutationObserver` -- 监听 `#tabs-container` 的 DOM 变化，确保 UI 挂载点存活
- `ResizeObserver` -- 监听容器尺寸变化，更新 compact 模式
- `requestAnimationFrame` -- 标题溢出滚动动画和音符动画的帧驱动
- `navigator.mediaSession` -- 读取 MediaSession metadata（title/artist/artwork）
- `document.pictureInPictureElement` / `requestPictureInPicture` -- PiP 功能
- `window.postMessage` -- MAIN world 与隔离 world 之间的消息桥接

### 模组间依赖

- 无直接模组间依赖
- CSS 文件：`VividPlayer.css` 提供全部样式，JS 内部也动态注入 stack 相关样式（`ensureStackStyles()`）

## 2. 功能

### 核心功能

VividPlayer 是一个侧边栏底部的媒体控制器，灵感来自 Zen Browser。它自动检测浏览器中正在播放的媒体（音频/视频），在垂直标签栏底部展示一个卡片式控制器，支持播放/暂停、上下曲、静音、PiP、音量控制等操作。最多同时管理 3 个媒体源，以堆叠卡片形式呈现。

### 主要特性

1. **自动媒体发现** -- 通过双层注入（injectMain + injectBridge）监听页面的 `<video>` / `<audio>` 元素事件和 MediaSession 状态，自动识别有意义的媒体源
2. **媒体显著性评分** -- `computeMediaSignificance()` 根据视频面积、controls 属性、MediaSession metadata、时长等维度打分，过滤掉 UI 音效、广告片段、装饰性视频
3. **候选源选择** -- `chooseCandidateSource()` 从所有 tab 中筛选最多 3 个活跃媒体源，排除当前活动标签、PiP 标签、suppressed 源
4. **自动 PiP** -- 切换标签时，如果离开的标签正在播放视频，自动触发画中画（`tryAutoPip()`），使用 `pendingPip` 标记防止闪烁
5. **堆叠卡片布局** -- 多媒体源时以层叠卡片展示，hover 时展开所有卡片，收回时折叠（`computeStackLayouts()` / `applyExpandedStackLayout()` / `applyCollapsedStackLayout()`）
6. **标题溢出滚动** -- 标题超出宽度时自动播放来回滚动动画（`startTitleScroll()`），使用 RAF 驱动的 5 阶段循环：初始延迟 -> 滚动 -> 末尾暂停 -> 回退 -> 起始暂停
7. **音符飘动动画** -- 媒体播放中时从网站图标按钮上方随机飘出音符符号（`spawnNote()`），hover 时停止，最多同时 2 个
8. **Compact 模式** -- 窗口宽度不足时自动切换为紧凑布局
9. **suppress 状态管理** -- 用户关闭某媒体卡片后标记为 suppressed，防止立即重新出现；新播放事件可清除 suppressed 状态
10. **Global Media Controls 集成** -- 接收 `global-media-controls` 类型消息，同步外部媒体状态变更

### 行为预期

- 仅在垂直标签模式（`isVerticalTabsMode()`）下挂载
- 当无媒体播放时，控制器自动隐藏（带淡出动画）
- 最多显示 3 个媒体源卡片，按优先级排序
- 从 MAIN world 注入的脚本通过 `window.postMessage` 与宿主通信，bridge 在隔离 world 中转
- 主框架导航时自动重置该标签的媒体状态
- 标题滚动动画在 hover 卡片时暂停

## 3. 使用方法

### 启用方式

- 将 `VividPlayer.js` 放入 Vivaldi 资源目录的 `Javascripts/` 下
- 将 `VividPlayer.css` 放入 `CSS/` 目录并在 `Import.css` 中引入
- 在 `window.html` 中添加 `<script src="Javascripts/VividPlayer.js"></script>`
- 需在 `vivaldi://experiments` 中启用 "Allow CSS Modification"

### 用户交互

- **播放/暂停**：点击卡片中央的播放按钮
- **上一首/下一首**：点击卡片两侧的跳转按钮
- **静音/取消静音**：点击静音按钮
- **画中画**：点击 PiP 按钮（仅视频源可用）
- **聚焦源标签**：点击左侧网站图标按钮，跳回源标签并滚动媒体元素到可视区域
- **关闭媒体源**：点击关闭按钮，该源将被 suppress
- **展开堆叠**：hover 卡片区域，多个媒体源时展开显示全部

### 配置选项

代码顶部的 `VIVID_PLAYER_CONFIG` 对象：

| 键 | 默认值 | 说明 |
|---|---|---|
| `autoPipOnSwitch` | `true` | 切换标签时自动触发 PiP |
| `minMediaDurationSec` | `8` | 低于此秒数的媒体视为非主要内容 |
| `minVideoArea` | `30000` | 低于此像素面积的视频视为装饰性 |
| `progressUpdateMinMs` | `700` | 进度更新最小间隔 |
| `stackGap` | `6` | 堆叠卡片间距（px） |
| `hideAnimationMs` | `260` | 隐藏动画时长 |
| `stackTransitionMs` | `320` | 堆叠展开/折叠过渡时长 |
| `noteMaxConcurrent` | `2` | 最大同时音符数 |

### 使用技巧

- 堆叠卡片的 hover hitbox 比视觉区域大（上下各扩展 20px/10px），方便触发展开
- 标题滚动使用缓动函数（ease-in-out），视觉上更自然
- 音符从网站图标中心位置飘出，产生"从图标冒出"的感觉

## 4. 设计思路

### 设计初衷

在垂直标签模式下提供一个不占额外空间、始终可用的媒体控制入口。用户无需切换到媒体源标签即可控制播放，类似 Zen Browser 的底栏媒体控制器体验。

### 核心架构

采用**双层注入 + 消息桥接**架构：

```
宿主（window.html）
  ├── injectMain (world: 'MAIN')  ──→  页面上下文
  │     拦截 media.play/pause
  │     监听 MediaSession
  │     读取 media 元素状态
  │
  └── injectBridge (隔离 world)  ──→  chrome.runtime 桥
        window.postMessage ←→ chrome.runtime.sendMessage
```

宿主侧维护 `stateByTabId`（Map），每个 tab 的媒体状态独立追踪。`chooseCandidateSource()` 是核心调度函数，每次标签切换、媒体事件、标签关闭后都会重新评估。

### 关键实现

**媒体筛选策略**：`computeMediaSignificance()` 用多维度评分系统（面积、时长、controls、MediaSession）过滤噪声媒体。`isEligibleMedia()` 支持 `requireAudible` / `requireSignificant` / `requirePip` 等条件组合，不同场景使用不同严格度。

**pendingPip 防闪烁**：`tryAutoPip()` 发送 PiP 请求后立即设置 `pendingPip = true`，在 `chooseCandidateSource()` 中排除 pendingPip 的源。PiP 成功后通过 `enterpictureinpicture` 事件确认，失败则 800ms 后自动清除。

**suppress 状态机**：`reconcileSuppressedState()` 处理 suppressed 状态的清除逻辑。用户手动关闭（`user-close`）不会被自动清除；非用户关闭的 suppressed 在检测到播放事件后可被清除。`awaitingQuietAfterSuppress` 等待媒体静默后再允许重新出现。

**堆叠布局引擎**：`computeStackLayouts()` 根据 expanded 状态计算每个 slot 的 position/bottom/left/right/opacity/zIndex/transform。折叠态使用固定偏移（`stackCollapsedOffset1/2`）和递减透明度（0.72/0.45）。展开态通过 `measurePrimaryHeight()` clone 测量精确高度。

### 协作方式

- 每个 tab 注入一次 injectMain + injectBridge，通过 `injectedTabIds` Set 防重复
- MediaSession metadata 被劫持（defineProperty），写入时同步 postMessage
- `HTMLVideoElement.prototype.play` / `HTMLAudioElement.prototype.play` 被拦截，新创建的媒体元素自动 attach
- `Document.prototype.createElement` 和 `window.Audio` 构造函数也被拦截，确保动态创建的媒体元素被捕获
- 按钮事件处理通过闭包引用 `refs.tabId`，无需外部注入 tabId
