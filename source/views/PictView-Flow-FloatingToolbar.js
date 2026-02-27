const libPictView = require('pict-view');

const _DefaultConfiguration =
{
	ViewIdentifier: 'Flow-FloatingToolbar',

	DefaultRenderable: 'Flow-FloatingToolbar-Content',
	DefaultDestinationAddress: '#Flow-FloatingToolbar-Container',

	AutoRender: false,

	FlowViewIdentifier: 'Pict-Flow',

	CSS: false,

	Templates:
	[
		{
			Hash: 'Flow-FloatingToolbar-Template',
			Template: /*html*/`
<div class="pict-flow-floating-toolbar" id="Flow-FloatingToolbar-{~D:Record.FlowViewIdentifier~}">
	<div class="pict-flow-floating-grip" id="Flow-FloatingGrip-{~D:Record.FlowViewIdentifier~}" title="Drag to move · Double-click to collapse">
		<span id="Flow-FloatingIcon-grip-{~D:Record.FlowViewIdentifier~}"></span>
	</div>
	<button class="pict-flow-floating-btn" data-flow-action="add-node" title="Add Node">
		<span id="Flow-FloatingIcon-plus-{~D:Record.FlowViewIdentifier~}"></span>
	</button>
	<button class="pict-flow-floating-btn danger" data-flow-action="delete-selected" title="Delete Selected">
		<span id="Flow-FloatingIcon-trash-{~D:Record.FlowViewIdentifier~}"></span>
	</button>
	<div class="pict-flow-floating-separator"></div>
	<button class="pict-flow-floating-btn" data-flow-action="zoom-in" title="Zoom In">
		<span id="Flow-FloatingIcon-zoom-in-{~D:Record.FlowViewIdentifier~}"></span>
	</button>
	<button class="pict-flow-floating-btn" data-flow-action="zoom-out" title="Zoom Out">
		<span id="Flow-FloatingIcon-zoom-out-{~D:Record.FlowViewIdentifier~}"></span>
	</button>
	<button class="pict-flow-floating-btn" data-flow-action="zoom-fit" title="Fit to View">
		<span id="Flow-FloatingIcon-zoom-fit-{~D:Record.FlowViewIdentifier~}"></span>
	</button>
	<div class="pict-flow-floating-separator"></div>
	<button class="pict-flow-floating-btn" data-flow-action="auto-layout" title="Auto Layout">
		<span id="Flow-FloatingIcon-auto-layout-{~D:Record.FlowViewIdentifier~}"></span>
	</button>
	<button class="pict-flow-floating-btn" data-flow-action="cards-popup" title="Cards">
		<span id="Flow-FloatingIcon-cards-{~D:Record.FlowViewIdentifier~}"></span>
	</button>
	<button class="pict-flow-floating-btn" data-flow-action="layout-popup" title="Layout">
		<span id="Flow-FloatingIcon-layout-{~D:Record.FlowViewIdentifier~}"></span>
	</button>
	<button class="pict-flow-floating-btn" data-flow-action="fullscreen" title="Toggle Fullscreen">
		<span id="Flow-FloatingIcon-fullscreen-{~D:Record.FlowViewIdentifier~}"></span>
	</button>
	<div class="pict-flow-floating-separator"></div>
	<button class="pict-flow-floating-btn" data-flow-action="dock-toolbar" title="Dock Toolbar">
		<span id="Flow-FloatingIcon-dock-{~D:Record.FlowViewIdentifier~}"></span>
	</button>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: 'Flow-FloatingToolbar-Content',
			TemplateHash: 'Flow-FloatingToolbar-Template',
			DestinationAddress: '#Flow-FloatingToolbar-Container',
			RenderMethod: 'replace'
		}
	]
};

class PictViewFlowFloatingToolbar extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultConfiguration)), pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'PictViewFlowFloatingToolbar';

		this._ToolbarView = null;
		this._FlowView = null;

		this._IsCollapsed = false;

		this._IsDragging = false;
		this._DragStartX = 0;
		this._DragStartY = 0;
		this._DragStartLeft = 0;
		this._DragStartTop = 0;

		this._BoundMouseMove = null;
		this._BoundMouseUp = null;
	}

	render(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress)
	{
		return super.render(pRenderableHash, pRenderDestinationAddress, this.options);
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;

		// Bind click delegation for action buttons
		let tmpFloatingToolbar = this.pict.ContentAssignment.getElement(`#Flow-FloatingToolbar-${tmpFlowViewIdentifier}`);
		if (tmpFloatingToolbar.length > 0)
		{
			tmpFloatingToolbar[0].addEventListener('click', (pEvent) =>
			{
				let tmpTarget = pEvent.target;
				if (!tmpTarget) return;

				let tmpButton = tmpTarget.closest('[data-flow-action]');
				if (!tmpButton) return;

				let tmpAction = tmpButton.getAttribute('data-flow-action');
				if (tmpAction === 'dock-toolbar')
				{
					if (this._ToolbarView)
					{
						this._ToolbarView._setToolbarMode('docked');
					}
					return;
				}

				// Delegate all other actions to the docked toolbar
				if (this._ToolbarView)
				{
					this._ToolbarView._handleToolbarAction(tmpAction);
				}
			});
		}

		// Bind drag behavior on the grip
		let tmpGrip = this.pict.ContentAssignment.getElement(`#Flow-FloatingGrip-${tmpFlowViewIdentifier}`);
		if (tmpGrip.length > 0)
		{
			tmpGrip[0].addEventListener('mousedown', (pEvent) =>
			{
				this._startDrag(pEvent);
			});

			// Double-click grip to toggle collapsed state
			tmpGrip[0].addEventListener('dblclick', (pEvent) =>
			{
				pEvent.preventDefault();
				pEvent.stopPropagation();
				this._toggleCollapse();
			});
		}

		// Populate icons
		this._populateIcons();

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	/**
	 * Populate SVG icons into all floating toolbar button spans.
	 */
	_populateIcons()
	{
		let tmpIconProvider = this._FlowView ? this._FlowView._IconProvider : null;
		if (!tmpIconProvider) return;

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;

		let tmpIconMap =
		{
			'grip': 'grip',
			'plus': 'plus',
			'trash': 'trash',
			'zoom-in': 'zoom-in',
			'zoom-out': 'zoom-out',
			'zoom-fit': 'zoom-fit',
			'auto-layout': 'auto-layout',
			'cards': 'cards',
			'layout': 'layout',
			'fullscreen': 'fullscreen',
			'dock': 'dock'
		};

		let tmpKeys = Object.keys(tmpIconMap);
		for (let i = 0; i < tmpKeys.length; i++)
		{
			let tmpElementId = `Flow-FloatingIcon-${tmpKeys[i]}-${tmpFlowViewIdentifier}`;
			let tmpElements = this.pict.ContentAssignment.getElement(`#${tmpElementId}`);
			if (tmpElements.length > 0)
			{
				tmpElements[0].innerHTML = tmpIconProvider.getIconSVGMarkup(tmpIconMap[tmpKeys[i]], 16);
			}
		}
	}

	/**
	 * Toggle the floating toolbar between expanded and collapsed (grip-only square) states.
	 */
	_toggleCollapse()
	{
		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpToolbar = this.pict.ContentAssignment.getElement(`#Flow-FloatingToolbar-${tmpFlowViewIdentifier}`);
		if (tmpToolbar.length < 1) return;

		this._IsCollapsed = !this._IsCollapsed;

		if (this._IsCollapsed)
		{
			tmpToolbar[0].classList.add('collapsed');
		}
		else
		{
			tmpToolbar[0].classList.remove('collapsed');
		}
	}

	/**
	 * Start dragging the floating toolbar.
	 * @param {MouseEvent} pEvent
	 */
	_startDrag(pEvent)
	{
		pEvent.preventDefault();

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpToolbar = this.pict.ContentAssignment.getElement(`#Flow-FloatingToolbar-${tmpFlowViewIdentifier}`);
		if (tmpToolbar.length < 1) return;

		let tmpEl = tmpToolbar[0];
		this._IsDragging = true;
		this._DragStartX = pEvent.clientX;
		this._DragStartY = pEvent.clientY;
		this._DragStartLeft = tmpEl.offsetLeft;
		this._DragStartTop = tmpEl.offsetTop;

		this._BoundMouseMove = (pMoveEvent) => { this._onDragMove(pMoveEvent); };
		this._BoundMouseUp = () => { this._onDragEnd(); };

		document.addEventListener('mousemove', this._BoundMouseMove);
		document.addEventListener('mouseup', this._BoundMouseUp);
	}

	/**
	 * Handle drag movement.
	 * @param {MouseEvent} pEvent
	 */
	_onDragMove(pEvent)
	{
		if (!this._IsDragging) return;

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpToolbar = this.pict.ContentAssignment.getElement(`#Flow-FloatingToolbar-${tmpFlowViewIdentifier}`);
		if (tmpToolbar.length < 1) return;

		let tmpEl = tmpToolbar[0];
		let tmpDeltaX = pEvent.clientX - this._DragStartX;
		let tmpDeltaY = pEvent.clientY - this._DragStartY;

		let tmpNewLeft = this._DragStartLeft + tmpDeltaX;
		let tmpNewTop = this._DragStartTop + tmpDeltaY;

		// Clamp to parent bounds
		let tmpParent = tmpEl.parentElement;
		if (tmpParent)
		{
			let tmpMaxLeft = tmpParent.clientWidth - tmpEl.offsetWidth;
			let tmpMaxTop = tmpParent.clientHeight - tmpEl.offsetHeight;
			tmpNewLeft = Math.max(0, Math.min(tmpNewLeft, tmpMaxLeft));
			tmpNewTop = Math.max(0, Math.min(tmpNewTop, tmpMaxTop));
		}

		tmpEl.style.left = tmpNewLeft + 'px';
		tmpEl.style.top = tmpNewTop + 'px';
	}

	/**
	 * End dragging.
	 */
	_onDragEnd()
	{
		this._IsDragging = false;

		if (this._BoundMouseMove)
		{
			document.removeEventListener('mousemove', this._BoundMouseMove);
			this._BoundMouseMove = null;
		}
		if (this._BoundMouseUp)
		{
			document.removeEventListener('mouseup', this._BoundMouseUp);
			this._BoundMouseUp = null;
		}

		// Save position
		if (this._ToolbarView)
		{
			let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
			let tmpToolbar = this.pict.ContentAssignment.getElement(`#Flow-FloatingToolbar-${tmpFlowViewIdentifier}`);
			if (tmpToolbar.length > 0)
			{
				this._ToolbarView._FloatingPosition.X = tmpToolbar[0].offsetLeft;
				this._ToolbarView._FloatingPosition.Y = tmpToolbar[0].offsetTop;
			}
		}
	}

	/**
	 * Show the floating toolbar at the saved position.
	 */
	show()
	{
		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpContainer = this.pict.ContentAssignment.getElement(`#Flow-FloatingToolbar-Container-${tmpFlowViewIdentifier}`);
		if (tmpContainer.length > 0)
		{
			tmpContainer[0].style.display = 'block';
		}

		let tmpToolbar = this.pict.ContentAssignment.getElement(`#Flow-FloatingToolbar-${tmpFlowViewIdentifier}`);
		if (tmpToolbar.length > 0 && this._ToolbarView)
		{
			tmpToolbar[0].style.left = this._ToolbarView._FloatingPosition.X + 'px';
			tmpToolbar[0].style.top = this._ToolbarView._FloatingPosition.Y + 'px';
		}

		// Restore expanded state when showing
		if (this._IsCollapsed && tmpToolbar.length > 0)
		{
			this._IsCollapsed = false;
			tmpToolbar[0].classList.remove('collapsed');
		}
	}

	/**
	 * Hide the floating toolbar.
	 */
	hide()
	{
		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpContainer = this.pict.ContentAssignment.getElement(`#Flow-FloatingToolbar-Container-${tmpFlowViewIdentifier}`);
		if (tmpContainer.length > 0)
		{
			tmpContainer[0].style.display = 'none';
		}
	}
}

module.exports = PictViewFlowFloatingToolbar;

module.exports.default_configuration = _DefaultConfiguration;
