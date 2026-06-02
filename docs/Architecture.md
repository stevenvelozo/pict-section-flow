# Architecture

Pict-Section-Flow follows the standard Pict layered architecture -- Views for rendering, Services for business logic, and Providers for configuration and stateless utilities. All components register with a Fable instance through the service provider pattern.

## High-Level Design

<!-- bespoke diagram: edit diagrams/high-level-design.mmd or .hints.json, then: npx pict-renderer-graph build modules/pict/pict-section-flow/docs -->
![High-Level Design](diagrams/high-level-design.svg)

## Data Flow

All mutations flow through a predictable pipeline:

<!-- bespoke diagram: edit diagrams/data-flow.mmd or .hints.json, then: npx pict-renderer-graph build modules/pict/pict-section-flow/docs -->
![Data Flow](diagrams/data-flow.svg)

## SVG Layer Structure

The rendering system uses SVG group elements in a specific z-order:

<!-- bespoke diagram: edit diagrams/svg-layer-structure.mmd or .hints.json, then: npx pict-renderer-graph build modules/pict/pict-section-flow/docs -->
![SVG Layer Structure](diagrams/svg-layer-structure.svg)

Connections render behind nodes so lines do not obscure node bodies. Tethers render above nodes so the connecting line from a panel to its node is always visible. Panels render last so they float above everything.

## Component Roles

### Views

| View | Role |
|------|------|
| `PictViewFlow` | Main entry point. Orchestrates services, providers, and child views. Exposes the public API. |
| `PictViewFlowNode` | Renders individual node SVG groups (title bar, body, ports, labels). |
| `PictViewFlowToolbar` | Renders the docked toolbar with palette cards, zoom controls, and layout buttons. |
| `PictViewFlowFloatingToolbar` | Renders context-sensitive floating toolbar on node selection. |
| `PictViewFlowPropertiesPanel` | Renders panel chrome and delegates content to panel type handlers. |

### Services

| Service | Role |
|---------|------|
| `DataManager` | CRUD for nodes and connections. Marshals to/from AppData. Fires data events. |
| `RenderManager` | Orchestrates full and partial re-renders. Delegates to node, connection, and panel renderers. |
| `SelectionManager` | Tracks selected node, connection, or tether. Fires selection events. |
| `ViewportManager` | Pan, zoom, fullscreen, coordinate transforms. |
| `PanelManager` | Open, close, toggle, and position properties panels. |
| `InteractionManager` | Pointer and keyboard event handling. State machine for drag modes. |
| `Layout Service` | Grid snap math and topological auto-layout algorithm. |
| `ConnectionRenderer` | Renders bezier and orthogonal paths with arrowheads. |
| `PathGenerator` | Pure math: bezier curves and orthogonal routing. |
| `PortRenderer` | Renders port circles on node boundaries. |
| `ConnectionHandleManager` | Manages bezier control point state for manual path adjustments. |
| `Tether` | Renders the connecting lines between panels and their parent nodes. |

### Providers

| Provider | Role |
|----------|------|
| `NodeTypes` | Registry of available node types. Cards register here. |
| `EventHandler` | Named event system with multi-handler support. |
| `Layouts` | Save/restore/delete layout snapshots. Pluggable storage backend. |
| `Theme` | Named theme registry. Applies CSS variable overrides. |
| `CSS` | Generates and injects all CSS into Pict's CSSMap service. |
| `Geometry` | Port positioning math: local coordinates, minimum node height, port counts by side. |
| `Noise` | Perlin-like noise for the hand-drawn rendering effect. |
| `SVGHelpers` | DOM utilities for creating and manipulating SVG elements. |
| `ConnectorShapes` | SVG marker definitions for arrowheads by port type. |
| `Icons` | Icon template library for toolbar and node UI. |
| `PanelChrome` | Panel title bar and tab bar template generation. |

## Flow Data Structure

The canonical flow state is a plain JavaScript object:

```javascript
{
	Nodes:
	[
		{
			Hash: 'node-<UUID>',
			Type: 'start',
			X: 50, Y: 180,
			Width: 140, Height: 80,
			Title: 'Start',
			Ports:
			[
				{
					Hash: 'port-<UUID>',
					Direction: 'output',
					Side: 'right',
					Label: 'Out',
					PortType: 'event'
				}
			],
			Data: {}
		}
	],

	Connections:
	[
		{
			Hash: 'conn-<UUID>',
			SourceNodeHash: 'node-...',
			SourcePortHash: 'port-...',
			TargetNodeHash: 'node-...',
			TargetPortHash: 'port-...',
			Data:
			{
				LineMode: 'bezier',
				HandleCustomized: false
			}
		}
	],

	OpenPanels:
	[
		{
			Hash: 'panel-<UUID>',
			NodeHash: 'node-...',
			PanelType: 'Template',
			Title: 'Properties',
			X: 300, Y: 250,
			Width: 300, Height: 200
		}
	],

	SavedLayouts: [],

	ViewState:
	{
		PanX: 0, PanY: 0,
		Zoom: 1,
		SelectedNodeHash: null,
		SelectedConnectionHash: null,
		SelectedTetherHash: null
	}
}
```

## Service Initialization Sequence

When PictViewFlow initializes, it follows a declarative registry to instantiate all components:

<!-- bespoke diagram: edit diagrams/service-initialization-sequence.mmd or .hints.json, then: npx pict-renderer-graph build modules/pict/pict-section-flow/docs -->
![Service Initialization Sequence](diagrams/service-initialization-sequence.svg)

## Design Patterns

### Service Provider Pattern

Every service and provider extends `fable-serviceproviderbase` and registers with the Fable instance. This means any component can access any other through `this.fable` without explicit imports or singletons.

### Event-Driven Architecture

The `EventHandlerProvider` decouples application code from the flow internals. Services fire events; application code registers handlers. This avoids subclassing or monkey-patching to extend behavior.

### Data/View Separation

The flow data structure is completely separate from the SVG DOM. Mutations operate on the data model; the render manager regenerates the DOM from the model. This makes serialization, undo/redo, and server sync straightforward.

### Selective Re-rendering

Full re-renders are used when the graph topology changes (node added/removed, connection added/removed). During interactive operations like node dragging, only the affected elements (the dragged node and its connections) are updated for smooth performance.
