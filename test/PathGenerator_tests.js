const libFable = require('fable');
const libChai = require('chai');
const libExpect = libChai.expect;

const libPathGenerator = require('../source/services/PictService-Flow-PathGenerator.js');

suite
(
	'PictService-Flow-PathGenerator',
	function ()
	{
		let _Fable;
		let _PathGenerator;

		// Minimal mock FlowView with a GeometryProvider
		let _MockFlowView;

		setup
		(
			function ()
			{
				_Fable = new libFable({});

				_MockFlowView =
				{
					_GeometryProvider:
					{
						sideDirection: function (pSide)
						{
							switch (pSide)
							{
								case 'left':   return { dx: -1, dy: 0 };
								case 'right':  return { dx: 1, dy: 0 };
								case 'top':    return { dx: 0, dy: -1 };
								case 'bottom': return { dx: 0, dy: 1 };
								default:       return { dx: 1, dy: 0 };
							}
						}
					}
				};

				_PathGenerator = new libPathGenerator(_Fable, { FlowView: _MockFlowView }, 'PathGen-Test');
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
						libExpect(_PathGenerator).to.be.an('object');
						libExpect(_PathGenerator.serviceType).to.equal('PictServiceFlowPathGenerator');
						fDone();
					}
				);

				test
				(
					'should store FlowView reference from options',
					function (fDone)
					{
						libExpect(_PathGenerator._FlowView).to.equal(_MockFlowView);
						fDone();
					}
				);

				test
				(
					'should handle missing FlowView in options',
					function (fDone)
					{
						let tmpGen = new libPathGenerator(_Fable, {}, 'NoView');
						libExpect(tmpGen._FlowView).to.be.null;
						fDone();
					}
				);
			}
		);

		// ---- computeDepartApproach ----

		suite
		(
			'computeDepartApproach',
			function ()
			{
				test
				(
					'should compute departure and approach for right-to-left',
					function (fDone)
					{
						let tmpResult = _PathGenerator.computeDepartApproach(
							{ x: 100, y: 50, side: 'right' },
							{ x: 300, y: 50, side: 'left' },
							20
						);

						libExpect(tmpResult.departX).to.equal(120);
						libExpect(tmpResult.departY).to.equal(50);
						libExpect(tmpResult.approachX).to.equal(280);
						libExpect(tmpResult.approachY).to.equal(50);
						libExpect(tmpResult.fromDir).to.deep.equal({ dx: 1, dy: 0 });
						libExpect(tmpResult.toDir).to.deep.equal({ dx: -1, dy: 0 });
						fDone();
					}
				);

				test
				(
					'should compute departure for top-to-bottom',
					function (fDone)
					{
						let tmpResult = _PathGenerator.computeDepartApproach(
							{ x: 100, y: 50, side: 'top' },
							{ x: 100, y: 200, side: 'bottom' },
							30
						);

						libExpect(tmpResult.departX).to.equal(100);
						libExpect(tmpResult.departY).to.equal(20);
						libExpect(tmpResult.approachX).to.equal(100);
						libExpect(tmpResult.approachY).to.equal(230);
						fDone();
					}
				);

				test
				(
					'should default to right/left when side is missing',
					function (fDone)
					{
						let tmpResult = _PathGenerator.computeDepartApproach(
							{ x: 0, y: 0 },
							{ x: 100, y: 0 },
							10
						);

						// Default right → dx=1, default left → dx=-1
						libExpect(tmpResult.departX).to.equal(10);
						libExpect(tmpResult.approachX).to.equal(90);
						fDone();
					}
				);
			}
		);

		// ---- computeAutoOrthogonalCorners ----

		suite
		(
			'computeAutoOrthogonalCorners',
			function ()
			{
				test
				(
					'should compute Z-shaped corridor for both-horizontal',
					function (fDone)
					{
						// Both horizontal: corridor is vertical at midpoint X
						let tmpResult = _PathGenerator.computeAutoOrthogonalCorners(
							100, 50,   // depart
							300, 150,  // approach
							{ dx: 1, dy: 0 },  // from horizontal
							{ dx: -1, dy: 0 },  // to horizontal
							0
						);

						libExpect(tmpResult.corner1.x).to.equal(200); // midX
						libExpect(tmpResult.corner1.y).to.equal(50);  // departY
						libExpect(tmpResult.corner2.x).to.equal(200); // midX
						libExpect(tmpResult.corner2.y).to.equal(150); // approachY
						libExpect(tmpResult.midpoint.x).to.equal(200);
						libExpect(tmpResult.midpoint.y).to.equal(100); // avg Y
						fDone();
					}
				);

				test
				(
					'should compute Z-shaped corridor for both-vertical',
					function (fDone)
					{
						let tmpResult = _PathGenerator.computeAutoOrthogonalCorners(
							50, 100,
							150, 300,
							{ dx: 0, dy: 1 },   // from vertical (downward)
							{ dx: 0, dy: -1 },  // to vertical (upward)
							0
						);

						libExpect(tmpResult.corner1.x).to.equal(50);
						libExpect(tmpResult.corner1.y).to.equal(200); // midY
						libExpect(tmpResult.corner2.x).to.equal(150);
						libExpect(tmpResult.corner2.y).to.equal(200); // midY
						fDone();
					}
				);

				test
				(
					'should compute L-bend for horizontal-to-vertical',
					function (fDone)
					{
						let tmpResult = _PathGenerator.computeAutoOrthogonalCorners(
							100, 50,
							300, 200,
							{ dx: 1, dy: 0 },  // from horizontal
							{ dx: 0, dy: -1 },  // to vertical
							0
						);

						// H→V: corner at (approachX, departY)
						libExpect(tmpResult.corner1.x).to.equal(300);
						libExpect(tmpResult.corner1.y).to.equal(50);
						fDone();
					}
				);

				test
				(
					'should compute L-bend for vertical-to-horizontal',
					function (fDone)
					{
						let tmpResult = _PathGenerator.computeAutoOrthogonalCorners(
							100, 50,
							300, 200,
							{ dx: 0, dy: 1 },  // from vertical
							{ dx: -1, dy: 0 },  // to horizontal
							0
						);

						// V→H: corner at (departX, approachY)
						libExpect(tmpResult.corner1.x).to.equal(100);
						libExpect(tmpResult.corner1.y).to.equal(200);
						fDone();
					}
				);

				test
				(
					'should apply midOffset for both-horizontal',
					function (fDone)
					{
						let tmpResult = _PathGenerator.computeAutoOrthogonalCorners(
							100, 50,
							300, 150,
							{ dx: 1, dy: 0 },
							{ dx: -1, dy: 0 },
							25  // offset
						);

						libExpect(tmpResult.corner1.x).to.equal(225); // 200 + 25
						libExpect(tmpResult.corner2.x).to.equal(225);
						fDone();
					}
				);
			}
		);

		// ---- evaluateCubicBezier ----

		suite
		(
			'evaluateCubicBezier',
			function ()
			{
				test
				(
					'should return start point at t=0',
					function (fDone)
					{
						let tmpResult = _PathGenerator.evaluateCubicBezier(
							{ x: 10, y: 20 },
							{ x: 40, y: 80 },
							{ x: 60, y: 80 },
							{ x: 90, y: 20 },
							0
						);

						libExpect(tmpResult.x).to.be.closeTo(10, 0.001);
						libExpect(tmpResult.y).to.be.closeTo(20, 0.001);
						fDone();
					}
				);

				test
				(
					'should return end point at t=1',
					function (fDone)
					{
						let tmpResult = _PathGenerator.evaluateCubicBezier(
							{ x: 10, y: 20 },
							{ x: 40, y: 80 },
							{ x: 60, y: 80 },
							{ x: 90, y: 20 },
							1
						);

						libExpect(tmpResult.x).to.be.closeTo(90, 0.001);
						libExpect(tmpResult.y).to.be.closeTo(20, 0.001);
						fDone();
					}
				);

				test
				(
					'should return midpoint at t=0.5 for a straight-line bezier',
					function (fDone)
					{
						// When all control points are collinear, the midpoint
						// should be on the line
						let tmpResult = _PathGenerator.evaluateCubicBezier(
							{ x: 0, y: 0 },
							{ x: 33.33, y: 0 },
							{ x: 66.67, y: 0 },
							{ x: 100, y: 0 },
							0.5
						);

						libExpect(tmpResult.x).to.be.closeTo(50, 0.1);
						libExpect(tmpResult.y).to.be.closeTo(0, 0.1);
						fDone();
					}
				);

				test
				(
					'should compute intermediate points for symmetric S-curve',
					function (fDone)
					{
						let tmpResult = _PathGenerator.evaluateCubicBezier(
							{ x: 0, y: 0 },
							{ x: 0, y: 100 },
							{ x: 100, y: -100 },
							{ x: 100, y: 0 },
							0.5
						);

						// At t=0.5, x should be exactly 50 for this symmetric curve
						libExpect(tmpResult.x).to.be.closeTo(50, 0.001);
						// y should be 0 for this symmetric arrangement
						libExpect(tmpResult.y).to.be.closeTo(0, 0.001);
						fDone();
					}
				);
			}
		);

		// ---- buildBezierPathString ----

		suite
		(
			'buildBezierPathString',
			function ()
			{
				test
				(
					'should produce valid SVG path string',
					function (fDone)
					{
						let tmpResult = _PathGenerator.buildBezierPathString(
							{ x: 0, y: 0 },
							{ x: 20, y: 0 },
							{ x: 50, y: 0 },
							{ x: 80, y: 0 },
							{ x: 100, y: 0 },
							{ x: 120, y: 0 }
						);

						libExpect(tmpResult).to.be.a('string');
						libExpect(tmpResult).to.match(/^M /);
						libExpect(tmpResult).to.contain('L');
						libExpect(tmpResult).to.contain('C');
						fDone();
					}
				);

				test
				(
					'should include all coordinate values',
					function (fDone)
					{
						let tmpResult = _PathGenerator.buildBezierPathString(
							{ x: 10, y: 20 },
							{ x: 30, y: 20 },
							{ x: 50, y: 40 },
							{ x: 70, y: 40 },
							{ x: 90, y: 20 },
							{ x: 110, y: 20 }
						);

						libExpect(tmpResult).to.contain('M 10 20');
						libExpect(tmpResult).to.contain('L 30 20');
						libExpect(tmpResult).to.contain('C 50 40');
						libExpect(tmpResult).to.contain('L 110 20');
						fDone();
					}
				);
			}
		);

		// ---- buildSplitBezierPathString ----

		suite
		(
			'buildSplitBezierPathString',
			function ()
			{
				test
				(
					'should produce SVG path with two cubic segments',
					function (fDone)
					{
						let tmpResult = _PathGenerator.buildSplitBezierPathString(
							{ x: 0, y: 0 },    // start
							{ x: 20, y: 0 },   // depart
							{ x: 40, y: 10 },  // cp1a
							{ x: 45, y: 20 },  // cp1b
							{ x: 50, y: 30 },  // handle
							{ x: 55, y: 20 },  // cp2a
							{ x: 60, y: 10 },  // cp2b
							{ x: 80, y: 0 },   // approach
							{ x: 100, y: 0 }   // end
						);

						libExpect(tmpResult).to.be.a('string');
						// Should have M, L, two C commands, and final L
						let tmpCCount = (tmpResult.match(/C /g) || []).length;
						libExpect(tmpCCount).to.equal(2);
						fDone();
					}
				);
			}
		);

		// ---- buildOrthogonalPathString ----

		suite
		(
			'buildOrthogonalPathString',
			function ()
			{
				test
				(
					'should produce SVG path with only L commands (no curves)',
					function (fDone)
					{
						let tmpResult = _PathGenerator.buildOrthogonalPathString(
							{ x: 0, y: 50 },
							{ x: 20, y: 50 },
							{ x: 60, y: 50 },
							{ x: 60, y: 100 },
							{ x: 80, y: 100 },
							{ x: 100, y: 100 }
						);

						libExpect(tmpResult).to.match(/^M /);
						libExpect(tmpResult).to.not.contain('C');
						// Should have M + 5 L commands
						let tmpLCount = (tmpResult.match(/L /g) || []).length;
						libExpect(tmpLCount).to.equal(5);
						fDone();
					}
				);
			}
		);

		// ---- computeDirectionalGeometry ----

		suite
		(
			'computeDirectionalGeometry',
			function ()
			{
				test
				(
					'should compute departure and approach for right-to-left facing',
					function (fDone)
					{
						let tmpGeo = _PathGenerator.computeDirectionalGeometry(
							{ x: 100, y: 50, side: 'right' },
							{ x: 400, y: 50, side: 'left' }
						);

						libExpect(tmpGeo.departX).to.equal(120);
						libExpect(tmpGeo.departY).to.equal(50);
						libExpect(tmpGeo.approachX).to.equal(380);
						libExpect(tmpGeo.approachY).to.equal(50);
						fDone();
					}
				);

				test
				(
					'should use facing-each-other offset when ports face each other',
					function (fDone)
					{
						let tmpGeo = _PathGenerator.computeDirectionalGeometry(
							{ x: 100, y: 50, side: 'right' },
							{ x: 400, y: 50, side: 'left' }
						);

						// Facing: offset = max(inlineDist*0.35, 30)
						// inlineDist = |380-120| = 260, offset = 91
						let tmpOffset = tmpGeo.cp1X - tmpGeo.departX;
						libExpect(tmpOffset).to.be.closeTo(91, 1);
						fDone();
					}
				);

				test
				(
					'should handle perpendicular exits',
					function (fDone)
					{
						let tmpGeo = _PathGenerator.computeDirectionalGeometry(
							{ x: 100, y: 50, side: 'right' },
							{ x: 300, y: 200, side: 'top' }
						);

						libExpect(tmpGeo.startDir).to.deep.equal({ dx: 1, dy: 0 });
						libExpect(tmpGeo.endDir).to.deep.equal({ dx: 0, dy: -1 });
						libExpect(tmpGeo.cp1X).to.be.greaterThan(tmpGeo.departX);
						libExpect(tmpGeo.cp2Y).to.be.lessThan(tmpGeo.approachY);
						fDone();
					}
				);

				test
				(
					'should handle vertical facing ports',
					function (fDone)
					{
						let tmpGeo = _PathGenerator.computeDirectionalGeometry(
							{ x: 100, y: 50, side: 'bottom' },
							{ x: 100, y: 250, side: 'top' }
						);

						libExpect(tmpGeo.departY).to.equal(70);
						libExpect(tmpGeo.approachY).to.equal(230);
						fDone();
					}
				);

				test
				(
					'should return direction vectors',
					function (fDone)
					{
						let tmpGeo = _PathGenerator.computeDirectionalGeometry(
							{ x: 0, y: 0, side: 'bottom' },
							{ x: 200, y: 200, side: 'left' }
						);

						libExpect(tmpGeo.startDir).to.deep.equal({ dx: 0, dy: 1 });
						libExpect(tmpGeo.endDir).to.deep.equal({ dx: -1, dy: 0 });
						fDone();
					}
				);

				test
				(
					'should use same-axis-not-facing offset when both face same direction',
					function (fDone)
					{
						// Right port facing right, left port facing left — reversed so not facing
						let tmpGeo = _PathGenerator.computeDirectionalGeometry(
							{ x: 400, y: 50, side: 'right' },
							{ x: 100, y: 50, side: 'left' }
						);

						// Same axis, not facing: max(baseOffset, 60)
						let tmpOffset = tmpGeo.cp1X - tmpGeo.departX;
						libExpect(tmpOffset).to.be.at.least(60);
						fDone();
					}
				);
			}
		);

		// ---- distanceToSegment ----

		suite
		(
			'distanceToSegment',
			function ()
			{
				test
				(
					'should return 0 for point on the segment',
					function (fDone)
					{
						let tmpDist = _PathGenerator.distanceToSegment(50, 0, 0, 0, 100, 0);
						libExpect(tmpDist).to.be.closeTo(0, 0.001);
						fDone();
					}
				);

				test
				(
					'should compute perpendicular distance',
					function (fDone)
					{
						let tmpDist = _PathGenerator.distanceToSegment(50, 30, 0, 0, 100, 0);
						libExpect(tmpDist).to.be.closeTo(30, 0.001);
						fDone();
					}
				);

				test
				(
					'should compute distance to endpoint when past segment',
					function (fDone)
					{
						let tmpDist = _PathGenerator.distanceToSegment(110, 0, 0, 0, 100, 0);
						libExpect(tmpDist).to.be.closeTo(10, 0.001);
						fDone();
					}
				);

				test
				(
					'should compute distance to start when before segment',
					function (fDone)
					{
						let tmpDist = _PathGenerator.distanceToSegment(-20, 0, 0, 0, 100, 0);
						libExpect(tmpDist).to.be.closeTo(20, 0.001);
						fDone();
					}
				);

				test
				(
					'should handle degenerate (zero-length) segment',
					function (fDone)
					{
						let tmpDist = _PathGenerator.distanceToSegment(30, 40, 0, 0, 0, 0);
						libExpect(tmpDist).to.be.closeTo(50, 0.001);
						fDone();
					}
				);

				test
				(
					'should handle diagonal segments',
					function (fDone)
					{
						let tmpDist = _PathGenerator.distanceToSegment(0, 100, 0, 0, 100, 100);
						libExpect(tmpDist).to.be.closeTo(70.71, 0.1);
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
						let tmpMid = _PathGenerator.getAutoMidpoint(
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
					'should be near horizontal midpoint for symmetric endpoints',
					function (fDone)
					{
						let tmpMid = _PathGenerator.getAutoMidpoint(
							{ x: 0, y: 50, side: 'right' },
							{ x: 400, y: 50, side: 'left' }
						);

						libExpect(tmpMid.x).to.be.closeTo(200, 20);
						libExpect(tmpMid.y).to.be.closeTo(50, 5);
						fDone();
					}
				);

				test
				(
					'should handle vertical endpoints',
					function (fDone)
					{
						let tmpMid = _PathGenerator.getAutoMidpoint(
							{ x: 100, y: 0, side: 'bottom' },
							{ x: 100, y: 400, side: 'top' }
						);

						libExpect(tmpMid.y).to.be.greaterThan(0);
						libExpect(tmpMid.y).to.be.lessThan(400);
						libExpect(tmpMid.x).to.be.closeTo(100, 5);
						fDone();
					}
				);

				test
				(
					'should match manual evaluateCubicBezier at t=0.5',
					function (fDone)
					{
						let tmpStart = { x: 0, y: 50, side: 'right' };
						let tmpEnd = { x: 400, y: 150, side: 'left' };

						let tmpMid = _PathGenerator.getAutoMidpoint(tmpStart, tmpEnd);
						let tmpGeo = _PathGenerator.computeDirectionalGeometry(tmpStart, tmpEnd);

						let tmpManual = _PathGenerator.evaluateCubicBezier(
							{ x: tmpGeo.departX, y: tmpGeo.departY },
							{ x: tmpGeo.cp1X, y: tmpGeo.cp1Y },
							{ x: tmpGeo.cp2X, y: tmpGeo.cp2Y },
							{ x: tmpGeo.approachX, y: tmpGeo.approachY },
							0.5
						);

						libExpect(tmpMid.x).to.be.closeTo(tmpManual.x, 0.001);
						libExpect(tmpMid.y).to.be.closeTo(tmpManual.y, 0.001);
						fDone();
					}
				);
			}
		);

		// ---- getAutoMidpointSimple ----

		suite
		(
			'getAutoMidpointSimple',
			function ()
			{
				test
				(
					'should return a point between from and to',
					function (fDone)
					{
						let tmpMid = _PathGenerator.getAutoMidpointSimple(
							{ x: 0, y: 50, side: 'right' },
							{ x: 400, y: 50, side: 'left' },
							20
						);

						libExpect(tmpMid.x).to.be.greaterThan(0);
						libExpect(tmpMid.x).to.be.lessThan(400);
						fDone();
					}
				);

				test
				(
					'should be near horizontal midpoint for symmetric endpoints',
					function (fDone)
					{
						let tmpMid = _PathGenerator.getAutoMidpointSimple(
							{ x: 0, y: 50, side: 'right' },
							{ x: 400, y: 50, side: 'left' },
							20
						);

						libExpect(tmpMid.x).to.be.closeTo(200, 20);
						libExpect(tmpMid.y).to.be.closeTo(50, 5);
						fDone();
					}
				);

				test
				(
					'should handle vertical endpoints',
					function (fDone)
					{
						let tmpMid = _PathGenerator.getAutoMidpointSimple(
							{ x: 100, y: 0, side: 'bottom' },
							{ x: 100, y: 400, side: 'top' },
							20
						);

						libExpect(tmpMid.y).to.be.greaterThan(0);
						libExpect(tmpMid.y).to.be.lessThan(400);
						libExpect(tmpMid.x).to.be.closeTo(100, 5);
						fDone();
					}
				);

				test
				(
					'should use span-based control points (different strategy than getAutoMidpoint)',
					function (fDone)
					{
						let tmpStart = { x: 0, y: 50, side: 'right' };
						let tmpEnd = { x: 400, y: 200, side: 'left' };

						let tmpSimple = _PathGenerator.getAutoMidpointSimple(tmpStart, tmpEnd, 20);
						let tmpFull = _PathGenerator.getAutoMidpoint(tmpStart, tmpEnd);

						// Both should be valid midpoints
						libExpect(tmpSimple.x).to.be.a('number');
						libExpect(tmpSimple.y).to.be.a('number');
						libExpect(tmpFull.x).to.be.a('number');
						libExpect(tmpFull.y).to.be.a('number');
						fDone();
					}
				);
			}
		);

		// ---- buildMultiBezierPathString ----

		suite
		(
			'buildMultiBezierPathString',
			function ()
			{
				test
				(
					'should produce path with N+1 cubic segments for N handles',
					function (fDone)
					{
						let tmpHandles = [
							{ x: 150, y: 80 },
							{ x: 250, y: 120 }
						];

						let tmpResult = _PathGenerator.buildMultiBezierPathString(
							{ x: 0, y: 50 },     // start
							{ x: 20, y: 50 },    // depart
							tmpHandles,
							{ x: 380, y: 50 },   // approach
							{ x: 400, y: 50 },   // end
							{ dx: 1, dy: 0 },    // startDir
							{ dx: -1, dy: 0 }    // endDir
						);

						libExpect(tmpResult).to.be.a('string');
						// 2 handles → 3 segments → 3 C commands
						let tmpCCount = (tmpResult.match(/C /g) || []).length;
						libExpect(tmpCCount).to.equal(3);
						fDone();
					}
				);

				test
				(
					'should produce path with 2 cubic segments for 1 handle',
					function (fDone)
					{
						let tmpHandles = [{ x: 200, y: 100 }];

						let tmpResult = _PathGenerator.buildMultiBezierPathString(
							{ x: 0, y: 50 },
							{ x: 20, y: 50 },
							tmpHandles,
							{ x: 380, y: 50 },
							{ x: 400, y: 50 },
							{ dx: 1, dy: 0 },
							{ dx: -1, dy: 0 }
						);

						let tmpCCount = (tmpResult.match(/C /g) || []).length;
						libExpect(tmpCCount).to.equal(2);
						fDone();
					}
				);

				test
				(
					'should produce single segment for zero handles',
					function (fDone)
					{
						let tmpResult = _PathGenerator.buildMultiBezierPathString(
							{ x: 0, y: 50 },
							{ x: 20, y: 50 },
							[],
							{ x: 380, y: 50 },
							{ x: 400, y: 50 },
							{ dx: 1, dy: 0 },
							{ dx: -1, dy: 0 }
						);

						let tmpCCount = (tmpResult.match(/C /g) || []).length;
						libExpect(tmpCCount).to.equal(1);
						fDone();
					}
				);

				test
				(
					'should start with M and end with L',
					function (fDone)
					{
						let tmpResult = _PathGenerator.buildMultiBezierPathString(
							{ x: 10, y: 20 },
							{ x: 30, y: 20 },
							[{ x: 100, y: 80 }],
							{ x: 170, y: 20 },
							{ x: 190, y: 20 },
							{ dx: 1, dy: 0 },
							{ dx: -1, dy: 0 }
						);

						libExpect(tmpResult).to.match(/^M 10 20/);
						libExpect(tmpResult).to.match(/L 190 20$/);
						fDone();
					}
				);

				test
				(
					'should handle vertical start/end directions',
					function (fDone)
					{
						let tmpResult = _PathGenerator.buildMultiBezierPathString(
							{ x: 100, y: 0 },
							{ x: 100, y: 20 },
							[{ x: 200, y: 100 }],
							{ x: 100, y: 180 },
							{ x: 100, y: 200 },
							{ dx: 0, dy: 1 },    // downward departure
							{ dx: 0, dy: -1 }    // upward approach
						);

						libExpect(tmpResult).to.be.a('string');
						libExpect(tmpResult).to.contain('C ');
						fDone();
					}
				);

				test
				(
					'should handle many handles (5+)',
					function (fDone)
					{
						let tmpHandles = [];
						for (let i = 0; i < 5; i++)
						{
							tmpHandles.push({ x: 50 + i * 60, y: 50 + (i % 2) * 80 });
						}

						let tmpResult = _PathGenerator.buildMultiBezierPathString(
							{ x: 0, y: 50 },
							{ x: 20, y: 50 },
							tmpHandles,
							{ x: 380, y: 50 },
							{ x: 400, y: 50 },
							{ dx: 1, dy: 0 },
							{ dx: -1, dy: 0 }
						);

						// 5 handles → 6 segments → 6 C commands
						let tmpCCount = (tmpResult.match(/C /g) || []).length;
						libExpect(tmpCCount).to.equal(6);
						fDone();
					}
				);
			}
		);
	}
);
