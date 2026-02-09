const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "FlowExample-Documentation",

	DefaultRenderable: "FlowExample-Documentation-Content",
	DefaultDestinationAddress: "#FlowExample-Content-Container",

	AutoRender: false,

	CSS: /*css*/`
		.flowexample-docs {
			padding: 2em;
			max-width: 800px;
			margin: 0 auto;
		}
		.flowexample-docs-header {
			text-align: center;
			padding-bottom: 1.5em;
			border-bottom: 1px solid #eee;
			margin-bottom: 2em;
		}
		.flowexample-docs-header h1 {
			margin: 0 0 0.25em 0;
			font-size: 2em;
			font-weight: 300;
			color: #2c3e50;
		}
		.flowexample-docs-header p {
			margin: 0;
			color: #7f8c8d;
			font-size: 1.1em;
		}
		.flowexample-docs h2 {
			margin: 1.75em 0 0.5em 0;
			font-weight: 400;
			color: #2c3e50;
			font-size: 1.3em;
			border-bottom: 1px solid #eee;
			padding-bottom: 0.35em;
		}
		.flowexample-docs h3 {
			margin: 1.25em 0 0.35em 0;
			font-weight: 600;
			color: #34495e;
			font-size: 1.05em;
		}
		.flowexample-docs p {
			color: #555;
			line-height: 1.7;
		}
		.flowexample-docs code {
			background: #f4f4f5;
			padding: 0.15em 0.4em;
			border-radius: 3px;
			font-size: 0.9em;
			color: #e74c3c;
		}
		.flowexample-docs pre {
			background: #2c3e50;
			color: #ecf0f1;
			padding: 1.25em;
			border-radius: 6px;
			overflow-x: auto;
			line-height: 1.5;
			font-size: 0.9em;
		}
		.flowexample-docs pre code {
			background: none;
			padding: 0;
			color: #ecf0f1;
		}
		.flowexample-docs ul {
			color: #555;
			line-height: 1.8;
			padding-left: 1.5em;
		}
		.flowexample-docs-toc {
			background: #f8f9fa;
			border: 1px solid #e9ecef;
			border-radius: 6px;
			padding: 1.25em 1.5em;
			margin-bottom: 2em;
		}
		.flowexample-docs-toc h3 {
			margin: 0 0 0.5em 0;
			font-size: 0.95em;
			color: #2c3e50;
		}
		.flowexample-docs-toc ul {
			margin: 0;
			padding-left: 1.25em;
			line-height: 1.8;
		}
		.flowexample-docs-toc a {
			color: #3498db;
			text-decoration: none;
		}
		.flowexample-docs-toc a:hover {
			text-decoration: underline;
		}
	`,

	Templates:
	[
		{
			Hash: "FlowExample-Documentation-Template",
			Template: /*html*/`
<div class="flowexample-docs">
	<div class="flowexample-docs-header">
		<h1>Documentation</h1>
		<p>How to use and extend the Pict Section Flow component</p>
	</div>

	<div class="flowexample-docs-toc">
		<h3>Contents</h3>
		<ul>
			<li><a href="#getting-started">Getting Started</a></li>
			<li><a href="#data-model">Data Model</a></li>
			<li><a href="#configuration">Configuration</a></li>
			<li><a href="#api-reference">API Reference</a></li>
			<li><a href="#node-types">Node Types</a></li>
			<li><a href="#event-hooks">Event Hooks</a></li>
		</ul>
	</div>

	<h2 id="getting-started">Getting Started</h2>
	<p>Pict Section Flow is a pict-view class that renders an interactive SVG flow diagram. Install it via npm and add it as a view in your Pict application.</p>

	<h3>Installation</h3>
	<pre><code>npm install pict-section-flow</code></pre>

	<h3>Basic Usage</h3>
	<pre><code>const libPictSectionFlow = require('pict-section-flow');

// In your Pict application constructor:
this.pict.addView('MyFlowDiagram',
  {
    ViewIdentifier: 'MyFlowDiagram',
    DefaultRenderable: 'Flow-Container',
    DefaultDestinationAddress: '#my-flow-container',
    FlowDataAddress: 'AppData.MyApp.FlowData',
    EnableToolbar: true
  },
  libPictSectionFlow
);</code></pre>

	<p>The view reads its initial data from <code>FlowDataAddress</code> in AppData, and writes changes back via <code>marshalFromView()</code>.</p>

	<h2 id="data-model">Data Model</h2>
	<p>The flow data is a plain JSON object with three top-level properties:</p>

	<h3>Nodes</h3>
	<pre><code>{
  "Hash": "node-1",
  "Type": "default",
  "X": 100, "Y": 200,
  "Width": 180, "Height": 80,
  "Title": "My Node",
  "Ports": [
    { "Hash": "port-in-1", "Direction": "input",
      "Side": "left", "Label": "In" },
    { "Hash": "port-out-1", "Direction": "output",
      "Side": "right", "Label": "Out" }
  ],
  "Data": {}
}</code></pre>

	<h3>Connections</h3>
	<pre><code>{
  "Hash": "conn-1",
  "SourceNodeHash": "node-1",
  "SourcePortHash": "port-out-1",
  "TargetNodeHash": "node-2",
  "TargetPortHash": "port-in-1",
  "Data": {}
}</code></pre>

	<h3>ViewState</h3>
	<pre><code>{
  "PanX": 0, "PanY": 0,
  "Zoom": 1,
  "SelectedNodeHash": null,
  "SelectedConnectionHash": null
}</code></pre>

	<h2 id="configuration">Configuration</h2>
	<p>These options can be passed when adding the view:</p>
	<ul>
		<li><code>FlowDataAddress</code> &mdash; Manifest address for flow data in AppData</li>
		<li><code>EnableToolbar</code> &mdash; Show the toolbar (default: <code>true</code>)</li>
		<li><code>EnablePanning</code> &mdash; Allow background pan (default: <code>true</code>)</li>
		<li><code>EnableZooming</code> &mdash; Allow mouse wheel zoom (default: <code>true</code>)</li>
		<li><code>EnableNodeDragging</code> &mdash; Allow node drag-and-drop (default: <code>true</code>)</li>
		<li><code>EnableConnectionCreation</code> &mdash; Allow port-to-port connection creation (default: <code>true</code>)</li>
		<li><code>EnableGridSnap</code> &mdash; Snap node positions to grid (default: <code>false</code>)</li>
		<li><code>GridSnapSize</code> &mdash; Grid size in pixels (default: <code>20</code>)</li>
		<li><code>MinZoom</code> / <code>MaxZoom</code> &mdash; Zoom limits (default: <code>0.1</code> / <code>5.0</code>)</li>
		<li><code>ZoomStep</code> &mdash; Zoom increment per wheel tick (default: <code>0.1</code>)</li>
	</ul>

	<h2 id="api-reference">API Reference</h2>

	<h3>Node Operations</h3>
	<ul>
		<li><code>addNode(type, x, y, title, data)</code> &mdash; Add a new node</li>
		<li><code>removeNode(hash)</code> &mdash; Remove a node and its connections</li>
		<li><code>getNode(hash)</code> &mdash; Get a node by hash</li>
		<li><code>selectNode(hash)</code> &mdash; Select a node</li>
	</ul>

	<h3>Connection Operations</h3>
	<ul>
		<li><code>addConnection(srcNode, srcPort, tgtNode, tgtPort)</code> &mdash; Add a connection</li>
		<li><code>removeConnection(hash)</code> &mdash; Remove a connection</li>
		<li><code>getConnection(hash)</code> &mdash; Get a connection by hash</li>
		<li><code>selectConnection(hash)</code> &mdash; Select a connection</li>
	</ul>

	<h3>View Operations</h3>
	<ul>
		<li><code>renderFlow()</code> &mdash; Re-render the entire diagram</li>
		<li><code>setFlowData(data)</code> &mdash; Replace flow data and re-render</li>
		<li><code>getFlowData()</code> &mdash; Get a deep copy of the flow data</li>
		<li><code>marshalToView()</code> &mdash; Load data from AppData into the view</li>
		<li><code>marshalFromView()</code> &mdash; Write view data back to AppData</li>
		<li><code>deselectAll()</code> &mdash; Clear all selections</li>
		<li><code>deleteSelected()</code> &mdash; Delete the selected node or connection</li>
	</ul>

	<h3>Viewport Operations</h3>
	<ul>
		<li><code>setZoom(level, focusX, focusY)</code> &mdash; Set zoom level</li>
		<li><code>zoomToFit()</code> &mdash; Fit all nodes in view</li>
		<li><code>autoLayout()</code> &mdash; Auto-arrange nodes left to right</li>
		<li><code>screenToSVGCoords(x, y)</code> &mdash; Convert screen to SVG coordinates</li>
	</ul>

	<h2 id="node-types">Node Types</h2>
	<p>Four built-in node types are provided:</p>
	<ul>
		<li><code>default</code> &mdash; Standard rectangular node with input and output ports</li>
		<li><code>start</code> &mdash; Rounded green node with output port only</li>
		<li><code>end</code> &mdash; Rounded red node with input port only</li>
		<li><code>decision</code> &mdash; Yellow node with one input and two outputs (Yes/No)</li>
	</ul>

	<h3>Registering Custom Types</h3>
	<pre><code>// After the flow view is rendered:
flowView._NodeTypeProvider.registerNodeType({
  Hash: 'custom-process',
  Label: 'Custom Process',
  DefaultWidth: 200,
  DefaultHeight: 100,
  DefaultPorts: [
    { Direction: 'input', Side: 'left', Label: 'In' },
    { Direction: 'output', Side: 'right', Label: 'Out' },
    { Direction: 'output', Side: 'bottom', Label: 'Error' }
  ],
  TitleBarColor: '#8e44ad',
  BodyStyle: {
    fill: '#f5eef8',
    stroke: '#8e44ad'
  }
});</code></pre>

	<h2 id="event-hooks">Event Hooks</h2>
	<p>Register handlers for flow events through the Event Handler Provider:</p>
	<pre><code>flowView._EventHandlerProvider.registerHandler(
  'onNodeMoved',
  (node, flowView) => {
    console.log('Node moved:', node.Title,
      'to', node.X, node.Y);
  }
);

// Available events:
// onNodeSelected, onNodeAdded, onNodeRemoved,
// onNodeMoved, onConnectionSelected,
// onConnectionCreated, onConnectionRemoved,
// onFlowChanged</code></pre>

	<h2>Project Structure</h2>
	<pre><code>pict-section-flow/
  source/
    Pict-Section-Flow.js           # Module entry
    views/
      PictView-Flow.js             # Main SVG view
      PictView-Flow-Node.js        # Node rendering
      PictView-Flow-Toolbar.js     # Toolbar controls
    services/
      ...InteractionManager.js     # Pointer events
      ...ConnectionRenderer.js     # Bezier paths
      ...Layout.js                 # Auto-layout
    providers/
      ...NodeTypes.js              # Node type registry
      ...EventHandler.js           # Event hooks</code></pre>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "FlowExample-Documentation-Content",
			TemplateHash: "FlowExample-Documentation-Template",
			DestinationAddress: "#FlowExample-Content-Container",
			RenderMethod: "replace"
		}
	]
};

class FlowExampleDocumentationView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}

module.exports = FlowExampleDocumentationView;

module.exports.default_configuration = _ViewConfiguration;
