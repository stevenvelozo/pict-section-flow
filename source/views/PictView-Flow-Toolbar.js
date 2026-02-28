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
<div class="pict-flow-toolbar" id="Flow-Toolbar-Bar-{~D:Record.FlowViewIdentifier~}">
	<div class="pict-flow-toolbar-group">
		<button class="pict-flow-toolbar-btn" data-flow-action="add-node" id="Flow-Toolbar-AddNode-{~D:Record.FlowViewIdentifier~}" title="Add Node">
			<span class="pict-flow-toolbar-btn-icon" id="Flow-Toolbar-Icon-plus-{~D:Record.FlowViewIdentifier~}"></span>
			<span class="pict-flow-toolbar-btn-text">Node</span>
		</button>
		<button class="pict-flow-toolbar-btn danger" data-flow-action="delete-selected" title="Delete Node">
			<span class="pict-flow-toolbar-btn-icon" id="Flow-Toolbar-Icon-trash-{~D:Record.FlowViewIdentifier~}"></span>
		</button>
	</div>
	<div class="pict-flow-toolbar-group">
		<button class="pict-flow-toolbar-btn" data-flow-action="cards-popup" id="Flow-Toolbar-Cards-{~D:Record.FlowViewIdentifier~}" title="Card Palette">
			<span class="pict-flow-toolbar-btn-icon" id="Flow-Toolbar-Icon-cards-{~D:Record.FlowViewIdentifier~}"></span>
			<span class="pict-flow-toolbar-btn-text">Cards</span>
			<span class="pict-flow-toolbar-btn-chevron" id="Flow-Toolbar-CardsChevron-{~D:Record.FlowViewIdentifier~}"></span>
		</button>
	</div>
	<div class="pict-flow-toolbar-group">
		<button class="pict-flow-toolbar-btn" data-flow-action="layout-popup" id="Flow-Toolbar-Layout-{~D:Record.FlowViewIdentifier~}" title="Manage Layouts">
			<span class="pict-flow-toolbar-btn-icon" id="Flow-Toolbar-Icon-layout-{~D:Record.FlowViewIdentifier~}"></span>
			<span class="pict-flow-toolbar-btn-text">Layout</span>
			<span class="pict-flow-toolbar-btn-chevron" id="Flow-Toolbar-LayoutChevron-{~D:Record.FlowViewIdentifier~}"></span>
		</button>
		<button class="pict-flow-toolbar-btn" data-flow-action="auto-layout" title="Auto Layout">
			<span class="pict-flow-toolbar-btn-icon" id="Flow-Toolbar-Icon-auto-layout-{~D:Record.FlowViewIdentifier~}"></span>
			<span class="pict-flow-toolbar-btn-text">Auto Layout</span>
		</button>
	</div>
	<div class="pict-flow-toolbar-group">
		<button class="pict-flow-toolbar-btn" data-flow-action="zoom-in" title="Zoom In">
			<span class="pict-flow-toolbar-btn-icon" id="Flow-Toolbar-Icon-zoom-in-{~D:Record.FlowViewIdentifier~}"></span>
		</button>
		<button class="pict-flow-toolbar-btn" data-flow-action="zoom-out" title="Zoom Out">
			<span class="pict-flow-toolbar-btn-icon" id="Flow-Toolbar-Icon-zoom-out-{~D:Record.FlowViewIdentifier~}"></span>
		</button>
		<button class="pict-flow-toolbar-btn" data-flow-action="zoom-fit" title="Fit to View">
			<span class="pict-flow-toolbar-btn-icon" id="Flow-Toolbar-Icon-zoom-fit-{~D:Record.FlowViewIdentifier~}"></span>
		</button>
	</div>
	<div class="pict-flow-toolbar-group pict-flow-toolbar-right">
		<button class="pict-flow-toolbar-btn" data-flow-action="settings-popup" id="Flow-Toolbar-Settings-{~D:Record.FlowViewIdentifier~}" title="Theme Settings">
			<span class="pict-flow-toolbar-btn-icon" id="Flow-Toolbar-Icon-settings-{~D:Record.FlowViewIdentifier~}"></span>
		</button>
		<button class="pict-flow-toolbar-btn" data-flow-action="fullscreen" id="Flow-Toolbar-Fullscreen-{~D:Record.FlowViewIdentifier~}" title="Toggle Fullscreen">
			<span class="pict-flow-toolbar-btn-icon" id="Flow-Toolbar-Fullscreen-Icon-{~D:Record.FlowViewIdentifier~}"></span>
		</button>
		<button class="pict-flow-toolbar-btn" data-flow-action="toggle-floating" title="Float">
			<span class="pict-flow-toolbar-btn-icon" id="Flow-Toolbar-Icon-grip-{~D:Record.FlowViewIdentifier~}"></span>
		</button>
		<button class="pict-flow-toolbar-btn" data-flow-action="collapse-toolbar" title="Collapse Toolbar">
			<span class="pict-flow-toolbar-btn-icon" id="Flow-Toolbar-Icon-collapse-{~D:Record.FlowViewIdentifier~}"></span>
		</button>
	</div>
</div>
<div class="pict-flow-toolbar-collapsed" id="Flow-Toolbar-Collapsed-{~D:Record.FlowViewIdentifier~}">
	<button class="pict-flow-toolbar-expand-btn" data-flow-action="expand-toolbar" title="Expand Toolbar" id="Flow-Toolbar-ExpandBtn-{~D:Record.FlowViewIdentifier~}">
		<span id="Flow-Toolbar-Icon-expand-{~D:Record.FlowViewIdentifier~}"></span>
	</button>
</div>
<div class="pict-flow-toolbar-popup-anchor" id="Flow-Toolbar-PopupAnchor-{~D:Record.FlowViewIdentifier~}">
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

		// Toolbar mode state
		this._ToolbarMode = 'docked'; // 'docked' | 'floating' | 'collapsed'
		this._ActivePopup = null;     // 'add-node' | 'cards' | 'layout' | null
		this._FloatingPosition = { X: 80, Y: 80 };
		this._DocumentClickHandler = null;
		this._FloatingToolbarView = null;
	}

	render(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress)
	{
		// Pass this.options as the template record so {~D:Record.FlowViewIdentifier~}
		// resolves correctly in the toolbar template.
		return super.render(pRenderableHash, pRenderDestinationAddress, this.options);
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;

		// Bind toolbar button events via event delegation
		let tmpToolbarBar = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-Bar-${tmpFlowViewIdentifier}`);
		if (tmpToolbarBar.length > 0)
		{
			tmpToolbarBar[0].addEventListener('click', (pEvent) =>
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

		// Bind expand button click (it's outside the main toolbar bar)
		let tmpExpandBtn = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-ExpandBtn-${tmpFlowViewIdentifier}`);
		if (tmpExpandBtn.length > 0)
		{
			tmpExpandBtn[0].addEventListener('click', () =>
			{
				this._setToolbarMode('docked');
			});
		}

		// Populate SVG icons for toolbar buttons
		this._populateToolbarIcons();

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	// ── Icon Population ───────────────────────────────────────────────────

	/**
	 * Populate SVG icons for all toolbar buttons.
	 */
	_populateToolbarIcons()
	{
		let tmpIconProvider = this._FlowView ? this._FlowView._IconProvider : null;
		if (!tmpIconProvider) return;

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;

		// Map of element ID suffix → icon key
		let tmpIconMap =
		{
			'plus': 'plus',
			'trash': 'trash',
			'zoom-in': 'zoom-in',
			'zoom-out': 'zoom-out',
			'zoom-fit': 'zoom-fit',
			'auto-layout': 'auto-layout',
			'cards': 'cards',
			'layout': 'layout',
			'settings': 'settings',
			'grip': 'grip',
			'collapse': 'collapse',
			'expand': 'expand'
		};

		let tmpKeys = Object.keys(tmpIconMap);
		for (let i = 0; i < tmpKeys.length; i++)
		{
			let tmpElementId = `Flow-Toolbar-Icon-${tmpKeys[i]}-${tmpFlowViewIdentifier}`;
			let tmpElements = this.pict.ContentAssignment.getElement(`#${tmpElementId}`);
			if (tmpElements.length > 0)
			{
				tmpElements[0].innerHTML = tmpIconProvider.getIconSVGMarkup(tmpIconMap[tmpKeys[i]], 14);
			}
		}

		// Fullscreen icon
		let tmpFullscreenIcon = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-Fullscreen-Icon-${tmpFlowViewIdentifier}`);
		if (tmpFullscreenIcon.length > 0)
		{
			tmpFullscreenIcon[0].innerHTML = tmpIconProvider.getIconSVGMarkup('fullscreen', 14);
		}

		// Chevrons (smaller)
		let tmpCardsChevron = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-CardsChevron-${tmpFlowViewIdentifier}`);
		if (tmpCardsChevron.length > 0)
		{
			tmpCardsChevron[0].innerHTML = tmpIconProvider.getIconSVGMarkup('chevron-down', 8);
		}

		let tmpLayoutChevron = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-LayoutChevron-${tmpFlowViewIdentifier}`);
		if (tmpLayoutChevron.length > 0)
		{
			tmpLayoutChevron[0].innerHTML = tmpIconProvider.getIconSVGMarkup('chevron-down', 8);
		}
	}

	// ── Popup Management ──────────────────────────────────────────────────

	/**
	 * Open a popup below a trigger button.
	 * @param {string} pType - 'add-node' | 'cards' | 'layout'
	 */
	_openPopup(pType)
	{
		// Toggle off if already open
		if (this._ActivePopup === pType)
		{
			this._closePopup();
			return;
		}

		// Close any existing popup first
		this._closePopup();

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpAnchor = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-PopupAnchor-${tmpFlowViewIdentifier}`);
		if (tmpAnchor.length < 1) return;

		// Create popup div
		let tmpPopup = document.createElement('div');
		tmpPopup.className = 'pict-flow-toolbar-popup';
		tmpPopup.setAttribute('id', `Flow-Toolbar-Popup-${tmpFlowViewIdentifier}`);

		// Build popup content
		switch (pType)
		{
			case 'add-node':
				this._buildAddNodePopup(tmpPopup);
				break;
			case 'cards':
				this._buildCardsPopup(tmpPopup);
				break;
			case 'layout':
				this._buildLayoutPopup(tmpPopup);
				break;
			case 'settings':
				this._buildSettingsPopup(tmpPopup);
				break;
		}

		tmpAnchor[0].appendChild(tmpPopup);
		this._ActivePopup = pType;

		// Position the popup below the trigger button
		this._positionPopup(tmpPopup, pType);

		// Click-outside-to-close handler (delayed to avoid catching the opening click)
		setTimeout(() =>
		{
			this._DocumentClickHandler = (pEvent) =>
			{
				if (!tmpPopup.contains(pEvent.target))
				{
					// Check if click was on the trigger button itself (toggle behavior)
					let tmpButton = pEvent.target.closest('[data-flow-action]');
					if (tmpButton)
					{
						let tmpAction = tmpButton.getAttribute('data-flow-action');
						if (tmpAction === pType || tmpAction === pType.replace('-popup', '') + '-popup')
						{
							return; // Let the toggle handle it
						}
					}
					this._closePopup();
				}
			};
			document.addEventListener('click', this._DocumentClickHandler, true);
		}, 0);

		// Focus search input if Add Node popup
		if (pType === 'add-node')
		{
			let tmpSearch = tmpPopup.querySelector('.pict-flow-popup-search');
			if (tmpSearch)
			{
				setTimeout(() => { tmpSearch.focus(); }, 50);
			}
		}
	}

	/**
	 * Close the active popup and clean up.
	 */
	_closePopup()
	{
		if (this._DocumentClickHandler)
		{
			document.removeEventListener('click', this._DocumentClickHandler, true);
			this._DocumentClickHandler = null;
		}

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpPopup = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-Popup-${tmpFlowViewIdentifier}`);
		if (tmpPopup.length > 0)
		{
			tmpPopup[0].parentNode.removeChild(tmpPopup[0]);
		}

		this._ActivePopup = null;
	}

	/**
	 * Position a popup below its trigger button.
	 * @param {HTMLElement} pPopupDiv
	 * @param {string} pType
	 */
	_positionPopup(pPopupDiv, pType)
	{
		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;

		// Determine which button triggered the popup
		let tmpTriggerSelector;
		switch (pType)
		{
			case 'add-node':
				tmpTriggerSelector = `#Flow-Toolbar-AddNode-${tmpFlowViewIdentifier}`;
				break;
			case 'cards':
				tmpTriggerSelector = `#Flow-Toolbar-Cards-${tmpFlowViewIdentifier}`;
				break;
			case 'layout':
				tmpTriggerSelector = `#Flow-Toolbar-Layout-${tmpFlowViewIdentifier}`;
				break;
			case 'settings':
				tmpTriggerSelector = `#Flow-Toolbar-Settings-${tmpFlowViewIdentifier}`;
				break;
			default:
				return;
		}

		let tmpTriggerElements = this.pict.ContentAssignment.getElement(tmpTriggerSelector);
		if (tmpTriggerElements.length < 1) return;

		let tmpAnchor = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-PopupAnchor-${tmpFlowViewIdentifier}`);
		if (tmpAnchor.length < 1) return;

		let tmpTriggerRect = tmpTriggerElements[0].getBoundingClientRect();
		let tmpAnchorRect = tmpAnchor[0].getBoundingClientRect();

		let tmpLeft = tmpTriggerRect.left - tmpAnchorRect.left;
		pPopupDiv.style.left = tmpLeft + 'px';
		pPopupDiv.style.top = '0px';
	}

	// ── Add Node Popup ────────────────────────────────────────────────────

	/**
	 * Build the searchable Add Node popup content.
	 * @param {HTMLElement} pContainer
	 */
	_buildAddNodePopup(pContainer)
	{
		// Search wrapper
		let tmpSearchWrapper = document.createElement('div');
		tmpSearchWrapper.className = 'pict-flow-popup-search-wrapper';

		let tmpSearchIcon = document.createElement('span');
		tmpSearchIcon.className = 'pict-flow-popup-search-icon';
		let tmpIconProvider = this._FlowView ? this._FlowView._IconProvider : null;
		if (tmpIconProvider)
		{
			tmpSearchIcon.innerHTML = tmpIconProvider.getIconSVGMarkup('search', 12);
		}
		tmpSearchWrapper.appendChild(tmpSearchIcon);

		let tmpSearchInput = document.createElement('input');
		tmpSearchInput.className = 'pict-flow-popup-search';
		tmpSearchInput.setAttribute('type', 'text');
		tmpSearchInput.setAttribute('placeholder', 'Search node types...');
		tmpSearchWrapper.appendChild(tmpSearchInput);
		pContainer.appendChild(tmpSearchWrapper);

		// Node list
		let tmpListDiv = document.createElement('div');
		tmpListDiv.className = 'pict-flow-popup-node-list';
		pContainer.appendChild(tmpListDiv);

		// Initial population
		this._populateNodeList(tmpListDiv, '');

		// Filter on input
		tmpSearchInput.addEventListener('input', () =>
		{
			this._populateNodeList(tmpListDiv, tmpSearchInput.value);
		});
	}

	/**
	 * Populate the node list in the Add Node popup, filtered by search text.
	 * @param {HTMLElement} pListDiv
	 * @param {string} pFilter
	 */
	_populateNodeList(pListDiv, pFilter)
	{
		if (!this._FlowView || !this._FlowView._NodeTypeProvider) return;

		// Clear
		while (pListDiv.firstChild)
		{
			pListDiv.removeChild(pListDiv.firstChild);
		}

		let tmpTypes = this._FlowView._NodeTypeProvider.getNodeTypes();
		let tmpTypeKeys = Object.keys(tmpTypes);
		let tmpFilter = (pFilter || '').toLowerCase().trim();
		let tmpIconProvider = this._FlowView._IconProvider;
		let tmpMatchCount = 0;

		for (let i = 0; i < tmpTypeKeys.length; i++)
		{
			let tmpTypeConfig = tmpTypes[tmpTypeKeys[i]];
			let tmpMeta = tmpTypeConfig.CardMetadata || {};

			// Skip disabled cards
			if (tmpMeta.Enabled === false) continue;

			// Filter match: label, code, or category
			if (tmpFilter)
			{
				let tmpLabel = (tmpTypeConfig.Label || '').toLowerCase();
				let tmpCode = (tmpMeta.Code || '').toLowerCase();
				let tmpCategory = (tmpMeta.Category || '').toLowerCase();
				if (tmpLabel.indexOf(tmpFilter) < 0 &&
					tmpCode.indexOf(tmpFilter) < 0 &&
					tmpCategory.indexOf(tmpFilter) < 0)
				{
					continue;
				}
			}

			tmpMatchCount++;

			let tmpRow = document.createElement('div');
			tmpRow.className = 'pict-flow-popup-list-item';
			tmpRow.setAttribute('data-node-type', tmpTypeKeys[i]);

			// Icon
			let tmpIconSpan = document.createElement('span');
			tmpIconSpan.className = 'pict-flow-popup-list-item-icon';
			if (tmpIconProvider)
			{
				let tmpResolvedKey = tmpIconProvider.resolveIconKey(tmpMeta);
				tmpIconSpan.innerHTML = tmpIconProvider.getIconSVGMarkup(tmpResolvedKey, 16);
			}
			tmpRow.appendChild(tmpIconSpan);

			// Label
			let tmpLabelSpan = document.createElement('span');
			tmpLabelSpan.className = 'pict-flow-popup-list-item-label';
			tmpLabelSpan.textContent = tmpTypeConfig.Label;
			tmpRow.appendChild(tmpLabelSpan);

			// Code badge
			if (tmpMeta.Code)
			{
				let tmpCodeSpan = document.createElement('span');
				tmpCodeSpan.className = 'pict-flow-popup-list-item-code';
				tmpCodeSpan.textContent = tmpMeta.Code;
				tmpRow.appendChild(tmpCodeSpan);
			}

			// Click handler
			tmpRow.addEventListener('click', () =>
			{
				this._addNodeAtCenter(tmpTypeKeys[i]);
				this._closePopup();
			});

			pListDiv.appendChild(tmpRow);
		}

		if (tmpMatchCount === 0)
		{
			let tmpEmpty = document.createElement('div');
			tmpEmpty.className = 'pict-flow-popup-list-empty';
			tmpEmpty.textContent = 'No matching node types';
			pListDiv.appendChild(tmpEmpty);
		}
	}

	// ── Cards Popup ───────────────────────────────────────────────────────

	/**
	 * Build the Cards popup content (reuses palette rendering).
	 * @param {HTMLElement} pContainer
	 */
	_buildCardsPopup(pContainer)
	{
		this._renderPalette(pContainer);
	}

	/**
	 * Render the card palette with categories and card chips into a container.
	 * @param {HTMLElement} pContainer - The target container element
	 */
	_renderPalette(pContainer)
	{
		if (!this._FlowView || !this._FlowView._NodeTypeProvider) return;

		let tmpCategories = this._FlowView._NodeTypeProvider.getCardsByCategory();
		let tmpCategoryKeys = Object.keys(tmpCategories);

		if (tmpCategoryKeys.length === 0)
		{
			let tmpEmpty = document.createElement('div');
			tmpEmpty.className = 'pict-flow-popup-list-empty';
			tmpEmpty.textContent = 'No card types available';
			pContainer.appendChild(tmpEmpty);
			return;
		}

		for (let i = 0; i < tmpCategoryKeys.length; i++)
		{
			let tmpCategoryName = tmpCategoryKeys[i];
			let tmpCards = tmpCategories[tmpCategoryName];

			let tmpCategoryDiv = document.createElement('div');
			tmpCategoryDiv.className = 'pict-flow-palette-category';
			tmpCategoryDiv.style.padding = '0.35em 0.5em';

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

				// Click handler
				tmpCardEl.addEventListener('click', () =>
				{
					this._addCardFromPalette(tmpCardConfig.Hash);
					this._closePopup();
				});

				tmpCardsDiv.appendChild(tmpCardEl);
			}

			tmpCategoryDiv.appendChild(tmpCardsDiv);
			pContainer.appendChild(tmpCategoryDiv);
		}
	}

	// ── Layout Popup ──────────────────────────────────────────────────────

	/**
	 * Build the Layout popup content.
	 * @param {HTMLElement} pContainer
	 */
	_buildLayoutPopup(pContainer)
	{
		let tmpIconProvider = this._FlowView ? this._FlowView._IconProvider : null;

		// Save Layout section at top
		let tmpSaveSection = document.createElement('div');
		tmpSaveSection.className = 'pict-flow-popup-layout-save-section';

		// Save input row (hidden initially)
		let tmpSaveInputRow = document.createElement('div');
		tmpSaveInputRow.className = 'pict-flow-popup-layout-save-input-row';
		tmpSaveInputRow.style.display = 'none';

		let tmpSaveInput = document.createElement('input');
		tmpSaveInput.className = 'pict-flow-popup-layout-save-input';
		tmpSaveInput.setAttribute('type', 'text');
		tmpSaveInput.setAttribute('placeholder', 'Layout name...');
		tmpSaveInputRow.appendChild(tmpSaveInput);

		let tmpSaveConfirmBtn = document.createElement('button');
		tmpSaveConfirmBtn.className = 'pict-flow-popup-layout-save-confirm';
		tmpSaveConfirmBtn.title = 'Save';
		if (tmpIconProvider)
		{
			tmpSaveConfirmBtn.innerHTML = tmpIconProvider.getIconSVGMarkup('save', 14);
		}
		else
		{
			tmpSaveConfirmBtn.textContent = '✓';
		}
		tmpSaveInputRow.appendChild(tmpSaveConfirmBtn);

		// "Save Current Layout" clickable row
		let tmpSaveRow = document.createElement('div');
		tmpSaveRow.className = 'pict-flow-popup-layout-save';

		let tmpSaveIcon = document.createElement('span');
		tmpSaveIcon.className = 'pict-flow-popup-layout-save-icon';
		if (tmpIconProvider)
		{
			tmpSaveIcon.innerHTML = tmpIconProvider.getIconSVGMarkup('save', 14);
		}
		tmpSaveRow.appendChild(tmpSaveIcon);

		let tmpSaveText = document.createElement('span');
		tmpSaveText.textContent = 'Save Current Layout';
		tmpSaveRow.appendChild(tmpSaveText);

		// Click "Save Current Layout" to reveal the input row
		tmpSaveRow.addEventListener('click', () =>
		{
			tmpSaveRow.style.display = 'none';
			tmpSaveInputRow.style.display = '';
			tmpSaveInput.value = '';
			setTimeout(() => { tmpSaveInput.focus(); }, 50);
		});

		// Confirm save via button click
		let tmpDoSave = () =>
		{
			let tmpName = tmpSaveInput.value.trim();
			if (tmpName === '') return;
			this._FlowView._LayoutProvider.saveLayout(tmpName);
			// Refresh the popup content
			while (pContainer.firstChild)
			{
				pContainer.removeChild(pContainer.firstChild);
			}
			this._buildLayoutPopup(pContainer);
		};

		tmpSaveConfirmBtn.addEventListener('click', tmpDoSave);

		// Confirm save via Enter key
		tmpSaveInput.addEventListener('keydown', (pEvent) =>
		{
			if (pEvent.key === 'Enter')
			{
				pEvent.preventDefault();
				tmpDoSave();
			}
			else if (pEvent.key === 'Escape')
			{
				// Cancel — hide input, show the save row again
				tmpSaveInputRow.style.display = 'none';
				tmpSaveRow.style.display = '';
			}
		});

		// Prevent clicks inside the input from closing the popup
		tmpSaveInput.addEventListener('click', (pEvent) =>
		{
			pEvent.stopPropagation();
		});

		tmpSaveSection.appendChild(tmpSaveRow);
		tmpSaveSection.appendChild(tmpSaveInputRow);
		pContainer.appendChild(tmpSaveSection);

		// Divider
		let tmpDivider = document.createElement('div');
		tmpDivider.className = 'pict-flow-popup-divider';
		pContainer.appendChild(tmpDivider);

		// Layout rows
		if (!this._FlowView || !this._FlowView._LayoutProvider)
		{
			let tmpEmpty = document.createElement('div');
			tmpEmpty.className = 'pict-flow-popup-list-empty';
			tmpEmpty.textContent = 'No saved layouts';
			pContainer.appendChild(tmpEmpty);
			return;
		}

		let tmpLayouts = this._FlowView._LayoutProvider.getLayouts();

		if (tmpLayouts.length === 0)
		{
			let tmpEmpty = document.createElement('div');
			tmpEmpty.className = 'pict-flow-popup-list-empty';
			tmpEmpty.textContent = 'No saved layouts';
			pContainer.appendChild(tmpEmpty);
			return;
		}

		for (let i = 0; i < tmpLayouts.length; i++)
		{
			let tmpLayout = tmpLayouts[i];

			let tmpRow = document.createElement('div');
			tmpRow.className = 'pict-flow-popup-layout-row';

			let tmpNameSpan = document.createElement('span');
			tmpNameSpan.className = 'pict-flow-popup-layout-name';
			tmpNameSpan.textContent = tmpLayout.Name;
			tmpRow.appendChild(tmpNameSpan);

			// Delete button (visible on hover via CSS)
			let tmpDeleteBtn = document.createElement('button');
			tmpDeleteBtn.className = 'pict-flow-popup-layout-delete';
			tmpDeleteBtn.title = 'Delete layout';
			if (tmpIconProvider)
			{
				tmpDeleteBtn.innerHTML = tmpIconProvider.getIconSVGMarkup('trash', 12);
			}
			else
			{
				tmpDeleteBtn.textContent = '×';
			}
			tmpRow.appendChild(tmpDeleteBtn);

			// Click row → restore layout
			tmpRow.addEventListener('click', (pEvent) =>
			{
				// Don't restore if they clicked the delete button
				if (pEvent.target.closest('.pict-flow-popup-layout-delete'))
				{
					return;
				}
				this._FlowView._LayoutProvider.restoreLayout(tmpLayout.Hash);
				this._closePopup();
			});

			// Click delete → delete layout and refresh popup
			tmpDeleteBtn.addEventListener('click', (pEvent) =>
			{
				pEvent.stopPropagation();
				this._FlowView._LayoutProvider.deleteLayout(tmpLayout.Hash);
				// Refresh the popup content
				while (pContainer.firstChild)
				{
					pContainer.removeChild(pContainer.firstChild);
				}
				this._buildLayoutPopup(pContainer);
			});

			pContainer.appendChild(tmpRow);
		}
	}

	// ── Settings Popup ───────────────────────────────────────────────────

	/**
	 * Build the Settings popup content (theme dropdown + noise slider).
	 * @param {HTMLElement} pContainer
	 */
	_buildSettingsPopup(pContainer)
	{
		if (!this._FlowView || !this._FlowView._ThemeProvider) return;

		let tmpThemeProvider = this._FlowView._ThemeProvider;

		// Theme selector section
		let tmpThemeSection = document.createElement('div');
		tmpThemeSection.className = 'pict-flow-popup-settings-section';

		let tmpThemeLabel = document.createElement('label');
		tmpThemeLabel.className = 'pict-flow-popup-settings-label';
		tmpThemeLabel.textContent = 'Theme';
		tmpThemeSection.appendChild(tmpThemeLabel);

		let tmpThemeSelect = document.createElement('select');
		tmpThemeSelect.className = 'pict-flow-popup-settings-select';

		let tmpThemeKeys = tmpThemeProvider.getThemeKeys();
		let tmpActiveKey = tmpThemeProvider.getActiveThemeKey();

		for (let i = 0; i < tmpThemeKeys.length; i++)
		{
			let tmpOption = document.createElement('option');
			tmpOption.value = tmpThemeKeys[i];

			let tmpTheme = tmpThemeProvider._Themes[tmpThemeKeys[i]];
			tmpOption.textContent = tmpTheme.Label || tmpThemeKeys[i];

			if (tmpThemeKeys[i] === tmpActiveKey)
			{
				tmpOption.selected = true;
			}
			tmpThemeSelect.appendChild(tmpOption);
		}

		tmpThemeSelect.addEventListener('change', () =>
		{
			this._FlowView.setTheme(tmpThemeSelect.value);
			// Refresh the noise slider visibility
			this._refreshNoiseSlider(pContainer);
		});

		// Prevent popup close on select interaction
		tmpThemeSelect.addEventListener('click', (pEvent) => { pEvent.stopPropagation(); });

		tmpThemeSection.appendChild(tmpThemeSelect);
		pContainer.appendChild(tmpThemeSection);

		// Divider
		let tmpDivider = document.createElement('div');
		tmpDivider.className = 'pict-flow-popup-divider';
		pContainer.appendChild(tmpDivider);

		// Noise level section
		let tmpNoiseSection = document.createElement('div');
		tmpNoiseSection.className = 'pict-flow-popup-settings-section pict-flow-popup-settings-noise';
		tmpNoiseSection.setAttribute('data-settings-type', 'noise');

		let tmpNoiseLabel = document.createElement('label');
		tmpNoiseLabel.className = 'pict-flow-popup-settings-label';
		tmpNoiseLabel.textContent = 'Noise';
		tmpNoiseSection.appendChild(tmpNoiseLabel);

		let tmpNoiseRow = document.createElement('div');
		tmpNoiseRow.className = 'pict-flow-popup-settings-slider-row';

		let tmpNoiseSlider = document.createElement('input');
		tmpNoiseSlider.type = 'range';
		tmpNoiseSlider.className = 'pict-flow-popup-settings-slider';
		tmpNoiseSlider.min = '0';
		tmpNoiseSlider.max = '100';
		tmpNoiseSlider.value = String(Math.round(tmpThemeProvider.getNoiseLevel() * 100));

		let tmpNoiseValue = document.createElement('span');
		tmpNoiseValue.className = 'pict-flow-popup-settings-slider-value';
		tmpNoiseValue.textContent = tmpNoiseSlider.value + '%';

		tmpNoiseSlider.addEventListener('input', () =>
		{
			let tmpLevel = parseInt(tmpNoiseSlider.value, 10) / 100;
			tmpNoiseValue.textContent = tmpNoiseSlider.value + '%';
			this._FlowView.setNoiseLevel(tmpLevel);
		});

		// Prevent popup close on slider interaction
		tmpNoiseSlider.addEventListener('click', (pEvent) => { pEvent.stopPropagation(); });
		tmpNoiseSlider.addEventListener('pointerdown', (pEvent) => { pEvent.stopPropagation(); });

		tmpNoiseRow.appendChild(tmpNoiseSlider);
		tmpNoiseRow.appendChild(tmpNoiseValue);
		tmpNoiseSection.appendChild(tmpNoiseRow);
		pContainer.appendChild(tmpNoiseSection);

		// Show/hide noise slider based on active theme
		this._refreshNoiseSlider(pContainer);
	}

	/**
	 * Show or hide the noise slider based on whether the active theme supports noise.
	 * @param {HTMLElement} pContainer - The settings popup container
	 */
	_refreshNoiseSlider(pContainer)
	{
		let tmpNoiseSection = pContainer.querySelector('[data-settings-type="noise"]');
		if (!tmpNoiseSection) return;

		let tmpTheme = this._FlowView._ThemeProvider.getActiveTheme();
		if (tmpTheme && tmpTheme.NoiseConfig && tmpTheme.NoiseConfig.Enabled)
		{
			tmpNoiseSection.style.display = '';
			// Update slider value to reflect theme default
			let tmpSlider = tmpNoiseSection.querySelector('.pict-flow-popup-settings-slider');
			let tmpValueLabel = tmpNoiseSection.querySelector('.pict-flow-popup-settings-slider-value');
			if (tmpSlider)
			{
				let tmpLevel = Math.round(this._FlowView._ThemeProvider.getNoiseLevel() * 100);
				tmpSlider.value = String(tmpLevel);
				if (tmpValueLabel) tmpValueLabel.textContent = tmpLevel + '%';
			}
		}
		else
		{
			tmpNoiseSection.style.display = 'none';
		}
	}

	// ── Toolbar Mode Switching ────────────────────────────────────────────

	/**
	 * Switch between docked, floating, and collapsed modes.
	 * @param {string} pMode - 'docked' | 'floating' | 'collapsed'
	 */
	_setToolbarMode(pMode)
	{
		// Close any active popup first
		this._closePopup();

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpBar = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-Bar-${tmpFlowViewIdentifier}`);
		let tmpCollapsed = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-Collapsed-${tmpFlowViewIdentifier}`);

		switch (pMode)
		{
			case 'docked':
				// Show toolbar bar
				if (tmpBar.length > 0) tmpBar[0].style.display = '';
				// Hide collapsed button
				if (tmpCollapsed.length > 0) tmpCollapsed[0].classList.remove('visible');
				// Hide floating toolbar
				if (this._FloatingToolbarView) this._FloatingToolbarView.hide();
				break;

			case 'floating':
				// Hide toolbar bar
				if (tmpBar.length > 0) tmpBar[0].style.display = 'none';
				// Hide collapsed button
				if (tmpCollapsed.length > 0) tmpCollapsed[0].classList.remove('visible');
				// Show floating toolbar
				this._showFloatingToolbar();
				break;

			case 'collapsed':
				// Hide toolbar bar
				if (tmpBar.length > 0) tmpBar[0].style.display = 'none';
				// Show collapsed button
				if (tmpCollapsed.length > 0) tmpCollapsed[0].classList.add('visible');
				// Hide floating toolbar
				if (this._FloatingToolbarView) this._FloatingToolbarView.hide();
				break;
		}

		this._ToolbarMode = pMode;
	}

	/**
	 * Lazily create and show the floating toolbar.
	 */
	_showFloatingToolbar()
	{
		if (!this._FlowView) return;

		if (!this._FloatingToolbarView)
		{
			let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
			this._FloatingToolbarView = this.fable.instantiateServiceProviderWithoutRegistration(
				'PictViewFlowFloatingToolbar',
				{
					FlowViewIdentifier: tmpFlowViewIdentifier,
					DefaultDestinationAddress: `#Flow-FloatingToolbar-Container-${tmpFlowViewIdentifier}`
				}
			);
			this._FloatingToolbarView._ToolbarView = this;
			this._FloatingToolbarView._FlowView = this._FlowView;
			this._FloatingToolbarView.render();
		}

		this._FloatingToolbarView.show();
	}

	// ── Node Placement Helpers ────────────────────────────────────────────

	/**
	 * Add a node at the center of the visible viewport.
	 * @param {string} pNodeType - The node type hash
	 */
	_addNodeAtCenter(pNodeType)
	{
		if (!this._FlowView) return;

		let tmpVS = this._FlowView.viewState;

		// Calculate the center of the visible SVG area
		let tmpSVGContainer = this._FlowView._SVGElement;
		let tmpWidth = tmpSVGContainer ? tmpSVGContainer.clientWidth : 600;
		let tmpHeight = tmpSVGContainer ? tmpSVGContainer.clientHeight : 400;

		let tmpCenterX = (-tmpVS.PanX + tmpWidth / 2) / tmpVS.Zoom;
		let tmpCenterY = (-tmpVS.PanY + tmpHeight / 2) / tmpVS.Zoom;

		// Slight offset to avoid stacking
		let tmpNodeCount = this._FlowView.flowData.Nodes.length;
		tmpCenterX += (tmpNodeCount % 5) * 30;
		tmpCenterY += (tmpNodeCount % 5) * 30;

		this._FlowView.addNode(pNodeType, tmpCenterX, tmpCenterY);
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

	// ── Action Handler ────────────────────────────────────────────────────

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
				this._openPopup('add-node');
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

			case 'cards-popup':
				this._openPopup('cards');
				break;

			case 'layout-popup':
				this._openPopup('layout');
				break;

			case 'settings-popup':
				this._openPopup('settings');
				break;

			case 'toggle-floating':
				if (this._ToolbarMode === 'floating')
				{
					this._setToolbarMode('docked');
				}
				else
				{
					this._setToolbarMode('floating');
				}
				break;

			case 'collapse-toolbar':
				this._setToolbarMode('collapsed');
				break;

			case 'expand-toolbar':
				this._setToolbarMode('docked');
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
					let tmpFullscreenBtn = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-Fullscreen-${tmpFlowViewIdentifier}`);
					if (tmpFullscreenBtn.length > 0)
					{
						tmpFullscreenBtn[0].setAttribute('title', tmpIsFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen');
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
