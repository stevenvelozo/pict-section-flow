# removeConnection

Delete a connection from the flow canvas.

## Signature

```javascript
flowView.removeConnection(pConnectionHash)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pConnectionHash` | string | Yes | Hash of the connection to remove |

## Returns

`boolean` — `true` if the connection was found and removed, `false` otherwise.

## Events Fired

- `onConnectionRemoved` — with the removed connection object
- `onFlowChanged` — with the updated flow data

## Examples

### Basic removal

```javascript
let tmpConn = flowView.addConnection(
	tmpA.Hash, tmpOutPort.Hash,
	tmpB.Hash, tmpInPort.Hash
);

flowView.removeConnection(tmpConn.Hash);
```

### Remove all connections for a specific node

```javascript
let tmpFlowData = flowView.getFlowData();
let tmpTargetHash = myNode.Hash;

tmpFlowData.Connections.forEach((pConn) =>
{
	if (pConn.SourceNodeHash === tmpTargetHash || pConn.TargetNodeHash === tmpTargetHash)
	{
		flowView.removeConnection(pConn.Hash);
	}
});
```

## See Also

- [addConnection](addConnection.md) — Create a connection
- [removeNode](removeNode.md) — Remove a node (cascades connections)
