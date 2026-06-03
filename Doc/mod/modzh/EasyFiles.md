[English](../EasyFiles.md) | 简体中文

---

# EasyFiles 设计与实现分析

本文基于当前工作区中的 [EasyFiles.js](/Vivaldi7.9Stable/Javascripts/EasyFiles.js)。无独立 CSS 文件，样式通过 JS 动态注入。

## 1. 依赖

### Vivaldi 内部 API
- `vivaldi.tabsPrivate.onWebviewClickCheck` -- 监听 webview 内的鼠标点击事件（Vivaldi 私有 API）
- `vivaldi.tabsPrivate.onKeyboardShortcut` -- 监听键盘快捷键（用于 ESC 关闭对话框）
- `vivaldi.tabsPrivate.onWebviewMouseDown` -- 监听鼠标按下事件（用于对话框外部点击关闭）
- `vivaldiWindowId` -- 当前窗口 ID（Vivaldi 全局变量）
- `chrome.scripting.executeScript` -- 向页面注入内容脚本（MV3 API）
- `chrome.tabs.sendMessage` -- 向内容脚本发送消息
- `chrome.tabs.query` -- 查询标签页
- `chrome.runtime.onMessage` -- 接收内容脚本消息
- `chrome.webNavigation.onCommitted` -- 监听导航事件，注入脚本
- `chrome.i18n.getMessage` -- 国际化文本

### 浏览器 API
- `Clipboard API` (`navigator.clipboard.read`) -- 读取剪贴板文件
- `CompressionStream` / `DecompressionStream` -- gzip 压缩/解压文件数据
- `DataTransfer` -- 模拟文件粘贴操作
- `FileReader` -- 读取文件为 base64
- `document.execCommand('paste')` -- 触发粘贴事件（降级方案）

### 模组间依赖
- 无。EasyFiles 是独立模组，不依赖 ModConfig 或其他模组。

## 2. 功能

### 核心功能

**剪贴板文件粘贴**
- 当页面存在 `<input type="file">` 时，点击输入框旁的按钮可从剪贴板读取文件
- 支持图片（image/png, image/jpeg, image/gif, image/webp）和文件路径
- 读取后通过 `DataTransfer` 注入到 file input 的 `change` 事件
- 剪贴板无匹配内容时显示提示

**下载文件选择**
- 扫描 Vivaldi 下载目录中最近的文件
- 以网格对话框展示，支持图片预览和文件图标
- 选择后自动注入到 file input

**文件分块传输**
- 大文件通过 gzip 压缩后分块传输（每块 10MB）
- 内容脚本接收分块后重组、解压、还原为 File 对象
- 通过 `chrome.tabs.sendMessage` 逐块发送

**自定义对话框系统**
- `gnoh.dialog()` 提供完整的模态对话框实现
- 支持 ESC 关闭、点击外部关闭、按钮回调
- 使用 Vivaldi 私有 API 监听键盘和鼠标事件

**内容脚本注入**
- 通过 `chrome.scripting.executeScript` 注入到所有可脚本化的页面
- 注入时机：页面导航提交时 + 初始化时对已有标签页注入
- URL 过滤：排除 `chrome://`、`vivaldi://`、`chrome-extension://` 等特权页面

### UI 组件

- **文件选择对话框**: 网格布局展示文件，120x120px 缩略图/图标
- **文件图标**: 基于扩展名生成彩色文件图标，带折角效果
- **Show more 按钮**: 剪贴板/下载列表过长时折叠展示

## 3. 使用方法

### 安装
1. 将 `EasyFiles.js` 放入 Vivaldi 资源目录
2. 在 `window.html` 中引入 `<script src="EasyFiles.js"></script>`

### 使用
1. 导航到包含 `<input type="file">` 的网页
2. 点击文件输入框，EasyFiles 自动拦截点击事件
3. 弹出对话框，选择 "Clipboard" 或 "Downloads" 标签
4. 选择文件后自动填充到 file input
5. 提交表单即可

### 限制
- 文件大小限制：5MB（`maxAllowedSize`）
- 分块大小：10MB（`chunkSize`）
- 仅支持可脚本化的 URL（排除特权页面）

## 4. 设计思路

### 双层架构：window.html + 内容脚本

EasyFiles 采用经典的双层架构：

**window.html 层**（主脚本）：
- 注册 `chrome.webNavigation.onCommitted` 监听导航
- 注册 `chrome.runtime.onMessage` 接收内容脚本请求
- 读取剪贴板和下载目录
- 展示文件选择对话框
- 将选中文件分块发送给内容脚本

**内容脚本层**（`inject` 函数）：
- 拦截 `<input type="file">` 的 click 事件
- 向主脚本发送 "click" 消息
- 接收文件数据，重组解压
- 通过 `DataTransfer` + `change` 事件注入文件

两层通过 `chrome.tabs.sendMessage` / `chrome.runtime.onMessage` 通信。

### 文件压缩传输管线

```
剪贴板/磁盘 → ArrayBuffer → gzip 压缩 → base64 编码 → 分块(10MB) → sendMessage 逐块
                                                                          ↓
file input ← change 事件 ← DataTransfer ← File 对象 ← 解压 ← 重组 ← 接收分块
```

选择 gzip 压缩是因为 base64 膨胀 33%，压缩后显著减少传输量。分块避免单次消息过大。

### gnoh 工具库

EasyFiles 内嵌了一个轻量工具库 `gnoh`，提供：
- `stream.compress/decompress` -- gzip 压缩解压
- `file.*` -- 文件大小格式化、扩展名提取、MIME 验证
- `array.chunks` -- 数组分块
- `string.*` -- 字符串工具
- `color.*` -- 颜色计算（生成文件图标颜色）
- `createElement` -- DOM 元素创建工厂
- `dialog` -- 模态对话框系统
- `timeOut` -- 带条件等待的超时工具
- `uuid.generate` -- UUID 生成

这个工具库是自包含的，不依赖外部 npm 包。

### isScriptableUrl 过滤

注入前严格过滤 URL，排除所有特权页面：
- `chrome://`、`vivaldi://`、`chrome-extension://`、`devtools://`
- `about:blank`、`about:srcdoc`
- `data:` URL

过滤逻辑同时用于初始化注入和导航事件注入，确保一致性。

### inject 函数的事件拦截

内容脚本中的 `inject` 函数通过以下方式拦截文件选择：
1. 监听 `click` 事件，检测目标是否为 `<input type="file">`
2. 调用 `event.preventDefault()` 阻止原生文件选择器
3. 向主脚本发送消息，携带 input 的 accept 属性
4. 主脚本返回文件数据后，构造 `DataTransfer` 对象
5. 将 input 的 `files` 属性替换为新文件，触发 `change` 事件

这种模式让 web 应用完全感知不到文件来源的变化。
