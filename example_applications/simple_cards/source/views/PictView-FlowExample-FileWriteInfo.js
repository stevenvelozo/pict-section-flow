const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "FlowExample-FileWriteInfo",

	DefaultRenderable: "FileWriteInfo-Content",
	DefaultDestinationAddress: "#FileWriteInfo-Container",

	AutoRender: false,

	Templates:
	[
		{
			Hash: "FileWriteInfo-Template",
			Template: /*html*/`
<div style="padding:6px;font-size:12px;line-height:1.6;color:#2c3e50">
	<div style="margin-bottom:8px">
		<label style="font-weight:600;font-size:11px;color:#7f8c8d;text-transform:uppercase;letter-spacing:0.5px">Output Path</label>
		<div style="padding:4px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:3px;margin-top:2px;font-family:monospace;font-size:11px">{~D:Record.Data.OutputPath~}</div>
	</div>
	<div style="margin-bottom:8px">
		<label style="font-weight:600;font-size:11px;color:#7f8c8d;text-transform:uppercase;letter-spacing:0.5px">Write Mode</label>
		<div style="padding:4px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:3px;margin-top:2px">{~D:Record.Data.WriteMode~}</div>
	</div>
	<div style="margin-bottom:8px">
		<label style="font-weight:600;font-size:11px;color:#7f8c8d;text-transform:uppercase;letter-spacing:0.5px">Encoding</label>
		<div style="padding:4px 6px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:3px;margin-top:2px">{~D:Record.Data.Encoding~}</div>
	</div>
	<div style="padding:6px;background:#eafaf1;border:1px solid #27ae60;border-radius:3px;font-size:11px;color:#27ae60">
		This panel is rendered by a registered pict-view (View panel type).
	</div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "FileWriteInfo-Content",
			TemplateHash: "FileWriteInfo-Template",
			DestinationAddress: "#FileWriteInfo-Container",
			RenderMethod: "replace"
		}
	]
};

class FlowExampleFileWriteInfoView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}

module.exports = FlowExampleFileWriteInfoView;

module.exports.default_configuration = _ViewConfiguration;
