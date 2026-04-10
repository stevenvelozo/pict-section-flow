# registerHandler / removeHandler / fireEvent

The event system for hooking into flow diagram lifecycle events. Register callbacks to react to user actions, data changes, and state transitions without modifying core code.

## Signatures

```javascript
let tmpHash = flowView._EventHandlerProvider.registerHandler(pEventName, pHandler, pHandlerHash);
flowView._EventHandlerProvider.removeHandler(pEventName, pHandlerHash);
flowView._EventHandlerProvider.fireEvent(pEventName, pData);
```

## registerHandler

Register a callback for a named event.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pEventName` | string | Yes | Event name from the supported events list |
| `pHandler` | function | Yes | Callback function receiving event data |
| `pHandlerHash` | string | No | Optional unique ID for later removal |

**Returns:** Handler hash (string). Auto-generated if not provided.

## removeHandler

Unregister a previously registered handler.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pEventName` | string | Yes | Event name |
| `pHandlerHash` | string | Yes | Hash returned from `registerHandler` |

**Returns:** `boolean`

## fireEvent

Manually fire all handlers for a named event. Typically used internally by services, but available for custom events.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pEventName` | string | Yes | Event name |
| `pData` | any | No | Data passed to each handler |

## Supported Events

| Event | Payload | Description |
|-------|---------|-------------|
| `onNodeSelected` | Node object or null | A node is selected or deselected |
| `onNodeAdded` | Node object | A node is created |
| `onNodeRemoved` | Node object | A node is deleted |
| `onNodeMoved` | Node object | A node's position changes |
| `onConnectionSelected` | Connection object or null | A connection is selected |
| `onConnectionCreated` | Connection object | A connection is created |
| `onConnectionRemoved` | Connection object | A connection is deleted |
| `onConnectionHandleMoved` | Connection object | A bezier handle is dragged |
| `onConnectionModeChanged` | Connection object | Line mode switches |
| `onPanelOpened` | Panel data | A properties panel opens |
| `onPanelClosed` | Panel data | A properties panel closes |
| `onPanelMoved` | Panel data | A panel is repositioned |
| `onTetherSelected` | Panel data | A tether line is selected |
| `onTetherHandleMoved` | Panel data | A tether handle is dragged |
| `onTetherModeChanged` | Panel data | Tether mode switches |
| `onLayoutSaved` | Layout data | A layout is saved |
| `onLayoutRestored` | Layout data | A layout is restored |
| `onLayoutDeleted` | Layout data | A layout is deleted |
| `onFlowChanged` | Flow data | Any structural change |
| `onThemeChanged` | Theme key (string) | The active theme changes |

## Examples

### Track all changes for undo/redo

```javascript
let tmpHistory = [];
let tmpHistoryIndex = -1;

flowView._EventHandlerProvider.registerHandler('onFlowChanged',
	(pFlowData) =>
	{
		// Trim future states if we've undone
		tmpHistory = tmpHistory.slice(0, tmpHistoryIndex + 1);
		tmpHistory.push(JSON.parse(JSON.stringify(pFlowData)));
		tmpHistoryIndex = tmpHistory.length - 1;
	},
	'undo-redo-tracker');

function undo()
{
	if (tmpHistoryIndex > 0)
	{
		tmpHistoryIndex--;
		flowView.setFlowData(tmpHistory[tmpHistoryIndex]);
	}
}

function redo()
{
	if (tmpHistoryIndex < tmpHistory.length - 1)
	{
		tmpHistoryIndex++;
		flowView.setFlowData(tmpHistory[tmpHistoryIndex]);
	}
}
```

### Sync to server on every change

```javascript
flowView._EventHandlerProvider.registerHandler('onFlowChanged',
	(pFlowData) =>
	{
		fetch('/api/flows/my-flow',
			{
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(pFlowData)
			});
	},
	'server-sync');
```

### Update a sidebar when selection changes

```javascript
flowView._EventHandlerProvider.registerHandler('onNodeSelected',
	(pNode) =>
	{
		let tmpSidebar = document.getElementById('sidebar');

		if (!pNode)
		{
			tmpSidebar.innerHTML = '<p>Select a node to view details</p>';
			return;
		}

		tmpSidebar.innerHTML =
			'<h3>' + pNode.Title + '</h3>' +
			'<p>Type: ' + pNode.Type + '</p>' +
			'<p>Ports: ' + pNode.Ports.length + '</p>';
	});
```

### Remove a handler

```javascript
let tmpHandlerHash = flowView._EventHandlerProvider.registerHandler('onNodeAdded',
	(pNode) =>
	{
		console.log('Node added:', pNode.Title);
	});

// Later, unregister it
flowView._EventHandlerProvider.removeHandler('onNodeAdded', tmpHandlerHash);
```

### Multiple handlers for the same event

```javascript
// Both handlers fire when a node is added
flowView._EventHandlerProvider.registerHandler('onNodeAdded',
	(pNode) => { console.log('Handler 1:', pNode.Title); },
	'logger');

flowView._EventHandlerProvider.registerHandler('onNodeAdded',
	(pNode) => { updateNodeCount(); },
	'counter');
```

## See Also

- [addNode](addNode.md) -- Triggers `onNodeAdded` and `onFlowChanged`
- [selectNode](selectNode.md) -- Triggers `onNodeSelected`
- [setTheme](setTheme.md) -- Triggers `onThemeChanged`
