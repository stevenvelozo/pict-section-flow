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
			position: relative;
			width: 100%;
			height: 100%;
			min-height: 400px;
			overflow: hidden;
			background-color: #fafafa;
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
			stroke: #e8e8e8;
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
		}
		.pict-flow-node:hover .pict-flow-node-body {
			filter: brightness(0.97);
		}
		.pict-flow-node.selected .pict-flow-node-body {
			stroke: #3498db;
			stroke-width: 2.5;
		}
		.pict-flow-node.dragging {
			opacity: 0.85;
			cursor: grabbing;
		}
		.pict-flow-node-body {
			fill: #ffffff;
			stroke: #bdc3c7;
			stroke-width: 1.5;
			rx: 6;
			ry: 6;
			transition: filter 0.15s;
		}
		.pict-flow-node-title-bar {
			fill: #2c3e50;
			rx: 6;
			ry: 6;
		}
		.pict-flow-node-title-bar-bottom {
			fill: #2c3e50;
		}
		.pict-flow-node-title {
			fill: #ffffff;
			font-size: 12px;
			font-weight: 700;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			pointer-events: none;
		}
		.pict-flow-node-type-label {
			fill: #95a5a6;
			font-size: 10px;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			pointer-events: none;
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
		}
		.pict-flow-node-start .pict-flow-node-body {
			fill: #eafaf1;
			stroke: #27ae60;
			stroke-width: 2.25;
		}
		.pict-flow-node-end .pict-flow-node-body {
			fill: #e8f8f5;
			stroke: #1abc9c;
			stroke-width: 2.25;
		}
		.pict-flow-node-halt .pict-flow-node-body {
			fill: #fdedec;
			stroke: #e74c3c;
			stroke-width: 2.25;
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
			transition: r 0.15s;
		}
		.pict-flow-port.input {
			fill: #3498db;
			stroke: #2980b9;
			stroke-width: 1.5;
		}
		.pict-flow-port.output {
			fill: #2ecc71;
			stroke: #27ae60;
			stroke-width: 1.5;
		}
		.pict-flow-port:hover {
			r: 7;
		}
		.pict-flow-port-label {
			fill: #7f8c8d;
			font-size: 9px;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			pointer-events: none;
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
			stroke: #95a5a6;
			stroke-width: 2;
			cursor: pointer;
			transition: stroke 0.15s;
		}
		.pict-flow-connection:hover {
			stroke: #7f8c8d;
			stroke-width: 3;
		}
		.pict-flow-connection.selected {
			stroke: #3498db;
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
			fill: #3498db;
			stroke: #2980b9;
			stroke-width: 1;
			cursor: pointer;
		}
		.pict-flow-node-panel-indicator:hover {
			fill: #2980b9;
		}
		.pict-flow-panel-foreign-object {
			overflow: visible;
		}
		.pict-flow-panel {
			background: #ffffff;
			border: 1px solid #bdc3c7;
			border-radius: 6px;
			box-shadow: 0 2px 8px rgba(0,0,0,0.12);
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
			padding: 6px 10px;
			background: #ecf0f1;
			border-bottom: 1px solid #d5dbdb;
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
			color: #2c3e50;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
		.pict-flow-panel-close-btn {
			cursor: pointer;
			color: #95a5a6;
			font-size: 14px;
			line-height: 1;
			padding: 2px 4px;
			border: none;
			background: none;
		}
		.pict-flow-panel-close-btn:hover {
			color: #e74c3c;
		}
		.pict-flow-panel-body {
			flex: 1;
			overflow: auto;
			padding: 8px;
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
			padding: 4px;
			font-size: 12px;
			line-height: 1.5;
			color: #2c3e50;
		}
		.pict-flow-info-panel-header {
			font-size: 14px;
			font-weight: 600;
			margin-bottom: 4px;
		}
		.pict-flow-info-panel-header.with-icon {
			font-size: 16px;
		}
		.pict-flow-info-panel-description {
			font-size: 11px;
			color: #7f8c8d;
			margin-bottom: 8px;
		}
		.pict-flow-info-panel-badges {
			margin-bottom: 8px;
		}
		.pict-flow-info-panel-badge {
			display: inline-block;
			padding: 1px 6px;
			border-radius: 3px;
			font-size: 10px;
			margin-right: 4px;
		}
		.pict-flow-info-panel-badge.category {
			background: #ecf0f1;
			color: #7f8c8d;
		}
		.pict-flow-info-panel-badge.code {
			background: #eaf2f8;
			color: #2980b9;
			font-family: monospace;
		}
		.pict-flow-info-panel-section {
			margin-bottom: 6px;
		}
		.pict-flow-info-panel-section-title {
			font-size: 10px;
			font-weight: 700;
			text-transform: uppercase;
			letter-spacing: 0.5px;
			color: #95a5a6;
			margin-bottom: 2px;
		}
		.pict-flow-info-panel-port {
			padding: 2px 6px;
			background: #f8f9fa;
			margin-bottom: 2px;
			font-size: 11px;
		}
		.pict-flow-info-panel-port.input {
			border-left: 3px solid #3498db;
		}
		.pict-flow-info-panel-port.output {
			border-left: 3px solid #2ecc71;
		}
		.pict-flow-info-panel-port-constraint {
			color: #95a5a6;
			font-size: 10px;
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
		.pict-flow-palette-container {
			border-bottom: 1px solid #e0e0e0;
			background-color: #fafafa;
		}
		.pict-flow-palette-toggle {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0.4em 0.75em;
			cursor: pointer;
			user-select: none;
			-webkit-user-select: none;
			font-size: 0.8em;
			color: #7f8c8d;
			background-color: #f4f4f5;
			border-bottom: 1px solid #e0e0e0;
		}
		.pict-flow-palette-toggle:hover {
			background-color: #ecf0f1;
			color: #2c3e50;
		}
		.pict-flow-palette-toggle-arrow {
			font-size: 0.7em;
			transition: transform 0.2s;
		}
		.pict-flow-palette-toggle-arrow.open {
			transform: rotate(180deg);
		}
		.pict-flow-palette-body {
			display: none;
			padding: 0.5em 0.75em 0.75em 0.75em;
			max-height: 280px;
			overflow-y: auto;
		}
		.pict-flow-palette-body.open {
			display: block;
		}
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
			this.getNodeVariantCSS() +
			this.getPortCSS() +
			this.getConnectionCSS() +
			this.getHandleCSS() +
			this.getTetherCSS() +
			this.getPanelCSS() +
			this.getInfoPanelCSS() +
			this.getFullscreenCSS() +
			this.getToolbarCSS() +
			this.getPaletteCSS()
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
