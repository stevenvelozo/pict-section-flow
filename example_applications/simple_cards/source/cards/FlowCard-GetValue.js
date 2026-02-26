const libPictFlowCard = require('pict-section-flow').PictFlowCard;

class FlowCardGetValue extends libPictFlowCard
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, Object.assign(
			{},
			{
				Title: 'Get Value',
				Name: 'Read Value',
				Code: 'GET',
				Description: 'Retrieves a named value from the flow context.',
				Icon: '\uD83D\uDD0D',
				Tooltip: 'Get Value: Read a value from the context',
				Category: 'Data',
				TitleBarColor: '#2c3e50',
				BodyStyle: { fill: '#ebedef', stroke: '#2c3e50' },
				Width: 170,
				Height: 80,
				Inputs:
				[
					{ Name: 'In', Side: 'left', MinimumInputCount: 1, MaximumInputCount: 1 }
				],
				Outputs:
				[
					{ Name: 'Value', Side: 'right' }
				]
			},
			pOptions),
			pServiceHash);
	}
}

module.exports = FlowCardGetValue;
