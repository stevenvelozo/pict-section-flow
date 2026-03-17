const libFableServiceProviderBase = require('fable-serviceproviderbase');

class PictServiceFlowConnectionRenderer extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictServiceFlowConnectionRenderer';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;
	}

	/**
	 * Render a connection as an SVG path with hit area and optional handles.
	 * @param {Object} pConnection - The connection data
	 * @param {SVGGElement} pConnectionsLayer - The SVG group to append to
	 * @param {boolean} pIsSelected - Whether this connection is selected
	 */
	renderConnection(pConnection, pConnectionsLayer, pIsSelected)
	{
		if (!this._FlowView) return;

		let tmpSourcePos = this._FlowView.getPortPosition(pConnection.SourceNodeHash, pConnection.SourcePortHash);
		let tmpTargetPos = this._FlowView.getPortPosition(pConnection.TargetNodeHash, pConnection.TargetPortHash);

		// Look up the source port's PortType for connection coloring
		let tmpSourcePortType = null;
		let tmpSourceNode = this._FlowView.getNode(pConnection.SourceNodeHash);
		if (tmpSourceNode && tmpSourceNode.Ports)
		{
			for (let i = 0; i < tmpSourceNode.Ports.length; i++)
			{
				if (tmpSourceNode.Ports[i].Hash === pConnection.SourcePortHash)
				{
					tmpSourcePortType = tmpSourceNode.Ports[i].PortType || null;
					break;
				}
			}
		}

		if (!tmpSourcePos || !tmpTargetPos) return;

		let tmpData = pConnection.Data || {};
		let tmpLineMode = tmpData.LineMode || 'bezier';
		let tmpPath;

		if (tmpLineMode === 'orthogonal')
		{
			let tmpCorners = null;
			if (tmpData.HandleCustomized && tmpData.OrthoCorner1X != null)
			{
				tmpCorners =
				{
					corner1: { x: tmpData.OrthoCorner1X, y: tmpData.OrthoCorner1Y },
					corner2: { x: tmpData.OrthoCorner2X, y: tmpData.OrthoCorner2Y }
				};
			}
			tmpPath = this._generateOrthogonalPath(tmpSourcePos, tmpTargetPos, tmpCorners, tmpData.OrthoMidOffset || 0);
		}
		else
		{
			let tmpHandles = this._getBezierHandles(tmpData);
			if (tmpHandles.length > 0)
			{
				tmpPath = this._generateMultiHandleBezierPath(tmpSourcePos, tmpTargetPos, tmpHandles);
			}
			else
			{
				tmpPath = this._generateDirectionalPath(tmpSourcePos, tmpTargetPos);
			}
		}

		// Apply theme noise post-processing to the path
		if (this._FlowView._ThemeProvider)
		{
			tmpPath = this._FlowView._ThemeProvider.processPathString(tmpPath, pConnection.Hash);
		}

		// Apply stroke-dasharray from theme's ConnectionConfig
		let tmpStrokeDashArray = null;
		if (this._FlowView._ThemeProvider)
		{
			let tmpActiveTheme = this._FlowView._ThemeProvider.getActiveTheme();
			if (tmpActiveTheme && tmpActiveTheme.ConnectionConfig && tmpActiveTheme.ConnectionConfig.StrokeDashArray)
			{
				tmpStrokeDashArray = tmpActiveTheme.ConnectionConfig.StrokeDashArray;
			}
		}

		let tmpViewIdentifier = this._FlowView.options.ViewIdentifier;

		// Build the port-type CSS class suffix for connection coloring
		let tmpConnTypeClass = tmpSourcePortType ? (' conn-type-' + tmpSourcePortType) : '';

		// Determine the arrowhead marker based on port type
		let tmpArrowMarkerId;
		if (pIsSelected)
		{
			tmpArrowMarkerId = 'flow-arrowhead-selected-' + tmpViewIdentifier;
		}
		else if (tmpSourcePortType)
		{
			tmpArrowMarkerId = 'flow-arrowhead-' + tmpSourcePortType + '-' + tmpViewIdentifier;
		}
		else
		{
			tmpArrowMarkerId = 'flow-arrowhead-' + tmpViewIdentifier;
		}

		// Hit area (wider invisible path for easier selection)
		let tmpShapeProvider = this._FlowView._ConnectorShapesProvider;
		if (tmpShapeProvider)
		{
			let tmpHitArea = tmpShapeProvider.createConnectionHitAreaElement(tmpPath, pConnection.Hash);
			pConnectionsLayer.appendChild(tmpHitArea);

			let tmpPathElement = tmpShapeProvider.createConnectionPathElement(
				tmpPath, pConnection.Hash, pIsSelected, tmpViewIdentifier);
			if (tmpConnTypeClass)
			{
				tmpPathElement.setAttribute('class',
					(tmpPathElement.getAttribute('class') || '') + tmpConnTypeClass);
			}
			// Override the default arrowhead with the typed one
			tmpPathElement.setAttribute('marker-end', 'url(#' + tmpArrowMarkerId + ')');
			if (tmpStrokeDashArray)
			{
				tmpPathElement.setAttribute('stroke-dasharray', tmpStrokeDashArray);
			}
			pConnectionsLayer.appendChild(tmpPathElement);
		}
		else
		{
			let tmpHitArea = this._FlowView._SVGHelperProvider.createSVGElement('path');
			tmpHitArea.setAttribute('class', 'pict-flow-connection-hitarea');
			tmpHitArea.setAttribute('d', tmpPath);
			tmpHitArea.setAttribute('data-connection-hash', pConnection.Hash);
			tmpHitArea.setAttribute('data-element-type', 'connection-hitarea');
			pConnectionsLayer.appendChild(tmpHitArea);

			let tmpPathElement = this._FlowView._SVGHelperProvider.createSVGElement('path');
			tmpPathElement.setAttribute('class', `pict-flow-connection${tmpConnTypeClass} ${pIsSelected ? 'selected' : ''}`);
			tmpPathElement.setAttribute('d', tmpPath);
			tmpPathElement.setAttribute('data-connection-hash', pConnection.Hash);
			tmpPathElement.setAttribute('data-element-type', 'connection');
			tmpPathElement.setAttribute('marker-end', 'url(#' + tmpArrowMarkerId + ')');

			if (tmpStrokeDashArray)
			{
				tmpPathElement.setAttribute('stroke-dasharray', tmpStrokeDashArray);
			}

			pConnectionsLayer.appendChild(tmpPathElement);
		}

		// Render drag handles when selected
		if (pIsSelected)
		{
			this._renderHandles(pConnection, pConnectionsLayer, tmpSourcePos, tmpTargetPos);
		}
	}

	/**
	 * Compute the departure and approach points plus control points
	 * for a direction-aware bezier between two ports.
	 *
	 * This extracts the intermediate geometry from _generateDirectionalPath
	 * so it can be reused by _getAutoMidpoint and _generateBezierPathWithHandle.
	 *
	 * @param {{x: number, y: number, side: string}} pStart
	 * @param {{x: number, y: number, side: string}} pEnd
	 * @returns {{departX, departY, approachX, approachY, cp1X, cp1Y, cp2X, cp2Y, startDir, endDir}}
	 */
	_computeDirectionalGeometry(pStart, pEnd)
	{
		return this._FlowView._PathGenerator.computeDirectionalGeometry(pStart, pEnd);
	}

	/**
	 * Generate a direction-aware path between two ports.
	 *
	 * The path is composed of three segments:
	 *   1. A short straight "departure" segment leaving the source port
	 *      in its outward direction.
	 *   2. A cubic bezier curve connecting the departure point to an
	 *      "approach" point near the target port.
	 *   3. A short straight "approach" segment arriving at the target
	 *      port aligned with its inward direction.
	 *
	 * @param {{x: number, y: number, side: string}} pStart - Start port position + side
	 * @param {{x: number, y: number, side: string}} pEnd   - End port position + side
	 * @returns {string} SVG path d attribute
	 */
	_generateDirectionalPath(pStart, pEnd)
	{
		let tmpGeo = this._computeDirectionalGeometry(pStart, pEnd);

		return this._FlowView._PathGenerator.buildBezierPathString(
			{ x: pStart.x, y: pStart.y },
			{ x: tmpGeo.departX, y: tmpGeo.departY },
			{ x: tmpGeo.cp1X, y: tmpGeo.cp1Y },
			{ x: tmpGeo.cp2X, y: tmpGeo.cp2Y },
			{ x: tmpGeo.approachX, y: tmpGeo.approachY },
			{ x: pEnd.x, y: pEnd.y }
		);
	}

	/**
	 * Get the bezier handles array from connection data, with backward
	 * compatibility for the legacy BezierHandleX/Y single-handle format.
	 *
	 * @param {Object} pData - Connection.Data
	 * @returns {Array<{x: number, y: number}>} Ordered handle waypoints (may be empty)
	 */
	_getBezierHandles(pData)
	{
		if (!pData || !pData.HandleCustomized)
		{
			return [];
		}

		// New multi-handle format
		if (Array.isArray(pData.BezierHandles) && pData.BezierHandles.length > 0)
		{
			return pData.BezierHandles;
		}

		// Legacy single-handle format
		if (pData.BezierHandleX != null && pData.BezierHandleY != null)
		{
			return [{ x: pData.BezierHandleX, y: pData.BezierHandleY }];
		}

		return [];
	}

	/**
	 * Generate a multi-handle bezier path between two ports.
	 * Delegates to PathGenerator.buildMultiBezierPathString for the
	 * actual SVG path assembly with Catmull-Rom tangent continuity.
	 *
	 * @param {{x: number, y: number, side: string}} pStart
	 * @param {{x: number, y: number, side: string}} pEnd
	 * @param {Array<{x: number, y: number}>} pHandles - Ordered waypoints
	 * @returns {string} SVG path d attribute
	 */
	_generateMultiHandleBezierPath(pStart, pEnd, pHandles)
	{
		let tmpGeo = this._computeDirectionalGeometry(pStart, pEnd);

		return this._FlowView._PathGenerator.buildMultiBezierPathString(
			{ x: pStart.x, y: pStart.y },
			{ x: tmpGeo.departX, y: tmpGeo.departY },
			pHandles,
			{ x: tmpGeo.approachX, y: tmpGeo.approachY },
			{ x: pEnd.x, y: pEnd.y },
			tmpGeo.startDir,
			tmpGeo.endDir
		);
	}

	/**
	 * Find which segment of the multi-handle bezier the given click point
	 * is closest to, returning the index at which a new handle should be
	 * inserted into the BezierHandles array.
	 *
	 * Segments are: depart→handle[0], handle[0]→handle[1], ..., handle[N-1]→approach.
	 * Returns 0 for before handle[0], 1 for between handle[0] and handle[1], etc.
	 *
	 * @param {Array<{x: number, y: number}>} pHandles - Current handles
	 * @param {{x: number, y: number}} pClickPoint - Where the user right-clicked
	 * @param {{x: number, y: number, side: string}} pStart - Source port position
	 * @param {{x: number, y: number, side: string}} pEnd - Target port position
	 * @returns {number} Insertion index
	 */
	computeInsertionIndex(pHandles, pClickPoint, pStart, pEnd)
	{
		let tmpGeo = this._computeDirectionalGeometry(pStart, pEnd);

		// Build the waypoint chain: depart, handle[0..N-1], approach
		let tmpWaypoints = [{ x: tmpGeo.departX, y: tmpGeo.departY }];
		for (let i = 0; i < pHandles.length; i++)
		{
			tmpWaypoints.push(pHandles[i]);
		}
		tmpWaypoints.push({ x: tmpGeo.approachX, y: tmpGeo.approachY });

		let tmpBestDist = Infinity;
		let tmpBestIndex = 0;

		for (let i = 0; i < tmpWaypoints.length - 1; i++)
		{
			let tmpDist = this._distanceToSegment(
				pClickPoint.x, pClickPoint.y,
				tmpWaypoints[i].x, tmpWaypoints[i].y,
				tmpWaypoints[i + 1].x, tmpWaypoints[i + 1].y
			);

			if (tmpDist < tmpBestDist)
			{
				tmpBestDist = tmpDist;
				tmpBestIndex = i;
			}
		}

		return tmpBestIndex;
	}

	/**
	 * Distance from point (px,py) to line segment (ax,ay)-(bx,by).
	 */
	_distanceToSegment(pPX, pPY, pAX, pAY, pBX, pBY)
	{
		return this._FlowView._PathGenerator.distanceToSegment(pPX, pPY, pAX, pAY, pBX, pBY);
	}

	/**
	 * Get the auto-calculated midpoint of the default bezier curve between two ports.
	 * Evaluates the cubic bezier at t=0.5.
	 *
	 * @param {{x: number, y: number, side: string}} pStart
	 * @param {{x: number, y: number, side: string}} pEnd
	 * @returns {{x: number, y: number}}
	 */
	getAutoMidpoint(pStart, pEnd)
	{
		return this._FlowView._PathGenerator.getAutoMidpoint(pStart, pEnd);
	}

	/**
	 * Generate an orthogonal (90-degree angles only) path between two ports.
	 *
	 * Path format: M start L depart L corner1 L corner2 L approach L end
	 *
	 * @param {{x: number, y: number, side: string}} pStart
	 * @param {{x: number, y: number, side: string}} pEnd
	 * @param {Object|null} pCorners - { corner1: {x,y}, corner2: {x,y} } or null for auto
	 * @param {number} pMidOffset - Offset for the auto-calculated corridor position
	 * @returns {string} SVG path d attribute
	 */
	_generateOrthogonalPath(pStart, pEnd, pCorners, pMidOffset)
	{
		let tmpDA = this._FlowView._PathGenerator.computeDepartApproach(pStart, pEnd, 20);

		let tmpCorner1, tmpCorner2;

		if (pCorners && pCorners.corner1 && pCorners.corner2)
		{
			tmpCorner1 = pCorners.corner1;
			tmpCorner2 = pCorners.corner2;
		}
		else
		{
			let tmpAutoCorners = this._FlowView._PathGenerator.computeAutoOrthogonalCorners(
				tmpDA.departX, tmpDA.departY,
				tmpDA.approachX, tmpDA.approachY,
				tmpDA.fromDir, tmpDA.toDir,
				pMidOffset || 0
			);
			tmpCorner1 = tmpAutoCorners.corner1;
			tmpCorner2 = tmpAutoCorners.corner2;
		}

		return this._FlowView._PathGenerator.buildOrthogonalPathString(
			{ x: pStart.x, y: pStart.y },
			{ x: tmpDA.departX, y: tmpDA.departY },
			tmpCorner1,
			tmpCorner2,
			{ x: tmpDA.approachX, y: tmpDA.approachY },
			{ x: pEnd.x, y: pEnd.y }
		);
	}

	/**
	 * Get the full orthogonal geometry for a connection (for handle positioning).
	 *
	 * @param {{x: number, y: number, side: string}} pStart
	 * @param {{x: number, y: number, side: string}} pEnd
	 * @param {Object} pData - Connection.Data
	 * @returns {{corner1: {x,y}, corner2: {x,y}, midpoint: {x,y}}}
	 */
	getOrthogonalGeometry(pStart, pEnd, pData)
	{
		let tmpDA = this._FlowView._PathGenerator.computeDepartApproach(pStart, pEnd, 20);

		if (pData && pData.HandleCustomized && pData.OrthoCorner1X != null)
		{
			let tmpCorner1 = { x: pData.OrthoCorner1X, y: pData.OrthoCorner1Y };
			let tmpCorner2 = { x: pData.OrthoCorner2X, y: pData.OrthoCorner2Y };
			let tmpMidpoint =
			{
				x: (tmpCorner1.x + tmpCorner2.x) / 2,
				y: (tmpCorner1.y + tmpCorner2.y) / 2
			};
			return { corner1: tmpCorner1, corner2: tmpCorner2, midpoint: tmpMidpoint };
		}

		return this._FlowView._PathGenerator.computeAutoOrthogonalCorners(
			tmpDA.departX, tmpDA.departY,
			tmpDA.approachX, tmpDA.approachY,
			tmpDA.fromDir, tmpDA.toDir,
			(pData && pData.OrthoMidOffset) || 0
		);
	}

	/**
	 * Render drag handles for the selected connection.
	 *
	 * @param {Object} pConnection
	 * @param {SVGGElement} pLayer
	 * @param {{x, y, side}} pStart - Source port position
	 * @param {{x, y, side}} pEnd   - Target port position
	 */
	_renderHandles(pConnection, pLayer, pStart, pEnd)
	{
		let tmpData = pConnection.Data || {};
		let tmpLineMode = tmpData.LineMode || 'bezier';

		if (tmpLineMode === 'orthogonal')
		{
			let tmpGeometry = this.getOrthogonalGeometry(pStart, pEnd, tmpData);

			// Corner 1 handle
			this._createHandle(pLayer, pConnection.Hash, 'ortho-corner1',
				tmpGeometry.corner1.x, tmpGeometry.corner1.y, 'pict-flow-connection-handle');

			// Midpoint handle (between corners)
			this._createHandle(pLayer, pConnection.Hash, 'ortho-midpoint',
				tmpGeometry.midpoint.x, tmpGeometry.midpoint.y, 'pict-flow-connection-handle-midpoint');

			// Corner 2 handle
			this._createHandle(pLayer, pConnection.Hash, 'ortho-corner2',
				tmpGeometry.corner2.x, tmpGeometry.corner2.y, 'pict-flow-connection-handle');
		}
		else
		{
			// Bezier handles — show one handle per waypoint, or a
			// single auto-midpoint when no custom handles exist.
			let tmpHandles = this._getBezierHandles(tmpData);

			if (tmpHandles.length > 0)
			{
				for (let i = 0; i < tmpHandles.length; i++)
				{
					this._createHandle(pLayer, pConnection.Hash,
						'bezier-handle-' + i,
						tmpHandles[i].x, tmpHandles[i].y,
						'pict-flow-connection-handle');
				}
			}
			else
			{
				let tmpMidpoint = this.getAutoMidpoint(pStart, pEnd);
				this._createHandle(pLayer, pConnection.Hash, 'bezier-midpoint',
					tmpMidpoint.x, tmpMidpoint.y, 'pict-flow-connection-handle');
			}
		}
	}

	/**
	 * Create a single SVG circle handle element.
	 *
	 * @param {SVGGElement} pLayer
	 * @param {string} pConnectionHash
	 * @param {string} pHandleType
	 * @param {number} pX
	 * @param {number} pY
	 * @param {string} pClassName
	 */
	_createHandle(pLayer, pConnectionHash, pHandleType, pX, pY, pClassName)
	{
		if (!this._FlowView._ConnectorShapesProvider) return;

		let tmpShapeKey = (pClassName === 'pict-flow-connection-handle-midpoint')
			? 'connection-handle-midpoint' : 'connection-handle';

		this._FlowView._ConnectorShapesProvider.createFullHandle(
			pLayer, pConnectionHash, pHandleType, pX, pY,
			tmpShapeKey, 'connection-handle', 'data-connection-hash');
	}

	/**
	 * Legacy bezier path for drag connections where we don't have side info.
	 * @param {{x: number, y: number}} pStart
	 * @param {{x: number, y: number}} pEnd
	 * @returns {string}
	 */
	_generateBezierPath(pStart, pEnd)
	{
		// During drag operations we may not have side info; default to right->left
		let tmpStart = { x: pStart.x, y: pStart.y, side: pStart.side || 'right' };
		let tmpEnd   = { x: pEnd.x,   y: pEnd.y,   side: pEnd.side   || 'left' };
		return this._generateDirectionalPath(tmpStart, tmpEnd);
	}

	/**
	 * Render a temporary drag connection line (used during connection creation)
	 * @param {number} pStartX
	 * @param {number} pStartY
	 * @param {number} pEndX
	 * @param {number} pEndY
	 * @param {SVGGElement} pLayer - The layer to render into
	 * @param {string} [pStartSide] - The side the source port is on
	 * @returns {SVGPathElement} The created path element
	 */
	renderDragConnection(pStartX, pStartY, pEndX, pEndY, pLayer, pStartSide)
	{
		let tmpPath = this._generateDirectionalPath(
			{ x: pStartX, y: pStartY, side: pStartSide || 'right' },
			{ x: pEndX,   y: pEndY,   side: 'left' }
		);

		let tmpShapeProvider = this._FlowView._ConnectorShapesProvider;
		let tmpPathElement;

		if (tmpShapeProvider)
		{
			tmpPathElement = tmpShapeProvider.createDragConnectionElement(tmpPath);
		}
		else
		{
			tmpPathElement = this._FlowView._SVGHelperProvider.createSVGElement('path');
			tmpPathElement.setAttribute('class', 'pict-flow-drag-connection');
			tmpPathElement.setAttribute('d', tmpPath);
		}

		pLayer.appendChild(tmpPathElement);

		return tmpPathElement;
	}

	/**
	 * Update a drag connection path
	 * @param {SVGPathElement} pPathElement
	 * @param {number} pStartX
	 * @param {number} pStartY
	 * @param {number} pEndX
	 * @param {number} pEndY
	 * @param {string} [pStartSide] - The side the source port is on
	 */
	updateDragConnection(pPathElement, pStartX, pStartY, pEndX, pEndY, pStartSide)
	{
		if (!pPathElement) return;

		let tmpPath = this._generateDirectionalPath(
			{ x: pStartX, y: pStartY, side: pStartSide || 'right' },
			{ x: pEndX,   y: pEndY,   side: 'left' }
		);

		pPathElement.setAttribute('d', tmpPath);
	}
}

module.exports = PictServiceFlowConnectionRenderer;
