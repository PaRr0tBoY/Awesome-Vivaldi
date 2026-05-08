[English](../TidyTabs.md) | 简体中文

---

# TidyTabs 设计与实现分析

本文基于当前工作区中的 [TidyTabs.js](/Vivaldi7.9Stable/Javascripts/TidyTabs.js)，配合 CSS 文件 `TidyTabs.css` 和 `ClearTabs.css` 使用。

## 1. 依赖

### Vivaldi 内部 API
- `chrome.tabs.query` -- 查询当前窗口所有标签页
- `chrome.tabs.move` -- 移动标签页到指定位置
- `chrome.tabs.update` -- 更新标签页的 `vivExtData`（栈名、颜色等）
- `chrome.tabs.get` -- 获取单个标签页详情
- `chrome.tabs.remove` -- 关闭标签页
- `chrome.webNavigation.onCommitted` -- 监听导航事件，触发自动栈分组
- `chrome.runtime.lastError` -- 错误检查

### 浏览器 API
- `MutationObserver` -- 监听 `.tab-strip` DOM 变化（标签增删、栈结构变更）
- `navigator.storage.getDirectory()` (OPFS) -- 读取共享配置文件
- `fetch` -- 调用 LLM API（OpenAI 兼容格式）
- `crypto.randomUUID` -- 生成栈 ID

### 模组间依赖
- **ModConfig** -- 通过 OPFS 文件 `.askonpage/config.json` 读取 AI 配置和模组设置
  - 监听 `vivaldi-mod-ai-config-updated` 事件接收 AI 配置变更
  - 监听 `vivaldi-mod-config-updated` 事件接收模组设置变更
- **CSS 依赖**: `TidyTabs.css`（标签栈样式）、`ClearTabs.css`（清理按钮样式）

## 2. 功能

### 核心功能

**AI 智能分组**
- 调用 OpenAI 兼容 API，将当前窗口所有标签页按主题语义分组
- 支持任意 OpenAI 兼容端点（GLM、OpenRouter、DeepSeek、Groq、Mimo 等）
- AI 返回 JSON 格式的分组方案，包含组名和标签页索引列表
- 未被 AI 分组的标签归入 "Others" 组
- API key 为空时跳过 AI 分组

**域名分组**
- 按 URL 基础域名分组，同一域名的标签页归为一组
- 作为 AI 分组的备选方案

**自动栈创建**
- 将分组结果转换为 Vivaldi 标签栈（Tab Stack）
- 通过 `chrome.tabs.update` 的 `vivExtData` 设置栈 ID、组名、颜色
- 先移动标签到目标位置，再执行栈操作

**栈命名**
- AI 智能命名：调用 LLM 为未命名栈生成简短描述性名称
- 写入 `vivExtData.fixedGroupTitle`
- 多语言支持：根据浏览器语言调整 "Others" 组名

**栈着色**
- 为无颜色的栈自动分配随机颜色
- 颜色写入 `vivExtData.groupColor`
- 通过 ModConfig 的 `enableStackColor` 设置控制开关

**标签清理**
- 分隔器（separator）旁的 "Close Below" 按钮，一键关闭该分隔器下方所有标签
- 分隔器旁的 "Tidy" 按钮，执行分组操作

**工作区自动栈**
- 配置 `autoStackWorkspaces` 列表，切换到指定工作区时自动触发分组
- 工作区切换通过 `chrome.webNavigation.onCommitted` 检测

### UI 组件

- **Tidy 按钮**: 插入到 `.tab-strip` 的分隔器旁，触发分组
- **Clear 按钮**: 插入到分隔器旁，关闭下方标签
- 按钮通过 `scheduleAttachButtons` 延迟附加，避免与 Vivaldi DOM 操作冲突

## 3. 使用方法

### 安装
1. 将 `TidyTabs.js` 放入 Vivaldi 资源目录
2. 在 `window.html` 中引入 `<script src="TidyTabs.js"></script>`
3. 同时引入 `TidyTabs.css` 和 `ClearTabs.css`

### 配置 AI
通过 ModConfig 设置面板配置（推荐）：
- Provider: 选择预置服务商或 Custom
- API Endpoint: 完整的 chat completions URL
- API Key: 服务商密钥
- Model: 模型名称

也可直接修改脚本中的 `AI_CONFIG` 对象（不推荐，会被 ModConfig 覆盖）。

### 配置模组行为
通过 ModConfig 的 Tidy Series 面板：
- `enableStackColor`: 是否自动为栈着色
- `autoStackWorkspaces`: 需要自动栈分组的工作区名称数组

### 触发方式
- 点击分隔器旁的 **Tidy** 按钮
- 切换到配置了自动栈的工作区

## 4. 设计思路

### 配置双通道架构

TidyTabs 从 OPFS 读取配置分两条路径：

1. **AI 配置** (`applySharedAiConfig`): 从 `ai.default` 取基础值，用 `ai.overrides.tidyTabs` 覆盖
2. **模组设置** (`applyModSettings`): 从 `mods.tidySeries` 读取行为开关

两条路径独立读取同一文件，各取所需字段。配置变更通过 CustomEvent 实时推送，无需轮询。

### 分隔器驱动的 UI 模型

Vivaldi 标签栏中，分隔器（`.separator`）天然分隔不同标签组。TidyTabs 利用这一结构：
- 分隔器 = 分组边界
- 按钮挂在分隔器 DOM 节点之后
- 通过 `getSeparatorKey` 生成 `owned::index` 格式的唯一键定位分隔器

### 双层 Observer 模式

Vivaldi 切换工作区时会重建 `.tab-strip` DOM。单层 MutationObserver 会丢失锚点。

解决方案：
1. **外层 Observer**: 监听 `#browser`（持久祖先），检测 `.tab-strip` 是否被重建
2. **内层 Observer**: 监听 `.tab-strip` 内部变化（标签增删、栈结构变更）

外层检测到重建时，断开旧内层 Observer，重新绑定新 `.tab-strip`。

### 栈操作的顺序保障

`createTabStabcks` 中，标签移动和栈操作必须严格顺序执行（`await` 逐个处理），不能并行。原因：
- `chrome.tabs.move` 改变标签索引，并行会导致位置错乱
- `vivExtData` 写入依赖前一步完成

### AI 分组的容错设计

- 超时控制：支持可选的 `timeout` 参数，超时自动中止
- 响应解析：从 LLM 返回的文本中提取 JSON，容忍 markdown 代码块包裹
- 结果验证：`validateAIGroups` 检查分组结构合法性
- 孤儿处理：未被 AI 分组的标签自动归入 "Others"
- 静默失败：API 调用失败时 toast 提示，不阻塞后续操作

### processingSeparators 防抖

用 `Set` 跟踪正在处理的分隔器，避免重复触发分组操作。操作完成后延迟调用 `scheduleAttachButtons` 重新挂载按钮。
