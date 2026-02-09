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
	 * Create an SVG namespace element
	 * @param {string} pTagName
	 * @returns {SVGElement}
	 */
	_createSVGElement(pTagName)
	{
		return document.createElementNS('http://www.w3.org/2000/svg', pTagName);
	}

	/**
	 * Render a connection as an SVG path with hit area
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

		let tmpPath = this._generateDirectionalPath(tmpSourcePos, tmpTargetPos);
		let tmpViewIdentifier = this._FlowView.options.ViewIdentifier;

		// Hit area (wider invisible path for easier selection)
		let tmpHitArea = this._createSVGElement('path');
		tmpHitArea.setAttribute('class', 'pict-flow-connection-hitarea');
		tmpHitArea.setAttribute('d', tmpPath);
		tmpHitArea.setAttribute('data-connection-hash', pConnection.Hash);
		tmpHitArea.setAttribute('data-element-type', 'connection-hitarea');
		pConnectionsLayer.appendChild(tmpHitArea);

		// Visible connection path
		let tmpPathElement = this._createSVGElement('path');
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
	}

	/**
	 * Get the outward unit direction vector for a given port side.
	 *
	 * @param {string} pSide - 'left', 'right', 'top', or 'bottom'
	 * @returns {{dx: number, dy: number}}
	 */
	_sideDirection(pSide)
	{
		switch (pSide)
		{
			case 'left':   return { dx: -1, dy:  0 };
			case 'right':  return { dx:  1, dy:  0 };
			case 'top':    return { dx:  0, dy: -1 };
			case 'bottom': return { dx:  0, dy:  1 };
			default:       return { dx:  1, dy:  0 };
		}
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
	 * The straight approach segment at the end ensures the arrowhead
	 * marker is always oriented correctly (pointing straight into the
	 * port) regardless of the overall curve shape.
	 *
	 * @param {{x: number, y: number, side: string}} pStart - Start port position + side
	 * @param {{x: number, y: number, side: string}} pEnd   - End port position + side
	 * @returns {string} SVG path d attribute
	 */
	_generateDirectionalPath(pStart, pEnd)
	{
		let tmpStartDir = this._sideDirection(pStart.side || 'right');
		let tmpEndDir   = this._sideDirection(pEnd.side   || 'left');

		// Length of the straight segments leaving/entering each port.
		// The arrowhead is ~20px (10 marker * 2 stroke-width), so
		// the approach segment needs to be at least that long to look
		// clean. We use 20px as a minimum.
		let tmpStraightLen = 20;

		// Departure point: offset from source port along its outward direction
		let tmpDepartX = pStart.x + tmpStartDir.dx * tmpStraightLen;
		let tmpDepartY = pStart.y + tmpStartDir.dy * tmpStraightLen;

		// Approach point: offset from target port along its OUTWARD direction
		// (i.e. away from the port, so the line segment goes inward toward the port)
		let tmpApproachX = pEnd.x + tmpEndDir.dx * tmpStraightLen;
		let tmpApproachY = pEnd.y + tmpEndDir.dy * tmpStraightLen;

		// Now compute the bezier between the departure and approach points
		let tmpDX = Math.abs(tmpApproachX - tmpDepartX);
		let tmpDY = Math.abs(tmpApproachY - tmpDepartY);
		let tmpDist = Math.sqrt(tmpDX * tmpDX + tmpDY * tmpDY);

		// Base offset for control points
		let tmpBaseOffset = Math.max(Math.min(tmpDist * 0.4, 180), 30);

		let tmpSameAxis = (tmpStartDir.dx !== 0 && tmpEndDir.dx !== 0) ||
		                  (tmpStartDir.dy !== 0 && tmpEndDir.dy !== 0);

		// Check if the ports are "facing each other" on the same axis
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

		// Control points extend outward from the departure/approach points
		let tmpCP1X = tmpDepartX + tmpStartDir.dx * tmpCurveOffset;
		let tmpCP1Y = tmpDepartY + tmpStartDir.dy * tmpCurveOffset;
		let tmpCP2X = tmpApproachX + tmpEndDir.dx * tmpCurveOffset;
		let tmpCP2Y = tmpApproachY + tmpEndDir.dy * tmpCurveOffset;

		// Build the composite path:
		// 1. Move to source port
		// 2. Line to departure point (straight out from port)
		// 3. Bezier curve to approach point
		// 4. Line to target port (straight into port — arrowhead aligns here)
		return `M ${pStart.x} ${pStart.y} L ${tmpDepartX} ${tmpDepartY} C ${tmpCP1X} ${tmpCP1Y}, ${tmpCP2X} ${tmpCP2Y}, ${tmpApproachX} ${tmpApproachY} L ${pEnd.x} ${pEnd.y}`;
	}

	/**
	 * Legacy bezier path for drag connections where we don't have side info.
	 * @param {{x: number, y: number}} pStart
	 * @param {{x: number, y: number}} pEnd
	 * @returns {string}
	 */
	_generateBezierPath(pStart, pEnd)
	{
		// During drag operations we may not have side info; default to right→left
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

		let tmpPathElement = this._createSVGElement('path');
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
