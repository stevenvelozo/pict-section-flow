# Getting Started

This guide walks you through creating a flow diagram from scratch -- installing the package, registering a view, adding nodes and connections, and wiring up custom card types.

## Prerequisites

- Node.js 16+
- A Pict application (or willingness to create one)

## Installation

```bash
npm install pict-section-flow
```

If you are building for the browser, also install the build tool:

```bash
npm install --save-dev quackage
```

## Step 1: Create a Pict Application

If you do not already have a Pict application, create a minimal one:

```javascript
const libPict = require('pict');

let _Pict = new libPict(
	{
		Product: 'FlowDemo',
		ProductVersion: '1.0.0'
	});
```

## Step 2: Register the Flow View

Pict-Section-Flow exports a View class. Register it with your Pict instance:

```javascript
const libPictSectionFlow = require('pict-section-flow');

_Pict.addView('MyFlowDiagram',
	{
		DefaultDestinationAddress: '#flow-container',
		EnableToolbar: true,
		EnableGridSnap: true,
		GridSnapSize: 20
	},
	libPictSectionFlow);
```

Your HTML needs a target element:

```html
<div id="flow-container"></div>
```

## Step 3: Initialize and Render

```javascript
// Initialize the application (triggers view initialization)
_Pict.initialize();

// The flow view is now accessible
let tmpFlowView = _Pict.views.MyFlowDiagram;
```

## Step 4: Add Nodes

Use the `addNode` method to place nodes on the canvas:

```javascript
// addNode(pType, pX, pY, pTitle, pData)
let tmpStart = tmpFlowView.addNode('start', 50, 150, 'Begin');
let tmpProcess = tmpFlowView.addNode('default', 250, 150, 'Process Data');
let tmpEnd = tmpFlowView.addNode('end', 450, 150, 'Done');
```

Five built-in node types are available out of the box:

| Type | Ports | Color | Use Case |
|------|-------|-------|----------|
| `default` | In, Out | Gray | Generic operation |
| `start` | Out | Green | Flow entry point |
| `end` | In | Teal | Flow exit point |
| `halt` | In | Red | Error termination |
| `decision` | In, Yes, No | Orange | Conditional branch |

## Step 5: Connect Nodes

Link two ports by providing node and port hashes:

```javascript
// Get the output port of the start node
let tmpSourcePort = tmpStart.Ports.find((pPort) => pPort.Direction === 'output');
// Get the input port of the process node
let tmpTargetPort = tmpProcess.Ports.find((pPort) => pPort.Direction === 'input');

tmpFlowView.addConnection(
	tmpStart.Hash, tmpSourcePort.Hash,
	tmpProcess.Hash, tmpTargetPort.Hash
);
```

## Step 6: Define a Custom Card Type

For domain-specific node types, extend `PictFlowCard`:

```javascript
const libPictFlowCard = require('pict-section-flow').PictFlowCard;

class FileReadCard extends libPictFlowCard
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, Object.assign({},
			{
				Title: 'File Read',
				Code: 'FREAD',
				Category: 'File I/O',
				Description: 'Read contents from a file path',
				TitleBarColor: '#2980b9',
				Width: 160,
				Height: 70,
				Inputs:
				[
					{ Name: 'Path', Side: 'left', PortType: 'value' }
				],
				Outputs:
				[
					{ Name: 'Data', Side: 'right', PortType: 'value' },
					{ Name: 'Error', Side: 'bottom', PortType: 'error' }
				],
				PropertiesPanel:
				{
					PanelType: 'Form',
					Title: 'File Read Settings',
					DefaultWidth: 300,
					DefaultHeight: 180,
					Configuration:
					{
						Fields:
						[
							{ Name: 'FilePath', DataType: 'String' },
							{ Name: 'Encoding', DataType: 'String' }
						]
					}
				}
			}, pOptions), pServiceHash);
	}
}
```

Register it with the flow view:

```javascript
let tmpCard = new FileReadCard(_Pict, {});
tmpCard.registerWithFlowView(tmpFlowView);
```

The card now appears in the toolbar palette under the "File I/O" category.

## Step 7: Listen for Events

Hook into the event system to react to user actions:

```javascript
tmpFlowView._EventHandlerProvider.registerHandler('onNodeSelected',
	(pNode) =>
	{
		console.log('Selected node:', pNode.Title, pNode.Hash);
	});

tmpFlowView._EventHandlerProvider.registerHandler('onFlowChanged',
	(pFlowData) =>
	{
		// Persist flow state to your backend
		fetch('/api/flows/my-flow',
			{
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(pFlowData)
			});
	});
```

## Step 8: Switch Themes

Apply a built-in theme or register a custom one:

```javascript
// Use a built-in theme
tmpFlowView.setTheme('blueprint');

// Or register your own
tmpFlowView._ThemeProvider.registerTheme('dark',
	{
		Key: 'dark',
		Label: 'Dark Mode',
		CSSVariables:
		{
			'--pf-canvas-bg': '#1a1a2e',
			'--pf-node-body-fill': '#16213e',
			'--pf-text-primary': '#e8e8e8',
			'--pf-node-selected-stroke': '#e94560'
		}
	});
tmpFlowView.setTheme('dark');
```

## Step 9: Build for the Browser

Add a build script to your `package.json`:

```json
{
	"scripts": {
		"build": "npx quack build"
	}
}
```

Then build:

```bash
npm run build
```

This produces a browser bundle in `dist/` that includes pict-section-flow and all its dependencies.

## Next Steps

- **[Architecture](Architecture.md)** -- Understand the service/provider design
- **[Implementation Reference](Implementation_Reference.md)** -- Full API for every method
- **[Custom Styling](Custom-Styling.md)** -- CSS variables and theme configuration
- **[Layout Persistence](Layout_Persistence.md)** -- Save layouts to localStorage or a REST API
