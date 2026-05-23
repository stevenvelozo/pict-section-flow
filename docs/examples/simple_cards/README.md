# Simple Cards — Every Flow Card Type, Every Panel Type

<!-- docuserve:example-launch:start -->
> **[&#9654; Launch the live app](examples/simple%5Fcards/index.html)** — runs in your browser, opens in a new tab.
<!-- docuserve:example-launch:end -->

Simple Cards is the **reference example** for `pict-section-flow`. It
defines twelve custom card classes covering every category
(control flow, I/O, data, debug, monitoring, visualization), wires
them into a single Pict application with `pict-section-form`-driven
properties panels, ships a curated catalog of sample flows that
exercise each layout algorithm, and provides a fully-functional
multi-page shell (Home / About / Documentation) around the canvas.

If you are looking for "what does a card class look like?" — read
`source/cards/`. If you are looking for "how do I host the flow
view inside an application?" — read
`source/views/PictView-FlowExample-MainWorkspace.js`. If you are
looking for "what does a real seed graph look like?" — see
`source/Pict-Application-FlowExample.js`, which inlines a 16-node
flow with every card type, every panel type, and an error branch.

## What it demonstrates

| Capability | Where you see it |
|------------|------------------|
| Custom `PictFlowCard` subclasses | `source/cards/FlowCard-*.js` — 12 cards across 6 categories |
| Properties panel type: `Markdown` | If-Then-Else card — static markdown blurb |
| Properties panel type: `Template` | Log Values card — `pict-template` over `Record.Data.*` |
| Properties panel type: `Form` | Set Value card — full `pict-section-form` manifest inside the panel |
| Properties panel type: `View` | File Write card — host-registered Pict view rendered into the panel |
| `BodyContent` rendering type: SVG | Status Monitor card — inline SVG circles + labels |
| `BodyContent` rendering type: HTML | Data Preview / Note cards — HTML table / multi-line text |
| `BodyContent` rendering type: Canvas | Sparkline card — `RenderCallback(canvas, ...)` paints a 2D chart |
| Pre-registered node types | `NodeTypes: this._buildFlowCardNodeTypes()` — toolbar palette ready on first render |
| Seed flow data on `AppData` | `AppData.FlowExample.SampleFlow` — 16 nodes, 18 connections, an error branch |
| Sample-graph catalog + layout algorithm hint | Dropdown above the canvas; each sample suggests a `Recommended` layout |
| Multi-page routing inside the shell | `pict-router` with `/Home`, `/About`, `/Documentation` routes |
| `LayoutAlgorithm` driven re-layout | `setFlowData(...)` carries `LayoutAlgorithm`; the toolbar's Algorithm popup compares them live |
| Help overlay for the canvas | "?" button toggles a CSS-grid hint panel with 8 cards covering Add / Connect / Pan etc. |

## Key files

- `source/Pict-Application-FlowExample.js` — application class.
  Registers the router + every page view, declares the seed
  `SampleFlow` with one of every card type, and exposes
  `navigateTo()` / `showView()` for the router callbacks.
- `source/Pict-Application-FlowExample-Configuration.json` — Pict
  config: product name, main viewport, auto-render flags.
- `source/providers/PictRouter-FlowExample-Configuration.json` —
  route map. Each route's `template` calls into
  `Pict.PictApplication.showView('FlowExample-...')`.
- `source/views/PictView-FlowExample-Layout.js` — top-level shell.
  Renders the topbar, content, and bottombar containers, then
  resolves the router so the current hash lands on the right page.
- `source/views/PictView-FlowExample-TopBar.js` /
  `PictView-FlowExample-BottomBar.js` — branded chrome views with
  inline navigation links.
- `source/views/PictView-FlowExample-MainWorkspace.js` — the page
  that hosts the flow canvas. Builds the FlowCard node type map,
  instantiates the flow view, wires the help toggle and the
  sample-graph selector.
- `source/views/PictView-FlowExample-About.js` /
  `PictView-FlowExample-Documentation.js` — the two other pages.
- `source/views/PictView-FlowExample-FileWriteInfo.js` — the host
  view that the File Write card's `View`-type panel renders.
- `source/cards/FlowCard-*.js` — twelve card classes. Each is
  one file, each extends `pict-section-flow.PictFlowCard`.
- `source/sample-flows.js` — the curated catalog of sample graphs
  that the dropdown above the canvas exposes.

## The seed flow

`AppData.FlowExample.SampleFlow` is a complete `_FlowData` object
declared inline in `onAfterInitializeAsync`. It is the "Hello World"
the canvas opens to:

```js
this.pict.AppData.FlowExample.SampleFlow =
{
    Nodes:
    [
        { Hash: 'node-start', Type: 'start', X: 50, Y: 180, Width: 140, Height: 80, Title: 'Start',
          Ports: [ { Hash: 'port-start-out', Direction: 'output', Side: 'right', Label: 'Out' } ], Data: {} },
        { Hash: 'node-fread', Type: 'FREAD', /* ... */ },
        { Hash: 'node-check', Type: 'ITE', /* ... */ },
        { Hash: 'node-each',  Type: 'EACH', /* ... */ },
        { Hash: 'node-get',   Type: 'GET',  /* ... */ },
        { Hash: 'node-set',   Type: 'SET',  /* ... */ },
        { Hash: 'node-switch', Type: 'SW',  /* ... */ },
        { Hash: 'node-log',    Type: 'LOG', /* ... */ },
        { Hash: 'node-fwrite', Type: 'FWRITE', /* ... */ },
        { Hash: 'node-end',    Type: 'end', /* ... */ },
        /* error branch: node-log-err, node-halt */
        /* body-content showcase: node-status, node-preview, node-spark, node-comment */
    ],
    Connections: [ /* 18 edges including an error branch */ ],
    ViewState: { PanX: 0, PanY: 0, Zoom: 1, SelectedNodeHash: null, SelectedConnectionHash: null }
};
```

Every node references a card type by its `Code` (`FREAD`, `ITE`,
etc.); the host registers the card classes in the workspace view so
the flow view's `NodeTypeProvider` knows how to paint them.

---

## Feature 1 — Defining a custom card class

A custom card is a `PictFlowCard` subclass. The constructor passes
its declarative configuration into the parent class — title,
description, ports, sizing, colors, optional panel, optional body
content. Here is the If-Then-Else card in full:

```js
const libPictFlowCard = require('pict-section-flow').PictFlowCard;
const libCardHelp = require('../card-help-content');

class FlowCardIfThenElse extends libPictFlowCard
{
    constructor(pFable, pOptions, pServiceHash)
    {
        super(pFable, Object.assign(
            {},
            {
                Title: 'If-Then-Else',
                Name: 'Conditional Branch',
                Code: 'ITE',
                Description: 'Evaluates a condition and routes to the Then or Else branch.',
                Help: libCardHelp['ITE'] || false,
                Icon: 'ITE',
                Tooltip: 'If-Then-Else: Routes flow based on a boolean condition',
                Category: 'Control Flow',
                TitleBarColor: '#e67e22',
                BodyStyle: { fill: '#fef5e7', stroke: '#e67e22' },
                Width: 200,
                Height: 100,
                Inputs:  [ { Name: 'In', Side: 'left', MinimumInputCount: 1, MaximumInputCount: 1 } ],
                Outputs: [ { Name: 'Then', Side: 'right' }, { Name: 'Else', Side: 'bottom' } ],
                PropertiesPanel:
                {
                    PanelType: 'Markdown',
                    DefaultWidth: 300,
                    DefaultHeight: 200,
                    Title: 'If-Then-Else Info',
                    Configuration: { Markdown: '## Conditional Branch\n\nEvaluates a **boolean condition**...' }
                }
            },
            pOptions),
            pServiceHash);
    }
}

module.exports = FlowCardIfThenElse;
```

`Code` is the wire-shape identifier — what each node in the flow
data carries as its `Type`. `Category` groups the card in the
toolbar palette. `Inputs` and `Outputs` declare port slots with
their side (top/right/bottom/left) and cardinality
(`MinimumInputCount` / `MaximumInputCount`; `-1` means unbounded).
The `Help` block (lazy-loaded from `card-help-content.js`) is the
content for the per-card help drawer.

This is the entire card. Twelve such files cover the example.

---

## Feature 2 — Pre-registered node types

The host workspace view builds a `NodeTypes` map by instantiating
each card class once, calling its `getNodeTypeConfiguration()`, and
keying the resulting config by its `Hash`. The map is then handed
to the flow view at registration time:

```js
_buildFlowCardNodeTypes()
{
    let tmpCardClasses =
    [
        libFlowCardIfThenElse, libFlowCardSwitch, libFlowCardEach,
        libFlowCardFileRead,   libFlowCardFileWrite,
        libFlowCardLogValues,  libFlowCardSetValue, libFlowCardGetValue,
        libFlowCardStatusMonitor, libFlowCardDataPreview,
        libFlowCardSparkline,  libFlowCardComment
    ];

    let tmpNodeTypes = {};
    for (let i = 0; i < tmpCardClasses.length; i++)
    {
        let tmpCard = new tmpCardClasses[i](this.fable, {}, `FlowCard-${i}`);
        let tmpConfig = tmpCard.getNodeTypeConfiguration();
        tmpNodeTypes[tmpConfig.Hash] = tmpConfig;
    }
    return tmpNodeTypes;
}
```

The flow view receives `NodeTypes` as part of its options, which
means the `NodeTypeProvider` is fully populated **before the
toolbar renders**. Without pre-registration, the toolbar palette
would show an empty list on first paint and fill in only after a
later `registerNodeType(...)` call — visible flicker, no benefit.

```js
this._FlowView = this.pict.addView('FlowExample-FlowDiagram',
    {
        ViewIdentifier: 'FlowExample-FlowDiagram',
        FlowDataAddress: 'AppData.FlowExample.SampleFlow',
        TargetElementAddress: '#Flow-SVG-Container',
        EnableToolbar: true, EnablePanning: true, EnableZooming: true,
        EnableNodeDragging: true, EnableConnectionCreation: true,
        EnableGridSnap: false, GridSnapSize: 20,
        MinZoom: 0.1, MaxZoom: 5.0, ZoomStep: 0.1,
        DefaultNodeType: 'default', DefaultNodeWidth: 180, DefaultNodeHeight: 80,
        NodeTypes: this._buildFlowCardNodeTypes(),
        /* Renderables ... */
    },
    libPictSectionFlow
);
```

`FlowDataAddress` points at the AppData slot the seed flow lives
in; the flow view two-way binds against it. Mutations from the
canvas (drag a node, draw a connection, delete an edge) write
back; mutations from the host (`setFlowData(...)`) re-render.

---

## Feature 3 — Properties panel types: Markdown, Template, Form, View

The four built-in `PropertiesPanel.PanelType` values cover most of
what a node-editing UI needs. The example demonstrates one of
each:

**Markdown** (If-Then-Else card):

```js
PropertiesPanel:
{
    PanelType: 'Markdown',
    DefaultWidth: 300, DefaultHeight: 200,
    Title: 'If-Then-Else Info',
    Configuration: { Markdown: '## Conditional Branch\n\nEvaluates a **boolean condition**...' }
}
```

Static documentation with markdown rendering. No data binding;
read-only.

**Template** (Log Values card):

```js
PropertiesPanel:
{
    PanelType: 'Template',
    DefaultWidth: 260, DefaultHeight: 140,
    Title: 'Log Settings',
    Configuration:
    {
        Templates:
        [
            {
                Hash: 'flow-card-log-panel',
                Template: '<div style="padding:4px"><label style="font-size:11px;color:#7f8c8d">Log Level</label>' +
                          '<div style="font-size:12px;padding:4px 0">{~D:Record.Data.LogLevel~}</div>' +
                          '<label style="font-size:11px;color:#7f8c8d">Format</label>' +
                          '<div style="font-size:12px;padding:4px 0">{~D:Record.Data.Format~}</div></div>'
            }
        ],
        TemplateHash: 'flow-card-log-panel'
    }
}
```

`pict-template` syntax — `{~D:Record.Data.LogLevel~}` resolves
against the node's `Data` block. Read-only viewer surfaced from a
template hash; ideal for showing computed or formatted state.

**Form** (Set Value card):

```js
PropertiesPanel:
{
    PanelType: 'Form',
    DefaultWidth: 320, DefaultHeight: 200,
    Title: 'Set Value Properties',
    Configuration:
    {
        Manifest:
        {
            Scope: 'FlowCardSetValue',
            Sections: [ { Name: 'Value Assignment', Hash: 'SetValueSection',
                          Groups: [ { Name: 'Settings', Hash: 'SetValueGroup' } ] } ],
            Descriptors:
            {
                'Record.Data.VariableName':
                {
                    Name: 'Variable Name', Hash: 'VariableName', DataType: 'String', Default: '',
                    PictForm: { Section: 'SetValueSection', Group: 'SetValueGroup', Row: 1, Width: 12 }
                },
                'Record.Data.Expression':
                {
                    Name: 'Value Expression', Hash: 'Expression', DataType: 'String', Default: '',
                    PictForm: { Section: 'SetValueSection', Group: 'SetValueGroup',
                                Row: 2, Width: 12, InputType: 'TextArea' }
                }
            }
        }
    }
}
```

A full `pict-section-form` manifest. The panel renders a live form;
edits flow back into the node's `Data` block; the next save snapshots
them. The Set Value card's `VariableName` and `Expression` fields
are what a flow engine would later read at evaluation time.

**View** (File Write card):

```js
PropertiesPanel:
{
    PanelType: 'View',
    DefaultWidth: 260, DefaultHeight: 180,
    Title: 'File Write Info',
    Configuration: { ViewHash: 'FlowExample-FileWriteInfo' }
}
```

The application registers `FlowExample-FileWriteInfo` as a Pict
view (any host-defined view), and the panel renders it. This is the
escape hatch for "I need something none of the built-in panels
cover" — a third-party widget, a custom editor, an embedded
preview.

The four types cover the gradient from "static" (Markdown) →
"templated read-only" (Template) → "structured editing" (Form) →
"anything you can build" (View).

---

## Feature 4 — BodyContent: SVG / HTML / Canvas

Every card has an optional `BodyContent` block that paints inside
the node's body (between the title bar and the port row). Three
content types cover the spectrum from static vector art to live
rendered visualizations:

**SVG** — declarative shapes inline in the node:

```js
// FlowCard-StatusMonitor.js
BodyContent:
{
    ContentType: 'svg',
    Template: '<circle cx="30" cy="28" r="6" fill="#27ae60" opacity="0.9"/>' +
              '<text x="42" y="32" font-size="9" fill="#2c3e50">API</text>' +
              '<circle cx="100" cy="28" r="6" fill="#27ae60" opacity="0.9"/>' +
              '<text x="112" y="32" font-size="9" fill="#2c3e50">DB</text>' +
              /* ... */
}
```

The SVG template is interpolated into the node's `<svg>` group, so
every primitive coordinate is in the node's local space (`0,0` is
the body top-left). Use this for status indicators, mini-icons,
glyphs.

**HTML** — `foreignObject`-wrapped markup for rich text and tables:

```js
// FlowCard-DataPreview.js
BodyContent:
{
    ContentType: 'html',
    Template:
        '<table style="width:100%;border-collapse:collapse;font-size:9px;color:#2c3e50">' +
        '<tr style="background:#d6eaf8">' +
        '<td style="padding:3px 5px;font-weight:600">Field</td>' +
        '<td style="padding:3px 5px;font-weight:600">Type</td>' +
        '<td style="padding:3px 5px;font-weight:600">Value</td>' +
        '</tr>' +
        /* ... */
        '</table>'
}
```

The HTML is wrapped in an SVG `<foreignObject>` and sized to the
node body. Use it for the things SVG `<text>` can't do — tables,
multi-line wrapping, real CSS.

**Canvas** — programmatic drawing via a render callback:

```js
// FlowCard-Sparkline.js
BodyContent:
{
    ContentType: 'canvas',
    RenderCallback: function (pCanvas, pNodeData, pNodeTypeConfig, pBounds)
    {
        let tmpCtx = pCanvas.getContext('2d');
        if (!tmpCtx) return;

        let tmpData = [12, 19, 8, 25, 15, 30, 22, 18, 35, 28, 14, 32, 20, 26, 10, 24, 33, 17, 29, 21];
        let tmpMax = Math.max.apply(null, tmpData);
        let tmpMin = Math.min.apply(null, tmpData);
        let tmpRange = tmpMax - tmpMin || 1;
        let tmpPadding = 6;
        let tmpChartW = pCanvas.width - (tmpPadding * 2);
        let tmpChartH = pCanvas.height - (tmpPadding * 2);
        let tmpStep = tmpChartW / (tmpData.length - 1);

        // Fill the area beneath the line ...
        tmpCtx.beginPath();
        tmpCtx.moveTo(tmpPadding, pCanvas.height - tmpPadding);
        for (let i = 0; i < tmpData.length; i++)
        {
            let tmpX = tmpPadding + (i * tmpStep);
            let tmpY = tmpPadding + tmpChartH - ((tmpData[i] - tmpMin) / tmpRange) * tmpChartH;
            tmpCtx.lineTo(tmpX, tmpY);
        }
        /* ... draw line, end dot ... */
    }
}
```

The framework calls `RenderCallback` with a sized `<canvas>` element
and the node's own data, so the chart redraws on every re-render
(node drag, zoom change, theme switch). Use this for charts,
visualizations of data the node carries, any non-trivial 2D rendering.

---

## Feature 5 — Host shell + multi-page routing

The application has three top-level pages — Home (the canvas),
About, and Documentation — wired through `pict-router`. The route
configuration JSON lives next to the application:

```json
{
    "ProviderIdentifier": "Pict-Router",
    "AutoInitialize": true,
    "AutoInitializeOrdinal": 0,
    "Routes":
    [
        { "path": "/Home",          "template": "{~LV:Pict.PictApplication.showView(`FlowExample-MainWorkspace`)~}" },
        { "path": "/About",         "template": "{~LV:Pict.PictApplication.showView(`FlowExample-About`)~}" },
        { "path": "/Documentation", "template": "{~LV:Pict.PictApplication.showView(`FlowExample-Documentation`)~}" }
    ]
}
```

The `{~LV:...~}` is the live-value template tag — it evaluates
the expression every time the route matches, calling the
application's `showView(viewIdentifier)` method. That method
swaps the content container's view in place:

```js
showView(pViewIdentifier)
{
    if (pViewIdentifier in this.pict.views)
    {
        this.pict.AppData.FlowExample.CurrentRoute = pViewIdentifier;
        this.pict.views[pViewIdentifier].render();
    }
    else
    {
        this.pict.log.warn(`View [${pViewIdentifier}] not found; falling back to main workspace.`);
        this.pict.views['FlowExample-MainWorkspace'].render();
    }
}
```

The topbar and bottombar are siblings of the content container in
the layout shell — they don't re-render on route change. The
brand link calls `Pict.PictApplication.navigateTo('/Home')`, which
in turn calls the router's `navigate(...)`; the router fires the
template; the host calls `showView(...)`. Same path as a direct hash
URL — `#/Documentation` works the same way.

The flow view re-initializes its SVG primitives whenever the
workspace re-renders, so navigating away to About and back to Home
gets a fresh canvas:

```js
// In MainWorkspace's onAfterRender:
this._FlowView.initialRenderComplete = false;
this._FlowView.render();
```

---

## Feature 6 — Sample-graph catalog with layout-algorithm hints

The dropdown above the canvas surfaces a curated set of graphs
shaped to exercise the flow view's seven layout algorithms (the
"Hello World" reference, linear chains, fan-outs, grids, etc.).
Each catalog entry declares a `Name`, `Description`, optional
`Recommended` layout, and a complete `_FlowData` object:

```js
// sample-flows.js
function _flow(pNodes, pConnections, pAlgorithm, pParameters, pAutoApply)
{
    return {
        Nodes: pNodes,
        Connections: pConnections || [],
        OpenPanels: [],
        SavedLayouts: [],
        ViewState: _emptyViewState(),
        LayoutAlgorithm: pAlgorithm || 'Custom',
        LayoutParameters: pParameters || {},
        LayoutAutoApply: !!pAutoApply
    };
}
```

The workspace view's `_loadSample` callback deep-clones the sample
flow (so reloading does not share references with the prior load)
and pushes it through `setFlowData(...)`:

```js
_loadSample(pKey, pDescEl, pRecoEl)
{
    if (!this._FlowView) return;

    if (pKey === '__hello-world__')
    {
        this._FlowView.setFlowData(this.pict.AppData.FlowExample.SampleFlow);
        pDescEl.innerHTML = 'The full reference flow with all card types, properties panels, and an error branch.' +
                            ' Originally designed by hand — set <code>LayoutAlgorithm</code> to <em>Layered</em>' +
                            ' to see how the auto-layout compares.';
        pRecoEl.style.display = 'none';
        return;
    }

    let tmpSample = libSampleFlows.getSample(pKey);
    if (!tmpSample) return;

    this._FlowView.setFlowData(JSON.parse(JSON.stringify(tmpSample.Flow)));
    pDescEl.textContent = tmpSample.Description;
    if (tmpSample.Recommended)
    {
        pRecoEl.style.display = '';
        pRecoEl.textContent = `Try: ${tmpSample.Recommended}`;
    }
    else
    {
        pRecoEl.style.display = 'none';
    }
}
```

Picking a sample swaps the canvas instantly. Opening the toolbar's
Algorithm popup lets you flip between layouts and watch the same
graph re-arrange — which is the whole point of the catalog. Some
shapes shine under Layered; some under Force-Directed; the
`Recommended` hint is the curator's pick.

---

## Feature 7 — Help overlay rendered from a CSS grid

The "?" button in the workspace header toggles a hint panel built
as a CSS grid. The panel itself is part of the workspace template;
the toggle simply adds/removes a `visible` class:

```js
let tmpHelpToggle = document.getElementById('FlowExample-HelpToggle');
let tmpHelpPanel  = document.getElementById('FlowExample-HelpPanel');
if (tmpHelpToggle && tmpHelpPanel)
{
    tmpHelpToggle.addEventListener('click', function ()
    {
        tmpHelpPanel.classList.toggle('visible');
        tmpHelpToggle.classList.toggle('active');
    });
}
```

The eight hints — Add / Connect / Move / Pan & Zoom / Delete /
Auto Layout / Properties / Save Layouts — are static `<div>`s in
the workspace template, each with a heading and short description:

```html
<div class="flowexample-hints">
    <div class="flowexample-hint">
        <h4>Add Nodes</h4>
        <p>Select a node type from the dropdown and click <code>+ Add Node</code> in the toolbar.</p>
    </div>
    <div class="flowexample-hint">
        <h4>Connect Nodes</h4>
        <p>Drag from a green output port to a blue input port to create a connection.</p>
    </div>
    /* ... six more ... */
</div>
```

`grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))` makes
the grid reflow without media queries — the hints arrange themselves
across whatever width the viewport gives them.

---

## Running the example

```bash
cd example_applications/simple_cards
npm install
npm run build
# serve ./dist/ over HTTP (e.g. `cd dist && python3 -m http.server 8000`)
```

The `prebuild` script generates `card-help/*.md` documentation
from the card sources into `docs/card-help/`. The build itself is
`npx quack build && npx quack copy` — emits the application
bundle and copies the html/css/pict assets into `dist/`.

## Things to try in the running app

- **Drop in the Hello World flow** — the canvas opens to it. Pan
  around; every card type is on the page.
- **Open a properties panel** — double-click the Set Value node
  for the Form panel; the Log Values node for the Template panel;
  the If-Then-Else node for the Markdown panel; the File Write
  node for the View panel.
- **Switch sample graphs** — pick "Linear Chain" or "Fan-Out". The
  canvas swaps to the new shape. Open the toolbar's Algorithm
  popup and try `Layered` vs `Force-Directed`.
- **Toggle the help overlay** — click the `?` button in the header.
  The eight hint cards appear in a responsive grid.
- **Navigate** — click `About` in the topbar, then back to `Home`.
  The flow re-renders cleanly; the topbar/bottombar stay put.
- **Inspect the BodyContent showcase** — at the bottom-left of the
  Hello World graph are four cards: Status Monitor (SVG circles),
  Data Preview (HTML table), Throughput (canvas-rendered sparkline),
  Note (HTML text). Each demonstrates one rendering type.

## Takeaways

1. **A card is one file, ~30 lines.** Twelve cards, twelve files,
   twelve constructors that hand declarative config to
   `PictFlowCard`. No inheritance trees, no template files.
2. **Pre-register node types via `NodeTypes` in the view options.**
   The toolbar palette is alive before its first paint, no
   subsequent `registerNodeType` flicker.
3. **Pick your panel type by what you want to bind.** Markdown for
   docs, Template for read-only display, Form for structured
   editing, View for everything else. They share the same panel
   chrome and tether-line behavior.
4. **`BodyContent` is per-card.** SVG for icons, HTML for tables,
   Canvas for charts. The framework wires it; the card declares
   it.
5. **The sample-graph catalog is the layout algorithm's test
   harness.** Each sample is a shape; the dropdown swaps shapes;
   the Algorithm popup swaps layouts. That is how you discover
   which layout fits which kind of graph.

## Related documentation

- [Getting Started](../../Getting_Started.md) — minimum-viable flow
  view; build the first card from scratch.
- [Architecture](../../Architecture.md) — service / provider /
  view layering of the section.
- [Implementation Reference](../../Implementation_Reference.md) —
  full API surface.
- [Data Model](../../Data_Model.md) — the `_FlowData` shape used
  by the seed flow and the sample catalog.
- [PictFlowCard](../../api/PictFlowCard.md) — the card base class.
- [PictFlowCardPropertiesPanel](../../api/PictFlowCardPropertiesPanel.md)
  — the panel base class extending to custom panel types.
- [registerNodeType](../../api/registerNodeType.md) — the
  alternative to passing `NodeTypes` at construction time.
- [setTheme / registerTheme](../../api/setTheme.md) — the theming
  surface every card respects.
