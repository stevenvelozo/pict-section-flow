const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "FlowExample-BottomBar",

	DefaultRenderable: "FlowExample-BottomBar-Content",
	DefaultDestinationAddress: "#FlowExample-BottomBar-Container",

	AutoRender: false,

	CSS: /*css*/`
		.flowexample-bottombar {
			display: flex;
			align-items: center;
			justify-content: space-between;
			background-color: #2c3e50;
			color: #7f8c8d;
			padding: 0.75em 1.5em;
			font-size: 0.8em;
			border-top: 1px solid #34495e;
		}
		.flowexample-bottombar a {
			color: #95a5a6;
			text-decoration: none;
			margin-left: 1em;
			transition: color 0.15s;
		}
		.flowexample-bottombar a:hover {
			color: #ecf0f1;
		}
		.flowexample-bottombar-links {
			display: flex;
			align-items: center;
			gap: 0.5em;
		}
	`,

	Templates:
	[
		{
			Hash: "FlowExample-BottomBar-Template",
			Template: /*html*/`
<div class="flowexample-bottombar">
	<span>Pict Section Flow Example &copy; 2025</span>
	<div class="flowexample-bottombar-links">
		<a href="https://github.com/stevenvelozo/pict" target="_blank">Pict</a>
		<a href="https://github.com/stevenvelozo/fable" target="_blank">Fable</a>
		<a onclick="{~P~}.PictApplication.navigateTo('/About')">About</a>
	</div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "FlowExample-BottomBar-Content",
			TemplateHash: "FlowExample-BottomBar-Template",
			DestinationAddress: "#FlowExample-BottomBar-Container",
			RenderMethod: "replace"
		}
	]
};

class FlowExampleBottomBarView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}

module.exports = FlowExampleBottomBarView;

module.exports.default_configuration = _ViewConfiguration;
