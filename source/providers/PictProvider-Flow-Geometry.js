const libFableServiceProviderBase = require('fable-serviceproviderbase');

/**
 * PictProvider-Flow-Geometry
 *
 * Shared geometry utilities for the flow diagram.
 * Provides direction vectors and edge center calculations used by
 * connections, tethers, and other flow components.
 *
 * Port Side values (12 positions):
 *
 *   Top edge:    'top-left'     'top'     'top-right'
 *   Left edge:   'left-top'     'left'    'left-bottom'
 *   Right edge:  'right-top'    'right'   'right-bottom'
 *   Bottom edge: 'bottom-left'  'bottom'  'bottom-right'
 *
 * The old 4-value sides ('left', 'right', 'top', 'bottom') map to
 * the middle position on each edge for backward compatibility.
 */
class PictProviderFlowGeometry extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictProviderFlowGeometry';
	}

	/**
	 * Extract the edge name from a Side value.
	 *
	 * Maps all 12 positions (and the 4 legacy values) back to
	 * the edge they sit on: 'left', 'right', 'top', or 'bottom'.
	 *
	 * @param {string} pSide - Any valid Side value
	 * @returns {string} The edge: 'left', 'right', 'top', or 'bottom'
	 */
	getEdgeFromSide(pSide)
	{
		switch (pSide)
		{
			case 'left-top':
			case 'left':
			case 'left-bottom':
				return 'left';

			case 'right-top':
			case 'right':
			case 'right-bottom':
				return 'right';

			case 'top-left':
			case 'top':
			case 'top-right':
				return 'top';

			case 'bottom-left':
			case 'bottom':
			case 'bottom-right':
				return 'bottom';

			default:
				return 'right';
		}
	}

	/**
	 * Get the outward unit direction vector for a given side.
	 *
	 * All positions on the same edge share the same direction vector.
	 *
	 * @param {string} pSide - Any valid Side value (12 positions or 4 legacy)
	 * @returns {{dx: number, dy: number}}
	 */
	sideDirection(pSide)
	{
		switch (this.getEdgeFromSide(pSide))
		{
			case 'left':   return { dx: -1, dy: 0 };
			case 'right':  return { dx: 1, dy: 0 };
			case 'top':    return { dx: 0, dy: -1 };
			case 'bottom': return { dx: 0, dy: 1 };
			default:       return { dx: 1, dy: 0 };
		}
	}

	/**
	 * Get the center point of a rectangle's edge.
	 * Works for any object with X, Y, Width, Height properties
	 * (nodes, panels, or any rectangular element).
	 *
	 * @param {Object} pRectData - Object with X, Y, Width, Height
	 * @param {string} pSide - 'left', 'right', 'top', 'bottom'
	 * @returns {{x: number, y: number}}
	 */
	getEdgeCenter(pRectData, pSide)
	{
		switch (pSide)
		{
			case 'left':
				return { x: pRectData.X, y: pRectData.Y + pRectData.Height / 2 };
			case 'right':
				return { x: pRectData.X + pRectData.Width, y: pRectData.Y + pRectData.Height / 2 };
			case 'top':
				return { x: pRectData.X + pRectData.Width / 2, y: pRectData.Y };
			case 'bottom':
				return { x: pRectData.X + pRectData.Width / 2, y: pRectData.Y + pRectData.Height };
			default:
				return { x: pRectData.X + pRectData.Width, y: pRectData.Y + pRectData.Height / 2 };
		}
	}

	/**
	 * Calculate a port's local position relative to node origin.
	 *
	 * Supports 12 positions (3 zones per edge).  For left/right edges,
	 * the body area below the title bar is divided into three vertical zones
	 * (start/middle/end).  For top/bottom edges, the full width is divided
	 * into three horizontal zones.
	 *
	 * Multiple ports sharing the same Side value distribute evenly within
	 * their zone.
	 *
	 * @param {string} pSide - Side value (any of 12 positions or 4 legacy)
	 * @param {number} pIndex - Index of this port within its Side group
	 * @param {number} pTotal - Total ports with this Side value
	 * @param {number} pWidth - Node width
	 * @param {number} pHeight - Node height
	 * @param {number} pTitleBarHeight - Height of the node title bar
	 * @returns {{x: number, y: number}}
	 */
	getPortLocalPosition(pSide, pIndex, pTotal, pWidth, pHeight, pTitleBarHeight)
	{
		let tmpEdge = this.getEdgeFromSide(pSide);
		let tmpZone = this._getZoneFromSide(pSide);

		if (tmpEdge === 'left' || tmpEdge === 'right')
		{
			let tmpX = (tmpEdge === 'left') ? 0 : pWidth;
			let tmpBodyHeight = pHeight - pTitleBarHeight;
			let tmpZoneStart = pTitleBarHeight + tmpBodyHeight * tmpZone.start;
			let tmpZoneHeight = tmpBodyHeight * (tmpZone.end - tmpZone.start);
			let tmpSpacing = tmpZoneHeight / (pTotal + 1);
			let tmpY = tmpZoneStart + tmpSpacing * (pIndex + 1);
			return { x: tmpX, y: tmpY };
		}

		// top or bottom
		let tmpY = (tmpEdge === 'top') ? 0 : pHeight;
		let tmpZoneStart = pWidth * tmpZone.start;
		let tmpZoneWidth = pWidth * (tmpZone.end - tmpZone.start);
		let tmpSpacing = tmpZoneWidth / (pTotal + 1);
		let tmpX = tmpZoneStart + tmpSpacing * (pIndex + 1);
		return { x: tmpX, y: tmpY };
	}

	/**
	 * Get the zone fraction (start, end) for a Side value.
	 *
	 * Each edge is divided into three zones of equal size:
	 *   start:  0.0 — 0.333
	 *   middle: 0.333 — 0.667
	 *   end:    0.667 — 1.0
	 *
	 * @param {string} pSide
	 * @returns {{start: number, end: number}}
	 */
	_getZoneFromSide(pSide)
	{
		switch (pSide)
		{
			// Left edge: top, middle, bottom
			case 'left-top':     return { start: 0.0,   end: 0.333 };
			case 'left':         return { start: 0.333, end: 0.667 };
			case 'left-bottom':  return { start: 0.667, end: 1.0 };

			// Right edge: top, middle, bottom
			case 'right-top':    return { start: 0.0,   end: 0.333 };
			case 'right':        return { start: 0.333, end: 0.667 };
			case 'right-bottom': return { start: 0.667, end: 1.0 };

			// Top edge: left, middle, right
			case 'top-left':     return { start: 0.0,   end: 0.333 };
			case 'top':          return { start: 0.333, end: 0.667 };
			case 'top-right':    return { start: 0.667, end: 1.0 };

			// Bottom edge: left, middle, right
			case 'bottom-left':  return { start: 0.0,   end: 0.333 };
			case 'bottom':       return { start: 0.333, end: 0.667 };
			case 'bottom-right': return { start: 0.667, end: 1.0 };

			// Fallback: full range (legacy behavior)
			default:             return { start: 0.0,   end: 1.0 };
		}
	}
}

module.exports = PictProviderFlowGeometry;
