[English](../AskOnPage.md) | 简体中文

---

# AskOnPage 设计与实现分析

重新定义 Ctrl+F —— 一个通用页面查询栏，在原生文本查找和 AI 页面理解之间智能路由。

> **文件**: `AskOnPage.js` (~900行) + `AskOnPage.css` (~180行)
> **版本**: 2026.7.19
> **作者**: Ryan (Acid)

---

## 1. 产品模型

```
Ctrl+F → 通用查询栏
              │
     classifyIntent(query)
              │
      ┌───────┴───────┐
      │               │
   "find"           "ask"
   关键词            自然语言
      │               │
 window.find()    AI 流式回答
  页面高亮 +       Markdown 渲染
  匹配计数          + 行内引用
      │               │
  "3/12"          点击 → 跳转
                  页面原文位置
```

核心理念：Ctrl+F 是浏览器中最高频的信息寻找动作。将它从文本匹配升级为页面理解，创造最自然的 AI 入口。

---

## 2. 依赖

### 2.1 Vivaldi / Chrome API

| API | 用途 |
|-----|------|
| `chrome.scripting.executeScript` | 页面内容提取 + 原生 `window.find()` |
| `chrome.tabs.query` | 获取当前活动标签页 |
| `vivaldi.tabsPrivate.onKeyboardShortcut` | 浏览器级拦截 Ctrl+F |
| `navigator.storage.getDirectory()` (OPFS) | 读取 `.askonpage/config.json` 共享 AI 配置 |

### 2.2 模组间依赖

| 模组 | 关系 |
|-----|------|
| `ModConfig.js` | 共享 AI 配置（`askOnPage` key），支持独立覆盖 |
| `VividPeek.js` | Ctrl+F 共存 — Peek 活跃时不拦截 |

---

## 3. 架构

### 3.1 意图路由

```
classifyIntent(query):
  ├─ 有疑问标记? (?/？/什么/why/how/…) → ask
  ├─ ≤ 4 词 / 短 CJK → find
  ├─ 长文本 (>20字) → try-find（先精确匹配，无结果则 AI）
  └─ 默认 → ask

Enter 触发:
  ├─ Shift+Enter → 强制 AI
  ├─ find → doFind() → 0 匹配? → 自动 doAsk()
  └─ ask → doAsk()
```

### 3.2 原生查找引擎

- 通过 `chrome.scripting.executeScript` 注入 `window.find()`
- 状态机持久化于 `window.__aifb`，跨调用保持状态
- 总匹配数：`TreeWalker` 遍历可见文本节点统计
- 方向键导航：↑ 上一个匹配，↓ 下一个匹配
- 输入时实时高亮（150ms 防抖）

### 3.3 AI 管线

```
extractPage()                          // Content script 注入
  ↓                                    // 候选评分（article/main）
askAI(query, page)
  ↓
messages: [system + 历史轮次 + user]
  ↓
fetch() SSE 流式传输                   // OpenRouter OpenAI 兼容
  ↓
streamSSE() → refreshTurn()            // 增量 Markdown 渲染
  ↓
detectCitations()                      // 后处理：模糊页面匹配
```

**多轮对话：** 所有历史 Q&A 作为 `user`/`assistant` 消息发送。Tab 级作用域 — 关闭/打开查找栏保持，页面跳转清空。

### 3.4 引用系统

三层检测：

| 层 | 方法 | 触发时机 |
|-------|--------|---------|
| Markdown 解析 | `> "text"` / `"text"` / `「text」` → `<span class="ai-find-cite">` | `mdToHtml()` 阶段 |
| 后处理检测 | 遍历文本节点，与页面内容模糊匹配 | AI 流式完成后 |
| 点击跳转 | `window.find()` + 渐进式子串裁剪（≥60% 匹配阈值） | 用户点击引用 |

---

## 4. AI 配置

```javascript
AI_CONFIG = {
  model: "meta-llama/llama-3.3-70b-instruct:free",     // 主模型
  fallbackModel: "google/gemma-4-26b-a4b-it:free",      // 空响应重试
  timeout: 30000, temperature: 0.3, maxTokens: 2048,
}
```

共享配置 key：`askOnPage`（可在 ModConfig 设置界面独立覆盖）。

System prompt 强制：
- 仅基于页面内容回答
- 引用必须是页面原文语言（逐字对照，禁止翻译）
- 引用穿插在段落中（不集中堆在结尾）

---

## 5. UI 设计

### 5.1 DOM 结构

```
#ai-find-bar (右上角, 360px)
  .ai-find-shell        ← 输入行（胶囊 → 有答案时底部变平）
    #ai-find-input      ← "Find or ask…"
    .ai-find-meta        ← "3/12" 匹配计数
  #ai-find-answer        ← 无缝延伸（max-height 动画）
    .ai-find-inner       ← 边框/阴影容器
      .ai-find-turn      ← 每轮 Q+A
      .ai-find-pager     ← "← 2/3 →"
```

### 5.2 关键交互

| 操作 | 效果 |
|--------|--------|
| `Ctrl+F` | 打开/关闭 |
| 输入关键词 | 实时 `window.find()` 高亮 |
| 输入问题 + `Enter` | AI 查询 |
| `Shift+Enter` | 强制 AI（绕过意图路由） |
| `Escape` | 关闭 / 取消流式 |
| `↑` / `↓` | 查找模式：上/下一个匹配。多轮：翻页 |
| 点击引用 | `window.find()` → 平滑滚动到原文位置 |

---

## 6. 设计决策

1. **替换而非扩展**：CSS 隐藏原生 `.find-in-page-wrapper`，自定义栏接管一切。
2. **查找优先**：任何输入先尝试页面匹配——从页面复制文本导航而非查询。
3. **无缝面板**：输入框和答案共享同一个视觉容器——无独立弹窗或模态框。
4. **Tab 级记忆**：对话在开关查找栏间保持，页面跳转时清空。
5. **双模型容错**：空/垃圾响应自动切换备用模型重试。
