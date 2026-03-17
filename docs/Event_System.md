# Event System

Pict-Section-Flow exposes a rich event system through the `EventHandlerProvider`. Register handlers to react to user interactions, data changes, and lifecycle events without modifying core code.

## Registering Handlers

```javascript
let tmpFlowView = _Pict.views.MyFlow;

// Register a named handler
tmpFlowView._EventHandlerProvider.registerHandler(
    'onNodeAdded',
    (pNode, pFlowView) =>
    {
        console.log('Node added:', pNode.Title);
    },
    'my-node-handler'
);
```

The third parameter is an optional handler hash for later removal. If omitted, a unique hash is generated and returned.

## Removing Handlers

```javascript
// Remove a specific handler
tmpFlowView._EventHandlerProvider.removeHandler('onNodeAdded', 'my-node-handler');

// Remove all handlers for an event
tmpFlowView._EventHandlerProvider.removeAllHandlers('onNodeAdded');

// Remove all handlers for all events
tmpFlowView._EventHandlerProvider.removeAllHandlers();
```

## Querying Handlers

```javascript
// Check if any handlers are registered
tmpFlowView._EventHandlerProvider.hasHandlers('onNodeAdded');  // true or false

// Count registered handlers
tmpFlowView._EventHandlerProvider.getHandlerCount('onNodeAdded');  // number
```

## Available Events

### Node Events

| Event | Payload | Description |
|-------|---------|-------------|
| `onNodeSelected` | `node` or `null` | A node was selected or deselected |
| `onNodeAdded` | `node` | A new node was created |
| `onNodeRemoved` | `node` | A node was deleted |
| `onNodeMoved` | `node` | A node was dragged to a new position |

### Connection Events

| Event | Payload | Description |
|-------|---------|-------------|
| `onConnectionSelected` | `connection` | A connection was selected |
| `onConnectionCreated` | `connection` | A new connection was created between ports |
| `onConnectionRemoved` | `connection` | A connection was deleted |
| `onConnectionHandleMoved` | `connection` | A bezier or orthogonal handle was dragged |
| `onConnectionModeChanged` | `connection` | A connection toggled between bezier and orthogonal |

### Panel Events

| Event | Payload | Description |
|-------|---------|-------------|
| `onPanelOpened` | `panelData` | A properties panel was opened |
| `onPanelClosed` | `panelData` | A properties panel was closed |
| `onPanelMoved` | `panelData` | A properties panel was dragged |

### Tether Events

| Event | Payload | Description |
|-------|---------|-------------|
| `onTetherSelected` | `panelData` | A tether line was selected |
| `onTetherHandleMoved` | `panelData` | A tether handle was dragged |
| `onTetherModeChanged` | `panelData` | A tether toggled between bezier and orthogonal |

### Layout and Meta Events

| Event | Payload | Description |
|-------|---------|-------------|
| `onLayoutSaved` | `layoutData` | A layout snapshot was saved |
| `onLayoutRestored` | `layoutData` | A saved layout was restored |
| `onLayoutDeleted` | `layoutData` | A saved layout was deleted |
| `onFlowChanged` | `flowData` | Catch-all fired after any data mutation |
| `onThemeChanged` | `themeKey` | The active theme was switched |

## Common Patterns

### Undo/Redo Stack

```javascript
let tmpUndoStack = [];
let tmpRedoStack = [];

tmpFlowView._EventHandlerProvider.registerHandler(
    'onFlowChanged',
    (pFlowData) =>
    {
        tmpUndoStack.push(JSON.parse(JSON.stringify(pFlowData)));
        tmpRedoStack = [];
    },
    'undo-tracker'
);

function undo()
{
    if (tmpUndoStack.length < 2) return;
    tmpRedoStack.push(tmpUndoStack.pop());
    tmpFlowView.setFlowData(tmpUndoStack[tmpUndoStack.length - 1]);
}
```

### Server Sync

```javascript
tmpFlowView._EventHandlerProvider.registerHandler(
    'onFlowChanged',
    (pFlowData) =>
    {
        fetch('/api/flows/save',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pFlowData)
        });
    },
    'server-sync'
);
```

### Selection Sidebar

```javascript
tmpFlowView._EventHandlerProvider.registerHandler(
    'onNodeSelected',
    (pNode) =>
    {
        if (pNode)
        {
            document.getElementById('sidebar-title').textContent = pNode.Title;
            document.getElementById('sidebar-type').textContent = pNode.Type;
        }
        else
        {
            document.getElementById('sidebar-title').textContent = 'No selection';
        }
    },
    'sidebar-updater'
);
```
