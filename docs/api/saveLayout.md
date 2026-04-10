# saveLayout / restoreLayout / deleteLayout

Save, restore, and manage spatial layout snapshots. Layouts capture node and panel positions plus viewport state, independent of the flow's logical content.

## Signatures

```javascript
let tmpLayout = flowView._LayoutProvider.saveLayout(pName);
flowView._LayoutProvider.restoreLayout(pLayoutHash);
flowView._LayoutProvider.deleteLayout(pLayoutHash);
flowView._LayoutProvider.getLayouts();
flowView._LayoutProvider.loadPersistedLayouts();
```

## saveLayout

Save the current spatial arrangement.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pName` | string | Yes | Display name for the layout |

**Returns:** Layout data object.

**Events Fired:** `onLayoutSaved`

## restoreLayout

Restore a previously saved layout.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pLayoutHash` | string | Yes | Hash of the layout to restore |

**Returns:** `boolean`

**Events Fired:** `onLayoutRestored`

## deleteLayout

Delete a saved layout.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pLayoutHash` | string | Yes | Hash of the layout to delete |

**Returns:** `boolean`

**Events Fired:** `onLayoutDeleted`

## getLayouts

Returns an array of all saved layout objects.

## loadPersistedLayouts

Load layouts from the storage backend. Called automatically on initialization when using localStorage.

## Examples

### Save and list layouts

```javascript
// Save the current arrangement
flowView._LayoutProvider.saveLayout('Default View');
flowView._LayoutProvider.saveLayout('Zoomed In');

// List all saved layouts
let tmpLayouts = flowView._LayoutProvider.getLayouts();
tmpLayouts.forEach((pLayout) =>
{
	console.log(pLayout.Name, pLayout.Hash, pLayout.CreatedAt);
});
```

### Restore a layout

```javascript
let tmpLayouts = flowView._LayoutProvider.getLayouts();

if (tmpLayouts.length > 0)
{
	flowView._LayoutProvider.restoreLayout(tmpLayouts[0].Hash);
}
```

### Layout picker UI

```javascript
function renderLayoutPicker()
{
	let tmpLayouts = flowView._LayoutProvider.getLayouts();
	let tmpContainer = document.getElementById('layout-picker');
	tmpContainer.innerHTML = '';

	tmpLayouts.forEach((pLayout) =>
	{
		let tmpButton = document.createElement('button');
		tmpButton.textContent = pLayout.Name;
		tmpButton.addEventListener('click', () =>
		{
			flowView._LayoutProvider.restoreLayout(pLayout.Hash);
		});
		tmpContainer.appendChild(tmpButton);
	});
}

// Re-render picker when layouts change
flowView._EventHandlerProvider.registerHandler('onLayoutSaved', renderLayoutPicker);
flowView._EventHandlerProvider.registerHandler('onLayoutDeleted', renderLayoutPicker);
```

### Override storage for REST API

```javascript
let tmpLayoutProvider = flowView._LayoutProvider;

tmpLayoutProvider.storageWrite = function(pLayouts, fCallback)
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

tmpLayoutProvider.storageRead = function(fCallback)
{
	fetch('/api/my-flow/layouts')
		.then((pResponse) => pResponse.json())
		.then((pLayouts) => fCallback(null, pLayouts))
		.catch((pError) => fCallback(pError, []));
};

tmpLayoutProvider.storageDelete = function(fCallback)
{
	fetch('/api/my-flow/layouts', { method: 'DELETE' })
		.then(() => fCallback(null))
		.catch((pError) => fCallback(pError));
};

// Reload from the new backend
tmpLayoutProvider.loadPersistedLayouts();
```

## See Also

- [Layout Persistence](../Layout_Persistence.md) -- Detailed guide on storage backends
- [autoLayout](autoLayout.md) -- Automatic topological layout
