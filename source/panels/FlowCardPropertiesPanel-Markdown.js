const libPictFlowCardPropertiesPanel = require('../PictFlowCardPropertiesPanel.js');

/**
 * FlowCardPropertiesPanel-Markdown
 *
 * Renders markdown content into the panel body using pict-section-content.
 * Supports extended syntax: KaTeX equations, Mermaid diagrams, syntax-highlighted
 * code blocks.
 *
 * Configuration:
 *   {
 *     PanelType: 'Markdown',
 *     Configuration: {
 *       Markdown: '# Title\nSome **markdown** content'
 *     }
 *   }
 *
 * Or use an address to pull markdown from the node's data:
 *   {
 *     PanelType: 'Markdown',
 *     Configuration: {
 *       MarkdownAddress: 'Data.MarkdownContent'
 *     }
 *   }
 */
class FlowCardPropertiesPanelMarkdown extends libPictFlowCardPropertiesPanel
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictFlowCardPropertiesPanel-Markdown';

		this._ContentProvider = null;
	}

	/**
	 * Render markdown into the panel.
	 */
	render(pContainer, pNodeData)
	{
		super.render(pContainer, pNodeData);

		this._renderMarkdown();
	}

	marshalToPanel(pNodeData)
	{
		super.marshalToPanel(pNodeData);
		this._renderMarkdown();
	}

	_renderMarkdown()
	{
		if (!this._ContentContainer || !this._Configuration) return;

		let tmpMarkdown = '';

		if (this._Configuration.MarkdownAddress && this._NodeData)
		{
			// Resolve markdown from node data using manyfest
			tmpMarkdown = this.fable.manifest.getValueByHash(this._NodeData, this._Configuration.MarkdownAddress) || '';
		}
		else if (this._Configuration.Markdown)
		{
			tmpMarkdown = this._Configuration.Markdown;
		}

		if (!tmpMarkdown)
		{
			this._ContentContainer.innerHTML = '<em>No content</em>';
			return;
		}

		// Try to use pict-section-content for extended markdown rendering
		try
		{
			if (!this._ContentProvider)
			{
				if (this.fable.servicesMap.hasOwnProperty('PictContentProvider'))
				{
					this._ContentProvider = this.fable.instantiateServiceProviderWithoutRegistration('PictContentProvider', {});
				}
			}

			if (this._ContentProvider && typeof this._ContentProvider.parseMarkdown === 'function')
			{
				let tmpHTML = this._ContentProvider.parseMarkdown(tmpMarkdown);
				this._ContentContainer.innerHTML = tmpHTML;

				// Post-render hooks for equations and diagrams
				if (typeof this._ContentProvider.renderKaTeXEquations === 'function')
				{
					this._ContentProvider.renderKaTeXEquations(this._ContentContainer);
				}
				if (typeof this._ContentProvider.renderMermaidDiagrams === 'function')
				{
					this._ContentProvider.renderMermaidDiagrams(this._ContentContainer);
				}
			}
			else
			{
				// Fallback: render as plain text with basic formatting
				this._ContentContainer.innerHTML = `<pre style="white-space: pre-wrap; font-family: inherit;">${this._escapeHTML(tmpMarkdown)}</pre>`;
			}
		}
		catch (pError)
		{
			this.log.warn(`FlowCardPropertiesPanel-Markdown render error: ${pError.message}`);
			this._ContentContainer.innerHTML = `<pre style="white-space: pre-wrap; font-family: inherit;">${this._escapeHTML(tmpMarkdown)}</pre>`;
		}
	}

	_escapeHTML(pText)
	{
		let tmpDiv = document.createElement('div');
		tmpDiv.textContent = pText;
		return tmpDiv.innerHTML;
	}

	destroy()
	{
		this._ContentProvider = null;
		super.destroy();
	}
}

module.exports = FlowCardPropertiesPanelMarkdown;

module.exports.default_configuration = Object.assign(
	{},
	libPictFlowCardPropertiesPanel.default_configuration,
	{
		PanelType: 'Markdown',
		Configuration:
		{
			Markdown: '',
			MarkdownAddress: ''
		}
	}
);
