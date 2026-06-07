const libCoerce = require('./Layout-Coerce.js');
const libRank = require('./Layout-Rank.js');

/**
 * Layout-Staggered
 *
 * Serpentine "stairstep" layout for directed graphs. It ranks the nodes left
 * to right by connection topology (the same cycle-tolerant ranking the Layered
 * layout uses), then walks that ordered sequence along a band that steps down a
 * few rows and back up, advancing horizontally at every node.
 *
 * The point is vertical-space efficiency: a long directed chain (a workflow, a
 * delivery pipeline, a state machine) laid out purely left to right runs off
 * the right edge of the canvas. Folding it into a stairstep band keeps the
 * left-to-right reading order while using the height of the viewport, so the
 * whole graph frames at a usable zoom.
 *
 * `Rows` sets how deep the band steps before folding back: 2 is a simple
 * zigzag (odd nodes high, even nodes low); 3+ is a deeper stairstep. The row
 * index follows a triangle wave so the band descends and then climbs rather
 * than snapping back to the top between runs.
 *
 * Numeric parameters are typed `PreciseNumber` so they survive ExpressionParser
 * solver chains; Layout-Coerce converts them back to JS floats at entry.
 */
module.exports =
{
	Name: 'Staggered',
	Label: 'Staggered (Stairstep)',
	Description: 'Topological order folded along a serpentine stairstep band.',
	DefaultEdgeTheme: 'Perimeter',

	Apply: function (pNodes, pConnections, pParameters)
	{
		if (!pNodes || pNodes.length === 0) return;

		let tmpParams = pParameters || {};
		let tmpSpacing       = libCoerce.toFloat(tmpParams.Spacing, 1.0);
		let tmpRows          = Math.max(1, libCoerce.toInt(tmpParams.Rows, 2));
		let tmpColumnSpacing = libCoerce.toFloat(tmpParams.ColumnSpacing, 80) * tmpSpacing;
		let tmpRowOffset     = libCoerce.toFloat(tmpParams.RowOffset, 150) * tmpSpacing;
		let tmpStartX        = libCoerce.toFloat(tmpParams.StartX, 80);
		let tmpStartY        = libCoerce.toFloat(tmpParams.StartY, 80);

		let tmpConnections = Array.isArray(pConnections) ? pConnections : [];

		let tmpNodeMap = {};
		for (let i = 0; i < pNodes.length; i++)
		{
			tmpNodeMap[pNodes[i].Hash] = pNodes[i];
		}

		let tmpOrder = libRank.toOrder(pNodes, tmpConnections);

		// A uniform column pitch (the widest node plus the spacing) keeps the
		// stairstep diagonal even regardless of individual node widths.
		let tmpMaxWidth = 0;
		for (let i = 0; i < pNodes.length; i++)
		{
			tmpMaxWidth = Math.max(tmpMaxWidth, pNodes[i].Width || 180);
		}
		let tmpColumnPitch = tmpMaxWidth + tmpColumnSpacing;

		// Triangle wave: descend (Rows - 1) steps, then climb (Rows - 1) steps.
		let tmpPeriod = (tmpRows > 1) ? (2 * (tmpRows - 1)) : 1;

		for (let i = 0; i < tmpOrder.length; i++)
		{
			let tmpNode = tmpNodeMap[tmpOrder[i]];
			if (!tmpNode) continue;

			let tmpRow;
			if (tmpRows <= 1)
			{
				tmpRow = 0;
			}
			else
			{
				let tmpPhase = i % tmpPeriod;
				tmpRow = (tmpPhase < tmpRows) ? tmpPhase : (tmpPeriod - tmpPhase);
			}

			tmpNode.X = tmpStartX + (i * tmpColumnPitch);
			tmpNode.Y = tmpStartY + (tmpRow * tmpRowOffset);
		}
	},

	DefaultParameters:
	{
		Spacing: 1.0,
		Rows: 2,
		ColumnSpacing: 80,
		RowOffset: 150,
		StartX: 80,
		StartY: 80
	},

	ParameterSchema:
	{
		Spacing:       { Type: 'PreciseNumber', Label: 'Spacing (multiplier)', Default: 1.0, Min: 0.1, Max: 5 },
		Rows:          { Type: 'Number',        Label: 'Rows',          Default: 2,   Min: 1, Max: 12 },
		ColumnSpacing: { Type: 'PreciseNumber', Label: 'Column spacing', Default: 80,  Min: 0, Max: 1000 },
		RowOffset:     { Type: 'PreciseNumber', Label: 'Row offset',    Default: 150, Min: 0, Max: 1000 },
		StartX:        { Type: 'PreciseNumber', Label: 'Start X',       Default: 80,  Min: -10000, Max: 10000 },
		StartY:        { Type: 'PreciseNumber', Label: 'Start Y',       Default: 80,  Min: -10000, Max: 10000 }
	},

	ParameterManifest:
	{
		Scope: 'PictFlowLayout-Staggered',
		Sections:
		[
			{ Name: 'Staggered Parameters', Hash: 'PFLStaggeredSection', Groups: [{ Name: 'Defaults', Hash: 'PFLStaggeredGroup' }] }
		],
		Descriptors:
		{
			'PictFlowLayoutEditor.Parameters.Spacing':
			{ Name: 'Spacing (multiplier)', Hash: 'Spacing', DataType: 'PreciseNumber', Default: 1.0, PictForm: { Section: 'PFLStaggeredSection', Group: 'PFLStaggeredGroup', Row: 0, Width: 6, Min: 0.1, Max: 5 } },
			'PictFlowLayoutEditor.Parameters.Rows':
			{ Name: 'Rows', Hash: 'Rows', DataType: 'Number', Default: 2, PictForm: { Section: 'PFLStaggeredSection', Group: 'PFLStaggeredGroup', Row: 0, Width: 6, Min: 1, Max: 12 } },
			'PictFlowLayoutEditor.Parameters.ColumnSpacing':
			{ Name: 'Column spacing', Hash: 'ColumnSpacing', DataType: 'PreciseNumber', Default: 80, PictForm: { Section: 'PFLStaggeredSection', Group: 'PFLStaggeredGroup', Row: 1, Width: 6, Min: 0, Max: 1000 } },
			'PictFlowLayoutEditor.Parameters.RowOffset':
			{ Name: 'Row offset', Hash: 'RowOffset', DataType: 'PreciseNumber', Default: 150, PictForm: { Section: 'PFLStaggeredSection', Group: 'PFLStaggeredGroup', Row: 1, Width: 6, Min: 0, Max: 1000 } },
			'PictFlowLayoutEditor.Parameters.StartX':
			{ Name: 'Start X', Hash: 'StartX', DataType: 'PreciseNumber', Default: 80, PictForm: { Section: 'PFLStaggeredSection', Group: 'PFLStaggeredGroup', Row: 2, Width: 6, Min: -10000, Max: 10000 } },
			'PictFlowLayoutEditor.Parameters.StartY':
			{ Name: 'Start Y', Hash: 'StartY', DataType: 'PreciseNumber', Default: 80, PictForm: { Section: 'PFLStaggeredSection', Group: 'PFLStaggeredGroup', Row: 2, Width: 6, Min: -10000, Max: 10000 } }
		}
	}
};
