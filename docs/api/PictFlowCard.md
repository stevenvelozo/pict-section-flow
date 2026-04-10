# PictFlowCard

Base class for defining reusable flow diagram node types. Extend this class to create custom cards that appear in the toolbar palette. Each card declares its title, ports, category, appearance, and optional properties panel.

## Import

```javascript
const libPictFlowCard = require('pict-section-flow').PictFlowCard;
```

## Constructor

```javascript
class MyCard extends libPictFlowCard
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, Object.assign({},
			{
				Title: 'My Card',
				Code: 'MC',
				// ... options
			}, pOptions), pServiceHash);
	}
}
```

## Configuration Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Title` | string | `'Card'` | Display name on the node title bar |
| `Name` | string | `false` | Longer descriptive name |
| `Code` | string | `''` | Short identifier used as the node type key |
| `Description` | string | `false` | Brief explanation of the card's purpose |
| `Icon` | string | `false` | Icon identifier or emoji |
| `PreviewImage` | string | `false` | URL to a preview thumbnail |
| `Documentation` | string | `false` | URL or inline documentation text |
| `Tooltip` | string | `false` | Hover tooltip text |
| `Help` | string | `false` | HTML help content for the Help tab |
| `Category` | string | `'General'` | Palette grouping category |
| `Enabled` | boolean | `true` | Whether the card appears in the palette |
| `TitleBarColor` | string | `'#2c3e50'` | Title bar background color |
| `BodyStyle` | object | `{}` | SVG style attributes for the node body |
| `Width` | number | `180` | Default node width in pixels |
| `Height` | number | `80` | Default node height in pixels |

### Port Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Inputs` | array | `[]` | Input port definitions |
| `Outputs` | array | `[]` | Output port definitions |

Each port object:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Name` | string | Required | Port label |
| `Side` | string | `'left'`/`'right'` | Port side: `'left'`, `'right'`, `'top'`, `'bottom'` |
| `MinimumInputCount` | number | `0` | Minimum required connections (inputs only) |
| `MaximumInputCount` | number | `-1` | Maximum allowed connections (-1 = unlimited, inputs only) |
| `PortType` | string | -- | Type for styling: `'event'`, `'setting'`, `'value'`, `'error'` |
| `DataType` | string | -- | Semantic data type (for validation/display) |

### Label Display Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `ShowTypeLabel` | boolean | `true` | Show the type code badge on hover |
| `PortLabelsOnHover` | boolean | `false` | Only show port labels on hover |
| `PortLabelsVertical` | boolean | `false` | Render port labels vertically |
| `PortLabelPadding` | boolean | `false` | Extra spacing to avoid overlap |
| `PortLabelsOutside` | boolean | `false` | Render labels outside the node body |
| `LabelsInFront` | boolean | `true` | Labels render in front of body content |

### Properties Panel Configuration

| Property | Type | Description |
|----------|------|-------------|
| `PropertiesPanel.PanelType` | string | `'Template'`, `'Markdown'`, `'Form'`, or `'View'` |
| `PropertiesPanel.DefaultWidth` | number | Panel width in pixels |
| `PropertiesPanel.DefaultHeight` | number | Panel height in pixels |
| `PropertiesPanel.Title` | string | Panel title bar text |
| `PropertiesPanel.Configuration` | object | Panel-type-specific config |

### Body Content Configuration

| Property | Type | Description |
|----------|------|-------------|
| `BodyContent.ContentType` | string | `'svg'`, `'html'`, or `'canvas'` |
| `BodyContent.Template` | string | Pict template string |
| `BodyContent.TemplateHash` | string | Registered template hash (overrides Template) |
| `BodyContent.Templates` | array | Templates to auto-register: `[{ Hash, Template }]` |
| `BodyContent.RenderCallback` | function | Imperative render callback for canvas mode |
| `BodyContent.Padding` | number | Inner padding in pixels |

## Methods

### getNodeTypeConfiguration()

Generate the configuration object for the NodeTypes provider.

**Returns:** Node type configuration object.

### registerWithFlowView(pFlowView)

Register this card with a flow view's node type provider.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pFlowView` | PictViewFlow | The flow view instance |

**Returns:** `boolean` -- whether registration succeeded.

## Examples

### Minimal card

```javascript
class LogCard extends libPictFlowCard
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, Object.assign({},
			{
				Title: 'Log',
				Code: 'LOG',
				Inputs: [{ Name: 'Data', Side: 'left' }],
				Outputs: [{ Name: 'Pass', Side: 'right' }]
			}, pOptions), pServiceHash);
	}
}
```

### Card with typed ports and properties panel

```javascript
class IfThenElseCard extends libPictFlowCard
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, Object.assign({},
			{
				Title: 'If-Then-Else',
				Code: 'ITE',
				Category: 'Control Flow',
				Description: 'Route flow based on a boolean condition',
				TitleBarColor: '#e67e22',
				Width: 160,
				Height: 90,
				Inputs:
				[
					{ Name: 'Condition', Side: 'left', PortType: 'value' }
				],
				Outputs:
				[
					{ Name: 'Then', Side: 'right', PortType: 'event' },
					{ Name: 'Else', Side: 'bottom', PortType: 'error' }
				],
				PropertiesPanel:
				{
					PanelType: 'Markdown',
					Title: 'If-Then-Else',
					DefaultWidth: 280,
					DefaultHeight: 150,
					Configuration:
					{
						Markdown: '## Conditional Branch\nRoutes flow based on a boolean condition.'
					}
				}
			}, pOptions), pServiceHash);
	}
}
```

### Card with custom SVG body content

```javascript
class SparklineCard extends libPictFlowCard
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, Object.assign({},
			{
				Title: 'Sparkline',
				Code: 'SPARK',
				Category: 'Visualization',
				Width: 200,
				Height: 100,
				Inputs: [{ Name: 'Values', Side: 'left', PortType: 'value' }],
				BodyContent:
				{
					ContentType: 'svg',
					Template: '<polyline points="0,50 20,30 40,45 60,10 80,35 100,20" fill="none" stroke="#3498db" stroke-width="2" />'
				}
			}, pOptions), pServiceHash);
	}
}
```

### Registration

```javascript
let tmpCard = new IfThenElseCard(_Pict, {});
tmpCard.registerWithFlowView(flowView);

// The card now appears in the toolbar palette under "Control Flow"
// Users can drag it onto the canvas to create new ITE nodes
```

## See Also

- [registerNodeType](registerNodeType.md) -- Register types directly without PictFlowCard
- [PictFlowCardPropertiesPanel](PictFlowCardPropertiesPanel.md) -- Custom panel types
- [addNode](addNode.md) -- Create nodes from registered types
