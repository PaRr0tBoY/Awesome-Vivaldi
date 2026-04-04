# Essential Tabs — Vivaldi 实现规格书

## 1. 设计目标与核心概念

Zen Browser 的 Essential Tabs 是在所有工作区中保持显示的固定标签页网格。本实现将其移植到 Vivaldi：

- 通过 MutationObserver 监听 `.resize` 内标签页变化
- 前 9 个非标签栈标签自动进入 `#essential-wrapper`
- 超出或变成标签栈时自动移出
- `#essential-wrapper` 是 `.resize` 的兄弟元素（不在 overflow 裁剪区域内）
- auto-hide 切换时 outerObserver 重新注入 wrapper

**技术方案**：outerObserver 监听 `#browser` 子树变化，`.resize` 重建后重新注入 `#essential-wrapper`。

---

## 2. 文件结构

```
Vivaldi7.9Stable/
├── CSS/
│   └── Essential.css
├── Javascripts/
│   └── Essential.js
└── Doc/
    └── EssentialTabs.md
```

---

## 3. CSS 设计

### 3.1 配置变量

```css
:root {
  --essential-cols: 3;
  --essential-rows: 3;
  --essential-gap: 6px;
  --essential-tab-height: 46px;
  --essential-icon-size: 18px;
  --essential-animation: 220ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 3.2 DOM 结构

```
#tabs-tabbar-container.left/right
└── #tabs-container
    ├── #essential-wrapper          ← sticky，.resize 的兄弟
    └── .resize (overflow: hidden)
        └── .tab-strip
            ├── .tab-position      ← 普通标签
            ├── .accordion-toggle-arrow
            ├── .separator
            └── ...
```

### 3.3 Essential Wrapper 容器

```css
#essential-wrapper {
  position: sticky;
  top: 0;
  z-index: 100;

  display: none;
  grid-template-columns: repeat(var(--essential-cols), 1fr);
  grid-auto-rows: min-content;
  gap: var(--essential-gap);
  width: 100%;
  padding: var(--essential-gap);
  overflow: visible;
}

#tabs-tabbar-container.left #essential-wrapper,
#tabs-tabbar-container.right #essential-wrapper {
  display: grid;
}

#tabs-container:has(#essential-wrapper) {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: 100vh;
}
```

### 3.4 Essential Tab 视觉

```css
#essential-wrapper .tab-position {
  height: var(--essential-tab-height);
  border-radius: 6px;
  background: var(--colorBgAlpha);
  border: 1px solid var(--colorHighlightBgDark);
  display: flex;
  align-items: center;
  padding: 0 6px;
  gap: 4px;
}

#essential-wrapper .tab-position .tab-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
}

#essential-wrapper .tab-position .close {
  opacity: 0;
}

#essential-wrapper .tab-position:hover .close {
  opacity: 1;
}

/* Essential indicator dot */
#essential-wrapper .tab-position::before {
  content: "";
  position: absolute;
  top: 4px;
  right: 4px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--colorAccentBg);
}

/* 入场动画 */
#essential-wrapper .tab-position.inserting {
  opacity: 0;
  transform: scale(0.85);
}

#essential-wrapper .tab-position.inserted {
  opacity: 1;
  transform: scale(1);
}
```

---

## 4. JavaScript 设计

### 4.1 配置

```javascript
const ESSENTIAL_CONFIG = {
  maxCols: 4,
  defaultCols: 3,
  defaultRows: 3,
  maxTabs: 9,
  storageKey: "vivaldi-essential-tabs",
  storageVersion: 2,
};
```

### 4.2 核心逻辑

```javascript
class EssentialManager {
  // _injectWrapper: 创建 #essential-wrapper 作为 .resize 的兄弟
  // _bindOuterObserver: 监听 #browser，wrapper 消失时重新注入
  // _bindInnerObserver: 监听 .resize，标签增删时重新同步
  // _syncEssentialTabs: 比较 candidates 和 wrapper 内容，移入/移出
  // _getCandidateTabPositions: 从 .resize 内获取所有非标签栈标签
  // _isTabStack: 判断 .is-substack / .svg-tab-stack / .accordion
  // _isAccordionChild: 判断 .in-accordion
}
```

### 4.3 标签栈检测

```javascript
_isTabStack(tp) {
  return (
    tp.classList.contains("is-substack") ||
    tp.querySelector(".svg-tab-stack") !== null ||
    tp.classList.contains("accordion")
  );
}

_isAccordionChild(tp) {
  return (
    tp.classList.contains("in-accordion") ||
    tp.querySelector(".tab.in-accordion") !== null
  );
}
```

### 4.4 auto-hide 切换处理

```
auto-hide 切换 → #tabs-container 重建 → #essential-wrapper 消失
  → outerObserver 触发
  → 检测到 wrapper 不存在
  → _injectWrapper() 重新创建
  → _syncEssentialTabs() 重新同步
```

---

## 5. 实现检查清单

- [ ] Essential.css wrapper 定位（sticky, grid）
- [ ] Essential.css `#tabs-tabbar-container.left/right` 条件显示
- [ ] Essential.css `.tab-position` 样式重置
- [ ] Essential.css `.close` hover 显示
- [ ] Essential.css `.inserting` / `.inserted` 动画
- [ ] Essential.css `#tabs-container:has()` flex column 布局
- [ ] Essential.js wrapper 作为 .resize 兄弟注入
- [ ] Essential.js outerObserver 监听 #browser 重建
- [ ] Essential.js innerObserver 监听 .resize 变化
- [ ] Essential.js `_isTabStack` / `_isAccordionChild` 检测
- [ ] Essential.js `_getCandidateTabPositions` 从 .resize 遍历
- [ ] Essential.js `_syncEssentialTabs` 核心同步
- [ ] Essential.js `_moveTabIn` / `_moveTabOut`
- [ ] Essential.js `_reorderWrapper`
- [ ] Essential.js `_suppressSync` 防死循环
- [ ] Essential.js localStorage 持久化
- [ ] window.essentialManager 单例
