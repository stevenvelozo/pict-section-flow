# screenToSVGCoords

Convert screen pixel coordinates (e.g. from a mouse event) to the SVG coordinate space used internally by the flow diagram. Accounts for the current pan offset and zoom level.

## Signature

```javascript
let tmpCoords = flowView.screenToSVGCoords(pScreenX, pScreenY);
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pScreenX` | number | Yes | X coordinate in screen pixels |
| `pScreenY` | number | Yes | Y coordinate in screen pixels |

## Returns

```javascript
{ x: 142.5, y: 87.3 }
```

An object with `x` and `y` properties in SVG coordinate space.

## Examples

### Place a node at the click position

```javascript
document.getElementById('flow-container').addEventListener('click', (pEvent) =>
{
	let tmpSVG = flowView.screenToSVGCoords(pEvent.clientX, pEvent.clientY);
	flowView.addNode('default', tmpSVG.x, tmpSVG.y, 'New Node');
});
```

### Context menu at cursor position

```javascript
document.getElementById('flow-container').addEventListener('contextmenu', (pEvent) =>
{
	pEvent.preventDefault();
	let tmpSVG = flowView.screenToSVGCoords(pEvent.clientX, pEvent.clientY);

	showContextMenu(pEvent.clientX, pEvent.clientY,
		{
			svgX: tmpSVG.x,
			svgY: tmpSVG.y
		});
});
```

### Debug coordinate output

```javascript
document.getElementById('flow-container').addEventListener('mousemove', (pEvent) =>
{
	let tmpSVG = flowView.screenToSVGCoords(pEvent.clientX, pEvent.clientY);
	document.getElementById('coords').textContent =
		'SVG: (' + Math.round(tmpSVG.x) + ', ' + Math.round(tmpSVG.y) + ')';
});
```

## See Also

- [setZoom](setZoom.md) — Viewport zoom (affects coordinate mapping)
- [addNode](addNode.md) — Create nodes at specific coordinates
