# Vivaldi Auto-Hide 边缘检测机制分析

## 概述

Vivaldi 的 auto-hide 功能通过原生层 (C++) 与 JavaScript 层协作实现。原生层负责屏幕边缘的鼠标接近检测，JS 层负责响应状态变化并控制 UI 的 `show` class 切换。

---

## 核心流程

```
[Native: setHotSpot] → [Native: onMouseInHotSpot callback] → [JS: updateHotSpotStatus]
                                                                     ↓
                                                        [JS: Redux dispatch]
                                                                     ↓
                                                         [UI: show class toggle]
```

---

## 1. 热区注册 — `setHotSpot`

**文件位置**: `pretty-bundle.js:81525`

```javascript
A.Z.windowPrivate.setHotSpot(t, n, i, s)
```

参数:
- `t`: windowId
- `n`: position (`"top"`, `"bottom"`, `"left"`, `"right"`)
- `i`: width (panel width)
- `s`: height (panel height)

**调用时机**: 每次 `auto-hide-wrapper` 尺寸变化时 (`onResize`)

```javascript
const d = ci.useCallback((e) => {
  A.Z.windowPrivate.setHotSpot(t, n, i, s);
}, [...]);
```

**实现位置**: 原生 C++ 代码，未在 JS bundle 中

---

## 2. 鼠标状态监听 — `onMouseInHotSpot`

**文件位置**: `pretty-bundle.js:81613`

```javascript
A.Z.windowPrivate.onMouseInHotSpot.addListener(f)
```

回调函数 `f` 接收 `(windowId, status)`，status 为 `"above"` 或 `"away"`:

```javascript
const f = ci.useCallback((i, s) => {
  i === t.vivaldiWindowId &&
    r &&
    (li.Z.updateHotSpotStatus(i, s),   // 派发 Redux action 更新 hotSpotStatus
    "above" === s                        // 鼠标进入热区
      ? (c(),                            // 清除待执行的 setTimeout
        li.Z.updateAutoHideVisibility(i, e.position, {
          visible: !0,                   // 显示面板
          keepOpen: !1,
        }))
      : "away" === s &&                  // 鼠标离开热区
        u() &&                           // 检查是否应隐藏
        (c(),
        (n.current = setTimeout(() => {  // 300ms 延迟隐藏
          li.Z.updateAutoHideVisibility(i, e.position, {
            visible: !1,
          });
        }, 300))));
}, [...]);
```

---

## 3. 状态管理 — Redux Action

**文件位置**: `pretty-bundle.js:16288`

```javascript
updateHotSpotStatus(e, t) {
  u.Z.dispatch({
    actionType: "SET_HOT_SPOT_STATUS",
    windowId: e,
    status: t,
  });
}
```

---

## 4. UI 渲染 — `show` class

**文件位置**: `pretty-bundle.js:81733`

```javascript
className: Ai()("auto-hide-wrapper", {
  [b]: !0,          // position class (e.g., "top", "left")
  show: r,          // show class — r 由 hotSpotStatus 决定
  "has-tabbar": e.hasTabBar,
  "has-mainbar": e.hasMainBar,
})
```

`r` 的计算逻辑 (pretty-bundle.js:81545):

```javascript
"above" === J.ZP.getHotSpotStatus(o)
```

只有当 `hotSpotStatus === "above"` 时，`show` class 才会被添加。

---

## 5. 延迟隐藏机制

**隐藏延迟**: 300ms (`setTimeout`)

```javascript
// pretty-bundle.js:81708
"away" === s &&
  u() &&
  (c(),  // 清除之前的 timeout
  (n.current = setTimeout(() => {
    li.Z.updateAutoHideVisibility(i, e.position, {
      visible: !1,
    });
  }, 300)));
```

**防抖更新**: 100ms (`debounceUpdateAutoHideVisibility`)

```javascript
// pretty-bundle.js:16278
debounceUpdateAutoHideVisibility = (0, v.Z)((e, t, n) => {
  this.updateAutoHideVisibility(e, t, n);
}, 100);
```

---

## 6. 全屏状态处理

**文件位置**: `pretty-bundle.js:287619`

```javascript
const r = o && !p.ZP.isFullscreen(p.ZP.getActiveWindowId()) ? 12 : 0,
```

全屏模式下热区边缘阈值从 6px 增加到 12px。

---

## 状态机

```
                    ┌────────────────────────────────────────┐
                    │                                        │
                    ▼                                        │
  ┌─────────┐   mouse enter   ┌─────────┐   300ms timeout   ┌─────────┐
  │  "away" │ ──────────────▶ │ "above" │ ─────────────────▶ │ "away"  │
  │ (hidden)│                 │ (shown) │                   │(hidden) │
  └─────────┘ ◀────────────── └─────────┘      mouse leave   └─────────┘
                     │
                     │ visible: !0 (immediate)
                     └─────────────────────────────────────▶ show class
```

---

## 关键发现

1. **原生实现**: `setHotSpot` 的边缘检测逻辑在 C++ 层，JS 仅传递 panel 尺寸
2. **无 CSS 魔法**: `show` class 的添加完全由 JS 状态驱动，与 CSS hover 无关
3. **双层防抖**: 100ms debounce + 300ms 延迟隐藏，避免频繁闪烁
4. **keepOpen 标志**: 面板内部交互时 `keepOpen: true` 防止误隐藏
5. **全屏隔离**: 全屏模式下热区阈值翻倍 (6px → 12px)
