const libPictView = require('pict-view');

const _DefaultConfiguration =
{
	ViewIdentifier: 'Flow-Toolbar',

	DefaultRenderable: 'Flow-Toolbar-Content',
	DefaultDestinationAddress: '#Flow-Toolbar-Container',

	AutoRender: false,

	FlowViewIdentifier: 'Pict-Flow',

	EnablePalette: true,

	CSS: false,

	Templates:
	[
		{
			Hash: 'Flow-Toolbar-Template',
			Template: /*html*/`
<div class="pict-flow-toolbar">
	<div class="pict-flow-toolbar-group">
		<span class="pict-flow-toolbar-label">Node:</span>
		<select class="pict-flow-toolbar-select" id="Flow-Toolbar-NodeType-{~D:Record.FlowViewIdentifier~}">
		</select>
		<button class="pict-flow-toolbar-btn" data-flow-action="add-node">+ Add Node</button>
	</div>
	<div class="pict-flow-toolbar-group">
		<button class="pict-flow-toolbar-btn danger" data-flow-action="delete-selected">Delete</button>
	</div>
	<div class="pict-flow-toolbar-group">
		<button class="pict-flow-toolbar-btn" data-flow-action="zoom-in">Zoom +</button>
		<button class="pict-flow-toolbar-btn" data-flow-action="zoom-out">Zoom -</button>
		<button class="pict-flow-toolbar-btn" data-flow-action="zoom-fit">Fit</button>
	</div>
	<div class="pict-flow-toolbar-group">
		<button class="pict-flow-toolbar-btn" data-flow-action="auto-layout">Auto Layout</button>
	</div>
	<div class="pict-flow-toolbar-group">
		<span class="pict-flow-toolbar-label">Layouts:</span>
		<select class="pict-flow-toolbar-select layout-select"
			id="Flow-Toolbar-LayoutSelect-{~D:Record.FlowViewIdentifier~}">
			<option value="">-- select layout --</option>
		</select>
		<button class="pict-flow-toolbar-btn" data-flow-action="save-layout" title="Save the current node positions as a named layout">Save</button>
		<button class="pict-flow-toolbar-btn" data-flow-action="restore-layout" title="Restore the selected layout">Restore</button>
		<button class="pict-flow-toolbar-btn danger" data-flow-action="delete-layout" title="Delete the selected saved layout">Delete</button>
	</div>
	<div class="pict-flow-toolbar-group">
		<button class="pict-flow-toolbar-btn" data-flow-action="fullscreen" id="Flow-Toolbar-Fullscreen-{~D:Record.FlowViewIdentifier~}" title="Toggle Fullscreen"><span class="pict-flow-toolbar-btn-icon" id="Flow-Toolbar-Fullscreen-Icon-{~D:Record.FlowViewIdentifier~}"></span> Fullscreen</button>
	</div>
</div>
<div class="pict-flow-palette-container" id="Flow-Palette-{~D:Record.FlowViewIdentifier~}">
	<div class="pict-flow-palette-toggle" data-flow-action="toggle-palette">
		<span>Card Palette</span>
		<span class="pict-flow-palette-toggle-arrow" id="Flow-Palette-Arrow-{~D:Record.FlowViewIdentifier~}"></span>
	</div>
	<div class="pict-flow-palette-body" id="Flow-Palette-Body-{~D:Record.FlowViewIdentifier~}">
	</div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: 'Flow-Toolbar-Content',
			TemplateHash: 'Flow-Toolbar-Template',
			DestinationAddress: '#Flow-Toolbar-Container',
			RenderMethod: 'replace'
		}
	]
};

class PictViewFlowToolbar extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultConfiguration)), pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'PictViewFlowToolbar';

		this._FlowView = null;
		this._PaletteOpen = false;
	}

	render(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress)
	{
		// Pass this.options as the template record so {~D:Record.FlowViewIdentifier~}
		// resolves correctly in the toolbar template.
		return super.render(pRenderableHash, pRenderDestinationAddress, this.options);
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		// Bind toolbar button events via event delegation
		let tmpToolbarElements = this.pict.ContentAssignment.getElement(`.pict-flow-toolbar`);
		if (tmpToolbarElements.length > 0)
		{
			let tmpToolbar = tmpToolbarElements[0];
			tmpToolbar.addEventListener('click', (pEvent) =>
			{
				let tmpTarget = pEvent.target;
				if (!tmpTarget) return;

				// Walk up to find the button with the action
				let tmpButton = tmpTarget.closest('[data-flow-action]');
				if (!tmpButton) return;

				let tmpAction = tmpButton.getAttribute('data-flow-action');
				this._handleToolbarAction(tmpAction);
			});
		}

		// Bind palette toggle and card click events
		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpPaletteContainer = this.pict.ContentAssignment.getElement(`#Flow-Palette-${tmpFlowViewIdentifier}`);
		if (tmpPaletteContainer.length > 0)
		{
			tmpPaletteContainer[0].addEventListener('click', (pEvent) =>
			{
				let tmpTarget = pEvent.target;
				if (!tmpTarget) return;

				// Check for toggle
				let tmpToggle = tmpTarget.closest('[data-flow-action="toggle-palette"]');
				if (tmpToggle)
				{
					this._togglePalette();
					return;
				}

				// Check for card click
				let tmpCard = tmpTarget.closest('[data-card-type]');
				if (tmpCard)
				{
					let tmpCardType = tmpCard.getAttribute('data-card-type');
					this._addCardFromPalette(tmpCardType);
				}
			});
		}

		// Populate the node type dropdown, palette, and layout dropdown
		this._populateNodeTypeDropdown();
		this._renderPalette();
		this._populateLayoutDropdown();

		// Populate SVG icons for toolbar buttons
		this._populateToolbarIcons();

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	/**
	 * Populate the node type dropdown from the registered node types.
	 */
	_populateNodeTypeDropdown()
	{
		if (!this._FlowView || !this._FlowView._NodeTypeProvider)
		{
			return;
		}

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpSelectElements = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-NodeType-${tmpFlowViewIdentifier}`);
		if (tmpSelectElements.length < 1)
		{
			return;
		}

		let tmpSelect = tmpSelectElements[0];

		// Clear existing options
		while (tmpSelect.firstChild)
		{
			tmpSelect.removeChild(tmpSelect.firstChild);
		}

		let tmpTypes = this._FlowView._NodeTypeProvider.getNodeTypes();
		let tmpTypeKeys = Object.keys(tmpTypes);

		for (let i = 0; i < tmpTypeKeys.length; i++)
		{
			let tmpTypeConfig = tmpTypes[tmpTypeKeys[i]];

			// Skip disabled cards
			if (tmpTypeConfig.CardMetadata && tmpTypeConfig.CardMetadata.Enabled === false)
			{
				continue;
			}

			let tmpOption = document.createElement('option');
			tmpOption.value = tmpTypeKeys[i];

			let tmpDropdownMeta = tmpTypeConfig.CardMetadata || {};
			let tmpIconProvider = this._FlowView ? this._FlowView._IconProvider : null;
			if (tmpDropdownMeta.Icon && tmpIconProvider && !tmpIconProvider.isEmojiIcon(tmpDropdownMeta.Icon))
			{
				// SVG mode: <option> cannot contain HTML, use [CODE] Label
				let tmpPrefix = tmpDropdownMeta.Code ? ('[' + tmpDropdownMeta.Code + '] ') : '';
				tmpOption.textContent = tmpPrefix + tmpTypeConfig.Label;
			}
			else if (tmpDropdownMeta.Icon)
			{
				tmpOption.textContent = tmpDropdownMeta.Icon + ' ' + tmpTypeConfig.Label;
			}
			else
			{
				tmpOption.textContent = tmpTypeConfig.Label;
			}

			tmpSelect.appendChild(tmpOption);
		}
	}

	/**
	 * Populate the layout dropdown from saved layouts in the flow data.
	 */
	_populateLayoutDropdown()
	{
		if (!this._FlowView || !this._FlowView._LayoutProvider)
		{
			return;
		}

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpSelectElements = this.pict.ContentAssignment.getElement(
			`#Flow-Toolbar-LayoutSelect-${tmpFlowViewIdentifier}`
		);
		if (tmpSelectElements.length < 1)
		{
			return;
		}

		let tmpSelect = tmpSelectElements[0];

		// Clear existing options
		while (tmpSelect.firstChild)
		{
			tmpSelect.removeChild(tmpSelect.firstChild);
		}

		// Add placeholder option
		let tmpPlaceholder = document.createElement('option');
		tmpPlaceholder.value = '';
		tmpPlaceholder.textContent = '-- select layout --';
		tmpSelect.appendChild(tmpPlaceholder);

		let tmpLayouts = this._FlowView._LayoutProvider.getLayouts();
		for (let i = 0; i < tmpLayouts.length; i++)
		{
			let tmpLayout = tmpLayouts[i];
			let tmpOption = document.createElement('option');
			tmpOption.value = tmpLayout.Hash;
			tmpOption.textContent = tmpLayout.Name;
			tmpSelect.appendChild(tmpOption);
		}
	}

	/**
	 * Render the card palette with categories and card chips.
	 */
	_renderPalette()
	{
		if (!this._FlowView || !this._FlowView._NodeTypeProvider) return;

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpPaletteBody = this.pict.ContentAssignment.getElement(`#Flow-Palette-Body-${tmpFlowViewIdentifier}`);
		if (tmpPaletteBody.length < 1) return;

		let tmpBody = tmpPaletteBody[0];

		// Clear existing palette content
		while (tmpBody.firstChild)
		{
			tmpBody.removeChild(tmpBody.firstChild);
		}

		let tmpCategories = this._FlowView._NodeTypeProvider.getCardsByCategory();
		let tmpCategoryKeys = Object.keys(tmpCategories);

		if (tmpCategoryKeys.length === 0)
		{
			// No FlowCards registered - hide the palette
			let tmpPaletteContainer = this.pict.ContentAssignment.getElement(`#Flow-Palette-${tmpFlowViewIdentifier}`);
			if (tmpPaletteContainer.length > 0)
			{
				tmpPaletteContainer[0].style.display = 'none';
			}
			return;
		}

		for (let i = 0; i < tmpCategoryKeys.length; i++)
		{
			let tmpCategoryName = tmpCategoryKeys[i];
			let tmpCards = tmpCategories[tmpCategoryName];

			let tmpCategoryDiv = document.createElement('div');
			tmpCategoryDiv.className = 'pict-flow-palette-category';

			let tmpCategoryLabel = document.createElement('div');
			tmpCategoryLabel.className = 'pict-flow-palette-category-label';
			tmpCategoryLabel.textContent = tmpCategoryName;
			tmpCategoryDiv.appendChild(tmpCategoryLabel);

			let tmpCardsDiv = document.createElement('div');
			tmpCardsDiv.className = 'pict-flow-palette-cards';

			for (let j = 0; j < tmpCards.length; j++)
			{
				let tmpCardConfig = tmpCards[j];
				let tmpMeta = tmpCardConfig.CardMetadata || {};

				let tmpCardEl = document.createElement('div');
				tmpCardEl.className = 'pict-flow-palette-card';
				if (tmpMeta.Enabled === false)
				{
					tmpCardEl.classList.add('disabled');
				}
				tmpCardEl.setAttribute('data-card-type', tmpCardConfig.Hash);

				if (tmpMeta.Tooltip)
				{
					tmpCardEl.setAttribute('title', tmpMeta.Tooltip);
				}
				else if (tmpMeta.Description)
				{
					tmpCardEl.setAttribute('title', tmpMeta.Description);
				}

				// Icon or color swatch
				if (tmpMeta.Icon)
				{
					let tmpIconSpan = document.createElement('span');
					tmpIconSpan.className = 'pict-flow-palette-card-icon';
					let tmpIconProvider = this._FlowView._IconProvider;
					if (tmpIconProvider && !tmpIconProvider.isEmojiIcon(tmpMeta.Icon))
					{
						let tmpResolvedKey = tmpIconProvider.resolveIconKey(tmpMeta);
						tmpIconSpan.innerHTML = tmpIconProvider.getIconSVGMarkup(tmpResolvedKey, 14);
					}
					else
					{
						tmpIconSpan.textContent = tmpMeta.Icon;
					}
					tmpCardEl.appendChild(tmpIconSpan);
				}
				else if (this._FlowView._IconProvider)
				{
					// No icon specified — render default fallback
					let tmpIconSpan = document.createElement('span');
					tmpIconSpan.className = 'pict-flow-palette-card-icon';
					tmpIconSpan.innerHTML = this._FlowView._IconProvider.getIconSVGMarkup('default', 14);
					tmpCardEl.appendChild(tmpIconSpan);
				}
				else if (tmpCardConfig.TitleBarColor)
				{
					let tmpSwatch = document.createElement('span');
					tmpSwatch.className = 'pict-flow-palette-card-swatch';
					tmpSwatch.style.backgroundColor = tmpCardConfig.TitleBarColor;
					tmpCardEl.appendChild(tmpSwatch);
				}

				// Title
				let tmpTitleSpan = document.createElement('span');
				tmpTitleSpan.className = 'pict-flow-palette-card-title';
				tmpTitleSpan.textContent = tmpCardConfig.Label;
				tmpCardEl.appendChild(tmpTitleSpan);

				// Code badge
				if (tmpMeta.Code)
				{
					let tmpCodeSpan = document.createElement('span');
					tmpCodeSpan.className = 'pict-flow-palette-card-code';
					tmpCodeSpan.textContent = tmpMeta.Code;
					tmpCardEl.appendChild(tmpCodeSpan);
				}

				tmpCardsDiv.appendChild(tmpCardEl);
			}

			tmpCategoryDiv.appendChild(tmpCardsDiv);
			tmpBody.appendChild(tmpCategoryDiv);
		}
	}

	/**
	 * Populate SVG icons for the fullscreen button and palette toggle chevron.
	 */
	_populateToolbarIcons()
	{
		let tmpIconProvider = this._FlowView ? this._FlowView._IconProvider : null;
		if (!tmpIconProvider) return;

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;

		// Fullscreen button icon
		let tmpFullscreenIcon = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-Fullscreen-Icon-${tmpFlowViewIdentifier}`);
		if (tmpFullscreenIcon.length > 0)
		{
			tmpFullscreenIcon[0].innerHTML = tmpIconProvider.getIconSVGMarkup('fullscreen', 14);
		}

		// Palette toggle chevron
		let tmpArrow = this.pict.ContentAssignment.getElement(`#Flow-Palette-Arrow-${tmpFlowViewIdentifier}`);
		if (tmpArrow.length > 0)
		{
			tmpArrow[0].innerHTML = tmpIconProvider.getIconSVGMarkup('chevron-down', 10);
		}
	}

	/**
	 * Toggle the palette open/closed.
	 */
	_togglePalette()
	{
		this._PaletteOpen = !this._PaletteOpen;

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;

		let tmpBody = this.pict.ContentAssignment.getElement(`#Flow-Palette-Body-${tmpFlowViewIdentifier}`);
		if (tmpBody.length > 0)
		{
			if (this._PaletteOpen)
			{
				tmpBody[0].classList.add('open');
			}
			else
			{
				tmpBody[0].classList.remove('open');
			}
		}

		let tmpArrow = this.pict.ContentAssignment.getElement(`#Flow-Palette-Arrow-${tmpFlowViewIdentifier}`);
		if (tmpArrow.length > 0)
		{
			if (this._PaletteOpen)
			{
				tmpArrow[0].classList.add('open');
			}
			else
			{
				tmpArrow[0].classList.remove('open');
			}
		}
	}

	/**
	 * Add a node from a palette card click.
	 * @param {string} pCardType - The card type hash
	 */
	_addCardFromPalette(pCardType)
	{
		if (!this._FlowView) return;

		let tmpVS = this._FlowView.viewState;
		let tmpX = (-tmpVS.PanX + 200) / tmpVS.Zoom;
		let tmpY = (-tmpVS.PanY + 200) / tmpVS.Zoom;

		// Offset to avoid overlap
		let tmpNodeCount = this._FlowView.flowData.Nodes.length;
		tmpX += (tmpNodeCount % 5) * 40;
		tmpY += (tmpNodeCount % 5) * 40;

		this._FlowView.addNode(pCardType, tmpX, tmpY);
	}

	/**
	 * Handle a toolbar action
	 * @param {string} pAction
	 */
	_handleToolbarAction(pAction)
	{
		if (!this._FlowView) return;

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;

		switch (pAction)
		{
			case 'add-node':
				{
					// Get selected node type from dropdown
					let tmpSelectElements = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-NodeType-${tmpFlowViewIdentifier}`);
					let tmpNodeType = 'default';
					if (tmpSelectElements.length > 0)
					{
						tmpNodeType = tmpSelectElements[0].value;
					}

					// Place the new node at a reasonable position
					let tmpVS = this._FlowView.viewState;
					let tmpX = (-tmpVS.PanX + 200) / tmpVS.Zoom;
					let tmpY = (-tmpVS.PanY + 200) / tmpVS.Zoom;

					// Offset if there are existing nodes to avoid overlap
					let tmpNodeCount = this._FlowView.flowData.Nodes.length;
					tmpX += (tmpNodeCount % 5) * 40;
					tmpY += (tmpNodeCount % 5) * 40;

					this._FlowView.addNode(tmpNodeType, tmpX, tmpY);
				}
				break;

			case 'delete-selected':
				this._FlowView.deleteSelected();
				break;

			case 'zoom-in':
				this._FlowView.setZoom(this._FlowView.viewState.Zoom + this._FlowView.options.ZoomStep);
				break;

			case 'zoom-out':
				this._FlowView.setZoom(this._FlowView.viewState.Zoom - this._FlowView.options.ZoomStep);
				break;

			case 'zoom-fit':
				this._FlowView.zoomToFit();
				break;

			case 'auto-layout':
				this._FlowView.autoLayout();
				break;

			case 'save-layout':
				{
					let tmpName = window.prompt('Enter a name for this layout:');
					if (tmpName !== null && tmpName.trim() !== '')
					{
						this._FlowView._LayoutProvider.saveLayout(tmpName.trim());
						this._populateLayoutDropdown();
					}
				}
				break;

			case 'restore-layout':
				{
					let tmpSelectElements = this.pict.ContentAssignment.getElement(
						`#Flow-Toolbar-LayoutSelect-${tmpFlowViewIdentifier}`
					);
					if (tmpSelectElements.length > 0)
					{
						let tmpLayoutHash = tmpSelectElements[0].value;
						if (tmpLayoutHash)
						{
							this._FlowView._LayoutProvider.restoreLayout(tmpLayoutHash);
						}
					}
				}
				break;

			case 'delete-layout':
				{
					let tmpSelectElements = this.pict.ContentAssignment.getElement(
						`#Flow-Toolbar-LayoutSelect-${tmpFlowViewIdentifier}`
					);
					if (tmpSelectElements.length > 0)
					{
						let tmpLayoutHash = tmpSelectElements[0].value;
						if (tmpLayoutHash)
						{
							this._FlowView._LayoutProvider.deleteLayout(tmpLayoutHash);
							this._populateLayoutDropdown();
						}
					}
				}
				break;

			case 'fullscreen':
				{
					let tmpIsFullscreen = this._FlowView.toggleFullscreen();
					let tmpIconProvider = this._FlowView._IconProvider;
					let tmpIconElements = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-Fullscreen-Icon-${tmpFlowViewIdentifier}`);
					if (tmpIconElements.length > 0 && tmpIconProvider)
					{
						tmpIconElements[0].innerHTML = tmpIconProvider.getIconSVGMarkup(
							tmpIsFullscreen ? 'exit-fullscreen' : 'fullscreen', 14);
					}
					let tmpBtnElements = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-Fullscreen-${tmpFlowViewIdentifier}`);
					if (tmpBtnElements.length > 0)
					{
						// Update button text portion only (icon span is separate)
						let tmpTextNode = tmpBtnElements[0].lastChild;
						if (tmpTextNode && tmpTextNode.nodeType === 3)
						{
							tmpTextNode.textContent = tmpIsFullscreen ? ' Exit Fullscreen' : ' Fullscreen';
						}
					}
				}
				break;

			default:
				this.log.warn(`PictViewFlowToolbar: unknown action '${pAction}'`);
				break;
		}
	}
}

module.exports = PictViewFlowToolbar;

module.exports.default_configuration = _DefaultConfiguration;
