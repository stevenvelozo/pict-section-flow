const libFableServiceProviderBase = require('fable-serviceproviderbase');

/**
 * PictService-Flow-ConnectionHandleManager
 *
 * Manages connection handle lifecycle: dragging, adding, removing,
 * and resetting bezier/orthogonal handles on connections and tethers.
 *
 * Extracted from PictView-Flow.js to isolate handle CRUD operations
 * from the main view.
 */
class PictServiceFlowConnectionHandleManager extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictServiceFlowConnectionHandleManager';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;
	}

	/**
	 * Update a connection handle position during drag (for real-time feedback).
	 * @param {string} pConnectionHash
	 * @param {string} pHandleType - 'bezier-midpoint', 'bezier-handle-N', 'ortho-corner1', 'ortho-corner2', 'ortho-midpoint'
	 * @param {number} pX
	 * @param {number} pY
	 */
	updateConnectionHandle(pConnectionHash, pHandleType, pX, pY)
	{
		if (!this._FlowView) return;

		let tmpConnection = this._FlowView.getConnection(pConnectionHash);
		if (!tmpConnection) return;

		if (!tmpConnection.Data) tmpConnection.Data = {};
		tmpConnection.Data.HandleCustomized = true;

		// Multi-handle bezier: handle type is 'bezier-handle-N'
		if (pHandleType && pHandleType.startsWith('bezier-handle-'))
		{
			let tmpIndex = parseInt(pHandleType.replace('bezier-handle-', ''), 10);
			if (!isNaN(tmpIndex) && Array.isArray(tmpConnection.Data.BezierHandles)
				&& tmpIndex < tmpConnection.Data.BezierHandles.length)
			{
				tmpConnection.Data.BezierHandles[tmpIndex].x = pX;
				tmpConnection.Data.BezierHandles[tmpIndex].y = pY;
			}
			this._FlowView._renderSingleConnection(pConnectionHash);
			return;
		}

		switch (pHandleType)
		{
			case 'bezier-midpoint':
				// Legacy single-handle: migrate to BezierHandles array
				if (!Array.isArray(tmpConnection.Data.BezierHandles)
					|| tmpConnection.Data.BezierHandles.length === 0)
				{
					tmpConnection.Data.BezierHandles = [{ x: pX, y: pY }];
				}
				else
				{
					tmpConnection.Data.BezierHandles[0].x = pX;
					tmpConnection.Data.BezierHandles[0].y = pY;
				}
				// Keep legacy fields in sync for backward compat
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
				let tmpSourcePos = this._FlowView.getPortPosition(tmpConnection.SourceNodeHash, tmpConnection.SourcePortHash);
				let tmpTargetPos = this._FlowView.getPortPosition(tmpConnection.TargetNodeHash, tmpConnection.TargetPortHash);
				if (tmpSourcePos && tmpTargetPos)
				{
					let tmpGeom = this._FlowView._ConnectionRenderer._computeDirectionalGeometry(tmpSourcePos, tmpTargetPos);
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

		this._FlowView._renderSingleConnection(pConnectionHash);
	}

	/**
	 * Add a bezier handle to a connection at the specified position.
	 * The handle is inserted at the correct index based on which
	 * segment of the curve the click point is closest to.
	 *
	 * @param {string} pConnectionHash
	 * @param {number} pX
	 * @param {number} pY
	 */
	addConnectionHandle(pConnectionHash, pX, pY)
	{
		if (!this._FlowView) return;

		let tmpConnection = this._FlowView.getConnection(pConnectionHash);
		if (!tmpConnection) return;

		if (!tmpConnection.Data) tmpConnection.Data = {};

		// Ensure BezierHandles array exists (migrate from legacy if needed)
		if (!Array.isArray(tmpConnection.Data.BezierHandles))
		{
			tmpConnection.Data.BezierHandles = [];
			if (tmpConnection.Data.BezierHandleX != null && tmpConnection.Data.BezierHandleY != null)
			{
				tmpConnection.Data.BezierHandles.push({
					x: tmpConnection.Data.BezierHandleX,
					y: tmpConnection.Data.BezierHandleY
				});
			}
		}

		// Ensure bezier mode
		tmpConnection.Data.LineMode = 'bezier';

		let tmpSourcePos = this._FlowView.getPortPosition(tmpConnection.SourceNodeHash, tmpConnection.SourcePortHash);
		let tmpTargetPos = this._FlowView.getPortPosition(tmpConnection.TargetNodeHash, tmpConnection.TargetPortHash);

		let tmpInsertIndex = 0;
		if (tmpSourcePos && tmpTargetPos && this._FlowView._ConnectionRenderer)
		{
			tmpInsertIndex = this._FlowView._ConnectionRenderer.computeInsertionIndex(
				tmpConnection.Data.BezierHandles,
				{ x: pX, y: pY },
				tmpSourcePos,
				tmpTargetPos
			);
		}

		tmpConnection.Data.BezierHandles.splice(tmpInsertIndex, 0, { x: pX, y: pY });
		tmpConnection.Data.HandleCustomized = true;

		this._FlowView.renderFlow();
		this._FlowView.marshalFromView();

		if (this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowView._FlowData);
		}
	}

	/**
	 * Remove a bezier handle from a connection by index.
	 *
	 * @param {string} pConnectionHash
	 * @param {number} pIndex - Index in the BezierHandles array
	 */
	removeConnectionHandle(pConnectionHash, pIndex)
	{
		if (!this._FlowView) return;

		let tmpConnection = this._FlowView.getConnection(pConnectionHash);
		if (!tmpConnection || !tmpConnection.Data) return;

		if (!Array.isArray(tmpConnection.Data.BezierHandles)) return;
		if (pIndex < 0 || pIndex >= tmpConnection.Data.BezierHandles.length) return;

		tmpConnection.Data.BezierHandles.splice(pIndex, 1);

		if (tmpConnection.Data.BezierHandles.length === 0)
		{
			tmpConnection.Data.HandleCustomized = false;
			tmpConnection.Data.BezierHandleX = null;
			tmpConnection.Data.BezierHandleY = null;
		}

		this._FlowView.renderFlow();
		this._FlowView.marshalFromView();

		if (this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowView._FlowData);
		}
	}

	/**
	 * Reset handle positions for all connections/tethers involving a node.
	 * Called when a node moves. Preserves LineMode but resets handle coordinates to auto.
	 * @param {string} pNodeHash
	 */
	resetHandlesForNode(pNodeHash)
	{
		if (!this._FlowView) return;

		// Reset connection handles
		for (let i = 0; i < this._FlowView._FlowData.Connections.length; i++)
		{
			let tmpConn = this._FlowView._FlowData.Connections[i];
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
		if (this._FlowView._TetherService)
		{
			this._FlowView._TetherService.resetHandlesForNode(this._FlowView._FlowData.OpenPanels, pNodeHash);
		}
	}

	/**
	 * Reset tether handle positions for a specific panel.
	 * Called when a panel is dragged.
	 * @param {string} pPanelHash
	 */
	resetHandlesForPanel(pPanelHash)
	{
		if (!this._FlowView) return;

		let tmpPanel = this._FlowView._FlowData.OpenPanels.find((pPanel) => pPanel.Hash === pPanelHash);
		if (!tmpPanel) return;

		if (this._FlowView._TetherService)
		{
			this._FlowView._TetherService.resetHandlePositions(tmpPanel);
		}
	}
}

module.exports = PictServiceFlowConnectionHandleManager;
