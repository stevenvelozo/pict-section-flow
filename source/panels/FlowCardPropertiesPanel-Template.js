const libPictFlowCardPropertiesPanel = require('../PictFlowCardPropertiesPanel.js');

/**
 * FlowCardPropertiesPanel-Template
 *
 * Renders pict templates into the panel body.
 *
 * Configuration:
 *   {
 *     PanelType: 'Template',
 *     Configuration: {
 *       Templates: [
 *         { Hash: 'my-template', Template: '<div>{~D:Record.Data.SomeValue~}</div>' }
 *       ],
 *       TemplateHash: 'my-template'
 *     }
 *   }
 */
class FlowCardPropertiesPanelTemplate extends libPictFlowCardPropertiesPanel
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictFlowCardPropertiesPanel-Template';

		this._TemplatesRegistered = false;
	}

	/**
	 * Register templates with the pict template provider and render.
	 */
	render(pContainer, pNodeData)
	{
		super.render(pContainer, pNodeData);

		if (!this._Configuration || !this._Configuration.Templates) return;

		// Register templates with pict (only once)
		if (!this._TemplatesRegistered)
		{
			let tmpTemplates = this._Configuration.Templates;
			for (let i = 0; i < tmpTemplates.length; i++)
			{
				if (tmpTemplates[i].Hash && tmpTemplates[i].Template)
				{
					this.fable.TemplateProvider.addTemplate(tmpTemplates[i].Hash, tmpTemplates[i].Template);
				}
			}
			this._TemplatesRegistered = true;
		}

		this._renderTemplate();
	}

	marshalToPanel(pNodeData)
	{
		super.marshalToPanel(pNodeData);
		this._renderTemplate();
	}

	_renderTemplate()
	{
		if (!this._ContentContainer || !this._NodeData) return;

		let tmpTemplateHash = this._Configuration.TemplateHash;
		if (!tmpTemplateHash) return;

		let tmpRecord = this._NodeData;
		let tmpHTML = this.fable.parseTemplate(tmpTemplateHash, tmpRecord, null, [tmpRecord]);
		this._ContentContainer.innerHTML = tmpHTML;
	}
}

module.exports = FlowCardPropertiesPanelTemplate;

module.exports.default_configuration = Object.assign(
	{},
	libPictFlowCardPropertiesPanel.default_configuration,
	{
		PanelType: 'Template',
		Configuration:
		{
			Templates: [],
			TemplateHash: ''
		}
	}
);
