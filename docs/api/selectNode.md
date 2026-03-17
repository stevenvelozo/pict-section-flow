# selectNode / selectConnection / selectTether / deselectAll / deleteSelected

Manage the selection state of the flow canvas. At most one element (node, connection, or tether) can be selected at a time.

## Signatures

```javascript
flowView.selectNode(pNodeHash);
flowView.selectConnection(pConnectionHash);
flowView.selectTether(pPanelHash);
flowView.deselectAll();
flowView.deleteSelected();
```

## selectNode

Select a node by hash. Pass `null` to deselect.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pNodeHash` | string/null | Node hash, or `null` to deselect |

**Events Fired:** `onNodeSelected`

## selectConnection

Select a connection by hash. Pass `null` to deselect.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pConnectionHash` | string/null | Connection hash, or `null` to deselect |

**Events Fired:** `onConnectionSelected`

## selectTether

Select a tether line by its panel hash. Pass `null` to deselect.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pPanelHash` | string/null | Panel hash, or `null` to deselect |

**Events Fired:** `onTetherSelected`

## deselectAll

Clear all selection state (node, connection, and tether).

## deleteSelected

Delete the currently selected node or connection. If a node is selected, its connections are also removed.

**Returns:** `boolean` — `true` if something was deleted.

## Examples

### Programmatic selection

```javascript
let tmpNode = flowView.addNode('default', 100, 100, 'My Node');

// Select the node
flowView.selectNode(tmpNode.Hash);

// Check selection state
let tmpFlowData = flowView.getFlowData();
console.log(tmpFlowData.ViewState.SelectedNodeHash); // 'node-...'

// Clear selection
flowView.deselectAll();
```

### Selection event handler

```javascript
flowView._EventHandlerProvider.registerHandler('onNodeSelected',
	(pNode) =>
	{
		if (pNode)
		{
			document.getElementById('details-panel').innerHTML =
				'Selected: ' + pNode.Title + ' (' + pNode.Type + ')';
		}
		else
		{
			document.getElementById('details-panel').innerHTML = 'Nothing selected';
		}
	});
```

### Delete with confirmation

```javascript
function handleDelete()
{
	let tmpFlowData = flowView.getFlowData();

	if (tmpFlowData.ViewState.SelectedNodeHash)
	{
		let tmpNode = flowView.getNode(tmpFlowData.ViewState.SelectedNodeHash);
		if (confirm('Delete node "' + tmpNode.Title + '"?'))
		{
			flowView.deleteSelected();
		}
	}
	else if (tmpFlowData.ViewState.SelectedConnectionHash)
	{
		flowView.deleteSelected();
	}
}
```

## See Also

- [addNode](addNode.md) / [removeNode](removeNode.md) — Node CRUD
- [registerHandler](registerHandler.md) — Event hooks
