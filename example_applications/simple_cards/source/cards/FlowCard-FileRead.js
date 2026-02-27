const libPictFlowCard = require('pict-section-flow').PictFlowCard;

class FlowCardFileRead extends libPictFlowCard
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, Object.assign(
			{},
			{
				Title: 'File Read',
				Name: 'Read File',
				Code: 'FREAD',
				Description: 'Reads the contents of a file from the filesystem.',
				Icon: 'FREAD',
				Tooltip: 'File Read: Read data from a file',
				Category: 'I/O',
				TitleBarColor: '#2980b9',
				BodyStyle: { fill: '#eaf2f8', stroke: '#2980b9' },
				Width: 180,
				Height: 80,
				Inputs:
				[
					{ Name: 'Path', Side: 'left', MinimumInputCount: 1, MaximumInputCount: 1 }
				],
				Outputs:
				[
					{ Name: 'Data', Side: 'right' },
					{ Name: 'Error', Side: 'bottom' }
				],
				PropertiesPanel:
				{
					PanelType: 'Template',
					DefaultWidth: 280,
					DefaultHeight: 160,
					Title: 'File Read Settings',
					Configuration:
					{
						Templates:
						[
							{
								Hash: 'flow-card-file-read-panel',
								Template: '<div style="padding:4px"><label style="font-size:11px;color:#7f8c8d">File Path</label><div style="font-size:12px;padding:4px 0">{~D:Record.Data.FilePath~}</div><label style="font-size:11px;color:#7f8c8d">Encoding</label><div style="font-size:12px;padding:4px 0">{~D:Record.Data.Encoding~}</div></div>'
							}
						],
						TemplateHash: 'flow-card-file-read-panel'
					}
				}
			},
			pOptions),
			pServiceHash);
	}
}

module.exports = FlowCardFileRead;
