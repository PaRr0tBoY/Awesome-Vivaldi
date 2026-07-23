<# ==UserScript==
 * @name         Volante Installer (Windows)
 * @description  Zero-dependency TUI installer for Volante modpack.
 * @version      2026.7.14
 * @author       Ryan (Acid)
 * @website      https://github.com/PaRr0tBoY/Awesome-Vivaldi
 * @usage        irm https://raw.githubusercontent.com/PaRr0tBoY/Awesome-Vivaldi/main/install.ps1 | iex
 * ==/UserScript==
#>

#Requires -Version 5.1

param([switch]$Auto)

# ============================================================
#  0.  Encoding & Bootstrap
# ============================================================

[Console]::OutputEncoding = [Text.Encoding]::UTF8
$PSDefaultParameterValues['*:Encoding'] = 'utf8'

$Script:Auto = $Auto
$Script:Lang = if (([Globalization.CultureInfo]::CurrentUICulture.Name -match '^zh') -or ($env:LANG -match '^zh')) { 'zh' } else { 'en' }
$Script:Esc = [char]27
$Script:RepoRoot = if ($PSScriptRoot) { $PSScriptRoot } else { $null }
$Script:SourceDir = $null
$Script:TempDir = $null
$Script:LastRenderLines = 0
$Script:BannerHeight = 0
$Script:CachedModSource = $null
$Script:ProviderConfig = $null  # Set by provider page; $null = skipped

# ============================================================
#  1.  i18n 
# ============================================================

$Script:Loc = @{
	en = [ordered]@{
		# ── Banner ──
		installer_title    = "Volante : Community Modpack Installer"

		# ── Entry ──
		entry_installed_title    = "Volante is already installed"
		entry_not_installed_title = "Volante is not yet installed"
		entry_choose_action      = "Choose an action:"
		entry_install            = "Install"
		entry_install_desc       = "Select and install mods"
		entry_manage             = "Manage"
		entry_manage_desc        = "Add or remove mods"
		entry_update             = "Update"
		entry_update_desc        = "Check for and apply mod updates"
		entry_uninstall          = "Uninstall"
		entry_uninstall_desc     = "Remove some or all mods"
		entry_ai_install         = "Install AI Modules"
		entry_ai_install_desc    = "Add AI-powered modules to existing installation"
		entry_ai_uninstall       = "Uninstall AI Modules"
		entry_ai_uninstall_desc  = "Remove AI modules from current installation"
		entry_reinstall          = "Reinstall"
		entry_reinstall_desc     = "Remove everything and reinstall from scratch"
		entry_exit               = "Exit"
		entry_exit_desc          = "Quit installer"
		entry_dev_install         = "Install Dev Mods"
		entry_dev_install_desc    = "Reinstall new/developing mods from local repo"
		dev_install_title         = "Install Dev Mods"
		dev_install_confirm       = "Install {0} dev mod(s)? (will reinstall every time)"
		dev_install_none          = "No new dev mods found."
		dev_install_done          = "{0} dev mod(s) deployed. Restarting Vivaldi..."
		entry_installed_count    = "Currently installed: {0} CSS mods, {1} JS mods"

		# ── Target selection ──
		target_title          = "Select Vivaldi installation target:"
		target_path           = "Path"
		target_type           = "Type"
		target_type_system    = "System-wide (admin required)"
		target_type_user      = "User install"
		target_none_found     = "No Vivaldi installation found. Please install Vivaldi first."

		# ── Style selection ──
		style_title          = "Style: UI & Page Modifications"
		style_intro          = "Mods that visually modify Vivaldi or add new page elements"

		# ── Function selection ──
		function_title       = "Function: Pure Functionality"
		function_intro       = "Mods that add features without modifying page appearance"

		# ── Install mode ──
		install_mode_title     = "Choose install mode:"
		install_mode_default   = "Default"
		install_mode_default_desc = "Recommended settings — one-click install"
		install_mode_custom    = "Custom"
		install_mode_custom_desc  = "Pick each mod yourself"

		# ── AI selection ──
		ai_title           = "AI: AI-Powered Modules"
		ai_intro           = "AI-driven mods for smart content processing and assistance"

		# ── AI consent ──
		ai_consent_title   = "AI Module Notice"
		ai_consent_text    = "AI modules send data (page content, URLs, tab titles) to third-party AI services for processing. This may include browsing history and page content."
		ai_consent_accept  = "Accept — view AI modules"
		ai_consent_decline = "Skip — no AI modules"

		# ── Summary / Confirm ──
		summary_title        = "Installation Summary"
		summary_target       = "Target"
		summary_style_mods   = "Style mods"
		summary_function_mods = "Function mods"
		summary_ai_mods      = "AI mods"
		summary_bundled_tag  = "(bundled)"
		confirm_deploy_hint  = "ENTER to deploy | LEFT/RIGHT switch page | L language | ESC/Q quit"
		# ── Silent install (always deployed, never shown in UI) ──
		silent_install        = "Core modules (always installed)"
		# ── Default-off reasons ──
		default_off_reason_FavouriteTabs       = "Uses CSS display:contents — breaks tab drag-and-drop"
		default_off_reason_InteractionFeedback = "Adds click feedback on every button — can feel noisy"
		default_off_reason_TidyAddress         = "Sends URLs to AI service for rewriting"
		default_off_reason_TabManager          = "Redundant with Vivaldi built-in workspace management"
		default_off_reason_Diabar              = "Sends page content to AI service for Q&A"
		step_ai        = "AI"
		# ── Manage summary ──
		manage_confirm_title  = "Confirm Changes"
		manage_applying       = "Applying changes..."
		manage_new_mods       = "New mods to install"
		manage_removed_mods   = "Mods to remove"
		manage_unchanged_mods = "Unchanged mods"
		manage_no_changes     = "No changes detected. Nothing to do."

		# ── Update flow ──
		update_title           = "Update Mods"
		update_checking        = "Checking for updates..."
		update_available_title = "Mods with updates available"
		update_no_updates      = "All mods are up to date."
		update_select          = "Select mods to update:"
		update_confirm_title   = "Confirm Update"
		update_updating        = "Applying updates..."
		update_updated_mod     = "updated"
		update_skipped         = "skipped"
		update_complete        = "Update complete! {0} mods updated."

		# ── Uninstall flow ──
		uninstall_title         = "Uninstall"
		uninstall_type_prompt   = "Choose uninstall type:"
		uninstall_full          = "Uninstall entire modpack"
		uninstall_full_desc     = "Remove all mods, restore Vivaldi to original state"
		uninstall_selective     = "Uninstall specific mods"
		uninstall_selective_desc = "Choose which mods to remove"
		uninstall_full_confirm  = "This will remove ALL mods and restore Vivaldi. Continue?"
		uninstall_cancelled     = "Uninstall cancelled."
		uninstall_restoring     = "Restoring original window.html..."
		uninstall_removing      = "Removing mod files..."
		uninstall_complete      = "Uninstall complete. Vivaldi is back to its original state."
		uninstall_no_bak        = "Backup file not found. Cannot restore original window.html."
		uninstall_no_mods       = "No Volante installation detected. Nothing to uninstall."

		# ── Deploy ──
		deploy_backup_start    = "Backing up window.html..."
		deploy_backup_done     = "Backed up to"
		deploy_inject_start    = "Injecting mod loader..."
		deploy_inject_done     = "injectMods.js injected"
		deploy_inject_skip     = "injectMods.js already present, skipping injection"
		deploy_start           = "Deploying mod files..."
		deploy_css_done        = "{0} CSS mods deployed to user_mods/css/"
		deploy_js_done         = "{0} JS mods deployed to user_mods/js/"
		deploy_success         = "Installation complete! Restart Vivaldi to take effect."
	deploy_cleaned         = "Cleaned up {0} previously installed mod(s)."

		# ── Post-install ──
		post_vivaldi_running   = "Vivaldi is currently running."
		post_restart_prompt    = "Restart Vivaldi now? [Y/N] (Enter=Y)"
		post_launch_prompt     = "Launch Vivaldi now? [Y/N] (Enter=Y)"
		post_restarting        = "Restarting Vivaldi..."

		# ── Cross-version restore ──
		restore_detected  = "Vivaldi has been updated! Previous mod configuration found."
		restore_prompt    = "Restore mods from version {0}?"
		restore_option    = "Yes — restore my mods"
		restore_fresh     = "No — start fresh"
		restore_copying   = "Restoring mods from persistent storage..."
		restore_done      = "Restored {0} CSS + {1} JS mods from previous version."

		# ── Errors ──
		error_admin_required  = "Administrator privileges required. Requesting elevation..."
		elevate_prompt        = "ENTER to request elevation | ESC/Q to quit"
		error_download        = "ERROR: Failed to download modpack. Check your internet connection."
		error_extract         = "ERROR: Failed to extract modpack archive."
		error_no_source       = "ERROR: Could not locate mod source files."
		error_permission      = "ERROR: Permission denied. Run as Administrator for system-wide Vivaldi installations."
		error_persist_write   = "Warning: Persistent storage write failed. Mods will not survive Vivaldi updates."


		# ── AI flow ──
		ai_uninstall_confirm = "Uninstall all AI modules?"
		ai_uninstall_done    = "{0} AI module(s) removed."
		ai_install_done      = "{0} AI module(s) installed."
		# ── Source acquisition ──
		source_downloading = "Downloading Volante modpack..."
		source_extracting  = "Extracting mod files..."
		source_done        = "Mod files ready."

		key_nav_confirm     = "UP/DOWN navigate | ENTER confirm | L language | ESC/Q quit"
		key_multiselect     = "UP/DOWN navigate | SPACE toggle | A all | D none | L lang"
		key_confirm_back    = "ENTER confirm | LEFT back"
		key_left_back       = "LEFT back"
		key_right_next      = "RIGHT next"
		key_exit            = "ESC/Q quit"
		key_enter_confirm   = "ENTER confirm"
		key_enter_update    = "ENTER to update"
		key_enter_uninstall = "ENTER to uninstall"
		toggle_all          = "(Select All / Deselect All)"

		# ── Misc ──
		separator       = "________________________________________"
		# ── Step labels ──
		step_style     = "Style"
		step_function  = "Function"
		step_confirm   = "Confirm"
		step_target    = "Target"
		step_provider  = "Provider"
		# ── Provider selection ──
		provider_title           = "AI Provider Configuration"
		provider_intro           = "Select a default AI provider for all AI modules. You can skip this and configure later in Vivaldi Settings > Appearance."
		provider_skip            = "Skip (use default OpenRouter)"
		provider_skip_hint       = "Uses OpenRouter free model. Availability not guaranteed. You can configure in Vivaldi Settings later."
		provider_enter_key       = "Enter API Key for {0}:"
		provider_key_placeholder = "Paste your API key and press Enter"
		provider_saved           = "Provider configuration saved."
		provider_custom_endpoint = "Enter API Endpoint:"
		provider_custom_name     = "Enter a name for this provider:"

		# ── Mod descriptions (by base name) ──
		# Style mods
		mod_desc_BtnHoverAnime       = "Toolbar button hover micro-animation"
		mod_desc_DownloadPanel       = "Download panel dark theme adaptation"
		mod_desc_Extensions          = "Compact list layout for extensions menu"
		mod_desc_FavouriteTabs       = "First 9 pinned tabs displayed as grid (Arc-style)"
		mod_desc_Quietify            = "Subtle audio indicator, less visual noise"
		mod_desc_RemoveClutter       = "Hide scrollbars, dividers and visual clutter"
		mod_desc_TabsTrail           = "Green accent trail on active/hovered tabs"
		mod_desc_VivalArc            = "Arc browser style port (experimental)"
		mod_desc_VividQC             = "Quick command panel styling"
		mod_desc_MonochromeIcons     = "Unified monochrome web panel icons"
		mod_desc_PinnedTabRestore    = "Right-click to restore recently closed pinned tabs"
		mod_desc_QuickCapture        = "Smart area selection for screenshots"
		mod_desc_VividPlayer         = "Floating video player popup"
		mod_desc_VividToast          = "Toast-style notification popups"
		# Function mods
		mod_desc_AdaptiveBF          = "Auto-hide back/forward buttons when unnecessary"
		mod_desc_BetterAnimation     = "Smoother overscroll bounce + tabbar retract animation"
		mod_desc_InteractionFeedback = "Button click micro-feedback animation"
		mod_desc_LineBreak           = "Long text auto-wrap (useful for small screens)"
		mod_desc_PeekTabbar          = "Slide-out tab bar on hover when hidden"
		mod_desc_VividPeek           = "Arc-style popup page preview"
		mod_desc_AutoHidePanel       = "Auto-collapse side panel on mouse leave"
		mod_desc_EasyFiles           = "Quick file attach via clipboard & downloads"
		mod_desc_TabManager          = "Workspace tab management panel"
		mod_desc_WorkspaceThemeSwitcher = "Auto-switch theme per workspace"
		# AI mods
		mod_desc_ModConfig           = "*Core* Shared settings panel (AI keys / mod params)"
		mod_desc_AskOnPage           = "Ctrl+F AI page search — find or ask anything"
		mod_desc_Diabar              = "AI sidebar: page Q&A, summary, rewrite"
		mod_desc_TidyTabs            = "AI auto-groups related tabs"
		mod_desc_TidyAddress         = "AI rewrites address bar URLs to short titles"
		mod_desc_TidyDownloads       = "AI cleans up garbled download filenames"
		mod_desc_TidyTitles          = "AI condenses tab titles to meaningful phrases"
		mod_desc_VividAI             = "*Core* Shared AI config loader and API caller"
		mod_desc_VividMarkdown       = "*Core* Markdown renderer with LaTeX and code highlight"
	}
	zh = [ordered]@{
		installer_title    = "Volante : 社区模组包安装器"
		entry_installed_title    = "Volante 已安装"
		entry_not_installed_title = "Volante 尚未安装"
		entry_choose_action      = "请选择操作:"
		entry_uninstall          = "卸载"
		entry_uninstall_desc     = "移除部分或全部模组"
		entry_ai_install         = "安装 AI 模块"
		entry_ai_install_desc    = "为现有安装添加 AI 智能模块"
		entry_ai_uninstall       = "卸载 AI 模块"
		entry_ai_uninstall_desc  = "从当前安装中移除 AI 模块"
		entry_reinstall          = "重新安装"
		entry_reinstall_desc     = "卸载后重新从头安装"
		entry_exit               = "退出"
		entry_manage             = "管理"
		entry_manage_desc        = "增删模组"
		entry_update             = "更新"
		entry_update_desc        = "检查并应用模组更新"
		entry_exit_desc          = "退出安装器"
		entry_dev_install         = "安装开发模组"
		entry_dev_install_desc    = "从本地仓库重新安装新/开发中的模组"
		dev_install_title         = "安装开发模组"
		dev_install_confirm       = "安装 {0} 个开发模组? (每次运行都会重新安装)"
		dev_install_none          = "未发现新的开发模组."
		dev_install_done          = "已部署 {0} 个开发模组, 正在重启 Vivaldi..."
		entry_installed_count    = "当前已安装: {0} 个 CSS 模组, {1} 个 JS 模组"
		target_title          = "选择 Vivaldi 安装目标:"
		target_path           = "路径"
		target_type           = "类型"
		target_type_system    = "系统级安装 (需要管理员权限)"
		target_type_user      = "用户级安装"
		target_none_found     = "未发现 Vivaldi 安装. 请先安装 Vivaldi 浏览器."
		style_title          = "样式: 界面与页面修饰"
		style_intro          = "视觉修饰 Vivaldi 或添加新页面元素的模组"
		function_title       = "功能: 纯功能增强"
		function_intro       = "添加功能但不修改页面外观的模组"
		install_mode_title     = "选择安装方式:"
		install_mode_default   = "默认安装"
		install_mode_default_desc = "推荐配置, 一键安装"
		install_mode_custom    = "自定义安装"
		install_mode_custom_desc  = "自行挑选每个模组"
		ai_title           = "AI: AI 智能模块"
		ai_intro           = "AI 驱动的智能内容处理与辅助模组"
		ai_consent_title   = "AI 模块说明"
		ai_consent_text    = "AI 模块会将数据 (页面内容、网址、标签标题) 发送至第三方 AI 服务进行处理, 可能涉及浏览历史和页面内容."
		ai_consent_accept  = "接受 — 查看 AI 模组"
		ai_consent_decline = "跳过 — 不安装 AI 模组"
		summary_title        = "安装确认"
		summary_target       = "目标"
		summary_style_mods   = "样式模组"
		summary_function_mods = "功能模组"
		summary_ai_mods      = "AI 模组"
		summary_bundled_tag  = "(联动)"
		confirm_deploy_hint  = "ENTER 部署 | LEFT/RIGHT 切换页面 | L 语言 | ESC/Q 退出"
		silent_install        = "核心模块 (始终安装)"
		default_off_reason_FavouriteTabs       = "使用 CSS display:contents, 破坏标签拖拽功能"
		default_off_reason_InteractionFeedback = "每个按钮点击都有反馈动画, 可能过于吵闹"
		default_off_reason_TidyAddress         = "将网址发送至 AI 服务进行改写"
		default_off_reason_TabManager          = "与 Vivaldi 内置工作区管理功能重复"
		default_off_reason_Diabar              = "将页面内容发送至 AI 服务进行问答"
		manage_confirm_title  = "变更确认"
		manage_applying       = "正在应用更改..."
		manage_new_mods       = "新增安装"
		manage_removed_mods   = "将要卸载"
		manage_unchanged_mods = "保持不变"
		manage_no_changes     = "没有变更. 无需操作."
		update_title           = "更新模组"
		update_checking        = "正在检查更新..."
		update_available_title = "有可用更新的模组"
		update_no_updates      = "所有模组均为最新版本."
		update_select          = "选择要更新的模组:"
		update_confirm_title   = "确认更新"
		update_updating        = "正在应用更新..."
		update_updated_mod     = "已更新"
		update_skipped         = "已跳过"
		update_complete        = "更新完成! {0} 个模组已更新."
		uninstall_title         = "卸载"
		uninstall_type_prompt   = "选择卸载方式:"
		uninstall_full          = "卸载整个整合包"
		uninstall_full_desc     = "移除所有模组, 恢复 Vivaldi 初始状态"
		uninstall_selective     = "卸载选定模组"
		uninstall_selective_desc = "自行勾选要卸载的模组"
		uninstall_full_confirm  = "这将移除所有模组并恢复 Vivaldi 初始状态. 确认继续?"
		uninstall_cancelled     = "已取消卸载."
		uninstall_restoring     = "正在恢复原始 window.html..."
		uninstall_removing      = "正在移除模组文件..."
		uninstall_complete      = "卸载完成. Vivaldi 已恢复初始状态."
		uninstall_no_bak        = "未找到备份文件, 无法恢复原始 window.html."
		uninstall_no_mods       = "未检测到 Volante 安装. 无需卸载."
		deploy_backup_start    = "正在备份 window.html..."
		deploy_backup_done     = "已备份到"
		deploy_inject_start    = "正在注入模组加载器..."
		deploy_inject_done     = "已注入 injectMods.js"
		deploy_inject_skip     = "injectMods.js 已存在, 跳过注入"
		deploy_start           = "正在部署模组文件..."
		deploy_css_done        = "{0} 个 CSS 模组已部署到 user_mods/css/"
		deploy_js_done         = "{0} 个 JS 模组已部署到 user_mods/js/"
		deploy_success         = "安装完成! 请重启 Vivaldi 以生效."
		deploy_cleaned         = "清理了 {0} 个之前手动安装的模组."
		post_vivaldi_running   = "Vivaldi 正在运行."
		post_restart_prompt    = "是否现在重启 Vivaldi? [Y/N] (Enter=Y)"
		post_launch_prompt     = "是否现在启动 Vivaldi? [Y/N] (Enter=Y)"
		post_restarting        = "正在重启 Vivaldi..."
		restore_detected  = "Vivaldi 已更新! 发现旧版本模组配置."
		restore_prompt    = "从版本 {0} 恢复模组?"
		restore_option    = "是 — 恢复我的模组"
		restore_fresh     = "否 — 全新安装"
		restore_copying   = "正在从持久化存储恢复模组..."
		restore_done      = "已从旧版本恢复 {0} CSS + {1} JS 模组."
		error_admin_required  = "需要管理员权限, 正在请求提升..."
		elevate_prompt        = "ENTER 请求提权 | ESC/Q 退出"
		error_download        = "错误: 无法下载模组包. 请检查网络连接."
		error_extract         = "错误: 无法解压模组包."
		error_no_source       = "错误: 找不到模组源文件."
		error_permission      = "错误: 权限不足. 系统级安装请以管理员身份运行."
		error_persist_write   = "警告: 持久化存储写入失败. 模组在 Vivaldi 更新后将丢失."

		# ── AI flow ──
		ai_uninstall_confirm = "确认卸载所有 AI 模块?"
		ai_uninstall_done    = "已卸载 {0} 个 AI 模块."
		ai_install_done      = "已安装 {0} 个 AI 模块."
		source_downloading = "正在下载 Volante 模组包..."
		source_extracting  = "正在解压模组文件..."
		source_done        = "模组文件准备就绪."
		key_nav_confirm     = "UP/DOWN 导航 | ENTER 确认 | L 语言 | ESC/Q 退出"
		key_multiselect     = "UP/DOWN 导航 | SPACE 勾选 | A 全选 | D 全不选 | L 语言"
		key_confirm_back    = "ENTER 确认 | LEFT 返回"
		key_exit            = "ESC/Q 退出"
		key_left_back       = "LEFT 返回"
		key_right_next      = "RIGHT 下一步"
		key_enter_confirm   = "ENTER 确认"
		key_enter_update    = "ENTER 更新"
		key_enter_uninstall = "ENTER 卸载"
		toggle_all          = "(全选 / 全不选)"
		separator       = "________________________________________"
		step_style     = "样式"
		step_function  = "功能"
		step_ai        = "AI"
		step_confirm   = "确认"
		step_target    = "目标"
		step_provider  = "Provider"
		provider_title           = "AI 服务商配置"
		provider_intro           = "为所有 AI 模组选择默认服务商。可跳过此步，在 Vivaldi 设置 > 外观中配置。"
		provider_skip            = "跳过 (使用默认 OpenRouter)"
		provider_skip_hint       = "使用 OpenRouter 免费模型，不保障可用性。后续可在 Vivaldi 设置中配置。"
		provider_enter_key       = "输入 {0} 的 API Key:"
		provider_key_placeholder = "粘贴 API Key 后按回车"
		provider_saved           = "服务商配置已保存。"
		provider_custom_endpoint = "输入 API 地址:"
		provider_custom_name     = "输入服务商名称:"
		mod_desc_BtnHoverAnime       = "工具栏按钮悬停微动画"
		mod_desc_DownloadPanel       = "下载面板暗色主题适配"
		mod_desc_Extensions          = "扩展菜单紧凑列表布局"
		mod_desc_FavouriteTabs       = "前 9 个固定标签以网格展示 (Arc 风格)"
		mod_desc_Quietify            = "精简音频指示, 减少视觉噪声"
		mod_desc_RemoveClutter       = "隐藏滚动条、分隔线等视觉杂乱"
		mod_desc_TabsTrail           = "活跃/悬停标签的绿色强调尾迹"
		mod_desc_VivalArc            = "Arc 浏览器风格移植 (实验性)"
		mod_desc_VividQC             = "快速命令面板样式化"
		mod_desc_MonochromeIcons     = "统一的单色网页面板图标"
		mod_desc_PinnedTabRestore    = "右键恢复最近关闭的固定标签"
		mod_desc_QuickCapture        = "智能区域截图选取"
		mod_desc_VividPlayer         = "浮动视频播放器弹窗"
		mod_desc_VividToast          = "Toast 风格通知弹窗"
		mod_desc_AdaptiveBF          = "自动隐藏前进/后退按钮"
		mod_desc_BetterAnimation     = "更平滑的过滚动弹跳和标签栏收缩动画"
		mod_desc_InteractionFeedback = "按钮点击微反馈动画"
		mod_desc_LineBreak           = "长文本自动换行 (小屏幕适用)"
		mod_desc_PeekTabbar          = "标签栏隐藏时悬停滑出"
		mod_desc_VividPeek           = "Arc 风格弹窗页面预览"
		mod_desc_AutoHidePanel       = "鼠标离开时自动收起侧边栏"
		mod_desc_EasyFiles           = "通过剪贴板和下载快速附加文件"
		mod_desc_TabManager          = "工作区标签管理面板"
		mod_desc_WorkspaceThemeSwitcher = "按工作区自动切换主题"
		mod_desc_ModConfig           = "*核心* 共享设置面板 (AI 密钥/模组参数)"
		mod_desc_AskOnPage           = "Ctrl+F AI 页面搜索 — 查找或询问任何内容"
		mod_desc_Diabar              = "AI 侧边栏: 页面问答、摘要、改写"
		mod_desc_TidyTabs            = "AI 自动分组相关标签"
		mod_desc_TidyAddress         = "AI 将地址栏 URL 改写为简短标题"
		mod_desc_TidyDownloads       = "AI 清理乱码下载文件名"
		mod_desc_TidyTitles          = "AI 将标签标题压缩为有意义的短语"
		mod_desc_VividAI             = "*核心* 共享 AI 配置加载器与 API 调用"
		mod_desc_VividMarkdown       = "*核心* Markdown 渲染器 (LaTeX / 代码高亮)"
	}
}

function tr($key) {
	if (-not $key) { return "" }
	# Try current language first, fall back to English
	$table = $Script:Loc[$Script:Lang]
	if ($table -and $table.Contains($key)) { return $table[$key] }
	if ($Script:Lang -ne 'en') {
		$en = $Script:Loc['en']
		if ($en -and $en.Contains($key)) { return $en[$key] }
	}
	return $key
}

function trf {
	param($key)
	$fmt = tr $key
	if ($args.Count -gt 0) {
		return [string]::Format($fmt, [object[]]$args)
	}
	return $fmt
}

# ── Mods that default to OFF on fresh install ─────────────────────────
$Script:DefaultOff = @{
	"FavouriteTabs.js"      = $true
	"FavouriteTabs.css"     = $true
	"InteractionFeedback.js" = $true
	"InteractionFeedback.css" = $true
	"Diabar.js"             = $true
	"TidyAddress.js"        = $true
	"TabManager.js"         = $true
}

# ── Mod category definitions ────────────────────────────────────────
# Style: mods that visually modify Vivaldi UI or add page elements
# Function: pure functionality, no page modification
# AI: AI-powered modules
# SilentInstall: core deps always deployed, hidden from UI
$Script:SilentInstall = @("ModConfig", "VividAI", "VividMarkdown")
$Script:ProviderDefs = @(
	@{ Key = 'openrouter'; Label = 'OpenRouter'; Endpoint = 'https://openrouter.ai/api/v1/chat/completions'; KeyUrl = 'https://openrouter.ai/settings/keys' }
	@{ Key = 'deepseek';  Label = 'DeepSeek';  Endpoint = 'https://api.deepseek.com/chat/completions';   KeyUrl = 'https://platform.deepseek.com/api_keys' }
	@{ Key = 'groq';      Label = 'Groq';      Endpoint = 'https://api.groq.com/openai/v1/chat/completions'; KeyUrl = 'https://console.groq.com/keys' }
	@{ Key = 'zai';       Label = 'Z.ai';      Endpoint = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'; KeyUrl = 'https://open.bigmodel.cn/usercenter/apikeys' }
	@{ Key = 'mimo';      Label = 'Mimo';       Endpoint = 'https://api.xiaomimimo.com/v1/chat/completions'; KeyUrl = '' }
	@{ Key = 'custom';    Label = '';           Endpoint = ''; KeyUrl = '' }
)
$Script:ModCategoryMap = @{
	# ── Style ──
	"BtnHoverAnime"       = "Style"
	"DownloadPanel"       = "Style"
	"Extensions"          = "Style"
	"FavouriteTabs"       = "Style"
	"Quietify"            = "Style"
	"RemoveClutter"       = "Style"
	"TabsTrail"           = "Style"
	"VivalArc"            = "Style"
	"VividQC"             = "Style"
	"MonochromeIcons"     = "Style"
	"PinnedTabRestore"    = "Style"
	"QuickCapture"        = "Style"
	"VividPlayer"         = "Style"
	"VividToast"          = "Style"
	# ── Function ──
	"AdaptiveBF"          = "Function"
	"BetterAnimation"     = "Function"
	"InteractionFeedback" = "Function"
	"LineBreak"           = "Function"
	"PeekTabbar"          = "Function"
	"VividPeek"           = "Function"
	"AutoHidePanel"       = "Function"
	"EasyFiles"           = "Function"
	"TabManager"          = "Function"
	"WorkspaceThemeSwitcher" = "Function"
	# ── AI ──
	"ModConfig"           = "AI"
	"AskOnPage"           = "AI"
	"Diabar"              = "AI"
	"TidyTabs"            = "AI"
	"TidyAddress"         = "AI"
	"TidyDownloads"       = "AI"
	"TidyTitles"          = "AI"
	"VividAI"             = "AI"
	"VividMarkdown"       = "AI"
}

# ── Mod file manifest (keep in sync with Vivaldi8.0Stable/) ────────────
# When adding/removing mods, update these arrays to match.
$Script:ModCssFiles = @(
	"AdaptiveBF.css",
	"BetterAnimation.css",
	"BtnHoverAnime.css",
	"DownloadPanel.css",
	"Extensions.css",
	"FavouriteTabs.css",
	"AskOnPage.css",
	"InteractionFeedback.css",
	"LineBreak.css",
	"PeekTabbar.css",
	"PinnedTabRestore.css",
	"Quietify.css",
	"RemoveClutter.css",
	"TabsTrail.css",
	"TidyTabs.css",
	"VivalArc.css",
	"VividPeek.css",
	"VividPlayer.css",
	"VividQC.css",
	"VividToast.css"
)
$Script:ModJsFiles = @(
	"Diabar.js",
	"AskOnPage.js",
	"AutoHidePanel.js",
	"EasyFiles.js",
	"InteractionFeedback.js",
	"ModConfig.js",
	"MonochromeIcons.js",
	"PinnedTabRestore.js",
	"QuickCapture.js",
	"TabManager.js",
	"TidyAddress.js",
	"TidyDownloads.js",
	"TidyTabs.js",
	"TidyTitles.js",
	"VividPeek.js",
	"VividToast.js",
	"WorkspaceThemeSwitcher.js",
	"VividAI.js",
	"VividMarkdown.js"
)

# ============================================================
#  2.  ASCII Banner
# ============================================================

function Show-Banner {
	Clear-Host
	$e = [char]27
	$w = [Console]::WindowWidth
	$art1 = "┌┐  ┐ ┌┬──┐ ┌┐    ┌┬──┐ ┌┬─┐ ┐ ┌─┬┬─┐ ┌┬──┐"
	$art2 = "└┤  │ ├┤  │ ├┤    ├┼──┤ ├┤ │ │   ├┤   ├┼─  "
	$art3 = " └──┘ └┴──┘ └┴──┘ └┘  ┘ └┘ └─┘   └┘   └┴──┘"
	$artW = $art1.Length
	$pad = [Math]::Max(0, [int](($w - $artW) / 2))
	$sp = " " * $pad

	Write-Host ""
	Write-Host "$sp$art1" -ForegroundColor DarkGreen
	Write-Host "$sp$art2" -ForegroundColor Green
	Write-Host "$sp$art3" -ForegroundColor DarkGreen
	Write-Host ""
	$Script:BannerHeight = [Console]::CursorTop
}


# ============================================================
#  3.  Rendering Engine (ANSI atomic writes — no flicker)
# ============================================================

function Write-FrameContent($frameText) {
	$e = [char]27
	$w = [Console]::WindowWidth
	$s = $Script:BannerHeight + 1

	$lines = $frameText -split "`r`n|`n"
	$buf = [Text.StringBuilder]::new()

	for ($i = 0; $i -lt $lines.Count; $i++) {
		[void]$buf.Append("$e[$($s + $i);0H$e[K")
		$raw = $lines[$i]
		if ($raw.Length -ge $w) {
			[void]$buf.Append($raw.Substring(0, $w - 1))
		} else {
			[void]$buf.Append($raw)
		}
	}
	if ($Script:LastRenderLines -gt $lines.Count) {
		for ($i = $lines.Count; $i -lt $Script:LastRenderLines; $i++) {
			[void]$buf.Append("$e[$($s + $i);0H$e[K")
		}
	}

	[Console]::Write($buf.ToString())
	$Script:LastRenderLines = $lines.Count
}

function Clear-ContentArea {
	if ($Script:LastRenderLines -le 0) { return }
	$e = [char]27
	$s = $Script:BannerHeight + 1
	$buf = [Text.StringBuilder]::new()
	for ($i = 0; $i -lt $Script:LastRenderLines; $i++) {
		[void]$buf.Append("$e[$($s + $i);0H$e[K")
	}
	[void]$buf.Append("$e[${s};0H")
	[Console]::Write($buf.ToString())
	$Script:LastRenderLines = 0
}

function Exit-Installer {
	Clear-ContentArea
	$e = [char]27
	[Console]::Write("$e[2J$e[H")
	[Console]::CursorVisible = $true
	throw "###USER_EXIT###"
}

function Flush-InputBuffer {
	while ([Console]::KeyAvailable) {
		[Console]::ReadKey($true) | Out-Null
	}
}

# ── Step indicator ──────────────────────────────────────────────────

$Script:StepIndex  = 0
$Script:StepTotal  = 0
$Script:StepLabels = @()
# Track which pages have been confirmed (for green display)
$Script:PagesConfirmed = @()

function Set-StepInfo($index, $total, $labels) {
	$Script:StepIndex  = $index
	$Script:StepTotal  = $total
	$Script:StepLabels = $labels
	if ($Script:PagesConfirmed.Count -ne $total) {
		$Script:PagesConfirmed = @($false) * $total
	}
}

function Format-StepBar {
	$e = [char]27
	$sb = [Text.StringBuilder]::new()
	[void]$sb.Append("  ")
	[void]$sb.Append("Step $($Script:StepIndex + 1)/$($Script:StepTotal): ")
	for ($i = 0; $i -lt $Script:StepTotal; $i++) {
		if ($i -gt 0) { [void]$sb.Append("  $e[90m>$e[0m  ") }
		if ($i -eq $Script:StepIndex) {
			# Current step: yellow highlight + bold
			[void]$sb.Append("$e[1;33m[$(tr $Script:StepLabels[$i])]$e[0m")
		} elseif ($Script:PagesConfirmed[$i]) {
			# Confirmed step: green check
			[void]$sb.Append("$e[32m✓$(tr $Script:StepLabels[$i])$e[0m")
		} else {
			# Future/unconfirmed step: dim
			[void]$sb.Append("$e[37m$(tr $Script:StepLabels[$i])$e[0m")
		}
	}
	return $sb.ToString()
}

function Read-TuiKey {
	# Flush input buffer to prevent rapid key input from causing UI issues
	Flush-InputBuffer
	$key = $host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
	switch ($key.VirtualKeyCode) {
		37 { return 'LEFT' }
		38 { return 'UP' }
		39 { return 'RIGHT' }
		40 { return 'DOWN' }
		32 { return 'SPACE' }
		13 { return 'ENTER' }
		27 { return 'ESC' }
		65 { return 'A' }
		68 { return 'D' }
		81 { return 'Q' }
		76 { return 'LANG' }
		default { return 'OTHER' }
	}
}

function Toggle-Lang {
	if ($Script:Lang -eq 'zh') { $Script:Lang = 'en' } else { $Script:Lang = 'zh' }
}

function Test-Writable {
	param([string]$Path)
	try {
		$testFile = Join-Path $Path ".volante-write-test"
		"test" | Out-File -FilePath $testFile -ErrorAction Stop
		Remove-Item $testFile -Force -ErrorAction SilentlyContinue
		return $true
	} catch {
		return $false
	}
}

function Test-IsAdmin {
	$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
	$principal = New-Object Security.Principal.WindowsPrincipal($identity)
	return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# ============================================================
#  4.  Source Acquisition
# ============================================================

function Find-ModSource {
	if ($Script:RepoRoot) {
		$candidate = Join-Path $Script:RepoRoot "Vivaldi8.0Stable"
		if (Test-Path $candidate) {
			$Script:SourceDir = $candidate
			return $candidate
		}
	}

	Write-Host (tr source_downloading)
	$Script:TempDir = Join-Path $env:TEMP "volante-installer"
	$null = New-Item -ItemType Directory -Force -Path $Script:TempDir

	$repoRaw  = "https://raw.githubusercontent.com/PaRr0tBoY/Awesome-Vivaldi/main"
	$cssDir   = Join-Path $Script:TempDir "CSS"
	$jsDir    = Join-Path $Script:TempDir "Javascripts"
	$null = New-Item -ItemType Directory -Force -Path $cssDir
	$null = New-Item -ItemType Directory -Force -Path $jsDir

	# Check cache — skip download if all files present AND fresh (1h TTL)
	$cached = $true
	foreach ($f in $Script:ModCssFiles) {
		if (-not (Test-Path (Join-Path $cssDir $f))) { $cached = $false; break }
	}
	if ($cached) {
		foreach ($f in $Script:ModJsFiles) {
			if (-not (Test-Path (Join-Path $jsDir $f))) { $cached = $false; break }
		}
	}
	if ($cached -and -not (Test-Path (Join-Path $Script:TempDir "injectMods.js"))) {
		$cached = $false
	}
	if ($cached -and -not (Test-Path (Join-Path $Script:TempDir "Import.css"))) {
		$cached = $false
	}
	# Invalidate cache if older than 1 hour (ensures update checks see fresh data)
	$cacheMaxAge = (Get-Date).AddHours(-1)
	if ($cached) {
		$marker = Get-Item (Join-Path $Script:TempDir "injectMods.js")
		if ($marker.LastWriteTime -lt $cacheMaxAge) { $cached = $false }
	}

	if ($cached) {
		Write-Host "Using cached mod files (from previous download)..."
		$Script:SourceDir = $Script:TempDir
		return $Script:SourceDir
	}

	# Download with progress display
	$totalFiles = $Script:ModCssFiles.Count + $Script:ModJsFiles.Count + 2  # +2 for injectMods.js and Import.css
	$currentFile = 0
	
	$sb = [Text.StringBuilder]::new()
	[void]$sb.AppendLine("  $e[1m$(tr source_downloading)$e[0m")
	[void]$sb.AppendLine()
	Write-FrameContent $sb.ToString()
	
	try {
		foreach ($f in $Script:ModCssFiles) {
			$currentFile++
			Invoke-WebRequest -Uri "$repoRaw/Vivaldi8.0Stable/CSS/$f" -OutFile (Join-Path $cssDir $f) -ErrorAction Stop
		}
		foreach ($f in $Script:ModJsFiles) {
			$currentFile++
			Invoke-WebRequest -Uri "$repoRaw/Vivaldi8.0Stable/Javascripts/$f" -OutFile (Join-Path $jsDir $f) -ErrorAction Stop
		}
		$currentFile++
		Invoke-WebRequest -Uri "$repoRaw/injectMods.js" -OutFile (Join-Path $Script:TempDir "injectMods.js") -ErrorAction Stop
		# Import.css lives at repo root, not in CSS/ subdir
		$currentFile++
		Invoke-WebRequest -Uri "$repoRaw/Vivaldi8.0Stable/Import.css" -OutFile (Join-Path $Script:TempDir "Import.css") -ErrorAction Stop
	} catch {
		Write-Host (tr error_download)
		Write-Host $_.Exception.Message
		return $null
	}
	return $Script:SourceDir
}

# Lazy-load mod source — downloads only on first call, caches for subsequent use
function Ensure-ModSource {
	if ($Script:CachedModSource) { return $Script:CachedModSource }
	$sourceDir = Find-ModSource
	if (-not $sourceDir) { return $null }
	$mods = Scan-Mods -SourceDir $sourceDir
	$Script:CachedModSource = @{ SourceDir = $sourceDir; Mods = $mods }
	return $Script:CachedModSource
}

# ============================================================
#  5.  Vivaldi Installation Discovery
# ============================================================

function Find-VivaldiInstallations {
	$found = @()

	$regPaths = @(
		"HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\vivaldi.exe",
		"HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\vivaldi.exe",
		"HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\vivaldi.snapshot.exe",
		"HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\vivaldi.snapshot.exe"
	)

	$seenPaths = @{}
	foreach ($regPath in $regPaths) {
		if (Test-Path $regPath) {
			try {
				$exePath = (Get-ItemProperty -Path $regPath -Name '(default)' -ErrorAction Stop).'(default)'
				$appDir = Split-Path -Parent $exePath
				if ($appDir -match '\\Application$') {
					$parent = Split-Path -Parent $appDir
					$appDir = $parent
				}
				if (-not $seenPaths.ContainsKey($appDir)) {
					$seenPaths[$appDir] = $true
					$install = Resolve-VivaldiVersion -AppDir $appDir
					if ($install) { $found += $install }
				}
			} catch {}
		}
	}

	$knownDirs = @(
		"$env:ProgramFiles\Vivaldi\Application",
		"${env:ProgramFiles(x86)}\Vivaldi\Application",
		"$env:LOCALAPPDATA\Vivaldi\Application",
		"$env:LOCALAPPDATA\Vivaldi Snapshot\Application",
		"$env:LOCALAPPDATA\Vivaldi.Standalone\Application"
	)

	foreach ($dir in $knownDirs) {
		if (Test-Path $dir) {
			$parent = Split-Path -Parent $dir
			if (-not $seenPaths.ContainsKey($parent)) {
				$seenPaths[$parent] = $true
				$install = Resolve-VivaldiVersion -AppDir $parent
				if ($install) { $found += $install }
			}
		}
	}

	if ($found.Count -eq 0) {
		$whereResult = where.exe vivaldi.exe 2>$null
		if ($whereResult) {
			$exePath = ($whereResult -split "`n")[0].Trim()
			$appDir = Split-Path -Parent $exePath
			if ($appDir -notmatch '\\Application$') {
				$parent = Split-Path -Parent $appDir
				if ($parent -match '\\Application$') { $appDir = $parent }
			}
			if (-not $seenPaths.ContainsKey($appDir)) {
				$seenPaths[$appDir] = $true
				$install = Resolve-VivaldiVersion -AppDir $appDir
				if ($install) { $found += $install }
			}
		}
	}

	return $found
}

function Resolve-VivaldiVersion {
	param([string]$AppDir)

	$appSubDir = Join-Path $AppDir "Application"
	if (Test-Path $appSubDir) {
		$scanDir = $appSubDir
	} else {
		$scanDir = $AppDir
	}

	$versionDirs = Get-ChildItem -Directory -Path $scanDir -ErrorAction SilentlyContinue |
		Where-Object { $_.Name -match '^\d+\.\d+\.\d+\.\d+$' } |
		Sort-Object { [version]$_.Name } -Descending

	if ($versionDirs.Count -eq 0) { return $null }

	$latestVersion = $versionDirs | Select-Object -First 1
	$vivaldiDir = Join-Path $latestVersion.FullName "resources\vivaldi"
	$windowHtml = Join-Path $vivaldiDir "window.html"

	if (-not (Test-Path $windowHtml)) { return $null }

	$appName = Split-Path -Leaf $AppDir
	if ($appName -match 'Snapshot') {
		$displayName = "Vivaldi Snapshot"
	} elseif ($appName -match 'Standalone') {
		$displayName = "Vivaldi Standalone"
	} else {
		$displayName = "Vivaldi"
	}

	$isSystem = $AppDir -like "$env:ProgramFiles*" -or $AppDir -like "${env:ProgramFiles(x86)}*"

	return @{
		DisplayName   = $displayName
		Version       = $latestVersion.Name
		AppDir        = $AppDir
		VivaldiDir    = $vivaldiDir
		WindowHtml    = $windowHtml
		ExePath       = Join-Path $latestVersion.FullName "vivaldi.exe"
		IsSystem      = $isSystem
		PersistentDir = Join-Path $AppDir ".vivaldimods"
	}
}

# ============================================================
#  6.  Mod Scanning
# ============================================================

function Scan-Mods {
	param([string]$SourceDir, [switch]$DevOnly)

	$cssDir = Join-Path $SourceDir "CSS"
	$jsDir  = Join-Path $SourceDir "Javascripts"

	$cssFiles = if (Test-Path $cssDir) { Get-ChildItem -File -Path $cssDir -Filter "*.css" | ForEach-Object { $_.Name } } else { @() }
	$jsFiles  = if (Test-Path $jsDir)  { Get-ChildItem -File -Path $jsDir  -Filter "*.js"  | ForEach-Object { $_.Name } } else { @() }

	# Build lookup tables by base name
	$cssByBase = @{}
	foreach ($f in $cssFiles) {
		$base = [IO.Path]::GetFileNameWithoutExtension($f)
		$cssByBase[$base] = $f
	}

	$jsByBase = @{}
	foreach ($f in $jsFiles) {
		$base = [IO.Path]::GetFileNameWithoutExtension($f)
		$jsByBase[$base] = $f
	}

	# Discover all unique base names from both CSS and JS files
	$allBases = @{}
	foreach ($b in $cssByBase.Keys) { $allBases[$b] = $true }
	foreach ($b in $jsByBase.Keys)  { $allBases[$b] = $true }

	# Build set of known base names for -DevOnly filtering
	$knownBases = @{}
	foreach ($b in $Script:ModCategoryMap.Keys) { $knownBases[$b] = $true }
	foreach ($b in $Script:SilentInstall)       { $knownBases[$b] = $true }

	# Helper: detect VividAI dependency in a JS file
	$aiBases = @("ModConfig", "VividAI", "VividMarkdown")
	$jsDirPath = $jsDir
	$hasVividAIDep = {
		param([string]$baseName)
		$jsPath = Join-Path $jsDirPath "$baseName.js"
		if (-not (Test-Path $jsPath)) { return $false }
		try {
			$head = Get-Content -Path $jsPath -TotalCount 200 -ErrorAction SilentlyContinue
			$content = $head -join "`n"
			return ($content -match 'VividAI\b')
		} catch { return $false }
	}

	# Group mods by category (skip silent install mods)
	$categories = @{
		"Style"    = @()
		"Function" = @()
		"AI"       = @()
	}

	foreach ($base in ($allBases.Keys | Sort-Object)) {
		# Skip Import.css (deployed separately, not a selectable mod)
		if ($base -eq "Import") { continue }
		# Skip silent install mods (core dependencies, always deployed)
		if ($Script:SilentInstall -contains $base) { continue }

		$isNew = -not $knownBases.ContainsKey($base)
		$hasJs = $jsByBase.ContainsKey($base)
		$hasCss = $cssByBase.ContainsKey($base)

		# -DevOnly: return only new mods not in the hardcoded list
		if ($DevOnly -and -not $isNew) { continue }

		# Category: use hardcoded map first, then auto-classify new mods
		if ($Script:ModCategoryMap.ContainsKey($base)) {
			$cat = $Script:ModCategoryMap[$base]
		} elseif ($isNew) {
			if ($hasJs -and ($hasVividAIDep.Invoke($base))) {
				$cat = "AI"
			} elseif ($hasJs) {
				$cat = "Function"
			} else {
				$cat = "Style"
			}
		} else {
			$cat = "Style"
		}

		$descKey = "mod_desc_$base"
		$hasDesc = $Script:Loc['en'].Contains($descKey) -or $Script:Loc['zh'].Contains($descKey)

		$mod = @{
			BaseName    = $base
			CssFile     = if ($hasCss) { $cssByBase[$base] } else { $null }
			JsFile      = if ($hasJs) { $jsByBase[$base] } else { $null }
			Description = if ($hasDesc) { $descKey } else { "" }
			Category    = $cat
		}
		$categories[$cat] += $mod
	}

	return @{
		Style      = $categories["Style"]
		Function   = $categories["Function"]
		AI         = $categories["AI"]
		# Keep flat file lists for deployment
		AllCssFiles = $cssFiles
		AllJsFiles  = $jsFiles
	}
}

function Get-InstallState {
	param([string]$VivaldiDir)

	$userModsDir = Join-Path $VivaldiDir "user_mods"
	# Try new name first, fall back to old name for backward compatibility
	$stateFile = Join-Path $userModsDir ".volante.json"
	if (-not (Test-Path $stateFile)) {
		$legacyFile = Join-Path $userModsDir ".awesome-vivaldi.json"
		if (Test-Path $legacyFile) { $stateFile = $legacyFile }
		else { return $null }
	}
	try {
		$json = Get-Content -Raw -Path $stateFile | ConvertFrom-Json
		return @{
			Version   = $json.version
			CssMods   = @($json.css_mods)
			JsMods    = @($json.js_mods)
			GitCommit = if ($json.PSObject.Properties.Name -contains 'git_commit') { $json.git_commit } else { "" }
			StateFile = $stateFile
		}
	} catch {
		return $null
	}
}

function Test-IsInstalled {
	param([string]$VivaldiDir)
	$userModsDir = Join-Path $VivaldiDir "user_mods"
	return (Test-Path $userModsDir)
}

# ============================================================
#  8.  TUI Selection Functions
# ============================================================

# Helper: build the keybind hint line from parts
function Build-KeyHint($hintParts) {
	$e = [char]27
	$parts = @()
	foreach ($p in $hintParts) {
		$parts += "$e[37m$p$e[0m"
	}
	return ($parts -join "  |  ")
}

# Helper: check if a mod name is in the default-off list
function Test-IsDefaultOff($fileName) {
	return $Script:DefaultOff.ContainsKey($fileName)
}

function Show-SelectSingle {
	param(
		[string]$TitleKey,
		[array]$Items,
		[bool]$AllowLeft = $true
	)

	if ($Items.Count -eq 0) {
		Write-Host (tr target_none_found)
		return
	}

	if ($Items.Count -eq 1) { return 0 }

	if ($Script:Auto) { return 0 }

	$e = [char]27
	$cursor = 0
	$done = $false

	while (-not $done) {
		$sb = [Text.StringBuilder]::new()
		[void]$sb.AppendLine()
		[void]$sb.AppendLine((Format-StepBar))
		[void]$sb.AppendLine()
		[void]$sb.AppendLine("  $(tr $TitleKey)")
		[void]$sb.AppendLine()

		for ($i = 0; $i -lt $Items.Count; $i++) {
			$prefix = if ($i -eq $cursor) { "  >" } else { "   " }
			$marker = if ($i -eq $cursor) { "O" } else { " " }
			[void]$sb.AppendLine("$prefix [$marker] $($Items[$i].Label)")

			if ($Items[$i].DetailData) {
				$d = $Items[$i].DetailData
				$typeLabel = if ($d.IsSystem) { tr target_type_system } else { tr target_type_user }
				[void]$sb.AppendLine("  $(tr target_path): $($d.VivaldiDir)  |  $(tr target_type): $typeLabel")
			} elseif ($Items[$i].Detail) {
				[void]$sb.AppendLine("          $($Items[$i].Detail)")
			}
		}

		[void]$sb.AppendLine()
		[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")
	$hintParts = @((tr key_nav_confirm), (tr key_left_back), (tr key_exit))
		[void]$sb.AppendLine("    $(Build-KeyHint $hintParts)")

		Write-FrameContent $sb.ToString()

		$key = Read-TuiKey
		switch ($key) {
			'UP'    { $cursor = [Math]::Max(0, $cursor - 1) }
			'DOWN'  { $cursor = [Math]::Min($Items.Count - 1, $cursor + 1) }
			'ENTER' { $done = $true }
			'LEFT'  { return $null }
			'RIGHT' { }
			'Q'     { Exit-Installer }
			'LANG' { Toggle-Lang }
			'ESC'   { Exit-Installer }
		}
	}

	return $cursor
}

function Show-SelectCategory {
	param(
		[string]$CategoryKey,
		[string]$IntroKey,
		[array]$Mods,
		[string[]]$PreselectedBases = @(),
		[bool]$DefaultAll = $true,
		[bool]$AllowLeft = $true,
		[string[]]$ConfirmedBases = @()
	)

	if ($Mods.Count -eq 0) { return @() }

	# Sort: default-off mods go to bottom (explicit loop — Sort-Object hashtable unreliable with PS 5.1 hashtables)
	$onMods = [System.Collections.ArrayList]::new()
	$offMods = [System.Collections.ArrayList]::new()
	foreach ($m in $Mods) {
		if (Test-IsDefaultOff "$($m.BaseName).js" -or Test-IsDefaultOff "$($m.BaseName).css") { [void]$offMods.Add($m) }
		else { [void]$onMods.Add($m) }
	}
	$Mods = @($onMods + $offMods)

	if ($Script:Auto) {
		$result = @()
		foreach ($m in $Mods) {
			if (-not (Test-IsDefaultOff "$($m.BaseName).js") -and -not (Test-IsDefaultOff "$($m.BaseName).css")) {
				$result += $m.BaseName
			}
		}
		return $result
	}

	$n = $Mods.Count
	$selected = @($false) * $n
	$confirmed = @($false) * $n
	$cursor = 0

	# Determine initial selection state
	if ($PreselectedBases.Count -gt 0) {
		for ($i = 0; $i -lt $n; $i++) {
			if ($PreselectedBases -contains $Mods[$i].BaseName) {
				$selected[$i] = $true
			}
		}
	} elseif ($DefaultAll) {
		for ($i = 0; $i -lt $n; $i++) {
			$m = $Mods[$i]
			if (-not (Test-IsDefaultOff "$($m.BaseName).js") -and -not (Test-IsDefaultOff "$($m.BaseName).css")) {
				$selected[$i] = $true
			}
		}
	}

	# Determine which items were already confirmed
	if ($ConfirmedBases.Count -gt 0) {
		for ($i = 0; $i -lt $n; $i++) {
			if ($ConfirmedBases -contains $Mods[$i].BaseName) {
				$confirmed[$i] = $true
			}
		}
	}

	$maxLabelWidth = 0
	foreach ($m in $Mods) {
		$len = $m.BaseName.Length
		if ($m.CssFile -and $m.JsFile) { $len += 8 }  # " +CSS+JS"
		elseif ($m.CssFile) { $len += 4 }              # " +CSS"
		elseif ($m.JsFile) { $len += 4 }                # " +JS"
		if ($len -gt $maxLabelWidth) { $maxLabelWidth = $len }
	}

	$e = [char]27
	$done = $false
	while (-not $done) {
		$allSelected = $true
		for ($i = 0; $i -lt $n; $i++) {
			if (-not $selected[$i]) { $allSelected = $false; break }
		}

		$sb = [Text.StringBuilder]::new()
		[void]$sb.AppendLine()
		[void]$sb.AppendLine((Format-StepBar))
		[void]$sb.AppendLine()
		[void]$sb.AppendLine("  $e[1m$(tr $CategoryKey)$e[0m")
		[void]$sb.AppendLine("  $e[37m$(tr $IntroKey)$e[0m")
		[void]$sb.AppendLine()

		# Toggle-all row
		$toggleMarker = if ($allSelected) { "[x]" } else { "[ ]" }
		$togglePrefix = if ($cursor -eq -1) { "  >" } else { "   " }
		[void]$sb.AppendLine("$togglePrefix $e[37m$toggleMarker$e[0m $e[37m$(tr toggle_all)$e[0m")
		[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")

		for ($i = 0; $i -lt $n; $i++) {
			$m = $Mods[$i]
			$check = if ($selected[$i]) { "[x]" } else { "[ ]" }
			$prefix = if ($i -eq $cursor) { "  $e[1;36m>$e[0m" } else { "   " }

			# Build label with file type tags
			$typeTag = ""
			if ($m.CssFile -and $m.JsFile) { $typeTag = " $e[37m[CSS+JS]$e[0m" }
			elseif ($m.CssFile) { $typeTag = " $e[37m[CSS]$e[0m" }
			elseif ($m.JsFile) { $typeTag = " $e[37m[JS]$e[0m" }

			$labelPadded = $m.BaseName.PadRight($maxLabelWidth + 2)
			$descPart = if ($m.Description) { " ─ $(tr $m.Description)" } else { "" }
			# Confirmed+selected items render green
			if ($isConfirmed -and $isSelected) {
				[void]$sb.AppendLine("$prefix $e[32m$check$e[0m $e[32m$labelPadded$e[0m$typeTag$descPart")
			} else {
				[void]$sb.AppendLine("$prefix $check $labelPadded$typeTag$descPart")
			}
		}

		# Show reason when cursor is on a default-off mod
		if ($cursor -ge 0 -and $cursor -lt $n) {
			$cm = $Mods[$cursor]
			$reasonKey = "default_off_reason_$($cm.BaseName)"
			$reason = tr $reasonKey
			if ($reason -ne $reasonKey) {
				[void]$sb.AppendLine()
				[void]$sb.AppendLine("  $e[33m⚠ $reason$e[0m")
			}
		}

		[void]$sb.AppendLine()
		$hintParts = @((tr key_multiselect))
		if ($AllowLeft)  { $hintParts += (tr key_left_back) }
		$hintParts += (tr key_exit)
		[void]$sb.AppendLine("    $(Build-KeyHint $hintParts)")

		Write-FrameContent $sb.ToString()

		$key = Read-TuiKey
		switch ($key) {
			'UP' {
				if ($cursor -eq -1) { $cursor = $n - 1 }
				else { $cursor = [Math]::Max(0, $cursor - 1) }
			}
			'DOWN' {
				if ($cursor -eq -1) { $cursor = 0 }
				else { $cursor = [Math]::Min($n - 1, $cursor + 1) }
			}
			'SPACE' {
				if ($cursor -eq -1) {
					$newState = -not $allSelected
					for ($i = 0; $i -lt $n; $i++) { $selected[$i] = $newState }
				} else {
					$selected[$cursor] = -not $selected[$cursor]
				}
			}
			'A' { for ($i = 0; $i -lt $n; $i++) { $selected[$i] = $true } }
			'D' { for ($i = 0; $i -lt $n; $i++) { $selected[$i] = $false } }
			'ENTER' { $done = $true }
			'LEFT'  { if ($AllowLeft)  { return $null } }
			'LANG' { Toggle-Lang }
			'ESC'   { Exit-Installer }
		}
	}

	$result = @()
	for ($i = 0; $i -lt $n; $i++) {
		if ($selected[$i]) { $result += $Mods[$i].BaseName }
	}
	return $result
}

# ============================================================
#  9.  Deploy Functions
# ============================================================

function Backup-WindowHtml {
	param([string]$VivaldiDir, [string]$PersistentDir = $null)
	$htmlPath = Join-Path $VivaldiDir "window.html"
	$bakPath  = "$htmlPath.bak"

	Write-Host (tr deploy_backup_start)
	if (-not (Test-Path $bakPath)) {
		Copy-Item -Path $htmlPath -Destination $bakPath -Force
	}
	Write-Host "$(tr deploy_backup_done) $bakPath"
	if ($PersistentDir) {
		$null = New-Item -ItemType Directory -Force -Path $PersistentDir -ErrorAction SilentlyContinue
		Copy-Item -Path $htmlPath -Destination (Join-Path $PersistentDir "window.html.orig") -Force -ErrorAction SilentlyContinue
	}
}

function Invoke-HtmlInjection {
	param([string]$VivaldiDir)
	$htmlPath = Join-Path $VivaldiDir "window.html"

	Write-Host (tr deploy_inject_start)

	$content = Get-Content -Raw -Path $htmlPath

	# Strip any old manual <script> tags that reference known mod JS files
	# (leftover from pre-installer manual installs).  Preserve injectMods.js.
	$scriptPattern = '\s*<script\s+src="(?!injectMods\.js)([^"]+\.js)"[^>]*>\s*</script>\s*'
	$stripped = $content -replace $scriptPattern, "`r`n"
	# Also catch self-closing variants
	$stripped = $stripped -replace '\s*<script\s+src="(?!injectMods\.js)([^"]+\.js)"[^>]*/>\s*', "`r`n"
	if ($stripped -ne $content) {
		$content = $stripped
		Write-Host "  Old manual script tags removed."
	}

	# Re-check after cleanup (in case cleanup removed the injector tag)
	$hasInjector = $content -match 'injectMods\.js'

	if (-not $hasInjector) {
		$content = $content -replace '(<body[^>]*>)', "`$1`r`n  <script src=`"injectMods.js`"></script>"
		Write-Host (tr deploy_inject_done)
	} else {
		Write-Host (tr deploy_inject_skip)
	}

	try {
		Set-Content -Path $htmlPath -Value $content -NoNewline -ErrorAction Stop
	} catch {
		Write-Host (tr error_permission)
		Write-Host "  $_"
	}
}

function Test-WindowHtmlFormat {
	param([string]$VivaldiDir, [switch]$Silent)
	$htmlPath = Join-Path $VivaldiDir "window.html"
	if (-not (Test-Path $htmlPath)) { return }

	$fixed = $false
	$content = Get-Content -Raw -Path $htmlPath

	# Check: no stale manual script tags (except injectMods.js)
	if ($content -match '<script\s+src="(?!injectMods\.js)[^"]+"') {
		if (-not $Silent) { Write-Host "  ⚠ Stale script tags detected — cleaning..." }
		Invoke-HtmlInjection -VivaldiDir $VivaldiDir
		$fixed = $true
		$content = Get-Content -Raw -Path $htmlPath
	}

	# Check: injectMods.js present as first script in <body>
	if ($content -notmatch '<body[^>]*>[\s\r\n]*<script\s+src="injectMods\.js"') {
		if (-not $Silent) { Write-Host "  ⚠ injectMods.js not first in <body> — re-injecting" }
		Invoke-HtmlInjection -VivaldiDir $VivaldiDir
		$fixed = $true
	}

	return $fixed
}

function Write-ProviderSeed {
	param([string]$VivaldiDir)
	if ($null -eq $Script:ProviderConfig) { return }
	$seedDir = Join-Path $VivaldiDir "user_mods"
	if (-not (Test-Path $seedDir)) { return }
	$provDef = $Script:ProviderDefs | Where-Object { $_.Key -eq $Script:ProviderConfig.Provider } | Select-Object -First 1
	$provName = if ($provDef -and $provDef.Label) { $provDef.Label } else { $Script:ProviderConfig.Provider }
	$seed = @{
		schemaVersion = 4
		ai = @{
			providers = @(@{
				id            = "p_default"
				name          = $provName
				provider      = $Script:ProviderConfig.Provider
				apiEndpoint   = $Script:ProviderConfig.Endpoint
				apiKey        = $Script:ProviderConfig.ApiKey
				model         = ""
			})
			defaultProviderId  = "p_default"
			moduleProviderIds  = @{}
		}
	}
	$seed | ConvertTo-Json -Depth 10 | Set-Content -Path (Join-Path $seedDir "modconfig-seed.json")
}

function Deploy-ModFiles {
	param(
		[string]$SourceDir,
		[string]$VivaldiDir,
		[string]$PersistentDir = $null,
		[string[]]$CssMods,
		[string[]]$JsMods
	)

	Write-Host (tr deploy_start)

	$userModsDir = Join-Path $VivaldiDir "user_mods"
	$userCssDir  = Join-Path $userModsDir "css"
	$userJsDir   = Join-Path $userModsDir "js"

	try {
		$null = New-Item -ItemType Directory -Force -Path $userCssDir -ErrorAction Stop
		$null = New-Item -ItemType Directory -Force -Path $userJsDir -ErrorAction Stop
	} catch {
		Write-Host (tr error_permission)
		Write-Host "  $_"
		return
	}

	# ── Cleanup: remove any known mod files from a previous manual install ──
	#   Same-name files would be overwritten by Copy-Item -Force anyway, but
	#   this also cleans orphans (mods that were in the pack before but aren't
	#   selected now).  Unknown files (user's own custom mods) are left alone.
	$cleaned = 0
	foreach ($known in $Script:ModCssFiles) {
		$existing = Join-Path $userCssDir $known
		if (Test-Path $existing) {
			Remove-Item $existing -Force -ErrorAction SilentlyContinue
			$cleaned++
		}
	}
	foreach ($known in $Script:ModJsFiles) {
		if ($known -eq "ModConfig.js") { continue }  # always keep core
		$existing = Join-Path $userJsDir $known
		if (Test-Path $existing) {
			Remove-Item $existing -Force -ErrorAction SilentlyContinue
			$cleaned++
		}
	}
	if ($cleaned -gt 0) { Write-Host (trf deploy_cleaned $cleaned) }

	$sourceCssDir = Join-Path $SourceDir "CSS"
	$sourceJsDir  = Join-Path $SourceDir "Javascripts"

	# Deploy injector (from repo root — works for both local & remote)
	$injectorSource = Join-Path $SourceDir "injectMods.js"
	if (-not (Test-Path $injectorSource)) { $injectorSource = Join-Path (Split-Path -Parent $SourceDir) "injectMods.js" }
	if (Test-Path $injectorSource) {
		Copy-Item -Path $injectorSource -Destination (Join-Path $VivaldiDir "injectMods.js") -Force
	}

	# Deploy Import.css with path rewriting
	$importCssSource = Join-Path $sourceCssDir "Import.css"
	if (-not (Test-Path $importCssSource)) {
		$importCssSource = Join-Path $SourceDir "Import.css"
	}
	if (Test-Path $importCssSource) {
		$importCssDest = Join-Path $userCssDir "Import.css"
		Copy-Item -Path $importCssSource -Destination $importCssDest -Force
		$importContent = Get-Content -Raw -Path $importCssDest
		$importContent = $importContent -replace '@import\s+"CSS/', '@import "'
		Set-Content -Path $importCssDest -Value $importContent -NoNewline
	}

	$cssCount = 0
	foreach ($mod in $CssMods) {
		$src = Join-Path $sourceCssDir $mod
		if (Test-Path $src) {
			Copy-Item -Path $src -Destination (Join-Path $userCssDir $mod) -Force
			$cssCount++
		}
	}

	$jsCount = 0
	foreach ($mod in $JsMods) {
		$src = Join-Path $sourceJsDir $mod
		if (Test-Path $src) {
			Copy-Item -Path $src -Destination (Join-Path $userJsDir $mod) -Force
			$jsCount++
		}
	}

	Write-Host (trf deploy_css_done $cssCount)
	Write-Host (trf deploy_js_done $jsCount)

	# Get git commit hash for version tracking
	$repoRoot = Split-Path -Parent $SourceDir
	$gitCommit = ""
	try {
		$gitCommit = (git -C $repoRoot rev-parse --short HEAD 2>$null) -replace "`n|`r", ""
	} catch {}

	$state = @{
		version      = "8.0"
		installed_at = (Get-Date -Format "o")
		git_commit   = $gitCommit
		css_mods     = @($CssMods)
		js_mods      = @($JsMods)
	}
	$statePath = Join-Path $userModsDir ".volante.json"
	$state | ConvertTo-Json | Set-Content -Path $statePath

	# Persistent storage
	if ($PersistentDir) {
		try {
			$pv = $state.version
			$persistVerDir = Join-Path $PersistentDir $pv
			$persistCssDir = Join-Path $persistVerDir "css"
			$persistJsDir  = Join-Path $persistVerDir "js"
			$null = New-Item -ItemType Directory -Force -Path $persistCssDir -ErrorAction Stop
			$null = New-Item -ItemType Directory -Force -Path $persistJsDir -ErrorAction Stop
			foreach ($mod in $CssMods) {
				$src = Join-Path $sourceCssDir $mod
				if (Test-Path $src) { Copy-Item -Path $src -Destination (Join-Path $persistCssDir $mod) -Force -ErrorAction SilentlyContinue }
			}
			foreach ($mod in $JsMods) {
				$src = Join-Path $sourceJsDir $mod
				if (Test-Path $src) { Copy-Item -Path $src -Destination (Join-Path $persistJsDir $mod) -Force -ErrorAction SilentlyContinue }
			}
			Copy-Item -Path (Join-Path $userCssDir "Import.css") -Destination (Join-Path $persistCssDir "Import.css") -Force -ErrorAction SilentlyContinue
			$state | ConvertTo-Json | Set-Content -Path (Join-Path $persistVerDir ".volante.json") -ErrorAction SilentlyContinue
		} catch {
			Write-Host (tr error_persist_write)
		}
	}
}

# ============================================================
#  10a.  Dev Mods: Scan & Reinstall from Local Repo
# ============================================================

function Invoke-DevModsFlow {
	param(
		[string]$SourceDir,
		[hashtable]$Target
	)

	$e = [char]27
	$devMods = Scan-Mods -SourceDir $SourceDir -DevOnly
	$allDev = @($devMods.Style) + @($devMods.Function) + @($devMods.AI)
	$devModCount = $allDev.Count

	Clear-ContentArea
	if ($devModCount -eq 0) {
		Write-Host "`n  $(tr dev_install_none)`n"
		Write-Host "  $e[37m$(tr key_enter_confirm)$e[0m"
		Flush-InputBuffer
		[void]$host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
		return
	}

	# List what will be installed
	$sb = [Text.StringBuilder]::new()
	[void]$sb.AppendLine()
	[void]$sb.AppendLine("  $e[1m$(tr dev_install_title)$e[0m")
	[void]$sb.AppendLine()
	foreach ($mod in $allDev) {
		$tag = @()
		if ($mod.CssFile) { $tag += "CSS" }
		if ($mod.JsFile)  { $tag += "JS" }
		[void]$sb.AppendLine("    $e[1;32m>$e[0m $($mod.BaseName)  $e[90m[$($tag -join '+')]$e[0m")
	}
	[void]$sb.AppendLine()
	[void]$sb.AppendLine("  $e[37m$(trf dev_install_confirm $devModCount)$e[0m")
	[void]$sb.AppendLine()
	[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")
	[void]$sb.AppendLine("    $(tr key_enter_confirm) | $(tr key_exit)")
	Write-FrameContent $sb.ToString()

	$key = Read-TuiKey
	if ($key -ne 'ENTER') { return }

	# Deploy dev mods
	$userCssDir = Join-Path $Target.VivaldiDir "user_mods\css"
	$userJsDir  = Join-Path $Target.VivaldiDir "user_mods\js"
	if (-not (Test-Path $userCssDir)) { New-Item -ItemType Directory -Path $userCssDir -Force | Out-Null }
	if (-not (Test-Path $userJsDir))  { New-Item -ItemType Directory -Path $userJsDir  -Force | Out-Null }

	$deployedCss = 0; $deployedJs = 0
	foreach ($mod in $allDev) {
		if ($mod.CssFile) {
			Copy-Item -Path (Join-Path (Join-Path $SourceDir "CSS") $mod.CssFile) -Destination (Join-Path $userCssDir $mod.CssFile) -Force
			$deployedCss++
		}
		if ($mod.JsFile) {
			Copy-Item -Path (Join-Path (Join-Path $SourceDir "Javascripts") $mod.JsFile) -Destination (Join-Path $userJsDir $mod.JsFile) -Force
			$deployedJs++
		}
	}

	# Update state file to include dev mods
	$stateFile = Join-Path $Target.VivaldiDir "user_mods\.volante.json"
	if (Test-Path $stateFile) {
		try {
			$stateObj = Get-Content -Raw -Path $stateFile | ConvertFrom-Json
			$cssList = @($stateObj.css_mods) + @($allDev | Where-Object { $_.CssFile } | ForEach-Object { $_.CssFile }) | Select-Object -Unique
			$jsList  = @($stateObj.js_mods)  + @($allDev | Where-Object { $_.JsFile }  | ForEach-Object { $_.JsFile })  | Select-Object -Unique
			$stateObj.css_mods = $cssList
			$stateObj.js_mods  = $jsList
			$stateObj | ConvertTo-Json -Depth 10 | Set-Content -Path $stateFile -Encoding utf8
		} catch {}
	}

	# Restart Vivaldi
	Clear-ContentArea
	$sb2 = [Text.StringBuilder]::new()
	[void]$sb2.AppendLine()
	[void]$sb2.AppendLine("  $e[1;32m$(trf dev_install_done $devModCount)$e[0m")
	Write-FrameContent $sb2.ToString()

	$exe = $Target.ExePath
	if (-not $exe -or -not (Test-Path $exe)) { $exe = (Get-Command vivaldi -ErrorAction SilentlyContinue).Source }
	if (-not $exe) { $exe = "vivaldi" }
	Stop-Process -Name "vivaldi" -Force -ErrorAction SilentlyContinue
	Start-Sleep -Seconds 1
	Start-Process -FilePath $exe

	# Brief pause then return
	Start-Sleep -Seconds 2
}

# ============================================================
#  10.  Post-Install: Check Vivaldi + Restart/Launch
# ============================================================

function Invoke-PostInstall {
	param([hashtable]$Target, [bool]$Success = $true)

	if ($Script:Auto) { return }
	if (-not $Success) { return }

	[Console]::CursorVisible = $true

	# Resolve executable path
	$exe = $Target.ExePath
	if (-not $exe -or -not (Test-Path $exe)) {
		$exe = (Get-Command vivaldi -ErrorAction SilentlyContinue).Source
	}
	if (-not $exe) { $exe = "vivaldi" }

	# Flush any buffered keystrokes before prompting
	Start-Sleep -Milliseconds 100
	Flush-InputBuffer

	$vivaldiRunning = (Get-Process -Name "vivaldi" -ErrorAction SilentlyContinue).Count -gt 0

	if ($vivaldiRunning) {
		Write-Host "`n$(tr post_vivaldi_running)"
		Write-Host "$(tr post_restart_prompt) "
		$key = $host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
		if ($key.Character -eq 'y' -or $key.Character -eq 'Y' -or $key.VirtualKeyCode -eq 13) {
			Write-Host "Y"
			Write-Host "`n  $(tr post_restarting)"
			Stop-Process -Name "vivaldi" -Force -ErrorAction SilentlyContinue
			Start-Sleep -Seconds 1
			Start-Process -FilePath $exe
			Write-Host "  Vivaldi restarted."
		} else {
			Write-Host "N"
		}
	} else {
		Write-Host "`n$(tr post_launch_prompt) "
		$key = $host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
		if ($key.Character -eq 'y' -or $key.Character -eq 'Y' -or $key.VirtualKeyCode -eq 13) {
			Start-Process -FilePath $exe
			Write-Host "  Vivaldi launched."
		} else {
			Write-Host "N"
		}
	}

	# Clear all Write-Host output before returning to TUI
	$e = [char]27
	$bannerBottom = $Script:BannerHeight + 1
	$consoleH = [Console]::WindowHeight
	$clearBuf = [Text.StringBuilder]::new()
	for ($cl = $bannerBottom; $cl -lt $consoleH; $cl++) {
		[void]$clearBuf.Append("$e[$($cl);0H$e[K")
	}
	[void]$clearBuf.Append("$e[$($bannerBottom);0H")
	[Console]::Write($clearBuf.ToString())
	$Script:LastRenderLines = 0
	[Console]::CursorVisible = $false
}

# ============================================================
#  11.  Update / Manage / Uninstall
# ============================================================

function Get-CommitMessages {
	param([string[]]$FileNames, [string]$SourceDir, [string]$SubDir)

	$messages = @{}
	$repoRoot = if ($Script:RepoRoot) { $Script:RepoRoot } else { Split-Path -Parent $SourceDir }
	if (-not (Test-Path (Join-Path $repoRoot ".git"))) { return $messages }

	foreach ($f in $FileNames) {
		$gitPath = "Vivaldi8.0Stable/$SubDir/$f"
		try {
			$log = git -C $repoRoot log --oneline -3 -- $gitPath 2>$null
			if ($log) {
				$messages[$f] = ($log -split "`n") -join " | "
			} else {
				$messages[$f] = ""
			}
		} catch {
			$messages[$f] = ""
		}
	}
	return $messages
}

function Invoke-Update {
	param(
		[string]$SourceDir,
		[hashtable]$Target,
		[hashtable]$State
	)

	Clear-ContentArea

	# Check which installed mods differ from source
	$sourceCssDir = Join-Path $SourceDir "CSS"
	$sourceJsDir  = Join-Path $SourceDir "Javascripts"
	$userCssDir   = Join-Path $Target.VivaldiDir "user_mods\css"
	$userJsDir    = Join-Path $Target.VivaldiDir "user_mods\js"

	$updatableCSS = @()
	foreach ($mod in $State.CssMods) {
		$src = Join-Path $sourceCssDir $mod
		$dst = Join-Path $userCssDir $mod
		if ((Test-Path $src) -and (Test-Path $dst)) {
			$srcHash = (Get-FileHash $src -Algorithm MD5).Hash
			$dstHash = (Get-FileHash $dst -Algorithm MD5).Hash
			if ($srcHash -ne $dstHash) {
				$updatableCSS += $mod
			}
		}
	}

	$updatableJS = @()
	foreach ($mod in $State.JsMods) {
		$src = Join-Path $sourceJsDir $mod
		$dst = Join-Path $userJsDir $mod
		if ((Test-Path $src) -and (Test-Path $dst)) {
			$srcHash = (Get-FileHash $src -Algorithm MD5).Hash
			$dstHash = (Get-FileHash $dst -Algorithm MD5).Hash
			if ($srcHash -ne $dstHash) {
				$updatableJS += $mod
			}
		}
	}

	$allUpdatable = @($updatableCSS) + @($updatableJS) | Select-Object -Unique

	if ($allUpdatable.Count -eq 0) {
		Write-Host "`n$(tr update_no_updates)`n"
		Start-Sleep -Seconds 2
		return
	}

	# Get commit messages for updatable mods
	$cssCommits = Get-CommitMessages -FileNames $updatableCSS -SourceDir $SourceDir -SubDir "CSS"
	$jsCommits  = Get-CommitMessages -FileNames $updatableJS  -SourceDir $SourceDir -SubDir "Javascripts"

	# Build selection items
	$updateItems = [Collections.ArrayList]::new()
	$e = [char]27

	foreach ($mod in $updatableCSS) {
		$commit = if ($cssCommits[$mod]) { $cssCommits[$mod] } else { "" }
		[void]$updateItems.Add(@{
			Label       = $mod
			Description = $commit
			FileName    = $mod
			ModType     = "CSS"
		})
	}
	foreach ($mod in $updatableJS) {
		$commit = if ($jsCommits[$mod]) { $jsCommits[$mod] } else { "" }
		[void]$updateItems.Add(@{
			Label       = $mod
			Description = $commit
			FileName    = $mod
			ModType     = "JS"
		})
	}

	$n = $updateItems.Count
	$selected = @($true) * $n
	$cursor = 0

	$stepLabels = @('update_title', 'summary_title')
	Set-StepInfo 0 2 $stepLabels

	$done = $false
	while (-not $done) {
		$allSelected = $true
		for ($i = 0; $i -lt $n; $i++) { if (-not $selected[$i]) { $allSelected = $false; break } }

		$sb = [Text.StringBuilder]::new()
		[void]$sb.AppendLine()
		[void]$sb.AppendLine((Format-StepBar))
		[void]$sb.AppendLine()
		[void]$sb.AppendLine("  $e[1m$(tr update_available_title)$e[0m")
		[void]$sb.AppendLine("  $(tr update_select)")
		[void]$sb.AppendLine()

		$toggleMarker = if ($allSelected) { "[x]" } else { "[ ]" }
		$togglePrefix = if ($cursor -eq -1) { "  >" } else { "   " }
		[void]$sb.AppendLine("$togglePrefix $e[37m$toggleMarker$e[0m $e[37m$(tr toggle_all)$e[0m")
		[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")

		for ($i = 0; $i -lt $n; $i++) {
			$item = $updateItems[$i]
			$check = if ($selected[$i]) { "[x]" } else { "[ ]" }
			$prefix = if ($i -eq $cursor) { "  $e[1;36m>$e[0m" } else { "   " }
			$typeTag = " $e[37m[$($item.ModType)]$e[0m"
			$info = if ($item.Description) { "`n          $e[37m$($item.Description)$e[0m" } else { "" }
			[void]$sb.AppendLine("$prefix $check $($item.Label)$typeTag$info")
		}

		[void]$sb.AppendLine()
		[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")
		[void]$sb.AppendLine("    $(Build-KeyHint @((tr key_multiselect), (tr key_enter_confirm), (tr key_left_back), (tr key_exit)))")

		Write-FrameContent $sb.ToString()

		$key = Read-TuiKey
		switch ($key) {
			'UP' {
				if ($cursor -eq -1) { $cursor = $n - 1 }
				else { $cursor = [Math]::Max(0, $cursor - 1) }
			}
			'DOWN' {
				if ($cursor -eq -1) { $cursor = 0 }
				else { $cursor = [Math]::Min($n - 1, $cursor + 1) }
			}
			'SPACE' {
				if ($cursor -eq -1) {
					$newState = -not $allSelected
					for ($i = 0; $i -lt $n; $i++) { $selected[$i] = $newState }
				} else {
					$selected[$cursor] = -not $selected[$cursor]
				}
			}
			'A' { for ($i = 0; $i -lt $n; $i++) { $selected[$i] = $true } }
			'D' { for ($i = 0; $i -lt $n; $i++) { $selected[$i] = $false } }
			'ENTER' { $done = $true }
			'LEFT'  { return }
			'Q'     { Exit-Installer }
			'LANG' { Toggle-Lang }
			'ESC'   { Exit-Installer }
		}
	}

	# Confirm page
	$chosenCSS = @()
	$chosenJS  = @()
	$skipCSS = @()
	$skipJS  = @()
	for ($i = 0; $i -lt $n; $i++) {
		if ($selected[$i]) {
			if ($updateItems[$i].ModType -eq "CSS") { $chosenCSS += $updateItems[$i].FileName }
			else { $chosenJS += $updateItems[$i].FileName }
		} else {
			if ($updateItems[$i].ModType -eq "CSS") { $skipCSS += $updateItems[$i].FileName }
			else { $skipJS += $updateItems[$i].FileName }
		}
	}

	# Confirm
	Set-StepInfo 1 2 $stepLabels
	$confirmDone = $false
	while (-not $confirmDone) {
		$sb = [Text.StringBuilder]::new()
		[void]$sb.AppendLine()
		[void]$sb.AppendLine((Format-StepBar))
		[void]$sb.AppendLine()
		[void]$sb.AppendLine("  $e[1m$(tr update_confirm_title)$e[0m")
		[void]$sb.AppendLine()
		if ($chosenCSS.Count -gt 0) {
			[void]$sb.AppendLine("  $e[32m$(tr update_updated_mod) ($($chosenCSS.Count)):$e[0m")
			foreach ($m in $chosenCSS) { [void]$sb.AppendLine("    $e[32m+ $m$e[0m") }
		}
		if ($chosenJS.Count -gt 0) {
			[void]$sb.AppendLine("  $e[32m$(tr update_updated_mod) ($($chosenJS.Count)):$e[0m")
			foreach ($m in $chosenJS) { [void]$sb.AppendLine("    $e[32m+ $m$e[0m") }
		}
		if ($skipCSS.Count -gt 0) {
			[void]$sb.AppendLine("  $e[37m$(tr update_skipped) ($($skipCSS.Count)): $(($skipCSS) -join ', ')$e[0m")
		}
		if ($skipJS.Count -gt 0) {
			[void]$sb.AppendLine("  $e[37m$(tr update_skipped) ($($skipJS.Count)): $(($skipJS) -join ', ')$e[0m")
		}
		[void]$sb.AppendLine()
		[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")
		[void]$sb.AppendLine("    $(Build-KeyHint @((tr key_enter_update), (tr key_left_back), (tr key_exit)))")
		Write-FrameContent $sb.ToString()

		$key = Read-TuiKey
		switch ($key) {
			'ENTER' { $confirmDone = $true }
			'LEFT'  { return }
			'Q'     { Exit-Installer }
			'LANG' { Toggle-Lang }
			'ESC'   { Exit-Installer }
		}
	}

	# Apply updates
	Clear-ContentArea
	Write-Host "`n$(tr update_updating)`n"

	$updated = 0
	foreach ($mod in $chosenCSS) {
		$src = Join-Path $sourceCssDir $mod
		$dst = Join-Path $userCssDir $mod
		if (Test-Path $src) {
			Copy-Item -Path $src -Destination $dst -Force
			Write-Host "  $e[32m[$(tr update_updated_mod)]$e[0m $mod"
			$updated++
		}
	}
	foreach ($mod in $chosenJS) {
		$src = Join-Path $sourceJsDir $mod
		$dst = Join-Path $userJsDir $mod
		if (Test-Path $src) {
			Copy-Item -Path $src -Destination $dst -Force
			Write-Host "  $e[32m[$(tr update_updated_mod)]$e[0m $mod"
			$updated++
		}
	}

	# Update Import.css, injector, and state
	$importCssSource = Join-Path $sourceCssDir "Import.css"
	if (-not (Test-Path $importCssSource)) { $importCssSource = Join-Path $SourceDir "Import.css" }
	if (Test-Path $importCssSource) {
		$importCssDest = Join-Path $userCssDir "Import.css"
		Copy-Item -Path $importCssSource -Destination $importCssDest -Force
		$importContent = Get-Content -Raw -Path $importCssDest
		$importContent = $importContent -replace '@import\s+"CSS/', '@import "'
		Set-Content -Path $importCssDest -Value $importContent -NoNewline
	}

	$injectorSource = Join-Path $SourceDir "injectMods.js"
	if (-not (Test-Path $injectorSource)) { $injectorSource = Join-Path (Split-Path -Parent $SourceDir) "injectMods.js" }
	if (Test-Path $injectorSource) {
		Copy-Item -Path $injectorSource -Destination (Join-Path $Target.VivaldiDir "injectMods.js") -Force
	}

	$gitCommit = ""
	try { $repoRoot = Split-Path -Parent $SourceDir; $gitCommit = (git -C $repoRoot rev-parse --short HEAD 2>$null) -replace "`n|`r", "" } catch {}

	$newState = @{
		version      = $State.Version
		installed_at = (Get-Date -Format "o")
		git_commit   = $gitCommit
		css_mods     = @($State.CssMods)
		js_mods      = @($State.JsMods)
	}
	$statePath = Join-Path $Target.VivaldiDir "user_mods\.volante.json"
	$newState | ConvertTo-Json | Set-Content -Path $statePath

	# Also update persistent
	if ($Target.PersistentDir) {
		try {
			$pv = $State.Version
			$persistVerDir = Join-Path $Target.PersistentDir $pv
			$persistCssDir = Join-Path $persistVerDir "css"
			foreach ($mod in $chosenCSS) {
				$src = Join-Path $sourceCssDir $mod
				if (Test-Path $src) { Copy-Item -Path $src -Destination (Join-Path $persistCssDir $mod) -Force -ErrorAction SilentlyContinue }
			}
			$persistJsDir = Join-Path $persistVerDir "js"
			foreach ($mod in $chosenJS) {
				$src = Join-Path $sourceJsDir $mod
				if (Test-Path $src) { Copy-Item -Path $src -Destination (Join-Path $persistJsDir $mod) -Force -ErrorAction SilentlyContinue }
			}
			$newState | ConvertTo-Json | Set-Content -Path (Join-Path $persistVerDir ".volante.json") -ErrorAction SilentlyContinue
		} catch {}
	}

	Invoke-HtmlInjection -VivaldiDir $Target.VivaldiDir
Test-WindowHtmlFormat -VivaldiDir $Target.VivaldiDir -Silent

	Write-Host "`n$e[1;32m$(trf update_complete $updated)$e[0m"
}

function Invoke-Uninstall {
	param(
		[hashtable]$Target,
		[hashtable]$State
	)

	Clear-ContentArea

	$e = [char]27
	$stepLabels = @('uninstall_title')
	Set-StepInfo 0 1 $stepLabels

	# Choose uninstall type
	$items = @(
		@{ LabelKey = "uninstall_full";      DetailKey = "uninstall_full_desc";      Action = "full" },
		@{ LabelKey = "uninstall_selective"; DetailKey = "uninstall_selective_desc"; Action = "selective" }
	)

	$cursor = 0
	$done = $false
	while (-not $done) {
		$sb = [Text.StringBuilder]::new()
		[void]$sb.AppendLine()
		[void]$sb.AppendLine("  $e[1m$(tr uninstall_title)$e[0m")
		[void]$sb.AppendLine()
		[void]$sb.AppendLine("  $(tr uninstall_type_prompt)")
		[void]$sb.AppendLine()
		for ($i = 0; $i -lt $items.Count; $i++) {
			$prefix = if ($i -eq $cursor) { "  >" } else { "   " }
			$marker = if ($i -eq $cursor) { "O" } else { " " }
			[void]$sb.AppendLine("$prefix [$marker] $e[1m$(tr $items[$i].LabelKey)$e[0m")
			[void]$sb.AppendLine("          $(tr $items[$i].DetailKey)")
		}
		[void]$sb.AppendLine()
		[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")
		[void]$sb.AppendLine("    $(Build-KeyHint @((tr key_nav_confirm), (tr key_left_back), (tr key_exit)))")
		Write-FrameContent $sb.ToString()

		$key = Read-TuiKey
		switch ($key) {
			'UP'    { $cursor = [Math]::Max(0, $cursor - 1) }
			'DOWN'  { $cursor = [Math]::Min($items.Count - 1, $cursor + 1) }
			'ENTER' { $done = $true }
			'LEFT'  { return }
			'Q'     { Exit-Installer }
			'LANG' { Toggle-Lang }
			'ESC'   { Exit-Installer }
		}
	}

	$action = $items[$cursor].Action

	if ($action -eq "full") {
		# Confirm full uninstall
		Clear-ContentArea
		Write-Host "`n$e[1;31m$(tr uninstall_full_confirm)$e[0m [Y/N] (Enter=Y)"
		$confirm = $host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
		if ($confirm.Character -ne 'y' -and $confirm.Character -ne 'Y' -and $confirm.VirtualKeyCode -ne 13) {
			Write-Host "`n$(tr uninstall_cancelled)"
			return
		}
		Write-Host ""

		$vivaldiDir = $Target.VivaldiDir
		$htmlPath   = Join-Path $vivaldiDir "window.html"
		$bakPath    = "$htmlPath.bak"
		$userModsDir = Join-Path $vivaldiDir "user_mods"
		$injectorPath = Join-Path $vivaldiDir "injectMods.js"

		# Permission check for system installs
		if (-not (Test-Writable $vivaldiDir)) {
			$sb = [Text.StringBuilder]::new()
			[void]$sb.AppendLine()
			[void]$sb.AppendLine("  $e[1;31m$(tr error_permission)$e[0m")
			[void]$sb.AppendLine("  $(tr target_path): $vivaldiDir")
			if ($Target.IsSystem) {
				[void]$sb.AppendLine("  $e[37m$(tr error_admin_required)$e[0m")
				[void]$sb.AppendLine()
				[void]$sb.AppendLine("  $e[1;33m$(tr elevate_prompt)$e[0m")
				Write-FrameContent $sb.ToString()
				$key = Read-TuiKey
				if ($key -eq 'ENTER') {
					$scriptPath = if ($PSCommandPath) { $PSCommandPath } else { (Get-Command $MyInvocation.MyCommand.Name).Source }
					Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`"" -Verb RunAs
					Exit-Installer
				}
				Exit-Installer
			} else {
				[void]$sb.AppendLine()
				[void]$sb.AppendLine("  $e[37m$(tr key_exit)$e[0m")
				Write-FrameContent $sb.ToString()
				Read-TuiKey | Out-Null
			}
			return
		}

		Write-Host (tr uninstall_restoring)
		if (Test-Path $bakPath) {
			Copy-Item -Path $bakPath -Destination $htmlPath -Force
			Write-Host "  Restored from $bakPath"
		} else {
			Write-Host "  $(tr uninstall_no_bak)"
		}

		if (Test-Path $injectorPath) { Remove-Item $injectorPath -Force }

		Write-Host (tr uninstall_removing)
		if (Test-Path $userModsDir) { Remove-Item $userModsDir -Recurse -Force }

		Write-Host "`n$e[1;32m$(tr uninstall_complete)$e[0m"
	} else {
		# Selective: go into manage mode to deselect mods
		$mods = Scan-Mods -SourceDir $Script:SourceDir

		$stepLabels = @('step_style', 'step_function', 'step_ai', 'summary_title')
		$totalPages = 4

		# Build preselected from installed state
		$allInstalled = @($State.CssMods | ForEach-Object { [IO.Path]::GetFileNameWithoutExtension($_) }) + @($State.JsMods | ForEach-Object { [IO.Path]::GetFileNameWithoutExtension($_) }) | Select-Object -Unique
		$preStyle = @(); $preFunction = @(); $preMAX = @()
		foreach ($b in $allInstalled) {
			$cat = if ($Script:ModCategoryMap.ContainsKey($b)) { $Script:ModCategoryMap[$b] } else { $null }
			switch ($cat) {
				"Style"      { $preStyle += $b }
				"Function"   { $preFunction += $b }
				"AI" { $preMAX += $b }
			}
		}

		$currentPage = 0
		$pagesConfirmed = @($false) * $totalPages
		$selectedStyle = @()
		$selectedFunction = @()
		$selectedMAX = @()

		:pageLoop while ($true) {
			switch ($currentPage) {
			0 {
				Set-StepInfo 0 $totalPages $stepLabels
				$Script:PagesConfirmed = $pagesConfirmed
				$result = Show-SelectCategory `
					-CategoryKey "style_title" `
					-IntroKey "style_intro" `
					-Mods $mods.Style `
					-PreselectedBases $preStyle `
					-DefaultAll $false `
					-AllowLeft $false
				if ($null -eq $result) { return }
				$selectedStyle = $result
				$pagesConfirmed[0] = $true
				$currentPage = 1
			}
			1 {
				Set-StepInfo 1 $totalPages $stepLabels
				$Script:PagesConfirmed = $pagesConfirmed
				$result = Show-SelectCategory `
					-CategoryKey "function_title" `
					-IntroKey "function_intro" `
					-Mods $mods.Function `
					-PreselectedBases $preFunction `
					-DefaultAll $false `
					-AllowLeft $true
				if ($null -eq $result) {
					$pagesConfirmed[1] = $false; $currentPage = 0; continue
				}
				$selectedFunction = $result
				$pagesConfirmed[1] = $true
				$currentPage = 2
			}
			2 {
				Set-StepInfo 2 $totalPages $stepLabels
				$Script:PagesConfirmed = $pagesConfirmed
				$result = Show-SelectCategory `
					-CategoryKey "ai_title" `
					-IntroKey "ai_intro" `
					-Mods $mods.AI `
					-PreselectedBases $preMAX `
					-DefaultAll $false `
					-AllowLeft $true
				if ($null -eq $result) {
					$pagesConfirmed[2] = $false; $currentPage = 1; continue
				}
				$selectedMAX = $result
				$pagesConfirmed[2] = $true
				$currentPage = 3
			}
				3 {
					# Confirm page
					$allSelected = @($selectedStyle) + @($selectedFunction) + @($selectedMAX) | Select-Object -Unique
					$removedBases = $allInstalled | Where-Object { $_ -notin $allSelected }

					Set-StepInfo 3 $totalPages $stepLabels
					$Script:PagesConfirmed = $pagesConfirmed

					$confirmDone = $false
					$confirmBack = $false
					while (-not $confirmDone) {
						$sb = [Text.StringBuilder]::new()
						[void]$sb.AppendLine()
						[void]$sb.AppendLine((Format-StepBar))
						[void]$sb.AppendLine()
						[void]$sb.AppendLine("  $e[1m$(tr manage_confirm_title)$e[0m")
						[void]$sb.AppendLine()

						if ($removedBases.Count -gt 0) {
							[void]$sb.AppendLine("  $e[31m$(tr manage_removed_mods) ($($removedBases.Count)):$e[0m")
							foreach ($b in $removedBases) { [void]$sb.AppendLine("    $e[31m- $b$e[0m") }
						}
						if ($removedBases.Count -eq 0) {
							[void]$sb.AppendLine("  $e[37m$(tr manage_no_changes)$e[0m")
						}

						[void]$sb.AppendLine()
						[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")
						[void]$sb.AppendLine("    $(Build-KeyHint @((tr key_enter_uninstall), (tr key_left_back), (tr key_exit)))")
						Write-FrameContent $sb.ToString()

						$key = Read-TuiKey
						switch ($key) {
							'ENTER' {
								if ($removedBases.Count -eq 0) { continue }
								$confirmDone = $true
							}
							'LEFT'  { $currentPage = 2; $confirmDone = $true; $confirmBack = $true }
							'Q'     { Exit-Installer }
							'LANG' { Toggle-Lang }
							'ESC'   { Exit-Installer }
						}
					}

					if ($confirmBack) {
						$pagesConfirmed[3] = $false; continue
					}
					break pageLoop
				}
			}
		}

		# Execute removal
		Clear-ContentArea
		$vivaldiDir = $Target.VivaldiDir

		if (-not (Test-Writable $vivaldiDir)) {
			$sb = [Text.StringBuilder]::new()
			[void]$sb.AppendLine()
			[void]$sb.AppendLine("  $e[1;31m$(tr error_permission)$e[0m")
			[void]$sb.AppendLine("  $(tr target_path): $vivaldiDir")
			if ($Target.IsSystem) {
				[void]$sb.AppendLine("  $e[37m$(tr error_admin_required)$e[0m")
				[void]$sb.AppendLine()
				[void]$sb.AppendLine("  $e[1;33m$(tr elevate_prompt)$e[0m")
				Write-FrameContent $sb.ToString()
				$key = Read-TuiKey
				if ($key -eq 'ENTER') {
					$scriptPath = if ($PSCommandPath) { $PSCommandPath } else { (Get-Command $MyInvocation.MyCommand.Name).Source }
					Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`"" -Verb RunAs
					Exit-Installer
				}
				Exit-Installer
			} else {
				[void]$sb.AppendLine()
				[void]$sb.AppendLine("  $e[37m$(tr key_exit)$e[0m")
				Write-FrameContent $sb.ToString()
				Read-TuiKey | Out-Null
			}
			return
		}

		$userCssDir = Join-Path $vivaldiDir "user_mods\css"
		$userJsDir  = Join-Path $vivaldiDir "user_mods\js"

		$cssToRemove = @($State.CssMods | Where-Object { [IO.Path]::GetFileNameWithoutExtension($_) -in $removedBases })
		$jsToRemove  = @($State.JsMods  | Where-Object { [IO.Path]::GetFileNameWithoutExtension($_) -in $removedBases })

		foreach ($mod in $cssToRemove) {
			$path = Join-Path $userCssDir $mod
			if (Test-Path $path) {
				Remove-Item $path -Force
				Write-Host "  $e[31m- $mod$e[0m"
			}
		}
		foreach ($mod in $jsToRemove) {
			$path = Join-Path $userJsDir $mod
			if (Test-Path $path) {
				Remove-Item $path -Force
				Write-Host "  $e[31m- $mod$e[0m"
			}
		}

		# Update state
		$remainingCSS = @($State.CssMods | Where-Object { $_ -notin $cssToRemove })
		$remainingJS  = @($State.JsMods  | Where-Object { $_ -notin $jsToRemove })

		if ($remainingCSS.Count -eq 0 -and $remainingJS.Count -eq 0) {
			# All mods removed, cleanup entirely
			$userModsDir = Join-Path $vivaldiDir "user_mods"
			$htmlPath    = Join-Path $vivaldiDir "window.html"
			$bakPath     = "$htmlPath.bak"
			$injectorPath = Join-Path $vivaldiDir "injectMods.js"

			Write-Host (tr uninstall_restoring)
			if (Test-Path $bakPath) {
				Copy-Item -Path $bakPath -Destination $htmlPath -Force
			}
			if (Test-Path $injectorPath) { Remove-Item $injectorPath -Force }
			if (Test-Path $userModsDir) { Remove-Item $userModsDir -Recurse -Force }
			Write-Host "`n$e[1;32m$(tr uninstall_complete)$e[0m"
		} else {
			$gitCommit = ""
			try { $repoRoot = Split-Path -Parent $SourceDir; $gitCommit = (git -C $repoRoot rev-parse --short HEAD 2>$null) -replace "`n|`r", "" } catch {}
			$newState = @{
				version      = $State.Version
				installed_at = (Get-Date -Format "o")
				git_commit   = $gitCommit
				css_mods     = $remainingCSS
				js_mods      = $remainingJS
			}
			$statePath = Join-Path $vivaldiDir "user_mods\.volante.json"
			$newState | ConvertTo-Json | Set-Content -Path $statePath
		}
	}
}

function Show-EntryMenu {
	param(
		[bool]$IsInstalled,
		[hashtable]$State = $null
	)

	Clear-ContentArea

	$e = [char]27
	# Detect if AI modules are installed
	$hasAI = $false
	if ($State -and $State.JsMods) {
		$aiBases = @("ModConfig", "AskOnPage", "Diabar", "TidyTabs", "TidyAddress", "TidyDownloads", "TidyTitles", "VividAI", "VividMarkdown")
		foreach ($f in $State.JsMods) {
			$base = [IO.Path]::GetFileNameWithoutExtension($f)
			if ($aiBases -contains $base) { $hasAI = $true; break }
		}
	}

	$items = if ($IsInstalled) {
		$baseItems = @(
			@{ LabelKey = "entry_manage";    DetailKey = "entry_manage_desc";    Action = "manage" }
			@{ LabelKey = "entry_update";    DetailKey = "entry_update_desc";    Action = "update" }
		)
		if ($hasAI) {
			$baseItems += @{ LabelKey = "entry_ai_uninstall"; DetailKey = "entry_ai_uninstall_desc"; Action = "ai_uninstall" }
		} else {
			$baseItems += @{ LabelKey = "entry_ai_install";   DetailKey = "entry_ai_install_desc";   Action = "ai_install" }
		}
		$baseItems += @{ LabelKey = "entry_uninstall"; DetailKey = "entry_uninstall_desc"; Action = "uninstall" }
		# Dev mods: only show when running from local repo
		if ($Script:RepoRoot) {
			$baseItems += @{ LabelKey = "entry_dev_install"; DetailKey = "entry_dev_install_desc"; Action = "dev_install" }
		}
		$baseItems += @{ LabelKey = "entry_exit";      DetailKey = "entry_exit_desc";      Action = "exit" }
		$baseItems
	} else {
		@(
			@{ LabelKey = "entry_install"; DetailKey = "entry_install_desc"; Action = "install" }
			@{ LabelKey = "entry_exit";    DetailKey = "entry_exit_desc";    Action = "exit" }
		)
	}

	$cursor = 0
	$done = $false

	Set-StepInfo 0 0 @()

	while (-not $done) {
		$sb = [Text.StringBuilder]::new()
		if ($IsInstalled) {
			[void]$sb.AppendLine()
			[void]$sb.AppendLine("  $e[1;32m$(tr entry_installed_title)$e[0m")
		} else {
			[void]$sb.AppendLine()
			[void]$sb.AppendLine("  $e[1m$(tr entry_not_installed_title)$e[0m")
		}
		[void]$sb.AppendLine()
		[void]$sb.AppendLine("  $(tr entry_choose_action)")
		[void]$sb.AppendLine()

		for ($i = 0; $i -lt $items.Count; $i++) {
			$prefix = if ($i -eq $cursor) { "  $e[1;36m>$e[0m" } else { "   " }
			$marker = if ($i -eq $cursor) { "O" } else { " " }
			[void]$sb.AppendLine("$prefix [$marker] $e[1m$(tr $items[$i].LabelKey)$e[0m")
			[void]$sb.AppendLine("          $e[37m$(tr $items[$i].DetailKey)$e[0m")
		}

		[void]$sb.AppendLine()
		[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")
		[void]$sb.AppendLine("    $(Build-KeyHint @((tr key_nav_confirm), (tr key_left_back), (tr key_exit)))")

		Write-FrameContent $sb.ToString()

		$key = Read-TuiKey
		switch ($key) {
			'UP'    { $cursor = [Math]::Max(0, $cursor - 1) }
			'DOWN'  { $cursor = [Math]::Min($items.Count - 1, $cursor + 1) }
			'ENTER' { $done = $true }
			'LEFT'  { return "back" }
			'Q'     { Exit-Installer }
			'LANG' { Toggle-Lang }
			'ESC'   { Exit-Installer }
		}
	}

	return $items[$cursor].Action
}

# ============================================================
#  13.  Page-Based Install Flow
# ============================================================

function Invoke-InstallFlow {
	param(
		[string]$SourceDir,
		[hashtable]$Target,
		[object]$Mods,
		[string[]]$PreselectedCSS = @(),
		[string[]]$PreselectedJS = @()
	)

	$e = [char]27
	$stepLabels = @('step_style', 'step_function', 'step_ai', 'step_provider', 'step_confirm')
	$totalPages = 7

	# Build preselected base names from file lists
	$preStyle = @()
	$preFunction = @()
	$preMAX = @()
	if ($PreselectedCSS.Count -gt 0 -or $PreselectedJS.Count -gt 0) {
		$allPre = @($PreselectedCSS | ForEach-Object { [IO.Path]::GetFileNameWithoutExtension($_) }) + @($PreselectedJS | ForEach-Object { [IO.Path]::GetFileNameWithoutExtension($_) }) | Select-Object -Unique
		foreach ($b in $allPre) {
			$cat = if ($Script:ModCategoryMap.ContainsKey($b)) { $Script:ModCategoryMap[$b] } else { $null }
			switch ($cat) {
				"Style"      { $preStyle += $b }
				"Function"   { $preFunction += $b }
				"AI" { $preMAX += $b }
			}
		}
	}

	# Page state
	$currentPage = 0
	$pagesConfirmed = @($false) * $totalPages
	$selectedStyle = @()
	$selectedFunction = @()
	$selectedMAX = @()

	:pageLoop while ($true) {
		switch ($currentPage) {
			0 {
				# Install mode selection page
				Set-StepInfo -1 $totalPages $stepLabels
				$Script:PagesConfirmed = $pagesConfirmed

				$modeCursor = 0
				$modeDone = $false
				while (-not $modeDone) {
					$sb = [Text.StringBuilder]::new()
					[void]$sb.AppendLine()
					[void]$sb.AppendLine((Format-StepBar))
					[void]$sb.AppendLine()
					[void]$sb.AppendLine("  $e[1m$(tr install_mode_title)$e[0m")
					[void]$sb.AppendLine()

					$defaultPrefix = if ($modeCursor -eq 0) { "  $e[1;36m>$e[0m" } else { "   " }
					$defaultMarker = if ($modeCursor -eq 0) { "O" } else { " " }
					[void]$sb.AppendLine("$defaultPrefix [$defaultMarker] $e[1m$(tr install_mode_default)$e[0m")
					[void]$sb.AppendLine("          $e[37m$(tr install_mode_default_desc)$e[0m")

					$customPrefix = if ($modeCursor -eq 1) { "  $e[1;36m>$e[0m" } else { "   " }
					$customMarker = if ($modeCursor -eq 1) { "O" } else { " " }
					[void]$sb.AppendLine("$customPrefix [$customMarker] $e[1m$(tr install_mode_custom)$e[0m")
					[void]$sb.AppendLine("          $e[37m$(tr install_mode_custom_desc)$e[0m")

					[void]$sb.AppendLine()
					[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")
					[void]$sb.AppendLine("    $(Build-KeyHint @((tr key_nav_confirm), (tr key_left_back), (tr key_exit)))")

					Write-FrameContent $sb.ToString()

					$key = Read-TuiKey
					switch ($key) {
						'UP'    { $modeCursor = [Math]::Max(0, $modeCursor - 1) }
						'DOWN'  { $modeCursor = [Math]::Min(1, $modeCursor + 1) }
						'ENTER' { $modeDone = $true }
						'LEFT'  { return $null }
						'Q'     { Exit-Installer }
						'LANG' { Toggle-Lang }
						'ESC'   { Exit-Installer }
					}
				}

				if ($modeCursor -eq 0) {
					# Default install — auto-select all non-default-off mods
					$selectedStyle = @()
					foreach ($m in $Mods.Style) {
						if (-not (Test-IsDefaultOff "$($m.BaseName).js") -and -not (Test-IsDefaultOff "$($m.BaseName).css")) {
							$selectedStyle += $m.BaseName
						}
					}
					$selectedFunction = @()
					foreach ($m in $Mods.Function) {
						if (-not (Test-IsDefaultOff "$($m.BaseName).js") -and -not (Test-IsDefaultOff "$($m.BaseName).css")) {
							$selectedFunction += $m.BaseName
						}
					}
					$selectedMAX = @()
					foreach ($m in $Mods.AI) {
						if (-not (Test-IsDefaultOff "$($m.BaseName).js") -and -not (Test-IsDefaultOff "$($m.BaseName).css")) {
							$selectedMAX += $m.BaseName
						}
					}
					for ($i = 0; $i -lt $totalPages; $i++) { $pagesConfirmed[$i] = $true }
					$currentPage = 6
				} else {
					# Custom install — continue to Style selection
					$currentPage = 1
				}
			}
			1 {
				# Style selection page
				Set-StepInfo 0 $totalPages $stepLabels
				$Script:PagesConfirmed = $pagesConfirmed
				$defaultAll = ($PreselectedCSS.Count -eq 0 -and $PreselectedJS.Count -eq 0)
				$preselected = if ($pagesConfirmed[1]) { $selectedStyle } else { $preStyle }
				$confirmedBases = if ($pagesConfirmed[1]) { $selectedStyle } else { @() }
				$result = Show-SelectCategory `
					-CategoryKey "style_title" `
					-IntroKey "style_intro" `
					-Mods $Mods.Style `
					-PreselectedBases $preselected `
					-ConfirmedBases $confirmedBases `
					-DefaultAll $defaultAll `
					-AllowLeft $true
				if ($null -eq $result) { $currentPage = 0; continue }
				$selectedStyle = $result
				$pagesConfirmed[1] = $true
				$currentPage = 2
			}
			2 {
				# Function selection page
				Set-StepInfo 1 $totalPages $stepLabels
				$Script:PagesConfirmed = $pagesConfirmed
				$defaultAll = ($PreselectedCSS.Count -eq 0 -and $PreselectedJS.Count -eq 0)
				$preselected = if ($pagesConfirmed[2]) { $selectedFunction } else { $preFunction }
				$confirmedBases = if ($pagesConfirmed[2]) { $selectedFunction } else { @() }
				$result = Show-SelectCategory `
					-CategoryKey "function_title" `
					-IntroKey "function_intro" `
					-Mods $Mods.Function `
					-PreselectedBases $preselected `
					-ConfirmedBases $confirmedBases `
					-DefaultAll $defaultAll `
					-AllowLeft $true
				if ($null -eq $result) { $currentPage = 1; continue }
				$selectedFunction = $result
				$pagesConfirmed[2] = $true
				$currentPage = 3
			}
			3 {
				# AI consent page
				Set-StepInfo 2 $totalPages $stepLabels
				$Script:PagesConfirmed = $pagesConfirmed

				$consentCursor = 0
				$consentDone = $false
				while (-not $consentDone) {
					$sb = [Text.StringBuilder]::new()
					[void]$sb.AppendLine()
					[void]$sb.AppendLine((Format-StepBar))
					[void]$sb.AppendLine()
					[void]$sb.AppendLine("  $e[1m$(tr ai_consent_title)$e[0m")
					[void]$sb.AppendLine()
					[void]$sb.AppendLine("  $e[37m$(tr ai_consent_text)$e[0m")
					[void]$sb.AppendLine()

					$acceptPrefix = if ($consentCursor -eq 0) { "  $e[1;36m>$e[0m" } else { "   " }
					$acceptMarker = if ($consentCursor -eq 0) { "O" } else { " " }
					[void]$sb.AppendLine("$acceptPrefix [$acceptMarker] $e[1m$(tr ai_consent_accept)$e[0m")

					$declinePrefix = if ($consentCursor -eq 1) { "  $e[1;36m>$e[0m" } else { "   " }
					$declineMarker = if ($consentCursor -eq 1) { "O" } else { " " }
					[void]$sb.AppendLine("$declinePrefix [$declineMarker] $e[1m$(tr ai_consent_decline)$e[0m")

					[void]$sb.AppendLine()
					[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")
					[void]$sb.AppendLine("    $(Build-KeyHint @((tr key_nav_confirm), (tr key_left_back), (tr key_exit)))")

					Write-FrameContent $sb.ToString()

					$key = Read-TuiKey
					switch ($key) {
						'UP'    { $consentCursor = [Math]::Max(0, $consentCursor - 1) }
						'DOWN'  { $consentCursor = [Math]::Min(1, $consentCursor + 1) }
						'ENTER' { $consentDone = $true }
						'LEFT'  { $currentPage = 2; continue pageLoop }
						'Q'     { Exit-Installer }
						'LANG' { Toggle-Lang }
						'ESC'   { Exit-Installer }
					}
				}

				if ($consentCursor -eq 0) {
					# Accept — go to AI selection
					$currentPage = 4
				} else {
					# Decline — skip AI, go to confirm
					$selectedMAX = @()
					$pagesConfirmed[3] = $true
					$pagesConfirmed[4] = $true
					$pagesConfirmed[5] = $true
					$currentPage = 6
				}
			}
			4 {
				# AI selection page
				Set-StepInfo 2 $totalPages $stepLabels
				$Script:PagesConfirmed = $pagesConfirmed
				$defaultAll = ($PreselectedCSS.Count -eq 0 -and $PreselectedJS.Count -eq 0)
				$preselected = if ($pagesConfirmed[4]) { $selectedMAX } else { $preMAX }
				$confirmedBases = if ($pagesConfirmed[4]) { $selectedMAX } else { @() }
				$result = Show-SelectCategory `
					-CategoryKey "ai_title" `
					-IntroKey "ai_intro" `
					-Mods $Mods.AI `
					-PreselectedBases $preselected `
					-ConfirmedBases $confirmedBases `
					-DefaultAll $defaultAll `
					-AllowLeft $true
				if ($null -eq $result) { $currentPage = 2; continue }
				$selectedMAX = $result
				$pagesConfirmed[4] = $true
				$currentPage = 5
			}
			5 {
				# Provider selection page
				# Skip if no AI mods selected
				if ($selectedMAX.Count -eq 0) {
					$pagesConfirmed[5] = $true
					$Script:ProviderConfig = $null
					$currentPage = 6; continue
				}

				Set-StepInfo 3 $totalPages $stepLabels
				$Script:PagesConfirmed = $pagesConfirmed

				$providerCursor = 0
				$providerDone = $false
				# Build items: Skip + providers
				$providerItems = @($null) + $Script:ProviderDefs  # index 0 = skip
				$providerCount = $providerItems.Count

				while (-not $providerDone) {
					$sb = [Text.StringBuilder]::new()
					[void]$sb.AppendLine()
					[void]$sb.AppendLine((Format-StepBar))
					[void]$sb.AppendLine()
					[void]$sb.AppendLine("  $e[1m$(tr provider_title)$e[0m")
					[void]$sb.AppendLine("  $e[37m$(tr provider_intro)$e[0m")
					[void]$sb.AppendLine()

					for ($i = 0; $i -lt $providerCount; $i++) {
						$prefix = if ($providerCursor -eq $i) { "  $e[1;36m>$e[0m" } else { "   " }
						$marker = if ($providerCursor -eq $i) { "O" } else { " " }
						if ($i -eq 0) {
							# Skip option
							[void]$sb.AppendLine("$prefix [$marker] $e[33m$(tr provider_skip)$e[0m")
							[void]$sb.AppendLine("          $e[90m$(tr provider_skip_hint)$e[0m")
						} else {
							$def = $providerItems[$i]
							$label = if ($def.Label) { $def.Label } else { $def.Key }
							[void]$sb.AppendLine("$prefix [$marker] $e[1m$label$e[0m")
						}
					}

					[void]$sb.AppendLine()
					[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")
					[void]$sb.AppendLine("    $(Build-KeyHint @((tr key_nav_confirm), (tr key_left_back), (tr key_exit)))")

					Write-FrameContent $sb.ToString()

					$key = Read-TuiKey
					switch ($key) {
						'UP'    { $providerCursor = [Math]::Max(0, $providerCursor - 1) }
						'DOWN'  { $providerCursor = [Math]::Min($providerCount - 1, $providerCursor + 1) }
						'ENTER' { $providerDone = $true }
						'LEFT'  { $currentPage = 4; continue pageLoop }
						'Q'     { Exit-Installer }
						'LANG' { Toggle-Lang }
						'ESC'   { Exit-Installer }
					}
				}

				if ($providerCursor -eq 0) {
					# Skip — use default OpenRouter
					$Script:ProviderConfig = $null
					$pagesConfirmed[5] = $true
					$currentPage = 6
				} else {
					$selectedDef = $providerItems[$providerCursor]
					$provEndpoint = $selectedDef.Endpoint
					$provLabel = if ($selectedDef.Label) { $selectedDef.Label } else { $selectedDef.Key }

					# Custom provider: ask for endpoint and name
					if ($selectedDef.Key -eq 'custom') {
						# Ask for name
						$nameDone = $false
						while (-not $nameDone) {
							$sb = [Text.StringBuilder]::new()
							[void]$sb.AppendLine()
							[void]$sb.AppendLine("  $e[1m$(tr provider_custom_name)$e[0m")
							[void]$sb.AppendLine()
							Write-FrameContent $sb.ToString()
							Clear-ContentArea
							Write-Host "`n  $e[1m$(tr provider_custom_name)$e[0m"
							$customName = Read-Host "  "
							if ($customName) { $provLabel = $customName; $nameDone = $true }
						}
						# Ask for endpoint
						$epDone = $false
						while (-not $epDone) {
							Clear-ContentArea
							Write-Host "`n  $e[1m$(tr provider_custom_endpoint)$e[0m"
							$customEndpoint = Read-Host "  "
							if ($customEndpoint) { $provEndpoint = $customEndpoint; $epDone = $true }
						}
					}

					# Ask for API key
					Clear-ContentArea
					Write-Host "`n  $e[1m$(trf provider_enter_key $provLabel)$e[0m"
					Write-Host "  $e[90m$(tr provider_key_placeholder)$e[0m"
					$apiKey = Read-Host "  "

					$Script:ProviderConfig = @{
						Provider = $selectedDef.Key
						ApiKey   = $apiKey
						Endpoint = $provEndpoint
					}
					$pagesConfirmed[5] = $true
					$currentPage = 6
				}
			}
			6 {
				# Confirm page — expand base names to file lists
				$allSelected = @($selectedStyle) + @($selectedFunction) + @($selectedMAX) | Select-Object -Unique
				$allMods = @($Mods.Style) + @($Mods.Function) + @($Mods.AI)

				$finalCSS = @()
				$finalJS  = @()
				# Silent install mods (always included)
				foreach ($f in $Mods.AllJsFiles) {
					$base = [IO.Path]::GetFileNameWithoutExtension($f)
					if ($Script:SilentInstall -contains $base) { $finalJS += $f }
				}
				foreach ($f in $Mods.AllCssFiles) {
					$base = [IO.Path]::GetFileNameWithoutExtension($f)
					if ($Script:SilentInstall -contains $base) { $finalCSS += $f }
				}
				# User-selected mods
				foreach ($m in $allMods) {
					if ($allSelected -contains $m.BaseName) {
						if ($m.CssFile) { $finalCSS += $m.CssFile }
						if ($m.JsFile) { $finalJS += $m.JsFile }
					}
				}
				$finalCSS = $finalCSS | Select-Object -Unique
				$finalJS  = $finalJS  | Select-Object -Unique

				Set-StepInfo 4 $totalPages $stepLabels
				$Script:PagesConfirmed = $pagesConfirmed

				$confirmDone = $false
				$confirmBack = $false
				while (-not $confirmDone) {
					$sb = [Text.StringBuilder]::new()
					[void]$sb.AppendLine()
					[void]$sb.AppendLine((Format-StepBar))
					[void]$sb.AppendLine()
					[void]$sb.AppendLine("  $e[1m$(tr summary_title)$e[0m")
					[void]$sb.AppendLine()
					[void]$sb.AppendLine("  $(tr summary_target): $($Target.DisplayName) $($Target.Version)")
					[void]$sb.AppendLine("  $(tr target_path): $($Target.VivaldiDir)")
					[void]$sb.AppendLine()
					[void]$sb.AppendLine("  $e[32m$(tr summary_style_mods) ($($selectedStyle.Count))$e[0m: $($selectedStyle -join ', ')")
					[void]$sb.AppendLine("  $e[36m$(tr summary_function_mods) ($($selectedFunction.Count))$e[0m: $($selectedFunction -join ', ')")
					[void]$sb.AppendLine("  $e[35m$(tr summary_ai_mods) ($($selectedMAX.Count))$e[0m: $($selectedMAX -join ', ')")
					# Provider info
					if ($null -ne $Script:ProviderConfig) {
						[void]$sb.AppendLine("  $e[33m$(tr step_provider)$e[0m: $($Script:ProviderConfig.Provider)")
					} else {
						[void]$sb.AppendLine("  $e[90m$(tr step_provider)$e[0m: $e[90mOpenRouter (default)$e[0m")
					}
					[void]$sb.AppendLine()
					[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")
					[void]$sb.AppendLine("    $e[37m$(tr confirm_deploy_hint)$e[0m")

					Write-FrameContent $sb.ToString()

					$key = Read-TuiKey
					switch ($key) {
						'ENTER' { $confirmDone = $true }
						'LEFT'  { $currentPage = 5; $confirmDone = $true; $confirmBack = $true }
						'RIGHT' { }
						'Q'     { Exit-Installer }
						'LANG' { Toggle-Lang }
						'ESC'   { Exit-Installer }
					}
				}

				if ($confirmBack) {
					$pagesConfirmed[6] = $false; continue
				}
				break pageLoop
			}
		}
	}

	# Permission check
	if (-not (Test-Writable $Target.VivaldiDir)) {
		$sb = [Text.StringBuilder]::new()
		[void]$sb.AppendLine()
		[void]$sb.AppendLine("  $e[1;31m$(tr error_permission)$e[0m")
		[void]$sb.AppendLine("  $(tr target_path): $($Target.VivaldiDir)")
		if ($Target.IsSystem) {
			[void]$sb.AppendLine("  $e[37m$(tr error_admin_required)$e[0m")
			[void]$sb.AppendLine()
			[void]$sb.AppendLine("  $e[1;33m$(tr elevate_prompt)$e[0m")
			Write-FrameContent $sb.ToString()
			$key = Read-TuiKey
			if ($key -eq 'ENTER') {
				$scriptPath = if ($PSCommandPath) { $PSCommandPath } else { (Get-Command $MyInvocation.MyCommand.Name).Source }
				Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`"" -Verb RunAs
				Exit-Installer
			}
			Exit-Installer
		} else {
			[void]$sb.AppendLine()
			[void]$sb.AppendLine("  $e[37m$(tr key_exit)$e[0m")
			Write-FrameContent $sb.ToString()
			Read-TuiKey | Out-Null
		}
		return $null
	}

	# Deploy
	$sb = [Text.StringBuilder]::new()
	[void]$sb.AppendLine()
	[void]$sb.AppendLine("  $e[1m$(tr deploy_start)$e[0m")
	[void]$sb.AppendLine("  $(tr target_path): $($Target.VivaldiDir)")
	[void]$sb.AppendLine()
	Write-FrameContent $sb.ToString()

	Backup-WindowHtml -VivaldiDir $Target.VivaldiDir -PersistentDir $Target.PersistentDir
	Deploy-ModFiles -SourceDir $SourceDir -VivaldiDir $Target.VivaldiDir -PersistentDir $Target.PersistentDir -CssMods $finalCSS -JsMods $finalJS
	Write-ProviderSeed -VivaldiDir $Target.VivaldiDir
	Invoke-HtmlInjection -VivaldiDir $Target.VivaldiDir
Test-WindowHtmlFormat -VivaldiDir $Target.VivaldiDir

	Write-Host ""
	Write-Host "$e[1;32m" + ("=" * 52) + "$e[0m"
	Write-Host "  $e[1;32m$(tr deploy_success)$e[0m"
	Write-Host "$e[1;32m" + ("=" * 52) + "$e[0m"

	return @{ CSS = $finalCSS; JS = $finalJS }
	param(
		[string]$SourceDir,
		[hashtable]$Target,
		[object]$Mods,
		[hashtable]$State
	)

	$e = [char]27
	$stepLabels = @('step_style', 'step_function', 'step_ai', 'step_provider', 'step_confirm')
	$totalPages = 6

	# Build preselected base names from installed state
	$allInstalled = @($State.CssMods | ForEach-Object { [IO.Path]::GetFileNameWithoutExtension($_) }) + @($State.JsMods | ForEach-Object { [IO.Path]::GetFileNameWithoutExtension($_) }) | Select-Object -Unique
	$preStyle = @(); $preFunction = @(); $preMAX = @()
	foreach ($b in $allInstalled) {
		$cat = if ($Script:ModCategoryMap.ContainsKey($b)) { $Script:ModCategoryMap[$b] } else { $null }
		switch ($cat) {
			"Style"      { $preStyle += $b }
			"Function"   { $preFunction += $b }
			"AI" { $preMAX += $b }
		}
	}

	$currentPage = 0
	$pagesConfirmed = @($false) * $totalPages
	$selectedStyle = @()
	$selectedFunction = @()
	$selectedMAX = @()

	:pageLoop while ($true) {
		switch ($currentPage) {
			0 {
				Set-StepInfo 0 $totalPages $stepLabels
				$Script:PagesConfirmed = $pagesConfirmed
				$preselected = if ($pagesConfirmed[0]) { $selectedStyle } else { $preStyle }
				$confirmedBases = if ($pagesConfirmed[0]) { $selectedStyle } else { @() }
				$result = Show-SelectCategory `
					-CategoryKey "style_title" `
					-IntroKey "style_intro" `
					-Mods $Mods.Style `
					-PreselectedBases $preselected `
					-ConfirmedBases $confirmedBases `
					-DefaultAll $false `
					-AllowLeft $true
				if ($null -eq $result) { return $null }
				$selectedStyle = $result
				$pagesConfirmed[0] = $true
				$currentPage = 1
			}
			1 {
				Set-StepInfo 1 $totalPages $stepLabels
				$Script:PagesConfirmed = $pagesConfirmed
				$preselected = if ($pagesConfirmed[1]) { $selectedFunction } else { $preFunction }
				$confirmedBases = if ($pagesConfirmed[1]) { $selectedFunction } else { @() }
				$result = Show-SelectCategory `
					-CategoryKey "function_title" `
					-IntroKey "function_intro" `
					-Mods $Mods.Function `
					-PreselectedBases $preselected `
					-ConfirmedBases $confirmedBases `
					-DefaultAll $false `
					-AllowLeft $true
				if ($null -eq $result) { $currentPage = 0; continue }
				$selectedFunction = $result
				$pagesConfirmed[1] = $true
				$currentPage = 2
			}
			2 {
				# AI consent page — skip consent if AI already installed
				Set-StepInfo 2 $totalPages $stepLabels
				$Script:PagesConfirmed = $pagesConfirmed

				$hasAI = $false
				if ($State.JsMods) {
					$aiBases = @("ModConfig", "AskOnPage", "Diabar", "TidyTabs", "TidyAddress", "TidyDownloads", "TidyTitles", "VividAI", "VividMarkdown")
					foreach ($f in $State.JsMods) {
						$base = [IO.Path]::GetFileNameWithoutExtension($f)
						if ($aiBases -contains $base) { $hasAI = $true; break }
					}
				}

				if ($hasAI) {
					# AI already installed — skip consent, go directly to AI selection
					$currentPage = 3
				} else {
					# No AI installed — show consent
					$consentCursor = 0
					$consentDone = $false
					while (-not $consentDone) {
						$sb = [Text.StringBuilder]::new()
						[void]$sb.AppendLine()
						[void]$sb.AppendLine((Format-StepBar))
						[void]$sb.AppendLine()
						[void]$sb.AppendLine("  $e[1m$(tr ai_consent_title)$e[0m")
						[void]$sb.AppendLine()
						[void]$sb.AppendLine("  $e[37m$(tr ai_consent_text)$e[0m")
						[void]$sb.AppendLine()

						$acceptPrefix = if ($consentCursor -eq 0) { "  $e[1;36m>$e[0m" } else { "   " }
						$acceptMarker = if ($consentCursor -eq 0) { "O" } else { " " }
						[void]$sb.AppendLine("$acceptPrefix [$acceptMarker] $e[1m$(tr ai_consent_accept)$e[0m")

						$declinePrefix = if ($consentCursor -eq 1) { "  $e[1;36m>$e[0m" } else { "   " }
						$declineMarker = if ($consentCursor -eq 1) { "O" } else { " " }
						[void]$sb.AppendLine("$declinePrefix [$declineMarker] $e[1m$(tr ai_consent_decline)$e[0m")

						[void]$sb.AppendLine()
						[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")
						[void]$sb.AppendLine("    $(Build-KeyHint @((tr key_nav_confirm), (tr key_left_back), (tr key_exit)))")

						Write-FrameContent $sb.ToString()

						$key = Read-TuiKey
						switch ($key) {
							'UP'    { $consentCursor = [Math]::Max(0, $consentCursor - 1) }
							'DOWN'  { $consentCursor = [Math]::Min(1, $consentCursor + 1) }
							'ENTER' { $consentDone = $true }
							'LEFT'  { $currentPage = 1; continue pageLoop }
							'Q'     { Exit-Installer }
							'LANG' { Toggle-Lang }
							'ESC'   { Exit-Installer }
						}
					}

					if ($consentCursor -eq 0) {
						# Accept — go to AI selection
						$currentPage = 3
					} else {
						# Decline — skip AI, go to confirm
						$selectedMAX = @()
						$pagesConfirmed[2] = $true
						$pagesConfirmed[3] = $true
						$pagesConfirmed[4] = $true
						$currentPage = 5
					}
				}
			}
			3 {
				Set-StepInfo 2 $totalPages $stepLabels
				$Script:PagesConfirmed = $pagesConfirmed
				$preselected = if ($pagesConfirmed[3]) { $selectedMAX } else { $preMAX }
				$confirmedBases = if ($pagesConfirmed[3]) { $selectedMAX } else { @() }
				$result = Show-SelectCategory `
					-CategoryKey "ai_title" `
					-IntroKey "ai_intro" `
					-Mods $Mods.AI `
					-PreselectedBases $preselected `
					-ConfirmedBases $confirmedBases `
					-DefaultAll $false `
					-AllowLeft $true
				if ($null -eq $result) { $currentPage = 2; continue }
				$selectedMAX = $result
				$pagesConfirmed[3] = $true
				$currentPage = 4
				$allSelected = @($selectedStyle) + @($selectedFunction) + @($selectedMAX) | Select-Object -Unique
				# Exclude silent install mods from diff — they're always deployed, not user-selectable
				$visibleInstalled = $allInstalled | Where-Object { $Script:SilentInstall -notcontains $_ }
			}
			4 {
				# Provider selection page
				# Skip if no AI mods selected
				if ($selectedMAX.Count -eq 0) {
					$pagesConfirmed[4] = $true
					$Script:ProviderConfig = $null
					$currentPage = 5; continue
				}

				Set-StepInfo 3 $totalPages $stepLabels
				$Script:PagesConfirmed = $pagesConfirmed

				$providerCursor = 0
				$providerDone = $false
				$providerItems = @($null) + $Script:ProviderDefs
				$providerCount = $providerItems.Count

				while (-not $providerDone) {
					$sb = [Text.StringBuilder]::new()
					[void]$sb.AppendLine()
					[void]$sb.AppendLine((Format-StepBar))
					[void]$sb.AppendLine()
					[void]$sb.AppendLine("  $e[1m$(tr provider_title)$e[0m")
					[void]$sb.AppendLine("  $e[37m$(tr provider_intro)$e[0m")
					[void]$sb.AppendLine()

					for ($i = 0; $i -lt $providerCount; $i++) {
						$prefix = if ($providerCursor -eq $i) { "  $e[1;36m>$e[0m" } else { "   " }
						$marker = if ($providerCursor -eq $i) { "O" } else { " " }
						if ($i -eq 0) {
							[void]$sb.AppendLine("$prefix [$marker] $e[33m$(tr provider_skip)$e[0m")
							[void]$sb.AppendLine("          $e[90m$(tr provider_skip_hint)$e[0m")
						} else {
							$def = $providerItems[$i]
							$label = if ($def.Label) { $def.Label } else { $def.Key }
							[void]$sb.AppendLine("$prefix [$marker] $e[1m$label$e[0m")
						}
					}

					[void]$sb.AppendLine()
					[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")
					[void]$sb.AppendLine("    $(Build-KeyHint @((tr key_nav_confirm), (tr key_left_back), (tr key_exit)))")

					Write-FrameContent $sb.ToString()

					$key = Read-TuiKey
					switch ($key) {
						'UP'    { $providerCursor = [Math]::Max(0, $providerCursor - 1) }
						'DOWN'  { $providerCursor = [Math]::Min($providerCount - 1, $providerCursor + 1) }
						'ENTER' { $providerDone = $true }
						'LEFT'  { $currentPage = 3; continue pageLoop }
						'Q'     { Exit-Installer }
						'LANG' { Toggle-Lang }
						'ESC'   { Exit-Installer }
					}
				}

				if ($providerCursor -eq 0) {
					$Script:ProviderConfig = $null
					$pagesConfirmed[4] = $true
					$currentPage = 5
				} else {
					$selectedDef = $providerItems[$providerCursor]
					$provEndpoint = $selectedDef.Endpoint
					$provLabel = if ($selectedDef.Label) { $selectedDef.Label } else { $selectedDef.Key }

					if ($selectedDef.Key -eq 'custom') {
						$nameDone = $false
						while (-not $nameDone) {
							Clear-ContentArea
							Write-Host "`n  $e[1m$(tr provider_custom_name)$e[0m"
							$customName = Read-Host "  "
							if ($customName) { $provLabel = $customName; $nameDone = $true }
						}
						$epDone = $false
						while (-not $epDone) {
							Clear-ContentArea
							Write-Host "`n  $e[1m$(tr provider_custom_endpoint)$e[0m"
							$customEndpoint = Read-Host "  "
							if ($customEndpoint) { $provEndpoint = $customEndpoint; $epDone = $true }
						}
					}

					Clear-ContentArea
					Write-Host "`n  $e[1m$(trf provider_enter_key $provLabel)$e[0m"
					Write-Host "  $e[90m$(tr provider_key_placeholder)$e[0m"
					$apiKey = Read-Host "  "

					$Script:ProviderConfig = @{
						Provider = $selectedDef.Key
						ApiKey   = $apiKey
						Endpoint = $provEndpoint
					}
					$pagesConfirmed[4] = $true
					$currentPage = 5
				}
			}
			5 {
				# Confirm page
				$allSelected = @($selectedStyle) + @($selectedFunction) + @($selectedMAX) | Select-Object -Unique
				$allMods = @($Mods.Style) + @($Mods.Function) + @($Mods.AI)

				$finalCSS = @()
				$finalJS  = @()
				# Silent install mods (always included)
				foreach ($f in $Mods.AllJsFiles) {
					$base = [IO.Path]::GetFileNameWithoutExtension($f)
					if ($Script:SilentInstall -contains $base) { $finalJS += $f }
				}
				foreach ($f in $Mods.AllCssFiles) {
					$base = [IO.Path]::GetFileNameWithoutExtension($f)
					if ($Script:SilentInstall -contains $base) { $finalCSS += $f }
				}
				# User-selected mods
				foreach ($m in $allMods) {
					if ($allSelected -contains $m.BaseName) {
						if ($m.CssFile) { $finalCSS += $m.CssFile }
						if ($m.JsFile) { $finalJS += $m.JsFile }
					}
				}
				$finalCSS = $finalCSS | Select-Object -Unique
				$finalJS  = $finalJS  | Select-Object -Unique

				$newBases = $allSelected | Where-Object { $_ -notin $visibleInstalled }
				$removedBases = $visibleInstalled | Where-Object { $_ -notin $allSelected }
				$unchangedBases = $allSelected | Where-Object { $_ -in $visibleInstalled }

				Set-StepInfo 4 $totalPages $stepLabels
				$Script:PagesConfirmed = $pagesConfirmed

				$confirmDone = $false
				$confirmBack = $false
				while (-not $confirmDone) {
					$sb = [Text.StringBuilder]::new()
					[void]$sb.AppendLine()
					[void]$sb.AppendLine((Format-StepBar))
					[void]$sb.AppendLine()
					[void]$sb.AppendLine("  $e[1m$(tr manage_confirm_title)$e[0m")
					[void]$sb.AppendLine()

					$hasChanges = ($newBases.Count -gt 0 -or $removedBases.Count -gt 0)

					if ($newBases.Count -gt 0) {
						[void]$sb.AppendLine("  $e[32m$(tr manage_new_mods) ($($newBases.Count)):$e[0m")
						foreach ($b in $newBases) { [void]$sb.AppendLine("    $e[32m+ $b$e[0m") }
					}
					if ($removedBases.Count -gt 0) {
						[void]$sb.AppendLine("  $e[31m$(tr manage_removed_mods) ($($removedBases.Count)):$e[0m")
						foreach ($b in $removedBases) { [void]$sb.AppendLine("    $e[31m- $b$e[0m") }
					}
					if ($unchangedBases.Count -gt 0) {
						[void]$sb.AppendLine("  $e[37m$(tr manage_unchanged_mods) ($($unchangedBases.Count)): $($unchangedBases -join ', ')$e[0m")
					}
					if (-not $hasChanges) {
						[void]$sb.AppendLine("  $e[37m$(tr manage_no_changes)$e[0m")
					}
					# Provider info
					if ($null -ne $Script:ProviderConfig) {
						[void]$sb.AppendLine("  $e[33m$(tr step_provider)$e[0m: $($Script:ProviderConfig.Provider)")
					} else {
						[void]$sb.AppendLine("  $e[90m$(tr step_provider)$e[0m: $e[90mOpenRouter (default)$e[0m")
					}

					[void]$sb.AppendLine()
					[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")
					[void]$sb.AppendLine("    $e[37m$(tr confirm_deploy_hint)$e[0m")

					Write-FrameContent $sb.ToString()

					$key = Read-TuiKey
					switch ($key) {
						'ENTER' {
							if (-not $hasChanges) { continue }
							$confirmDone = $true
						}
						'LEFT'  { $currentPage = 4; $confirmDone = $true; $confirmBack = $true }
						'RIGHT' { }
						'Q'     { Exit-Installer }
						'LANG' { Toggle-Lang }
						'ESC'   { Exit-Installer }
					}
				}

				if ($confirmBack) {
					$pagesConfirmed[5] = $false; continue
				}
				break pageLoop
			}
		}
	}

	# Permission check
	if (-not (Test-Writable $Target.VivaldiDir)) {
		$sb = [Text.StringBuilder]::new()
		[void]$sb.AppendLine()
		[void]$sb.AppendLine("  $e[1;31m$(tr error_permission)$e[0m")
		[void]$sb.AppendLine("  $(tr target_path): $($Target.VivaldiDir)")
		if ($Target.IsSystem) {
			[void]$sb.AppendLine("  $e[37m$(tr error_admin_required)$e[0m")
			[void]$sb.AppendLine()
			[void]$sb.AppendLine("  $e[1;33m$(tr elevate_prompt)$e[0m")
			Write-FrameContent $sb.ToString()
			$key = Read-TuiKey
			if ($key -eq 'ENTER') {
				$scriptPath = if ($PSCommandPath) { $PSCommandPath } else { (Get-Command $MyInvocation.MyCommand.Name).Source }
				Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File ``"$scriptPath``"" -Verb RunAs
				Exit-Installer
			}
			Exit-Installer
		} else {
			[void]$sb.AppendLine()
			[void]$sb.AppendLine("  $e[37m$(tr key_exit)$e[0m")
			Write-FrameContent $sb.ToString()
			Read-TuiKey | Out-Null
		}
		return $null
	}

	# Apply changes
	$sb = [Text.StringBuilder]::new()
	[void]$sb.AppendLine()
	[void]$sb.AppendLine("  $e[1m$(tr manage_applying)$e[0m")
	[void]$sb.AppendLine("  $(tr target_path): $($Target.VivaldiDir)")
	[void]$sb.AppendLine()
	Write-FrameContent $sb.ToString()

	$vivaldiDir = $Target.VivaldiDir
	$userCssDir = Join-Path $vivaldiDir "user_mods\css"
	$userJsDir  = Join-Path $vivaldiDir "user_mods\js"

	$cssToRemove = @($State.CssMods | Where-Object { [IO.Path]::GetFileNameWithoutExtension($_) -in $removedBases })
	$jsToRemove  = @($State.JsMods  | Where-Object { [IO.Path]::GetFileNameWithoutExtension($_) -in $removedBases })

	foreach ($mod in $cssToRemove) {
		$path = Join-Path $userCssDir $mod
		if (Test-Path $path) { Remove-Item $path -Force; Write-Host "  $e[31m- $mod$e[0m" }
	}
	foreach ($mod in $jsToRemove) {
		$path = Join-Path $userJsDir $mod
		if (Test-Path $path) { Remove-Item $path -Force; Write-Host "  $e[31m- $mod$e[0m" }
	}

	Deploy-ModFiles -SourceDir $SourceDir -VivaldiDir $vivaldiDir -PersistentDir $Target.PersistentDir -CssMods $finalCSS -JsMods $finalJS
	Write-ProviderSeed -VivaldiDir $vivaldiDir
	Invoke-HtmlInjection -VivaldiDir $vivaldiDir
Test-WindowHtmlFormat -VivaldiDir $vivaldiDir

	Write-Host ""
	Write-Host "$e[1;32m" + ("=" * 52) + "$e[0m"
	Write-Host "  $e[1;32m$(tr deploy_success)$e[0m"
	Write-Host "$e[1;32m" + ("=" * 52) + "$e[0m"

	return @{ CSS = $finalCSS; JS = $finalJS }
}

# ============================================================
#  14b. AI-Only Install / Uninstall Flow
# ============================================================

function Invoke-AIOnlyFlow {
	param(
		[string]$SourceDir,
		[hashtable]$Target,
		[object]$Mods,
		[hashtable]$State,
		[bool]$Uninstall = $false
	)

	$e = [char]27
	$totalPages = 2
	$stepLabels = @("step_ai", "step_provider")

	if ($Uninstall) {
		# ── Uninstall AI modules ──
		# Confirm
		Clear-ContentArea
		$lines = @("", "  $e[1;33m$(tr ai_uninstall_confirm)$e[0m", "", "  $(tr key_nav_confirm)")
		Write-FrameContent ($lines -join "`n")
		$key = Read-TuiKey
		if ($key -ne 'ENTER') { return $false }

		$aiBases = @("ModConfig", "AskOnPage", "Diabar", "TidyTabs", "TidyAddress", "TidyDownloads", "TidyTitles", "VividAI", "VividMarkdown")
		$userJsDir = Join-Path $Target.VivaldiDir "user_mods\JS"
		$removed = @()
		foreach ($f in $State.JsMods) {
			$base = [IO.Path]::GetFileNameWithoutExtension($f)
			if ($aiBases -contains $base) {
				$filePath = Join-Path $userJsDir $f
				if (Test-Path $filePath) { Remove-Item -LiteralPath $filePath -Force }
				$removed += $f
			}
		}

		# Update state
		$vivaldiDir = $Target.VivaldiDir
		$persist = if (Test-Path (Join-Path $vivaldiDir "user_mods\.volante.json")) {
			Get-InstallState -VivaldiDir $vivaldiDir
		} else { $null }
		if ($persist) {
			$newJS = @($persist.JsMods | Where-Object { $aiBases -notcontains ([IO.Path]::GetFileNameWithoutExtension($_)) })
			$newState = @{
				version      = $persist.Version
				installed_at = (Get-Date -Format "o")
				git_commit   = $persist.GitCommit
				css_mods     = $persist.CssMods
				js_mods      = $newJS
			}
			$statePath = Join-Path $vivaldiDir "user_mods\.volante.json"
			$newState | ConvertTo-Json | Set-Content -Path $statePath
		}

		Clear-ContentArea
		Write-Host "`n  $e[1;32m$(trf ai_uninstall_done $removed.Count)$e[0m`n"
		Write-Host "  $(tr key_nav_confirm)"
		ReadKey
		return $false
	} else {
		# ── Install AI modules ──
		Set-StepInfo 0 $totalPages $stepLabels
		$preselected = @()
		$result = Show-SelectCategory `
			-CategoryKey "ai_title" `
			-IntroKey "ai_intro" `
			-Mods $Mods.AI `
			-PreselectedBases $preselected `
			-ConfirmedBases @() `
			-DefaultAll $true `
			-AllowLeft $true

		if ($null -eq $result) { return $false }

		if ($result.Count -eq 0) {
			Clear-ContentArea
			Write-Host "`n  $(tr confirm_no_changes)`n"
			Write-Host "  $(tr key_nav_confirm)"
			ReadKey
			return $false
		}

		# Provider selection
		Set-StepInfo 1 $totalPages $stepLabels
		$providerCursor = 0
		$providerDone = $false
		$providerItems = @($null) + $Script:ProviderDefs
		$providerCount = $providerItems.Count

		while (-not $providerDone) {
			$sb = [Text.StringBuilder]::new()
			[void]$sb.AppendLine()
			[void]$sb.AppendLine((Format-StepBar))
			[void]$sb.AppendLine()
			[void]$sb.AppendLine("  $e[1m$(tr provider_title)$e[0m")
			[void]$sb.AppendLine("  $e[37m$(tr provider_intro)$e[0m")
			[void]$sb.AppendLine()

			for ($i = 0; $i -lt $providerCount; $i++) {
				$prefix = if ($providerCursor -eq $i) { "  $e[1;36m>$e[0m" } else { "   " }
				$marker = if ($providerCursor -eq $i) { "O" } else { " " }
				if ($i -eq 0) {
					[void]$sb.AppendLine("$prefix [$marker] $e[33m$(tr provider_skip)$e[0m")
					[void]$sb.AppendLine("          $e[90m$(tr provider_skip_hint)$e[0m")
				} else {
					$def = $providerItems[$i]
					$label = if ($def.Label) { $def.Label } else { $def.Key }
					[void]$sb.AppendLine("$prefix [$marker] $e[1m$label$e[0m")
				}
			}

			[void]$sb.AppendLine()
			[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")
			[void]$sb.AppendLine("    $(Build-KeyHint @((tr key_nav_confirm), (tr key_left_back), (tr key_exit)))")

			Write-FrameContent $sb.ToString()

			$key = Read-TuiKey
			switch ($key) {
				'UP'    { $providerCursor = [Math]::Max(0, $providerCursor - 1) }
				'DOWN'  { $providerCursor = [Math]::Min($providerCount - 1, $providerCursor + 1) }
				'ENTER' { $providerDone = $true }
				'LEFT'  { return $false }
				'Q'     { Exit-Installer }
				'LANG' { Toggle-Lang }
				'ESC'   { Exit-Installer }
			}
		}

		if ($providerCursor -eq 0) {
			$Script:ProviderConfig = $null
		} else {
			$selectedDef = $providerItems[$providerCursor]
			$provEndpoint = $selectedDef.Endpoint
			$provLabel = if ($selectedDef.Label) { $selectedDef.Label } else { $selectedDef.Key }

			if ($selectedDef.Key -eq 'custom') {
				$nameDone = $false
				while (-not $nameDone) {
					Clear-ContentArea
					Write-Host "`n  $e[1m$(tr provider_custom_name)$e[0m"
					$customName = Read-Host "  "
					if ($customName) { $provLabel = $customName; $nameDone = $true }
				}
				$epDone = $false
				while (-not $epDone) {
					Clear-ContentArea
					Write-Host "`n  $e[1m$(tr provider_custom_endpoint)$e[0m"
					$customEndpoint = Read-Host "  "
					if ($customEndpoint) { $provEndpoint = $customEndpoint; $epDone = $true }
				}
			}

			Clear-ContentArea
			Write-Host "`n  $e[1m$(trf provider_enter_key $provLabel)$e[0m"
			Write-Host "  $e[90m$(tr provider_key_placeholder)$e[0m"
			$apiKey = Read-Host "  "

			$Script:ProviderConfig = @{
				Provider = $selectedDef.Key
				ApiKey   = $apiKey
				Endpoint = $provEndpoint
			}
		}

		# Deploy selected AI JS files
		$vivaldiDir = $Target.VivaldiDir
		$userJsDir = Join-Path $vivaldiDir "user_mods\JS"
		if (-not (Test-Path $userJsDir)) { New-Item -ItemType Directory -Path $userJsDir -Force | Out-Null }

		$cssFiles = @()
		$jsFiles = @()
		foreach ($base in $result) {
			if ($Script:ModJsFiles.ContainsKey($base)) { $jsFiles += $Script:ModJsFiles[$base] }
			if ($Script:ModCssFiles.ContainsKey($base)) { $cssFiles += $Script:ModCssFiles[$base] }
		}
		# Always include silent AI mods
		foreach ($silentBase in $Script:SilentInstall) {
			if ($Script:ModJsFiles.ContainsKey($silentBase) -and ($jsFiles -notcontains $Script:ModJsFiles[$silentBase])) { $jsFiles += $Script:ModJsFiles[$silentBase] }
			if ($Script:ModCssFiles.ContainsKey($silentBase) -and ($cssFiles -notcontains $Script:ModCssFiles[$silentBase])) { $cssFiles += $Script:ModCssFiles[$silentBase] }
		}

		$deployedJs = Deploy-ModFiles -SourceDir $SourceDir -VivaldiDir $vivaldiDir -FileNames $jsFiles -SubDir "JS" -Extension ".js"
		$deployedCSS = Deploy-ModFiles -SourceDir $SourceDir -VivaldiDir $vivaldiDir -FileNames $cssFiles -SubDir "CSS" -Extension ".css"
		Write-ProviderSeed -VivaldiDir $vivaldiDir

		# Update state — merge with existing mods
		$persist = Get-InstallState -VivaldiDir $vivaldiDir
		if ($persist) {
			$mergedJS = @($persist.JsMods) + @($deployedJs | Where-Object { $persist.JsMods -notcontains $_ })
			$mergedCSS = @($persist.CssMods) + @($deployedCSS | Where-Object { $persist.CssMods -notcontains $_ })
			$newState = @{
				version      = $persist.Version
				installed_at = (Get-Date -Format "o")
				git_commit   = $persist.GitCommit
				css_mods     = $mergedCSS
				js_mods      = $mergedJS
			}
			$statePath = Join-Path $vivaldiDir "user_mods\.volante.json"
			$newState | ConvertTo-Json | Set-Content -Path $statePath
		}

		Clear-ContentArea
		$aiCount = $result.Count
		Write-Host "`n  $e[1;32m$(trf ai_install_done $aiCount)$e[0m`n"
		Write-Host "  $(tr key_nav_confirm)"
		ReadKey
		return $true
	}
}

# ============================================================
#  15.  Persistent Storage
# ============================================================

function Find-PersistentMods {
	param([string]$PersistentDir)

	if (-not (Test-Path $PersistentDir)) { return $null }

	$versions = Get-ChildItem -Directory -Path $PersistentDir -ErrorAction SilentlyContinue |
		Where-Object { $_.Name -match '^\d+\.\d+' } |
		Sort-Object { [version]$_.Name } -Descending

	foreach ($verDir in $versions) {
		$stateFile = Join-Path $verDir.FullName ".volante.json"
		if (Test-Path $stateFile) {
			try {
				$json = Get-Content -Raw -Path $stateFile | ConvertFrom-Json
				return @{
					Version   = $verDir.Name
					CssMods   = @($json.css_mods)
					JsMods    = @($json.js_mods)
					CssDir    = Join-Path $verDir.FullName "css"
					JsDir     = Join-Path $verDir.FullName "js"
					StateFile = $stateFile
				}
			} catch {}
		}
	}
	return $null
}

function Restore-FromPersistence {
	param(
		[string]$VivaldiDir,
		[hashtable]$PersistentState
	)

	Write-Host (tr restore_copying)

	$userCssDir = Join-Path $VivaldiDir "user_mods\css"
	$userJsDir  = Join-Path $VivaldiDir "user_mods\js"
	$null = New-Item -ItemType Directory -Force -Path $userCssDir
	$null = New-Item -ItemType Directory -Force -Path $userJsDir

	$cssCount = 0
	$jsCount = 0

	foreach ($mod in $PersistentState.CssMods) {
		$src = Join-Path $PersistentState.CssDir $mod
		if (Test-Path $src) {
			Copy-Item -Path $src -Destination (Join-Path $userCssDir $mod) -Force
			$cssCount++
		}
	}

	foreach ($mod in $PersistentState.JsMods) {
		$src = Join-Path $PersistentState.JsDir $mod
		if (Test-Path $src) {
			Copy-Item -Path $src -Destination (Join-Path $userJsDir $mod) -Force
			$jsCount++
		}
	}

	$persistImport = Join-Path $PersistentState.CssDir "Import.css"
	if (Test-Path $persistImport) {
		Copy-Item -Path $persistImport -Destination (Join-Path $userCssDir "Import.css") -Force
	}

	$verName = (Get-Item (Split-Path (Split-Path (Split-Path (Split-Path $VivaldiDir))))).Name
	$state = @{
		version      = $verName
		installed_at = (Get-Date -Format "o")
		css_mods     = @($PersistentState.CssMods)
		js_mods      = @($PersistentState.JsMods)
	}
	$statePath = Join-Path $VivaldiDir "user_mods\.volante.json"
	$state | ConvertTo-Json | Set-Content -Path $statePath

	Write-Host (trf restore_done $cssCount $jsCount)
}

# ============================================================
#  16.  Main Entry Point
# ============================================================

function Main {
	Show-Banner
	[Console]::CursorVisible = $false

	# ── Discover and select target ──
	$installations = Find-VivaldiInstallations
	if ($installations.Count -eq 0) {
		Write-Host "`n$(tr target_none_found)"
		[Console]::CursorVisible = $true
		return
	}

	$targetItems = @()
	foreach ($inst in $installations) {
		$targetItems += @{
			Label      = "$($inst.DisplayName)  $($inst.Version)"
			DetailData = @{ VivaldiDir = $inst.VivaldiDir; IsSystem = $inst.IsSystem }
			Install    = $inst
		}
	}

	$stepLabels = @('step_target')
	Set-StepInfo 0 1 $stepLabels
	$selectedIdx = Show-SelectSingle `
		-TitleKey "target_title" `
		-Items $targetItems `
		-AllowLeft $false
	if ($null -eq $selectedIdx) { Exit-Installer }

	$target = $targetItems[$selectedIdx].Install

	# ---- Elevate early if system install ----
	if ($target.IsSystem -and -not (Test-IsAdmin)) {
		$e = [char]27
		$sb = [Text.StringBuilder]::new()
		[void]$sb.AppendLine()
		[void]$sb.AppendLine("  $e[1;33m$($target.DisplayName) is installed system-wide.$e[0m")
		[void]$sb.AppendLine("  $(tr target_path): $($target.VivaldiDir)")
		[void]$sb.AppendLine("  $e[37m$(tr error_admin_required)$e[0m")
		[void]$sb.AppendLine()
		[void]$sb.AppendLine("  $e[1m$(tr elevate_prompt)$e[0m")
		Write-FrameContent $sb.ToString()
		$key = Read-TuiKey
		if ($key -eq 'ENTER') {
			$scriptPath = if ($PSCommandPath) { $PSCommandPath } else { (Get-Command $MyInvocation.MyCommand.Name).Source }
			Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`"" -Verb RunAs
		}
		Exit-Installer
	}

	$isInstalled = Test-IsInstalled -VivaldiDir $target.VivaldiDir
	$state = Get-InstallState -VivaldiDir $target.VivaldiDir

	# Check cross-version restore
	$persistentState = $null
	if (-not $isInstalled) {
		$persistentState = Find-PersistentMods -PersistentDir $target.PersistentDir
	}

	# ── Dispatch ──
	:dispatch while ($true) {
	if ($isInstalled -and $state) {
		# Already installed: show manage/update/uninstall/exit
		while ($true) {
			$action = Show-EntryMenu -IsInstalled $true -State $state
			if ($action -eq "back") {
				$selectedIdx = Show-SelectSingle `
					-TitleKey "target_title" `
					-Items $targetItems `
					-AllowLeft $false
				if ($null -eq $selectedIdx) { Exit-Installer }
				$target = $targetItems[$selectedIdx].Install
				$isInstalled = Test-IsInstalled -VivaldiDir $target.VivaldiDir
				$state = Get-InstallState -VivaldiDir $target.VivaldiDir
				if (-not $isInstalled -or -not $state) { continue dispatch }
				continue
			}

			$result = $null
			switch ($action) {
				"manage" {
					$ms = Ensure-ModSource; if (-not $ms) { return }
					$sourceDir = $ms.SourceDir; $mods = $ms.Mods
					$result = Invoke-ManageFlow -SourceDir $sourceDir -Target $target -Mods $mods -State $state
				}
				"update" {
					$ms = Ensure-ModSource; if (-not $ms) { return }
					$sourceDir = $ms.SourceDir
					Invoke-Update -SourceDir $sourceDir -Target $target -State $state
					$result = $true
				}
				"ai_install" {
					$ms = Ensure-ModSource; if (-not $ms) { return }
					$sourceDir = $ms.SourceDir; $mods = $ms.Mods
					$result = Invoke-AIOnlyFlow -SourceDir $sourceDir -Target $target -Mods $mods -State $state -Uninstall $false
				}
				"ai_uninstall" {
					$ms = Ensure-ModSource; if (-not $ms) { return }
					$sourceDir = $ms.SourceDir; $mods = $ms.Mods
					$result = Invoke-AIOnlyFlow -SourceDir $sourceDir -Target $target -Mods $mods -State $state -Uninstall $true
				}
				"uninstall" {
					Invoke-Uninstall -Target $target -State $state
				}
				"dev_install" {
					$sourceDir = $Script:SourceDir
					if (-not $sourceDir -or -not (Test-Path $sourceDir)) {
						$ms = Ensure-ModSource; if (-not $ms) { return }
						$sourceDir = $ms.SourceDir
					}
					Invoke-DevModsFlow -SourceDir $sourceDir -Target $target
				}
				"exit" {
					Exit-Installer
				}
			}
			if ($result) { Invoke-PostInstall -Target $target -Success $true }
			# Refresh state after action
			$isInstalled = Test-IsInstalled -VivaldiDir $target.VivaldiDir
			$state = Get-InstallState -VivaldiDir $target.VivaldiDir
			if (-not $isInstalled -or -not $state) { continue dispatch }
			# Loop continues — menu will use refreshed state
		}
	} elseif ($persistentState) {
		# Vivaldi updated: offer restore
		Clear-ContentArea
		$e = [char]27
		Write-Host "`n$e[1;33m$(tr restore_detected)$e[0m`n"
		Write-Host "  $(trf restore_prompt $($persistentState.Version))`n"
		Write-Host "  $(trf entry_installed_count $($persistentState.CssMods.Count) $($persistentState.JsMods.Count))"
		Write-Host ""

		$restoreItems = @(
			@{ LabelKey = "restore_option"; Action = "restore" },
			@{ LabelKey = "restore_fresh";   Action = "fresh" }
		)

		$rc = 0; $rdone = $false
		while (-not $rdone) {
			$sb = [Text.StringBuilder]::new()
			[void]$sb.AppendLine()
			[void]$sb.AppendLine("  $(tr entry_choose_action)")
			[void]$sb.AppendLine()
			for ($i = 0; $i -lt $restoreItems.Count; $i++) {
				$prefix = if ($i -eq $rc) { "  >" } else { "   " }
				[void]$sb.AppendLine("$prefix $(tr $restoreItems[$i].LabelKey)")
			}
			[void]$sb.AppendLine()
			[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")
			[void]$sb.AppendLine("    $(tr key_enter_confirm) | $(tr key_exit)")
			Write-FrameContent $sb.ToString()

			$key = Read-TuiKey
			switch ($key) {
				'UP'    { $rc = [Math]::Max(0, $rc - 1) }
				'DOWN'  { $rc = [Math]::Min(1, $rc + 1) }
				'ENTER' { $rdone = $true }
				'Q'     { Exit-Installer }
				'LANG' { Toggle-Lang }
				'ESC'   { Exit-Installer }
			}
		}

		if ($restoreItems[$rc].Action -eq "restore") {
			$ms = Ensure-ModSource; if (-not $ms) { return }
			Backup-WindowHtml -VivaldiDir $target.VivaldiDir -PersistentDir $target.PersistentDir
			Restore-FromPersistence -VivaldiDir $target.VivaldiDir -PersistentState $persistentState
			$injectorSource = Join-Path $SourceDir "injectMods.js"
	if (-not (Test-Path $injectorSource)) { $injectorSource = Join-Path (Split-Path -Parent $SourceDir) "injectMods.js" }
			if (Test-Path $injectorSource) { Copy-Item -Path $injectorSource -Destination (Join-Path $target.VivaldiDir "injectMods.js") -Force }
			Invoke-HtmlInjection -VivaldiDir $target.VivaldiDir
			Test-WindowHtmlFormat -VivaldiDir $target.VivaldiDir
			Write-Host ""
			Write-Host "$e[1;32m" + ("=" * 52) + "$e[0m"
			Write-Host "  $e[1;32m$(tr deploy_success)$e[0m"
			Write-Host "$e[1;32m" + ("=" * 52) + "$e[0m"
			Invoke-PostInstall -Target $target
		} else {
			while ($true) {
				$action = Show-EntryMenu -IsInstalled $false
				if ($action -eq "back") {
					$selectedIdx = Show-SelectSingle -TitleKey "target_title" -Items $targetItems -AllowLeft $false
					if ($null -eq $selectedIdx) { Exit-Installer }
					$target = $targetItems[$selectedIdx].Install
					continue
				}
				if ($action -eq "install") {
					$ms = Ensure-ModSource; if (-not $ms) { return }
					$sourceDir = $ms.SourceDir; $mods = $ms.Mods
					$result = Invoke-InstallFlow -SourceDir $sourceDir -Target $target -Mods $mods
					if ($result) { Invoke-PostInstall -Target $target -Success $true }
					$isInstalled = Test-IsInstalled -VivaldiDir $target.VivaldiDir
					$state = Get-InstallState -VivaldiDir $target.VivaldiDir
					if ($isInstalled -and $state) { continue dispatch }
				} elseif ($action -eq "exit") {
					Exit-Installer
				}
			}
		}
	} else {
		# Not installed: show install/exit
		while ($true) {
			$action = Show-EntryMenu -IsInstalled $false
			if ($action -eq "back") {
				$selectedIdx = Show-SelectSingle -TitleKey "target_title" -Items $targetItems -AllowLeft $false
				if ($null -eq $selectedIdx) { Exit-Installer }
				$target = $targetItems[$selectedIdx].Install
				$isInstalled = Test-IsInstalled -VivaldiDir $target.VivaldiDir
				$state = Get-InstallState -VivaldiDir $target.VivaldiDir
				if ($isInstalled -and $state) { continue dispatch }
				continue
			}
			if ($action -eq "install") {
				$ms = Ensure-ModSource; if (-not $ms) { return }
				$sourceDir = $ms.SourceDir; $mods = $ms.Mods
				$result = Invoke-InstallFlow -SourceDir $sourceDir -Target $target -Mods $mods
				if ($result) { Invoke-PostInstall -Target $target -Success $true }
				$isInstalled = Test-IsInstalled -VivaldiDir $target.VivaldiDir
				$state = Get-InstallState -VivaldiDir $target.VivaldiDir
				if ($isInstalled -and $state) { continue dispatch }
			} elseif ($action -eq "exit") {
				Exit-Installer
			}
		}
	}
	} # dispatch

	[Console]::CursorVisible = $true
	Write-Host ""
}

# Run
try {
	Main
} catch {
	if ($_.Exception.Message -ne "###USER_EXIT###") {
		Write-Host "`nUnexpected error: $($_.Exception.Message)" -ForegroundColor Red
	}
} finally {
	[Console]::CursorVisible = $true
}
