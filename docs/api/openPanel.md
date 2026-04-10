# openPanel / closePanel / closePanelForNode / togglePanel / updatePanelPosition

Manage the lifecycle and positioning of properties panels. Panels are floating UI elements tethered to nodes by a line. They display when a node is double-clicked or opened programmatically.

## Signatures

```javascript
flowView.openPanel(pNodeHash);
flowView.closePanel(pPanelHash);
flowView.closePanelForNode(pNodeHash);
flowView.togglePanel(pNodeHash);
flowView.updatePanelPosition(pPanelHash, pX, pY);
```

## openPanel

Open a properties panel for a node. The panel type and configuration come from the node type's `PropertiesPanel` definition.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pNodeHash` | string | Hash of the node to open a panel for |

**Returns:** Panel data object, or `false` if the node type has no panel configuration.

**Events Fired:** `onPanelOpened`

## closePanel

Close a panel by its hash.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pPanelHash` | string | Hash of the panel to close |

**Returns:** `boolean`

**Events Fired:** `onPanelClosed`

## closePanelForNode

Close all panels associated with a node.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pNodeHash` | string | Hash of the node whose panels to close |

**Returns:** `boolean`

## togglePanel

Toggle a node's panel. Opens it if closed, closes it if open.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pNodeHash` | string | Hash of the node |

**Returns:** Panel data object if opened, `false` if closed.

## updatePanelPosition

Move a panel to new coordinates.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pPanelHash` | string | Hash of the panel |
| `pX` | number | New X coordinate |
| `pY` | number | New Y coordinate |

**Events Fired:** `onPanelMoved`

## Examples

### Open a panel programmatically

```javascript
let tmpNode = flowView.addNode('FREAD', 200, 150, 'Read Config');
let tmpPanel = flowView.openPanel(tmpNode.Hash);

if (tmpPanel)
{
	console.log('Panel opened:', tmpPanel.Hash);
	console.log('Panel type:', tmpPanel.PanelType);
}
```

### Toggle on button click

```javascript
document.getElementById('toggle-props').addEventListener('click', () =>
{
	let tmpFlowData = flowView.getFlowData();
	if (tmpFlowData.ViewState.SelectedNodeHash)
	{
		flowView.togglePanel(tmpFlowData.ViewState.SelectedNodeHash);
	}
});
```

### Close all open panels

```javascript
let tmpFlowData = flowView.getFlowData();
tmpFlowData.OpenPanels.forEach((pPanel) =>
{
	flowView.closePanel(pPanel.Hash);
});
```

### Listen for panel events

```javascript
flowView._EventHandlerProvider.registerHandler('onPanelOpened',
	(pPanelData) =>
	{
		console.log('Panel opened for node:', pPanelData.NodeHash);
	});

flowView._EventHandlerProvider.registerHandler('onPanelClosed',
	(pPanelData) =>
	{
		console.log('Panel closed:', pPanelData.Hash);
	});
```

## See Also

- [PictFlowCard](PictFlowCard.md) -- Define PropertiesPanel configuration on card types
- [PictFlowCardPropertiesPanel](PictFlowCardPropertiesPanel.md) -- Custom panel base class
