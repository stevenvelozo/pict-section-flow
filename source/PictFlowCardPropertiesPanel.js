const libFableServiceProviderBase = require('fable-serviceproviderbase');

/**
 * PictFlowCardPropertiesPanel - Base class for flow card property panels.
 *
 * Developers create subclasses to define what UI appears when a user opens
 * the properties panel for a node on the flow graph. Four built-in panel
 * types are provided:
 *
 *   - Template  - Renders pict templates
 *   - Markdown  - Renders markdown via pict-section-content
 *   - Form      - Creates an ephemeral pict-section-form section
 *   - View      - Renders an existing registered pict-view
 *
 * Configurable properties:
 *   - PanelType      (string)  - Panel type identifier
 *   - Title          (string)  - Panel title bar text
 *   - Width          (number)  - Default panel width in pixels
 *   - Height         (number)  - Default panel height in pixels
 *   - Configuration  (object)  - Panel-type-specific configuration
 */
class PictFlowCardPropertiesPanel extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, PictFlowCardPropertiesPanel.default_configuration, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'PictFlowCardPropertiesPanel';

		// Panel metadata
		this.panelType = tmpOptions.PanelType || 'Base';
		this.panelTitle = tmpOptions.Title || 'Properties';
		this.panelWidth = (typeof tmpOptions.Width === 'number') ? tmpOptions.Width : 300;
		this.panelHeight = (typeof tmpOptions.Height === 'number') ? tmpOptions.Height : 200;

		// Reference to the flow view (set when panel is activated)
		this._FlowView = null;

		// The node data this panel is operating on (set when panel is opened)
		this._NodeData = null;

		// The DOM container element for panel content (set during render)
		this._ContentContainer = null;

		// The panel configuration (panel-type-specific)
		this._Configuration = tmpOptions.Configuration || {};
	}

	/**
	 * Render the panel's content into a DOM container element.
	 * Subclasses MUST override this.
	 *
	 * @param {HTMLElement} pContainer - The DOM element to render into
	 * @param {Object} pNodeData - The node data object (has .Data property)
	 */
	render(pContainer, pNodeData)
	{
		this._ContentContainer = pContainer;
		this._NodeData = pNodeData;
	}

	/**
	 * Marshal data FROM the node's Data object INTO the panel UI.
	 * Called when the panel opens or when data changes externally.
	 *
	 * @param {Object} pNodeData
	 */
	marshalToPanel(pNodeData)
	{
		this._NodeData = pNodeData;
	}

	/**
	 * Marshal data FROM the panel UI INTO the node's Data object.
	 * Called before saving or when the panel is about to close.
	 *
	 * @param {Object} pNodeData
	 */
	marshalFromPanel(pNodeData)
	{
		// Subclasses override
	}

	/**
	 * Called when the panel is being destroyed (closed).
	 * Subclasses should clean up resources.
	 */
	destroy()
	{
		this._ContentContainer = null;
		this._NodeData = null;
	}
}

module.exports = PictFlowCardPropertiesPanel;

module.exports.default_configuration =
{
	PanelType: 'Base',
	Title: 'Properties',
	Width: 300,
	Height: 200,
	Configuration: {}
};
