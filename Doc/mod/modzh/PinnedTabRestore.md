[English](../PinnedTabRestore.md) | 简体中文

---

# PinnedTabRestore 设计与实现分析

本文基于当前工作区中的 [PinnedTabRestore.js](/Vivaldi7.9Stable/Javascripts/PinnedTabRestore.js) 和 [PinnedTabRestore.css](/Vivaldi7.9Stable/CSS/PinnedTabRestore.css)。

## 1. 依赖

### Vivaldi 内部 API

- **`chrome.tabs.get`**: 获取标签信息和 `vivExtData`
- **`chrome.tabs.update`**: 修改标签 `vivExtData` 和恢复 URL
- **`chrome.tabs.query`**: 查询当前窗口所有标签
- **`chrome.tabs.onUpdated`**: 监听标签 pin/unpin 和 URL 变化
- **`chrome.scripting.executeScript`**: 注入修饰键追踪器到页面 MAIN world
- **`tab.vivExtData`**: Vivaldi 扩展数据字段，用于存储原始 URL

### 外部依赖

- **MutationObserver**: 监听 `.tab-strip` 内部变化和 `#browser` 结构变化
- **requestAnimationFrame**: 修饰键轮询循环
- **Google Favicon API**: `https://www.google.com/s2/favicons?domain=...&sz=32` 用于获取原始 URL 的 favicon

### 模组间依赖

无直接模组间依赖。

## 2. 功能

追踪固定标签(pinned tab)的 URL 变化，在 URL 被导航到其他页面时提供视觉指示和一键恢复功能。

### 核心特性

- 标签被 pin 时自动记录原始 URL 到 `vivExtData.originalPinnedUrl`
- URL 变化时在标签上显示 Zen 风格的视觉指示 (favicon 区域覆盖按钮 + 分割线 + 原始 URL 子标签)
- 鼠标悬停时根据修饰键动态切换子标签文案
- 右键菜单提供三种操作：恢复到原始 URL / 替换原始 URL 为当前 / 分离为独立标签
- 启动时自动扫描并恢复所有被修改的固定标签
- 双层 MutationObserver 确保 `.tab-strip` 重建后重新绑定

### 修饰键行为 (悬停时)

| 按键 | 子标签文案 | 点击行为 |
|------|-----------|---------|
| 无 | "Back to pinned url" | 恢复到原始 URL |
| Alt | "Replace pinned url with current" | 将当前 URL 设为新的固定 URL |
| Cmd/Ctrl | "Separate from pinned tab" | 取消固定并保留当前 URL |

## 3. 使用方法

### 启用

1. 将 `PinnedTabRestore.js` 放入 Vivaldi 资源目录，添加到 `window.html`
2. 将 `PinnedTabRestore.css` 放入 CSS 目录

### 交互方式

- 固定标签的 URL 被修改后，favicon 区域出现重置按钮
- 悬停标签头查看原始 URL 子标签
- 点击重置按钮恢复原始 URL
- 右键标签头弹出上下文菜单选择操作

### 启动恢复

`RESTORE_ON_STARTUP = true` 时，浏览器启动后首次扫描会自动将所有被修改的固定标签恢复到原始 URL。

## 4. 设计思路

### 设计初衷

Vivaldi 的固定标签在导航到新页面后不会自动恢复。用户可能通过固定标签打开邮箱，但随后在该标签中打开了其他链接，导致固定标签"迷路"。PinnedTabRestore 记录固定时的原始 URL，提供一键回退。

### 核心架构

```
init()
  -> setupTabListeners()     // chrome.tabs.onUpdated 监听 pin/unpin
  -> setupContextMenu()      // 右键菜单注入
  -> observeTabStripInner()  // 内层 Observer: 监听 .tab-strip 子节点变化
  -> observeStructure()      // 外层 Observer: 监听 #browser 检测 .tab-strip 重建
  -> scanAllPinnedTabs(true) // 首次扫描 + 恢复
```

### 关键实现

**数据持久化**: 使用 Vivaldi 的 `vivExtData` 字段 (通过 `chrome.tabs.update` 写入 JSON 字符串) 存储 `originalPinnedUrl`。这比 localStorage 更可靠，因为数据绑定到具体标签，跨窗口保持一致。

**修饰键追踪**: 由于 `window.html` 脚本无法直接接收页面内的键盘事件，采用注入方案：
1. `injectModTracker()` 通过 `chrome.scripting.executeScript({ world: 'MAIN' })` 向活动标签注入事件监听器
2. `pollModifiers()` 通过 `requestAnimationFrame` 循环读取页面上的 `window.__ptr_modifiers` 状态
3. 使用 `_modTrackGen` 代数计数器防止过期异步回调污染状态

**双层 Observer**:
- 内层 (`observeTabStripInner`): 监听 `.tab-strip` 的子节点变化，触发重新标记
- 外层 (`observeStructure`): 监听 `#browser` 的子树变化，检测 `.tab-strip` 是否被重建 (如工作区切换)。重建时重新绑定内层 Observer 并调用 `scanAllPinnedTabs(false)` (仅标记不恢复)

**启动恢复 vs DOM 重建区分**: `scanAllPinnedTabs(restore)` 的 `restore` 参数控制是否实际调用 `chrome.tabs.update` 恢复 URL。启动时 `restore=true`，DOM 重建时 `restore=false` 仅重新注入 UI。

**UI 注入结构**:
```
.tab-wrapper[pinned-changed="true"]
  -> .tab
    -> .tab-header
      -> .tab-reset-pin-button  (absolute overlay on favicon, 显示原始 favicon)
      -> .pinned-tab-divider    (竖线分隔符)
      -> .favicon
      -> .title
      -> .pinned-tab-sublabel   (显示原始 URL path)
```

**URL 比较**: 忽略 hash fragment (`split("#")[0]`)，避免锚点变化误判为 URL 修改。
