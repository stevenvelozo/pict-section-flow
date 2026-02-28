const libPictFlowCard = require('pict-section-flow').PictFlowCard;

class FlowCardStatusMonitor extends libPictFlowCard
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, Object.assign(
			{},
			{
				Title: 'Status Monitor',
				Name: 'Health Check',
				Code: 'STAT',
				Description: 'Monitors the health status of upstream services and reports availability.',
				Icon: 'STAT',
				Tooltip: 'Status Monitor: Check service health',
				Category: 'Monitoring',
				TitleBarColor: '#27ae60',
				BodyStyle: { fill: '#eafaf1', stroke: '#27ae60' },
				Width: 200,
				Height: 110,
				Inputs:
				[
					{ Name: 'Check', Side: 'left', MinimumInputCount: 1, MaximumInputCount: -1 }
				],
				Outputs:
				[
					{ Name: 'Healthy', Side: 'right' },
					{ Name: 'Degraded', Side: 'bottom' }
				],
				ShowTypeLabel: false,
			PortLabelsOnHover: true,
			LabelsInFront: false,
			BodyContent:
				{
					ContentType: 'svg',
					Template: '<circle cx="30" cy="28" r="6" fill="#27ae60" opacity="0.9"/><text x="42" y="32" font-size="9" fill="#2c3e50">API</text><circle cx="100" cy="28" r="6" fill="#27ae60" opacity="0.9"/><text x="112" y="32" font-size="9" fill="#2c3e50">DB</text><circle cx="30" cy="54" r="6" fill="#f39c12" opacity="0.9"/><text x="42" y="58" font-size="9" fill="#2c3e50">Cache</text><circle cx="100" cy="54" r="6" fill="#27ae60" opacity="0.9"/><text x="112" y="58" font-size="9" fill="#2c3e50">Queue</text>'
				}
			},
			pOptions),
			pServiceHash);
	}
}

module.exports = FlowCardStatusMonitor;
