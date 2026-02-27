const libFableServiceProviderBase = require('fable-serviceproviderbase');

class PictProviderFlowConnectorShapes extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictProviderFlowConnectorShapes';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;

		// Default shape configurations — each keyed by a shape identifier
		this._DefaultShapes =
		{
			'port':
			{
				ElementType: 'circle',
				Attributes: { r: '5' },
				ClassName: 'pict-flow-port'
			},
			'panel-indicator':
			{
				ElementType: 'rect',
				Attributes: { rx: '2', ry: '2' },
				ClassName: 'pict-flow-node-panel-indicator'
			},
			'connection-path':
			{
				ElementType: 'path',
				Attributes: {},
				ClassName: 'pict-flow-connection'
			},
			'connection-hitarea':
			{
				ElementType: 'path',
				Attributes: {},
				ClassName: 'pict-flow-connection-hitarea'
			},
			'connection-handle':
			{
				ElementType: 'circle',
				Attributes: { r: '6' },
				ClassName: 'pict-flow-connection-handle'
			},
			'connection-handle-midpoint':
			{
				ElementType: 'circle',
				Attributes: { r: '6' },
				ClassName: 'pict-flow-connection-handle-midpoint'
			},
			'drag-connection':
			{
				ElementType: 'path',
				Attributes: {},
				ClassName: 'pict-flow-drag-connection'
			},
			'tether-path':
			{
				ElementType: 'path',
				Attributes: {},
				ClassName: 'pict-flow-tether-line'
			},
			'tether-hitarea':
			{
				ElementType: 'path',
				Attributes: {},
				ClassName: 'pict-flow-tether-hitarea'
			},
			'tether-handle':
			{
				ElementType: 'circle',
				Attributes: { r: '6' },
				ClassName: 'pict-flow-tether-handle'
			},
			'tether-handle-midpoint':
			{
				ElementType: 'circle',
				Attributes: { r: '6' },
				ClassName: 'pict-flow-tether-handle-midpoint'
			},
			'arrowhead-connection':
			{
				MarkerWidth: '5',
				MarkerHeight: '7',
				RefX: '7.5',
				RefY: '3.5',
				Points: '0 0, 5 3.5, 0 7',
				Fill: '#95a5a6'
			},
			'arrowhead-connection-selected':
			{
				MarkerWidth: '5',
				MarkerHeight: '7',
				RefX: '7.5',
				RefY: '3.5',
				Points: '0 0, 5 3.5, 0 7',
				Fill: '#3498db'
			},
			'arrowhead-tether':
			{
				MarkerWidth: '4',
				MarkerHeight: '6',
				RefX: '6',
				RefY: '3',
				Points: '0 0, 4 3, 0 6',
				Fill: '#95a5a6'
			}
		};
	}

	/**
	 * Get a shape configuration by key.
	 * @param {string} pShapeKey
	 * @returns {Object|null}
	 */
	getShapeConfig(pShapeKey)
	{
		if (this._DefaultShapes.hasOwnProperty(pShapeKey))
		{
			return this._DefaultShapes[pShapeKey];
		}
		return null;
	}

	/**
	 * Override or add a shape configuration.
	 * Consumers can call this to customize connector shapes without subclassing.
	 * @param {string} pShapeKey
	 * @param {Object} pConfig
	 */
	setShapeConfig(pShapeKey, pConfig)
	{
		this._DefaultShapes[pShapeKey] = pConfig;
	}

	/**
	 * Get all registered shape keys.
	 * @returns {string[]}
	 */
	getShapeKeys()
	{
		return Object.keys(this._DefaultShapes);
	}

	// ---- Factory Methods ----

	/**
	 * Create a port SVG element.
	 * @param {Object} pPortData - Port data with Hash, Direction
	 * @param {{x: number, y: number}} pPosition - Local position within the node group
	 * @param {string} pNodeHash - The owning node hash
	 * @returns {SVGCircleElement}
	 */
	createPortElement(pPortData, pPosition, pNodeHash)
	{
		let tmpConfig = this._DefaultShapes['port'];
		let tmpElement = this._FlowView._SVGHelperProvider.createSVGElement(tmpConfig.ElementType);
		tmpElement.setAttribute('class', tmpConfig.ClassName + ' ' + pPortData.Direction);
		tmpElement.setAttribute('cx', String(pPosition.x));
		tmpElement.setAttribute('cy', String(pPosition.y));
		// Apply config attributes (r, etc.)
		for (let tmpKey in tmpConfig.Attributes)
		{
			tmpElement.setAttribute(tmpKey, tmpConfig.Attributes[tmpKey]);
		}
		tmpElement.setAttribute('data-port-hash', pPortData.Hash);
		tmpElement.setAttribute('data-node-hash', pNodeHash);
		tmpElement.setAttribute('data-port-direction', pPortData.Direction);
		tmpElement.setAttribute('data-element-type', 'port');
		return tmpElement;
	}

	/**
	 * Create a panel indicator SVG element.
	 * @param {string} pNodeHash
	 * @param {number} pX
	 * @param {number} pY
	 * @param {number} pWidth
	 * @param {number} pHeight
	 * @returns {SVGRectElement}
	 */
	createPanelIndicatorElement(pNodeHash, pX, pY, pWidth, pHeight)
	{
		let tmpConfig = this._DefaultShapes['panel-indicator'];
		let tmpElement = this._FlowView._SVGHelperProvider.createSVGElement(tmpConfig.ElementType);
		tmpElement.setAttribute('class', tmpConfig.ClassName);
		tmpElement.setAttribute('x', String(pX));
		tmpElement.setAttribute('y', String(pY));
		tmpElement.setAttribute('width', String(pWidth));
		tmpElement.setAttribute('height', String(pHeight));
		// Apply config attributes (rx, ry, etc.)
		for (let tmpKey in tmpConfig.Attributes)
		{
			tmpElement.setAttribute(tmpKey, tmpConfig.Attributes[tmpKey]);
		}
		tmpElement.setAttribute('data-node-hash', pNodeHash);
		tmpElement.setAttribute('data-element-type', 'panel-indicator');
		return tmpElement;
	}

	/**
	 * Create a visible connection path SVG element.
	 * @param {string} pPath - The SVG path d-string
	 * @param {string} pConnectionHash
	 * @param {boolean} pIsSelected
	 * @param {string} pViewIdentifier
	 * @returns {SVGPathElement}
	 */
	createConnectionPathElement(pPath, pConnectionHash, pIsSelected, pViewIdentifier)
	{
		let tmpConfig = this._DefaultShapes['connection-path'];
		let tmpElement = this._FlowView._SVGHelperProvider.createSVGElement(tmpConfig.ElementType);
		tmpElement.setAttribute('class', tmpConfig.ClassName + (pIsSelected ? ' selected' : ''));
		tmpElement.setAttribute('d', pPath);
		tmpElement.setAttribute('data-connection-hash', pConnectionHash);
		tmpElement.setAttribute('data-element-type', 'connection');

		// Arrow marker
		let tmpMarkerConfig = pIsSelected
			? this._DefaultShapes['arrowhead-connection-selected']
			: this._DefaultShapes['arrowhead-connection'];
		// The marker id follows the naming convention used in generateMarkerDefs
		let tmpMarkerId = pIsSelected
			? ('flow-arrowhead-selected-' + pViewIdentifier)
			: ('flow-arrowhead-' + pViewIdentifier);
		tmpElement.setAttribute('marker-end', 'url(#' + tmpMarkerId + ')');

		return tmpElement;
	}

	/**
	 * Create a connection hit area SVG element (wider invisible path for click targeting).
	 * @param {string} pPath - The SVG path d-string
	 * @param {string} pConnectionHash
	 * @returns {SVGPathElement}
	 */
	createConnectionHitAreaElement(pPath, pConnectionHash)
	{
		let tmpConfig = this._DefaultShapes['connection-hitarea'];
		let tmpElement = this._FlowView._SVGHelperProvider.createSVGElement(tmpConfig.ElementType);
		tmpElement.setAttribute('class', tmpConfig.ClassName);
		tmpElement.setAttribute('d', pPath);
		tmpElement.setAttribute('data-connection-hash', pConnectionHash);
		tmpElement.setAttribute('data-element-type', 'connection-hitarea');
		return tmpElement;
	}

	/**
	 * Create a drag handle circle element.
	 * Works for both connection handles and tether handles.
	 * @param {string} pOwnerHash - Connection hash or panel hash
	 * @param {string} pHandleType - e.g. 'ortho-corner1', 'bezier-midpoint'
	 * @param {number} pX
	 * @param {number} pY
	 * @param {string} pShapeKey - 'connection-handle', 'connection-handle-midpoint', 'tether-handle', 'tether-handle-midpoint'
	 * @returns {SVGCircleElement}
	 */
	createHandleElement(pOwnerHash, pHandleType, pX, pY, pShapeKey)
	{
		let tmpConfig = this._DefaultShapes[pShapeKey] || this._DefaultShapes['connection-handle'];
		let tmpElement = this._FlowView._SVGHelperProvider.createSVGElement(tmpConfig.ElementType);
		tmpElement.setAttribute('class', tmpConfig.ClassName);
		tmpElement.setAttribute('cx', String(pX));
		tmpElement.setAttribute('cy', String(pY));
		// Apply config attributes (r, etc.)
		for (let tmpKey in tmpConfig.Attributes)
		{
			tmpElement.setAttribute(tmpKey, tmpConfig.Attributes[tmpKey]);
		}
		tmpElement.setAttribute('data-handle-type', pHandleType);
		return tmpElement;
	}

	/**
	 * Create a temporary drag connection path element.
	 * @param {string} pPath - The SVG path d-string
	 * @returns {SVGPathElement}
	 */
	createDragConnectionElement(pPath)
	{
		let tmpConfig = this._DefaultShapes['drag-connection'];
		let tmpElement = this._FlowView._SVGHelperProvider.createSVGElement(tmpConfig.ElementType);
		tmpElement.setAttribute('class', tmpConfig.ClassName);
		tmpElement.setAttribute('d', pPath);
		return tmpElement;
	}

	/**
	 * Create a visible tether path SVG element.
	 * @param {string} pPath - The SVG path d-string
	 * @param {string} pPanelHash
	 * @param {boolean} pIsSelected
	 * @param {string} pViewIdentifier
	 * @returns {SVGPathElement}
	 */
	createTetherPathElement(pPath, pPanelHash, pIsSelected, pViewIdentifier)
	{
		let tmpConfig = this._DefaultShapes['tether-path'];
		let tmpElement = this._FlowView._SVGHelperProvider.createSVGElement(tmpConfig.ElementType);
		tmpElement.setAttribute('class', tmpConfig.ClassName + (pIsSelected ? ' selected' : ''));
		tmpElement.setAttribute('d', pPath);
		tmpElement.setAttribute('marker-end', 'url(#flow-tether-arrowhead-' + pViewIdentifier + ')');
		tmpElement.setAttribute('data-element-type', 'tether');
		tmpElement.setAttribute('data-panel-hash', pPanelHash);
		return tmpElement;
	}

	/**
	 * Create a tether hit area SVG element.
	 * @param {string} pPath - The SVG path d-string
	 * @param {string} pPanelHash
	 * @returns {SVGPathElement}
	 */
	createTetherHitAreaElement(pPath, pPanelHash)
	{
		let tmpConfig = this._DefaultShapes['tether-hitarea'];
		let tmpElement = this._FlowView._SVGHelperProvider.createSVGElement(tmpConfig.ElementType);
		tmpElement.setAttribute('class', tmpConfig.ClassName);
		tmpElement.setAttribute('d', pPath);
		tmpElement.setAttribute('data-element-type', 'tether-hitarea');
		tmpElement.setAttribute('data-panel-hash', pPanelHash);
		return tmpElement;
	}

	/**
	 * Generate SVG marker definition markup for all arrowhead types.
	 * Returns raw SVG markup to be injected into the <defs> section.
	 * @param {string} pViewIdentifier
	 * @returns {string}
	 */
	generateMarkerDefs(pViewIdentifier)
	{
		let tmpConnectionMarker = this._DefaultShapes['arrowhead-connection'];
		let tmpSelectedMarker = this._DefaultShapes['arrowhead-connection-selected'];
		let tmpTetherMarker = this._DefaultShapes['arrowhead-tether'];

		let tmpMarkup = '';

		// Normal connection arrowhead
		tmpMarkup += '<marker id="flow-arrowhead-' + pViewIdentifier + '"'
			+ ' markerWidth="' + tmpConnectionMarker.MarkerWidth + '"'
			+ ' markerHeight="' + tmpConnectionMarker.MarkerHeight + '"'
			+ ' refX="' + tmpConnectionMarker.RefX + '"'
			+ ' refY="' + tmpConnectionMarker.RefY + '"'
			+ ' orient="auto" markerUnits="strokeWidth">'
			+ '<polygon points="' + tmpConnectionMarker.Points + '" fill="' + tmpConnectionMarker.Fill + '" />'
			+ '</marker>';

		// Selected connection arrowhead
		tmpMarkup += '<marker id="flow-arrowhead-selected-' + pViewIdentifier + '"'
			+ ' markerWidth="' + tmpSelectedMarker.MarkerWidth + '"'
			+ ' markerHeight="' + tmpSelectedMarker.MarkerHeight + '"'
			+ ' refX="' + tmpSelectedMarker.RefX + '"'
			+ ' refY="' + tmpSelectedMarker.RefY + '"'
			+ ' orient="auto" markerUnits="strokeWidth">'
			+ '<polygon points="' + tmpSelectedMarker.Points + '" fill="' + tmpSelectedMarker.Fill + '" />'
			+ '</marker>';

		// Tether arrowhead
		tmpMarkup += '<marker id="flow-tether-arrowhead-' + pViewIdentifier + '"'
			+ ' markerWidth="' + tmpTetherMarker.MarkerWidth + '"'
			+ ' markerHeight="' + tmpTetherMarker.MarkerHeight + '"'
			+ ' refX="' + tmpTetherMarker.RefX + '"'
			+ ' refY="' + tmpTetherMarker.RefY + '"'
			+ ' orient="auto" markerUnits="strokeWidth">'
			+ '<polygon points="' + tmpTetherMarker.Points + '" fill="' + tmpTetherMarker.Fill + '" />'
			+ '</marker>';

		return tmpMarkup;
	}
}

module.exports = PictProviderFlowConnectorShapes;
