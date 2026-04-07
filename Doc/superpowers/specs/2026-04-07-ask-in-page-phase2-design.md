# AskInPage Phase 2 — UI 框架重构设计规格书

## 概述

Phase 2 在 Phase 1 WebPanel 注册基础上，完全重构 UI 组件结构，严格遵循设计稿，实现类 ChatGPT 的对话界面。

---

## 布局结构（从上到下）

```
┌──────────────────────────────────┐
│  [新建对话]                      │ ← 顶部工具栏（仅此按钮）
├──────────────────────────────────┤
│ ┌──────────────────────────────┐ │
│ │ [🌐] 标题标题…      [×]     │ │ ← Context Card
│ │       url.example.com        │ │
│ └──────────────────────────────┘ │
│                                  │
│  [🔍 Analyze] [💡 Explain] [📝 Summarize]  ← /命令选择（三按钮）
│                                  │
│ ┌──────────────────────────────┐ │
│ │ [🔍 /Analyze] ×              │ │ ← 选中后 chip 替代按钮区
│ │                              │ │
│ │  输入框...                   │ │
│ │                              │ │
│ │ [+]                    [🚀]  │ │ ← 底部工具栏
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

---

## Context Card

### 规格

| 属性 | 值 |
|------|-----|
| 尺寸 | 150px × 50px，`overflow: hidden` |
| 图标 | 左侧，32×32，深色圆角方块（brand icon） |
| 标题 | 上右侧，单行，`text-overflow: ellipsis`，白色 13px，font-weight 500 |
| URL | 下右侧，小字 11px，`text-overflow: ellipsis`，次要色 #8B949E |
| 关闭按钮 | 右上角 20×20，默认 `opacity: 0`，hover 时 `opacity: 1` |
| 圆角 | 12px |
| 背景 | #2D3139 |
| 边框 | 1px solid rgba(255, 255, 255, 0.08) |
| 打开默认行为 | 自动填充当前激活 tab 的 title + hostname |

### 交互

- 点击关闭按钮 → `context-closed` 自定义事件 + 隐藏卡片
- 面板打开时若存在当前 tab → 自动显示 Context Card

---

## /命令选择区

### 三个命令按钮

| 命令 | 图标 |
|------|------|
| Analyze | 放大镜（`🔍`） |
| Explain | 灯泡（`💡`） |
| Summarize | 列表/文档（`📝`） |

### 按钮样式

- pill 形状，`border-radius: 100px`
- 背景 `#3A3F47`，文字 `#8B949E`，hover 时文字变白
- 字体 12px，font-weight 500
- 内边距 `4px 10px`
- 间距 8px

### 显示条件

- **无选中命令时**：显示三个按钮
- **有选中命令时**：三个按钮隐藏

---

## /命令 Chip（选中后）

### 规格

| 属性 | 值 |
|------|-----|
| 样式 | pill，`border-radius: 100px` |
| 背景 | #3A3F47 |
| 文字 | 白色 12px，含前缀 `/` 如 `/Analyze` |
| 关闭图标 | 右侧 × 号，默认 `opacity: 0`，hover 时 `opacity: 1` |
| 位置 | 位于输入框顶部左侧 |

### 交互

| 行为 | 实现 |
|------|------|
| 选中命令 | chip 出现在输入框顶部，三个按钮隐藏 |
| Backspace | 在 chip 右侧且输入框为空时：第一次 keydown 聚焦 chip，第二次删除 chip |
| Hover chip | 右侧 × 显现 |
| 点击 × | 删除 chip，三个按钮重新出现 |

### 删除 chip 事件

- dispatch `command-closed` 自定义事件
- 触发 `showSlashCommands()`

---

## 输入框容器

### 规格

| 属性 | 值 |
|------|-----|
| 背景 | #1C1F23 |
| 圆角 | 24px |
| 边框 | 1px solid rgba(255, 255, 255, 0.08) |
| 阴影 | 0 8px 30px rgba(0, 0, 0, 0.5) |
| 内边距 | 14px |
| 相对面板 | `position: absolute`，底部 20px，左右 16px |

### 输入框

- `textarea`，placeholder: "Ask a question about this page..."
- `background: transparent`，`border: none`，`outline: none`
- `caret-color: #FFFFFF`，字体 14px
- `resize: none`，`max-height: 120px`
- 自动增高

---

## 底部工具栏

### 规格

| 元素 | 位置 | 样式 |
|------|------|------|
| + 按钮 | 左侧 | 28×28，透明背景，#8B949E 图标 |
| 提交按钮 | 右侧 | 32×32 蓝色圆形 `#33B1FF`，白色向上箭头图标 |

### 提交按钮

- `border-radius: 50%`
- 背景 `#33B1FF`，hover 时亮度 1.1，mousedown 时 scale 0.92

---

## 圆角体系

| 元素 | radius |
|------|--------|
| 输入框容器 | 24px |
| Context card | 12px |
| /命令 chip | 100px |
| 图标按钮（新建对话等） | 6px |
| 卡片图标容器 | 8px |

---

## 响应式设计

- 主要目标：**竖屏手机尺寸**（宽度远小于高度）
- 最大宽度不超过高度（1:1 时停止扩展）
- 容器约束：`max-width: min(100%, 500px)`
- 输入框容器左右固定 16px 边距，底部 20px

---

## 设计 Token

```javascript
const tokens = {
  bg: "#0A0B0D",           // 面板背景
  surface: "#1C1F23",      // 输入框容器
  elevated: "#2D3139",     // Context card / chip 背景
  border: "1px solid rgba(255, 255, 255, 0.08)",
  accent: "#33B1FF",       // 提交按钮
  chipBg: "#3A3F47",       // 命令按钮/chip 背景
  textPrimary: "#FFFFFF",
  textSecondary: "#8B949E",
  textMuted: "#484F58",
};
```

---

## 文件结构

```
Vivaldi7.9Stable/
├── Javascripts/
│   └── AskInPage.js          # 重构后的主模块（Phase 1 + Phase 2）
└── CSS/
    └── AskInPage.css         # 独立样式文件（Phase 2 新增）
```

---

## 阶段验收标准

- [ ] 顶部工具栏仅显示新建对话按钮
- [ ] Context Card 150×50，打开即填充当前 tab
- [ ] 三个 / 命令按钮在无选中命令时显示
- [ ] 选中命令后 chip 出现、三个按钮隐藏
- [ ] Backspace 在 chip 旁可聚焦、可删除
- [ ] Hover chip 显示 ×，点击删除 chip，三个按钮重现
- [ ] 底部工具栏 + 在左，蓝色圆形提交按钮在右
- [ ] 所有元素圆角一致，无杂糅不对齐
- [ ] 响应式适配竖屏，可扩展至 1:1
