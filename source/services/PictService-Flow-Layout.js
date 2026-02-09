const libFableServiceProviderBase = require('fable-serviceproviderbase');

class PictServiceFlowLayout extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictServiceFlowLayout';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;

		// Layout configuration
		this._HorizontalSpacing = 250;
		this._VerticalSpacing = 120;
		this._StartX = 100;
		this._StartY = 100;
	}

	/**
	 * Snap a coordinate to the nearest grid point
	 * @param {number} pValue - The coordinate value
	 * @param {number} pGridSize - The grid size
	 * @returns {number}
	 */
	snapToGrid(pValue, pGridSize)
	{
		if (!pGridSize || pGridSize <= 0) return pValue;
		return Math.round(pValue / pGridSize) * pGridSize;
	}

	/**
	 * Auto-layout nodes using a simple left-to-right topological approach
	 * @param {Array} pNodes - Array of node data objects
	 * @param {Array} pConnections - Array of connection data objects
	 */
	autoLayout(pNodes, pConnections)
	{
		if (!pNodes || pNodes.length === 0) return;

		// Build adjacency information
		let tmpNodeMap = {};
		let tmpInDegree = {};
		let tmpOutEdges = {};

		for (let i = 0; i < pNodes.length; i++)
		{
			let tmpNode = pNodes[i];
			tmpNodeMap[tmpNode.Hash] = tmpNode;
			tmpInDegree[tmpNode.Hash] = 0;
			tmpOutEdges[tmpNode.Hash] = [];
		}

		for (let i = 0; i < pConnections.length; i++)
		{
			let tmpConn = pConnections[i];
			if (tmpInDegree.hasOwnProperty(tmpConn.TargetNodeHash))
			{
				tmpInDegree[tmpConn.TargetNodeHash]++;
			}
			if (tmpOutEdges.hasOwnProperty(tmpConn.SourceNodeHash))
			{
				tmpOutEdges[tmpConn.SourceNodeHash].push(tmpConn.TargetNodeHash);
			}
		}

		// Topological sort (Kahn's algorithm)
		let tmpLayers = [];
		let tmpQueue = [];
		let tmpAssigned = {};

		// Start with nodes that have no incoming edges
		for (let tmpHash in tmpInDegree)
		{
			if (tmpInDegree[tmpHash] === 0)
			{
				tmpQueue.push(tmpHash);
			}
		}

		while (tmpQueue.length > 0)
		{
			let tmpCurrentLayer = [];

			let tmpNextQueue = [];
			for (let i = 0; i < tmpQueue.length; i++)
			{
				let tmpNodeHash = tmpQueue[i];
				if (tmpAssigned[tmpNodeHash]) continue;

				tmpAssigned[tmpNodeHash] = true;
				tmpCurrentLayer.push(tmpNodeHash);

				// Process outgoing edges
				let tmpEdges = tmpOutEdges[tmpNodeHash] || [];
				for (let j = 0; j < tmpEdges.length; j++)
				{
					let tmpTargetHash = tmpEdges[j];
					tmpInDegree[tmpTargetHash]--;
					if (tmpInDegree[tmpTargetHash] <= 0 && !tmpAssigned[tmpTargetHash])
					{
						tmpNextQueue.push(tmpTargetHash);
					}
				}
			}

			if (tmpCurrentLayer.length > 0)
			{
				tmpLayers.push(tmpCurrentLayer);
			}

			tmpQueue = tmpNextQueue;
		}

		// Handle any remaining unassigned nodes (cycles or disconnected)
		let tmpRemainingNodes = [];
		for (let i = 0; i < pNodes.length; i++)
		{
			if (!tmpAssigned[pNodes[i].Hash])
			{
				tmpRemainingNodes.push(pNodes[i].Hash);
			}
		}
		if (tmpRemainingNodes.length > 0)
		{
			tmpLayers.push(tmpRemainingNodes);
		}

		// Assign positions based on layers
		let tmpCurrentX = this._StartX;

		for (let tmpLayerIndex = 0; tmpLayerIndex < tmpLayers.length; tmpLayerIndex++)
		{
			let tmpLayer = tmpLayers[tmpLayerIndex];
			let tmpMaxWidth = 0;

			// Calculate the total height for this layer to center vertically
			let tmpTotalHeight = 0;
			for (let i = 0; i < tmpLayer.length; i++)
			{
				let tmpNode = tmpNodeMap[tmpLayer[i]];
				if (tmpNode)
				{
					tmpTotalHeight += tmpNode.Height || 80;
					if (i < tmpLayer.length - 1)
					{
						tmpTotalHeight += this._VerticalSpacing;
					}
				}
			}

			let tmpCurrentY = this._StartY;

			for (let i = 0; i < tmpLayer.length; i++)
			{
				let tmpNode = tmpNodeMap[tmpLayer[i]];
				if (!tmpNode) continue;

				tmpNode.X = tmpCurrentX;
				tmpNode.Y = tmpCurrentY;

				let tmpWidth = tmpNode.Width || 180;
				let tmpHeight = tmpNode.Height || 80;

				tmpMaxWidth = Math.max(tmpMaxWidth, tmpWidth);
				tmpCurrentY += tmpHeight + this._VerticalSpacing;
			}

			tmpCurrentX += tmpMaxWidth + this._HorizontalSpacing;
		}
	}

	/**
	 * Center all nodes around a given point
	 * @param {Array} pNodes
	 * @param {number} pCenterX
	 * @param {number} pCenterY
	 */
	centerNodes(pNodes, pCenterX, pCenterY)
	{
		if (!pNodes || pNodes.length === 0) return;

		let tmpMinX = Infinity, tmpMinY = Infinity;
		let tmpMaxX = -Infinity, tmpMaxY = -Infinity;

		for (let i = 0; i < pNodes.length; i++)
		{
			tmpMinX = Math.min(tmpMinX, pNodes[i].X);
			tmpMinY = Math.min(tmpMinY, pNodes[i].Y);
			tmpMaxX = Math.max(tmpMaxX, pNodes[i].X + (pNodes[i].Width || 180));
			tmpMaxY = Math.max(tmpMaxY, pNodes[i].Y + (pNodes[i].Height || 80));
		}

		let tmpCurrentCenterX = (tmpMinX + tmpMaxX) / 2;
		let tmpCurrentCenterY = (tmpMinY + tmpMaxY) / 2;
		let tmpOffsetX = pCenterX - tmpCurrentCenterX;
		let tmpOffsetY = pCenterY - tmpCurrentCenterY;

		for (let i = 0; i < pNodes.length; i++)
		{
			pNodes[i].X += tmpOffsetX;
			pNodes[i].Y += tmpOffsetY;
		}
	}
}

module.exports = PictServiceFlowLayout;
