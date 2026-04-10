# toggleFullscreen / exitFullscreen

Toggle the flow diagram into a fullscreen overlay that covers the entire browser viewport. Useful for maximizing workspace on complex flows.

## Signatures

```javascript
flowView.toggleFullscreen();
flowView.exitFullscreen();
```

## toggleFullscreen

Toggles between normal and fullscreen modes.

**Returns:** `boolean` -- the new fullscreen state (`true` if now fullscreen).

## exitFullscreen

Explicitly exits fullscreen mode if active.

## Examples

### Toggle button

```javascript
document.getElementById('fullscreen-btn').addEventListener('click', () =>
{
	let tmpIsFullscreen = flowView.toggleFullscreen();

	if (tmpIsFullscreen)
	{
		document.getElementById('fullscreen-btn').textContent = 'Exit Fullscreen';
	}
	else
	{
		document.getElementById('fullscreen-btn').textContent = 'Fullscreen';
	}
});
```

### Escape key to exit

```javascript
document.addEventListener('keydown', (pEvent) =>
{
	if (pEvent.key === 'Escape')
	{
		flowView.exitFullscreen();
	}
});
```

### Fullscreen with zoom-to-fit

```javascript
flowView.toggleFullscreen();

// Wait for the CSS transition, then fit content
setTimeout(() =>
{
	flowView.zoomToFit();
}, 300);
```

## See Also

- [setZoom / zoomToFit](setZoom.md) -- Viewport controls
