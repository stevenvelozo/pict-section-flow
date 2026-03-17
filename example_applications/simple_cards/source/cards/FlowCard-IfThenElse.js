const libPictFlowCard = require('pict-section-flow').PictFlowCard;

class FlowCardIfThenElse extends libPictFlowCard
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, Object.assign(
			{},
			{
				Title: 'If-Then-Else',
				Name: 'Conditional Branch',
				Code: 'ITE',
				Description: 'Evaluates a condition and routes to the Then or Else branch.',
				Help: 'The <b>If-Then-Else</b> node evaluates a boolean condition expression and routes the flow to one of two outputs.<br><br><b>Inputs:</b> A single trigger input that starts the evaluation.<br><br><b>Outputs:</b><ul><li><b>Then</b> &mdash; activated when the condition is true</li><li><b>Else</b> &mdash; activated when the condition is false</li></ul><br>Set the condition expression in the node&apos;s data properties.',
				Icon: 'ITE',
				Tooltip: 'If-Then-Else: Routes flow based on a boolean condition',
				Category: 'Control Flow',
				TitleBarColor: '#e67e22',
				BodyStyle: { fill: '#fef5e7', stroke: '#e67e22' },
				Width: 200,
				Height: 100,
				Inputs:
				[
					{ Name: 'In', Side: 'left', MinimumInputCount: 1, MaximumInputCount: 1 }
				],
				Outputs:
				[
					{ Name: 'Then', Side: 'right' },
					{ Name: 'Else', Side: 'bottom' }
				],
				PropertiesPanel:
				{
					PanelType: 'Markdown',
					DefaultWidth: 300,
					DefaultHeight: 200,
					Title: 'If-Then-Else Info',
					Configuration:
					{
						Markdown: '## Conditional Branch\n\nEvaluates a **boolean condition** and routes the flow:\n\n- **Then** output: condition is *true*\n- **Else** output: condition is *false*\n\nSet the condition expression in the node data.'
					}
				}
			},
			pOptions),
			pServiceHash);
	}
}

module.exports = FlowCardIfThenElse;
