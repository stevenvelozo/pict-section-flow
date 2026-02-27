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
			let tmpHandleX = (tmpData.HandleCustomized && tmpData.BezierHandleX != null) ? tmpData.BezierHandleX : null;
			let tmpHandleY = (tmpData.HandleCustomized && tmpData.BezierHandleY != null) ? tmpData.BezierHandleY : null;
			tmpPath = this._generateBezierPathWithHandle(tmpSourcePos, tmpTargetPos, tmpHandleX, tmpHandleY);
		}

		let tmpViewIdentifier = this._FlowView.options.ViewIdentifier;

		// Hit area (wider invisible path for easier selection)
		let tmpHitArea = this._FlowView._SVGHelperProvider.createSVGElement('path');
		tmpHitArea.setAttribute('class', 'pict-flow-connection-hitarea');
		tmpHitArea.setAttribute('d', tmpPath);
		tmpHitArea.setAttribute('data-connection-hash', pConnection.Hash);
		tmpHitArea.setAttribute('data-element-type', 'connection-hitarea');
		pConnectionsLayer.appendChild(tmpHitArea);

		// Visible connection path
		let tmpPathElement = this._FlowView._SVGHelperProvider.createSVGElement('path');
		tmpPathElement.setAttribute('class', `pict-flow-connection ${pIsSelected ? 'selected' : ''}`);
		tmpPathElement.setAttribute('d', tmpPath);
		tmpPathElement.setAttribute('data-connection-hash', pConnection.Hash);
		tmpPathElement.setAttribute('data-element-type', 'connection');

		// Arrow marker
		if (pIsSelected)
		{
			tmpPathElement.setAttribute('marker-end', `url(#flow-arrowhead-selected-${tmpViewIdentifier})`);
		}
		else
		{
			tmpPathElement.setAttribute('marker-end', `url(#flow-arrowhead-${tmpViewIdentifier})`);
		}

		pConnectionsLayer.appendChild(tmpPathElement);

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
		let tmpStartDir = this._FlowView._GeometryProvider.sideDirection(pStart.side || 'right');
		let tmpEndDir   = this._FlowView._GeometryProvider.sideDirection(pEnd.side   || 'left');

		let tmpStraightLen = 20;

		let tmpDepartX = pStart.x + tmpStartDir.dx * tmpStraightLen;
		let tmpDepartY = pStart.y + tmpStartDir.dy * tmpStraightLen;

		let tmpApproachX = pEnd.x + tmpEndDir.dx * tmpStraightLen;
		let tmpApproachY = pEnd.y + tmpEndDir.dy * tmpStraightLen;

		let tmpDX = Math.abs(tmpApproachX - tmpDepartX);
		let tmpDY = Math.abs(tmpApproachY - tmpDepartY);
		let tmpDist = Math.sqrt(tmpDX * tmpDX + tmpDY * tmpDY);

		let tmpBaseOffset = Math.max(Math.min(tmpDist * 0.4, 180), 30);

		let tmpSameAxis = (tmpStartDir.dx !== 0 && tmpEndDir.dx !== 0) ||
		                  (tmpStartDir.dy !== 0 && tmpEndDir.dy !== 0);

		let tmpFacingEachOther = false;
		if (tmpSameAxis)
		{
			if (tmpStartDir.dx === 1 && tmpEndDir.dx === -1 && pEnd.x >= pStart.x)
			{
				tmpFacingEachOther = true;
			}
			else if (tmpStartDir.dx === -1 && tmpEndDir.dx === 1 && pEnd.x <= pStart.x)
			{
				tmpFacingEachOther = true;
			}
			else if (tmpStartDir.dy === 1 && tmpEndDir.dy === -1 && pEnd.y >= pStart.y)
			{
				tmpFacingEachOther = true;
			}
			else if (tmpStartDir.dy === -1 && tmpEndDir.dy === 1 && pEnd.y <= pStart.y)
			{
				tmpFacingEachOther = true;
			}
		}

		let tmpCurveOffset;

		if (tmpFacingEachOther)
		{
			let tmpInlineDist = (tmpStartDir.dx !== 0) ? tmpDX : tmpDY;
			tmpCurveOffset = Math.max(tmpInlineDist * 0.35, 30);
		}
		else if (tmpSameAxis)
		{
			tmpCurveOffset = Math.max(tmpBaseOffset, 60);
		}
		else
		{
			tmpCurveOffset = Math.max(tmpBaseOffset * 0.8, 40);
		}

		let tmpCP1X = tmpDepartX + tmpStartDir.dx * tmpCurveOffset;
		let tmpCP1Y = tmpDepartY + tmpStartDir.dy * tmpCurveOffset;
		let tmpCP2X = tmpApproachX + tmpEndDir.dx * tmpCurveOffset;
		let tmpCP2Y = tmpApproachY + tmpEndDir.dy * tmpCurveOffset;

		return {
			departX: tmpDepartX, departY: tmpDepartY,
			approachX: tmpApproachX, approachY: tmpApproachY,
			cp1X: tmpCP1X, cp1Y: tmpCP1Y,
			cp2X: tmpCP2X, cp2Y: tmpCP2Y,
			startDir: tmpStartDir, endDir: tmpEndDir
		};
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
	 * Generate a bezier path with an optional user-controlled midpoint handle.
	 *
	 * If handle is null, uses the standard auto-calculated bezier.
	 * If handle is set, splits into two cubic bezier segments passing
	 * through the handle point for a smooth S-curve.
	 *
	 * @param {{x: number, y: number, side: string}} pStart
	 * @param {{x: number, y: number, side: string}} pEnd
	 * @param {number|null} pHandleX
	 * @param {number|null} pHandleY
	 * @returns {string} SVG path d attribute
	 */
	_generateBezierPathWithHandle(pStart, pEnd, pHandleX, pHandleY)
	{
		if (pHandleX == null || pHandleY == null)
		{
			return this._generateDirectionalPath(pStart, pEnd);
		}

		let tmpGeo = this._computeDirectionalGeometry(pStart, pEnd);

		// Split into two cubic bezier segments through the handle point.
		// First segment: depart -> handle
		// Second segment: handle -> approach
		// Control points are computed to ensure smooth tangent at the handle.
		let tmpCP1aX = tmpGeo.departX + tmpGeo.startDir.dx * ((Math.abs(pHandleX - tmpGeo.departX) + Math.abs(pHandleY - tmpGeo.departY)) * 0.4);
		let tmpCP1aY = tmpGeo.departY + tmpGeo.startDir.dy * ((Math.abs(pHandleX - tmpGeo.departX) + Math.abs(pHandleY - tmpGeo.departY)) * 0.4);

		// The tangent at the handle should be smooth: the control points on
		// either side of the handle should be collinear through it.
		// Use the direction from depart to approach as the tangent direction.
		let tmpTangentX = tmpGeo.approachX - tmpGeo.departX;
		let tmpTangentY = tmpGeo.approachY - tmpGeo.departY;
		let tmpTangentLen = Math.sqrt(tmpTangentX * tmpTangentX + tmpTangentY * tmpTangentY);
		if (tmpTangentLen < 1) tmpTangentLen = 1;
		let tmpTangentNX = tmpTangentX / tmpTangentLen;
		let tmpTangentNY = tmpTangentY / tmpTangentLen;

		let tmpTangentScale = tmpTangentLen * 0.2;

		let tmpCP1bX = pHandleX - tmpTangentNX * tmpTangentScale;
		let tmpCP1bY = pHandleY - tmpTangentNY * tmpTangentScale;
		let tmpCP2aX = pHandleX + tmpTangentNX * tmpTangentScale;
		let tmpCP2aY = pHandleY + tmpTangentNY * tmpTangentScale;

		let tmpCP2bX = tmpGeo.approachX + tmpGeo.endDir.dx * ((Math.abs(pHandleX - tmpGeo.approachX) + Math.abs(pHandleY - tmpGeo.approachY)) * 0.4);
		let tmpCP2bY = tmpGeo.approachY + tmpGeo.endDir.dy * ((Math.abs(pHandleX - tmpGeo.approachX) + Math.abs(pHandleY - tmpGeo.approachY)) * 0.4);

		return this._FlowView._PathGenerator.buildSplitBezierPathString(
			{ x: pStart.x, y: pStart.y },
			{ x: tmpGeo.departX, y: tmpGeo.departY },
			{ x: tmpCP1aX, y: tmpCP1aY },
			{ x: tmpCP1bX, y: tmpCP1bY },
			{ x: pHandleX, y: pHandleY },
			{ x: tmpCP2aX, y: tmpCP2aY },
			{ x: tmpCP2bX, y: tmpCP2bY },
			{ x: tmpGeo.approachX, y: tmpGeo.approachY },
			{ x: pEnd.x, y: pEnd.y }
		);
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
		let tmpGeo = this._computeDirectionalGeometry(pStart, pEnd);

		return this._FlowView._PathGenerator.evaluateCubicBezier(
			{ x: tmpGeo.departX, y: tmpGeo.departY },
			{ x: tmpGeo.cp1X, y: tmpGeo.cp1Y },
			{ x: tmpGeo.cp2X, y: tmpGeo.cp2Y },
			{ x: tmpGeo.approachX, y: tmpGeo.approachY },
			0.5
		);
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
		let tmpStartDir = this._FlowView._GeometryProvider.sideDirection(pStart.side || 'right');
		let tmpEndDir   = this._FlowView._GeometryProvider.sideDirection(pEnd.side   || 'left');

		let tmpStraightLen = 20;

		let tmpDepartX = pStart.x + tmpStartDir.dx * tmpStraightLen;
		let tmpDepartY = pStart.y + tmpStartDir.dy * tmpStraightLen;

		let tmpApproachX = pEnd.x + tmpEndDir.dx * tmpStraightLen;
		let tmpApproachY = pEnd.y + tmpEndDir.dy * tmpStraightLen;

		let tmpCorner1, tmpCorner2;

		if (pCorners && pCorners.corner1 && pCorners.corner2)
		{
			tmpCorner1 = pCorners.corner1;
			tmpCorner2 = pCorners.corner2;
		}
		else
		{
			let tmpAutoCorners = this._FlowView._PathGenerator.computeAutoOrthogonalCorners(
				tmpDepartX, tmpDepartY,
				tmpApproachX, tmpApproachY,
				tmpStartDir, tmpEndDir,
				pMidOffset || 0
			);
			tmpCorner1 = tmpAutoCorners.corner1;
			tmpCorner2 = tmpAutoCorners.corner2;
		}

		return this._FlowView._PathGenerator.buildOrthogonalPathString(
			{ x: pStart.x, y: pStart.y },
			{ x: tmpDepartX, y: tmpDepartY },
			tmpCorner1,
			tmpCorner2,
			{ x: tmpApproachX, y: tmpApproachY },
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
		let tmpStartDir = this._FlowView._GeometryProvider.sideDirection(pStart.side || 'right');
		let tmpEndDir   = this._FlowView._GeometryProvider.sideDirection(pEnd.side   || 'left');

		let tmpStraightLen = 20;

		let tmpDepartX = pStart.x + tmpStartDir.dx * tmpStraightLen;
		let tmpDepartY = pStart.y + tmpStartDir.dy * tmpStraightLen;
		let tmpApproachX = pEnd.x + tmpEndDir.dx * tmpStraightLen;
		let tmpApproachY = pEnd.y + tmpEndDir.dy * tmpStraightLen;

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
			tmpDepartX, tmpDepartY,
			tmpApproachX, tmpApproachY,
			tmpStartDir, tmpEndDir,
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
			// Bezier midpoint handle
			let tmpMidpoint;
			if (tmpData.HandleCustomized && tmpData.BezierHandleX != null)
			{
				tmpMidpoint = { x: tmpData.BezierHandleX, y: tmpData.BezierHandleY };
			}
			else
			{
				tmpMidpoint = this.getAutoMidpoint(pStart, pEnd);
			}

			this._createHandle(pLayer, pConnection.Hash, 'bezier-midpoint',
				tmpMidpoint.x, tmpMidpoint.y, 'pict-flow-connection-handle');
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
		let tmpCircle = this._FlowView._SVGHelperProvider.createSVGElement('circle');
		tmpCircle.setAttribute('class', pClassName);
		tmpCircle.setAttribute('cx', String(pX));
		tmpCircle.setAttribute('cy', String(pY));
		tmpCircle.setAttribute('r', '6');
		tmpCircle.setAttribute('data-element-type', 'connection-handle');
		tmpCircle.setAttribute('data-connection-hash', pConnectionHash);
		tmpCircle.setAttribute('data-handle-type', pHandleType);
		pLayer.appendChild(tmpCircle);
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

		let tmpPathElement = this._FlowView._SVGHelperProvider.createSVGElement('path');
		tmpPathElement.setAttribute('class', 'pict-flow-drag-connection');
		tmpPathElement.setAttribute('d', tmpPath);
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
