const libFableServiceProviderBase = require('fable-serviceproviderbase');

/**
 * PictService-Flow-SelectionManager
 *
 * Manages selection state for nodes, connections, and tethers in the flow diagram.
 * Handles selecting, deselecting, and deleting selected elements.
 */
class PictServiceFlowSelectionManager extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictServiceFlowSelectionManager';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;
	}

	/**
	 * Select a node
	 * @param {string|null} pNodeHash - Hash of the node to select, or null to deselect
	 */
	selectNode(pNodeHash)
	{
		let tmpPreviousSelection = this._FlowView._FlowData.ViewState.SelectedNodeHash;
		this._FlowView._FlowData.ViewState.SelectedNodeHash = pNodeHash;
		this._FlowView._FlowData.ViewState.SelectedConnectionHash = null;
		this._FlowView._FlowData.ViewState.SelectedTetherHash = null;

		this._FlowView.renderFlow();

		if (this._FlowView._EventHandlerProvider && pNodeHash !== tmpPreviousSelection)
		{
			let tmpNode = pNodeHash ? this._FlowView._FlowData.Nodes.find((pNode) => pNode.Hash === pNodeHash) : null;
			this._FlowView._EventHandlerProvider.fireEvent('onNodeSelected', tmpNode);
		}
	}

	/**
	 * Select a connection
	 * @param {string|null} pConnectionHash - Hash of the connection to select, or null to deselect
	 */
	selectConnection(pConnectionHash)
	{
		let tmpPreviousSelection = this._FlowView._FlowData.ViewState.SelectedConnectionHash;
		this._FlowView._FlowData.ViewState.SelectedConnectionHash = pConnectionHash;
		this._FlowView._FlowData.ViewState.SelectedNodeHash = null;
		this._FlowView._FlowData.ViewState.SelectedTetherHash = null;

		this._FlowView.renderFlow();

		if (this._FlowView._EventHandlerProvider && pConnectionHash !== tmpPreviousSelection)
		{
			let tmpConnection = pConnectionHash ? this._FlowView._FlowData.Connections.find((pConn) => pConn.Hash === pConnectionHash) : null;
			this._FlowView._EventHandlerProvider.fireEvent('onConnectionSelected', tmpConnection);
		}
	}

	/**
	 * Select a tether by its panel hash.
	 * @param {string|null} pPanelHash - Hash of the panel whose tether to select, or null to deselect
	 */
	selectTether(pPanelHash)
	{
		let tmpPreviousSelection = this._FlowView._FlowData.ViewState.SelectedTetherHash;
		this._FlowView._FlowData.ViewState.SelectedTetherHash = pPanelHash;
		this._FlowView._FlowData.ViewState.SelectedNodeHash = null;
		this._FlowView._FlowData.ViewState.SelectedConnectionHash = null;

		this._FlowView.renderFlow();

		if (this._FlowView._EventHandlerProvider && pPanelHash !== tmpPreviousSelection)
		{
			let tmpPanel = pPanelHash ? this._FlowView._FlowData.OpenPanels.find((pPanel) => pPanel.Hash === pPanelHash) : null;
			this._FlowView._EventHandlerProvider.fireEvent('onTetherSelected', tmpPanel);
		}
	}

	/**
	 * Deselect all nodes and connections
	 */
	deselectAll()
	{
		this._FlowView._FlowData.ViewState.SelectedNodeHash = null;
		this._FlowView._FlowData.ViewState.SelectedConnectionHash = null;
		this._FlowView._FlowData.ViewState.SelectedTetherHash = null;
		this._FlowView.renderFlow();
	}

	/**
	 * Delete the currently selected node or connection
	 * @returns {boolean}
	 */
	deleteSelected()
	{
		if (this._FlowView._FlowData.ViewState.SelectedNodeHash)
		{
			return this._FlowView.removeNode(this._FlowView._FlowData.ViewState.SelectedNodeHash);
		}
		if (this._FlowView._FlowData.ViewState.SelectedConnectionHash)
		{
			return this._FlowView.removeConnection(this._FlowView._FlowData.ViewState.SelectedConnectionHash);
		}
		return false;
	}
}

module.exports = PictServiceFlowSelectionManager;
