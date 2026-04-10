# marshalToView / marshalFromView

Two-way data binding between the flow view and Pict's `AppData` store. Requires the `FlowDataAddress` configuration option to be set.

## Signatures

```javascript
flowView.marshalToView();
flowView.marshalFromView();
```

## marshalToView

Load flow data from the AppData address specified in `FlowDataAddress` into the view and render it.

This is the "pull" direction: AppData -> Flow View.

## marshalFromView

Write the current flow data back to the AppData address specified in `FlowDataAddress`.

This is the "push" direction: Flow View -> AppData.

## Configuration

Set `FlowDataAddress` when registering the view:

```javascript
_Pict.addView('MyFlow',
	{
		FlowDataAddress: 'AppData.Workflows.MainFlow'
	},
	libPictSectionFlow);
```

## Examples

### Load from AppData on initialization

```javascript
// Set up initial data in AppData
_Pict.AppData.Workflows =
{
	MainFlow:
	{
		Nodes:
		[
			{
				Hash: 'node-1',
				Type: 'start',
				X: 50, Y: 100,
				Width: 140, Height: 80,
				Title: 'Entry',
				Ports:
				[
					{ Hash: 'port-1', Direction: 'output', Side: 'right', Label: 'Out' }
				],
				Data: {}
			}
		],
		Connections: [],
		OpenPanels: [],
		SavedLayouts: [],
		ViewState: { PanX: 0, PanY: 0, Zoom: 1 }
	}
};

// The flow view pulls this data on render
let tmpFlowView = _Pict.views.MyFlow;
tmpFlowView.marshalToView();
```

### Push changes back to AppData

```javascript
// After the user edits the flow, persist to AppData
tmpFlowView.marshalFromView();

// Now AppData.Workflows.MainFlow reflects the current flow state
console.log(_Pict.AppData.Workflows.MainFlow.Nodes.length);
```

### Auto-sync on flow changes

```javascript
tmpFlowView._EventHandlerProvider.registerHandler('onFlowChanged',
	() =>
	{
		tmpFlowView.marshalFromView();
	});
```

## See Also

- [getFlowData / setFlowData](getFlowData.md) -- Direct get/set without AppData
