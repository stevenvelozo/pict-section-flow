const libPictFlowCard = require('pict-section-flow').PictFlowCard;

class FlowCardSwitch extends libPictFlowCard
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, Object.assign(
			{},
			{
				Title: 'Switch',
				Name: 'Multi-way Branch',
				Code: 'SW',
				Description: 'Routes flow to one of multiple cases based on a value.',
				Icon: 'SW',
				Tooltip: 'Switch: Multi-way branch on a value',
				Category: 'Control Flow',
				TitleBarColor: '#d35400',
				BodyStyle: { fill: '#fbeee6', stroke: '#d35400' },
				Width: 200,
				Height: 120,
				Inputs:
				[
					{ Name: 'In', Side: 'left', MinimumInputCount: 1, MaximumInputCount: 1 }
				],
				Outputs:
				[
					{ Name: 'Case A', Side: 'right' },
					{ Name: 'Case B', Side: 'right' },
					{ Name: 'Default', Side: 'bottom' }
				]
			},
			pOptions),
			pServiceHash);
	}
}

module.exports = FlowCardSwitch;
