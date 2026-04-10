# autoLayout

Automatically arrange all nodes in the flow using a topological sort algorithm. Nodes are positioned in columns based on their dependency order, with even vertical spacing within each column. This is useful for organizing complex flows or providing a clean starting arrangement.

## Signature

```javascript
flowView.autoLayout();
```

## Parameters

None.

## Behavior

1. Performs a topological sort of the node graph based on connections
2. Assigns nodes to columns (layers) based on their depth from root nodes
3. Distributes nodes evenly within each column
4. Re-renders the entire canvas
5. Optionally snaps to grid if `EnableGridSnap` is `true`

Nodes with no connections are placed in a separate area to the side.

## Examples

### Basic usage

```javascript
// After constructing a complex flow programmatically
flowView.autoLayout();
flowView.zoomToFit();
```

### Auto-layout after data load

```javascript
fetch('/api/flows/my-flow')
	.then((pResponse) => pResponse.json())
	.then((pFlowData) =>
	{
		flowView.setFlowData(pFlowData);
		flowView.autoLayout();
		flowView.zoomToFit();
	});
```

### Layout button

```javascript
document.getElementById('auto-layout-btn').addEventListener('click', () =>
{
	flowView.autoLayout();
	flowView.zoomToFit();
});
```

## Grid Snap

When `EnableGridSnap` is `true`, the auto-layout algorithm snaps node positions to the nearest grid point based on `GridSnapSize`:

```javascript
_Pict.addView('MyFlow',
	{
		EnableGridSnap: true,
		GridSnapSize: 20
	},
	libPictSectionFlow);

// Auto-layout will snap to 20px grid
flowView.autoLayout();
```

## See Also

- [setZoom / zoomToFit](setZoom.md) -- Fit the result in the viewport
- [saveLayout / restoreLayout](saveLayout.md) -- Persist spatial arrangements
