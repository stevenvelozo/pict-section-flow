# removeNode

Delete a node from the flow canvas. All connections attached to the node are also removed. Any open properties panel for the node is closed. The canvas is re-rendered.

## Signature

```javascript
flowView.removeNode(pNodeHash)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pNodeHash` | string | Yes | Hash of the node to remove |

## Returns

`boolean` — `true` if the node was found and removed, `false` otherwise.

## Events Fired

- `onNodeRemoved` — with the removed node object
- `onConnectionRemoved` — for each connection that was cascaded
- `onFlowChanged` — with the updated flow data

## Examples

### Basic removal

```javascript
let tmpNode = flowView.addNode('default', 100, 100, 'Temporary');

// Later, remove it
let tmpRemoved = flowView.removeNode(tmpNode.Hash);
console.log(tmpRemoved); // true
```

### Remove with cascading connections

```javascript
let tmpA = flowView.addNode('start', 50, 100, 'A');
let tmpB = flowView.addNode('default', 250, 100, 'B');
let tmpC = flowView.addNode('end', 450, 100, 'C');

// Connect A -> B -> C
flowView.addConnection(tmpA.Hash, tmpA.Ports[0].Hash, tmpB.Hash, tmpB.Ports[0].Hash);
flowView.addConnection(tmpB.Hash, tmpB.Ports[1].Hash, tmpC.Hash, tmpC.Ports[0].Hash);

// Removing B also removes both connections
flowView.removeNode(tmpB.Hash);

let tmpFlowData = flowView.getFlowData();
console.log(tmpFlowData.Connections.length); // 0
```

### Conditional removal with event tracking

```javascript
flowView._EventHandlerProvider.registerHandler('onNodeRemoved',
	(pNode) =>
	{
		console.log('Removed:', pNode.Title);
	});

// Only remove nodes of a certain type
let tmpFlowData = flowView.getFlowData();
tmpFlowData.Nodes.forEach((pNode) =>
{
	if (pNode.Type === 'default')
	{
		flowView.removeNode(pNode.Hash);
	}
});
```

## See Also

- [addNode](addNode.md) — Create a node
- [deleteSelected](selectNode.md) — Delete the currently selected element
