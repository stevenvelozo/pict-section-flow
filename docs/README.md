# Pict Section Flow Diagram

A Pict section view for rendering flow diagrams. Provides views, providers, and services for visual flow-based layouts within Pict applications.

## Installation

```bash
npm install pict-section-flow
```

## Building

```bash
npx quack build
```

## Layout Persistence

Saved layouts are persisted to `localStorage` by default, keyed by the flow view identifier (e.g. `pict-flow-layouts-MyFlowDiagram`). Layouts survive page refreshes without any configuration.

### Overriding Storage (e.g. REST API)

The `LayoutProvider` exposes three hookable storage methods that follow the `fCallback(pError, pResult)` convention. Replace them on the instance to use any backend:

```javascript
// After your flow view is initialized:
let layoutProvider = myFlowView._LayoutProvider;

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

### Configuration Options

- **`StorageKey`** (string) -- Override the localStorage key. Passed via options when instantiating the provider.
- **`StorageKey: false`** -- Disable localStorage persistence entirely (useful when using only a remote backend).

## License

MIT
