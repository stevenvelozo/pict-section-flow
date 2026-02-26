const libPictFlowCard = require('pict-section-flow').PictFlowCard;

class FlowCardSetValue extends libPictFlowCard
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, Object.assign(
			{},
			{
				Title: 'Set Value',
				Name: 'Assign Value',
				Code: 'SET',
				Description: 'Sets a named value in the flow context.',
				Icon: '\u270F\uFE0F',
				Tooltip: 'Set Value: Assign a value in the context',
				Category: 'Data',
				TitleBarColor: '#16a085',
				BodyStyle: { fill: '#e8f8f5', stroke: '#16a085' },
				Width: 170,
				Height: 80,
				Inputs:
				[
					{ Name: 'In', Side: 'left', MinimumInputCount: 1, MaximumInputCount: 1 }
				],
				Outputs:
				[
					{ Name: 'Out', Side: 'right' }
				]
			},
			pOptions),
			pServiceHash);
	}
}

module.exports = FlowCardSetValue;
