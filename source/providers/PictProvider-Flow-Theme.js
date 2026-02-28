const libFableServiceProviderBase = require('fable-serviceproviderbase');

const _ProviderConfiguration =
{
	ProviderIdentifier: 'PictProviderFlowTheme'
};

/**
 * PictProvider-Flow-Theme
 *
 * Central orchestrator for the flow diagram theming system.
 *
 * Holds a registry of theme definitions, manages the active theme,
 * and provides hooks for node body rendering and path noise processing.
 *
 * ## Usage
 *
 * ```javascript
 * flowView.setTheme('sketch');       // Switch to hand-drawn style
 * flowView.setNoiseLevel(0.6);       // Increase bracket/connection wobble
 * flowView.setTheme('default');      // Restore modern style
 * ```
 *
 * ## Custom Themes
 *
 * ```javascript
 * flowView._ThemeProvider.registerTheme('custom', {
 *     Key: 'custom',
 *     Label: 'My Custom Theme',
 *     CSSVariables: { '--pf-canvas-bg': '#222' },
 *     NodeBodyMode: 'rect',
 *     NoiseConfig: { Enabled: false }
 * });
 * flowView.setTheme('custom');
 * ```
 */
class PictProviderFlowTheme extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, _ProviderConfiguration, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'PictProviderFlowTheme';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;

		this._ActiveThemeKey = 'default';
		this._NoiseLevel = 0;
		this._Themes = {};

		this._registerBuiltInThemes();
	}

	// ── Theme Registry ────────────────────────────────────────────────────

	_registerBuiltInThemes()
	{
		// ── 1. Default (Modern) ──────────────────────────────────────
		this._Themes['default'] =
		{
			Key: 'default',
			Label: 'Modern',
			CSSVariables: {},
			AdditionalCSS: '',
			NodeBodyMode: 'rect',
			BracketConfig: null,
			ConnectionConfig:
			{
				StrokeDashArray: null,
				StrokeWidth: 2,
				ArrowheadStyle: 'triangle'
			},
			NoiseConfig:
			{
				Enabled: false,
				DefaultLevel: 0,
				MaxJitterPx: 0,
				AffectsNodes: false,
				AffectsConnections: false
			},
			ShapeOverrides: {}
		};

		// ── 2. Sketch (Hand-drawn) ───────────────────────────────────
		this._Themes['sketch'] =
		{
			Key: 'sketch',
			Label: 'Sketch',
			CSSVariables:
			{
				'--pf-node-body-fill': '#fffef5',
				'--pf-node-body-stroke': '#444444',
				'--pf-node-body-stroke-width': '1.5',
				'--pf-node-body-radius': '0px',
				'--pf-node-shadow': 'none',
				'--pf-node-shadow-hover': 'none',
				'--pf-node-shadow-selected': 'none',
				'--pf-node-shadow-dragging': 'none',
				'--pf-node-title-fill': '#333333',
				'--pf-node-title-size': '12px',
				'--pf-node-title-weight': '400',
				'--pf-node-title-bar-color': '#f0ece0',
				'--pf-node-type-label-fill': '#888888',
				'--pf-node-selected-stroke': '#2255aa',
				'--pf-port-input-fill': '#5577bb',
				'--pf-port-output-fill': '#55aa77',
				'--pf-port-stroke': '#fffef5',
				'--pf-connection-stroke': '#555555',
				'--pf-connection-selected-stroke': '#2255aa',
				'--pf-canvas-bg': '#fffef5',
				'--pf-grid-stroke': '#e8e4d8',
				'--pf-panel-bg': '#fffef5',
				'--pf-panel-border': '#ccccaa',
				'--pf-panel-radius': '0px',
				'--pf-panel-shadow': '2px 2px 0px rgba(0,0,0,0.08)',
				'--pf-panel-titlebar-bg': '#f0ece0',
				'--pf-panel-titlebar-border': '#ccccaa',
				'--pf-panel-title-color': '#333333'
			},
			AdditionalCSS: `
				.pict-flow-node-title,
				.pict-flow-node-type-label,
				.pict-flow-port-label,
				.pict-flow-node-card-code {
					font-family: "Courier New", "Courier", monospace !important;
				}
				.pict-flow-panel-title-text,
				.pict-flow-panel-node-props-title,
				.pict-flow-info-panel {
					font-family: "Courier New", "Courier", monospace !important;
				}
				.pict-flow-node-title-icon {
					filter: brightness(0) !important;
				}
			`,
			NodeBodyMode: 'bracket',
			BracketConfig:
			{
				SerifLength: 20,
				TitleSeparator: true
			},
			ConnectionConfig:
			{
				StrokeDashArray: null,
				StrokeWidth: 1.5,
				ArrowheadStyle: 'triangle'
			},
			NoiseConfig:
			{
				Enabled: true,
				DefaultLevel: 0.4,
				MaxJitterPx: 4,
				AffectsNodes: true,
				AffectsConnections: true
			},
			ShapeOverrides:
			{
				'arrowhead-connection': { Fill: '#555555' },
				'arrowhead-connection-selected': { Fill: '#2255aa' }
			}
		};

		// ── 3. Blueprint (Technical) ─────────────────────────────────
		this._Themes['blueprint'] =
		{
			Key: 'blueprint',
			Label: 'Blueprint',
			CSSVariables:
			{
				'--pf-node-body-fill': 'rgba(255,255,255,0.05)',
				'--pf-node-body-stroke': '#ffffff',
				'--pf-node-body-stroke-width': '1',
				'--pf-node-body-radius': '0px',
				'--pf-node-shadow': 'none',
				'--pf-node-shadow-hover': 'none',
				'--pf-node-shadow-selected': 'none',
				'--pf-node-shadow-dragging': 'none',
				'--pf-node-title-fill': '#ffffff',
				'--pf-node-title-size': '11px',
				'--pf-node-title-weight': '400',
				'--pf-node-title-bar-color': 'rgba(255,255,255,0.1)',
				'--pf-node-type-label-fill': 'rgba(255,255,255,0.5)',
				'--pf-node-selected-stroke': '#ffdd44',
				'--pf-port-input-fill': '#88bbff',
				'--pf-port-output-fill': '#88ffbb',
				'--pf-port-stroke': '#1a3a6a',
				'--pf-connection-stroke': 'rgba(255,255,255,0.6)',
				'--pf-connection-selected-stroke': '#ffdd44',
				'--pf-canvas-bg': '#1a3a6a',
				'--pf-grid-stroke': 'rgba(255,255,255,0.08)',
				'--pf-panel-bg': '#1a3a6a',
				'--pf-panel-border': 'rgba(255,255,255,0.3)',
				'--pf-panel-radius': '0px',
				'--pf-panel-shadow': 'none',
				'--pf-panel-titlebar-bg': 'rgba(255,255,255,0.05)',
				'--pf-panel-titlebar-border': 'rgba(255,255,255,0.15)',
				'--pf-panel-title-color': '#ffffff'
			},
			AdditionalCSS: `
				.pict-flow-node-title,
				.pict-flow-node-type-label,
				.pict-flow-port-label,
				.pict-flow-node-card-code {
					font-family: "Courier New", monospace !important;
					text-transform: uppercase;
					letter-spacing: 1px;
				}
				.pict-flow-container {
					border-color: #0d2244;
				}
				.pict-flow-node-title-icon {
					filter: brightness(0) invert(1) !important;
				}
				.pict-flow-toolbar {
					background-color: #142e54;
					border-bottom-color: rgba(255,255,255,0.15);
				}
				.pict-flow-toolbar-btn {
					background-color: rgba(255,255,255,0.05);
					border-color: rgba(255,255,255,0.2);
					color: #ffffff;
				}
				.pict-flow-toolbar-btn:hover {
					background-color: rgba(255,255,255,0.1);
				}
			`,
			NodeBodyMode: 'bracket',
			BracketConfig:
			{
				SerifLength: 18,
				TitleSeparator: true
			},
			ConnectionConfig:
			{
				StrokeDashArray: '8 4',
				StrokeWidth: 1,
				ArrowheadStyle: 'triangle'
			},
			NoiseConfig:
			{
				Enabled: false,
				DefaultLevel: 0,
				MaxJitterPx: 0,
				AffectsNodes: false,
				AffectsConnections: false
			},
			ShapeOverrides:
			{
				'arrowhead-connection': { Fill: 'rgba(255,255,255,0.6)' },
				'arrowhead-connection-selected': { Fill: '#ffdd44' }
			}
		};

		// ── 4. Mono (Black & White) ──────────────────────────────────
		this._Themes['mono'] =
		{
			Key: 'mono',
			Label: 'Monochrome',
			CSSVariables:
			{
				'--pf-node-body-fill': '#ffffff',
				'--pf-node-body-stroke': '#000000',
				'--pf-node-body-stroke-width': '1',
				'--pf-node-body-radius': '0px',
				'--pf-node-shadow': 'none',
				'--pf-node-shadow-hover': 'none',
				'--pf-node-shadow-selected': 'none',
				'--pf-node-shadow-dragging': 'none',
				'--pf-node-title-fill': '#ffffff',
				'--pf-node-title-size': '11px',
				'--pf-node-title-weight': '600',
				'--pf-node-title-bar-color': '#000000',
				'--pf-node-type-label-fill': '#888888',
				'--pf-node-selected-stroke': '#444444',
				'--pf-port-input-fill': '#000000',
				'--pf-port-output-fill': '#666666',
				'--pf-port-stroke': '#ffffff',
				'--pf-connection-stroke': '#000000',
				'--pf-connection-selected-stroke': '#444444',
				'--pf-canvas-bg': '#ffffff',
				'--pf-grid-stroke': '#eeeeee',
				'--pf-panel-bg': '#ffffff',
				'--pf-panel-border': '#000000',
				'--pf-panel-radius': '0px',
				'--pf-panel-shadow': 'none',
				'--pf-panel-titlebar-bg': '#f0f0f0',
				'--pf-panel-titlebar-border': '#000000',
				'--pf-panel-title-color': '#000000'
			},
			AdditionalCSS: `
				.pict-flow-node-title {
					font-family: "Helvetica Neue", Helvetica, Arial, sans-serif !important;
				}
				.pict-flow-node-title-icon {
					filter: brightness(0) invert(1) !important;
				}
			`,
			NodeBodyMode: 'rect',
			BracketConfig: null,
			ConnectionConfig:
			{
				StrokeDashArray: null,
				StrokeWidth: 1,
				ArrowheadStyle: 'triangle'
			},
			NoiseConfig:
			{
				Enabled: false,
				DefaultLevel: 0,
				MaxJitterPx: 0,
				AffectsNodes: false,
				AffectsConnections: false
			},
			ShapeOverrides:
			{
				'arrowhead-connection': { Fill: '#000000' },
				'arrowhead-connection-selected': { Fill: '#444444' }
			}
		};

		// ── 5. Retro 80s (Neon) ──────────────────────────────────────
		this._Themes['retro-80s'] =
		{
			Key: 'retro-80s',
			Label: '80s Retro',
			CSSVariables:
			{
				'--pf-node-body-fill': '#1a0a2e',
				'--pf-node-body-stroke': '#ff00ff',
				'--pf-node-body-stroke-width': '2',
				'--pf-node-body-radius': '0px',
				'--pf-node-shadow': 'drop-shadow(0 0 8px rgba(255,0,255,0.4))',
				'--pf-node-shadow-hover': 'drop-shadow(0 0 12px rgba(255,0,255,0.6))',
				'--pf-node-shadow-selected': 'drop-shadow(0 0 16px rgba(0,255,255,0.5))',
				'--pf-node-shadow-dragging': 'drop-shadow(0 0 20px rgba(255,0,255,0.7))',
				'--pf-node-title-fill': '#00ffff',
				'--pf-node-title-size': '11px',
				'--pf-node-title-weight': '700',
				'--pf-node-title-bar-color': '#2a0a4e',
				'--pf-node-type-label-fill': '#ff66ff',
				'--pf-node-selected-stroke': '#00ffff',
				'--pf-port-input-fill': '#ff00ff',
				'--pf-port-output-fill': '#00ff66',
				'--pf-port-stroke': '#1a0a2e',
				'--pf-connection-stroke': '#ff00ff',
				'--pf-connection-selected-stroke': '#00ffff',
				'--pf-canvas-bg': '#0a0015',
				'--pf-grid-stroke': '#1a0a2e',
				'--pf-panel-bg': '#1a0a2e',
				'--pf-panel-border': '#ff00ff',
				'--pf-panel-radius': '0px',
				'--pf-panel-shadow': '0 0 20px rgba(255,0,255,0.3)',
				'--pf-panel-titlebar-bg': '#2a0a4e',
				'--pf-panel-titlebar-border': '#ff00ff',
				'--pf-panel-title-color': '#00ffff'
			},
			AdditionalCSS: `
				.pict-flow-node-title,
				.pict-flow-node-type-label,
				.pict-flow-port-label,
				.pict-flow-node-card-code {
					font-family: "Courier New", monospace !important;
					text-transform: uppercase;
					letter-spacing: 0.5px;
				}
				.pict-flow-connection {
					filter: drop-shadow(0 0 3px rgba(255,0,255,0.4));
				}
				.pict-flow-node-title-icon {
					filter: brightness(0) invert(1) hue-rotate(180deg) !important;
				}
				.pict-flow-toolbar {
					background-color: #1a0a2e;
					border-bottom-color: #ff00ff;
				}
				.pict-flow-toolbar-btn {
					background-color: #1a0a2e;
					border-color: #ff00ff;
					color: #00ffff;
				}
				.pict-flow-toolbar-btn:hover {
					background-color: #2a0a4e;
				}
				.pict-flow-container {
					border-color: #ff00ff;
				}
			`,
			NodeBodyMode: 'rect',
			BracketConfig: null,
			ConnectionConfig:
			{
				StrokeDashArray: null,
				StrokeWidth: 2,
				ArrowheadStyle: 'triangle'
			},
			NoiseConfig:
			{
				Enabled: false,
				DefaultLevel: 0,
				MaxJitterPx: 0,
				AffectsNodes: false,
				AffectsConnections: false
			},
			ShapeOverrides:
			{
				'arrowhead-connection': { Fill: '#ff00ff' },
				'arrowhead-connection-selected': { Fill: '#00ffff' }
			}
		};

		// ── 6. Retro 90s (Windows) ───────────────────────────────────
		this._Themes['retro-90s'] =
		{
			Key: 'retro-90s',
			Label: '90s Retro',
			CSSVariables:
			{
				'--pf-node-body-fill': '#c0c0c0',
				'--pf-node-body-stroke': '#808080',
				'--pf-node-body-stroke-width': '1',
				'--pf-node-body-radius': '0px',
				'--pf-node-shadow': 'drop-shadow(2px 2px 0px #404040)',
				'--pf-node-shadow-hover': 'drop-shadow(3px 3px 0px #404040)',
				'--pf-node-shadow-selected': 'drop-shadow(2px 2px 0px #008080)',
				'--pf-node-shadow-dragging': 'drop-shadow(4px 4px 0px #404040)',
				'--pf-node-title-fill': '#ffffff',
				'--pf-node-title-size': '11px',
				'--pf-node-title-weight': '700',
				'--pf-node-title-bar-color': '#000080',
				'--pf-node-type-label-fill': '#606060',
				'--pf-node-selected-stroke': '#008080',
				'--pf-port-input-fill': '#000080',
				'--pf-port-output-fill': '#008000',
				'--pf-port-stroke': '#c0c0c0',
				'--pf-connection-stroke': '#808080',
				'--pf-connection-selected-stroke': '#008080',
				'--pf-canvas-bg': '#008080',
				'--pf-grid-stroke': 'rgba(0,0,0,0.06)',
				'--pf-panel-bg': '#c0c0c0',
				'--pf-panel-border': '#808080',
				'--pf-panel-radius': '0px',
				'--pf-panel-shadow': '2px 2px 0px #404040',
				'--pf-panel-titlebar-bg': '#000080',
				'--pf-panel-titlebar-border': '#c0c0c0',
				'--pf-panel-title-color': '#ffffff'
			},
			AdditionalCSS: `
				.pict-flow-node-title,
				.pict-flow-node-type-label,
				.pict-flow-port-label,
				.pict-flow-node-card-code {
					font-family: "MS Sans Serif", "Arial", sans-serif !important;
				}
				.pict-flow-node-title-icon {
					filter: brightness(0) invert(1) !important;
				}
				.pict-flow-toolbar {
					background-color: #c0c0c0;
					border-bottom: 2px solid #808080;
					border-top: 1px solid #ffffff;
				}
				.pict-flow-toolbar-btn {
					background-color: #c0c0c0;
					border: 2px outset #c0c0c0;
					border-radius: 0;
					color: #000000;
				}
				.pict-flow-toolbar-btn:hover {
					background-color: #d0d0d0;
				}
				.pict-flow-toolbar-btn:active {
					border-style: inset;
				}
				.pict-flow-container {
					border: 2px outset #c0c0c0;
					border-radius: 0;
				}
			`,
			NodeBodyMode: 'rect',
			BracketConfig: null,
			ConnectionConfig:
			{
				StrokeDashArray: null,
				StrokeWidth: 2,
				ArrowheadStyle: 'triangle'
			},
			NoiseConfig:
			{
				Enabled: false,
				DefaultLevel: 0,
				MaxJitterPx: 0,
				AffectsNodes: false,
				AffectsConnections: false
			},
			ShapeOverrides:
			{
				'arrowhead-connection': { Fill: '#808080' },
				'arrowhead-connection-selected': { Fill: '#008080' }
			}
		};

		// ── 7. Whiteboard (Minimal brackets, no fills) ──────────────
		this._Themes['whiteboard'] =
		{
			Key: 'whiteboard',
			Label: 'Whiteboard',
			CSSVariables:
			{
				'--pf-node-body-fill': 'transparent',
				'--pf-node-body-stroke': '#555555',
				'--pf-node-body-stroke-width': '2',
				'--pf-node-body-radius': '0px',
				'--pf-node-shadow': 'none',
				'--pf-node-shadow-hover': 'none',
				'--pf-node-shadow-selected': 'none',
				'--pf-node-shadow-dragging': 'none',
				'--pf-node-title-fill': '#333333',
				'--pf-node-title-size': '12px',
				'--pf-node-title-weight': '600',
				'--pf-node-title-bar-color': 'transparent',
				'--pf-node-type-label-fill': '#999999',
				'--pf-node-selected-stroke': '#2255aa',
				'--pf-port-input-fill': '#5577bb',
				'--pf-port-output-fill': '#55aa77',
				'--pf-port-stroke': '#ffffff',
				'--pf-connection-stroke': '#888888',
				'--pf-connection-selected-stroke': '#2255aa',
				'--pf-canvas-bg': '#ffffff',
				'--pf-grid-stroke': '#f0f0f0',
				'--pf-panel-bg': '#ffffff',
				'--pf-panel-border': '#cccccc',
				'--pf-panel-radius': '0px',
				'--pf-panel-shadow': '2px 2px 0px rgba(0,0,0,0.06)',
				'--pf-panel-titlebar-bg': '#f8f8f8',
				'--pf-panel-titlebar-border': '#e0e0e0',
				'--pf-panel-title-color': '#333333'
			},
			AdditionalCSS: `
				.pict-flow-node-title,
				.pict-flow-node-type-label,
				.pict-flow-port-label,
				.pict-flow-node-card-code {
					font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
				}
				/* Node-type bracket colors — each type gets its own bracket color */
				.pict-flow-node-start .pict-flow-node-bracket { stroke: #27ae60; }
				.pict-flow-node-end .pict-flow-node-bracket { stroke: #1abc9c; }
				.pict-flow-node-halt .pict-flow-node-bracket { stroke: #e74c3c; }
				.pict-flow-node-decision .pict-flow-node-bracket { stroke: #f39c12; }
				.pict-flow-node-default .pict-flow-node-bracket { stroke: #3498db; }
				.pict-flow-node-action .pict-flow-node-bracket { stroke: #2c3e50; }
				/* Override variant rules: no fills/strokes on body rects in whiteboard */
				.pict-flow-node-decision .pict-flow-node-body,
				.pict-flow-node-start .pict-flow-node-body,
				.pict-flow-node-end .pict-flow-node-body,
				.pict-flow-node-halt .pict-flow-node-body {
					fill: transparent;
					stroke: transparent;
					stroke-width: 0;
				}
				/* Title bar fills transparent too */
				.pict-flow-node .pict-flow-node-bracket-title-fill {
					fill: transparent !important;
				}
				.pict-flow-node-title-icon {
					filter: none !important;
				}
			`,
			NodeBodyMode: 'bracket',
			BracketConfig:
			{
				SerifLength: 22,
				TitleSeparator: false
			},
			ConnectionConfig:
			{
				StrokeDashArray: null,
				StrokeWidth: 1.5,
				ArrowheadStyle: 'triangle'
			},
			NoiseConfig:
			{
				Enabled: true,
				DefaultLevel: 0.3,
				MaxJitterPx: 3,
				AffectsNodes: true,
				AffectsConnections: true
			},
			ShapeOverrides:
			{
				'arrowhead-connection': { Fill: '#888888' },
				'arrowhead-connection-selected': { Fill: '#2255aa' }
			}
		};
	}

	// ── Public API ────────────────────────────────────────────────────────

	/**
	 * Get the active theme definition.
	 * @returns {Object}
	 */
	getActiveTheme()
	{
		return this._Themes[this._ActiveThemeKey] || this._Themes['default'];
	}

	/**
	 * Get the active theme key.
	 * @returns {string}
	 */
	getActiveThemeKey()
	{
		return this._ActiveThemeKey;
	}

	/**
	 * Switch the active theme.
	 * This updates the internal key and applies shape overrides.
	 * The caller (FlowView.setTheme) is responsible for re-registering
	 * CSS and triggering a full re-render.
	 *
	 * @param {string} pThemeKey
	 * @returns {boolean} Whether the theme was found and applied
	 */
	setTheme(pThemeKey)
	{
		if (!this._Themes[pThemeKey])
		{
			this.log.warn(`PictProviderFlowTheme: theme '${pThemeKey}' not found`);
			return false;
		}

		this._ActiveThemeKey = pThemeKey;
		let tmpTheme = this._Themes[pThemeKey];

		// Apply noise defaults from theme
		if (tmpTheme.NoiseConfig && typeof tmpTheme.NoiseConfig.DefaultLevel === 'number')
		{
			this._NoiseLevel = tmpTheme.NoiseConfig.DefaultLevel;
		}
		else
		{
			this._NoiseLevel = 0;
		}

		// Apply shape overrides
		if (this._FlowView && this._FlowView._ConnectorShapesProvider)
		{
			this._FlowView._ConnectorShapesProvider.resetToDefaults();
			if (tmpTheme.ShapeOverrides && Object.keys(tmpTheme.ShapeOverrides).length > 0)
			{
				this._FlowView._ConnectorShapesProvider.applyThemeOverrides(tmpTheme.ShapeOverrides);
			}
		}

		this.log.trace(`PictProviderFlowTheme: switched to '${pThemeKey}'`);
		return true;
	}

	/**
	 * Get the current noise level (0 to 1).
	 * @returns {number}
	 */
	getNoiseLevel()
	{
		return this._NoiseLevel;
	}

	/**
	 * Set the noise level (0 to 1).
	 * @param {number} pLevel
	 */
	setNoiseLevel(pLevel)
	{
		this._NoiseLevel = Math.max(0, Math.min(1, pLevel || 0));
	}

	/**
	 * Register a custom theme.
	 * @param {string} pKey
	 * @param {Object} pThemeDefinition
	 */
	registerTheme(pKey, pThemeDefinition)
	{
		if (!pKey || !pThemeDefinition)
		{
			this.log.warn('PictProviderFlowTheme: registerTheme requires key and definition');
			return;
		}
		pThemeDefinition.Key = pKey;
		this._Themes[pKey] = pThemeDefinition;
	}

	/**
	 * Get all registered theme keys.
	 * @returns {Array<string>}
	 */
	getThemeKeys()
	{
		return Object.keys(this._Themes);
	}

	// ── Rendering Hooks ───────────────────────────────────────────────────

	/**
	 * Post-process an SVG path string to apply noise/jitter if the
	 * active theme has noise enabled for connections.
	 *
	 * @param {string} pPathString - SVG path d attribute
	 * @param {string} pSeedString - Hash for deterministic noise
	 * @returns {string} Possibly-modified path string
	 */
	processPathString(pPathString, pSeedString)
	{
		let tmpTheme = this.getActiveTheme();
		if (!tmpTheme || !tmpTheme.NoiseConfig || !tmpTheme.NoiseConfig.Enabled || !tmpTheme.NoiseConfig.AffectsConnections)
		{
			return pPathString;
		}

		let tmpAmplitude = this._NoiseLevel * (tmpTheme.NoiseConfig.MaxJitterPx || 3);
		if (tmpAmplitude <= 0)
		{
			return pPathString;
		}

		if (this._FlowView && this._FlowView._NoiseProvider)
		{
			return this._FlowView._NoiseProvider.jitterPath(pPathString, tmpAmplitude, pSeedString);
		}

		return pPathString;
	}

	/**
	 * Get the noise amplitude for node bracket rendering.
	 * Returns 0 if noise is not enabled for nodes in the active theme.
	 * @returns {number}
	 */
	getNodeNoiseAmplitude()
	{
		let tmpTheme = this.getActiveTheme();
		if (!tmpTheme || !tmpTheme.NoiseConfig || !tmpTheme.NoiseConfig.Enabled || !tmpTheme.NoiseConfig.AffectsNodes)
		{
			return 0;
		}
		return this._NoiseLevel * (tmpTheme.NoiseConfig.MaxJitterPx || 3);
	}
}

module.exports = PictProviderFlowTheme;

module.exports.default_configuration = _ProviderConfiguration;
