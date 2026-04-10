# Layout Persistence

Pict-Section-Flow can save and restore spatial arrangements of nodes and panels independently of the flow data itself. This lets users maintain multiple views of the same flow graph.

## How It Works

A **layout** captures the position, size, and viewport state of a flow diagram at a point in time. It does not store the flow's logical content (nodes, connections, data) -- only where things are on screen.

Each saved layout contains:

| Property | Description |
|----------|-------------|
| `Hash` | Unique identifier for the layout |
| `Name` | Display name chosen by the user |
| `CreatedAt` | ISO 8601 timestamp |
| `NodePositions` | Map of node hash to `{ X, Y, Width, Height }` |
| `PanelPositions` | Map of node hash to `{ X, Y, Width, Height }` |
| `ViewState` | `{ PanX, PanY, Zoom }` |

## Default Behavior: localStorage

Saved layouts persist to `localStorage` by default, keyed by the flow view identifier (e.g. `pict-flow-layouts-MyFlowDiagram`). Layouts survive page refreshes without any configuration.

```javascript
// Save the current layout
flowView._LayoutProvider.saveLayout('My Layout');

// List all saved layouts
let tmpLayouts = flowView._LayoutProvider.getLayouts();

// Restore a layout
flowView._LayoutProvider.restoreLayout(tmpLayouts[0].Hash);

// Delete a layout
flowView._LayoutProvider.deleteLayout(tmpLayouts[0].Hash);
```

## Overriding Storage (e.g. REST API)

The `LayoutProvider` exposes three hookable storage methods that follow the `fCallback(pError, pResult)` convention. Replace them on the instance to use any backend:

```javascript
// After your flow view is initialized:
let layoutProvider = flowView._LayoutProvider;

// Persist layouts to a server
layoutProvider.storageWrite = function(pLayouts, fCallback)
{
	fetch('/api/my-flow/layouts',
		{
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(pLayouts)
		})
		.then(() => fCallback(null))
		.catch((pError) => fCallback(pError));
};

// Load layouts from a server
layoutProvider.storageRead = function(fCallback)
{
	fetch('/api/my-flow/layouts')
		.then((pResponse) => pResponse.json())
		.then((pLayouts) => fCallback(null, pLayouts))
		.catch((pError) => fCallback(pError, []));
};

// Delete all layouts on the server
layoutProvider.storageDelete = function(fCallback)
{
	fetch('/api/my-flow/layouts', { method: 'DELETE' })
		.then(() => fCallback(null))
		.catch((pError) => fCallback(pError));
};

// Load from the new backend now that hooks are set
layoutProvider.loadPersistedLayouts();
```

## Configuration Options

- **`StorageKey`** (string) -- Override the localStorage key. Passed via options when instantiating the provider.
- **`StorageKey: false`** -- Disable localStorage persistence entirely (useful when using only a remote backend).

## Events

The layout system fires events you can hook into:

```javascript
flowView._EventHandlerProvider.registerHandler('onLayoutSaved',
	(pLayoutData) =>
	{
		console.log('Layout saved:', pLayoutData.Name);
	});

flowView._EventHandlerProvider.registerHandler('onLayoutRestored',
	(pLayoutData) =>
	{
		console.log('Layout restored:', pLayoutData.Name);
	});

flowView._EventHandlerProvider.registerHandler('onLayoutDeleted',
	(pLayoutData) =>
	{
		console.log('Layout deleted:', pLayoutData.Name);
	});
```

## Restore Behavior

When a layout is restored, the provider:

1. Positions each node whose hash appears in `NodePositions`
2. Positions each panel whose node hash appears in `PanelPositions`
3. Applies the saved `ViewState` (pan and zoom)
4. Any nodes that exist in the flow but not in the layout remain in their current position
5. Triggers a full re-render
