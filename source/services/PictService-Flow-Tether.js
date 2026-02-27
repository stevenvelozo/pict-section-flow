const libFableServiceProviderBase = require('fable-serviceproviderbase');

/**
 * PictService-Flow-Tether
 *
 * Centralizes all tether geometry, path generation, handle state management,
 * and SVG rendering for the lines that connect properties panels to their nodes.
 *
 * Delegates to shared providers for:
 *   - SVG element creation (_FlowView._SVGHelperProvider)
 *   - Geometry calculations (_FlowView._GeometryProvider)
 *   - Path string building (_FlowView._PathGenerator)
 *
 * Responsibilities:
 *   - Smart 4-quadrant anchor detection (which edge of the node/panel to connect)
 *   - Bezier and orthogonal path generation
 *   - Auto-midpoint and auto-corner calculations
 *   - Handle position updates during drag
 *   - Handle reset when nodes or panels move
 *   - Line mode toggling (bezier <-> orthogonal)
 *   - SVG element creation for tether lines, hit areas, and drag handles
 */
class PictServiceFlowTether extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictServiceFlowTether';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;
	}

	// ---- Anchor Calculation ----

	/**
	 * Determine which node edge and panel edge to connect based on 4-quadrant detection.
	 * Uses the relative position of the panel center to the node center.
	 *
	 * @param {Object} pPanelData - Panel data with X, Y, Width, Height
	 * @param {Object} pNodeData - Node data with X, Y, Width, Height
	 * @returns {{nodeAnchor: {x,y,side}, panelAnchor: {x,y,side}}}
	 */
	getSmartAnchors(pPanelData, pNodeData)
	{
		let tmpNodeCX = pNodeData.X + pNodeData.Width / 2;
		let tmpNodeCY = pNodeData.Y + pNodeData.Height / 2;
		let tmpPanelCX = pPanelData.X + pPanelData.Width / 2;
		let tmpPanelCY = pPanelData.Y + pPanelData.Height / 2;

		let tmpDX = tmpPanelCX - tmpNodeCX;
		let tmpDY = tmpPanelCY - tmpNodeCY;

		let tmpNodeSide, tmpPanelSide;

		if (Math.abs(tmpDX) >= Math.abs(tmpDY))
		{
			// Panel is primarily to the left or right
			if (tmpDX >= 0)
			{
				tmpNodeSide = 'right';
				tmpPanelSide = 'left';
			}
			else
			{
				tmpNodeSide = 'left';
				tmpPanelSide = 'right';
			}
		}
		else
		{
			// Panel is primarily above or below
			if (tmpDY >= 0)
			{
				tmpNodeSide = 'bottom';
				tmpPanelSide = 'top';
			}
			else
			{
				tmpNodeSide = 'top';
				tmpPanelSide = 'bottom';
			}
		}

		let tmpNodeAnchor = this._FlowView._GeometryProvider.getEdgeCenter(pNodeData, tmpNodeSide);
		let tmpPanelAnchor = this._FlowView._GeometryProvider.getEdgeCenter(pPanelData, tmpPanelSide);

		return {
			nodeAnchor: Object.assign(tmpNodeAnchor, { side: tmpNodeSide }),
			panelAnchor: Object.assign(tmpPanelAnchor, { side: tmpPanelSide })
		};
	}

	// ---- Path Generation ----

	/**
	 * Generate a bezier path between two anchor points with directional departure/approach.
	 * @param {Object} pFrom - {x, y, side}
	 * @param {Object} pTo - {x, y, side}
	 * @param {number|null} pHandleX - User-set handle X or null for auto
	 * @param {number|null} pHandleY - User-set handle Y or null for auto
	 * @returns {string} SVG path d attribute
	 */
	generateBezierPath(pFrom, pTo, pHandleX, pHandleY)
	{
		let tmpDepartDist = 20;
		let tmpFromDir = this._FlowView._GeometryProvider.sideDirection(pFrom.side);
		let tmpToDir = this._FlowView._GeometryProvider.sideDirection(pTo.side);

		let tmpDepartX = pFrom.x + tmpFromDir.dx * tmpDepartDist;
		let tmpDepartY = pFrom.y + tmpFromDir.dy * tmpDepartDist;
		let tmpApproachX = pTo.x + tmpToDir.dx * tmpDepartDist;
		let tmpApproachY = pTo.y + tmpToDir.dy * tmpDepartDist;

		if (pHandleX == null || pHandleY == null)
		{
			// Auto bezier: simple cubic from depart to approach
			let tmpSpanX = Math.abs(tmpApproachX - tmpDepartX);
			let tmpSpanY = Math.abs(tmpApproachY - tmpDepartY);
			let tmpSpan = Math.max(tmpSpanX, tmpSpanY, 40);
			let tmpCPDist = tmpSpan * 0.4;

			let tmpCP1X = tmpDepartX + tmpFromDir.dx * tmpCPDist;
			let tmpCP1Y = tmpDepartY + tmpFromDir.dy * tmpCPDist;
			let tmpCP2X = tmpApproachX + tmpToDir.dx * tmpCPDist;
			let tmpCP2Y = tmpApproachY + tmpToDir.dy * tmpCPDist;

			return this._FlowView._PathGenerator.buildBezierPathString(
				{ x: pFrom.x, y: pFrom.y },
				{ x: tmpDepartX, y: tmpDepartY },
				{ x: tmpCP1X, y: tmpCP1Y },
				{ x: tmpCP2X, y: tmpCP2Y },
				{ x: tmpApproachX, y: tmpApproachY },
				{ x: pTo.x, y: pTo.y }
			);
		}

		// User-set handle: split bezier into two segments through handle
		let tmpCP1aDist = 30;
		let tmpCP1aX = tmpDepartX + tmpFromDir.dx * tmpCP1aDist;
		let tmpCP1aY = tmpDepartY + tmpFromDir.dy * tmpCP1aDist;

		let tmpCP2aDist = 30;
		let tmpCP2aX = tmpApproachX + tmpToDir.dx * tmpCP2aDist;
		let tmpCP2aY = tmpApproachY + tmpToDir.dy * tmpCP2aDist;

		// Tangent at the handle — direction from first segment end to second segment start
		let tmpTangentX = tmpApproachX - tmpDepartX;
		let tmpTangentY = tmpApproachY - tmpDepartY;
		let tmpTangentLen = Math.sqrt(tmpTangentX * tmpTangentX + tmpTangentY * tmpTangentY) || 1;
		tmpTangentX /= tmpTangentLen;
		tmpTangentY /= tmpTangentLen;
		let tmpTangentDist = 25;

		let tmpCP1bX = pHandleX - tmpTangentX * tmpTangentDist;
		let tmpCP1bY = pHandleY - tmpTangentY * tmpTangentDist;
		let tmpCP2bX = pHandleX + tmpTangentX * tmpTangentDist;
		let tmpCP2bY = pHandleY + tmpTangentY * tmpTangentDist;

		return this._FlowView._PathGenerator.buildSplitBezierPathString(
			{ x: pFrom.x, y: pFrom.y },
			{ x: tmpDepartX, y: tmpDepartY },
			{ x: tmpCP1aX, y: tmpCP1aY },
			{ x: tmpCP1bX, y: tmpCP1bY },
			{ x: pHandleX, y: pHandleY },
			{ x: tmpCP2bX, y: tmpCP2bY },
			{ x: tmpCP2aX, y: tmpCP2aY },
			{ x: tmpApproachX, y: tmpApproachY },
			{ x: pTo.x, y: pTo.y }
		);
	}

	/**
	 * Generate an orthogonal (90-degree) path between two anchor points.
	 * @param {Object} pFrom - {x, y, side}
	 * @param {Object} pTo - {x, y, side}
	 * @param {Object|null} pCorners - {corner1: {x,y}, corner2: {x,y}} or null for auto
	 * @param {number} pMidOffset - Offset for the corridor midpoint
	 * @returns {string} SVG path d attribute
	 */
	generateOrthogonalPath(pFrom, pTo, pCorners, pMidOffset)
	{
		let tmpDepartDist = 20;
		let tmpFromDir = this._FlowView._GeometryProvider.sideDirection(pFrom.side);
		let tmpToDir = this._FlowView._GeometryProvider.sideDirection(pTo.side);

		let tmpDepartX = pFrom.x + tmpFromDir.dx * tmpDepartDist;
		let tmpDepartY = pFrom.y + tmpFromDir.dy * tmpDepartDist;
		let tmpApproachX = pTo.x + tmpToDir.dx * tmpDepartDist;
		let tmpApproachY = pTo.y + tmpToDir.dy * tmpDepartDist;

		let tmpCorner1, tmpCorner2;

		if (pCorners && pCorners.corner1 && pCorners.corner2)
		{
			tmpCorner1 = pCorners.corner1;
			tmpCorner2 = pCorners.corner2;
		}
		else
		{
			// Auto-calculate corners based on direction
			let tmpAutoCorners = this._FlowView._PathGenerator.computeAutoOrthogonalCorners(tmpDepartX, tmpDepartY, tmpApproachX, tmpApproachY, tmpFromDir, tmpToDir, pMidOffset);
			tmpCorner1 = tmpAutoCorners.corner1;
			tmpCorner2 = tmpAutoCorners.corner2;
		}

		return this._FlowView._PathGenerator.buildOrthogonalPathString(
			{ x: pFrom.x, y: pFrom.y },
			{ x: tmpDepartX, y: tmpDepartY },
			{ x: tmpCorner1.x, y: tmpCorner1.y },
			{ x: tmpCorner2.x, y: tmpCorner2.y },
			{ x: tmpApproachX, y: tmpApproachY },
			{ x: pTo.x, y: pTo.y }
		);
	}

	// ---- Handle Position Computation ----

	/**
	 * Get auto-calculated bezier midpoint for a tether at t=0.5 on the curve.
	 * @param {Object} pFrom - {x, y, side}
	 * @param {Object} pTo - {x, y, side}
	 * @returns {{x: number, y: number}}
	 */
	getAutoMidpoint(pFrom, pTo)
	{
		let tmpDepartDist = 20;
		let tmpFromDir = this._FlowView._GeometryProvider.sideDirection(pFrom.side);
		let tmpToDir = this._FlowView._GeometryProvider.sideDirection(pTo.side);

		let tmpDepartX = pFrom.x + tmpFromDir.dx * tmpDepartDist;
		let tmpDepartY = pFrom.y + tmpFromDir.dy * tmpDepartDist;
		let tmpApproachX = pTo.x + tmpToDir.dx * tmpDepartDist;
		let tmpApproachY = pTo.y + tmpToDir.dy * tmpDepartDist;

		let tmpSpanX = Math.abs(tmpApproachX - tmpDepartX);
		let tmpSpanY = Math.abs(tmpApproachY - tmpDepartY);
		let tmpSpan = Math.max(tmpSpanX, tmpSpanY, 40);
		let tmpCPDist = tmpSpan * 0.4;

		let tmpP0 = { x: tmpDepartX, y: tmpDepartY };
		let tmpP1 = { x: tmpDepartX + tmpFromDir.dx * tmpCPDist, y: tmpDepartY + tmpFromDir.dy * tmpCPDist };
		let tmpP2 = { x: tmpApproachX + tmpToDir.dx * tmpCPDist, y: tmpApproachY + tmpToDir.dy * tmpCPDist };
		let tmpP3 = { x: tmpApproachX, y: tmpApproachY };

		// Evaluate cubic bezier at t=0.5
		return this._FlowView._PathGenerator.evaluateCubicBezier(tmpP0, tmpP1, tmpP2, tmpP3, 0.5);
	}

	/**
	 * Get full orthogonal geometry including corners and midpoint for handle rendering.
	 * @param {Object} pFrom - {x, y, side}
	 * @param {Object} pTo - {x, y, side}
	 * @param {Object} pPanelData - Panel data with tether handle properties
	 * @returns {{corner1: {x,y}, corner2: {x,y}, midpoint: {x,y}}}
	 */
	getOrthoGeometry(pFrom, pTo, pPanelData)
	{
		let tmpDepartDist = 20;
		let tmpFromDir = this._FlowView._GeometryProvider.sideDirection(pFrom.side);
		let tmpToDir = this._FlowView._GeometryProvider.sideDirection(pTo.side);

		let tmpDepartX = pFrom.x + tmpFromDir.dx * tmpDepartDist;
		let tmpDepartY = pFrom.y + tmpFromDir.dy * tmpDepartDist;
		let tmpApproachX = pTo.x + tmpToDir.dx * tmpDepartDist;
		let tmpApproachY = pTo.y + tmpToDir.dy * tmpDepartDist;

		let tmpCorners;
		if (pPanelData.TetherHandleCustomized && pPanelData.TetherOrthoCorner1X != null)
		{
			tmpCorners = this._FlowView._PathGenerator.computeAutoOrthogonalCorners(tmpDepartX, tmpDepartY, tmpApproachX, tmpApproachY, tmpFromDir, tmpToDir, pPanelData.TetherOrthoMidOffset || 0);
			tmpCorners.corner1 = { x: pPanelData.TetherOrthoCorner1X, y: pPanelData.TetherOrthoCorner1Y };
			tmpCorners.corner2 = { x: pPanelData.TetherOrthoCorner2X, y: pPanelData.TetherOrthoCorner2Y };
		}
		else
		{
			tmpCorners = this._FlowView._PathGenerator.computeAutoOrthogonalCorners(tmpDepartX, tmpDepartY, tmpApproachX, tmpApproachY, tmpFromDir, tmpToDir, pPanelData.TetherOrthoMidOffset || 0);
		}

		let tmpMidpoint =
		{
			x: (tmpCorners.corner1.x + tmpCorners.corner2.x) / 2,
			y: (tmpCorners.corner1.y + tmpCorners.corner2.y) / 2
		};

		return {
			corner1: tmpCorners.corner1,
			corner2: tmpCorners.corner2,
			midpoint: tmpMidpoint
		};
	}

	// ---- Path Generation (high-level) ----

	/**
	 * Generate the SVG path string for a tether based on its panel data and anchors.
	 * @param {Object} pPanelData - Panel data with tether handle properties
	 * @param {Object} pFrom - {x, y, side} panel anchor
	 * @param {Object} pTo - {x, y, side} node anchor
	 * @returns {string} SVG path d attribute
	 */
	generatePath(pPanelData, pFrom, pTo)
	{
		let tmpLineMode = pPanelData.TetherLineMode || 'bezier';

		if (tmpLineMode === 'orthogonal')
		{
			let tmpCorners = null;
			if (pPanelData.TetherHandleCustomized && pPanelData.TetherOrthoCorner1X != null)
			{
				tmpCorners =
				{
					corner1: { x: pPanelData.TetherOrthoCorner1X, y: pPanelData.TetherOrthoCorner1Y },
					corner2: { x: pPanelData.TetherOrthoCorner2X, y: pPanelData.TetherOrthoCorner2Y }
				};
			}
			return this.generateOrthogonalPath(pFrom, pTo, tmpCorners, pPanelData.TetherOrthoMidOffset || 0);
		}
		else
		{
			let tmpHandleX = (pPanelData.TetherHandleCustomized && pPanelData.TetherBezierHandleX != null) ? pPanelData.TetherBezierHandleX : null;
			let tmpHandleY = (pPanelData.TetherHandleCustomized && pPanelData.TetherBezierHandleY != null) ? pPanelData.TetherBezierHandleY : null;
			return this.generateBezierPath(pFrom, pTo, tmpHandleX, tmpHandleY);
		}
	}

	// ---- Handle State Management ----

	/**
	 * Update a tether handle position during drag.
	 * @param {Object} pPanelData - Panel data to update
	 * @param {string} pHandleType - 'bezier-midpoint', 'ortho-corner1', 'ortho-corner2', 'ortho-midpoint'
	 * @param {number} pX
	 * @param {number} pY
	 */
	updateHandlePosition(pPanelData, pHandleType, pX, pY)
	{
		pPanelData.TetherHandleCustomized = true;

		switch (pHandleType)
		{
			case 'bezier-midpoint':
				pPanelData.TetherBezierHandleX = pX;
				pPanelData.TetherBezierHandleY = pY;
				break;

			case 'ortho-corner1':
				pPanelData.TetherOrthoCorner1X = pX;
				pPanelData.TetherOrthoCorner1Y = pY;
				break;

			case 'ortho-corner2':
				pPanelData.TetherOrthoCorner2X = pX;
				pPanelData.TetherOrthoCorner2Y = pY;
				break;

			case 'ortho-midpoint':
				// Store the desired position for offset computation
				pPanelData.TetherOrthoMidOffset = (pPanelData.TetherOrthoMidOffset || 0);
				pPanelData._TetherMidDragX = pX;
				pPanelData._TetherMidDragY = pY;
				break;
		}
	}

	/**
	 * Reset tether handle positions to auto for a single panel.
	 * Preserves TetherLineMode but clears all handle coordinates.
	 * @param {Object} pPanelData - Panel data to reset
	 */
	resetHandlePositions(pPanelData)
	{
		if (pPanelData.TetherHandleCustomized)
		{
			pPanelData.TetherHandleCustomized = false;
			pPanelData.TetherBezierHandleX = null;
			pPanelData.TetherBezierHandleY = null;
			pPanelData.TetherOrthoCorner1X = null;
			pPanelData.TetherOrthoCorner1Y = null;
			pPanelData.TetherOrthoCorner2X = null;
			pPanelData.TetherOrthoCorner2Y = null;
			pPanelData.TetherOrthoMidOffset = 0;
		}
	}

	/**
	 * Reset tether handle positions for all panels attached to a node.
	 * Called when a node moves.
	 * @param {Array} pOpenPanels - Array of all open panel data objects
	 * @param {string} pNodeHash - The node hash whose panels should be reset
	 */
	resetHandlesForNode(pOpenPanels, pNodeHash)
	{
		for (let i = 0; i < pOpenPanels.length; i++)
		{
			let tmpPanel = pOpenPanels[i];
			if (tmpPanel.NodeHash === pNodeHash)
			{
				this.resetHandlePositions(tmpPanel);
			}
		}
	}

	/**
	 * Toggle tether line mode between bezier and orthogonal.
	 * Resets handle positions on toggle.
	 * @param {Object} pPanelData - Panel data to toggle
	 * @returns {string} The new line mode ('bezier' or 'orthogonal')
	 */
	toggleLineMode(pPanelData)
	{
		let tmpCurrentMode = pPanelData.TetherLineMode || 'bezier';
		pPanelData.TetherLineMode = (tmpCurrentMode === 'bezier') ? 'orthogonal' : 'bezier';

		pPanelData.TetherHandleCustomized = false;
		pPanelData.TetherBezierHandleX = null;
		pPanelData.TetherBezierHandleY = null;
		pPanelData.TetherOrthoCorner1X = null;
		pPanelData.TetherOrthoCorner1Y = null;
		pPanelData.TetherOrthoCorner2X = null;
		pPanelData.TetherOrthoCorner2Y = null;
		pPanelData.TetherOrthoMidOffset = 0;

		return pPanelData.TetherLineMode;
	}

	// ---- SVG Rendering ----

	/**
	 * Render a tether from a panel to its node.
	 * Creates SVG path elements for the line and hit area, plus drag handles when selected.
	 *
	 * @param {Object} pPanelData - Panel data with position and tether properties
	 * @param {Object} pNodeData - Node data with position
	 * @param {SVGGElement} pTethersLayer - SVG group to append elements to
	 * @param {boolean} pIsSelected - Whether this tether is currently selected
	 * @param {string} pViewIdentifier - The flow view identifier (for marker URL)
	 */
	renderTether(pPanelData, pNodeData, pTethersLayer, pIsSelected, pViewIdentifier)
	{
		if (!pNodeData) return;

		let tmpAnchors = this.getSmartAnchors(pPanelData, pNodeData);
		let tmpFrom = tmpAnchors.panelAnchor;
		let tmpTo = tmpAnchors.nodeAnchor;

		let tmpPath = this.generatePath(pPanelData, tmpFrom, tmpTo);

		// Hit area (wider invisible path for easier click targeting)
		let tmpHitArea = this._FlowView._SVGHelperProvider.createSVGElement('path');
		tmpHitArea.setAttribute('class', 'pict-flow-tether-hitarea');
		tmpHitArea.setAttribute('d', tmpPath);
		tmpHitArea.setAttribute('data-element-type', 'tether-hitarea');
		tmpHitArea.setAttribute('data-panel-hash', pPanelData.Hash);
		pTethersLayer.appendChild(tmpHitArea);

		// Visible tether path
		let tmpPathElement = this._FlowView._SVGHelperProvider.createSVGElement('path');
		tmpPathElement.setAttribute('class', `pict-flow-tether-line${pIsSelected ? ' selected' : ''}`);
		tmpPathElement.setAttribute('d', tmpPath);
		tmpPathElement.setAttribute('marker-end', `url(#flow-tether-arrowhead-${pViewIdentifier})`);
		tmpPathElement.setAttribute('data-element-type', 'tether');
		tmpPathElement.setAttribute('data-panel-hash', pPanelData.Hash);
		pTethersLayer.appendChild(tmpPathElement);

		// Render drag handles when selected
		if (pIsSelected)
		{
			this._renderHandles(pPanelData, pTethersLayer, tmpFrom, tmpTo);
		}
	}

	/**
	 * Render drag handles for a selected tether.
	 * @param {Object} pPanelData
	 * @param {SVGGElement} pTethersLayer
	 * @param {Object} pFrom - Panel anchor {x, y, side}
	 * @param {Object} pTo - Node anchor {x, y, side}
	 */
	_renderHandles(pPanelData, pTethersLayer, pFrom, pTo)
	{
		let tmpLineMode = pPanelData.TetherLineMode || 'bezier';

		if (tmpLineMode === 'orthogonal')
		{
			let tmpGeom = this.getOrthoGeometry(pFrom, pTo, pPanelData);

			// Corner 1 handle
			this._createHandle(pTethersLayer, pPanelData.Hash, 'ortho-corner1',
				tmpGeom.corner1.x, tmpGeom.corner1.y, 'pict-flow-tether-handle');

			// Midpoint handle
			this._createHandle(pTethersLayer, pPanelData.Hash, 'ortho-midpoint',
				tmpGeom.midpoint.x, tmpGeom.midpoint.y, 'pict-flow-tether-handle-midpoint');

			// Corner 2 handle
			this._createHandle(pTethersLayer, pPanelData.Hash, 'ortho-corner2',
				tmpGeom.corner2.x, tmpGeom.corner2.y, 'pict-flow-tether-handle');
		}
		else
		{
			// Bezier: single midpoint handle
			let tmpMidX, tmpMidY;
			if (pPanelData.TetherHandleCustomized && pPanelData.TetherBezierHandleX != null)
			{
				tmpMidX = pPanelData.TetherBezierHandleX;
				tmpMidY = pPanelData.TetherBezierHandleY;
			}
			else
			{
				let tmpMid = this.getAutoMidpoint(pFrom, pTo);
				tmpMidX = tmpMid.x;
				tmpMidY = tmpMid.y;
			}

			this._createHandle(pTethersLayer, pPanelData.Hash, 'bezier-midpoint',
				tmpMidX, tmpMidY, 'pict-flow-tether-handle-midpoint');
		}
	}

	/**
	 * Create a single tether drag handle circle.
	 * @param {SVGGElement} pLayer
	 * @param {string} pPanelHash
	 * @param {string} pHandleType
	 * @param {number} pX
	 * @param {number} pY
	 * @param {string} pClassName
	 */
	_createHandle(pLayer, pPanelHash, pHandleType, pX, pY, pClassName)
	{
		let tmpCircle = this._FlowView._SVGHelperProvider.createSVGElement('circle');
		tmpCircle.setAttribute('class', pClassName);
		tmpCircle.setAttribute('cx', String(pX));
		tmpCircle.setAttribute('cy', String(pY));
		tmpCircle.setAttribute('r', '6');
		tmpCircle.setAttribute('data-element-type', 'tether-handle');
		tmpCircle.setAttribute('data-panel-hash', pPanelHash);
		tmpCircle.setAttribute('data-handle-type', pHandleType);
		pLayer.appendChild(tmpCircle);
	}
}

module.exports = PictServiceFlowTether;
