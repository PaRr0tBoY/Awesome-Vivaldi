[English](../ModConfig.md) | 简体中文

---

# ModConfig 设计与实现分析

本文基于当前工作区中的 [ModConfig.js](/Vivaldi7.9Stable/Javascripts/ModConfig.js)。无独立 CSS 文件，样式通过 JS 动态注入。

## 1. 依赖

### Vivaldi 内部 API
- `chrome.tabs.query` -- 查询当前活动标签页，判断是否在设置页面
- `chrome.tabs.onUpdated` -- 监听标签页 URL 变化，检测设置页面可见性
- `chrome.tabs.onActivated` -- 监听标签页切换，刷新设置面板注入状态

### 浏览器 API
- `navigator.storage.getDirectory()` (OPFS) -- 配置文件持久化存储
- `File System Access API` (`getFileHandle`, `getDirectoryHandle`) -- 读写 OPFS 文件
- `navigator.storage.estimate()` -- 查询存储用量
- `CustomEvent` -- 配置变更通知机制

### 模组间依赖
- ModConfig 是配置中心，**被其他模组依赖**（单向）：
  - **TidyTabs** -- 监听 `vivaldi-mod-ai-config-updated` 和 `vivaldi-mod-config-updated`
  - **AskInPage** -- 监听 `ask-in-page-config-updated`
  - **其他 Tidy 系列模组** (TidyTitles, TidyDownloads, TidyAddress) -- 通过同一配置文件读取 AI 配置
- ModConfig 本身不依赖任何其他模组。

## 2. 功能

### 核心功能

**统一配置面板**
- 注入到 Vivaldi 设置页面的 "Appearance" 区域下方
- 多面板切换：AI Config、Quick Capture、Arc Peek、Auto Hide Panel、Tidy Series、Workspace Theme
- 面板通过下拉菜单切换，每个面板管理对应模组的设置

**AI 配置管理**
- 统一管理所有 AI 模组的 API 配置
- 支持多 Provider 预设：Custom、Z.ai、OpenRouter、DeepSeek、Groq、Mimo
- 每个 Provider 自动填充 apiEndpoint、modelsUrl、apiKeyUrl
- 支持 per-module 覆盖（`ai.overrides`），不同模组可用不同 API
- API Key 显示/隐藏切换（眼睛按钮）
- Model 选择：点击 "Fetch Models" 从 API 端点拉取可用模型列表

**模组设置管理**
- 基于 Schema 的设置渲染：每种输入类型（text、number、toggle、select、slider）自动渲染为对应 UI
- 每个模组独立的设置面板（通过 `CONFIG_PANELS` 定义）
- 设置变更实时保存到 OPFS

**存储管理**
- OPFS 文件读写（`.askonpage/config.json`）
- 存储用量和配额显示
- 配置导出/导入（JSON 文件）
- 恢复默认配置

**配置变更通知**
- 保存后派发三个 CustomEvent：
  - `vivaldi-mod-ai-config-updated` -- AI 配置变更
  - `vivaldi-mod-config-updated` -- 模组设置变更
  - `ask-in-page-config-updated` -- AskInPage 专用

### UI 组件

- **面板切换下拉菜单**: 自定义下拉组件，支持键盘导航
- **设置输入控件**: 文本、数字、开关、下拉、滑块、颜色选择
- **信息按钮**: 每个设置旁的 (i) 图标，hover 显示帮助文本
- **状态栏**: 显示保存状态、错误信息
- **存储摘要**: 显示 OPFS 用量/配额

## 3. 使用方法

### 安装
1. 将 `ModConfig.js` 放入 Vivaldi 资源目录
2. 在 `window.html` 中引入 `<script src="ModConfig.js"></script>`
3. ModConfig 应在其他 AI 模组之前加载

### 使用
1. 打开 Vivaldi 设置 (`vivaldi://settings`)
2. 导航到 "Appearance" 页面
3. 滚动到底部，找到 "MOD CONFIG" 区域
4. 使用面板切换下拉菜单选择要配置的模组
5. 修改设置后自动保存到 OPFS

### 配置文件位置
- OPFS 路径：`.askonpage/config.json`
- 可通过 "Export" 按钮导出为 JSON 文件
- 可通过 "Import" 按钮导入配置

## 4. 设计思路

### 配置数据结构

```javascript
{
  schemaVersion: 3,
  ai: {
    default: {           // 所有 AI 模组共享的基础配置
      provider: "",
      apiEndpoint: "",
      apiKey: "",
      model: "",
    },
    overrides: {         // per-module 覆盖
      tidyTabs: { apiEndpoint: "...", model: "..." },
      askInPage: { apiKey: "..." },
    }
  },
  mods: {
    quickCapture: { ... },
    arcPeek: { ... },
    autoHidePanel: { ... },
    tidySeries: { enableStackColor: false },
    // ... 其他模组设置
  }
}
```

`ai.default` 提供全局默认值，`ai.overrides` 允许单个模组覆盖特定字段。读取时两者合并（`Object.assign(base, override)`）。

### OPFS 作为配置存储

选择 OPFS（Origin Private File System）而非 `chrome.storage` 的原因：
- 文件系统 API 支持目录结构，便于扩展
- 不受 `chrome.storage.sync` 的 100KB 限制
- 与 Vivaldi 资源目录隔离，不干扰浏览器数据
- 支持 `navigator.storage.estimate()` 监控用量

### 设置面板注入策略

ModConfig 通过以下策略注入到 Vivaldi 设置页面：

1. **锚点定位**: 查找 `.setting-group.unlimited` 的第二个元素作为插入锚点
2. **可见性检测**: 监听 `chrome.tabs.onUpdated` 和 `chrome.tabs.onActivated`，判断当前标签是否在 `vivaldi://settings/appearance`
3. **重试机制**: `scheduleInjectModSection` 最多重试 8 次（间隔 150ms），应对 DOM 延迟渲染
4. **自动清理**: 切换到非设置页面时自动移除注入的 DOM

### Schema 驱动的设置渲染

`MOD_SETTING_SCHEMAS` 定义每个模组的设置项，格式：

```javascript
{
  title: "Panel Title",
  settings: [
    { key: "enableStackColor", label: "Stack Color", type: "toggle", defaultValue: false },
    { key: "maxTabsForAI", label: "Max Tabs", type: "number", min: 1, max: 200, defaultValue: 50 },
  ]
}
```

渲染器根据 `type` 字段自动选择输入控件：
- `text` → `<input type="text">`
- `number` → `<input type="number">`（带 min/max/step）
- `toggle` → 自定义开关
- `select` → 下拉菜单
- `slider` → 范围滑块
- `color` → 颜色选择器

设置项的 DOM 节点带有 `data-mod-config` 属性，保存时遍历所有带此属性的节点收集值。

### Provider 预设系统

`PROVIDERS` 数组定义了预置的 AI 服务商配置。选择 Provider 时：
1. 自动填充 `apiEndpoint`
2. 设置 `modelsUrl`（用于 Fetch Models 功能）
3. 设置 `apiKeyUrl`（用于 "Get API key" 链接）

`deriveModelsUrl` 函数从 endpoint 推导 models URL（将 `chat/completions` 替换为 `models`）。

### 配置合并策略

`mergeConfig` 函数处理配置文件的版本兼容：
1. 校验 `schemaVersion`，不匹配则使用默认配置
2. 保留未知的 `mods` 键（前向兼容）
3. 为 `MOD_SETTING_SCHEMAS` 中定义但配置中缺失的键补全默认值
4. 导入时支持 `EXPORT_FORMAT` 包装格式和裸 JSON
