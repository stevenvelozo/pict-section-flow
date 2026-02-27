const libFableServiceProviderBase = require('fable-serviceproviderbase');

/**
 * PictService-Flow-PanelManager
 *
 * Manages the lifecycle of properties panels in the flow diagram:
 * opening, closing, toggling, and position updates for panels
 * associated with flow nodes.
 */
class PictServiceFlowPanelManager extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictServiceFlowPanelManager';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;
	}

	/**
	 * Open a properties panel for a node.
	 * @param {string} pNodeHash - The hash of the node to open a panel for
	 * @returns {Object|false} The panel data, or false if the node was not found
	 */
	openPanel(pNodeHash)
	{
		let tmpNode = this._FlowView.getNode(pNodeHash);
		if (!tmpNode) return false;

		let tmpNodeTypeConfig = this._FlowView._NodeTypeProvider.getNodeType(tmpNode.Type);
		if (!tmpNodeTypeConfig) return false;

		// Check if a panel is already open for this node
		let tmpExisting = this._FlowView._FlowData.OpenPanels.find((pPanel) => pPanel.NodeHash === pNodeHash);
		if (tmpExisting) return tmpExisting;

		let tmpPanelConfig = tmpNodeTypeConfig.PropertiesPanel;
		let tmpPanelHash = `panel-${this.fable.getUUID()}`;
		let tmpWidth, tmpHeight, tmpPanelType, tmpTitle;

		if (tmpPanelConfig)
		{
			tmpWidth = tmpPanelConfig.DefaultWidth || 300;
			tmpHeight = tmpPanelConfig.DefaultHeight || 200;
			tmpPanelType = tmpPanelConfig.PanelType || 'Base';
			tmpTitle = tmpPanelConfig.Title || tmpNodeTypeConfig.Label || 'Properties';
		}
		else
		{
			// No PropertiesPanel configured — open an auto-generated info panel
			tmpWidth = 240;
			tmpHeight = 180;
			tmpPanelType = 'Info';
			tmpTitle = tmpNodeTypeConfig.Label || tmpNode.Title || 'Node Info';
		}

		let tmpPanelData =
		{
			Hash: tmpPanelHash,
			NodeHash: pNodeHash,
			PanelType: tmpPanelType,
			Title: tmpTitle,
			X: tmpNode.X + tmpNode.Width + 30,
			Y: tmpNode.Y,
			Width: tmpWidth,
			Height: tmpHeight
		};

		this._FlowView._FlowData.OpenPanels.push(tmpPanelData);
		this._FlowView.renderFlow();
		this._FlowView.marshalFromView();

		if (this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onPanelOpened', tmpPanelData);
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowView._FlowData);
		}

		return tmpPanelData;
	}

	/**
	 * Close a properties panel by panel hash.
	 * @param {string} pPanelHash
	 * @returns {boolean}
	 */
	closePanel(pPanelHash)
	{
		let tmpIndex = this._FlowView._FlowData.OpenPanels.findIndex((pPanel) => pPanel.Hash === pPanelHash);
		if (tmpIndex < 0) return false;

		let tmpRemovedPanel = this._FlowView._FlowData.OpenPanels.splice(tmpIndex, 1)[0];

		// Clean up the panel instance
		if (this._FlowView._PropertiesPanelView)
		{
			this._FlowView._PropertiesPanelView.destroyPanel(pPanelHash);
		}

		this._FlowView.renderFlow();
		this._FlowView.marshalFromView();

		if (this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onPanelClosed', tmpRemovedPanel);
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowView._FlowData);
		}

		return true;
	}

	/**
	 * Close all panels for a given node.
	 * @param {string} pNodeHash
	 * @returns {boolean}
	 */
	closePanelForNode(pNodeHash)
	{
		let tmpPanelsToClose = this._FlowView._FlowData.OpenPanels.filter((pPanel) => pPanel.NodeHash === pNodeHash);
		if (tmpPanelsToClose.length === 0) return false;

		for (let i = 0; i < tmpPanelsToClose.length; i++)
		{
			let tmpIndex = this._FlowView._FlowData.OpenPanels.indexOf(tmpPanelsToClose[i]);
			if (tmpIndex >= 0)
			{
				this._FlowView._FlowData.OpenPanels.splice(tmpIndex, 1);
			}
			if (this._FlowView._PropertiesPanelView)
			{
				this._FlowView._PropertiesPanelView.destroyPanel(tmpPanelsToClose[i].Hash);
			}
		}

		return true;
	}

	/**
	 * Toggle a properties panel for a node (open if closed, close if open).
	 * @param {string} pNodeHash
	 * @returns {Object|false}
	 */
	togglePanel(pNodeHash)
	{
		let tmpExisting = this._FlowView._FlowData.OpenPanels.find((pPanel) => pPanel.NodeHash === pNodeHash);
		if (tmpExisting)
		{
			this.closePanel(tmpExisting.Hash);
			return false;
		}
		return this.openPanel(pNodeHash);
	}

	/**
	 * Update a panel's position (for drag).
	 * @param {string} pPanelHash
	 * @param {number} pX
	 * @param {number} pY
	 */
	updatePanelPosition(pPanelHash, pX, pY)
	{
		let tmpPanel = this._FlowView._FlowData.OpenPanels.find((pPanel) => pPanel.Hash === pPanelHash);
		if (!tmpPanel) return;

		tmpPanel.X = pX;
		tmpPanel.Y = pY;

		// Reset tether handle positions when panel moves
		this._FlowView._resetHandlesForPanel(pPanelHash);

		// Update the foreignObject position directly for smooth dragging
		if (this._FlowView._PanelsLayer)
		{
			let tmpFO = this._FlowView._PanelsLayer.querySelector(`[data-panel-hash="${pPanelHash}"]`);
			if (tmpFO)
			{
				tmpFO.setAttribute('x', String(pX));
				tmpFO.setAttribute('y', String(pY));
			}
		}

		// Update the tether for this panel
		this._FlowView._renderTethersForNode(tmpPanel.NodeHash);
	}
}

module.exports = PictServiceFlowPanelManager;
