# setZoom / zoomToFit

Control the viewport zoom level. `setZoom` sets an explicit zoom value with an optional focus point. `zoomToFit` automatically adjusts pan and zoom to frame all nodes in the viewport.

## Signatures

```javascript
flowView.setZoom(pZoom, pFocusX, pFocusY);
flowView.zoomToFit();
```

## setZoom

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pZoom` | number | Yes | Target zoom level (clamped to `MinZoom`..`MaxZoom`) |
| `pFocusX` | number | No | X coordinate in SVG space to zoom toward |
| `pFocusY` | number | No | Y coordinate in SVG space to zoom toward |

## zoomToFit

No parameters. Calculates the bounding box of all nodes and adjusts pan/zoom to fit them in the visible viewport with padding.

## Examples

### Set a specific zoom level

```javascript
// Zoom to 150%
flowView.setZoom(1.5);

// Zoom to 50% focused on a specific point
flowView.setZoom(0.5, 300, 200);
```

### Zoom to fit after loading data

```javascript
flowView.setFlowData(savedFlowData);
flowView.zoomToFit();
```

### Zoom controls

```javascript
document.getElementById('zoom-in').addEventListener('click', () =>
{
	let tmpCurrent = flowView.getFlowData().ViewState.Zoom;
	flowView.setZoom(tmpCurrent + 0.1);
});

document.getElementById('zoom-out').addEventListener('click', () =>
{
	let tmpCurrent = flowView.getFlowData().ViewState.Zoom;
	flowView.setZoom(tmpCurrent - 0.1);
});

document.getElementById('zoom-fit').addEventListener('click', () =>
{
	flowView.zoomToFit();
});
```

### Zoom to a specific node

```javascript
function zoomToNode(pFlowView, pNodeHash, pZoomLevel)
{
	let tmpNode = pFlowView.getNode(pNodeHash);
	if (tmpNode)
	{
		let tmpCenterX = tmpNode.X + (tmpNode.Width / 2);
		let tmpCenterY = tmpNode.Y + (tmpNode.Height / 2);
		pFlowView.setZoom(pZoomLevel || 1.5, tmpCenterX, tmpCenterY);
	}
}

zoomToNode(flowView, myNode.Hash, 2.0);
```

## Configuration

Zoom bounds are set in the view configuration:

```javascript
{
	MinZoom: 0.1,
	MaxZoom: 5.0,
	ZoomStep: 0.1
}
```

## See Also

- [screenToSVGCoords](screenToSVGCoords.md) — Coordinate conversion
- [toggleFullscreen](toggleFullscreen.md) — Fullscreen mode
- [autoLayout](autoLayout.md) — Automatic node arrangement
