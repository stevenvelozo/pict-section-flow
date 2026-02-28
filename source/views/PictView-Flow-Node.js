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

		// Build CSS class list with optional per-type modifier classes
		let tmpClassList = `pict-flow-node ${pIsSelected ? 'selected' : ''} pict-flow-node-${pNodeData.Type || 'default'}`;
		if (pNodeTypeConfig)
		{
			if (pNodeTypeConfig.PortLabelsOnHover) tmpClassList += ' pict-flow-node-port-labels-hover';
			if (pNodeTypeConfig.PortLabelsVertical) tmpClassList += ' pict-flow-node-port-labels-vertical';
		}
		tmpGroup.setAttribute('class', tmpClassList);
		tmpGroup.setAttribute('transform', `translate(${pNodeData.X}, ${pNodeData.Y})`);
		tmpGroup.setAttribute('data-node-hash', pNodeData.Hash);
		tmpGroup.setAttribute('data-element-type', 'node');

		let tmpWidth = pNodeData.Width || 180;
		let tmpHeight = pNodeData.Height || 80;
		let tmpTitleBarHeight = this.options.NodeTitleBarHeight;

		// Determine node body mode from theme (bracket vs rect)
		let tmpNodeBodyMode = 'rect';
		if (this._FlowView._ThemeProvider)
		{
			let tmpActiveTheme = this._FlowView._ThemeProvider.getActiveTheme();
			if (tmpActiveTheme && tmpActiveTheme.NodeBodyMode)
			{
				tmpNodeBodyMode = tmpActiveTheme.NodeBodyMode;
			}
		}

		if (tmpNodeBodyMode === 'bracket')
		{
			this._renderBracketNodeBody(tmpGroup, pNodeData, tmpWidth, tmpHeight, tmpTitleBarHeight, pNodeTypeConfig);
		}
		else
		{
			this._renderRectNodeBody(tmpGroup, pNodeData, tmpWidth, tmpHeight, tmpTitleBarHeight, pNodeTypeConfig);
		}

		// Determine if this node has a title-bar icon (FlowCard with CardMetadata)
		let tmpHasTitleIcon = false;
		let tmpTitleIconSize = 12;
		let tmpTitleIconMarginLeft = 8;
		let tmpTitleIconGap = 4;

		if (pNodeTypeConfig && pNodeTypeConfig.CardMetadata)
		{
			let tmpMeta = pNodeTypeConfig.CardMetadata;
			let tmpIconProvider = this._FlowView._IconProvider;
			if (tmpMeta.Icon || tmpIconProvider)
			{
				tmpHasTitleIcon = true;
			}
		}

		// Title text (position adjusts when a title-bar icon is present)
		let tmpTitle = this._FlowView._SVGHelperProvider.createSVGElement('text');
		tmpTitle.setAttribute('class', 'pict-flow-node-title');
		if (tmpHasTitleIcon)
		{
			tmpTitle.setAttribute('x', String(tmpTitleIconMarginLeft + tmpTitleIconSize + tmpTitleIconGap));
			tmpTitle.setAttribute('text-anchor', 'start');
		}
		else
		{
			tmpTitle.setAttribute('x', String(tmpWidth / 2));
			tmpTitle.setAttribute('text-anchor', 'middle');
		}
		tmpTitle.setAttribute('y', String(tmpTitleBarHeight / 2 + 1));
		tmpTitle.setAttribute('dominant-baseline', 'central');
		tmpTitle.textContent = pNodeData.Title || 'Untitled';
		tmpGroup.appendChild(tmpTitle);

		// Determine whether labels should be rendered
		let tmpShowTypeLabel = (!pNodeTypeConfig || pNodeTypeConfig.ShowTypeLabel !== false);
		let tmpLabelsInFront = (!pNodeTypeConfig || pNodeTypeConfig.LabelsInFront !== false);

		// Helper: render type label + code badge + tooltip (the "middle labels")
		let tmpRenderTypeLabels = () =>
		{
			// Type label (below title bar — hover-only for FlowCard nodes via CSS)
			if (tmpShowTypeLabel && pNodeTypeConfig && pNodeTypeConfig.Label && pNodeTypeConfig.Label !== pNodeData.Title)
			{
				let tmpTypeLabel = this._FlowView._SVGHelperProvider.createSVGElement('text');
				tmpTypeLabel.setAttribute('class', 'pict-flow-node-type-label');
				tmpTypeLabel.setAttribute('x', String(tmpWidth / 2));
				tmpTypeLabel.setAttribute('y', String(tmpTitleBarHeight + 16));
				tmpTypeLabel.setAttribute('text-anchor', 'middle');
				tmpTypeLabel.setAttribute('dominant-baseline', 'central');
				tmpTypeLabel.textContent = pNodeTypeConfig.Label;
				tmpGroup.appendChild(tmpTypeLabel);
			}

			// FlowCard metadata: icon in title bar, code badge in body (hover-only via CSS)
			if (pNodeTypeConfig && pNodeTypeConfig.CardMetadata)
			{
				let tmpMeta = pNodeTypeConfig.CardMetadata;
				let tmpIconProvider = this._FlowView._IconProvider;
				let tmpTitleIconRendered = false;

				// Icon position in title bar (vertically centered)
				let tmpIconX = tmpTitleIconMarginLeft;
				let tmpIconY = (tmpTitleBarHeight - tmpTitleIconSize) / 2;

				if (tmpMeta.Icon && tmpIconProvider && !tmpIconProvider.isEmojiIcon(tmpMeta.Icon))
				{
					// SVG icon via the icon provider — rendered into title bar
					let tmpResolvedKey = tmpIconProvider.resolveIconKey(tmpMeta);
					let tmpIconGroup = tmpIconProvider.renderIconIntoSVGGroup(
						tmpResolvedKey, tmpGroup,
						tmpIconX, tmpIconY,
						tmpTitleIconSize);
					if (tmpIconGroup)
					{
						tmpIconGroup.setAttribute('class',
							(tmpIconGroup.getAttribute('class') || '') + ' pict-flow-node-title-icon');
					}
					tmpTitleIconRendered = true;
				}
				else if (tmpMeta.Icon && tmpIconProvider && tmpIconProvider.isEmojiIcon(tmpMeta.Icon))
				{
					// Emoji icon in title bar
					let tmpIconText = this._FlowView._SVGHelperProvider.createSVGElement('text');
					tmpIconText.setAttribute('class', 'pict-flow-node-card-icon pict-flow-node-title-icon-emoji');
					tmpIconText.setAttribute('font-size', String(tmpTitleIconSize));
					tmpIconText.setAttribute('text-anchor', 'middle');
					tmpIconText.setAttribute('dominant-baseline', 'central');
					tmpIconText.setAttribute('pointer-events', 'none');
					tmpIconText.setAttribute('x', String(tmpIconX + tmpTitleIconSize / 2));
					tmpIconText.setAttribute('y', String(tmpTitleBarHeight / 2));
					tmpIconText.textContent = tmpMeta.Icon;
					tmpGroup.appendChild(tmpIconText);
					tmpTitleIconRendered = true;
				}
				else if (tmpMeta.Icon)
				{
					// No icon provider — text fallback in title bar
					let tmpIconText = this._FlowView._SVGHelperProvider.createSVGElement('text');
					tmpIconText.setAttribute('class', 'pict-flow-node-card-icon pict-flow-node-title-icon-emoji');
					tmpIconText.setAttribute('font-size', String(tmpTitleIconSize));
					tmpIconText.setAttribute('text-anchor', 'middle');
					tmpIconText.setAttribute('dominant-baseline', 'central');
					tmpIconText.setAttribute('pointer-events', 'none');
					tmpIconText.setAttribute('x', String(tmpIconX + tmpTitleIconSize / 2));
					tmpIconText.setAttribute('y', String(tmpTitleBarHeight / 2));
					tmpIconText.textContent = tmpMeta.Icon;
					tmpGroup.appendChild(tmpIconText);
					tmpTitleIconRendered = true;
				}

				// Default fallback icon in title bar
				if (!tmpTitleIconRendered && tmpIconProvider)
				{
					let tmpIconGroup = tmpIconProvider.renderIconIntoSVGGroup(
						'default', tmpGroup,
						tmpIconX, tmpIconY,
						tmpTitleIconSize);
					if (tmpIconGroup)
					{
						tmpIconGroup.setAttribute('class',
							(tmpIconGroup.getAttribute('class') || '') + ' pict-flow-node-title-icon');
					}
				}

				// Code badge in body (hover-only via CSS, skipped when ShowTypeLabel is false)
				let tmpBodyCenterY = tmpTitleBarHeight + (tmpHeight - tmpTitleBarHeight) / 2;
				if (tmpShowTypeLabel && tmpMeta.Code)
				{
					let tmpCodeText = this._FlowView._SVGHelperProvider.createSVGElement('text');
					tmpCodeText.setAttribute('class', 'pict-flow-node-card-code');
					tmpCodeText.setAttribute('font-size', '10');
					tmpCodeText.setAttribute('font-family', 'monospace');
					tmpCodeText.setAttribute('fill', '#7f8c8d');
					tmpCodeText.setAttribute('text-anchor', 'middle');
					tmpCodeText.setAttribute('dominant-baseline', 'central');
					tmpCodeText.setAttribute('pointer-events', 'none');
					tmpCodeText.setAttribute('x', String(tmpWidth / 2));
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
		};

		// Render order depends on LabelsInFront:
		//   true  (default): body content first, then labels + ports (labels on top)
		//   false:           labels + ports first, then body content (content on top)
		if (tmpLabelsInFront)
		{
			this._renderBodyContent(pNodeData, tmpGroup, tmpWidth, tmpHeight, pNodeTypeConfig);
			tmpRenderTypeLabels();
			this._renderPorts(pNodeData, tmpGroup, tmpWidth, tmpHeight, pNodeTypeConfig);
		}
		else
		{
			tmpRenderTypeLabels();
			this._renderPorts(pNodeData, tmpGroup, tmpWidth, tmpHeight, pNodeTypeConfig);
			this._renderBodyContent(pNodeData, tmpGroup, tmpWidth, tmpHeight, pNodeTypeConfig);
		}

		// Panel indicator icon (small rect in bottom-right corner)
		if (pNodeTypeConfig && pNodeTypeConfig.PropertiesPanel)
		{
			let tmpIndicatorSize = 10;
			let tmpIndicatorMargin = 4;
			let tmpIndicatorX = tmpWidth - tmpIndicatorSize - tmpIndicatorMargin;
			let tmpIndicatorY = tmpHeight - tmpIndicatorSize - tmpIndicatorMargin;
			let tmpShapeProvider = this._FlowView._ConnectorShapesProvider;
			let tmpIndicator;

			if (tmpShapeProvider)
			{
				tmpIndicator = tmpShapeProvider.createPanelIndicatorElement(
					pNodeData.Hash, tmpIndicatorX, tmpIndicatorY,
					tmpIndicatorSize, tmpIndicatorSize);
			}
			else
			{
				tmpIndicator = this._FlowView._SVGHelperProvider.createSVGElement('rect');
				tmpIndicator.setAttribute('class', 'pict-flow-node-panel-indicator');
				tmpIndicator.setAttribute('x', String(tmpIndicatorX));
				tmpIndicator.setAttribute('y', String(tmpIndicatorY));
				tmpIndicator.setAttribute('width', String(tmpIndicatorSize));
				tmpIndicator.setAttribute('height', String(tmpIndicatorSize));
				tmpIndicator.setAttribute('rx', '2');
				tmpIndicator.setAttribute('ry', '2');
				tmpIndicator.setAttribute('data-node-hash', pNodeData.Hash);
				tmpIndicator.setAttribute('data-element-type', 'panel-indicator');
			}

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
	 * @param {Object} [pNodeTypeConfig] - Node type configuration (for label display options)
	 */
	_renderPorts(pNodeData, pGroup, pWidth, pHeight, pNodeTypeConfig)
	{
		if (!pNodeData.Ports || !Array.isArray(pNodeData.Ports)) return;

		let tmpPortLabelsVertical = (pNodeTypeConfig && pNodeTypeConfig.PortLabelsVertical);
		let tmpPortLabelPadding = (pNodeTypeConfig && pNodeTypeConfig.PortLabelPadding);

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
				let tmpShapeProvider = this._FlowView._ConnectorShapesProvider;
				let tmpCircle;
				if (tmpShapeProvider)
				{
					tmpCircle = tmpShapeProvider.createPortElement(tmpPort, tmpPosition, pNodeData.Hash);
				}
				else
				{
					tmpCircle = this._FlowView._SVGHelperProvider.createSVGElement('circle');
					tmpCircle.setAttribute('class', `pict-flow-port ${tmpPort.Direction}`);
					tmpCircle.setAttribute('cx', String(tmpPosition.x));
					tmpCircle.setAttribute('cy', String(tmpPosition.y));
					tmpCircle.setAttribute('r', '5');
					tmpCircle.setAttribute('data-port-hash', tmpPort.Hash);
					tmpCircle.setAttribute('data-node-hash', pNodeData.Hash);
					tmpCircle.setAttribute('data-port-direction', tmpPort.Direction);
					tmpCircle.setAttribute('data-element-type', 'port');
				}
				pGroup.appendChild(tmpCircle);

				// Port label
				if (tmpPort.Label)
				{
					let tmpLabel = this._FlowView._SVGHelperProvider.createSVGElement('text');
					tmpLabel.setAttribute('class', 'pict-flow-port-label');
					tmpLabel.textContent = tmpPort.Label;

					// Base offset from port center; PortLabelPadding adds extra space
					let tmpLabelOffset = 12;
					let tmpPaddingExtra = tmpPortLabelPadding ? 8 : 0;

					if (tmpPortLabelsVertical)
					{
						// Vertical labels: rotated -90° and centered on the port position.
						// After rotation, text-anchor controls vertical centering, so 'middle'
						// ensures the label is centered next to its port circle.
						switch (tmpSide)
						{
							case 'left':
								tmpLabel.setAttribute('x', String(tmpPosition.x + tmpLabelOffset + tmpPaddingExtra));
								tmpLabel.setAttribute('y', String(tmpPosition.y));
								tmpLabel.setAttribute('text-anchor', 'middle');
								tmpLabel.setAttribute('transform', `rotate(-90, ${tmpPosition.x + tmpLabelOffset + tmpPaddingExtra}, ${tmpPosition.y})`);
								break;
							case 'right':
								tmpLabel.setAttribute('x', String(tmpPosition.x - tmpLabelOffset - tmpPaddingExtra));
								tmpLabel.setAttribute('y', String(tmpPosition.y));
								tmpLabel.setAttribute('text-anchor', 'middle');
								tmpLabel.setAttribute('transform', `rotate(-90, ${tmpPosition.x - tmpLabelOffset - tmpPaddingExtra}, ${tmpPosition.y})`);
								break;
							case 'top':
								tmpLabel.setAttribute('x', String(tmpPosition.x));
								tmpLabel.setAttribute('y', String(tmpPosition.y + tmpLabelOffset + tmpPaddingExtra));
								tmpLabel.setAttribute('text-anchor', 'middle');
								tmpLabel.setAttribute('transform', `rotate(-90, ${tmpPosition.x}, ${tmpPosition.y + tmpLabelOffset + tmpPaddingExtra})`);
								break;
							case 'bottom':
								tmpLabel.setAttribute('x', String(tmpPosition.x));
								tmpLabel.setAttribute('y', String(tmpPosition.y - tmpLabelOffset - tmpPaddingExtra));
								tmpLabel.setAttribute('text-anchor', 'middle');
								tmpLabel.setAttribute('transform', `rotate(-90, ${tmpPosition.x}, ${tmpPosition.y - tmpLabelOffset - tmpPaddingExtra})`);
								break;
						}
					}
					else
					{
						// Horizontal labels (default)
						switch (tmpSide)
						{
							case 'left':
								tmpLabel.setAttribute('x', String(tmpPosition.x + tmpLabelOffset + tmpPaddingExtra));
								tmpLabel.setAttribute('y', String(tmpPosition.y));
								tmpLabel.setAttribute('text-anchor', 'start');
								break;
							case 'right':
								tmpLabel.setAttribute('x', String(tmpPosition.x - tmpLabelOffset - tmpPaddingExtra));
								tmpLabel.setAttribute('y', String(tmpPosition.y));
								tmpLabel.setAttribute('text-anchor', 'end');
								break;
							case 'top':
								tmpLabel.setAttribute('x', String(tmpPosition.x));
								tmpLabel.setAttribute('y', String(tmpPosition.y + tmpLabelOffset + tmpPaddingExtra));
								tmpLabel.setAttribute('text-anchor', 'middle');
								break;
							case 'bottom':
								tmpLabel.setAttribute('x', String(tmpPosition.x));
								tmpLabel.setAttribute('y', String(tmpPosition.y - tmpLabelOffset - tmpPaddingExtra));
								tmpLabel.setAttribute('text-anchor', 'middle');
								break;
						}
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
		return this._FlowView._GeometryProvider.getPortLocalPosition(pSide, pIndex, pTotal, pWidth, pHeight, this.options.NodeTitleBarHeight);
	}

	/**
	 * Render custom body content for a node (svg, html, or canvas).
	 *
	 * Checks for a BodyContent configuration on the node type and renders
	 * the appropriate content type into the node's SVG group.
	 *
	 * @param {Object} pNodeData - The node data object
	 * @param {SVGGElement} pGroup - The node's SVG group
	 * @param {number} pWidth - Node width
	 * @param {number} pHeight - Node height
	 * @param {Object} pNodeTypeConfig - The node type configuration
	 */
	_renderBodyContent(pNodeData, pGroup, pWidth, pHeight, pNodeTypeConfig)
	{
		if (!pNodeTypeConfig || !pNodeTypeConfig.BodyContent) return;

		let tmpBodyContent = pNodeTypeConfig.BodyContent;
		let tmpContentType = tmpBodyContent.ContentType;
		if (!tmpContentType) return;

		let tmpTitleBarHeight = this.options.NodeTitleBarHeight;
		let tmpPadding = (typeof tmpBodyContent.Padding === 'number') ? tmpBodyContent.Padding : 2;
		let tmpBodyBounds =
		{
			x: tmpPadding,
			y: tmpTitleBarHeight + tmpPadding,
			width: pWidth - (tmpPadding * 2),
			height: pHeight - tmpTitleBarHeight - (tmpPadding * 2)
		};

		let tmpPict = this._FlowView.pict || this.pict;

		// Register any templates defined in the BodyContent config (once)
		if (tmpBodyContent.Templates && Array.isArray(tmpBodyContent.Templates))
		{
			if (!this._registeredBodyTemplates)
			{
				this._registeredBodyTemplates = new Set();
			}
			for (let i = 0; i < tmpBodyContent.Templates.length; i++)
			{
				let tmpTpl = tmpBodyContent.Templates[i];
				if (tmpTpl.Hash && tmpTpl.Template && !this._registeredBodyTemplates.has(tmpTpl.Hash))
				{
					tmpPict.TemplateProvider.addTemplate(tmpTpl.Hash, tmpTpl.Template, 'PictViewFlowNode-BodyContent');
					this._registeredBodyTemplates.add(tmpTpl.Hash);
				}
			}
		}

		switch (tmpContentType)
		{
			case 'svg':
				this._renderBodyContentSVG(pNodeData, pGroup, tmpBodyContent, tmpBodyBounds, pNodeTypeConfig, tmpPict);
				break;
			case 'html':
				this._renderBodyContentHTML(pNodeData, pGroup, tmpBodyContent, tmpBodyBounds, pNodeTypeConfig, tmpPict);
				break;
			case 'canvas':
				this._renderBodyContentCanvas(pNodeData, pGroup, tmpBodyContent, tmpBodyBounds, pNodeTypeConfig);
				break;
			default:
				this.log.warn('PictViewFlowNode _renderBodyContent: unknown ContentType [' + tmpContentType + ']');
				break;
		}
	}

	/**
	 * Render SVG body content into a <g> group.
	 */
	_renderBodyContentSVG(pNodeData, pGroup, pBodyContent, pBounds, pNodeTypeConfig, pPict)
	{
		let tmpContentGroup = this._FlowView._SVGHelperProvider.createSVGElement('g');
		tmpContentGroup.setAttribute('class', 'pict-flow-node-body-content');
		tmpContentGroup.setAttribute('transform', `translate(${pBounds.x}, ${pBounds.y})`);

		// Render template content
		let tmpRenderedContent = this._resolveBodyTemplate(pBodyContent, pNodeData, pPict);
		if (tmpRenderedContent)
		{
			// Parse SVG markup into the group via a temporary SVG element
			let tmpTempSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			tmpTempSVG.innerHTML = tmpRenderedContent;
			while (tmpTempSVG.firstChild)
			{
				tmpContentGroup.appendChild(tmpTempSVG.firstChild);
			}
		}

		// Invoke render callback if provided
		if (typeof pBodyContent.RenderCallback === 'function')
		{
			pBodyContent.RenderCallback(tmpContentGroup, pNodeData, pNodeTypeConfig, pBounds);
		}

		pGroup.appendChild(tmpContentGroup);
	}

	/**
	 * Render HTML body content into a foreignObject.
	 */
	_renderBodyContentHTML(pNodeData, pGroup, pBodyContent, pBounds, pNodeTypeConfig, pPict)
	{
		let tmpFO = this._FlowView._SVGHelperProvider.createSVGElement('foreignObject');
		tmpFO.setAttribute('class', 'pict-flow-node-body-content-fo');
		tmpFO.setAttribute('x', String(pBounds.x));
		tmpFO.setAttribute('y', String(pBounds.y));
		tmpFO.setAttribute('width', String(pBounds.width));
		tmpFO.setAttribute('height', String(pBounds.height));

		let tmpDiv = document.createElement('div');
		tmpDiv.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
		tmpDiv.setAttribute('class', 'pict-flow-node-body-content-html');

		// Pointer event isolation — prevent node drag/canvas pan
		tmpDiv.addEventListener('pointerdown', (pEvent) => { pEvent.stopPropagation(); });
		tmpDiv.addEventListener('wheel', (pEvent) => { pEvent.stopPropagation(); });

		// Render template content
		let tmpRenderedContent = this._resolveBodyTemplate(pBodyContent, pNodeData, pPict);
		if (tmpRenderedContent)
		{
			tmpDiv.innerHTML = tmpRenderedContent;
		}

		// Invoke render callback if provided
		if (typeof pBodyContent.RenderCallback === 'function')
		{
			pBodyContent.RenderCallback(tmpDiv, pNodeData, pNodeTypeConfig, pBounds);
		}

		tmpFO.appendChild(tmpDiv);
		pGroup.appendChild(tmpFO);
	}

	/**
	 * Render canvas body content into a foreignObject.
	 */
	_renderBodyContentCanvas(pNodeData, pGroup, pBodyContent, pBounds, pNodeTypeConfig)
	{
		let tmpFO = this._FlowView._SVGHelperProvider.createSVGElement('foreignObject');
		tmpFO.setAttribute('class', 'pict-flow-node-body-content-fo');
		tmpFO.setAttribute('x', String(pBounds.x));
		tmpFO.setAttribute('y', String(pBounds.y));
		tmpFO.setAttribute('width', String(pBounds.width));
		tmpFO.setAttribute('height', String(pBounds.height));

		let tmpCanvas = document.createElement('canvas');
		tmpCanvas.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
		tmpCanvas.setAttribute('class', 'pict-flow-node-body-content-canvas');
		tmpCanvas.width = Math.floor(pBounds.width);
		tmpCanvas.height = Math.floor(pBounds.height);
		tmpCanvas.style.width = '100%';
		tmpCanvas.style.height = '100%';

		// Pointer event isolation
		tmpCanvas.addEventListener('pointerdown', (pEvent) => { pEvent.stopPropagation(); });
		tmpCanvas.addEventListener('wheel', (pEvent) => { pEvent.stopPropagation(); });

		// Invoke render callback (the primary rendering path for canvas)
		if (typeof pBodyContent.RenderCallback === 'function')
		{
			pBodyContent.RenderCallback(tmpCanvas, pNodeData, pNodeTypeConfig, pBounds);
		}

		tmpFO.appendChild(tmpCanvas);
		pGroup.appendChild(tmpFO);
	}

	/**
	 * Resolve and render a body content template string.
	 * @param {Object} pBodyContent - The BodyContent config
	 * @param {Object} pNodeData - The node data (template record)
	 * @param {Object} pPict - The Pict instance
	 * @returns {string|null} Rendered template content, or null
	 */
	_resolveBodyTemplate(pBodyContent, pNodeData, pPict)
	{
		if (pBodyContent.TemplateHash)
		{
			return pPict.parseTemplateByHash(pBodyContent.TemplateHash, pNodeData);
		}
		if (pBodyContent.Template)
		{
			return pPict.parseTemplate(pBodyContent.Template, pNodeData, null, [pNodeData]);
		}
		return null;
	}

	// ── Node Body Renderers ──────────────────────────────────────────────

	/**
	 * Render the standard rect-based node body (default mode).
	 * @param {SVGGElement} pGroup
	 * @param {Object} pNodeData
	 * @param {number} pWidth
	 * @param {number} pHeight
	 * @param {number} pTitleBarHeight
	 * @param {Object} pNodeTypeConfig
	 */
	_renderRectNodeBody(pGroup, pNodeData, pWidth, pHeight, pTitleBarHeight, pNodeTypeConfig)
	{
		// Node body (main rectangle)
		let tmpBody = this._FlowView._SVGHelperProvider.createSVGElement('rect');
		tmpBody.setAttribute('class', 'pict-flow-node-body');
		tmpBody.setAttribute('x', '0');
		tmpBody.setAttribute('y', '0');
		tmpBody.setAttribute('width', String(pWidth));
		tmpBody.setAttribute('height', String(pHeight));
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

		// Apply per-instance style overrides (for node-specific editing)
		// These must be applied as inline styles so they override CSS rules
		// (CSS declarations take precedence over SVG presentation attributes).
		if (pNodeData.Style)
		{
			let tmpInlineStyles = [];
			if (pNodeData.Style.BodyFill) tmpInlineStyles.push('fill:' + pNodeData.Style.BodyFill);
			if (pNodeData.Style.BodyStroke) tmpInlineStyles.push('stroke:' + pNodeData.Style.BodyStroke);
			if (pNodeData.Style.BodyStrokeWidth) tmpInlineStyles.push('stroke-width:' + pNodeData.Style.BodyStrokeWidth);
			if (tmpInlineStyles.length > 0)
			{
				tmpBody.setAttribute('style', tmpInlineStyles.join(';'));
			}
		}

		pGroup.appendChild(tmpBody);

		// Title bar background (top portion)
		let tmpTitleBar = this._FlowView._SVGHelperProvider.createSVGElement('rect');
		tmpTitleBar.setAttribute('class', 'pict-flow-node-title-bar');
		tmpTitleBar.setAttribute('x', '0');
		tmpTitleBar.setAttribute('y', '0');
		tmpTitleBar.setAttribute('width', String(pWidth));
		tmpTitleBar.setAttribute('height', String(pTitleBarHeight));
		tmpTitleBar.setAttribute('data-node-hash', pNodeData.Hash);
		tmpTitleBar.setAttribute('data-element-type', 'node-body');

		// Apply custom title bar color
		if (pNodeTypeConfig && pNodeTypeConfig.TitleBarColor)
		{
			tmpTitleBar.setAttribute('fill', pNodeTypeConfig.TitleBarColor);
		}

		pGroup.appendChild(tmpTitleBar);

		// Title bar bottom fill (to square off the rounded corners at the bottom of the title bar)
		let tmpTitleBarBottom = this._FlowView._SVGHelperProvider.createSVGElement('rect');
		tmpTitleBarBottom.setAttribute('class', 'pict-flow-node-title-bar-bottom');
		tmpTitleBarBottom.setAttribute('x', '0');
		tmpTitleBarBottom.setAttribute('y', String(pTitleBarHeight - 8));
		tmpTitleBarBottom.setAttribute('width', String(pWidth));
		tmpTitleBarBottom.setAttribute('height', '8');
		tmpTitleBarBottom.setAttribute('data-node-hash', pNodeData.Hash);
		tmpTitleBarBottom.setAttribute('data-element-type', 'node-body');

		if (pNodeTypeConfig && pNodeTypeConfig.TitleBarColor)
		{
			tmpTitleBarBottom.setAttribute('fill', pNodeTypeConfig.TitleBarColor);
		}

		// Per-instance title bar color override
		// Applied as inline style to override CSS rules.
		if (pNodeData.Style && pNodeData.Style.TitleBarColor)
		{
			tmpTitleBar.setAttribute('style', 'fill:' + pNodeData.Style.TitleBarColor);
			tmpTitleBarBottom.setAttribute('style', 'fill:' + pNodeData.Style.TitleBarColor);
		}

		pGroup.appendChild(tmpTitleBarBottom);
	}

	/**
	 * Render a bracket-style node body (used by sketch/blueprint themes).
	 *
	 * The bracket body consists of:
	 * 1. A fill rect for the body background (no stroke)
	 * 2. A fill rect for the title bar background (no stroke)
	 * 3. A bracket path drawn via the noise provider (outline + title divider)
	 *
	 * @param {SVGGElement} pGroup
	 * @param {Object} pNodeData
	 * @param {number} pWidth
	 * @param {number} pHeight
	 * @param {number} pTitleBarHeight
	 * @param {Object} pNodeTypeConfig
	 */
	_renderBracketNodeBody(pGroup, pNodeData, pWidth, pHeight, pTitleBarHeight, pNodeTypeConfig)
	{
		// 1. Body fill rect (background only, no stroke)
		let tmpBodyFill = this._FlowView._SVGHelperProvider.createSVGElement('rect');
		tmpBodyFill.setAttribute('class', 'pict-flow-node-body pict-flow-node-bracket-fill');
		tmpBodyFill.setAttribute('x', '0');
		tmpBodyFill.setAttribute('y', '0');
		tmpBodyFill.setAttribute('width', String(pWidth));
		tmpBodyFill.setAttribute('height', String(pHeight));
		tmpBodyFill.setAttribute('data-node-hash', pNodeData.Hash);
		tmpBodyFill.setAttribute('data-element-type', 'node-body');

		// Per-instance style overrides
		if (pNodeData.Style)
		{
			let tmpInlineStyles = [];
			if (pNodeData.Style.BodyFill) tmpInlineStyles.push('fill:' + pNodeData.Style.BodyFill);
			if (tmpInlineStyles.length > 0)
			{
				tmpBodyFill.setAttribute('style', tmpInlineStyles.join(';'));
			}
		}

		pGroup.appendChild(tmpBodyFill);

		// 2. Title bar fill rect (background only, no stroke)
		let tmpTitleFill = this._FlowView._SVGHelperProvider.createSVGElement('rect');
		tmpTitleFill.setAttribute('class', 'pict-flow-node-title-bar pict-flow-node-bracket-title-fill');
		tmpTitleFill.setAttribute('x', '0');
		tmpTitleFill.setAttribute('y', '0');
		tmpTitleFill.setAttribute('width', String(pWidth));
		tmpTitleFill.setAttribute('height', String(pTitleBarHeight));
		tmpTitleFill.setAttribute('data-node-hash', pNodeData.Hash);
		tmpTitleFill.setAttribute('data-element-type', 'node-body');

		if (pNodeTypeConfig && pNodeTypeConfig.TitleBarColor)
		{
			tmpTitleFill.setAttribute('style', 'fill:' + pNodeTypeConfig.TitleBarColor);
		}
		if (pNodeData.Style && pNodeData.Style.TitleBarColor)
		{
			tmpTitleFill.setAttribute('style', 'fill:' + pNodeData.Style.TitleBarColor);
		}

		pGroup.appendChild(tmpTitleFill);

		// 3. Bracket path (outline + title divider with optional noise)
		let tmpBracketConfig = { SerifLength: 6, TitleSeparator: true };
		if (this._FlowView._ThemeProvider)
		{
			let tmpActiveTheme = this._FlowView._ThemeProvider.getActiveTheme();
			if (tmpActiveTheme && tmpActiveTheme.BracketConfig)
			{
				tmpBracketConfig = Object.assign(tmpBracketConfig, tmpActiveTheme.BracketConfig);
			}
		}

		let tmpAmplitude = 0;
		if (this._FlowView._ThemeProvider)
		{
			tmpAmplitude = this._FlowView._ThemeProvider.getNodeNoiseAmplitude();
		}

		let tmpBracketD = '';
		if (this._FlowView._NoiseProvider)
		{
			tmpBracketD = this._FlowView._NoiseProvider.generateBracketPath(
				pWidth, pHeight,
				tmpBracketConfig.SerifLength,
				tmpBracketConfig.TitleSeparator ? pTitleBarHeight : 0,
				tmpAmplitude,
				pNodeData.Hash
			);
		}

		let tmpBracketPath = this._FlowView._SVGHelperProvider.createSVGElement('path');
		tmpBracketPath.setAttribute('class', 'pict-flow-node-bracket');
		tmpBracketPath.setAttribute('d', tmpBracketD);
		tmpBracketPath.setAttribute('data-node-hash', pNodeData.Hash);
		tmpBracketPath.setAttribute('data-element-type', 'node-body');

		// Per-instance stroke overrides
		if (pNodeData.Style)
		{
			let tmpInlineStyles = [];
			if (pNodeData.Style.BodyStroke) tmpInlineStyles.push('stroke:' + pNodeData.Style.BodyStroke);
			if (pNodeData.Style.BodyStrokeWidth) tmpInlineStyles.push('stroke-width:' + pNodeData.Style.BodyStrokeWidth);
			if (tmpInlineStyles.length > 0)
			{
				tmpBracketPath.setAttribute('style', tmpInlineStyles.join(';'));
			}
		}

		pGroup.appendChild(tmpBracketPath);
	}
}

module.exports = PictViewFlowNode;

module.exports.default_configuration = _DefaultConfiguration;
