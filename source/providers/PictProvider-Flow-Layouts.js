const libPictProvider = require('pict-provider');

const _ProviderConfiguration =
{
	ProviderIdentifier: 'PictProviderFlowLayouts'
};

/**
 * Provider for managing saved flow diagram layouts.
 *
 * Layouts capture the spatial arrangement of nodes and panels on the canvas
 * without storing any card content. When a layout is restored, nodes that
 * still exist are placed at their saved positions and any new nodes are
 * auto-laid-out to the right.
 *
 * Saved layout data structure:
 * {
 *     Hash: "layout-<UUID>",
 *     Name: "My Layout",
 *     CreatedAt: "2026-02-26T12:00:00.000Z",
 *     NodePositions: { "node-hash": { X, Y, Width, Height } },
 *     PanelPositions: { "node-hash": { X, Y, Width, Height } },
 *     ViewState: { PanX, PanY, Zoom }
 * }
 */
class PictProviderFlowLayouts extends libPictProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, _ProviderConfiguration, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'PictProviderFlowLayouts';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;
	}

	/**
	 * Save the current node and panel positions as a named layout.
	 * @param {string} pName - The display name for this layout
	 * @returns {Object} The saved layout entry
	 */
	saveLayout(pName)
	{
		if (!this._FlowView)
		{
			this.log.warn('PictProviderFlowLayouts saveLayout: no FlowView reference');
			return null;
		}

		let tmpFlowData = this._FlowView._FlowData;
		let tmpLayoutHash = `layout-${this.fable.getUUID()}`;
		let tmpNodePositions = {};
		let tmpPanelPositions = {};

		// Capture node positions (arrangement only, no content)
		for (let i = 0; i < tmpFlowData.Nodes.length; i++)
		{
			let tmpNode = tmpFlowData.Nodes[i];
			tmpNodePositions[tmpNode.Hash] =
			{
				X: tmpNode.X,
				Y: tmpNode.Y,
				Width: tmpNode.Width,
				Height: tmpNode.Height
			};
		}

		// Capture panel positions keyed by NodeHash (panels get new hashes on each open)
		for (let i = 0; i < tmpFlowData.OpenPanels.length; i++)
		{
			let tmpPanel = tmpFlowData.OpenPanels[i];
			tmpPanelPositions[tmpPanel.NodeHash] =
			{
				X: tmpPanel.X,
				Y: tmpPanel.Y,
				Width: tmpPanel.Width,
				Height: tmpPanel.Height
			};
		}

		let tmpLayout =
		{
			Hash: tmpLayoutHash,
			Name: pName || 'Untitled Layout',
			CreatedAt: new Date().toISOString(),
			NodePositions: tmpNodePositions,
			PanelPositions: tmpPanelPositions,
			ViewState:
			{
				PanX: tmpFlowData.ViewState.PanX,
				PanY: tmpFlowData.ViewState.PanY,
				Zoom: tmpFlowData.ViewState.Zoom
			}
		};

		tmpFlowData.SavedLayouts.push(tmpLayout);
		this._FlowView.marshalFromView();

		if (this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onLayoutSaved', tmpLayout);
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', tmpFlowData);
		}

		this.log.trace(`PictProviderFlowLayouts saved layout '${tmpLayout.Name}' (${tmpLayout.Hash})`);

		return tmpLayout;
	}

	/**
	 * Restore a saved layout by hash.
	 * Nodes present in the saved layout are placed at their saved positions.
	 * Nodes not in the saved layout are auto-laid-out to the right of the
	 * positioned nodes.
	 * @param {string} pLayoutHash - The hash of the layout to restore
	 * @returns {boolean} Whether the layout was restored
	 */
	restoreLayout(pLayoutHash)
	{
		if (!this._FlowView)
		{
			this.log.warn('PictProviderFlowLayouts restoreLayout: no FlowView reference');
			return false;
		}

		let tmpFlowData = this._FlowView._FlowData;
		let tmpLayout = tmpFlowData.SavedLayouts.find(
			(pLayout) => pLayout.Hash === pLayoutHash
		);

		if (!tmpLayout)
		{
			this.log.warn(`PictProviderFlowLayouts restoreLayout: layout '${pLayoutHash}' not found`);
			return false;
		}

		let tmpMatchedNodes = [];
		let tmpUnmatchedNodes = [];

		// Apply saved positions to matched nodes; collect unmatched ones
		for (let i = 0; i < tmpFlowData.Nodes.length; i++)
		{
			let tmpNode = tmpFlowData.Nodes[i];
			let tmpSaved = tmpLayout.NodePositions[tmpNode.Hash];

			if (tmpSaved)
			{
				tmpNode.X = tmpSaved.X;
				tmpNode.Y = tmpSaved.Y;
				if (typeof tmpSaved.Width === 'number') tmpNode.Width = tmpSaved.Width;
				if (typeof tmpSaved.Height === 'number') tmpNode.Height = tmpSaved.Height;
				tmpMatchedNodes.push(tmpNode);
			}
			else
			{
				tmpUnmatchedNodes.push(tmpNode);
			}
		}

		// Apply saved panel positions (keyed by NodeHash)
		if (tmpLayout.PanelPositions)
		{
			for (let i = 0; i < tmpFlowData.OpenPanels.length; i++)
			{
				let tmpPanel = tmpFlowData.OpenPanels[i];
				let tmpSavedPanel = tmpLayout.PanelPositions[tmpPanel.NodeHash];

				if (tmpSavedPanel)
				{
					tmpPanel.X = tmpSavedPanel.X;
					tmpPanel.Y = tmpSavedPanel.Y;
					if (typeof tmpSavedPanel.Width === 'number') tmpPanel.Width = tmpSavedPanel.Width;
					if (typeof tmpSavedPanel.Height === 'number') tmpPanel.Height = tmpSavedPanel.Height;
				}
			}
		}

		// Auto-layout unmatched nodes to the right of positioned nodes
		if (tmpUnmatchedNodes.length > 0 && this._FlowView._LayoutService)
		{
			this._FlowView._LayoutService.autoLayoutSubset(
				tmpUnmatchedNodes,
				tmpMatchedNodes,
				tmpFlowData.Connections
			);
		}

		// Restore view state (camera position)
		if (tmpLayout.ViewState)
		{
			if (typeof tmpLayout.ViewState.PanX === 'number')
			{
				tmpFlowData.ViewState.PanX = tmpLayout.ViewState.PanX;
			}
			if (typeof tmpLayout.ViewState.PanY === 'number')
			{
				tmpFlowData.ViewState.PanY = tmpLayout.ViewState.PanY;
			}
			if (typeof tmpLayout.ViewState.Zoom === 'number')
			{
				tmpFlowData.ViewState.Zoom = tmpLayout.ViewState.Zoom;
			}
		}

		this._FlowView.renderFlow();
		this._FlowView.marshalFromView();

		if (this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onLayoutRestored', tmpLayout);
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', tmpFlowData);
		}

		this.log.trace(`PictProviderFlowLayouts restored layout '${tmpLayout.Name}' (${tmpLayout.Hash})`);

		return true;
	}

	/**
	 * Delete a saved layout by hash.
	 * @param {string} pLayoutHash - The hash of the layout to delete
	 * @returns {boolean} Whether the layout was deleted
	 */
	deleteLayout(pLayoutHash)
	{
		if (!this._FlowView)
		{
			this.log.warn('PictProviderFlowLayouts deleteLayout: no FlowView reference');
			return false;
		}

		let tmpFlowData = this._FlowView._FlowData;
		let tmpIndex = tmpFlowData.SavedLayouts.findIndex(
			(pLayout) => pLayout.Hash === pLayoutHash
		);

		if (tmpIndex < 0)
		{
			this.log.warn(`PictProviderFlowLayouts deleteLayout: layout '${pLayoutHash}' not found`);
			return false;
		}

		let tmpRemovedLayout = tmpFlowData.SavedLayouts.splice(tmpIndex, 1)[0];
		this._FlowView.marshalFromView();

		if (this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onLayoutDeleted', tmpRemovedLayout);
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', tmpFlowData);
		}

		this.log.trace(`PictProviderFlowLayouts deleted layout '${tmpRemovedLayout.Name}' (${tmpRemovedLayout.Hash})`);

		return true;
	}

	/**
	 * Get the list of saved layouts.
	 * @returns {Array} Array of saved layout objects
	 */
	getLayouts()
	{
		if (!this._FlowView) return [];
		return this._FlowView._FlowData.SavedLayouts;
	}

	/**
	 * Get a specific saved layout by hash.
	 * @param {string} pLayoutHash
	 * @returns {Object|null}
	 */
	getLayout(pLayoutHash)
	{
		if (!this._FlowView) return null;
		return this._FlowView._FlowData.SavedLayouts.find(
			(pLayout) => pLayout.Hash === pLayoutHash
		) || null;
	}
}

module.exports = PictProviderFlowLayouts;

module.exports.default_configuration = _ProviderConfiguration;
