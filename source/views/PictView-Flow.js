const libPictView = require('pict-view');

const libPictServiceFlowInteractionManager = require('../services/PictService-Flow-InteractionManager.js');
const libPictServiceFlowConnectionRenderer = require('../services/PictService-Flow-ConnectionRenderer.js');
const libPictServiceFlowTether = require('../services/PictService-Flow-Tether.js');
const libPictServiceFlowLayout = require('../services/PictService-Flow-Layout.js');
const libPictServiceFlowPathGenerator = require('../services/PictService-Flow-PathGenerator.js');
const libPictServiceFlowViewportManager = require('../services/PictService-Flow-ViewportManager.js');
const libPictServiceFlowSelectionManager = require('../services/PictService-Flow-SelectionManager.js');
const libPictServiceFlowPanelManager = require('../services/PictService-Flow-PanelManager.js');

const libPictProviderFlowNodeTypes = require('../providers/PictProvider-Flow-NodeTypes.js');
const libPictProviderFlowEventHandler = require('../providers/PictProvider-Flow-EventHandler.js');
const libPictProviderFlowLayouts = require('../providers/PictProvider-Flow-Layouts.js');
const libPictProviderFlowSVGHelpers = require('../providers/PictProvider-Flow-SVGHelpers.js');
const libPictProviderFlowGeometry = require('../providers/PictProvider-Flow-Geometry.js');
const libPictProviderFlowPanelChrome = require('../providers/PictProvider-Flow-PanelChrome.js');

const libPictViewFlowNode = require('./PictView-Flow-Node.js');
const libPictViewFlowToolbar = require('./PictView-Flow-Toolbar.js');
const libPictViewFlowPropertiesPanel = require('./PictView-Flow-PropertiesPanel.js');

const libPictFlowCardPropertiesPanel = require('../PictFlowCardPropertiesPanel.js');
const libPanelTemplate = require('../panels/FlowCardPropertiesPanel-Template.js');
const libPanelMarkdown = require('../panels/FlowCardPropertiesPanel-Markdown.js');
const libPanelForm = require('../panels/FlowCardPropertiesPanel-Form.js');
const libPanelView = require('../panels/FlowCardPropertiesPanel-View.js');

const _DefaultConfiguration =
{
	ViewIdentifier: 'Pict-Flow',

	DefaultRenderable: 'Flow-Container',
	DefaultDestinationAddress: '#Flow-Container',

	AutoRender: false,

	FlowDataAddress: false,

	TargetElementAddress: '#Flow-SVG-Container',

	EnableToolbar: true,
	EnablePanning: true,
	EnableZooming: true,
	EnableNodeDragging: true,
	EnableConnectionCreation: true,
	EnableGridSnap: false,
	GridSnapSize: 20,

	MinZoom: 0.1,
	MaxZoom: 5.0,
	ZoomStep: 0.1,

	DefaultNodeType: 'default',
	DefaultNodeWidth: 180,
	DefaultNodeHeight: 80,

	CSS: /*css*/`
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
		.pict-flow-node-decision .pict-flow-node-body {
			fill: #fff9e6;
			stroke: #f39c12;
		}
		.pict-flow-node-start .pict-flow-node-body {
			fill: #eafaf1;
			stroke: #27ae60;
			rx: 25;
			ry: 25;
		}
		.pict-flow-node-end .pict-flow-node-body {
			fill: #fdedec;
			stroke: #e74c3c;
			rx: 25;
			ry: 25;
		}
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
	`,

	Templates:
	[
		{
			Hash: 'Flow-PanelChrome-Template',
			Template: /*html*/`<div class="pict-flow-panel" xmlns="http://www.w3.org/1999/xhtml"><div class="pict-flow-panel-titlebar" data-element-type="panel-titlebar" data-panel-hash="{~D:Record.Hash~}"><span class="pict-flow-panel-title-text">{~D:Record.Title~}</span><span class="pict-flow-panel-close-btn" data-element-type="panel-close" data-panel-hash="{~D:Record.Hash~}">\u2715</span></div><div class="pict-flow-panel-body" data-panel-hash="{~D:Record.Hash~}"></div></div>`
		},
		{
			Hash: 'Flow-Container-Template',
			Template: /*html*/`
<div class="pict-flow-container" id="Flow-Wrapper-{~D:Record.ViewIdentifier~}">
	<div id="Flow-Toolbar-{~D:Record.ViewIdentifier~}"></div>
	<div class="pict-flow-svg-container" id="Flow-SVG-Container-{~D:Record.ViewIdentifier~}">
		<svg class="pict-flow-svg"
			id="Flow-SVG-{~D:Record.ViewIdentifier~}"
			xmlns="http://www.w3.org/2000/svg">
			<defs>
				<marker id="flow-arrowhead-{~D:Record.ViewIdentifier~}"
					markerWidth="5" markerHeight="7"
					refX="7.5" refY="3.5"
					orient="auto" markerUnits="strokeWidth">
					<polygon points="0 0, 5 3.5, 0 7" fill="#95a5a6" />
				</marker>
				<marker id="flow-arrowhead-selected-{~D:Record.ViewIdentifier~}"
					markerWidth="5" markerHeight="7"
					refX="7.5" refY="3.5"
					orient="auto" markerUnits="strokeWidth">
					<polygon points="0 0, 5 3.5, 0 7" fill="#3498db" />
				</marker>
				<marker id="flow-tether-arrowhead-{~D:Record.ViewIdentifier~}"
					markerWidth="4" markerHeight="6"
					refX="6" refY="3"
					orient="auto" markerUnits="strokeWidth">
					<polygon points="0 0, 4 3, 0 6" fill="#95a5a6" />
				</marker>
				<pattern id="flow-grid-{~D:Record.ViewIdentifier~}"
					width="20" height="20" patternUnits="userSpaceOnUse">
					<line x1="20" y1="0" x2="20" y2="20" class="pict-flow-grid-pattern" />
					<line x1="0" y1="20" x2="20" y2="20" class="pict-flow-grid-pattern" />
				</pattern>
			</defs>
			<rect width="10000" height="10000" x="-5000" y="-5000"
				fill="url(#flow-grid-{~D:Record.ViewIdentifier~})"
				class="pict-flow-grid-background" />
			<g class="pict-flow-viewport" id="Flow-Viewport-{~D:Record.ViewIdentifier~}">
				<g class="pict-flow-connections-layer" id="Flow-Connections-{~D:Record.ViewIdentifier~}"></g>
				<g class="pict-flow-nodes-layer" id="Flow-Nodes-{~D:Record.ViewIdentifier~}"></g>
				<g class="pict-flow-tethers-layer" id="Flow-Tethers-{~D:Record.ViewIdentifier~}"></g>
				<g class="pict-flow-panels-layer" id="Flow-Panels-{~D:Record.ViewIdentifier~}"></g>
			</g>
		</svg>
	</div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: 'Flow-Container',
			TemplateHash: 'Flow-Container-Template',
			DestinationAddress: '#Flow-Container',
			RenderMethod: 'replace'
		}
	]
};

class PictViewFlow extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultConfiguration)), pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'PictSectionFlow';

		// Register service types with fable so they can be instantiated
		if (!this.fable.servicesMap.hasOwnProperty('PictServiceFlowInteractionManager'))
		{
			this.fable.addServiceType('PictServiceFlowInteractionManager', libPictServiceFlowInteractionManager);
		}
		if (!this.fable.servicesMap.hasOwnProperty('PictServiceFlowConnectionRenderer'))
		{
			this.fable.addServiceType('PictServiceFlowConnectionRenderer', libPictServiceFlowConnectionRenderer);
		}
		if (!this.fable.servicesMap.hasOwnProperty('PictServiceFlowTether'))
		{
			this.fable.addServiceType('PictServiceFlowTether', libPictServiceFlowTether);
		}
		if (!this.fable.servicesMap.hasOwnProperty('PictServiceFlowLayout'))
		{
			this.fable.addServiceType('PictServiceFlowLayout', libPictServiceFlowLayout);
		}
		if (!this.fable.servicesMap.hasOwnProperty('PictServiceFlowPathGenerator'))
		{
			this.fable.addServiceType('PictServiceFlowPathGenerator', libPictServiceFlowPathGenerator);
		}
		if (!this.fable.servicesMap.hasOwnProperty('PictServiceFlowViewportManager'))
		{
			this.fable.addServiceType('PictServiceFlowViewportManager', libPictServiceFlowViewportManager);
		}
		if (!this.fable.servicesMap.hasOwnProperty('PictServiceFlowSelectionManager'))
		{
			this.fable.addServiceType('PictServiceFlowSelectionManager', libPictServiceFlowSelectionManager);
		}
		if (!this.fable.servicesMap.hasOwnProperty('PictServiceFlowPanelManager'))
		{
			this.fable.addServiceType('PictServiceFlowPanelManager', libPictServiceFlowPanelManager);
		}
		if (!this.fable.servicesMap.hasOwnProperty('PictProviderFlowSVGHelpers'))
		{
			this.fable.addServiceType('PictProviderFlowSVGHelpers', libPictProviderFlowSVGHelpers);
		}
		if (!this.fable.servicesMap.hasOwnProperty('PictProviderFlowGeometry'))
		{
			this.fable.addServiceType('PictProviderFlowGeometry', libPictProviderFlowGeometry);
		}
		if (!this.fable.servicesMap.hasOwnProperty('PictProviderFlowPanelChrome'))
		{
			this.fable.addServiceType('PictProviderFlowPanelChrome', libPictProviderFlowPanelChrome);
		}
		if (!this.fable.servicesMap.hasOwnProperty('PictProviderFlowNodeTypes'))
		{
			this.fable.addServiceType('PictProviderFlowNodeTypes', libPictProviderFlowNodeTypes);
		}
		if (!this.fable.servicesMap.hasOwnProperty('PictProviderFlowEventHandler'))
		{
			this.fable.addServiceType('PictProviderFlowEventHandler', libPictProviderFlowEventHandler);
		}
		if (!this.fable.servicesMap.hasOwnProperty('PictProviderFlowLayouts'))
		{
			this.fable.addServiceType('PictProviderFlowLayouts', libPictProviderFlowLayouts);
		}
		if (!this.fable.servicesMap.hasOwnProperty('PictViewFlowNode'))
		{
			this.fable.addServiceType('PictViewFlowNode', libPictViewFlowNode);
		}
		if (!this.fable.servicesMap.hasOwnProperty('PictViewFlowToolbar'))
		{
			this.fable.addServiceType('PictViewFlowToolbar', libPictViewFlowToolbar);
		}
		if (!this.fable.servicesMap.hasOwnProperty('PictViewFlowPropertiesPanel'))
		{
			this.fable.addServiceType('PictViewFlowPropertiesPanel', libPictViewFlowPropertiesPanel);
		}
		if (!this.fable.servicesMap.hasOwnProperty('PictFlowCardPropertiesPanel'))
		{
			this.fable.addServiceType('PictFlowCardPropertiesPanel', libPictFlowCardPropertiesPanel);
		}
		if (!this.fable.servicesMap.hasOwnProperty('PictFlowCardPropertiesPanel-Template'))
		{
			this.fable.addServiceType('PictFlowCardPropertiesPanel-Template', libPanelTemplate);
		}
		if (!this.fable.servicesMap.hasOwnProperty('PictFlowCardPropertiesPanel-Markdown'))
		{
			this.fable.addServiceType('PictFlowCardPropertiesPanel-Markdown', libPanelMarkdown);
		}
		if (!this.fable.servicesMap.hasOwnProperty('PictFlowCardPropertiesPanel-Form'))
		{
			this.fable.addServiceType('PictFlowCardPropertiesPanel-Form', libPanelForm);
		}
		if (!this.fable.servicesMap.hasOwnProperty('PictFlowCardPropertiesPanel-View'))
		{
			this.fable.addServiceType('PictFlowCardPropertiesPanel-View', libPanelView);
		}

		// Internal state
		this._FlowData = {
			Nodes: [],
			Connections: [],
			OpenPanels: [],
			SavedLayouts: [],
			ViewState: {
				PanX: 0,
				PanY: 0,
				Zoom: 1,
				SelectedNodeHash: null,
				SelectedConnectionHash: null,
				SelectedTetherHash: null
			}
		};

		this._SVGElement = null;
		this._ViewportElement = null;
		this._NodesLayer = null;
		this._ConnectionsLayer = null;
		this._TethersLayer = null;
		this._PanelsLayer = null;

		this._InteractionManager = null;
		this._ConnectionRenderer = null;
		this._TetherService = null;
		this._LayoutService = null;
		this._PathGenerator = null;
		this._ViewportManager = null;
		this._SelectionManager = null;
		this._PanelManager = null;
		this._SVGHelperProvider = null;
		this._GeometryProvider = null;
		this._PanelChromeProvider = null;
		this._NodeTypeProvider = null;
		this._LayoutProvider = null;
		this._EventHandlerProvider = null;
		this._NodeView = null;
		this._ToolbarView = null;
		this._PropertiesPanelView = null;

		this.initialRenderComplete = false;
	}

	get flowData()
	{
		return this._FlowData;
	}

	get viewState()
	{
		return this._FlowData.ViewState;
	}

	// Backward-compatible getter for InteractionManager direct access
	get _IsFullscreen()
	{
		return this._ViewportManager ? this._ViewportManager._IsFullscreen : false;
	}

	/**
	 * Override render to pass view options as the template record,
	 * so template expressions like {~D:Record.ViewIdentifier~} resolve correctly.
	 */
	render(pRenderableHash, pRenderDestinationAddress)
	{
		return super.render(pRenderableHash, pRenderDestinationAddress, this.options);
	}

	renderAsync(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, pRootRenderable, fCallback)
	{
		// If no record address is explicitly provided, use this.options as the record
		if (typeof pTemplateRecordAddress === 'function' || typeof pTemplateRecordAddress === 'undefined')
		{
			return super.renderAsync(pRenderableHash, pRenderDestinationAddress, this.options, pRootRenderable, pTemplateRecordAddress || fCallback);
		}
		return super.renderAsync(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, pRootRenderable, fCallback);
	}

	onBeforeInitialize()
	{
		super.onBeforeInitialize();

		// Instantiate shared utility providers first (used by services below)
		this._SVGHelperProvider = this.fable.instantiateServiceProviderWithoutRegistration('PictProviderFlowSVGHelpers');
		this._GeometryProvider = this.fable.instantiateServiceProviderWithoutRegistration('PictProviderFlowGeometry');
		this._PathGenerator = this.fable.instantiateServiceProviderWithoutRegistration('PictServiceFlowPathGenerator', { FlowView: this });
		this._PanelChromeProvider = this.fable.instantiateServiceProviderWithoutRegistration('PictProviderFlowPanelChrome', { FlowView: this });

		// Instantiate services
		this._InteractionManager = this.fable.instantiateServiceProviderWithoutRegistration('PictServiceFlowInteractionManager', { FlowView: this });
		this._ConnectionRenderer = this.fable.instantiateServiceProviderWithoutRegistration('PictServiceFlowConnectionRenderer', { FlowView: this });
		this._TetherService = this.fable.instantiateServiceProviderWithoutRegistration('PictServiceFlowTether', { FlowView: this });
		this._LayoutService = this.fable.instantiateServiceProviderWithoutRegistration('PictServiceFlowLayout', { FlowView: this });
		this._ViewportManager = this.fable.instantiateServiceProviderWithoutRegistration('PictServiceFlowViewportManager', { FlowView: this });
		this._SelectionManager = this.fable.instantiateServiceProviderWithoutRegistration('PictServiceFlowSelectionManager', { FlowView: this });
		this._PanelManager = this.fable.instantiateServiceProviderWithoutRegistration('PictServiceFlowPanelManager', { FlowView: this });

		// Instantiate providers, passing any additional node types from view options
		this._NodeTypeProvider = this.fable.instantiateServiceProviderWithoutRegistration('PictProviderFlowNodeTypes', { FlowView: this, AdditionalNodeTypes: this.options.NodeTypes });
		this._EventHandlerProvider = this.fable.instantiateServiceProviderWithoutRegistration('PictProviderFlowEventHandler', { FlowView: this });
		this._LayoutProvider = this.fable.instantiateServiceProviderWithoutRegistration('PictProviderFlowLayouts', { FlowView: this });

		return super.onBeforeInitialize();
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		if (!this.initialRenderComplete)
		{
			this.onAfterInitialRender();
			this.initialRenderComplete = true;
		}
		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	onAfterInitialRender()
	{
		let tmpViewIdentifier = this.options.ViewIdentifier;

		// Grab SVG DOM elements
		let tmpSVGElements = this.pict.ContentAssignment.getElement(`#Flow-SVG-${tmpViewIdentifier}`);
		if (tmpSVGElements.length < 1)
		{
			this.log.error(`PictSectionFlow could not find SVG element #Flow-SVG-${tmpViewIdentifier}`);
			return false;
		}
		this._SVGElement = tmpSVGElements[0];

		let tmpViewportElements = this.pict.ContentAssignment.getElement(`#Flow-Viewport-${tmpViewIdentifier}`);
		if (tmpViewportElements.length > 0)
		{
			this._ViewportElement = tmpViewportElements[0];
		}

		let tmpNodesElements = this.pict.ContentAssignment.getElement(`#Flow-Nodes-${tmpViewIdentifier}`);
		if (tmpNodesElements.length > 0)
		{
			this._NodesLayer = tmpNodesElements[0];
		}

		let tmpConnectionsElements = this.pict.ContentAssignment.getElement(`#Flow-Connections-${tmpViewIdentifier}`);
		if (tmpConnectionsElements.length > 0)
		{
			this._ConnectionsLayer = tmpConnectionsElements[0];
		}

		let tmpTethersElements = this.pict.ContentAssignment.getElement(`#Flow-Tethers-${tmpViewIdentifier}`);
		if (tmpTethersElements.length > 0)
		{
			this._TethersLayer = tmpTethersElements[0];
		}

		let tmpPanelsElements = this.pict.ContentAssignment.getElement(`#Flow-Panels-${tmpViewIdentifier}`);
		if (tmpPanelsElements.length > 0)
		{
			this._PanelsLayer = tmpPanelsElements[0];
		}

		// Initialize shared utility providers (used by services below)
		if (!this._SVGHelperProvider)
		{
			this._SVGHelperProvider = this.fable.instantiateServiceProviderWithoutRegistration('PictProviderFlowSVGHelpers');
		}
		if (!this._GeometryProvider)
		{
			this._GeometryProvider = this.fable.instantiateServiceProviderWithoutRegistration('PictProviderFlowGeometry');
		}
		if (!this._PathGenerator)
		{
			this._PathGenerator = this.fable.instantiateServiceProviderWithoutRegistration('PictServiceFlowPathGenerator', { FlowView: this });
		}
		if (!this._PanelChromeProvider)
		{
			this._PanelChromeProvider = this.fable.instantiateServiceProviderWithoutRegistration('PictProviderFlowPanelChrome', { FlowView: this });
		}

		// Initialize services with references
		if (!this._InteractionManager)
		{
			this._InteractionManager = this.fable.instantiateServiceProviderWithoutRegistration('PictServiceFlowInteractionManager', { FlowView: this });
		}
		if (!this._ConnectionRenderer)
		{
			this._ConnectionRenderer = this.fable.instantiateServiceProviderWithoutRegistration('PictServiceFlowConnectionRenderer', { FlowView: this });
		}
		if (!this._TetherService)
		{
			this._TetherService = this.fable.instantiateServiceProviderWithoutRegistration('PictServiceFlowTether', { FlowView: this });
		}
		if (!this._LayoutService)
		{
			this._LayoutService = this.fable.instantiateServiceProviderWithoutRegistration('PictServiceFlowLayout', { FlowView: this });
		}
		if (!this._ViewportManager)
		{
			this._ViewportManager = this.fable.instantiateServiceProviderWithoutRegistration('PictServiceFlowViewportManager', { FlowView: this });
		}
		if (!this._SelectionManager)
		{
			this._SelectionManager = this.fable.instantiateServiceProviderWithoutRegistration('PictServiceFlowSelectionManager', { FlowView: this });
		}
		if (!this._PanelManager)
		{
			this._PanelManager = this.fable.instantiateServiceProviderWithoutRegistration('PictServiceFlowPanelManager', { FlowView: this });
		}
		if (!this._NodeTypeProvider)
		{
			this._NodeTypeProvider = this.fable.instantiateServiceProviderWithoutRegistration('PictProviderFlowNodeTypes', { FlowView: this, AdditionalNodeTypes: this.options.NodeTypes });
		}
		if (!this._EventHandlerProvider)
		{
			this._EventHandlerProvider = this.fable.instantiateServiceProviderWithoutRegistration('PictProviderFlowEventHandler', { FlowView: this });
		}
		if (!this._LayoutProvider)
		{
			this._LayoutProvider = this.fable.instantiateServiceProviderWithoutRegistration('PictProviderFlowLayouts', { FlowView: this });
		}

		// Setup the toolbar if enabled
		if (this.options.EnableToolbar)
		{
			this._ToolbarView = this.fable.instantiateServiceProviderWithoutRegistration('PictViewFlowToolbar',
				Object.assign({},
					libPictViewFlowToolbar.default_configuration,
					{
						ViewIdentifier: `Flow-Toolbar-${tmpViewIdentifier}`,
						DefaultDestinationAddress: `#Flow-Toolbar-${tmpViewIdentifier}`,
						FlowViewIdentifier: tmpViewIdentifier
					}
				));
			// Use the toolbar's render method after it's set up
			if (this._ToolbarView && typeof this._ToolbarView.render === 'function')
			{
				this._ToolbarView._FlowView = this;
				this._ToolbarView.render();
			}
		}

		// Setup the node renderer
		this._NodeView = this.fable.instantiateServiceProviderWithoutRegistration('PictViewFlowNode',
			Object.assign({},
				libPictViewFlowNode.default_configuration,
				{
					ViewIdentifier: `Flow-NodeRenderer-${tmpViewIdentifier}`,
					AutoRender: false
				}
			));
		this._NodeView._FlowView = this;

		// Setup the properties panel renderer
		this._PropertiesPanelView = this.fable.instantiateServiceProviderWithoutRegistration('PictViewFlowPropertiesPanel',
			Object.assign({},
				libPictViewFlowPropertiesPanel.default_configuration,
				{
					ViewIdentifier: `Flow-PropertiesPanel-${tmpViewIdentifier}`,
					AutoRender: false
				}
			));
		this._PropertiesPanelView._FlowView = this;

		// Bind interaction events
		this._InteractionManager.initialize(this._SVGElement, this._ViewportElement);

		// Load initial flow data if an address is configured
		if (this.options.FlowDataAddress)
		{
			this.marshalToView();
		}

		// Render the initial flow
		this.renderFlow();
	}

	/**
	 * Marshal data from AppData into the flow view
	 */
	marshalToView()
	{
		if (this.options.FlowDataAddress)
		{
			const tmpAddressSpace =
			{
				Fable: this.fable,
				Pict: this.pict || this.fable,
				AppData: this.pict ? this.pict.AppData : this.fable.AppData,
				Bundle: this.Bundle,
				Options: this.options
			};
			let tmpData = this.fable.manifest.getValueByHash(tmpAddressSpace, this.options.FlowDataAddress);
			if (typeof tmpData === 'object' && tmpData !== null)
			{
				this.setFlowData(tmpData);
			}
		}
	}

	/**
	 * Marshal data from the flow view back to AppData
	 */
	marshalFromView()
	{
		if (this.options.FlowDataAddress)
		{
			const tmpAddressSpace =
			{
				Fable: this.fable,
				Pict: this.pict || this.fable,
				AppData: this.pict ? this.pict.AppData : this.fable.AppData,
				Bundle: this.Bundle,
				Options: this.options
			};
			this.fable.manifest.setValueByHash(tmpAddressSpace, this.options.FlowDataAddress, JSON.parse(JSON.stringify(this._FlowData)));
		}
	}

	/**
	 * Get the complete flow data object
	 * @returns {Object} The flow data including nodes, connections, and view state
	 */
	getFlowData()
	{
		return JSON.parse(JSON.stringify(this._FlowData));
	}

	/**
	 * Set the complete flow data object and re-render
	 * @param {Object} pFlowData - The flow data to set
	 */
	setFlowData(pFlowData)
	{
		if (typeof pFlowData !== 'object' || pFlowData === null)
		{
			this.log.warn('PictSectionFlow setFlowData received invalid data');
			return;
		}

		this._FlowData = {
			Nodes: Array.isArray(pFlowData.Nodes) ? pFlowData.Nodes : [],
			Connections: Array.isArray(pFlowData.Connections) ? pFlowData.Connections : [],
			OpenPanels: Array.isArray(pFlowData.OpenPanels) ? pFlowData.OpenPanels : [],
			SavedLayouts: Array.isArray(pFlowData.SavedLayouts) ? pFlowData.SavedLayouts : [],
			ViewState: Object.assign(
				{ PanX: 0, PanY: 0, Zoom: 1, SelectedNodeHash: null, SelectedConnectionHash: null, SelectedTetherHash: null },
				pFlowData.ViewState || {}
			)
		};

		if (this.initialRenderComplete)
		{
			this.renderFlow();
		}
	}

	/**
	 * Add a new node to the flow
	 * @param {string} pType - The node type hash
	 * @param {number} pX - X position
	 * @param {number} pY - Y position
	 * @param {string} [pTitle] - Optional title
	 * @param {Object} [pData] - Optional additional data
	 * @returns {Object} The created node
	 */
	addNode(pType, pX, pY, pTitle, pData)
	{
		let tmpType = pType || this.options.DefaultNodeType;
		let tmpNodeTypeConfig = this._NodeTypeProvider.getNodeType(tmpType);

		let tmpNodeHash = `node-${this.fable.getUUID()}`;
		let tmpNode =
		{
			Hash: tmpNodeHash,
			Type: tmpType,
			X: pX || 100,
			Y: pY || 100,
			Width: (tmpNodeTypeConfig && tmpNodeTypeConfig.DefaultWidth) || this.options.DefaultNodeWidth,
			Height: (tmpNodeTypeConfig && tmpNodeTypeConfig.DefaultHeight) || this.options.DefaultNodeHeight,
			Title: pTitle || (tmpNodeTypeConfig && tmpNodeTypeConfig.Label) || 'New Node',
			Ports: (tmpNodeTypeConfig && tmpNodeTypeConfig.DefaultPorts)
				? JSON.parse(JSON.stringify(tmpNodeTypeConfig.DefaultPorts))
				: [
					{ Hash: `port-in-${this.fable.getUUID()}`, Direction: 'input', Side: 'left', Label: 'In' },
					{ Hash: `port-out-${this.fable.getUUID()}`, Direction: 'output', Side: 'right', Label: 'Out' }
				],
			Data: pData || {}
		};

		// Ensure each port has a unique hash
		for (let i = 0; i < tmpNode.Ports.length; i++)
		{
			if (!tmpNode.Ports[i].Hash)
			{
				tmpNode.Ports[i].Hash = `port-${tmpNode.Ports[i].Direction}-${this.fable.getUUID()}`;
			}
		}

		this._FlowData.Nodes.push(tmpNode);
		this.renderFlow();
		this.marshalFromView();

		if (this._EventHandlerProvider)
		{
			this._EventHandlerProvider.fireEvent('onNodeAdded', tmpNode);
			this._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowData);
		}

		return tmpNode;
	}

	/**
	 * Remove a node and all its connections
	 * @param {string} pNodeHash - The hash of the node to remove
	 * @returns {boolean} Whether the node was removed
	 */
	removeNode(pNodeHash)
	{
		let tmpNodeIndex = this._FlowData.Nodes.findIndex((pNode) => pNode.Hash === pNodeHash);
		if (tmpNodeIndex < 0)
		{
			this.log.warn(`PictSectionFlow removeNode: node ${pNodeHash} not found`);
			return false;
		}

		let tmpRemovedNode = this._FlowData.Nodes.splice(tmpNodeIndex, 1)[0];

		// Remove all connections involving this node
		this._FlowData.Connections = this._FlowData.Connections.filter((pConnection) =>
		{
			return pConnection.SourceNodeHash !== pNodeHash && pConnection.TargetNodeHash !== pNodeHash;
		});

		// Close any open panels for this node
		this.closePanelForNode(pNodeHash);

		// Clear selection if this node was selected
		if (this._FlowData.ViewState.SelectedNodeHash === pNodeHash)
		{
			this._FlowData.ViewState.SelectedNodeHash = null;
		}

		this.renderFlow();
		this.marshalFromView();

		if (this._EventHandlerProvider)
		{
			this._EventHandlerProvider.fireEvent('onNodeRemoved', tmpRemovedNode);
			this._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowData);
		}

		return true;
	}

	/**
	 * Add a connection between two ports
	 * @param {string} pSourceNodeHash
	 * @param {string} pSourcePortHash
	 * @param {string} pTargetNodeHash
	 * @param {string} pTargetPortHash
	 * @param {Object} [pData] - Optional additional data
	 * @returns {Object|false} The created connection, or false if invalid
	 */
	addConnection(pSourceNodeHash, pSourcePortHash, pTargetNodeHash, pTargetPortHash, pData)
	{
		// Validate that both nodes and ports exist
		let tmpSourceNode = this._FlowData.Nodes.find((pNode) => pNode.Hash === pSourceNodeHash);
		let tmpTargetNode = this._FlowData.Nodes.find((pNode) => pNode.Hash === pTargetNodeHash);

		if (!tmpSourceNode || !tmpTargetNode)
		{
			this.log.warn('PictSectionFlow addConnection: source or target node not found');
			return false;
		}

		let tmpSourcePort = tmpSourceNode.Ports.find((pPort) => pPort.Hash === pSourcePortHash);
		let tmpTargetPort = tmpTargetNode.Ports.find((pPort) => pPort.Hash === pTargetPortHash);

		if (!tmpSourcePort || !tmpTargetPort)
		{
			this.log.warn('PictSectionFlow addConnection: source or target port not found');
			return false;
		}

		// Prevent self-connections
		if (pSourceNodeHash === pTargetNodeHash)
		{
			this.log.warn('PictSectionFlow addConnection: cannot connect a node to itself');
			return false;
		}

		// Check for duplicate connections
		let tmpDuplicate = this._FlowData.Connections.find((pConn) =>
		{
			return pConn.SourceNodeHash === pSourceNodeHash
				&& pConn.SourcePortHash === pSourcePortHash
				&& pConn.TargetNodeHash === pTargetNodeHash
				&& pConn.TargetPortHash === pTargetPortHash;
		});
		if (tmpDuplicate)
		{
			this.log.warn('PictSectionFlow addConnection: duplicate connection');
			return false;
		}

		let tmpConnection =
		{
			Hash: `conn-${this.fable.getUUID()}`,
			SourceNodeHash: pSourceNodeHash,
			SourcePortHash: pSourcePortHash,
			TargetNodeHash: pTargetNodeHash,
			TargetPortHash: pTargetPortHash,
			Data: pData || {}
		};

		this._FlowData.Connections.push(tmpConnection);
		this.renderFlow();
		this.marshalFromView();

		if (this._EventHandlerProvider)
		{
			this._EventHandlerProvider.fireEvent('onConnectionCreated', tmpConnection);
			this._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowData);
		}

		return tmpConnection;
	}

	/**
	 * Remove a connection
	 * @param {string} pConnectionHash - The hash of the connection to remove
	 * @returns {boolean} Whether the connection was removed
	 */
	removeConnection(pConnectionHash)
	{
		let tmpConnectionIndex = this._FlowData.Connections.findIndex((pConn) => pConn.Hash === pConnectionHash);
		if (tmpConnectionIndex < 0)
		{
			this.log.warn(`PictSectionFlow removeConnection: connection ${pConnectionHash} not found`);
			return false;
		}

		let tmpRemovedConnection = this._FlowData.Connections.splice(tmpConnectionIndex, 1)[0];

		if (this._FlowData.ViewState.SelectedConnectionHash === pConnectionHash)
		{
			this._FlowData.ViewState.SelectedConnectionHash = null;
		}

		this.renderFlow();
		this.marshalFromView();

		if (this._EventHandlerProvider)
		{
			this._EventHandlerProvider.fireEvent('onConnectionRemoved', tmpRemovedConnection);
			this._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowData);
		}

		return true;
	}

	/**
	 * Select a node
	 * @param {string|null} pNodeHash - Hash of the node to select, or null to deselect
	 */
	selectNode(pNodeHash)
	{
		return this._SelectionManager.selectNode(pNodeHash);
	}

	/**
	 * Select a connection
	 * @param {string|null} pConnectionHash - Hash of the connection to select, or null to deselect
	 */
	selectConnection(pConnectionHash)
	{
		return this._SelectionManager.selectConnection(pConnectionHash);
	}

	/**
	 * Deselect all nodes and connections
	 */
	deselectAll()
	{
		return this._SelectionManager.deselectAll();
	}

	/**
	 * Delete the currently selected node or connection
	 * @returns {boolean}
	 */
	deleteSelected()
	{
		return this._SelectionManager.deleteSelected();
	}

	/**
	 * Update the viewport transform (pan and zoom)
	 */
	updateViewportTransform()
	{
		return this._ViewportManager.updateViewportTransform();
	}

	/**
	 * Set zoom level
	 * @param {number} pZoom - The zoom level
	 * @param {number} [pFocusX] - X coordinate to zoom toward (SVG space)
	 * @param {number} [pFocusY] - Y coordinate to zoom toward (SVG space)
	 */
	setZoom(pZoom, pFocusX, pFocusY)
	{
		return this._ViewportManager.setZoom(pZoom, pFocusX, pFocusY);
	}

	/**
	 * Zoom to fit all nodes in the viewport
	 */
	zoomToFit()
	{
		return this._ViewportManager.zoomToFit();
	}

	/**
	 * Apply auto-layout to all nodes
	 */
	autoLayout()
	{
		if (this._LayoutService)
		{
			this._LayoutService.autoLayout(this._FlowData.Nodes, this._FlowData.Connections);
			this.renderFlow();
			this.marshalFromView();

			if (this._EventHandlerProvider)
			{
				this._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowData);
			}
		}
	}

	/**
	 * Toggle fullscreen mode on the flow editor container.
	 * Uses a CSS fixed-position overlay instead of the Fullscreen API.
	 * @returns {boolean} The new fullscreen state
	 */
	toggleFullscreen()
	{
		return this._ViewportManager.toggleFullscreen();
	}

	/**
	 * Exit fullscreen mode if currently active.
	 */
	exitFullscreen()
	{
		return this._ViewportManager.exitFullscreen();
	}

	/**
	 * Get a node by hash
	 * @param {string} pNodeHash
	 * @returns {Object|null}
	 */
	getNode(pNodeHash)
	{
		return this._FlowData.Nodes.find((pNode) => pNode.Hash === pNodeHash) || null;
	}

	/**
	 * Get a connection by hash
	 * @param {string} pConnectionHash
	 * @returns {Object|null}
	 */
	getConnection(pConnectionHash)
	{
		return this._FlowData.Connections.find((pConn) => pConn.Hash === pConnectionHash) || null;
	}

	/**
	 * Select a tether by its panel hash.
	 * @param {string|null} pPanelHash - Hash of the panel whose tether to select, or null to deselect
	 */
	selectTether(pPanelHash)
	{
		return this._SelectionManager.selectTether(pPanelHash);
	}

	/**
	 * Update a connection handle position during drag (for real-time feedback).
	 * @param {string} pConnectionHash
	 * @param {string} pHandleType - 'bezier-midpoint', 'ortho-corner1', 'ortho-corner2', 'ortho-midpoint'
	 * @param {number} pX
	 * @param {number} pY
	 */
	updateConnectionHandle(pConnectionHash, pHandleType, pX, pY)
	{
		let tmpConnection = this.getConnection(pConnectionHash);
		if (!tmpConnection) return;

		if (!tmpConnection.Data) tmpConnection.Data = {};
		tmpConnection.Data.HandleCustomized = true;

		switch (pHandleType)
		{
			case 'bezier-midpoint':
				tmpConnection.Data.BezierHandleX = pX;
				tmpConnection.Data.BezierHandleY = pY;
				break;

			case 'ortho-corner1':
				tmpConnection.Data.OrthoCorner1X = pX;
				tmpConnection.Data.OrthoCorner1Y = pY;
				break;

			case 'ortho-corner2':
				tmpConnection.Data.OrthoCorner2X = pX;
				tmpConnection.Data.OrthoCorner2Y = pY;
				break;

			case 'ortho-midpoint':
			{
				// Midpoint drag shifts the corridor offset
				let tmpSourcePos = this.getPortPosition(tmpConnection.SourceNodeHash, tmpConnection.SourcePortHash);
				let tmpTargetPos = this.getPortPosition(tmpConnection.TargetNodeHash, tmpConnection.TargetPortHash);
				if (tmpSourcePos && tmpTargetPos)
				{
					let tmpGeom = this._ConnectionRenderer._computeDirectionalGeometry(tmpSourcePos, tmpTargetPos);
					let tmpStartDir = tmpGeom.startDir;

					// Compute offset along the corridor axis
					if (Math.abs(tmpStartDir.dx) > Math.abs(tmpStartDir.dy))
					{
						// Horizontal departure — corridor is vertical, shift is along X
						let tmpAutoMidX = (tmpGeom.departX + tmpGeom.approachX) / 2;
						tmpConnection.Data.OrthoMidOffset = pX - tmpAutoMidX;
					}
					else
					{
						// Vertical departure — corridor is horizontal, shift is along Y
						let tmpAutoMidY = (tmpGeom.departY + tmpGeom.approachY) / 2;
						tmpConnection.Data.OrthoMidOffset = pY - tmpAutoMidY;
					}
				}
				break;
			}
		}

		this._renderSingleConnection(pConnectionHash);
	}

	/**
	 * Update a tether handle position during drag (for real-time feedback).
	 * Delegates state update to the TetherService.
	 * @param {string} pPanelHash
	 * @param {string} pHandleType - 'bezier-midpoint', 'ortho-corner1', 'ortho-corner2', 'ortho-midpoint'
	 * @param {number} pX
	 * @param {number} pY
	 */
	updateTetherHandle(pPanelHash, pHandleType, pX, pY)
	{
		let tmpPanel = this._FlowData.OpenPanels.find((pPanel) => pPanel.Hash === pPanelHash);
		if (!tmpPanel) return;

		if (this._TetherService)
		{
			this._TetherService.updateHandlePosition(tmpPanel, pHandleType, pX, pY);
		}

		this._renderSingleTether(pPanelHash);
	}

	/**
	 * Re-render a single connection (remove and re-add) for smooth drag performance.
	 * @param {string} pConnectionHash
	 */
	_renderSingleConnection(pConnectionHash)
	{
		if (!this._ConnectionsLayer) return;

		// Remove existing elements for this connection
		let tmpExisting = this._ConnectionsLayer.querySelectorAll(`[data-connection-hash="${pConnectionHash}"]`);
		for (let i = 0; i < tmpExisting.length; i++)
		{
			tmpExisting[i].remove();
		}

		let tmpConnection = this.getConnection(pConnectionHash);
		if (!tmpConnection) return;

		let tmpIsSelected = (this._FlowData.ViewState.SelectedConnectionHash === pConnectionHash);
		this._ConnectionRenderer.renderConnection(tmpConnection, this._ConnectionsLayer, tmpIsSelected);
	}

	/**
	 * Re-render a single tether (remove and re-add) for smooth drag performance.
	 * @param {string} pPanelHash
	 */
	_renderSingleTether(pPanelHash)
	{
		if (!this._TethersLayer || !this._TetherService) return;

		// Remove existing tether elements for this panel
		let tmpExisting = this._TethersLayer.querySelectorAll(`[data-panel-hash="${pPanelHash}"]`);
		for (let i = 0; i < tmpExisting.length; i++)
		{
			tmpExisting[i].remove();
		}

		let tmpPanel = this._FlowData.OpenPanels.find((pPanel) => pPanel.Hash === pPanelHash);
		if (!tmpPanel) return;

		let tmpNodeData = this.getNode(tmpPanel.NodeHash);
		if (!tmpNodeData) return;

		let tmpIsSelected = (this._FlowData.ViewState.SelectedTetherHash === pPanelHash);
		this._TetherService.renderTether(tmpPanel, tmpNodeData, this._TethersLayer, tmpIsSelected, this.options.ViewIdentifier);
	}

	/**
	 * Reset handle positions for all connections/tethers involving a node.
	 * Called when a node moves. Preserves LineMode but resets handle coordinates to auto.
	 * @param {string} pNodeHash
	 */
	_resetHandlesForNode(pNodeHash)
	{
		// Reset connection handles
		for (let i = 0; i < this._FlowData.Connections.length; i++)
		{
			let tmpConn = this._FlowData.Connections[i];
			if (tmpConn.SourceNodeHash === pNodeHash || tmpConn.TargetNodeHash === pNodeHash)
			{
				if (tmpConn.Data && tmpConn.Data.HandleCustomized)
				{
					tmpConn.Data.HandleCustomized = false;
					tmpConn.Data.BezierHandleX = null;
					tmpConn.Data.BezierHandleY = null;
					tmpConn.Data.OrthoCorner1X = null;
					tmpConn.Data.OrthoCorner1Y = null;
					tmpConn.Data.OrthoCorner2X = null;
					tmpConn.Data.OrthoCorner2Y = null;
					tmpConn.Data.OrthoMidOffset = 0;
				}
			}
		}

		// Reset tether handles for panels attached to this node
		if (this._TetherService)
		{
			this._TetherService.resetHandlesForNode(this._FlowData.OpenPanels, pNodeHash);
		}
	}

	/**
	 * Reset tether handle positions for a specific panel.
	 * Called when a panel is dragged.
	 * @param {string} pPanelHash
	 */
	_resetHandlesForPanel(pPanelHash)
	{
		let tmpPanel = this._FlowData.OpenPanels.find((pPanel) => pPanel.Hash === pPanelHash);
		if (!tmpPanel) return;

		if (this._TetherService)
		{
			this._TetherService.resetHandlePositions(tmpPanel);
		}
	}

	/**
	 * Get a port's absolute position in SVG coordinates.
	 *
	 * For left and right side ports, positioning is offset below the title bar
	 * so that connection endpoints match the rendered port circles.
	 *
	 * @param {string} pNodeHash
	 * @param {string} pPortHash
	 * @returns {{x: number, y: number, side: string}|null}
	 */
	getPortPosition(pNodeHash, pPortHash)
	{
		let tmpNode = this.getNode(pNodeHash);
		if (!tmpNode) return null;

		let tmpPort = tmpNode.Ports.find((p) => p.Hash === pPortHash);
		if (!tmpPort) return null;

		// Count ports on the same side (matching both direction and side)
		let tmpSameSidePorts = tmpNode.Ports.filter((p) => p.Side === tmpPort.Side);
		let tmpPortIndex = tmpSameSidePorts.indexOf(tmpPort);
		let tmpPortCount = tmpSameSidePorts.length;

		let tmpTitleBarHeight = (this._NodeView && this._NodeView.options.NodeTitleBarHeight) || 28;

		let tmpLocal = this._GeometryProvider.getPortLocalPosition(tmpPort.Side, tmpPortIndex, tmpPortCount, tmpNode.Width, tmpNode.Height, tmpTitleBarHeight);

		return { x: tmpNode.X + tmpLocal.x, y: tmpNode.Y + tmpLocal.y, side: tmpPort.Side || 'right' };
	}

	/**
	 * Convert screen coordinates to SVG viewport coordinates
	 * @param {number} pScreenX
	 * @param {number} pScreenY
	 * @returns {{x: number, y: number}}
	 */
	screenToSVGCoords(pScreenX, pScreenY)
	{
		return this._ViewportManager.screenToSVGCoords(pScreenX, pScreenY);
	}

	/**
	 * Render the complete flow diagram
	 */
	renderFlow()
	{
		if (!this._NodesLayer || !this._ConnectionsLayer) return;

		// Clear existing SVG content
		while (this._NodesLayer.firstChild)
		{
			this._NodesLayer.removeChild(this._NodesLayer.firstChild);
		}
		while (this._ConnectionsLayer.firstChild)
		{
			this._ConnectionsLayer.removeChild(this._ConnectionsLayer.firstChild);
		}

		// Render connections first (behind nodes)
		for (let i = 0; i < this._FlowData.Connections.length; i++)
		{
			let tmpConnection = this._FlowData.Connections[i];
			let tmpIsSelected = (this._FlowData.ViewState.SelectedConnectionHash === tmpConnection.Hash);

			this._ConnectionRenderer.renderConnection(
				tmpConnection,
				this._ConnectionsLayer,
				tmpIsSelected
			);
		}

		// Render nodes
		for (let i = 0; i < this._FlowData.Nodes.length; i++)
		{
			let tmpNode = this._FlowData.Nodes[i];
			let tmpIsSelected = (this._FlowData.ViewState.SelectedNodeHash === tmpNode.Hash);
			let tmpNodeTypeConfig = this._NodeTypeProvider.getNodeType(tmpNode.Type);

			this._NodeView.renderNode(tmpNode, this._NodesLayer, tmpIsSelected, tmpNodeTypeConfig);
		}

		// Render properties panels and tethers
		if (this._PropertiesPanelView && this._PanelsLayer && this._TethersLayer)
		{
			this._PropertiesPanelView.renderPanels(this._FlowData.OpenPanels, this._PanelsLayer, this._TethersLayer, this._FlowData.ViewState.SelectedTetherHash);
		}

		// Update viewport transform
		this.updateViewportTransform();
	}

	/**
	 * Update a single node's position in the SVG without full re-render (for drag performance)
	 * @param {string} pNodeHash
	 * @param {number} pX
	 * @param {number} pY
	 */
	updateNodePosition(pNodeHash, pX, pY)
	{
		let tmpNode = this.getNode(pNodeHash);
		if (!tmpNode) return;

		if (this.options.EnableGridSnap)
		{
			pX = this._LayoutService.snapToGrid(pX, this.options.GridSnapSize);
			pY = this._LayoutService.snapToGrid(pY, this.options.GridSnapSize);
		}

		tmpNode.X = pX;
		tmpNode.Y = pY;

		// Reset customized handle positions for connections/tethers involving this node
		this._resetHandlesForNode(pNodeHash);

		// Update the node's SVG group transform for smooth dragging
		let tmpNodeGroup = this._NodesLayer.querySelector(`[data-node-hash="${pNodeHash}"]`);
		if (tmpNodeGroup)
		{
			tmpNodeGroup.setAttribute('transform', `translate(${pX}, ${pY})`);
		}

		// Re-render connections that involve this node
		this._renderConnectionsForNode(pNodeHash);

		// Update tethers for any panels attached to this node
		this._renderTethersForNode(pNodeHash);
	}

	/**
	 * Re-render only connections that involve a specific node (for drag performance)
	 * @param {string} pNodeHash
	 */
	_renderConnectionsForNode(pNodeHash)
	{
		let tmpAffectedConnections = this._FlowData.Connections.filter((pConn) =>
		{
			return pConn.SourceNodeHash === pNodeHash || pConn.TargetNodeHash === pNodeHash;
		});

		for (let i = 0; i < tmpAffectedConnections.length; i++)
		{
			let tmpConn = tmpAffectedConnections[i];
			let tmpIsSelected = (this._FlowData.ViewState.SelectedConnectionHash === tmpConn.Hash);

			// Remove existing connection SVG elements
			let tmpExisting = this._ConnectionsLayer.querySelectorAll(`[data-connection-hash="${tmpConn.Hash}"]`);
			for (let j = 0; j < tmpExisting.length; j++)
			{
				tmpExisting[j].remove();
			}

			// Re-render this connection
			this._ConnectionRenderer.renderConnection(tmpConn, this._ConnectionsLayer, tmpIsSelected);
		}
	}

	/**
	 * Re-render tethers for panels attached to a specific node (for drag performance).
	 * @param {string} pNodeHash
	 */
	_renderTethersForNode(pNodeHash)
	{
		if (!this._TethersLayer || !this._TetherService) return;

		let tmpAffectedPanels = this._FlowData.OpenPanels.filter((pPanel) => pPanel.NodeHash === pNodeHash);
		if (tmpAffectedPanels.length === 0) return;

		// Remove existing tethers for these panels and re-render via TetherService
		for (let i = 0; i < tmpAffectedPanels.length; i++)
		{
			let tmpExisting = this._TethersLayer.querySelectorAll(`[data-panel-hash="${tmpAffectedPanels[i].Hash}"]`);
			for (let j = 0; j < tmpExisting.length; j++)
			{
				tmpExisting[j].remove();
			}

			let tmpNodeData = this.getNode(tmpAffectedPanels[i].NodeHash);
			if (!tmpNodeData) continue;

			let tmpIsSelected = (this._FlowData.ViewState.SelectedTetherHash === tmpAffectedPanels[i].Hash);
			this._TetherService.renderTether(tmpAffectedPanels[i], tmpNodeData, this._TethersLayer, tmpIsSelected, this.options.ViewIdentifier);
		}
	}

	// ---- Properties Panel Management ----

	/**
	 * Open a properties panel for a node.
	 * @param {string} pNodeHash - The hash of the node to open a panel for
	 * @returns {Object|false} The panel data, or false if the node has no PropertiesPanel config
	 */
	openPanel(pNodeHash)
	{
		return this._PanelManager.openPanel(pNodeHash);
	}

	/**
	 * Close a properties panel by panel hash.
	 * @param {string} pPanelHash
	 * @returns {boolean}
	 */
	closePanel(pPanelHash)
	{
		return this._PanelManager.closePanel(pPanelHash);
	}

	/**
	 * Close all panels for a given node.
	 * @param {string} pNodeHash
	 * @returns {boolean}
	 */
	closePanelForNode(pNodeHash)
	{
		return this._PanelManager.closePanelForNode(pNodeHash);
	}

	/**
	 * Toggle a properties panel for a node (open if closed, close if open).
	 * @param {string} pNodeHash
	 * @returns {Object|false}
	 */
	togglePanel(pNodeHash)
	{
		return this._PanelManager.togglePanel(pNodeHash);
	}

	/**
	 * Update a panel's position (for drag).
	 * @param {string} pPanelHash
	 * @param {number} pX
	 * @param {number} pY
	 */
	updatePanelPosition(pPanelHash, pX, pY)
	{
		return this._PanelManager.updatePanelPosition(pPanelHash, pX, pY);
	}
}

module.exports = PictViewFlow;

module.exports.default_configuration = _DefaultConfiguration;
