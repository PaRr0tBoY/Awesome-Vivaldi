# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vivaldi browser customization and modification toolkit called "VivalArc". The project contains CSS themes, JavaScript modifications (moddings), widgets, and command chains for enhancing the Vivaldi browser experience.

## Project Structure

- **Moddings/**: JavaScript files that modify Vivaldi's behavior and UI
  - Individual .js files for specific features like tabs, panels, controls, etc.
  - Each file is self-contained and should be added to Vivaldi's window.html
- **Themes/**: Packaged Vivaldi theme files (.zip) and screenshots
- **Widgets/**: HTML widgets for customization (Clock, Weather, Quote-of-the-day)
- **CSS/**: Modular CSS components and customizations
- **Command_Chain/**: Vivaldi command chain configurations (.json files)
- **macOS_Patch_Scripts/**: Shell scripts for patching Vivaldi on macOS

## Installation Process

### CSS Installation

1. Enable CSS modifications in Vivaldi://experiments (Allow CSS Modification)
2. Restart Vivaldi
3. Apply CSS file via Settings → Appearance → CUSTOM UI MODIFICATIONS
4. Restart Vivaldi

### JavaScript Installation

1. Copy JavaScript files from `Moddings/` to Vivaldi's resources directory
2. Add script references to `window.html` in the Vivaldi resources directory:

```html
<body>
  <script src="color_tabs.js"></script>
  <script src="monochrome-icons.js"></script>
  <script src="import-export-command-chains.js"></script>
  <!-- ... other scripts ... -->
</body>
```

## Key Components

### JavaScript Moddings

- **widgets.js**: Custom widget system for displaying web content with database storage
- **global-media-controls.js**: Media control panel functionality
- **color_tabs.js**: Tab color customization
- **monochrome-icons.js**: Icon styling
- **import-export-command-chains.js**: Command chain import/export
- **easy-files.js**: File management enhancements
- **element-capture.js**: Screenshot and capture functionality
- **autoHidePanel.js**: Auto-hiding web panels
- **AdaptiveWebPanelHeaders.js**: Adaptive panel headers
- **colorful_loading_top_bar.js**: Loading bar customization
- **vivaldi-dashboard-camo.js**: Dashboard camouflage
- **Follower-Tabs.js**: Tab following functionality
- **SelectSearch.js**: Search selection enhancements
- **ClickAddBlockList.js**: Click-to-add blocklist
- **yb_address_bar.js**: Address bar enhancements
- **hoverOnStart.js**: Start page hover effects
- **moreFuncInWebPanel.js**: Additional web panel functions
- **Picture-in-Picture.js**: Picture-in-picture support
- **chroma.min.js**: Color manipulation library

### CSS Customizations

- **vivalarc.css**: Main theme with CSS variables for customization
- **tools.css**: Secondary theme for additional customizations
- **autoHidePanel.css**: Panel auto-hide functionality
- **theme-previewer.css**: Theme preview and management interface
- **CSS/**: Additional modular CSS components
- Platform-specific styles for Mac, Windows, and Linux
- Responsive design with window borders and header adjustments
- Tab and address bar styling

### Widgets

- **Clock.html**: Clock widget
- **weather.html**: Weather widget
- **Quote-of-the-day/**: Quote widget with multiple variants

## Development Notes

- No package.json or build system - direct file editing
- No testing framework - manual testing in Vivaldi required
- JavaScript files are IIFE (Immediately Invoked Function Expression) wrapped
- CSS uses CSS custom properties for theming
- Files are designed to be dropped into Vivaldi's resources directory

## Common Development Commands

### Testing and Validation
- **Manual Testing**: All features must be tested manually in Vivaldi browser
- **CSS Validation**: Use browser's DevTools to check CSS syntax and properties
- **JavaScript Testing**: Test in browser console for immediate feedback

### Patch and Installation Scripts
- **macOS Patching**: Use `macOS_Patch_Scripts/modviv` to patch and restart Vivaldi with debug mode
- **Vivaldi Restart**: After applying changes, restart Vivaldi using `modviv` script
- **Debug Mode**: Enable with `--debug-packed-apps --silent-debugger-extension-api` flags for development

## Development Guidelines

### CSS-First Approach

**优先考虑纯CSS方案实现用户需求** (Prioritize pure CSS solutions for user requirements)

When implementing new features or modifications:

1. **Always attempt a pure CSS solution first** - CSS is more performant, reliable, and requires no JavaScript runtime
2. **Leverage existing CSS custom properties** - Use Vivaldi's built-in CSS variables like `--colorAccentBg`, `--colorFg`, etc.
3. **Use CSS selectors effectively** - Target specific UI states and elements with CSS combinators and pseudo-classes
4. **Consider JavaScript only when absolutely necessary** - Use JavaScript only for:
   - Dynamic content generation
   - Complex state management
   - Interactions that cannot be achieved with CSS alone
   - Integration with Vivaldi's internal APIs

This approach ensures better performance, easier maintenance, and greater compatibility with Vivaldi updates.

## File Naming Conventions

- JavaScript files use snake_case or kebab-case naming
- CSS files use kebab-case naming
- Theme packages follow `theme-Name.zip` or `VivalArc Name.zip` pattern
- Widget directories use descriptive names with spaces

## Browser Compatibility

- Designed specifically for Vivaldi browser
- Requires access to Vivaldi's internal resources directory
- Some features require Vivaldi experiments to be enabled
- Platform-specific adjustments for macOS, Windows, and Linux

## Architecture Overview

### JavaScript Architecture
- **IIFE Pattern**: All JavaScript modifications use Immediately Invoked Function Expression pattern to avoid namespace pollution
- **Self-Contained**: Each modding file is independent and can be added/removed without affecting others
- **Vivaldi Integration**: Direct integration with Vivaldi's internal APIs and DOM structure
- **Database Storage**: Uses IndexedDB for persistent storage of widget configurations

### CSS Architecture
- **Custom Properties**: Extensive use of CSS custom properties (variables) for theme consistency
- **Modular Design**: CSS files are modular and can be combined or used independently
- **Responsive**: Built with responsive design principles and platform-specific adjustments
- **Layout Grids**: Complex grid layouts for theme previews that match actual UI placements

### Widget Architecture
- **HTML-based**: Widgets are self-contained HTML files with embedded styling
- **External Content**: Some widgets fetch external content (weather, quotes, forums)
- **Flexible Layout**: Grid-based layout system with configurable sizing
- **Database Integration**: Uses IndexedDB for storing widget configurations and order