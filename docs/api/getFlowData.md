# getFlowData / setFlowData

Get or replace the entire flow state. `getFlowData` returns a deep clone so mutations do not affect the live state. `setFlowData` replaces the flow data and triggers a full re-render.

## Signatures

```javascript
let tmpFlowData = flowView.getFlowData();
flowView.setFlowData(pFlowData);
```

## getFlowData

### Parameters

None.

### Returns

A deep clone of the complete flow state:

```javascript
{
	Nodes: [ /* ... */ ],
	Connections: [ /* ... */ ],
	OpenPanels: [ /* ... */ ],
	SavedLayouts: [ /* ... */ ],
	ViewState:
	{
		PanX: 0,
		PanY: 0,
		Zoom: 1,
		SelectedNodeHash: null,
		SelectedConnectionHash: null,
		SelectedTetherHash: null
	}
}
```

## setFlowData

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pFlowData` | object | Yes | Complete flow data structure |

### Events Fired

- `onFlowChanged` -- with the new flow data

## Examples

### Save flow state to a server

```javascript
let tmpFlowData = flowView.getFlowData();

fetch('/api/flows/my-flow',
	{
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(tmpFlowData)
	});
```

### Load flow state from a server

```javascript
fetch('/api/flows/my-flow')
	.then((pResponse) => pResponse.json())
	.then((pFlowData) =>
	{
		flowView.setFlowData(pFlowData);
	});
```

### Clone a flow

```javascript
let tmpOriginal = flowView.getFlowData();

// Modify the clone without affecting the original
tmpOriginal.Nodes.forEach((pNode) =>
{
	pNode.X += 200;
});

flowView.setFlowData(tmpOriginal);
```

### Inspect flow statistics

```javascript
let tmpData = flowView.getFlowData();

console.log('Nodes:', tmpData.Nodes.length);
console.log('Connections:', tmpData.Connections.length);
console.log('Open Panels:', tmpData.OpenPanels.length);
console.log('Saved Layouts:', tmpData.SavedLayouts.length);
console.log('Zoom:', tmpData.ViewState.Zoom);
```

## Related Methods

- `getNode(pNodeHash)` -- Retrieve a single node by hash
- `getConnection(pConnectionHash)` -- Retrieve a single connection by hash

## See Also

- [marshalToView / marshalFromView](marshalToView.md) -- AppData two-way binding
- [addNode](addNode.md) -- Add individual nodes
