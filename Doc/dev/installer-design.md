# Awesome Vivaldi 安装器 — 实现方案 v3

> 状态：设计定稿 · 日期：2026-07-07

## 1. 目标

用户执行**一条命令**，安装器启动 TUI 交互流程：

**首次安装：**
1. **启动画面** — 显示 Awesome Vivaldi ASCII 艺术字
2. **发现** — 扫描系统中所有 Vivaldi 安装（stable / snapshot / standalone）
3. **选择目标** — 用户选择要安装到哪个 Vivaldi 安装
4. **选择模组** — 用户勾选要安装的 CSS 和 JS 模组（默认全选，附带功能描述）
5. **部署** — 备份 → 注入 `injectMods.js` → 复制模组文件到 `user_mods/`

**再次执行（已安装）：**
1. **启动画面** — 显示 ASCII 艺术字
2. **重入菜单** — 三个选项：
   - **更新** — 自动拉取最新模组覆盖已安装项
   - **管理** — 重新进入选择界面，自由增删模组
   - **卸载** — 完全移除所有模组，恢复 Vivaldi 原始状态

支持平台：**Windows** · **macOS**（Linux 搁置）

---

## 2. 关于"Profile"的澄清

vivaldimodmanager 能检测多个 Vivaldi **安装**（版本/渠道），但**不涉及浏览器用户档案**（User Profiles）。

### 2.1 两个概念的区别

| | Vivaldi 安装 (Installation) | 浏览器用户档案 (Browser Profile) |
|---|---|---|
| 是什么 | 硬盘上独立的 Vivaldi 程序副本 | 同一程序内的用户数据分区 |
| 范围 | 整个应用 | 一个用户的数据（书签、设置、扩展等） |
| `window.html` | 每个安装只有一个 | 所有档案共享同一个 |
| JS 模组 | 安装到该安装目录，影响所有档案 | 不适用 |
| CSS 模组（原生） | 不适用 | 每个档案独立选择 CSS 文件夹 |
| CSS 模组（本方案） | `user_mods/css/` 在安装目录下，影响所有档案 | 不适用 |

### 2.2 为什么本方案不受 Profile 影响

原 Awesome Vivaldi 的 CSS 通过 Vivaldi 设置面板加载，这是**每个 Profile 独立**的。但本方案采用 `injectMods.js` 动态加载 CSS（参考 vivaldimodmanager），CSS 文件放在 `resources/vivaldi/user_mods/css/`，属于**安装级别**，对所有 Profile 生效。

这意味着：
- 不需要检测用户 Profile
- 不需要关心用户有几个 Profile
- macOS 和 Windows 行为完全一致（`chrome.runtime.getPackageDirectoryEntry` 是 Chromium 标准 API）

### 2.3 安装器实际需要检测的

安装器只需要检测**操作系统上安装了几个 Vivaldi**（不同的 .app / 安装目录），这与 vivaldimodmanager 的 sidebar 版本列表完全对应：

- **Vivaldi Stable** — 主版本
- **Vivaldi Snapshot** — 测试版
- **Vivaldi Standalone** — 便携版（Windows）

同一台机器上可以同时存在这三个，安装器应全部发现并让用户选择目标。

---

## 3. TUI 交互流程

模仿 `skills` CLI 的 `@clack/prompts` 多选体验。方向键导航，空格勾选/取消，回车确认。

### 3.0 启动画面

安装器启动时显示 ASCII 艺术字：

```                                                                             
                                                                                      
▄████▄ ▄▄   ▄▄ ▄▄▄▄▄  ▄▄▄▄  ▄▄▄  ▄▄   ▄▄ ▄▄▄▄▄   ██  ██ ▄▄ ▄▄ ▄▄  ▄▄▄  ▄▄    ▄▄▄▄  ▄▄ 
██▄▄██ ██ ▄ ██ ██▄▄  ███▄▄ ██▀██ ██▀▄▀██ ██▄▄    ██▄▄██ ██ ██▄██ ██▀██ ██    ██▀██ ██ 
██  ██  ▀█▀█▀  ██▄▄▄ ▄▄██▀ ▀███▀ ██   ██ ██▄▄▄    ▀██▀  ██  ▀█▀  ██▀██ ██▄▄▄ ████▀ ██ 
                                                                                                    
                              Awesome Vivaldi · Community Modpack Installer
```

### 3.1 重入检测：更新 / 管理 / 卸载

安装器启动后，先检查目标 Vivaldi 安装中是否已存在 `user_mods/` 目录（即是否已安装过 Awesome Vivaldi）。

**首次安装** → 直接进入 3.3 选择安装目标。

**再次执行（已安装）** → 显示主菜单：

```
◆ 检测到已安装 Awesome Vivaldi

  当前已安装: 14 个 CSS 模组, 17 个 JS 模组
  安装路径: C:\Program Files\Vivaldi\Application\8.0.4033.57\resources\vivaldi\

  请选择操作：

  ● 更新      检查模组是否有新版本，自动拉取替换所有已安装模组
  ○ 管理      重新进入安装界面，自由增删模组
  ○ 卸载      完全移除所有模组，恢复 Vivaldi 初始状态

────────────────────────────────────────
  ↑↓ 导航  |  ENTER 确认  |  ESC 退出
```

**更新模式：**
1. 从仓库拉取最新模组文件
2. 对比已安装的 `user_mods/` 中每个文件，覆盖更新
3. 不移除用户已安装但仓库中已删除的模组（保守策略：只更新不改删）
4. 重新注入 `injectMods.js`（确保加载器本身是最新的）
5. 显示更新摘要：哪些文件被更新、哪些保持不变

**管理模式：**
1. 跳转到 3.4 选择 CSS 模组，已安装的模组预选为 `[✓]`
2. 跳转到 3.5 选择 JS 模组，已安装的模组预选为 `[✓]`
3. 用户取消勾选 = 删除该模组；用户新勾选 = 安装该模组
4. 确认后执行增删操作

**卸载模式：**
1. 显示确认提示（防止误操作）
2. 恢复原始 `window.html`（从 `.bak` 还原）
3. 删除 `resources/vivaldi/injectMods.js`
4. 删除 `resources/vivaldi/user_mods/` 整个目录
5. 保留 `.bak` 备份文件（用户可手动删除）

### 3.2 全局交互约定

```
↑↓    = 导航（移动光标）
SPACE = 勾选/取消勾选当前项
A     = 全选
D     = 取消全选
ENTER = 确认选择，进入下一步
ESC   = 取消安装
```

### 3.3 步骤一：选择安装目标

```
◆ 发现以下 Vivaldi 安装，请选择要安装到哪个：

  ● Vivaldi Stable         8.0.4033.57
        路径: C:\Program Files\Vivaldi\Application\8.0.4033.57
        类型: 系统级安装 (需要管理员权限)

  ○ Vivaldi Snapshot       8.1.1200.3
        路径: C:\Users\Acid\AppData\Local\Vivaldi Snapshot\Application\8.1.1200.3
        类型: 用户级安装

────────────────────────────────────────
  ↑↓ 导航  |  ENTER 确认  |  ESC 取消
```

- 单选（radio 模式：● / ○）
- 如果只发现一个安装，跳过此步骤自动选中
- 如果没有发现任何安装，输出错误信息并退出

### 3.4 步骤二：选择 CSS 模组

```
◆ 选择要安装的 CSS 模组（默认全选）

  [✓] (全选/全不选)                  一键切换所有 CSS 模组
  ──────────────────────────────────────────
  [✓] AdaptiveBF.css                 无用的前进/后退按钮自动隐藏
  [✓] BetterAnimation.css            页面滚动橡皮筋回弹更平滑
  [✓] BtnHoverAnime.css              工具栏按钮悬停有微动效
  [✓] DownloadPanel.css              下载面板适配暗色主题
  [✓] Extensions.css                 扩展菜单改为紧凑列表布局
  [✓] FavouriteTabs.css              前9个固定标签以网格展示 (Arc 风格)
  [✓] FindInPage.css                 页内搜索栏改为浮动悬浮式
  [✓] LineBreak.css                  长文本自动换行 (小屏幕实用)
  [✓] PeekTabbar.css                 标签栏隐藏时鼠标触边滑出
  [✓] Quietify.css                   静音图标淡化，减少视觉干扰
  [✓] RemoveClutter.css              隐藏滚动条、分割线等视觉噪音
  [✓] TabsTrail.css                  当前标签显示绿色指示条
  [✓] VivalArc.css                   Arc 浏览器风格移植 (实验性)
  [✓] VividQC.css                    快速命令面板样式美化

  ── 以下模组与 JS 模组联动，请前往下一步选择 ──
  (联动) TidyTabs.css                 AI 分组标签的样式支持
  (联动) VividPeek.css                Arc Peek 弹出窗口样式
  (联动) VividPlayer.css              Vivaldi 内置播放器美化
  (联动) VividToast.css               Toast 通知弹窗的样式
  (联动) PinnedTabRestore.css         固定标签恢复按钮样式
  (联动) InteractionFeedback.css      按钮点击等交互反馈动效

────────────────────────────────────────
  ↑↓ 导航  |  SPACE 勾选  |  A 全选  |  D 全不选  |  ENTER 确认
```

- 多选（checkbox 模式：[✓] / [ ]）
- 列表首行为**全选/全不选**切换开关，勾选/取消它会影响所有可选项
- **仅显示独立 CSS 模组**（没有同名 `.js` 文件的）
- 联动 CSS（与 JS 同名的）显示在锁定区，不可单独操作
- 锁定区的 CSS 在步骤三中随 JS 自动选中
- 管理模式（重入）下，已安装项预选

### 3.5 步骤三：选择 JS 模组

```
◆ 选择要安装的 JavaScript 模组（默认全选）

  [✓] (全选/全不选)                  一键切换所有 JS 模组
  ──────────────────────────────────────────
  [✓] ModConfig.js                   *核心* 共享设置面板 (AI Key / 模组参数)
  [✓] AskOnPage.js                   AI 侧边栏：网页问答、摘要、改写
  [✓] AutoHidePanel.js               侧边栏鼠标离开后自动收起
  [✓] EasyFiles.js                   附件拖拽时自动列出剪贴板+下载文件
  [✓] MonochromeIcons.js             Web 面板图标统一为单色风格
  [✓] QuickCapture.js                截图时自动识别并选中网页区域
  [✓] TabManager.js                  工作区标签管理面板，批量操作标签
  [✓] TidyAddress.js                 AI 将地址栏 URL 改写为短标题
  [✓] TidyDownloads.js               AI 自动清理下载文件名中的乱码
  [✓] TidyTitles.js                  AI 将标签标题精简为有意义的短语
  [✓] WorkspaceThemeSwitcher.js      切换工作区时自动更换主题

  ── 以下模组附带 CSS 模组 ──
  [✓] TidyTabs.js          → CSS: TidyTabs.css           AI 自动分组标签页
  [✓] VividPeek.js         → CSS: VividPeek.css          Arc 风格弹出预览窗口
  [✓] VividPlayer.js       → CSS: VividPlayer.css        全局视频播放悬浮窗
  [✓] VividToast.js        → CSS: VividToast.css         Toast 风格通知弹窗
  [✓] PinnedTabRestore.js  → CSS: PinnedTabRestore.css   右键恢复最近关闭的固定标签
  [✓] InteractionFeedback.js → CSS: InteractionFeedback.css  按钮点击微动效反馈

────────────────────────────────────────
  ↑↓ 导航  |  SPACE 勾选  |  A 全选  |  D 全不选  |  ENTER 确认
```

- 多选模式，列表首行为**全选/全不选**切换开关
- "附带 CSS"区：选中 JS 时自动选中对应 CSS，取消时自动取消对应 CSS
- 纯粹独立的 JS 模组在上方，有 CSS 捆绑的在下方
- 管理模式（重入）下，已安装项预选

### 3.6 步骤四：确认摘要 + 执行

```
◆ 安装确认

  目标: Vivaldi Stable 8.0.4033.57
  路径: C:\Program Files\Vivaldi\Application\8.0.4033.57\resources\vivaldi\

  CSS 模组 (14 个):  AdaptiveBF, BetterAnimation, BtnHoverAnime, DownloadPanel,
                     Extensions, FindInPage, PeekTabbar, Quietify, RemoveClutter,
                     TabsTrail, VividQC, TidyTabs (联动), VividPeek (联动),
                     VividToast (联动)

  JS 模组 (17 个):   ModConfig, AskOnPage, AutoHidePanel, EasyFiles,
                     MonochromeIcons, QuickCapture, TabManager, TidyAddress,
                     TidyDownloads, TidyTitles, WorkspaceThemeSwitcher,
                     TidyTabs, VividPeek, VividPlayer, VividToast,
                     PinnedTabRestore, InteractionFeedback

  正在备份 window.html...
  ✓ 已备份到 window.html.bak

  正在注入模组加载器...
  ✓ 已注入 injectMods.js

  正在部署模组文件...
  ✓ 14 个 CSS 模组已部署到 user_mods/css/
  ✓ 17 个 JS 模组已部署到 user_mods/js/

  ────────────────────────────────────────
  安装完成！请重启 Vivaldi 以生效。

  是否现在重启 Vivaldi？ [Y] 是  [N] 否
  ────────────────────────────────────────
```

- `window.html` 可以在 Vivaldi 运行时替换，安装器不阻止
- 安装完成后提示用户是否立即重启浏览器
- Windows：`Start-Process vivaldi.exe`
- macOS：`open /Applications/Vivaldi.app --args --debug-packed-apps --silent-debugger-extension-api`（参考 upviv）

---

## 4. 模组捆绑元数据

### 4.1 捆绑规则

约定：**CSS 和 JS 文件名相同（不含扩展名）即为捆绑**。

自动检测逻辑：
```
for each .js file in Javascripts/:
    css_file = "CSS/{basename}.css"
    if css_file exists:
        mark as bundled pair
    
standalone_css = all .css files - bundled_css
standalone_js  = all .js files - bundled_js
```

当前捆绑关系（自动检测结果）：

| JS 模组 | 捆绑的 CSS 模组 |
|---|---|
| `TidyTabs.js` | `TidyTabs.css` |
| `VividPeek.js` | `VividPeek.css` |
| `VividPlayer.js` | `VividPlayer.css` |
| `VividToast.js` | `VividToast.css` |
| `PinnedTabRestore.js` | `PinnedTabRestore.css` |
| `InteractionFeedback.js` | `InteractionFeedback.css` |

### 4.2 为什么不用手动维护元数据

约定优于配置。文件名相同就是捆绑——这是零维护成本的隐式约定。如果未来有人新增了一个 `Foo.js` 和 `Foo.css`，它们自动成为捆绑对，不需要修改任何配置。

---

## 5. 路径发现策略

### 5.1 Windows（PowerShell）

```
方法1（首选）：注册表

    HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\vivaldi.exe
        → "(default)" 值是 vivaldi.exe 完整路径

    HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\vivaldi.exe
        → 同上，覆盖单用户安装

    Snapshot:
    HKLM/HKCU:\...\App Paths\vivaldi.snapshot.exe

方法2（兜底）：遍历已知目录

    $env:ProgramFiles\Vivaldi\Application\
    ${env:ProgramFiles(x86)}\Vivaldi\Application\
    $env:LOCALAPPDATA\Vivaldi\Application\
    $env:LOCALAPPDATA\Vivaldi Snapshot\Application\

方法3（最后手段）：where.exe

    where vivaldi.exe 2>$null

拿到 Application 目录后，扫描其下所有 \d+\.\d+\.\d+\.\d+ 子目录，在每个子目录中查找
resources\vivaldi\window.html，取版本号最高者。
```

**参考：vivaldimodmanager** `ModManager.cs:472-473, 507` — 注册表 + 版本扫描。

### 5.2 macOS（bash）

```
方法1（首选）：find 搜索 Framework

    find /Applications/Vivaldi.app -type d -name "Vivaldi Framework.framework"
    # → .../Vivaldi Framework.framework/Versions/A/
    
    拼接 Resources/vivaldi/window.html

方法2（兜底）：遍历已知 .app 路径

    /Applications/Vivaldi.app
    /Applications/Vivaldi Snapshot.app
    ~/Applications/Vivaldi.app

方法3（最后手段）：mdfind

    mdfind "kMDItemFSName == 'window.html'" 2>/dev/null | grep -i vivaldi
```

**参考：现有 `upviv` 脚本** `Others/MacOSPatchScripts/upviv:7` — find Framework。

### 5.3 多地安装检测

安装器应同时检测 stable 和 snapshot。发现列表示例：

```
Vivaldi Stable      8.0.4033.57      C:\Program Files\Vivaldi\Application\
Vivaldi Snapshot    8.1.1200.3       C:\Users\...\Vivaldi Snapshot\Application\
```

macOS 同理，通过检测不同的 `.app` 包名区分。

---

## 6. 多语言支持 (i18n)

### 6.1 设计原则

- **默认语言：英文（`en`）** — 所有 UI 文字、模组介绍均以英文为基准
- **第二语言：简体中文（`zh`）** — 当前唯一支持的第二语言
- **自动检测** — 根据用户操作系统语言自动切换，无需手动选择
- **单文件内联** — 翻译字符串直接写在脚本中（不引入外部翻译文件），保持零依赖

### 6.2 语言检测

**Windows（PowerShell）：**

```powershell
$culture = [System.Globalization.CultureInfo]::CurrentUICulture
$lang = if ($culture.TwoLetterISOLanguageName -eq 'zh') { 'zh' } else { 'en' }
```

`zh-CN`、`zh-TW`、`zh-Hans`、`zh-Hant` → 全部映射为 `zh`。

**macOS（bash）：**

```bash
lang=$(echo "$LANG" | cut -d_ -f1)
if [ "$lang" != "zh" ]; then lang="en"; fi
```

`$LANG` 环境变量的前两个字符。`zh_CN.UTF-8` → `zh`，其余 → `en`。

### 6.3 翻译字符串结构

脚本内使用查找表（PowerShell hashtable / bash 函数）按 key 获取翻译：

```
tr("installer_title")   →  "Awesome Vivaldi · Community Modpack Installer"  (en)
                        →  "Awesome Vivaldi · 社区模组包安装器"              (zh)
```

模组描述也纳入翻译系统，每个模组有一个描述 key：

```
tr("mod_desc_AdaptiveBF")   →  "Auto-hide back/forward buttons when unnecessary"  (en)
                            →  "无用的前进/后退按钮自动隐藏"                       (zh)
```

### 6.4 全部翻译 key 清单

#### 通用 UI

| Key | English | 简体中文 |
|---|---|---|
| `installer_title` | `Awesome Vivaldi · Community Modpack Installer` | `Awesome Vivaldi · 社区模组包安装器` |
| `keybind_hint` | `↑↓ navigate \| SPACE toggle \| ENTER confirm \| ESC cancel` | `↑↓ 导航 \| 空格 勾选 \| 回车 确认 \| ESC 取消` |
| `keybind_multiselect` | `↑↓ navigate \| SPACE toggle \| A select-all \| D deselect-all \| ENTER confirm` | `↑↓ 导航 \| 空格 勾选 \| A 全选 \| D 全不选 \| 回车 确认` |
| `keybind_radio` | `↑↓ navigate \| ENTER confirm \| ESC cancel` | `↑↓ 导航 \| 回车 确认 \| ESC 取消` |
| `toggle_all` | `(Select All / Deselect All)` | `(全选/全不选)` |
| `separator` | `──────────` | `──────────` |

#### 重入检测菜单

| Key | English | 简体中文 |
|---|---|---|
| `reentry_title` | `Detected existing Awesome Vivaldi installation` | `检测到已安装 Awesome Vivaldi` |
| `reentry_installed_count` | `Currently installed: ${css} CSS mods, ${js} JS mods` | `当前已安装: ${css} 个 CSS 模组, ${js} 个 JS 模组` |
| `reentry_path` | `Install path` | `安装路径` |
| `reentry_prompt` | `Choose an action` | `请选择操作` |
| `reentry_update` | `Update` | `更新` |
| `reentry_update_desc` | `Fetch latest mods and replace installed ones` | `检查模组是否有新版本，自动拉取替换所有已安装模组` |
| `reentry_manage` | `Manage` | `管理` |
| `reentry_manage_desc` | `Reopen selection to add or remove mods` | `重新进入安装界面，自由增删模组` |
| `reentry_uninstall` | `Uninstall` | `卸载` |
| `reentry_uninstall_desc` | `Remove all mods, restore original Vivaldi` | `完全移除所有模组，恢复 Vivaldi 初始状态` |
| `reentry_exit` | `ESC exit` | `ESC 退出` |

#### 安装目标选择

| Key | English | 简体中文 |
|---|---|---|
| `target_title` | `Found the following Vivaldi installations. Choose target:` | `发现以下 Vivaldi 安装，请选择要安装到哪个：` |
| `target_path` | `Path` | `路径` |
| `target_type` | `Type` | `类型` |
| `target_type_system` | `System-wide (admin required)` | `系统级安装 (需要管理员权限)` |
| `target_type_user` | `User install` | `用户级安装` |
| `target_not_found` | `No Vivaldi installation found. Please install Vivaldi first.` | `未发现 Vivaldi 安装。请先安装 Vivaldi 浏览器。` |

#### CSS 模组选择

| Key | English | 简体中文 |
|---|---|---|
| `css_title` | `Select CSS mods to install (all selected by default)` | `选择要安装的 CSS 模组（默认全选）` |
| `css_locked_section` | `These mods are bundled with JS mods. Select in the next step.` | `以下模组与 JS 模组联动，请前往下一步选择` |
| `css_bundled_tag` | `bundled` | `联动` |

#### JS 模组选择

| Key | English | 简体中文 |
|---|---|---|
| `js_title` | `Select JavaScript mods to install (all selected by default)` | `选择要安装的 JavaScript 模组（默认全选）` |
| `js_bundled_section` | `These mods include CSS mods` | `以下模组附带 CSS 模组` |
| `js_bundled_arrow` | `CSS` | `CSS` |

#### 确认摘要 + 执行

| Key | English | 简体中文 |
|---|---|---|
| `summary_title` | `Installation Summary` | `安装确认` |
| `summary_target` | `Target` | `目标` |
| `summary_css_mods` | `CSS mods` | `CSS 模组` |
| `summary_js_mods` | `JS mods` | `JS 模组` |
| `summary_bundled_tag` | `bundled` | `联动` |
| `backup_start` | `Backing up window.html...` | `正在备份 window.html...` |
| `backup_done` | `Backed up to` | `已备份到` |
| `inject_start` | `Injecting mod loader...` | `正在注入模组加载器...` |
| `inject_done` | `injectMods.js injected` | `已注入 injectMods.js` |
| `deploy_start` | `Deploying mod files...` | `正在部署模组文件...` |
| `deploy_css_done` | `CSS mods deployed to user_mods/css/` | `个 CSS 模组已部署到 user_mods/css/` |
| `deploy_js_done` | `JS mods deployed to user_mods/js/` | `个 JS 模组已部署到 user_mods/js/` |
| `install_complete` | `Installation complete! Restart Vivaldi to take effect.` | `安装完成！请重启 Vivaldi 以生效。` |

#### 更新

| Key | English | 简体中文 |
|---|---|---|
| `update_title` | `Updating Awesome Vivaldi...` | `正在更新 Awesome Vivaldi...` |
| `update_fetching` | `Fetching latest mods...` | `正在拉取最新模组...` |
| `update_comparing` | `Comparing with installed mods...` | `正在对比已安装模组...` |
| `update_updated` | `updated` | `已更新` |
| `update_skipped` | `unchanged` | `未变化` |
| `update_complete` | `Update complete! ${n} mods updated.` | `更新完成！${n} 个模组已更新。` |

#### 卸载

| Key | English | 简体中文 |
|---|---|---|
| `uninstall_confirm` | `Are you sure you want to uninstall all Awesome Vivaldi mods?` | `确定要卸载所有 Awesome Vivaldi 模组吗？` |
| `uninstall_restoring` | `Restoring original window.html...` | `正在恢复原始 window.html...` |
| `uninstall_removing` | `Removing mod files...` | `正在移除模组文件...` |
| `uninstall_complete` | `Uninstall complete. Vivaldi is back to its original state.` | `卸载完成。Vivaldi 已恢复初始状态。` |
| `uninstall_no_bak` | `Backup file not found. Cannot restore original window.html.` | `未找到备份文件，无法恢复原始 window.html。` |

#### 错误信息

| Key | English | 简体中文 |
|---|---|---|
| `error_admin_required` | `Administrator privileges required. Requesting elevation...` | `需要管理员权限。正在请求提权...` |
| `error_vivaldi_running` | `Vivaldi is running. Please close it before installing.` | `Vivaldi 正在运行，请关闭后再安装。` |
| `error_permission_denied` | `Permission denied. Try running as administrator.` | `权限不足，请以管理员身份运行。` |

#### 模组描述（CSS）

| Key | English | 简体中文 |
|---|---|---|
| `mod_desc_AdaptiveBF` | `Auto-hide back/forward buttons when unnecessary` | `无用的前进/后退按钮自动隐藏` |
| `mod_desc_BetterAnimation` | `Smoother overscroll bounce animation` | `页面滚动橡皮筋回弹更平滑` |
| `mod_desc_BtnHoverAnime` | `Toolbar button hover micro-animation` | `工具栏按钮悬停有微动效` |
| `mod_desc_DownloadPanel` | `Download panel dark theme adaptation` | `下载面板适配暗色主题` |
| `mod_desc_Extensions` | `Compact list layout for extensions menu` | `扩展菜单改为紧凑列表布局` |
| `mod_desc_FavouriteTabs` | `First 9 pinned tabs displayed as grid (Arc-style)` | `前9个固定标签以网格展示 (Arc 风格)` |
| `mod_desc_FindInPage` | `Floating find-in-page bar` | `页内搜索栏改为浮动悬浮式` |
| `mod_desc_LineBreak` | `Long text auto-wrap (useful for small screens)` | `长文本自动换行 (小屏幕实用)` |
| `mod_desc_PeekTabbar` | `Slide-out tab bar on hover when hidden` | `标签栏隐藏时鼠标触边滑出` |
| `mod_desc_Quietify` | `Subtle audio indicator, less visual noise` | `静音图标淡化，减少视觉干扰` |
| `mod_desc_RemoveClutter` | `Hide scrollbars, dividers and visual clutter` | `隐藏滚动条、分割线等视觉噪音` |
| `mod_desc_TabsTrail` | `Green accent trail on active/hovered tabs` | `当前标签显示绿色指示条` |
| `mod_desc_VivalArc` | `Arc browser style port (experimental)` | `Arc 浏览器风格移植 (实验性)` |
| `mod_desc_VividQC` | `Quick command panel styling` | `快速命令面板样式美化` |
| `mod_desc_TidyTabs_CSS` | `AI tab grouping style support` | `AI 分组标签的样式支持` |
| `mod_desc_VividPeek_CSS` | `Arc Peek popup window styling` | `Arc Peek 弹出窗口样式` |
| `mod_desc_VividPlayer_CSS` | `Vivaldi built-in player beautification` | `Vivaldi 内置播放器美化` |
| `mod_desc_VividToast_CSS` | `Toast notification popup styling` | `Toast 通知弹窗的样式` |
| `mod_desc_PinnedTabRestore_CSS` | `Pinned tab restore button styling` | `固定标签恢复按钮样式` |
| `mod_desc_InteractionFeedback_CSS` | `Button click micro-feedback animation` | `按钮点击等交互反馈动效` |

#### 模组描述（JS）

| Key | English | 简体中文 |
|---|---|---|
| `mod_desc_ModConfig` | `*Core* Shared settings panel (AI keys / mod params)` | `*核心* 共享设置面板 (AI Key / 模组参数)` |
| `mod_desc_AskOnPage` | `AI sidebar: page Q&A, summary, rewrite` | `AI 侧边栏：网页问答、摘要、改写` |
| `mod_desc_AutoHidePanel` | `Auto-collapse side panel on mouse leave` | `侧边栏鼠标离开后自动收起` |
| `mod_desc_EasyFiles` | `Quick file attach via clipboard & downloads` | `附件拖拽时自动列出剪贴板+下载文件` |
| `mod_desc_MonochromeIcons` | `Unified monochrome web panel icons` | `Web 面板图标统一为单色风格` |
| `mod_desc_QuickCapture` | `Smart area selection for screenshots` | `截图时自动识别并选中网页区域` |
| `mod_desc_TabManager` | `Workspace tab management panel` | `工作区标签管理面板，批量操作标签` |
| `mod_desc_TidyAddress` | `AI rewrites address bar URLs to short titles` | `AI 将地址栏 URL 改写为短标题` |
| `mod_desc_TidyDownloads` | `AI cleans up garbled download filenames` | `AI 自动清理下载文件名中的乱码` |
| `mod_desc_TidyTitles` | `AI condenses tab titles to meaningful phrases` | `AI 将标签标题精简为有意义的短语` |
| `mod_desc_WorkspaceThemeSwitcher` | `Auto-switch theme per workspace` | `切换工作区时自动更换主题` |
| `mod_desc_TidyTabs` | `AI auto-groups related tabs` | `AI 自动分组标签页` |
| `mod_desc_VividPeek` | `Arc-style popup page preview` | `Arc 风格弹出预览窗口` |
| `mod_desc_VividPlayer` | `Floating video player popup` | `全局视频播放悬浮窗` |
| `mod_desc_VividToast` | `Toast-style notification popups` | `Toast 风格通知弹窗` |
| `mod_desc_PinnedTabRestore` | `Right-click to restore recently closed pinned tabs` | `右键恢复最近关闭的固定标签` |
| `mod_desc_InteractionFeedback` | `Button click micro-feedback animation` | `按钮点击微动效反馈` |

### 6.5 实现方式

**PowerShell：** hashtable 嵌套

```powershell
$loc = @{
    en = @{
        installer_title  = "Awesome Vivaldi · Community Modpack Installer"
        target_title     = "Found the following Vivaldi installations. Choose target:"
        mod_desc_AdaptiveBF = "Auto-hide back/forward buttons when unnecessary"
        # ...
    }
    zh = @{
        installer_title  = "Awesome Vivaldi · 社区模组包安装器"
        target_title     = "发现以下 Vivaldi 安装，请选择要安装到哪个："
        mod_desc_AdaptiveBF = "无用的前进/后退按钮自动隐藏"
        # ...
    }
}

function tr($key) { return $loc[$lang][$key] }
```

**bash：** 函数分发

```bash
tr() {
    case "$lang" in
        zh)
            case "$1" in
                installer_title) echo "Awesome Vivaldi · 社区模组包安装器" ;;
                target_title)   echo "发现以下 Vivaldi 安装，请选择要安装到哪个：" ;;
                mod_desc_AdaptiveBF) echo "无用的前进/后退按钮自动隐藏" ;;
                # ...
            esac
            ;;
        *)
            case "$1" in
                installer_title) echo "Awesome Vivaldi · Community Modpack Installer" ;;
                target_title)   echo "Found the following Vivaldi installations. Choose target:" ;;
                mod_desc_AdaptiveBF) echo "Auto-hide back/forward buttons when unnecessary" ;;
                # ...
            esac
            ;;
    esac
}
```

---

## 7. 安装器脚本设计

### 7.1 脚本语言：零依赖原生脚本

| 平台 | 脚本 | 预装率 | TUI 实现 |
|---|---|---|---|
| **Windows** | PowerShell 5.1 | Win10/11 100% | `$host.UI.RawUI.ReadKey()` + ANSI 转义序列 |
| **macOS** | bash 3.2+ | 所有 macOS 100% | `read -rsn1` + `tput` 光标控制 |

两条命令：

```powershell
# Windows（PowerShell）
powershell -c "iwr https://raw.githubusercontent.com/PaRr0tBoY/Awesome-Vivaldi/main/install.ps1 | iex"
```

```bash
# macOS
curl -fsSL https://raw.githubusercontent.com/PaRr0tBoY/Awesome-Vivaldi/main/install.sh | bash
```

### 7.2 Windows：`install.ps1` 关键函数

```
Install-AwesomeVivaldi
  ├── Show-AsciiBanner              → void                   (显示 ASCII 艺术字)
  ├── Find-VivaldiInstallations     → VivaldiInstallation[]  (路径发现)
  ├── Test-IsAlreadyInstalled       → bool                   (检测 user_mods/ 是否存在)
  ├── Show-MainMenu                 → 'install'|'update'|'manage'|'uninstall'
  │     (已安装时显示：更新/管理/卸载)
  ├── Select-VivaldiTarget          → VivaldiInstallation    (TUI 单选)
  ├── Select-CssMods                → string[]               (TUI 多选，含描述)
  │     - 首行：全选/全不选开关
  │     - 管理模式：已安装项预选为 [✓]
  ├── Select-JsMods                 → string[]               (TUI 多选，含描述+捆绑)
  │     - 首行：全选/全不选开关
  │     - 选中 JS 自动选中捆绑 CSS
  │     - 管理模式：已安装项预选为 [✓]
  ├── Show-InstallationSummary      → void                   (显示摘要)
  ├── Backup-WindowHtml             → void
  ├── Invoke-HtmlInjection          → void                   (注入 injectMods.js)
  ├── Deploy-UserMods               → void                   (复制 CSS + JS 到 user_mods/)
  ├── Invoke-Update                 → void                   (覆盖已安装模组)
  ├── Invoke-Manage                 → void                   (增删模组)
  ├── Invoke-Uninstall              → void                   (恢复原始状态)
  └── Confirm-Installation          → void                   (验证 + 报告)
```

**安装状态标记文件：** `user_mods/.awesome-vivaldi.json`

```json
{
  "version": "8.0",
  "installed_at": "2026-07-07T12:00:00",
  "css_mods": ["AdaptiveBF.css", "BetterAnimation.css", ...],
  "js_mods": ["ModConfig.js", "AskOnPage.js", ...]
}
```

此文件由安装器在部署完成后写入，用于：
- 重入检测（文件存在 = 已安装）
- 管理模式预选中（读取 `css_mods` / `js_mods` 列表）
- 更新模式 diff（对比当前仓库文件与已安装列表）

**TUI 多选实现要点（PowerShell）：**

```powershell
# 核心循环
while ($true) {
    [Console]::CursorVisible = $false
    # 清除上一帧 + 重新渲染
    $spans = @($cursorPos - 1) * "`e[1A`e[2K"  # 上移并清行
    Write-RenderedList $items $selected $cursor $title
    
    $key = $host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
    switch ($key.VirtualKeyCode) {
        38 { $cursor-- }          # Up
        40 { $cursor++ }          # Down
        32 { $selected[$cursor] = !$selected[$cursor] }  # Space
        13 { break outer }        # Enter
        27 { exit }               # Escape
        65 { # 'A' = select all }
        68 { # 'D' = deselect all }
    }
}
```

### 7.3 macOS：`install.sh` 关键函数

```
install_awesome_vivaldi()
  ├── show_ascii_banner()            → void                   (显示 ASCII 艺术字)
  ├── find_vivaldi_installations()   → 路径数组               (路径发现)
  ├── is_already_installed()         → bool                   (检测 user_mods/ 是否存在)
  ├── show_main_menu()               → install|update|manage|uninstall
  │     (已安装时显示：更新/管理/卸载)
  ├── select_vivaldi_target()        → 路径                   (TUI 单选)
  ├── select_css_mods()              → 文件名数组             (TUI 多选，含描述)
  │     - 首行：全选/全不选开关
  │     - 管理模式：已安装项预选为 [✓]
  ├── select_js_mods()               → 文件名数组             (TUI 多选，含描述+捆绑)
  │     - 首行：全选/全不选开关
  │     - 选中 JS 自动选中捆绑 CSS
  │     - 管理模式：已安装项预选为 [✓]
  ├── show_summary()                 → void                   (显示摘要)
  ├── backup_window_html()           → void
  ├── inject_mod_loader()            → void                   (注入 injectMods.js)
  ├── deploy_user_mods()             → void                   (复制 CSS + JS 到 user_mods/)
  ├── do_update()                    → void                   (覆盖已安装模组)
  ├── do_manage()                    → void                   (增删模组)
  ├── do_uninstall()                 → void                   (恢复原始状态)
  └── confirm_installation()         → void                   (验证 + 报告)
```

**TUI 多选实现要点（bash）：**

```bash
# 原始模式输入
stty -echo -icanon  # 禁用回显和行缓冲
trap 'stty echo icanon; tput cnorm' EXIT  # 退出时恢复

while true; do
    tput civis      # 隐藏光标
    tput cup 0 0    # 光标回左上角重绘
    render_list "$title" items selected $cursor
    
    read -rsn1 key
    case "$key" in
        $'\x1b') read -rsn2 -t 0.1 esc
            case "$esc" in
                '[A') cursor=$((cursor - 1)) ;;  # Up
                '[B') cursor=$((cursor + 1)) ;;  # Down
            esac ;;
        '')  break ;;              # Enter
        ' ') toggle_selected ;;    # Space
        'a') select_all ;;
        'd') deselect_all ;;
    esac
done
```

### 7.4 `window.html` 注入方式

不替换整个文件，只注入**一行**（参考 vivaldimodmanager `ToggleMods`）：

```
原始:
    <body>
    <script src="bundle.js"></script>

注入后:
    <body>
    <script src="injectMods.js"></script>
    <script src="bundle.js"></script>
```

实现：
- **PowerShell**: `$html -replace '(<body>)', "`$1`r`n  <script src=`"injectMods.js`"></script>"` `
- **bash**: `sed -i '' '/<body>/a\  <script src="injectMods.js"></script>' window.html`

不依赖 `<title>` 缩进（vivaldimodmanager 的做法），直接匹配 `<body>` 标签。

---

## 8. 仓库文件变更

### 8.1 新增

```
Awesome-Vivaldi/
├── install.ps1              ← Windows 安装器（含 TUI 多选）
├── install.sh               ← macOS 安装器（含 TUI 多选）
├── injectMods.js            ← 模组加载器（部署到 resources/vivaldi/）
├── Doc/dev/
│   └── installer-design.md  ← 本文档
```

### 8.2 删除

- `Vivaldi8.0Stable/Javascripts/window.html` — 不再需要预配置的 window.html，安装器直接修改目标机器上的原始文件
- `Others/MacOSPatchScripts/upviv` — 被 `install.sh` 取代
- `Others/MacOSPatchScripts/bakviv` — 备份功能集成到安装器中
- `Others/MacOSPatchScripts/modviv` — 可保留作为开发工具

### 8.3 不变

- `Vivaldi8.0Stable/CSS/` — 目录结构不变
- `Vivaldi8.0Stable/Javascripts/` — 仅删除 `window.html`，其余 `.js` 不变
- `Vivaldi8.0Stable/Import.css` — 内容不变，部署到 `user_mods/css/`

---

## 9. 实施计划

### Phase 1：`injectMods.js` — 模组加载器

| 检查项 | 标准 |
|---|---|
| 能读取 `user_mods/` 目录 | `vivaldi:inspect/#apps` 的 console 中可见 |
| CSS 通过 `<link>` 注入并生效 | 页面样式变化 |
| JS 通过 `<script>` 注入并执行 | console 中看到模组初始化日志 |
| `ModConfig.js` 优先加载 | AI 模组能正常读取配置 |
| Import.css 的 `@import` 链在动态 `<link>` 中正常工作 | CSS 级联生效 |
| 空 `user_mods/` 不崩溃 | 页面正常 |

### Phase 2：`install.ps1` — Windows 安装器 + TUI

| 检查项 | 标准 |
|---|---|
| 启动画面 | ASCII 艺术字正确渲染（PowerShell 5.1 的等宽字体） |
| 语言检测 | `zh-CN`/`zh-TW` → 中文 UI，其余 → 英文 UI |
| 注册表发现 + 兜底 | stable 和 snapshot 都能发现 |
| 重入检测 | 检测 `user_mods/` 存在 → 显示更新/管理/卸载菜单 |
| TUI 单选：安装目标 | 方向键导航、ENTER 确认 |
| TUI 多选：CSS 模组 | SPACE 勾选、A 全选、D 全不选、首行全选开关 |
| TUI 多选：JS 模组 + 捆绑 | 选中 JS 自动选中捆绑 CSS |
| 模组描述显示 | 每个模组右侧显示一行功能描述（中/英） |
| 所有 UI 文字国际化 | en/zh 全覆盖，无硬编码中文 |
| 更新模式 | 覆盖已有模组文件，保留用户额外添加的模组 |
| 管理模式 | 已安装项预选为 [✓]，取消=删除，新勾选=安装 |
| 卸载模式 | 恢复 window.html + 删除 injectMods.js + 删除 user_mods/ |
| 备份 + 注入 + 部署 | 所有文件正确落位 |
| 权限管理 | 管理员安装时自动/UAC 提权 |

### Phase 3：`install.sh` — macOS 安装器 + TUI

| 检查项 | 标准 |
|---|---|
| 启动画面 | ASCII 艺术字正确渲染（Terminal.app 默认字体） |
| 语言检测 | `$LANG` 以 `zh` 开头 → 中文 UI，其余 → 英文 UI |
| find 发现 + 兜底 | stable 和 snapshot 都能发现 |
| 重入检测 + 更新/管理/卸载 | 同 Windows |
| TUI 单选 + 多选（含模组描述） | 同 Phase 2 |
| 所有 UI 文字国际化 | en/zh 全覆盖，无硬编码中文 |
| 全选/全不选开关 | 列表首行一键切换 |
| sudo 权限管理 | 需要时明确提示 |
| Vivaldi 进程检测 | 运行中时提示关闭 |

### Phase 4：边界情况 + 鲁棒性

| 检查项 | 标准 |
|---|---|
| 无 Vivaldi | 友好错误信息 |
| 多安装共存 | 全部列出供选择 |
| 路径含空格 | 正常处理 |
| 已安装但 `user_mods/` 为空 | 视为首次安装 |
| `.bak` 文件缺失时卸载 | 提示无法恢复原始 window.html，但仍清理模组文件 |
| Vivaldi 更新后版本号变化 | 重新运行安装器自动发现新版本路径，重新注入 |

---

## 10. 风险

| 风险 | 缓解 |
|---|---|
| `Import.css` 的 `@import` 在动态 `<link>` 中不生效 | Phase 1 第一时间验证；若不生效则改为遍历所有 `.css` 分别创建 `<link>` |
| `chrome.runtime.getPackageDirectoryEntry` 行为因 Vivaldi 版本而异 | Chromium 标准 API，Vivaldi 8.0 已验证可用 |
| macOS `find` 找不到 Framework | 已有 `upviv` 脚本验证；兜底用 `mdfind` |
| PowerShell 执行策略阻止 `iex` | `iex` 不需要执行策略允许（只读入内存，不写文件）；若仍有问题提供下载 `.ps1` 文件的备选说明 |

---

## 11. 纰漏清单与解决方案（已全部确认）

### 11.1 脚本如何获取模组文件？ ✅

**决策：双层架构。** 脚本启动时检测自身是否在仓库目录内：
- 在仓库内 → 直接使用本地文件（`$PSScriptRoot` / `$(dirname "$0")`），update 用 `git pull`
- 不在（远程 `curl | bash` / `iwr | iex`）→ 下载 GitHub zipball 到临时目录（`Expand-Archive` / `unzip`），update 重新下载 zipball

### 11.2 脚本自我定位 ✅

**决策：相对于脚本自身位置。** 约定安装脚本放在仓库根目录，`$PSScriptRoot/../Vivaldi8.0Stable/` 即模组文件路径。

### 11.3 `injectMods.js` 规格 ✅

| 子项 | 决策 |
|---|---|
| CSS 加载 | 只加载 `Import.css`，利用 `@import` 链展开其余 CSS。Phase 1 验证 |
| JS 顺序 | `PRIORITY = ['ModConfig.js']` 优先加载，其余按字母序 |
| crxfs 前缀 | Phase 1 实测 `console.log(mod.fullPath)` 确认是否需 strip |

### 11.4 PowerShell 中文编码 ✅

**决策：脚本开头强制 UTF-8。** `[Console]::OutputEncoding = [Text.Encoding]::UTF8` + `$PSDefaultParameterValues['*:Encoding'] = 'utf8'`。

### 11.5 重复注入检测 ✅

**决策：注入前 grep 检查。** 如果 `window.html` 已包含 `injectMods.js` 则跳过注入步骤。

### 11.6 版本号比较 ✅

**决策：使用平台原生版本比较。** PowerShell: `[version]` cast；bash: `awk` 分段补零为 `%04d.%04d.%04d.%04d` 格式后字符串比较。

### 11.7 部署时序 ✅

**决策：严格顺序。** 1.备份 → 2.部署 `injectMods.js` → 3.注入 `window.html` → 4.部署 `user_mods/`。确保引用前文件已存在。

### 11.8 管理模式边界 ✅

**决策：白名单制。** 只管理 `.awesome-vivaldi.json` 中记录的模组。用户手动放入 `user_mods/` 的文件完全不受影响。仓库已删除但记录尚存的模组标记为 `[orphan]` 并提示。

### 11.9 TUI 列表溢出 ✅

**决策：截断 + 提示。** 当项目数超过终端高度时，只显示前 N 个，最后一行显示 `... and X more (↓ scroll to see)`。

### 11.10 卸载确认强度 ✅

**决策：Y/N 二次确认。** 显示确认提示，用户按 Y 执行卸载，N 返回。

### 11.11 更新模式文件来源 ✅

**决策：双层策略。** 从 clone 的仓库运行用 `git pull`；从 zipball 引导运行重新下载 zipball。Git 未安装时提示安装或降级为 zipball。

### 11.12 macOS sed 兼容 ✅

**决策：检测适配。** 运行时检测是 GNU sed 还是 BSD sed，分别使用 `-i` 或 `-i ''`。

### 11.13 ASCII 艺术字 ✅

**决策：使用 Unicode 块字符版本。** 文档 3.0 节中的 ▄▄ 版本已确认。

### 11.14 Vivaldi 进程检测 ✅

**决策：不阻止安装，安装后提示重启。** `window.html` 可在 Vivaldi 运行时替换。安装完成后询问用户是否立即重启 Vivaldi：
- Windows: `Start-Process vivaldi.exe`
- macOS: `open /Applications/Vivaldi.app --args --debug-packed-apps --silent-debugger-extension-api`

---

## 12. 确认汇总

| # | 问题 | 决策 |
|---|---|---|
| 11.1 | 文件获取 | 双层架构（本地文件 / 下载 zipball） |
| 11.2 | 脚本定位 | `$PSScriptRoot` / `$(dirname "$0")` |
| 11.3.1 | CSS 加载 | 只加载 Import.css，@import 链 |
| 11.3.2 | JS 顺序 | PRIORITY 数组 + 字母序 |
| 11.3.3 | crxfs 前缀 | Phase 1 实测决定 |
| 11.4 | PS 编码 | `[Console]::OutputEncoding` 强制 UTF-8 |
| 11.5 | 重复注入 | 注入前 grep 检查 |
| 11.6 | 版本比较 | `[version]` cast / awk 分段补零 |
| 11.7 | 部署顺序 | injectMods.js → window.html → user_mods |
| 11.8 | 管理边界 | 白名单制（`.awesome-vivaldi.json`） |
| 11.9 | TUI 溢出 | 截断 + 提示 |
| 11.10 | 卸载确认 | Y/N 二次确认 |
| 11.11 | 更新来源 | 双层策略（git pull / zipball） |
| 11.12 | macOS sed | 检测 GNU/BSD 适配 |
| 11.13 | ASCII 艺术 | Unicode 块字符 ▄▄ 版本 |
| 11.14 | 进程检测 | 运行时替换，安装后提示重启 |
