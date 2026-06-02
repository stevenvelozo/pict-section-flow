# Pict-Section-Flow

An interactive flow diagram section view for the [Pict](https://fable-retold.github.io/pict/) application framework. Build node-based visual editors, workflow designers, and data pipeline tools with a declarative, configuration-driven API.

Pict-Section-Flow provides a complete graph editing experience -- nodes, ports, connections, properties panels, theming, and layout persistence -- all composable through the Fable service provider pattern.

## What It Does

Pict-Section-Flow renders an SVG-based canvas where users can:

- **Drag nodes** from a palette onto the canvas
- **Connect ports** between nodes with bezier or orthogonal paths
- **Open properties panels** on any node for editing, documentation, or custom views
- **Pan and zoom** the viewport with mouse or trackpad
- **Save and restore** spatial layouts to localStorage or a remote backend
- **Theme the entire diagram** with built-in themes or CSS custom properties

All interaction is driven by a JSON data structure that represents the flow graph. The view marshals data bidirectionally with Pict's `AppData` store, so the flow state integrates naturally with the rest of your application.

## Architecture at a Glance

<!-- bespoke diagram: edit diagrams/architecture-at-a-glance.mmd or .hints.json, then: npx pict-renderer-graph build modules/pict/pict-section-flow/docs -->
![Architecture at a Glance](diagrams/architecture-at-a-glance.svg)

The module follows the standard Pict layered architecture:

- **Views** handle rendering and DOM interaction
- **Services** contain business logic (CRUD, selection, viewport math)
- **Providers** supply configuration and stateless utilities (themes, node types, geometry)

## Key Concepts

### Flow Data

The entire graph state lives in a single JSON object with four collections: `Nodes`, `Connections`, `OpenPanels`, and `SavedLayouts`. Every mutation goes through the `DataManager` service and triggers a re-render.

### Custom Card Types

Developers define reusable node types by extending `PictFlowCard`. Each card declares its title, ports, category, appearance, and optional properties panel. Cards register with the flow view's `NodeTypeProvider` and appear in the toolbar palette.

### Properties Panels

Nodes can open floating panels tethered to them by a line. Four built-in panel types cover common needs -- Template, Markdown, Form, and View -- or you can create custom panel types by extending `PictFlowCardPropertiesPanel`.

### Theming

Six built-in themes ship with the module. The theme system is CSS-variable-based: override any of 70+ `--pf-*` design tokens on `.pict-flow-container` to customize colors, shadows, radii, and typography without touching source code.

### Event Hooks

The `EventHandlerProvider` exposes 20+ named events (node selected, connection created, flow changed, theme changed, etc.). Register handlers to build integrations, undo/redo stacks, or server sync without modifying core code.

## Quick Example

```javascript
const libPictSectionFlow = require('pict-section-flow');
const libPict = require('pict');

let _Pict = new libPict({ Product: 'FlowDemo' });

_Pict.addView('MyFlow', {}, libPictSectionFlow);

let tmpFlow = _Pict.views.MyFlow;

// Add two nodes
let tmpStart = tmpFlow.addNode('start', 50, 150, 'Begin');
let tmpEnd = tmpFlow.addNode('end', 400, 150, 'Done');

// Connect them
tmpFlow.addConnection(
	tmpStart.Hash, tmpStart.Ports[0].Hash,
	tmpEnd.Hash, tmpEnd.Ports[0].Hash
);

// Listen for changes
tmpFlow._EventHandlerProvider.registerHandler('onFlowChanged',
	(pFlowData) =>
	{
		console.log('Flow updated:', pFlowData.Nodes.length, 'nodes');
	});
```

## Learn More

- **[Getting Started](Getting_Started.md)** -- Build your first flow diagram in five minutes
- **[Architecture](Architecture.md)** -- Detailed service/provider design with data flow diagrams
- **[Implementation Reference](Implementation_Reference.md)** -- Complete API surface for every service and provider
- **[Custom Styling](Custom-Styling.md)** -- CSS custom properties reference and theme API
- **[Layout Persistence](Layout_Persistence.md)** -- Save and restore layouts with localStorage or REST

## Ecosystem

Pict-Section-Flow is part of the [Retold](https://github.com/stevenvelozo/retold) module suite:

- [pict](https://fable-retold.github.io/pict/) -- Core MVC application framework
- [pict-view](https://fable-retold.github.io/pict-view/) -- View base class
- [pict-provider](https://fable-retold.github.io/pict-provider/) -- Provider base class
- [pict-section-form](https://fable-retold.github.io/pict-section-form/) -- Form sections (used for Form panel type)
- [fable](https://fable-retold.github.io/fable/) -- Service infrastructure and dependency injection

## License

MIT
