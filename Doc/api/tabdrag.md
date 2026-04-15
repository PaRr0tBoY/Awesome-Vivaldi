# Vivaldi 标签页拖拽实现分析

## 1. tabsPrivate API

### 核心拖拽方法

```javascript
vivaldi.tabsPrivate.startDrag(tabId, dragData, callback);
```

**dragData 参数结构：**
```javascript
{
  windowId: number,           // 源窗口ID
  mimeType: string,           // MIME类型（内部使用 vivaldi/x-* 系列）
  customData: string,         // JSON.stringify({
                              //   ids: number[],      // 被拖拽的标签页ID数组
                              //   active: number,      // 当前活动标签页ID
                              //   activeIndex: number, // 原位置索引
                              //   dragSource: string,  // "main" 等来源标识
                              //   sourceWindow: number  // 源窗口ID
                              // },
  imageData: ArrayBuffer,     // 拖拽预览图数据
  url: string,                // 标签页URL
  title: string,              // 标签页标题
  posX: number,               // 拖拽起点X（相对于屏幕）
  posY: number,               // 拖拽起点Y
  width: number,              // 预览图宽度
  height: number,            // 预览图高度
  cursorX: number,            // 光标偏移X
  cursorY: number,            // 光标偏移Y
}
```

### 拖拽事件监听

```javascript
vivaldi.tabsPrivate.onDragEnd.addListener(() => {
  // 拖拽结束时回调
  // 触发内部 hW.emitDragEnd() 事件系统
});
```

## 2. 内部事件系统 (hW)

Vivaldi 使用自定义事件类 `hW`（Class field private `#je`）管理标签页拖拽状态：

```javascript
const hW = new (class {
  #je = [];
  addListener(e) { this.#je.push(e); }
  removeListener(e) { this.#je = this.#je.filter(t => t !== e); }
  emitDragStart(e, t) { /* 通知所有监听器：{ startDragging: !0, windowId, pageIds } */ }
  emitDragEnd() { /* 通知所有监听器：{ endDragging: !0 } */ }
})();
```

**事件负载格式：**
- `emitDragStart`: `{ startDragging: true, windowId, pageIds: [tabId1, tabId2, ...] }`
- `emitDragEnd`: `{ endDragging: true }`

## 3. 全局拖拽状态 (QW)

QW 是全局拖拽状态对象：

```javascript
{
  dndMode: "move" | "add" | undefined,
  dndDropZone: "left" | "right" | "top" | "bottom" | "center" | undefined,
  dndDropPageId: number | undefined
}
```

**dndMode 含义：**
- `"move"`: 标签页在窗口内移动（同一窗口内拖拽）
- `"add"`: 从其他窗口拖入，或添加新标签页
- `undefined`: 拖拽结束

**dndDropZone 含义（用于平铺/瓦片模式）：**
- `"left"`, `"right"`, `"top"`, `"bottom"`: 平铺目标区域
- `"center"`: 放下以取消平铺

## 4. 标签页 DOM CSS 类

### 拖拽相关类

| CSS 类 | 含义 |
|--------|------|
| `.tab` | 基础标签页元素 |
| `.tab-acceptsdrop` | 标签页接受放置（hover 时显示） |
| `.active` | 当前活动标签页 |
| `.highlighted` | 高亮选中状态 |
| `.marked` | 标记状态 |
| `.pinned` | 固定标签页 |
| `.iscut` | 被剪切的标签页 |

### 尺寸变体

| CSS 类 | 含义 |
|--------|------|
| `.tab-small` | 小尺寸标签页 |
| `.tab-mini` | 迷你尺寸 |

### 标签组/堆叠相关

| CSS 类 | 含义 |
|--------|------|
| `.tab-group` | 属于标签组的标签页 |
| `.tab-accordion` | 手风琴模式下的标签页 |
| `.tab-in-accordion` | 在手风琴容器内 |
| `.tab-first-in-group` | 组内第一个 |
| `.tab-last-in-group` | 组内最后一个 |

### 音频/媒体状态

| CSS 类 | 含义 |
|--------|------|
| `.audio-on` | 正在播放音频（包含 PiP） |
| `.audio-muted` | 已静音 |
| `.tab-captured` | 正在捕获/录制 |

### 其他状态

| CSS 类 | 含义 |
|--------|------|
| `.unread` | 未读标记 |
| `.isdiscarded` | 已丢弃（休眠） |
| `.insubstrip` | 在子标签栏中 |
| `.button-off` | 关闭按钮隐藏 |
| `.periodic-reload` | 定期重载启用 |
| `.force-hover` | 强制悬停样式 |

## 5. 核心处理函数

### handleTabPosition(extId, position)

计算并设置放置位置指示器。当用户拖拽标签页到另一个标签页上方时调用。

**position 参数：** `"before"` | `"after"` | `"over"` | `"none"`
- `"before"`: 放置在目标左侧/上方
- `"after"`: 放置在目标右侧/下方
- `"over"`: 放置在目标上方（触发堆叠）
- `"none"`: 清除放置位置

内部设置 `this.#We = { extId, position }` 然后调用 `forceUpdate()` 重绘放置指示器。

### startDragOverTimer(e)

带延迟的放置触发器，使用偏好设置 `kTabsStackingDndDelay`（默认 250ms）：

```javascript
startDragOverTimer = (e) => {
  const delay = this.props.prefValues[M.kTabsStackingDndDelay];
  clearTimeout(this.dragOverTimeoutId);
  this.dragOverTimeoutId = setTimeout(() => {
    if (this.state.isDragging) {
      VB.click(); // 触发点击以打开目标组
      this.setState({ hoveredPageId: this.currentHoveredId });
    }
  }, delay);
};
```

### moveDroppedTabs(windowId, tabs, activeTabId, targetIndex, group)

将一组标签页移动到指定位置：

```javascript
moveDroppedTabs: async function(e, t, n, i, s) {
  const workspaceId = T.Z.getActiveWorkspaceId(e);
  let groupOpts;
  if (s) {
    groupOpts = {
      group: s,
      workspaceId,
      fixedGroupTitle: ...,
      groupColor: ...
    };
  }
  t.map(tab => $.V(tab.id, groupOpts));
  await moveToIndex(e, t, i);  // 执行实际移动
  // ... 后续处理固定标签页等
}
```

### detachPage(tabId, screenX, screenY)

将标签页从当前窗口分离（拖出窗口时触发）。若 screenX/screenY 在窗口外，则分离到新窗口。

### windowDropHandler(e)

处理窗口级别的 drop 事件：

1. 解析 `dataTransfer` 中的拖拽数据
2. 检查标签页是否属于其他窗口
3. 若跨窗口：调用 `moveDroppedTabs`
4. 若同窗口且启用瓦片：`tilePages(a)`
5. 否则：`detachPage`

## 6. 拖拽流程

### 启动拖拽 (mousedown → mousemove > 5px)

```
mousedown on tab
  → mousemove (delta > 5px)
    → hW.emitDragStart(vivaldiWindowId, [tabId1, tabId2, ...])
    → A.Z.tabsPrivate.onDragEnd.addListener(a)  // 注册结束回调
    → A.Z.tabsPrivate.startDrag({ windowId, mimeType, customData, ... })
    → QW.dndMode = "move"
```

### 拖拽经过标签页 (onDragOver)

```
dragover on tab
  → 计算位置 (before/after/over)
  → handleTabPosition(extId, position)
  → startDragOverTimer()  // 延迟触发
    → setState({ hoveredPageId })
```

### 结束拖拽 (mouseup / onDragEnd)

```
mouseup / vivaldi.tabsPrivate.onDragEnd fired
  → hW.emitDragEnd()
  → 解析放置目标
  → 调用 moveDroppedTabs / detachPage
  → QW.dndMode = undefined
```

## 7. 标签页平铺(Tiling)拖拽

当 `kTabsTilingDragAndDrop` 启用时，拖拽到窗口边缘会根据位置触发平铺：

```javascript
// handleDragOver 中计算放置区域
const n = (e.clientX - t.left) / t.width;  // 0-1 水平比例
const i = (e.clientY - t.top) / t.height;  // 0-1 垂直比例
// n <= 0.3 → "left"
// n >= 0.7 → "right"
// i <= 0.3 → "top"
// i >= 0.7 → "bottom"
// 否则 → "center"
```

## 8. 偏好设置

| 偏好键 | 含义 |
|--------|------|
| `kTabsStackingDndDelay` | 放置检测延迟（默认250ms） |
| `kTabsTilingDragAndDrop` | 启用平铺拖放 |
| `kTabsStackingMode` | 堆叠模式：`dotted`, `substrip`, `accordion` |
| `kTabsStackingPreferDotted` | 优先使用点状指示器 |

## 9. 相关文件

- **bundle.js**: `/Others/UsefulResources/Source/pretty-bundle.js`（主实现，约33万行）
- **API文档**: `/Others/UsefulResources/Source/api.md`
- **相关行号**: 83466-83540 (hW事件类), 83522 (startDrag调用), 87029 (handleTabPosition), 87070-87180 (windowDropHandler), 13259 (moveDroppedTabs)
