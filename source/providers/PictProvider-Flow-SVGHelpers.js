const libFableServiceProviderBase = require('fable-serviceproviderbase');

/**
 * PictProvider-Flow-SVGHelpers
 *
 * Shared SVG element creation utility used by all flow components
 * that need to create SVG namespace elements (nodes, connections, tethers).
 */
class PictProviderFlowSVGHelpers extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictProviderFlowSVGHelpers';
	}

	/**
	 * Create an SVG namespace element.
	 *
	 * @param {string} pTagName - The SVG element tag name (e.g., 'path', 'circle', 'g', 'rect', 'text')
	 * @returns {SVGElement}
	 */
	createSVGElement(pTagName)
	{
		return document.createElementNS('http://www.w3.org/2000/svg', pTagName);
	}
}

module.exports = PictProviderFlowSVGHelpers;
