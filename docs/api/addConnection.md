# addConnection

Connect two ports on the flow canvas. Creates a visual line between the source port (typically an output) and the target port (typically an input). The connection is validated before creation.

## Signature

```javascript
flowView.addConnection(pSourceNode, pSourcePort, pTargetNode, pTargetPort, pData)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pSourceNode` | string | Yes | Hash of the source node |
| `pSourcePort` | string | Yes | Hash of the source port |
| `pTargetNode` | string | Yes | Hash of the target node |
| `pTargetPort` | string | Yes | Hash of the target port |
| `pData` | object | No | Optional connection metadata |

### Connection Data Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `LineMode` | string | `'bezier'` | Path style: `'bezier'` or `'orthogonal'` |

## Returns

The connection object on success, or `false` if validation failed (e.g. duplicate connection, self-connection, or port not found).

```javascript
{
	Hash: 'conn-x1y2z3',
	SourceNodeHash: 'node-a1b2',
	SourcePortHash: 'port-c3d4',
	TargetNodeHash: 'node-e5f6',
	TargetPortHash: 'port-g7h8',
	Data:
	{
		LineMode: 'bezier',
		HandleCustomized: false
	}
}
```

## Events Fired

- `onConnectionCreated` — with the new connection object
- `onFlowChanged` — with the complete flow data

## Examples

### Basic connection

```javascript
let tmpStart = flowView.addNode('start', 50, 150, 'Begin');
let tmpEnd = flowView.addNode('end', 400, 150, 'Done');

let tmpOutPort = tmpStart.Ports.find((pPort) => pPort.Direction === 'output');
let tmpInPort = tmpEnd.Ports.find((pPort) => pPort.Direction === 'input');

let tmpConn = flowView.addConnection(
	tmpStart.Hash, tmpOutPort.Hash,
	tmpEnd.Hash, tmpInPort.Hash
);

console.log(tmpConn.Hash); // 'conn-...'
```

### Orthogonal connection

```javascript
let tmpConn = flowView.addConnection(
	tmpA.Hash, tmpOutPort.Hash,
	tmpB.Hash, tmpInPort.Hash,
	{ LineMode: 'orthogonal' }
);
```

### Decision node branching

```javascript
let tmpDecision = flowView.addNode('decision', 200, 150, 'Check Status');
let tmpSuccess = flowView.addNode('default', 400, 50, 'Handle Success');
let tmpFailure = flowView.addNode('halt', 400, 250, 'Handle Error');

// Find the Yes and No output ports on the decision node
let tmpYesPort = tmpDecision.Ports.find((pPort) => pPort.Label === 'Yes');
let tmpNoPort = tmpDecision.Ports.find((pPort) => pPort.Label === 'No');

let tmpSuccessIn = tmpSuccess.Ports.find((pPort) => pPort.Direction === 'input');
let tmpFailureIn = tmpFailure.Ports.find((pPort) => pPort.Direction === 'input');

flowView.addConnection(tmpDecision.Hash, tmpYesPort.Hash, tmpSuccess.Hash, tmpSuccessIn.Hash);
flowView.addConnection(tmpDecision.Hash, tmpNoPort.Hash, tmpFailure.Hash, tmpFailureIn.Hash);
```

## See Also

- [removeConnection](removeConnection.md) — Delete a connection
- [addNode](addNode.md) — Create nodes to connect
