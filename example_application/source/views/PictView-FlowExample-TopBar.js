const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "FlowExample-TopBar",

	DefaultRenderable: "FlowExample-TopBar-Content",
	DefaultDestinationAddress: "#FlowExample-TopBar-Container",

	AutoRender: false,

	CSS: /*css*/`
		.flowexample-topbar {
			display: flex;
			align-items: center;
			justify-content: space-between;
			background-color: #2c3e50;
			color: #ecf0f1;
			padding: 0 1.5em;
			height: 56px;
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
			position: sticky;
			top: 0;
			z-index: 100;
		}
		.flowexample-topbar-brand {
			font-size: 1.25em;
			font-weight: 600;
			letter-spacing: 0.02em;
			color: #ecf0f1;
			text-decoration: none;
			cursor: pointer;
		}
		.flowexample-topbar-brand:hover {
			color: #fff;
		}
		.flowexample-topbar-nav {
			display: flex;
			align-items: center;
			gap: 0.25em;
		}
		.flowexample-topbar-nav a {
			color: #bdc3c7;
			text-decoration: none;
			padding: 0.5em 0.75em;
			border-radius: 4px;
			font-size: 0.9em;
			transition: background-color 0.15s, color 0.15s;
			cursor: pointer;
		}
		.flowexample-topbar-nav a:hover {
			background-color: #34495e;
			color: #fff;
		}
	`,

	Templates:
	[
		{
			Hash: "FlowExample-TopBar-Template",
			Template: /*html*/`
<div class="flowexample-topbar">
	<a class="flowexample-topbar-brand" onclick="{~P~}.PictApplication.navigateTo('/Home')">Pict Section Flow</a>
	<div class="flowexample-topbar-nav">
		<a onclick="{~P~}.PictApplication.navigateTo('/Home')">Home</a>
		<a onclick="{~P~}.PictApplication.navigateTo('/About')">About</a>
		<a onclick="{~P~}.PictApplication.navigateTo('/Documentation')">Documentation</a>
	</div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "FlowExample-TopBar-Content",
			TemplateHash: "FlowExample-TopBar-Template",
			DestinationAddress: "#FlowExample-TopBar-Container",
			RenderMethod: "replace"
		}
	]
};

class FlowExampleTopBarView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}

module.exports = FlowExampleTopBarView;

module.exports.default_configuration = _ViewConfiguration;
