const libPictView = require('pict-view');

const libPictServiceFlowInteractionManager = require('../services/PictService-Flow-InteractionManager.js');
const libPictServiceFlowConnectionRenderer = require('../services/PictService-Flow-ConnectionRenderer.js');
const libPictServiceFlowTether = require('../services/PictService-Flow-Tether.js');
const libPictServiceFlowLayout = require('../services/PictService-Flow-Layout.js');
const libPictServiceFlowPathGenerator = require('../services/PictService-Flow-PathGenerator.js');
const libPictServiceFlowViewportManager = require('../services/PictService-Flow-ViewportManager.js');
const libPictServiceFlowSelectionManager = require('../services/PictService-Flow-SelectionManager.js');
const libPictServiceFlowPanelManager = require('../services/PictService-Flow-PanelManager.js');
const libPictServiceFlowDataManager = require('../services/PictService-Flow-DataManager.js');
const libPictServiceFlowConnectionHandleManager = require('../services/PictService-Flow-ConnectionHandleManager.js');
const libPictServiceFlowRenderManager = require('../services/PictService-Flow-RenderManager.js');
const libPictServiceFlowPortRenderer = require('../services/PictService-Flow-PortRenderer.js');

const libPictProviderFlowNodeTypes = require('../providers/PictProvider-Flow-NodeTypes.js');
const libPictProviderFlowEventHandler = require('../providers/PictProvider-Flow-EventHandler.js');
const libPictProviderFlowLayouts = require('../providers/PictProvider-Flow-Layouts.js');
const libPictProviderFlowSVGHelpers = require('../providers/PictProvider-Flow-SVGHelpers.js');
const libPictProviderFlowGeometry = require('../providers/PictProvider-Flow-Geometry.js');
const libPictProviderFlowPanelChrome = require('../providers/PictProvider-Flow-PanelChrome.js');
const libPictProviderFlowCSS = require('../providers/PictProvider-Flow-CSS.js');
const libPictProviderFlowIcons = require('../providers/PictProvider-Flow-Icons.js');
const libPictProviderFlowConnectorShapes = require('../providers/PictProvider-Flow-ConnectorShapes.js');
const libPictProviderFlowTheme = require('../providers/PictProvider-Flow-Theme.js');
const libPictProviderFlowNoise = require('../providers/PictProvider-Flow-Noise.js');

const libPictViewFlowNode = require('./PictView-Flow-Node.js');
const libPictViewFlowToolbar = require('./PictView-Flow-Toolbar.js');
const libPictViewFlowFloatingToolbar = require('./PictView-Flow-FloatingToolbar.js');
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

	CSS: false,

	Templates:
	[
		{
			Hash: 'Flow-PanelChrome-Template',
			Template: /*html*/`<div class="pict-flow-panel" xmlns="http://www.w3.org/1999/xhtml"><div class="pict-flow-panel-titlebar" data-element-type="panel-titlebar" data-panel-hash="{~D:Record.Hash~}"><span class="pict-flow-panel-title-text">{~D:Record.Title~}</span><span class="pict-flow-panel-close-btn" data-element-type="panel-close" data-panel-hash="{~D:Record.Hash~}"><span class="pict-flow-panel-close-icon"></span></span></div><div class="pict-flow-panel-content" data-panel-hash="{~D:Record.Hash~}"><div class="pict-flow-panel-tab-pane active" data-tab="properties" data-panel-hash="{~D:Record.Hash~}"></div><div class="pict-flow-panel-tab-pane" data-tab="help" data-panel-hash="{~D:Record.Hash~}" style="display:none;"></div><div class="pict-flow-panel-tab-pane" data-tab="appearance" data-panel-hash="{~D:Record.Hash~}" style="display:none;"></div></div><div class="pict-flow-panel-resize-handle" data-element-type="panel-resize" data-panel-hash="{~D:Record.Hash~}"></div><div class="pict-flow-panel-tabbar" data-panel-hash="{~D:Record.Hash~}"><div class="pict-flow-panel-tab active" data-tab-target="properties" data-panel-hash="{~D:Record.Hash~}">Properties</div><div class="pict-flow-panel-tab" data-tab-target="help" data-panel-hash="{~D:Record.Hash~}" style="display:none;">Help</div><div class="pict-flow-panel-tab" data-tab-target="appearance" data-panel-hash="{~D:Record.Hash~}">Appearance</div></div></div>`
		},
		{
			Hash: 'Flow-Container-Template',
			Template: /*html*/`
<div class="pict-flow-container" id="Flow-Wrapper-{~D:Record.ViewIdentifier~}">
	<div id="Flow-Toolbar-{~D:Record.ViewIdentifier~}"></div>
	<div id="Flow-FloatingToolbar-Container-{~D:Record.ViewIdentifier~}" style="display:none;position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:100;"></div>
	<div class="pict-flow-svg-container" id="Flow-SVG-Container-{~D:Record.ViewIdentifier~}">
		<svg class="pict-flow-svg"
			id="Flow-SVG-{~D:Record.ViewIdentifier~}"
			xmlns="http://www.w3.org/2000/svg">
			<defs>
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

		// ---- Declarative service registry ----
		// Each entry defines a service to register, instantiate, and guard.
		// Optional flags:
		//   NoFlowView  — instantiate without { FlowView: this }
		//   PostInit    — method name to call on the instance after creation
		//   RegisterOnly — only register the type; do not bulk-instantiate
		this._ServiceRegistry =
		[
			// Providers (stateless or config-only — no FlowView needed)
			{ ServiceType: 'PictProviderFlowSVGHelpers',   Library: libPictProviderFlowSVGHelpers,   Property: '_SVGHelperProvider',    NoFlowView: true },
			{ ServiceType: 'PictProviderFlowGeometry',      Library: libPictProviderFlowGeometry,      Property: '_GeometryProvider',     NoFlowView: true },
			{ ServiceType: 'PictProviderFlowNoise',         Library: libPictProviderFlowNoise,         Property: '_NoiseProvider',        NoFlowView: true },

			// Providers (need FlowView)
			{ ServiceType: 'PictProviderFlowTheme',         Library: libPictProviderFlowTheme,         Property: '_ThemeProvider' },
			{ ServiceType: 'PictProviderFlowCSS',           Library: libPictProviderFlowCSS,           Property: '_CSSProvider',          PostInit: 'registerCSS' },
			{ ServiceType: 'PictProviderFlowIcons',         Library: libPictProviderFlowIcons,         Property: '_IconProvider',         PostInit: 'registerIconTemplates' },
			{ ServiceType: 'PictProviderFlowConnectorShapes', Library: libPictProviderFlowConnectorShapes, Property: '_ConnectorShapesProvider' },
			{ ServiceType: 'PictProviderFlowPanelChrome',   Library: libPictProviderFlowPanelChrome,   Property: '_PanelChromeProvider' },
			{ ServiceType: 'PictProviderFlowNodeTypes',     Library: libPictProviderFlowNodeTypes,     Property: '_NodeTypeProvider',   ExtraOptions: () => ({ AdditionalNodeTypes: this.options.NodeTypes }) },
			{ ServiceType: 'PictProviderFlowEventHandler',  Library: libPictProviderFlowEventHandler,  Property: '_EventHandlerProvider' },
			{ ServiceType: 'PictProviderFlowLayouts',       Library: libPictProviderFlowLayouts,       Property: '_LayoutProvider',       PostInit: 'loadPersistedLayouts' },

			// Services
			{ ServiceType: 'PictServiceFlowPathGenerator',           Library: libPictServiceFlowPathGenerator,           Property: '_PathGenerator' },
			{ ServiceType: 'PictServiceFlowDataManager',             Library: libPictServiceFlowDataManager,             Property: '_DataManager' },
			{ ServiceType: 'PictServiceFlowConnectionHandleManager', Library: libPictServiceFlowConnectionHandleManager, Property: '_ConnectionHandleManager' },
			{ ServiceType: 'PictServiceFlowRenderManager',           Library: libPictServiceFlowRenderManager,           Property: '_RenderManager' },
			{ ServiceType: 'PictServiceFlowPortRenderer',            Library: libPictServiceFlowPortRenderer,            Property: '_PortRenderer' },
			{ ServiceType: 'PictServiceFlowInteractionManager',      Library: libPictServiceFlowInteractionManager,      Property: '_InteractionManager' },
			{ ServiceType: 'PictServiceFlowConnectionRenderer',      Library: libPictServiceFlowConnectionRenderer,      Property: '_ConnectionRenderer' },
			{ ServiceType: 'PictServiceFlowTether',                  Library: libPictServiceFlowTether,                  Property: '_TetherService' },
			{ ServiceType: 'PictServiceFlowLayout',                  Library: libPictServiceFlowLayout,                  Property: '_LayoutService' },
			{ ServiceType: 'PictServiceFlowViewportManager',         Library: libPictServiceFlowViewportManager,         Property: '_ViewportManager' },
			{ ServiceType: 'PictServiceFlowSelectionManager',        Library: libPictServiceFlowSelectionManager,        Property: '_SelectionManager' },
			{ ServiceType: 'PictServiceFlowPanelManager',            Library: libPictServiceFlowPanelManager,            Property: '_PanelManager' },

			// View types (register only — instantiated with custom config in onAfterInitialRender)
			{ ServiceType: 'PictViewFlowNode',             Library: libPictViewFlowNode,             RegisterOnly: true },
			{ ServiceType: 'PictViewFlowToolbar',          Library: libPictViewFlowToolbar,          RegisterOnly: true },
			{ ServiceType: 'PictViewFlowFloatingToolbar',  Library: libPictViewFlowFloatingToolbar,  RegisterOnly: true },
			{ ServiceType: 'PictViewFlowPropertiesPanel',  Library: libPictViewFlowPropertiesPanel,  RegisterOnly: true },

			// Panel types (register only)
			{ ServiceType: 'PictFlowCardPropertiesPanel',           Library: libPictFlowCardPropertiesPanel,  RegisterOnly: true },
			{ ServiceType: 'PictFlowCardPropertiesPanel-Template',  Library: libPanelTemplate,               RegisterOnly: true },
			{ ServiceType: 'PictFlowCardPropertiesPanel-Markdown',  Library: libPanelMarkdown,               RegisterOnly: true },
			{ ServiceType: 'PictFlowCardPropertiesPanel-Form',      Library: libPanelForm,                   RegisterOnly: true },
			{ ServiceType: 'PictFlowCardPropertiesPanel-View',      Library: libPanelView,                   RegisterOnly: true }
		];

		this._registerServiceTypes();

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

		this._DataManager = null;
		this._ConnectionHandleManager = null;
		this._RenderManager = null;
		this._PortRenderer = null;

		this._InteractionManager = null;
		this._ConnectionRenderer = null;
		this._TetherService = null;
		this._LayoutService = null;
		this._PathGenerator = null;
		this._ViewportManager = null;
		this._SelectionManager = null;
		this._PanelManager = null;
		this._CSSProvider = null;
		this._IconProvider = null;
		this._ConnectorShapesProvider = null;
		this._ThemeProvider = null;
		this._NoiseProvider = null;
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

	_registerServiceTypes()
	{
		for (let i = 0; i < this._ServiceRegistry.length; i++)
		{
			let tmpEntry = this._ServiceRegistry[i];
			if (!this.fable.servicesMap.hasOwnProperty(tmpEntry.ServiceType))
			{
				this.fable.addServiceType(tmpEntry.ServiceType, tmpEntry.Library);
			}
		}
	}

	_instantiateServices()
	{
		for (let i = 0; i < this._ServiceRegistry.length; i++)
		{
			let tmpEntry = this._ServiceRegistry[i];
			if (tmpEntry.RegisterOnly) continue;
			if (this[tmpEntry.Property]) continue;

			let tmpOptions = tmpEntry.NoFlowView ? {} : { FlowView: this };
			if (typeof tmpEntry.ExtraOptions === 'function')
			{
				Object.assign(tmpOptions, tmpEntry.ExtraOptions());
			}

			this[tmpEntry.Property] = this.fable.instantiateServiceProviderWithoutRegistration(tmpEntry.ServiceType, tmpOptions);

			if (tmpEntry.PostInit && typeof this[tmpEntry.Property][tmpEntry.PostInit] === 'function')
			{
				this[tmpEntry.Property][tmpEntry.PostInit]();
			}
		}
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

		// Theme + Noise must be created first (CSS PostInit depends on theme state)
		this._ThemeProvider = this.fable.instantiateServiceProviderWithoutRegistration('PictProviderFlowTheme', { FlowView: this });
		this._NoiseProvider = this.fable.instantiateServiceProviderWithoutRegistration('PictProviderFlowNoise');

		// Apply initial theme from options
		if (this.options.Theme)
		{
			this._ThemeProvider.setTheme(this.options.Theme);
		}
		if (typeof this.options.NoiseLevel === 'number')
		{
			this._ThemeProvider.setNoiseLevel(this.options.NoiseLevel);
		}

		// Instantiate all remaining services (skips Theme + Noise since already set)
		this._instantiateServices();

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

		// Ensure all services are initialized (fallback if onBeforeInitialize was skipped)
		this._instantiateServices();

		// Inject marker defs via the connector shapes provider
		// Note: insertAdjacentHTML does not work on SVG elements (wrong namespace),
		// so we parse via a temporary <svg> element to ensure SVG namespace.
		if (this._ConnectorShapesProvider && this._SVGElement)
		{
			let tmpDefs = this._SVGElement.querySelector('defs');
			if (tmpDefs)
			{
				let tmpMarkerMarkup = this._ConnectorShapesProvider.generateMarkerDefs(tmpViewIdentifier);
				let tmpTempSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				tmpTempSVG.innerHTML = tmpMarkerMarkup;
				while (tmpTempSVG.firstChild)
				{
					tmpDefs.appendChild(tmpTempSVG.firstChild);
				}
			}
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

	// ---- Data Manager Delegations ----

	marshalToView() { return this._DataManager.marshalToView(); }
	marshalFromView() { return this._DataManager.marshalFromView(); }
	getFlowData() { return this._DataManager.getFlowData(); }
	setFlowData(pFlowData) { return this._DataManager.setFlowData(pFlowData); }
	addNode(pType, pX, pY, pTitle, pData) { return this._DataManager.addNode(pType, pX, pY, pTitle, pData); }
	removeNode(pNodeHash) { return this._DataManager.removeNode(pNodeHash); }
	addConnection(pSourceNodeHash, pSourcePortHash, pTargetNodeHash, pTargetPortHash, pData) { return this._DataManager.addConnection(pSourceNodeHash, pSourcePortHash, pTargetNodeHash, pTargetPortHash, pData); }
	removeConnection(pConnectionHash) { return this._DataManager.removeConnection(pConnectionHash); }

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

	// ── Theme API ────────────────────────────────────────────────────────

	/**
	 * Switch the active theme and re-render.
	 * @param {string} pThemeKey - Theme key (e.g. 'default', 'sketch', 'blueprint', 'mono', 'retro-80s', 'retro-90s')
	 */
	setTheme(pThemeKey)
	{
		if (!this._ThemeProvider)
		{
			this.log.warn('PictSectionFlow setTheme: ThemeProvider not available');
			return;
		}

		let tmpApplied = this._ThemeProvider.setTheme(pThemeKey);
		if (!tmpApplied) return;

		// Re-register CSS with the new theme overrides
		if (this._CSSProvider)
		{
			this._CSSProvider.registerCSS();
		}

		// Re-inject marker defs (arrowhead colors may have changed)
		this._reinjectMarkerDefs();

		// Full re-render
		if (this.initialRenderComplete)
		{
			this.renderFlow();
		}

		if (this._EventHandlerProvider)
		{
			this._EventHandlerProvider.fireEvent('onThemeChanged', pThemeKey);
		}
	}

	/**
	 * Set the noise level (0 to 1) and re-render.
	 * @param {number} pLevel - 0 = precise, 1 = maximum wobble
	 */
	setNoiseLevel(pLevel)
	{
		if (!this._ThemeProvider)
		{
			this.log.warn('PictSectionFlow setNoiseLevel: ThemeProvider not available');
			return;
		}

		this._ThemeProvider.setNoiseLevel(pLevel);

		// Full re-render to apply new noise
		if (this.initialRenderComplete)
		{
			this.renderFlow();
		}
	}

	/**
	 * Get the current noise level (0 to 1).
	 * @returns {number}
	 */
	getNoiseLevel()
	{
		if (this._ThemeProvider)
		{
			return this._ThemeProvider.getNoiseLevel();
		}
		return 0;
	}

	/**
	 * Get the active theme key.
	 * @returns {string}
	 */
	getThemeKey()
	{
		if (this._ThemeProvider)
		{
			return this._ThemeProvider.getActiveThemeKey();
		}
		return 'default';
	}

	_reinjectMarkerDefs() { return this._RenderManager.reinjectMarkerDefs(); }

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

	// ---- Connection Handle Manager Delegations ----

	updateConnectionHandle(pConnectionHash, pHandleType, pX, pY) { return this._ConnectionHandleManager.updateConnectionHandle(pConnectionHash, pHandleType, pX, pY); }
	addConnectionHandle(pConnectionHash, pX, pY) { return this._ConnectionHandleManager.addConnectionHandle(pConnectionHash, pX, pY); }
	removeConnectionHandle(pConnectionHash, pIndex) { return this._ConnectionHandleManager.removeConnectionHandle(pConnectionHash, pIndex); }
	_resetHandlesForNode(pNodeHash) { return this._ConnectionHandleManager.resetHandlesForNode(pNodeHash); }
	_resetHandlesForPanel(pPanelHash) { return this._ConnectionHandleManager.resetHandlesForPanel(pPanelHash); }

	/**
	 * Update a tether handle position during drag (for real-time feedback).
	 * Delegates state update to the TetherService.
	 * @param {string} pPanelHash
	 * @param {string} pHandleType
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

		// Use the adjusted node height that accounts for minimum port
		// spacing.  Connections render before nodes, so the node renderer
		// may not have written back its adjusted height yet.
		let tmpHeight = tmpNode.Height || 80;
		if (this._GeometryProvider && tmpNode.Ports && tmpNode.Ports.length > 0)
		{
			let tmpMinHeight = this._GeometryProvider.computeMinimumNodeHeight(tmpNode.Ports, tmpTitleBarHeight);
			if (tmpMinHeight > tmpHeight)
			{
				tmpHeight = tmpMinHeight;
			}
		}

		// Build port counts map for adaptive zone sizing
		let tmpPortCountsBySide = this._GeometryProvider.buildPortCountsBySide(tmpNode.Ports);

		let tmpLocal = this._GeometryProvider.getPortLocalPosition(tmpPort.Side, tmpPortIndex, tmpPortCount, tmpNode.Width, tmpHeight, tmpTitleBarHeight, tmpPortCountsBySide);

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

	// ---- Render Manager Delegations ----

	renderFlow() { return this._RenderManager.renderFlow(); }
	_renderSingleConnection(pConnectionHash) { return this._RenderManager.renderSingleConnection(pConnectionHash); }
	_renderSingleTether(pPanelHash) { return this._RenderManager.renderSingleTether(pPanelHash); }
	updateNodePosition(pNodeHash, pX, pY) { return this._RenderManager.updateNodePosition(pNodeHash, pX, pY); }
	_renderConnectionsForNode(pNodeHash) { return this._RenderManager.renderConnectionsForNode(pNodeHash); }
	_renderTethersForNode(pNodeHash) { return this._RenderManager.renderTethersForNode(pNodeHash); }

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
