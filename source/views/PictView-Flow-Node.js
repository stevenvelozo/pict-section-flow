const libPictView = require('pict-view');

const _DefaultConfiguration =
{
	ViewIdentifier: 'Flow-NodeRenderer',

	AutoRender: false,

	// Title bar height for nodes
	NodeTitleBarHeight: 22
};

class PictViewFlowNode extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultConfiguration)), pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'PictViewFlowNode';

		this._FlowView = null;
	}

	/**
	 * Render a node into the nodes SVG layer
	 * @param {Object} pNodeData - The node data object
	 * @param {SVGGElement} pNodesLayer - The SVG <g> element to append to
	 * @param {boolean} pIsSelected - Whether this node is selected
	 * @param {Object} pNodeTypeConfig - The node type configuration
	 */
	renderNode(pNodeData, pNodesLayer, pIsSelected, pNodeTypeConfig)
	{
		let tmpGroup = this._FlowView._SVGHelperProvider.createSVGElement('g');
		tmpGroup.setAttribute('class', `pict-flow-node ${pIsSelected ? 'selected' : ''} pict-flow-node-${pNodeData.Type || 'default'}`);
		tmpGroup.setAttribute('transform', `translate(${pNodeData.X}, ${pNodeData.Y})`);
		tmpGroup.setAttribute('data-node-hash', pNodeData.Hash);
		tmpGroup.setAttribute('data-element-type', 'node');

		let tmpWidth = pNodeData.Width || 180;
		let tmpHeight = pNodeData.Height || 80;
		let tmpTitleBarHeight = this.options.NodeTitleBarHeight;

		// Node body (main rectangle)
		let tmpBody = this._FlowView._SVGHelperProvider.createSVGElement('rect');
		tmpBody.setAttribute('class', 'pict-flow-node-body');
		tmpBody.setAttribute('x', '0');
		tmpBody.setAttribute('y', '0');
		tmpBody.setAttribute('width', String(tmpWidth));
		tmpBody.setAttribute('height', String(tmpHeight));
		tmpBody.setAttribute('data-node-hash', pNodeData.Hash);
		tmpBody.setAttribute('data-element-type', 'node-body');

		// Apply custom styles from node type
		if (pNodeTypeConfig && pNodeTypeConfig.BodyStyle)
		{
			for (let tmpStyleKey in pNodeTypeConfig.BodyStyle)
			{
				tmpBody.setAttribute(tmpStyleKey, pNodeTypeConfig.BodyStyle[tmpStyleKey]);
			}
		}

		tmpGroup.appendChild(tmpBody);

		// Title bar background (top portion)
		let tmpTitleBar = this._FlowView._SVGHelperProvider.createSVGElement('rect');
		tmpTitleBar.setAttribute('class', 'pict-flow-node-title-bar');
		tmpTitleBar.setAttribute('x', '0');
		tmpTitleBar.setAttribute('y', '0');
		tmpTitleBar.setAttribute('width', String(tmpWidth));
		tmpTitleBar.setAttribute('height', String(tmpTitleBarHeight));
		tmpTitleBar.setAttribute('data-node-hash', pNodeData.Hash);
		tmpTitleBar.setAttribute('data-element-type', 'node-body');

		// Apply custom title bar color
		if (pNodeTypeConfig && pNodeTypeConfig.TitleBarColor)
		{
			tmpTitleBar.setAttribute('fill', pNodeTypeConfig.TitleBarColor);
		}

		tmpGroup.appendChild(tmpTitleBar);

		// Title bar bottom fill (to square off the rounded corners at the bottom of the title bar)
		let tmpTitleBarBottom = this._FlowView._SVGHelperProvider.createSVGElement('rect');
		tmpTitleBarBottom.setAttribute('class', 'pict-flow-node-title-bar-bottom');
		tmpTitleBarBottom.setAttribute('x', '0');
		tmpTitleBarBottom.setAttribute('y', String(tmpTitleBarHeight - 6));
		tmpTitleBarBottom.setAttribute('width', String(tmpWidth));
		tmpTitleBarBottom.setAttribute('height', '6');
		tmpTitleBarBottom.setAttribute('data-node-hash', pNodeData.Hash);
		tmpTitleBarBottom.setAttribute('data-element-type', 'node-body');

		if (pNodeTypeConfig && pNodeTypeConfig.TitleBarColor)
		{
			tmpTitleBarBottom.setAttribute('fill', pNodeTypeConfig.TitleBarColor);
		}

		tmpGroup.appendChild(tmpTitleBarBottom);

		// Title text
		let tmpTitle = this._FlowView._SVGHelperProvider.createSVGElement('text');
		tmpTitle.setAttribute('class', 'pict-flow-node-title');
		tmpTitle.setAttribute('x', String(tmpWidth / 2));
		tmpTitle.setAttribute('y', String(tmpTitleBarHeight / 2 + 1));
		tmpTitle.setAttribute('text-anchor', 'middle');
		tmpTitle.setAttribute('dominant-baseline', 'central');
		tmpTitle.textContent = pNodeData.Title || 'Untitled';
		tmpGroup.appendChild(tmpTitle);

		// Type label (below title bar)
		if (pNodeTypeConfig && pNodeTypeConfig.Label && pNodeTypeConfig.Label !== pNodeData.Title)
		{
			let tmpTypeLabel = this._FlowView._SVGHelperProvider.createSVGElement('text');
			tmpTypeLabel.setAttribute('class', 'pict-flow-node-type-label');
			tmpTypeLabel.setAttribute('x', String(tmpWidth / 2));
			tmpTypeLabel.setAttribute('y', String(tmpTitleBarHeight + 18));
			tmpTypeLabel.setAttribute('text-anchor', 'middle');
			tmpTypeLabel.setAttribute('dominant-baseline', 'central');
			tmpTypeLabel.textContent = pNodeTypeConfig.Label;
			tmpGroup.appendChild(tmpTypeLabel);
		}

		// FlowCard metadata: render icon and code in the node body
		if (pNodeTypeConfig && pNodeTypeConfig.CardMetadata)
		{
			let tmpMeta = pNodeTypeConfig.CardMetadata;
			let tmpBodyCenterY = tmpTitleBarHeight + (tmpHeight - tmpTitleBarHeight) / 2;

			// Icon (displayed as text, left-of-center or centered if no code)
			if (tmpMeta.Icon)
			{
				let tmpIconText = this._FlowView._SVGHelperProvider.createSVGElement('text');
				tmpIconText.setAttribute('class', 'pict-flow-node-card-icon');
				tmpIconText.setAttribute('font-size', '16');
				tmpIconText.setAttribute('text-anchor', 'middle');
				tmpIconText.setAttribute('dominant-baseline', 'central');
				tmpIconText.setAttribute('pointer-events', 'none');

				if (tmpMeta.Code)
				{
					// Icon on the left, code on the right
					tmpIconText.setAttribute('x', String(tmpWidth * 0.33));
				}
				else
				{
					tmpIconText.setAttribute('x', String(tmpWidth / 2));
				}
				tmpIconText.setAttribute('y', String(tmpBodyCenterY));
				tmpIconText.textContent = tmpMeta.Icon;
				tmpGroup.appendChild(tmpIconText);
			}

			// Code badge (displayed as monospace text)
			if (tmpMeta.Code)
			{
				let tmpCodeText = this._FlowView._SVGHelperProvider.createSVGElement('text');
				tmpCodeText.setAttribute('class', 'pict-flow-node-card-code');
				tmpCodeText.setAttribute('font-size', '10');
				tmpCodeText.setAttribute('font-family', 'monospace');
				tmpCodeText.setAttribute('fill', '#7f8c8d');
				tmpCodeText.setAttribute('text-anchor', 'middle');
				tmpCodeText.setAttribute('dominant-baseline', 'central');
				tmpCodeText.setAttribute('pointer-events', 'none');

				if (tmpMeta.Icon)
				{
					tmpCodeText.setAttribute('x', String(tmpWidth * 0.67));
				}
				else
				{
					tmpCodeText.setAttribute('x', String(tmpWidth / 2));
				}
				tmpCodeText.setAttribute('y', String(tmpBodyCenterY));
				tmpCodeText.textContent = tmpMeta.Code;
				tmpGroup.appendChild(tmpCodeText);
			}

			// Tooltip via SVG <title> element
			if (tmpMeta.Tooltip || tmpMeta.Description)
			{
				let tmpSVGTitle = this._FlowView._SVGHelperProvider.createSVGElement('title');
				tmpSVGTitle.textContent = tmpMeta.Tooltip || tmpMeta.Description;
				tmpGroup.appendChild(tmpSVGTitle);
			}
		}

		// Render ports
		this._renderPorts(pNodeData, tmpGroup, tmpWidth, tmpHeight);

		// Panel indicator icon (small rect in bottom-right corner)
		if (pNodeTypeConfig && pNodeTypeConfig.PropertiesPanel)
		{
			let tmpIndicatorSize = 10;
			let tmpIndicatorMargin = 4;
			let tmpIndicator = this._FlowView._SVGHelperProvider.createSVGElement('rect');
			tmpIndicator.setAttribute('class', 'pict-flow-node-panel-indicator');
			tmpIndicator.setAttribute('x', String(tmpWidth - tmpIndicatorSize - tmpIndicatorMargin));
			tmpIndicator.setAttribute('y', String(tmpHeight - tmpIndicatorSize - tmpIndicatorMargin));
			tmpIndicator.setAttribute('width', String(tmpIndicatorSize));
			tmpIndicator.setAttribute('height', String(tmpIndicatorSize));
			tmpIndicator.setAttribute('rx', '2');
			tmpIndicator.setAttribute('ry', '2');
			tmpIndicator.setAttribute('data-node-hash', pNodeData.Hash);
			tmpIndicator.setAttribute('data-element-type', 'panel-indicator');

			let tmpIndicatorTitle = this._FlowView._SVGHelperProvider.createSVGElement('title');
			tmpIndicatorTitle.textContent = 'Double-click to open properties';
			tmpIndicator.appendChild(tmpIndicatorTitle);

			tmpGroup.appendChild(tmpIndicator);
		}

		pNodesLayer.appendChild(tmpGroup);
	}

	/**
	 * Render ports for a node
	 * @param {Object} pNodeData
	 * @param {SVGGElement} pGroup - The node's SVG group
	 * @param {number} pWidth
	 * @param {number} pHeight
	 */
	_renderPorts(pNodeData, pGroup, pWidth, pHeight)
	{
		if (!pNodeData.Ports || !Array.isArray(pNodeData.Ports)) return;

		// Group ports by side and direction for positioning
		let tmpPortsBySide = { left: [], right: [], top: [], bottom: [] };
		for (let i = 0; i < pNodeData.Ports.length; i++)
		{
			let tmpPort = pNodeData.Ports[i];
			let tmpSide = tmpPort.Side || (tmpPort.Direction === 'input' ? 'left' : 'right');
			if (tmpPortsBySide[tmpSide])
			{
				tmpPortsBySide[tmpSide].push(tmpPort);
			}
		}

		for (let tmpSide in tmpPortsBySide)
		{
			let tmpPorts = tmpPortsBySide[tmpSide];
			for (let i = 0; i < tmpPorts.length; i++)
			{
				let tmpPort = tmpPorts[i];
				let tmpPosition = this._getPortLocalPosition(tmpSide, i, tmpPorts.length, pWidth, pHeight);

				// Port circle
				let tmpCircle = this._FlowView._SVGHelperProvider.createSVGElement('circle');
				tmpCircle.setAttribute('class', `pict-flow-port ${tmpPort.Direction}`);
				tmpCircle.setAttribute('cx', String(tmpPosition.x));
				tmpCircle.setAttribute('cy', String(tmpPosition.y));
				tmpCircle.setAttribute('r', '5');
				tmpCircle.setAttribute('data-port-hash', tmpPort.Hash);
				tmpCircle.setAttribute('data-node-hash', pNodeData.Hash);
				tmpCircle.setAttribute('data-port-direction', tmpPort.Direction);
				tmpCircle.setAttribute('data-element-type', 'port');
				pGroup.appendChild(tmpCircle);

				// Port label
				if (tmpPort.Label)
				{
					let tmpLabel = this._FlowView._SVGHelperProvider.createSVGElement('text');
					tmpLabel.setAttribute('class', 'pict-flow-port-label');
					tmpLabel.textContent = tmpPort.Label;

					let tmpLabelOffset = 12;
					switch (tmpSide)
					{
						case 'left':
							tmpLabel.setAttribute('x', String(tmpPosition.x + tmpLabelOffset));
							tmpLabel.setAttribute('y', String(tmpPosition.y));
							tmpLabel.setAttribute('text-anchor', 'start');
							break;
						case 'right':
							tmpLabel.setAttribute('x', String(tmpPosition.x - tmpLabelOffset));
							tmpLabel.setAttribute('y', String(tmpPosition.y));
							tmpLabel.setAttribute('text-anchor', 'end');
							break;
						case 'top':
							tmpLabel.setAttribute('x', String(tmpPosition.x));
							tmpLabel.setAttribute('y', String(tmpPosition.y + tmpLabelOffset));
							tmpLabel.setAttribute('text-anchor', 'middle');
							break;
						case 'bottom':
							tmpLabel.setAttribute('x', String(tmpPosition.x));
							tmpLabel.setAttribute('y', String(tmpPosition.y - tmpLabelOffset));
							tmpLabel.setAttribute('text-anchor', 'middle');
							break;
					}
					tmpLabel.setAttribute('dominant-baseline', 'central');
					pGroup.appendChild(tmpLabel);
				}
			}
		}
	}

	/**
	 * Calculate port position relative to node origin.
	 *
	 * For left and right side ports, positioning is offset below the title bar
	 * so that ports never overlap the header area.
	 *
	 * @param {string} pSide - 'left', 'right', 'top', 'bottom'
	 * @param {number} pIndex - Index of this port on its side
	 * @param {number} pTotal - Total ports on this side
	 * @param {number} pWidth - Node width
	 * @param {number} pHeight - Node height
	 * @returns {{x: number, y: number}}
	 */
	_getPortLocalPosition(pSide, pIndex, pTotal, pWidth, pHeight)
	{
		let tmpSpacing;
		let tmpTitleBarHeight = this.options.NodeTitleBarHeight;

		switch (pSide)
		{
			case 'left':
			{
				// Distribute ports in the body area below the title bar
				let tmpBodyHeight = pHeight - tmpTitleBarHeight;
				tmpSpacing = tmpBodyHeight / (pTotal + 1);
				return { x: 0, y: tmpTitleBarHeight + tmpSpacing * (pIndex + 1) };
			}
			case 'right':
			{
				let tmpBodyHeight = pHeight - tmpTitleBarHeight;
				tmpSpacing = tmpBodyHeight / (pTotal + 1);
				return { x: pWidth, y: tmpTitleBarHeight + tmpSpacing * (pIndex + 1) };
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

module.exports = PictViewFlowNode;

module.exports.default_configuration = _DefaultConfiguration;
