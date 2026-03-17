const libFableServiceProviderBase = require('fable-serviceproviderbase');

/**
 * PictService-Flow-PathGenerator
 *
 * Centralizes SVG path generation for the flow diagram.
 * Provides shared building blocks used by both the ConnectionRenderer
 * (port-to-port connections) and the TetherService (panel-to-node tethers).
 *
 * Responsibilities:
 *   - Departure/approach point calculation from anchors
 *   - Auto orthogonal corner computation for right-angle paths
 *   - Cubic bezier evaluation at arbitrary parameter t
 *   - SVG path string assembly (bezier, split-bezier, orthogonal)
 */
class PictServiceFlowPathGenerator extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictServiceFlowPathGenerator';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;
	}

	// ---- Departure / Approach Calculation ----

	/**
	 * Compute departure and approach points from start/end anchors.
	 * The departure point extends outward from the start in its side direction,
	 * and the approach point extends outward from the end in its side direction.
	 *
	 * @param {{x: number, y: number, side: string}} pFrom - Start anchor with side
	 * @param {{x: number, y: number, side: string}} pTo - End anchor with side
	 * @param {number} pDepartDist - Distance for departure/approach straight segments
	 * @returns {{departX: number, departY: number, approachX: number, approachY: number, fromDir: {dx: number, dy: number}, toDir: {dx: number, dy: number}}}
	 */
	computeDepartApproach(pFrom, pTo, pDepartDist)
	{
		let tmpGeometry = this._FlowView._GeometryProvider;

		let tmpFromDir = tmpGeometry.sideDirection(pFrom.side || 'right');
		let tmpToDir = tmpGeometry.sideDirection(pTo.side || 'left');

		return {
			departX: pFrom.x + tmpFromDir.dx * pDepartDist,
			departY: pFrom.y + tmpFromDir.dy * pDepartDist,
			approachX: pTo.x + tmpToDir.dx * pDepartDist,
			approachY: pTo.y + tmpToDir.dy * pDepartDist,
			fromDir: tmpFromDir,
			toDir: tmpToDir
		};
	}

	// ---- Orthogonal Corner Calculation ----

	/**
	 * Compute auto orthogonal corners for an L-shaped or Z-shaped path.
	 * Determines corner placement based on departure/approach directions.
	 *
	 * Used by both connection and tether renderers for right-angle paths.
	 *
	 * @param {number} pDepartX
	 * @param {number} pDepartY
	 * @param {number} pApproachX
	 * @param {number} pApproachY
	 * @param {{dx: number, dy: number}} pFromDir - Departure direction vector
	 * @param {{dx: number, dy: number}} pToDir - Approach direction vector
	 * @param {number} pMidOffset - Offset for the corridor midpoint
	 * @returns {{corner1: {x: number, y: number}, corner2: {x: number, y: number}, midpoint: {x: number, y: number}}}
	 */
	computeAutoOrthogonalCorners(pDepartX, pDepartY, pApproachX, pApproachY, pFromDir, pToDir, pMidOffset)
	{
		let tmpOffset = pMidOffset || 0;
		let tmpFromHoriz = Math.abs(pFromDir.dx) > 0;
		let tmpToHoriz = Math.abs(pToDir.dx) > 0;

		let tmpCorner1, tmpCorner2, tmpMidpoint;

		if (tmpFromHoriz && tmpToHoriz)
		{
			// Both horizontal departure/approach: corridor is vertical
			let tmpMidX = (pDepartX + pApproachX) / 2 + tmpOffset;
			tmpCorner1 = { x: tmpMidX, y: pDepartY };
			tmpCorner2 = { x: tmpMidX, y: pApproachY };
			tmpMidpoint = { x: tmpMidX, y: (pDepartY + pApproachY) / 2 };
		}
		else if (!tmpFromHoriz && !tmpToHoriz)
		{
			// Both vertical: corridor is horizontal
			let tmpMidY = (pDepartY + pApproachY) / 2 + tmpOffset;
			tmpCorner1 = { x: pDepartX, y: tmpMidY };
			tmpCorner2 = { x: pApproachX, y: tmpMidY };
			tmpMidpoint = { x: (pDepartX + pApproachX) / 2, y: tmpMidY };
		}
		else if (tmpFromHoriz && !tmpToHoriz)
		{
			// Horizontal→Vertical: single L-bend
			tmpCorner1 = { x: pApproachX + tmpOffset, y: pDepartY };
			tmpCorner2 = { x: pApproachX + tmpOffset, y: pApproachY };
			tmpMidpoint = { x: pApproachX + tmpOffset, y: (pDepartY + pApproachY) / 2 };
		}
		else
		{
			// Vertical→Horizontal: single L-bend
			tmpCorner1 = { x: pDepartX, y: pApproachY + tmpOffset };
			tmpCorner2 = { x: pApproachX, y: pApproachY + tmpOffset };
			tmpMidpoint = { x: (pDepartX + pApproachX) / 2, y: pApproachY + tmpOffset };
		}

		return { corner1: tmpCorner1, corner2: tmpCorner2, midpoint: tmpMidpoint };
	}

	// ---- Bezier Evaluation ----

	/**
	 * Evaluate a cubic bezier curve at parameter t.
	 * B(t) = (1-t)³P0 + 3(1-t)²tP1 + 3(1-t)t²P2 + t³P3
	 *
	 * @param {{x: number, y: number}} pP0 - Start point
	 * @param {{x: number, y: number}} pP1 - First control point
	 * @param {{x: number, y: number}} pP2 - Second control point
	 * @param {{x: number, y: number}} pP3 - End point
	 * @param {number} pT - Parameter in range [0, 1]
	 * @returns {{x: number, y: number}}
	 */
	evaluateCubicBezier(pP0, pP1, pP2, pP3, pT)
	{
		let tmpOMT = 1 - pT;
		let tmpOMT2 = tmpOMT * tmpOMT;
		let tmpOMT3 = tmpOMT2 * tmpOMT;
		let tmpT2 = pT * pT;
		let tmpT3 = tmpT2 * pT;

		return {
			x: tmpOMT3 * pP0.x + 3 * tmpOMT2 * pT * pP1.x + 3 * tmpOMT * tmpT2 * pP2.x + tmpT3 * pP3.x,
			y: tmpOMT3 * pP0.y + 3 * tmpOMT2 * pT * pP1.y + 3 * tmpOMT * tmpT2 * pP2.y + tmpT3 * pP3.y
		};
	}

	// ---- SVG Path String Assembly ----

	/**
	 * Build an SVG bezier path string.
	 * Pattern: M start L depart C cp1, cp2, approach L end
	 *
	 * @param {{x: number, y: number}} pStart - Start point
	 * @param {{x: number, y: number}} pDepart - Departure point after straight segment
	 * @param {{x: number, y: number}} pCP1 - First control point
	 * @param {{x: number, y: number}} pCP2 - Second control point
	 * @param {{x: number, y: number}} pApproach - Approach point before final straight segment
	 * @param {{x: number, y: number}} pEnd - End point
	 * @returns {string} SVG path d attribute
	 */
	buildBezierPathString(pStart, pDepart, pCP1, pCP2, pApproach, pEnd)
	{
		return `M ${pStart.x} ${pStart.y} L ${pDepart.x} ${pDepart.y} C ${pCP1.x} ${pCP1.y}, ${pCP2.x} ${pCP2.y}, ${pApproach.x} ${pApproach.y} L ${pEnd.x} ${pEnd.y}`;
	}

	/**
	 * Build an SVG split bezier path string (two cubic segments through a handle point).
	 * Pattern: M start L depart C cp1a, cp1b, handle C cp2a, cp2b, approach L end
	 *
	 * @param {{x: number, y: number}} pStart
	 * @param {{x: number, y: number}} pDepart
	 * @param {{x: number, y: number}} pCP1a - First segment's first control point
	 * @param {{x: number, y: number}} pCP1b - First segment's second control point
	 * @param {{x: number, y: number}} pHandle - Handle point where the two segments meet
	 * @param {{x: number, y: number}} pCP2a - Second segment's first control point
	 * @param {{x: number, y: number}} pCP2b - Second segment's second control point
	 * @param {{x: number, y: number}} pApproach
	 * @param {{x: number, y: number}} pEnd
	 * @returns {string} SVG path d attribute
	 */
	buildSplitBezierPathString(pStart, pDepart, pCP1a, pCP1b, pHandle, pCP2a, pCP2b, pApproach, pEnd)
	{
		return `M ${pStart.x} ${pStart.y} L ${pDepart.x} ${pDepart.y} C ${pCP1a.x} ${pCP1a.y}, ${pCP1b.x} ${pCP1b.y}, ${pHandle.x} ${pHandle.y} C ${pCP2a.x} ${pCP2a.y}, ${pCP2b.x} ${pCP2b.y}, ${pApproach.x} ${pApproach.y} L ${pEnd.x} ${pEnd.y}`;
	}

	/**
	 * Build an SVG multi-segment bezier path string.
	 * Generates N+1 cubic bezier segments through N handle points.
	 *
	 * Pattern: M start L depart C cp,cp,handle[0] C cp,cp,handle[1] ... C cp,cp,approach L end
	 *
	 * Control points are computed using Catmull-Rom-to-Bezier conversion
	 * for C1 (smooth tangent) continuity at every handle.
	 *
	 * @param {{x: number, y: number}} pStart - Port anchor start
	 * @param {{x: number, y: number}} pDepart - Departure point after straight segment
	 * @param {Array<{x: number, y: number}>} pHandles - Ordered handle waypoints
	 * @param {{x: number, y: number}} pApproach - Approach point before final straight segment
	 * @param {{x: number, y: number}} pEnd - Port anchor end
	 * @param {{dx: number, dy: number}} pStartDir - Departure direction unit vector
	 * @param {{dx: number, dy: number}} pEndDir - Approach direction unit vector
	 * @returns {string} SVG path d attribute
	 */
	buildMultiBezierPathString(pStart, pDepart, pHandles, pApproach, pEnd, pStartDir, pEndDir)
	{
		// Build the full list of waypoints: depart, handle[0..N-1], approach
		let tmpWaypoints = [pDepart];
		for (let i = 0; i < pHandles.length; i++)
		{
			tmpWaypoints.push(pHandles[i]);
		}
		tmpWaypoints.push(pApproach);

		let tmpPath = `M ${pStart.x} ${pStart.y} L ${pDepart.x} ${pDepart.y}`;

		for (let i = 0; i < tmpWaypoints.length - 1; i++)
		{
			let tmpFrom = tmpWaypoints[i];
			let tmpTo = tmpWaypoints[i + 1];

			let tmpSegDX = tmpTo.x - tmpFrom.x;
			let tmpSegDY = tmpTo.y - tmpFrom.y;
			let tmpSegLen = Math.sqrt(tmpSegDX * tmpSegDX + tmpSegDY * tmpSegDY);
			if (tmpSegLen < 1)
			{
				tmpSegLen = 1;
			}
			let tmpScale = tmpSegLen * 0.35;

			// Tangent at tmpFrom
			let tmpTanFromX, tmpTanFromY;
			if (i === 0)
			{
				// First segment: use the port departure direction
				tmpTanFromX = pStartDir.dx;
				tmpTanFromY = pStartDir.dy;
			}
			else
			{
				// Interior handle: tangent points from previous toward next waypoint
				let tmpPrev = tmpWaypoints[i - 1];
				let tmpNext = tmpWaypoints[i + 1];
				tmpTanFromX = tmpNext.x - tmpPrev.x;
				tmpTanFromY = tmpNext.y - tmpPrev.y;
				let tmpTanLen = Math.sqrt(tmpTanFromX * tmpTanFromX + tmpTanFromY * tmpTanFromY);
				if (tmpTanLen < 1) tmpTanLen = 1;
				tmpTanFromX /= tmpTanLen;
				tmpTanFromY /= tmpTanLen;
			}

			// Tangent at tmpTo
			let tmpTanToX, tmpTanToY;
			if (i === tmpWaypoints.length - 2)
			{
				// Last segment: use the port approach direction (reversed for incoming)
				tmpTanToX = -pEndDir.dx;
				tmpTanToY = -pEndDir.dy;
			}
			else
			{
				// Interior handle: tangent points from previous toward next waypoint
				let tmpPrev = tmpWaypoints[i];
				let tmpNext = tmpWaypoints[i + 2];
				tmpTanToX = tmpNext.x - tmpPrev.x;
				tmpTanToY = tmpNext.y - tmpPrev.y;
				let tmpTanLen = Math.sqrt(tmpTanToX * tmpTanToX + tmpTanToY * tmpTanToY);
				if (tmpTanLen < 1) tmpTanLen = 1;
				tmpTanToX /= tmpTanLen;
				tmpTanToY /= tmpTanLen;
			}

			let tmpCP1X = tmpFrom.x + tmpTanFromX * tmpScale;
			let tmpCP1Y = tmpFrom.y + tmpTanFromY * tmpScale;
			let tmpCP2X = tmpTo.x - tmpTanToX * tmpScale;
			let tmpCP2Y = tmpTo.y - tmpTanToY * tmpScale;

			tmpPath += ` C ${tmpCP1X} ${tmpCP1Y}, ${tmpCP2X} ${tmpCP2Y}, ${tmpTo.x} ${tmpTo.y}`;
		}

		tmpPath += ` L ${pEnd.x} ${pEnd.y}`;

		return tmpPath;
	}

	/**
	 * Build an SVG orthogonal (right-angle) path string.
	 * Pattern: M start L depart L corner1 L corner2 L approach L end
	 *
	 * @param {{x: number, y: number}} pStart
	 * @param {{x: number, y: number}} pDepart
	 * @param {{x: number, y: number}} pCorner1
	 * @param {{x: number, y: number}} pCorner2
	 * @param {{x: number, y: number}} pApproach
	 * @param {{x: number, y: number}} pEnd
	 * @returns {string} SVG path d attribute
	 */
	buildOrthogonalPathString(pStart, pDepart, pCorner1, pCorner2, pApproach, pEnd)
	{
		return `M ${pStart.x} ${pStart.y} L ${pDepart.x} ${pDepart.y} L ${pCorner1.x} ${pCorner1.y} L ${pCorner2.x} ${pCorner2.y} L ${pApproach.x} ${pApproach.y} L ${pEnd.x} ${pEnd.y}`;
	}

	// ---- Directional Geometry ----

	/**
	 * Compute full directional geometry between two port anchors, including
	 * departure/approach points and bezier control points.
	 *
	 * Uses sophisticated facing detection: when ports face each other the
	 * curve offset scales with inline distance; when ports are on the same
	 * axis but not facing, a wider offset prevents the path from collapsing;
	 * perpendicular exits use a moderate offset.
	 *
	 * @param {{x: number, y: number, side: string}} pStart
	 * @param {{x: number, y: number, side: string}} pEnd
	 * @returns {{departX: number, departY: number, approachX: number, approachY: number, cp1X: number, cp1Y: number, cp2X: number, cp2Y: number, startDir: {dx: number, dy: number}, endDir: {dx: number, dy: number}}}
	 */
	computeDirectionalGeometry(pStart, pEnd)
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

	// ---- Distance Utilities ----

	/**
	 * Distance from point (pPX, pPY) to line segment (pAX, pAY)-(pBX, pBY).
	 * Pure math utility, no state.
	 *
	 * @param {number} pPX
	 * @param {number} pPY
	 * @param {number} pAX
	 * @param {number} pAY
	 * @param {number} pBX
	 * @param {number} pBY
	 * @returns {number}
	 */
	distanceToSegment(pPX, pPY, pAX, pAY, pBX, pBY)
	{
		let tmpDX = pBX - pAX;
		let tmpDY = pBY - pAY;
		let tmpLenSq = tmpDX * tmpDX + tmpDY * tmpDY;

		if (tmpLenSq < 0.001)
		{
			// Degenerate segment
			let tmpDPX = pPX - pAX;
			let tmpDPY = pPY - pAY;
			return Math.sqrt(tmpDPX * tmpDPX + tmpDPY * tmpDPY);
		}

		// Project point onto segment, clamped to [0, 1]
		let tmpT = ((pPX - pAX) * tmpDX + (pPY - pAY) * tmpDY) / tmpLenSq;
		if (tmpT < 0) tmpT = 0;
		if (tmpT > 1) tmpT = 1;

		let tmpClosestX = pAX + tmpT * tmpDX;
		let tmpClosestY = pAY + tmpT * tmpDY;
		let tmpDistX = pPX - tmpClosestX;
		let tmpDistY = pPY - tmpClosestY;
		return Math.sqrt(tmpDistX * tmpDistX + tmpDistY * tmpDistY);
	}

	// ---- Auto Midpoint Calculation ----

	/**
	 * Get the auto-calculated midpoint of the default bezier curve between
	 * two port anchors, using the full directional geometry (facing detection,
	 * adaptive curve offsets). Evaluates the cubic bezier at t=0.5.
	 *
	 * Used by ConnectionRenderer for connection midpoints.
	 *
	 * @param {{x: number, y: number, side: string}} pStart
	 * @param {{x: number, y: number, side: string}} pEnd
	 * @returns {{x: number, y: number}}
	 */
	getAutoMidpoint(pStart, pEnd)
	{
		let tmpGeo = this.computeDirectionalGeometry(pStart, pEnd);

		return this.evaluateCubicBezier(
			{ x: tmpGeo.departX, y: tmpGeo.departY },
			{ x: tmpGeo.cp1X, y: tmpGeo.cp1Y },
			{ x: tmpGeo.cp2X, y: tmpGeo.cp2Y },
			{ x: tmpGeo.approachX, y: tmpGeo.approachY },
			0.5
		);
	}

	/**
	 * Get the auto-calculated midpoint using simple span-based control points.
	 * Uses computeDepartApproach for basic geometry, then span * 0.4 for
	 * control point distance. Evaluates the cubic bezier at t=0.5.
	 *
	 * Used by TetherService for tether midpoints.
	 *
	 * @param {{x: number, y: number, side: string}} pFrom
	 * @param {{x: number, y: number, side: string}} pTo
	 * @param {number} pDepartDist - Departure/approach distance
	 * @returns {{x: number, y: number}}
	 */
	getAutoMidpointSimple(pFrom, pTo, pDepartDist)
	{
		let tmpDA = this.computeDepartApproach(pFrom, pTo, pDepartDist);

		let tmpSpanX = Math.abs(tmpDA.approachX - tmpDA.departX);
		let tmpSpanY = Math.abs(tmpDA.approachY - tmpDA.departY);
		let tmpSpan = Math.max(tmpSpanX, tmpSpanY, 40);
		let tmpCPDist = tmpSpan * 0.4;

		let tmpP0 = { x: tmpDA.departX, y: tmpDA.departY };
		let tmpP1 = { x: tmpDA.departX + tmpDA.fromDir.dx * tmpCPDist, y: tmpDA.departY + tmpDA.fromDir.dy * tmpCPDist };
		let tmpP2 = { x: tmpDA.approachX + tmpDA.toDir.dx * tmpCPDist, y: tmpDA.approachY + tmpDA.toDir.dy * tmpCPDist };
		let tmpP3 = { x: tmpDA.approachX, y: tmpDA.approachY };

		return this.evaluateCubicBezier(tmpP0, tmpP1, tmpP2, tmpP3, 0.5);
	}
}

module.exports = PictServiceFlowPathGenerator;
