<# ==UserScript==
 * @name         Awesome Vivaldi Installer (Windows)
 * @description  Zero-dependency TUI installer for Awesome Vivaldi modpack.
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
$Script:Esc = [char]27
$Script:RepoRoot = if ($PSScriptRoot) { $PSScriptRoot } else { $null }
$Script:SourceDir = $null
$Script:TempDir = $null
$Script:LastRenderLines = 0
$Script:BannerHeight = 0
$Script:CachedModSource = $null

# ============================================================
#  1.  i18n 
# ============================================================

$Script:Loc = @{
	en = [ordered]@{
		# ── Banner ──
		installer_title    = "Awesome Vivaldi : Community Modpack Installer"

		# ── Entry ──
		entry_installed_title    = "Awesome Vivaldi is already installed"
		entry_not_installed_title = "Awesome Vivaldi is not yet installed"
		entry_choose_action      = "Choose an action:"
		entry_install            = "Install"
		entry_install_desc       = "Select and install mods"
		entry_manage             = "Manage"
		entry_manage_desc        = "Add or remove mods"
		entry_update             = "Update"
		entry_update_desc        = "Check for and apply mod updates"
		entry_uninstall          = "Uninstall"
		entry_uninstall_desc     = "Remove some or all mods"
		entry_exit               = "Exit"
		entry_exit_desc          = "Quit installer"
		entry_installed_count    = "Currently installed: {0} CSS mods, {1} JS mods"

		# ── Target selection ──
		target_title          = "Select Vivaldi installation target:"
		target_path           = "Path"
		target_type           = "Type"
		target_type_system    = "System-wide (admin required)"
		target_type_user      = "User install"
		target_none_found     = "No Vivaldi installation found. Please install Vivaldi first."

		# ── CSS selection ──
		css_title          = "Select CSS mods"
		css_locked_section = "Bundled with JS mods — select in next step"
		css_locked_tag     = "(bundled)"

		# ── JS selection ──
		js_title           = "Select JavaScript mods"
		js_bundled_section = "-- The following mods include CSS mods: --"
		js_bundled_arrow   = "CSS"

		# ── Summary / Confirm ──
		summary_title        = "Installation Summary"
		summary_target       = "Target"
		summary_css_mods     = "CSS mods"
		summary_js_mods      = "JS mods"
		summary_bundled_tag  = "(bundled)"
		confirm_deploy_hint  = "ENTER to deploy | LEFT/RIGHT switch page | ESC/Q quit"

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
		uninstall_no_mods       = "No Awesome Vivaldi installation detected. Nothing to uninstall."

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

		# ── Post-install ──
		post_vivaldi_running   = "Vivaldi is currently running."
		post_restart_prompt    = "Restart Vivaldi now? [Y] Yes  [N] No"
		post_launch_prompt     = "Launch Vivaldi now? [Y] Yes  [N] No"
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

		# ── Source acquisition ──
		source_downloading = "Downloading Awesome Vivaldi modpack..."
		source_extracting  = "Extracting mod files..."
		source_done        = "Mod files ready."

		# ── Keybind hints ──
		key_nav_confirm     = "UP/DOWN navigate | ENTER confirm | ESC/Q quit"
		key_multiselect     = "UP/DOWN navigate | SPACE toggle | A all | D none"
		key_confirm_back    = "ENTER confirm | LEFT back"
		key_exit            = "ESC/Q quit"
		toggle_all          = "(Select All / Deselect All)"

		# ── Misc ──
		separator       = "________________________________________"
		orphan_label    = "[orphan]"
		bundled_indent  = "  ├─ CSS: "

		# ── Step labels ──
		step_target     = "Target"
		step_css        = "CSS"
		step_js         = "JS"
		step_confirm    = "Confirm"

		# ── Mod descriptions (CSS standalone) ──
		mod_desc_AdaptiveBF      = "Auto-hide back/forward buttons when unnecessary"
		mod_desc_BetterAnimation = "Smoother overscroll bounce + tabbar retract animation"
		mod_desc_BtnHoverAnime   = "Toolbar button hover micro-animation"
		mod_desc_DownloadPanel   = "Download panel dark theme adaptation"
		mod_desc_Extensions      = "Compact list layout for extensions menu"
		mod_desc_FavouriteTabs   = "First 9 pinned tabs displayed as grid (Arc-style)"
		mod_desc_FindInPage      = "Floating find-in-page bar"
		mod_desc_LineBreak       = "Long text auto-wrap (useful for small screens)"
		mod_desc_PeekTabbar      = "Slide-out tab bar on hover when hidden"
		mod_desc_Quietify        = "Subtle audio indicator, less visual noise"
		mod_desc_RemoveClutter   = "Hide scrollbars, dividers and visual clutter"
		mod_desc_TabsTrail       = "Green accent trail on active/hovered tabs"
		mod_desc_VivalArc        = "Arc browser style port (experimental)"
		mod_desc_VividQC         = "Quick command panel styling"

		# ── Mod descriptions (CSS bundled) ──
		mod_desc_TidyTabs_CSS           = "AI tab grouping style support"
		mod_desc_VividPlayer_CSS        = "Vivaldi built-in player beautification"
		mod_desc_VividToast_CSS         = "Toast notification popup styling"
		mod_desc_PinnedTabRestore_CSS   = "Pinned tab restore button styling"
		mod_desc_InteractionFeedback_CSS = "Button click micro-feedback animation"
		mod_desc_VividPeek_CSS          = "Arc Peek popup window styling"

		# ── Mod descriptions (JS) ──
		mod_desc_ModConfig              = "*Core* Shared settings panel (AI keys / mod params)"
		mod_desc_AskOnPage              = "AI sidebar: page Q&A, summary, rewrite"
		mod_desc_AutoHidePanel          = "Auto-collapse side panel on mouse leave"
		mod_desc_EasyFiles              = "Quick file attach via clipboard & downloads"
		mod_desc_MonochromeIcons        = "Unified monochrome web panel icons"
		mod_desc_QuickCapture           = "Smart area selection for screenshots"
		mod_desc_TabManager             = "Workspace tab management panel"
		mod_desc_TidyAddress            = "AI rewrites address bar URLs to short titles"
		mod_desc_TidyDownloads          = "AI cleans up garbled download filenames"
		mod_desc_TidyTitles             = "AI condenses tab titles to meaningful phrases"
		mod_desc_WorkspaceThemeSwitcher = "Auto-switch theme per workspace"
		mod_desc_TidyTabs               = "AI auto-groups related tabs"
		mod_desc_VividPeek              = "Arc-style popup page preview"
		mod_desc_VividPlayer            = "Floating video player popup"
		mod_desc_VividToast             = "Toast-style notification popups"
		mod_desc_PinnedTabRestore       = "Right-click to restore recently closed pinned tabs"
		mod_desc_InteractionFeedback    = "Button click micro-feedback animation"
	}
}

function tr($key) {
	if (-not $key) { return "" }
	$table = $Script:Loc['en']
	if ($table -and $table.Contains($key)) { return $table[$key] }
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
	"TidyAddress.js"        = $true
	"TabManager.js"         = $true
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
	"FindInPage.css",
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
	"VividPlayer.js",
	"VividToast.js",
	"WorkspaceThemeSwitcher.js"
)

# ============================================================
#  2.  ASCII Banner
# ============================================================

function Show-Banner {
	Clear-Host
	Write-Host ""
	Write-Host "▄████▄ ▄▄   ▄▄ ▄▄▄▄▄  ▄▄▄▄  ▄▄▄  ▄▄   ▄▄ ▄▄▄▄▄   ██  ██ ▄▄ ▄▄ ▄▄  ▄▄▄  ▄▄    ▄▄▄▄  ▄▄" -ForegroundColor DarkGreen
	Write-Host "██▄▄██ ██ ▄ ██ ██▄▄  ███▄▄ ██▀██ ██▀▄▀██ ██▄▄    ██▄▄██ ██ ██▄██ ██▀██ ██    ██▀██ ██" -ForegroundColor Green
	Write-Host "██  ██  ▀█▀█▀  ██▄▄▄ ▄▄██▀ ▀███▀ ██   ██ ██▄▄▄    ▀██▀  ██  ▀█▀  ██▀██ ██▄▄▄ ████▀ ██" -ForegroundColor DarkGreen
	Write-Host ""
	Write-Host "                              $(tr installer_title)" -ForegroundColor Green
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
			[void]$sb.Append("$e[1;33m[$($Script:StepLabels[$i])]$e[0m")
		} elseif ($Script:PagesConfirmed[$i]) {
			# Confirmed step: green check
			[void]$sb.Append("$e[32m✓$($Script:StepLabels[$i])$e[0m")
		} else {
			# Future/unconfirmed step: dim
			[void]$sb.Append("$e[90m$($Script:StepLabels[$i])$e[0m")
		}
	}
	return $sb.ToString()
}

function Read-TuiKey {
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
		default { return 'OTHER' }
	}
}

function Test-Writable {
	param([string]$Path)
	try {
		$testFile = Join-Path $Path ".awesome-vivaldi-write-test"
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
	$Script:TempDir = Join-Path $env:TEMP "awesome-vivaldi-installer"
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

	# Download from hardcoded manifests — no GitHub API, no rate limits
	try {
		foreach ($f in $Script:ModCssFiles) {
			Invoke-WebRequest -Uri "$repoRaw/Vivaldi8.0Stable/CSS/$f" -OutFile (Join-Path $cssDir $f) -ErrorAction Stop
		}
		foreach ($f in $Script:ModJsFiles) {
			Invoke-WebRequest -Uri "$repoRaw/Vivaldi8.0Stable/Javascripts/$f" -OutFile (Join-Path $jsDir $f) -ErrorAction Stop
		}
		Invoke-WebRequest -Uri "$repoRaw/injectMods.js" -OutFile (Join-Path $Script:TempDir "injectMods.js") -ErrorAction Stop
		# Import.css lives at repo root, not in CSS/ subdir
		Invoke-WebRequest -Uri "$repoRaw/Vivaldi8.0Stable/Import.css" -OutFile (Join-Path $Script:TempDir "Import.css") -ErrorAction Stop
	} catch {
		Write-Host (tr error_download)
		Write-Host $_.Exception.Message
		return $null
	}

	$Script:SourceDir = $Script:TempDir
	Write-Host (tr source_done)
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
	param([string]$SourceDir)

	$cssDir = Join-Path $SourceDir "CSS"
	$jsDir  = Join-Path $SourceDir "Javascripts"

	$cssFiles = if (Test-Path $cssDir) { Get-ChildItem -File -Path $cssDir -Filter "*.css" | ForEach-Object { $_.Name } } else { @() }
	$jsFiles  = if (Test-Path $jsDir)  { Get-ChildItem -File -Path $jsDir  -Filter "*.js"  | ForEach-Object { $_.Name } } else { @() }

	$jsFiles = $jsFiles | Where-Object { $_ -ne "ModConfig.js" }

	$cssBases = @{}
	foreach ($f in $cssFiles) {
		$base = [IO.Path]::GetFileNameWithoutExtension($f)
		$cssBases[$base] = $f
	}

	$jsBases = @{}
	foreach ($f in $jsFiles) {
		$base = [IO.Path]::GetFileNameWithoutExtension($f)
		$jsBases[$base] = $f
	}

	$bundledKeys = @{}
	foreach ($k in $cssBases.Keys) {
		if ($jsBases.ContainsKey($k)) {
			$bundledKeys[$k] = $true
		}
	}

	$standaloneCSS = @()
	$bundledCSS = @()
	foreach ($f in $cssFiles) {
		$base = [IO.Path]::GetFileNameWithoutExtension($f)
		$descKey = if ($bundledKeys.ContainsKey($base)) { "mod_desc_${base}_CSS" } else { "mod_desc_${base}" }
		$desc = tr $descKey
		if (-not $desc) { $desc = "" }
		$item = @{
			FileName    = $f
			BaseName    = $base
			Description = $desc
			IsBundled   = $bundledKeys.ContainsKey($base)
			BundlePair  = if ($bundledKeys.ContainsKey($base)) { $jsBases[$base] } else { $null }
		}
		if ($item.IsBundled) { $bundledCSS += $item }
		else { $standaloneCSS += $item }
	}

	$standaloneJS = @()
	$bundledJS = @()
	foreach ($f in $jsFiles) {
		$base = [IO.Path]::GetFileNameWithoutExtension($f)
		$descKey = "mod_desc_${base}"
		$desc = tr $descKey
		if (-not $desc) { $desc = "" }
		$item = @{
			FileName    = $f
			BaseName    = $base
			Description = $desc
			IsBundled   = $bundledKeys.ContainsKey($base)
			BundlePair  = if ($bundledKeys.ContainsKey($base)) { $cssBases[$base] } else { $null }
		}
		if ($item.IsBundled) { $bundledJS += $item }
		else { $standaloneJS += $item }
	}

	$standaloneCSS = $standaloneCSS | Sort-Object FileName
	$bundledCSS    = $bundledCSS    | Sort-Object FileName
	$standaloneJS  = $standaloneJS  | Sort-Object FileName
	$bundledJS     = $bundledJS     | Sort-Object FileName

	return @{
		StandaloneCSS = $standaloneCSS
		BundledCSS    = $bundledCSS
		StandaloneJS  = $standaloneJS
		BundledJS     = $bundledJS
	}
}

# ============================================================
#  7.  Installation State
# ============================================================

function Get-InstallState {
	param([string]$VivaldiDir)

	$stateFile = Join-Path $VivaldiDir "user_mods\.awesome-vivaldi.json"
	if (-not (Test-Path $stateFile)) { return $null }

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
		$parts += "$e[90m$p$e[0m"
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
		$hintParts = @((tr key_nav_confirm), "LEFT back", (tr key_exit))
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
			'ESC'   { Exit-Installer }
		}
	}

	return $cursor
}

function Show-SelectMulti {
	param(
		[string]$TitleKey,
		[array]$Items,
		[string[]]$Preselected = @(),
		[bool]$DefaultAll = $true,
		[bool]$AllowLeft = $true,
		[bool]$AllowRight = $true
	)

	if ($Items.Count -eq 0) { return @() }

	if ($Script:Auto) {
		$result = @()
		for ($i = 0; $i -lt $Items.Count; $i++) {
			if (-not $Items[$i].IsLocked -and -not (Test-IsDefaultOff $Items[$i].FileName)) {
				$result += $Items[$i].FileName
			}
		}
		return $result
	}

	$n = $Items.Count
	$selected = @($false) * $n
	$cursor = 0

	# Determine initial selection state
	if ($Preselected.Count -gt 0) {
		for ($i = 0; $i -lt $n; $i++) {
			if ($Preselected -contains $Items[$i].FileName) {
				$selected[$i] = $true
			}
		}
	} elseif ($DefaultAll) {
		for ($i = 0; $i -lt $n; $i++) {
			if (-not $Items[$i].IsLocked -and -not (Test-IsDefaultOff $Items[$i].FileName)) {
				$selected[$i] = $true
			}
		}
	}

	$maxLabelWidth = 0
	foreach ($item in $Items) {
		if ($item.Label.Length -gt $maxLabelWidth) {
			$maxLabelWidth = $item.Label.Length
		}
	}

	$selectableCount = ($Items | Where-Object { -not $_.IsLocked }).Count
	$e = [char]27

	$done = $false
	while (-not $done) {
		# Compute all-selected state
		$allSelected = $true
		for ($i = 0; $i -lt $n; $i++) {
			if (-not $Items[$i].IsLocked -and -not $selected[$i]) { $allSelected = $false; break }
		}

		$sb = [Text.StringBuilder]::new()
		[void]$sb.AppendLine()
		[void]$sb.AppendLine((Format-StepBar))
		[void]$sb.AppendLine()
		[void]$sb.AppendLine("  $(tr $TitleKey)")
		[void]$sb.AppendLine()

		# Toggle-all row
		if ($selectableCount -gt 0) {
			$toggleMarker = if ($allSelected) { "[x]" } else { "[ ]" }
			$togglePrefix = if ($cursor -eq -1) { "  >" } else { "   " }
			[void]$sb.AppendLine("$togglePrefix $e[90m$toggleMarker$e[0m $e[90m$(tr toggle_all)$e[0m")
			[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")
		}

		for ($i = 0; $i -lt $n; $i++) {
			$item = $Items[$i]
			$check = if ($selected[$i]) { "[x]" } else { "[ ]" }
			$prefix = if ($i -eq $cursor) { "  $e[1;36m>$e[0m" } else { "   " }
			$lock  = if ($item.IsLocked) { " $e[90m$(tr css_locked_tag)$e[0m" } else { "" }

			$labelPadded = $item.Label.PadRight($maxLabelWidth + 2)
			$descKey = "mod_desc_" + [IO.Path]::GetFileNameWithoutExtension($item.FileName)
			$desc = tr $descKey
			if (-not $desc) { $desc = "" }
			$descPart = if ($desc) { " —  $desc" } else { "" }
			[void]$sb.AppendLine("$prefix $check $labelPadded$descPart$lock")
		}

		[void]$sb.AppendLine()
		[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")

		$hintParts = @((tr key_multiselect))
		if ($AllowRight) { $hintParts += "RIGHT next" }
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
					for ($i = 0; $i -lt $n; $i++) {
						if (-not $Items[$i].IsLocked) { $selected[$i] = $newState }
					}
				} elseif (-not $Items[$cursor].IsLocked) {
					$selected[$cursor] = -not $selected[$cursor]
				}
			}
			'A' {
				for ($i = 0; $i -lt $n; $i++) {
					if (-not $Items[$i].IsLocked) { $selected[$i] = $true }
				}
			}
			'D' {
				for ($i = 0; $i -lt $n; $i++) {
					if (-not $Items[$i].IsLocked) { $selected[$i] = $false }
				}
			}
			'ENTER' { $done = $true }
			'LEFT'  { return $null }
			'RIGHT' { if ($AllowRight) { return '__RIGHT__' } }
			'Q'     { Exit-Installer }
			'ESC'   { Exit-Installer }
		}
	}

	$result = @()
	for ($i = 0; $i -lt $n; $i++) {
		if ($selected[$i]) { $result += $Items[$i].FileName }
	}
	return $result
}

function Show-SelectMultiJS {
	param(
		[string]$Title,
		[array]$StandaloneItems,
		[array]$BundledItems,
		[string[]]$Preselected = @(),
		[bool]$DefaultAll = $true,
		[bool]$AllowLeft = $true,
		[bool]$AllowRight = $true
	)

	$allItems = [Collections.ArrayList]::new()

	foreach ($item in $StandaloneItems) {
		$normalized = @{
			Label       = $item.FileName
			Description = $item.Description
			FileName    = $item.FileName
			BundlePair  = ""
			IsLocked    = $false
		}
		[void]$allItems.Add($normalized)
	}

	if ($BundledItems.Count -gt 0) {
		$sectionItem = @{
			Label       = "  $(tr js_bundled_section)"
			Description = ""
			FileName    = "__section__"
			IsLocked    = $true
		}
		[void]$allItems.Add($sectionItem)
	}

	foreach ($item in $BundledItems) {
		$bundledItem = @{
			Label       = "$($item.FileName)  →  $(tr js_bundled_arrow): $($item.BundlePair)"
			Description = $item.Description
			FileName    = $item.FileName
			BundlePair  = $item.BundlePair
			IsLocked    = $false
		}
		[void]$allItems.Add($bundledItem)
	}

	$n = $allItems.Count
	$e = [char]27

	if ($Script:Auto) {
		$jsResult = @()
		$cssResult = @()
		for ($i = 0; $i -lt $n; $i++) {
			if (-not $allItems[$i].IsLocked -and $allItems[$i].FileName -ne "__section__" -and -not (Test-IsDefaultOff $allItems[$i].FileName)) {
				$jsResult += $allItems[$i].FileName
				if ($allItems[$i].BundlePair) { $cssResult += $allItems[$i].BundlePair }
			}
		}
		return @{ JS = $jsResult; BundledCSS = $cssResult }
	}

	$maxJsLabelWidth = 0
	foreach ($item in $allItems) {
		if ($item.FileName -ne "__section__" -and $item.Label.Length -gt $maxJsLabelWidth) {
			$maxJsLabelWidth = $item.Label.Length
		}
	}

	$selected = @($false) * $n
	$cursor = 0

	if ($Preselected.Count -gt 0) {
		for ($i = 0; $i -lt $n; $i++) {
			if ($Preselected -contains $allItems[$i].FileName) {
				$selected[$i] = $true
			}
		}
	} elseif ($DefaultAll) {
		for ($i = 0; $i -lt $n; $i++) {
			if (-not $allItems[$i].IsLocked -and -not (Test-IsDefaultOff $allItems[$i].FileName)) {
				$selected[$i] = $true
			}
		}
	}

	$selectable = @()
	for ($i = 0; $i -lt $n; $i++) {
		if (-not $allItems[$i].IsLocked) { $selectable += $i }
	}

	$done = $false
	while (-not $done) {
		$allSelected = $true
		foreach ($i in $selectable) {
			if (-not $selected[$i]) { $allSelected = $false; break }
		}

		$sb = [Text.StringBuilder]::new()
		[void]$sb.AppendLine()
		[void]$sb.AppendLine((Format-StepBar))
		[void]$sb.AppendLine()
		[void]$sb.AppendLine("  $(tr $TitleKey)")
		[void]$sb.AppendLine()

		if ($selectable.Count -gt 0) {
			$toggleMarker = if ($allSelected) { "[x]" } else { "[ ]" }
			$togglePrefix = if ($cursor -eq -1) { "  >" } else { "   " }
			[void]$sb.AppendLine("$togglePrefix $e[90m$toggleMarker$e[0m $e[90m$(tr toggle_all)$e[0m")
			[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")
		}

		for ($i = 0; $i -lt $n; $i++) {
			$item = $allItems[$i]
			$check = if ($selected[$i]) { "[x]" } else { "[ ]" }
			$prefix = if ($i -eq $cursor) { "  $e[1;36m>$e[0m" } else { "   " }

			if ($item.FileName -eq "__section__") {
				[void]$sb.AppendLine("  $e[90m  $(tr js_bundled_section)$e[0m")
			} else {
				$labelText = if ($item.BundlePair) { "$($item.FileName)  ->  $(tr js_bundled_arrow): $($item.BundlePair)" } else { $item.FileName }
				$labelPadded = $labelText.PadRight($maxJsLabelWidth + 2)
				$descKey = "mod_desc_" + [IO.Path]::GetFileNameWithoutExtension($item.FileName)
				$desc2 = tr $descKey
				if (-not $desc2) { $desc2 = "" }
				$descPart = if ($desc2) { " -  $desc2" } else { "" }
				
				[void]$sb.AppendLine("$prefix $check $labelPadded$descPart")
			}
		}

		[void]$sb.AppendLine()
		[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")

		$hintParts = @((tr key_multiselect), "LEFT back")
		if ($AllowRight) { $hintParts += "RIGHT next" }
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
					foreach ($i in $selectable) { $selected[$i] = $newState }
				} elseif (-not $allItems[$cursor].IsLocked) {
					$selected[$cursor] = -not $selected[$cursor]
				}
			}
			'A' { foreach ($i in $selectable) { $selected[$i] = $true } }
			'D' { foreach ($i in $selectable) { $selected[$i] = $false } }
			'ENTER' { $done = $true }
			'LEFT'  { return $null }
			'RIGHT' { if ($AllowRight) { return '__RIGHT__' } }
			'Q'     { Exit-Installer }
			'ESC'   { Exit-Installer }
		}
	}

	$selectedJS = @()
	$bundledCSS = @()
	for ($i = 0; $i -lt $n; $i++) {
		if ($selected[$i] -and -not $allItems[$i].IsLocked -and $allItems[$i].FileName -ne "__section__") {
			$selectedJS += $allItems[$i].FileName
			if ($allItems[$i].BundlePair) {
				$bundledCSS += $allItems[$i].BundlePair
			}
		}
	}

	return @{
		JS         = $selectedJS
		BundledCSS = $bundledCSS
	}
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
	if ($content -match 'injectMods\.js') {
		Write-Host (tr deploy_inject_skip)
		return
	}

	$newContent = $content -replace '(<body[^>]*>)', "`$1`r`n  <script src=`"injectMods.js`"></script>"
	try {
		Set-Content -Path $htmlPath -Value $newContent -NoNewline -ErrorAction Stop
		Write-Host (tr deploy_inject_done)
	} catch {
		Write-Host (tr error_permission)
		Write-Host "  $_"
		return
	}
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
	$statePath = Join-Path $userModsDir ".awesome-vivaldi.json"
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
			$state | ConvertTo-Json | Set-Content -Path (Join-Path $persistVerDir ".awesome-vivaldi.json") -ErrorAction SilentlyContinue
		} catch {
			Write-Host (tr error_persist_write)
		}
	}
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
		if ($key.Character -eq 'y' -or $key.Character -eq 'Y') {
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
		if ($key.Character -eq 'y' -or $key.Character -eq 'Y') {
			Write-Host "Y"
			Start-Process -FilePath $exe
			Write-Host "  Vivaldi launched."
		} else {
			Write-Host "N"
		}
	}
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

	$stepLabels = @((tr update_title), (tr summary_title))
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
		[void]$sb.AppendLine("$togglePrefix $e[90m$toggleMarker$e[0m $e[90m$(tr toggle_all)$e[0m")
		[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")

		for ($i = 0; $i -lt $n; $i++) {
			$item = $updateItems[$i]
			$check = if ($selected[$i]) { "[x]" } else { "[ ]" }
			$prefix = if ($i -eq $cursor) { "  $e[1;36m>$e[0m" } else { "   " }
			$typeTag = " $e[90m[$($item.ModType)]$e[0m"
			$info = if ($item.Description) { "`n          $e[90m$($item.Description)$e[0m" } else { "" }
			[void]$sb.AppendLine("$prefix $check $($item.Label)$typeTag$info")
		}

		[void]$sb.AppendLine()
		[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")
		[void]$sb.AppendLine("    $(Build-KeyHint @((tr key_multiselect), 'ENTER confirm', 'LEFT back', (tr key_exit)))")

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
			[void]$sb.AppendLine("  $e[90m$(tr update_skipped) ($($skipCSS.Count)): $(($skipCSS) -join ', ')$e[0m")
		}
		if ($skipJS.Count -gt 0) {
			[void]$sb.AppendLine("  $e[90m$(tr update_skipped) ($($skipJS.Count)): $(($skipJS) -join ', ')$e[0m")
		}
		[void]$sb.AppendLine()
		[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")
		[void]$sb.AppendLine("    $(Build-KeyHint @('ENTER to update', 'LEFT back', (tr key_exit)))")
		Write-FrameContent $sb.ToString()

		$key = Read-TuiKey
		switch ($key) {
			'ENTER' { $confirmDone = $true }
			'LEFT'  { return }
			'Q'     { Exit-Installer }
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
	$statePath = Join-Path $Target.VivaldiDir "user_mods\.awesome-vivaldi.json"
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
			$newState | ConvertTo-Json | Set-Content -Path (Join-Path $persistVerDir ".awesome-vivaldi.json") -ErrorAction SilentlyContinue
		} catch {}
	}

	Invoke-HtmlInjection -VivaldiDir $Target.VivaldiDir

	Write-Host "`n$e[1;32m$(trf update_complete $updated)$e[0m"
}

function Invoke-Uninstall {
	param(
		[hashtable]$Target,
		[hashtable]$State
	)

	Clear-ContentArea

	$e = [char]27
	$stepLabels = @((tr uninstall_title))
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
		[void]$sb.AppendLine("    $(Build-KeyHint @((tr key_nav_confirm), 'LEFT back', (tr key_exit)))")
		Write-FrameContent $sb.ToString()

		$key = Read-TuiKey
		switch ($key) {
			'UP'    { $cursor = [Math]::Max(0, $cursor - 1) }
			'DOWN'  { $cursor = [Math]::Min($items.Count - 1, $cursor + 1) }
			'ENTER' { $done = $true }
			'LEFT'  { return }
			'Q'     { Exit-Installer }
			'ESC'   { Exit-Installer }
		}
	}

	$action = $items[$cursor].Action

	if ($action -eq "full") {
		# Confirm full uninstall
		Clear-ContentArea
		Write-Host "`n$e[1;31m$(tr uninstall_full_confirm)$e[0m [Y/N]"
		$confirm = $host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
		if ($confirm.Character -ne 'y' -and $confirm.Character -ne 'Y') {
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
				[void]$sb.AppendLine("  $e[90m$(tr error_admin_required)$e[0m")
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
				[void]$sb.AppendLine("  $e[90m$(tr key_exit)$e[0m")
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

		$cssItems = @()
		foreach ($m in $mods.StandaloneCSS) {
			$cssItems += @{
				Label       = $m.FileName
				Description = $m.Description
				FileName    = $m.FileName
				IsLocked    = $false
			}
		}

		$stepLabels = @((tr step_css), (tr step_js), (tr summary_title))
		Set-StepInfo 0 3 $stepLabels
		$Script:PagesConfirmed = @($false) * 3

		$selectedCSS = Show-SelectMulti `
			-TitleKey "css_title" `
			-Items $cssItems `
			-Preselected $State.CssMods `
			-DefaultAll $false `
			-AllowLeft $false `
			-AllowRight $true

		if ($null -eq $selectedCSS) { return }
		if ($selectedCSS -eq '__RIGHT__') { $selectedCSS = $State.CssMods }
		$Script:PagesConfirmed[0] = $true

		Set-StepInfo 1 3 $stepLabels
		$selectedJSResult = Show-SelectMultiJS `
			-TitleKey "js_title" `
			-StandaloneItems $mods.StandaloneJS `
			-BundledItems $mods.BundledJS `
			-Preselected $State.JsMods `
			-DefaultAll $false `
			-AllowLeft $true `
			-AllowRight $true

		if ($null -eq $selectedJSResult) {
			$Script:PagesConfirmed[0] = $false
			# Go back to CSS
			Set-StepInfo 0 3 $stepLabels
			$selectedCSS = Show-SelectMulti `
				-TitleKey "css_title" `
				-Items $cssItems `
				-Preselected $State.CssMods `
				-DefaultAll $false `
				-AllowLeft $false `
				-AllowRight $true
			if ($null -eq $selectedCSS) { return }
			if ($selectedCSS -eq '__RIGHT__') { $selectedCSS = $State.CssMods }
			$Script:PagesConfirmed[0] = $true
			Set-StepInfo 1 3 $stepLabels
			$selectedJSResult = Show-SelectMultiJS `
				-TitleKey "js_title" `
				-StandaloneItems $mods.StandaloneJS `
				-BundledItems $mods.BundledJS `
				-Preselected $State.JsMods `
				-DefaultAll $false `
				-AllowLeft $true `
				-AllowRight $true
			if ($null -eq $selectedJSResult) { return }
		}
		$Script:PagesConfirmed[1] = $true

		$allCSS = $selectedCSS + $selectedJSResult.BundledCSS | Select-Object -Unique
		$allJS  = $selectedJSResult.JS | Select-Object -Unique

		$cssToRemove = $State.CssMods | Where-Object { $_ -notin $allCSS }
		$jsToRemove  = $State.JsMods  | Where-Object { $_ -notin $allJS }

		# Confirm page
		Set-StepInfo 2 3 $stepLabels
		$confirmDone = $false
		while (-not $confirmDone) {
			$sb = [Text.StringBuilder]::new()
			[void]$sb.AppendLine()
			[void]$sb.AppendLine((Format-StepBar))
			[void]$sb.AppendLine()
			[void]$sb.AppendLine("  $e[1m$(tr manage_confirm_title)$e[0m")
			[void]$sb.AppendLine()
			if ($cssToRemove.Count -gt 0) {
				[void]$sb.AppendLine("  $e[31m$(tr manage_removed_mods) ($($cssToRemove.Count)):$e[0m")
				foreach ($m in $cssToRemove) { [void]$sb.AppendLine("    $e[31m- $m$e[0m") }
			}
			if ($jsToRemove.Count -gt 0) {
				[void]$sb.AppendLine("  $e[31m$(tr manage_removed_mods) ($($jsToRemove.Count)):$e[0m")
				foreach ($m in $jsToRemove) { [void]$sb.AppendLine("    $e[31m- $m$e[0m") }
			}
			if ($allCSS.Count -gt 0) {
				[void]$sb.AppendLine("  $e[32m$(tr manage_unchanged_mods) ($($allCSS.Count)):$e[0m $(($allCSS | ForEach-Object { [IO.Path]::GetFileNameWithoutExtension($_) }) -join ', ')")
			}
			if ($allJS.Count -gt 0) {
				[void]$sb.AppendLine("  $e[90m$(tr manage_unchanged_mods) ($($allJS.Count)):$e[0m $(($allJS | ForEach-Object { [IO.Path]::GetFileNameWithoutExtension($_) }) -join ', ')")
			}
			if ($cssToRemove.Count -eq 0 -and $jsToRemove.Count -eq 0) {
				[void]$sb.AppendLine("  $e[90m$(tr manage_no_changes)$e[0m")
			}
			[void]$sb.AppendLine()
			[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")
			[void]$sb.AppendLine("    $(Build-KeyHint @('ENTER to uninstall', 'LEFT back', (tr key_exit)))")
			Write-FrameContent $sb.ToString()

			$key = Read-TuiKey
			switch ($key) {
				'ENTER' { $confirmDone = $true }
				'LEFT'  {
					$Script:PagesConfirmed[1] = $false
					$Script:PagesConfirmed[2] = $false
					# Go back to JS page
					Set-StepInfo 1 3 $stepLabels
					$selectedJSResult = Show-SelectMultiJS `
						-TitleKey "js_title" `
						-StandaloneItems $mods.StandaloneJS `
						-BundledItems $mods.BundledJS `
						-Preselected $State.JsMods `
						-DefaultAll $false `
						-AllowLeft $true `
						-AllowRight $true
					if ($null -eq $selectedJSResult) {
						$Script:PagesConfirmed[0] = $false
						Set-StepInfo 0 3 $stepLabels
						$selectedCSS = Show-SelectMulti `
							-TitleKey "css_title" `
							-Items $cssItems `
							-Preselected $State.CssMods `
							-DefaultAll $false `
							-AllowLeft $false `
							-AllowRight $true
						if ($null -eq $selectedCSS) { return }
						if ($selectedCSS -eq '__RIGHT__') { $selectedCSS = $State.CssMods }
						$Script:PagesConfirmed[0] = $true
						Set-StepInfo 1 3 $stepLabels
						$selectedJSResult = Show-SelectMultiJS `
							-TitleKey "js_title" `
							-StandaloneItems $mods.StandaloneJS `
							-BundledItems $mods.BundledJS `
							-Preselected $State.JsMods `
							-DefaultAll $false `
							-AllowLeft $true `
							-AllowRight $true
						if ($null -eq $selectedJSResult) { return }
					}
					$Script:PagesConfirmed[1] = $true
					$allCSS = $selectedCSS + $selectedJSResult.BundledCSS | Select-Object -Unique
					$allJS  = $selectedJSResult.JS | Select-Object -Unique
					$cssToRemove = $State.CssMods | Where-Object { $_ -notin $allCSS }
					$jsToRemove  = $State.JsMods  | Where-Object { $_ -notin $allJS }
					Set-StepInfo 2 3 $stepLabels
				}
				'Q'   { Exit-Installer }
				'ESC' { Exit-Installer }
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
				[void]$sb.AppendLine("  $e[90m$(tr error_admin_required)$e[0m")
				[void]$sb.AppendLine()
				[void]$sb.AppendLine("  $e[1;33m$(tr elevate_prompt)$e[0m")
				Write-FrameContent $sb.ToString()
				$key = Read-TuiKey
				if ($key -eq 'ENTER') {
					$scriptPath = if ($PSCommandPath) { $PSCommandPath } else { (Get-Command $MyInvocation.MyCommand.Name).Source }
					Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File \`"$scriptPath\`"" -Verb RunAs
					Exit-Installer
				}
				Exit-Installer
			} else {
				[void]$sb.AppendLine()
				[void]$sb.AppendLine("  $e[90m$(tr key_exit)$e[0m")
				Write-FrameContent $sb.ToString()
				Read-TuiKey | Out-Null
			}
			return
		}

		$userCssDir = Join-Path $vivaldiDir "user_mods\css"
		$userJsDir  = Join-Path $vivaldiDir "user_mods\js"

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
			$statePath = Join-Path $vivaldiDir "user_mods\.awesome-vivaldi.json"
			$newState | ConvertTo-Json | Set-Content -Path $statePath
		}
	}
}

# ============================================================
#  12.  Entry Menu
# ============================================================

function Show-EntryMenu {
	param([bool]$IsInstalled)

	Clear-ContentArea

	$e = [char]27
	$items = if ($IsInstalled) {
		@(
			@{ LabelKey = "entry_manage";    DetailKey = "entry_manage_desc";    Action = "manage" }
			@{ LabelKey = "entry_update";    DetailKey = "entry_update_desc";    Action = "update" }
			@{ LabelKey = "entry_uninstall"; DetailKey = "entry_uninstall_desc"; Action = "uninstall" }
			@{ LabelKey = "entry_exit";      DetailKey = "entry_exit_desc";      Action = "exit" }
		)
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
			[void]$sb.AppendLine("          $e[90m$(tr $items[$i].DetailKey)$e[0m")
		}

		[void]$sb.AppendLine()
		[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")
		[void]$sb.AppendLine("    $(Build-KeyHint @((tr key_nav_confirm), 'LEFT back', (tr key_exit)))")

		Write-FrameContent $sb.ToString()

		$key = Read-TuiKey
		switch ($key) {
			'UP'    { $cursor = [Math]::Max(0, $cursor - 1) }
			'DOWN'  { $cursor = [Math]::Min($items.Count - 1, $cursor + 1) }
			'ENTER' { $done = $true }
			'LEFT'  { return "back" }
			'Q'     { Exit-Installer }
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
	$stepLabels = @((tr step_css), (tr step_js), (tr step_confirm))
	$totalPages = 3

	# Page state
	$currentPage = 0
	$pagesConfirmed = @($false) * $totalPages
	$selectedCSS = @()
	$selectedJSResult = $null
	$finalCSS = @()
	$finalJS = @()

	$cssItems = @()
	foreach ($m in $Mods.StandaloneCSS) {
		$cssItems += @{
			Label       = $m.FileName
			Description = $m.Description
			FileName    = $m.FileName
			IsLocked    = $false
		}
	}

	:pageLoop while ($true) {
		switch ($currentPage) {
			0 {
				# CSS selection page
				Set-StepInfo 0 $totalPages $stepLabels
				$Script:PagesConfirmed = $pagesConfirmed
				$preselected = if ($PreselectedCSS.Count -gt 0) { $PreselectedCSS } else { @() }
				$defaultAll = ($PreselectedCSS.Count -eq 0)
				$result = Show-SelectMulti `
					-TitleKey "css_title" `
					-Items $cssItems `
					-Preselected $preselected `
					-DefaultAll $defaultAll `
					-AllowLeft $false `
					-AllowRight $true

				if ($null -eq $result) { return $null }
				if ($result -eq '__RIGHT__') {
					# User pressed RIGHT — only allowed if confirmed
					if (-not $pagesConfirmed[0] -and $selectedCSS.Count -eq 0) { continue }
					$pagesConfirmed[0] = $true
					$currentPage = 1
					continue
				}
				$selectedCSS = $result
				$pagesConfirmed[0] = $true
				$currentPage = 1
			}
			1 {
				# JS selection page
				Set-StepInfo 1 $totalPages $stepLabels
				$Script:PagesConfirmed = $pagesConfirmed
				$preselected = if ($PreselectedJS.Count -gt 0) { $PreselectedJS } else { @() }
				$defaultAll = ($PreselectedJS.Count -eq 0)
				$result = Show-SelectMultiJS `
					-TitleKey "js_title" `
					-StandaloneItems $Mods.StandaloneJS `
					-BundledItems $Mods.BundledJS `
					-Preselected $preselected `
					-DefaultAll $defaultAll `
					-AllowLeft $true `
					-AllowRight $true

				if ($null -eq $result) {
					$pagesConfirmed[1] = $false
					$currentPage = 0
					continue
				}
				if ($result -eq '__RIGHT__') {
					if (-not $pagesConfirmed[1]) { continue }
					$pagesConfirmed[1] = $true
					$currentPage = 2
					continue
				}
				$selectedJSResult = $result
				$pagesConfirmed[1] = $true
				$currentPage = 2
			}
			2 {
				# Confirm page
				$finalCSS = $selectedCSS + $selectedJSResult.BundledCSS | Select-Object -Unique
				$finalJS  = @("ModConfig.js") + $selectedJSResult.JS | Select-Object -Unique

				Set-StepInfo 2 $totalPages $stepLabels
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

					$cssNames = ($finalCSS | ForEach-Object { [IO.Path]::GetFileNameWithoutExtension($_) }) -join ", "
					$jsNames  = ($finalJS  | ForEach-Object { [IO.Path]::GetFileNameWithoutExtension($_) }) -join ", "
					[void]$sb.AppendLine("  $e[32m$(tr summary_css_mods) ($($finalCSS.Count))$e[0m: $cssNames")
					[void]$sb.AppendLine("  $e[32m$(tr summary_js_mods) ($($finalJS.Count - 1))$e[0m: $jsNames")
					[void]$sb.AppendLine()
					[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")
					[void]$sb.AppendLine("    $e[90m$(tr confirm_deploy_hint)$e[0m")

					Write-FrameContent $sb.ToString()

					$key = Read-TuiKey
					switch ($key) {
						'ENTER' { $confirmDone = $true }
						'LEFT'  { $currentPage = 1; $confirmDone = $true; $confirmBack = $true }
						'RIGHT' { }
						'Q'     { Exit-Installer }
						'ESC'   { Exit-Installer }
					}
				}

				if ($confirmBack) {
					$pagesConfirmed[2] = $false
					continue
				}
				# Deploy immediately on ENTER — exit outer while
				break pageLoop
			}
		}
	}

	# Permission check before touching Vivaldi's directory
	if (-not (Test-Writable $Target.VivaldiDir)) {
		$sb = [Text.StringBuilder]::new()
		[void]$sb.AppendLine()
		[void]$sb.AppendLine("  $e[1;31m$(tr error_permission)$e[0m")
		[void]$sb.AppendLine("  $(tr target_path): $($Target.VivaldiDir)")
		if ($Target.IsSystem) {
			[void]$sb.AppendLine("  $e[90m$(tr error_admin_required)$e[0m")
			[void]$sb.AppendLine()
			[void]$sb.AppendLine("  $e[1;33m$(tr elevate_prompt)$e[0m")
			Write-FrameContent $sb.ToString()
			$key = Read-TuiKey
			if ($key -eq 'ENTER') {
				# Re-launch self as administrator
				$scriptPath = if ($PSCommandPath) { $PSCommandPath } else { (Get-Command $MyInvocation.MyCommand.Name).Source }
				Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`"" -Verb RunAs
				Exit-Installer
			}
			Exit-Installer
		} else {
			[void]$sb.AppendLine()
			[void]$sb.AppendLine("  $e[90m$(tr key_exit)$e[0m")
			Write-FrameContent $sb.ToString()
			Read-TuiKey | Out-Null
		}
		return $null
	}

	# Show deploying status in frame
	$sb = [Text.StringBuilder]::new()
	[void]$sb.AppendLine()
	[void]$sb.AppendLine("  $e[1m$(tr deploy_start)$e[0m")
	[void]$sb.AppendLine("  $(tr target_path): $($Target.VivaldiDir)")
	[void]$sb.AppendLine()
	Write-FrameContent $sb.ToString()

	# Deploy
	Backup-WindowHtml -VivaldiDir $Target.VivaldiDir -PersistentDir $Target.PersistentDir
	Deploy-ModFiles -SourceDir $SourceDir -VivaldiDir $Target.VivaldiDir -PersistentDir $Target.PersistentDir -CssMods $finalCSS -JsMods $finalJS
	Invoke-HtmlInjection -VivaldiDir $Target.VivaldiDir

	Write-Host ""
	Write-Host "$e[1;32m" + ("=" * 52) + "$e[0m"
	Write-Host "  $e[1;32m$(tr deploy_success)$e[0m"
	Write-Host "$e[1;32m" + ("=" * 52) + "$e[0m"

	return @{ CSS = $finalCSS; JS = $finalJS }
}

# ============================================================
#  14.  Manage Flow (with diff display)
# ============================================================

function Invoke-ManageFlow {
	param(
		[string]$SourceDir,
		[hashtable]$Target,
		[object]$Mods,
		[hashtable]$State
	)

	$e = [char]27

	$stepLabels = @((tr step_css), (tr step_js), (tr step_confirm))
	$totalPages = 3

	$currentPage = 0
	$pagesConfirmed = @($false) * $totalPages
	$selectedCSS = @($State.CssMods)
	$selectedJSResult = $null
	$finalCSS = @()
	$finalJS = @()

	$cssItems = @()
	foreach ($m in $Mods.StandaloneCSS) {
		$cssItems += @{
			Label       = $m.FileName
			Description = $m.Description
			FileName    = $m.FileName
			IsLocked    = $false
		}
	}

	:pageLoop while ($true) {
		switch ($currentPage) {
			0 {
				Set-StepInfo 0 $totalPages $stepLabels
				$Script:PagesConfirmed = $pagesConfirmed
				$result = Show-SelectMulti `
					-TitleKey "css_title" `
					-Items $cssItems `
					-Preselected $selectedCSS `
					-DefaultAll $false `
					-AllowLeft $false `
					-AllowRight $true

				if ($null -eq $result) { return $null }
				if ($result -eq '__RIGHT__') {
					if (-not $pagesConfirmed[0]) { continue }
					$pagesConfirmed[0] = $true
					$currentPage = 1
					continue
				}
				$selectedCSS = $result
				$pagesConfirmed[0] = $true
				$currentPage = 1
			}
			1 {
				Set-StepInfo 1 $totalPages $stepLabels
				$Script:PagesConfirmed = $pagesConfirmed
				$result = Show-SelectMultiJS `
					-TitleKey "js_title" `
					-StandaloneItems $Mods.StandaloneJS `
					-BundledItems $Mods.BundledJS `
					-Preselected $State.JsMods `
					-DefaultAll $false `
					-AllowLeft $true `
					-AllowRight $true

				if ($null -eq $result) {
					$pagesConfirmed[1] = $false
					$currentPage = 0
					continue
				}
				if ($result -eq '__RIGHT__') {
					if (-not $pagesConfirmed[1]) { continue }
					$pagesConfirmed[1] = $true
					$currentPage = 2
					continue
				}
				$selectedJSResult = $result
				$pagesConfirmed[1] = $true
				$currentPage = 2
			}
			2 {
				$finalCSS = $selectedCSS + $selectedJSResult.BundledCSS | Select-Object -Unique
				$finalJS  = @("ModConfig.js") + $selectedJSResult.JS | Select-Object -Unique

				$newCSS = $finalCSS | Where-Object { $_ -notin $State.CssMods }
				$removedCSS = $State.CssMods | Where-Object { $_ -notin $finalCSS }
				$unchangedCSS = $finalCSS | Where-Object { $_ -in $State.CssMods }

				$newJS = $selectedJSResult.JS | Where-Object { $_ -notin $State.JsMods }
				$removedJS = $State.JsMods | Where-Object { $_ -notin $selectedJSResult.JS -and $_ -ne "ModConfig.js" }
				$unchangedJS = @($selectedJSResult.JS | Where-Object { $_ -in $State.JsMods })
				if ("ModConfig.js" -in $State.JsMods) { $unchangedJS += "ModConfig.js" }

				Set-StepInfo 2 $totalPages $stepLabels
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

					$hasChanges = $false

					if ($newCSS.Count -gt 0) {
						$hasChanges = $true
						[void]$sb.AppendLine("  $e[32m$(tr manage_new_mods) ($($newCSS.Count)):$e[0m")
						foreach ($m in $newCSS) { [void]$sb.AppendLine("    $e[32m+ $($m)$e[0m") }
					}
					if ($newJS.Count -gt 0) {
						$hasChanges = $true
						[void]$sb.AppendLine("  $e[32m$(tr manage_new_mods) ($($newJS.Count)):$e[0m")
						foreach ($m in $newJS) { [void]$sb.AppendLine("    $e[32m+ $($m)$e[0m") }
					}
					if ($removedCSS.Count -gt 0) {
						$hasChanges = $true
						[void]$sb.AppendLine("  $e[31m$(tr manage_removed_mods) ($($removedCSS.Count)):$e[0m")
						foreach ($m in $removedCSS) { [void]$sb.AppendLine("    $e[31m- $($m)$e[0m") }
					}
					if ($removedJS.Count -gt 0) {
						$hasChanges = $true
						[void]$sb.AppendLine("  $e[31m$(tr manage_removed_mods) ($($removedJS.Count)):$e[0m")
						foreach ($m in $removedJS) { [void]$sb.AppendLine("    $e[31m- $($m)$e[0m") }
					}
					if ($unchangedCSS.Count -gt 0) {
						[void]$sb.AppendLine("  $e[90m$(tr manage_unchanged_mods) ($($unchangedCSS.Count)): $(($unchangedCSS | ForEach-Object { [IO.Path]::GetFileNameWithoutExtension($_) }) -join ', ')$e[0m")
					}
					if ($unchangedJS.Count -gt 0) {
						[void]$sb.AppendLine("  $e[90m$(tr manage_unchanged_mods) ($($unchangedJS.Count)): $(($unchangedJS | ForEach-Object { [IO.Path]::GetFileNameWithoutExtension($_) }) -join ', ')$e[0m")
					}

					if (-not $hasChanges) {
						[void]$sb.AppendLine("  $e[90m$(tr manage_no_changes)$e[0m")
					}

					[void]$sb.AppendLine()
					[void]$sb.AppendLine("  $e[90m" + ("─" * 50) + "$e[0m")
					[void]$sb.AppendLine("    $e[90m$(tr confirm_deploy_hint)$e[0m")

					Write-FrameContent $sb.ToString()

					$key = Read-TuiKey
					switch ($key) {
						'ENTER' {
							if (-not $hasChanges) { continue }
							$confirmDone = $true
						}
						'LEFT'  { $currentPage = 1; $confirmDone = $true; $confirmBack = $true }
						'RIGHT' { }
						'Q'     { Exit-Installer }
						'ESC'   { Exit-Installer }
					}
				}

				if ($confirmBack) {
					$pagesConfirmed[2] = $false
					continue
				}
				# Apply immediately on ENTER — exit outer while
				break pageLoop
			}
		}
	}

	# Permission check before touching Vivaldi's directory
	if (-not (Test-Writable $Target.VivaldiDir)) {
		$sb = [Text.StringBuilder]::new()
		[void]$sb.AppendLine()
		[void]$sb.AppendLine("  $e[1;31m$(tr error_permission)$e[0m")
		[void]$sb.AppendLine("  $(tr target_path): $($Target.VivaldiDir)")
		if ($Target.IsSystem) {
			[void]$sb.AppendLine("  $e[90m$(tr error_admin_required)$e[0m")
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
			[void]$sb.AppendLine("  $e[90m$(tr key_exit)$e[0m")
			Write-FrameContent $sb.ToString()
			Read-TuiKey | Out-Null
		}
		return $null
	}

	# Show deploying status in frame
	$sb = [Text.StringBuilder]::new()
	[void]$sb.AppendLine()
	[void]$sb.AppendLine("  $e[1m$(tr manage_applying)$e[0m")
	[void]$sb.AppendLine("  $(tr target_path): $($Target.VivaldiDir)")
	[void]$sb.AppendLine()
	Write-FrameContent $sb.ToString()

	# Remove unchecked mods from disk
	$vivaldiDir = $Target.VivaldiDir
	$userCssDir = Join-Path $vivaldiDir "user_mods\css"
	$userJsDir  = Join-Path $vivaldiDir "user_mods\js"

	foreach ($mod in $removedCSS) {
		$path = Join-Path $userCssDir $mod
		if (Test-Path $path) {
			Remove-Item $path -Force
			Write-Host "  $e[31m- $mod$e[0m"
		}
	}
	foreach ($mod in $removedJS) {
		$path = Join-Path $userJsDir $mod
		if (Test-Path $path) {
			Remove-Item $path -Force
			Write-Host "  $e[31m- $mod$e[0m"
		}
	}

	# Deploy new/changed mods
	$deployCSS = @(($finalCSS | Where-Object { $_ -notin $removedCSS })) + @($newCSS) | Select-Object -Unique
	$deployJS  = @(($finalJS  | Where-Object { $_ -notin $removedJS }))  + @($newJS)  | Select-Object -Unique

	Deploy-ModFiles -SourceDir $SourceDir -VivaldiDir $vivaldiDir -PersistentDir $Target.PersistentDir -CssMods $deployCSS -JsMods $deployJS
	Invoke-HtmlInjection -VivaldiDir $vivaldiDir

	Write-Host ""
	Write-Host "$e[1;32m" + ("=" * 52) + "$e[0m"
	Write-Host "  $e[1;32m$(tr deploy_success)$e[0m"
	Write-Host "$e[1;32m" + ("=" * 52) + "$e[0m"

	return @{ CSS = $finalCSS; JS = $finalJS }
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
		$stateFile = Join-Path $verDir.FullName ".awesome-vivaldi.json"
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
	$statePath = Join-Path $VivaldiDir "user_mods\.awesome-vivaldi.json"
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

	$stepLabels = @((tr step_target))
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
		[void]$sb.AppendLine("  $e[90m$(tr error_admin_required)$e[0m")
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
	if ($isInstalled -and $state) {
		# Already installed: show manage/update/uninstall/exit
		while ($true) {
			$action = Show-EntryMenu -IsInstalled $true
			if ($action -eq "back") {
				# Re-select profile
				$selectedIdx = Show-SelectSingle `
					-TitleKey "target_title" `
					-Items $targetItems `
					-AllowLeft $false
				if ($null -eq $selectedIdx) { Exit-Installer }
				$target = $targetItems[$selectedIdx].Install
				$isInstalled = Test-IsInstalled -VivaldiDir $target.VivaldiDir
				$state = Get-InstallState -VivaldiDir $target.VivaldiDir
				if (-not $isInstalled -or -not $state) {
					# Profile changed to uninstalled state — restart Main loop
					continue
				}
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
				"uninstall" {
					Invoke-Uninstall -Target $target -State $state
				}
				"exit" {
					Exit-Installer
				}
			}
			if ($result) { Invoke-PostInstall -Target $target -Success $true }
			# After action, return to entry menu
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
			[void]$sb.AppendLine("    ENTER confirm | Q/ESC quit")
			Write-FrameContent $sb.ToString()

			$key = Read-TuiKey
			switch ($key) {
				'UP'    { $rc = [Math]::Max(0, $rc - 1) }
				'DOWN'  { $rc = [Math]::Min(1, $rc + 1) }
				'ENTER' { $rdone = $true }
				'Q'     { Exit-Installer }
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
			Write-Host ""
			Write-Host "$e[1;32m" + ("=" * 52) + "$e[0m"
			Write-Host "  $e[1;32m$(tr deploy_success)$e[0m"
			Write-Host "$e[1;32m" + ("=" * 52) + "$e[0m"
			Invoke-PostInstall -Target $target
		} else {
			# Fresh install after restore rejection
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
				continue
			}
			if ($action -eq "install") {
				$ms = Ensure-ModSource; if (-not $ms) { return }
				$sourceDir = $ms.SourceDir; $mods = $ms.Mods
				$result = Invoke-InstallFlow -SourceDir $sourceDir -Target $target -Mods $mods
				if ($result) { Invoke-PostInstall -Target $target -Success $true }
			} elseif ($action -eq "exit") {
				Exit-Installer
			}
		}
	}

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
