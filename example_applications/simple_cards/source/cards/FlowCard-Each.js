const libPictFlowCard = require('pict-section-flow').PictFlowCard;

class FlowCardEach extends libPictFlowCard
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, Object.assign(
			{},
			{
				Title: 'Each',
				Name: 'Loop Iterator',
				Code: 'EACH',
				Description: 'Iterates over a collection, executing the body for each item.',
				Icon: 'EACH',
				Tooltip: 'Each: Iterate over items in a collection',
				Category: 'Control Flow',
				TitleBarColor: '#8e44ad',
				BodyStyle: { fill: '#f5eef8', stroke: '#8e44ad' },
				Width: 200,
				Height: 100,
				Inputs:
				[
					{ Name: 'Collection', Side: 'left', MinimumInputCount: 1, MaximumInputCount: 1 }
				],
				Outputs:
				[
					{ Name: 'Item', Side: 'right' },
					{ Name: 'Done', Side: 'bottom' }
				]
			},
			pOptions),
			pServiceHash);
	}
}

module.exports = FlowCardEach;
