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
	 * the body area below the title bar is divided into vertical zones.
	 * For top/bottom edges, the full width is divided into horizontal zones.
	 *
	 * When pPortCountsBySide is provided, zone fractions are computed
	 * proportionally based on actual port counts (adaptive zones).
	 * Otherwise, fixed 1/3 zones are used for backward compatibility.
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
	 * @param {Object} [pPortCountsBySide] - Optional map of Side → port count
	 *        for all ports on the node.  Enables adaptive zone sizing.
	 * @returns {{x: number, y: number}}
	 */
	getPortLocalPosition(pSide, pIndex, pTotal, pWidth, pHeight, pTitleBarHeight, pPortCountsBySide)
	{
		let tmpEdge = this.getEdgeFromSide(pSide);
		let tmpZone = pPortCountsBySide
			? this._computeAdaptiveZone(pSide, pPortCountsBySide)
			: this._getZoneFromSide(pSide);

		// Use the fixed zone to decide alignment intent (start/center/end)
		// because adaptive zones shift boundaries when neighbouring zones
		// are empty, which would break alignment decisions.
		let tmpFixedZone = this._getZoneFromSide(pSide);

		// Minimum spacing between port centers (px)
		let tmpMinSpacing = 16;

		// Reserve space at the bottom of the body so that port badges
		// never overlap the panel-indicator icon (10×10 rect at bottom-right)
		// and always leave a visible gap above the node bottom edge.
		let tmpBottomPad = 16;

		// Determine alignment from the fixed zone position:
		//   start zone  (0.000 – 0.333) → start-align (offset 0)
		//   middle zone (0.333 – 0.667) → center
		//   end zone    (0.667 – 1.000) → end-align
		let tmpAlignment = 'start';
		if (tmpFixedZone.start >= 0.5)
		{
			tmpAlignment = 'end';
		}
		else if (tmpFixedZone.start >= 0.17)
		{
			tmpAlignment = 'center';
		}

		if (tmpEdge === 'left' || tmpEdge === 'right')
		{
			let tmpX = (tmpEdge === 'left') ? 0 : pWidth;
			let tmpBodyHeight = pHeight - pTitleBarHeight - tmpBottomPad;
			let tmpZoneStart = pTitleBarHeight + tmpBodyHeight * tmpZone.start;
			let tmpZoneHeight = tmpBodyHeight * (tmpZone.end - tmpZone.start);

			// Use fixed spacing so port gaps stay consistent across cards
			// even when one edge drives the card height beyond what the
			// other needs.
			let tmpSpacing = tmpMinSpacing;
			let tmpGroupHeight = tmpSpacing * (pTotal + 1);
			let tmpSlack = tmpZoneHeight - tmpGroupHeight;
			if (tmpSlack < 0)
			{
				tmpSlack = 0;
			}

			let tmpAlignOffset = 0;
			if (tmpAlignment === 'end')
			{
				tmpAlignOffset = tmpSlack;
			}
			else if (tmpAlignment === 'center')
			{
				tmpAlignOffset = tmpSlack / 2;
			}

			let tmpY = tmpZoneStart + tmpAlignOffset + tmpSpacing * (pIndex + 1);
			return { x: tmpX, y: tmpY };
		}

		// top or bottom
		let tmpY = (tmpEdge === 'top') ? 0 : pHeight;
		let tmpZoneStart = pWidth * tmpZone.start;
		let tmpZoneWidth = pWidth * (tmpZone.end - tmpZone.start);

		let tmpSpacing = tmpMinSpacing;
		let tmpGroupWidth = tmpSpacing * (pTotal + 1);
		let tmpSlack = tmpZoneWidth - tmpGroupWidth;
		if (tmpSlack < 0)
		{
			tmpSlack = 0;
		}

		let tmpAlignOffset = 0;
		if (tmpAlignment === 'end')
		{
			tmpAlignOffset = tmpSlack;
		}
		else if (tmpAlignment === 'center')
		{
			tmpAlignOffset = tmpSlack / 2;
		}

		let tmpX = tmpZoneStart + tmpAlignOffset + tmpSpacing * (pIndex + 1);
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
	 * Used as fallback when adaptive zones are not available.
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

	/**
	 * Get the three zone Side keys for a given edge, in order.
	 *
	 * @param {string} pEdge - 'left', 'right', 'top', or 'bottom'
	 * @returns {Array<string>} Three Side keys in start-to-end order
	 */
	_getZoneKeysForEdge(pEdge)
	{
		switch (pEdge)
		{
			case 'left':   return ['left-top', 'left', 'left-bottom'];
			case 'right':  return ['right-top', 'right', 'right-bottom'];
			case 'top':    return ['top-left', 'top', 'top-right'];
			case 'bottom': return ['bottom-left', 'bottom', 'bottom-right'];
			default:       return ['right-top', 'right', 'right-bottom'];
		}
	}

	/**
	 * Compute an adaptive zone fraction for a Side value based on the
	 * actual port distribution across all zones on the same edge.
	 *
	 * Instead of fixed 1/3 splits, zones are sized proportionally to the
	 * space each zone needs (minSpacing * (portCount + 1)).  Zones with
	 * zero ports collapse to zero, giving occupied zones more room.
	 *
	 * @param {string} pSide - The Side value to compute a zone for
	 * @param {Object} pPortCountsBySide - Map of Side → number of ports
	 * @returns {{start: number, end: number}}
	 */
	_computeAdaptiveZone(pSide, pPortCountsBySide)
	{
		let tmpEdge = this.getEdgeFromSide(pSide);
		let tmpZoneKeys = this._getZoneKeysForEdge(tmpEdge);

		let tmpMinSpacing = 16;

		// Compute the space each zone needs: minSpacing * (count + 1)
		// The +1 provides padding at both ends of the zone.
		let tmpTotalSpace = 0;
		let tmpSpaceByZone = {};
		for (let i = 0; i < tmpZoneKeys.length; i++)
		{
			let tmpKey = tmpZoneKeys[i];
			let tmpCount = pPortCountsBySide[tmpKey] || 0;
			let tmpSpace = (tmpCount > 0) ? (tmpMinSpacing * (tmpCount + 1)) : 0;
			tmpSpaceByZone[tmpKey] = tmpSpace;
			tmpTotalSpace += tmpSpace;
		}

		// If no ports on this edge at all, fall back to fixed zones
		if (tmpTotalSpace === 0)
		{
			return this._getZoneFromSide(pSide);
		}

		// Compute proportional start/end for the requested zone
		let tmpCumulativeStart = 0;
		for (let i = 0; i < tmpZoneKeys.length; i++)
		{
			let tmpKey = tmpZoneKeys[i];
			let tmpFraction = tmpSpaceByZone[tmpKey] / tmpTotalSpace;
			if (tmpKey === pSide)
			{
				return { start: tmpCumulativeStart, end: tmpCumulativeStart + tmpFraction };
			}
			tmpCumulativeStart += tmpFraction;
		}

		// Should not reach here; fall back to fixed zones
		return this._getZoneFromSide(pSide);
	}

	/**
	 * Build a map of Side → port count from an array of port objects.
	 *
	 * Convenience method for callers that need to pass port counts
	 * to getPortLocalPosition or computeMinimumNodeHeight.
	 *
	 * @param {Array} pPorts - Array of port objects with Side, Direction
	 * @returns {Object} Map of Side value → count
	 */
	buildPortCountsBySide(pPorts)
	{
		let tmpCounts = {};
		if (!pPorts || !Array.isArray(pPorts))
		{
			return tmpCounts;
		}
		for (let i = 0; i < pPorts.length; i++)
		{
			let tmpSide = pPorts[i].Side || (pPorts[i].Direction === 'input' ? 'left' : 'right');
			if (!tmpCounts[tmpSide])
			{
				tmpCounts[tmpSide] = 0;
			}
			tmpCounts[tmpSide]++;
		}
		return tmpCounts;
	}

	/**
	 * Compute the minimum node height required so that all ports
	 * (with their badges) fit within the node boundary.
	 *
	 * Uses adaptive zone sizing: instead of assuming each zone gets
	 * a fixed 1/3 of the body, sums the space needed by all occupied
	 * zones on each left/right edge.  This produces compact cards
	 * whose height scales linearly with total port count.
	 *
	 * @param {Array} pPorts - Array of port objects with Side, Direction
	 * @param {number} pTitleBarHeight - Height of the title bar
	 * @returns {number} Minimum node height in pixels (0 if no ports)
	 */
	computeMinimumNodeHeight(pPorts, pTitleBarHeight)
	{
		if (!pPorts || !Array.isArray(pPorts) || pPorts.length === 0)
		{
			return 0;
		}

		let tmpMinSpacing = 16;
		let tmpBottomPad = 16;

		// Count ports per Side value
		let tmpCountBySide = this.buildPortCountsBySide(pPorts);

		// Sum the space needed per edge (left, right) across all zones.
		// Each zone needs minSpacing * (count + 1) pixels.
		let tmpSpacePerEdge = {};
		for (let tmpSide in tmpCountBySide)
		{
			let tmpEdge = this.getEdgeFromSide(tmpSide);

			// Only left/right edge zones affect required height
			if (tmpEdge !== 'left' && tmpEdge !== 'right')
			{
				continue;
			}

			let tmpCount = tmpCountBySide[tmpSide];
			let tmpZoneSpace = tmpMinSpacing * (tmpCount + 1);

			if (!tmpSpacePerEdge[tmpEdge])
			{
				tmpSpacePerEdge[tmpEdge] = 0;
			}
			tmpSpacePerEdge[tmpEdge] += tmpZoneSpace;
		}

		// The minimum height is titleBar + bottomPad + max edge space
		let tmpMinHeight = 0;
		for (let tmpEdge in tmpSpacePerEdge)
		{
			let tmpRequired = pTitleBarHeight + tmpBottomPad + tmpSpacePerEdge[tmpEdge];
			if (tmpRequired > tmpMinHeight)
			{
				tmpMinHeight = tmpRequired;
			}
		}

		return Math.ceil(tmpMinHeight);
	}
}

module.exports = PictProviderFlowGeometry;
