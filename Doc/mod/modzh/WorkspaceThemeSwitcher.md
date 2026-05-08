[English](../WorkspaceThemeSwitcher.md) | 简体中文

---

# WorkspaceThemeSwitcher 设计与实现分析

本文基于当前工作区中的 [WorkspaceThemeSwitcher.js](/Vivaldi7.9Stable/Javascripts/WorkspaceThemeSwitcher.js)。

## 1. 依赖

### Vivaldi 内部 API
- `vivaldi.prefs.get()` - 读取主题配置和 workspace 信息
- `vivaldi.prefs.set()` - 切换当前主题
- `vivaldi.prefs.onChanged` - 监听偏好变化
- 配置路径：`vivaldi.themes.current`、`vivaldi.themes.system`、`vivaldi.themes.user`、`vivaldi.workspaces`

### 外部依赖
- `navigator.storage.getDirectory()` (OPFS) - 持久化配置文件（`.askonpage/config.json`）
- `chrome.i18n.getUILanguage()` - UI 语言检测

### 模组间依赖
- **VModToast** (`VividToast.js`) - 通过 `window.VModToast?.show()` 显示主题切换通知
- **ModConfig 系统** - 监听 `vivaldi-mod-config-updated` 事件，响应配置变更
- 无对应 CSS 文件

## 2. 功能

### 核心功能

在 Vivaldi 中切换 Workspace 时，自动应用预设的主题配色方案，实现工作区与主题的一对一绑定。

### 主要特性

1. **Workspace-Theme 映射** - 为每个 Workspace 指定独立的主题，切换 Workspace 时自动切换主题
2. **默认主题记忆** - 首次使用时自动记录当前主题为默认主题，无映射的 Workspace 使用默认主题
3. **主题过渡动画** - 切换时创建全屏覆盖层，捕获当前背景截图，执行 300ms 渐变过渡（cubic-bezier(0.22, 1, 0.36, 1)）
4. **主题解析** - 支持通过主题 ID 或主题名称引用主题，自动在系统主题和用户主题中查找匹配
5. **智能匹配** - Workspace 名称匹配支持精确匹配和模糊匹配（按名称长度排序，取最长匹配）
6. **多语言支持** - 通过 `chrome.i18n.getUILanguage()` 检测语言，Toast 文本支持中英文
7. **配置持久化** - 默认主题 ID 通过 OPFS 持久化到 `.askonpage/config.json`

### 行为预期

- 切换 Workspace 时，主题在 300ms 内平滑过渡到预设主题
- 未配置映射的 Workspace 使用默认主题
- Toast 通知显示切换结果（如 "主题已切换: 工作 -> Arc Dark"）
- 配置文件更新后自动重载映射关系

## 3. 使用方法

### 启用方式

1. 将 `WorkspaceThemeSwitcher.js` 复制到 Vivaldi 资源目录
2. 在 `window.html` 中引入：`<script src="WorkspaceThemeSwitcher.js"></script>`
3. 依赖 `VividToast.js`（需先加载）

### 配置方式

通过 ModConfig 系统（`.askonpage/config.json`）配置 workspace-theme 映射：

```json
{
  "mods": {
    "workspaceThemeSwitcher": {
      "defaultThemeId": "主题ID",
      "workspaces": {
        "工作": "Arc Dark",
        "学习": "theme-id-xxx"
      }
    }
  }
}
```

- `workspaces` 对象：键为 Workspace 名称，值为主题 ID 或主题名称
- `defaultThemeId`：默认主题 ID，首次运行自动写入
- 主题引用支持 ID（如 `"1697534923"`）或名称（如 `"Arc Dark"`）

### 用户交互

- 切换 Workspace 时自动触发
- 通过 ModConfig 编辑映射关系
- Toast 通知显示切换结果

### 使用技巧

- 主题名称匹配不区分大小写
- 如果多个 Workspace 名称包含相同子串（如 "工作" 和 "工作台"），优先匹配名称更长的
- 配置文件修改后会触发 `vivaldi-mod-config-updated` 事件，无需重启

## 4. 设计思路

### 设计初衷

Vivaldi 的 Workspace 功能允许按场景组织标签页，但主题切换需要手动操作。本模组将 Workspace 与主题绑定，通过视觉区分强化工作区的场景感。

### 核心架构决策

1. **OPFS 配置存储** - 使用 `navigator.storage.getDirectory()` 而非 `chrome.storage`，与 ModConfig 系统保持一致，配置文件可被其他模组共享
2. **主题缓存与失效** - 缓存主题列表（系统主题 + 用户主题），配置更新时通过 `invalidateThemeCache()` 清除缓存
3. **过渡动画设计** - 捕获当前主题背景色创建覆盖层，先淡入覆盖层，切换主题后淡出，300ms 的 cubic-bezier 曲线提供自然的缓动效果
4. **防重复切换** - 记录 `lastWorkspaceName` 和 `lastThemeId`，相同组合不重复触发
5. **Workspace 名称匹配** - 从 `.workspace-name` 或 `[data-name="WorkspaceButton"]` 提取当前 Workspace 名称，支持多种 DOM 结构适配

### 关键实现细节

- **主题背景提取**：`extractThemeBackground()` 从主题配置中读取背景色，用于过渡动画的覆盖层颜色
- **Workspace 识别**：通过解析 Vivaldi 的 vivExtData 属性获取 Workspace 列表和当前活动 Workspace
- **异步初始化**：`configReady` 为 Promise，确保配置加载完成后再处理主题切换
- **去抖动**：`lastWorkspaceName + lastThemeId` 组合去重，避免 Workspace 列表变化导致重复触发

### 与其他模组的协作

- **VModToast** - 使用其 `show()` 方法显示切换通知，通过可选链 `window.VModToast?.show()` 避免强依赖
- **ModConfig** - 监听 `vivaldi-mod-config-updated` 事件实现热重载
- **OPFS 共享** - 配置文件路径 `.askonpage/config.json` 与其他使用 ModConfig 的模组共享

---

*源码约 327 行，作者: PaRr0tBoY*
