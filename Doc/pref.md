# Vivaldi 模组配置方案

## 核心 API

```javascript
// 读取
vivaldi.prefs.get("path.to.setting", (value) => { ... });

// 写入
vivaldi.prefs.set({ "path.to.setting": newValue });

// 监听变化（热更新关键）
vivaldi.prefs.onChanged.addListener(({ path, value }) => {
  switch (path) {
    case "path.to.setting":
      // 实时响应
      break;
  }
});
```

## 配置约定

### 路径命名

```
mod.<modName>.<settingKey>
```

示例：
```
mod.tidytabs.enabled
mod.tidytabs.maxTabs
mod.arcpeek.enable
```

### 模组声明

```javascript
// <ModName>.js
const MOD_CONFIG = {
  id: "ModName",
  label: "显示名称",
  prefs: {
    "mod.modname.enabled": { type: "boolean", default: true },
    "mod.modname.option": { type: "string", default: "default" }
  }
};
```

## 热更新模式

### 初始化

```javascript
// 读取当前值并初始化 UI
vivaldi.prefs.get("mod.modname.enabled", (value) => {
  document.body.classList.toggle("mod-disabled", !value);
});
```

### 监听响应

```javascript
vivaldi.prefs.onChanged.addListener(({ path, value }) => {
  if (path === "mod.modname.enabled") {
    document.body.classList.toggle("mod-disabled", !value);
  }
});
```

### 写入

```javascript
// 从设置面板触发
vivaldi.prefs.set({ "mod.modname.enabled": false });
```

## 设置面板注入

### 注入位置

```javascript
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!changeInfo.url?.includes("settings.html?path=sync")) return;
  setTimeout(injectModSection, 300);
});

function injectModSection() {
  const container = document.querySelector(".sync-setup");
  if (!container || container.querySelector("#mod-config-section")) return;

  // 渲染配置项
}
```

### 渲染 Toggle

```javascript
function createToggle(path, value, label) {
  const wrap = document.createElement("div");
  wrap.className = "setting-single";

  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = value;
  input.addEventListener("change", () => {
    vivaldi.prefs.set({ [path]: input.checked });
  });

  wrap.append(input, label);
  return wrap;
}
```

## 文件结构

```
VivaldiModpack/
├── Vivaldi7.9Stable/
│   ├── Javascripts/
│   │   ├── ModConfig.js      # 配置聚合与渲染
│   │   └── <ModName>.js      # 各模组 + MOD_CONFIG
│   └── CSS/
│       └── <ModName>.css     # .mod-disabled 禁用样式
└── Doc/
    └── pref.md              # 本文档
```

## 禁用样式处理

```css
/* 默认启用 */
.mod-section { display: block; }

/* 禁用态 */
.mod-disabled { display: none; }
```

```javascript
// 模组初始化时检查
vivaldi.prefs.get("mod.modname.enabled", (value) => {
  document.body.classList.toggle("mod-disabled", !value);
});
```

## 注意事项

- `vivaldi.prefs` 是 Vivaldi 官方 API，优先于 `chrome.storage`
- 偏好路径建议以 `mod.` 前缀避免冲突
- 监听器在页面加载时注册，页面卸载时自动失效
