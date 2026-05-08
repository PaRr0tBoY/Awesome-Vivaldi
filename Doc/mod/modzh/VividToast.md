[English](../VividToast.md) | 简体中文

---

# VividToast 设计与实现分析

本文基于当前工作区中的 [VividToast.js](/Vivaldi7.9Stable/Javascripts/VividToast.js) 和 [VividToast.css](/Vivaldi7.9Stable/CSS/VividToast.css)。

## 1. 依赖

### Vivaldi 内部 API
- `chrome.tabs.update()` - 激活标签页（后台标签页通知的点击操作）
- `chrome.tabs.remove()` - 关闭标签页（撤销操作）
- `chrome.tabs.onCreated` - 监听新标签页创建（后台标签页通知）
- `chrome.windows.update()` - 聚焦窗口

### 外部依赖
- `MutationObserver` - 监听 Tabbar DOM 属性变化，检测标签栏位置
- `ResizeObserver` - 监听 Tabbar 尺寸变化（通过 positionObserver 间接使用）
- `window.addEventListener("resize")` - 视口尺寸变化时更新 Toast 位置
- `getBoundingClientRect()` - 获取元素位置和尺寸

### 模组间依赖
- 无 JS 模组依赖
- **VividToast.css** - 必需的样式文件，定义 Toast 容器、动画、类型样式

## 2. 功能

### 核心功能

Vivaldi 模组生态的统一 Toast 通知系统。为所有模组提供轻量级、位置自适应、支持交互的通知弹窗。

### 主要特性

1. **四种通知类型** - `success`（绿色）、`info`（蓝色）、`warning`（黄色）、`error`（红色），每种类型有独立的自动消失时长
2. **位置自适应** - 自动检测 Tabbar 位置（左侧/右侧/顶部/底部），Toast 容器始终跟随 Tabbar 对侧显示
3. **后台标签页通知** - 新建后台标签页时自动显示通知，支持点击激活和撤销关闭
4. **交互式 Toast** - 支持点击回调（`onClick`）和复制文本（`copyText`）
5. **按钮支持** - 可在 Toast 中添加操作按钮（如"撤销"）
6. **去重机制** - 相同 ID 的 Toast 不会重复创建，而是更新已有 Toast 内容
7. **多语言** - 支持中英文（`zh` / `en`）
8. **位置检测日志** - 内置调试日志，记录位置检测来源和快照数据

### 通知类型与默认时长

| 类型 | 默认时长 | 用途 |
|------|----------|------|
| `error` | 5000ms | 错误通知 |
| `warning` | 4000ms | 警告通知 |
| `success` | 2500ms | 操作成功 |
| `info` | 2000ms | 一般信息 |

### 行为预期

- Toast 从顶部滑入（opacity + translateY 动画），到期后自动滑出消失
- Toast 位置随 Tabbar 位置变化自动调整（左侧 Tabbar → Toast 在右侧，反之亦然）
- 后台标签页 Toast 显示"新的后台标签页已打开"，带"撤销"按钮
- 点击 Toast 可执行自定义操作（如跳转到标签页）
- 窗口失焦时 Toast 降低透明度

## 3. 使用方法

### 启用方式

1. 将 `VividToast.js` 复制到 Vivaldi 资源目录
2. 将 `VividToast.css` 复制到 CSS 目录并引入
3. 在 `window.html` 中引入：`<script src="VividToast.js"></script>`

### 全局 API

```javascript
// 显示 Toast
window.VModToast.show(message, {
  type: "success",       // success | info | warning | error
  module: "ModuleName",  // 来源模块标识
  title: "标题",         // 可选标题
  description: "描述",   // 可选描述
  duration: 3000,        // 自定义时长（ms）
  onClick: () => {},     // 点击回调
  copyText: "文本",      // 复制到剪贴板
  button: {              // 操作按钮
    text: "撤销",
    onClick: () => {}
  },
  id: "unique-id"        // 用于去重
});

// 显示后台标签页通知
window.VModToast.showBackgroundTab(tab);

// 激活标签页
window.VModToast.activateTab(tabId, windowId);

// 关闭标签页
window.VModToast.dismiss(el);

// 调试位置信息
window.VModToast.debugPosition();
```

### 配置选项

- `FEATURE_CONFIG.backgroundTabToast` - 是否启用后台标签页通知（默认 `true`）
- `DEBUG` - 是否启用调试日志（默认 `true`）

### 使用技巧

- 设置 `id` 参数可实现 Toast 去重，相同 ID 的 Toast 会更新而非重复创建
- `duration` 可覆盖默认时长，传入 `0` 则不自动消失
- `copyText` 点击时自动复制到剪贴板

## 4. 设计思路

### 设计初衷

Vivaldi 模组生态中多个模组需要显示通知（主题切换、下载重命名、错误提示等），需要一个统一的 Toast 系统避免各模组重复实现，同时要适配 Vivaldi 特有的 Tabbar 多位置布局。

### 核心架构决策

1. **全局单例** - 挂载到 `window.VModToast`，所有模组通过同一接口调用，容器元素 ID 固定为 `vmod-toast-container`
2. **位置检测系统** - 三层检测策略：
   - CSS 类检测（`.left` / `.right`）优先
   - 元素几何检测（宽高比较）次之
   - 视口位置推断兜底
3. **MutationObserver 双层监听** - 内层监听 Tabbar 属性变化，外层监听 `#browser` 检测 Tabbar 重建（Workspace 切换会销毁重建 Tabbar）
4. **CSS 动画而非 JS 动画** - 使用 `opacity + visibility + translateY` 组合实现滑入/滑出，通过 CSS 类切换触发，性能优于 JS 动画
5. **Toast 生命周期管理** - 每个 Toast 元素挂载 `_vmodTimeout`、`_vmodToastId`、`_vmodDuration` 等私有属性，通过 `setTimeout` 管理自动消失

### 关键实现细节

- **位置快照（Position Snapshot）** - `getPositionSnapshot()` 综合 Tabbar 类名、几何尺寸、视口宽度生成位置描述，用于日志和调试
- **悬停暂停** - 鼠标悬停在 Toast 上时清除自动消失计时器，移出后重新设置
- **背景标签页去重** - 使用 `_vmodToastId` 属性标记，避免快速连续创建新标签时产生多个通知
- **HTML 转义** - `escapeHtml()` 防止 XSS，所有用户输入在插入 DOM 前转义
- **动画结束清理** - 监听 `transitionend` 事件，动画结束后移除 DOM 元素

### 与其他模组的协作

- **WorkspaceThemeSwitcher** - 调用 `VModToast.show()` 显示主题切换通知
- **TidyDownloads** - 调用 `VModToast.show()` 显示下载重命名通知
- **任何模组** - 通过 `window.VModToast.show()` 统一调用，无需引入额外依赖

---

*源码约 430 行（JS）+ 样式文件，作者: PaRr0tBoY*
