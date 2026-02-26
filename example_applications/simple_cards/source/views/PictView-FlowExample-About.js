const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "FlowExample-About",

	DefaultRenderable: "FlowExample-About-Content",
	DefaultDestinationAddress: "#FlowExample-Content-Container",

	AutoRender: false,

	CSS: /*css*/`
		.flowexample-about {
			padding: 2em;
			max-width: 800px;
			margin: 0 auto;
		}
		.flowexample-about-header {
			text-align: center;
			padding-bottom: 1.5em;
			border-bottom: 1px solid #eee;
			margin-bottom: 2em;
		}
		.flowexample-about-header h1 {
			margin: 0 0 0.25em 0;
			font-size: 2em;
			font-weight: 300;
			color: #2c3e50;
		}
		.flowexample-about-header p {
			margin: 0;
			color: #7f8c8d;
			font-size: 1.1em;
		}
		.flowexample-about h2 {
			margin: 1.5em 0 0.5em 0;
			font-weight: 400;
			color: #2c3e50;
			font-size: 1.3em;
		}
		.flowexample-about p {
			color: #555;
			line-height: 1.7;
		}
		.flowexample-about-tech {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
			gap: 1em;
			margin-top: 1em;
		}
		.flowexample-about-tech-item {
			background: #f8f9fa;
			border: 1px solid #e9ecef;
			border-radius: 4px;
			padding: 1em;
			text-align: center;
		}
		.flowexample-about-tech-item strong {
			display: block;
			margin-bottom: 0.25em;
			color: #2c3e50;
		}
		.flowexample-about-tech-item span {
			font-size: 0.85em;
			color: #666;
		}
		.flowexample-about-features {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
			gap: 1em;
			margin-top: 1em;
		}
		.flowexample-about-feature {
			background: #fff;
			border: 1px solid #e0e0e0;
			border-radius: 6px;
			padding: 1.25em;
		}
		.flowexample-about-feature h3 {
			margin: 0 0 0.35em 0;
			font-size: 1em;
			color: #2c3e50;
		}
		.flowexample-about-feature p {
			margin: 0;
			font-size: 0.9em;
		}
	`,

	Templates:
	[
		{
			Hash: "FlowExample-About-Template",
			Template: /*html*/`
<div class="flowexample-about">
	<div class="flowexample-about-header">
		<h1>About Pict Section Flow</h1>
		<p>A pure SVG flow diagram component for the Pict framework</p>
	</div>

	<h2>What It Does</h2>
	<p>Pict Section Flow provides a self-contained, extensible flow diagram view for Pict applications. It renders nodes and connections as SVG elements, supports drag-and-drop node positioning, interactive connection creation between ports, and viewport panning and zooming &mdash; all with zero external diagram library dependencies.</p>

	<h2>Key Features</h2>
	<div class="flowexample-about-features">
		<div class="flowexample-about-feature">
			<h3>Pure SVG Rendering</h3>
			<p>All diagram elements are rendered as standard SVG, providing native DOM events and CSS styling with no canvas or external libraries required.</p>
		</div>
		<div class="flowexample-about-feature">
			<h3>Drag &amp; Drop Nodes</h3>
			<p>Click and drag nodes to reposition them. Connections update in real time with smooth cubic bezier curves.</p>
		</div>
		<div class="flowexample-about-feature">
			<h3>Interactive Connections</h3>
			<p>Drag from an output port to an input port to create connections visually. Validation prevents self-connections and duplicates.</p>
		</div>
		<div class="flowexample-about-feature">
			<h3>Pan &amp; Zoom</h3>
			<p>Navigate large diagrams with background panning and mouse wheel zoom. Zoom-to-fit centers all nodes automatically.</p>
		</div>
		<div class="flowexample-about-feature">
			<h3>Extensible Node Types</h3>
			<p>Register custom node types with different shapes, colors, port configurations, and styles through the Node Type Provider.</p>
		</div>
		<div class="flowexample-about-feature">
			<h3>Event Hooks</h3>
			<p>Listen for node selection, movement, connection creation and removal through the Event Handler Provider for full extensibility.</p>
		</div>
	</div>

	<h2>Built With</h2>
	<div class="flowexample-about-tech">
		<div class="flowexample-about-tech-item">
			<strong>Pict</strong>
			<span>Application Framework</span>
		</div>
		<div class="flowexample-about-tech-item">
			<strong>Pict-View</strong>
			<span>View Lifecycle</span>
		</div>
		<div class="flowexample-about-tech-item">
			<strong>Pict-Router</strong>
			<span>Hash Routing</span>
		</div>
		<div class="flowexample-about-tech-item">
			<strong>SVG</strong>
			<span>Diagram Rendering</span>
		</div>
		<div class="flowexample-about-tech-item">
			<strong>Fable</strong>
			<span>Service Architecture</span>
		</div>
	</div>

	<h2>License</h2>
	<p>This project is released under the MIT License. It is part of the Retold ecosystem of tools for building complex data-driven applications.</p>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "FlowExample-About-Content",
			TemplateHash: "FlowExample-About-Template",
			DestinationAddress: "#FlowExample-Content-Container",
			RenderMethod: "replace"
		}
	]
};

class FlowExampleAboutView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}

module.exports = FlowExampleAboutView;

module.exports.default_configuration = _ViewConfiguration;
