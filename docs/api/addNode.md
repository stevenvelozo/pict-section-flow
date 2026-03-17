# addNode

Create a new node on the flow canvas. The node is added to the flow data, assigned a UUID hash, populated with default ports from the node type definition, and the canvas is re-rendered.

## Signature

```javascript
flowView.addNode(pType, pX, pY, pTitle, pData)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pType` | string | Yes | Node type key. Built-in types: `'start'`, `'end'`, `'halt'`, `'decision'`, `'default'`. Custom types use the `Code` from a registered `PictFlowCard`. |
| `pX` | number | Yes | X coordinate in SVG space |
| `pY` | number | Yes | Y coordinate in SVG space |
| `pTitle` | string | Yes | Display title shown on the node's title bar |
| `pData` | object | No | Optional custom data object attached to the node's `Data` property |

## Returns

The newly created node object:

```javascript
{
	Hash: 'node-a1b2c3d4',
	Type: 'start',
	X: 50,
	Y: 150,
	Width: 140,
	Height: 80,
	Title: 'Begin',
	Ports:
	[
		{
			Hash: 'port-e5f6g7h8',
			Direction: 'output',
			Side: 'right',
			Label: 'Out'
		}
	],
	Data: {}
}
```

## Events Fired

- `onNodeAdded` — with the new node object
- `onFlowChanged` — with the complete flow data

## Examples

### Basic usage

```javascript
// Add a start node at position (50, 150)
let tmpStart = flowView.addNode('start', 50, 150, 'Begin');

// Add a processing node
let tmpProcess = flowView.addNode('default', 250, 150, 'Transform Data');

// Add an end node
let tmpEnd = flowView.addNode('end', 450, 150, 'Done');
```

### With custom data

```javascript
let tmpFileRead = flowView.addNode('FREAD', 100, 200, 'Read Config',
	{
		FilePath: '/etc/app/config.json',
		Encoding: 'utf-8'
	});

console.log(tmpFileRead.Data.FilePath); // '/etc/app/config.json'
```

### Adding a decision node

```javascript
let tmpDecision = flowView.addNode('decision', 300, 200, 'Is Valid?');

// The decision node has three ports by default: In, Yes, No
console.log(tmpDecision.Ports.length); // 3
```

### Programmatic flow construction

```javascript
function buildPipeline(pFlowView, pSteps)
{
	let tmpPreviousNode = null;

	for (let i = 0; i < pSteps.length; i++)
	{
		let tmpNode = pFlowView.addNode(
			pSteps[i].Type,
			100 + (i * 200),
			150,
			pSteps[i].Title,
			pSteps[i].Data
		);

		if (tmpPreviousNode)
		{
			let tmpOutPort = tmpPreviousNode.Ports.find((pPort) => pPort.Direction === 'output');
			let tmpInPort = tmpNode.Ports.find((pPort) => pPort.Direction === 'input');

			if (tmpOutPort && tmpInPort)
			{
				pFlowView.addConnection(
					tmpPreviousNode.Hash, tmpOutPort.Hash,
					tmpNode.Hash, tmpInPort.Hash
				);
			}
		}

		tmpPreviousNode = tmpNode;
	}
}

buildPipeline(flowView,
	[
		{ Type: 'start', Title: 'Begin' },
		{ Type: 'FREAD', Title: 'Load Data', Data: { FilePath: '/data/input.csv' } },
		{ Type: 'default', Title: 'Process' },
		{ Type: 'end', Title: 'Complete' }
	]);
```

## See Also

- [removeNode](removeNode.md) — Delete a node
- [getFlowData](getFlowData.md) — Retrieve the full flow state
- [PictFlowCard](PictFlowCard.md) — Define custom node types
- [registerNodeType](registerNodeType.md) — Register node types directly
