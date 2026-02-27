const libPictFlowCardPropertiesPanel = require('../PictFlowCardPropertiesPanel.js');

/**
 * FlowCardPropertiesPanel-View
 *
 * Renders an existing registered pict-view into the panel body.
 * The view's destination is temporarily overridden to render inside
 * the panel container.
 *
 * Configuration:
 *   {
 *     PanelType: 'View',
 *     Configuration: {
 *       ViewHash: 'MyCustomViewIdentifier'
 *     }
 *   }
 */
class FlowCardPropertiesPanelView extends libPictFlowCardPropertiesPanel
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictFlowCardPropertiesPanel-View';

		this._OriginalDestination = null;
		this._ViewInstance = null;
	}

	/**
	 * Render the referenced pict-view into the panel body.
	 */
	render(pContainer, pNodeData)
	{
		super.render(pContainer, pNodeData);

		if (!this._Configuration || !this._Configuration.ViewHash)
		{
			pContainer.innerHTML = '<em>No ViewHash configured</em>';
			return;
		}

		let tmpViewHash = this._Configuration.ViewHash;

		// Create a unique container ID
		let tmpContainerID = `pict-flow-panel-view-${pNodeData.Hash}`;
		pContainer.innerHTML = `<div id="${tmpContainerID}"></div>`;

		try
		{
			// Look up the view in the pict instance
			let tmpPict = this.pict || this.fable;
			if (tmpPict.views && tmpPict.views[tmpViewHash])
			{
				this._ViewInstance = tmpPict.views[tmpViewHash];

				// Save original destination
				this._OriginalDestination = this._ViewInstance.options.DefaultDestinationAddress;

				// Override destination to our panel container
				this._ViewInstance.options.DefaultDestinationAddress = `#${tmpContainerID}`;

				if (typeof this._ViewInstance.render === 'function')
				{
					this._ViewInstance.render();
				}
			}
			else
			{
				pContainer.innerHTML = `<em>View "${tmpViewHash}" not found</em>`;
			}
		}
		catch (pError)
		{
			this.log.warn(`FlowCardPropertiesPanel-View render error: ${pError.message}`);
			pContainer.innerHTML = `<em>View render error: ${pError.message}</em>`;
		}
	}

	marshalFromPanel(pNodeData)
	{
		if (this._ViewInstance && typeof this._ViewInstance.marshalFromView === 'function')
		{
			this._ViewInstance.marshalFromView();
		}
	}

	destroy()
	{
		// Restore original destination
		if (this._ViewInstance && this._OriginalDestination)
		{
			this._ViewInstance.options.DefaultDestinationAddress = this._OriginalDestination;
		}

		this._ViewInstance = null;
		this._OriginalDestination = null;
		super.destroy();
	}
}

module.exports = FlowCardPropertiesPanelView;

module.exports.default_configuration = Object.assign(
	{},
	libPictFlowCardPropertiesPanel.default_configuration,
	{
		PanelType: 'View',
		Configuration:
		{
			ViewHash: ''
		}
	}
);
