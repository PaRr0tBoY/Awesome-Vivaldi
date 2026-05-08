[English](../AutoHidePanel.md) | 简体中文

---

# AutoHidePanel 设计与实现分析

本文基于当前工作区中的 [AutoHidePanel.js](/Vivaldi7.9Stable/Javascripts/AutoHidePanel.js)。

## 1. 依赖

### Vivaldi 内部 API

无直接 chrome.* / vivaldi.* API 调用。所有交互通过 DOM 事件和模拟点击完成。

### 外部依赖

- **PointerEvent API**: 用于模拟完整的点击事件链
- **CSSStyleSheet API**: 动态注入样式表 (`adoptedStyleSheets`)
- **`setInterval` / `clearTimeout`**: 延迟打开和关闭面板的定时器

### 模组间依赖

- **AskInPage / ModConfig 系统**: 通过 `vivaldi-mod-config-updated` 事件读取共享配置文件 `.askonpage/config.json` 中的 `mods.autoHidePanel` 字段

## 2. 功能

鼠标悬停在侧边栏面板按钮上时自动打开对应面板，鼠标移回网页区域时自动关闭面板。

### 配置项

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `auto_close` | `true` | 是否在鼠标移回网页时自动关闭面板 |
| `close_fixed` | `true` | 是否也对固定(非 overlay)面板执行自动关闭 |
| `open_delay` | `300` ms | 鼠标悬停后延迟多久打开面板 |
| `switch_delay` | `40` ms | 切换面板的延迟 |
| `close_delay` | `280` ms | overlay 模式下的关闭延迟 |
| `close_delay_fixed` | `3000` ms | 固定模式下的关闭延迟(更长，避免误触) |

### 行为预期

1. 鼠标悬停面板按钮 (不按 Alt/Ctrl/Shift/Meta 修饰键) -> 延迟 `open_delay` 后触发 click 打开面板
2. 鼠标从面板按钮移开 -> 取消待打开的定时器
3. 鼠标进入 `#webview-container` -> 启动关闭定时器
4. 鼠标返回 `#panels-container` -> 取消关闭定时器
5. 拖拽进入面板按钮 -> 立即切换面板(不延迟)
6. webview 的 `delay_visibility` 动画开始 -> 触发关闭

## 3. 使用方法

### 启用

将 `AutoHidePanel.js` 放入 Vivaldi 资源目录，添加到 `window.html` 的 `<script>` 标签中。

### 配置

通过 ModConfig 系统在 `.askonpage/config.json` 中写入：

```json
{
  "mods": {
    "autoHidePanel": {
      "auto_close": true,
      "close_fixed": true,
      "open_delay": 300,
      "switch_delay": 40,
      "close_delay": 280,
      "close_delay_fixed": 3000
    }
  }
}
```

运行时修改配置后，`vivaldi-mod-config-updated` 事件会触发重新加载。

### 使用技巧

- 按住 Alt/Ctrl/Shift/Meta 时悬停不会触发面板打开，方便拖拽操作
- `close_delay_fixed` 设为 3000ms 是为了避免固定面板模式下频繁误触关闭；如果希望更灵敏，可以减小此值

## 4. 设计思路

### 设计初衷

Vivaldi 的侧边栏面板默认需要点击才能打开/关闭。AutoHidePanel 模拟鼠标悬停打开、离开关闭的工作流，减少交互步骤。

### 核心架构

```
waitForElement(#browser)
  -> waitForElement(#panels)
  -> waitForElement(#webview-container)
  -> fixWebViewMouseEvent()
  -> panelMouseOver()
```

初始化时依次等待三个关键 DOM 元素就绪，然后注入 CSS 修复和事件监听。

### 关键实现

**模拟点击**: Vivaldi 的面板按钮不响应简单的 `element.click()`，需要派发完整的 PointerEvent 链：`pointerdown -> mousedown -> pointerup -> mouseup -> click`。

**WebView 鼠标事件穿透修复**: 当面板容器处于 hover 状态时，通过 CSS `#main:has(#panels-container:hover) #webview-container { pointer-events: none }` 阻止 webview 抢占鼠标事件。这是解决 Vivaldi 中 `webview` 元素拦截鼠标事件的标准做法。

**按钮选择器**: 使用 `:is([data-name^="Panel"], [data-name^="WEBPANEL_"], ...)` 统一匹配原生面板和 Web Panel 按钮，同时排除 `PanelWeb` 按钮。

**面板模式检测**: `isOverlayPanel()` 检查 `#panels-container.overlay` 是否存在，决定使用哪个关闭延迟。overlay 模式面板展开后会覆盖网页区域，可以快速关闭；固定模式面板始终可见，使用更长延迟避免意外关闭。
