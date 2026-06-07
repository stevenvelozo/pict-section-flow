const libCoerce = require('./Layout-Coerce.js');
const libRank = require('./Layout-Rank.js');

/**
 * Layout-Layered
 *
 * Cycle-tolerant left-to-right layered layout.
 *
 * This is the original `autoLayout` behavior of pict-section-flow,
 * extracted into a layout-algorithm descriptor. Calling
 * `_LayoutService.autoLayout(nodes, connections)` with no algorithm
 * argument dispatches here, preserving backwards compatibility.
 *
 * Numeric parameters are typed `PreciseNumber` (big.js-backed strings)
 * so they survive ExpressionParser solver chains without float drift;
 * the simulation coerces back to JS floats at entry via Layout-Coerce.
 */
module.exports =
{
	Name: 'Layered',
	Label: 'Layered (Topological)',
	Description: 'Left-to-right layers based on connection topology.',
	DefaultEdgeTheme: 'Orthogonal',

	Apply: function (pNodes, pConnections, pParameters)
	{
		if (!pNodes || pNodes.length === 0) return;

		let tmpParams = pParameters || {};
		let tmpSpacing           = libCoerce.toFloat(tmpParams.Spacing, 1.0);
		let tmpHorizontalSpacing = libCoerce.toFloat(tmpParams.HorizontalSpacing, 250) * tmpSpacing;
		let tmpVerticalSpacing   = libCoerce.toFloat(tmpParams.VerticalSpacing, 120) * tmpSpacing;
		let tmpStartX            = libCoerce.toFloat(tmpParams.StartX, 100);
		let tmpStartY            = libCoerce.toFloat(tmpParams.StartY, 100);

		let tmpConnections = Array.isArray(pConnections) ? pConnections : [];

		let tmpNodeMap = {};
		for (let i = 0; i < pNodes.length; i++)
		{
			tmpNodeMap[pNodes[i].Hash] = pNodes[i];
		}

		// Rank the nodes into layers, left to right, with cycle breaking. The
		// shared ranker keeps back-edged graphs (workflows, state machines) from
		// collapsing into one tall column the way plain Kahn's topological sort
		// would. See Layout-Rank.js.
		let tmpLayers = libRank.toRanks(pNodes, tmpConnections);

		// Measure each layer's stacked height so layers can be centered on one
		// shared horizontal axis. Without centering every layer top-aligns at
		// StartY, so a one-node layer beside a five-node layer reads as a
		// diagonal drift down the page instead of a balanced band.
		let tmpLayerHeights = [];
		let tmpMaxLayerHeight = 0;
		for (let l = 0; l < tmpLayers.length; l++)
		{
			let tmpHeight = 0;
			for (let i = 0; i < tmpLayers[l].length; i++)
			{
				let tmpNode = tmpNodeMap[tmpLayers[l][i]];
				tmpHeight += (tmpNode && tmpNode.Height) ? tmpNode.Height : 80;
				if (i > 0) tmpHeight += tmpVerticalSpacing;
			}
			tmpLayerHeights.push(tmpHeight);
			if (tmpHeight > tmpMaxLayerHeight) tmpMaxLayerHeight = tmpHeight;
		}

		// Assign positions: one column per layer, each layer vertically centered.
		let tmpCurrentX = tmpStartX;

		for (let tmpLayerIndex = 0; tmpLayerIndex < tmpLayers.length; tmpLayerIndex++)
		{
			let tmpLayer = tmpLayers[tmpLayerIndex];
			let tmpMaxWidth = 0;
			let tmpCurrentY = tmpStartY + ((tmpMaxLayerHeight - tmpLayerHeights[tmpLayerIndex]) / 2);

			for (let i = 0; i < tmpLayer.length; i++)
			{
				let tmpNode = tmpNodeMap[tmpLayer[i]];
				if (!tmpNode) continue;

				tmpNode.X = tmpCurrentX;
				tmpNode.Y = tmpCurrentY;

				let tmpWidth = tmpNode.Width || 180;
				let tmpHeight = tmpNode.Height || 80;

				tmpMaxWidth = Math.max(tmpMaxWidth, tmpWidth);
				tmpCurrentY += tmpHeight + tmpVerticalSpacing;
			}

			tmpCurrentX += tmpMaxWidth + tmpHorizontalSpacing;
		}
	},

	DefaultParameters:
	{
		Spacing: 1.0,
		HorizontalSpacing: 250,
		VerticalSpacing: 120,
		StartX: 100,
		StartY: 100
	},

	ParameterSchema:
	{
		Spacing:           { Type: 'PreciseNumber', Label: 'Spacing (multiplier)', Default: 1.0, Min: 0.1, Max: 5 },
		HorizontalSpacing: { Type: 'PreciseNumber', Label: 'Horizontal spacing', Default: 250, Min: 0, Max: 1000 },
		VerticalSpacing:   { Type: 'PreciseNumber', Label: 'Vertical spacing',   Default: 120, Min: 0, Max: 1000 },
		StartX:            { Type: 'PreciseNumber', Label: 'Start X',            Default: 100, Min: -10000, Max: 10000 },
		StartY:            { Type: 'PreciseNumber', Label: 'Start Y',            Default: 100, Min: -10000, Max: 10000 }
	},

	// Manyfest descriptor catalog consumed by pict-section-form's metacontroller.
	// Descriptor keys are full data paths relative to the marshal destination
	// (default `AppData`); the toolbar binds `AppData.PictFlowLayoutEditor.Parameters`
	// to the active flow's `_FlowData.LayoutParameters` before injecting.
	ParameterManifest:
	{
		Scope: 'PictFlowLayout-Layered',
		Sections:
		[
			{ Name: 'Layered Parameters', Hash: 'PictFlowLayoutSection', Groups: [{ Name: 'Defaults', Hash: 'PictFlowLayoutGroup' }] }
		],
		Descriptors:
		{
			'PictFlowLayoutEditor.Parameters.Spacing':
			{
				Name: 'Spacing (multiplier)', Hash: 'Spacing', DataType: 'PreciseNumber', Default: 1.0,
				PictForm: { Section: 'PictFlowLayoutSection', Group: 'PictFlowLayoutGroup', Row: 0, Width: 12, Min: 0.1, Max: 5 }
			},
			'PictFlowLayoutEditor.Parameters.HorizontalSpacing':
			{
				Name: 'Horizontal spacing', Hash: 'HorizontalSpacing', DataType: 'PreciseNumber', Default: 250,
				PictForm: { Section: 'PictFlowLayoutSection', Group: 'PictFlowLayoutGroup', Row: 1, Width: 6, Min: 0, Max: 1000 }
			},
			'PictFlowLayoutEditor.Parameters.VerticalSpacing':
			{
				Name: 'Vertical spacing', Hash: 'VerticalSpacing', DataType: 'PreciseNumber', Default: 120,
				PictForm: { Section: 'PictFlowLayoutSection', Group: 'PictFlowLayoutGroup', Row: 1, Width: 6, Min: 0, Max: 1000 }
			},
			'PictFlowLayoutEditor.Parameters.StartX':
			{
				Name: 'Start X', Hash: 'StartX', DataType: 'PreciseNumber', Default: 100,
				PictForm: { Section: 'PictFlowLayoutSection', Group: 'PictFlowLayoutGroup', Row: 2, Width: 6, Min: -10000, Max: 10000 }
			},
			'PictFlowLayoutEditor.Parameters.StartY':
			{
				Name: 'Start Y', Hash: 'StartY', DataType: 'PreciseNumber', Default: 100,
				PictForm: { Section: 'PictFlowLayoutSection', Group: 'PictFlowLayoutGroup', Row: 2, Width: 6, Min: -10000, Max: 10000 }
			}
		}
	}
};
