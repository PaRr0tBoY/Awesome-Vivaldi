// ModConfig.js
// Injects shared AI configuration controls into Vivaldi settings.

(function modConfig() {
  const SETTINGS_PATH_TOKEN = "settings.html?path=appearance";
  const SECTION_ID = "mod-config-section";
  const STORAGE_DIR = ".askonpage";
  const CONFIG_FILE = "config.json";
  const COMMON_KEY = "default";
  const EXPORT_FORMAT = "vivaldi-mod-config";
  const EXPORT_FORMAT_VERSION = 1;
  const INFO_ICON_SVG = '<svg viewBox="0 -960 960 960" aria-hidden="true" focusable="false"><path d="M440-280h80v-240h-80v240Zm68.5-331.5Q520-623 520-640t-11.5-28.5Q497-680 480-680t-28.5 11.5Q440-657 440-640t11.5 28.5Q463-600 480-600t28.5-11.5ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>';

  const MODULES = [
    { key: COMMON_KEY, label: "Common AI Config" },
    { key: "askInPage", label: "Ask in Page" },
    { key: "tidyTabs", label: "Tidy Tabs" },
    { key: "tidyTitles", label: "Tidy Titles" },
    { key: "tidyDownloads", label: "Tidy Downloads" },
    { key: "tidyAddress", label: "Tidy Address" },
  ];

  const CONFIG_PANELS = [
    { key: "ai", label: "AI Config" },
    { key: "quickCapture", label: "Quick Capture" },
    { key: "arcPeek", label: "Arc Peek" },
    { key: "autoHidePanel", label: "Auto Hide Panel" },
    { key: "tidySeries", label: "Tidy Series" },
    { key: "workspaceThemeSwitcher", label: "Workspace Theme" },
  ];

  const MOD_SETTING_SCHEMAS = {
    quickCapture: {
      title: "Quick Capture",
      hint: "Configure capture output mode, image encoding, and file-save behavior.",
      fields: [
        { key: "mode", label: "Mode", type: "select", options: ["default", "clipboard", "file"], defaultValue: "default", help: "default lets Vivaldi's screenshot selector decide output; clipboard copies directly; file saves through Vivaldi's file capture path." },
        { key: "encodeFormat", label: "Encode Format", type: "select", options: ["png", "jpeg", "webp"], defaultValue: "png", help: "Image format passed to Vivaldi's capture API." },
        { key: "encodeQuality", label: "Encode Quality", type: "number", min: 1, max: 100, step: 1, defaultValue: 85, help: "Compression quality for lossy formats. PNG mostly ignores this." },
        { key: "showFileInPath", label: "Show File In Path", type: "boolean", defaultValue: true, help: "When saving to disk, ask Vivaldi to reveal the saved file in the file manager." },
        { key: "saveFilePattern", label: "Save File Pattern", type: "filePath", defaultValue: "", placeholder: "Choose output filename pattern", help: "Optional filename pattern used by Vivaldi's save-to-disk capture path. Browser file pickers expose the selected filename, not a full filesystem path." },
      ],
    },
    arcPeek: {
      title: "Arc Peek",
      hint: "Configure link peek triggers, background behavior, and foreground loading layer.",
      fields: [
        { key: "clickOpenModifiers", label: "Click Modifiers", type: "multiSelect", options: ["alt", "shift", "ctrl", "meta"], defaultValue: ["alt"], help: "Modifier keys that allow normal left click to open Peek." },
        { key: "longPressButtons", label: "Long Press Buttons", type: "multiSelect", options: ["middle", "right"], defaultValue: ["middle"], help: "Mouse buttons that open Peek after a long press." },
        { key: "longPressHoldTime", label: "Hold Time", type: "number", min: 0, step: 10, defaultValue: 400, unit: "ms", help: "How long the button must be held before Peek opens." },
        { key: "longPressHoldDelay", label: "Hold Delay", type: "number", min: 0, step: 10, defaultValue: 200, unit: "ms", help: "Delay before the hold feedback animation starts." },
        { key: "autoOpenList", label: "Auto Open List", type: "list", defaultValue: ["pin", "*.google.com"], placeholder: "pin, *.google.com, *.example.com", help: "Comma-separated rules that auto-open normal left-click links in Peek. Use pin for pinned tabs or domain patterns like *.google.com." },
        { key: "foregroundMode", label: "Foreground Mode", type: "select", options: ["default", "theme"], defaultValue: "theme", help: "Foreground blank layer shown while the webview loads behind it." },
        { key: "loadingAnimation", label: "Loading Animation", type: "select", options: ["skeleton", "breath", "real", "none"], defaultValue: "skeleton", help: "Loading effect shown while page loads: skeleton (static skeleton), breath (pulsing foreground), real (dynamic skeleton from page structure, cached), none (blank)." },
        { key: "scaleBackgroundPage", label: "Scale Background", type: "boolean", defaultValue: true, help: "Scale and sink the background webpage while Peek is open." },
      ],
    },
    autoHidePanel: {
      title: "Auto Hide Panel",
      hint: "Configure hover-to-open panel behavior and the open, switch, and close timing delays.",
      fields: [
        { key: "auto_close", label: "Auto Close", type: "boolean", defaultValue: true, help: "Automatically close the panel when focus or pointer returns to the page." },
        { key: "close_fixed", label: "Close Fixed Panel", type: "boolean", defaultValue: true, help: "Allow auto-close even when panels are in fixed display mode." },
        { key: "open_delay", label: "Open Delay", type: "number", min: 0, step: 10, defaultValue: 280, unit: "ms", help: "Delay before opening a panel on hover." },
        { key: "switch_delay", label: "Switch Delay", type: "number", min: 0, step: 10, defaultValue: 40, unit: "ms", help: "Delay before switching between panel buttons." },
        { key: "close_delay", label: "Close Delay", type: "number", min: 0, step: 10, defaultValue: 280, unit: "ms", help: "Delay before closing an overlay panel." },
        { key: "close_delay_fixed", label: "Fixed Close Delay", type: "number", min: 0, step: 10, defaultValue: 3000, unit: "ms", help: "Delay before closing a fixed panel when fixed close is enabled." },
      ],
    },
    tidySeries: {
      title: "Tidy Series",
      hint: "Settings for Tidy Tabs, Tidy Titles, and related Tidy mods.",
      fields: [
        { key: "enableStackColor", label: "Enable Stack Coloring", type: "boolean", defaultValue: false, help: "When enabled, newly created and existing tab stacks will be automatically assigned random colors. When disabled, stacks remain uncolored." },
        { key: "dynamicRenameGap", label: "Dynamic Rename Gap", type: "number", min: 1, step: 1, defaultValue: 3, help: "Rename the stack every N tabs added. Stack is always named on creation; subsequent renames happen each time this many tabs accumulate." },
      ],
    },
    workspaceThemeSwitcher: {
      title: "Workspace Theme Switcher",
      hint: "Map each workspace to a Vivaldi theme. Workspaces without a mapping use your current theme.",
      fields: [
        { key: "workspaceThemeMap", label: "Workspace → Theme", type: "workspaceThemeMap", defaultValue: {}, help: "Left column lists your workspaces. Right column lets you pick a Vivaldi theme for each. Unmapped workspaces keep your current theme." },
      ],
    },
  };

  const PROVIDERS = [
    {
      key: "",
      label: "Custom",
      apiEndpoint: "",
      modelsUrl: "",
      apiKeyUrl: "",
    },
    {
      key: "zai",
      label: "Z.ai",
      apiEndpoint: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
      modelsUrl: "https://open.bigmodel.cn/api/paas/v4/models",
      apiKeyUrl: "https://open.bigmodel.cn/usercenter/apikeys",
    },
    {
      key: "openrouter",
      label: "OpenRouter",
      apiEndpoint: "https://openrouter.ai/api/v1/chat/completions",
      modelsUrl: "https://openrouter.ai/api/v1/models",
      apiKeyUrl: "https://openrouter.ai/settings/keys",
    },
    {
      key: "deepseek",
      label: "DeepSeek",
      apiEndpoint: "https://api.deepseek.com/chat/completions",
      modelsUrl: "https://api.deepseek.com/models",
      apiKeyUrl: "https://platform.deepseek.com/api_keys",
    },
    {
      key: "groq",
      label: "Groq",
      apiEndpoint: "https://api.groq.com/openai/v1/chat/completions",
      modelsUrl: "https://api.groq.com/openai/v1/models",
      apiKeyUrl: "https://console.groq.com/keys",
    },
    {
      key: "mimo",
      label: "Mimo",
      apiEndpoint: "https://api.xiaomimimo.com/v1/chat/completions",
      modelsUrl: "https://api.xiaomimimo.com/v1/models",
      apiKeyUrl: "",
    },
  ];

  const DEFAULT_CONFIG = {
    schemaVersion: 3,
    ai: {
      default: {
        provider: "",
        apiEndpoint: "",
        apiKey: "",
        model: "",
      },
      overrides: {},
    },
    mods: {
      quickCapture: {},
      arcPeek: {},
      autoHidePanel: {},
      tidySeries: {},
      workspaceThemeSwitcher: {},
    },
  };
  let targetSettingsVisible = false;
  let visibilityRefreshTimer = null;
  let injectRetryTimer = null;
  const customDrafts = new Map();

  function isTargetSettingsUrl(url) {
    const value = String(url || "");
    return value.includes(SETTINGS_PATH_TOKEN)
      || value.includes("vivaldi:settings/appearance")
      || value.includes("chrome://settings/appearance");
  }

  function cloneDefaultConfig() {
    const config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    Object.keys(MOD_SETTING_SCHEMAS).forEach((key) => {
      config.mods[key] = getModDefaults(key);
    });
    return config;
  }

  function parseListValue(value) {
    return String(value || "")
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function normalizeAiBlock(raw) {
    return {
      provider: typeof raw?.provider === "string" ? raw.provider : "",
      apiEndpoint: typeof raw?.apiEndpoint === "string" ? raw.apiEndpoint : "",
      apiKey: typeof raw?.apiKey === "string" ? raw.apiKey : "",
      model: typeof raw?.model === "string" ? raw.model : "",
    };
  }

  function getModDefaults(modKey) {
    const schema = MOD_SETTING_SCHEMAS[modKey];
    if (!schema) {
      return {};
    }
    return Object.fromEntries(schema.fields.map((field) => [
      field.key,
      Array.isArray(field.defaultValue) ? field.defaultValue.slice() : field.defaultValue,
    ]));
  }

  function normalizeModBlock(modKey, raw) {
    const schema = MOD_SETTING_SCHEMAS[modKey];
    const defaults = getModDefaults(modKey);
    if (!schema || !raw || typeof raw !== "object") {
      return defaults;
    }
    const output = Object.assign({}, defaults);
    schema.fields.forEach((field) => {
      const value = raw[field.key];
      if (field.type === "boolean") {
        if (typeof value === "boolean") {
          output[field.key] = value;
        }
        return;
      }
      if (field.type === "number") {
        const number = Number(value);
        if (Number.isFinite(number)) {
          output[field.key] = number;
        }
        return;
      }
      if (field.type === "list" || field.type === "multiSelect") {
        if (Array.isArray(value)) {
          const items = value.map((item) => String(item).trim()).filter(Boolean);
          output[field.key] = field.options ? items.filter((item) => field.options.includes(item)) : items;
        } else if (typeof value === "string") {
          const items = parseListValue(value);
          output[field.key] = field.options ? items.filter((item) => field.options.includes(item)) : items;
        }
        return;
      }
      if (field.type === "select") {
        if (typeof value === "string" && field.options.includes(value)) {
          output[field.key] = value;
        }
        return;
      }
      if (field.type === "workspaceThemeMap") {
        if (value && typeof value === "object" && !Array.isArray(value)) {
          output[field.key] = value;
        }
        return;
      }
      if (typeof value === "string") {
        output[field.key] = value;
      }
    });
    return output;
  }

  function mergeConfig(raw) {
    const config = cloneDefaultConfig();
    if (!raw || typeof raw !== "object") {
      return config;
    }
    if (Number.isFinite(Number(raw.schemaVersion))) {
      config.schemaVersion = Math.max(2, Number(raw.schemaVersion));
    }
    if (raw.ai?.default && typeof raw.ai.default === "object") {
      config.ai.default = Object.assign(config.ai.default, normalizeAiBlock(raw.ai.default));
    } else if (raw.ai && typeof raw.ai === "object") {
      config.ai.default = Object.assign(config.ai.default, normalizeAiBlock(raw.ai));
    }
    if (raw.ai?.overrides && typeof raw.ai.overrides === "object") {
      Object.keys(raw.ai.overrides).forEach((key) => {
        config.ai.overrides[key] = normalizeAiBlock(raw.ai.overrides[key]);
      });
    }
    if (raw.mods && typeof raw.mods === "object") {
      Object.keys(MOD_SETTING_SCHEMAS).forEach((key) => {
        config.mods[key] = normalizeModBlock(key, raw.mods[key]);
      });
      Object.keys(raw.mods).forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(MOD_SETTING_SCHEMAS, key) && raw.mods[key] && typeof raw.mods[key] === "object") {
          config.mods[key] = raw.mods[key];
        }
      });
    } else {
      Object.keys(MOD_SETTING_SCHEMAS).forEach((key) => {
        config.mods[key] = getModDefaults(key);
      });
    }
    return config;
  }

  async function getConfigDir() {
    if (typeof navigator?.storage?.getDirectory !== "function") {
      throw new Error("OPFS is not available in this context.");
    }
    const root = await navigator.storage.getDirectory();
    return root.getDirectoryHandle(STORAGE_DIR, { create: true });
  }

  function formatBytes(value) {
    const bytes = Number(value || 0);
    if (!Number.isFinite(bytes) || bytes <= 0) {
      return "0 B";
    }
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = bytes;
    let index = 0;
    while (size >= 1024 && index < units.length - 1) {
      size /= 1024;
      index += 1;
    }
    return (index === 0 ? String(Math.round(size)) : size.toFixed(size >= 10 ? 1 : 2)) + " " + units[index];
  }

  async function readStorageStatus() {
    const status = {
      supported: Boolean(navigator?.storage),
      usage: null,
      quota: null,
    };
    try {
      const estimate = typeof navigator.storage.estimate === "function"
        ? await navigator.storage.estimate()
        : null;
      status.usage = estimate?.usage;
      status.quota = estimate?.quota;
    } catch (_error) {}
    return status;
  }

  async function refreshStorageStatus(section) {
    const node = section.querySelector(".mod-config-storage-status");
    if (!node) {
      return;
    }
    node.textContent = "Storage: checking...";
    const status = await readStorageStatus();
    const usage = status.usage == null ? "unknown" : formatBytes(status.usage);
    const quota = status.quota == null ? "unknown" : formatBytes(status.quota);
    node.textContent = "Usage " + usage + " | Quota " + quota;
  }

  async function readConfig() {
    try {
      const dir = await getConfigDir();
      const fileHandle = await dir.getFileHandle(CONFIG_FILE, { create: false });
      const file = await fileHandle.getFile();
      return mergeConfig(JSON.parse(await file.text()));
    } catch (_error) {
      return cloneDefaultConfig();
    }
  }

  async function writeConfig(config) {
    const dir = await getConfigDir();
    const fileHandle = await dir.getFileHandle(CONFIG_FILE, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(config, null, 2));
    await writable.close();
  }

  function cloneConfig(config) {
    return JSON.parse(JSON.stringify(config || cloneDefaultConfig()));
  }

  function buildExportPackage(config) {
    return {
      format: EXPORT_FORMAT,
      formatVersion: EXPORT_FORMAT_VERSION,
      exportedAt: new Date().toISOString(),
      schemaVersion: config.schemaVersion,
      config,
    };
  }

  function unwrapImportedConfig(raw) {
    if (!raw || typeof raw !== "object") {
      throw new Error("Invalid config file.");
    }
    if (raw.format === EXPORT_FORMAT && raw.config && typeof raw.config === "object") {
      return mergeConfig(raw.config);
    }
    return mergeConfig(raw);
  }

  function dispatchConfigUpdated(config) {
    window.dispatchEvent(new CustomEvent("vivaldi-mod-ai-config-updated", {
      detail: config,
    }));
    window.dispatchEvent(new CustomEvent("vivaldi-mod-config-updated", {
      detail: config,
    }));
    window.dispatchEvent(new CustomEvent("ask-in-page-config-updated", {
      detail: config,
    }));
  }

  function getProvider(key) {
    return PROVIDERS.find((provider) => provider.key === key) || PROVIDERS[0];
  }

  function getDropdownItems(name) {
    if (name === "configPanel") {
      return CONFIG_PANELS;
    }
    return name === "module" ? MODULES : PROVIDERS;
  }

  function getDropdownLabel(name, value) {
    const item = getDropdownItems(name).find((entry) => entry.key === value);
    return item?.label || getDropdownItems(name)[0].label;
  }

  function deriveModelsUrl(endpoint) {
    const value = String(endpoint || "").trim();
    if (!value) {
      return "";
    }
    if (/\/chat\/completions\/?$/i.test(value)) {
      return value.replace(/\/chat\/completions\/?$/i, "/models");
    }
    try {
      return new URL("/models", value).toString();
    } catch (_error) {
      return "";
    }
  }

  function getInput(section, name) {
    return section.querySelector('[data-mod-config="' + name + '"]');
  }

  function setStatus(section, message, tone) {
    const status = section.querySelector(".mod-config-status");
    if (!status) {
      return;
    }
    if (section._modConfigStatusTimer) {
      clearTimeout(section._modConfigStatusTimer);
      section._modConfigStatusTimer = null;
    }
    status.textContent = message || "";
    status.dataset.tone = tone || "";
    if (message) {
      section._modConfigStatusTimer = setTimeout(() => {
        status.textContent = "";
        status.dataset.tone = "";
        section._modConfigStatusTimer = null;
      }, tone === "error" ? 6500 : 2800);
    }
  }

  function setContextHint(section, moduleKey) {
    const hint = section.querySelector(".mod-config-section-info");
    if (!hint) {
      return;
    }
    const panelKey = getInput(section, "configPanel")?.value || "ai";
    if (panelKey !== "ai") {
      const schema = MOD_SETTING_SCHEMAS[panelKey];
      hint.querySelector(".mod-config-info-tooltip").textContent = schema?.hint || "Choose a mod from MOD CONFIG to edit its settings.";
      return;
    }
    const isCommon = moduleKey === COMMON_KEY;
    hint.querySelector(".mod-config-info-tooltip").textContent = isCommon
      ? "This Common AI Config applies to every AI mod. Use the selector below to give a specific mod its own provider, endpoint, key, and model."
      : "This page overrides Common AI Config for the selected mod. If you do not save module-specific changes, that mod keeps using Common AI Config.";
  }

  function setTopPanel(section, panelKey) {
    const title = section.querySelector(".mod-config-title");
    setDropdownValue(section, "configPanel", panelKey, false);
    if (title) {
      title.textContent = panelKey === "ai" ? "AI Config" : (MOD_SETTING_SCHEMAS[panelKey]?.title || "Mod Config");
    }
    const aiPane = section.querySelector(".mod-config-ai-pane");
    const modPane = section.querySelector(".mod-config-mod-pane");
    if (aiPane) {
      aiPane.hidden = panelKey !== "ai";
    }
    if (modPane) {
      modPane.hidden = panelKey === "ai";
    }
    setContextHint(section, getSelectedModule(section));
  }

  function updateRestoreCommonVisibility(section) {
    const restoreButton = section.querySelector(".mod-config-restore-common");
    if (restoreButton) {
      restoreButton.hidden = (getInput(section, "configPanel")?.value || "ai") !== "ai" || !getInput(section, "provider").value;
    }
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[char]));
  }

  function getSelectedModule(section) {
    return getInput(section, "module").value || COMMON_KEY;
  }

  function getEffectiveBlock(config, moduleKey) {
    const common = normalizeAiBlock(config.ai.default);
    if (moduleKey === COMMON_KEY) {
      return common;
    }
    if (!config.ai.overrides[moduleKey]) {
      return common;
    }
    const override = normalizeAiBlock(config.ai.overrides[moduleKey]);
    return {
      provider: override.provider,
      apiEndpoint: override.apiEndpoint || common.apiEndpoint,
      apiKey: override.apiKey || common.apiKey,
      model: override.model || common.model,
    };
  }

  function setApiKeyLink(section, providerKey) {
    const link = section.querySelector(".mod-config-api-key-link");
    const provider = getProvider(providerKey);
    if (!link) {
      return;
    }
    if (!provider.apiKeyUrl) {
      link.hidden = true;
      link.removeAttribute("href");
      return;
    }
    link.hidden = false;
    link.href = provider.apiKeyUrl;
    link.textContent = "Get API key";
  }

  function setDropdownValue(section, name, value, emitChange) {
    const input = getInput(section, name);
    const dropdown = section.querySelector('[data-mod-dropdown="' + name + '"]');
    if (!input || !dropdown) {
      return;
    }
    input.value = value || "";
    const label = dropdown.querySelector(".mod-config-dropdown-label");
    if (label) {
      label.textContent = getDropdownLabel(name, input.value);
    }
    dropdown.querySelectorAll(".mod-config-dropdown-option").forEach((option) => {
      option.dataset.selected = option.dataset.value === input.value ? "true" : "false";
    });
    if (emitChange) {
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function hideDropdowns(section) {
    section.querySelectorAll(".mod-config-dropdown.is-open").forEach((dropdown) => {
      dropdown.classList.remove("is-open");
      const button = dropdown.querySelector(".mod-config-dropdown-button");
      if (button) {
        button.setAttribute("aria-expanded", "false");
      }
      const list = dropdown.querySelector(".mod-config-dropdown-list");
      if (list) {
        list.hidden = true;
      }
    });
  }

  function updateSettingDropdownLabel(dropdown) {
    const input = dropdown.querySelector("[data-mod-setting]");
    const label = dropdown.querySelector(".mod-config-dropdown-label");
    if (!input || !label) {
      return;
    }
    const values = parseListValue(input.value);
    label.textContent = dropdown.dataset.multiple === "true"
      ? (values.length ? values.join(", ") : "None")
      : (values[0] || "");
  }

  async function chooseFileForSetting(section, key) {
    const input = section.querySelector('[data-mod-setting="' + key + '"]');
    if (!input) {
      return;
    }
    try {
      if (typeof window.showSaveFilePicker === "function") {
        const handle = await window.showSaveFilePicker({
          suggestedName: input.value || "capture.png",
        });
        input.value = handle?.name || input.value;
        return;
      }
      if (typeof window.showOpenFilePicker === "function") {
        const handles = await window.showOpenFilePicker({ multiple: false });
        input.value = handles?.[0]?.name || input.value;
        return;
      }
      setStatus(section, "File picker is not available in this context.", "error");
    } catch (error) {
      if (error?.name !== "AbortError") {
        setStatus(section, "File picker failed: " + (error?.message || "Unknown error"), "error");
      }
    }
  }

  async function exportConfigFile(section, config) {
    const exportConfig = collectVisibleConfig(section, config);
    const payload = JSON.stringify(buildExportPackage(exportConfig), null, 2);
    const suggestedName = "vivaldi-mod-config-" + new Date().toISOString().slice(0, 10) + ".json";
    try {
      if (typeof window.showSaveFilePicker === "function") {
        const handle = await window.showSaveFilePicker({
          suggestedName,
          types: [{
            description: "JSON config",
            accept: { "application/json": [".json"] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(payload);
        await writable.close();
      } else {
        const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = suggestedName;
        link.click();
        URL.revokeObjectURL(url);
      }
      setStatus(section, "Config exported.", "ok");
    } catch (error) {
      if (error?.name !== "AbortError") {
        setStatus(section, "Export failed: " + (error?.message || "Unknown error"), "error");
      }
    }
  }

  function openImportFileFallback(section) {
    const input = section.querySelector(".mod-config-import-file");
    if (input) {
      input.value = "";
      input.click();
    }
  }

  async function readConfigFromFile(file) {
    if (!file) {
      throw new Error("No file selected.");
    }
    return unwrapImportedConfig(JSON.parse(await file.text()));
  }

  async function chooseImportConfigFile(section) {
    try {
      if (typeof window.showOpenFilePicker === "function") {
        const handles = await window.showOpenFilePicker({
          multiple: false,
          types: [{
            description: "JSON config",
            accept: { "application/json": [".json"] },
          }],
        });
        const file = await handles?.[0]?.getFile();
        return readConfigFromFile(file);
      }
      openImportFileFallback(section);
      return null;
    } catch (error) {
      if (error?.name !== "AbortError") {
        setStatus(section, "Import failed: " + (error?.message || "Unknown error"), "error");
      }
      return null;
    }
  }

  function refreshCurrentPanel(section, config) {
    const panelKey = getInput(section, "configPanel").value || "ai";
    if (panelKey === "ai") {
      fillForm(section, config, getSelectedModule(section));
    } else {
      renderModSettingsForm(section, config, panelKey);
    }
    updateRestoreCommonVisibility(section);
  }

  function fillForm(section, config, moduleKey) {
    const block = getEffectiveBlock(config, moduleKey);
    setDropdownValue(section, "module", moduleKey, false);
    setDropdownValue(section, "provider", block.provider || "", false);
    getInput(section, "apiEndpoint").value = block.apiEndpoint || "";
    getInput(section, "apiKey").value = block.apiKey || "";
    getInput(section, "model").value = block.model || "";
    section.dataset.previousProvider = block.provider || "";
    section.dataset.resetToCommon = "";
    hideModelList(section);
    setApiKeyLink(section, block.provider || "");
    setContextHint(section, moduleKey);
    updateRestoreCommonVisibility(section);
  }

  function renderModSettingsForm(section, config, modKey) {
    const schema = MOD_SETTING_SCHEMAS[modKey];
    const grid = section.querySelector(".mod-config-mod-grid");
    if (!schema || !grid) {
      return;
    }
    const values = normalizeModBlock(modKey, config.mods?.[modKey]);
    grid.innerHTML = schema.fields.map((field) => renderModField(field, values[field.key])).join("");
    if (modKey === "workspaceThemeSwitcher") {
      initWorkspaceThemeMap(section, config);
    }
  }

  async function initWorkspaceThemeMap(section, config) {
    const container = section.querySelector("[data-workspace-theme-map]");
    if (!container) return;

    try {
      const [workspaces, systemThemes, userThemes] = await Promise.all([
        vivaldi.prefs.get("vivaldi.workspaces.list"),
        vivaldi.prefs.get("vivaldi.themes.system"),
        vivaldi.prefs.get("vivaldi.themes.user"),
      ]);

      const wsList = Array.isArray(workspaces) ? workspaces : [];
      const themes = [...(systemThemes || []), ...(userThemes || [])];
      const currentMap = config.mods?.workspaceThemeSwitcher?.workspaceThemeMap || {};

      if (wsList.length === 0) {
        container.innerHTML = '<div class="mod-config-wt-loading">No workspaces found.</div>';
        return;
      }

      let html = `
        <div class="mod-config-wt-header">
          <span>Workspace</span>
          <span>Theme</span>
        </div>
      `;

      for (const ws of wsList) {
        const wsName = ws.name || "Unnamed";
        const selectedId = currentMap[wsName] || "";
        const optionsHtml = themes.map((t) => {
          const sel = t.id === selectedId ? " selected" : "";
          return `<option value="${escapeHtml(t.id)}"${sel}>${escapeHtml(t.name)}</option>`;
        }).join("");

        html += `
          <div class="mod-config-wt-row">
            <div class="mod-config-wt-workspace">${escapeHtml(wsName)}</div>
            <div class="mod-config-wt-theme">
              <select class="mod-config-select" data-ws-theme="${escapeHtml(wsName)}">
                <option value="">(default)</option>
                ${optionsHtml}
              </select>
            </div>
          </div>
        `;
      }

      container.innerHTML = html;
    } catch (error) {
      container.innerHTML = `<div class="mod-config-wt-loading">Failed to load: ${escapeHtml(error.message)}</div>`;
    }
  }

  function collectWorkspaceThemeMap(section) {
    const selects = section.querySelectorAll("[data-ws-theme]");
    const map = {};
    selects.forEach((sel) => {
      const wsName = sel.dataset.wsTheme;
      const themeId = sel.value;
      if (themeId) {
        map[wsName] = themeId;
      }
    });
    return map;
  }

  function renderModField(field, value) {
    const valueAttr = escapeHtml(Array.isArray(value) ? value.join(", ") : value);
    const unit = field.unit ? '<span class="mod-config-unit">' + escapeHtml(field.unit) + "</span>" : "";
    const label = `
      <div class="mod-config-label mod-config-label-with-info">
        <span>${escapeHtml(field.label)}</span>
        ${renderInfoButton(field.help || "")}
      </div>
    `;
    if (field.type === "boolean") {
      return `
        ${label}
        <label class="mod-config-switch">
          <input id="mod-setting-${field.key}" data-mod-setting="${escapeHtml(field.key)}" type="checkbox" ${value ? "checked" : ""}>
          <span>${value ? "Enabled" : "Disabled"}</span>
        </label>
      `;
    }
    if (field.type === "select") {
      return `
        ${label}
        ${renderSettingDropdown(field, value, false)}
      `;
    }
    if (field.type === "multiSelect") {
      return `
        ${label}
        ${renderSettingDropdown(field, value, true)}
      `;
    }
    if (field.type === "filePath") {
      return `
        ${label}
        <div class="mod-config-inline-field">
          <input id="mod-setting-${field.key}" class="mod-config-input" data-mod-setting="${escapeHtml(field.key)}" type="text" value="${valueAttr}" placeholder="${escapeHtml(field.placeholder || "")}" spellcheck="false">
          <button type="button" class="mod-config-browse" data-mod-file-picker="${escapeHtml(field.key)}">Choose</button>
        </div>
      `;
    }
    if (field.type === "workspaceThemeMap") {
      return `
        ${label}
        <div class="mod-config-workspace-theme-map" data-workspace-theme-map="${escapeHtml(field.key)}">
          <div class="mod-config-wt-loading">Loading workspaces and themes...</div>
        </div>
      `;
    }
    return `
      ${label}
      <div class="mod-config-inline-field">
        <input id="mod-setting-${field.key}" class="mod-config-input" data-mod-setting="${escapeHtml(field.key)}" type="${field.type === "number" ? "number" : "text"}" value="${valueAttr}" ${field.min == null ? "" : 'min="' + escapeHtml(field.min) + '"'} ${field.max == null ? "" : 'max="' + escapeHtml(field.max) + '"'} ${field.step == null ? "" : 'step="' + escapeHtml(field.step) + '"'} placeholder="${escapeHtml(field.placeholder || "")}" spellcheck="false">
        ${unit}
      </div>
    `;
  }

  function renderInfoButton(text) {
    return '<span class="mod-config-info"><button type="button" aria-label="More information">' + INFO_ICON_SVG + '</button><span class="mod-config-info-tooltip" role="tooltip">' + escapeHtml(text) + "</span></span>";
  }

  function renderSettingDropdown(field, value, multiple) {
    const values = Array.isArray(value) ? value.map(String) : [String(value || "")];
    const selectedLabel = multiple
      ? (values.length ? values.join(", ") : "None")
      : String(value || field.defaultValue || field.options[0] || "");
    return `
      <div class="mod-config-dropdown mod-config-setting-dropdown ${multiple ? "is-multi" : ""}" data-setting-dropdown="${escapeHtml(field.key)}" data-multiple="${multiple ? "true" : "false"}">
        <input type="hidden" data-mod-setting="${escapeHtml(field.key)}" value="${escapeHtml(values.join(","))}">
        <button type="button" class="mod-config-dropdown-button" aria-haspopup="listbox" aria-expanded="false">
          <span class="mod-config-dropdown-label">${escapeHtml(selectedLabel)}</span>
          <span class="mod-config-dropdown-caret" aria-hidden="true">▾</span>
        </button>
        <div class="mod-config-dropdown-list" role="listbox" hidden>
          ${field.options.map((option) => (
            '<button type="button" class="mod-config-dropdown-option" role="option" data-value="' + escapeHtml(option) + '" data-selected="' + (values.includes(option) ? "true" : "false") + '">' + escapeHtml(option) + "</button>"
          )).join("")}
        </div>
      </div>
    `;
  }

  function collectModSettings(section, modKey) {
    const schema = MOD_SETTING_SCHEMAS[modKey];
    if (!schema) {
      return {};
    }
    const output = {};
    schema.fields.forEach((field) => {
      if (field.type === "workspaceThemeMap") {
        output[field.key] = collectWorkspaceThemeMap(section);
        return;
      }
      const input = section.querySelector('[data-mod-setting="' + field.key + '"]');
      if (!input) {
        return;
      }
      if (field.type === "boolean") {
        output[field.key] = Boolean(input.checked);
      } else if (field.type === "number") {
        const number = Number(input.value);
        output[field.key] = Number.isFinite(number) ? number : field.defaultValue;
      } else if (field.type === "list" || field.type === "multiSelect") {
        output[field.key] = parseListValue(input.value);
      } else {
        output[field.key] = String(input.value || "").trim();
      }
    });
    return normalizeModBlock(modKey, output);
  }

  function collectForm(section) {
    return {
      provider: getInput(section, "provider").value,
      apiEndpoint: getInput(section, "apiEndpoint").value.trim(),
      apiKey: getInput(section, "apiKey").value.trim(),
      model: getInput(section, "model").value.trim(),
    };
  }

  function collectVisibleConfig(section, config) {
    const nextConfig = cloneConfig(config);
    const panelKey = getInput(section, "configPanel").value || "ai";
    if (panelKey === "ai") {
      updateConfigFromForm(nextConfig, section);
    } else {
      nextConfig.mods[panelKey] = collectModSettings(section, panelKey);
    }
    return mergeConfig(nextConfig);
  }

  function updateConfigFromForm(config, section) {
    const moduleKey = getSelectedModule(section);
    if (moduleKey !== COMMON_KEY && section.dataset.resetToCommon === "true") {
      delete config.ai.overrides[moduleKey];
      section.dataset.resetToCommon = "";
      return;
    }
    const block = collectForm(section);
    if (moduleKey === COMMON_KEY) {
      config.ai.default = block;
      return;
    }
    config.ai.overrides[moduleKey] = block;
  }

  function extractModelIds(payload) {
    const list = Array.isArray(payload?.data)
      ? payload.data
      : (Array.isArray(payload?.models) ? payload.models : []);
    return list
      .map((item) => String(item?.id || item?.name || item || "").trim())
      .filter(Boolean)
      .slice(0, 200);
  }

  function getCustomFallbackBlock(config, moduleKey) {
    const draft = customDrafts.get(moduleKey);
    if (draft) {
      return draft;
    }
    const block = getEffectiveBlock(config, moduleKey);
    if (!block.provider) {
      return Object.assign({}, block, { provider: "" });
    }
    return Object.assign({}, normalizeAiBlock(config.ai.default), { provider: "" });
  }

  function applyBlockToForm(section, block) {
    setDropdownValue(section, "provider", block.provider || "", false);
    getInput(section, "apiEndpoint").value = block.apiEndpoint || "";
    getInput(section, "apiKey").value = block.apiKey || "";
    getInput(section, "model").value = block.model || "";
    section.dataset.previousProvider = block.provider || "";
    setApiKeyLink(section, block.provider || "");
    hideModelList(section);
    updateRestoreCommonVisibility(section);
  }

  function restoreCommonForm(section, config) {
    const common = normalizeAiBlock(config.ai.default);
    applyBlockToForm(section, common);
    section.dataset.resetToCommon = "true";
    rememberCustomDraft(section);
  }

  function rememberCustomDraft(section) {
    if (getInput(section, "provider").value) {
      return;
    }
    customDrafts.set(getSelectedModule(section), Object.assign(collectForm(section), { provider: "" }));
  }

  function getModelList(section) {
    return section.querySelector(".mod-config-model-list");
  }

  function hideModelList(section) {
    const list = getModelList(section);
    const wrap = section.querySelector(".mod-config-model-wrap");
    if (list) {
      list.hidden = true;
      list.innerHTML = "";
    }
    if (wrap) {
      wrap.classList.remove("is-open");
    }
  }

  function showModelList(section, models) {
    const list = getModelList(section);
    const wrap = section.querySelector(".mod-config-model-wrap");
    if (!list || !wrap) {
      return;
    }
    if (!models.length) {
      hideModelList(section);
      return;
    }
    list.innerHTML = models.map((id) => (
      '<button type="button" class="mod-config-model-option" data-model="' + escapeHtml(id) + '">' + escapeHtml(id) + "</button>"
    )).join("");
    list.hidden = false;
    wrap.classList.add("is-open");
  }

  function renderDropdown(name, items, className) {
    return `
      <div class="mod-config-dropdown ${className}" data-mod-dropdown="${name}">
        <input type="hidden" data-mod-config="${name}" value="${escapeHtml(items[0].key)}">
        <button type="button" class="mod-config-dropdown-button" aria-haspopup="listbox" aria-expanded="false">
          <span class="mod-config-dropdown-label">${escapeHtml(items[0].label)}</span>
          <span class="mod-config-dropdown-caret" aria-hidden="true">▾</span>
        </button>
        <div class="mod-config-dropdown-list" role="listbox" hidden>
          ${items.map((item) => (
            '<button type="button" class="mod-config-dropdown-option" role="option" data-value="' + escapeHtml(item.key) + '">' + escapeHtml(item.label) + "</button>"
          )).join("")}
        </div>
      </div>
    `;
  }

  async function fetchModelsForForm(section) {
    const endpoint = getInput(section, "apiEndpoint").value.trim();
    if (!endpoint) {
      return;
    }
    const provider = getProvider(getInput(section, "provider").value);
    const modelsUrl = provider.modelsUrl || deriveModelsUrl(endpoint);
    if (!modelsUrl) {
      return;
    }
    setStatus(section, "Loading model list...", "");
    try {
      const headers = {};
      const apiKey = getInput(section, "apiKey").value.trim();
      if (apiKey) {
        headers.Authorization = "Bearer " + apiKey;
      }
      const response = await fetch(modelsUrl, { headers });
      if (!response.ok) {
        if (response.status === 401) {
          hideModelList(section);
          setStatus(section, "Model list failed: fill in API Key and try again.", "error");
          return;
        }
        throw new Error("HTTP " + response.status);
      }
      const models = extractModelIds(await response.json());
      showModelList(section, models);
      setStatus(section, models.length ? ("Loaded " + models.length + " models.") : "No models found.", models.length ? "ok" : "");
    } catch (error) {
      hideModelList(section);
      setStatus(section, "Model list failed: " + (error?.message || "Unknown error"), "error");
    }
  }

  function injectStyles() {
    if (document.getElementById("mod-config-style")) {
      return;
    }
    const style = document.createElement("style");
    style.id = "mod-config-style";
    style.textContent = `
      #${SECTION_ID} {
        margin: 0 0 18px;
        padding: 13px 14px;
        max-width: 660px;
        border: 1px solid var(--colorBorderSubtle);
        border-radius: var(--radius);
        background: var(--colorBgLight);
        color: var(--colorFg);
      }
      #${SECTION_ID} .mod-config-header {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 6px 12px;
        margin-bottom: 12px;
      }
      #${SECTION_ID} .mod-config-panel-switcher {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      #${SECTION_ID} .mod-config-main-title {
        margin: 0;
        padding: 0;
        border: 0;
        color: var(--colorFg);
        font-size: 20px;
        font-weight: 700;
        line-height: 1.1;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      #${SECTION_ID} .mod-config-heading {
        grid-column: 1 / -1;
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }
      #${SECTION_ID} h2 {
        margin: 0;
        padding: 0;
        border: 0;
        color: var(--colorFg);
        font-size: 15px;
        font-weight: 650;
        line-height: 1.2;
        letter-spacing: 0;
        text-transform: none;
      }
      #${SECTION_ID} .mod-config-info {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      #${SECTION_ID} .mod-config-info > button {
        display: inline-grid;
        place-items: center;
        width: 13px;
        height: 13px;
        padding: 0;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: color-mix(in srgb, var(--colorFgFaded) 78%, transparent);
        line-height: 1;
        cursor: help;
      }
      #${SECTION_ID} .mod-config-info > button svg {
        display: block;
        width: 13px;
        height: 13px;
        fill: currentColor;
      }
      #${SECTION_ID} .mod-config-info-tooltip {
        position: absolute;
        z-index: 10020;
        left: calc(100% + 8px);
        top: 50%;
        width: max-content;
        max-width: 300px;
        padding: 7px 9px;
        border: 1px solid var(--colorBorder);
        border-radius: var(--radiusHalf);
        background: var(--colorBg);
        color: var(--colorFg);
        box-shadow: 0 8px 22px rgba(0, 0, 0, 0.2);
        font-size: 12px;
        font-weight: 400;
        line-height: 1.45;
        opacity: 0;
        pointer-events: none;
        transform: translate(4px, -50%);
        transition: opacity 140ms ease, transform 140ms ease;
        white-space: normal;
      }
      #${SECTION_ID} .mod-config-info:hover .mod-config-info-tooltip,
      #${SECTION_ID} .mod-config-info:focus-within .mod-config-info-tooltip {
        opacity: 1;
        transform: translate(0, -50%);
      }
      #${SECTION_ID} .mod-config-dropdown {
        position: relative;
        width: 172px;
        max-width: 172px;
      }
      #${SECTION_ID} .mod-config-panel-picker {
        width: 172px;
        max-width: 172px;
      }
      #${SECTION_ID} .mod-config-dropdown-button {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 172px;
        min-height: 30px;
        box-sizing: border-box;
        border: 1px solid var(--colorBorder);
        border-radius: var(--radiusHalf);
        background: var(--colorBg);
        color: var(--colorFg);
        box-shadow: none;
        padding: 5px 8px 5px 9px;
        cursor: pointer;
        text-align: left;
        white-space: nowrap;
      }
      #${SECTION_ID} .mod-config-setting-dropdown,
      #${SECTION_ID} .mod-config-setting-dropdown .mod-config-dropdown-button {
        width: 430px;
        max-width: 430px;
      }
      #${SECTION_ID} .mod-config-panel-picker .mod-config-dropdown-button {
        font-weight: 700;
        letter-spacing: 0.02em;
        text-transform: uppercase;
      }
      #${SECTION_ID} .mod-config-dropdown-label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #${SECTION_ID} .mod-config-dropdown-caret {
        flex: 0 0 auto;
        color: var(--colorFgFaded);
        margin-left: 8px;
      }
      #${SECTION_ID} .mod-config-dropdown.is-open .mod-config-dropdown-button {
        border-color: var(--colorHighlightBg);
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }
      #${SECTION_ID} .mod-config-dropdown-list {
        position: absolute;
        z-index: 10000;
        left: 0;
        right: 0;
        top: calc(100% - 1px);
        max-height: 230px;
        overflow: auto;
        border: 1px solid var(--colorHighlightBg);
        border-top: none;
        border-radius: 0 0 var(--radiusHalf) var(--radiusHalf);
        background: var(--colorBg);
        box-shadow: 0 8px 22px rgba(0, 0, 0, 0.18);
      }
      #${SECTION_ID} .mod-config-dropdown-option {
        display: block;
        width: 100%;
        min-height: 28px;
        padding: 5px 9px;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: var(--colorFg);
        text-align: left;
        white-space: nowrap;
        box-shadow: none;
        cursor: pointer;
      }
      #${SECTION_ID} .mod-config-dropdown-option:hover,
      #${SECTION_ID} .mod-config-dropdown-option:focus,
      #${SECTION_ID} .mod-config-dropdown-option[data-selected="true"] {
        background: var(--colorHighlightBg);
        color: var(--colorHighlightFg);
        outline: none;
      }
      #${SECTION_ID} .mod-config-grid {
        display: grid;
        grid-template-columns: 132px 430px;
        gap: 8px 12px;
        align-items: center;
        justify-content: start;
      }
      #${SECTION_ID} .mod-config-ai-pane[hidden],
      #${SECTION_ID} .mod-config-mod-pane[hidden] {
        display: none !important;
      }
      #${SECTION_ID} .mod-config-label {
        color: var(--colorFg);
        font-weight: 500;
        text-align: left;
      }
      #${SECTION_ID} .mod-config-label-with-info {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      #${SECTION_ID} .mod-config-api-key-label {
        display: flex;
        justify-content: flex-start;
        align-items: baseline;
        gap: 8px;
      }
      #${SECTION_ID} .mod-config-input,
      #${SECTION_ID} .mod-config-select {
        width: 100%;
        max-width: 430px;
        min-height: 30px;
        box-sizing: border-box;
        border: 1px solid var(--colorBorder);
        border-radius: var(--radiusHalf);
        background: var(--colorBg);
        color: var(--colorFg);
        box-shadow: none;
        padding: 5px 9px;
      }
      #${SECTION_ID} .mod-config-inline-field {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 430px;
        max-width: 430px;
      }
      #${SECTION_ID} .mod-config-inline-field .mod-config-input {
        min-width: 0;
      }
      #${SECTION_ID} .mod-config-unit {
        color: var(--colorFgFaded);
        font-size: 12px;
        white-space: nowrap;
      }
      #${SECTION_ID} .mod-config-switch {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-height: 30px;
        color: var(--colorFg);
      }
      #${SECTION_ID} .mod-config-browse {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 30px;
        padding: 5px 12px;
        border: 1px solid var(--colorBorder);
        border-radius: var(--radiusHalf);
        background: var(--colorBg);
        color: var(--colorFg);
        box-shadow: none;
        cursor: pointer;
      }
      #${SECTION_ID} .mod-config-browse:hover {
        background: var(--colorBgDarker);
      }
      #${SECTION_ID} .mod-config-input::placeholder {
        color: var(--colorFgFaded);
      }
      #${SECTION_ID} .mod-config-input:focus,
      #${SECTION_ID} .mod-config-select:focus {
        border-color: var(--colorHighlightBg);
        outline: none;
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--colorHighlightBg) 22%, transparent);
      }
      #${SECTION_ID} .mod-config-key-wrap {
        position: relative;
        width: 430px;
        max-width: 430px;
      }
      #${SECTION_ID} .mod-config-key-wrap .mod-config-input {
        padding-right: 34px;
      }
      #${SECTION_ID} .mod-config-eye {
        position: absolute;
        right: 6px;
        top: 50%;
        width: 24px;
        height: 24px;
        border: none;
        border-radius: 999px;
        background: transparent;
        color: var(--colorFgFaded);
        cursor: pointer;
        transform: translateY(-50%);
        opacity: 0;
      }
      #${SECTION_ID} .mod-config-eye svg {
        display: block;
        width: 15px;
        height: 15px;
        margin: auto;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.8;
      }
      #${SECTION_ID} .mod-config-eye:hover {
        background: var(--colorBgDarker);
        color: var(--colorFg);
      }
      #${SECTION_ID} .mod-config-key-wrap:hover .mod-config-eye,
      #${SECTION_ID} .mod-config-key-wrap:focus-within .mod-config-eye {
        opacity: 1;
      }
      #${SECTION_ID} .mod-config-api-key-row {
        display: block;
      }
      #${SECTION_ID} .mod-config-api-key-link {
        white-space: nowrap;
        font-size: 12px;
      }
      #${SECTION_ID} .mod-config-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        padding-left: 0;
        margin-top: 12px;
      }
      #${SECTION_ID} .mod-config-file-actions {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      #${SECTION_ID} .mod-config-save,
      #${SECTION_ID} .mod-config-restore-common,
      #${SECTION_ID} .mod-config-import,
      #${SECTION_ID} .mod-config-export {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        appearance: none;
        height: 30px;
        min-height: 30px;
        max-height: 30px;
        box-sizing: border-box;
        margin: 0;
        line-height: 18px;
        font: inherit;
        padding: 5px 12px;
        box-shadow: none;
        cursor: pointer;
        vertical-align: middle;
      }
      #${SECTION_ID} .mod-config-save {
        border: 1px solid var(--colorHighlightBg);
        border-radius: var(--radiusHalf);
        background: var(--colorHighlightBg);
        color: var(--colorHighlightFg);
        font-weight: 600;
      }
      #${SECTION_ID} .mod-config-save:hover {
        filter: brightness(1.06);
      }
      #${SECTION_ID} .mod-config-save:active {
        filter: brightness(0.96);
      }
      #${SECTION_ID} .mod-config-restore-common {
        border: 1px solid var(--colorBorder);
        border-radius: var(--radiusHalf);
        background: var(--colorBg);
        color: var(--colorFg);
      }
      #${SECTION_ID} .mod-config-import,
      #${SECTION_ID} .mod-config-export {
        border: 1px solid var(--colorBorder);
        border-radius: var(--radiusHalf);
        background: var(--colorBg);
        color: var(--colorFg);
      }
      #${SECTION_ID} .mod-config-restore-common[hidden] {
        display: none !important;
      }
      #${SECTION_ID} .mod-config-restore-common:hover,
      #${SECTION_ID} .mod-config-import:hover,
      #${SECTION_ID} .mod-config-export:hover {
        background: var(--colorBgDarker);
      }
      #${SECTION_ID} .mod-config-model-wrap {
        position: relative;
        width: 430px;
        max-width: 430px;
      }
      #${SECTION_ID} .mod-config-model-wrap.is-open .mod-config-input {
        border-color: var(--colorHighlightBg);
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }
      #${SECTION_ID} .mod-config-model-list {
        position: absolute;
        z-index: 10000;
        left: 0;
        right: 0;
        top: calc(100% - 1px);
        max-height: 230px;
        overflow: auto;
        border: 1px solid var(--colorHighlightBg);
        border-top: none;
        border-radius: 0 0 var(--radiusHalf) var(--radiusHalf);
        background: var(--colorBg);
        box-shadow: 0 8px 22px rgba(0, 0, 0, 0.18);
      }
      #${SECTION_ID} .mod-config-model-option {
        display: block;
        width: 100%;
        min-height: 28px;
        padding: 5px 9px;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: var(--colorFg);
        text-align: left;
        box-shadow: none;
        cursor: pointer;
      }
      #${SECTION_ID} .mod-config-model-option:hover,
      #${SECTION_ID} .mod-config-model-option:focus {
        background: var(--colorHighlightBg);
        color: var(--colorHighlightFg);
        outline: none;
      }
      #${SECTION_ID} .mod-config-status {
        flex: 1 1 auto;
        margin-right: auto;
        color: var(--colorFgFaded);
        font-size: 12px;
      }
      #${SECTION_ID} .mod-config-status[data-tone="ok"] {
        color: var(--colorSuccessBg);
      }
      #${SECTION_ID} .mod-config-status[data-tone="error"] {
        color: var(--colorErrorBg);
      }
      #${SECTION_ID} .mod-config-storage-status {
        color: var(--colorFgFadedMore);
        font-size: 12px;
        line-height: 1.45;
        white-space: nowrap;
      }
      #${SECTION_ID} .mod-config-storage-summary {
        justify-self: end;
        align-self: center;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        color: var(--colorFgFadedMore);
        font-size: 12px;
        line-height: 1.45;
        text-align: right;
        white-space: nowrap;
      }
      @media (max-width: 760px) {
        #${SECTION_ID} {
          max-width: none;
        }
        #${SECTION_ID} .mod-config-header {
          grid-template-columns: minmax(0, 1fr);
        }
        #${SECTION_ID} .mod-config-grid {
          grid-template-columns: minmax(0, 1fr);
        }
        #${SECTION_ID} .mod-config-label {
          text-align: left;
        }
        #${SECTION_ID} .mod-config-api-key-label {
          justify-content: flex-start;
        }
        #${SECTION_ID} .mod-config-key-wrap,
        #${SECTION_ID} .mod-config-model-wrap,
        #${SECTION_ID} .mod-config-inline-field,
        #${SECTION_ID} .mod-config-input,
        #${SECTION_ID} .mod-config-dropdown,
        #${SECTION_ID} .mod-config-dropdown-button,
        #${SECTION_ID} .mod-config-setting-dropdown,
        #${SECTION_ID} .mod-config-setting-dropdown .mod-config-dropdown-button {
          width: 100%;
          max-width: 100%;
        }
        #${SECTION_ID} .mod-config-actions {
          align-items: flex-start;
          flex-wrap: wrap;
          padding-left: 0;
        }
        #${SECTION_ID} .mod-config-storage-summary {
          justify-self: start;
        }
      }
      #${SECTION_ID} .mod-config-workspace-theme-map {
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      #${SECTION_ID} .mod-config-wt-header {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px 12px;
        padding: 6px 0;
        border-bottom: 1px solid var(--colorBorderSubtle);
        font-weight: 600;
        font-size: 12px;
        color: var(--colorFgFaded);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      #${SECTION_ID} .mod-config-wt-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px 12px;
        align-items: center;
        padding: 4px 0;
      }
      #${SECTION_ID} .mod-config-wt-workspace {
        display: flex;
        align-items: center;
        gap: 6px;
        min-height: 30px;
        color: var(--colorFg);
        font-size: 13px;
      }
      #${SECTION_ID} .mod-config-wt-theme {
        position: relative;
      }
      #${SECTION_ID} .mod-config-wt-loading {
        grid-column: 1 / -1;
        padding: 12px 0;
        color: var(--colorFgFaded);
        font-size: 12px;
        text-align: center;
      }
    `;
    document.head.appendChild(style);
  }

  function buildSection() {
    const section = document.createElement("div");
    section.id = SECTION_ID;
    section.innerHTML = `
      <div class="mod-config-header">
        <div class="mod-config-panel-switcher">
          <h1 class="mod-config-main-title">MOD CONFIG</h1>
          ${renderDropdown("configPanel", CONFIG_PANELS, "mod-config-panel-picker")}
          ${renderInfoButton("Switch MOD CONFIG here to edit each mod's settings.")}
        </div>
        <div class="mod-config-storage-summary">
          <span class="mod-config-storage-status">Storage: checking...</span>
          ${renderInfoButton("Usage is the OPFS space currently used by this browser profile. Quota is the browser-estimated storage budget available to this origin.")}
        </div>
        <div class="mod-config-heading">
          <h2 class="mod-config-title">AI Config</h2>
          <span class="mod-config-section-info">${renderInfoButton("")}</span>
        </div>
      </div>
      <div class="mod-config-ai-pane">
        <div class="mod-config-grid">
          <label class="mod-config-label">AI Mod Config</label>
          ${renderDropdown("module", MODULES, "mod-config-module")}
          <label class="mod-config-label">Provider</label>
          ${renderDropdown("provider", PROVIDERS, "mod-config-provider")}
          <label class="mod-config-label">API Endpoint</label>
          <input class="mod-config-input" data-mod-config="apiEndpoint" type="url" spellcheck="false" placeholder="https://your-api-endpoint.com/v1/chat/completions">
          <div class="mod-config-label mod-config-api-key-label">
            <span>API Key</span>
            <a class="mod-config-api-key-link" target="_blank" rel="noreferrer" hidden>Get API key</a>
          </div>
          <div class="mod-config-api-key-row">
            <div class="mod-config-key-wrap">
              <input class="mod-config-input" data-mod-config="apiKey" type="password" spellcheck="false" autocomplete="off" placeholder="Paste your key here...">
              <button type="button" class="mod-config-eye" title="Show API Key" aria-label="Show API Key">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"></path>
                  <circle cx="12" cy="12" r="2.6"></circle>
                </svg>
              </button>
            </div>
          </div>
          <label class="mod-config-label">Model</label>
          <div class="mod-config-model-wrap">
            <input class="mod-config-input" data-mod-config="model" type="text" spellcheck="false" placeholder="Focus to load models or type a model id">
            <div class="mod-config-model-list" hidden></div>
          </div>
        </div>
      </div>
      <div class="mod-config-mod-pane" hidden>
        <div class="mod-config-grid mod-config-mod-grid"></div>
      </div>
      <div class="mod-config-actions">
        <div class="mod-config-file-actions">
          <button type="button" class="mod-config-import">Import</button>
          <button type="button" class="mod-config-export">Export</button>
          <input class="mod-config-import-file" type="file" accept="application/json,.json" hidden>
        </div>
        <span class="mod-config-status"></span>
        <button type="button" class="mod-config-restore-common" hidden>Restore Common</button>
        <button type="button" class="mod-config-save">Save</button>
      </div>
    `;
    return section;
  }

  async function bindSection(section) {
    refreshStorageStatus(section);
    let config = await readConfig();
    refreshStorageStatus(section);
    setTopPanel(section, "ai");
    fillForm(section, config, COMMON_KEY);
    renderModSettingsForm(section, config, "quickCapture");
    getInput(section, "configPanel").addEventListener("change", () => {
      const panelKey = getInput(section, "configPanel").value || "ai";
      setTopPanel(section, panelKey);
      if (panelKey !== "ai") {
        renderModSettingsForm(section, config, panelKey);
      }
      updateRestoreCommonVisibility(section);
    });
    getInput(section, "module").addEventListener("change", () => {
      fillForm(section, config, getSelectedModule(section));
    });
    getInput(section, "provider").addEventListener("change", () => {
      const moduleKey = getSelectedModule(section);
      const previousProvider = section.dataset.previousProvider || "";
      const nextProviderKey = getInput(section, "provider").value;
      if (!previousProvider) {
        customDrafts.set(moduleKey, Object.assign(collectForm(section), { provider: "" }));
      }
      if (!nextProviderKey) {
        applyBlockToForm(section, getCustomFallbackBlock(config, moduleKey));
        section.dataset.resetToCommon = "";
        return;
      }
      const provider = getProvider(nextProviderKey);
      if (provider.apiEndpoint) {
        getInput(section, "apiEndpoint").value = provider.apiEndpoint;
      }
      getInput(section, "apiKey").value = "";
      getInput(section, "model").value = "";
      setApiKeyLink(section, provider.key);
      section.dataset.previousProvider = provider.key;
      section.dataset.resetToCommon = "";
      updateRestoreCommonVisibility(section);
      hideModelList(section);
    });
    getInput(section, "model").addEventListener("focus", () => {
      fetchModelsForForm(section);
    });
    ["apiEndpoint", "apiKey", "model"].forEach((name) => {
      getInput(section, name).addEventListener("input", () => rememberCustomDraft(section));
    });
    getInput(section, "model").addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        hideModelList(section);
      }
    });
    section.querySelector(".mod-config-model-list").addEventListener("mousedown", (event) => {
      const option = event.target.closest(".mod-config-model-option");
      if (!option) {
        return;
      }
      event.preventDefault();
      getInput(section, "model").value = option.dataset.model || "";
      hideModelList(section);
    });
    section.addEventListener("click", (event) => {
      const fileButton = event.target.closest("[data-mod-file-picker]");
      if (fileButton) {
        chooseFileForSetting(section, fileButton.dataset.modFilePicker);
        return;
      }
      const dropdownButton = event.target.closest(".mod-config-dropdown-button");
      if (dropdownButton) {
        const dropdown = dropdownButton.closest(".mod-config-dropdown");
        const list = dropdown.querySelector(".mod-config-dropdown-list");
        const isOpen = dropdown.classList.contains("is-open");
        hideDropdowns(section);
        hideModelList(section);
        dropdown.classList.toggle("is-open", !isOpen);
        dropdownButton.setAttribute("aria-expanded", String(!isOpen));
        if (list) {
          list.hidden = isOpen;
        }
        return;
      }
      const settingOption = event.target.closest(".mod-config-setting-dropdown .mod-config-dropdown-option");
      if (settingOption) {
        const dropdown = settingOption.closest(".mod-config-setting-dropdown");
        const input = dropdown.querySelector("[data-mod-setting]");
        const value = settingOption.dataset.value || "";
        if (!input) {
          return;
        }
        if (dropdown.dataset.multiple === "true") {
          const values = new Set(parseListValue(input.value));
          if (values.has(value)) {
            values.delete(value);
          } else {
            values.add(value);
          }
          input.value = Array.from(values).join(",");
          dropdown.querySelectorAll(".mod-config-dropdown-option").forEach((option) => {
            option.dataset.selected = values.has(option.dataset.value) ? "true" : "false";
          });
          updateSettingDropdownLabel(dropdown);
          return;
        }
        input.value = value;
        dropdown.querySelectorAll(".mod-config-dropdown-option").forEach((option) => {
          option.dataset.selected = option.dataset.value === value ? "true" : "false";
        });
        updateSettingDropdownLabel(dropdown);
        hideDropdowns(section);
        return;
      }
      const option = event.target.closest(".mod-config-dropdown-option");
      if (!option) {
        return;
      }
      const dropdown = option.closest(".mod-config-dropdown");
      const name = dropdown?.dataset.modDropdown;
      if (!name) {
        return;
      }
      setDropdownValue(section, name, option.dataset.value || "", true);
      hideDropdowns(section);
    });
    section.querySelector(".mod-config-restore-common").addEventListener("click", () => {
      restoreCommonForm(section, config);
      setStatus(section, "Common AI Config restored. Click Save to apply.", "ok");
    });
    section.querySelector(".mod-config-export").addEventListener("click", () => {
      exportConfigFile(section, config);
    });
    section.querySelector(".mod-config-import").addEventListener("click", async () => {
      const importedConfig = await chooseImportConfigFile(section);
      if (!importedConfig) {
        return;
      }
      try {
        await writeConfig(importedConfig);
        config = await readConfig();
        refreshCurrentPanel(section, config);
        dispatchConfigUpdated(config);
        refreshStorageStatus(section);
        setStatus(section, "Config imported and applied.", "ok");
      } catch (error) {
        setStatus(section, "Import failed: " + (error?.message || "Unknown error"), "error");
      }
    });
    section.querySelector(".mod-config-import-file").addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      try {
        const importedConfig = await readConfigFromFile(file);
        await writeConfig(importedConfig);
        config = await readConfig();
        refreshCurrentPanel(section, config);
        dispatchConfigUpdated(config);
        refreshStorageStatus(section);
        setStatus(section, "Config imported and applied.", "ok");
      } catch (error) {
        setStatus(section, "Import failed: " + (error?.message || "Unknown error"), "error");
      } finally {
        event.target.value = "";
      }
    });
    ["apiEndpoint", "apiKey", "model", "provider"].forEach((name) => {
      getInput(section, name).addEventListener("input", () => {
        section.dataset.resetToCommon = "";
      });
      getInput(section, name).addEventListener("change", () => {
        section.dataset.resetToCommon = "";
      });
    });
    section.addEventListener("change", (event) => {
      const input = event.target.closest("[data-mod-setting]");
      if (!input || input.type !== "checkbox") {
        return;
      }
      const label = input.closest(".mod-config-switch")?.querySelector("span");
      if (label) {
        label.textContent = input.checked ? "Enabled" : "Disabled";
      }
    });
    document.addEventListener("mousedown", (event) => {
      if (!section.contains(event.target)) {
        hideDropdowns(section);
        hideModelList(section);
      }
    });
    section.querySelector(".mod-config-eye").addEventListener("click", (event) => {
      const input = getInput(section, "apiKey");
      const showing = input.type === "text";
      input.type = showing ? "password" : "text";
      event.currentTarget.title = showing ? "Show API Key" : "Hide API Key";
      event.currentTarget.setAttribute("aria-label", event.currentTarget.title);
    });
    section.querySelector(".mod-config-save").addEventListener("click", async () => {
      try {
        const panelKey = getInput(section, "configPanel").value || "ai";
        if (panelKey === "ai") {
          updateConfigFromForm(config, section);
        } else {
          config.mods[panelKey] = collectModSettings(section, panelKey);
        }
        await writeConfig(config);
        config = await readConfig();
        refreshCurrentPanel(section, config);
        dispatchConfigUpdated(config);
        setStatus(section, panelKey === "ai" ? "Saved and applied to new AI requests." : "Saved and applied to this mod.", "ok");
        refreshStorageStatus(section);
      } catch (error) {
        setStatus(section, "Save failed: " + (error?.message || "Unknown error"), "error");
      }
    });
  }

  function findAppearanceSettingsAnchor() {
    const groups = Array.from(document.querySelectorAll(".setting-group.unlimited"));
    return groups.length >= 2 ? groups[1] : null;
  }

  function injectModSection() {
    if (!targetSettingsVisible) {
      removeModSection();
      return false;
    }
    const anchor = findAppearanceSettingsAnchor();
    const section = document.getElementById(SECTION_ID);
    if (!anchor?.parentNode) {
      return Boolean(section);
    }
    if (section) {
      return true;
    }
    injectStyles();
    const nextSection = anchor.nextElementSibling;
    const modSection = buildSection();
    anchor.parentNode.insertBefore(modSection, nextSection || null);
    bindSection(modSection).catch((error) => {
      setStatus(modSection, "Load failed: " + (error?.message || "Unknown error"), "error");
    });
    return true;
  }

  function removeModSection() {
    document.getElementById(SECTION_ID)?.remove();
  }

  function clearInjectRetry() {
    if (injectRetryTimer) {
      clearTimeout(injectRetryTimer);
      injectRetryTimer = null;
    }
  }

  function scheduleInjectModSection(delay = 0, attempts = 8) {
    clearInjectRetry();
    let remaining = attempts;
    const run = () => {
      injectRetryTimer = null;
      if (!targetSettingsVisible) {
        removeModSection();
        return;
      }
      if (injectModSection()) {
        return;
      }
      if (remaining > 0) {
        remaining -= 1;
        injectRetryTimer = setTimeout(run, 150);
      }
    };
    injectRetryTimer = setTimeout(run, delay);
  }

  function refreshTargetSettingsVisibility(delay = 0) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs?.[0];
      targetSettingsVisible = isTargetSettingsUrl(tab?.url || tab?.pendingUrl || "");
      if (!targetSettingsVisible) {
        clearInjectRetry();
        removeModSection();
        return;
      }
      scheduleInjectModSection(delay);
    });
  }

  function scheduleTargetSettingsRefresh(queryDelay = 0, injectDelay = 0) {
    if (visibilityRefreshTimer) {
      clearTimeout(visibilityRefreshTimer);
    }
    visibilityRefreshTimer = setTimeout(() => {
      visibilityRefreshTimer = null;
      refreshTargetSettingsVisibility(injectDelay);
    }, queryDelay);
  }

  chrome.tabs.onUpdated.addListener((_tabId, changeInfo) => {
    if (!changeInfo.url && changeInfo.status !== "complete") {
      return;
    }
    scheduleTargetSettingsRefresh(80, 300);
  });

  chrome.tabs.onActivated.addListener(() => {
    scheduleTargetSettingsRefresh(0, 300);
  });

  scheduleTargetSettingsRefresh(0, 300);
})();
