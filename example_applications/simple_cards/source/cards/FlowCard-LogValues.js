const libPictFlowCard = require('pict-section-flow').PictFlowCard;

class FlowCardLogValues extends libPictFlowCard
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, Object.assign(
			{},
			{
				Title: 'Log Values',
				Name: 'Log to Console',
				Code: 'LOG',
				Description: 'Logs input values to the console or log output.',
				Icon: '\uD83D\uDCDD',
				Tooltip: 'Log Values: Output values to the log',
				Category: 'Debug',
				TitleBarColor: '#7f8c8d',
				BodyStyle: { fill: '#f2f3f4', stroke: '#7f8c8d' },
				Width: 160,
				Height: 80,
				Inputs:
				[
					{ Name: 'Values', Side: 'left', MinimumInputCount: 1, MaximumInputCount: -1 }
				],
				Outputs:
				[
					{ Name: 'Pass', Side: 'right' }
				],
				PropertiesPanel:
				{
					PanelType: 'Template',
					DefaultWidth: 260,
					DefaultHeight: 140,
					Title: 'Log Settings',
					Configuration:
					{
						Templates:
						[
							{
								Hash: 'flow-card-log-panel',
								Template: '<div style="padding:4px"><label style="font-size:11px;color:#7f8c8d">Log Level</label><div style="font-size:12px;padding:4px 0">{~D:Record.Data.LogLevel~}</div><label style="font-size:11px;color:#7f8c8d">Format</label><div style="font-size:12px;padding:4px 0">{~D:Record.Data.Format~}</div></div>'
							}
						],
						TemplateHash: 'flow-card-log-panel'
					}
				}
			},
			pOptions),
			pServiceHash);
	}
}

module.exports = FlowCardLogValues;
