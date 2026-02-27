const libFableServiceProviderBase = require('fable-serviceproviderbase');

/**
 * PictProvider-Flow-Geometry
 *
 * Shared geometry utilities for the flow diagram.
 * Provides direction vectors and edge center calculations used by
 * connections, tethers, and other flow components.
 */
class PictProviderFlowGeometry extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictProviderFlowGeometry';
	}

	/**
	 * Get the outward unit direction vector for a given side.
	 *
	 * @param {string} pSide - 'left', 'right', 'top', or 'bottom'
	 * @returns {{dx: number, dy: number}}
	 */
	sideDirection(pSide)
	{
		switch (pSide)
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
	 * For left and right side ports, positioning is offset below the title bar
	 * so that ports never overlap the header area.
	 *
	 * @param {string} pSide - 'left', 'right', 'top', 'bottom'
	 * @param {number} pIndex - Index of this port on its side
	 * @param {number} pTotal - Total ports on this side
	 * @param {number} pWidth - Node width
	 * @param {number} pHeight - Node height
	 * @param {number} pTitleBarHeight - Height of the node title bar
	 * @returns {{x: number, y: number}}
	 */
	getPortLocalPosition(pSide, pIndex, pTotal, pWidth, pHeight, pTitleBarHeight)
	{
		let tmpSpacing;

		switch (pSide)
		{
			case 'left':
			{
				let tmpBodyHeight = pHeight - pTitleBarHeight;
				tmpSpacing = tmpBodyHeight / (pTotal + 1);
				return { x: 0, y: pTitleBarHeight + tmpSpacing * (pIndex + 1) };
			}
			case 'right':
			{
				let tmpBodyHeight = pHeight - pTitleBarHeight;
				tmpSpacing = tmpBodyHeight / (pTotal + 1);
				return { x: pWidth, y: pTitleBarHeight + tmpSpacing * (pIndex + 1) };
			}
			case 'top':
				tmpSpacing = pWidth / (pTotal + 1);
				return { x: tmpSpacing * (pIndex + 1), y: 0 };
			case 'bottom':
				tmpSpacing = pWidth / (pTotal + 1);
				return { x: tmpSpacing * (pIndex + 1), y: pHeight };
			default:
				return { x: pWidth, y: pHeight / 2 };
		}
	}
}

module.exports = PictProviderFlowGeometry;
