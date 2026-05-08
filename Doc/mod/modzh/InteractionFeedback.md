[English](../InteractionFeedback.md) | 简体中文

---

# InteractionFeedback 设计与实现分析

本文基于当前工作区中的 [InteractionFeedback.js](/Vivaldi7.9Stable/Javascripts/InteractionFeedback.js) 和 [InteractionFeedback.css](/Vivaldi7.9Stable/CSS/InteractionFeedback.css)。

## 1. 依赖

### Vivaldi 内部 API

- **`chrome.tabs.query`**: 查询当前窗口所有标签 (分屏检测)
- **`chrome.tabs.get`**: 获取标签信息
- **`chrome.tabs.onCreated` / `onRemoved` / `onActivated` / `onUpdated`**: 标签事件监听 (自动隐藏脉冲)
- **`chrome.scripting.executeScript`**: 注入手势轨迹绘制器到页面 MAIN world
- **`tab.vivExtData`**: 读取分屏 tiling 信息

### 外部依赖

- **MutationObserver**: 监听 `#webpage-stack` 子节点变化 (分屏检测)
- **Canvas API**: 手势轨迹绘制
- **requestAnimationFrame**: 轨迹点采样和淡出动画

### 模组间依赖

- **ArcPeek**: `autoHidePulse` 功能检查 `window.__arcPeekOpening` 标志，避免在 ArcPeek 打开时触发脉冲

## 2. 功能

四个独立的交互反馈子功能，通过顶部 `CONFIG` 对象分别开关。

### Feature 1: Tiled Tab Indicator (分屏标签合并样式)

Vivaldi 分屏标签在标签栏中已经是并排的，此功能添加 Zen 风格的视觉合并：
- 检测分屏组 (DOM 和 vivExtData.tiling 双源检测)
- 注入统一背景元素 (`.if-tiled-bg`)
- 添加连接器类 (`.if-tiled-connector`)、位置类 (`.if-tiled-first/middle/last`)、活动类 (`.if-tiled-active`)
- 首尾标签去除圆角，中间标签去除两侧圆角
- 分屏组内标签之间显示竖线分隔符
- 活动标签高亮背景

默认 `enabled: false`，需要手动开启。

### Feature 2: Mouse Gesture Trail (鼠标手势轨迹)

右键拖拽时在页面上绘制渐隐轨迹线：
- 通过 `chrome.scripting.executeScript({ world: 'MAIN' })` 注入到当前活动标签
- 使用 `requestAnimationFrame` 轮询鼠标位置 (Vivaldi 手势系统会拦截 mousemove，需要轮询绕过)
- Canvas 全屏覆盖，`pointer-events: none` 不影响交互
- 松开右键后 300ms 淡出动画

默认 `enabled: false`，需要手动开启。

### Feature 3: Drag Avoidance (拖拽分屏回避动画)

拖拽标签到网页区域边缘时，显示半透明渐变遮罩提示即将分屏的方向：
- 监听 `#webpage-stack` 的 `dragover` 事件
- 检测是否正在拖拽标签 (`.tab-position.dragging` / `#drag-image`)
- `calculateDropSide()` 判断鼠标是否进入边缘区域 (默认 25% 阈值)
- 在对应边缘创建渐变遮罩 (150ms 动画)

默认 `enabled: false`，需要手动开启。

### Feature 4: Auto Hide Pulse (自动隐藏标签栏脉冲)

当标签栏处于自动隐藏状态时，标签变化事件触发短暂显示标签栏：
- 监听 `chrome.tabs.onCreated` / `onRemoved` / `onActivated` / `onUpdated`(pinned 变化)
- 给 `.auto-hide-wrapper.has-tabbar` 添加 `.show` 类
- 显示 1000ms 后移除，冷却 1500ms 防止频繁触发
- 检查 `window.__arcPeekOpening` 避免与 ArcPeek 冲突

默认 `enabled: true`。

### 配置项总览

```javascript
CONFIG = {
  gestureTrail: {
    enabled: false,
    strokeColor: "rgba(120, 160, 255, 0.7)",
    strokeWidth: 3,
    fadeDurationMs: 300,
    maxPoints: 200,
  },
  tiledTabIndicator: {
    enabled: false,
    autoPinMixedGroups: true,  // 检测到混合分屏组时自动 pin
  },
  dragAvoidance: {
    enabled: false,
    edgeThreshold: 0.25,       // 边缘触发区域占宽/高的比例
    animationDurationMs: 150,
  },
  autoHidePulse: {
    enabled: true,
    showDurationMs: 1000,
    cooldownMs: 1500,
  },
}
```

## 3. 使用方法

### 启用

1. 将 `InteractionFeedback.js` 放入 Vivaldi 资源目录，添加到 `window.html`
2. 将 `InteractionFeedback.css` 放入 CSS 目录
3. 在 `CONFIG` 对象中将需要的功能的 `enabled` 设为 `true`

### 使用技巧

- `autoHidePulse` 开箱即用 (默认启用)，适合自动隐藏标签栏的用户
- `tiledTabIndicator` 适合频繁使用分屏功能的用户，提供更清晰的分屏组视觉边界
- `gestureTrail` 需要页面可脚本化 (排除 chrome:// 等)，仅对活动标签生效
- `dragAvoidance` 在拖拽标签时提供方向预览，避免意外分屏

## 4. 设计思路

### 设计初衷

Vivaldi 的交互反馈有多个盲区：分屏标签在标签栏中视觉边界模糊、拖拽分屏方向不直观、自动隐藏标签栏后新标签创建没有视觉提示。InteractionFeedback 将这些独立的交互增强聚合为一个模组。

### 核心架构

四个子功能各自独立为 IIFE 模块 (`TiledFeature` / `GestureTrailFeature` / `DragAvoidanceFeature` / `AutoHidePulseFeature`)，通过统一的 `init()` 函数启动。

### 关键实现

**分屏检测双源策略**: `detectGroupsFromDOM()` 解析 `#webpage-stack` 中的 `.webpageview[data-id]` 属性；`detectGroupsFromAPI()` 读取 `tab.vivExtData.tiling`。两者合并去重，确保无论分屏是通过拖拽还是菜单创建都能检测到。

**分屏连续性检查**: `renderMergeIndicators()` 只对在 `.tab-strip` 中连续排列的分屏标签应用合并样式。非连续的分屏组 (中间插入了普通标签) 不做视觉合并。

**CSS 类命名空间**: 所有动态类使用 `if-` 前缀 (InteractionFeedback 缩写)，避免与其他模组冲突：
- `.if-tiled-connector`: 分屏连接器
- `.if-tiled-first/middle/last`: 位置标识
- `.if-tiled-active`: 活动分屏标签
- `.if-tiled-bg`: 统一背景元素
- `.if-drag-avoidance-overlay`: 拖拽回避遮罩

**手势轨迹 Vivaldi 兼容**: Vivaldi 的鼠标手势系统会拦截右键拖拽期间的 `mousemove` 事件。解决方案是使用 `requestAnimationFrame` 轮询 + 捕获阶段 `mousemove` 双重策略。轮询作为兜底，事件触发时更新坐标。

**手势轨迹注入隔离**: 通过 `INJECT_FLAG = "__ifGestureTrailInjected"` 标志防止重复注入。注入到 `world: 'MAIN'` 以接收右键事件，URL 变化时清除注入标记重新注入。

**自动隐藏脉冲防抖**: `cooldownMs: 1500` 确保连续标签操作 (如快速关闭多个标签) 不会反复触发脉冲。`showDurationMs: 1000` 足够用户注意到标签栏出现。
