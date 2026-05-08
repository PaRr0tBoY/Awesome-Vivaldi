[English](../TidyAddress.md) | 简体中文

---

# TidyAddress 设计与实现分析

本文基于当前工作区中的 [TidyAddress.js](/Vivaldi7.9Stable/Javascripts/TidyAddress.js)。

## 1. 依赖

### Vivaldi 内部 API

- **`chrome.tabs.get`**: 获取活动标签的标题用于 AI 生成 slug
- **`chrome.tabs.query`**: 查询当前活动标签

### 外部依赖

- **MutationObserver**: 监听 `#browser` DOM 变化、`#urlFieldInput` 属性变化、`<title>` 元素变化
- **fetch API**: 调用 AI Chat Completions 接口
- **localStorage**: 缓存已生成的 slug (key: `vivid-address-cache-v1`, 上限 600 条)
- **navigator.storage.getDirectory()**: 读取 ModConfig 共享配置

### 模组间依赖

- **AskInPage / ModConfig AI 系统**: 通过 `vivaldi-mod-ai-config-updated` 事件读取 `.askonpage/config.json` 中的 `ai.tidyAddress` 配置

## 2. 功能

将地址栏中冗长的 URL 路径替换为 AI 生成的可读 slug，同时保留实际 URL 不变。

### 核心特性

- AI 生成 1-4 词的简洁 slug，渲染在地址栏域名之后
- 本地缓存 (600 条上限，LRU 淘汰)，避免重复 API 调用
- 多源触发：URL 变化、标签切换、DOM 重建
- 非 HTTP 页面自动跳过 (chrome://, about: 等)
- apiKey 为空时降级显示原始路径

### AI 配置

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `apiEndpoint` | GLM API | Chat Completions 端点 |
| `apiKey` | 空 | API 密钥，为空则降级 |
| `model` | `glm-4-flash` | 模型名称 |
| `timeout` | 0 (无超时) | fetch 超时 |
| `temperature` | 0.1 | 生成温度 |
| `maxTokens` | 80 | 最大 token 数 |

支持的 API 端点：GLM、Mimo、OpenRouter、DeepSeek 等兼容 OpenAI 格式的接口。

### 缓存状态机

```
[新URL] -> loading -> ready (有slug)
                   -> fallback (无slug，有路径)
                   -> skip (无slug，根路径/无路径)
```

## 3. 使用方法

### 启用

1. 将 `TidyAddress.js` 放入 Vivaldi 资源目录，添加到 `window.html`
2. 在 `.askonpage/config.json` 中配置 AI 密钥

### 配置

```json
{
  "ai": {
    "default": {
      "apiEndpoint": "https://open.bigmodel.cn/api/paas/v4/chat/completions",
      "apiKey": "your-key",
      "model": "glm-4-flash"
    },
    "overrides": {
      "tidyAddress": {
        "model": "deepseek-chat"
      }
    }
  }
}
```

`overrides.tidyAddress` 会覆盖 `default` 中的同名字段。

### 视觉效果

- loading 状态：隐藏原始路径部分，显示加载中
- ready 状态：域名 + AI slug (灰色低亮色)，原始路径被 CSS 隐藏
- 点击地址栏编辑时，显示完整 URL (slug 节点被 CSS 隐藏)

## 4. 设计思路

### 设计初衷

现代网页 URL 常常冗长无意义 (如 `/articles/2026/05/08/a1b2c3d4`)。TidyAddress 利用 AI 提取页面语义，生成如 "Vivaldi CSS Mod Guide" 这样的可读标识，帮助用户快速识别当前页面。

### 核心架构

**VividAddress 类**是整个模组的核心，管理：

1. **观察者层**: 三层 MutationObserver 分别监听 `#browser`(DOM 重建)、`#urlFieldInput`(URL 变化)、`<title>`(标题变化)
2. **同步层**: `scheduleSync()` 使用 `requestAnimationFrame` 去抖，`sync()` 每 400ms 轮询一次作为兜底
3. **AI 层**: `requestSlug()` -> `generateSlug()` -> `buildPrompt()` -> fetch API
4. **缓存层**: `loadCache()` / `saveCache()` 使用 localStorage 持久化

### 关键实现

**多源 URL 检测**: `getCurrentContext()` 优先读取 `#urlFieldInput.value`，降级到 `webpageview.active.visible webview[src]`。这确保在地址栏输入和标签切换时都能正确获取 URL。

**AI Prompt 设计**: 要求返回 JSON `{"slug":"..."}` 格式，配合 `response_format: { type: "json_object" }`。Prompt 规则明确：不包含域名、不包含协议、不包含查询参数、1-4 词。

**API 兼容处理**: 对 GLM API 设置 `thinking: { type: "disabled" }` 禁用思考链；对其他 API 设置 `include_reasoning: false`。通过正则 `/bigmodel\.cn/` 判断。

**样式注入策略**: 使用 `data-vivid-address-state` 属性驱动 CSS 状态切换：
- `loading`: 隐藏原始路径，显示 slug 节点(隐藏状态)
- `ready`: 隐藏原始路径，显示 slug 节点
- 无属性: 恢复原始显示

**UrlObfuscationWarning 隐藏**: Vivaldi 自带 URL 混淆警告会被 `display: none` 隐藏，避免与 slug 显示冲突。
