const libPictFlowCard = require('pict-section-flow').PictFlowCard;

class FlowCardFileWrite extends libPictFlowCard
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, Object.assign(
			{},
			{
				Title: 'File Write',
				Name: 'Write File',
				Code: 'FWRITE',
				Description: 'Writes data to a file on the filesystem.',
				Icon: 'FWRITE',
				Tooltip: 'File Write: Write data to a file',
				Category: 'I/O',
				TitleBarColor: '#27ae60',
				BodyStyle: { fill: '#eafaf1', stroke: '#27ae60' },
				Width: 180,
				Height: 80,
				Inputs:
				[
					{ Name: 'Path', Side: 'left', MinimumInputCount: 1, MaximumInputCount: 1 },
					{ Name: 'Data', Side: 'left', MinimumInputCount: 1, MaximumInputCount: 1 }
				],
				Outputs:
				[
					{ Name: 'Done', Side: 'right' },
					{ Name: 'Error', Side: 'bottom' }
				],
				PropertiesPanel:
				{
					PanelType: 'View',
					DefaultWidth: 260,
					DefaultHeight: 180,
					Title: 'File Write Info',
					Configuration:
					{
						ViewHash: 'FlowExample-FileWriteInfo'
					}
				}
			},
			pOptions),
			pServiceHash);
	}
}

module.exports = FlowCardFileWrite;
