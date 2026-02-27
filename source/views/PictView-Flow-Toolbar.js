const libPictView = require('pict-view');

const _DefaultConfiguration =
{
	ViewIdentifier: 'Flow-Toolbar',

	DefaultRenderable: 'Flow-Toolbar-Content',
	DefaultDestinationAddress: '#Flow-Toolbar-Container',

	AutoRender: false,

	FlowViewIdentifier: 'Pict-Flow',

	EnablePalette: true,

	CSS: /*css*/`
		.pict-flow-toolbar {
			display: flex;
			align-items: center;
			gap: 0.5em;
			padding: 0.5em 0.75em;
			background-color: #ffffff;
			border-bottom: 1px solid #e0e0e0;
			flex-wrap: wrap;
		}
		.pict-flow-toolbar-group {
			display: flex;
			align-items: center;
			gap: 0.25em;
			padding-right: 0.75em;
			border-right: 1px solid #e0e0e0;
		}
		.pict-flow-toolbar-group:last-child {
			border-right: none;
			padding-right: 0;
		}
		.pict-flow-toolbar-btn {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			padding: 0.35em 0.65em;
			border: 1px solid #bdc3c7;
			border-radius: 4px;
			background-color: #fff;
			color: #2c3e50;
			font-size: 0.85em;
			cursor: pointer;
			transition: background-color 0.15s, border-color 0.15s;
			user-select: none;
			-webkit-user-select: none;
		}
		.pict-flow-toolbar-btn:hover {
			background-color: #ecf0f1;
			border-color: #95a5a6;
		}
		.pict-flow-toolbar-btn:active {
			background-color: #d5dbdb;
		}
		.pict-flow-toolbar-btn.danger {
			color: #e74c3c;
			border-color: #e74c3c;
		}
		.pict-flow-toolbar-btn.danger:hover {
			background-color: #fdedec;
		}
		.pict-flow-toolbar-label {
			font-size: 0.8em;
			color: #7f8c8d;
			margin-right: 0.25em;
		}
		.pict-flow-toolbar-select {
			padding: 0.3em 0.5em;
			border: 1px solid #bdc3c7;
			border-radius: 4px;
			font-size: 0.85em;
			background-color: #fff;
			color: #2c3e50;
		}
		.pict-flow-palette-container {
			border-bottom: 1px solid #e0e0e0;
			background-color: #fafafa;
		}
		.pict-flow-palette-toggle {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0.4em 0.75em;
			cursor: pointer;
			user-select: none;
			-webkit-user-select: none;
			font-size: 0.8em;
			color: #7f8c8d;
			background-color: #f4f4f5;
			border-bottom: 1px solid #e0e0e0;
		}
		.pict-flow-palette-toggle:hover {
			background-color: #ecf0f1;
			color: #2c3e50;
		}
		.pict-flow-palette-toggle-arrow {
			font-size: 0.7em;
			transition: transform 0.2s;
		}
		.pict-flow-palette-toggle-arrow.open {
			transform: rotate(180deg);
		}
		.pict-flow-palette-body {
			display: none;
			padding: 0.5em 0.75em 0.75em 0.75em;
			max-height: 280px;
			overflow-y: auto;
		}
		.pict-flow-palette-body.open {
			display: block;
		}
		.pict-flow-palette-category {
			margin-bottom: 0.5em;
		}
		.pict-flow-palette-category:last-child {
			margin-bottom: 0;
		}
		.pict-flow-palette-category-label {
			font-size: 0.7em;
			font-weight: 700;
			text-transform: uppercase;
			letter-spacing: 0.05em;
			color: #95a5a6;
			margin-bottom: 0.35em;
			padding-bottom: 0.2em;
			border-bottom: 1px solid #ecf0f1;
		}
		.pict-flow-palette-cards {
			display: flex;
			flex-wrap: wrap;
			gap: 0.35em;
		}
		.pict-flow-palette-card {
			display: inline-flex;
			align-items: center;
			gap: 0.35em;
			padding: 0.35em 0.6em;
			border: 1px solid #d5d8dc;
			border-radius: 4px;
			background-color: #ffffff;
			font-size: 0.8em;
			cursor: pointer;
			transition: background-color 0.15s, border-color 0.15s, box-shadow 0.15s;
			user-select: none;
			-webkit-user-select: none;
			position: relative;
		}
		.pict-flow-palette-card:hover {
			background-color: #eaf2f8;
			border-color: #3498db;
			box-shadow: 0 1px 3px rgba(52, 152, 219, 0.15);
		}
		.pict-flow-palette-card.disabled {
			opacity: 0.45;
			pointer-events: none;
			cursor: default;
		}
		.pict-flow-palette-card-icon {
			font-size: 1.1em;
			line-height: 1;
		}
		.pict-flow-palette-card-swatch {
			width: 10px;
			height: 10px;
			border-radius: 2px;
			flex-shrink: 0;
		}
		.pict-flow-palette-card-title {
			font-weight: 500;
			color: #2c3e50;
			white-space: nowrap;
		}
		.pict-flow-palette-card-code {
			font-size: 0.8em;
			color: #95a5a6;
			font-family: monospace;
		}
	`,

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
		<button class="pict-flow-toolbar-btn" data-flow-action="fullscreen" id="Flow-Toolbar-Fullscreen-{~D:Record.FlowViewIdentifier~}" title="Toggle Fullscreen">&#x26F6; Fullscreen</button>
	</div>
</div>
<div class="pict-flow-palette-container" id="Flow-Palette-{~D:Record.FlowViewIdentifier~}">
	<div class="pict-flow-palette-toggle" data-flow-action="toggle-palette">
		<span>Card Palette</span>
		<span class="pict-flow-palette-toggle-arrow" id="Flow-Palette-Arrow-{~D:Record.FlowViewIdentifier~}">&#9660;</span>
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

		// Populate the node type dropdown and palette
		this._populateNodeTypeDropdown();
		this._renderPalette();

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

			if (tmpTypeConfig.CardMetadata && tmpTypeConfig.CardMetadata.Icon)
			{
				tmpOption.textContent = tmpTypeConfig.CardMetadata.Icon + ' ' + tmpTypeConfig.Label;
			}
			else
			{
				tmpOption.textContent = tmpTypeConfig.Label;
			}

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
					tmpIconSpan.textContent = tmpMeta.Icon;
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

			case 'fullscreen':
				{
					let tmpIsFullscreen = this._FlowView.toggleFullscreen();
					let tmpBtnElements = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-Fullscreen-${tmpFlowViewIdentifier}`);
					if (tmpBtnElements.length > 0)
					{
						tmpBtnElements[0].innerHTML = tmpIsFullscreen ? '&#x2716; Exit Fullscreen' : '&#x26F6; Fullscreen';
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
