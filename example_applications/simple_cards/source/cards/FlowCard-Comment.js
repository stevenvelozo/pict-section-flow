const libPictFlowCard = require('pict-section-flow').PictFlowCard;

class FlowCardComment extends libPictFlowCard
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, Object.assign(
			{},
			{
				Title: 'Comment',
				Name: 'Annotation',
				Code: 'NOTE',
				Description: 'A floating annotation or comment node for documenting flow logic.',
				Icon: 'NOTE',
				Tooltip: 'Comment: Add a note to the diagram',
				Category: 'Documentation',
				TitleBarColor: '#f39c12',
				BodyStyle: { fill: '#fef9e7', stroke: '#f39c12' },
				Width: 180,
				Height: 100,
				Inputs: [],
				Outputs: [],
				ShowTypeLabel: false,
			LabelsInFront: false,
			BodyContent:
				{
					ContentType: 'html',
					Template: '<div style="padding:6px 8px;font-size:10px;line-height:1.5;color:#7d6608;font-style:italic">{~D:Record.Data.NoteText~}</div>'
				}
			},
			pOptions),
			pServiceHash);
	}
}

module.exports = FlowCardComment;
