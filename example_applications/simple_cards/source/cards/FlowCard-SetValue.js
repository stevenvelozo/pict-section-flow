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
				Icon: 'SET',
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
				],
				PropertiesPanel:
				{
					PanelType: 'Form',
					DefaultWidth: 320,
					DefaultHeight: 200,
					Title: 'Set Value Properties',
					Configuration:
					{
						Manifest:
						{
							Scope: 'FlowCardSetValue',
							Sections:
							[
								{
									Name: 'Value Assignment',
									Hash: 'SetValueSection',
									Groups:
									[
										{
											Name: 'Settings',
											Hash: 'SetValueGroup'
										}
									]
								}
							],
							Descriptors:
							{
								'Record.Data.VariableName':
								{
									Name: 'Variable Name',
									Hash: 'VariableName',
									DataType: 'String',
									Default: '',
									PictForm:
									{
										Section: 'SetValueSection',
										Group: 'SetValueGroup',
										Row: 1,
										Width: 12
									}
								},
								'Record.Data.Expression':
								{
									Name: 'Value Expression',
									Hash: 'Expression',
									DataType: 'String',
									Default: '',
									PictForm:
									{
										Section: 'SetValueSection',
										Group: 'SetValueGroup',
										Row: 2,
										Width: 12,
										InputType: 'TextArea'
									}
								}
							}
						}
					}
				}
			},
			pOptions),
			pServiceHash);
	}
}

module.exports = FlowCardSetValue;
