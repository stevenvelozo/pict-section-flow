const libFableServiceProviderBase = require('fable-serviceproviderbase');

/**
 * PictProvider-Flow-CSS
 *
 * Centralized CSS provider for the flow diagram.
 * All flow-related CSS is organized into domain-specific getter methods,
 * providing a single source of truth and enabling future theming.
 */

const _ProviderConfiguration =
{
	ProviderIdentifier: 'PictProviderFlowCSS'
};

class PictProviderFlowCSS extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, _ProviderConfiguration, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'PictProviderFlowCSS';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;
	}

	// ── Container ──────────────────────────────────────────────────────────
	/**
	 * CSS for the flow container, SVG container, panning/connecting cursors, and grid pattern.
	 * @returns {string}
	 */
	getContainerCSS()
	{
		return /*css*/`
		.pict-flow-container {
			/* ── Design Tokens ─────────────────────────────────────
			   Override these custom properties to theme the flow diagram.
			   Node-type classes (.pict-flow-node-{type}) can scope-override
			   any variable for per-type variation. */

			/* Node */
			--pf-node-body-fill: #ffffff;
			--pf-node-body-stroke: #d0d4d8;
			--pf-node-body-stroke-width: 1;
			--pf-node-body-radius: 8px;
			--pf-node-shadow: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.10));
			--pf-node-shadow-hover: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.15));
			--pf-node-shadow-selected: drop-shadow(0 2px 8px rgba(52, 152, 219, 0.25));
			--pf-node-shadow-dragging: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.20));
			--pf-node-title-fill: #ffffff;
			--pf-node-title-size: 11.5px;
			--pf-node-title-weight: 600;
			--pf-node-title-bar-color: #2c3e50;
			--pf-node-type-label-fill: #a0a8b0;
			--pf-node-selected-stroke: #3498db;

			/* Ports */
			--pf-port-input-fill: #3498db;
			--pf-port-output-fill: #2ecc71;
			--pf-port-stroke: #ffffff;
			--pf-port-stroke-width: 2;

			/* Panels */
			--pf-panel-bg: #ffffff;
			--pf-panel-border: #d0d4d8;
			--pf-panel-radius: 8px;
			--pf-panel-shadow: 0 4px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06);
			--pf-panel-titlebar-bg: #f7f8fa;
			--pf-panel-titlebar-border: #e8eaed;
			--pf-panel-title-color: #2c3e50;

			/* Connections */
			--pf-connection-stroke: #95a5a6;
			--pf-connection-selected-stroke: #3498db;

			/* Canvas */
			--pf-canvas-bg: #fafafa;
			--pf-grid-stroke: #e8e8e8;

			position: relative;
			width: 100%;
			height: 100%;
			min-height: 400px;
			overflow: hidden;
			background-color: var(--pf-canvas-bg);
			border: 1px solid #e0e0e0;
			border-radius: 4px;
			display: flex;
			flex-direction: column;
		}
		.pict-flow-svg-container {
			flex: 1;
			min-height: 0;
			position: relative;
		}
		.pict-flow-svg {
			width: 100%;
			height: 100%;
			cursor: grab;
			user-select: none;
			-webkit-user-select: none;
		}
		.pict-flow-svg.panning {
			cursor: grabbing;
		}
		.pict-flow-svg.connecting {
			cursor: crosshair;
		}
		.pict-flow-grid-pattern line {
			stroke: var(--pf-grid-stroke);
			stroke-width: 0.5;
		}
		`;
	}

	// ── Nodes ──────────────────────────────────────────────────────────────
	/**
	 * CSS for base node styling: body, hover/selected/dragging states, title bar, title text, type label.
	 * @returns {string}
	 */
	getNodeCSS()
	{
		return /*css*/`
		.pict-flow-node {
			cursor: pointer;
			filter: var(--pf-node-shadow);
			transition: filter 0.2s;
		}
		.pict-flow-node:hover {
			filter: var(--pf-node-shadow-hover);
		}
		.pict-flow-node:hover .pict-flow-node-body {
			stroke: #b0b8c0;
			stroke-width: 1.5;
		}
		.pict-flow-node.selected {
			filter: var(--pf-node-shadow-selected);
		}
		.pict-flow-node.selected .pict-flow-node-body {
			stroke: var(--pf-node-selected-stroke);
			stroke-width: 2;
		}
		.pict-flow-node.dragging {
			opacity: 0.9;
			cursor: grabbing;
			filter: var(--pf-node-shadow-dragging);
		}
		.pict-flow-node-body {
			fill: var(--pf-node-body-fill);
			stroke: var(--pf-node-body-stroke);
			stroke-width: var(--pf-node-body-stroke-width);
			rx: 8;
			ry: 8;
			transition: stroke 0.2s, stroke-width 0.2s;
		}
		.pict-flow-node-title-bar {
			fill: var(--pf-node-title-bar-color);
			rx: 8;
			ry: 8;
		}
		.pict-flow-node-title-bar-bottom {
			fill: var(--pf-node-title-bar-color);
		}
		.pict-flow-node-title {
			fill: var(--pf-node-title-fill);
			font-size: var(--pf-node-title-size);
			font-weight: var(--pf-node-title-weight);
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			letter-spacing: 0.2px;
			pointer-events: none;
		}
		.pict-flow-node-type-label {
			fill: var(--pf-node-type-label-fill);
			font-size: 9.5px;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			text-transform: uppercase;
			letter-spacing: 0.3px;
			pointer-events: none;
			opacity: 0;
			transition: opacity 0.2s;
		}
		.pict-flow-node:hover .pict-flow-node-type-label {
			opacity: 1;
		}
		.pict-flow-node-card-code {
			opacity: 0;
			transition: opacity 0.2s;
		}
		.pict-flow-node:hover .pict-flow-node-card-code {
			opacity: 1;
		}
		/* Title-bar icon: invert SVG paths to white for dark title bars */
		.pict-flow-node-title-icon {
			filter: brightness(0) invert(1);
		}
		`;
	}

	// ── Body Content ──────────────────────────────────────────────────────
	/**
	 * CSS for custom body content in nodes: SVG group, foreignObject, HTML container, canvas.
	 * @returns {string}
	 */
	getBodyContentCSS()
	{
		return /*css*/`
		.pict-flow-node-body-content {
			pointer-events: none;
		}
		.pict-flow-node-body-content-fo {
			overflow: hidden;
		}
		.pict-flow-node-body-content-html {
			overflow: hidden;
			width: 100%;
			height: 100%;
			box-sizing: border-box;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			font-size: 11px;
			color: #2c3e50;
			pointer-events: auto;
		}
		.pict-flow-node-body-content-canvas {
			display: block;
			pointer-events: auto;
		}
		`;
	}

	// ── Node Variants ──────────────────────────────────────────────────────
	/**
	 * CSS overrides for specific node types: start, end, halt, decision.
	 * @returns {string}
	 */
	getNodeVariantCSS()
	{
		return /*css*/`
		.pict-flow-node-decision .pict-flow-node-body {
			fill: #fff9e6;
			stroke: #f39c12;
			stroke-width: 1.5;
		}
		.pict-flow-node-start .pict-flow-node-body {
			fill: #eafaf1;
			stroke: #27ae60;
			stroke-width: 1.5;
		}
		.pict-flow-node-end .pict-flow-node-body {
			fill: #e8f8f5;
			stroke: #1abc9c;
			stroke-width: 1.5;
		}
		.pict-flow-node-halt .pict-flow-node-body {
			fill: #fdedec;
			stroke: #e74c3c;
			stroke-width: 1.5;
		}
		`;
	}

	// ── Ports ──────────────────────────────────────────────────────────────
	/**
	 * CSS for port circles: input/output coloring, hover states, labels.
	 * @returns {string}
	 */
	getPortCSS()
	{
		return /*css*/`
		.pict-flow-port {
			cursor: crosshair;
			transition: r 0.15s, filter 0.15s;
			filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.12));
		}
		.pict-flow-port.input {
			fill: var(--pf-port-input-fill);
			stroke: var(--pf-port-stroke);
			stroke-width: var(--pf-port-stroke-width);
		}
		.pict-flow-port.output {
			fill: var(--pf-port-output-fill);
			stroke: var(--pf-port-stroke);
			stroke-width: var(--pf-port-stroke-width);
		}
		.pict-flow-port:hover {
			r: 7;
			filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.20));
		}
		.pict-flow-port-label {
			fill: #7f8c8d;
			font-size: 9px;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			pointer-events: none;
		}
		/* Port labels on hover: hidden by default, revealed on node hover */
		.pict-flow-node-port-labels-hover .pict-flow-port-label {
			opacity: 0;
			transition: opacity 0.2s;
		}
		.pict-flow-node-port-labels-hover:hover .pict-flow-port-label {
			opacity: 1;
		}
		`;
	}

	// ── Connections ────────────────────────────────────────────────────────
	/**
	 * CSS for connection paths: base, hover/selected states, hitarea, drag-connection.
	 * @returns {string}
	 */
	getConnectionCSS()
	{
		return /*css*/`
		.pict-flow-connection {
			fill: none;
			stroke: var(--pf-connection-stroke);
			stroke-width: 2;
			cursor: pointer;
			transition: stroke 0.15s;
		}
		.pict-flow-connection:hover {
			stroke: #7f8c8d;
			stroke-width: 3;
		}
		.pict-flow-connection.selected {
			stroke: var(--pf-connection-selected-stroke);
			stroke-width: 3;
		}
		.pict-flow-connection-hitarea {
			fill: none;
			stroke: transparent;
			stroke-width: 12;
			cursor: pointer;
		}
		.pict-flow-drag-connection {
			fill: none;
			stroke: #3498db;
			stroke-width: 2;
			stroke-dasharray: 6 3;
			pointer-events: none;
		}
		`;
	}

	// ── Connection Handles ─────────────────────────────────────────────────
	/**
	 * CSS for connection waypoint handles and midpoint handles.
	 * @returns {string}
	 */
	getHandleCSS()
	{
		return /*css*/`
		.pict-flow-connection-handle {
			fill: #ffffff;
			stroke: #3498db;
			stroke-width: 2;
			cursor: grab;
			transition: r 0.15s;
			filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
		}
		.pict-flow-connection-handle:hover {
			r: 8;
			stroke-width: 2.5;
		}
		.pict-flow-connection-handle-midpoint {
			fill: #ffffff;
			stroke: #e67e22;
			stroke-width: 2;
			cursor: grab;
			transition: r 0.15s;
			filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
		}
		.pict-flow-connection-handle-midpoint:hover {
			r: 8;
			stroke-width: 2.5;
		}
		`;
	}

	// ── Tethers ────────────────────────────────────────────────────────────
	/**
	 * CSS for tether lines, hitareas, handles, and midpoint handles.
	 * @returns {string}
	 */
	getTetherCSS()
	{
		return /*css*/`
		.pict-flow-tether-line {
			fill: none;
			stroke: #95a5a6;
			stroke-width: 1.5;
			stroke-dasharray: 6 4;
			pointer-events: visibleStroke;
			cursor: pointer;
		}
		.pict-flow-tether-line.selected {
			stroke: #3498db;
			stroke-width: 2;
		}
		.pict-flow-tether-hitarea {
			fill: none;
			stroke: transparent;
			stroke-width: 10;
			cursor: pointer;
		}
		.pict-flow-tether-handle {
			fill: #ffffff;
			stroke: #3498db;
			stroke-width: 2;
			cursor: grab;
			transition: r 0.15s;
			filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
		}
		.pict-flow-tether-handle:hover {
			r: 8;
			stroke-width: 2.5;
		}
		.pict-flow-tether-handle-midpoint {
			fill: #ffffff;
			stroke: #e67e22;
			stroke-width: 2;
			cursor: grab;
			transition: r 0.15s;
			filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
		}
		.pict-flow-tether-handle-midpoint:hover {
			r: 8;
			stroke-width: 2.5;
		}
		`;
	}

	// ── Panels ─────────────────────────────────────────────────────────────
	/**
	 * CSS for property panels: foreign object, panel container, titlebar, close button, body, indicator.
	 * @returns {string}
	 */
	getPanelCSS()
	{
		return /*css*/`
		.pict-flow-node-panel-indicator {
			fill: var(--pf-node-selected-stroke);
			stroke: none;
			opacity: 0.6;
			cursor: pointer;
			transition: opacity 0.15s;
		}
		.pict-flow-node-panel-indicator:hover {
			opacity: 1.0;
		}
		.pict-flow-panel-foreign-object {
			overflow: visible;
		}
		.pict-flow-panel {
			background: var(--pf-panel-bg);
			border: 1px solid var(--pf-panel-border);
			border-radius: var(--pf-panel-radius);
			box-shadow: var(--pf-panel-shadow);
			display: flex;
			flex-direction: column;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			font-size: 13px;
			overflow: hidden;
			width: 100%;
			height: 100%;
			box-sizing: border-box;
		}
		.pict-flow-panel-titlebar {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 8px 12px;
			background: var(--pf-panel-titlebar-bg);
			border-bottom: 1px solid var(--pf-panel-titlebar-border);
			cursor: grab;
			user-select: none;
			-webkit-user-select: none;
			flex-shrink: 0;
		}
		.pict-flow-panel-titlebar.dragging {
			cursor: grabbing;
		}
		.pict-flow-panel-title-text {
			font-weight: 600;
			font-size: 12px;
			color: var(--pf-panel-title-color);
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			letter-spacing: 0.1px;
		}
		.pict-flow-panel-close-btn {
			cursor: pointer;
			color: #b0b8c0;
			font-size: 14px;
			line-height: 1;
			padding: 4px;
			border: none;
			background: none;
			border-radius: 4px;
			transition: background-color 0.15s, color 0.15s;
		}
		.pict-flow-panel-close-btn:hover {
			color: #e74c3c;
			background-color: rgba(231, 76, 60, 0.08);
		}
		.pict-flow-panel-body {
			flex: 1;
			overflow: auto;
			padding: 10px 12px;
		}
		`;
	}

	// ── Info Panels ────────────────────────────────────────────────────────
	/**
	 * CSS for the info/hover panel and all sub-elements: header, description, badges, sections, ports.
	 * @returns {string}
	 */
	getInfoPanelCSS()
	{
		return /*css*/`
		.pict-flow-info-panel {
			padding: 2px 0;
			font-size: 12px;
			line-height: 1.5;
			color: #2c3e50;
		}
		.pict-flow-info-panel-header {
			font-size: 13px;
			font-weight: 600;
			margin-bottom: 6px;
			color: #1a252f;
		}
		.pict-flow-info-panel-header.with-icon {
			font-size: 14px;
			display: flex;
			align-items: center;
			gap: 6px;
		}
		.pict-flow-info-panel-description {
			font-size: 11px;
			color: #7f8c8d;
			margin-bottom: 10px;
			line-height: 1.45;
		}
		.pict-flow-info-panel-badges {
			margin-bottom: 10px;
			display: flex;
			flex-wrap: wrap;
			gap: 4px;
		}
		.pict-flow-info-panel-badge {
			display: inline-block;
			padding: 2px 8px;
			border-radius: 4px;
			font-size: 10px;
		}
		.pict-flow-info-panel-badge.category {
			background: #f0f2f4;
			color: #6b7b8d;
		}
		.pict-flow-info-panel-badge.code {
			background: #eaf2f8;
			color: #2980b9;
			font-family: "SF Mono", "Fira Code", monospace;
		}
		.pict-flow-info-panel-section {
			margin-bottom: 8px;
		}
		.pict-flow-info-panel-section-title {
			font-size: 10px;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 0.5px;
			color: #8e99a4;
			margin-bottom: 4px;
			padding-bottom: 2px;
			border-bottom: 1px solid #f0f2f4;
		}
		.pict-flow-info-panel-port {
			padding: 3px 8px;
			background: #f8f9fa;
			margin-bottom: 3px;
			font-size: 11px;
			border-radius: 3px;
		}
		.pict-flow-info-panel-port.input {
			border-left: 3px solid var(--pf-port-input-fill);
		}
		.pict-flow-info-panel-port.output {
			border-left: 3px solid var(--pf-port-output-fill);
		}
		.pict-flow-info-panel-port-constraint {
			color: #8e99a4;
			font-size: 10px;
		}
		`;
	}

	// ── Node Properties Editor ────────────────────────────────────────────
	/**
	 * CSS for the collapsible node properties editor at the bottom of panels.
	 * @returns {string}
	 */
	getNodePropsEditorCSS()
	{
		return /*css*/`
		.pict-flow-panel-node-props {
			border-top: 1px solid var(--pf-panel-titlebar-border);
			flex-shrink: 0;
		}
		.pict-flow-panel-node-props-header {
			display: flex;
			align-items: center;
			gap: 6px;
			padding: 6px 12px;
			cursor: pointer;
			user-select: none;
			-webkit-user-select: none;
			background: var(--pf-panel-titlebar-bg);
			transition: background-color 0.15s;
		}
		.pict-flow-panel-node-props-header:hover {
			background: #eef0f2;
		}
		.pict-flow-panel-node-props-chevron {
			font-size: 8px;
			color: #95a5a6;
			transition: transform 0.2s;
			display: inline-block;
		}
		.pict-flow-panel-node-props-chevron.expanded {
			transform: rotate(90deg);
		}
		.pict-flow-panel-node-props-title {
			font-size: 10px;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 0.5px;
			color: #8e99a4;
		}
		.pict-flow-panel-node-props-body {
			padding: 8px 12px;
			max-height: 240px;
			overflow-y: auto;
		}
		.pict-flow-node-props-fields {
			display: flex;
			flex-direction: column;
			gap: 6px;
		}
		.pict-flow-node-props-field {
			display: flex;
			align-items: center;
			gap: 8px;
		}
		.pict-flow-node-props-label {
			font-size: 11px;
			color: #7f8c8d;
			min-width: 72px;
			flex-shrink: 0;
		}
		.pict-flow-node-props-input {
			flex: 1;
			padding: 3px 6px;
			border: 1px solid #d5d8dc;
			border-radius: 3px;
			font-size: 11px;
			outline: none;
			box-sizing: border-box;
			min-width: 0;
		}
		.pict-flow-node-props-input:focus {
			border-color: #3498db;
		}
		.pict-flow-node-props-color {
			width: 28px;
			height: 24px;
			padding: 1px;
			cursor: pointer;
			flex: 0 0 28px;
		}
		`;
	}

	// ── Fullscreen ─────────────────────────────────────────────────────────
	/**
	 * CSS for fullscreen mode.
	 * @returns {string}
	 */
	getFullscreenCSS()
	{
		return /*css*/`
		.pict-flow-fullscreen {
			position: fixed;
			top: 0;
			left: 0;
			width: 100vw;
			height: 100vh;
			z-index: 9999;
			border-radius: 0;
			border: none;
			min-height: 100vh;
		}
		.pict-flow-fullscreen .pict-flow-svg {
			min-height: calc(100vh - 50px);
		}
		`;
	}

	// ── Toolbar ────────────────────────────────────────────────────────────
	/**
	 * CSS for the toolbar: buttons, groups, labels, selects.
	 * @returns {string}
	 */
	getToolbarCSS()
	{
		return /*css*/`
		.pict-flow-toolbar {
			display: flex;
			align-items: center;
			gap: 0.5em;
			padding: 0.5em 0.75em;
			background-color: #ffffff;
			border-bottom: 1px solid #e0e0e0;
			flex-wrap: wrap;
		}
		.pict-flow-toolbar-group {
			display: flex;
			align-items: center;
			gap: 0.25em;
			padding-right: 0.75em;
			border-right: 1px solid #e0e0e0;
		}
		.pict-flow-toolbar-group:last-child {
			border-right: none;
			padding-right: 0;
		}
		.pict-flow-toolbar-btn {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			gap: 0.35em;
			padding: 0.35em 0.65em;
			border: 1px solid #bdc3c7;
			border-radius: 4px;
			background-color: #fff;
			color: #2c3e50;
			font-size: 0.85em;
			cursor: pointer;
			transition: background-color 0.15s, border-color 0.15s;
			user-select: none;
			-webkit-user-select: none;
		}
		.pict-flow-toolbar-btn:hover {
			background-color: #ecf0f1;
			border-color: #95a5a6;
		}
		.pict-flow-toolbar-btn:active {
			background-color: #d5dbdb;
		}
		.pict-flow-toolbar-btn.danger {
			color: #e74c3c;
			border-color: #e74c3c;
		}
		.pict-flow-toolbar-btn.danger:hover {
			background-color: #fdedec;
		}
		.pict-flow-toolbar-btn-icon {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			line-height: 1;
		}
		.pict-flow-toolbar-btn-icon svg {
			display: block;
		}
		.pict-flow-toolbar-btn-text {
			white-space: nowrap;
		}
		.pict-flow-toolbar-btn-chevron {
			display: inline-flex;
			align-items: center;
			margin-left: 0.15em;
		}
		.pict-flow-toolbar-right {
			margin-left: auto;
			border-right: none;
			padding-right: 0;
		}
		.pict-flow-toolbar-label {
			font-size: 0.8em;
			color: #7f8c8d;
			margin-right: 0.25em;
		}
		.pict-flow-toolbar-select {
			padding: 0.3em 0.5em;
			border: 1px solid #bdc3c7;
			border-radius: 4px;
			font-size: 0.85em;
			background-color: #fff;
			color: #2c3e50;
		}
		`;
	}

	// ── Card Palette ───────────────────────────────────────────────────────
	/**
	 * CSS for the card palette: toggle, body, categories, cards, swatches.
	 * @returns {string}
	 */
	getPaletteCSS()
	{
		return /*css*/`
		.pict-flow-palette-category {
			margin-bottom: 0.5em;
		}
		.pict-flow-palette-category:last-child {
			margin-bottom: 0;
		}
		.pict-flow-palette-category-label {
			font-size: 0.7em;
			font-weight: 700;
			text-transform: uppercase;
			letter-spacing: 0.05em;
			color: #95a5a6;
			margin-bottom: 0.35em;
			padding-bottom: 0.2em;
			border-bottom: 1px solid #ecf0f1;
		}
		.pict-flow-palette-cards {
			display: flex;
			flex-wrap: wrap;
			gap: 0.35em;
		}
		.pict-flow-palette-card {
			display: inline-flex;
			align-items: center;
			gap: 0.35em;
			padding: 0.35em 0.6em;
			border: 1px solid #d5d8dc;
			border-radius: 4px;
			background-color: #ffffff;
			font-size: 0.8em;
			cursor: pointer;
			transition: background-color 0.15s, border-color 0.15s, box-shadow 0.15s;
			user-select: none;
			-webkit-user-select: none;
			position: relative;
		}
		.pict-flow-palette-card:hover {
			background-color: #eaf2f8;
			border-color: #3498db;
			box-shadow: 0 1px 3px rgba(52, 152, 219, 0.15);
		}
		.pict-flow-palette-card.disabled {
			opacity: 0.45;
			pointer-events: none;
			cursor: default;
		}
		.pict-flow-palette-card-icon {
			font-size: 1.1em;
			line-height: 1;
		}
		.pict-flow-palette-card-swatch {
			width: 10px;
			height: 10px;
			border-radius: 2px;
			flex-shrink: 0;
		}
		.pict-flow-palette-card-title {
			font-weight: 500;
			color: #2c3e50;
			white-space: nowrap;
		}
		.pict-flow-palette-card-code {
			font-size: 0.8em;
			color: #95a5a6;
			font-family: monospace;
		}
		.pict-flow-toolbar-select.layout-select {
			min-width: 120px;
			max-width: 200px;
		}
		`;
	}

	// ── Popups ────────────────────────────────────────────────────────────
	/**
	 * CSS for toolbar dropdown popups (Add Node, Cards, Layout).
	 * @returns {string}
	 */
	getPopupCSS()
	{
		return /*css*/`
		.pict-flow-toolbar-popup-anchor {
			position: relative;
		}
		.pict-flow-toolbar-popup {
			position: absolute;
			z-index: 1000;
			background: #ffffff;
			border: 1px solid #d5d8dc;
			border-radius: 6px;
			box-shadow: 0 4px 16px rgba(0,0,0,0.12);
			min-width: 240px;
			max-height: 340px;
			overflow-y: auto;
			padding: 0.35em 0;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			font-size: 13px;
		}
		.pict-flow-popup-search-wrapper {
			position: relative;
			padding: 0.4em 0.5em;
			border-bottom: 1px solid #ecf0f1;
		}
		.pict-flow-popup-search-icon {
			position: absolute;
			left: 0.85em;
			top: 50%;
			transform: translateY(-50%);
			pointer-events: none;
			line-height: 1;
			display: flex;
			align-items: center;
		}
		.pict-flow-popup-search {
			width: 100%;
			padding: 0.4em 0.5em 0.4em 2em;
			border: 1px solid #d5d8dc;
			border-radius: 4px;
			font-size: 0.9em;
			outline: none;
			box-sizing: border-box;
		}
		.pict-flow-popup-search:focus {
			border-color: #3498db;
		}
		.pict-flow-popup-list-item {
			display: flex;
			align-items: center;
			gap: 0.5em;
			padding: 0.45em 0.75em;
			cursor: pointer;
			transition: background-color 0.1s;
		}
		.pict-flow-popup-list-item:hover {
			background-color: #eaf2f8;
		}
		.pict-flow-popup-list-item-icon {
			display: inline-flex;
			align-items: center;
			flex-shrink: 0;
			line-height: 1;
		}
		.pict-flow-popup-list-item-label {
			flex: 1;
			color: #2c3e50;
			font-weight: 500;
		}
		.pict-flow-popup-list-item-code {
			font-size: 0.8em;
			color: #95a5a6;
			font-family: monospace;
			background: #f0f3f5;
			padding: 0.1em 0.4em;
			border-radius: 3px;
		}
		.pict-flow-popup-divider {
			height: 1px;
			background: #ecf0f1;
			margin: 0.25em 0;
		}
		.pict-flow-popup-list-empty {
			text-align: center;
			color: #95a5a6;
			padding: 1.5em 0.75em;
			font-size: 0.9em;
		}
		.pict-flow-popup-layout-save {
			display: flex;
			align-items: center;
			gap: 0.5em;
			padding: 0.45em 0.75em;
			cursor: pointer;
			transition: background-color 0.1s;
			color: #2c3e50;
			font-weight: 500;
		}
		.pict-flow-popup-layout-save:hover {
			background-color: #eaf2f8;
		}
		.pict-flow-popup-layout-save-icon {
			display: inline-flex;
			align-items: center;
			flex-shrink: 0;
			line-height: 1;
		}
		.pict-flow-popup-layout-save-input-row {
			display: flex;
			align-items: center;
			gap: 0.35em;
			padding: 0.35em 0.5em;
		}
		.pict-flow-popup-layout-save-input {
			flex: 1;
			padding: 0.35em 0.5em;
			border: 1px solid #d5d8dc;
			border-radius: 4px;
			font-size: 0.9em;
			outline: none;
			box-sizing: border-box;
		}
		.pict-flow-popup-layout-save-input:focus {
			border-color: #3498db;
		}
		.pict-flow-popup-layout-save-confirm {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: 28px;
			height: 28px;
			border: 1px solid #d5d8dc;
			border-radius: 4px;
			background: #fff;
			cursor: pointer;
			flex-shrink: 0;
			transition: background-color 0.15s, border-color 0.15s;
			line-height: 1;
		}
		.pict-flow-popup-layout-save-confirm:hover {
			background-color: #eaf2f8;
			border-color: #3498db;
		}
		.pict-flow-popup-layout-row {
			display: flex;
			align-items: center;
			padding: 0.45em 0.75em;
			cursor: pointer;
			transition: background-color 0.1s;
		}
		.pict-flow-popup-layout-row:hover {
			background-color: #eaf2f8;
		}
		.pict-flow-popup-layout-name {
			flex: 1;
			color: #2c3e50;
		}
		.pict-flow-popup-layout-delete {
			display: none;
			align-items: center;
			justify-content: center;
			border: none;
			background: none;
			color: #e74c3c;
			cursor: pointer;
			padding: 2px 4px;
			border-radius: 3px;
			line-height: 1;
		}
		.pict-flow-popup-layout-row:hover .pict-flow-popup-layout-delete {
			display: inline-flex;
		}
		.pict-flow-popup-layout-delete:hover {
			background-color: #fdedec;
		}
		`;
	}

	// ── Collapsed Toolbar ─────────────────────────────────────────────────
	/**
	 * CSS for the collapsed toolbar state (small expand button in corner).
	 * @returns {string}
	 */
	getCollapsedToolbarCSS()
	{
		return /*css*/`
		.pict-flow-toolbar-collapsed {
			position: absolute;
			top: 8px;
			right: 8px;
			z-index: 100;
			display: none;
		}
		.pict-flow-toolbar-collapsed.visible {
			display: block;
		}
		.pict-flow-toolbar-expand-btn {
			width: 36px;
			height: 36px;
			border-radius: 6px;
			border: 1px solid #d5d8dc;
			background-color: #ffffff;
			box-shadow: 0 2px 6px rgba(0,0,0,0.1);
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: background-color 0.15s, box-shadow 0.15s;
		}
		.pict-flow-toolbar-expand-btn:hover {
			background-color: #ecf0f1;
			box-shadow: 0 2px 8px rgba(0,0,0,0.15);
		}
		`;
	}

	// ── Floating Toolbar ──────────────────────────────────────────────────
	/**
	 * CSS for the floating draggable toolbar.
	 * @returns {string}
	 */
	getFloatingToolbarCSS()
	{
		return /*css*/`
		.pict-flow-floating-toolbar {
			position: absolute;
			z-index: 100;
			display: flex;
			flex-direction: column;
			gap: 2px;
			padding: 4px;
			border-radius: 8px;
			border: 1px solid #d5d8dc;
			background-color: #ffffff;
			box-shadow: 0 4px 16px rgba(0,0,0,0.12);
			pointer-events: auto;
		}
		.pict-flow-floating-grip {
			cursor: grab;
			padding: 4px;
			border-radius: 4px;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: background-color 0.15s;
		}
		.pict-flow-floating-grip:hover {
			background-color: #ecf0f1;
		}
		.pict-flow-floating-grip:active {
			cursor: grabbing;
		}
		.pict-flow-floating-btn {
			width: 32px;
			height: 32px;
			border: none;
			border-radius: 4px;
			background-color: transparent;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: background-color 0.15s;
		}
		.pict-flow-floating-btn:hover {
			background-color: #ecf0f1;
		}
		.pict-flow-floating-btn.danger:hover {
			background-color: #fdedec;
		}
		.pict-flow-floating-separator {
			height: 1px;
			background-color: #ecf0f1;
			margin: 2px 4px;
		}
		/* Collapsed floating toolbar — grip-only draggable square */
		.pict-flow-floating-toolbar.collapsed .pict-flow-floating-btn,
		.pict-flow-floating-toolbar.collapsed .pict-flow-floating-separator {
			display: none;
		}
		.pict-flow-floating-toolbar.collapsed {
			padding: 0;
			border-radius: 6px;
		}
		.pict-flow-floating-toolbar.collapsed .pict-flow-floating-grip {
			width: 32px;
			height: 32px;
			padding: 0;
			display: flex;
			align-items: center;
			justify-content: center;
		}
		.pict-flow-floating-toolbar.collapsed .pict-flow-floating-grip span {
			display: flex;
			align-items: center;
			justify-content: center;
			line-height: 1;
		}
		`;
	}

	// ── Icons ─────────────────────────────────────────────────────────────
	/**
	 * CSS for inline SVG icons in palette cards, toolbar buttons, info panel headers, and panel close buttons.
	 * @returns {string}
	 */
	getIconCSS()
	{
		return /*css*/`
		.pict-flow-icon-svg {
			pointer-events: none;
		}
		.pict-flow-palette-card-icon svg {
			display: inline-block;
			vertical-align: middle;
		}
		.pict-flow-toolbar-btn-icon {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			line-height: 1;
		}
		.pict-flow-toolbar-btn-icon svg {
			display: block;
			vertical-align: middle;
		}
		.pict-flow-info-panel-header.with-icon svg {
			display: inline-block;
			vertical-align: middle;
			margin-right: 4px;
		}
		.pict-flow-panel-close-icon {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			line-height: 1;
		}
		.pict-flow-panel-close-icon svg {
			display: block;
		}
		.pict-flow-palette-toggle-arrow svg {
			display: block;
		}
		`;
	}

	// ── Aggregate Methods ──────────────────────────────────────────────────

	/**
	 * Concatenate all domain CSS getters into a single CSS string.
	 * @returns {string}
	 */
	generateCSS()
	{
		return (
			this.getContainerCSS() +
			this.getNodeCSS() +
			this.getBodyContentCSS() +
			this.getNodeVariantCSS() +
			this.getPortCSS() +
			this.getConnectionCSS() +
			this.getHandleCSS() +
			this.getTetherCSS() +
			this.getPanelCSS() +
			this.getInfoPanelCSS() +
			this.getNodePropsEditorCSS() +
			this.getFullscreenCSS() +
			this.getToolbarCSS() +
			this.getPaletteCSS() +
			this.getPopupCSS() +
			this.getCollapsedToolbarCSS() +
			this.getFloatingToolbarCSS() +
			this.getIconCSS()
		);
	}

	/**
	 * Register all flow CSS with pict's CSSMap service.
	 * Uses correct parameter ordering: (hash, content, priority, provider).
	 */
	registerCSS()
	{
		if (this.fable && this.fable.CSSMap)
		{
			this.fable.CSSMap.addCSS('PictSectionFlow-CSS', this.generateCSS(), 500, 'PictProviderFlowCSS');
		}
		else
		{
			this.log.warn('PictProviderFlowCSS: CSSMap not available; CSS not registered.');
		}
	}
}

module.exports = PictProviderFlowCSS;

module.exports.default_configuration = _ProviderConfiguration;
