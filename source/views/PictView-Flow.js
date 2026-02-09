const libPictView = require('pict-view');

const libPictServiceFlowInteractionManager = require('../services/PictService-Flow-InteractionManager.js');
const libPictServiceFlowConnectionRenderer = require('../services/PictService-Flow-ConnectionRenderer.js');
const libPictServiceFlowLayout = require('../services/PictService-Flow-Layout.js');

const libPictProviderFlowNodeTypes = require('../providers/PictProvider-Flow-NodeTypes.js');
const libPictProviderFlowEventHandler = require('../providers/PictProvider-Flow-EventHandler.js');

const libPictViewFlowNode = require('./PictView-Flow-Node.js');
const libPictViewFlowToolbar = require('./PictView-Flow-Toolbar.js');

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
		}
		.pict-flow-svg {
			width: 100%;
			height: 100%;
			min-height: 400px;
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
	`,

	Templates:
	[
		{
			Hash: 'Flow-Container-Template',
			Template: /*html*/`
<div class="pict-flow-container" id="Flow-Wrapper-{~D:Record.ViewIdentifier~}">
	<div id="Flow-Toolbar-{~D:Record.ViewIdentifier~}"></div>
	<div id="Flow-SVG-Container-{~D:Record.ViewIdentifier~}">
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
		if (!this.fable.servicesMap.hasOwnProperty('PictServiceFlowLayout'))
		{
			this.fable.addServiceType('PictServiceFlowLayout', libPictServiceFlowLayout);
		}
		if (!this.fable.servicesMap.hasOwnProperty('PictProviderFlowNodeTypes'))
		{
			this.fable.addServiceType('PictProviderFlowNodeTypes', libPictProviderFlowNodeTypes);
		}
		if (!this.fable.servicesMap.hasOwnProperty('PictProviderFlowEventHandler'))
		{
			this.fable.addServiceType('PictProviderFlowEventHandler', libPictProviderFlowEventHandler);
		}
		if (!this.fable.servicesMap.hasOwnProperty('PictViewFlowNode'))
		{
			this.fable.addServiceType('PictViewFlowNode', libPictViewFlowNode);
		}
		if (!this.fable.servicesMap.hasOwnProperty('PictViewFlowToolbar'))
		{
			this.fable.addServiceType('PictViewFlowToolbar', libPictViewFlowToolbar);
		}

		// Internal state
		this._FlowData = {
			Nodes: [],
			Connections: [],
			ViewState: {
				PanX: 0,
				PanY: 0,
				Zoom: 1,
				SelectedNodeHash: null,
				SelectedConnectionHash: null
			}
		};

		this._SVGElement = null;
		this._ViewportElement = null;
		this._NodesLayer = null;
		this._ConnectionsLayer = null;

		this._InteractionManager = null;
		this._ConnectionRenderer = null;
		this._LayoutService = null;
		this._NodeTypeProvider = null;
		this._EventHandlerProvider = null;
		this._NodeView = null;
		this._ToolbarView = null;

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

		// Register services
		this._InteractionManager = this.fable.instantiateServiceProviderWithoutRegistration('PictServiceFlowInteractionManager', { FlowView: this });
		this._ConnectionRenderer = this.fable.instantiateServiceProviderWithoutRegistration('PictServiceFlowConnectionRenderer', { FlowView: this });
		this._LayoutService = this.fable.instantiateServiceProviderWithoutRegistration('PictServiceFlowLayout', { FlowView: this });

		// Register providers
		this._NodeTypeProvider = this.fable.instantiateServiceProviderWithoutRegistration('PictProviderFlowNodeTypes', { FlowView: this });
		this._EventHandlerProvider = this.fable.instantiateServiceProviderWithoutRegistration('PictProviderFlowEventHandler', { FlowView: this });

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

		// Initialize services with references
		if (!this._InteractionManager)
		{
			this._InteractionManager = this.fable.instantiateServiceProviderWithoutRegistration('PictServiceFlowInteractionManager', { FlowView: this });
		}
		if (!this._ConnectionRenderer)
		{
			this._ConnectionRenderer = this.fable.instantiateServiceProviderWithoutRegistration('PictServiceFlowConnectionRenderer', { FlowView: this });
		}
		if (!this._LayoutService)
		{
			this._LayoutService = this.fable.instantiateServiceProviderWithoutRegistration('PictServiceFlowLayout', { FlowView: this });
		}
		if (!this._NodeTypeProvider)
		{
			this._NodeTypeProvider = this.fable.instantiateServiceProviderWithoutRegistration('PictProviderFlowNodeTypes', { FlowView: this });
		}
		if (!this._EventHandlerProvider)
		{
			this._EventHandlerProvider = this.fable.instantiateServiceProviderWithoutRegistration('PictProviderFlowEventHandler', { FlowView: this });
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
			ViewState: Object.assign(
				{ PanX: 0, PanY: 0, Zoom: 1, SelectedNodeHash: null, SelectedConnectionHash: null },
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
		let tmpPreviousSelection = this._FlowData.ViewState.SelectedNodeHash;
		this._FlowData.ViewState.SelectedNodeHash = pNodeHash;
		this._FlowData.ViewState.SelectedConnectionHash = null;

		this.renderFlow();

		if (this._EventHandlerProvider && pNodeHash !== tmpPreviousSelection)
		{
			let tmpNode = pNodeHash ? this._FlowData.Nodes.find((pNode) => pNode.Hash === pNodeHash) : null;
			this._EventHandlerProvider.fireEvent('onNodeSelected', tmpNode);
		}
	}

	/**
	 * Select a connection
	 * @param {string|null} pConnectionHash - Hash of the connection to select, or null to deselect
	 */
	selectConnection(pConnectionHash)
	{
		let tmpPreviousSelection = this._FlowData.ViewState.SelectedConnectionHash;
		this._FlowData.ViewState.SelectedConnectionHash = pConnectionHash;
		this._FlowData.ViewState.SelectedNodeHash = null;

		this.renderFlow();

		if (this._EventHandlerProvider && pConnectionHash !== tmpPreviousSelection)
		{
			let tmpConnection = pConnectionHash ? this._FlowData.Connections.find((pConn) => pConn.Hash === pConnectionHash) : null;
			this._EventHandlerProvider.fireEvent('onConnectionSelected', tmpConnection);
		}
	}

	/**
	 * Deselect all nodes and connections
	 */
	deselectAll()
	{
		this._FlowData.ViewState.SelectedNodeHash = null;
		this._FlowData.ViewState.SelectedConnectionHash = null;
		this.renderFlow();
	}

	/**
	 * Delete the currently selected node or connection
	 * @returns {boolean}
	 */
	deleteSelected()
	{
		if (this._FlowData.ViewState.SelectedNodeHash)
		{
			return this.removeNode(this._FlowData.ViewState.SelectedNodeHash);
		}
		if (this._FlowData.ViewState.SelectedConnectionHash)
		{
			return this.removeConnection(this._FlowData.ViewState.SelectedConnectionHash);
		}
		return false;
	}

	/**
	 * Update the viewport transform (pan and zoom)
	 */
	updateViewportTransform()
	{
		if (!this._ViewportElement) return;
		let tmpVS = this._FlowData.ViewState;
		this._ViewportElement.setAttribute('transform',
			`translate(${tmpVS.PanX}, ${tmpVS.PanY}) scale(${tmpVS.Zoom})`
		);
	}

	/**
	 * Set zoom level
	 * @param {number} pZoom - The zoom level
	 * @param {number} [pFocusX] - X coordinate to zoom toward (SVG space)
	 * @param {number} [pFocusY] - Y coordinate to zoom toward (SVG space)
	 */
	setZoom(pZoom, pFocusX, pFocusY)
	{
		let tmpNewZoom = Math.max(this.options.MinZoom, Math.min(this.options.MaxZoom, pZoom));
		let tmpOldZoom = this._FlowData.ViewState.Zoom;

		if (typeof pFocusX === 'number' && typeof pFocusY === 'number')
		{
			// Zoom toward focus point
			let tmpVS = this._FlowData.ViewState;
			tmpVS.PanX = pFocusX - (pFocusX - tmpVS.PanX) * (tmpNewZoom / tmpOldZoom);
			tmpVS.PanY = pFocusY - (pFocusY - tmpVS.PanY) * (tmpNewZoom / tmpOldZoom);
		}

		this._FlowData.ViewState.Zoom = tmpNewZoom;
		this.updateViewportTransform();
	}

	/**
	 * Zoom to fit all nodes in the viewport
	 */
	zoomToFit()
	{
		if (this._FlowData.Nodes.length === 0) return;
		if (!this._SVGElement) return;

		let tmpMinX = Infinity, tmpMinY = Infinity;
		let tmpMaxX = -Infinity, tmpMaxY = -Infinity;

		for (let i = 0; i < this._FlowData.Nodes.length; i++)
		{
			let tmpNode = this._FlowData.Nodes[i];
			tmpMinX = Math.min(tmpMinX, tmpNode.X);
			tmpMinY = Math.min(tmpMinY, tmpNode.Y);
			tmpMaxX = Math.max(tmpMaxX, tmpNode.X + tmpNode.Width);
			tmpMaxY = Math.max(tmpMaxY, tmpNode.Y + tmpNode.Height);
		}

		let tmpPadding = 50;
		let tmpFlowWidth = tmpMaxX - tmpMinX + tmpPadding * 2;
		let tmpFlowHeight = tmpMaxY - tmpMinY + tmpPadding * 2;

		let tmpSVGRect = this._SVGElement.getBoundingClientRect();
		let tmpScaleX = tmpSVGRect.width / tmpFlowWidth;
		let tmpScaleY = tmpSVGRect.height / tmpFlowHeight;
		let tmpZoom = Math.min(tmpScaleX, tmpScaleY, 1.0); // Don't zoom in past 1.0
		tmpZoom = Math.max(this.options.MinZoom, Math.min(this.options.MaxZoom, tmpZoom));

		let tmpCenterX = (tmpMinX + tmpMaxX) / 2;
		let tmpCenterY = (tmpMinY + tmpMaxY) / 2;

		this._FlowData.ViewState.Zoom = tmpZoom;
		this._FlowData.ViewState.PanX = (tmpSVGRect.width / 2) - (tmpCenterX * tmpZoom);
		this._FlowData.ViewState.PanY = (tmpSVGRect.height / 2) - (tmpCenterY * tmpZoom);

		this.updateViewportTransform();
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

		let tmpX, tmpY;

		switch (tmpPort.Side)
		{
			case 'left':
			{
				// Distribute ports in the body area below the title bar
				let tmpBodyHeight = tmpNode.Height - tmpTitleBarHeight;
				tmpX = tmpNode.X;
				tmpY = tmpNode.Y + tmpTitleBarHeight + ((tmpPortIndex + 1) / (tmpPortCount + 1)) * tmpBodyHeight;
				break;
			}
			case 'right':
			{
				let tmpBodyHeight = tmpNode.Height - tmpTitleBarHeight;
				tmpX = tmpNode.X + tmpNode.Width;
				tmpY = tmpNode.Y + tmpTitleBarHeight + ((tmpPortIndex + 1) / (tmpPortCount + 1)) * tmpBodyHeight;
				break;
			}
			case 'top':
				tmpX = tmpNode.X + ((tmpPortIndex + 1) / (tmpPortCount + 1)) * tmpNode.Width;
				tmpY = tmpNode.Y;
				break;
			case 'bottom':
				tmpX = tmpNode.X + ((tmpPortIndex + 1) / (tmpPortCount + 1)) * tmpNode.Width;
				tmpY = tmpNode.Y + tmpNode.Height;
				break;
			default:
				tmpX = tmpNode.X + tmpNode.Width;
				tmpY = tmpNode.Y + tmpNode.Height / 2;
				break;
		}

		return { x: tmpX, y: tmpY, side: tmpPort.Side || 'right' };
	}

	/**
	 * Convert screen coordinates to SVG viewport coordinates
	 * @param {number} pScreenX
	 * @param {number} pScreenY
	 * @returns {{x: number, y: number}}
	 */
	screenToSVGCoords(pScreenX, pScreenY)
	{
		if (!this._SVGElement)
		{
			return { x: pScreenX, y: pScreenY };
		}

		let tmpPoint = this._SVGElement.createSVGPoint();
		tmpPoint.x = pScreenX;
		tmpPoint.y = pScreenY;

		let tmpCTM = this._SVGElement.getScreenCTM();
		if (tmpCTM)
		{
			let tmpInverse = tmpCTM.inverse();
			let tmpTransformed = tmpPoint.matrixTransform(tmpInverse);
			// Account for viewport pan/zoom
			let tmpVS = this._FlowData.ViewState;
			return {
				x: (tmpTransformed.x - tmpVS.PanX) / tmpVS.Zoom,
				y: (tmpTransformed.y - tmpVS.PanY) / tmpVS.Zoom
			};
		}

		return { x: pScreenX, y: pScreenY };
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

		// Update the node's SVG group transform for smooth dragging
		let tmpNodeGroup = this._NodesLayer.querySelector(`[data-node-hash="${pNodeHash}"]`);
		if (tmpNodeGroup)
		{
			tmpNodeGroup.setAttribute('transform', `translate(${pX}, ${pY})`);
		}

		// Re-render connections that involve this node
		this._renderConnectionsForNode(pNodeHash);
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
}

module.exports = PictViewFlow;

module.exports.default_configuration = _DefaultConfiguration;
