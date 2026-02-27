const libPictView = require('pict-view');

const _DefaultConfiguration =
{
	ViewIdentifier: 'Flow-PropertiesPanel',

	AutoRender: false
};

/**
 * PictView-Flow-PropertiesPanel
 *
 * Renders and manages all open properties panels on the flow graph.
 * Panels are SVG foreignObject elements containing HTML, placed inside
 * the viewport group so they zoom/pan with the graph.
 *
 * Responsibilities:
 *   - Reconcile DOM (add new panels, remove closed ones, update positions)
 *   - Render tether lines from each panel to its node
 *   - Manage panel instance cache (PictFlowCardPropertiesPanel subclasses)
 *   - Isolate HTML events from SVG interactions
 */
class PictViewFlowPropertiesPanel extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultConfiguration)), pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'PictViewFlowPropertiesPanel';

		this._FlowView = null;

		// Cache of active panel instances: Map<panelHash, PictFlowCardPropertiesPanel>
		this._PanelInstances = {};
	}

	/**
	 * Render all open panels and their tethers.
	 *
	 * Uses DOM reconciliation for panels (to preserve live HTML state)
	 * and clear-and-rebuild for tethers (trivial SVG lines).
	 *
	 * @param {Array} pOpenPanels - Array of panel data objects from _FlowData.OpenPanels
	 * @param {SVGGElement} pPanelsLayer - The SVG <g> for panel foreignObjects
	 * @param {SVGGElement} pTethersLayer - The SVG <g> for tether lines
	 */
	renderPanels(pOpenPanels, pPanelsLayer, pTethersLayer)
	{
		if (!pPanelsLayer || !pTethersLayer) return;
		if (!this._FlowView) return;

		let tmpOpenPanels = Array.isArray(pOpenPanels) ? pOpenPanels : [];

		// --- Reconcile panels layer (add new, remove closed, update positions) ---
		let tmpExistingPanelHashes = new Set();
		let tmpExistingForeignObjects = pPanelsLayer.querySelectorAll('.pict-flow-panel-foreign-object');
		for (let i = 0; i < tmpExistingForeignObjects.length; i++)
		{
			tmpExistingPanelHashes.add(tmpExistingForeignObjects[i].getAttribute('data-panel-hash'));
		}

		let tmpDesiredPanelHashes = new Set();
		for (let i = 0; i < tmpOpenPanels.length; i++)
		{
			tmpDesiredPanelHashes.add(tmpOpenPanels[i].Hash);
		}

		// Remove panels that are no longer open
		for (let i = 0; i < tmpExistingForeignObjects.length; i++)
		{
			let tmpHash = tmpExistingForeignObjects[i].getAttribute('data-panel-hash');
			if (!tmpDesiredPanelHashes.has(tmpHash))
			{
				tmpExistingForeignObjects[i].remove();
				// Destroy cached instance
				if (this._PanelInstances[tmpHash])
				{
					this._PanelInstances[tmpHash].destroy();
					delete this._PanelInstances[tmpHash];
				}
			}
		}

		// Add or update panels
		for (let i = 0; i < tmpOpenPanels.length; i++)
		{
			let tmpPanelData = tmpOpenPanels[i];

			if (tmpExistingPanelHashes.has(tmpPanelData.Hash))
			{
				// Update position of existing panel
				let tmpFO = pPanelsLayer.querySelector(`[data-panel-hash="${tmpPanelData.Hash}"]`);
				if (tmpFO)
				{
					tmpFO.setAttribute('x', String(tmpPanelData.X));
					tmpFO.setAttribute('y', String(tmpPanelData.Y));
					tmpFO.setAttribute('width', String(tmpPanelData.Width));
					tmpFO.setAttribute('height', String(tmpPanelData.Height));
				}
			}
			else
			{
				// Create new panel
				this._createPanelForeignObject(tmpPanelData, pPanelsLayer);
			}
		}

		// --- Clear and rebuild tethers ---
		while (pTethersLayer.firstChild)
		{
			pTethersLayer.removeChild(pTethersLayer.firstChild);
		}

		for (let i = 0; i < tmpOpenPanels.length; i++)
		{
			this._renderTether(tmpOpenPanels[i], pTethersLayer);
		}
	}

	/**
	 * Create a foreignObject containing the panel chrome and content.
	 *
	 * @param {Object} pPanelData - Panel data from OpenPanels
	 * @param {SVGGElement} pPanelsLayer
	 */
	_createPanelForeignObject(pPanelData, pPanelsLayer)
	{
		let tmpFO = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
		tmpFO.setAttribute('class', 'pict-flow-panel-foreign-object');
		tmpFO.setAttribute('data-panel-hash', pPanelData.Hash);
		tmpFO.setAttribute('data-node-hash', pPanelData.NodeHash);
		tmpFO.setAttribute('x', String(pPanelData.X));
		tmpFO.setAttribute('y', String(pPanelData.Y));
		tmpFO.setAttribute('width', String(pPanelData.Width));
		tmpFO.setAttribute('height', String(pPanelData.Height));

		// Build HTML chrome
		let tmpPanelDiv = document.createElement('div');
		tmpPanelDiv.setAttribute('class', 'pict-flow-panel');
		tmpPanelDiv.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');

		// Title bar
		let tmpTitleBar = document.createElement('div');
		tmpTitleBar.setAttribute('class', 'pict-flow-panel-titlebar');
		tmpTitleBar.setAttribute('data-element-type', 'panel-titlebar');
		tmpTitleBar.setAttribute('data-panel-hash', pPanelData.Hash);

		let tmpTitleText = document.createElement('span');
		tmpTitleText.setAttribute('class', 'pict-flow-panel-title-text');
		tmpTitleText.textContent = pPanelData.Title || 'Properties';
		tmpTitleBar.appendChild(tmpTitleText);

		let tmpCloseBtn = document.createElement('span');
		tmpCloseBtn.setAttribute('class', 'pict-flow-panel-close-btn');
		tmpCloseBtn.setAttribute('data-element-type', 'panel-close');
		tmpCloseBtn.setAttribute('data-panel-hash', pPanelData.Hash);
		tmpCloseBtn.textContent = '\u2715';
		tmpTitleBar.appendChild(tmpCloseBtn);

		tmpPanelDiv.appendChild(tmpTitleBar);

		// Body (content container)
		let tmpBody = document.createElement('div');
		tmpBody.setAttribute('class', 'pict-flow-panel-body');
		tmpBody.setAttribute('data-panel-hash', pPanelData.Hash);

		// Stop event propagation so SVG interactions don't fire
		tmpBody.addEventListener('pointerdown', (pEvent) => { pEvent.stopPropagation(); });
		tmpBody.addEventListener('wheel', (pEvent) => { pEvent.stopPropagation(); });

		tmpPanelDiv.appendChild(tmpBody);

		tmpFO.appendChild(tmpPanelDiv);
		pPanelsLayer.appendChild(tmpFO);

		// Now render the panel content via the panel type implementation
		this._renderPanelContent(pPanelData, tmpBody);
	}

	/**
	 * Instantiate (or reuse) the panel type implementation and render into the body container.
	 *
	 * @param {Object} pPanelData
	 * @param {HTMLDivElement} pBodyContainer
	 */
	_renderPanelContent(pPanelData, pBodyContainer)
	{
		let tmpNodeData = this._FlowView.getNode(pPanelData.NodeHash);
		if (!tmpNodeData) return;

		let tmpNodeTypeConfig = this._FlowView._NodeTypeProvider.getNodeType(tmpNodeData.Type);
		if (!tmpNodeTypeConfig || !tmpNodeTypeConfig.PropertiesPanel) return;

		let tmpPanelConfig = tmpNodeTypeConfig.PropertiesPanel;
		let tmpPanelType = tmpPanelConfig.PanelType || 'Base';

		// Try to get a registered panel type service
		let tmpServiceName = `PictFlowCardPropertiesPanel-${tmpPanelType}`;
		let tmpInstance = null;

		if (this._PanelInstances[pPanelData.Hash])
		{
			// Reuse existing instance
			tmpInstance = this._PanelInstances[pPanelData.Hash];
		}
		else
		{
			// Create a new instance
			if (this.fable.servicesMap.hasOwnProperty(tmpServiceName))
			{
				tmpInstance = this.fable.instantiateServiceProviderWithoutRegistration(tmpServiceName, tmpPanelConfig);
			}
			else if (this.fable.servicesMap.hasOwnProperty('PictFlowCardPropertiesPanel'))
			{
				// Fall back to base class
				tmpInstance = this.fable.instantiateServiceProviderWithoutRegistration('PictFlowCardPropertiesPanel', tmpPanelConfig);
			}

			if (tmpInstance)
			{
				tmpInstance._FlowView = this._FlowView;
				this._PanelInstances[pPanelData.Hash] = tmpInstance;
			}
		}

		if (tmpInstance)
		{
			tmpInstance.render(pBodyContainer, tmpNodeData);
		}
	}

	/**
	 * Render a tether line from a panel to its node.
	 *
	 * @param {Object} pPanelData
	 * @param {SVGGElement} pTethersLayer
	 */
	_renderTether(pPanelData, pTethersLayer)
	{
		let tmpNodeData = this._FlowView.getNode(pPanelData.NodeHash);
		if (!tmpNodeData) return;

		// Panel anchor: center of left edge
		let tmpPanelX = pPanelData.X;
		let tmpPanelY = pPanelData.Y + pPanelData.Height / 2;

		// Node anchor: center of right edge by default, but flip if panel is to the left
		let tmpNodeCenterX = tmpNodeData.X + tmpNodeData.Width / 2;
		let tmpNodeCenterY = tmpNodeData.Y + tmpNodeData.Height / 2;

		let tmpNodeAnchorX, tmpNodeAnchorY;
		let tmpPanelAnchorX, tmpPanelAnchorY;

		if (pPanelData.X > tmpNodeCenterX)
		{
			// Panel is to the right of node
			tmpNodeAnchorX = tmpNodeData.X + tmpNodeData.Width;
			tmpNodeAnchorY = tmpNodeCenterY;
			tmpPanelAnchorX = pPanelData.X;
			tmpPanelAnchorY = pPanelData.Y + pPanelData.Height / 2;
		}
		else
		{
			// Panel is to the left of node
			tmpNodeAnchorX = tmpNodeData.X;
			tmpNodeAnchorY = tmpNodeCenterY;
			tmpPanelAnchorX = pPanelData.X + pPanelData.Width;
			tmpPanelAnchorY = pPanelData.Y + pPanelData.Height / 2;
		}

		let tmpViewIdentifier = this._FlowView.options.ViewIdentifier;
		let tmpLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		tmpLine.setAttribute('class', 'pict-flow-tether-line');
		tmpLine.setAttribute('x1', String(tmpPanelAnchorX));
		tmpLine.setAttribute('y1', String(tmpPanelAnchorY));
		tmpLine.setAttribute('x2', String(tmpNodeAnchorX));
		tmpLine.setAttribute('y2', String(tmpNodeAnchorY));
		tmpLine.setAttribute('marker-end', `url(#flow-tether-arrowhead-${tmpViewIdentifier})`);
		tmpLine.setAttribute('data-panel-hash', pPanelData.Hash);
		pTethersLayer.appendChild(tmpLine);
	}

	/**
	 * Marshal data from all open panels back into their node Data objects.
	 */
	marshalAllFromPanels()
	{
		for (let tmpPanelHash in this._PanelInstances)
		{
			let tmpInstance = this._PanelInstances[tmpPanelHash];
			if (tmpInstance && tmpInstance._NodeData)
			{
				tmpInstance.marshalFromPanel(tmpInstance._NodeData);
			}
		}
	}

	/**
	 * Destroy a specific panel instance and clean up.
	 *
	 * @param {string} pPanelHash
	 */
	destroyPanel(pPanelHash)
	{
		if (this._PanelInstances[pPanelHash])
		{
			this._PanelInstances[pPanelHash].destroy();
			delete this._PanelInstances[pPanelHash];
		}
	}

	/**
	 * Destroy all panel instances.
	 */
	destroyAllPanels()
	{
		for (let tmpPanelHash in this._PanelInstances)
		{
			this._PanelInstances[tmpPanelHash].destroy();
		}
		this._PanelInstances = {};
	}
}

module.exports = PictViewFlowPropertiesPanel;

module.exports.default_configuration = _DefaultConfiguration;
