# setTheme / registerTheme

Manage the visual theme of the flow diagram. Six built-in themes are available, and you can register custom themes with CSS variable overrides.

## Signatures

```javascript
flowView.setTheme(pThemeKey);
flowView._ThemeProvider.registerTheme(pThemeKey, pThemeConfig);
flowView.setNoiseLevel(pLevel);
flowView.getNoiseLevel();
flowView.getThemeKey();
```

## setTheme

Switch to a registered theme and re-render.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pThemeKey` | string | Theme identifier |

**Events Fired:** `onThemeChanged`

### Built-in Theme Keys

| Key | Style |
|-----|-------|
| `default` | Clean, modern, professional |
| `sketch` | Hand-drawn, informal |
| `blueprint` | Technical blueprint |
| `mono` | Monochrome |
| `retro-80s` | Neon retro |
| `retro-90s` | Vaporwave |

## registerTheme

Register a custom theme.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pThemeKey` | string | Unique theme identifier |
| `pThemeConfig` | object | Theme configuration |

### Theme Configuration Shape

```javascript
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
	AdditionalCSS: '/* Extra CSS rules */',
	NodeBodyMode: 'rect',
	NoiseConfig:
	{
		Enabled: true,
		Amount: 0.5
	},
	ConnectionConfig:
	{
		StrokeDashArray: '5,5'
	}
}
```

| Property | Type | Description |
|----------|------|-------------|
| `Key` | string | Unique identifier |
| `Label` | string | Display name |
| `CSSVariables` | object | Map of `--pf-*` variable names to values |
| `AdditionalCSS` | string | Extra CSS appended after variable overrides |
| `NodeBodyMode` | string | Node rendering mode: `'rect'` or `'bracket'` |
| `NoiseConfig` | object | Hand-drawn effect: `{ Enabled, Amount }` |
| `ConnectionConfig` | object | Connection styling: `{ StrokeDashArray }` |

## setNoiseLevel / getNoiseLevel

Control the hand-drawn rendering effect independently of the theme.

```javascript
flowView.setNoiseLevel(0.5);  // Moderate wobble
flowView.setNoiseLevel(0);    // Precise, clean lines
flowView.setNoiseLevel(1);    // Maximum hand-drawn effect

let tmpLevel = flowView.getNoiseLevel(); // 0.5
```

## getThemeKey

Returns the active theme key string.

```javascript
let tmpKey = flowView.getThemeKey(); // 'default'
```

## Examples

### Switch to a built-in theme

```javascript
flowView.setTheme('blueprint');
```

### Register and apply a custom dark theme

```javascript
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
			'--pf-node-selected-stroke': '#e94560',
			'--pf-connection-stroke': '#4a6fa5',
			'--pf-toolbar-bg': '#162447',
			'--pf-panel-bg': '#1a1a2e',
			'--pf-panel-titlebar-bg': '#162447'
		},
		NodeBodyMode: 'rect'
	});

flowView.setTheme('dark');
```

### Theme selector dropdown

```javascript
document.getElementById('theme-select').addEventListener('change', (pEvent) =>
{
	flowView.setTheme(pEvent.target.value);
});
```

### Corporate branding theme

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
			'--pf-node-title-bar-color': '#003366',
			'--pf-toolbar-bg': '#ffffff',
			'--pf-panel-titlebar-bg': '#f0f2f5'
		},
		NoiseConfig: { Enabled: false }
	});
```

## See Also

- [Custom Styling](../Custom-Styling.md) -- Full CSS custom properties reference
- [registerHandler](registerHandler.md) -- Listen for `onThemeChanged` events
