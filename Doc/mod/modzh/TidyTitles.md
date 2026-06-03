[English](../TidyTitles.md) | 简体中文

---

# TidyTitles 设计与实现分析

本文基于当前工作区中的 [TidyTitles.js](/Vivaldi7.9Stable/Javascripts/TidyTitles.js)。

## 1. 依赖

### Vivaldi 内部 API

- `vivaldi.tabsPrivate.get(tabId)` -- 获取标签页扩展数据（`vivExtData`）
- `chrome.tabs.query({currentWindow: true})` -- 查询当前窗口标签页
- `chrome.tabs.sendMessage(tabId, msg)` -- 向标签页发送消息（用于 `updateTabTitle`）
- 详见 [api.md](/Doc/api/api.md)

### 外部依赖

- **OpenAI 兼容 Chat Completions API** -- 通过 `fetch` 调用，支持 GLM / Mimo / OpenRouter / DeepSeek 等端点
- **浏览器原生 API**: `navigator.storage.getDirectory()` (OPFS), `chrome.i18n.getUILanguage()`

### 模组间依赖

- **VividToast** (`window.VividToast.show`) -- Toast 通知系统
- **TidyTabs** -- TidyTitles 读取 `vivExtData.tidyStackOwner === "TidyTabs"` 来识别由 TidyTabs 管理的标签栈，避免重复重命名

## 2. 功能

TidyTitles 是一个 AI 辅助的标签标题优化和标签栈自动重命名系统。

### 功能一：AI 标题优化

对新打开的标签页，调用 AI API 生成精简标题，去除 SEO 噪音和站点名称，写入 `vivExtData.fixedTitle`。

| 特性 | 说明 |
|------|------|
| 自动触发 | MutationObserver 监听 `.tab-strip` 的 `childList` 变化，新标签页自动处理 |
| 去重保护 | `processedTabs` Set 记录已处理的 tabId，避免重复请求 |
| 已有标题跳过 | 如果 `vivExtData.fixedTitle` 已存在且非强制模式，跳过处理 |
| 加载动画 | 处理中的标签页添加 `tidy-title-loading` CSS 类，显示 shimmer 动画 |
| 固定标签处理 | `pinned-tab-url-replaced` 事件触发时重新处理固定标签 |
| 多语言支持 | 根据 `chrome.i18n.getUILanguage()` 检测浏览器语言，AI 用对应语言回复 |

### 功能二：标签栈自动重命名

当标签栈成员数量变化时，AI 自动生成栈名称，写入 `vivExtData.fixedGroupTitle`，并可选分配随机颜色。

| 特性 | 说明 |
|------|------|
| 触发条件 | 栈成员数达到 `dynamicRenameGap` 的倍数（默认每 5 个标签触发一次） |
| 冷却保护 | `STACK_RENAME_COOLDOWN_MS = 60s`，防止频繁重命名 |
| TidyTabs 排斥 | 如果栈已被 TidyTabs 管理（`tidyStackOwner === "TidyTabs"`），跳过重命名 |
| 颜色分配 | `enableStackColor` 开启时，从 `STACK_COLORS` 按权重随机选取，避免连续同色 |
| Shimmer 动画 | 重命名中的栈显示 `tidy-stack-loading` CSS 类 |

### 配置项

| 键 | 默认值 | 说明 |
|----|--------|------|
| `ai.apiEndpoint` | `https://open.bigmodel.cn/api/paas/v4/chat/completions` | AI API 端点 |
| `ai.apiKey` | `""` | API 密钥（为空则跳过标题生成） |
| `ai.model` | `"glm-4-flash"` | 模型名称 |
| `ai.temperature` | `0.1` | 温度参数 |
| `ai.maxTokens` | `500` | 最大 token 数 |
| `tidySeries.enableStackColor` | -- | 是否为标签栈分配颜色 |
| `tidySeries.dynamicRenameGap` | `5` | 栈重命名的标签数间隔 |

配置通过 OPFS `.askonpage/config.json` 持久化，支持 `ai.default` + `ai.overrides.tidyTitles` 的分层覆盖结构。

## 3. 使用方法

1. 在 `AI_CONFIG` 中填入 `apiKey`，或通过 `.askonpage/config.json` 配置
2. 将 `TidyTitles.js` 放入 Vivaldi 资源目录的 `Javascripts/` 下
3. 在 `window.html` 中引入脚本
4. 新打开的标签页会自动获得 AI 优化标题
5. 组织标签栈时，栈名称会自动生成

## 4. 设计思路

### AI Prompt 工程

标题优化 prompt 的设计要点：

1. **角色定义**: "You are a perfect editor, summarizer and translator"
2. **任务明确**: 去除站点名、SEO 垃圾，保持具体性
3. **输出格式**: JSON `{"title": "..."}` 结构化输出，配合 `response_format: {type: "json_object"}`
4. **语言适配**: `Write responses in ${languageName}` 确保输出语言与浏览器一致
5. **GLM 特殊处理**: 检测 `bigmodel.cn` 端点时添加 `thinking: "disabled"` 和 `include_reasoning: false` 参数

栈名称生成 prompt 收集所有成员标签的 `[hostname] title` 列表，要求 AI 返回 `{"name": "1-3 words"}` 格式。额外用 `<thought>` 标签清理 GLM 模型的思维链输出。

### vivExtData 字段使用

| 字段 | 写入方 | 说明 |
|------|--------|------|
| `fixedTitle` | TidyTitles | AI 优化后的标签标题 |
| `fixedGroupTitle` | TidyTitles | AI 生成的栈名称 |
| `groupColor` | TidyTitles | 栈颜色（随机分配） |
| `tidyStackOwner` | TidyTabs | 栈管理者标识 |
| `tidyStackId` | TidyTabs | TidyTabs 管理的栈 ID |
| `group` | Vivaldi 原生 | 标签栈 UUID |
| `workspaceId` | Vivaldi 原生 | 工作区 ID |

### 双层 Observer 架构

**外层 Observer** (`outerObserver`):
- 锚定 `#tabs-container`（持久祖先）
- 监听 `childList` + `subtree`
- 职责：检测 `.tab-strip` 是否被重建，重建时重新绑定内层 Observer

**内层 Observer** (`innerObserver`):
- 锚定 `.tab-strip`
- 监听 `childList` + `attributes`（class 变化）+ `attributeOldValue`
- 职责：
  - 新增的 `.tab-wrapper` 节点触发 `processSingleTab`
  - `class` 属性变化时恢复 shimmer 动画（`restoreShimmer`）
  - `.tab-position` 从非 pinned 变为 pinned 时触发 `processPinnedTabPosition`

### Shimmer 动画恢复机制

Vivaldi 的 JS 会直接修改 `.tab-wrapper` 的 `className`（如添加/移除 `active`），这会覆盖 TidyTitles 添加的 `tidy-title-loading` 类。`restoreShimmer()` 在每次 `attributes` 变化时检查并恢复：

- 通过 `data-id` 属性区分数字 tabId 和 UUID stackId
- 数字 ID -> 检查 `processingTabs` Set
- UUID -> 检查 `stackIdsRenaming` Set

### 标栈成员追踪

使用三个 Map 维护栈成员关系：

```
tabToStack: Map<tabId, stackId>     -- 标签所属栈
stackToTabs: Map<stackId, Set<tabId>> -- 栈的成员集合
stackColors: Map<stackId, groupColor> -- 栈的颜色
```

`handleStackMembershipChange()` 在标签的 `vivExtData.group` 变化时更新这些索引，并触发旧栈/新栈的重命名调度。

### 语言检测映射

`getBrowserLanguage()` 从 `chrome.i18n.getUILanguage()` 获取语言代码，`getLanguageName()` 映射为 AI 可理解的语言名称（如 `"zh-CN"` -> `"Chinese"`, `"en"` -> `"English"`）。默认回退到 `"Chinese"`。

### 错误处理策略

- API 429 (限流): 静默跳过，`console.warn` 而非 `console.error`
- API 401 (未授权): 记录错误但不阻断
- 空响应 / 格式异常: 返回原始标题，允许重试（不加入 `processedTabs`）
- 非 HTTP URL: 直接跳过（`chrome://` 等特殊页面）

### 颜色权重系统

`STACK_COLORS` 数组定义可用颜色，`COLOR_WEIGHTS` 对象定义每种颜色的选取权重。`randomStackColor()` 使用加权随机选取，`RESTRICTED` 集合限制某些颜色的连续出现。
