# Custom Styling

The flow diagram exposes a comprehensive set of CSS custom properties (design tokens) on the `.pict-flow-container` element. Override any of these variables to theme the flow diagram without modifying source code.

## Quick Start

Add a `<style>` block after the flow diagram initializes, or use a theme provider:

```css
/* Override via CSS */
.pict-flow-container {
    --pf-canvas-bg: #1a1a2e;
    --pf-node-body-fill: #16213e;
    --pf-node-body-stroke: #0f3460;
    --pf-text-primary: #e8e8e8;
    --pf-node-selected-stroke: #e94560;
}
```

```javascript
// Override via the Theme Provider API
flowView._ThemeProvider.registerTheme('dark',
{
    Key: 'dark',
    Label: 'Dark Mode',
    CSSVariables:
    {
        '--pf-canvas-bg': '#1a1a2e',
        '--pf-node-body-fill': '#16213e',
        '--pf-node-body-stroke': '#0f3460',
        '--pf-text-primary': '#e8e8e8',
        '--pf-node-selected-stroke': '#e94560'
    },
    NodeBodyMode: 'rect'
});
flowView.setTheme('dark');
```

## Design Token Reference

All variables are prefixed `--pf-` (short for *pict-flow*) and defined on `.pict-flow-container`. Default values shown below are for the built-in Modern theme.

### Text

| Variable | Default | Description |
|----------|---------|-------------|
| `--pf-text-primary` | `#2c3e50` | Primary text color (labels, body text, form values) |
| `--pf-text-heading` | `#1a252f` | Heading text (info panel headers) |
| `--pf-text-secondary` | `#7f8c8d` | Secondary text (descriptions, field labels) |
| `--pf-text-tertiary` | `#8e99a4` | Tertiary text (section titles, constraints) |
| `--pf-text-placeholder` | `#95a5a6` | Placeholder/muted text (category labels, code badges) |

### Node

| Variable | Default | Description |
|----------|---------|-------------|
| `--pf-node-body-fill` | `#ffffff` | Node body background |
| `--pf-node-body-stroke` | `#d0d4d8` | Node body border |
| `--pf-node-body-stroke-hover` | `#b0b8c0` | Node body border on hover |
| `--pf-node-body-stroke-width` | `1` | Node body border width |
| `--pf-node-body-radius` | `8px` | Node body corner radius |
| `--pf-node-shadow` | `drop-shadow(0 1px 3px rgba(0,0,0,0.10))` | Default node shadow |
| `--pf-node-shadow-hover` | `drop-shadow(0 2px 6px rgba(0,0,0,0.15))` | Shadow on hover |
| `--pf-node-shadow-selected` | `drop-shadow(0 2px 8px rgba(52,152,219,0.25))` | Shadow when selected |
| `--pf-node-shadow-dragging` | `drop-shadow(0 4px 12px rgba(0,0,0,0.20))` | Shadow while dragging |
| `--pf-node-title-fill` | `#ffffff` | Title text color (on the title bar) |
| `--pf-node-title-size` | `11.5px` | Title font size |
| `--pf-node-title-weight` | `600` | Title font weight |
| `--pf-node-title-bar-color` | `#2c3e50` | Default title bar background color |
| `--pf-node-type-label-fill` | `#a0a8b0` | Node type label color (appears on hover) |
| `--pf-node-selected-stroke` | `#3498db` | Primary accent / selection stroke color |

### Node Variants

Built-in node types override the node body fill and stroke. Use these tokens to customize variant colors globally.

| Variable | Default | Description |
|----------|---------|-------------|
| `--pf-node-start-fill` | `#eafaf1` | Start node body fill |
| `--pf-node-start-stroke` | `#27ae60` | Start node body stroke |
| `--pf-node-end-fill` | `#e8f8f5` | End node body fill |
| `--pf-node-end-stroke` | `#1abc9c` | End node body stroke |
| `--pf-node-halt-fill` | `#fdedec` | Halt/error node body fill |
| `--pf-node-halt-stroke` | `#e74c3c` | Halt/error node body stroke |
| `--pf-node-decision-fill` | `#fff9e6` | Decision node body fill |
| `--pf-node-decision-stroke` | `#f39c12` | Decision node body stroke |

### Ports

| Variable | Default | Description |
|----------|---------|-------------|
| `--pf-port-input-fill` | `#3498db` | Input port circle fill |
| `--pf-port-output-fill` | `#2ecc71` | Output port circle fill |
| `--pf-port-stroke` | `#ffffff` | Port circle border color |
| `--pf-port-stroke-width` | `2` | Port circle border width |
| `--pf-port-label-bg` | `rgba(255,253,240,0.5)` | Port label badge background |
| `--pf-port-label-text` | `#2c3e50` | Port label text color |

### Port Type Colors

When ports have a `PortType` set, these colors override the default input/output fills.

| Variable | Default | Description |
|----------|---------|-------------|
| `--pf-port-event-in-fill` | `#3498db` | Event input port |
| `--pf-port-event-out-fill` | `#2ecc71` | Event output port |
| `--pf-port-setting-fill` | `#e67e22` | Setting port |
| `--pf-port-value-fill` | `#f1c40f` | Value port |
| `--pf-port-error-fill` | `#e74c3c` | Error port |

### Connection Type Colors

Connections inherit color from their source port type.

| Variable | Default | Description |
|----------|---------|-------------|
| `--pf-connection-event-in-stroke` | `#3498db` | Event-in connection stroke |
| `--pf-connection-event-out-stroke` | `#2ecc71` | Event-out connection stroke |
| `--pf-connection-setting-stroke` | `#e67e22` | Setting connection stroke |
| `--pf-connection-value-stroke` | `#f1c40f` | Value connection stroke |
| `--pf-connection-error-stroke` | `#e74c3c` | Error connection stroke |

### Connections

| Variable | Default | Description |
|----------|---------|-------------|
| `--pf-connection-stroke` | `#95a5a6` | Default connection line color |
| `--pf-connection-stroke-hover` | `#7f8c8d` | Connection line color on hover |
| `--pf-connection-selected-stroke` | `#3498db` | Connection line color when selected |

### Panels

| Variable | Default | Description |
|----------|---------|-------------|
| `--pf-panel-bg` | `#ffffff` | Panel background |
| `--pf-panel-border` | `#d0d4d8` | Panel border color |
| `--pf-panel-radius` | `8px` | Panel corner radius |
| `--pf-panel-shadow` | `0 4px 12px rgba(0,0,0,0.10), ...` | Panel box shadow |
| `--pf-panel-titlebar-bg` | `#f7f8fa` | Panel title bar background |
| `--pf-panel-titlebar-border` | `#e8eaed` | Title bar bottom border |
| `--pf-panel-title-color` | `#2c3e50` | Panel title text color |

### Tabs

| Variable | Default | Description |
|----------|---------|-------------|
| `--pf-tab-text` | `#8e99a4` | Inactive tab text color |
| `--pf-tab-text-hover` | `#5a6a7a` | Tab text color on hover |
| `--pf-tab-active-border` | `var(--pf-node-selected-stroke)` | Active tab top border color |
| `--pf-resize-handle-hover` | `#e0e3e6` | Panel resize handle hover color |

### Forms & Inputs

| Variable | Default | Description |
|----------|---------|-------------|
| `--pf-input-border` | `#d5d8dc` | Input/select border color |
| `--pf-input-border-focus` | `#3498db` | Input border color on focus |
| `--pf-divider-light` | `#ecf0f1` | Light divider/separator color |
| `--pf-divider-medium` | `#e8eaed` | Medium divider/separator color |

### Buttons

| Variable | Default | Description |
|----------|---------|-------------|
| `--pf-button-border` | `#bdc3c7` | Button border color |
| `--pf-button-hover-border` | `#95a5a6` | Button border color on hover |
| `--pf-button-hover-bg` | `#ecf0f1` | Button background on hover |
| `--pf-button-active-bg` | `#d5dbdb` | Button background on active/press |
| `--pf-button-danger-text` | `#e74c3c` | Danger button text color |
| `--pf-button-danger-hover-bg` | `#fdedec` | Danger button hover background |
| `--pf-button-close-color` | `#b0b8c0` | Panel close button color |

### Badges

| Variable | Default | Description |
|----------|---------|-------------|
| `--pf-badge-category-bg` | `#f0f2f4` | Category badge background |
| `--pf-badge-category-text` | `#6b7b8d` | Category badge text color |
| `--pf-badge-code-bg` | `#eaf2f8` | Code badge background |
| `--pf-badge-code-text` | `#2980b9` | Code badge text color |

### Info Panel

| Variable | Default | Description |
|----------|---------|-------------|
| `--pf-port-item-bg` | `#f8f9fa` | Port list item background |

### Toolbar

| Variable | Default | Description |
|----------|---------|-------------|
| `--pf-toolbar-bg` | `#ffffff` | Toolbar background |
| `--pf-toolbar-border` | `#e0e0e0` | Toolbar border and group separators |

### Palette Cards

| Variable | Default | Description |
|----------|---------|-------------|
| `--pf-card-border` | `#d5d8dc` | Palette card border |
| `--pf-card-hover-bg` | `#eaf2f8` | Palette card hover background |
| `--pf-card-hover-shadow` | `0 1px 3px rgba(52,152,219,0.15)` | Palette card hover shadow |

### Canvas

| Variable | Default | Description |
|----------|---------|-------------|
| `--pf-canvas-bg` | `#fafafa` | Background color of the SVG canvas |
| `--pf-grid-stroke` | `#e8e8e8` | Grid line color |

## Per-Node-Type Overrides

Individual node types can scope-override any variable. The flow renderer adds a CSS class `.pict-flow-node-{type}` to each node group. Target these classes to customize specific node types without affecting others:

```css
/* Make "FileRead" nodes stand out */
.pict-flow-node-FileRead .pict-flow-node-body {
    fill: #fef9e7;
    stroke: #f4d03f;
}
```

## Theme Provider API

The `PictProviderFlowTheme` service manages named themes and applies them via CSS variable overrides.

### Registering a Theme

```javascript
flowView._ThemeProvider.registerTheme('corporate',
{
    Key: 'corporate',
    Label: 'Corporate',
    CSSVariables:
    {
        '--pf-canvas-bg': '#f5f6fa',
        '--pf-node-selected-stroke': '#0066cc',
        '--pf-node-body-stroke': '#c8d6e5',
        '--pf-toolbar-bg': '#ffffff',
        '--pf-panel-titlebar-bg': '#f0f2f5'
    },
    NodeBodyMode: 'rect',
    NoiseConfig: { Enabled: false }
});
```

### Switching Themes

```javascript
flowView.setTheme('corporate');    // Apply the corporate theme
flowView.setTheme('default');      // Restore the default Modern theme
flowView.setTheme('sketch');       // Hand-drawn style (built-in)
flowView.setTheme('blueprint');    // Blueprint style (built-in)
```

### Theme Properties

| Property | Type | Description |
|----------|------|-------------|
| `Key` | `string` | Unique identifier for the theme |
| `Label` | `string` | Display name |
| `CSSVariables` | `object` | Map of `--pf-*` variable names to values |
| `AdditionalCSS` | `string` | Extra CSS appended after variable overrides |
| `NodeBodyMode` | `string` | Node rendering mode: `'rect'` or `'bracket'` |
| `NoiseConfig` | `object` | Hand-drawn effect configuration |

### How It Works

When a theme is activated:

1. The CSS provider calls `generateCSS()` which aggregates all domain CSS
2. If an active theme defines `CSSVariables`, they are emitted as a `.pict-flow-container` override block appended after the base CSS
3. If `AdditionalCSS` is defined, it is appended after the variable overrides
4. The combined CSS is re-injected via the Pict `CSSMap` service

This means theme variable overrides have higher specificity than the base defaults (same selector, later in source order), and `AdditionalCSS` can add entirely new rules or increase specificity where needed.
