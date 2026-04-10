# PictFlowCardPropertiesPanel

Base class for flow card property panels. Extend this class to create custom panel types beyond the four built-in types (Template, Markdown, Form, View).

## Import

```javascript
const libPictFlowCardPropertiesPanel = require('pict-section-flow').PictFlowCardPropertiesPanel;
```

## Constructor

```javascript
class MyPanel extends libPictFlowCardPropertiesPanel
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, Object.assign({},
			{
				PanelType: 'Custom',
				Title: 'My Panel',
				Width: 300,
				Height: 200,
				Configuration: {}
			}, pOptions), pServiceHash);
	}
}
```

## Configuration Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `PanelType` | string | `'Base'` | Panel type identifier |
| `Title` | string | `'Properties'` | Panel title bar text |
| `Width` | number | `300` | Default width in pixels |
| `Height` | number | `200` | Default height in pixels |
| `Configuration` | object | `{}` | Panel-type-specific config |

## Methods to Override

### render(pContainer, pNodeData)

Render the panel's content into a DOM container element. Subclasses **must** override this.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pContainer` | HTMLElement | The DOM element to render into |
| `pNodeData` | object | The node data object (has `.Data` property) |

### marshalToPanel(pNodeData)

Marshal data from the node's Data object into the panel UI. Called when the panel opens or when data changes externally.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pNodeData` | object | The node data object |

### marshalFromPanel(pNodeData)

Marshal data from the panel UI into the node's Data object. Called before saving or when the panel is about to close.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pNodeData` | object | The node data object to update |

### destroy()

Called when the panel is being closed. Clean up resources, event listeners, etc.

## Internal Properties

| Property | Type | Description |
|----------|------|-------------|
| `this._FlowView` | PictViewFlow | Reference to the flow view (set when panel is activated) |
| `this._NodeData` | object | The node data this panel is operating on |
| `this._ContentContainer` | HTMLElement | The DOM container element |
| `this._Configuration` | object | Panel-type-specific configuration |

## Built-in Panel Types

### Template

Renders Pict templates inside the panel.

```javascript
{
	PanelType: 'Template',
	Configuration:
	{
		Templates:
		[
			{
				Hash: 'my-template',
				Template: '<div class="info">{~D:Record.Data.Label~}</div>'
			}
		],
		TemplateHash: 'my-template'
	}
}
```

### Markdown

Renders markdown content via `pict-section-content`.

```javascript
{
	PanelType: 'Markdown',
	Configuration:
	{
		Markdown: '## Help\nThis node reads a file from disk.\n\n**Inputs:** File path\n**Outputs:** File contents or error'
	}
}
```

### Form

Creates an ephemeral `pict-section-form` section.

```javascript
{
	PanelType: 'Form',
	Configuration:
	{
		Fields:
		[
			{ Name: 'FilePath', DataType: 'String' },
			{ Name: 'Encoding', DataType: 'String' },
			{ Name: 'MaxSize', DataType: 'Number' }
		]
	}
}
```

### View

Renders an existing registered Pict view inside the panel.

```javascript
{
	PanelType: 'View',
	Configuration:
	{
		ViewHash: 'my-custom-view'
	}
}
```

## Examples

### Custom chart panel

```javascript
class ChartPanel extends libPictFlowCardPropertiesPanel
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, Object.assign({},
			{
				PanelType: 'Chart',
				Title: 'Data Preview',
				Width: 400,
				Height: 300
			}, pOptions), pServiceHash);

		this._ChartInstance = null;
	}

	render(pContainer, pNodeData)
	{
		super.render(pContainer, pNodeData);

		let tmpCanvas = document.createElement('canvas');
		tmpCanvas.width = 380;
		tmpCanvas.height = 260;
		pContainer.appendChild(tmpCanvas);

		// Create chart from node data
		this._ChartInstance = new Chart(tmpCanvas,
			{
				type: 'line',
				data: pNodeData.Data.ChartData || { labels: [], datasets: [] }
			});
	}

	marshalToPanel(pNodeData)
	{
		super.marshalToPanel(pNodeData);
		if (this._ChartInstance && pNodeData.Data.ChartData)
		{
			this._ChartInstance.data = pNodeData.Data.ChartData;
			this._ChartInstance.update();
		}
	}

	destroy()
	{
		if (this._ChartInstance)
		{
			this._ChartInstance.destroy();
			this._ChartInstance = null;
		}
		super.destroy();
	}
}
```

### Using a custom panel in a card

```javascript
class DataPreviewCard extends libPictFlowCard
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, Object.assign({},
			{
				Title: 'Data Preview',
				Code: 'DPRV',
				PropertiesPanel:
				{
					PanelType: 'Chart',
					Title: 'Preview',
					DefaultWidth: 400,
					DefaultHeight: 300
				}
			}, pOptions), pServiceHash);
	}
}
```

## See Also

- [PictFlowCard](PictFlowCard.md) -- Define cards that use panels
- [openPanel / closePanel](openPanel.md) -- Panel lifecycle methods
