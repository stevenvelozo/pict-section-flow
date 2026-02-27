const libPictView = require('pict-view');

const _DefaultConfiguration =
{
	ViewIdentifier: 'Flow-PropertiesPanel',

	AutoRender: false,

	Templates:
	[
		{
			Hash: 'Flow-InfoPanel-Wrapper',
			Template: '<div class="pict-flow-info-panel">{~D:Record.PanelContent~}</div>'
		},
		{
			Hash: 'Flow-InfoPanel-Header-Icon',
			Template: '<div class="pict-flow-info-panel-header with-icon">{~D:Record.Icon~} {~D:Record.Label~}</div>'
		},
		{
			Hash: 'Flow-InfoPanel-Header',
			Template: '<div class="pict-flow-info-panel-header">{~D:Record.Label~}</div>'
		},
		{
			Hash: 'Flow-InfoPanel-Description',
			Template: '<div class="pict-flow-info-panel-description">{~D:Record.Description~}</div>'
		},
		{
			Hash: 'Flow-InfoPanel-Badges',
			Template: '<div class="pict-flow-info-panel-badges">{~D:Record.BadgesContent~}</div>'
		},
		{
			Hash: 'Flow-InfoPanel-Badge-Category',
			Template: '<span class="pict-flow-info-panel-badge category">{~D:Record.Category~}</span>'
		},
		{
			Hash: 'Flow-InfoPanel-Badge-Code',
			Template: '<span class="pict-flow-info-panel-badge code">{~D:Record.Code~}</span>'
		},
		{
			Hash: 'Flow-InfoPanel-Section-Inputs',
			Template: '<div class="pict-flow-info-panel-section"><div class="pict-flow-info-panel-section-title">Inputs</div>{~D:Record.PortsContent~}</div>'
		},
		{
			Hash: 'Flow-InfoPanel-Section-Outputs',
			Template: '<div class="pict-flow-info-panel-section"><div class="pict-flow-info-panel-section-title">Outputs</div>{~D:Record.PortsContent~}</div>'
		},
		{
			Hash: 'Flow-InfoPanel-Port-Input',
			Template: '<div class="pict-flow-info-panel-port input">{~D:Record.Label~}{~D:Record.Constraint~}</div>'
		},
		{
			Hash: 'Flow-InfoPanel-Port-Output',
			Template: '<div class="pict-flow-info-panel-port output">{~D:Record.Label~}</div>'
		},
		{
			Hash: 'Flow-InfoPanel-Port-Constraint',
			Template: ' <span class="pict-flow-info-panel-port-constraint">{~D:Record.ConstraintText~}</span>'
		}
	]
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
	 * @param {string|null} pSelectedTetherHash - Hash of the selected tether's panel, or null
	 */
	renderPanels(pOpenPanels, pPanelsLayer, pTethersLayer, pSelectedTetherHash)
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
			let tmpIsSelected = (pSelectedTetherHash === tmpOpenPanels[i].Hash);
			this._renderTether(tmpOpenPanels[i], pTethersLayer, tmpIsSelected);
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
		if (!tmpNodeTypeConfig) return;

		// If no PropertiesPanel is configured, render the auto-generated info panel
		if (!tmpNodeTypeConfig.PropertiesPanel)
		{
			this._renderInfoPanelContent(pBodyContainer, tmpNodeData, tmpNodeTypeConfig);
			return;
		}

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
	 * Render an auto-generated info panel for nodes without a configured PropertiesPanel.
	 * Shows the node type, description, and a summary of input/output ports with
	 * their connection constraints.
	 *
	 * Uses configuration-based templates from _DefaultConfiguration.Templates
	 * rendered via pict.parseTemplateByHash().
	 *
	 * @param {HTMLDivElement} pContainer
	 * @param {Object} pNodeData
	 * @param {Object} pNodeTypeConfig
	 */
	_renderInfoPanelContent(pContainer, pNodeData, pNodeTypeConfig)
	{
		let tmpMeta = pNodeTypeConfig.CardMetadata || {};
		let tmpPorts = pNodeTypeConfig.DefaultPorts || [];

		let tmpInputs = tmpPorts.filter((pPort) => pPort.Direction === 'input');
		let tmpOutputs = tmpPorts.filter((pPort) => pPort.Direction === 'output');

		let tmpLabel = pNodeTypeConfig.Label || pNodeData.Type;

		// Build content by rendering configuration-based templates
		let tmpContentParts = [];

		// Header
		if (tmpMeta.Icon)
		{
			tmpContentParts.push(this.pict.parseTemplateByHash('Flow-InfoPanel-Header-Icon', { Icon: tmpMeta.Icon, Label: tmpLabel }));
		}
		else
		{
			tmpContentParts.push(this.pict.parseTemplateByHash('Flow-InfoPanel-Header', { Label: tmpLabel }));
		}

		// Description
		if (tmpMeta.Description)
		{
			tmpContentParts.push(this.pict.parseTemplateByHash('Flow-InfoPanel-Description', { Description: tmpMeta.Description }));
		}

		// Category + Code badges
		if (tmpMeta.Category || tmpMeta.Code)
		{
			let tmpBadgesContent = '';
			if (tmpMeta.Category)
			{
				tmpBadgesContent += this.pict.parseTemplateByHash('Flow-InfoPanel-Badge-Category', { Category: tmpMeta.Category });
			}
			if (tmpMeta.Code)
			{
				tmpBadgesContent += this.pict.parseTemplateByHash('Flow-InfoPanel-Badge-Code', { Code: tmpMeta.Code });
			}
			tmpContentParts.push(this.pict.parseTemplateByHash('Flow-InfoPanel-Badges', { BadgesContent: tmpBadgesContent }));
		}

		// Inputs
		if (tmpInputs.length > 0)
		{
			let tmpPortsContent = '';
			for (let i = 0; i < tmpInputs.length; i++)
			{
				let tmpPort = tmpInputs[i];
				let tmpConstraint = this._getPortConstraintHTML(tmpPort);
				tmpPortsContent += this.pict.parseTemplateByHash('Flow-InfoPanel-Port-Input', { Label: tmpPort.Label || 'In', Constraint: tmpConstraint });
			}
			tmpContentParts.push(this.pict.parseTemplateByHash('Flow-InfoPanel-Section-Inputs', { PortsContent: tmpPortsContent }));
		}

		// Outputs
		if (tmpOutputs.length > 0)
		{
			let tmpPortsContent = '';
			for (let i = 0; i < tmpOutputs.length; i++)
			{
				let tmpPort = tmpOutputs[i];
				tmpPortsContent += this.pict.parseTemplateByHash('Flow-InfoPanel-Port-Output', { Label: tmpPort.Label || 'Out' });
			}
			tmpContentParts.push(this.pict.parseTemplateByHash('Flow-InfoPanel-Section-Outputs', { PortsContent: tmpPortsContent }));
		}

		pContainer.innerHTML = this.pict.parseTemplateByHash('Flow-InfoPanel-Wrapper', { PanelContent: tmpContentParts.join('') });
	}

	/**
	 * Build the constraint markup for a port using configuration templates.
	 *
	 * @param {Object} pPort
	 * @returns {string} Rendered constraint HTML or empty string
	 */
	_getPortConstraintHTML(pPort)
	{
		let tmpMin = (typeof pPort.MinimumInputCount === 'number') ? pPort.MinimumInputCount : 0;
		let tmpMax = (typeof pPort.MaximumInputCount === 'number') ? pPort.MaximumInputCount : -1;

		if (tmpMin > 0 || tmpMax > 0)
		{
			let tmpConstraintText = '';
			if (tmpMax < 0)
			{
				tmpConstraintText = `(min ${tmpMin})`;
			}
			else if (tmpMin === tmpMax)
			{
				tmpConstraintText = `(exactly ${tmpMin})`;
			}
			else
			{
				tmpConstraintText = `(${tmpMin}\u2013${tmpMax})`;
			}
			return this.pict.parseTemplateByHash('Flow-InfoPanel-Port-Constraint', { ConstraintText: tmpConstraintText });
		}
		return '';
	}

	/**
	 * Render a tether from a panel to its node.
	 * Delegates to the TetherService for geometry, path generation, and SVG element creation.
	 *
	 * @param {Object} pPanelData
	 * @param {SVGGElement} pTethersLayer
	 * @param {boolean} pIsSelected
	 */
	_renderTether(pPanelData, pTethersLayer, pIsSelected)
	{
		let tmpTetherService = this._FlowView._TetherService;
		if (!tmpTetherService) return;

		let tmpNodeData = this._FlowView.getNode(pPanelData.NodeHash);
		if (!tmpNodeData) return;

		let tmpViewIdentifier = this._FlowView.options.ViewIdentifier;
		tmpTetherService.renderTether(pPanelData, tmpNodeData, pTethersLayer, pIsSelected, tmpViewIdentifier);
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
