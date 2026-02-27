const libFableServiceProviderBase = require('fable-serviceproviderbase');

/**
 * PictFlowCard - Base class for flow diagram cards.
 *
 * Developers create subclasses of PictFlowCard to define reusable node types
 * that appear in the flow palette. Each card describes a discrete operation
 * (e.g. "If-Then-Else", "File Read") with configurable inputs, outputs, and
 * metadata. Pict-Section-Flow uses registered cards to build a palette for
 * the user to drag onto the graph.
 *
 * Configurable properties:
 *   - Title          (string, required) - Display name shown on the node
 *   - Name           (string, optional) - Longer descriptive name
 *   - Code           (string, required) - Short identifier (e.g. "ITE", "SW")
 *   - Description    (string, optional) - Brief explanation of what the card does
 *   - Icon           (string, optional) - Icon identifier or emoji
 *   - PreviewImage   (string, optional) - URL to a preview/thumbnail image
 *   - Documentation  (string, optional) - URL or inline documentation text
 *   - Tooltip        (string, optional) - Hover tooltip text
 *   - Inputs         (array)  - Named input ports, each with:
 *       - Name                 (string)  - Port label
 *       - Side                 (string)  - Port side ('left', 'top', etc.)
 *       - MinimumInputCount    (number)  - Minimum connections accepted (default 0)
 *       - MaximumInputCount    (number)  - Maximum connections accepted (default -1, unlimited)
 *   - Outputs        (array)  - Named output ports
 *   - Enabled        (boolean) - Whether this card is available in the palette
 *   - PropertiesPanel (object, optional) - Configuration for the on-graph properties panel
 *       - PanelType      (string)  - 'Template', 'Markdown', 'Form', or 'View'
 *       - DefaultWidth   (number)  - Panel width (default 300)
 *       - DefaultHeight  (number)  - Panel height (default 200)
 *       - Title          (string)  - Panel title bar text
 *       - Configuration  (object)  - Panel-type-specific configuration
 *
 * Usage:
 *   class MyCard extends PictFlowCard {
 *     constructor(pFable, pOptions, pServiceHash) {
 *       super(pFable, pOptions, pServiceHash);
 *       this.cardTitle = 'My Card';
 *       this.cardCode = 'MC';
 *       this.cardInputs = [{ Name: 'Data', Side: 'left', MinimumInputCount: 1, MaximumInputCount: 1 }];
 *       this.cardOutputs = [{ Name: 'Result', Side: 'right' }];
 *     }
 *   }
 */
class PictFlowCard extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, PictFlowCard.default_configuration, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'PictFlowCard';

		// --- Card metadata ---
		this.cardTitle = (tmpOptions.Title) ? tmpOptions.Title : 'Card';
		this.cardName = (tmpOptions.Name) ? tmpOptions.Name : false;
		this.cardCode = (tmpOptions.Code) ? tmpOptions.Code : '';
		this.cardDescription = (tmpOptions.Description) ? tmpOptions.Description : false;
		this.cardIcon = (tmpOptions.Icon) ? tmpOptions.Icon : false;
		this.cardPreviewImage = (tmpOptions.PreviewImage) ? tmpOptions.PreviewImage : false;
		this.cardDocumentation = (tmpOptions.Documentation) ? tmpOptions.Documentation : false;
		this.cardTooltip = (tmpOptions.Tooltip) ? tmpOptions.Tooltip : false;

		// --- Card enabled state ---
		this.cardEnabled = (typeof tmpOptions.Enabled === 'boolean') ? tmpOptions.Enabled : true;

		// --- Card appearance ---
		this.cardTitleBarColor = (tmpOptions.TitleBarColor) ? tmpOptions.TitleBarColor : '#2c3e50';
		this.cardBodyStyle = (tmpOptions.BodyStyle) ? tmpOptions.BodyStyle : {};
		this.cardWidth = (typeof tmpOptions.Width === 'number') ? tmpOptions.Width : 180;
		this.cardHeight = (typeof tmpOptions.Height === 'number') ? tmpOptions.Height : 80;
		this.cardCategory = (tmpOptions.Category) ? tmpOptions.Category : 'General';

		// --- Input and Output port definitions ---
		// Inputs: [{ Name: 'In', Side: 'left', MinimumInputCount: 0, MaximumInputCount: -1 }]
		// Outputs: [{ Name: 'Out', Side: 'right' }]
		this.cardInputs = Array.isArray(tmpOptions.Inputs) ? tmpOptions.Inputs : [];
		this.cardOutputs = Array.isArray(tmpOptions.Outputs) ? tmpOptions.Outputs : [];

		// --- Properties panel configuration ---
		this.cardPropertiesPanel = (tmpOptions.PropertiesPanel && typeof tmpOptions.PropertiesPanel === 'object')
			? tmpOptions.PropertiesPanel
			: null;
	}

	/**
	 * Generate the node type configuration object for the NodeTypes provider.
	 * This converts the card's properties into the format expected by
	 * PictProviderFlowNodeTypes.registerNodeType().
	 *
	 * @returns {Object} Node type configuration
	 */
	getNodeTypeConfiguration()
	{
		let tmpPorts = [];

		// Build input ports
		for (let i = 0; i < this.cardInputs.length; i++)
		{
			let tmpInput = this.cardInputs[i];
			let tmpPort =
				{
					Hash: null,
					Direction: 'input',
					Side: tmpInput.Side || 'left',
					Label: tmpInput.Name || `In ${i + 1}`,
					MinimumInputCount: (typeof tmpInput.MinimumInputCount === 'number') ? tmpInput.MinimumInputCount : 0,
					MaximumInputCount: (typeof tmpInput.MaximumInputCount === 'number') ? tmpInput.MaximumInputCount : -1
				};
			tmpPorts.push(tmpPort);
		}

		// Build output ports
		for (let i = 0; i < this.cardOutputs.length; i++)
		{
			let tmpOutput = this.cardOutputs[i];
			tmpPorts.push(
				{
					Hash: null,
					Direction: 'output',
					Side: tmpOutput.Side || 'right',
					Label: tmpOutput.Name || `Out ${i + 1}`
				});
		}

		// If no ports were defined, provide sensible defaults
		if (tmpPorts.length === 0)
		{
			tmpPorts.push({ Hash: null, Direction: 'input', Side: 'left', Label: 'In' });
			tmpPorts.push({ Hash: null, Direction: 'output', Side: 'right', Label: 'Out' });
		}

		let tmpResult =
		{
			Hash: this.cardCode,
			Label: this.cardTitle,
			DefaultWidth: this.cardWidth,
			DefaultHeight: this.cardHeight,
			DefaultPorts: tmpPorts,
			TitleBarColor: this.cardTitleBarColor,
			BodyStyle: JSON.parse(JSON.stringify(this.cardBodyStyle)),
			// Extended FlowCard metadata stored alongside the type
			CardMetadata:
			{
				Name: this.cardName,
				Code: this.cardCode,
				Description: this.cardDescription,
				Icon: this.cardIcon,
				PreviewImage: this.cardPreviewImage,
				Documentation: this.cardDocumentation,
				Tooltip: this.cardTooltip,
				Enabled: this.cardEnabled,
				Category: this.cardCategory
			}
		};

		// Include properties panel config if defined
		if (this.cardPropertiesPanel)
		{
			tmpResult.PropertiesPanel = JSON.parse(JSON.stringify(this.cardPropertiesPanel));
		}

		return tmpResult;
	}

	/**
	 * Register this card with a FlowView's node type provider.
	 *
	 * @param {Object} pFlowView - The PictViewFlow instance
	 * @returns {boolean} Whether registration succeeded
	 */
	registerWithFlowView(pFlowView)
	{
		if (!pFlowView || !pFlowView._NodeTypeProvider)
		{
			this.log.warn('PictFlowCard registerWithFlowView: no valid FlowView or NodeTypeProvider');
			return false;
		}

		let tmpConfig = this.getNodeTypeConfiguration();
		return pFlowView._NodeTypeProvider.registerNodeType(tmpConfig);
	}
}

module.exports = PictFlowCard;

module.exports.default_configuration =
{
	Title: 'Card',
	Name: false,
	Code: '',
	Description: false,
	Icon: false,
	PreviewImage: false,
	Documentation: false,
	Tooltip: false,
	Inputs: [],
	Outputs: [],
	Enabled: true,
	TitleBarColor: '#2c3e50',
	BodyStyle: {},
	Width: 180,
	Height: 80,
	Category: 'General',
	PropertiesPanel: null
};
