const libFable = require('fable');
const libChai = require('chai');
const libExpect = libChai.expect;

const libConnectionRenderer = require('../source/services/PictService-Flow-ConnectionRenderer.js');
const libPathGenerator = require('../source/services/PictService-Flow-PathGenerator.js');
const libGeometry = require('../source/providers/PictProvider-Flow-Geometry.js');

suite
(
	'PictService-Flow-ConnectionRenderer',
	function ()
	{
		let _Fable;
		let _Renderer;
		let _GeometryProvider;
		let _PathGenerator;

		setup
		(
			function ()
			{
				_Fable = new libFable({});

				_GeometryProvider = new libGeometry(_Fable, {}, 'Geometry-Test');
				_PathGenerator = new libPathGenerator(_Fable, {}, 'PathGen-Test');

				// Build a mock FlowView with real providers
				let tmpMockFlowView =
				{
					_GeometryProvider: _GeometryProvider,
					_PathGenerator: _PathGenerator,
					_SVGHelperProvider: null,
					_ConnectorShapesProvider: null,
					_ThemeProvider: null
				};

				// Wire up PathGenerator's FlowView reference
				_PathGenerator._FlowView = tmpMockFlowView;

				_Renderer = new libConnectionRenderer(
					_Fable, { FlowView: tmpMockFlowView }, 'ConnRend-Test');
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
						libExpect(_Renderer.serviceType).to.equal('PictServiceFlowConnectionRenderer');
						fDone();
					}
				);
			}
		);

		// ---- _getBezierHandles ----

		suite
		(
			'_getBezierHandles',
			function ()
			{
				test
				(
					'should return empty array when no data',
					function (fDone)
					{
						libExpect(_Renderer._getBezierHandles(null)).to.deep.equal([]);
						libExpect(_Renderer._getBezierHandles({})).to.deep.equal([]);
						fDone();
					}
				);

				test
				(
					'should return empty array when HandleCustomized is false',
					function (fDone)
					{
						let tmpData = { HandleCustomized: false, BezierHandleX: 100, BezierHandleY: 50 };
						libExpect(_Renderer._getBezierHandles(tmpData)).to.deep.equal([]);
						fDone();
					}
				);

				test
				(
					'should migrate legacy BezierHandleX/Y to single-element array',
					function (fDone)
					{
						let tmpData =
						{
							HandleCustomized: true,
							BezierHandleX: 150,
							BezierHandleY: 75
						};

						let tmpResult = _Renderer._getBezierHandles(tmpData);
						libExpect(tmpResult).to.have.length(1);
						libExpect(tmpResult[0].x).to.equal(150);
						libExpect(tmpResult[0].y).to.equal(75);
						fDone();
					}
				);

				test
				(
					'should return BezierHandles array when present',
					function (fDone)
					{
						let tmpData =
						{
							HandleCustomized: true,
							BezierHandles: [
								{ x: 100, y: 50 },
								{ x: 200, y: 80 },
								{ x: 300, y: 50 }
							]
						};

						let tmpResult = _Renderer._getBezierHandles(tmpData);
						libExpect(tmpResult).to.have.length(3);
						libExpect(tmpResult[1].x).to.equal(200);
						fDone();
					}
				);

				test
				(
					'should prefer BezierHandles over legacy format',
					function (fDone)
					{
						let tmpData =
						{
							HandleCustomized: true,
							BezierHandles: [{ x: 100, y: 50 }],
							BezierHandleX: 999,
							BezierHandleY: 999
						};

						let tmpResult = _Renderer._getBezierHandles(tmpData);
						libExpect(tmpResult).to.have.length(1);
						libExpect(tmpResult[0].x).to.equal(100);
						fDone();
					}
				);

				test
				(
					'should return empty for empty BezierHandles with legacy fallback',
					function (fDone)
					{
						let tmpData =
						{
							HandleCustomized: true,
							BezierHandles: [],
							BezierHandleX: 150,
							BezierHandleY: 75
						};

						// Empty array → falls through to legacy
						let tmpResult = _Renderer._getBezierHandles(tmpData);
						libExpect(tmpResult).to.have.length(1);
						libExpect(tmpResult[0].x).to.equal(150);
						fDone();
					}
				);
			}
		);

		// ---- _distanceToSegment ----

		suite
		(
			'_distanceToSegment',
			function ()
			{
				test
				(
					'should return 0 for point on the segment',
					function (fDone)
					{
						// Point at midpoint of horizontal segment
						let tmpDist = _Renderer._distanceToSegment(50, 0, 0, 0, 100, 0);
						libExpect(tmpDist).to.be.closeTo(0, 0.001);
						fDone();
					}
				);

				test
				(
					'should compute perpendicular distance',
					function (fDone)
					{
						// Point 30 units above the midpoint of a horizontal segment
						let tmpDist = _Renderer._distanceToSegment(50, 30, 0, 0, 100, 0);
						libExpect(tmpDist).to.be.closeTo(30, 0.001);
						fDone();
					}
				);

				test
				(
					'should compute distance to endpoint when past segment',
					function (fDone)
					{
						// Point beyond the end of a horizontal segment
						let tmpDist = _Renderer._distanceToSegment(110, 0, 0, 0, 100, 0);
						libExpect(tmpDist).to.be.closeTo(10, 0.001);
						fDone();
					}
				);

				test
				(
					'should compute distance to start when before segment',
					function (fDone)
					{
						// Point before the start of a horizontal segment
						let tmpDist = _Renderer._distanceToSegment(-20, 0, 0, 0, 100, 0);
						libExpect(tmpDist).to.be.closeTo(20, 0.001);
						fDone();
					}
				);

				test
				(
					'should handle degenerate (zero-length) segment',
					function (fDone)
					{
						let tmpDist = _Renderer._distanceToSegment(30, 40, 0, 0, 0, 0);
						libExpect(tmpDist).to.be.closeTo(50, 0.001); // sqrt(900+1600)
						fDone();
					}
				);

				test
				(
					'should handle diagonal segments',
					function (fDone)
					{
						// Diagonal from (0,0) to (100,100), point at (0,100) (perpendicular)
						let tmpDist = _Renderer._distanceToSegment(0, 100, 0, 0, 100, 100);
						// Distance from (0,100) to the line y=x is |0-100|/sqrt(2) ≈ 70.71
						libExpect(tmpDist).to.be.closeTo(70.71, 0.1);
						fDone();
					}
				);
			}
		);

		// ---- computeInsertionIndex ----

		suite
		(
			'computeInsertionIndex',
			function ()
			{
				test
				(
					'should return 0 for click near the only segment (no handles)',
					function (fDone)
					{
						let tmpStart = { x: 0, y: 50, side: 'right' };
						let tmpEnd = { x: 400, y: 50, side: 'left' };

						let tmpIndex = _Renderer.computeInsertionIndex(
							[], { x: 200, y: 50 }, tmpStart, tmpEnd);

						libExpect(tmpIndex).to.equal(0);
						fDone();
					}
				);

				test
				(
					'should return 0 for click before first handle',
					function (fDone)
					{
						let tmpStart = { x: 0, y: 50, side: 'right' };
						let tmpEnd = { x: 400, y: 50, side: 'left' };
						let tmpHandles = [{ x: 250, y: 100 }];

						// Click near the start, before the handle
						let tmpIndex = _Renderer.computeInsertionIndex(
							tmpHandles, { x: 60, y: 50 }, tmpStart, tmpEnd);

						libExpect(tmpIndex).to.equal(0);
						fDone();
					}
				);

				test
				(
					'should return 1 for click after first handle',
					function (fDone)
					{
						let tmpStart = { x: 0, y: 50, side: 'right' };
						let tmpEnd = { x: 400, y: 50, side: 'left' };
						let tmpHandles = [{ x: 100, y: 100 }];

						// Click near the end, after the handle
						let tmpIndex = _Renderer.computeInsertionIndex(
							tmpHandles, { x: 340, y: 50 }, tmpStart, tmpEnd);

						libExpect(tmpIndex).to.equal(1);
						fDone();
					}
				);

				test
				(
					'should pick correct segment among multiple handles',
					function (fDone)
					{
						let tmpStart = { x: 0, y: 50, side: 'right' };
						let tmpEnd = { x: 600, y: 50, side: 'left' };
						let tmpHandles = [
							{ x: 150, y: 100 },
							{ x: 300, y: 50 },
							{ x: 450, y: 100 }
						];

						// Click between handle[1] and handle[2]
						let tmpIndex = _Renderer.computeInsertionIndex(
							tmpHandles, { x: 375, y: 75 }, tmpStart, tmpEnd);

						libExpect(tmpIndex).to.equal(2);
						fDone();
					}
				);
			}
		);

		// ---- _computeDirectionalGeometry ----

		suite
		(
			'_computeDirectionalGeometry',
			function ()
			{
				test
				(
					'should compute departure and approach with straight segments',
					function (fDone)
					{
						let tmpGeo = _Renderer._computeDirectionalGeometry(
							{ x: 100, y: 50, side: 'right' },
							{ x: 400, y: 150, side: 'left' }
						);

						// Departure: x + dx*20 = 100 + 1*20 = 120
						libExpect(tmpGeo.departX).to.equal(120);
						libExpect(tmpGeo.departY).to.equal(50);
						// Approach: x + dx*20 = 400 + (-1)*20 = 380
						libExpect(tmpGeo.approachX).to.equal(380);
						libExpect(tmpGeo.approachY).to.equal(150);
						fDone();
					}
				);

				test
				(
					'should compute control points extending in port direction',
					function (fDone)
					{
						let tmpGeo = _Renderer._computeDirectionalGeometry(
							{ x: 100, y: 50, side: 'right' },
							{ x: 400, y: 50, side: 'left' }
						);

						// CP1 should be to the right of depart (dx=1)
						libExpect(tmpGeo.cp1X).to.be.greaterThan(tmpGeo.departX);
						libExpect(tmpGeo.cp1Y).to.equal(tmpGeo.departY);

						// CP2 should be to the left of approach (dx=-1, so approach + endDir*offset)
						libExpect(tmpGeo.cp2X).to.be.lessThan(tmpGeo.approachX);
						libExpect(tmpGeo.cp2Y).to.equal(tmpGeo.approachY);
						fDone();
					}
				);

				test
				(
					'should handle vertical port directions',
					function (fDone)
					{
						let tmpGeo = _Renderer._computeDirectionalGeometry(
							{ x: 100, y: 50, side: 'bottom' },
							{ x: 100, y: 250, side: 'top' }
						);

						// Bottom port: dy=1, so depart is below start
						libExpect(tmpGeo.departY).to.equal(70); // 50 + 1*20
						// Top port: dy=-1, so approach is above end
						libExpect(tmpGeo.approachY).to.equal(230); // 250 + (-1)*20
						fDone();
					}
				);

				test
				(
					'should return direction vectors',
					function (fDone)
					{
						let tmpGeo = _Renderer._computeDirectionalGeometry(
							{ x: 100, y: 50, side: 'right' },
							{ x: 400, y: 150, side: 'top' }
						);

						libExpect(tmpGeo.startDir).to.deep.equal({ dx: 1, dy: 0 });
						libExpect(tmpGeo.endDir).to.deep.equal({ dx: 0, dy: -1 });
						fDone();
					}
				);
			}
		);

		// ---- _generateDirectionalPath ----

		suite
		(
			'_generateDirectionalPath',
			function ()
			{
				test
				(
					'should produce valid SVG path string',
					function (fDone)
					{
						let tmpPath = _Renderer._generateDirectionalPath(
							{ x: 0, y: 50, side: 'right' },
							{ x: 300, y: 50, side: 'left' }
						);

						libExpect(tmpPath).to.be.a('string');
						libExpect(tmpPath).to.match(/^M /);
						libExpect(tmpPath).to.contain('C');
						libExpect(tmpPath).to.contain('L');
						fDone();
					}
				);
			}
		);

		// ---- _generateMultiHandleBezierPath ----

		suite
		(
			'_generateMultiHandleBezierPath',
			function ()
			{
				test
				(
					'should produce path with correct segment count for 1 handle',
					function (fDone)
					{
						let tmpPath = _Renderer._generateMultiHandleBezierPath(
							{ x: 0, y: 50, side: 'right' },
							{ x: 400, y: 50, side: 'left' },
							[{ x: 200, y: 100 }]
						);

						libExpect(tmpPath).to.be.a('string');
						// 1 handle → 2 cubic segments
						let tmpCCount = (tmpPath.match(/C /g) || []).length;
						libExpect(tmpCCount).to.equal(2);
						fDone();
					}
				);

				test
				(
					'should produce path with 3 segments for 2 handles',
					function (fDone)
					{
						let tmpPath = _Renderer._generateMultiHandleBezierPath(
							{ x: 0, y: 50, side: 'right' },
							{ x: 400, y: 50, side: 'left' },
							[{ x: 120, y: 80 }, { x: 280, y: 80 }]
						);

						let tmpCCount = (tmpPath.match(/C /g) || []).length;
						libExpect(tmpCCount).to.equal(3);
						fDone();
					}
				);
			}
		);

		// ---- getAutoMidpoint ----

		suite
		(
			'getAutoMidpoint',
			function ()
			{
				test
				(
					'should return a point between start and end',
					function (fDone)
					{
						let tmpMid = _Renderer.getAutoMidpoint(
							{ x: 0, y: 50, side: 'right' },
							{ x: 400, y: 50, side: 'left' }
						);

						libExpect(tmpMid.x).to.be.greaterThan(0);
						libExpect(tmpMid.x).to.be.lessThan(400);
						fDone();
					}
				);

				test
				(
					'should be near horizontal midpoint for same-y endpoints',
					function (fDone)
					{
						let tmpMid = _Renderer.getAutoMidpoint(
							{ x: 0, y: 50, side: 'right' },
							{ x: 400, y: 50, side: 'left' }
						);

						// For symmetric right→left facing each other, midpoint x should
						// be near 200, and y should stay near 50
						libExpect(tmpMid.x).to.be.closeTo(200, 20);
						libExpect(tmpMid.y).to.be.closeTo(50, 5);
						fDone();
					}
				);
			}
		);

		// ---- _generateOrthogonalPath ----

		suite
		(
			'_generateOrthogonalPath',
			function ()
			{
				test
				(
					'should produce orthogonal path with no curves',
					function (fDone)
					{
						let tmpPath = _Renderer._generateOrthogonalPath(
							{ x: 0, y: 50, side: 'right' },
							{ x: 300, y: 150, side: 'left' },
							null, 0
						);

						libExpect(tmpPath).to.be.a('string');
						libExpect(tmpPath).to.not.contain('C');
						fDone();
					}
				);

				test
				(
					'should use provided corners when given',
					function (fDone)
					{
						let tmpCorners =
						{
							corner1: { x: 100, y: 50 },
							corner2: { x: 100, y: 150 }
						};

						let tmpPath = _Renderer._generateOrthogonalPath(
							{ x: 0, y: 50, side: 'right' },
							{ x: 300, y: 150, side: 'left' },
							tmpCorners, 0
						);

						libExpect(tmpPath).to.contain('100 50');
						libExpect(tmpPath).to.contain('100 150');
						fDone();
					}
				);
			}
		);
	}
);
