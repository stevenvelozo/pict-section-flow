# registerNodeType / removeNodeType / getNodeType

Register, remove, and query node types in the flow diagram's type registry. Most developers will use `PictFlowCard.registerWithFlowView()` instead, but these methods provide direct access for dynamic or programmatic type management.

## Signatures

```javascript
flowView._NodeTypeProvider.registerNodeType(pNodeTypeConfig);
flowView._NodeTypeProvider.removeNodeType(pTypeHash);
flowView._NodeTypeProvider.getNodeType(pTypeHash);
flowView._NodeTypeProvider.getNodeTypes();
flowView._NodeTypeProvider.getNodeTypeList();
flowView._NodeTypeProvider.getEnabledCards();
flowView._NodeTypeProvider.getCardsByCategory();
```

## registerNodeType

Register a node type configuration directly.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pNodeTypeConfig` | object | Node type configuration |

**Returns:** `boolean`

### Configuration Shape

```javascript
{
	Hash: 'FREAD',
	Label: 'File Read',
	DefaultWidth: 160,
	DefaultHeight: 70,
	TitleBarColor: '#2980b9',
	DefaultPorts:
	[
		{ Hash: null, Direction: 'input', Side: 'left', Label: 'Path', PortType: 'value' },
		{ Hash: null, Direction: 'output', Side: 'right', Label: 'Data', PortType: 'value' },
		{ Hash: null, Direction: 'output', Side: 'bottom', Label: 'Error', PortType: 'error' }
	],
	CardMetadata:
	{
		Name: 'File Read',
		Code: 'FREAD',
		Description: 'Read contents from a file path',
		Category: 'File I/O',
		Enabled: true
	}
}
```

## removeNodeType

Unregister a node type by hash.

**Returns:** `boolean`

## getNodeType

Retrieve a node type configuration by hash. Returns the default type if the hash is not found.

**Returns:** Node type configuration object.

## getNodeTypes

**Returns:** Map of all registered node types (hash -> config).

## getNodeTypeList

**Returns:** Array of registered type hash strings.

## getEnabledCards

**Returns:** Array of card configurations where `CardMetadata.Enabled` is `true`.

## getCardsByCategory

**Returns:** Object mapping category names to arrays of card configurations. Useful for building palette UIs.

## Examples

### Register a type directly

```javascript
flowView._NodeTypeProvider.registerNodeType(
	{
		Hash: 'FILTER',
		Label: 'Filter',
		DefaultWidth: 140,
		DefaultHeight: 60,
		TitleBarColor: '#9b59b6',
		DefaultPorts:
		[
			{ Hash: null, Direction: 'input', Side: 'left', Label: 'In' },
			{ Hash: null, Direction: 'output', Side: 'right', Label: 'Pass' },
			{ Hash: null, Direction: 'output', Side: 'bottom', Label: 'Reject' }
		],
		CardMetadata:
		{
			Code: 'FILTER',
			Category: 'Data',
			Enabled: true
		}
	});
```

### List all categories

```javascript
let tmpCategories = flowView._NodeTypeProvider.getCardsByCategory();

Object.keys(tmpCategories).forEach((pCategory) =>
{
	console.log(pCategory + ':');
	tmpCategories[pCategory].forEach((pCard) =>
	{
		console.log('  -', pCard.Label, '(' + pCard.Hash + ')');
	});
});
```

### Check if a type exists

```javascript
let tmpType = flowView._NodeTypeProvider.getNodeType('FREAD');
if (tmpType.Hash === 'FREAD')
{
	console.log('File Read type is registered');
}
```

### Remove a type at runtime

```javascript
flowView._NodeTypeProvider.removeNodeType('FREAD');
```

## See Also

- [PictFlowCard](PictFlowCard.md) -- Higher-level card class (recommended approach)
- [addNode](addNode.md) -- Create nodes from registered types
