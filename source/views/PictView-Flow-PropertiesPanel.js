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

		let tmpHTML = '<div style="padding:4px;font-size:12px;line-height:1.5;color:#2c3e50">';

		// Header: icon + type label
		let tmpLabel = pNodeTypeConfig.Label || pNodeData.Type;
		if (tmpMeta.Icon)
		{
			tmpHTML += `<div style="font-size:16px;font-weight:600;margin-bottom:4px">${tmpMeta.Icon} ${tmpLabel}</div>`;
		}
		else
		{
			tmpHTML += `<div style="font-size:14px;font-weight:600;margin-bottom:4px">${tmpLabel}</div>`;
		}

		// Description
		if (tmpMeta.Description)
		{
			tmpHTML += `<div style="font-size:11px;color:#7f8c8d;margin-bottom:8px">${tmpMeta.Description}</div>`;
		}

		// Category + Code badge
		if (tmpMeta.Category || tmpMeta.Code)
		{
			tmpHTML += '<div style="margin-bottom:8px">';
			if (tmpMeta.Category)
			{
				tmpHTML += `<span style="display:inline-block;padding:1px 6px;background:#ecf0f1;border-radius:3px;font-size:10px;color:#7f8c8d;margin-right:4px">${tmpMeta.Category}</span>`;
			}
			if (tmpMeta.Code)
			{
				tmpHTML += `<span style="display:inline-block;padding:1px 6px;background:#eaf2f8;border-radius:3px;font-size:10px;color:#2980b9;font-family:monospace">${tmpMeta.Code}</span>`;
			}
			tmpHTML += '</div>';
		}

		// Inputs
		if (tmpInputs.length > 0)
		{
			tmpHTML += '<div style="margin-bottom:6px"><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#95a5a6;margin-bottom:2px">Inputs</div>';
			for (let i = 0; i < tmpInputs.length; i++)
			{
				let tmpPort = tmpInputs[i];
				let tmpConstraint = '';
				let tmpMin = (typeof tmpPort.MinimumInputCount === 'number') ? tmpPort.MinimumInputCount : 0;
				let tmpMax = (typeof tmpPort.MaximumInputCount === 'number') ? tmpPort.MaximumInputCount : -1;
				if (tmpMin > 0 || tmpMax > 0)
				{
					if (tmpMax < 0)
					{
						tmpConstraint = ` <span style="color:#95a5a6;font-size:10px">(min ${tmpMin})</span>`;
					}
					else if (tmpMin === tmpMax)
					{
						tmpConstraint = ` <span style="color:#95a5a6;font-size:10px">(exactly ${tmpMin})</span>`;
					}
					else
					{
						tmpConstraint = ` <span style="color:#95a5a6;font-size:10px">(${tmpMin}\u2013${tmpMax})</span>`;
					}
				}
				tmpHTML += `<div style="padding:2px 6px;background:#f8f9fa;border-left:3px solid #3498db;margin-bottom:2px;font-size:11px">${tmpPort.Label || 'In'}${tmpConstraint}</div>`;
			}
			tmpHTML += '</div>';
		}

		// Outputs
		if (tmpOutputs.length > 0)
		{
			tmpHTML += '<div><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#95a5a6;margin-bottom:2px">Outputs</div>';
			for (let i = 0; i < tmpOutputs.length; i++)
			{
				let tmpPort = tmpOutputs[i];
				tmpHTML += `<div style="padding:2px 6px;background:#f8f9fa;border-left:3px solid #2ecc71;margin-bottom:2px;font-size:11px">${tmpPort.Label || 'Out'}</div>`;
			}
			tmpHTML += '</div>';
		}

		tmpHTML += '</div>';
		pContainer.innerHTML = tmpHTML;
	}

	/**
	 * Determine which node edge and panel edge to connect based on 4-quadrant detection.
	 * Uses the relative position of the panel center to the node center.
	 *
	 * @param {Object} pPanelData
	 * @param {Object} pNodeData
	 * @returns {{nodeAnchor: {x,y,side}, panelAnchor: {x,y,side}}}
	 */
	_getSmartTetherAnchors(pPanelData, pNodeData)
	{
		let tmpNodeCX = pNodeData.X + pNodeData.Width / 2;
		let tmpNodeCY = pNodeData.Y + pNodeData.Height / 2;
		let tmpPanelCX = pPanelData.X + pPanelData.Width / 2;
		let tmpPanelCY = pPanelData.Y + pPanelData.Height / 2;

		let tmpDX = tmpPanelCX - tmpNodeCX;
		let tmpDY = tmpPanelCY - tmpNodeCY;

		let tmpNodeSide, tmpPanelSide;

		if (Math.abs(tmpDX) >= Math.abs(tmpDY))
		{
			// Panel is primarily to the left or right
			if (tmpDX >= 0)
			{
				tmpNodeSide = 'right';
				tmpPanelSide = 'left';
			}
			else
			{
				tmpNodeSide = 'left';
				tmpPanelSide = 'right';
			}
		}
		else
		{
			// Panel is primarily above or below
			if (tmpDY >= 0)
			{
				tmpNodeSide = 'bottom';
				tmpPanelSide = 'top';
			}
			else
			{
				tmpNodeSide = 'top';
				tmpPanelSide = 'bottom';
			}
		}

		let tmpNodeAnchor = this._getEdgeCenter(pNodeData, tmpNodeSide);
		let tmpPanelAnchor = this._getPanelEdgeCenter(pPanelData, tmpPanelSide);

		return {
			nodeAnchor: Object.assign(tmpNodeAnchor, { side: tmpNodeSide }),
			panelAnchor: Object.assign(tmpPanelAnchor, { side: tmpPanelSide })
		};
	}

	/**
	 * Get the center point of a node edge.
	 * @param {Object} pNodeData
	 * @param {string} pSide - 'left', 'right', 'top', 'bottom'
	 * @returns {{x: number, y: number}}
	 */
	_getEdgeCenter(pNodeData, pSide)
	{
		switch (pSide)
		{
			case 'left':
				return { x: pNodeData.X, y: pNodeData.Y + pNodeData.Height / 2 };
			case 'right':
				return { x: pNodeData.X + pNodeData.Width, y: pNodeData.Y + pNodeData.Height / 2 };
			case 'top':
				return { x: pNodeData.X + pNodeData.Width / 2, y: pNodeData.Y };
			case 'bottom':
				return { x: pNodeData.X + pNodeData.Width / 2, y: pNodeData.Y + pNodeData.Height };
			default:
				return { x: pNodeData.X + pNodeData.Width, y: pNodeData.Y + pNodeData.Height / 2 };
		}
	}

	/**
	 * Get the center point of a panel edge.
	 * @param {Object} pPanelData
	 * @param {string} pSide - 'left', 'right', 'top', 'bottom'
	 * @returns {{x: number, y: number}}
	 */
	_getPanelEdgeCenter(pPanelData, pSide)
	{
		switch (pSide)
		{
			case 'left':
				return { x: pPanelData.X, y: pPanelData.Y + pPanelData.Height / 2 };
			case 'right':
				return { x: pPanelData.X + pPanelData.Width, y: pPanelData.Y + pPanelData.Height / 2 };
			case 'top':
				return { x: pPanelData.X + pPanelData.Width / 2, y: pPanelData.Y };
			case 'bottom':
				return { x: pPanelData.X + pPanelData.Width / 2, y: pPanelData.Y + pPanelData.Height };
			default:
				return { x: pPanelData.X, y: pPanelData.Y + pPanelData.Height / 2 };
		}
	}

	/**
	 * Get the outward direction vector for a given side.
	 * @param {string} pSide
	 * @returns {{dx: number, dy: number}}
	 */
	_sideDirection(pSide)
	{
		switch (pSide)
		{
			case 'left':  return { dx: -1, dy: 0 };
			case 'right': return { dx: 1, dy: 0 };
			case 'top':   return { dx: 0, dy: -1 };
			case 'bottom':return { dx: 0, dy: 1 };
			default:      return { dx: 1, dy: 0 };
		}
	}

	/**
	 * Generate a bezier path between two anchor points with directional departure/approach.
	 * @param {Object} pFrom - {x, y, side}
	 * @param {Object} pTo - {x, y, side}
	 * @param {number|null} pHandleX - User-set handle X or null for auto
	 * @param {number|null} pHandleY - User-set handle Y or null for auto
	 * @returns {string} SVG path d attribute
	 */
	_generateTetherBezierPath(pFrom, pTo, pHandleX, pHandleY)
	{
		let tmpDepartDist = 20;
		let tmpFromDir = this._sideDirection(pFrom.side);
		let tmpToDir = this._sideDirection(pTo.side);

		let tmpDepartX = pFrom.x + tmpFromDir.dx * tmpDepartDist;
		let tmpDepartY = pFrom.y + tmpFromDir.dy * tmpDepartDist;
		let tmpApproachX = pTo.x + tmpToDir.dx * tmpDepartDist;
		let tmpApproachY = pTo.y + tmpToDir.dy * tmpDepartDist;

		if (pHandleX == null || pHandleY == null)
		{
			// Auto bezier: simple cubic from depart to approach
			let tmpSpanX = Math.abs(tmpApproachX - tmpDepartX);
			let tmpSpanY = Math.abs(tmpApproachY - tmpDepartY);
			let tmpSpan = Math.max(tmpSpanX, tmpSpanY, 40);
			let tmpCPDist = tmpSpan * 0.4;

			let tmpCP1X = tmpDepartX + tmpFromDir.dx * tmpCPDist;
			let tmpCP1Y = tmpDepartY + tmpFromDir.dy * tmpCPDist;
			let tmpCP2X = tmpApproachX + tmpToDir.dx * tmpCPDist;
			let tmpCP2Y = tmpApproachY + tmpToDir.dy * tmpCPDist;

			return `M ${pFrom.x} ${pFrom.y} L ${tmpDepartX} ${tmpDepartY} C ${tmpCP1X} ${tmpCP1Y}, ${tmpCP2X} ${tmpCP2Y}, ${tmpApproachX} ${tmpApproachY} L ${pTo.x} ${pTo.y}`;
		}

		// User-set handle: split bezier into two segments through handle
		let tmpCP1aDist = 30;
		let tmpCP1aX = tmpDepartX + tmpFromDir.dx * tmpCP1aDist;
		let tmpCP1aY = tmpDepartY + tmpFromDir.dy * tmpCP1aDist;

		let tmpCP2aDist = 30;
		let tmpCP2aX = tmpApproachX + tmpToDir.dx * tmpCP2aDist;
		let tmpCP2aY = tmpApproachY + tmpToDir.dy * tmpCP2aDist;

		// Tangent at the handle — direction from first segment end to second segment start
		let tmpTangentX = tmpApproachX - tmpDepartX;
		let tmpTangentY = tmpApproachY - tmpDepartY;
		let tmpTangentLen = Math.sqrt(tmpTangentX * tmpTangentX + tmpTangentY * tmpTangentY) || 1;
		tmpTangentX /= tmpTangentLen;
		tmpTangentY /= tmpTangentLen;
		let tmpTangentDist = 25;

		let tmpCP1bX = pHandleX - tmpTangentX * tmpTangentDist;
		let tmpCP1bY = pHandleY - tmpTangentY * tmpTangentDist;
		let tmpCP2bX = pHandleX + tmpTangentX * tmpTangentDist;
		let tmpCP2bY = pHandleY + tmpTangentY * tmpTangentDist;

		return `M ${pFrom.x} ${pFrom.y} L ${tmpDepartX} ${tmpDepartY} C ${tmpCP1aX} ${tmpCP1aY}, ${tmpCP1bX} ${tmpCP1bY}, ${pHandleX} ${pHandleY} C ${tmpCP2bX} ${tmpCP2bY}, ${tmpCP2aX} ${tmpCP2aY}, ${tmpApproachX} ${tmpApproachY} L ${pTo.x} ${pTo.y}`;
	}

	/**
	 * Generate an orthogonal (90-degree) path between two anchor points.
	 * @param {Object} pFrom - {x, y, side}
	 * @param {Object} pTo - {x, y, side}
	 * @param {Object|null} pCorners - {corner1: {x,y}, corner2: {x,y}} or null for auto
	 * @param {number} pMidOffset - Offset for the corridor midpoint
	 * @returns {string} SVG path d attribute
	 */
	_generateTetherOrthogonalPath(pFrom, pTo, pCorners, pMidOffset)
	{
		let tmpDepartDist = 20;
		let tmpFromDir = this._sideDirection(pFrom.side);
		let tmpToDir = this._sideDirection(pTo.side);

		let tmpDepartX = pFrom.x + tmpFromDir.dx * tmpDepartDist;
		let tmpDepartY = pFrom.y + tmpFromDir.dy * tmpDepartDist;
		let tmpApproachX = pTo.x + tmpToDir.dx * tmpDepartDist;
		let tmpApproachY = pTo.y + tmpToDir.dy * tmpDepartDist;

		let tmpCorner1, tmpCorner2;

		if (pCorners && pCorners.corner1 && pCorners.corner2)
		{
			tmpCorner1 = pCorners.corner1;
			tmpCorner2 = pCorners.corner2;
		}
		else
		{
			// Auto-calculate corners based on direction
			let tmpAutoCorners = this._getAutoTetherOrthogonalCorners(tmpDepartX, tmpDepartY, tmpApproachX, tmpApproachY, tmpFromDir, tmpToDir, pMidOffset);
			tmpCorner1 = tmpAutoCorners.corner1;
			tmpCorner2 = tmpAutoCorners.corner2;
		}

		return `M ${pFrom.x} ${pFrom.y} L ${tmpDepartX} ${tmpDepartY} L ${tmpCorner1.x} ${tmpCorner1.y} L ${tmpCorner2.x} ${tmpCorner2.y} L ${tmpApproachX} ${tmpApproachY} L ${pTo.x} ${pTo.y}`;
	}

	/**
	 * Auto-calculate orthogonal corners for tethers.
	 */
	_getAutoTetherOrthogonalCorners(pDepartX, pDepartY, pApproachX, pApproachY, pFromDir, pToDir, pMidOffset)
	{
		let tmpOffset = pMidOffset || 0;
		let tmpFromHoriz = Math.abs(pFromDir.dx) > 0;
		let tmpToHoriz = Math.abs(pToDir.dx) > 0;

		if (tmpFromHoriz && tmpToHoriz)
		{
			// Both horizontal departure/approach: corridor is vertical
			let tmpMidX = (pDepartX + pApproachX) / 2 + tmpOffset;
			return {
				corner1: { x: tmpMidX, y: pDepartY },
				corner2: { x: tmpMidX, y: pApproachY }
			};
		}
		else if (!tmpFromHoriz && !tmpToHoriz)
		{
			// Both vertical: corridor is horizontal
			let tmpMidY = (pDepartY + pApproachY) / 2 + tmpOffset;
			return {
				corner1: { x: pDepartX, y: tmpMidY },
				corner2: { x: pApproachX, y: tmpMidY }
			};
		}
		else if (tmpFromHoriz && !tmpToHoriz)
		{
			// Horizontal→Vertical: single corner
			return {
				corner1: { x: pApproachX, y: pDepartY },
				corner2: { x: pApproachX, y: pDepartY }
			};
		}
		else
		{
			// Vertical→Horizontal: single corner
			return {
				corner1: { x: pDepartX, y: pApproachY },
				corner2: { x: pDepartX, y: pApproachY }
			};
		}
	}

	/**
	 * Get auto-calculated bezier midpoint for a tether.
	 */
	_getTetherAutoMidpoint(pFrom, pTo)
	{
		let tmpDepartDist = 20;
		let tmpFromDir = this._sideDirection(pFrom.side);
		let tmpToDir = this._sideDirection(pTo.side);

		let tmpDepartX = pFrom.x + tmpFromDir.dx * tmpDepartDist;
		let tmpDepartY = pFrom.y + tmpFromDir.dy * tmpDepartDist;
		let tmpApproachX = pTo.x + tmpToDir.dx * tmpDepartDist;
		let tmpApproachY = pTo.y + tmpToDir.dy * tmpDepartDist;

		let tmpSpanX = Math.abs(tmpApproachX - tmpDepartX);
		let tmpSpanY = Math.abs(tmpApproachY - tmpDepartY);
		let tmpSpan = Math.max(tmpSpanX, tmpSpanY, 40);
		let tmpCPDist = tmpSpan * 0.4;

		let tmpP0x = tmpDepartX, tmpP0y = tmpDepartY;
		let tmpP1x = tmpDepartX + tmpFromDir.dx * tmpCPDist;
		let tmpP1y = tmpDepartY + tmpFromDir.dy * tmpCPDist;
		let tmpP2x = tmpApproachX + tmpToDir.dx * tmpCPDist;
		let tmpP2y = tmpApproachY + tmpToDir.dy * tmpCPDist;
		let tmpP3x = tmpApproachX, tmpP3y = tmpApproachY;

		// Evaluate cubic bezier at t=0.5
		return {
			x: 0.125 * tmpP0x + 0.375 * tmpP1x + 0.375 * tmpP2x + 0.125 * tmpP3x,
			y: 0.125 * tmpP0y + 0.375 * tmpP1y + 0.375 * tmpP2y + 0.125 * tmpP3y
		};
	}

	/**
	 * Get auto-calculated orthogonal geometry for a tether.
	 */
	_getTetherOrthoGeometry(pFrom, pTo, pPanelData)
	{
		let tmpDepartDist = 20;
		let tmpFromDir = this._sideDirection(pFrom.side);
		let tmpToDir = this._sideDirection(pTo.side);

		let tmpDepartX = pFrom.x + tmpFromDir.dx * tmpDepartDist;
		let tmpDepartY = pFrom.y + tmpFromDir.dy * tmpDepartDist;
		let tmpApproachX = pTo.x + tmpToDir.dx * tmpDepartDist;
		let tmpApproachY = pTo.y + tmpToDir.dy * tmpDepartDist;

		let tmpCorners;
		if (pPanelData.TetherHandleCustomized && pPanelData.TetherOrthoCorner1X != null)
		{
			tmpCorners = this._getAutoTetherOrthogonalCorners(tmpDepartX, tmpDepartY, tmpApproachX, tmpApproachY, tmpFromDir, tmpToDir, pPanelData.TetherOrthoMidOffset || 0);
			tmpCorners.corner1 = { x: pPanelData.TetherOrthoCorner1X, y: pPanelData.TetherOrthoCorner1Y };
			tmpCorners.corner2 = { x: pPanelData.TetherOrthoCorner2X, y: pPanelData.TetherOrthoCorner2Y };
		}
		else
		{
			tmpCorners = this._getAutoTetherOrthogonalCorners(tmpDepartX, tmpDepartY, tmpApproachX, tmpApproachY, tmpFromDir, tmpToDir, pPanelData.TetherOrthoMidOffset || 0);
		}

		let tmpMidpoint =
		{
			x: (tmpCorners.corner1.x + tmpCorners.corner2.x) / 2,
			y: (tmpCorners.corner1.y + tmpCorners.corner2.y) / 2
		};

		return {
			corner1: tmpCorners.corner1,
			corner2: tmpCorners.corner2,
			midpoint: tmpMidpoint
		};
	}

	/**
	 * Create an SVG element in the SVG namespace.
	 * @param {string} pTagName
	 * @returns {SVGElement}
	 */
	_createSVGElement(pTagName)
	{
		return document.createElementNS('http://www.w3.org/2000/svg', pTagName);
	}

	/**
	 * Render a tether from a panel to its node.
	 * Uses 4-quadrant smart edge detection, supports bezier and orthogonal modes,
	 * and renders drag handles when selected.
	 *
	 * @param {Object} pPanelData
	 * @param {SVGGElement} pTethersLayer
	 * @param {boolean} pIsSelected
	 */
	_renderTether(pPanelData, pTethersLayer, pIsSelected)
	{
		let tmpNodeData = this._FlowView.getNode(pPanelData.NodeHash);
		if (!tmpNodeData) return;

		let tmpAnchors = this._getSmartTetherAnchors(pPanelData, tmpNodeData);
		let tmpFrom = tmpAnchors.panelAnchor;
		let tmpTo = tmpAnchors.nodeAnchor;

		let tmpViewIdentifier = this._FlowView.options.ViewIdentifier;
		let tmpLineMode = pPanelData.TetherLineMode || 'bezier';
		let tmpPath;

		if (tmpLineMode === 'orthogonal')
		{
			let tmpCorners = null;
			if (pPanelData.TetherHandleCustomized && pPanelData.TetherOrthoCorner1X != null)
			{
				tmpCorners =
				{
					corner1: { x: pPanelData.TetherOrthoCorner1X, y: pPanelData.TetherOrthoCorner1Y },
					corner2: { x: pPanelData.TetherOrthoCorner2X, y: pPanelData.TetherOrthoCorner2Y }
				};
			}
			tmpPath = this._generateTetherOrthogonalPath(tmpFrom, tmpTo, tmpCorners, pPanelData.TetherOrthoMidOffset || 0);
		}
		else
		{
			let tmpHandleX = (pPanelData.TetherHandleCustomized && pPanelData.TetherBezierHandleX != null) ? pPanelData.TetherBezierHandleX : null;
			let tmpHandleY = (pPanelData.TetherHandleCustomized && pPanelData.TetherBezierHandleY != null) ? pPanelData.TetherBezierHandleY : null;
			tmpPath = this._generateTetherBezierPath(tmpFrom, tmpTo, tmpHandleX, tmpHandleY);
		}

		// Hit area (wider invisible path for easier click targeting)
		let tmpHitArea = this._createSVGElement('path');
		tmpHitArea.setAttribute('class', 'pict-flow-tether-hitarea');
		tmpHitArea.setAttribute('d', tmpPath);
		tmpHitArea.setAttribute('data-element-type', 'tether-hitarea');
		tmpHitArea.setAttribute('data-panel-hash', pPanelData.Hash);
		pTethersLayer.appendChild(tmpHitArea);

		// Visible tether path
		let tmpPathElement = this._createSVGElement('path');
		tmpPathElement.setAttribute('class', `pict-flow-tether-line${pIsSelected ? ' selected' : ''}`);
		tmpPathElement.setAttribute('d', tmpPath);
		tmpPathElement.setAttribute('marker-end', `url(#flow-tether-arrowhead-${tmpViewIdentifier})`);
		tmpPathElement.setAttribute('data-element-type', 'tether');
		tmpPathElement.setAttribute('data-panel-hash', pPanelData.Hash);
		pTethersLayer.appendChild(tmpPathElement);

		// Render drag handles when selected
		if (pIsSelected)
		{
			this._renderTetherHandles(pPanelData, pTethersLayer, tmpFrom, tmpTo);
		}
	}

	/**
	 * Render drag handles for a selected tether.
	 * @param {Object} pPanelData
	 * @param {SVGGElement} pTethersLayer
	 * @param {Object} pFrom - Panel anchor {x, y, side}
	 * @param {Object} pTo - Node anchor {x, y, side}
	 */
	_renderTetherHandles(pPanelData, pTethersLayer, pFrom, pTo)
	{
		let tmpLineMode = pPanelData.TetherLineMode || 'bezier';

		if (tmpLineMode === 'orthogonal')
		{
			let tmpGeom = this._getTetherOrthoGeometry(pFrom, pTo, pPanelData);

			// Corner 1 handle
			this._createTetherHandle(pTethersLayer, pPanelData.Hash, 'ortho-corner1',
				tmpGeom.corner1.x, tmpGeom.corner1.y, 'pict-flow-tether-handle');

			// Midpoint handle
			this._createTetherHandle(pTethersLayer, pPanelData.Hash, 'ortho-midpoint',
				tmpGeom.midpoint.x, tmpGeom.midpoint.y, 'pict-flow-tether-handle-midpoint');

			// Corner 2 handle
			this._createTetherHandle(pTethersLayer, pPanelData.Hash, 'ortho-corner2',
				tmpGeom.corner2.x, tmpGeom.corner2.y, 'pict-flow-tether-handle');
		}
		else
		{
			// Bezier: single midpoint handle
			let tmpMidX, tmpMidY;
			if (pPanelData.TetherHandleCustomized && pPanelData.TetherBezierHandleX != null)
			{
				tmpMidX = pPanelData.TetherBezierHandleX;
				tmpMidY = pPanelData.TetherBezierHandleY;
			}
			else
			{
				let tmpMid = this._getTetherAutoMidpoint(pFrom, pTo);
				tmpMidX = tmpMid.x;
				tmpMidY = tmpMid.y;
			}

			this._createTetherHandle(pTethersLayer, pPanelData.Hash, 'bezier-midpoint',
				tmpMidX, tmpMidY, 'pict-flow-tether-handle-midpoint');
		}
	}

	/**
	 * Create a single tether drag handle circle.
	 * @param {SVGGElement} pLayer
	 * @param {string} pPanelHash
	 * @param {string} pHandleType
	 * @param {number} pX
	 * @param {number} pY
	 * @param {string} pClassName
	 */
	_createTetherHandle(pLayer, pPanelHash, pHandleType, pX, pY, pClassName)
	{
		let tmpCircle = this._createSVGElement('circle');
		tmpCircle.setAttribute('class', pClassName);
		tmpCircle.setAttribute('cx', String(pX));
		tmpCircle.setAttribute('cy', String(pY));
		tmpCircle.setAttribute('r', '6');
		tmpCircle.setAttribute('data-element-type', 'tether-handle');
		tmpCircle.setAttribute('data-panel-hash', pPanelHash);
		tmpCircle.setAttribute('data-handle-type', pHandleType);
		pLayer.appendChild(tmpCircle);
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
