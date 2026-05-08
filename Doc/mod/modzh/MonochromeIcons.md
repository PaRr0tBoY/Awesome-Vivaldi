[English](../MonochromeIcons.md) | 简体中文

---

# MonochromeIcons 设计与实现分析

本文基于当前工作区中的 [MonochromeIcons.js](/Vivaldi7.9Stable/Javascripts/MonochromeIcons.js)。

## 1. 依赖

### Vivaldi 内部 API
- `vivaldi.prefs.get()` - 读取当前主题配置（`vivaldi.themes.current`）
- 无 `chrome.*` API 使用

### 外部依赖
- `MutationObserver` - 监听浏览器主题颜色变化
- `getComputedStyle()` - 读取计算后的 CSS 颜色值
- `ResizeObserver` - 未使用

### 模组间依赖
- 无 JS 模组依赖
- 无对应 CSS 文件（纯 JS 动态注入 `<style>`）

## 2. 功能

### 核心功能

将 Vivaldi 侧边栏的 Web Panel 图标（缩略图）转换为单色调风格，颜色跟随当前主题的强调色自动适配。

### 主要特性

1. **主题色自动提取** - 从 Vivaldi 主题的计算样式中读取 `color` 属性（sRGB 格式），解析出 RGB 分量
2. **色相计算** - 使用 HSL 色相公式将 RGB 转换为色相角度（hue），并减去偏移量 38.71 度作为修正值
3. **CSS 滤镜注入** - 动态生成并注入 CSS，使用 `filter: brightness(0.77) sepia(1) hue-rotate(Xdeg)` 将图标染色为主题色
4. **失焦状态处理** - 当浏览器窗口失焦（`#browser.isblurred`）时，降低图标透明度至 0.65
5. **主题变化响应** - 通过 MutationObserver 监听主题相关属性变化，自动重新计算并更新滤镜

### 行为预期

- Web Panel 图标默认显示为单色调，色调匹配当前 Vivaldi 主题
- 切换主题后，图标色调自动更新
- 浏览器失焦时图标变淡，恢复焦点后恢复正常

## 3. 使用方法

### 启用方式

1. 将 `MonochromeIcons.js` 复制到 Vivaldi 资源目录
2. 在 `window.html` 中引入：`<script src="MonochromeIcons.js"></script>`
3. 无需额外 CSS 文件

### 用户交互

- 无直接用户交互，完全自动化运行
- 图标外观随主题切换自动更新

### 配置选项

- 无 ModConfig 集成，无用户可配置项
- 亮度值（0.77）和色相偏移（38.71）为硬编码常量，需修改源码调整

## 4. 设计思路

### 设计初衷

Vivaldi 侧边栏的 Web Panel 图标来自各网站的 favicon，颜色风格各异，与精心设计的主题不协调。本模组将这些图标统一为跟随主题色调的单色风格，提升视觉一致性。

### 核心架构决策

1. **纯 CSS 滤镜方案** - 不修改图标源文件，使用 CSS `filter` 属性的 `sepia + hue-rotate` 组合实现染色，性能开销极低
2. **色相偏移修正** - sepia 滤镜会将颜色映射到约 38.71 度的暖色调区间，因此计算 hue 时减去该偏移量，确保最终显示颜色准确匹配主题色
3. **动态样式注入** - 通过创建 `<style>` 元素注入 CSS，而非修改外部文件，确保模组自包含

### 关键实现细节

- **sRGB 颜色解析**：Vivaldi 计算样式返回 `color(srgb r g b)` 格式，需手动解析字符串提取分量
- **色相公式**：使用 `atan2(sqrt(3)*(g-b), 2*r-g-b)` 计算色相，这是标准的 HSL 色相计算公式
- **失焦状态**：通过 `.isblurred` 类名检测窗口焦点状态，使用 opacity 降低视觉干扰

### 与其他模组的协作

- 独立运行，不依赖其他模组
- 与任何修改侧边栏外观的 CSS 模组兼容（滤镜在图标渲染层工作，不改变 DOM 结构）

---

*源码约 84 行，作者: luetage, AltCode*
*参考: [Vivaldi Forum Post #791344](https://forum.vivaldi.net/post/791344)*
