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
				Icon: '\uD83D\uDCC4',
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
				]
			},
			pOptions),
			pServiceHash);
	}
}

module.exports = FlowCardFileRead;
