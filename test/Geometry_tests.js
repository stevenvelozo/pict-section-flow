const libFable = require('fable');
const libChai = require('chai');
const libExpect = libChai.expect;

const libGeometry = require('../source/providers/PictProvider-Flow-Geometry.js');

suite
(
	'PictProvider-Flow-Geometry',
	function ()
	{
		let _Fable;
		let _Geometry;

		setup
		(
			function ()
			{
				_Fable = new libFable({});
				_Geometry = new libGeometry(_Fable, {}, 'Geometry-Test');
			}
		);

		// ---- Constructor ----

		suite
		(
			'Constructor',
			function ()
			{
				test
				(
					'should instantiate with correct serviceType',
					function (fDone)
					{
						libExpect(_Geometry).to.be.an('object');
						libExpect(_Geometry.serviceType).to.equal('PictProviderFlowGeometry');
						fDone();
					}
				);
			}
		);

		// ---- getEdgeFromSide ----

		suite
		(
			'getEdgeFromSide',
			function ()
			{
				test
				(
					'should return left for left-side variants',
					function (fDone)
					{
						libExpect(_Geometry.getEdgeFromSide('left')).to.equal('left');
						libExpect(_Geometry.getEdgeFromSide('left-top')).to.equal('left');
						libExpect(_Geometry.getEdgeFromSide('left-bottom')).to.equal('left');
						fDone();
					}
				);

				test
				(
					'should return right for right-side variants',
					function (fDone)
					{
						libExpect(_Geometry.getEdgeFromSide('right')).to.equal('right');
						libExpect(_Geometry.getEdgeFromSide('right-top')).to.equal('right');
						libExpect(_Geometry.getEdgeFromSide('right-bottom')).to.equal('right');
						fDone();
					}
				);

				test
				(
					'should return top for top-side variants',
					function (fDone)
					{
						libExpect(_Geometry.getEdgeFromSide('top')).to.equal('top');
						libExpect(_Geometry.getEdgeFromSide('top-left')).to.equal('top');
						libExpect(_Geometry.getEdgeFromSide('top-right')).to.equal('top');
						fDone();
					}
				);

				test
				(
					'should return bottom for bottom-side variants',
					function (fDone)
					{
						libExpect(_Geometry.getEdgeFromSide('bottom')).to.equal('bottom');
						libExpect(_Geometry.getEdgeFromSide('bottom-left')).to.equal('bottom');
						libExpect(_Geometry.getEdgeFromSide('bottom-right')).to.equal('bottom');
						fDone();
					}
				);

				test
				(
					'should default to right for unknown side',
					function (fDone)
					{
						libExpect(_Geometry.getEdgeFromSide('unknown')).to.equal('right');
						libExpect(_Geometry.getEdgeFromSide('')).to.equal('right');
						fDone();
					}
				);
			}
		);

		// ---- sideDirection ----

		suite
		(
			'sideDirection',
			function ()
			{
				test
				(
					'should return correct direction vectors',
					function (fDone)
					{
						libExpect(_Geometry.sideDirection('left')).to.deep.equal({ dx: -1, dy: 0 });
						libExpect(_Geometry.sideDirection('right')).to.deep.equal({ dx: 1, dy: 0 });
						libExpect(_Geometry.sideDirection('top')).to.deep.equal({ dx: 0, dy: -1 });
						libExpect(_Geometry.sideDirection('bottom')).to.deep.equal({ dx: 0, dy: 1 });
						fDone();
					}
				);

				test
				(
					'should map compound sides to their edge direction',
					function (fDone)
					{
						// left-top is on the left edge → dx=-1
						libExpect(_Geometry.sideDirection('left-top')).to.deep.equal({ dx: -1, dy: 0 });
						// right-bottom is on the right edge → dx=1
						libExpect(_Geometry.sideDirection('right-bottom')).to.deep.equal({ dx: 1, dy: 0 });
						// top-left is on the top edge → dy=-1
						libExpect(_Geometry.sideDirection('top-left')).to.deep.equal({ dx: 0, dy: -1 });
						// bottom-right is on the bottom edge → dy=1
						libExpect(_Geometry.sideDirection('bottom-right')).to.deep.equal({ dx: 0, dy: 1 });
						fDone();
					}
				);
			}
		);

		// ---- getEdgeCenter ----

		suite
		(
			'getEdgeCenter',
			function ()
			{
				let tmpRect;

				setup
				(
					function ()
					{
						tmpRect = { X: 100, Y: 200, Width: 160, Height: 80 };
					}
				);

				test
				(
					'should compute left edge center',
					function (fDone)
					{
						let tmpResult = _Geometry.getEdgeCenter(tmpRect, 'left');
						libExpect(tmpResult.x).to.equal(100);
						libExpect(tmpResult.y).to.equal(240); // 200 + 80/2
						fDone();
					}
				);

				test
				(
					'should compute right edge center',
					function (fDone)
					{
						let tmpResult = _Geometry.getEdgeCenter(tmpRect, 'right');
						libExpect(tmpResult.x).to.equal(260); // 100 + 160
						libExpect(tmpResult.y).to.equal(240);
						fDone();
					}
				);

				test
				(
					'should compute top edge center',
					function (fDone)
					{
						let tmpResult = _Geometry.getEdgeCenter(tmpRect, 'top');
						libExpect(tmpResult.x).to.equal(180); // 100 + 160/2
						libExpect(tmpResult.y).to.equal(200);
						fDone();
					}
				);

				test
				(
					'should compute bottom edge center',
					function (fDone)
					{
						let tmpResult = _Geometry.getEdgeCenter(tmpRect, 'bottom');
						libExpect(tmpResult.x).to.equal(180);
						libExpect(tmpResult.y).to.equal(280); // 200 + 80
						fDone();
					}
				);

				test
				(
					'should default to right for unknown side',
					function (fDone)
					{
						let tmpResult = _Geometry.getEdgeCenter(tmpRect, 'bogus');
						libExpect(tmpResult.x).to.equal(260);
						libExpect(tmpResult.y).to.equal(240);
						fDone();
					}
				);
			}
		);

		// ---- _getZoneFromSide ----

		suite
		(
			'_getZoneFromSide',
			function ()
			{
				test
				(
					'should return start zone for -top and -left positions',
					function (fDone)
					{
						let tmpZone = _Geometry._getZoneFromSide('left-top');
						libExpect(tmpZone.start).to.equal(0.0);
						libExpect(tmpZone.end).to.equal(0.333);

						tmpZone = _Geometry._getZoneFromSide('top-left');
						libExpect(tmpZone.start).to.equal(0.0);
						libExpect(tmpZone.end).to.equal(0.333);
						fDone();
					}
				);

				test
				(
					'should return middle zone for plain edge names',
					function (fDone)
					{
						let tmpZone = _Geometry._getZoneFromSide('left');
						libExpect(tmpZone.start).to.equal(0.333);
						libExpect(tmpZone.end).to.equal(0.667);

						tmpZone = _Geometry._getZoneFromSide('bottom');
						libExpect(tmpZone.start).to.equal(0.333);
						libExpect(tmpZone.end).to.equal(0.667);
						fDone();
					}
				);

				test
				(
					'should return end zone for -bottom and -right positions',
					function (fDone)
					{
						let tmpZone = _Geometry._getZoneFromSide('left-bottom');
						libExpect(tmpZone.start).to.equal(0.667);
						libExpect(tmpZone.end).to.equal(1.0);

						tmpZone = _Geometry._getZoneFromSide('top-right');
						libExpect(tmpZone.start).to.equal(0.667);
						libExpect(tmpZone.end).to.equal(1.0);
						fDone();
					}
				);

				test
				(
					'should return full range for unknown side',
					function (fDone)
					{
						let tmpZone = _Geometry._getZoneFromSide('nonsense');
						libExpect(tmpZone.start).to.equal(0.0);
						libExpect(tmpZone.end).to.equal(1.0);
						fDone();
					}
				);
			}
		);

		// ---- _getZoneKeysForEdge ----

		suite
		(
			'_getZoneKeysForEdge',
			function ()
			{
				test
				(
					'should return three zone keys in order for each edge',
					function (fDone)
					{
						libExpect(_Geometry._getZoneKeysForEdge('left')).to.deep.equal(
							['left-top', 'left', 'left-bottom']);
						libExpect(_Geometry._getZoneKeysForEdge('right')).to.deep.equal(
							['right-top', 'right', 'right-bottom']);
						libExpect(_Geometry._getZoneKeysForEdge('top')).to.deep.equal(
							['top-left', 'top', 'top-right']);
						libExpect(_Geometry._getZoneKeysForEdge('bottom')).to.deep.equal(
							['bottom-left', 'bottom', 'bottom-right']);
						fDone();
					}
				);
			}
		);

		// ---- _computeAdaptiveZone ----

		suite
		(
			'_computeAdaptiveZone',
			function ()
			{
				test
				(
					'should fall back to fixed zones when no ports on edge',
					function (fDone)
					{
						// No ports on left edge at all
						let tmpResult = _Geometry._computeAdaptiveZone('left-top', {});
						let tmpFixed = _Geometry._getZoneFromSide('left-top');
						libExpect(tmpResult.start).to.equal(tmpFixed.start);
						libExpect(tmpResult.end).to.equal(tmpFixed.end);
						fDone();
					}
				);

				test
				(
					'should give full range to single occupied zone',
					function (fDone)
					{
						// Only left-top has ports
						let tmpResult = _Geometry._computeAdaptiveZone('left-top',
							{ 'left-top': 3 });
						libExpect(tmpResult.start).to.equal(0.0);
						libExpect(tmpResult.end).to.equal(1.0);
						fDone();
					}
				);

				test
				(
					'should split proportionally between two occupied zones',
					function (fDone)
					{
						// left-top has 2 ports (needs 16*(2+1) = 48),
						// left has 1 port (needs 16*(1+1) = 32)
						// total = 80, fractions: 48/80 = 0.6, 32/80 = 0.4
						let tmpResult1 = _Geometry._computeAdaptiveZone('left-top',
							{ 'left-top': 2, 'left': 1 });
						libExpect(tmpResult1.start).to.equal(0.0);
						libExpect(tmpResult1.end).to.be.closeTo(0.6, 0.001);

						let tmpResult2 = _Geometry._computeAdaptiveZone('left',
							{ 'left-top': 2, 'left': 1 });
						libExpect(tmpResult2.start).to.be.closeTo(0.6, 0.001);
						libExpect(tmpResult2.end).to.be.closeTo(1.0, 0.001);
						fDone();
					}
				);

				test
				(
					'should handle all three zones occupied',
					function (fDone)
					{
						// Each zone has 1 port → each needs 16*(1+1) = 32
						// All equal → each gets 1/3
						let tmpCounts = { 'right-top': 1, 'right': 1, 'right-bottom': 1 };

						let tmpZone1 = _Geometry._computeAdaptiveZone('right-top', tmpCounts);
						let tmpZone2 = _Geometry._computeAdaptiveZone('right', tmpCounts);
						let tmpZone3 = _Geometry._computeAdaptiveZone('right-bottom', tmpCounts);

						libExpect(tmpZone1.start).to.be.closeTo(0.0, 0.001);
						libExpect(tmpZone1.end).to.be.closeTo(0.333, 0.001);
						libExpect(tmpZone2.start).to.be.closeTo(0.333, 0.001);
						libExpect(tmpZone2.end).to.be.closeTo(0.667, 0.001);
						libExpect(tmpZone3.start).to.be.closeTo(0.667, 0.001);
						libExpect(tmpZone3.end).to.be.closeTo(1.0, 0.001);
						fDone();
					}
				);

				test
				(
					'should collapse empty zone to zero width',
					function (fDone)
					{
						// Only right-top and right-bottom are occupied;
						// 'right' has no ports → its adaptive zone should be zero width
						let tmpCounts = { 'right-top': 2, 'right-bottom': 2 };

						let tmpMid = _Geometry._computeAdaptiveZone('right', tmpCounts);
						// With 0 ports, the middle zone gets 0 space
						// But since it's not in the counts, its space is 0
						// Actually _computeAdaptiveZone for 'right' with 0 ports:
						// right zone's space = 0 (no ports), so its fraction = 0/total
						// This means start == end for this zone
						libExpect(tmpMid.end - tmpMid.start).to.be.closeTo(0, 0.001);
						fDone();
					}
				);
			}
		);

		// ---- buildPortCountsBySide ----

		suite
		(
			'buildPortCountsBySide',
			function ()
			{
				test
				(
					'should count ports by Side value',
					function (fDone)
					{
						let tmpPorts = [
							{ Side: 'left-top', Direction: 'input' },
							{ Side: 'left-top', Direction: 'input' },
							{ Side: 'right-top', Direction: 'output' },
							{ Side: 'bottom', Direction: 'output' }
						];

						let tmpResult = _Geometry.buildPortCountsBySide(tmpPorts);
						libExpect(tmpResult['left-top']).to.equal(2);
						libExpect(tmpResult['right-top']).to.equal(1);
						libExpect(tmpResult['bottom']).to.equal(1);
						fDone();
					}
				);

				test
				(
					'should fall back to left/right based on Direction when Side is missing',
					function (fDone)
					{
						let tmpPorts = [
							{ Direction: 'input' },
							{ Direction: 'output' },
							{ Direction: 'input' }
						];

						let tmpResult = _Geometry.buildPortCountsBySide(tmpPorts);
						libExpect(tmpResult['left']).to.equal(2);
						libExpect(tmpResult['right']).to.equal(1);
						fDone();
					}
				);

				test
				(
					'should return empty object for null/empty input',
					function (fDone)
					{
						libExpect(_Geometry.buildPortCountsBySide(null)).to.deep.equal({});
						libExpect(_Geometry.buildPortCountsBySide([])).to.deep.equal({});
						libExpect(_Geometry.buildPortCountsBySide(undefined)).to.deep.equal({});
						fDone();
					}
				);
			}
		);

		// ---- getPortLocalPosition ----

		suite
		(
			'getPortLocalPosition',
			function ()
			{
				test
				(
					'should place left port at x=0',
					function (fDone)
					{
						let tmpResult = _Geometry.getPortLocalPosition(
							'left-top', 0, 1, 200, 120, 30);
						libExpect(tmpResult.x).to.equal(0);
						fDone();
					}
				);

				test
				(
					'should place right port at x=width',
					function (fDone)
					{
						let tmpResult = _Geometry.getPortLocalPosition(
							'right-top', 0, 1, 200, 120, 30);
						libExpect(tmpResult.x).to.equal(200);
						fDone();
					}
				);

				test
				(
					'should place top port at y=0',
					function (fDone)
					{
						let tmpResult = _Geometry.getPortLocalPosition(
							'top', 0, 1, 200, 120, 30);
						libExpect(tmpResult.y).to.equal(0);
						fDone();
					}
				);

				test
				(
					'should place bottom port at y=height',
					function (fDone)
					{
						let tmpResult = _Geometry.getPortLocalPosition(
							'bottom', 0, 1, 200, 120, 30);
						libExpect(tmpResult.y).to.equal(120);
						fDone();
					}
				);

				test
				(
					'should use fixed spacing for consistent port gaps',
					function (fDone)
					{
						// Two ports in the same zone
						let tmpPos0 = _Geometry.getPortLocalPosition(
							'left-top', 0, 2, 200, 200, 30);
						let tmpPos1 = _Geometry.getPortLocalPosition(
							'left-top', 1, 2, 200, 200, 30);

						// Spacing should be 16px (the minSpacing constant)
						libExpect(tmpPos1.y - tmpPos0.y).to.equal(16);
						fDone();
					}
				);

				test
				(
					'should maintain same spacing on a taller card',
					function (fDone)
					{
						// Same port config but larger card height
						let tmpPos0Short = _Geometry.getPortLocalPosition(
							'left-top', 0, 2, 200, 100, 30);
						let tmpPos1Short = _Geometry.getPortLocalPosition(
							'left-top', 1, 2, 200, 100, 30);

						let tmpPos0Tall = _Geometry.getPortLocalPosition(
							'left-top', 0, 2, 200, 400, 30);
						let tmpPos1Tall = _Geometry.getPortLocalPosition(
							'left-top', 1, 2, 200, 400, 30);

						// Spacing should be same regardless of card height
						let tmpSpacingShort = tmpPos1Short.y - tmpPos0Short.y;
						let tmpSpacingTall = tmpPos1Tall.y - tmpPos0Tall.y;
						libExpect(tmpSpacingShort).to.equal(tmpSpacingTall);
						libExpect(tmpSpacingShort).to.equal(16);
						fDone();
					}
				);

				test
				(
					'should top-align start zone ports',
					function (fDone)
					{
						// left-top is in the start zone (0.0–0.333)
						// With only 1 port, alignment='start' means offset=0
						let tmpResult = _Geometry.getPortLocalPosition(
							'left-top', 0, 1, 200, 200, 30);

						// zoneStart = titleBar + bodyHeight * 0.0 = 30
						// alignOffset = 0 (start alignment)
						// y = 30 + 0 + 16*(0+1) = 46
						libExpect(tmpResult.y).to.equal(46);
						fDone();
					}
				);

				test
				(
					'should bottom-align end zone ports',
					function (fDone)
					{
						// left-bottom is in the end zone (0.667–1.0)
						// alignment='end' means offset = slack
						let tmpResult = _Geometry.getPortLocalPosition(
							'left-bottom', 0, 1, 200, 200, 30);

						// bodyHeight = 200 - 30 - 16 = 154
						// zoneStart = 30 + 154 * 0.667 = 132.718
						// zoneHeight = 154 * (1.0 - 0.667) = 51.282
						// groupHeight = 16 * (1+1) = 32
						// slack = 51.282 - 32 = 19.282
						// alignOffset = slack (end alignment) = 19.282
						// y = 132.718 + 19.282 + 16*1 = 168
						libExpect(tmpResult.y).to.be.closeTo(168, 0.5);
						fDone();
					}
				);

				test
				(
					'should center-align middle zone ports (including bottom edge error port)',
					function (fDone)
					{
						// 'bottom' is in the middle zone (0.333–0.667)
						// This is the error port use case
						let tmpResult = _Geometry.getPortLocalPosition(
							'bottom', 0, 1, 200, 120, 30);

						// On bottom edge: y = height = 120
						libExpect(tmpResult.y).to.equal(120);

						// zoneStart = 200 * 0.333 = 66.6
						// zoneWidth = 200 * (0.667 - 0.333) = 66.8
						// groupWidth = 16 * 2 = 32
						// slack = 66.8 - 32 = 34.8
						// center offset = 34.8 / 2 = 17.4
						// x = 66.6 + 17.4 + 16*1 = 100
						libExpect(tmpResult.x).to.be.closeTo(100, 0.5);
						fDone();
					}
				);

				test
				(
					'should center error port with adaptive zones',
					function (fDone)
					{
						// The critical case: error port is the only port on bottom edge
						// Adaptive zone gives it {start:0, end:1} (full width)
						// But alignment must still be 'center' based on fixed zone
						let tmpPortCounts = { 'bottom': 1 };

						let tmpResult = _Geometry.getPortLocalPosition(
							'bottom', 0, 1, 200, 120, 30, tmpPortCounts);

						// y = height = 120 (bottom edge)
						libExpect(tmpResult.y).to.equal(120);

						// With adaptive zone {0, 1}: zoneStart=0, zoneWidth=200
						// groupWidth = 16*2 = 32
						// slack = 200 - 32 = 168
						// center offset = 168 / 2 = 84
						// x = 0 + 84 + 16 = 100 (centered!)
						libExpect(tmpResult.x).to.be.closeTo(100, 0.5);
						fDone();
					}
				);
			}
		);

		// ---- computeMinimumNodeHeight ----

		suite
		(
			'computeMinimumNodeHeight',
			function ()
			{
				test
				(
					'should return 0 for no ports',
					function (fDone)
					{
						libExpect(_Geometry.computeMinimumNodeHeight([], 30)).to.equal(0);
						libExpect(_Geometry.computeMinimumNodeHeight(null, 30)).to.equal(0);
						fDone();
					}
				);

				test
				(
					'should compute height for single left port',
					function (fDone)
					{
						let tmpPorts = [{ Side: 'left-top', Direction: 'input' }];
						let tmpHeight = _Geometry.computeMinimumNodeHeight(tmpPorts, 30);

						// 1 port on left-top: space = 16 * (1+1) = 32
						// height = titleBar(30) + bottomPad(16) + 32 = 78
						libExpect(tmpHeight).to.equal(78);
						fDone();
					}
				);

				test
				(
					'should take the max of left and right edges',
					function (fDone)
					{
						// 3 ports on left, 1 port on right
						let tmpPorts = [
							{ Side: 'left-top', Direction: 'input' },
							{ Side: 'left-top', Direction: 'input' },
							{ Side: 'left-top', Direction: 'input' },
							{ Side: 'right-top', Direction: 'output' }
						];
						let tmpHeight = _Geometry.computeMinimumNodeHeight(tmpPorts, 30);

						// Left: 16 * (3+1) = 64. Right: 16 * (1+1) = 32.
						// Max edge = 64. Height = 30 + 16 + 64 = 110
						libExpect(tmpHeight).to.equal(110);
						fDone();
					}
				);

				test
				(
					'should sum across zones on the same edge',
					function (fDone)
					{
						// Ports spread across left-top, left, and left-bottom
						let tmpPorts = [
							{ Side: 'left-top', Direction: 'input' },
							{ Side: 'left', Direction: 'input' },
							{ Side: 'left-bottom', Direction: 'input' }
						];
						let tmpHeight = _Geometry.computeMinimumNodeHeight(tmpPorts, 30);

						// Each zone: 16*(1+1) = 32. Total = 96.
						// Height = 30 + 16 + 96 = 142
						libExpect(tmpHeight).to.equal(142);
						fDone();
					}
				);

				test
				(
					'should ignore top/bottom edge ports for height calculation',
					function (fDone)
					{
						let tmpPorts = [
							{ Side: 'bottom', Direction: 'output' },
							{ Side: 'top', Direction: 'input' }
						];
						let tmpHeight = _Geometry.computeMinimumNodeHeight(tmpPorts, 30);

						// No left/right ports → height = 0
						libExpect(tmpHeight).to.equal(0);
						fDone();
					}
				);
			}
		);
	}
);
