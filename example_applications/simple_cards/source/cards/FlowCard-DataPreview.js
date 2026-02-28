const libPictFlowCard = require('pict-section-flow').PictFlowCard;

class FlowCardDataPreview extends libPictFlowCard
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, Object.assign(
			{},
			{
				Title: 'Data Preview',
				Name: 'Inspect Data',
				Code: 'PREV',
				Description: 'Displays a preview of the data flowing through this node.',
				Icon: 'PREV',
				Tooltip: 'Data Preview: View data summary',
				Category: 'Debug',
				TitleBarColor: '#2980b9',
				BodyStyle: { fill: '#ebf5fb', stroke: '#2980b9' },
				Width: 200,
				Height: 120,
				Inputs:
				[
					{ Name: 'Data', Side: 'left', MinimumInputCount: 1, MaximumInputCount: 1 }
				],
				Outputs:
				[
					{ Name: 'Pass', Side: 'right' }
				],
				ShowTypeLabel: false,
			PortLabelPadding: true,
			BodyContent:
				{
					ContentType: 'html',
					Template: '<table style="width:100%;border-collapse:collapse;font-size:9px;color:#2c3e50"><tr style="background:#d6eaf8"><td style="padding:3px 5px;font-weight:600">Field</td><td style="padding:3px 5px;font-weight:600">Type</td><td style="padding:3px 5px;font-weight:600">Value</td></tr><tr><td style="padding:2px 5px;border-top:1px solid #d5dbdb">name</td><td style="padding:2px 5px;border-top:1px solid #d5dbdb;color:#8e44ad">str</td><td style="padding:2px 5px;border-top:1px solid #d5dbdb;color:#7f8c8d">&#x22;config&#x22;</td></tr><tr><td style="padding:2px 5px;border-top:1px solid #d5dbdb">count</td><td style="padding:2px 5px;border-top:1px solid #d5dbdb;color:#8e44ad">num</td><td style="padding:2px 5px;border-top:1px solid #d5dbdb;color:#7f8c8d">42</td></tr><tr><td style="padding:2px 5px;border-top:1px solid #d5dbdb">active</td><td style="padding:2px 5px;border-top:1px solid #d5dbdb;color:#8e44ad">bool</td><td style="padding:2px 5px;border-top:1px solid #d5dbdb;color:#27ae60">true</td></tr></table>'
				}
			},
			pOptions),
			pServiceHash);
	}
}

module.exports = FlowCardDataPreview;
