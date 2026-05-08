[English](../QuickCapture.md) | 简体中文

---

# QuickCapture 设计与实现分析

本文基于当前工作区中的 [QuickCapture.js](/Vivaldi7.9Stable/Javascripts/QuickCapture.js)。

## 1. 依赖

### Vivaldi 内部 API

- `vivaldi.thumbnails.captureUI(params, callback)` -- 核心截图 API，按 UI 坐标区域捕获屏幕内容。详见 [captureTab-reference.md](/Doc/api/captureTab-reference.md)
- `window.vivaldiWindowId` -- 当前窗口 ID，作为 `captureUI` 的必需参数

### 外部依赖

- **浏览器原生 API**: `fetch`, `navigator.clipboard`, `navigator.storage.getDirectory()` (OPFS 配置持久化)
- **VividToast** (`window.VividToast.show`) -- Toast 通知系统，用于截图成功/失败反馈

### 模组间依赖

- **VividToast.js** -- 截图完成时的 Toast 通知（`window.VividToast.show`）

### 内嵌工具库

QuickCapture 内嵌了 `gnoh` 命名空间，提供以下工具：

| 方法 | 用途 |
|------|------|
| `gnoh.getReactProps(element)` | 读取 DOM 元素的 `__reactProps`，用于劫持 Vivaldi 原生截图区域的事件处理器 |
| `gnoh.overrideFunction(obj, fnName, callback, opts)` | 函数劫持框架，支持 `runBefore`/`skipApply` 链式覆盖 |
| `gnoh.uuid.generate(ids)` | 生成不重复 UUID，用于 override 系统的元素标识 |
| `gnoh.promise.delay(ms)` | 延迟 Promise |
| `gnoh.element.getStyle(element)` | 获取计算样式 |

## 2. 功能

### 三种截图模式

| 模式 | 行为 |
|------|------|
| `clipboard` | 捕获悬停元素区域，直接写入系统剪贴板 |
| `file` | 捕获悬停元素区域，通过 Vivaldi 文件保存路径输出 |
| `default` | 自动选中区域后，委托给 Vivaldi 原生截图选择器处理输出 |

### 核心交互流程

1. **元素悬停**: 鼠标悬停在 Vivaldi 截图区域（`#capture-area`）上时，实时计算悬停元素的 `getBoundingClientRect()`
2. **覆盖层显示**: 创建 `#quick-capture-overlay` 浮层，精确定位到悬停元素位置，白色边框 + 阴影指示选区
3. **选区确认**: 鼠标点击确认选区，根据模式执行不同分支
4. **截图执行**: 调用 `vivaldi.thumbnails.captureUI()` 执行实际截图

### 配置项

| 键 | 默认值 | 说明 |
|----|--------|------|
| `mode` | `'default'` | 截图模式：`clipboard` / `file` / `default` |
| `encodeFormat` | `'png'` | 编码格式 |
| `encodeQuality` | `85` | 编码质量 (0-100) |
| `showFileInPath` | `true` | file 模式下是否显示文件路径 |
| `saveFilePattern` | `''` | file 模式的文件名模式 |

配置通过 OPFS (`navigator.storage.getDirectory()`) 持久化到 `.askonpage/config.json`，并监听 `vivaldi-mod-config-updated` 事件实现热更新。

## 3. 使用方法

1. 将 `QuickCapture.js` 放入 Vivaldi 资源目录的 `Javascripts/` 下
2. 在 `window.html` 中引入脚本
3. 打开 Vivaldi 截图功能（快捷键或菜单），鼠标悬停在目标元素上，覆盖层会自动高亮
4. 点击确认选区，截图按配置模式输出

## 4. 设计思路

### 原生截图区域劫持

QuickCapture 的核心难点在于：Vivaldi 的截图选择器有自己的 `#capture-area` 元素和事件处理器。模组需要在不破坏原生功能的前提下，叠加自己的悬停检测和选区逻辑。

**方案**: 通过 `gnoh.getReactProps()` 读取原生 `captureArea` 的 React 事件处理器（`onPointerDown`/`onPointerMove`/`onPointerUp`），在自定义事件处理中选择性调用原生处理器或跳过。

### 样式保存/恢复机制

使用 `WeakMap` (`nativeCaptureAreaStyleState`) 保存原生 `captureArea` 的样式属性（`background`, `border-color`, `border-width`, `visibility`, `pointer-events`），在截图完成后精确恢复，避免影响 Vivaldi 原生 UI。

### 覆盖层 (Overlay) 实现

`#quick-capture-overlay` 是一个 `position: fixed`、`z-index: 1003` 的浮层，通过 `boxShadow: '0 0 9999px rgba(0,0,0,0.5)'` 实现大面积遮罩效果，白色边框指示选区范围。使用 `transition` 实现平滑的选区变化动画。

### delegateToVivaldiSelector 模式

在 `default` 模式下，模组不直接截图，而是通过 `simulateSelect()` 模拟原生截图选择器的交互（`onPointerDown` -> `onPointerMove` -> `onPointerUp`），将选区委托给 Vivaldi 原生处理。这允许用户在选区确认后使用 Vivaldi 的编辑/标注功能。

### Webview 缩放补偿

在 `updateCaptureRect()` 中，读取 `--uiZoomLevel` CSS 变量计算实际缩放比例，确保覆盖层在不同缩放下与 webview 内容精确对齐。

### Escape 键取消

全局监听 `keydown` 事件，Escape 键触发 `closeCaptureArea()` 清理所有状态并恢复原生样式。

### 防重入保护

`isCapturing` 标志位防止并发截图操作。`captureSessionId` 单调递增，确保异步操作中旧会话不会干扰新会话。

### 事件清理

`cleanupCaptureListeners()` 在每次截图完成或取消时移除所有事件监听器，防止内存泄漏。`pointerdown` 使用 `{ once: true, capture: true }` 确保只触发一次。
