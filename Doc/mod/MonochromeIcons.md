English | [简体中文](modzh/MonochromeIcons.md)

---

# MonochromeIcons Design and Implementation Analysis

This document is based on [MonochromeIcons.js](/Vivaldi7.9Stable/Javascripts/MonochromeIcons.js) in the current workspace.

## 1. Dependencies

### Vivaldi Internal APIs
- `vivaldi.prefs.get()` - Read current theme configuration (`vivaldi.themes.current`)
- No `chrome.*` API usage

### External Dependencies
- `MutationObserver` - Watch for browser theme color changes
- `getComputedStyle()` - Read computed CSS color values
- `ResizeObserver` - Not used

### Inter-Mod Dependencies
- No JS mod dependencies
- No corresponding CSS file (pure JS dynamic `<style>` injection)

## 2. Features

### Core Feature

Converts Vivaldi sidebar Web Panel icons (thumbnails) to a monochrome style, with colors automatically adapting to the current theme's accent color.

### Main Features

1. **Automatic Theme Color Extraction** - Reads the `color` property (sRGB format) from Vivaldi theme's computed style, parses out RGB components
2. **Hue Calculation** - Converts RGB to a hue angle using the HSL hue formula, subtracting an offset of 38.71 degrees as a correction value
3. **CSS Filter Injection** - Dynamically generates and injects CSS using `filter: brightness(0.77) sepia(1) hue-rotate(Xdeg)` to tint icons to the theme color
4. **Defocused State Handling** - When the browser window loses focus (`#browser.isblurred`), reduces icon opacity to 0.65
5. **Theme Change Response** - Watches theme-related attribute changes via MutationObserver, automatically recalculates and updates the filter

### Expected Behavior

- Web Panel icons display in monochrome by default, with hue matching the current Vivaldi theme
- Icon hue updates automatically when switching themes
- Icons fade when the browser loses focus, restoring to normal when focus returns

## 3. Usage

### Enable

1. Copy `MonochromeIcons.js` to Vivaldi's resource directory
2. Include in `window.html`: `<script src="MonochromeIcons.js"></script>`
3. No additional CSS file needed

### User Interaction

- No direct user interaction, runs fully automatically
- Icon appearance updates automatically with theme switches

### Configuration Options

- No ModConfig integration, no user-configurable options
- Brightness value (0.77) and hue offset (38.71) are hardcoded constants, requiring source code modification to adjust

## 4. Design Rationale

### Design Intent

Vivaldi sidebar Web Panel icons come from each website's favicon, with varying color styles that clash with carefully designed themes. This mod unifies these icons into a monochrome style that follows the theme hue, improving visual consistency.

### Core Architecture Decisions

1. **Pure CSS Filter Approach** - Does not modify icon source files; uses the CSS `filter` property's `sepia + hue-rotate` combination for tinting, with minimal performance overhead
2. **Hue Offset Correction** - The sepia filter maps colors to a warm tone range around 38.71 degrees, so this offset is subtracted during hue calculation to ensure the final displayed color accurately matches the theme color
3. **Dynamic Style Injection** - Injects CSS by creating a `<style>` element rather than modifying external files, ensuring the mod is self-contained

### Key Implementation Details

- **sRGB Color Parsing**: Vivaldi computed styles return the `color(srgb r g b)` format, requiring manual string parsing to extract components
- **Hue Formula**: Uses `atan2(sqrt(3)*(g-b), 2*r-g-b)` to calculate hue, which is the standard HSL hue calculation formula
- **Defocused State**: Detects window focus state via the `.isblurred` class name, using opacity to reduce visual distraction

### Collaboration with Other Mods

- Runs independently, no dependency on other mods
- Compatible with any CSS mod that modifies sidebar appearance (filters work at the icon rendering layer without altering DOM structure)

---

*Source approximately 84 lines, authors: luetage, AltCode*
*Reference: [Vivaldi Forum Post #791344](https://forum.vivaldi.net/post/791344)*
