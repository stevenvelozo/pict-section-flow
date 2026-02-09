const libPictView = require('pict-view');

const _DefaultConfiguration =
{
	ViewIdentifier: 'Flow-Toolbar',

	DefaultRenderable: 'Flow-Toolbar-Content',
	DefaultDestinationAddress: '#Flow-Toolbar-Container',

	AutoRender: false,

	FlowViewIdentifier: 'Pict-Flow',

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
			<option value="default">Default</option>
			<option value="start">Start</option>
			<option value="end">End</option>
			<option value="decision">Decision</option>
		</select>
		<button class="pict-flow-toolbar-btn" data-flow-action="add-node">+ Add Node</button>
	</div>
	<div class="pict-flow-toolbar-group">
		<button class="pict-flow-toolbar-btn danger" data-flow-action="delete-selected">Delete</button>
	</div>
	<div class="pict-flow-toolbar-group">
		<button class="pict-flow-toolbar-btn" data-flow-action="zoom-in">Zoom +</button>
		<button class="pict-flow-toolbar-btn" data-flow-action="zoom-out">Zoom −</button>
		<button class="pict-flow-toolbar-btn" data-flow-action="zoom-fit">Fit</button>
	</div>
	<div class="pict-flow-toolbar-group">
		<button class="pict-flow-toolbar-btn" data-flow-action="auto-layout">Auto Layout</button>
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

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
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

			default:
				this.log.warn(`PictViewFlowToolbar: unknown action '${pAction}'`);
				break;
		}
	}
}

module.exports = PictViewFlowToolbar;

module.exports.default_configuration = _DefaultConfiguration;
