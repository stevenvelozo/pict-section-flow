const libFableServiceProviderBase = require('fable-serviceproviderbase');

/**
 * PictService-Flow-ViewportManager
 *
 * Manages viewport transforms (pan/zoom), coordinate conversion between
 * screen and SVG space, zoom-to-fit calculations, and fullscreen toggling
 * for the flow diagram.
 */
class PictServiceFlowViewportManager extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictServiceFlowViewportManager';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;

		this._IsFullscreen = false;
	}

	/**
	 * Update the viewport transform (pan and zoom)
	 */
	updateViewportTransform()
	{
		if (!this._FlowView._ViewportElement) return;
		let tmpVS = this._FlowView._FlowData.ViewState;
		this._FlowView._ViewportElement.setAttribute('transform',
			`translate(${tmpVS.PanX}, ${tmpVS.PanY}) scale(${tmpVS.Zoom})`
		);
	}

	/**
	 * Set zoom level
	 * @param {number} pZoom - The zoom level
	 * @param {number} [pFocusX] - X coordinate to zoom toward (SVG space)
	 * @param {number} [pFocusY] - Y coordinate to zoom toward (SVG space)
	 */
	setZoom(pZoom, pFocusX, pFocusY)
	{
		let tmpNewZoom = Math.max(this._FlowView.options.MinZoom, Math.min(this._FlowView.options.MaxZoom, pZoom));
		let tmpOldZoom = this._FlowView._FlowData.ViewState.Zoom;

		if (typeof pFocusX === 'number' && typeof pFocusY === 'number')
		{
			// Zoom toward focus point
			let tmpVS = this._FlowView._FlowData.ViewState;
			tmpVS.PanX = pFocusX - (pFocusX - tmpVS.PanX) * (tmpNewZoom / tmpOldZoom);
			tmpVS.PanY = pFocusY - (pFocusY - tmpVS.PanY) * (tmpNewZoom / tmpOldZoom);
		}

		this._FlowView._FlowData.ViewState.Zoom = tmpNewZoom;
		this.updateViewportTransform();
	}

	/**
	 * Zoom to fit all nodes in the viewport
	 */
	zoomToFit()
	{
		if (this._FlowView._FlowData.Nodes.length === 0) return;
		if (!this._FlowView._SVGElement) return;

		let tmpMinX = Infinity, tmpMinY = Infinity;
		let tmpMaxX = -Infinity, tmpMaxY = -Infinity;

		for (let i = 0; i < this._FlowView._FlowData.Nodes.length; i++)
		{
			let tmpNode = this._FlowView._FlowData.Nodes[i];
			tmpMinX = Math.min(tmpMinX, tmpNode.X);
			tmpMinY = Math.min(tmpMinY, tmpNode.Y);
			tmpMaxX = Math.max(tmpMaxX, tmpNode.X + tmpNode.Width);
			tmpMaxY = Math.max(tmpMaxY, tmpNode.Y + tmpNode.Height);
		}

		let tmpPadding = 50;
		let tmpFlowWidth = tmpMaxX - tmpMinX + tmpPadding * 2;
		let tmpFlowHeight = tmpMaxY - tmpMinY + tmpPadding * 2;

		let tmpSVGRect = this._FlowView._SVGElement.getBoundingClientRect();
		let tmpScaleX = tmpSVGRect.width / tmpFlowWidth;
		let tmpScaleY = tmpSVGRect.height / tmpFlowHeight;
		let tmpZoom = Math.min(tmpScaleX, tmpScaleY, 1.0); // Don't zoom in past 1.0
		tmpZoom = Math.max(this._FlowView.options.MinZoom, Math.min(this._FlowView.options.MaxZoom, tmpZoom));

		let tmpCenterX = (tmpMinX + tmpMaxX) / 2;
		let tmpCenterY = (tmpMinY + tmpMaxY) / 2;

		this._FlowView._FlowData.ViewState.Zoom = tmpZoom;
		this._FlowView._FlowData.ViewState.PanX = (tmpSVGRect.width / 2) - (tmpCenterX * tmpZoom);
		this._FlowView._FlowData.ViewState.PanY = (tmpSVGRect.height / 2) - (tmpCenterY * tmpZoom);

		this.updateViewportTransform();
	}

	/**
	 * Convert screen coordinates to SVG viewport coordinates
	 * @param {number} pScreenX
	 * @param {number} pScreenY
	 * @returns {{x: number, y: number}}
	 */
	screenToSVGCoords(pScreenX, pScreenY)
	{
		if (!this._FlowView._SVGElement)
		{
			return { x: pScreenX, y: pScreenY };
		}

		let tmpPoint = this._FlowView._SVGElement.createSVGPoint();
		tmpPoint.x = pScreenX;
		tmpPoint.y = pScreenY;

		let tmpCTM = this._FlowView._SVGElement.getScreenCTM();
		if (tmpCTM)
		{
			let tmpInverse = tmpCTM.inverse();
			let tmpTransformed = tmpPoint.matrixTransform(tmpInverse);
			// Account for viewport pan/zoom
			let tmpVS = this._FlowView._FlowData.ViewState;
			return {
				x: (tmpTransformed.x - tmpVS.PanX) / tmpVS.Zoom,
				y: (tmpTransformed.y - tmpVS.PanY) / tmpVS.Zoom
			};
		}

		return { x: pScreenX, y: pScreenY };
	}

	/**
	 * Toggle fullscreen mode on the flow editor container.
	 * Uses a CSS fixed-position overlay instead of the Fullscreen API.
	 * @returns {boolean} The new fullscreen state
	 */
	toggleFullscreen()
	{
		let tmpViewIdentifier = this._FlowView.options.ViewIdentifier;
		let tmpContainerElements = this._FlowView.pict.ContentAssignment.getElement(`#Flow-Wrapper-${tmpViewIdentifier}`);
		if (tmpContainerElements.length < 1) return this._IsFullscreen;

		let tmpContainer = tmpContainerElements[0];

		this._IsFullscreen = !this._IsFullscreen;

		if (this._IsFullscreen)
		{
			tmpContainer.classList.add('pict-flow-fullscreen');
		}
		else
		{
			tmpContainer.classList.remove('pict-flow-fullscreen');
		}

		return this._IsFullscreen;
	}

	/**
	 * Exit fullscreen mode if currently active.
	 */
	exitFullscreen()
	{
		if (!this._IsFullscreen) return;

		let tmpViewIdentifier = this._FlowView.options.ViewIdentifier;
		let tmpContainerElements = this._FlowView.pict.ContentAssignment.getElement(`#Flow-Wrapper-${tmpViewIdentifier}`);
		if (tmpContainerElements.length > 0)
		{
			tmpContainerElements[0].classList.remove('pict-flow-fullscreen');
		}

		this._IsFullscreen = false;
	}
}

module.exports = PictServiceFlowViewportManager;
