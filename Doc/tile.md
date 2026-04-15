# Vivaldi 分屏（Tiling）功能分析

## 概述

Vivaldi 的分屏功能称为 **Page Tiling** 或 **Tab Tiling**，允许用户将多个标签页平铺排列在同一个窗口中，类似"分屏"操作。

---

## 核心数据结构

### `vivExtData.tiling` 对象

```javascript
{
  id: string,      // 分屏组唯一标识
  index: number,   // 在分屏组内的位置
  layout: string,  // 布局方向: "row" | "column"
  type: string     // 类型: "selection" 等
}
```

所有分屏标签页通过 `tab.vivExtData.tiling` 存储布局信息。

---

## 关键机制

### 1. 分屏创建与标识

- `TILE_INITIALIZED` action 初始化分屏状态
- `PAGE_TILE_ADD_PAGES` action 添加页面到现有分屏
- 每个分屏组有唯一 `id`，组内标签共享此 id

### 2. 布局方向

| layout 值 | 含义 |
|-----------|------|
| `row` | 水平并排（上下排列） |
| `column` | 垂直并排（左右排列） |

### 3. 拖放排序

- `dropZone` 标识拖放目标区域
- `M.kTabsTilingDragAndDrop` 偏好设置控制是否启用拖放
- `tilesState` 维护当前分屏状态

### 4. Tab Strip 中的 CSS 钩子

- `.tile` — 分屏中的标签
- `.tiled.visible` — 可见的分屏状态
- `.tab-dropzone.movingtile.dropcenter` — 拖放目标区
- `.narrow-tiling` — 窄屏分屏模式

---

## 相关命令

| Command | 功能 |
|---------|------|
| `COMMAND_TAB_STACK_TILE_VERTICAL` | 垂直分屏 |
| `COMMAND_TAB_STACK_TILE_HORIZONTAL` | 水平分屏 |
| `COMMAND_TAB_STACK_TILE_GRID` | 网格分屏 |
| `TAB_STACK_TILE_GRID` | 网格布局 action |
| `TAB_STACK_TILE_HORIZONTAL` | 水平布局 action |
| `TAB_STACK_TILE_VERTICAL` | 垂直布局 action |

---

## 偏好设置

| Key | 作用 |
|-----|------|
| `M.kTabsTilingDragAndDrop` | 启用拖放分屏 |
| `M.kTabsTilingShowTitlebar` | 显示分屏标签页标题栏 |
| `M.kTabsTilingCollapseBorder` | 窄屏时折叠边框 |

---

## 标签页分组 vs 分屏

- **Tab Stack（标签页堆叠）**：多个标签组成一组，共享一个图标
- **Tab Tiling（分屏）**：标签页在窗口内平铺显示，同时可见

两者都使用 `vivExtData` 存储，但 tiling 有独立的 id 和 layout 系统。

---

## 参考文件

- `Vivaldi 7.9 Stable/CSS/VivalArc.css:744` — `.tile` 样式
- `Others/UsefulResources/Source/common.css:2091` — `.tiled.visible` 规则
- `Others/UsefulResources/CommandChain/Followandtile.json` — Tile 命令链示例
