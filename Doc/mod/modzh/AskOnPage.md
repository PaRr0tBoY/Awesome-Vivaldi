[English](../AskOnPage.md) | 简体中文

---

# AskOnPage 设计与实现分析

本文基于当前工作区中的 [AskOnPage.js](/Users/acid/Desktop/VivaldiModpack/Vivaldi7.9Stable/Javascripts/AskOnPage.js)。

> **规模**: 10424 行 / 447KB，项目中最大的单文件模组。
> **版本**: v2026.4.18 / UI v74
> **作者**: PaRr0tBoY

---

## 1. 依赖

### 1.1 Vivaldi 内部 API

| API | 用途 | 行号 |
|-----|------|------|
| `vivaldi.prefs.get/set` | WebPanel 注册、workspace 数据读取 | L2760, L10240, L10264 |
| `vivaldi.tabsPrivate.get` | 获取 tab 扩展数据 | L2782 |
| `vivaldi.historyPrivate` | 浏览历史搜索（用于 history attachment） | L4694 |
| `chrome.contextMenus` | 右键菜单 "Ask About Selection" / "Ask About Page" | L1475 |
| `chrome.scripting.executeScript` | 向目标 tab 注入内容提取脚本 | L3188 |
| `chrome.tabs` | `query`/`update`/`onActivated`/`onUpdated`/`onRemoved` | L733, L10369 |
| `chrome.runtime.onMessage` | 运行时消息桥接（panel <-> content） | L1524 |
| `chrome.downloads.search` | 搜索已下载文件（用于 file attachment） | L3582 |

参考文档: [Doc/api/api.md](/Users/acid/Desktop/VivaldiModpack/Doc/api/api.md)

### 1.2 浏览器 API

| API | 用途 |
|-----|------|
| `indexedDB` | 持久化存储 directory handle（数据库名 `ask-in-page-storage`，store `keyval`） |
| `FileSystem Access API` | 对话历史、配置文件的文件系统读写（目录 `.askonpage`） |
| `navigator.clipboard` | 读取剪贴板中的文件（图片/文本） |
| `ReadableStream` + `getReader()` | SSE 流式读取 AI 响应 |
| `AbortController` | 取消正在进行的 API 请求 |
| `ResizeObserver` | Panel 尺寸变化监听 |
| `MutationObserver` | `#panels .webpanel-stack` DOM 变化检测，触发 UI 更新 |
| `requestAnimationFrame` | 打字机动画、滚动对齐 |

### 1.3 模组间依赖

| 模组 | 关系 | 说明 |
|------|------|------|
| `VModToast` | 可选 | 通过 `window.VModToast?.show()` 调用，不存在时静默降级 |

无外部 JS 库依赖，完全自包含。

---

## 2. 功能

### 2.1 核心功能一览

| 功能 | 说明 |
|------|------|
| AI 对话 | 流式 SSE 对话，支持打字机动画效果 |
| 页面内容提取 | 自动提取当前 tab 的正文内容（Readability 算法） |
| 选中文本提问 | 浮动 "Ask" 按钮，选中文字后出现 |
| 右键菜单 | "Ask About Selection" / "Ask About Page" |
| @ 命令面板 | 附加 tab、文件、笔记、浏览历史作为上下文 |
| / 命令系统 | 9 个预定义 slash command（Analyze、Summarize 等） |
| 会话历史 | IndexedDB + FileSystem Access API 持久化，支持导入/导出 |
| 会话记忆 | 长对话自动摘要压缩，memory context 注入 |
| Markdown 渲染 | 完整 markdown + LaTeX 数学公式 + 代码高亮 |
| Reasoning 展示 | 支持 thinking/reasoning 段落折叠展示 |
| 多语言 i18n | 12 种语言（中/英/日/韩/西/法/德/俄/葡/意/阿/印） |
| WebPanel 注册 | 自动注册为 Vivaldi 侧边栏 WebPanel |
| 独立 Tab 模式 | 支持在独立标签页中打开（full-page 模式） |

### 2.2 Slash Commands（/ 命令系统）

| ID | 名称 | 触发词 | 别名 | 用途 |
|----|------|--------|------|------|
| `analyze` | Analyze | `/analyze` | ana, an, research | 分析内容的偏见、模式、趋势、关联 |
| `summarize` | Summarize | `/summarize` | sum, summary, tl;dr | 简洁摘要 |
| `explain` | Explain | `/explain` | exp, ex | 用通俗语言解释概念 |
| `rewrite` | Rewrite | `/rewrite` | reword, polish, revise | 改写以提升清晰度和流畅度 |
| `shorter` | Shorter | `/shorter` | short, trim, compress | 压缩但不丢信息 |
| `translate` | Translate | `/translate` | translation, tl | 翻译并保留原意 |
| `make-table` | Make table | `/maketable` | table, tabulate, grid | 将内容重组为表格 |
| `extract-action-items` | Extract action items | `/extractactionitems` | actions, todo, nextsteps | 提取下一步行动项 |
| `wrap-today` | Wrap today | `/wraptoday` | wrap today, today | 总结过去 24 小时浏览 |

### 2.3 @ 命令面板（附件系统）

输入框输入 `@` 触发建议面板，可附加以下类型的内容：

| 类型 | 说明 | 数据源 |
|------|------|--------|
| Tabs | 附加其他 tab 的内容快照 | `chrome.tabs.query` + `chrome.scripting.executeScript` |
| Files | 附加下载文件、剪贴板文件、本地文件 | `chrome.downloads.search` / `navigator.clipboard` / File Picker |
| Notes | 附加 Vivaldi 笔记 | `vivaldi.notesPrivate` API |
| History | 附加过去 24 小时浏览历史 | `vivaldi.historyPrivate` |
| Formats | 附加格式化能力指令 | 内置 capability 定义 |

---

## 3. 使用方法

### 3.1 安装

1. 将 `AskOnPage.js` 放入 Vivaldi 资源目录：
   ```
   <Vivaldi Dir>/Application/<Version>/resources/vivaldi/
   ```
2. 在 `window.html` 中添加 script 标签：
   ```html
   <script src="AskOnPage.js"></script>
   ```
3. 重启 Vivaldi

### 3.2 AI 配置

文件顶部的 `AI_CONFIG` 对象控制 API 连接：

```javascript
const AI_CONFIG = {
  apiEndpoint: "https://api.xiaomimimo.com/v1/chat/completions",
  apiKey: "sk-...",
  model: "mimo-v2-flash",
  timeout: 90000,
  temperature: 0.5,
  maxTokens: 4096,
};
```

支持的 API 提供商（OpenAI 兼容格式）：
- GLM (bigmodel.cn) - 自动启用 thinking 模式
- Groq、OpenRouter、DeepSeek、小米 MiMo 等

运行时可通过 `config.json`（存储在 `.askonpage` 目录）覆盖配置，也支持通过 `ask-in-page-config-updated` 和 `vivaldi-mod-ai-config-updated` 事件热更新。

### 3.3 基本使用

1. **侧边栏模式**: 点击侧边栏的 Ask in Page 图标打开面板
2. **选中提问**: 在任意页面选中文字，出现浮动 "Ask" 按钮，点击后自动附加选中文本
3. **右键菜单**: 右键选中文字或页面空白处，选择 "Ask About Selection" 或 "Ask About Page"
4. **独立标签**: 通过 `vivaldi://ask-in-page` URL 在独立标签页打开（支持 `?sessionId=xxx` 恢复会话）

### 3.4 输入框操作

| 操作 | 说明 |
|------|------|
| 直接输入 | 提问当前页面内容 |
| `@` | 打开附件建议面板（tab/file/note/history） |
| `/` | 打开命令面板（slash commands） |
| `@` + 搜索词 | 过滤建议列表 |
| Enter | 发送消息 |
| Shift+Enter | 换行 |

---

## 4. 设计思路

### 4.1 整体架构

```
waitForBrowser()
  |
  +-- injectStyles()           // 注入 ~3000 行 CSS
  +-- loadAskInPageConfig()    // 从 FileSystem 读取 config.json
  |
  +-- [standalone mode]        // vivaldi://ask-in-page URL
  |     +-- ensureStandaloneUI()
  |           +-- initPanelState()
  |
  +-- [panel mode]             // 正常浏览模式
  |     +-- createWebPanel()   // 注册 WebPanel 到 vivaldi.prefs
  |     +-- scheduleUpdatePanel()
  |     |     +-- ensurePanelUI()
  |     |           +-- initPanelState()
  |     +-- ensureSelectionAskButton()  // 浮动 Ask 按钮
  |     +-- MutationObserver            // 监听 panel DOM 变化
  |
  +-- registerAskInPageRuntimeBridge()  // chrome.runtime.onMessage
  +-- registerAskInPageContextMenus()   // 右键菜单
  |
  +-- chrome.tabs.onActivated  // tab 切换时同步上下文
  +-- chrome.tabs.onUpdated    // 页面加载完成时预取快照
  +-- chrome.tabs.onRemoved    // 清理 tab 绑定索引
```

### 4.2 双模式运行

模块支持两种宿主模式，通过 `isAskInPageTabUrl(location.href)` 判断：

**Panel 模式**（默认）:
- 注册为 Vivaldi WebPanel（`vivaldi.panels.web.elements`）
- UI 挂载到 `#panels .webpanel-stack` 内的 `.webpanel-content`
- 隐藏原生 webpanel header 和 content，替换为自定义 UI
- 通过 MutationObserver 检测 panel 重建并重新挂载

**Standalone 模式**:
- URL 格式: `vivaldi://ask-in-page[?sessionId=xxx&tabId=xxx]`
- UI 直接挂载到 `document.body`，隐藏所有其他子元素
- 支持通过 URL 参数恢复指定会话

### 4.3 WebPanel 注册流程

```javascript
// L10227 - createWebPanel()
vivaldi.prefs.get('vivaldi.panels.web.elements', (elements) => {
  // 1. 查找已有 element 或创建新的
  element = {
    activeUrl: code,        // data:text/html 编码的空页面
    faviconUrl: panelIcon,  // SVG 图标
    id: webPanelId,         // 'WEBPANEL_ask-in-page-a1b2c3d4e5f6'
    mobileMode: true,
    resizable: false,
    title: name,            // 'Ask in Page'
    ...
  };
  // 2. 写入 prefs
  vivaldi.prefs.set({ path: 'vivaldi.panels.web.elements', value: elementsArr });
  // 3. 确保 panel 工具栏中包含该 panel
  // 检查 vivaldi.toolbars.panel / navigation / status 等
});
```

### 4.4 内容提取算法

`getTabContentSnapshot()` 通过 `chrome.scripting.executeScript` 注入脚本到目标 tab：

1. **噪声过滤**: 使用 `IGNORED_SELECTORS` 排除导航、侧边栏、评论、广告等
2. **候选评分**: 遍历 `article, main, [role="main"], section, div` 等元素，计算文本密度得分
3. **最佳候选**: 选择得分最高的节点作为正文
4. **元数据提取**: `<title>`、`<meta description>`、JSON-LD、`<h1>-<h3>` 标题、`<img alt>`
5. **重要链接**: 从最佳候选节点中提取 `<a[href]>` 链接
6. **轻量预取**: `prefetchLightTabSnapshot()` 为 tab 建议提供标题/URL 预览

### 4.5 对话消息构建

用户发送消息时，`buildUserTurnPayload()` 组装多层上下文：

```
System Prompt (角色设定 + 语言 + 指令)
  |
  +-- <memory-context> (会话记忆摘要)
  +-- <history-context> (浏览历史，可选)
  +-- 之前对话摘要 (buildConversationSummary)
  +-- 最近 N 轮对话 (CONVERSATION_MEMORY_CONFIG.recentTurns)
  |
  +-- 当前用户消息:
      +-- 可见文本 (visibleText)
      +-- 附件 tokens (tab snapshots / files / notes / history)
      +-- 选中文本 (selected-text)
      +-- 文本上下文 (text-context)
      +-- Referenced Page (页面快照: title, headings, mainText, metadata, links)
      +-- Referenced File (文件预览)
```

### 4.6 流式响应处理

```
fetch(apiEndpoint, { body, signal })
  |
  +-- ReadableStream.getReader()
  |     +-- SSE 解析: 按行分割，解析 "data:" 前缀
  |     +-- JSON 解析: delta.content / delta.reasoning_content
  |
  +-- Response Normalization Pipeline
  |     +-- createResponseNormalizationState()
  |     +-- appendNormalizedChunk() (逐 chunk 累积)
  |     +-- finalizeNormalizedResponse()
  |           +-- splitTaggedThinkingContent() (分离 <think> 标签)
  |           +-- cleanModelText() (清理残留标记)
  |
  +-- Typewriter Animation (STREAM_UI_CONFIG)
  |     +-- charsPerSecond: 基础速率
  |     +-- punctuationPause: 标点停顿
  |     +-- newlinePause: 换行停顿
  |     +-- requestAnimationFrame 驱动
  |
  +-- renderStreamingMarkdown() (增量渲染)
        +-- splitStableMarkdown() (分离稳定/不稳定部分)
        +-- renderMarkdownToHtml() (完整渲染)
```

### 4.7 会话记忆系统

长对话通过摘要压缩避免超出上下文窗口：

```
CONVERSATION_MEMORY_CONFIG:
  recentTurns: 保留最近 N 轮完整对话
  summaryChunkTurns: 每次摘要压缩的轮数

流程:
  1. 取 targetIndex 之前的所有 turn nodes
  2. buildConversationSummary(): 将 older turns 压缩为摘要
  3. 只保留最近 recentTurns 轮的完整 user/assistant 消息
  4. 摘要作为 system message 注入
```

### 4.8 存储架构

双层存储设计：

**IndexedDB**（轻量键值）:
- 数据库: `ask-in-page-storage`
- Store: `keyval`
- 存储内容: FileSystem directory handle 持久化引用

**FileSystem Access API**（结构化文件）:
- 根目录: 用户选择的目录（默认 `.askonpage`）
- 结构:
  ```
  .askonpage/
  +-- manifest.json        // 版本元数据
  +-- config.json          // AI 配置覆盖
  +-- indexes/
  |   +-- tabs.json        // tab 绑定索引
  |   +-- pages.json       // 页面会话索引
  +-- sessions/
      +-- <sessionId>.json // 完整会话数据
  ```

### 4.9 Token Payload 系统

附件（tabs、files、notes）通过序列化 token 传递：

```javascript
// 序列化: attachment → URL-encoded JSON token
serializeTokenPayload(item) → encodeURIComponent(JSON.stringify({
  key, kind, title, iconText, refId, subtitle, content,
  textContextId, tokenRole, capabilityId, capabilityType, ...
}))

// 输入框中的 token DOM:
<span data-token="...">Tab Title</span>

// 发送时: 解析所有 token，提取 payload，构建 user message
```

### 4.10 CSS 架构

所有样式通过 `injectStyles()` 内联注入（~94 个 `<style>` 元素），使用 `--aip-*` 命名空间的 CSS 变量：

| 变量 | 用途 |
|------|------|
| `--aip-bg` | 面板背景色 |
| `--aip-surface` / `--aip-surface-strong` | 卡片/输入框背景 |
| `--aip-elevated` | 悬浮层背景 |
| `--aip-text-primary/secondary/muted` | 文字颜色层级 |
| `--aip-accent` / `--aip-accent-dim` | 强调色 |
| `--aip-border` / `--aip-border-hover` | 边框 |
| `--aip-chip-bg` | 标签/芯片背景 |
| `--aip-shadow-base/mid/strong` | 阴影层级 |
| `--aip-r-xs/sm/md/lg/pill/full` | 圆角预设 |

颜色值映射到 Vivaldi 原生变量（如 `--colorBg`、`--colorAccentBg`），确保与浏览器主题一致。

### 4.11 关键设计决策

1. **单文件架构**: 所有 JS/CSS/HTML 内联在一个文件中，便于分发和安装
2. **OpenAI 兼容 API**: 使用标准 `/v1/chat/completions` 格式，可接入任何兼容提供商
3. **bigmodel.cn 特殊处理**: 自动检测 GLM endpoint 并启用 `thinking: { type: 'enabled' }`
4. **uiVersion 守卫**: 每次更新递增 `uiVersion`，panel 重建时自动清理旧 UI
5. **防重复初始化**: `ASK_IN_PAGE_STORAGE_RUNTIME` 单例缓存 DB 连接和 directory handle
6. **错误静默降级**: 所有异步操作 `.catch(() => {})` 避免未处理 Promise rejection
7. **promisifyChrome**: 统一将 callback 风格的 Chrome API 转为 Promise
