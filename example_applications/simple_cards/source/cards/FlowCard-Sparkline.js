const libPictFlowCard = require('pict-section-flow').PictFlowCard;

class FlowCardSparkline extends libPictFlowCard
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, Object.assign(
			{},
			{
				Title: 'Sparkline',
				Name: 'Metric Chart',
				Code: 'SPKL',
				Description: 'Renders a live sparkline visualization of numeric throughput data.',
				Icon: 'SPKL',
				Tooltip: 'Sparkline: Visualize numeric throughput',
				Category: 'Visualization',
				TitleBarColor: '#c0392b',
				BodyStyle: { fill: '#fdedec', stroke: '#c0392b' },
				Width: 220,
				Height: 110,
				Inputs:
				[
					{ Name: 'Values', Side: 'left', MinimumInputCount: 1, MaximumInputCount: 1 }
				],
				Outputs:
				[
					{ Name: 'Stats', Side: 'right' }
				],
				ShowTypeLabel: false,
			PortLabelsVertical: true,
			PortLabelPadding: true,
			LabelsInFront: true,
			BodyContent:
				{
					ContentType: 'canvas',
					RenderCallback: function (pCanvas, pNodeData, pNodeTypeConfig, pBounds)
					{
						let tmpCtx = pCanvas.getContext('2d');
						if (!tmpCtx) return;

						let tmpW = pCanvas.width;
						let tmpH = pCanvas.height;

						// Sample data points (simulated throughput)
						let tmpData = [12, 19, 8, 25, 15, 30, 22, 18, 35, 28, 14, 32, 20, 26, 10, 24, 33, 17, 29, 21];
						let tmpMax = Math.max.apply(null, tmpData);
						let tmpMin = Math.min.apply(null, tmpData);
						let tmpRange = tmpMax - tmpMin || 1;
						let tmpPadding = 6;
						let tmpChartW = tmpW - (tmpPadding * 2);
						let tmpChartH = tmpH - (tmpPadding * 2);
						let tmpStep = tmpChartW / (tmpData.length - 1);

						// Draw filled area
						tmpCtx.beginPath();
						tmpCtx.moveTo(tmpPadding, tmpH - tmpPadding);
						for (let i = 0; i < tmpData.length; i++)
						{
							let tmpX = tmpPadding + (i * tmpStep);
							let tmpY = tmpPadding + tmpChartH - ((tmpData[i] - tmpMin) / tmpRange) * tmpChartH;
							tmpCtx.lineTo(tmpX, tmpY);
						}
						tmpCtx.lineTo(tmpPadding + tmpChartW, tmpH - tmpPadding);
						tmpCtx.closePath();
						tmpCtx.fillStyle = 'rgba(192, 57, 43, 0.12)';
						tmpCtx.fill();

						// Draw line
						tmpCtx.beginPath();
						for (let i = 0; i < tmpData.length; i++)
						{
							let tmpX = tmpPadding + (i * tmpStep);
							let tmpY = tmpPadding + tmpChartH - ((tmpData[i] - tmpMin) / tmpRange) * tmpChartH;
							if (i === 0) tmpCtx.moveTo(tmpX, tmpY);
							else tmpCtx.lineTo(tmpX, tmpY);
						}
						tmpCtx.strokeStyle = '#c0392b';
						tmpCtx.lineWidth = 1.5;
						tmpCtx.lineJoin = 'round';
						tmpCtx.lineCap = 'round';
						tmpCtx.stroke();

						// Draw end dot
						let tmpLastX = tmpPadding + ((tmpData.length - 1) * tmpStep);
						let tmpLastY = tmpPadding + tmpChartH - ((tmpData[tmpData.length - 1] - tmpMin) / tmpRange) * tmpChartH;
						tmpCtx.beginPath();
						tmpCtx.arc(tmpLastX, tmpLastY, 3, 0, Math.PI * 2);
						tmpCtx.fillStyle = '#c0392b';
						tmpCtx.fill();
					}
				}
			},
			pOptions),
			pServiceHash);
	}
}

module.exports = FlowCardSparkline;
