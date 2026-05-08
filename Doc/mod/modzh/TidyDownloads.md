[English](../TidyDownloads.md) | 简体中文

---

# TidyDownloads 设计与实现分析

本文基于当前工作区中的 [TidyDownloads.js](/Vivaldi7.9Stable/Javascripts/TidyDownloads.js) 和 [DownloadPanel.css](/Vivaldi7.9Stable/CSS/DownloadPanel.css)。

## 1. 依赖

### Vivaldi 内部 API
- `chrome.downloads.onDeterminingFilename` - 拦截下载文件名确定事件，实现动态重命名
- `chrome.tabs.get()` - 获取下载来源标签页信息
- `chrome.tabs.query()` - 查询当前聚焦标签页（备用来源信息）

### 外部依赖
- `fetch()` - 调用 AI API 进行文件名重命名
- `AbortController` / `AbortSignal.timeout()` - 请求超时控制
- `ReadableStream` - 处理 SSE 流式响应
- `TextDecoder` - 解码流式响应数据
- `navigator.storage.getDirectory()` (OPFS) - 读取 AI 配置文件
- `chrome.i18n.getUILanguage()` - UI 语言检测

### 模组间依赖
- **VModToast** (`VividToast.js`) - 通过 `window.VModToast?.show()` 显示重命名结果通知
- **ModConfig / AI 配置系统** - 通过 OPFS 共享配置（`.askonpage/config.json`），支持 `vivaldi-mod-ai-config-updated` 事件热重载
- **DownloadPanel.css** - 下载面板样式增强（进度条、文字阴影等）

## 2. 功能

### 核心功能

在 Vivaldi 下载文件时，利用 AI（大语言模型）自动将下载文件重命名为更易读、更有意义的名称。

### 主要特性

1. **AI 驱动重命名** - 调用 LLM API 分析文件名、标签页标题和来源域名，生成简洁易读的新文件名
2. **流式响应** - 使用 SSE（Server-Sent Events）流式接收 AI 响应，降低感知延迟
3. **多 AI 提供商支持** - 配置文件中预设了多个 API 端点：
   - GLM（智谱）: `open.bigmodel.cn`
   - Mimo: `api.xiaomimimo.com`
   - OpenRouter: `openrouter.ai`
   - DeepSeek: `api.deepseek.com`
4. **智能跳过** - 本地地址（localhost、127.0.0.1、file://）的下载不进行重命名
5. **扩展名保持** - AI 重命名后自动检查并补充原始文件扩展名
6. **Toast 通知** - 重命名成功后显示通知（如 "已重命名: Arc 1.6.0.dmg"）
7. **防重复注册** - 模块级 `initialized` 守卫防止 window.html 重新执行时重复注册监听器
8. **Pending 下载追踪** - `pendingDownloads` Set 追踪正在处理的下载 ID

### AI 重命名规则（System Prompt）

- 保留有意义的原始文件名
- 从标签页标题或网站信息补充上下文
- 移除机器生成的 ID、哈希、序号
- 整理日期格式，使其简洁可读
- 统一大小写和间距
- 输出 2-4 个单词的简洁名称
- 强制 JSON 格式返回：`{"newName": "string"}`

### 行为预期

- 用户下载文件时，文件名在保存前被 AI 重命名
- 重命名过程对用户透明（流式响应，15秒超时）
- Toast 显示原始名称和新名称的对比
- API Key 为空时回退到原始文件名
- 请求失败时使用原始文件名，不阻断下载

## 3. 使用方法

### 启用方式

1. 将 `TidyDownloads.js` 复制到 Vivaldi 资源目录
2. 在 `window.html` 中引入：`<script src="TidyDownloads.js"></script>`
3. 将 `DownloadPanel.css` 引入 CSS 目录（可选，增强下载面板视觉）
4. 依赖 `VividToast.js`（需先加载）

### 配置选项

通过 OPFS 配置文件（`.askonpage/config.json`）或 `AI_CONFIG` 常量配置：

```javascript
const AI_CONFIG = {
  apiEndpoint: "https://open.bigmodel.cn/api/paas/v4/chat/completions", // API 地址
  apiKey: "",           // API Key（留空则禁用重命名）
  model: "glm-4-flash", // 模型名称
  timeout: 15000,       // 请求超时（ms）
  temperature: 0.1,     // 生成温度（低值 = 更确定性）
  maxTokens: 1000,      // 最大 token 数
};
```

```javascript
const CONFIG = {
  enabled: true,                              // 总开关
  skipKeywords: ["localhost", "127.0.0.1", "file://"], // 跳过关键词
};
```

### 配置热重载

监听 `vivaldi-mod-ai-config-updated` 事件，配置文件更新后自动应用新配置，无需重启浏览器。

### 使用技巧

- `temperature: 0.1` 确保重命名结果高度确定性
- `skipKeywords` 可扩展，添加不需要重命名的域名
- 如果 AI 返回的名称不含扩展名，会自动补充原始扩展名
- 超时设为 15 秒，平衡响应速度和网络波动

## 4. 设计思路

### 设计初衷

浏览器下载的文件名经常包含机器生成的 ID、时间戳、哈希值等无意义信息（如 `document(1).pdf`、`a3f2b1c.zip`）。本模组利用 AI 理解文件上下文，自动生成人类可读的文件名。

### 核心架构决策

1. **`onDeterminingFilename` API** - 这是 Chrome 提供的唯一能在保存前修改文件名的 API。关键约束：回调函数必须同步返回 `true`，然后异步调用 `suggest()`。错误的 Promise 返回方式会导致 `suggest` 被忽略
2. **流式响应处理** - 使用 SSE 流式接收降低感知延迟，逐 chunk 解码并拼接，从完整响应中用正则提取 JSON
3. **来源信息三级回退** - 获取标签页信息的优先级：focused tab > download tabId > download url > referrer > none
4. **JSON 强制格式** - System Prompt 要求 AI 返回 `{"newName": "string"}` 格式，配合低温度确保输出稳定，用正则 `\{"newName"\s*:\s*"([^"]+)"\}` 提取
5. **模块级初始化守卫** - `initialized` 变量防止 window.html 重新执行时重复注册 `onDeterminingFilename` 监听器（该 API 只能注册一次）

### 关键实现细节

- **异步 suggest 模式**：`handleDeterminingFilename` 同步返回 `true`，在 async IIFE 内部调用 `suggest()`。这是 Chrome API 的强制要求
- **扩展名保护**：AI 可能省略扩展名（如将 `report.pdf` 重命名为 `Quarterly Report`），代码检查 AI 返回的扩展名，缺失时自动补充
- **pendingDownloads Set**：追踪正在处理的下载 ID，防止同一个下载被多次处理
- **AbortController 超时**：使用 `AbortSignal.timeout(AI_CONFIG.timeout)` 控制请求超时，超时后回退到原始文件名
- **响应流解析**：逐行解析 SSE 数据（`data: ` 前缀），拼接所有 `choices[0].delta.content` 片段

### 与其他模组的协作

- **VModToast** - 重命名成功/失败时调用 `VModToast.show()` 显示通知
- **ModConfig 系统** - 通过 OPFS 共享配置文件，支持运行时配置更新
- **DownloadPanel.css** - 提供下载面板的视觉增强（进度条样式、文字阴影、动画效果），与 TidyDownloads.js 功能互补但不强依赖

---

*源码约 467 行（JS）+ 样式文件，作者: PaRr0tBoY*
