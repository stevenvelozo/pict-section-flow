const libPictFlowCardPropertiesPanel = require('../PictFlowCardPropertiesPanel.js');

/**
 * FlowCardPropertiesPanel-Form
 *
 * Creates an ephemeral pict-section-form section to edit the node's Data object.
 * Uses PictViewFormMetacontroller.injectManifest() to dynamically create form
 * sections at runtime.
 *
 * Note: pict-section-form must be available in the consuming application
 * (it is an optional/peer dependency, not bundled with pict-section-flow).
 *
 * Configuration:
 *   {
 *     PanelType: 'Form',
 *     Configuration: {
 *       Manifest: {
 *         Sections: [...],
 *         Descriptors: {...}
 *       }
 *     }
 *   }
 */
class FlowCardPropertiesPanelForm extends libPictFlowCardPropertiesPanel
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictFlowCardPropertiesPanel-Form';

		this._Metacontroller = null;
		this._InjectedSectionHash = null;
	}

	/**
	 * Render the form into the panel body.
	 */
	render(pContainer, pNodeData)
	{
		super.render(pContainer, pNodeData);

		if (!this._Configuration || !this._Configuration.Manifest)
		{
			pContainer.innerHTML = '<em>No form manifest configured</em>';
			return;
		}

		// Create a unique container ID for the form section
		let tmpContainerID = `pict-flow-panel-form-${pNodeData.Hash}`;
		pContainer.innerHTML = `<div id="${tmpContainerID}"></div>`;

		try
		{
			// Look for an existing metacontroller or create one
			if (!this._Metacontroller)
			{
				// Try to find PictFormMetacontroller service type (check both common names)
				let tmpServiceType = null;
				if (this.fable.servicesMap.hasOwnProperty('PictFormMetacontroller'))
				{
					tmpServiceType = 'PictFormMetacontroller';
				}
				else if (this.fable.servicesMap.hasOwnProperty('PictViewFormMetacontroller'))
				{
					tmpServiceType = 'PictViewFormMetacontroller';
				}

				if (tmpServiceType)
				{
					this._Metacontroller = this.fable.instantiateServiceProviderWithoutRegistration(tmpServiceType,
						{
							ViewIdentifier: `FlowPanelForm-${pNodeData.Hash}`,
							DefaultDestinationAddress: `#${tmpContainerID}`,
							AutoRender: false,
							AutoPopulateAfterRender: true,
							AutoSolveBeforeRender: false
						});
				}
			}

			if (this._Metacontroller && typeof this._Metacontroller.injectManifestAndRender === 'function')
			{
				// Create the FormContainer div that the metacontroller's
				// updateMetatemplateInDOM() expects when adding section wrappers.
				// Normally this is created when the metacontroller renders its own
				// metatemplate, but we skip that step since we only need the
				// injected section views, not the metacontroller's own renderable.
				let tmpFormContainerID = `Pict-${this._Metacontroller.UUID}-FormContainer`;
				let tmpContainerEl = pContainer.querySelector(`#${tmpContainerID}`);
				if (tmpContainerEl)
				{
					tmpContainerEl.innerHTML = `<div id="${tmpFormContainerID}" class="pict-form"></div>`;
				}

				// Deep clone the manifest so each panel gets its own copy
				let tmpManifest = JSON.parse(JSON.stringify(this._Configuration.Manifest));
				this._InjectedSectionHash = tmpManifest.Hash || null;

				// Use injectManifestAndRender which properly creates section views,
				// updates the metatemplate in the DOM, and renders each section view
				this._Metacontroller.injectManifestAndRender(tmpManifest);
			}
			else if (this._Metacontroller && typeof this._Metacontroller.injectManifest === 'function')
			{
				// Fallback for older pict-section-form versions: inject the
				// manifest and render each section view individually
				let tmpManifest = JSON.parse(JSON.stringify(this._Configuration.Manifest));
				let tmpViewsToRender = this._Metacontroller.injectManifest(tmpManifest);
				this._InjectedSectionHash = tmpManifest.Hash || null;

				// Create container divs for each section view and render them
				let tmpContainerEl = pContainer.querySelector(`#${tmpContainerID}`);
				if (tmpContainerEl && tmpViewsToRender.length > 0)
				{
					let tmpInnerHTML = '';
					for (let i = 0; i < tmpViewsToRender.length; i++)
					{
						let tmpDestID = tmpViewsToRender[i].options.DefaultDestinationAddress;
						if (tmpDestID && tmpDestID.charAt(0) === '#')
						{
							tmpDestID = tmpDestID.substring(1);
						}
						tmpInnerHTML += `<div id="${tmpDestID}" class="pict-form-view"></div>`;
					}
					tmpContainerEl.innerHTML = tmpInnerHTML;

					for (let i = 0; i < tmpViewsToRender.length; i++)
					{
						tmpViewsToRender[i].render();
					}
				}
			}
			else
			{
				pContainer.innerHTML = '<em>pict-section-form is not available. Install it in your application to use Form panels.</em>';
			}
		}
		catch (pError)
		{
			this.log.warn(`FlowCardPropertiesPanel-Form render error: ${pError.message}`);
			pContainer.innerHTML = `<em>Form render error: ${pError.message}</em>`;
		}
	}

	marshalFromPanel(pNodeData)
	{
		if (this._Metacontroller && typeof this._Metacontroller.marshalFromView === 'function')
		{
			this._Metacontroller.marshalFromView();
		}
	}

	destroy()
	{
		this._Metacontroller = null;
		this._InjectedSectionHash = null;
		super.destroy();
	}
}

module.exports = FlowCardPropertiesPanelForm;

module.exports.default_configuration = Object.assign(
	{},
	libPictFlowCardPropertiesPanel.default_configuration,
	{
		PanelType: 'Form',
		Configuration:
		{
			Manifest: null
		}
	}
);
