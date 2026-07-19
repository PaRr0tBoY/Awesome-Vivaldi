# DESIGN.md

## Color Strategy

**Approach**: Restrained — tinted neutrals via Vivaldi native variables + one warm accent.

All custom colors MUST use Vivaldi native CSS variables first. Define `--vmod-*` prefix variables only when no native variable has the needed semantics.

### Dynamic Color Techniques

**`light-dark(light, dark)`** for automatic theme switching — CSS 自动根据 `prefers-color-scheme` 解析，无需手动写 dark-mode override：

```css
background: light-dark(#f9f9f9, #1c1b1f);
color: light-dark(#1c1b1f, #e8e6e0);
```

**`color-mix(in srgb, color %, transparent)`** for accent-derived states — 从单一强调色派生完整色阶，用户可配置强调色时自动适配：

```css
/* 40% accent tint for selected/essential items */
background: color-mix(in srgb, var(--vmod-accent) 40%, transparent);
/* 96% neutral + 4% accent for subtle branded buttons */
background: color-mix(in srgb, var(--colorBg) 96%, var(--vmod-accent));
```

常用浓度梯度：20%（微妙着色）、40%（选中状态）、60%（强调）、80%（高亮）、96%（近乎中性但带品牌感）。

**Tonal Layering** — 层次通过表面亮度变化感知，非阴影深度：
- Light mode：白色层叠（`rgba(255,255,255,0.8)` on `#f9f9f9`）
- Dark mode：半透明白色叠加（`rgba(255,255,255,0.18)` on `#1c1b1f`）

### Vivaldi Native Color Variables (must consume, never override)

| Token | Usage | Notes |
|---|---|---|
| `var(--colorBg)` | Primary background | Dark theme core |
| `var(--colorBgAlpha)` | Background with alpha | Overlays, floating layers |
| `var(--colorBgIntense)` | Intense background | Active state, selected |
| `var(--colorBgLight)` | Light background | Secondary panels |
| `var(--colorBgLighter)` | Lighter background | Inputs, cards |
| `var(--colorBgDark)` | Dark background | Deep nesting |
| `var(--colorBgDarker)` | Darkest background | Sidebar bottom |
| `var(--colorFg)` | Primary foreground text | All default text |
| `var(--colorFgAlpha)` | Foreground with alpha | Secondary text |
| `var(--colorFgFaded)` | Faded foreground | Auxiliary info |
| `var(--colorFgFadedMore)` | More faded foreground | Timestamps, metadata |
| `var(--colorFgFadedMost)` | Most faded foreground | Placeholders |
| `var(--colorAccentBg)` | Accent background | Buttons, badges |
| `var(--colorAccentBgAlpha)` | Accent with alpha | Hover states |
| `var(--colorAccentFg)` | Accent foreground | Links, highlighted text |
| `var(--colorHighlightBg)` | Highlight background | Selected items, focus |
| `var(--colorHighlightBgAlpha)` | Highlight with alpha | Selected item overlays |
| `var(--colorBorder)` | Border color | All dividers |
| `var(--colorBorderSubtle)` | Subtle border | Fine dividers |
| `var(--colorTabBar)` | Tab bar background | Tab bar area |
| `var(--colorErrorBg)` | Error background | Error indicators |

### Mod Custom Color Variables

Use only when Vivaldi native variables lack the needed semantics. Unified `--vmod-` prefix.

| Token | Value | Usage |
|---|---|---|
| `--vmod-accent` | `oklch(0.65 0.08 155)` | Mod brand accent (warm green) |
| `--vmod-accent-fg` | `oklch(0.95 0.02 155)` | Text on accent color |
| `--vmod-button-bg` | `var(--colorBgLight)` | Button default background |
| `--vmod-button-bg-hover` | `var(--colorBgLighter)` | Button hover background |

### Diabar (AI Sidebar) Color Variables

The AI sidebar uses independent `--aip-` prefix, parallel semantics to Vivaldi native but managed independently.

| Token | Maps to | Usage |
|---|---|---|
| `--aip-text-primary` | ~ `var(--colorFg)` | AI message primary text |
| `--aip-text-secondary` | ~ `var(--colorFgFaded)` | AI secondary text |
| `--aip-text-muted` | ~ `var(--colorFgFadedMore)` | AI metadata |
| `--aip-border` | ~ `var(--colorBorder)` | AI panel border |
| `--aip-border-hover` | ~ `var(--colorBorderSubtle)` | AI element hover border |
| `--aip-accent` | ~ `var(--colorAccentBg)` | AI accent color |
| `--aip-shadow-base` | `rgba(0,0,0,0.2)` | AI panel shadow |

---

## Typography

Vivaldi controls the global font family. Mods do NOT override `font-family`. Only control size and weight hierarchy.

| Level | Size | Weight | Usage |
|---|---|---|---|
| Body | `12px` / `var(--fontSize)` | `400` | Tab text, menu items |
| Caption | `11px` | `400` | Timestamps, badges, auxiliary |
| Label | `12px` | `500` | Button text, form labels |
| Title | `13px` | `600` | Panel titles, Toast titles |
| Display | `14px` | `600` | AI conversation headings |

Line height: `1.4` (body), `1.2` (headings)

**Font Philosophy**: Use system font stack (`system-ui, -apple-system, sans-serif`) — browser UI 应融入操作系统原生感，不强加自定义字体。仅品牌展示场景可用特殊字体（如欢迎页），工具栏/设置等 UI 文字一律系统字体。

**Density Rule**: 工具栏区域字号不超过 `13px`。紧凑密度是设计意图，更大字号 = 更高工具栏 = 更少可见标签页。

---

## Spacing

Based on a `4px` grid. Use Vivaldi variables or fixed values.

| Token | Value | Usage |
|---|---|---|
| `--vmod-toast-spacing` | `8px` | Toast internal spacing |
| `--pinned-gap` | Vivaldi native | Pinned tab gap |
| `--tab-padding` | Mod-defined | Tab inner padding |
| `--addressbar-height` | Vivaldi native | Address bar height |

General spacing rules:
- Element internal padding: `6px 10px`
- Adjacent element gap: `4px`
- Block gap: `8px`
- Panel inner padding: `12px`

---

## Border Radius

Use Vivaldi native radius variables to stay consistent with the browser UI.

| Token | Approximate Value | Usage |
|---|---|---|
| `var(--radius)` | `6px` | General radius (tabs, buttons, panels) |
| `var(--radiusHalf)` | `3px` | Small elements (badges, small buttons) |
| `var(--radiusCap)` | `100px` | Capsule shape (pill buttons) |
| `--aip-r-md` | `8px` | AI panel medium radius |
| `--aip-r-lg` | `12px` | AI panel large radius |

---

## Elevation & Shadows

No glassmorphism. Layers are distinguished by shadow depth and background alpha.

**Tonal Layering Approach** — 优先用表面亮度变化区分层次，阴影仅用于真正浮动的覆盖层（sidebar overlay、modal、popover）。常规 UI 元素（标签页、工具栏按钮、地址栏）不加阴影，它们"住在"表面上方，不是浮在上方。

| Level | Shadow | Usage |
|---|---|---|
| Base | `none` | Default elements |
| Raised | `0 2px 8px rgba(0,0,0,0.16)` | Toasts, floating layers |
| Overlay | `0 4px 16px rgba(0,0,0,0.24)` | Popover panels, Peek |
| Modal | `0 8px 32px rgba(0,0,0,0.38)` | Modal layers |

`--aip-shadow-base` is used for AI panel internal elements.

---

## Motion

Uses Vivaldi native animation speed variables.

| Token | Usage |
|---|---|
| `var(--animation-speed)` | Global animation speed multiplier |
| `var(--animation-test-speed)` | Test animation speed |

Mod animation spec:
- **Duration**: `200ms` (micro-interactions), `280ms` (state transitions), `400ms` (panel expansions)
- **Easing**: `ease-out` primary, exponential `cubic-bezier(0.16, 1, 0.3, 1)` for emphasis
- **Forbidden**: `bounce`, `elastic`, `spring` and other decorative easings
- **Reduced motion**: `@media (prefers-reduced-motion: reduce)` sets duration to `0.01ms`

---

## Components

### Toast (VividToast)

Toast notifications use `opacity` + `visibility` + `translateY` transitions — never `display:none`.

- Position: `top: 80px`, never `bottom`
- Spacing: `var(--vmod-toast-spacing)`
- Enter: `opacity: 0 -> 1`, `translateY(-20px) -> 0`
- Exit: reverse

### Peek (VividPeek)

Arc-style tab preview popover.

- Button size: `var(--arcpeek-tab-button-size)`
- Uses CSS `filter` stacking context to control webview visibility
- Delayed navigation mode to prevent mis-taps

### Player (VividPlayer)

Media player popover with its own color system:

| Token | Usage |
|---|---|
| `--vivid-player-bg` | Player background |
| `--vivid-player-strong` | Accent (progress bar, active state) |
| `--vivid-player-muted` | Muted state color |
| `--vivid-player-track` | Progress bar track |
| `--vivid-player-border` | Player border |
| `--vivid-player-shadow` | Player shadow |
| `--vivid-player-favicon` | Favicon area |
| `--vivid-player-note-x1~4` / `--vivid-player-note-y1~4` | Music note animation coordinates |

### Quietify

Audio button state management via canvas overlay + state detection:

- Uses `::after` pseudo-element to overlay native canvas
- `:not([title="Exit PiP"])` excludes PiP buttons
- `background-color` only set in state-specific selectors; generic `::after` defines structure only

### AI Sidebar (Diabar)

Independent WebPanel registration system using `--aip-*` prefix variables. Radius uses `--aip-r-md` / `--aip-r-lg`, parallel to Vivaldi native `--radius` but independently managed.

---

## Layout Patterns

### Sidebar-driven

Tab bar on the left (Vivaldi native support). Mods optimize the left tab bar's visual density and spacing.

### Spatial hierarchy

- Panel expansion uses shadow + background color shift to imply layering
- No glassmorphism, no `backdrop-filter`
- Floating layers use `position: fixed !important` to escape Vivaldi's inline positioning interference

### Dynamic value bridging

When CSS cannot read sibling element widths, use JS ResizeObserver to write CSS variables:

```javascript
new ResizeObserver(() => {
  document.documentElement.style.setProperty(
    "--tabbar-actual-width", el.offsetWidth + "px"
  );
}).observe(el);
```

CSS side consumes `var(--tabbar-actual-width)`.

---

## Z-Index Layers

| Layer | z-index | Usage |
|---|---|---|
| Base | `0` | Default elements |
| Raised | `10` | Floating layers, Tooltips |
| Overlay | `100` | Peek, Player |
| Modal | `1000` | Modal dialogs |
| Toast | `9999` | Toast notifications |

---

## Anti-Patterns

- Hardcoded `#000` / `#fff` -> use Vivaldi variables or tinted values
- `background-clip: text` gradient text
- `backdrop-filter: blur` glassmorphism abuse — 用 tonal layering 实现深度，模糊是每帧性能税
- `display: none` for animation transitions — 用 `opacity` + `visibility` + `transform`
- `position: absolute` inside `transform` ancestor chains
- CSS Anchor Positioning (incomplete Vivaldi support)
- Hardcoded accent colors (`background: #6e55d4`) — 用户切换强调色时必崩，用 `var()` + `color-mix()`
- Shadows on tabs, toolbar buttons, urlbar — 这些是 chrome 元素，住在表面上方，不浮起来
- Custom fonts for UI text — 系统字体栈 only，特殊字体仅限品牌展示
- Font size >13px in toolbar area — 紧凑密度是意图不是 bug
- Long transitions on layout properties (width, height, margin, padding) — layout 动画 >0.15s 会感觉迟钝
