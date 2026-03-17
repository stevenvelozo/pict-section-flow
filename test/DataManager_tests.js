const libFable = require('fable');
const libChai = require('chai');
const libExpect = libChai.expect;

const libDataManager = require('../source/services/PictService-Flow-DataManager.js');

suite
(
	'PictService-Flow-DataManager',
	function ()
	{
		let _Fable;
		let _DataManager;
		let _MockFlowView;

		setup
		(
			function ()
			{
				_Fable = new libFable({});

				_MockFlowView =
				{
					fable: _Fable,
					pict: null,
					log: _Fable.log,
					options:
					{
						DefaultNodeType: 'generic',
						DefaultNodeWidth: 160,
						DefaultNodeHeight: 80,
						FlowDataAddress: null
					},
					Bundle: {},
					initialRenderComplete: false,
					_FlowData:
					{
						Nodes: [],
						Connections: [],
						OpenPanels: [],
						SavedLayouts: [],
						ViewState:
						{
							PanX: 0,
							PanY: 0,
							Zoom: 1,
							SelectedNodeHash: null,
							SelectedConnectionHash: null,
							SelectedTetherHash: null
						}
					},
					_NodeTypeProvider:
					{
						getNodeType: function (pType)
						{
							if (pType === 'action')
							{
								return {
									Label: 'Action',
									DefaultWidth: 200,
									DefaultHeight: 100,
									DefaultPorts:
									[
										{ Hash: 'p-in', Direction: 'input', Side: 'left', Label: 'In' },
										{ Hash: 'p-out', Direction: 'output', Side: 'right', Label: 'Out' },
										{ Hash: 'p-err', Direction: 'output', Side: 'bottom', Label: 'Error', PortType: 'error' }
									]
								};
							}
							return null;
						}
					},
					_LayoutProvider:
					{
						loadPersistedLayouts: function () {}
					},
					_EventHandlerProvider:
					{
						fireEvent: function () {}
					},
					renderFlow: function () {},
					closePanelForNode: function (pNodeHash)
					{
						_MockFlowView._FlowData.OpenPanels = _MockFlowView._FlowData.OpenPanels.filter(
							(pPanel) => pPanel.NodeHash !== pNodeHash
						);
					},
					marshalFromView: function () {}
				};

				_DataManager = new libDataManager(_Fable, { FlowView: _MockFlowView }, 'DM-Test');
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
						libExpect(_DataManager).to.be.an('object');
						libExpect(_DataManager.serviceType).to.equal('PictServiceFlowDataManager');
						fDone();
					}
				);

				test
				(
					'should store FlowView reference from options',
					function (fDone)
					{
						libExpect(_DataManager._FlowView).to.equal(_MockFlowView);
						fDone();
					}
				);

				test
				(
					'should handle missing FlowView in options',
					function (fDone)
					{
						let tmpManager = new libDataManager(_Fable, {}, 'NoView');
						libExpect(tmpManager._FlowView).to.be.null;
						fDone();
					}
				);
			}
		);

		// ---- getFlowData ----

		suite
		(
			'getFlowData',
			function ()
			{
				test
				(
					'should return a deep clone of the flow data',
					function (fDone)
					{
						_MockFlowView._FlowData.Nodes.push({ Hash: 'node-1', X: 10, Y: 20 });
						let tmpResult = _DataManager.getFlowData();

						libExpect(tmpResult.Nodes).to.have.length(1);
						libExpect(tmpResult.Nodes[0].Hash).to.equal('node-1');

						// Verify it's a clone, not a reference
						tmpResult.Nodes[0].X = 999;
						libExpect(_MockFlowView._FlowData.Nodes[0].X).to.equal(10);
						fDone();
					}
				);

				test
				(
					'should return empty object when no FlowView',
					function (fDone)
					{
						let tmpManager = new libDataManager(_Fable, {}, 'NoView');
						let tmpResult = tmpManager.getFlowData();
						libExpect(tmpResult).to.deep.equal({});
						fDone();
					}
				);
			}
		);

		// ---- setFlowData ----

		suite
		(
			'setFlowData',
			function ()
			{
				test
				(
					'should set flow data with validated structure',
					function (fDone)
					{
						let tmpData =
						{
							Nodes: [{ Hash: 'n1', X: 50, Y: 50 }],
							Connections: [{ Hash: 'c1', SourceNodeHash: 'n1', TargetNodeHash: 'n2' }],
							ViewState: { PanX: 100, PanY: 200, Zoom: 2 }
						};

						_DataManager.setFlowData(tmpData);

						libExpect(_MockFlowView._FlowData.Nodes).to.have.length(1);
						libExpect(_MockFlowView._FlowData.Connections).to.have.length(1);
						libExpect(_MockFlowView._FlowData.ViewState.PanX).to.equal(100);
						libExpect(_MockFlowView._FlowData.ViewState.Zoom).to.equal(2);
						fDone();
					}
				);

				test
				(
					'should provide defaults for missing arrays',
					function (fDone)
					{
						_DataManager.setFlowData({ ViewState: { PanX: 10 } });

						libExpect(_MockFlowView._FlowData.Nodes).to.be.an('array').that.is.empty;
						libExpect(_MockFlowView._FlowData.Connections).to.be.an('array').that.is.empty;
						libExpect(_MockFlowView._FlowData.OpenPanels).to.be.an('array').that.is.empty;
						libExpect(_MockFlowView._FlowData.SavedLayouts).to.be.an('array').that.is.empty;
						fDone();
					}
				);

				test
				(
					'should provide default ViewState when missing',
					function (fDone)
					{
						_DataManager.setFlowData({ Nodes: [] });

						libExpect(_MockFlowView._FlowData.ViewState.PanX).to.equal(0);
						libExpect(_MockFlowView._FlowData.ViewState.PanY).to.equal(0);
						libExpect(_MockFlowView._FlowData.ViewState.Zoom).to.equal(1);
						libExpect(_MockFlowView._FlowData.ViewState.SelectedNodeHash).to.be.null;
						fDone();
					}
				);

				test
				(
					'should reject null data',
					function (fDone)
					{
						let tmpOriginalNodes = _MockFlowView._FlowData.Nodes;
						_DataManager.setFlowData(null);
						// Should not have changed
						libExpect(_MockFlowView._FlowData.Nodes).to.equal(tmpOriginalNodes);
						fDone();
					}
				);

				test
				(
					'should reject non-object data',
					function (fDone)
					{
						let tmpOriginalNodes = _MockFlowView._FlowData.Nodes;
						_DataManager.setFlowData('invalid');
						libExpect(_MockFlowView._FlowData.Nodes).to.equal(tmpOriginalNodes);
						fDone();
					}
				);

				test
				(
					'should call renderFlow when initialRenderComplete is true',
					function (fDone)
					{
						let tmpRenderCalled = false;
						_MockFlowView.renderFlow = function () { tmpRenderCalled = true; };
						_MockFlowView.initialRenderComplete = true;

						_DataManager.setFlowData({ Nodes: [] });

						libExpect(tmpRenderCalled).to.be.true;
						fDone();
					}
				);

				test
				(
					'should not call renderFlow when initialRenderComplete is false',
					function (fDone)
					{
						let tmpRenderCalled = false;
						_MockFlowView.renderFlow = function () { tmpRenderCalled = true; };
						_MockFlowView.initialRenderComplete = false;

						_DataManager.setFlowData({ Nodes: [] });

						libExpect(tmpRenderCalled).to.be.false;
						fDone();
					}
				);

				test
				(
					'should call loadPersistedLayouts when LayoutProvider exists',
					function (fDone)
					{
						let tmpLoadCalled = false;
						_MockFlowView._LayoutProvider.loadPersistedLayouts = function () { tmpLoadCalled = true; };

						_DataManager.setFlowData({ Nodes: [] });

						libExpect(tmpLoadCalled).to.be.true;
						fDone();
					}
				);
			}
		);

		// ---- addNode ----

		suite
		(
			'addNode',
			function ()
			{
				test
				(
					'should add a node with generated hash',
					function (fDone)
					{
						let tmpNode = _DataManager.addNode('generic', 200, 300, 'Test Node');

						libExpect(tmpNode).to.be.an('object');
						libExpect(tmpNode.Hash).to.be.a('string').that.includes('node-');
						libExpect(tmpNode.X).to.equal(200);
						libExpect(tmpNode.Y).to.equal(300);
						libExpect(tmpNode.Title).to.equal('Test Node');
						libExpect(_MockFlowView._FlowData.Nodes).to.have.length(1);
						fDone();
					}
				);

				test
				(
					'should use node type config for defaults',
					function (fDone)
					{
						let tmpNode = _DataManager.addNode('action', 100, 100);

						libExpect(tmpNode.Width).to.equal(200);
						libExpect(tmpNode.Height).to.equal(100);
						libExpect(tmpNode.Title).to.equal('Action');
						libExpect(tmpNode.Ports).to.have.length(3);
						fDone();
					}
				);

				test
				(
					'should use option defaults when type config is null',
					function (fDone)
					{
						let tmpNode = _DataManager.addNode('unknown', 100, 100, 'My Node');

						libExpect(tmpNode.Width).to.equal(160);
						libExpect(tmpNode.Height).to.equal(80);
						libExpect(tmpNode.Title).to.equal('My Node');
						// Default ports (2 generic)
						libExpect(tmpNode.Ports).to.have.length(2);
						fDone();
					}
				);

				test
				(
					'should use DefaultNodeType when type is null',
					function (fDone)
					{
						let tmpNode = _DataManager.addNode(null, 100, 100, 'Fallback');

						libExpect(tmpNode.Type).to.equal('generic');
						fDone();
					}
				);

				test
				(
					'should default position to 100,100 when not provided',
					function (fDone)
					{
						let tmpNode = _DataManager.addNode('generic', 0, 0);

						// 0 is falsy, so it should fall back to 100
						// (This tests the || operator behavior)
						libExpect(tmpNode.X).to.equal(100);
						libExpect(tmpNode.Y).to.equal(100);
						fDone();
					}
				);

				test
				(
					'should ensure all ports have unique hashes',
					function (fDone)
					{
						let tmpNode = _DataManager.addNode('action', 100, 100);
						let tmpHashes = tmpNode.Ports.map((p) => p.Hash);
						let tmpUnique = new Set(tmpHashes);
						libExpect(tmpUnique.size).to.equal(tmpHashes.length);
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
						_DataManager.marshalFromView = function () { tmpMarshalCalled = true; };

						_DataManager.addNode('generic', 100, 100);

						libExpect(tmpRenderCalled).to.be.true;
						libExpect(tmpMarshalCalled).to.be.true;
						fDone();
					}
				);

				test
				(
					'should fire onNodeAdded and onFlowChanged events',
					function (fDone)
					{
						let tmpEvents = [];
						_MockFlowView._EventHandlerProvider.fireEvent = function (pEvent) { tmpEvents.push(pEvent); };

						_DataManager.addNode('generic', 100, 100);

						libExpect(tmpEvents).to.include('onNodeAdded');
						libExpect(tmpEvents).to.include('onFlowChanged');
						fDone();
					}
				);

				test
				(
					'should return null when no FlowView',
					function (fDone)
					{
						let tmpManager = new libDataManager(_Fable, {}, 'NoView');
						let tmpResult = tmpManager.addNode('generic', 100, 100);
						libExpect(tmpResult).to.be.null;
						fDone();
					}
				);

				test
				(
					'should include custom data when provided',
					function (fDone)
					{
						let tmpNode = _DataManager.addNode('generic', 100, 100, 'Test', { foo: 'bar' });
						libExpect(tmpNode.Data).to.deep.equal({ foo: 'bar' });
						fDone();
					}
				);
			}
		);

		// ---- removeNode ----

		suite
		(
			'removeNode',
			function ()
			{
				test
				(
					'should remove a node by hash',
					function (fDone)
					{
						let tmpNode = _DataManager.addNode('generic', 100, 100, 'ToRemove');
						libExpect(_MockFlowView._FlowData.Nodes).to.have.length(1);

						let tmpResult = _DataManager.removeNode(tmpNode.Hash);
						libExpect(tmpResult).to.be.true;
						libExpect(_MockFlowView._FlowData.Nodes).to.have.length(0);
						fDone();
					}
				);

				test
				(
					'should return false for non-existent node',
					function (fDone)
					{
						let tmpResult = _DataManager.removeNode('non-existent');
						libExpect(tmpResult).to.be.false;
						fDone();
					}
				);

				test
				(
					'should cascade-delete connections involving the node',
					function (fDone)
					{
						// Set up two nodes with a connection
						_MockFlowView._FlowData.Nodes = [
							{ Hash: 'n1', Ports: [{ Hash: 'p1', Direction: 'output' }] },
							{ Hash: 'n2', Ports: [{ Hash: 'p2', Direction: 'input' }] }
						];
						_MockFlowView._FlowData.Connections = [
							{ Hash: 'c1', SourceNodeHash: 'n1', SourcePortHash: 'p1', TargetNodeHash: 'n2', TargetPortHash: 'p2' }
						];

						_DataManager.removeNode('n1');

						libExpect(_MockFlowView._FlowData.Connections).to.have.length(0);
						fDone();
					}
				);

				test
				(
					'should close open panels for the node',
					function (fDone)
					{
						_MockFlowView._FlowData.Nodes = [{ Hash: 'n1' }];
						_MockFlowView._FlowData.OpenPanels = [{ Hash: 'panel-1', NodeHash: 'n1' }];

						_DataManager.removeNode('n1');

						libExpect(_MockFlowView._FlowData.OpenPanels).to.have.length(0);
						fDone();
					}
				);

				test
				(
					'should clear selection if removed node was selected',
					function (fDone)
					{
						_MockFlowView._FlowData.Nodes = [{ Hash: 'n1' }];
						_MockFlowView._FlowData.ViewState.SelectedNodeHash = 'n1';

						_DataManager.removeNode('n1');

						libExpect(_MockFlowView._FlowData.ViewState.SelectedNodeHash).to.be.null;
						fDone();
					}
				);

				test
				(
					'should fire onNodeRemoved and onFlowChanged events',
					function (fDone)
					{
						_MockFlowView._FlowData.Nodes = [{ Hash: 'n1' }];
						let tmpEvents = [];
						_MockFlowView._EventHandlerProvider.fireEvent = function (pEvent) { tmpEvents.push(pEvent); };

						_DataManager.removeNode('n1');

						libExpect(tmpEvents).to.include('onNodeRemoved');
						libExpect(tmpEvents).to.include('onFlowChanged');
						fDone();
					}
				);

				test
				(
					'should return false when no FlowView',
					function (fDone)
					{
						let tmpManager = new libDataManager(_Fable, {}, 'NoView');
						let tmpResult = tmpManager.removeNode('n1');
						libExpect(tmpResult).to.be.false;
						fDone();
					}
				);
			}
		);

		// ---- addConnection ----

		suite
		(
			'addConnection',
			function ()
			{
				setup
				(
					function ()
					{
						// Set up two nodes with ports
						_MockFlowView._FlowData.Nodes = [
							{
								Hash: 'n1',
								Ports: [
									{ Hash: 'p-out-1', Direction: 'output', Side: 'right', Label: 'Out' }
								]
							},
							{
								Hash: 'n2',
								Ports: [
									{ Hash: 'p-in-2', Direction: 'input', Side: 'left', Label: 'In' }
								]
							}
						];
						_MockFlowView._FlowData.Connections = [];
					}
				);

				test
				(
					'should create a connection between valid nodes/ports',
					function (fDone)
					{
						let tmpConn = _DataManager.addConnection('n1', 'p-out-1', 'n2', 'p-in-2');

						libExpect(tmpConn).to.be.an('object');
						libExpect(tmpConn.Hash).to.be.a('string').that.includes('conn-');
						libExpect(tmpConn.SourceNodeHash).to.equal('n1');
						libExpect(tmpConn.TargetNodeHash).to.equal('n2');
						libExpect(_MockFlowView._FlowData.Connections).to.have.length(1);
						fDone();
					}
				);

				test
				(
					'should return false for missing source node',
					function (fDone)
					{
						let tmpResult = _DataManager.addConnection('non-existent', 'p-out-1', 'n2', 'p-in-2');
						libExpect(tmpResult).to.be.false;
						fDone();
					}
				);

				test
				(
					'should return false for missing target node',
					function (fDone)
					{
						let tmpResult = _DataManager.addConnection('n1', 'p-out-1', 'non-existent', 'p-in-2');
						libExpect(tmpResult).to.be.false;
						fDone();
					}
				);

				test
				(
					'should return false for missing source port',
					function (fDone)
					{
						let tmpResult = _DataManager.addConnection('n1', 'bad-port', 'n2', 'p-in-2');
						libExpect(tmpResult).to.be.false;
						fDone();
					}
				);

				test
				(
					'should return false for missing target port',
					function (fDone)
					{
						let tmpResult = _DataManager.addConnection('n1', 'p-out-1', 'n2', 'bad-port');
						libExpect(tmpResult).to.be.false;
						fDone();
					}
				);

				test
				(
					'should prevent self-connections',
					function (fDone)
					{
						_MockFlowView._FlowData.Nodes[0].Ports.push(
							{ Hash: 'p-in-1', Direction: 'input', Side: 'left', Label: 'In' }
						);

						let tmpResult = _DataManager.addConnection('n1', 'p-out-1', 'n1', 'p-in-1');
						libExpect(tmpResult).to.be.false;
						fDone();
					}
				);

				test
				(
					'should prevent duplicate connections',
					function (fDone)
					{
						_DataManager.addConnection('n1', 'p-out-1', 'n2', 'p-in-2');
						let tmpResult = _DataManager.addConnection('n1', 'p-out-1', 'n2', 'p-in-2');

						libExpect(tmpResult).to.be.false;
						libExpect(_MockFlowView._FlowData.Connections).to.have.length(1);
						fDone();
					}
				);

				test
				(
					'should include custom data when provided',
					function (fDone)
					{
						let tmpConn = _DataManager.addConnection('n1', 'p-out-1', 'n2', 'p-in-2', { LineMode: 'bezier' });
						libExpect(tmpConn.Data).to.deep.equal({ LineMode: 'bezier' });
						fDone();
					}
				);

				test
				(
					'should fire onConnectionCreated and onFlowChanged events',
					function (fDone)
					{
						let tmpEvents = [];
						_MockFlowView._EventHandlerProvider.fireEvent = function (pEvent) { tmpEvents.push(pEvent); };

						_DataManager.addConnection('n1', 'p-out-1', 'n2', 'p-in-2');

						libExpect(tmpEvents).to.include('onConnectionCreated');
						libExpect(tmpEvents).to.include('onFlowChanged');
						fDone();
					}
				);

				test
				(
					'should return false when no FlowView',
					function (fDone)
					{
						let tmpManager = new libDataManager(_Fable, {}, 'NoView');
						let tmpResult = tmpManager.addConnection('n1', 'p1', 'n2', 'p2');
						libExpect(tmpResult).to.be.false;
						fDone();
					}
				);
			}
		);

		// ---- removeConnection ----

		suite
		(
			'removeConnection',
			function ()
			{
				test
				(
					'should remove a connection by hash',
					function (fDone)
					{
						_MockFlowView._FlowData.Nodes = [
							{ Hash: 'n1', Ports: [{ Hash: 'p1', Direction: 'output' }] },
							{ Hash: 'n2', Ports: [{ Hash: 'p2', Direction: 'input' }] }
						];

						let tmpConn = _DataManager.addConnection('n1', 'p1', 'n2', 'p2');
						libExpect(_MockFlowView._FlowData.Connections).to.have.length(1);

						let tmpResult = _DataManager.removeConnection(tmpConn.Hash);
						libExpect(tmpResult).to.be.true;
						libExpect(_MockFlowView._FlowData.Connections).to.have.length(0);
						fDone();
					}
				);

				test
				(
					'should return false for non-existent connection',
					function (fDone)
					{
						let tmpResult = _DataManager.removeConnection('non-existent');
						libExpect(tmpResult).to.be.false;
						fDone();
					}
				);

				test
				(
					'should clear selection if removed connection was selected',
					function (fDone)
					{
						_MockFlowView._FlowData.Connections = [
							{ Hash: 'c1', SourceNodeHash: 'n1', TargetNodeHash: 'n2' }
						];
						_MockFlowView._FlowData.ViewState.SelectedConnectionHash = 'c1';

						_DataManager.removeConnection('c1');

						libExpect(_MockFlowView._FlowData.ViewState.SelectedConnectionHash).to.be.null;
						fDone();
					}
				);

				test
				(
					'should fire onConnectionRemoved and onFlowChanged events',
					function (fDone)
					{
						_MockFlowView._FlowData.Connections = [
							{ Hash: 'c1', SourceNodeHash: 'n1', TargetNodeHash: 'n2' }
						];
						let tmpEvents = [];
						_MockFlowView._EventHandlerProvider.fireEvent = function (pEvent) { tmpEvents.push(pEvent); };

						_DataManager.removeConnection('c1');

						libExpect(tmpEvents).to.include('onConnectionRemoved');
						libExpect(tmpEvents).to.include('onFlowChanged');
						fDone();
					}
				);

				test
				(
					'should return false when no FlowView',
					function (fDone)
					{
						let tmpManager = new libDataManager(_Fable, {}, 'NoView');
						let tmpResult = tmpManager.removeConnection('c1');
						libExpect(tmpResult).to.be.false;
						fDone();
					}
				);
			}
		);

		// ---- marshalToView / marshalFromView ----

		suite
		(
			'marshalToView and marshalFromView',
			function ()
			{
				test
				(
					'should be no-ops when FlowDataAddress is not set',
					function (fDone)
					{
						// marshalToView with no FlowDataAddress should not crash
						_DataManager.marshalToView();
						// marshalFromView with no FlowDataAddress should not crash
						_DataManager.marshalFromView();
						fDone();
					}
				);

				test
				(
					'should be no-ops when no FlowView',
					function (fDone)
					{
						let tmpManager = new libDataManager(_Fable, {}, 'NoView');
						tmpManager.marshalToView();
						tmpManager.marshalFromView();
						fDone();
					}
				);
			}
		);
	}
);
