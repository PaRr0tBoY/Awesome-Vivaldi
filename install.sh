#!/usr/bin/env bash
# ==UserScript==
# @name         Awesome Vivaldi Installer (macOS / Linux)
# @description  Zero-dependency TUI installer for Awesome Vivaldi modpack.
# @version      2026.7.14
# @author       Ryan (Acid)
# @website      https://github.com/PaRr0tBoY/Awesome-Vivaldi
# @usage        curl -fsSL https://raw.githubusercontent.com/PaRr0tBoY/Awesome-Vivaldi/main/install.sh | bash
# ==/UserScript==
#
# Requirements: bash 3.2+, curl, tput, grep, sed
set -euo pipefail

# ============================================================
#  0.  Bootstrap
# ============================================================

if [ "$0" = "bash" ] || [ "$0" = "-bash" ] || [ ! -f "$0" ]; then
    SCRIPT_DIR=""; REPO_ROOT=""
else
    SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
    REPO_ROOT="$SCRIPT_DIR"
fi
SOURCE_DIR=""; TEMP_DIR=""; BANNER_LINES=7; LAST_FRAME_LINES=0
ESC=$(printf '\033')
HEADLESS=${HEADLESS:-0}
KEY_SEQ=(); KEY_IDX=0
CRASH_LINE=0; CRASH_CMD=""
EXIT_FLAG_FILE="${TMPDIR:-/tmp}/awesome-vivaldi-exit.$$"
rm -f "$EXIT_FLAG_FILE"
FLOW_RESULT=""  # Used to signal back navigation from sub-flows

# Parse --headless flag before main
_parsed_args=()
while [ $# -gt 0 ]; do
    case "$1" in
        --headless) HEADLESS=1 ;;
        --key-seq)  IFS=',' read -ra KEY_SEQ <<< "$2"; shift ;;
        *) _parsed_args+=("$1") ;;
    esac
    shift
done
[ ${#_parsed_args[@]} -gt 0 ] && set -- "${_parsed_args[@]}" || set --
unset _parsed_args

on_err() { CRASH_LINE="$LINENO"; CRASH_CMD="$BASH_COMMAND"; }
trap on_err ERR

# Safe terminal output: try /dev/tty, fall back to stdout
tty_printf() { [ "$HEADLESS" = "1" ] && return 0; { printf "$@" > /dev/tty; } 2>/dev/null || printf "$@"; }

cleanup() {
    { [ -c /dev/tty ] && stty echo icanon < /dev/tty; } 2>/dev/null || true
    tput cnorm 2>/dev/null || true
    if [ "$EXIT_REQUESTED" = "1" ]; then
        :  # User-requested exit, no FATAL message
    elif [ "$CRASH_LINE" != "0" ]; then
        printf "\n[FATAL line %d] %s\n" "$CRASH_LINE" "$CRASH_CMD"
        tty_printf "\n${ESC}[1;31m[FATAL line %d] %s${ESC}[0m\n" "$CRASH_LINE" "$CRASH_CMD"
    else
        tty_printf "${ESC}[%d;0H${ESC}[0J${ESC}[H" "$((BANNER_LINES + 1))"
    fi
    [ -n "$TEMP_DIR" ] && [ -d "$TEMP_DIR" ] && rm -rf "$TEMP_DIR"
    rm -f "$EXIT_FLAG_FILE"
}
trap cleanup EXIT
EXIT_REQUESTED=0

_check_exit() { [ -f "$EXIT_FLAG_FILE" ] && exit 0 || return 0; }

is_local_mode() { [ -n "$REPO_ROOT" ] && [ -d "$REPO_ROOT/Vivaldi8.0Stable" ]; }

# ============================================================
#  1.  i18n — English primary, Chinese on L toggle
# ============================================================

UI_LANG="en"

toggle_lang() { if [ "$UI_LANG" = "zh" ]; then UI_LANG="en"; else UI_LANG="zh"; fi; }

tr() {
    if [ "$UI_LANG" = "zh" ]; then
        case "$1" in
            installer_title)          echo "Awesome Vivaldi : 社区模组包安装器" ;;
            entry_installed_title)    echo "Awesome Vivaldi 已安装" ;;
            entry_not_installed_title) echo "Awesome Vivaldi 尚未安装" ;;
            entry_choose_action)      echo "请选择操作:" ;;
            entry_install)            echo "安装" ;;
            entry_install_desc)       echo "选择并安装模组" ;;
            entry_manage)             echo "管理" ;;
            entry_manage_desc)        echo "增删模组" ;;
            entry_update)             echo "更新" ;;
            entry_update_desc)        echo "检查并应用模组更新" ;;
            entry_uninstall)          echo "卸载" ;;
            entry_uninstall_desc)     echo "移除部分或全部模组" ;;
            entry_exit)               echo "退出" ;;
            entry_exit_desc)          echo "退出安装器" ;;
            entry_installed_count)    echo "当前已安装: {0} 个 CSS 模组, {1} 个 JS 模组" ;;
            target_title)             echo "选择 Vivaldi 安装目标:" ;;
            target_path)              echo "路径" ;;
            target_type)              echo "类型" ;;
            target_type_system)       echo "系统级安装" ;;
            target_type_user)         echo "用户级安装" ;;
            target_none_found)        echo "未发现 Vivaldi 安装. 请先安装 Vivaldi 浏览器." ;;
            css_title)                echo "选择 CSS 模组" ;;
            css_locked_section)       echo "与 JS 模组联动 — 请在下一步选择" ;;
            css_locked_tag)           echo "(联动)" ;;
            js_title)                 echo "选择 JavaScript 模组" ;;
            js_bundled_section)       echo "-- 以下模组附带 CSS 模组: --" ;;
            js_bundled_arrow)         echo "CSS" ;;
            summary_title)            echo "安装确认" ;;
            summary_target)           echo "目标" ;;
            summary_css_mods)         echo "CSS 模组" ;;
            summary_js_mods)          echo "JS 模组" ;;
            confirm_deploy_hint)      echo "ENTER 部署 | LEFT/RIGHT 切换页面 | L 语言 | ESC/Q 退出" ;;
            manage_confirm_title)     echo "变更确认" ;;
            manage_new_mods)          echo "新增安装" ;;
            manage_removed_mods)      echo "将要卸载" ;;
            manage_unchanged_mods)    echo "保持不变" ;;
            manage_no_changes)        echo "没有变更. 无需操作." ;;
            update_title)             echo "更新模组" ;;
            update_checking)          echo "正在检查更新..." ;;
            update_available_title)   echo "有可用更新的模组" ;;
            update_no_updates)        echo "所有模组均为最新版本." ;;
            update_select)            echo "选择要更新的模组:" ;;
            update_confirm_title)     echo "确认更新" ;;
            update_updating)          echo "正在应用更新..." ;;
            update_updated_mod)       echo "已更新" ;;
            update_skipped)           echo "已跳过" ;;
            update_complete)          echo "更新完成! {0} 个模组已更新." ;;
            uninstall_title)          echo "卸载" ;;
            uninstall_type_prompt)    echo "选择卸载方式:" ;;
            uninstall_full)           echo "卸载整个整合包" ;;
            uninstall_full_desc)      echo "移除所有模组, 恢复 Vivaldi 初始状态" ;;
            uninstall_selective)      echo "卸载选定模组" ;;
            uninstall_selective_desc) echo "自行勾选要卸载的模组" ;;
            uninstall_full_confirm)   echo "这将移除所有模组并恢复 Vivaldi 初始状态. 确认继续?" ;;
            uninstall_cancelled)      echo "已取消卸载." ;;
            uninstall_restoring)      echo "正在恢复原始 window.html..." ;;
            uninstall_removing)       echo "正在移除模组文件..." ;;
            uninstall_complete)       echo "卸载完成. Vivaldi 已恢复初始状态." ;;
            uninstall_no_bak)         echo "未找到备份文件, 无法恢复原始 window.html." ;;
            uninstall_no_mods)        echo "未检测到 Awesome Vivaldi 安装. 无需卸载." ;;
            deploy_backup_start)      echo "正在备份 window.html..." ;;
            deploy_backup_done)       echo "已备份到" ;;
            deploy_inject_start)      echo "正在注入模组加载器..." ;;
            deploy_inject_done)       echo "已注入 injectMods.js" ;;
            deploy_inject_skip)       echo "injectMods.js 已存在, 跳过注入" ;;
            deploy_start)             echo "正在部署模组文件..." ;;
            deploy_css_done)          echo "{0} 个 CSS 模组已部署到 user_mods/css/" ;;
            deploy_js_done)           echo "{0} 个 JS 模组已部署到 user_mods/js/" ;;
            deploy_success)           echo "安装完成! 请重启 Vivaldi 以生效." ;;
            post_vivaldi_running)     echo "Vivaldi 正在运行." ;;
            post_restart_prompt)      echo "是否现在重启 Vivaldi? [Y] 是  [N] 否" ;;
            post_launch_prompt)       echo "是否现在启动 Vivaldi? [Y] 是  [N] 否" ;;
            post_restarting)          echo "正在重启 Vivaldi..." ;;
            restore_detected)         echo "Vivaldi 已更新! 发现旧版本模组配置." ;;
            restore_prompt)           echo "从版本 {0} 恢复模组?" ;;
            restore_option)           echo "是 — 恢复我的模组" ;;
            restore_fresh)            echo "否 — 全新安装" ;;
            restore_copying)          echo "正在从持久化存储恢复模组..." ;;
            restore_done)             echo "已从旧版本恢复 {0} CSS + {1} JS 模组." ;;
            error_admin_required)     echo "需要管理员权限." ;;
            error_download)           echo "错误: 无法下载模组包. 请检查网络连接." ;;
            error_extract)            echo "错误: 无法解压模组包." ;;
            error_no_source)          echo "错误: 找不到模组源文件." ;;
            error_permission)         echo "错误: 权限不足." ;;
            error_persist_write)      echo "警告: 持久化存储写入失败." ;;
            source_downloading)       echo "正在下载 Awesome Vivaldi 模组包..." ;;
            source_extracting)        echo "正在解压模组文件..." ;;
            source_done)              echo "模组文件准备就绪." ;;
            key_nav_confirm)          echo "UP/DOWN 导航 | ENTER 确认 | ESC/Q 退出" ;;
            key_multiselect)          echo "UP/DOWN 导航 | SPACE 勾选 | A 全选 | D 全不选" ;;
            key_confirm_back)         echo "ENTER 确认 | LEFT 返回" ;;
            key_lang)                 echo "L 语言" ;;
            key_exit)                 echo "ESC/Q 退出" ;;
            toggle_all)               echo "(全选/全不选)" ;;
            orphan_label)             echo "[孤儿模组]" ;;
            step_target)              echo "目标" ;;
            step_css)                 echo "CSS" ;;
            step_js)                  echo "JS" ;;
            step_confirm)             echo "确认" ;;
            # --- Mod descriptions ---
            mod_desc_AdaptiveBF)      echo "无用的前进/后退按钮自动隐藏" ;;
            mod_desc_BetterAnimation) echo "更平滑的页面橡皮筋回弹 + 标签栏收起动画" ;;
            mod_desc_BtnHoverAnime)   echo "工具栏按钮悬停微动效" ;;
            mod_desc_DownloadPanel)   echo "下载面板适配暗色主题" ;;
            mod_desc_Extensions)      echo "扩展菜单改为紧凑列表布局" ;;
            mod_desc_FavouriteTabs)   echo "前9个固定标签以网格展示 (Arc 风格)" ;;
            mod_desc_FindInPage)      echo "页内搜索栏改为浮动悬浮式" ;;
            mod_desc_LineBreak)       echo "长文本自动换行 (小屏幕实用)" ;;
            mod_desc_PeekTabbar)      echo "标签栏隐藏时鼠标触边滑出" ;;
            mod_desc_Quietify)        echo "静音图标淡化, 减少视觉干扰" ;;
            mod_desc_RemoveClutter)   echo "隐藏滚动条、分割线等视觉噪音" ;;
            mod_desc_TabsTrail)       echo "当前标签显示绿色指示条" ;;
            mod_desc_VivalArc)        echo "Arc 浏览器风格移植 (实验性)" ;;
            mod_desc_VividQC)         echo "快速命令面板样式美化" ;;
            mod_desc_TidyTabs_CSS)           echo "AI 分组标签的样式支持" ;;
            mod_desc_VividPlayer_CSS)        echo "Vivaldi 内置播放器美化" ;;
            mod_desc_VividToast_CSS)         echo "Toast 通知弹窗的样式" ;;
            mod_desc_PinnedTabRestore_CSS)   echo "固定标签恢复按钮样式" ;;
            mod_desc_InteractionFeedback_CSS) echo "按钮点击等交互反馈动效" ;;
            mod_desc_VividPeek_CSS)          echo "Arc Peek 弹出窗口样式" ;;
            mod_desc_ModConfig)              echo "*核心* 共享设置面板 (AI Key / 模组参数)" ;;
            mod_desc_AskOnPage)              echo "AI 侧边栏: 网页问答、摘要、改写" ;;
            mod_desc_AutoHidePanel)          echo "侧边栏鼠标离开后自动收起" ;;
            mod_desc_EasyFiles)              echo "附件拖拽时自动列出剪贴板+下载文件" ;;
            mod_desc_MonochromeIcons)        echo "Web 面板图标统一为单色风格" ;;
            mod_desc_QuickCapture)           echo "截图时自动识别并选中网页区域" ;;
            mod_desc_TabManager)             echo "工作区标签管理面板, 批量操作标签" ;;
            mod_desc_TidyAddress)            echo "AI 将地址栏 URL 改写为短标题" ;;
            mod_desc_TidyDownloads)          echo "AI 自动清理下载文件名中的乱码" ;;
            mod_desc_TidyTitles)             echo "AI 将标签标题精简为有意义的短语" ;;
            mod_desc_WorkspaceThemeSwitcher) echo "切换工作区时自动更换主题" ;;
            mod_desc_TidyTabs)               echo "AI 自动分组标签页" ;;
            mod_desc_VividPeek)              echo "Arc 风格弹出预览窗口" ;;
            mod_desc_VividPlayer)            echo "全局视频播放悬浮窗" ;;
            mod_desc_VividToast)             echo "Toast 风格通知弹窗" ;;
            mod_desc_PinnedTabRestore)       echo "右键恢复最近关闭的固定标签" ;;
            mod_desc_InteractionFeedback)    echo "按钮点击微动效反馈" ;;
            *) echo "$1" ;;
        esac
    else
        case "$1" in
            installer_title)          echo "Awesome Vivaldi : Community Modpack Installer" ;;
            entry_installed_title)    echo "Awesome Vivaldi is already installed" ;;
            entry_not_installed_title) echo "Awesome Vivaldi is not yet installed" ;;
            entry_choose_action)      echo "Choose an action:" ;;
            entry_install)            echo "Install" ;;
            entry_install_desc)       echo "Select and install mods" ;;
            entry_manage)             echo "Manage" ;;
            entry_manage_desc)        echo "Add or remove mods" ;;
            entry_update)             echo "Update" ;;
            entry_update_desc)        echo "Check for and apply mod updates" ;;
            entry_uninstall)          echo "Uninstall" ;;
            entry_uninstall_desc)     echo "Remove some or all mods" ;;
            entry_exit)               echo "Exit" ;;
            entry_exit_desc)          echo "Quit installer" ;;
            entry_installed_count)    echo "Currently installed: {0} CSS mods, {1} JS mods" ;;
            target_title)             echo "Select Vivaldi installation target:" ;;
            target_path)              echo "Path" ;;
            target_type)              echo "Type" ;;
            target_type_system)       echo "System-wide" ;;
            target_type_user)         echo "User install" ;;
            target_none_found)        echo "No Vivaldi installation found. Please install Vivaldi first." ;;
            css_title)                echo "Select CSS mods" ;;
            css_locked_section)       echo "Bundled with JS mods — select in next step" ;;
            css_locked_tag)           echo "(bundled)" ;;
            js_title)                 echo "Select JavaScript mods" ;;
            js_bundled_section)       echo "-- The following mods include CSS mods: --" ;;
            js_bundled_arrow)         echo "CSS" ;;
            summary_title)            echo "Installation Summary" ;;
            summary_target)           echo "Target" ;;
            summary_css_mods)         echo "CSS mods" ;;
            summary_js_mods)          echo "JS mods" ;;
            confirm_deploy_hint)      echo "ENTER to deploy | LEFT/RIGHT switch page | L lang | ESC/Q quit" ;;
            manage_confirm_title)     echo "Confirm Changes" ;;
            manage_new_mods)          echo "New mods to install" ;;
            manage_removed_mods)      echo "Mods to remove" ;;
            manage_unchanged_mods)    echo "Unchanged mods" ;;
            manage_no_changes)        echo "No changes detected. Nothing to do." ;;
            update_title)             echo "Update Mods" ;;
            update_checking)          echo "Checking for updates..." ;;
            update_available_title)   echo "Mods with updates available" ;;
            update_no_updates)        echo "All mods are up to date." ;;
            update_select)            echo "Select mods to update:" ;;
            update_confirm_title)     echo "Confirm Update" ;;
            update_updating)          echo "Applying updates..." ;;
            update_updated_mod)       echo "updated" ;;
            update_skipped)           echo "skipped" ;;
            update_complete)          echo "Update complete! {0} mods updated." ;;
            uninstall_title)          echo "Uninstall" ;;
            uninstall_type_prompt)    echo "Choose uninstall type:" ;;
            uninstall_full)           echo "Uninstall entire modpack" ;;
            uninstall_full_desc)      echo "Remove all mods, restore Vivaldi to original state" ;;
            uninstall_selective)      echo "Uninstall specific mods" ;;
            uninstall_selective_desc) echo "Choose which mods to remove" ;;
            uninstall_full_confirm)   echo "This will remove ALL mods and restore Vivaldi. Continue?" ;;
            uninstall_cancelled)      echo "Uninstall cancelled." ;;
            uninstall_restoring)      echo "Restoring original window.html..." ;;
            uninstall_removing)       echo "Removing mod files..." ;;
            uninstall_complete)       echo "Uninstall complete. Vivaldi is back to its original state." ;;
            uninstall_no_bak)         echo "Backup file not found. Cannot restore original window.html." ;;
            uninstall_no_mods)        echo "No Awesome Vivaldi installation detected. Nothing to uninstall." ;;
            deploy_backup_start)      echo "Backing up window.html..." ;;
            deploy_backup_done)       echo "Backed up to" ;;
            deploy_inject_start)      echo "Injecting mod loader..." ;;
            deploy_inject_done)       echo "injectMods.js injected" ;;
            deploy_inject_skip)       echo "injectMods.js already present, skipping injection" ;;
            deploy_start)             echo "Deploying mod files..." ;;
            deploy_css_done)          echo "{0} CSS mods deployed to user_mods/css/" ;;
            deploy_js_done)           echo "{0} JS mods deployed to user_mods/js/" ;;
            deploy_success)           echo "Installation complete! Restart Vivaldi to take effect." ;;
            post_vivaldi_running)     echo "Vivaldi is currently running." ;;
            post_restart_prompt)      echo "Restart Vivaldi now? [Y] Yes  [N] No" ;;
            post_launch_prompt)       echo "Launch Vivaldi now? [Y] Yes  [N] No" ;;
            post_restarting)          echo "Restarting Vivaldi..." ;;
            restore_detected)         echo "Vivaldi has been updated! Previous mod configuration found." ;;
            restore_prompt)           echo "Restore mods from version {0}?" ;;
            restore_option)           echo "Yes — restore my mods" ;;
            restore_fresh)            echo "No — start fresh" ;;
            restore_copying)          echo "Restoring mods from persistent storage..." ;;
            restore_done)             echo "Restored {0} CSS + {1} JS mods from previous version." ;;
            error_admin_required)     echo "Administrator privileges required." ;;
            error_download)           echo "ERROR: Failed to download modpack. Check your internet connection." ;;
            error_extract)            echo "ERROR: Failed to extract modpack archive." ;;
            error_no_source)          echo "ERROR: Could not locate mod source files." ;;
            error_permission)         echo "ERROR: Permission denied." ;;
            error_persist_write)      echo "Warning: Persistent storage write failed. Mods will not survive Vivaldi updates." ;;
            source_downloading)       echo "Downloading Awesome Vivaldi modpack..." ;;
            source_extracting)        echo "Extracting mod files..." ;;
            source_done)              echo "Mod files ready." ;;
            key_nav_confirm)          echo "UP/DOWN navigate | ENTER confirm | ESC/Q quit" ;;
            key_multiselect)          echo "UP/DOWN navigate | SPACE toggle | A all | D none" ;;
            key_confirm_back)         echo "ENTER confirm | LEFT back" ;;
            key_lang)                 echo "L lang" ;;
            key_exit)                 echo "ESC/Q quit" ;;
            toggle_all)               echo "(Select All / Deselect All)" ;;
            orphan_label)             echo "[orphan]" ;;
            step_target)              echo "Target" ;;
            step_css)                 echo "CSS" ;;
            step_js)                  echo "JS" ;;
            step_confirm)             echo "Confirm" ;;
            # --- Mod descriptions ---
            mod_desc_AdaptiveBF)      echo "Auto-hide back/forward buttons when unnecessary" ;;
            mod_desc_BetterAnimation) echo "Smoother overscroll bounce + tabbar retract animation" ;;
            mod_desc_BtnHoverAnime)   echo "Toolbar button hover micro-animation" ;;
            mod_desc_DownloadPanel)   echo "Download panel dark theme adaptation" ;;
            mod_desc_Extensions)      echo "Compact list layout for extensions menu" ;;
            mod_desc_FavouriteTabs)   echo "First 9 pinned tabs displayed as grid (Arc-style)" ;;
            mod_desc_FindInPage)      echo "Floating find-in-page bar" ;;
            mod_desc_LineBreak)       echo "Long text auto-wrap (useful for small screens)" ;;
            mod_desc_PeekTabbar)      echo "Slide-out tab bar on hover when hidden" ;;
            mod_desc_Quietify)        echo "Subtle audio indicator, less visual noise" ;;
            mod_desc_RemoveClutter)   echo "Hide scrollbars, dividers and visual clutter" ;;
            mod_desc_TabsTrail)       echo "Green accent trail on active/hovered tabs" ;;
            mod_desc_VivalArc)        echo "Arc browser style port (experimental)" ;;
            mod_desc_VividQC)         echo "Quick command panel styling" ;;
            mod_desc_TidyTabs_CSS)           echo "AI tab grouping style support" ;;
            mod_desc_VividPlayer_CSS)        echo "Vivaldi built-in player beautification" ;;
            mod_desc_VividToast_CSS)         echo "Toast notification popup styling" ;;
            mod_desc_PinnedTabRestore_CSS)   echo "Pinned tab restore button styling" ;;
            mod_desc_InteractionFeedback_CSS) echo "Button click micro-feedback animation" ;;
            mod_desc_VividPeek_CSS)          echo "Arc Peek popup window styling" ;;
            mod_desc_ModConfig)              echo "*Core* Shared settings panel (AI keys / mod params)" ;;
            mod_desc_AskOnPage)              echo "AI sidebar: page Q&A, summary, rewrite" ;;
            mod_desc_AutoHidePanel)          echo "Auto-collapse side panel on mouse leave" ;;
            mod_desc_EasyFiles)              echo "Quick file attach via clipboard & downloads" ;;
            mod_desc_MonochromeIcons)        echo "Unified monochrome web panel icons" ;;
            mod_desc_QuickCapture)           echo "Smart area selection for screenshots" ;;
            mod_desc_TabManager)             echo "Workspace tab management panel" ;;
            mod_desc_TidyAddress)            echo "AI rewrites address bar URLs to short titles" ;;
            mod_desc_TidyDownloads)          echo "AI cleans up garbled download filenames" ;;
            mod_desc_TidyTitles)             echo "AI condenses tab titles to meaningful phrases" ;;
            mod_desc_WorkspaceThemeSwitcher) echo "Auto-switch theme per workspace" ;;
            mod_desc_TidyTabs)               echo "AI auto-groups related tabs" ;;
            mod_desc_VividPeek)              echo "Arc-style popup page preview" ;;
            mod_desc_VividPlayer)            echo "Floating video player popup" ;;
            mod_desc_VividToast)             echo "Toast-style notification popups" ;;
            mod_desc_PinnedTabRestore)       echo "Right-click to restore recently closed pinned tabs" ;;
            mod_desc_InteractionFeedback)    echo "Button click micro-feedback animation" ;;
            *) echo "$1" ;;
        esac
    fi
}

trf() { local msg="$(tr "$1")"; echo "$msg" | sed "s/{0}/${2:-}/g; s/{1}/${3:-}/g; s/{2}/${4:-}/g"; }

# ── Default-off mods ──────────────────────────────────────────
is_default_off() {
    case "$1" in
        FavouriteTabs.css|FavouriteTabs.js|InteractionFeedback.js|InteractionFeedback.css|TidyAddress.js|TabManager.js) return 0 ;;
        *) return 1 ;;
    esac
}

# ============================================================
#  2.  ASCII Banner
# ============================================================

show_banner() {
    clear
    echo ""
    echo "▄████▄ ▄▄   ▄▄ ▄▄▄▄▄  ▄▄▄▄  ▄▄▄  ▄▄   ▄▄ ▄▄▄▄▄   ██  ██ ▄▄ ▄▄ ▄▄  ▄▄▄  ▄▄    ▄▄▄▄  ▄▄"
    echo "██▄▄██ ██ ▄ ██ ██▄▄  ███▄▄ ██▀██ ██▀▄▀██ ██▄▄    ██▄▄██ ██ ██▄██ ██▀██ ██    ██▀██ ██"
    echo "██  ██  ▀█▀█▀  ██▄▄▄ ▄▄██▀ ▀███▀ ██   ██ ██▄▄▄    ▀██▀  ██  ▀█▀  ██▀██ ██▄▄▄ ████▀ ██"
    echo ""
    echo "                              $(tr installer_title)"
    echo ""
}

# ============================================================
#  3.  Rendering — flicker-free ANSI atomic writes
# ============================================================

write_frame() {
    local content="$1"
    local e="$ESC"
    local w; w="$(tput cols 2>/dev/null || echo 80)"
    local row=$((BANNER_LINES + 1))
    local line_count=0
    local buf=""
    while IFS= read -r line || [ -n "$line" ]; do
        buf="${buf}${e}[${row};0H${e}[K"
        if [ ${#line} -ge "$w" ]; then
            buf="${buf}${line:0:$((w - 1))}"
        else
            buf="${buf}${line}"
        fi
        row=$((row + 1))
        line_count=$((line_count + 1))
    done <<< "$content"
    # Clear from end of frame to bottom of screen (ESC[J = erase display below cursor).
    # Does NOT depend on LAST_FRAME_LINES, which is stale after subshell $(...) calls.
    buf="${buf}${e}[${row};0H${e}[J"
    tty_printf "%s" "$buf"
    LAST_FRAME_LINES="$line_count"
}

clear_content() {
    local e="$ESC"
    # Clear from below banner to bottom of screen unconditionally
    local buf="${e}[$((BANNER_LINES + 1));0H${e}[J"
    tty_printf "%s" "$buf"
    LAST_FRAME_LINES=0
}

exit_installer() {
    clear_content
    tty_printf "${ESC}[2J${ESC}[H"
    tput cnorm 2>/dev/null || true
    EXIT_REQUESTED=1
    : > "$EXIT_FLAG_FILE"  # Signal parent shell (works across subshell boundaries)
    exit 0  # Immediately exit current (sub)shell — parent checks flag via _check_exit
}

flush_input() { while read -rsn1 -t 0.01 _ 2>/dev/null; do :; done; }

# ── Step indicator ────────────────────────────────────────────

STEP_IDX=0; STEP_TOTAL=0; STEP_LABELS=()
PAGES_CONFIRMED=()

set_step_info() {
    STEP_IDX="$1"; STEP_TOTAL="$2"
    IFS='|' read -ra STEP_LABELS <<< "$3"
    if [ "${#PAGES_CONFIRMED[@]}" -ne "$STEP_TOTAL" ]; then
        PAGES_CONFIRMED=()
        for ((i=0; i<STEP_TOTAL; i++)); do PAGES_CONFIRMED+=(0); done
    fi
}

format_step_bar() {
    local e="$ESC"
    local out="  "
    if [ "$UI_LANG" = "zh" ]; then
        out="${out}步骤 $((STEP_IDX + 1))/$STEP_TOTAL: "
    else
        out="${out}Step $((STEP_IDX + 1))/$STEP_TOTAL: "
    fi
    for ((i=0; i<STEP_TOTAL; i++)); do
        [ "$i" -gt 0 ] && out="${out}  ${e}[90m>${e}[0m  "
        if [ "$i" -eq "$STEP_IDX" ]; then
            out="${out}${e}[1;33m[${STEP_LABELS[$i]}]${e}[0m"
        elif [ "${PAGES_CONFIRMED[$i]}" = "1" ]; then
            out="${out}${e}[32m✓${STEP_LABELS[$i]}${e}[0m"
        else
            out="${out}${e}[90m${STEP_LABELS[$i]}${e}[0m"
        fi
    done
    echo "$out"
}

# ============================================================
#  4.  Key Reading
# ============================================================

read_key() {
    if [ "$HEADLESS" = "1" ]; then
        KEY_IDX=$((KEY_IDX + 1))
        if [ "$KEY_IDX" -gt 200 ]; then
            printf "\n[HEADLESS TIMEOUT: infinite loop detected after 200 key reads]\n" >&2
            exit 1
        fi
        if [ "$KEY_IDX" -le "${#KEY_SEQ[@]}" ]; then
            local k="${KEY_SEQ[$((KEY_IDX - 1))]}"; echo "$k"; return
        fi
        echo "ENTER"; return
    fi
    # Read from /dev/tty when stdin is a pipe (e.g. curl|bash), fall back to stdin
    local tty="/dev/tty"; [ -c "$tty" ] || tty=""
    { [ -n "$tty" ] && stty -echo -icanon < "$tty"; } 2>/dev/null || true
    local key
    if [ -n "$tty" ]; then
        IFS= read -rsn1 key < "$tty" 2>/dev/null || true
    else
        IFS= read -rsn1 key 2>/dev/null || true
    fi
    if [ "$key" = $'\x1b' ]; then
        local rest
        if [ -n "$tty" ]; then
            read -rsn2 -t 0.01 rest < "$tty" 2>/dev/null || true
        else
            read -rsn2 -t 0.01 rest 2>/dev/null || true
        fi
        case "$rest" in
            '[A') echo "UP";;
            '[B') echo "DOWN";;
            '[C') echo "RIGHT";;
            '[D') echo "LEFT";;
            *)    echo "ESC";;
        esac
    elif [ "$key" = '' ]; then
        echo "ENTER"
    elif [ "$key" = ' ' ]; then
        echo "SPACE"
    elif [ "$key" = 'a' ] || [ "$key" = 'A' ]; then
        echo "A"
    elif [ "$key" = 'd' ] || [ "$key" = 'D' ]; then
        echo "D"
    elif [ "$key" = 'l' ] || [ "$key" = 'L' ]; then
        echo "L"
    elif [ "$key" = 'q' ] || [ "$key" = 'Q' ]; then
        echo "Q"
    elif [ "$key" = 'y' ] || [ "$key" = 'Y' ]; then
        echo "Y"
    elif [ "$key" = 'n' ] || [ "$key" = 'N' ]; then
        echo "N"
    else
        echo "OTHER"
    fi
    { [ -n "$tty" ] && stty echo icanon < "$tty"; } 2>/dev/null || true
}

# Helper for key hints
build_hint() {
    local parts=""
    local e="${ESC}[90m"
    for part in "$@"; do
        parts="${parts}${e}${part}${ESC}[0m  |  "
    done
    echo "${parts%  |  }"
}

# ============================================================
#  5.  Source Acquisition
# ============================================================

find_mod_source() {
    if is_local_mode; then
        SOURCE_DIR="$REPO_ROOT/Vivaldi8.0Stable"
        return 0
    fi
    echo "$(tr source_downloading)"
    TEMP_DIR="${TMPDIR:-/tmp}/awesome-vivaldi-installer"
    mkdir -p "$TEMP_DIR" 2>/dev/null || { TEMP_DIR="$(mktemp -d)"; }
    local repo_raw="https://raw.githubusercontent.com/PaRr0tBoY/Awesome-Vivaldi/main"
    local css_dir="$TEMP_DIR/CSS"; local js_dir="$TEMP_DIR/Javascripts"
    mkdir -p "$css_dir" "$js_dir"

    # File manifests (keep in sync with Vivaldi8.0Stable/)
    local css_files=(
        "AdaptiveBF.css" "BetterAnimation.css" "BtnHoverAnime.css" "DownloadPanel.css"
        "Extensions.css" "FavouriteTabs.css" "FindInPage.css" "InteractionFeedback.css"
        "LineBreak.css" "PeekTabbar.css" "PinnedTabRestore.css" "Quietify.css"
        "RemoveClutter.css" "TabsTrail.css" "TidyTabs.css" "VivalArc.css"
        "VividPeek.css" "VividPlayer.css" "VividQC.css" "VividToast.css"
    )
    local js_files=(
        "AskOnPage.js" "AutoHidePanel.js" "EasyFiles.js" "InteractionFeedback.js"
        "ModConfig.js" "MonochromeIcons.js" "PinnedTabRestore.js" "QuickCapture.js"
        "TabManager.js" "TidyAddress.js" "TidyDownloads.js" "TidyTabs.js"
        "TidyTitles.js" "VividPeek.js" "VividPlayer.js" "VividToast.js"
        "WorkspaceThemeSwitcher.js"
    )

    # Check cache — all files present AND fresh (< 1 hour)
    local all_present=1; local f
    for f in "${css_files[@]}"; do [ -f "$css_dir/$f" ] || { all_present=0; break; }; done
    if [ "$all_present" = "1" ]; then
        for f in "${js_files[@]}"; do [ -f "$js_dir/$f" ] || { all_present=0; break; }; done
    fi
    [ "$all_present" = "1" ] && [ -f "$TEMP_DIR/injectMods.js" ] || all_present=0
    [ "$all_present" = "1" ] && [ -f "$TEMP_DIR/Import.css" ] || all_present=0
    if [ "$all_present" = "1" ]; then
        if [ -z "$(find "$TEMP_DIR/injectMods.js" -mmin +60 2>/dev/null)" ]; then
            echo "Using cached mod files (from previous download)..."
            SOURCE_DIR="$TEMP_DIR"
            return 0
        fi
    fi

    # Download from hardcoded manifests (no GitHub API, no rate limits)
    for f in "${css_files[@]}"; do
        curl -fsSL -o "$css_dir/$f" "$repo_raw/Vivaldi8.0Stable/CSS/$f" || { echo "$(tr error_download)"; return 1; }
    done
    for f in "${js_files[@]}"; do
        curl -fsSL -o "$js_dir/$f" "$repo_raw/Vivaldi8.0Stable/Javascripts/$f" || { echo "$(tr error_download)"; return 1; }
    done
    curl -fsSL -o "$TEMP_DIR/injectMods.js" "$repo_raw/injectMods.js" || { echo "$(tr error_download)"; return 1; }
    # Import.css lives at repo root, not in CSS/ subdir
    curl -fsSL -o "$TEMP_DIR/Import.css" "$repo_raw/Vivaldi8.0Stable/Import.css" || { echo "$(tr error_download)"; return 1; }

    SOURCE_DIR="$TEMP_DIR"
    echo "$(tr source_done)"
}

# Lazy-load mod source — downloads only on first call, caches for subsequent use
CACHED_SOURCE_DIR=""
ensure_mod_source() {
    if [ -n "$CACHED_SOURCE_DIR" ]; then
        SOURCE_DIR="$CACHED_SOURCE_DIR"
        return 0
    fi
    find_mod_source || return 1
    CACHED_SOURCE_DIR="$SOURCE_DIR"
    scan_mods "$SOURCE_DIR"
    return 0
}

# ============================================================
#  6.  Vivaldi Installation Discovery (macOS)
# ============================================================

find_vivaldi_installations() {
    local found=(); local seen=()

    # Shared: add a Vivaldi installation from a Framework path
    _add_install() {
        local framework="$1"
        local resources_dir="${framework}/Resources/vivaldi"
        [ -f "$resources_dir/window.html" ] || return 0
        local app_path; app_path="${framework%%/Contents/Frameworks/Vivaldi Framework.framework*}"
        local app_name; app_name="$(basename "$app_path" .app)"
        local display_name="Vivaldi"
        case "$app_name" in *Snapshot*|*snapshot*) display_name="Vivaldi Snapshot" ;; esac
        local version=""
        [ -f "$app_path/Contents/Info.plist" ] && version="$(plutil -extract CFBundleShortVersionString raw "$app_path/Contents/Info.plist" 2>/dev/null || echo "unknown")"
        local key="${resources_dir}"
        # bash 3.2 (macOS): ${arr[*]} / ${arr[@]} on empty array + set -u = unbound variable
        local _dup=0
        if [ "${#seen[@]}" -gt 0 ]; then
            for _s in "${seen[@]}"; do [ "$_s" = "$key" ] && { _dup=1; break; }; done
        fi
        if [ "$_dup" = "0" ]; then
            seen+=("$key")
            found+=("${app_path}|${resources_dir}|${display_name}|${version}")
        fi
    }

    # 0th: Direct paths (instant O(1) — Vivaldi install paths are predictable)
    if [ -z "${VIVALDI_TEST_PATH:-}" ]; then
        local direct_frameworks=(
            "/Applications/Vivaldi.app/Contents/Frameworks/Vivaldi Framework.framework"
            "/Applications/Vivaldi Snapshot.app/Contents/Frameworks/Vivaldi Framework.framework"
            "$HOME/Applications/Vivaldi.app/Contents/Frameworks/Vivaldi Framework.framework"
            "$HOME/Applications/Vivaldi Snapshot.app/Contents/Frameworks/Vivaldi Framework.framework"
        )
        for framework in "${direct_frameworks[@]}"; do
            [ -d "$framework" ] && _add_install "$framework"
        done
    else
        # Test mode: inject a synthetic framework path
        _add_install "$VIVALDI_TEST_PATH/Vivaldi.app/Contents/Frameworks/Vivaldi Framework.framework"
    fi

    # 1st: mdfind (Spotlight index, ~instant) — supplement for non-standard installs
    if [ -z "${VIVALDI_TEST_PATH:-}" ]; then
        while IFS= read -r -d '' framework; do
            _add_install "$framework"
        done < <(mdfind "kMDItemFSName == 'Vivaldi Framework.framework'" -0 2>/dev/null || true)
    fi

    # 2nd: find (filesystem walk) — used when mdfind empty, or in test mode
    if [ ${#found[@]} -eq 0 ]; then
        local search_paths=("/Applications" "$HOME/Applications")
        [ -n "${VIVALDI_TEST_PATH:-}" ] && search_paths=("$VIVALDI_TEST_PATH")
        while IFS= read -r -d '' framework; do
            _add_install "$framework"
        done < <(find "${search_paths[@]}" -type d -name "Vivaldi Framework.framework" -print0 2>/dev/null)
    fi

    # 3rd: mdfind for window.html (catch non-standard install layouts) — skip in test mode
    if [ ${#found[@]} -eq 0 ] && [ -z "${VIVALDI_TEST_PATH:-}" ]; then
        while IFS= read -r html_path; do
            [[ "$html_path" == *"Vivaldi"* ]] && [[ "$html_path" == *"Resources/vivaldi/window.html" ]] || continue
            local resources_dir; resources_dir="$(dirname "$html_path")"
            local framework; framework="$(dirname "$(dirname "$resources_dir")")"
            _add_install "$framework"
        done < <(mdfind "kMDItemFSName == 'window.html'" 2>/dev/null || true)
    fi
    printf '%s\n' "${found[@]}"
}

# ============================================================
#  7.  Mod Scanning
# ============================================================

scan_mods() {
    local source_dir="$1"
    local css_dir="$source_dir/CSS"; local js_dir="$source_dir/Javascripts"
    STANDALONE_CSS=(); BUNDLED_CSS=(); STANDALONE_JS=(); BUNDLED_JS=()
    local css_names=(); local js_names=()
    if [ -d "$css_dir" ]; then for f in "$css_dir"/*.css; do [ -f "$f" ] && css_names+=("$(basename "$f" .css)"); done; fi
    if [ -d "$js_dir" ]; then for f in "$js_dir"/*.js; do [ -f "$f" ] || continue; local n="$(basename "$f")"; [ "$n" = "ModConfig.js" ] && continue; js_names+=("$(basename "$f" .js)"); done; fi
    local bundled_keys=()
    for cb in "${css_names[@]}"; do for jb in "${js_names[@]}"; do [ "$cb" = "$jb" ] && bundled_keys+=("$cb"); done; done
    _in_array() { local k="$1"; shift; for v in "$@"; do [ "$v" = "$k" ] && return 0; done; return 1; }
    # CSS
    for f in "$css_dir"/*.css; do [ -f "$f" ] || continue; local name="$(basename "$f")"; local base="${name%.css}"
        if _in_array "$base" "${bundled_keys[@]}"; then BUNDLED_CSS+=("$name|$base")
        else STANDALONE_CSS+=("$name|$base"); fi; done
    [ "${#STANDALONE_CSS[@]}" -gt 0 ] && { IFS=$'\n'; STANDALONE_CSS=($(sort <<<"${STANDALONE_CSS[*]}")); unset IFS; }
    [ "${#BUNDLED_CSS[@]}" -gt 0 ]    && { IFS=$'\n'; BUNDLED_CSS=($(sort <<<"${BUNDLED_CSS[*]}")); unset IFS; }
    # JS
    for f in "$js_dir"/*.js; do [ -f "$f" ] || continue; local name="$(basename "$f")"; local base="${name%.js}"; [ "$name" = "ModConfig.js" ] && continue
        if _in_array "$base" "${bundled_keys[@]}"; then BUNDLED_JS+=("$name|$base|${name%.js}.css")
        else STANDALONE_JS+=("$name|$base|"); fi; done
    [ "${#STANDALONE_JS[@]}" -gt 0 ]  && { IFS=$'\n'; STANDALONE_JS=($(sort <<<"${STANDALONE_JS[*]}")); unset IFS; }
    [ "${#BUNDLED_JS[@]}" -gt 0 ]     && { IFS=$'\n'; BUNDLED_JS=($(sort <<<"${BUNDLED_JS[*]}")); unset IFS; }
}

# ============================================================
#  8.  Installation State
# ============================================================

get_install_state() {
    local vivaldi_dir="$1"
    local state_file="$vivaldi_dir/user_mods/.awesome-vivaldi.json"
    [ -f "$state_file" ] || return 1
    STATE_CSS_MODS=(); STATE_JS_MODS=(); STATE_VERSION=""; STATE_GIT_COMMIT=""
    if command -v python3 &>/dev/null; then
        local css; css="$(python3 -c "import json; d=json.load(open('$state_file')); print(' '.join(d.get('css_mods',[])))" 2>/dev/null)"
        local js; js="$(python3 -c "import json; d=json.load(open('$state_file')); print(' '.join(d.get('js_mods',[])))" 2>/dev/null)"
        STATE_CSS_MODS=($css); STATE_JS_MODS=($js)
    else
        local line; line="$(grep -o '"css_mods"[[:space:]]*:[[:space:]]*\[[^]]*\]' "$state_file" 2>/dev/null || true)"
        echo "$line" | grep -o '"[^"]*"' | sed 's/"//g' | while read -r m; do STATE_CSS_MODS+=("$m"); done 2>/dev/null
        line="$(grep -o '"js_mods"[[:space:]]*:[[:space:]]*\[[^]]*\]' "$state_file" 2>/dev/null || true)"
        echo "$line" | grep -o '"[^"]*"' | sed 's/"//g' | while read -r m; do STATE_JS_MODS+=("$m"); done 2>/dev/null
    fi
    return 0
}

is_installed() { [ -d "$1/user_mods" ]; }

# ============================================================
#  9.  TUI Selection Functions
# ============================================================

select_single() {
    local title_key="$1"; local allow_left="$2"; shift 2
    local items=("$@"); local n=${#items[@]}
    [ "$n" -eq 0 ] && { echo "$(tr target_none_found)"; return 1; }
    [ "$n" -eq 1 ] && { echo "0"; return; }
    local cursor=0; local done=0; local e="$ESC"
    while [ "$done" -eq 0 ]; do
        local sb=""
        sb+="$(format_step_bar)"$'\n'
        sb+=""$'\n'
        sb+="  $(tr "$title_key")"$'\n'
        sb+=""$'\n'
        local i=0
        for item in "${items[@]}"; do
            local label="${item%%|*}"; local rest="${item#*|}"; local detail="${rest#*|}"
            local prefix="   "; local marker=" "
            [ "$i" = "$cursor" ] && { prefix="  >"; marker="O"; }
            sb+="$prefix [$marker] $label"$'\n'
            [ -n "$detail" ] && [ "$detail" != "$rest" ] && sb+="          $detail"$'\n'
            i=$((i + 1))
        done
        sb+=""$'\n'
        sb+="  ${e}[90m──────────────────────────────────────────────────${e}[0m"$'\n'
        local hint_parts=("$(tr key_nav_confirm)" "$(tr key_confirm_back)" "$(tr key_lang)")
        [ "$allow_left" = "1" ] && hint_parts+=("LEFT back")
        hint_parts+=("$(tr key_exit)")
        sb+="    $(build_hint "${hint_parts[@]}")"$'\n'
        write_frame "$sb"
        local key; key="$(read_key)"
        case "$key" in
            UP)    cursor=$(( cursor > 0 ? cursor - 1 : 0 )) ;;
            DOWN)  cursor=$(( cursor < n - 1 ? cursor + 1 : n - 1 )) ;;
            ENTER) done=1 ;;
            LEFT)  [ "$allow_left" = "1" ] && { echo "__BACK__"; return; } ;;
            L)     toggle_lang ;;
            Q|ESC) exit_installer ;;
        esac
    done
    echo "$cursor"
}

select_multi() {
    local title_key="$1"; local preselect_str="$2"; local default_all="$3"; local allow_left="$4"; local allow_right="$5"; shift 5
    local items=("$@"); local n=${#items[@]}; [ "$n" -eq 0 ] && { echo ""; return; }
    local selected=(); local filenames=(); local locked=(); local labels=()
    local i=0
    for item in "${items[@]}"; do
        IFS='|' read -r fname label desc locked_flag <<< "$item"
        filenames+=("$fname"); labels+=("$label"); locked+=("${locked_flag:-0}")
        local sel=0
        if [ -n "$preselect_str" ]; then
            if [[ " $preselect_str " =~ " $fname " ]]; then sel=1; fi
        elif [ "$default_all" = "1" ]; then
            if [ "${locked_flag:-0}" = "0" ] && ! is_default_off "$fname"; then sel=1; fi
        fi
        selected+=("$sel"); i=$((i + 1))
    done
    local cursor=0; local done=0; local e="$ESC"
    local max_label=0
    for l in "${labels[@]}"; do [ "${#l}" -gt "$max_label" ] && max_label="${#l}"; done
    while [ "$done" -eq 0 ]; do
        local all_sel=1
        for ((j=0; j<n; j++)); do [ "${locked[$j]}" = "0" ] && [ "${selected[$j]}" = "0" ] && { all_sel=0; break; }; done
        local sb=""
        sb+="$(format_step_bar)"$'\n'
        sb+=""$'\n'
        sb+="  $(tr "$title_key")"$'\n'
        sb+=""$'\n'
        local toggle_mark="[x]"; [ "$all_sel" = "0" ] && toggle_mark="[ ]"
        local toggle_prefix="   "; [ "$cursor" = "-1" ] && toggle_prefix="  >"
        sb+="$toggle_prefix ${e}[90m$toggle_mark${e}[0m ${e}[90m$(tr toggle_all)${e}[0m"$'\n'
        sb+="  ${e}[90m──────────────────────────────────────────────────${e}[0m"$'\n'
        for ((j=0; j<n; j++)); do
            local check="[ ]"; [ "${selected[$j]}" = "1" ] && check="[x]"
            local prefix="   "; [ "$j" = "$cursor" ] && prefix="  ${e}[1;36m>${e}[0m"
            local lock_tag=""; [ "${locked[$j]}" = "1" ] && lock_tag=" ${e}[90m$(tr css_locked_tag)${e}[0m"
            local label_padded; printf -v label_padded "%-$((max_label + 2))s" "${labels[$j]}"
            local desc_key="mod_desc_${filenames[$j]%.*}"
            local desc; desc="$(tr "$desc_key" 2>/dev/null)"
            [ "$desc" = "$desc_key" ] && desc=""
            local desc_part=""; [ -n "$desc" ] && desc_part=" —  $desc"
            sb+="$prefix $check $label_padded$desc_part$lock_tag"$'\n'
        done
        sb+=""$'\n'
        sb+="  ${e}[90m──────────────────────────────────────────────────${e}[0m"$'\n'
        local hint_parts=("$(tr key_multiselect)" "$(tr key_confirm_back)" "$(tr key_lang)")
        [ "$allow_left"  = "1" ] && hint_parts+=("LEFT back")
        [ "$allow_right" = "1" ] && hint_parts+=("RIGHT next")
        hint_parts+=("$(tr key_exit)")
        sb+="    $(build_hint "${hint_parts[@]}")"$'\n'
        write_frame "$sb"
        local key; key="$(read_key)"
        case "$key" in
            UP)    [ "$cursor" = "-1" ] && cursor=$((n - 1)) || cursor=$(( cursor > 0 ? cursor - 1 : 0 )) ;;
            DOWN)  [ "$cursor" = "-1" ] && cursor=0 || cursor=$(( cursor < n - 1 ? cursor + 1 : n - 1 )) ;;
            SPACE)
                if [ "$cursor" = "-1" ]; then
                    local ns=0; [ "$all_sel" = "0" ] && ns=1
                    for ((j=0; j<n; j++)); do [ "${locked[$j]}" = "0" ] && selected[$j]="$ns"; done
                elif [ "${locked[$cursor]}" = "0" ]; then
                    [ "${selected[$cursor]}" = "1" ] && selected[$cursor]=0 || selected[$cursor]=1
                fi ;;
            A) for ((j=0; j<n; j++)); do [ "${locked[$j]}" = "0" ] && selected[$j]=1; done ;;
            D) for ((j=0; j<n; j++)); do [ "${locked[$j]}" = "0" ] && selected[$j]=0; done ;;
            ENTER) done=1 ;;
            LEFT)  [ "$allow_left" = "1" ] && { echo "__BACK__"; return; } ;;
            RIGHT) [ "$allow_right" = "1" ] && { echo "__RIGHT__"; return; } ;;
            L)     toggle_lang ;;
            Q|ESC) exit_installer ;;
        esac
    done
    for ((j=0; j<n; j++)); do [ "${selected[$j]}" = "1" ] && echo "${filenames[$j]}"; done
    return 0
}

select_multi_js() {
    local title_key="$1"; local preselect_str="$2"; local default_all="$3"; local allow_left="$4"; local allow_right="$5"; shift 5
    local items=("$@"); local n=${#items[@]}; [ "$n" -eq 0 ] && { echo ""; return; }
    local selected=(); local filenames=(); local bundle_pairs=(); local labels=(); local is_section=()
    local i=0
    # Build flat item list: standalone JS first, then section + bundled
    for item in "${items[@]}"; do
        IFS='|' read -r fname label desc bundle <<< "$item"
        filenames+=("$fname"); labels+=("$fname"); bundle_pairs+=("${bundle:-}"); is_section+=(0)
        local sel=0
        if [ -n "$preselect_str" ]; then
            [[ " $preselect_str " =~ " $fname " ]] && sel=1
        elif [ "$default_all" = "1" ]; then
            ! is_default_off "$fname" && sel=1
        fi
        selected+=("$sel")
    done
    # Add section header
    if [ "${#items[@]}" -gt 0 ]; then
        filenames+=("__section__"); labels+=(""); bundle_pairs+=(""); is_section+=(1); selected+=(0)
    fi
    # Bundled JS items (from $items — but items already include all)
    # Actually the items passed are the bundled JS items
    n=${#filenames[@]}
    local cursor=0; local done=0; local e="$ESC"
    local max_label=0
    for l in "${labels[@]}"; do local len=${#l}; [ "$len" -gt "$max_label" ] && max_label="$len"; done
    while [ "$done" -eq 0 ]; do
        local all_sel=1
        for ((j=0; j<n; j++)); do [ "${is_section[$j]}" = "0" ] && [ "${selected[$j]}" = "0" ] && { all_sel=0; break; }; done
        local sb=""
        sb+="$(format_step_bar)"$'\n'
        sb+=""$'\n'
        sb+="  $(tr "$title_key")"$'\n'
        sb+=""$'\n'
        local toggle_mark="[x]"; [ "$all_sel" = "0" ] && toggle_mark="[ ]"
        local toggle_prefix="   "; [ "$cursor" = "-1" ] && toggle_prefix="  >"
        sb+="$toggle_prefix ${e}[90m$toggle_mark${e}[0m ${e}[90m$(tr toggle_all)${e}[0m"$'\n'
        sb+="  ${e}[90m──────────────────────────────────────────────────${e}[0m"$'\n'
        for ((j=0; j<n; j++)); do
            local check="[ ]"; [ "${selected[$j]}" = "1" ] && check="[x]"
            local prefix="   "; [ "$j" = "$cursor" ] && prefix="  ${e}[1;36m>${e}[0m"
            if [ "${is_section[$j]}" = "1" ]; then
                sb+="  ${e}[90m  $(tr js_bundled_section)${e}[0m"$'\n'
            else
                local label_text="${filenames[$j]}"
                [ -n "${bundle_pairs[$j]}" ] && label_text="${filenames[$j]}  →  $(tr js_bundled_arrow): ${bundle_pairs[$j]}"
                local label_padded; printf -v label_padded "%-$((max_label + 10))s" "$label_text"
                local desc_key="mod_desc_${filenames[$j]%.*}"
                local desc; desc="$(tr "$desc_key" 2>/dev/null)"
                [ "$desc" = "$desc_key" ] && desc=""
                local desc_part=""; [ -n "$desc" ] && desc_part=" —  $desc"
                sb+="$prefix $check $label_padded$desc_part"$'\n'
            fi
        done
        sb+=""$'\n'
        sb+="  ${e}[90m──────────────────────────────────────────────────${e}[0m"$'\n'
        local hint_parts=("$(tr key_multiselect)" "$(tr key_confirm_back)" "$(tr key_lang)")
        [ "$allow_left"  = "1" ] && hint_parts+=("LEFT back")
        [ "$allow_right" = "1" ] && hint_parts+=("RIGHT next")
        hint_parts+=("$(tr key_exit)")
        sb+="    $(build_hint "${hint_parts[@]}")"$'\n'
        write_frame "$sb"
        local key; key="$(read_key)"
        case "$key" in
            UP)    [ "$cursor" = "-1" ] && cursor=$((n - 1)) || cursor=$(( cursor > 0 ? cursor - 1 : 0 )) ;;
            DOWN)  [ "$cursor" = "-1" ] && cursor=0 || cursor=$(( cursor < n - 1 ? cursor + 1 : n - 1 )) ;;
            SPACE)
                if [ "$cursor" = "-1" ]; then
                    local ns=0; [ "$all_sel" = "0" ] && ns=1
                    for ((j=0; j<n; j++)); do [ "${is_section[$j]}" = "0" ] && selected[$j]="$ns"; done
                elif [ "${is_section[$cursor]}" = "0" ]; then
                    [ "${selected[$cursor]}" = "1" ] && selected[$cursor]=0 || selected[$cursor]=1
                fi ;;
            A) for ((j=0; j<n; j++)); do [ "${is_section[$j]}" = "0" ] && selected[$j]=1; done ;;
            D) for ((j=0; j<n; j++)); do [ "${is_section[$j]}" = "0" ] && selected[$j]=0; done ;;
            ENTER) done=1 ;;
            LEFT)  [ "$allow_left" = "1" ] && { echo "__BACK__"; return; } ;;
            RIGHT) [ "$allow_right" = "1" ] && { echo "__RIGHT__"; return; } ;;
            L)     toggle_lang ;;
            Q|ESC) exit_installer ;;
        esac
    done
    for ((j=0; j<n; j++)); do
        [ "${selected[$j]}" = "1" ] && [ "${is_section[$j]}" = "0" ] && echo "JS:${filenames[$j]}"
        [ "${selected[$j]}" = "1" ] && [ -n "${bundle_pairs[$j]}" ] && echo "CSS:${bundle_pairs[$j]}"
    done
    return 0
}

# ============================================================
#  10.  Deploy Functions
# ============================================================

backup_window_html() {
    local vivaldi_dir="$1"; local html_path="$vivaldi_dir/window.html"; local bak_path="${html_path}.bak"
    echo "$(tr deploy_backup_start)"
    [ ! -f "$bak_path" ] && cp "$html_path" "$bak_path"
    echo "$(tr deploy_backup_done) $bak_path"
    local persistent_dir="${2:-}"
    [ -n "$persistent_dir" ] && mkdir -p "$persistent_dir" && cp "$html_path" "$persistent_dir/window.html.orig" 2>/dev/null || true
}

inject_mod_loader() {
    local vivaldi_dir="$1"; local html_path="$vivaldi_dir/window.html"
    echo "$(tr deploy_inject_start)"
    if grep -q 'injectMods\.js' "$html_path" 2>/dev/null; then echo "$(tr deploy_inject_skip)"; return; fi
    { sed -i '' '/<body[^>]*>/a\
  <script src="injectMods.js"></script>' "$html_path" 2>/dev/null; } || { sed -i '/<body[^>]*>/a\  <script src="injectMods.js"></script>' "$html_path" 2>/dev/null; } || true
    echo "$(tr deploy_inject_done)"
}

deploy_mod_files() {
    local source_dir="$1"; local vivaldi_dir="$2"; local persistent_dir="$3"
    local css_mods_str="$4"; local js_mods_str="$5"
    echo "$(tr deploy_start)"
    local user_mods_dir="$vivaldi_dir/user_mods"; local user_css_dir="$user_mods_dir/css"; local user_js_dir="$user_mods_dir/js"
    mkdir -p "$user_css_dir" "$user_js_dir"
    local source_css_dir="$source_dir/CSS"; local source_js_dir="$source_dir/Javascripts"

    # injectMods.js
    local inj_src="$source_dir/injectMods.js"
    [ ! -f "$inj_src" ] && inj_src="$(dirname "$source_dir")/injectMods.js"
    [ ! -f "$inj_src" ] && [ -n "$REPO_ROOT" ] && inj_src="$REPO_ROOT/injectMods.js"
    [ -f "$inj_src" ] && cp "$inj_src" "$vivaldi_dir/injectMods.js"

    # Import.css
    local import_src="$source_dir/Import.css"; [ ! -f "$import_src" ] && import_src="$source_css_dir/Import.css"
    if [ -f "$import_src" ]; then
        cp "$import_src" "$user_css_dir/Import.css"
        { sed -i '' 's|@import "CSS/|@import "|g' "$user_css_dir/Import.css" 2>/dev/null; } || { sed -i 's|@import "CSS/|@import "|g' "$user_css_dir/Import.css" 2>/dev/null; } || true
    fi

    local css_count=0
    for mod in $css_mods_str; do [ -z "$mod" ] && continue; local src="$source_css_dir/$mod"
        [ -f "$src" ] && { cp "$src" "$user_css_dir/$mod"; css_count=$((css_count + 1)); }; done
    local js_count=0
    for mod in $js_mods_str; do [ -z "$mod" ] && continue; local src="$source_js_dir/$mod"
        [ -f "$src" ] && { cp "$src" "$user_js_dir/$mod"; js_count=$((js_count + 1)); }; done

    echo "$(trf deploy_css_done "$css_count")"
    echo "$(trf deploy_js_done "$js_count")"

    # State file
    local installed_at; installed_at="$(date -u +"%Y-%m-%dT%H:%M:%S")"
    local git_commit=""
    [ -n "$REPO_ROOT" ] && git_commit="$(git -C "$REPO_ROOT" rev-parse --short HEAD 2>/dev/null || true)"
    cat > "$user_mods_dir/.awesome-vivaldi.json" << STATEEOF
{
  "version": "8.0",
  "installed_at": "$installed_at",
  "git_commit": "$git_commit",
  "css_mods": [$(for m in $css_mods_str; do [ -n "$m" ] && echo "\"$m\","; done | sed '$ s/,$//')],
  "js_mods": [$(for m in $js_mods_str; do [ -n "$m" ] && echo "\"$m\","; done | sed '$ s/,$//')]
}
STATEEOF

    # Persistent storage
    if [ -n "$persistent_dir" ]; then
        local pv_dir="$persistent_dir/8.0"; local pc_dir="$pv_dir/css"; local pj_dir="$pv_dir/js"
        mkdir -p "$pc_dir" "$pj_dir" 2>/dev/null || true
        for mod in $css_mods_str; do [ -z "$mod" ] && continue; [ -f "$source_css_dir/$mod" ] && cp "$source_css_dir/$mod" "$pc_dir/$mod" 2>/dev/null; done
        for mod in $js_mods_str; do [ -z "$mod" ] && continue; [ -f "$source_js_dir/$mod" ] && cp "$source_js_dir/$mod" "$pj_dir/$mod" 2>/dev/null; done
        [ -f "$user_css_dir/Import.css" ] && cp "$user_css_dir/Import.css" "$pc_dir/Import.css" 2>/dev/null
        cp "$user_mods_dir/.awesome-vivaldi.json" "$pv_dir/.awesome-vivaldi.json" 2>/dev/null || true
    fi
    return 0
}

# ============================================================
#  11.  Post-Install: Restart / Launch
# ============================================================

post_install() {
    local app_path="$1"; local e="$ESC"
    tput cnorm 2>/dev/null || true
    flush_input
    sleep 0.1
    local vivaldi_running=0
    pgrep -q Vivaldi 2>/dev/null && vivaldi_running=1
    if [ "$vivaldi_running" = "1" ]; then
        echo ""; echo "$(tr post_vivaldi_running)"; echo ""
        printf "%s " "$(tr post_restart_prompt)"
        local key; key="$(read_key)"
        if [ "$key" = "Y" ] || [ "$key" = "ENTER" ]; then
            echo "Y"; echo ""; echo "  $(tr post_restarting)"
            pkill Vivaldi 2>/dev/null || true; sleep 1
            open "$app_path" --args --debug-packed-apps --silent-debugger-extension-api 2>/dev/null || open -a Vivaldi
            echo "  Vivaldi restarted."
        else echo "N"; fi
    else
        echo ""; printf "%s " "$(tr post_launch_prompt)"
        local key; key="$(read_key)"
        if [ "$key" = "Y" ] || [ "$key" = "ENTER" ]; then
            echo "Y"
            open "$app_path" --args --debug-packed-apps --silent-debugger-extension-api 2>/dev/null || open -a Vivaldi
            echo "  Vivaldi launched."
        else echo "N"; fi
    fi
}

# ============================================================
#  12.  Persistent Storage (cross-version)
# ============================================================

find_persistent_mods() {
    local persistent_dir="$1"; [ -d "$persistent_dir" ] || return 1
    local best_dir=""
    for d in "$persistent_dir"/*/; do
        local dn; dn="$(basename "$d")"
        [[ "$dn" =~ ^[0-9]+\.[0-9]+ ]] || continue
        [ -f "$d/.awesome-vivaldi.json" ] || continue
        [ -z "$best_dir" ] && best_dir="$d" || {
            [ "$dn" \> "$(basename "$best_dir")" ] && best_dir="$d"
        }
    done
    [ -n "$best_dir" ] || return 1
    PERSIST_CSS_MODS=(); PERSIST_JS_MODS=(); PERSIST_VERSION="$(basename "$best_dir")"
    PERSIST_CSS_DIR="$best_dir/css"; PERSIST_JS_DIR="$best_dir/js"
    if command -v python3 &>/dev/null; then
        local css; css="$(python3 -c "import json; d=json.load(open('${best_dir}/.awesome-vivaldi.json')); print(' '.join(d.get('css_mods',[])))" 2>/dev/null)"
        local js; js="$(python3 -c "import json; d=json.load(open('${best_dir}/.awesome-vivaldi.json')); print(' '.join(d.get('js_mods',[])))" 2>/dev/null)"
        PERSIST_CSS_MODS=($css); PERSIST_JS_MODS=($js)
    fi
    return 0
}

restore_from_persistence() {
    local vivaldi_dir="$1"; echo "$(tr restore_copying)"
    local user_css_dir="$vivaldi_dir/user_mods/css"; local user_js_dir="$vivaldi_dir/user_mods/js"
    mkdir -p "$user_css_dir" "$user_js_dir"
    local css_count=0; local js_count=0
    for mod in "${PERSIST_CSS_MODS[@]}"; do
        [ -f "$PERSIST_CSS_DIR/$mod" ] && { cp "$PERSIST_CSS_DIR/$mod" "$user_css_dir/$mod"; css_count=$((css_count + 1)); }; done
    for mod in "${PERSIST_JS_MODS[@]}"; do
        [ -f "$PERSIST_JS_DIR/$mod" ] && { cp "$PERSIST_JS_DIR/$mod" "$user_js_dir/$mod"; js_count=$((js_count + 1)); }; done
    [ -f "$PERSIST_CSS_DIR/Import.css" ] && cp "$PERSIST_CSS_DIR/Import.css" "$user_css_dir/Import.css"
    local installed_at; installed_at="$(date -u +"%Y-%m-%dT%H:%M:%S")"
    local git_commit=""
    [ -n "$REPO_ROOT" ] && git_commit="$(git -C "$REPO_ROOT" rev-parse --short HEAD 2>/dev/null || true)"
    cat > "$vivaldi_dir/user_mods/.awesome-vivaldi.json" << STATEEOF
{ "version": "$PERSIST_VERSION", "installed_at": "$installed_at", "git_commit": "$git_commit",
  "css_mods": [$(for m in "${PERSIST_CSS_MODS[@]}"; do echo "\"$m\","; done | sed '$ s/,$//')],
  "js_mods": [$(for m in "${PERSIST_JS_MODS[@]}"; do echo "\"$m\","; done | sed '$ s/,$//')] }
STATEEOF
    echo "$(trf restore_done "$css_count" "$js_count")"
}

# ============================================================
#  13.  Entry Menu
# ============================================================

entry_menu() {
    local is_installed="$1"; clear_content; local e="$ESC"
    local items=()
    if [ "$is_installed" = "1" ]; then
        items=("manage|$(tr entry_manage)|$(tr entry_manage_desc)" "update|$(tr entry_update)|$(tr entry_update_desc)" "uninstall|$(tr entry_uninstall)|$(tr entry_uninstall_desc)" "exit|$(tr entry_exit)|$(tr entry_exit_desc)")
    else
        items=("install|$(tr entry_install)|$(tr entry_install_desc)" "exit|$(tr entry_exit)|$(tr entry_exit_desc)")
    fi
    local n=${#items[@]}; local cursor=0; local done=0
    while [ "$done" -eq 0 ]; do
        local sb=""
        sb+=""$'\n'
        if [ "$is_installed" = "1" ]; then sb+="  ${e}[1;32m$(tr entry_installed_title)${e}[0m"$'\n'
        else sb+="  ${e}[1m$(tr entry_not_installed_title)${e}[0m"$'\n'; fi
        sb+=""$'\n'
        sb+="  $(tr entry_choose_action)"$'\n'
        sb+=""$'\n'
        local i=0
        for item in "${items[@]}"; do
            IFS='|' read -r action label desc <<< "$item"
            local prefix="   "; local marker=" "
            [ "$i" = "$cursor" ] && { prefix="  ${e}[1;36m>${e}[0m"; marker="O"; }
            sb+="$prefix [$marker] ${e}[1m$label${e}[0m"$'\n'
            sb+="          ${e}[90m$desc${e}[0m"$'\n'
            i=$((i + 1))
        done
        sb+=""$'\n'
        sb+="  ${e}[90m──────────────────────────────────────────────────${e}[0m"$'\n'
        sb+="    $(build_hint "$(tr key_nav_confirm)" "LEFT back" "$(tr key_lang)" "$(tr key_exit)")"$'\n'
        write_frame "$sb"
        local key; key="$(read_key)"
        case "$key" in
            UP)    cursor=$(( cursor > 0 ? cursor - 1 : 0 )) ;;
            DOWN)  cursor=$(( cursor < n - 1 ? cursor + 1 : n - 1 )) ;;
            ENTER) done=1 ;;
            LEFT)  echo "back"; return ;;
            L)     toggle_lang ;;
            Q|ESC) exit_installer ;;
        esac
    done
    echo "${items[$cursor]%%|*}"
}

# ============================================================
#  14.  Install / Manage / Update / Uninstall Flows
# ============================================================

install_flow() {
    local source_dir="$1"; local vivaldi_dir="$2"; local app_path="$3"
    local preselected_css="$4"; local preselected_js="$5"
    local e="$ESC"
    local step_labels="$(tr step_css)|$(tr step_js)|$(tr step_confirm)"
    local total_pages=3; local current_page=0
    local pages_confirmed=(0 0 0)
    local selected_css=""; local selected_js_result=""; local final_css=""; local final_js=""
    local default_all=0; [ -z "$preselected_css" ] && [ -z "$preselected_js" ] && default_all=1

    # Build CSS items
    local css_items=()
    for item in "${STANDALONE_CSS[@]}"; do
        local name="${item%%|*}"; css_items+=("${name}|${name}|$(tr "mod_desc_${name%.*}")|0")
    done

    # Build JS items (standalone + bundled)
    local js_standalone=(); local js_bundled=()
    for item in "${STANDALONE_JS[@]}"; do IFS='|' read -r name base bundle <<< "$item"; js_standalone+=("${name}|${base}|$(tr "mod_desc_$base")|"); done
    for item in "${BUNDLED_JS[@]}"; do IFS='|' read -r name base bundle <<< "$item"; js_bundled+=("${name}|${base}|$(tr "mod_desc_$base")|${bundle:-}"); done

    while true; do
        case "$current_page" in
            0)
                set_step_info 0 "$total_pages" "$step_labels"
                PAGES_CONFIRMED=("${pages_confirmed[@]}")
                # Preserve previous selections when revisiting this page
                local css_presel="${preselected_css}"; [ -n "$selected_css" ] && css_presel="$selected_css"
                local result; result="$(select_multi "css_title" "$css_presel" "$default_all" 1 1 "${css_items[@]}")"
                _check_exit
                [ "$result" = "__BACK__" ] && { FLOW_RESULT="back_to_menu"; return; }
                [ "$result" = "__RIGHT__" ] && { [ "${pages_confirmed[0]}" = "1" ] && current_page=1; continue; }
                selected_css="$result"; pages_confirmed[0]=1; current_page=1 ;;

            1)
                set_step_info 1 "$total_pages" "$step_labels"
                PAGES_CONFIRMED=("${pages_confirmed[@]}")
                local all_js_items=("${js_standalone[@]}" "${js_bundled[@]}")
                # Preserve previous JS selections when revisiting
                local js_presel="${preselected_js}"
                [ -n "$selected_js_result" ] && js_presel="$(echo "$selected_js_result" | grep '^JS:' | sed 's/^JS://' | command tr '\n' ' ')"
                local result; result="$(select_multi_js "js_title" "$js_presel" "$default_all" 1 1 "${all_js_items[@]}")"
                _check_exit
                [ "$result" = "__BACK__" ] && { pages_confirmed[1]=0; current_page=0; continue; }
                [ "$result" = "__RIGHT__" ] && { [ "${pages_confirmed[1]}" = "1" ] && current_page=2; continue; }
                selected_js_result="$result"; pages_confirmed[1]=1; current_page=2 ;;

            2)
                # Parse JS result
                local jcss=""; local jjs=""
                while IFS= read -r line; do
                    [ -z "$line" ] && continue
                    case "$line" in JS:*) jjs="$jjs ${line#JS:}" ;; CSS:*) jcss="$jcss ${line#CSS:}" ;; esac
                done <<< "$selected_js_result"
                final_css="$(echo "$selected_css $jcss" | command tr ' ' '\n' | sort -u | command tr '\n' ' ' | sed 's/^ *//;s/ *$//')"
                final_js="ModConfig.js $(echo "$jjs" | command tr ' ' '\n' | sort -u | command tr '\n' ' ' | sed 's/^ *//;s/ *$//')"

                set_step_info 2 "$total_pages" "$step_labels"
                PAGES_CONFIRMED=("${pages_confirmed[@]}")

                local confirm_done=0; local confirm_back=0
                while [ "$confirm_done" -eq 0 ]; do
                    local sb=""
                    sb+="$(format_step_bar)"$'\n'; sb+=""$'\n'
                    sb+="  ${e}[1m$(tr summary_title)${e}[0m"$'\n'; sb+=""$'\n'
                    sb+="  $(tr summary_target): $app_path"$'\n'
                    local css_count; css_count="$(echo "$final_css" | wc -w | command tr -d ' ')"
                    local js_count; js_count="$(echo "$final_js" | wc -w | command tr -d ' ')"
                    js_count=$((js_count - 1))  # exclude ModConfig.js
                    sb+="  ${e}[32m$(tr summary_css_mods) ($css_count)${e}[0m: $(echo "$final_css" | sed 's/\.css//g')"$'\n'
                    sb+="  ${e}[32m$(tr summary_js_mods) ($js_count)${e}[0m: $(echo "$final_js" | sed 's/\.js//g')"$'\n'
                    sb+=""$'\n'
                    sb+="  ${e}[90m──────────────────────────────────────────────────${e}[0m"$'\n'
                    sb+="    ${e}[90m$(tr confirm_deploy_hint)${e}[0m"$'\n'
                    write_frame "$sb"
                    local key; key="$(read_key)"
                    case "$key" in
                        ENTER) confirm_done=1 ;;
                        LEFT)  current_page=1; confirm_done=1; confirm_back=1 ;;
                        L)     toggle_lang ;;
                        Q|ESC) exit_installer ;;
                    esac
                done
                if [ "$confirm_back" = "1" ]; then
                    # Re-parse JS selections for the JS page when going back
                    local back_js=""; while IFS= read -r line; do
                        case "$line" in JS:*) back_js="$back_js ${line#JS:}" ;; esac
                    done <<< "$selected_js_result"
                    pages_confirmed[2]=0; current_page=1; continue
                fi
                break  # Deploy immediately on ENTER
        esac
    done

    clear_content
    backup_window_html "$vivaldi_dir"
    deploy_mod_files "$source_dir" "$vivaldi_dir" "" "$final_css" "$final_js"
    inject_mod_loader "$vivaldi_dir"
    echo ""; echo "${e}[1;32m====================================================${e}[0m"
    echo "  ${e}[1;32m$(tr deploy_success)${e}[0m"
    echo "${e}[1;32m====================================================${e}[0m"
}

# ============================================================
#  15.  Manage Flow
# ============================================================

manage_flow() {
    local source_dir="$1"; local vivaldi_dir="$2"; local app_path="$3"
    local e="$ESC"
    local step_labels="$(tr step_css)|$(tr step_js)|$(tr step_confirm)"
    local total_pages=3; local current_page=0
    local pages_confirmed=(0 0 0)
    # bash 3.2 set -u: ${arr[*]} on empty array = unbound variable
    local preselected_css=""; [ "${#STATE_CSS_MODS[@]}" -gt 0 ] && preselected_css="${STATE_CSS_MODS[*]}"
    local preselected_js="";  [ "${#STATE_JS_MODS[@]}" -gt 0 ] && preselected_js="${STATE_JS_MODS[*]}"
    local selected_css=""; local selected_js_result=""

    local css_items=()
    for item in "${STANDALONE_CSS[@]}"; do local name="${item%%|*}"; css_items+=("${name}|${name}|$(tr "mod_desc_${name%.*}")|0"); done

    local js_standalone=(); local js_bundled=()
    for item in "${STANDALONE_JS[@]}"; do IFS='|' read -r name base bundle <<< "$item"; js_standalone+=("${name}|${base}|$(tr "mod_desc_$base")|"); done
    for item in "${BUNDLED_JS[@]}"; do IFS='|' read -r name base bundle <<< "$item"; js_bundled+=("${name}|${base}|$(tr "mod_desc_$base")|${bundle:-}"); done

    while true; do
        case "$current_page" in
            0) set_step_info 0 "$total_pages" "$step_labels"; PAGES_CONFIRMED=("${pages_confirmed[@]}")
                # Preserve previous selections when revisiting
                local css_presel="${preselected_css}"; [ -n "$selected_css" ] && css_presel="$selected_css"
                local result; result="$(select_multi "css_title" "$css_presel" 0 1 1 "${css_items[@]}")"
                _check_exit
                [ "$result" = "__BACK__" ] && { FLOW_RESULT="back_to_menu"; return; }
                [ "$result" = "__RIGHT__" ] && { [ "${pages_confirmed[0]}" = "1" ] && current_page=1; continue; }
                selected_css="$result"; pages_confirmed[0]=1; current_page=1 ;;
            1) set_step_info 1 "$total_pages" "$step_labels"; PAGES_CONFIRMED=("${pages_confirmed[@]}")
                local all_js_items=("${js_standalone[@]}" "${js_bundled[@]}")
                # Preserve previous JS selections when revisiting
                local js_presel="${preselected_js}"
                [ -n "$selected_js_result" ] && js_presel="$(echo "$selected_js_result" | grep '^JS:' | sed 's/^JS://' | command tr '\n' ' ')"
                local result; result="$(select_multi_js "js_title" "$js_presel" 0 1 1 "${all_js_items[@]}")"
                _check_exit
                [ "$result" = "__BACK__" ] && { pages_confirmed[1]=0; current_page=0; continue; }
                [ "$result" = "__RIGHT__" ] && { [ "${pages_confirmed[1]}" = "1" ] && current_page=2; continue; }
                selected_js_result="$result"; pages_confirmed[1]=1; current_page=2 ;;
            2)
                local jcss=""; local jjs=""
                while IFS= read -r line; do
                    case "$line" in JS:*) jjs="$jjs ${line#JS:}" ;; CSS:*) jcss="$jcss ${line#CSS:}" ;; esac
                done <<< "$selected_js_result"
                local final_css; final_css="$(echo "$selected_css $jcss" | command tr ' ' '\n' | sort -u | command tr '\n' ' ' | sed 's/^ *//;s/ *$//')"
                local final_js="ModConfig.js $(echo "$jjs" | command tr ' ' '\n' | sort -u | command tr '\n' ' ' | sed 's/^ *//;s/ *$//')"

                local new_css=""; local removed_css=""; local unchanged_css=""
                # bash 3.2 compat: guard array expansions against empty arrays + set -u
                if [ "${#STATE_CSS_MODS[@]}" -gt 0 ]; then
                    for m in $final_css; do [[ " ${STATE_CSS_MODS[*]} " =~ " $m " ]] && unchanged_css+="$m " || new_css+="$m "; done
                    for m in "${STATE_CSS_MODS[@]}"; do [[ " $final_css " =~ " $m " ]] || removed_css+="$m "; done
                else
                    new_css="$final_css"  # All CSS are new if nothing installed
                fi
                local new_js=""; local removed_js=""; local unchanged_js=""
                if [ "${#STATE_JS_MODS[@]}" -gt 0 ]; then
                    for m in $jjs; do [[ " ${STATE_JS_MODS[*]} " =~ " $m " ]] && unchanged_js+="$m " || new_js+="$m "; done
                    for m in "${STATE_JS_MODS[@]}"; do [ "$m" = "ModConfig.js" ] && continue; [[ " $jjs " =~ " $m " ]] || removed_js+="$m "; done
                else
                    new_js="$jjs"  # All JS are new if nothing installed
                fi

                set_step_info 2 "$total_pages" "$step_labels"; PAGES_CONFIRMED=("${pages_confirmed[@]}")

                local confirm_done=0; local confirm_back=0
                while [ "$confirm_done" -eq 0 ]; do
                    local has_changes=0
                    local sb=""; sb+="$(format_step_bar)"$'\n'; sb+=""$'\n'
                    sb+="  ${e}[1m$(tr manage_confirm_title)${e}[0m"$'\n'; sb+=""$'\n'
                    [ -n "$(echo "$new_css" | command tr -d ' ')" ] && { has_changes=1; sb+="  ${e}[32m$(tr manage_new_mods):${e}[0m"$'\n'; for m in $new_css; do sb+="    ${e}[32m+ $m${e}[0m"$'\n'; done; }
                    [ -n "$(echo "$new_js" | command tr -d ' ')" ] && { has_changes=1; sb+="  ${e}[32m$(tr manage_new_mods):${e}[0m"$'\n'; for m in $new_js; do sb+="    ${e}[32m+ $m${e}[0m"$'\n'; done; }
                    [ -n "$(echo "$removed_css" | command tr -d ' ')" ] && { has_changes=1; sb+="  ${e}[31m$(tr manage_removed_mods):${e}[0m"$'\n'; for m in $removed_css; do sb+="    ${e}[31m- $m${e}[0m"$'\n'; done; }
                    [ -n "$(echo "$removed_js" | command tr -d ' ')" ] && { has_changes=1; sb+="  ${e}[31m$(tr manage_removed_mods):${e}[0m"$'\n'; for m in $removed_js; do sb+="    ${e}[31m- $m${e}[0m"$'\n'; done; }
                    [ -n "$(echo "$unchanged_css" | command tr -d ' ')" ] && sb+="  ${e}[90m$(tr manage_unchanged_mods): $(echo "$unchanged_css" | sed 's/\.css//g')${e}[0m"$'\n'
                    [ -n "$(echo "$unchanged_js" | command tr -d ' ')" ] && sb+="  ${e}[90m$(tr manage_unchanged_mods): $(echo "$unchanged_js" | sed 's/\.js//g')${e}[0m"$'\n'
                    [ "$has_changes" = "0" ] && sb+="  ${e}[90m$(tr manage_no_changes)${e}[0m"$'\n'
                    sb+=""$'\n'
                    sb+="  ${e}[90m──────────────────────────────────────────────────${e}[0m"$'\n'
                    sb+="    ${e}[90m$(tr confirm_deploy_hint)${e}[0m"$'\n'
                    write_frame "$sb"
                    local key; key="$(read_key)"
                    case "$key" in
                        ENTER) confirm_done=1 ;;
                        LEFT)  current_page=1; confirm_done=1; confirm_back=1 ;;
                        L)     toggle_lang ;;
                        Q|ESC) exit_installer ;;
                    esac
                done
                if [ "$confirm_back" = "1" ]; then pages_confirmed[2]=0; current_page=1; continue; fi
                break  # Apply changes immediately
        esac
    done

    clear_content
    local user_css_dir="$vivaldi_dir/user_mods/css"; local user_js_dir="$vivaldi_dir/user_mods/js"
    for m in $removed_css; do [ -z "$m" ] && continue; rm -f "$user_css_dir/$m"; echo "  ${e}[31m- $m${e}[0m"; done
    for m in $removed_js; do [ -z "$m" ] && continue; rm -f "$user_js_dir/$m"; echo "  ${e}[31m- $m${e}[0m"; done
    deploy_mod_files "$source_dir" "$vivaldi_dir" "" "$final_css" "$final_js"
    inject_mod_loader "$vivaldi_dir"
    echo ""; echo "${e}[1;32m====================================================${e}[0m"
    echo "  ${e}[1;32m$(tr deploy_success)${e}[0m"
    echo "${e}[1;32m====================================================${e}[0m"
}

# ============================================================
#  16.  Update / Uninstall Flows
# ============================================================

do_update() {
    local source_dir="$1"; local vivaldi_dir="$2"
    clear_content; local e="$ESC"; echo ""; echo "$(tr update_checking)"
    local source_css_dir="$source_dir/CSS"; local source_js_dir="$source_dir/Javascripts"
    local user_css_dir="$vivaldi_dir/user_mods/css"; local user_js_dir="$vivaldi_dir/user_mods/js"
    local upd_css=(); local upd_js=()
    [ "${#STATE_CSS_MODS[@]}" -gt 0 ] && for mod in "${STATE_CSS_MODS[@]}"; do [ -f "$source_css_dir/$mod" ] && [ -f "$user_css_dir/$mod" ] && ! cmp -s "$source_css_dir/$mod" "$user_css_dir/$mod" 2>/dev/null && upd_css+=("$mod"); done
    [ "${#STATE_JS_MODS[@]}" -gt 0 ] && for mod in "${STATE_JS_MODS[@]}"; do [ -f "$source_js_dir/$mod" ] && [ -f "$user_js_dir/$mod" ] && ! cmp -s "$source_js_dir/$mod" "$user_js_dir/$mod" 2>/dev/null && upd_js+=("$mod"); done
    [ ${#upd_css[@]} -eq 0 ] && [ ${#upd_js[@]} -eq 0 ] && { echo ""; echo "$(tr update_no_updates)"; sleep 2; return; }

    # Build selection items
    local up_items=(); local up_selected=()
    local step_labels="$(tr update_title)|$(tr step_confirm)"
    for mod in "${upd_css[@]}"; do up_items+=("$mod|[CSS] $mod|"); up_selected+=(1); done
    for mod in "${upd_js[@]}"; do up_items+=("$mod|[JS] $mod|"); up_selected+=(1); done
    local n=${#up_items[@]}; local cursor=0; local done=0
    set_step_info 0 2 "$step_labels"
    while [ "$done" -eq 0 ]; do
        local all_sel=1; for ((j=0; j<n; j++)); do [ "${up_selected[$j]}" = "0" ] && { all_sel=0; break; }; done
        local sb=""; sb+="$(format_step_bar)"$'\n'; sb+=""$'\n'
        sb+="  ${e}[1m$(tr update_available_title)${e}[0m"$'\n'
        sb+="  $(tr update_select)"$'\n'; sb+=""$'\n'
        local tm="[x]"; [ "$all_sel" = "0" ] && tm="[ ]"
        local tp="   "; [ "$cursor" = "-1" ] && tp="  >"
        sb+="$tp ${e}[90m$tm${e}[0m ${e}[90m$(tr toggle_all)${e}[0m"$'\n'
        sb+="  ${e}[90m──────────────────────────────────────────────────${e}[0m"$'\n'
        for ((j=0; j<n; j++)); do
            IFS='|' read -r fname label desc <<< "${up_items[$j]}"
            local check="[ ]"; [ "${up_selected[$j]}" = "1" ] && check="[x]"
            local prefix="   "; [ "$j" = "$cursor" ] && prefix="  ${e}[1;36m>${e}[0m"
            sb+="$prefix $check $label${e}[0m"$'\n'
        done
        sb+=""$'\n'; sb+="  ${e}[90m──────────────────────────────────────────────────${e}[0m"$'\n'
        sb+="    $(build_hint "$(tr key_multiselect)" "ENTER confirm" "LEFT back" "$(tr key_lang)" "$(tr key_exit)")"$'\n'
        write_frame "$sb"
        local key; key="$(read_key)"
        case "$key" in
            UP)    [ "$cursor" = "-1" ] && cursor=$((n - 1)) || cursor=$(( cursor > 0 ? cursor - 1 : 0 )) ;;
            DOWN)  [ "$cursor" = "-1" ] && cursor=0 || cursor=$(( cursor < n - 1 ? cursor + 1 : n - 1 )) ;;
            SPACE) [ "$cursor" = "-1" ] && { local ns=0; [ "$all_sel" = "0" ] && ns=1; for ((j=0; j<n; j++)); do up_selected[$j]="$ns"; done; } || { [ "${up_selected[$cursor]}" = "1" ] && up_selected[$cursor]=0 || up_selected[$cursor]=1; } ;;
            A) for ((j=0; j<n; j++)); do up_selected[$j]=1; done ;;
            D) for ((j=0; j<n; j++)); do up_selected[$j]=0; done ;;
            ENTER) done=1 ;;
            LEFT)  return ;;
            L)     toggle_lang ;;
            Q|ESC) exit_installer ;;
        esac
    done

    # Confirm page
    local chosen_css=""; local chosen_js=""; local skip_css=""; local skip_js=""
    local ci=0
    for mod in "${upd_css[@]}"; do
        if [ "${up_selected[$ci]}" = "1" ]; then chosen_css+="$mod "; else skip_css+="$mod "; fi; ci=$((ci + 1)); done
    for mod in "${upd_js[@]}"; do
        if [ "${up_selected[$ci]}" = "1" ]; then chosen_js+="$mod "; else skip_js+="$mod "; fi; ci=$((ci + 1)); done

    set_step_info 1 2 "$step_labels"
    local confirm_done=0
    while [ "$confirm_done" -eq 0 ]; do
        local sb=""; sb+="$(format_step_bar)"$'\n'; sb+=""$'\n'
        sb+="  ${e}[1m$(tr update_confirm_title)${e}[0m"$'\n'; sb+=""$'\n'
        [ -n "$(echo "$chosen_css" | command tr -d ' ')" ] && { sb+="  ${e}[32m$(tr update_updated_mod):${e}[0m"$'\n'; for m in $chosen_css; do sb+="    ${e}[32m+ $m${e}[0m"$'\n'; done; }
        [ -n "$(echo "$chosen_js" | command tr -d ' ')" ] && { sb+="  ${e}[32m$(tr update_updated_mod):${e}[0m"$'\n'; for m in $chosen_js; do sb+="    ${e}[32m+ $m${e}[0m"$'\n'; done; }
        [ -n "$(echo "$skip_css" | command tr -d ' ')" ] && sb+="  ${e}[90m$(tr update_skipped): $skip_css${e}[0m"$'\n'
        [ -n "$(echo "$skip_js" | command tr -d ' ')" ] && sb+="  ${e}[90m$(tr update_skipped): $skip_js${e}[0m"$'\n'
        sb+=""$'\n'; sb+="  ${e}[90m──────────────────────────────────────────────────${e}[0m"$'\n'
        sb+="    $(build_hint "ENTER to update" "LEFT back" "$(tr key_lang)" "$(tr key_exit)")"$'\n'
        write_frame "$sb"
        local key; key="$(read_key)"
        case "$key" in ENTER) confirm_done=1 ;; LEFT) return ;; L) toggle_lang ;; Q|ESC) exit_installer ;; esac
    done

    clear_content; echo ""; echo "$(tr update_updating)"; echo ""
    local updated=0
    for mod in $chosen_css; do [ -z "$mod" ] && continue; [ -f "$source_css_dir/$mod" ] && { cp "$source_css_dir/$mod" "$user_css_dir/$mod"; echo "  ${e}[32m[$(tr update_updated_mod)]${e}[0m $mod"; updated=$((updated + 1)); }; done
    for mod in $chosen_js; do [ -z "$mod" ] && continue; [ -f "$source_js_dir/$mod" ] && { cp "$source_js_dir/$mod" "$user_js_dir/$mod"; echo "  ${e}[32m[$(tr update_updated_mod)]${e}[0m $mod"; updated=$((updated + 1)); }; done
    # Update Import.css (match PS1: rewrites @import paths)
    local import_src="$source_dir/Import.css"; [ ! -f "$import_src" ] && import_src="$source_css_dir/Import.css"
    if [ -f "$import_src" ]; then
        cp "$import_src" "$user_css_dir/Import.css"
        { sed -i '' 's|@import "CSS/|@import "|g' "$user_css_dir/Import.css" 2>/dev/null; } || { sed -i 's|@import "CSS/|@import "|g' "$user_css_dir/Import.css" 2>/dev/null; } || true
    fi
    # Update injectMods.js (match PS1: loader may have changed)
    local inj_src="$source_dir/injectMods.js"
    [ ! -f "$inj_src" ] && inj_src="$(dirname "$source_dir")/injectMods.js"
    [ ! -f "$inj_src" ] && [ -n "$REPO_ROOT" ] && inj_src="$REPO_ROOT/injectMods.js"
    [ -f "$inj_src" ] && cp "$inj_src" "$vivaldi_dir/injectMods.js"
    inject_mod_loader "$vivaldi_dir"
    echo ""; echo "${e}[1;32m$(trf update_complete "$updated")${e}[0m"
}

do_uninstall() {
    local vivaldi_dir="$1"; local app_path="$2"
    clear_content; local e="$ESC"
    local items=("full|$(tr uninstall_full)|$(tr uninstall_full_desc)" "selective|$(tr uninstall_selective)|$(tr uninstall_selective_desc)")
    local cursor=0; local done=0
    set_step_info 0 0 ""
    while [ "$done" -eq 0 ]; do
        local sb=""; sb+=""$'\n'
        sb+="  ${e}[1m$(tr uninstall_title)${e}[0m"$'\n'; sb+=""$'\n'
        sb+="  $(tr uninstall_type_prompt)"$'\n'; sb+=""$'\n'
        local i=0
        for item in "${items[@]}"; do
            IFS='|' read -r action label desc <<< "$item"
            local prefix="   "; local marker=" "
            [ "$i" = "$cursor" ] && { prefix="  >"; marker="O"; }
            sb+="$prefix [$marker] ${e}[1m$label${e}[0m"$'\n'
            sb+="          $desc"$'\n'
            i=$((i + 1))
        done
        sb+=""$'\n'; sb+="  ${e}[90m──────────────────────────────────────────────────${e}[0m"$'\n'
        sb+="    $(build_hint "$(tr key_nav_confirm)" "LEFT back" "$(tr key_lang)" "$(tr key_exit)")"$'\n'
        write_frame "$sb"
        local key; key="$(read_key)"
        case "$key" in
            UP) cursor=$(( cursor > 0 ? cursor - 1 : 0 )) ;;
            DOWN) cursor=$(( cursor < 1 ? cursor + 1 : 1 )) ;;
            ENTER) done=1 ;;
            LEFT) return ;;
            L) toggle_lang ;;
            Q|ESC) exit_installer ;;
        esac
    done

    local action="${items[$cursor]%%|*}"
    if [ "$action" = "full" ]; then
        clear_content; echo ""; echo "${e}[1;31m$(tr uninstall_full_confirm)${e}[0m [Y/N]"
        local key; key="$(read_key)"
        if [ "$key" != "Y" ] && [ "$key" != "ENTER" ]; then echo ""; echo "$(tr uninstall_cancelled)"; return; fi
        local html_path="$vivaldi_dir/window.html"; local bak_path="${html_path}.bak"
        local user_mods_dir="$vivaldi_dir/user_mods"; local injector_path="$vivaldi_dir/injectMods.js"
        echo ""; echo "$(tr uninstall_restoring)"
        if [ -f "$bak_path" ]; then cp "$bak_path" "$html_path"; echo "  Restored from $bak_path"
        else echo "  $(tr uninstall_no_bak)"; fi
        [ -f "$injector_path" ] && rm -f "$injector_path"
        echo "$(tr uninstall_removing)"; [ -d "$user_mods_dir" ] && rm -rf "$user_mods_dir"
        echo ""; echo "${e}[1;32m$(tr uninstall_complete)${e}[0m"
    else
        manage_flow "$SOURCE_DIR" "$vivaldi_dir" "$app_path"
    fi
}

# ============================================================
#  17.  Main Entry Point
# ============================================================

main() {
    show_banner; tput civis 2>/dev/null || true

    # Show loading indicator while discovery runs (find + mdfind can take seconds)
    tty_printf "${ESC}[8;0H${ESC}[K  Searching for Vivaldi installations...\n"

    # Discover Vivaldi installations
    local all_installs; all_installs="$(find_vivaldi_installations)"
    [ -z "$all_installs" ] && { tty_printf "${ESC}[8;0H${ESC}[K  %s\n" "$(tr target_none_found)"; tput cnorm 2>/dev/null || true; return 1; }

    # Build target items
    local target_items=()
    while IFS='|' read -r app_path resources_dir display_name version; do
        [ -z "$resources_dir" ] && continue
        local is_system=0; [[ "$resources_dir" == /Applications/* ]] && is_system=1
        target_items+=("$display_name $version|$resources_dir|$is_system")
    done <<< "$all_installs"

    set_step_info 0 1 "$(tr step_target)"
    local selected_idx; selected_idx="$(select_single "target_title" 0 "${target_items[@]}")"
    [ "$selected_idx" = "0" ] && [ "$selected_idx" != "0" ] && exit_installer  # __BACK__ guard
    [ -z "$selected_idx" ] && exit_installer
    [ "$EXIT_REQUESTED" = 1 ] && return

    # Extract selected install
    local idx=0; local selected_app=""; local selected_vivaldi_dir=""; local selected_display=""
    while IFS='|' read -r app_path resources_dir display_name version; do
        [ -z "$resources_dir" ] && continue
        if [ "$idx" = "$selected_idx" ]; then
            selected_app="$app_path"; selected_vivaldi_dir="$resources_dir"; selected_display="$display_name"
            break
        fi; idx=$((idx + 1))
    done <<< "$all_installs"

    local vivaldi_dir="$selected_vivaldi_dir"; local app_path="$selected_app"
    local is_installed=0; is_installed "$vivaldi_dir" && is_installed=1
    local has_state=0; get_install_state "$vivaldi_dir" 2>/dev/null && has_state=1

    # Cross-version restore check
    local persistent_dir="$vivaldi_dir/../../.vivaldimods"
    [ ! -d "$persistent_dir" ] && persistent_dir="$(dirname "$(dirname "$vivaldi_dir")")/.vivaldimods"
    local has_persist=0
    [ "$is_installed" = "0" ] && find_persistent_mods "$persistent_dir" 2>/dev/null && has_persist=1

    while true; do  # Top-level loop: re-evaluate state after uninstall
    if [ "$is_installed" = "1" ] && [ "$has_state" = "1" ]; then
        # --- Already installed ---
        while true; do
            local action; action="$(entry_menu 1)"
            _check_exit
            local result=""
            case "$action" in
                manage) ensure_mod_source || break; manage_flow "$SOURCE_DIR" "$vivaldi_dir" "$app_path"
                        [ "$FLOW_RESULT" = "back_to_menu" ] && { FLOW_RESULT=""; continue; }; result="done" ;;
                update) ensure_mod_source || break; do_update "$SOURCE_DIR" "$vivaldi_dir"; result="done" ;;
                uninstall) do_uninstall "$vivaldi_dir" "$app_path"
                    # Re-check state after uninstall — may have removed everything
                    is_installed=0; is_installed "$vivaldi_dir" && is_installed=1
                    has_state=0; get_install_state "$vivaldi_dir" 2>/dev/null && has_state=1
                    if [ "$is_installed" = "0" ]; then
                        # Full uninstall done — drop to fresh install menu
                        result="uninstalled"
                    fi ;;
                exit) exit_installer ;;
                back)
                    selected_idx="$(select_single "target_title" 0 "${target_items[@]}")"
                    _check_exit
                    idx=0
                    while IFS='|' read -r ap rd dn ver; do
                        [ -z "$rd" ] && continue
                        [ "$idx" = "$selected_idx" ] && { selected_app="$ap"; selected_vivaldi_dir="$rd"; selected_display="$dn"; break; }; idx=$((idx + 1))
                    done <<< "$all_installs"
                    vivaldi_dir="$selected_vivaldi_dir"; app_path="$selected_app"
                    is_installed=0; is_installed "$vivaldi_dir" && is_installed=1
                    has_state=0; get_install_state "$vivaldi_dir" 2>/dev/null && has_state=1
                    ;;
            esac
            _check_exit
            [ -n "$result" ] && break
            [ "$EXIT_REQUESTED" = 1 ] && break
        done
        if [ "$result" = "uninstalled" ]; then
            # Full uninstall just completed — restart Vivaldi to pick up restored window.html,
            # then loop back to show the fresh install menu (Install/Exit only)
            post_install "$app_path"
            result=""
            continue
        fi
        post_install "$app_path"
        break

    elif [ "$has_persist" = "1" ]; then
        # --- Cross-version restore ---
        clear_content; local e="$ESC"
        echo ""; echo "${e}[1;33m$(tr restore_detected)${e}[0m"; echo ""
        echo "  $(trf restore_prompt "$PERSIST_VERSION")"; echo ""
        echo "  $(trf entry_installed_count "${#PERSIST_CSS_MODS[@]}" "${#PERSIST_JS_MODS[@]}")"
        local restore_items=("restore|$(tr restore_option)" "fresh|$(tr restore_fresh)")
        local rc=0; local rdone=0
        while [ "$rdone" -eq 0 ]; do
            local sb=""; sb+=""$'\n'; sb+="  $(tr entry_choose_action)"$'\n'; sb+=""$'\n'
            local ri=0
            for ritem in "${restore_items[@]}"; do
                local rlabel="${ritem#*|}"; local prefix="   "
                [ "$ri" = "$rc" ] && prefix="  >"
                sb+="$prefix $rlabel"$'\n'
                ri=$((ri + 1))
            done
            sb+=""$'\n'; sb+="  ${e}[90m──────────────────────────────────────────────────${e}[0m"$'\n'
            sb+="    ENTER confirm | Q/ESC quit"$'\n'
            write_frame "$sb"
            local key; key="$(read_key)"
            case "$key" in
                UP) rc=0 ;;
                DOWN) rc=1 ;;
                ENTER) rdone=1 ;;
                Q|ESC) exit_installer ;;
            esac
        done
        if [ "${restore_items[$rc]%%|*}" = "restore" ]; then
            backup_window_html "$vivaldi_dir"
            restore_from_persistence "$vivaldi_dir"
            inject_mod_loader "$vivaldi_dir"
            echo ""; echo "${e}[1;32m====================================================${e}[0m"
            echo "  ${e}[1;32m$(tr deploy_success)${e}[0m"
            echo "${e}[1;32m====================================================${e}[0m"
            post_install "$app_path"
        else
            local action; action="$(entry_menu 0)"
            _check_exit
            if [ "$action" = "install" ]; then
                ensure_mod_source || return 1
                install_flow "$SOURCE_DIR" "$vivaldi_dir" "$app_path" "" ""
                post_install "$app_path"
            else exit_installer; fi
        fi
    else
        # --- Fresh install ---
        while true; do
            local action; action="$(entry_menu 0)"
            _check_exit
            if [ "$action" = "install" ]; then
                ensure_mod_source || break
                install_flow "$SOURCE_DIR" "$vivaldi_dir" "$app_path" "" ""
                [ "$FLOW_RESULT" = "back_to_menu" ] && { FLOW_RESULT=""; continue; }
                post_install "$app_path"
            else exit_installer; fi
            break
        done
    fi
        break  # Exit top-level loop (fresh install complete or exit)
    done  # End top-level while loop
    echo ""
}

main "$@"
