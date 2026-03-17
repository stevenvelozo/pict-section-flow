const libFable = require('fable');
const libChai = require('chai');
const libExpect = libChai.expect;

const libConnectionHandleManager = require('../source/services/PictService-Flow-ConnectionHandleManager.js');

suite
(
	'PictService-Flow-ConnectionHandleManager',
	function ()
	{
		let _Fable;
		let _HandleManager;
		let _MockFlowView;

		setup
		(
			function ()
			{
				_Fable = new libFable({});

				_MockFlowView =
				{
					fable: _Fable,
					log: _Fable.log,
					_FlowData:
					{
						Nodes:
						[
							{
								Hash: 'n1',
								X: 100, Y: 100,
								Width: 160, Height: 80,
								Ports:
								[
									{ Hash: 'p-out', Direction: 'output', Side: 'right', Label: 'Out' }
								]
							},
							{
								Hash: 'n2',
								X: 400, Y: 100,
								Width: 160, Height: 80,
								Ports:
								[
									{ Hash: 'p-in', Direction: 'input', Side: 'left', Label: 'In' }
								]
							}
						],
						Connections:
						[
							{
								Hash: 'c1',
								SourceNodeHash: 'n1',
								SourcePortHash: 'p-out',
								TargetNodeHash: 'n2',
								TargetPortHash: 'p-in',
								Data: {}
							}
						],
						OpenPanels: [],
						ViewState:
						{
							SelectedConnectionHash: null
						}
					},
					_ConnectionRenderer:
					{
						computeInsertionIndex: function () { return 0; },
						_computeDirectionalGeometry: function (pStart, pEnd)
						{
							return {
								departX: pStart.x + 20,
								departY: pStart.y,
								approachX: pEnd.x - 20,
								approachY: pEnd.y,
								startDir: { dx: 1, dy: 0 },
								endDir: { dx: -1, dy: 0 }
							};
						}
					},
					_TetherService:
					{
						resetHandlesForNode: function () {},
						resetHandlePositions: function () {}
					},
					_EventHandlerProvider:
					{
						fireEvent: function () {}
					},
					getConnection: function (pHash)
					{
						return _MockFlowView._FlowData.Connections.find(
							(pConn) => pConn.Hash === pHash
						) || null;
					},
					getPortPosition: function (pNodeHash, pPortHash)
					{
						let tmpNode = _MockFlowView._FlowData.Nodes.find((n) => n.Hash === pNodeHash);
						if (!tmpNode) return null;
						let tmpPort = tmpNode.Ports.find((p) => p.Hash === pPortHash);
						if (!tmpPort) return null;
						return {
							x: tmpPort.Side === 'right' ? tmpNode.X + tmpNode.Width : tmpNode.X,
							y: tmpNode.Y + tmpNode.Height / 2,
							side: tmpPort.Side
						};
					},
					_renderSingleConnection: function () {},
					renderFlow: function () {},
					marshalFromView: function () {}
				};

				_HandleManager = new libConnectionHandleManager(_Fable, { FlowView: _MockFlowView }, 'HM-Test');
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
						libExpect(_HandleManager).to.be.an('object');
						libExpect(_HandleManager.serviceType).to.equal('PictServiceFlowConnectionHandleManager');
						fDone();
					}
				);

				test
				(
					'should store FlowView reference from options',
					function (fDone)
					{
						libExpect(_HandleManager._FlowView).to.equal(_MockFlowView);
						fDone();
					}
				);

				test
				(
					'should handle missing FlowView',
					function (fDone)
					{
						let tmpManager = new libConnectionHandleManager(_Fable, {}, 'NoView');
						libExpect(tmpManager._FlowView).to.be.null;
						fDone();
					}
				);
			}
		);

		// ---- updateConnectionHandle ----

		suite
		(
			'updateConnectionHandle',
			function ()
			{
				test
				(
					'should update bezier-handle-N position',
					function (fDone)
					{
						let tmpConn = _MockFlowView._FlowData.Connections[0];
						tmpConn.Data.BezierHandles = [{ x: 200, y: 100 }];
						tmpConn.Data.HandleCustomized = true;

						_HandleManager.updateConnectionHandle('c1', 'bezier-handle-0', 250, 150);

						libExpect(tmpConn.Data.BezierHandles[0].x).to.equal(250);
						libExpect(tmpConn.Data.BezierHandles[0].y).to.equal(150);
						fDone();
					}
				);

				test
				(
					'should update bezier-midpoint with legacy sync',
					function (fDone)
					{
						let tmpConn = _MockFlowView._FlowData.Connections[0];
						tmpConn.Data = {};

						_HandleManager.updateConnectionHandle('c1', 'bezier-midpoint', 300, 200);

						libExpect(tmpConn.Data.HandleCustomized).to.be.true;
						libExpect(tmpConn.Data.BezierHandles).to.have.length(1);
						libExpect(tmpConn.Data.BezierHandles[0].x).to.equal(300);
						libExpect(tmpConn.Data.BezierHandles[0].y).to.equal(200);
						// Legacy fields should be kept in sync
						libExpect(tmpConn.Data.BezierHandleX).to.equal(300);
						libExpect(tmpConn.Data.BezierHandleY).to.equal(200);
						fDone();
					}
				);

				test
				(
					'should update existing bezier-midpoint handle',
					function (fDone)
					{
						let tmpConn = _MockFlowView._FlowData.Connections[0];
						tmpConn.Data = { BezierHandles: [{ x: 100, y: 100 }] };

						_HandleManager.updateConnectionHandle('c1', 'bezier-midpoint', 500, 500);

						libExpect(tmpConn.Data.BezierHandles[0].x).to.equal(500);
						libExpect(tmpConn.Data.BezierHandles[0].y).to.equal(500);
						fDone();
					}
				);

				test
				(
					'should update ortho-corner1',
					function (fDone)
					{
						let tmpConn = _MockFlowView._FlowData.Connections[0];
						tmpConn.Data = {};

						_HandleManager.updateConnectionHandle('c1', 'ortho-corner1', 250, 80);

						libExpect(tmpConn.Data.HandleCustomized).to.be.true;
						libExpect(tmpConn.Data.OrthoCorner1X).to.equal(250);
						libExpect(tmpConn.Data.OrthoCorner1Y).to.equal(80);
						fDone();
					}
				);

				test
				(
					'should update ortho-corner2',
					function (fDone)
					{
						let tmpConn = _MockFlowView._FlowData.Connections[0];
						tmpConn.Data = {};

						_HandleManager.updateConnectionHandle('c1', 'ortho-corner2', 350, 120);

						libExpect(tmpConn.Data.OrthoCorner2X).to.equal(350);
						libExpect(tmpConn.Data.OrthoCorner2Y).to.equal(120);
						fDone();
					}
				);

				test
				(
					'should compute OrthoMidOffset for horizontal departure',
					function (fDone)
					{
						let tmpConn = _MockFlowView._FlowData.Connections[0];
						tmpConn.Data = {};

						_HandleManager.updateConnectionHandle('c1', 'ortho-midpoint', 300, 100);

						libExpect(tmpConn.Data.OrthoMidOffset).to.be.a('number');
						fDone();
					}
				);

				test
				(
					'should call _renderSingleConnection for real-time feedback',
					function (fDone)
					{
						let tmpRenderCalled = false;
						_MockFlowView._renderSingleConnection = function () { tmpRenderCalled = true; };

						let tmpConn = _MockFlowView._FlowData.Connections[0];
						tmpConn.Data = {};

						_HandleManager.updateConnectionHandle('c1', 'ortho-corner1', 250, 80);

						libExpect(tmpRenderCalled).to.be.true;
						fDone();
					}
				);

				test
				(
					'should do nothing for non-existent connection',
					function (fDone)
					{
						// Should not throw
						_HandleManager.updateConnectionHandle('non-existent', 'bezier-midpoint', 100, 100);
						fDone();
					}
				);

				test
				(
					'should do nothing when no FlowView',
					function (fDone)
					{
						let tmpManager = new libConnectionHandleManager(_Fable, {}, 'NoView');
						tmpManager.updateConnectionHandle('c1', 'bezier-midpoint', 100, 100);
						fDone();
					}
				);
			}
		);

		// ---- addConnectionHandle ----

		suite
		(
			'addConnectionHandle',
			function ()
			{
				test
				(
					'should add a handle to a connection',
					function (fDone)
					{
						let tmpConn = _MockFlowView._FlowData.Connections[0];
						tmpConn.Data = {};

						_HandleManager.addConnectionHandle('c1', 250, 150);

						libExpect(tmpConn.Data.BezierHandles).to.have.length(1);
						libExpect(tmpConn.Data.BezierHandles[0].x).to.equal(250);
						libExpect(tmpConn.Data.BezierHandles[0].y).to.equal(150);
						libExpect(tmpConn.Data.HandleCustomized).to.be.true;
						libExpect(tmpConn.Data.LineMode).to.equal('bezier');
						fDone();
					}
				);

				test
				(
					'should migrate legacy format before adding',
					function (fDone)
					{
						let tmpConn = _MockFlowView._FlowData.Connections[0];
						tmpConn.Data = { BezierHandleX: 200, BezierHandleY: 100 };

						_HandleManager.addConnectionHandle('c1', 300, 200);

						// Should have migrated legacy + added new
						libExpect(tmpConn.Data.BezierHandles).to.have.length(2);
						fDone();
					}
				);

				test
				(
					'should use computeInsertionIndex for placement',
					function (fDone)
					{
						let tmpInsertIndexUsed = false;
						_MockFlowView._ConnectionRenderer.computeInsertionIndex = function ()
						{
							tmpInsertIndexUsed = true;
							return 0;
						};

						let tmpConn = _MockFlowView._FlowData.Connections[0];
						tmpConn.Data = {};

						_HandleManager.addConnectionHandle('c1', 250, 150);

						libExpect(tmpInsertIndexUsed).to.be.true;
						fDone();
					}
				);

				test
				(
					'should call renderFlow and marshalFromView',
					function (fDone)
					{
						let tmpRenderCalled = false;
						let tmpMarshalCalled = false;
						_MockFlowView.renderFlow = function () { tmpRenderCalled = true; };
						_MockFlowView.marshalFromView = function () { tmpMarshalCalled = true; };

						let tmpConn = _MockFlowView._FlowData.Connections[0];
						tmpConn.Data = {};

						_HandleManager.addConnectionHandle('c1', 250, 150);

						libExpect(tmpRenderCalled).to.be.true;
						libExpect(tmpMarshalCalled).to.be.true;
						fDone();
					}
				);

				test
				(
					'should fire onFlowChanged event',
					function (fDone)
					{
						let tmpEvents = [];
						_MockFlowView._EventHandlerProvider.fireEvent = function (pEvent) { tmpEvents.push(pEvent); };

						let tmpConn = _MockFlowView._FlowData.Connections[0];
						tmpConn.Data = {};

						_HandleManager.addConnectionHandle('c1', 250, 150);

						libExpect(tmpEvents).to.include('onFlowChanged');
						fDone();
					}
				);

				test
				(
					'should do nothing for non-existent connection',
					function (fDone)
					{
						_HandleManager.addConnectionHandle('non-existent', 250, 150);
						fDone();
					}
				);

				test
				(
					'should do nothing when no FlowView',
					function (fDone)
					{
						let tmpManager = new libConnectionHandleManager(_Fable, {}, 'NoView');
						tmpManager.addConnectionHandle('c1', 250, 150);
						fDone();
					}
				);
			}
		);

		// ---- removeConnectionHandle ----

		suite
		(
			'removeConnectionHandle',
			function ()
			{
				test
				(
					'should remove a handle by index',
					function (fDone)
					{
						let tmpConn = _MockFlowView._FlowData.Connections[0];
						tmpConn.Data = {
							BezierHandles: [{ x: 200, y: 100 }, { x: 300, y: 150 }],
							HandleCustomized: true
						};

						_HandleManager.removeConnectionHandle('c1', 0);

						libExpect(tmpConn.Data.BezierHandles).to.have.length(1);
						libExpect(tmpConn.Data.BezierHandles[0].x).to.equal(300);
						fDone();
					}
				);

				test
				(
					'should reset HandleCustomized when last handle removed',
					function (fDone)
					{
						let tmpConn = _MockFlowView._FlowData.Connections[0];
						tmpConn.Data = {
							BezierHandles: [{ x: 200, y: 100 }],
							HandleCustomized: true,
							BezierHandleX: 200,
							BezierHandleY: 100
						};

						_HandleManager.removeConnectionHandle('c1', 0);

						libExpect(tmpConn.Data.BezierHandles).to.have.length(0);
						libExpect(tmpConn.Data.HandleCustomized).to.be.false;
						libExpect(tmpConn.Data.BezierHandleX).to.be.null;
						libExpect(tmpConn.Data.BezierHandleY).to.be.null;
						fDone();
					}
				);

				test
				(
					'should do nothing for out-of-range index',
					function (fDone)
					{
						let tmpConn = _MockFlowView._FlowData.Connections[0];
						tmpConn.Data = {
							BezierHandles: [{ x: 200, y: 100 }],
							HandleCustomized: true
						};

						_HandleManager.removeConnectionHandle('c1', 5);
						libExpect(tmpConn.Data.BezierHandles).to.have.length(1);

						_HandleManager.removeConnectionHandle('c1', -1);
						libExpect(tmpConn.Data.BezierHandles).to.have.length(1);
						fDone();
					}
				);

				test
				(
					'should do nothing when no BezierHandles array',
					function (fDone)
					{
						let tmpConn = _MockFlowView._FlowData.Connections[0];
						tmpConn.Data = {};

						_HandleManager.removeConnectionHandle('c1', 0);
						// Should not throw
						fDone();
					}
				);

				test
				(
					'should do nothing for non-existent connection',
					function (fDone)
					{
						_HandleManager.removeConnectionHandle('non-existent', 0);
						fDone();
					}
				);

				test
				(
					'should call renderFlow and marshalFromView',
					function (fDone)
					{
						let tmpRenderCalled = false;
						let tmpMarshalCalled = false;
						_MockFlowView.renderFlow = function () { tmpRenderCalled = true; };
						_MockFlowView.marshalFromView = function () { tmpMarshalCalled = true; };

						let tmpConn = _MockFlowView._FlowData.Connections[0];
						tmpConn.Data = {
							BezierHandles: [{ x: 200, y: 100 }],
							HandleCustomized: true
						};

						_HandleManager.removeConnectionHandle('c1', 0);

						libExpect(tmpRenderCalled).to.be.true;
						libExpect(tmpMarshalCalled).to.be.true;
						fDone();
					}
				);
			}
		);

		// ---- resetHandlesForNode ----

		suite
		(
			'resetHandlesForNode',
			function ()
			{
				test
				(
					'should reset customized handles for connections involving the node',
					function (fDone)
					{
						let tmpConn = _MockFlowView._FlowData.Connections[0];
						tmpConn.Data =
						{
							HandleCustomized: true,
							BezierHandleX: 200,
							BezierHandleY: 100,
							OrthoCorner1X: 150,
							OrthoCorner1Y: 80,
							OrthoCorner2X: 350,
							OrthoCorner2Y: 120,
							OrthoMidOffset: 25
						};

						_HandleManager.resetHandlesForNode('n1');

						libExpect(tmpConn.Data.HandleCustomized).to.be.false;
						libExpect(tmpConn.Data.BezierHandleX).to.be.null;
						libExpect(tmpConn.Data.BezierHandleY).to.be.null;
						libExpect(tmpConn.Data.OrthoCorner1X).to.be.null;
						libExpect(tmpConn.Data.OrthoCorner1Y).to.be.null;
						libExpect(tmpConn.Data.OrthoCorner2X).to.be.null;
						libExpect(tmpConn.Data.OrthoCorner2Y).to.be.null;
						libExpect(tmpConn.Data.OrthoMidOffset).to.equal(0);
						fDone();
					}
				);

				test
				(
					'should not reset connections not involving the node',
					function (fDone)
					{
						_MockFlowView._FlowData.Connections.push({
							Hash: 'c2',
							SourceNodeHash: 'n3',
							TargetNodeHash: 'n4',
							Data: { HandleCustomized: true, BezierHandleX: 500 }
						});

						_HandleManager.resetHandlesForNode('n1');

						// c2 should be untouched
						let tmpC2 = _MockFlowView._FlowData.Connections.find((c) => c.Hash === 'c2');
						libExpect(tmpC2.Data.HandleCustomized).to.be.true;
						libExpect(tmpC2.Data.BezierHandleX).to.equal(500);
						fDone();
					}
				);

				test
				(
					'should call TetherService.resetHandlesForNode',
					function (fDone)
					{
						let tmpTetherResetCalled = false;
						_MockFlowView._TetherService.resetHandlesForNode = function ()
						{
							tmpTetherResetCalled = true;
						};

						_HandleManager.resetHandlesForNode('n1');

						libExpect(tmpTetherResetCalled).to.be.true;
						fDone();
					}
				);

				test
				(
					'should skip connections without Data',
					function (fDone)
					{
						_MockFlowView._FlowData.Connections[0].Data = null;
						// Should not throw
						_HandleManager.resetHandlesForNode('n1');
						fDone();
					}
				);

				test
				(
					'should do nothing when no FlowView',
					function (fDone)
					{
						let tmpManager = new libConnectionHandleManager(_Fable, {}, 'NoView');
						tmpManager.resetHandlesForNode('n1');
						fDone();
					}
				);
			}
		);

		// ---- resetHandlesForPanel ----

		suite
		(
			'resetHandlesForPanel',
			function ()
			{
				test
				(
					'should call TetherService.resetHandlePositions for the panel',
					function (fDone)
					{
						let tmpResetPanel = null;
						_MockFlowView._TetherService.resetHandlePositions = function (pPanel)
						{
							tmpResetPanel = pPanel;
						};

						_MockFlowView._FlowData.OpenPanels = [{ Hash: 'panel-1', NodeHash: 'n1' }];

						_HandleManager.resetHandlesForPanel('panel-1');

						libExpect(tmpResetPanel).to.not.be.null;
						libExpect(tmpResetPanel.Hash).to.equal('panel-1');
						fDone();
					}
				);

				test
				(
					'should do nothing for non-existent panel',
					function (fDone)
					{
						let tmpResetCalled = false;
						_MockFlowView._TetherService.resetHandlePositions = function ()
						{
							tmpResetCalled = true;
						};

						_HandleManager.resetHandlesForPanel('non-existent');

						libExpect(tmpResetCalled).to.be.false;
						fDone();
					}
				);

				test
				(
					'should do nothing when no FlowView',
					function (fDone)
					{
						let tmpManager = new libConnectionHandleManager(_Fable, {}, 'NoView');
						tmpManager.resetHandlesForPanel('panel-1');
						fDone();
					}
				);
			}
		);
	}
);
