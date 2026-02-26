const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "FlowExample-Layout",

	DefaultRenderable: "FlowExample-Layout-Shell",
	DefaultDestinationAddress: "#FlowExample-Application-Container",

	AutoRender: false,

	CSS: /*css*/`
		#FlowExample-Application-Container {
			display: flex;
			flex-direction: column;
			min-height: 100vh;
		}
		#FlowExample-TopBar-Container {
			flex-shrink: 0;
		}
		#FlowExample-Content-Container {
			flex: 1;
		}
		#FlowExample-BottomBar-Container {
			flex-shrink: 0;
		}
	`,

	Templates:
	[
		{
			Hash: "FlowExample-Layout-Shell-Template",
			Template: /*html*/`
<div id="FlowExample-TopBar-Container"></div>
<div id="FlowExample-Content-Container"></div>
<div id="FlowExample-BottomBar-Container"></div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "FlowExample-Layout-Shell",
			TemplateHash: "FlowExample-Layout-Shell-Template",
			DestinationAddress: "#FlowExample-Application-Container",
			RenderMethod: "replace"
		}
	]
};

class FlowExampleLayoutView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		// After the layout shell is rendered, render the child views into their containers
		this.pict.views['FlowExample-TopBar'].render();
		this.pict.views['FlowExample-BottomBar'].render();

		// Render initial content -- the main workspace by default
		this.pict.views['FlowExample-MainWorkspace'].render();

		// Inject all view CSS into the PICT-CSS style element.
		// This must be called after ALL views are rendered (including the flow view
		// which is created inside MainWorkspace's onAfterRender) so that all CSS
		// registered via addCSS() during view construction is included.
		this.pict.CSSMap.injectCSS();

		// Now resolve the router so it picks up the current hash URL
		if (this.pict.providers.PictRouter)
		{
			this.pict.providers.PictRouter.resolve();
		}

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}
}

module.exports = FlowExampleLayoutView;

module.exports.default_configuration = _ViewConfiguration;
