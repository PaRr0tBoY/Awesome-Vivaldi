#!/usr/bin/env bash
# ==UserScript==
# @name         Awesome Vivaldi Installer (macOS)
# @description  TUI installer for Awesome Vivaldi modpack on macOS.
# @version      2026.7.7
# @author       Ryan (Acid)
# @website      https://github.com/PaRr0tBoY/Awesome-Vivaldi
# ==/UserScript==
#
# install.sh — macOS TUI installer for Awesome Vivaldi
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/PaRr0tBoY/Awesome-Vivaldi/main/install.sh | bash
#
# Or run locally from the repo root:
#   bash install.sh
#
# Requirements: bash 3.2+, curl, unzip, tput

set -euo pipefail

# ============================================================
#  0.  Bootstrap
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$SCRIPT_DIR"
SOURCE_DIR=""
TEMP_DIR=""

# State tracking (initialized empty for set -u safety)
STATE_CSS_MODS=()
STATE_JS_MODS=()
STATE_VERSION=""

# Detect if running inside the repo
is_local_mode() {
    [ -d "$REPO_ROOT/Vivaldi8.0Stable" ]
}

cleanup() {
    stty echo icanon 2>/dev/null || true
    tput cnorm 2>/dev/null || true
    if [ -n "$TEMP_DIR" ] && [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
    fi
}
trap cleanup EXIT

# ============================================================
#  1.  Language Detection
# ============================================================

LANG_CODE="${LANG:-en_US.UTF-8}"
LANG_CODE="${LANG_CODE%%.*}"
LANG_PREFIX="${LANG_CODE%%_*}"

if [ "$LANG_PREFIX" = "zh" ]; then
    UI_LANG="zh"
else
    UI_LANG="en"
fi

# ============================================================
#  2.  i18n (bash 3.2 compatible — case/esac functions)
# ============================================================

tr() {
    if [ "$UI_LANG" = "zh" ]; then
        case "$1" in
            installer_title)          echo "Awesome Vivaldi · 社区模组包安装器" ;;
            keybind_nav_confirm)      echo "↑↓ 导航 | ENTER 确认 | ESC 取消" ;;
            keybind_multiselect)      echo "↑↓ 导航 | SPACE 勾选 | A 全选 | D 全不选 | ENTER 确认" ;;
            keybind_radio)            echo "↑↓ 导航 | ENTER 确认 | ESC 取消" ;;
            toggle_all)               echo "(全选/全不选)" ;;
            reentry_title)            echo "检测到已安装 Awesome Vivaldi" ;;
            reentry_installed_count)  echo "当前已安装: {0} 个 CSS 模组, {1} 个 JS 模组" ;;
            reentry_prompt)           echo "请选择操作:" ;;
            reentry_path)             echo "安装路径" ;;
            reentry_update)           echo "更新" ;;
            reentry_update_desc)      echo "检查模组是否有新版本，自动拉取替换所有已安装模组" ;;
            reentry_manage)           echo "管理" ;;
            reentry_manage_desc)      echo "重新进入安装界面，自由增删模组" ;;
            reentry_uninstall)        echo "卸载" ;;
            reentry_uninstall_desc)   echo "完全移除所有模组，恢复 Vivaldi 初始状态" ;;
            target_title)             echo "发现以下 Vivaldi 安装，请选择要安装到哪个:" ;;
            target_path)              echo "路径" ;;
            target_type)              echo "类型" ;;
            target_type_system)       echo "系统级安装" ;;
            target_type_user)         echo "用户级安装" ;;
            target_none_found)        echo "未发现 Vivaldi 安装. 请先安装 Vivaldi 浏览器." ;;
            css_title)                echo "选择要安装的 CSS 模组（默认全选）" ;;
            css_locked_section)       echo "以下模组与 JS 模组联动，请前往下一步选择" ;;
            css_locked_tag)           echo "(联动)" ;;
            js_title)                 echo "选择要安装的 JavaScript 模组（默认全选）" ;;
            js_bundled_section)       echo "以下模组附带 CSS 模组:" ;;
            js_bundled_arrow)         echo "CSS" ;;
            summary_title)            echo "安装确认" ;;
            summary_target)           echo "目标" ;;
            summary_css_mods)         echo "CSS 模组" ;;
            summary_js_mods)          echo "JS 模组" ;;
            summary_bundled_tag)      echo "(联动)" ;;
            backup_start)             echo "正在备份 window.html..." ;;
            backup_done)              echo "已备份到" ;;
            inject_start)             echo "正在注入模组加载器..." ;;
            inject_done)              echo "已注入 injectMods.js" ;;
            inject_skip)              echo "injectMods.js 已存在，跳过注入" ;;
            deploy_start)             echo "正在部署模组文件..." ;;
            install_complete)         echo "安装完成! 请重启 Vivaldi 以生效." ;;
            restart_prompt)           echo "是否现在重启 Vivaldi? [Y] 是  [N] 否" ;;
            update_title)             echo "正在更新 Awesome Vivaldi..." ;;
            update_fetching)          echo "正在拉取最新模组..." ;;
            update_comparing)         echo "正在对比已安装模组..." ;;
            update_updated)           echo "已更新" ;;
            update_unchanged)         echo "未变化" ;;
            manage_title)             echo "管理已安装模组" ;;
            uninstall_title)          echo "卸载 Awesome Vivaldi" ;;
            uninstall_confirm)        echo "确定要卸载所有 Awesome Vivaldi 模组吗? [Y/N]" ;;
            uninstall_restoring)      echo "正在恢复原始 window.html..." ;;
            uninstall_removing)       echo "正在移除模组文件..." ;;
            uninstall_complete)       echo "卸载完成. Vivaldi 已恢复初始状态." ;;
            uninstall_no_bak)         echo "未找到备份文件，无法恢复原始 window.html." ;;
            uninstall_no_mods)        echo "未检测到 Awesome Vivaldi 安装. 无需卸载." ;;
            error_admin_required)     echo "需要管理员权限." ;;
            error_permission)         echo "权限不足，请以 sudo 运行." ;;
            source_downloading)       echo "正在下载 Awesome Vivaldi 模组包..." ;;
            source_extracting)        echo "正在解压模组文件..." ;;
            source_done)              echo "模组文件准备就绪." ;;
            separator_line)           echo "________________________________________" ;;
            orphan_label)             echo "[孤儿模组]" ;;

            # Mod descriptions (CSS)
            mod_desc_AdaptiveBF)             echo "无用的前进/后退按钮自动隐藏" ;;
            mod_desc_BetterAnimation)        echo "页面滚动橡皮筋回弹更平滑" ;;
            mod_desc_BtnHoverAnime)          echo "工具栏按钮悬停有微动效" ;;
            mod_desc_DownloadPanel)          echo "下载面板适配暗色主题" ;;
            mod_desc_Extensions)             echo "扩展菜单改为紧凑列表布局" ;;
            mod_desc_FavouriteTabs)          echo "前9个固定标签以网格展示 (Arc 风格)" ;;
            mod_desc_FindInPage)             echo "页内搜索栏改为浮动悬浮式" ;;
            mod_desc_LineBreak)              echo "长文本自动换行 (小屏幕实用)" ;;
            mod_desc_PeekTabbar)             echo "标签栏隐藏时鼠标触边滑出" ;;
            mod_desc_Quietify)               echo "静音图标淡化，减少视觉干扰" ;;
            mod_desc_RemoveClutter)          echo "隐藏滚动条、分割线等视觉噪音" ;;
            mod_desc_TabsTrail)              echo "当前标签显示绿色指示条" ;;
            mod_desc_VivalArc)               echo "Arc 浏览器风格移植 (实验性)" ;;
            mod_desc_VividQC)                echo "快速命令面板样式美化" ;;
            mod_desc_TidyTabs_CSS)           echo "AI 分组标签的样式支持" ;;
            mod_desc_VividPlayer_CSS)        echo "Vivaldi 内置播放器美化" ;;
            mod_desc_VividToast_CSS)         echo "Toast 通知弹窗的样式" ;;
            mod_desc_PinnedTabRestore_CSS)   echo "固定标签恢复按钮样式" ;;
            mod_desc_InteractionFeedback_CSS) echo "按钮点击等交互反馈动效" ;;
            mod_desc_VividPeek_CSS)          echo "Arc Peek 弹出窗口样式" ;;

            # Mod descriptions (JS)
            mod_desc_ModConfig)              echo "*核心* 共享设置面板 (AI Key / 模组参数)" ;;
            mod_desc_AskOnPage)              echo "AI 侧边栏: 网页问答、摘要、改写" ;;
            mod_desc_AutoHidePanel)          echo "侧边栏鼠标离开后自动收起" ;;
            mod_desc_EasyFiles)              echo "附件拖拽时自动列出剪贴板+下载文件" ;;
            mod_desc_MonochromeIcons)        echo "Web 面板图标统一为单色风格" ;;
            mod_desc_QuickCapture)           echo "截图时自动识别并选中网页区域" ;;
            mod_desc_TabManager)             echo "工作区标签管理面板，批量操作标签" ;;
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

            *) echo "" ;;
        esac
    else
        case "$1" in
            installer_title)          echo "Awesome Vivaldi · Community Modpack Installer" ;;
            keybind_nav_confirm)      echo "↑↓ navigate | ENTER confirm | ESC cancel" ;;
            keybind_multiselect)      echo "↑↓ navigate | SPACE toggle | A select-all | D deselect-all | ENTER confirm" ;;
            keybind_radio)            echo "↑↓ navigate | ENTER confirm | ESC cancel" ;;
            toggle_all)               echo "(Select All / Deselect All)" ;;
            reentry_title)            echo "Detected existing Awesome Vivaldi installation" ;;
            reentry_installed_count)  echo "Currently installed: {0} CSS mods, {1} JS mods" ;;
            reentry_prompt)           echo "Choose an action:" ;;
            reentry_path)             echo "Install path" ;;
            reentry_update)           echo "Update" ;;
            reentry_update_desc)      echo "Fetch latest mods and replace installed ones" ;;
            reentry_manage)           echo "Manage" ;;
            reentry_manage_desc)      echo "Reopen selection to add or remove mods" ;;
            reentry_uninstall)        echo "Uninstall" ;;
            reentry_uninstall_desc)   echo "Remove all mods, restore original Vivaldi" ;;
            target_title)             echo "Found the following Vivaldi installations. Choose target:" ;;
            target_path)              echo "Path" ;;
            target_type)              echo "Type" ;;
            target_type_system)       echo "System-wide" ;;
            target_type_user)         echo "User install" ;;
            target_none_found)        echo "No Vivaldi installation found. Please install Vivaldi first." ;;
            css_title)                echo "Select CSS mods to install (all selected by default)" ;;
            css_locked_section)       echo "These mods are bundled with JS mods. Select in the next step." ;;
            css_locked_tag)           echo "(bundled)" ;;
            js_title)                 echo "Select JavaScript mods to install (all selected by default)" ;;
            js_bundled_section)       echo "These mods include CSS mods:" ;;
            js_bundled_arrow)         echo "CSS" ;;
            summary_title)            echo "Installation Summary" ;;
            summary_target)           echo "Target" ;;
            summary_css_mods)         echo "CSS mods" ;;
            summary_js_mods)          echo "JS mods" ;;
            summary_bundled_tag)      echo "(bundled)" ;;
            backup_start)             echo "Backing up window.html..." ;;
            backup_done)              echo "Backed up to" ;;
            inject_start)             echo "Injecting mod loader..." ;;
            inject_done)              echo "injectMods.js injected" ;;
            inject_skip)              echo "injectMods.js already present, skipping injection" ;;
            deploy_start)             echo "Deploying mod files..." ;;
            install_complete)         echo "Installation complete! Restart Vivaldi to take effect." ;;
            restart_prompt)           echo "Restart Vivaldi now? [Y] Yes  [N] No" ;;
            update_title)             echo "Updating Awesome Vivaldi..." ;;
            update_fetching)          echo "Fetching latest mods..." ;;
            update_comparing)         echo "Comparing with installed mods..." ;;
            update_updated)           echo "updated" ;;
            update_unchanged)         echo "unchanged" ;;
            manage_title)             echo "Manage installed mods" ;;
            uninstall_title)          echo "Uninstall Awesome Vivaldi" ;;
            uninstall_confirm)        echo "Are you sure you want to uninstall all Awesome Vivaldi mods? [Y/N]" ;;
            uninstall_restoring)      echo "Restoring original window.html..." ;;
            uninstall_removing)       echo "Removing mod files..." ;;
            uninstall_complete)       echo "Uninstall complete. Vivaldi is back to its original state." ;;
            uninstall_no_bak)         echo "Backup file not found. Cannot restore original window.html." ;;
            uninstall_no_mods)        echo "No Awesome Vivaldi installation detected. Nothing to uninstall." ;;
            error_admin_required)     echo "Administrator privileges required." ;;
            error_permission)         echo "Permission denied. Try running with sudo." ;;
            source_downloading)       echo "Downloading Awesome Vivaldi modpack..." ;;
            source_extracting)        echo "Extracting mod files..." ;;
            source_done)              echo "Mod files ready." ;;
            separator_line)           echo "________________________________________" ;;
            orphan_label)             echo "[orphan]" ;;

            # Mod descriptions (CSS)
            mod_desc_AdaptiveBF)             echo "Auto-hide back/forward buttons when unnecessary" ;;
            mod_desc_BetterAnimation)        echo "Smoother overscroll bounce animation" ;;
            mod_desc_BtnHoverAnime)          echo "Toolbar button hover micro-animation" ;;
            mod_desc_DownloadPanel)          echo "Download panel dark theme adaptation" ;;
            mod_desc_Extensions)             echo "Compact list layout for extensions menu" ;;
            mod_desc_FavouriteTabs)          echo "First 9 pinned tabs displayed as grid (Arc-style)" ;;
            mod_desc_FindInPage)             echo "Floating find-in-page bar" ;;
            mod_desc_LineBreak)              echo "Long text auto-wrap (useful for small screens)" ;;
            mod_desc_PeekTabbar)             echo "Slide-out tab bar on hover when hidden" ;;
            mod_desc_Quietify)               echo "Subtle audio indicator, less visual noise" ;;
            mod_desc_RemoveClutter)          echo "Hide scrollbars, dividers and visual clutter" ;;
            mod_desc_TabsTrail)              echo "Green accent trail on active/hovered tabs" ;;
            mod_desc_VivalArc)               echo "Arc browser style port (experimental)" ;;
            mod_desc_VividQC)                echo "Quick command panel styling" ;;
            mod_desc_TidyTabs_CSS)           echo "AI tab grouping style support" ;;
            mod_desc_VividPlayer_CSS)        echo "Vivaldi built-in player beautification" ;;
            mod_desc_VividToast_CSS)         echo "Toast notification popup styling" ;;
            mod_desc_PinnedTabRestore_CSS)   echo "Pinned tab restore button styling" ;;
            mod_desc_InteractionFeedback_CSS) echo "Button click micro-feedback animation" ;;
            mod_desc_VividPeek_CSS)          echo "Arc Peek popup window styling" ;;

            # Mod descriptions (JS)
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

            *) echo "" ;;
        esac
    fi
}

# Format string with one arg
trf() {
    local key="$1"
    local arg="$2"
    local msg
    msg="$(tr "$key")"
    # Replace {0} with arg using awk (no bash 4 sed needed)
    echo "$msg" | awk -v replacement="$arg" '{gsub(/\{0\}/, replacement); print}'
}

# ============================================================
#  3.  ASCII Banner
# ============================================================

show_banner() {
    echo ""
    echo "▄████▄ ▄▄   ▄▄ ▄▄▄▄▄  ▄▄▄▄  ▄▄▄  ▄▄   ▄▄ ▄▄▄▄▄   ██  ██ ▄▄ ▄▄ ▄▄  ▄▄▄  ▄▄    ▄▄▄▄  ▄▄"
    echo "██▄▄██ ██ ▄ ██ ██▄▄  ███▄▄ ██▀██ ██▀▄▀██ ██▄▄    ██▄▄██ ██ ██▄██ ██▀██ ██    ██▀██ ██"
    echo "██  ██  ▀█▀█▀  ██▄▄▄ ▄▄██▀ ▀███▀ ██   ██ ██▄▄▄    ▀██▀  ██  ▀█▀  ██▀██ ██▄▄▄ ████▀ ██"
    echo ""
    echo "                              $(tr installer_title)"
    echo ""
}

# ============================================================
#  4.  Source Acquisition
# ============================================================

find_mod_source() {
    if is_local_mode; then
        SOURCE_DIR="$REPO_ROOT/Vivaldi8.0Stable"
        return
    fi

    echo "$(tr source_downloading)"
    TEMP_DIR="$(mktemp -d)"
    local zip_url="https://github.com/PaRr0tBoY/Awesome-Vivaldi/archive/refs/heads/main.zip"
    local zip_path="$TEMP_DIR/repo.zip"

    if ! curl -fsSL -o "$zip_path" "$zip_url"; then
        echo "ERROR: Failed to download modpack. Check your internet connection."
        exit 1
    fi

    echo "$(tr source_extracting)"
    unzip -qo "$zip_path" -d "$TEMP_DIR"

    # Find extracted directory
    local extracted
    extracted="$(find "$TEMP_DIR" -maxdepth 1 -type d -name "Awesome-Vivaldi-*" | head -1)"
    if [ -z "$extracted" ]; then
        echo "ERROR: Failed to extract modpack archive."
        exit 1
    fi

    SOURCE_DIR="$extracted/Vivaldi8.0Stable"
    echo "$(tr source_done)"
}

# ============================================================
#  5.  Vivaldi Installation Discovery
# ============================================================

find_vivaldi_installations() {
    local found=()
    local seen=()

    # Method 1: find Framework directories
    while IFS= read -r -d '' framework; do
        # Navigate up from "Vivaldi Framework.framework/Versions/A/" to Resources/vivaldi/
        local resources_dir="${framework}/Resources/vivaldi"
        if [ -f "$resources_dir/window.html" ]; then
            # Determine .app path
            local app_path
            app_path="$(echo "$framework" | sed 's|/Contents/Frameworks/Vivaldi Framework.framework/Versions/[^/]*||')"
            local app_name
            app_name="$(basename "$app_path" .app)"

            local display_name="Vivaldi"
            case "$app_name" in
                *Snapshot*) display_name="Vivaldi Snapshot" ;;
                *snapshot*) display_name="Vivaldi Snapshot" ;;
                *)          display_name="Vivaldi Stable" ;;
            esac

            local version=""
            if [ -f "$app_path/Contents/Info.plist" ]; then
                version="$(plutil -extract CFBundleShortVersionString raw "$app_path/Contents/Info.plist" 2>/dev/null || echo "unknown")"
            fi

            local key="${resources_dir}"
            if [[ ! " ${seen[*]} " =~ " ${key} " ]]; then
                seen+=("$key")
                found+=("${app_path}|${resources_dir}|${display_name}|${version}")
            fi
        fi
    done < <(find /Applications "$HOME/Applications" -type d -name "Vivaldi Framework.framework" -print0 2>/dev/null)

    # Method 2: mdfind (fallback)
    if [ ${#found[@]} -eq 0 ]; then
        while IFS= read -r html_path; do
            if [[ "$html_path" == *"Vivaldi"* ]] && [[ "$html_path" == *"Resources/vivaldi/window.html" ]]; then
                local resources_dir
                resources_dir="$(dirname "$html_path")"
                local framework
                framework="$(dirname "$(dirname "$resources_dir")")"
                local app_path
                app_path="$(echo "$framework" | sed 's|/Contents/Frameworks/Vivaldi Framework.framework/Versions/[^/]*||')"
                local app_name
                app_name="$(basename "$app_path" .app)"
                local display_name="Vivaldi"
                case "$app_name" in
                    *Snapshot*) display_name="Vivaldi Snapshot" ;;
                    *)          display_name="Vivaldi Stable" ;;
                esac
                local version=""
                if [ -f "$app_path/Contents/Info.plist" ]; then
                    version="$(plutil -extract CFBundleShortVersionString raw "$app_path/Contents/Info.plist" 2>/dev/null || echo "unknown")"
                fi
                local key="${resources_dir}"
                if [[ ! " ${seen[*]} " =~ " ${key} " ]]; then
                    seen+=("$key")
                    found+=("${app_path}|${resources_dir}|${display_name}|${version}")
                fi
            fi
        done < <(mdfind "kMDItemFSName == 'window.html'" 2>/dev/null || true)
    fi

    printf '%s\n' "${found[@]}"
}

# ============================================================
#  6.  Mod Scanning
# ============================================================

# Returns mod lists as global arrays because bash 3.2 can't return complex data
scan_mods() {
    local source_dir="$1"

    local css_dir="$source_dir/CSS"
    local js_dir="$source_dir/Javascripts"

    # Collect CSS files
    STANDALONE_CSS_FILES=()
    BUNDLED_CSS_FILES=()
    STANDALONE_CSS_BASES=()
    BUNDLED_CSS_BASES=()

    # Collect JS files
    STANDALONE_JS_FILES=()
    BUNDLED_JS_FILES=()
    STANDALONE_JS_BASES=()
    BUNDLED_JS_BASES=()

    # Build base name maps
    local css_bases=()
    local js_bases=()

    if [ -d "$css_dir" ]; then
        for f in "$css_dir"/*.css; do
            [ -f "$f" ] || continue
            local name
            name="$(basename "$f")"
            local base="${name%.css}"
            css_bases+=("$base")
        done
    fi

    if [ -d "$js_dir" ]; then
        for f in "$js_dir"/*.js; do
            [ -f "$f" ] || continue
            local name
            name="$(basename "$f")"
            local base="${name%.js}"

            # Skip ModConfig.js — always auto-installed
            [ "$name" = "ModConfig.js" ] && continue

            js_bases+=("$base")
        done
    fi

    # Detect bundles
    BUNDLE_KEYS=()
    for cb in "${css_bases[@]}"; do
        for jb in "${js_bases[@]}"; do
            if [ "$cb" = "$jb" ]; then
                BUNDLE_KEYS+=("$cb")
                break
            fi
        done
    done

    # Helper: is key in BUNDLE_KEYS?
    _is_bundled() {
        local key="$1"
        for bk in "${BUNDLE_KEYS[@]}"; do
            [ "$bk" = "$key" ] && return 0
        done
        return 1
    }

    # Categorize CSS
    for f in "$css_dir"/*.css; do
        [ -f "$f" ] || continue
        local name
        name="$(basename "$f")"
        local base="${name%.css}"

        if _is_bundled "$base"; then
            BUNDLED_CSS_FILES+=("$name")
            BUNDLED_CSS_BASES+=("$base")
        else
            STANDALONE_CSS_FILES+=("$name")
            STANDALONE_CSS_BASES+=("$base")
        fi
    done

    # Categorize JS
    for f in "$js_dir"/*.js; do
        [ -f "$f" ] || continue
        local name
        name="$(basename "$f")"
        local base="${name%.js}"

        [ "$name" = "ModConfig.js" ] && continue

        if _is_bundled "$base"; then
            BUNDLED_JS_FILES+=("$name")
            BUNDLED_JS_BASES+=("$base")
        else
            STANDALONE_JS_FILES+=("$name")
            STANDALONE_JS_BASES+=("$base")
        fi
    done

    # Sort arrays (simplified sort)
    IFS=$'\n' STANDALONE_CSS_FILES=($(sort <<<"${STANDALONE_CSS_FILES[*]}"))
    IFS=$'\n' BUNDLED_CSS_FILES=($(sort <<<"${BUNDLED_CSS_FILES[*]}"))
    IFS=$'\n' STANDALONE_JS_FILES=($(sort <<<"${STANDALONE_JS_FILES[*]}"))
    IFS=$'\n' BUNDLED_JS_FILES=($(sort <<<"${BUNDLED_JS_FILES[*]}"))
}

# Get description for a mod by base name and type
mod_desc() {
    local base="$1"
    local is_bundled="$2"  # "css_bundled" | "js_bundled" | "standalone"
    local key

    if [ "$is_bundled" = "css_bundled" ]; then
        key="mod_desc_${base}_CSS"
    else
        key="mod_desc_${base}"
    fi

    local desc
    desc="$(tr "$key")"
    echo "$desc"
}

# ============================================================
#  7.  Installation State
# ============================================================

get_install_state() {
    local vivaldi_dir="$1"
    local state_file="$vivaldi_dir/user_mods/.awesome-vivaldi.json"

    [ -f "$state_file" ] || return 1

    # Parse with awk (no jq dependency)
    STATE_CSS_MODS=()
    STATE_JS_MODS=()
    STATE_VERSION=""

    # Use python if available, otherwise awk
    if command -v python3 &>/dev/null; then
        local css_json js_json
        css_json="$(python3 -c "
import json, sys
with open('$state_file') as f:
    d = json.load(f)
print(' '.join(d.get('css_mods', [])))
" 2>/dev/null)"
        js_json="$(python3 -c "
import json, sys
with open('$state_file') as f:
    d = json.load(f)
print(' '.join(d.get('js_mods', [])))
" 2>/dev/null)"
        STATE_CSS_MODS=($css_json)
        STATE_JS_MODS=($js_json)
    else
        # Fallback: crude grep-based extraction
        local css_line js_line
        css_line="$(grep -o '"css_mods"[[:space:]]*:[[:space:]]*\[[^]]*\]' "$state_file" 2>/dev/null || true)"
        js_line="$(grep -o '"js_mods"[[:space:]]*:[[:space:]]*\[[^]]*\]' "$state_file" 2>/dev/null || true)"
        # Extract quoted strings
        while IFS='"' read -r _ val _; do
            [ -n "$val" ] && STATE_CSS_MODS+=("$val")
        done < <(echo "$css_line" | grep -o '"[^"]*"')
        while IFS='"' read -r _ val _; do
            [ -n "$val" ] && STATE_JS_MODS+=("$val")
        done < <(echo "$js_line" | grep -o '"[^"]*"')
    fi

    return 0
}

is_installed() {
    local vivaldi_dir="$1"
    [ -d "$vivaldi_dir/user_mods" ]
}

# ============================================================
#  8.  TUI Framework
# ============================================================

# Read a single keypress, handling arrow keys
read_key() {
    stty -echo -icanon 2>/dev/null || true
    local key
    IFS= read -rsn1 key 2>/dev/null || true

    if [ "$key" = $'\x1b' ]; then
        # Could be ESC or arrow key sequence
        local esc_rest
        read -rsn2 -t 0.01 esc_rest 2>/dev/null || true
        if [ "$esc_rest" = '[A' ]; then
            echo "UP"
        elif [ "$esc_rest" = '[B' ]; then
            echo "DOWN"
        elif [ "$esc_rest" = '[C' ]; then
            echo "RIGHT"
        elif [ "$esc_rest" = '[D' ]; then
            echo "LEFT"
        else
            echo "ESC"
        fi
    elif [ "$key" = '' ]; then
        echo "ENTER"
    elif [ "$key" = ' ' ]; then
        echo "SPACE"
    elif [ "$key" = 'a' ] || [ "$key" = 'A' ]; then
        echo "A"
    elif [ "$key" = 'd' ] || [ "$key" = 'D' ]; then
        echo "D"
    elif [ "$key" = 'y' ] || [ "$key" = 'Y' ]; then
        echo "Y"
    elif [ "$key" = 'n' ] || [ "$key" = 'N' ]; then
        echo "N"
    else
        echo "OTHER"
    fi
    stty echo icanon 2>/dev/null || true
}

# Single-select (radio) TUI
select_single() {
    local title="$1"
    shift
    local keybind_hint="$1"
    shift
    # Remaining args are "Label|Detail" pairs
    local items=("$@")
    local n=${#items[@]}

    if [ "$n" -eq 0 ]; then
        echo "$(tr target_none_found)"
        exit 1
    fi

    if [ "$n" -eq 1 ]; then
        echo "0"
        return
    fi

    local cursor=0
    local done=0

    while [ "$done" -eq 0 ]; do
        tput cup 0 0 2>/dev/null
        tput ed 2>/dev/null

        echo ""
        echo "  $title"
        echo ""

        local i=0
        for item in "${items[@]}"; do
            local label="${item%%|*}"
            local detail="${item#*|}"

            if [ "$i" -eq "$cursor" ]; then
                echo "  > [O] $label"
            else
                echo "    [ ] $label"
            fi
            if [ -n "$detail" ] && [ "$detail" != "$item" ]; then
                echo "          $detail"
            fi
            ((i++))
        done

        echo ""
        echo "  $(tr separator_line)"
        echo "    $keybind_hint"

        local key
        key="$(read_key)"
        case "$key" in
            UP)    cursor=$(( cursor > 0 ? cursor - 1 : 0 )) ;;
            DOWN)  cursor=$(( cursor < n - 1 ? cursor + 1 : n - 1 )) ;;
            ENTER) done=1 ;;
            ESC)   echo ""; echo "Cancelled."; cleanup; exit 0 ;;
        esac
    done

    echo "$cursor"
}

# Multi-select (checkbox) TUI — returns space-separated list of selected indices
select_multi() {
    local title="$1"
    local keybind_hint="$2"
    local preselect_mode="$3"  # "all", "none", or "list:file1 file2..."
    shift 3
    # Remaining args: "FileName|DisplayLabel|Description|IsLocked" (IsLocked: 0 or 1)
    local items=("$@")
    local n=${#items[@]}

    [ "$n" -eq 0 ] && return

    local selected=()
    local locked=()
    local filenames=()
    local labels=()
    local descs=()

    local i=0
    for item in "${items[@]}"; do
        IFS='|' read -r fname label desc locked_flag <<< "$item"
        filenames+=("$fname")
        labels+=("$label")
        descs+=("$desc")
        locked+=("$locked_flag")

        if [ "$preselect_mode" = "all" ]; then
            selected+=(1)
        elif [ "$preselect_mode" = "none" ]; then
            selected+=(0)
        else
            # Check if this file is in the preselect list
            local ps_files="${preselect_mode#list:}"
            if [[ " $ps_files " =~ " $fname " ]]; then
                selected+=(1)
            else
                selected+=(0)
            fi
        fi
        ((i++))
    done

    local cursor=0
    local done=0

    while [ "$done" -eq 0 ]; do
        tput cup 0 0 2>/dev/null
        tput ed 2>/dev/null

        echo ""
        echo "  $title"
        echo ""

        # Select-all toggle line
        local selectable_count=0
        local all_selected=1
        for i in $(seq 0 $((n - 1))); do
            [ "${locked[$i]}" = "1" ] && continue
            ((selectable_count++))
            [ "${selected[$i]}" = "0" ] && all_selected=0
        done

        if [ "$selectable_count" -gt 0 ]; then
            local toggle_mark="[ ]"
            [ "$all_selected" = "1" ] && toggle_mark="[x]"
            local toggle_prefix="   "
            [ "$cursor" = "-1" ] && toggle_prefix="  >"
            echo "$toggle_prefix $toggle_mark $(tr toggle_all)"
            echo "  $(tr separator_line)"
        fi

        for i in $(seq 0 $((n - 1))); do
            local check="[ ]"
            [ "${selected[$i]}" = "1" ] && check="[x]"

            local prefix="   "
            [ "$i" = "$cursor" ] && prefix="  >"

            local lock_tag=""
            [ "${locked[$i]}" = "1" ] && lock_tag=" $(tr css_locked_tag)"

            local desc_str=""
            [ -n "${descs[$i]}" ] && desc_str="  —  ${descs[$i]}"

            echo "$prefix $check ${labels[$i]}$lock_tag$desc_str"
        done

        echo ""
        echo "  $(tr separator_line)"
        echo "    $keybind_hint"

        local key
        key="$(read_key)"
        case "$key" in
            UP)
                if [ "$cursor" = "-1" ]; then cursor=$((n - 1))
                else cursor=$(( cursor > 0 ? cursor - 1 : 0 )); fi
                ;;
            DOWN)
                if [ "$cursor" = "-1" ]; then cursor=0
                else cursor=$(( cursor < n - 1 ? cursor + 1 : n - 1 )); fi
                ;;
            SPACE)
                if [ "$cursor" = "-1" ]; then
                    local new_state=0
                    [ "$all_selected" = "0" ] && new_state=1
                    for i in $(seq 0 $((n - 1))); do
                        [ "${locked[$i]}" = "1" ] && continue
                        selected[$i]=$new_state
                    done
                elif [ "${locked[$cursor]}" != "1" ]; then
                    [ "${selected[$cursor]}" = "1" ] && selected[$cursor]=0 || selected[$cursor]=1
                fi
                ;;
            A)  for i in $(seq 0 $((n - 1))); do
                    [ "${locked[$i]}" != "1" ] && selected[$i]=1
                done ;;
            D)  for i in $(seq 0 $((n - 1))); do
                    [ "${locked[$i]}" != "1" ] && selected[$i]=0
                done ;;
            ENTER) done=1 ;;
            ESC)   echo ""; echo "Cancelled."; cleanup; exit 0 ;;
        esac
    done

    # Return selected file names
    for i in $(seq 0 $((n - 1))); do
        [ "${selected[$i]}" = "1" ] && echo "${filenames[$i]}"
    done
}

# JS multi-select with bundled CSS management
select_multi_js() {
    local title="$1"
    local keybind_hint="$2"
    local preselect_mode="$3"
    shift 3
    # Items: "FileName|DisplayLabel|Description|BundlePair"
    # BundlePair is empty for standalone, or the CSS filename for bundled
    local items=("$@")
    local n=${#items[@]}

    [ "$n" -eq 0 ] && return

    local selected=()
    local filenames=()
    local labels=()
    local descs=()
    local bundle_pairs=()

    local i=0
    for item in "${items[@]}"; do
        IFS='|' read -r fname label desc bundle <<< "$item"
        filenames+=("$fname")
        labels+=("$label")
        descs+=("$desc")
        bundle_pairs+=("$bundle")

        if [ "$preselect_mode" = "all" ]; then
            selected+=(1)
        elif [ "$preselect_mode" = "none" ]; then
            selected+=(0)
        else
            local ps_files="${preselect_mode#list:}"
            if [[ " $ps_files " =~ " $fname " ]]; then
                selected+=(1)
            else
                selected+=(0)
            fi
        fi
        ((i++))
    done

    local cursor=0
    local done=0

    while [ "$done" -eq 0 ]; do
        tput cup 0 0 2>/dev/null
        tput ed 2>/dev/null

        echo ""
        echo "  $title"
        echo ""

        # Select-all toggle
        local all_selected=1
        for i in $(seq 0 $((n - 1))); do
            [ "${selected[$i]}" = "0" ] && all_selected=0
        done
        local toggle_mark="[ ]"
        [ "$all_selected" = "1" ] && toggle_mark="[x]"
        local toggle_prefix="   "
        [ "$cursor" = "-1" ] && toggle_prefix="  >"
        echo "$toggle_prefix $toggle_mark $(tr toggle_all)"
        echo "  $(tr separator_line)"

        for i in $(seq 0 $((n - 1))); do
            local check="[ ]"
            [ "${selected[$i]}" = "1" ] && check="[x]"
            local prefix="   "
            [ "$i" = "$cursor" ] && prefix="  >"

            local bundle_tag=""
            [ -n "${bundle_pairs[$i]}" ] && bundle_tag="  -> $(tr js_bundled_arrow): ${bundle_pairs[$i]}"

            local desc_str=""
            [ -n "${descs[$i]}" ] && desc_str="  —  ${descs[$i]}"

            echo "$prefix $check ${labels[$i]}$bundle_tag$desc_str"
        done

        echo ""
        echo "  $(tr separator_line)"
        echo "    $keybind_hint"

        local key
        key="$(read_key)"
        case "$key" in
            UP)
                [ "$cursor" = "-1" ] && cursor=$((n - 1)) || cursor=$(( cursor > 0 ? cursor - 1 : 0 ))
                ;;
            DOWN)
                [ "$cursor" = "-1" ] && cursor=0 || cursor=$(( cursor < n - 1 ? cursor + 1 : n - 1 ))
                ;;
            SPACE)
                if [ "$cursor" = "-1" ]; then
                    local ns=0; [ "$all_selected" = "0" ] && ns=1
                    for i in $(seq 0 $((n - 1))); do selected[$i]=$ns; done
                else
                    [ "${selected[$cursor]}" = "1" ] && selected[$cursor]=0 || selected[$cursor]=1
                fi
                ;;
            A) for i in $(seq 0 $((n - 1))); do selected[$i]=1; done ;;
            D) for i in $(seq 0 $((n - 1))); do selected[$i]=0; done ;;
            ENTER) done=1 ;;
            ESC)   echo ""; echo "Cancelled."; cleanup; exit 0 ;;
        esac
    done

    # Return selected JS filenames and their bundled CSS filenames
    for i in $(seq 0 $((n - 1))); do
        if [ "${selected[$i]}" = "1" ]; then
            echo "JS:${filenames[$i]}"
            [ -n "${bundle_pairs[$i]}" ] && echo "CSS:${bundle_pairs[$i]}"
        fi
    done
}

# ============================================================
#  9.  Deploy Functions
# ============================================================

detect_sed() {
    # Detect GNU vs BSD sed
    if sed --version 2>/dev/null | grep -q GNU; then
        SED_INPLACE=(-i)
    else
        SED_INPLACE=(-i '')
    fi
}

backup_window_html() {
    local vivaldi_dir="$1"
    local html_path="$vivaldi_dir/window.html"
    local bak_path="${html_path}.bak"

    echo "$(tr backup_start)"
    if [ ! -f "$bak_path" ]; then
        cp "$html_path" "$bak_path"
    fi
    echo "$(tr backup_done) $bak_path"
}

inject_mod_loader() {
    local vivaldi_dir="$1"
    local html_path="$vivaldi_dir/window.html"

    echo "$(tr inject_start)"

    # Check if already injected
    if grep -q 'injectMods\.js' "$html_path" 2>/dev/null; then
        echo "$(tr inject_skip)"
        return
    fi

    detect_sed

    # Insert after <body> line
    sed "${SED_INPLACE[@]}" '/<body[^>]*>/a\
  <script src="injectMods.js"></script>' "$html_path"

    echo "$(tr inject_done)"
}

deploy_mod_files() {
    local source_dir="$1"
    local vivaldi_dir="$2"
    local css_mods_str="$3"  # space-separated
    local js_mods_str="$4"   # space-separated

    echo "$(tr deploy_start)"

    local user_mods_dir="$vivaldi_dir/user_mods"
    local user_css_dir="$user_mods_dir/css"
    local user_js_dir="$user_mods_dir/js"

    mkdir -p "$user_css_dir" "$user_js_dir"

    local source_css_dir="$source_dir/CSS"
    local source_js_dir="$source_dir/Javascripts"

    # Deploy injectMods.js
    local injector_src="$REPO_ROOT/injectMods.js"
    [ ! -f "$injector_src" ] && injector_src="$(dirname "$source_dir")/injectMods.js"
    [ -f "$injector_src" ] && cp "$injector_src" "$vivaldi_dir/injectMods.js"

    # Copy Import.css
    local import_src="$source_dir/Import.css"
    [ ! -f "$import_src" ] && import_src="$source_css_dir/Import.css"
    if [ -f "$import_src" ]; then
        cp "$import_src" "$user_css_dir/Import.css"
        # Rewrite @import paths: "CSS/Foo.css" → "Foo.css" (files are flat in user_mods/css/)
        detect_sed
        sed "${SED_INPLACE[@]}" 's|@import "CSS/|@import "|g' "$user_css_dir/Import.css"
    fi

    # Deploy CSS
    local css_count=0
    read -ra css_arr <<< "$css_mods_str"
    for mod in "${css_arr[@]}"; do
        [ -z "$mod" ] && continue
        local src="$source_css_dir/$mod"
        if [ -f "$src" ]; then
            cp "$src" "$user_css_dir/$mod"
            ((css_count++))
        fi
    done

    # Deploy JS
    local js_count=0
    read -ra js_arr <<< "$js_mods_str"
    for mod in "${js_arr[@]}"; do
        [ -z "$mod" ] && continue
        local src="$source_js_dir/$mod"
        if [ -f "$src" ]; then
            cp "$src" "$user_js_dir/$mod"
            ((js_count++))
        fi
    done

    echo "  $css_count CSS mod(s) deployed to user_mods/css/"
    echo "  $js_count JS mod(s) deployed to user_mods/js/"

    # Write state file
    local state_path="$user_mods_dir/.awesome-vivaldi.json"
    local installed_at
    installed_at="$(date -u +"%Y-%m-%dT%H:%M:%S")"

    # Build JSON manually (no jq dependency)
    cat > "$state_path" << STATEEOF
{
  "version": "8.0",
  "installed_at": "$installed_at",
  "css_mods": [$(for m in "${css_arr[@]}"; do [ -n "$m" ] && echo "\"$m\","; done | sed '$ s/,$//')],
  "js_mods": [$(for m in "${js_arr[@]}"; do [ -n "$m" ] && echo "\"$m\","; done | sed '$ s/,$//')]
}
STATEEOF
}

# ============================================================
#  10.  Update / Manage / Uninstall
# ============================================================

do_update() {
    local source_dir="$1"
    local vivaldi_dir="$2"

    echo ""
    echo "$(tr update_title)"
    echo ""
    echo "$(tr update_fetching)"
    echo "$(tr update_comparing)"

    local user_css_dir="$vivaldi_dir/user_mods/css"
    local user_js_dir="$vivaldi_dir/user_mods/js"
    local source_css_dir="$source_dir/CSS"
    local source_js_dir="$source_dir/Javascripts"

    local updated=0
    local unchanged=0

    # Update CSS
    for mod in "${STATE_CSS_MODS[@]}"; do
        local src="$source_css_dir/$mod"
        local dst="$user_css_dir/$mod"
        if [ -f "$src" ]; then
            if ! cmp -s "$src" "$dst" 2>/dev/null; then
                cp "$src" "$dst"
                echo "  [$(tr update_updated)] $mod"
                ((updated++))
            else
                echo "  [$(tr update_unchanged)] $mod"
                ((unchanged++))
            fi
        else
            echo "  $(tr orphan_label) $mod"
        fi
    done

    # Update JS
    for mod in "${STATE_JS_MODS[@]}"; do
        local src="$source_js_dir/$mod"
        local dst="$user_js_dir/$mod"
        if [ -f "$src" ]; then
            if ! cmp -s "$src" "$dst" 2>/dev/null; then
                cp "$src" "$dst"
                echo "  [$(tr update_updated)] $mod"
                ((updated++))
            else
                echo "  [$(tr update_unchanged)] $mod"
                ((unchanged++))
            fi
        else
            echo "  $(tr orphan_label) $mod"
        fi
    done

    # Re-deploy injectMods.js
    local injector_src="$REPO_ROOT/injectMods.js"
    [ ! -f "$injector_src" ] && injector_src="$(dirname "$source_dir")/injectMods.js"
    [ -f "$injector_src" ] && cp "$injector_src" "$vivaldi_dir/injectMods.js"

    # Re-inject window.html
    inject_mod_loader "$vivaldi_dir"

    echo ""
    echo "$(trf update_complete "$updated")"
}

do_manage() {
    local source_dir="$1"
    local vivaldi_dir="$2"

    echo ""
    echo "$(tr manage_title)"
    echo ""

    scan_mods "$source_dir"

    # Build CSS selection items
    local css_items=()
    for name in "${STANDALONE_CSS_FILES[@]}"; do
        local base="${name%.css}"
        css_items+=("${name}|${name}|$(mod_desc "$base" standalone)|0")
    done
    for name in "${BUNDLED_CSS_FILES[@]}"; do
        local base="${name%.css}"
        css_items+=("${name}|${name} $(tr css_locked_tag)|$(mod_desc "$base" css_bundled)|1")
    done

    # Build preselect list from state
    local ps_css=""
    for m in "${STATE_CSS_MODS[@]}"; do
        ps_css="$ps_css $m"
    done

    local selected_css
    selected_css="$(select_multi "$(tr css_title)" "$(tr keybind_multiselect)" "list:$ps_css" "${css_items[@]}")"

    # Build JS selection items
    local js_items=()
    for name in "${STANDALONE_JS_FILES[@]}"; do
        local base="${name%.js}"
        js_items+=("${name}|${name}|$(mod_desc "$base" standalone)|")
    done
    for name in "${BUNDLED_JS_FILES[@]}"; do
        local base="${name%.js}"
        local css_name="${name%.js}.css"
        js_items+=("${name}|${name}|$(mod_desc "$base" js_bundled)|${css_name}")
    done

    local ps_js=""
    for m in "${STATE_JS_MODS[@]}"; do
        ps_js="$ps_js $m"
    done

    local js_result
    js_result="$(select_multi_js "$(tr js_title)" "$(tr keybind_multiselect)" "list:$ps_js" "${js_items[@]}")"

    # Parse JS selection result
    local final_css="$selected_css"
    local final_js=""
    while IFS= read -r line; do
        [ -z "$line" ] && continue
        case "$line" in
            JS:*)  final_js="$final_js ${line#JS:}" ;;
            CSS:*) final_css="$final_css ${line#CSS:}" ;;
        esac
    done <<< "$js_result"

    # Always include ModConfig.js
    final_js="ModConfig.js $final_js"

    # Compute removals
    local css_to_remove=""
    local js_to_remove=""
    for m in "${STATE_CSS_MODS[@]}"; do
        if [[ ! " $final_css " =~ " $m " ]]; then
            css_to_remove="$css_to_remove $m"
        fi
    done
    for m in "${STATE_JS_MODS[@]}"; do
        if [[ ! " $final_js " =~ " $m " ]]; then
            js_to_remove="$js_to_remove $m"
        fi
    done

    local user_css_dir="$vivaldi_dir/user_mods/css"
    local user_js_dir="$vivaldi_dir/user_mods/js"

    # Remove deselected mods
    for m in $css_to_remove; do
        [ -z "$m" ] && continue
        rm -f "$user_css_dir/$m"
        echo "  - $m (removed)"
    done
    for m in $js_to_remove; do
        [ -z "$m" ] && continue
        rm -f "$user_js_dir/$m"
        echo "  - $m (removed)"
    done

    # Deploy new/updated selection
    deploy_mod_files "$source_dir" "$vivaldi_dir" "$final_css" "$final_js"
}

do_uninstall() {
    local vivaldi_dir="$1"

    echo ""
    echo "$(tr uninstall_title)"
    echo ""

    echo -n "$(tr uninstall_confirm) "
    local key
    key="$(read_key)"
    echo ""
    if [ "$key" != "Y" ]; then
        echo "Cancelled."
        return
    fi

    local html_path="$vivaldi_dir/window.html"
    local bak_path="${html_path}.bak"
    local user_mods_dir="$vivaldi_dir/user_mods"
    local injector_path="$vivaldi_dir/injectMods.js"

    echo "$(tr uninstall_restoring)"
    if [ -f "$bak_path" ]; then
        cp "$bak_path" "$html_path"
        echo "  Restored from $bak_path"
    else
        echo "  $(tr uninstall_no_bak)"
    fi

    [ -f "$injector_path" ] && rm -f "$injector_path"

    echo "$(tr uninstall_removing)"
    [ -d "$user_mods_dir" ] && rm -rf "$user_mods_dir"

    echo ""
    echo "$(tr uninstall_complete)"
}

# ============================================================
#  11.  Main Menu (Re-entry)
# ============================================================

show_main_menu() {
    local vivaldi_dir="$1"

    local items=(
        "$(tr reentry_update)|$(tr reentry_update_desc)|update"
        "$(tr reentry_manage)|$(tr reentry_manage_desc)|manage"
        "$(tr reentry_uninstall)|$(tr reentry_uninstall_desc)|uninstall"
    )

    local cursor=0
    local done=0

    while [ "$done" -eq 0 ]; do
        tput cup 0 0 2>/dev/null
        tput ed 2>/dev/null

        echo ""
        echo "  $(tr reentry_title)"
        echo ""
        echo "  $(tr reentry_installed_count)" | sed "s/{0}/${#STATE_CSS_MODS[@]}/;s/{1}/${#STATE_JS_MODS[@]}/"
        echo "  $(tr reentry_path): $vivaldi_dir"
        echo ""
        echo "  $(tr reentry_prompt)"
        echo ""

        local i=0
        for item in "${items[@]}"; do
            local label="${item%%|*}"
            local rest="${item#*|}"
            local desc="${rest%|*}"
            local prefix="   "
            [ "$i" = "$cursor" ] && prefix="  >"
            echo "$prefix $label  —  $desc"
            ((i++))
        done

        echo ""
        echo "  $(tr separator_line)"
        echo "    $(tr keybind_radio)"

        local key
        key="$(read_key)"
        case "$key" in
            UP)    cursor=$(( cursor > 0 ? cursor - 1 : 0 )) ;;
            DOWN)  cursor=$(( cursor < 2 ? cursor + 1 : 2 )) ;;
            ENTER) done=1 ;;
            ESC)   echo ""; echo "Goodbye."; cleanup; exit 0 ;;
        esac
    done

    # Return action
    local action="${items[$cursor]##*|}"
    echo "$action"
}

# ============================================================
#  12.  Main Entry Point
# ============================================================

main() {
    show_banner

    find_mod_source
    if [ ! -d "$SOURCE_DIR" ]; then
        echo "ERROR: Could not locate mod source files."
        exit 1
    fi

    scan_mods "$SOURCE_DIR"

    # Discover Vivaldi installations
    local all_installs
    all_installs="$(find_vivaldi_installations)"

    if [ -z "$all_installs" ]; then
        echo ""
        echo "$(tr target_none_found)"
        exit 1
    fi

    # Build target selection items
    local target_items=()
    while IFS='|' read -r app_path resources_dir display_name version; do
        [ -z "$resources_dir" ] && continue
        local type_label
        if [[ "$resources_dir" == /Applications/* ]]; then
            type_label="$(tr target_type_system)"
        else
            type_label="$(tr target_type_user)"
        fi
        target_items+=("$display_name $version|$(tr target_path): $resources_dir  |  $(tr target_type): $type_label")
    done <<< "$all_installs"

    local selected_idx
    selected_idx="$(select_single "$(tr target_title)" "$(tr keybind_radio)" "${target_items[@]}")"

    # Extract selected installation
    local idx=0
    local selected_app=""
    local selected_resources=""
    local selected_display=""
    local selected_version=""
    while IFS='|' read -r app_path resources_dir display_name version; do
        [ -z "$resources_dir" ] && continue
        if [ "$idx" = "$selected_idx" ]; then
            selected_app="$app_path"
            selected_resources="$resources_dir"
            selected_display="$display_name"
            selected_version="$version"
            break
        fi
        ((idx++))
    done <<< "$all_installs"

    local vivaldi_dir="$selected_resources"

    # Check if already installed
    if is_installed "$vivaldi_dir" && get_install_state "$vivaldi_dir"; then
        # Re-entry menu
        local action
        action="$(show_main_menu "$vivaldi_dir")"

        case "$action" in
            update)
                do_update "$SOURCE_DIR" "$vivaldi_dir"
                ;;
            manage)
                do_manage "$SOURCE_DIR" "$vivaldi_dir"
                ;;
            uninstall)
                do_uninstall "$vivaldi_dir"
                exit 0
                ;;
        esac
    else
        # ── Fresh install ──

        # CSS selection
        local css_items=()
        for name in "${STANDALONE_CSS_FILES[@]}"; do
            local base="${name%.css}"
            css_items+=("${name}|${name}|$(mod_desc "$base" standalone)|0")
        done
        for name in "${BUNDLED_CSS_FILES[@]}"; do
            local base="${name%.css}"
            css_items+=("${name}|${name}|$(mod_desc "$base" css_bundled)|1")
        done

        local selected_css
        selected_css="$(select_multi "$(tr css_title)" "$(tr keybind_multiselect)" "all" "${css_items[@]}")"

        # JS selection
        local js_items=()
        for name in "${STANDALONE_JS_FILES[@]}"; do
            local base="${name%.js}"
            js_items+=("${name}|${name}|$(mod_desc "$base" standalone)|")
        done
        for name in "${BUNDLED_JS_FILES[@]}"; do
            local base="${name%.js}"
            local css_name="${name%.js}.css"
            js_items+=("${name}|${name}|$(mod_desc "$base" js_bundled)|${css_name}")
        done

        local js_result
        js_result="$(select_multi_js "$(tr js_title)" "$(tr keybind_multiselect)" "all" "${js_items[@]}")"

        # Combine results
        local final_css="$selected_css"
        local final_js=""
        while IFS= read -r line; do
            [ -z "$line" ] && continue
            case "$line" in
                JS:*)  final_js="$final_js ${line#JS:}" ;;
                CSS:*) final_css="$final_css ${line#CSS:}" ;;
            esac
        done <<< "$js_result"

        # Always include ModConfig.js
        final_js="ModConfig.js $final_js"

        # Summary
        echo ""
        echo "  $(tr summary_title)"
        echo ""
        echo "  $(tr summary_target): $selected_display $selected_version"
        echo "  $(tr summary_target) $(tr target_path): $vivaldi_dir"
        echo ""
        echo "  $(tr summary_css_mods): $(echo "$final_css" | wc -w | tr -d ' ')"
        echo "  $(tr summary_js_mods): $(echo "$final_js" | wc -w | tr -d ' ')"
        echo ""

        # Deploy
        backup_window_html "$vivaldi_dir"
        deploy_mod_files "$SOURCE_DIR" "$vivaldi_dir" "$final_css" "$final_js"
        inject_mod_loader "$vivaldi_dir"

        echo ""
        echo "===================================================="
        echo "  $(tr install_complete)"
        echo "===================================================="

        # Restart prompt
        echo ""
        echo -n "$(tr restart_prompt) "
        local restart_key
        restart_key="$(read_key)"
        echo ""
        if [ "$restart_key" = "Y" ]; then
            echo "  Restarting Vivaldi..."
            open "$selected_app" --args --debug-packed-apps --silent-debugger-extension-api
        fi
    fi

    echo ""
}

main "$@"
