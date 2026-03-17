# Implementation Reference

Complete API reference for Pict-Section-Flow. This document covers every public method on the main `PictViewFlow` class and the key internal services and providers developers interact with.

## PictViewFlow — Main View API

The primary class exported by `pict-section-flow`. Extends `pict-view`.

### Configuration

```javascript
const libPictSectionFlow = require('pict-section-flow');

_Pict.addView('MyFlow',
	{
		ViewIdentifier: 'Pict-Flow',
		DefaultDestinationAddress: '#flow-container',
		FlowDataAddress: 'AppData.MyFlow',

		EnableToolbar: true,
		EnablePanning: true,
		EnableZooming: true,
		EnableNodeDragging: true,
		EnableConnectionCreation: true,
		EnableGridSnap: false,
		GridSnapSize: 20,

		MinZoom: 0.1,
		MaxZoom: 5.0,
		ZoomStep: 0.1,

		DefaultNodeType: 'default',
		DefaultNodeWidth: 180,
		DefaultNodeHeight: 80,

		Theme: 'default'
	},
	libPictSectionFlow);
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ViewIdentifier` | string | `'Pict-Flow'` | Unique identifier for debugging and DOM IDs |
| `DefaultDestinationAddress` | string | `'#Flow-Container'` | CSS selector for the container element |
| `FlowDataAddress` | string/false | `false` | AppData path for two-way binding |
| `EnableToolbar` | boolean | `true` | Show the toolbar UI |
| `EnablePanning` | boolean | `true` | Allow canvas panning |
| `EnableZooming` | boolean | `true` | Allow canvas zooming |
| `EnableNodeDragging` | boolean | `true` | Allow node repositioning |
| `EnableConnectionCreation` | boolean | `true` | Allow creating port-to-port connections |
| `EnableGridSnap` | boolean | `false` | Snap node positions to grid |
| `GridSnapSize` | number | `20` | Grid cell size in pixels |
| `MinZoom` | number | `0.1` | Minimum zoom level |
| `MaxZoom` | number | `5.0` | Maximum zoom level |
| `ZoomStep` | number | `0.1` | Zoom increment per scroll tick |
| `DefaultNodeType` | string | `'default'` | Node type when none specified |
| `DefaultNodeWidth` | number | `180` | Default node width in pixels |
| `DefaultNodeHeight` | number | `80` | Default node height in pixels |
| `Theme` | string | `'default'` | Active theme key |

---

## Data Management Methods

### addNode(pType, pX, pY, pTitle, pData)

Create a new node on the canvas.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pType` | string | Node type key (e.g. `'start'`, `'default'`, or a custom card code) |
| `pX` | number | X coordinate in SVG space |
| `pY` | number | Y coordinate in SVG space |
| `pTitle` | string | Display title |
| `pData` | object | Optional custom data attached to the node |

**Returns:** Node object with `Hash`, `Ports`, `Type`, etc.

### removeNode(pNodeHash)

Delete a node and all its connections.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pNodeHash` | string | Hash of the node to remove |

**Returns:** `boolean` — `true` if the node was found and removed.

### addConnection(pSourceNode, pSourcePort, pTargetNode, pTargetPort, pData)

Connect two ports.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pSourceNode` | string | Source node hash |
| `pSourcePort` | string | Source port hash |
| `pTargetNode` | string | Target node hash |
| `pTargetPort` | string | Target port hash |
| `pData` | object | Optional connection data (e.g. `{ LineMode: 'orthogonal' }`) |

**Returns:** Connection object, or `false` if validation failed.

### removeConnection(pConnectionHash)

Delete a connection.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pConnectionHash` | string | Hash of the connection to remove |

**Returns:** `boolean` — `true` if the connection was found and removed.

### getFlowData()

Get a deep clone of the complete flow state.

**Returns:** `{ Nodes, Connections, OpenPanels, SavedLayouts, ViewState }`

### setFlowData(pFlowData)

Replace the entire flow state and re-render.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pFlowData` | object | Complete flow data structure |

### getNode(pNodeHash)

Retrieve a node object by hash.

**Returns:** Node object or `undefined`.

### getConnection(pConnectionHash)

Retrieve a connection object by hash.

**Returns:** Connection object or `undefined`.

### marshalToView()

Load flow data from the AppData address specified in `FlowDataAddress` and render.

### marshalFromView()

Write the current flow data back to the AppData address specified in `FlowDataAddress`.

---

## Selection Methods

### selectNode(pNodeHash)

Select a node. Pass `null` to deselect.

### selectConnection(pConnectionHash)

Select a connection. Pass `null` to deselect.

### selectTether(pPanelHash)

Select a tether line. Pass `null` to deselect.

### deselectAll()

Clear all selections (node, connection, and tether).

### deleteSelected()

Delete the currently selected node or connection.

**Returns:** `boolean` — `true` if something was deleted.

---

## Viewport Methods

### setZoom(pZoom, pFocusX, pFocusY)

Set the zoom level with an optional focus point.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pZoom` | number | Target zoom level (clamped to MinZoom..MaxZoom) |
| `pFocusX` | number | Optional X focus point in SVG space |
| `pFocusY` | number | Optional Y focus point in SVG space |

### zoomToFit()

Automatically adjust pan and zoom to fit all nodes in the viewport.

### updateViewportTransform()

Apply the current pan/zoom state to the SVG viewport group. Called automatically after pan/zoom changes.

### toggleFullscreen()

Toggle fullscreen overlay mode.

**Returns:** `boolean` — the new fullscreen state.

### exitFullscreen()

Exit fullscreen mode.

### screenToSVGCoords(pScreenX, pScreenY)

Convert screen pixel coordinates to SVG coordinate space.

**Returns:** `{ x, y }`

### autoLayout()

Run the topological auto-layout algorithm to arrange nodes automatically.

---

## Panel Methods

### openPanel(pNodeHash)

Open a properties panel for a node.

**Returns:** Panel data object, or `false` if the node has no panel configuration.

### closePanel(pPanelHash)

Close a panel by its hash.

**Returns:** `boolean`

### closePanelForNode(pNodeHash)

Close all panels associated with a node.

**Returns:** `boolean`

### togglePanel(pNodeHash)

Toggle a node's panel open or closed.

**Returns:** Panel data object or `false`.

### updatePanelPosition(pPanelHash, pX, pY)

Move a panel to new coordinates.

---

## Theming Methods

### setTheme(pThemeKey)

Switch to a registered theme and re-render.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pThemeKey` | string | Theme key (e.g. `'default'`, `'sketch'`, `'blueprint'`) |

### setNoiseLevel(pLevel)

Set the hand-drawn noise level.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pLevel` | number | 0 (precise) to 1 (wobbly) |

### getNoiseLevel()

**Returns:** Current noise level (number).

### getThemeKey()

**Returns:** Active theme key (string).

---

## Rendering Methods

### renderFlow()

Full re-render of all nodes, connections, panels, and tethers.

### updateNodePosition(pNodeHash, pX, pY)

Update a node's position during drag. Performs selective re-rendering of only the affected elements for smooth performance.

### getPortPosition(pNodeHash, pPortHash)

Get the absolute SVG coordinates of a port's center.

**Returns:** `{ x, y }`

---

## Connection Handle Methods

### updateConnectionHandle(pConnectionHash, pHandleType, pX, pY)

Update a bezier control point on a connection.

### addConnectionHandle(pConnectionHash, pX, pY)

Add a new control point to a connection.

### removeConnectionHandle(pConnectionHash, pIndex)

Remove a control point from a connection.

### updateTetherHandle(pPanelHash, pHandleType, pX, pY)

Update a bezier control point on a tether line.

---

## Internal Service Accessors

Developers access services and providers through underscore-prefixed properties on the flow view instance:

| Property | Service/Provider |
|----------|-----------------|
| `_DataManager` | Node and connection CRUD |
| `_RenderManager` | Rendering orchestration |
| `_SelectionManager` | Selection state |
| `_ViewportManager` | Pan, zoom, fullscreen |
| `_PanelManager` | Panel lifecycle |
| `_InteractionManager` | Event handling |
| `_LayoutService` | Grid snap, auto-layout |
| `_ConnectionRenderer` | Bezier/orthogonal drawing |
| `_NodeTypeProvider` | Node type registry |
| `_EventHandlerProvider` | Custom event hooks |
| `_LayoutProvider` | Layout persistence |
| `_ThemeProvider` | Theme system |
| `_CSSProvider` | CSS generation and injection |
| `_GeometryProvider` | Port positioning math |
| `_NoiseProvider` | Hand-drawn effects |
| `_SVGHelperProvider` | SVG DOM utilities |
| `_ConnectorShapesProvider` | Arrowhead marker definitions |
| `_IconProvider` | Icon templates |
| `_PanelChromeProvider` | Panel UI template |

---

## EventHandler Provider API

### registerHandler(pEventName, pHandler, pHandlerHash)

Register a callback for a named event.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pEventName` | string | Event name (see list below) |
| `pHandler` | function | Callback function |
| `pHandlerHash` | string | Optional unique identifier for removal |

**Returns:** Handler hash (string).

### removeHandler(pEventName, pHandlerHash)

Remove a previously registered handler.

**Returns:** `boolean`

### fireEvent(pEventName, pData)

Fire all handlers for a named event.

### Supported Events

| Event | Payload | Fired When |
|-------|---------|------------|
| `onNodeSelected` | Node object | A node is selected |
| `onNodeAdded` | Node object | A node is created |
| `onNodeRemoved` | Node object | A node is deleted |
| `onNodeMoved` | Node object | A node's position changes |
| `onConnectionSelected` | Connection object | A connection is selected |
| `onConnectionCreated` | Connection object | A connection is created |
| `onConnectionRemoved` | Connection object | A connection is deleted |
| `onConnectionHandleMoved` | Connection object | A bezier handle is dragged |
| `onConnectionModeChanged` | Connection object | Line mode switches (bezier/orthogonal) |
| `onPanelOpened` | Panel data | A properties panel opens |
| `onPanelClosed` | Panel data | A properties panel closes |
| `onPanelMoved` | Panel data | A panel is dragged |
| `onTetherSelected` | Panel data | A tether line is selected |
| `onTetherHandleMoved` | Panel data | A tether handle is dragged |
| `onTetherModeChanged` | Panel data | Tether mode switches |
| `onLayoutSaved` | Layout data | A layout is saved |
| `onLayoutRestored` | Layout data | A layout is restored |
| `onLayoutDeleted` | Layout data | A layout is deleted |
| `onFlowChanged` | Flow data | Any structural change to the flow |
| `onThemeChanged` | Theme key | The active theme changes |

---

## NodeTypes Provider API

### registerNodeType(pNodeTypeConfig)

Register a new node type.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pNodeTypeConfig` | object | Node type configuration (see PictFlowCard docs) |

**Returns:** `boolean`

### removeNodeType(pTypeHash)

Unregister a node type.

**Returns:** `boolean`

### getNodeType(pTypeHash)

Retrieve a node type configuration by hash.

**Returns:** Node type config object, or the default type if not found.

### getNodeTypes()

**Returns:** Map of all registered node types.

### getNodeTypeList()

**Returns:** Array of registered type hashes.

### getEnabledCards()

**Returns:** Array of card configurations where `Enabled` is `true`.

### getCardsByCategory()

**Returns:** Object mapping category names to arrays of card configurations.

---

## Theme Provider API

### registerTheme(pThemeKey, pThemeConfig)

Register a named theme.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pThemeKey` | string | Unique theme identifier |
| `pThemeConfig` | object | Theme configuration (see below) |

**Theme config shape:**

```javascript
{
	Key: 'dark',
	Label: 'Dark Mode',
	CSSVariables:
	{
		'--pf-canvas-bg': '#1a1a2e',
		'--pf-node-body-fill': '#16213e'
	},
	AdditionalCSS: '/* Extra rules */',
	NodeBodyMode: 'rect',
	NoiseConfig: { Enabled: true, Amount: 0.5 },
	ConnectionConfig: { StrokeDashArray: '5,5' }
}
```

### setTheme(pThemeKey)

Activate a registered theme and re-render.

**Returns:** `boolean` — `true` if the theme was found and activated.

### getActiveTheme()

**Returns:** Active theme configuration object.

### getActiveThemeKey()

**Returns:** Active theme key string.

### Built-in Themes

| Key | Label | Style |
|-----|-------|-------|
| `default` | Modern | Clean, professional |
| `sketch` | Sketch | Hand-drawn, informal |
| `blueprint` | Blueprint | Technical blueprint |
| `mono` | Monochrome | Black and white |
| `retro-80s` | Retro 80s | Neon retro |
| `retro-90s` | Retro 90s | Vaporwave |

---

## Layouts Provider API

### saveLayout(pName)

Save the current spatial arrangement.

**Returns:** Layout data object.

### restoreLayout(pLayoutHash)

Restore a previously saved layout.

**Returns:** `boolean`

### deleteLayout(pLayoutHash)

Delete a saved layout.

**Returns:** `boolean`

### loadPersistedLayouts()

Load layouts from the storage backend (localStorage by default).

### getLayouts()

**Returns:** Array of saved layout objects.

### Storage Hooks

Override these methods to use a custom storage backend:

| Method | Signature | Description |
|--------|-----------|-------------|
| `storageWrite` | `(pLayouts, fCallback)` | Persist layouts |
| `storageRead` | `(fCallback)` | Load layouts |
| `storageDelete` | `(fCallback)` | Clear all layouts |
