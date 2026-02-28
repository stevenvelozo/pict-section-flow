const libFableServiceProviderBase = require('fable-serviceproviderbase');

/**
 * PictProvider-Flow-PanelChrome
 *
 * Template-based provider for creating the panel chrome (the foreignObject
 * wrapper, title bar, close button, and body container) for properties panels.
 *
 * Replaces the raw DOM API approach with a configuration template
 * (Flow-PanelChrome-Template) registered in the FlowView's template set.
 */
class PictProviderFlowPanelChrome extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictProviderFlowPanelChrome';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;
	}

	/**
	 * Create a foreignObject containing the panel chrome and empty body container.
	 *
	 * Uses the Flow-PanelChrome-Template registered in the FlowView configuration
	 * to render the inner HTML (title bar, close button, body container), then
	 * attaches event isolation listeners so pointer and wheel events inside the
	 * panel body do not propagate to the SVG interaction layer.
	 *
	 * @param {Object} pPanelData - Panel data from OpenPanels (Hash, NodeHash, X, Y, Width, Height, Title)
	 * @param {SVGGElement} pPanelsLayer - The SVG <g> for panel foreignObjects
	 * @returns {HTMLDivElement} The panel body container element for content rendering
	 */
	createPanelForeignObject(pPanelData, pPanelsLayer)
	{
		let tmpSVGHelper = this._FlowView._SVGHelperProvider;

		// Create the SVG foreignObject wrapper
		let tmpFO = tmpSVGHelper.createSVGElement('foreignObject');
		tmpFO.setAttribute('class', 'pict-flow-panel-foreign-object');
		tmpFO.setAttribute('data-panel-hash', pPanelData.Hash);
		tmpFO.setAttribute('data-node-hash', pPanelData.NodeHash);
		tmpFO.setAttribute('x', String(pPanelData.X));
		tmpFO.setAttribute('y', String(pPanelData.Y));
		tmpFO.setAttribute('width', String(pPanelData.Width));
		tmpFO.setAttribute('height', String(pPanelData.Height));

		// Render the panel chrome from the configuration template
		let tmpPict = this._FlowView.pict || this._FlowView.fable;
		let tmpTitle = pPanelData.Title || 'Properties';
		let tmpChromeHTML = tmpPict.parseTemplateByHash('Flow-PanelChrome-Template',
			{ Hash: pPanelData.Hash, Title: tmpTitle });

		tmpFO.innerHTML = tmpChromeHTML;

		// Populate the close button icon
		let tmpCloseIcon = tmpFO.querySelector('.pict-flow-panel-close-icon');
		if (tmpCloseIcon && this._FlowView && this._FlowView._IconProvider)
		{
			tmpCloseIcon.innerHTML = this._FlowView._IconProvider.getIconSVGMarkup('close', 12);
		}
		else if (tmpCloseIcon)
		{
			tmpCloseIcon.textContent = '\u2715';
		}

		// Attach event isolation to the panel body so pointer/wheel events
		// inside the panel content do not trigger SVG interactions
		let tmpBody = tmpFO.querySelector('.pict-flow-panel-body');
		if (tmpBody)
		{
			tmpBody.addEventListener('pointerdown', (pEvent) => { pEvent.stopPropagation(); });
			tmpBody.addEventListener('wheel', (pEvent) => { pEvent.stopPropagation(); });
		}

		// Isolate events on the collapsible node properties editor section
		let tmpNodeProps = tmpFO.querySelector('.pict-flow-panel-node-props');
		if (tmpNodeProps)
		{
			tmpNodeProps.addEventListener('pointerdown', (pEvent) => { pEvent.stopPropagation(); });
			tmpNodeProps.addEventListener('wheel', (pEvent) => { pEvent.stopPropagation(); });
		}

		pPanelsLayer.appendChild(tmpFO);

		return tmpBody;
	}
}

module.exports = PictProviderFlowPanelChrome;
