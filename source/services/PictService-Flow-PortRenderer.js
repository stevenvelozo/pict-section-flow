const libFableServiceProviderBase = require('fable-serviceproviderbase');

/**
 * PictService-Flow-PortRenderer
 *
 * Renders port circles, labels, and badges for flow diagram nodes.
 *
 * Extracted from PictView-Flow-Node.js to isolate port rendering logic
 * from node body rendering and layout.
 *
 * Dependencies (all accessed via this._FlowView):
 *   - _GeometryProvider — for getEdgeFromSide, getPortLocalPosition
 *   - _ConnectorShapesProvider — for createPortElement
 *   - _SVGHelperProvider — for createSVGElement
 */
class PictServiceFlowPortRenderer extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictServiceFlowPortRenderer';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;
	}

	/**
	 * Render ports for a node.
	 * @param {Object} pNodeData
	 * @param {SVGGElement} pGroup - The node's SVG group
	 * @param {number} pWidth
	 * @param {number} pHeight
	 * @param {Object} [pNodeTypeConfig] - Node type configuration (for label display options)
	 * @param {number} pNodeTitleBarHeight - Title bar height (for port position offset)
	 */
	renderPorts(pNodeData, pGroup, pWidth, pHeight, pNodeTypeConfig, pNodeTitleBarHeight)
	{
		if (!this._FlowView) return;
		if (!pNodeData.Ports || !Array.isArray(pNodeData.Ports)) return;

		let tmpPortLabelsVertical = (pNodeTypeConfig && pNodeTypeConfig.PortLabelsVertical);
		let tmpPortLabelPadding = (pNodeTypeConfig && pNodeTypeConfig.PortLabelPadding);
		let tmpPortLabelsOutside = (pNodeTypeConfig && pNodeTypeConfig.PortLabelsOutside);
		let tmpGeometryProvider = this._FlowView._GeometryProvider;

		// Group ports by their Side value (supports all 12 positions)
		let tmpPortsBySide = {};
		for (let i = 0; i < pNodeData.Ports.length; i++)
		{
			let tmpPort = pNodeData.Ports[i];
			let tmpSide = tmpPort.Side || (tmpPort.Direction === 'input' ? 'left' : 'right');
			if (!tmpPortsBySide[tmpSide])
			{
				tmpPortsBySide[tmpSide] = [];
			}
			tmpPortsBySide[tmpSide].push(tmpPort);
		}

		// Build port counts map for adaptive zone sizing
		let tmpPortCountsBySide = {};
		for (let tmpKey in tmpPortsBySide)
		{
			tmpPortCountsBySide[tmpKey] = tmpPortsBySide[tmpKey].length;
		}

		for (let tmpSide in tmpPortsBySide)
		{
			let tmpPorts = tmpPortsBySide[tmpSide];
			// Determine the edge for label positioning
			let tmpEdge = tmpGeometryProvider ? tmpGeometryProvider.getEdgeFromSide(tmpSide) : tmpSide;

			for (let i = 0; i < tmpPorts.length; i++)
			{
				let tmpPort = tmpPorts[i];
				let tmpPosition = this.getPortLocalPosition(tmpSide, i, tmpPorts.length, pWidth, pHeight, pNodeTitleBarHeight, tmpPortCountsBySide);

				// Port label badge — flush against the node edge with no
				// border on the edge side; rendered before the port circle
				// so the circle visually sits on top of the badge
				let tmpLabelElement = null;
				if (tmpPort.Label)
				{
					let tmpPortTypeColorMap =
					{
						'event-in': '#3498db',
						'event-out': '#2ecc71',
						'setting': '#e67e22',
						'value': '#f1c40f',
						'error': '#e74c3c'
					};
					let tmpBorderColor = tmpPort.PortType ? (tmpPortTypeColorMap[tmpPort.PortType] || '#95a5a6') : '#95a5a6';

					let tmpBadgeHeight = 12;
					let tmpBadgePadH = 5;
					let tmpBadgeBorderW = 2;
					let tmpEdgePad = 1;
					let tmpPortRadius = 5;

					let tmpTextLen = tmpPort.Label.length * 5;
					let tmpBadgeX, tmpBadgeY, tmpBadgeWidth;
					let tmpTextX, tmpTextAnchor;
					let tmpStripeX, tmpStripeY, tmpStripeW, tmpStripeH;
					let tmpBorderPath;

					if (tmpEdge === 'left')
					{
						tmpBadgeWidth = tmpPortRadius + tmpBadgePadH + tmpTextLen + tmpBadgePadH + tmpBadgeBorderW;
						tmpBadgeX = tmpEdgePad;
						tmpBadgeY = tmpPosition.y - tmpBadgeHeight / 2;
						tmpTextX = tmpBadgeX + tmpPortRadius + tmpBadgePadH;
						tmpTextAnchor = 'start';
						tmpStripeX = tmpBadgeX + tmpBadgeWidth - tmpBadgeBorderW;
						tmpStripeY = tmpBadgeY;
						tmpStripeW = tmpBadgeBorderW;
						tmpStripeH = tmpBadgeHeight;
						tmpBorderPath = 'M ' + tmpBadgeX + ' ' + tmpBadgeY
							+ ' L ' + (tmpBadgeX + tmpBadgeWidth) + ' ' + tmpBadgeY
							+ ' L ' + (tmpBadgeX + tmpBadgeWidth) + ' ' + (tmpBadgeY + tmpBadgeHeight)
							+ ' L ' + tmpBadgeX + ' ' + (tmpBadgeY + tmpBadgeHeight);
					}
					else if (tmpEdge === 'right')
					{
						tmpBadgeWidth = tmpBadgeBorderW + tmpBadgePadH + tmpTextLen + tmpBadgePadH + tmpPortRadius;
						tmpBadgeX = pWidth - tmpBadgeWidth - tmpEdgePad;
						tmpBadgeY = tmpPosition.y - tmpBadgeHeight / 2;
						tmpTextX = tmpBadgeX + tmpBadgeBorderW + tmpBadgePadH;
						tmpTextAnchor = 'start';
						tmpStripeX = tmpBadgeX;
						tmpStripeY = tmpBadgeY;
						tmpStripeW = tmpBadgeBorderW;
						tmpStripeH = tmpBadgeHeight;
						tmpBorderPath = 'M ' + (tmpBadgeX + tmpBadgeWidth) + ' ' + tmpBadgeY
							+ ' L ' + tmpBadgeX + ' ' + tmpBadgeY
							+ ' L ' + tmpBadgeX + ' ' + (tmpBadgeY + tmpBadgeHeight)
							+ ' L ' + (tmpBadgeX + tmpBadgeWidth) + ' ' + (tmpBadgeY + tmpBadgeHeight);
					}
					else if (tmpEdge === 'top')
					{
						tmpBadgeWidth = tmpTextLen + tmpBadgePadH * 2;
						tmpBadgeX = tmpPosition.x - tmpBadgeWidth / 2;
						tmpBadgeY = tmpEdgePad;
						tmpTextX = tmpPosition.x;
						tmpTextAnchor = 'middle';
						tmpStripeX = tmpBadgeX;
						tmpStripeY = tmpBadgeY + tmpBadgeHeight - tmpBadgeBorderW;
						tmpStripeW = tmpBadgeWidth;
						tmpStripeH = tmpBadgeBorderW;
						tmpBorderPath = 'M ' + tmpBadgeX + ' ' + tmpBadgeY
							+ ' L ' + tmpBadgeX + ' ' + (tmpBadgeY + tmpBadgeHeight)
							+ ' L ' + (tmpBadgeX + tmpBadgeWidth) + ' ' + (tmpBadgeY + tmpBadgeHeight)
							+ ' L ' + (tmpBadgeX + tmpBadgeWidth) + ' ' + tmpBadgeY;
					}
					else
					{
						tmpBadgeWidth = tmpTextLen + tmpBadgePadH * 2;
						tmpBadgeX = tmpPosition.x - tmpBadgeWidth / 2;
						tmpBadgeY = pHeight - tmpBadgeHeight - tmpEdgePad;
						tmpTextX = tmpPosition.x;
						tmpTextAnchor = 'middle';
						tmpStripeX = tmpBadgeX;
						tmpStripeY = tmpBadgeY;
						tmpStripeW = tmpBadgeWidth;
						tmpStripeH = tmpBadgeBorderW;
						tmpBorderPath = 'M ' + tmpBadgeX + ' ' + (tmpBadgeY + tmpBadgeHeight)
							+ ' L ' + tmpBadgeX + ' ' + tmpBadgeY
							+ ' L ' + (tmpBadgeX + tmpBadgeWidth) + ' ' + tmpBadgeY
							+ ' L ' + (tmpBadgeX + tmpBadgeWidth) + ' ' + (tmpBadgeY + tmpBadgeHeight);
					}

					// Background rect (cream, no stroke — border drawn separately)
					let tmpBgRect = this._FlowView._SVGHelperProvider.createSVGElement('rect');
					tmpBgRect.setAttribute('class', 'pict-flow-port-label-bg');
					tmpBgRect.setAttribute('x', String(tmpBadgeX));
					tmpBgRect.setAttribute('y', String(tmpBadgeY));
					tmpBgRect.setAttribute('width', String(tmpBadgeWidth));
					tmpBgRect.setAttribute('height', String(tmpBadgeHeight));
					tmpBgRect.setAttribute('fill', 'var(--pf-port-label-bg, rgba(255, 253, 240, 0.5))');
					pGroup.appendChild(tmpBgRect);

					// 3-sided border path (open on the edge-facing side)
					let tmpBorderPathEl = this._FlowView._SVGHelperProvider.createSVGElement('path');
					tmpBorderPathEl.setAttribute('class', 'pict-flow-port-label-bg');
					tmpBorderPathEl.setAttribute('d', tmpBorderPath);
					tmpBorderPathEl.setAttribute('fill', 'none');
					tmpBorderPathEl.setAttribute('stroke', tmpBorderColor);
					tmpBorderPathEl.setAttribute('stroke-width', '0.75');
					pGroup.appendChild(tmpBorderPathEl);

					// Colored stripe on the inner side
					let tmpStripe = this._FlowView._SVGHelperProvider.createSVGElement('rect');
					tmpStripe.setAttribute('class', 'pict-flow-port-label-bg');
					tmpStripe.setAttribute('x', String(tmpStripeX));
					tmpStripe.setAttribute('y', String(tmpStripeY));
					tmpStripe.setAttribute('width', String(tmpStripeW));
					tmpStripe.setAttribute('height', String(tmpStripeH));
					tmpStripe.setAttribute('fill', tmpBorderColor);
					pGroup.appendChild(tmpStripe);

					// Text label — appended after circle for z-order
					tmpLabelElement = this._FlowView._SVGHelperProvider.createSVGElement('text');
					tmpLabelElement.setAttribute('class', 'pict-flow-port-label');
					tmpLabelElement.setAttribute('fill', 'var(--pf-port-label-text, #2c3e50)');
					tmpLabelElement.textContent = tmpPort.Label;
					tmpLabelElement.setAttribute('x', String(tmpTextX));
					tmpLabelElement.setAttribute('y', String(tmpBadgeY + tmpBadgeHeight / 2));
					tmpLabelElement.setAttribute('text-anchor', tmpTextAnchor);
					tmpLabelElement.setAttribute('dominant-baseline', 'central');
				}

				// Port circle (rendered on top of badge background)
				let tmpShapeProvider = this._FlowView._ConnectorShapesProvider;
				let tmpCircle;
				if (tmpShapeProvider)
				{
					tmpCircle = tmpShapeProvider.createPortElement(tmpPort, tmpPosition, pNodeData.Hash);
				}
				else
				{
					tmpCircle = this._FlowView._SVGHelperProvider.createSVGElement('circle');
					let tmpPortClass = `pict-flow-port ${tmpPort.Direction}`;
					if (tmpPort.PortType)
					{
						tmpPortClass += ` port-type-${tmpPort.PortType}`;
					}
					tmpCircle.setAttribute('class', tmpPortClass);
					tmpCircle.setAttribute('cx', String(tmpPosition.x));
					tmpCircle.setAttribute('cy', String(tmpPosition.y));
					tmpCircle.setAttribute('r', '5');
					tmpCircle.setAttribute('data-port-hash', tmpPort.Hash);
					tmpCircle.setAttribute('data-node-hash', pNodeData.Hash);
					tmpCircle.setAttribute('data-port-direction', tmpPort.Direction);
					if (tmpPort.PortType)
					{
						tmpCircle.setAttribute('data-port-type', tmpPort.PortType);
					}
					tmpCircle.setAttribute('data-element-type', 'port');
				}
				pGroup.appendChild(tmpCircle);

				// Port label text (on top of everything)
				if (tmpLabelElement)
				{
					pGroup.appendChild(tmpLabelElement);
				}
			}
		}
	}

	/**
	 * Calculate port position relative to node origin.
	 *
	 * Delegates to the geometry provider's getPortLocalPosition method.
	 *
	 * @param {string} pSide - 'left', 'right', 'top', 'bottom' (or compound sides)
	 * @param {number} pIndex - Index of this port on its side
	 * @param {number} pTotal - Total ports on this side
	 * @param {number} pWidth - Node width
	 * @param {number} pHeight - Node height
	 * @param {number} pNodeTitleBarHeight - Title bar height
	 * @param {Object} [pPortCountsBySide] - Optional map of Side → count for adaptive zones
	 * @returns {{x: number, y: number}}
	 */
	getPortLocalPosition(pSide, pIndex, pTotal, pWidth, pHeight, pNodeTitleBarHeight, pPortCountsBySide)
	{
		return this._FlowView._GeometryProvider.getPortLocalPosition(pSide, pIndex, pTotal, pWidth, pHeight, pNodeTitleBarHeight, pPortCountsBySide);
	}
}

module.exports = PictServiceFlowPortRenderer;
