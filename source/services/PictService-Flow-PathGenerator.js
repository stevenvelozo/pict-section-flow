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
}

module.exports = PictServiceFlowPathGenerator;
