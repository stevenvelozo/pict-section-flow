const libFable = require('fable');
const libChai = require('chai');
const libExpect = libChai.expect;

const libRenderManager = require('../source/services/PictService-Flow-RenderManager.js');

suite
(
	'PictService-Flow-RenderManager',
	function ()
	{
		let _Fable;
		let _RenderManager;
		let _MockFlowView;

		/**
		 * Create a minimal mock DOM element that supports the operations
		 * used by RenderManager (firstChild, removeChild, appendChild,
		 * querySelectorAll, setAttribute, querySelector).
		 */
		function createMockElement()
		{
			let tmpChildren = [];
			return {
				_children: tmpChildren,
				get firstChild() { return tmpChildren.length > 0 ? tmpChildren[0] : null; },
				removeChild: function (pChild)
				{
					let tmpIdx = tmpChildren.indexOf(pChild);
					if (tmpIdx >= 0) tmpChildren.splice(tmpIdx, 1);
				},
				appendChild: function (pChild)
				{
					tmpChildren.push(pChild);
				},
				querySelectorAll: function (pSelector)
				{
					// Simple mock: match data-connection-hash, data-panel-hash, data-node-hash
					let tmpMatch = pSelector.match(/\[data-(connection|panel|node)-hash="([^"]+)"\]/);
					if (!tmpMatch) return [];
					let tmpType = tmpMatch[1];
					let tmpHash = tmpMatch[2];
					return tmpChildren.filter((c) => c._dataHash === tmpHash && c._dataType === tmpType);
				},
				querySelector: function (pSelector)
				{
					let tmpResults = this.querySelectorAll(pSelector);
					return tmpResults.length > 0 ? tmpResults[0] : null;
				}
			};
		}

		function createMockSVGChild(pDataType, pDataHash, pParent)
		{
			let tmpSelf =
			{
				_dataType: pDataType,
				_dataHash: pDataHash,
				remove: function ()
				{
					if (pParent)
					{
						let tmpIdx = pParent._children.indexOf(tmpSelf);
						if (tmpIdx >= 0) pParent._children.splice(tmpIdx, 1);
					}
				},
				setAttribute: function () {}
			};
			return tmpSelf;
		}

		setup
		(
			function ()
			{
				_Fable = new libFable({});

				_MockFlowView =
				{
					fable: _Fable,
					log: _Fable.log,
					options:
					{
						ViewIdentifier: 'test-flow',
						EnableGridSnap: false,
						GridSnapSize: 20
					},
					_FlowData:
					{
						Nodes:
						[
							{
								Hash: 'n1',
								Type: 'generic',
								X: 100, Y: 100,
								Width: 160, Height: 80,
								Ports:
								[
									{ Hash: 'p-out', Direction: 'output', Side: 'right', Label: 'Out' }
								]
							},
							{
								Hash: 'n2',
								Type: 'generic',
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
							SelectedNodeHash: null,
							SelectedConnectionHash: null,
							SelectedTetherHash: null
						}
					},
					_NodesLayer: createMockElement(),
					_ConnectionsLayer: createMockElement(),
					_PanelsLayer: createMockElement(),
					_TethersLayer: createMockElement(),
					_SVGElement: null,
					_ConnectionRenderer:
					{
						renderConnection: function (pConn, pLayer, pIsSelected)
						{
							let tmpEl = createMockSVGChild('connection', pConn.Hash, pLayer);
							pLayer.appendChild(tmpEl);
						}
					},
					_NodeView:
					{
						renderNode: function (pNode, pLayer, pIsSelected, pConfig)
						{
							let tmpEl = createMockSVGChild('node', pNode.Hash, pLayer);
							pLayer.appendChild(tmpEl);
						}
					},
					_NodeTypeProvider:
					{
						getNodeType: function () { return null; }
					},
					_PropertiesPanelView: null,
					_TetherService:
					{
						renderTether: function (pPanel, pNodeData, pLayer, pIsSelected, pViewId)
						{
							let tmpEl = createMockSVGChild('panel', pPanel.Hash, pLayer);
							pLayer.appendChild(tmpEl);
						}
					},
					_LayoutService:
					{
						snapToGrid: function (pVal, pSize) { return Math.round(pVal / pSize) * pSize; }
					},
					_ConnectorShapesProvider: null,
					getNode: function (pHash)
					{
						return _MockFlowView._FlowData.Nodes.find((n) => n.Hash === pHash) || null;
					},
					getConnection: function (pHash)
					{
						return _MockFlowView._FlowData.Connections.find((c) => c.Hash === pHash) || null;
					},
					updateViewportTransform: function () {},
					_resetHandlesForNode: function () {}
				};

				_RenderManager = new libRenderManager(_Fable, { FlowView: _MockFlowView }, 'RM-Test');
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
						libExpect(_RenderManager).to.be.an('object');
						libExpect(_RenderManager.serviceType).to.equal('PictServiceFlowRenderManager');
						fDone();
					}
				);

				test
				(
					'should store FlowView reference from options',
					function (fDone)
					{
						libExpect(_RenderManager._FlowView).to.equal(_MockFlowView);
						fDone();
					}
				);

				test
				(
					'should handle missing FlowView',
					function (fDone)
					{
						let tmpManager = new libRenderManager(_Fable, {}, 'NoView');
						libExpect(tmpManager._FlowView).to.be.null;
						fDone();
					}
				);
			}
		);

		// ---- renderFlow ----

		suite
		(
			'renderFlow',
			function ()
			{
				test
				(
					'should clear layers and re-render all nodes and connections',
					function (fDone)
					{
						// Pre-populate layers
						_MockFlowView._NodesLayer.appendChild({ mock: true });
						_MockFlowView._ConnectionsLayer.appendChild({ mock: true });

						_RenderManager.renderFlow();

						// Connections should be rendered (1 connection)
						libExpect(_MockFlowView._ConnectionsLayer._children).to.have.length(1);
						// Nodes should be rendered (2 nodes)
						libExpect(_MockFlowView._NodesLayer._children).to.have.length(2);
						fDone();
					}
				);

				test
				(
					'should call updateViewportTransform',
					function (fDone)
					{
						let tmpViewportCalled = false;
						_MockFlowView.updateViewportTransform = function () { tmpViewportCalled = true; };

						_RenderManager.renderFlow();

						libExpect(tmpViewportCalled).to.be.true;
						fDone();
					}
				);

				test
				(
					'should do nothing when no FlowView',
					function (fDone)
					{
						let tmpManager = new libRenderManager(_Fable, {}, 'NoView');
						tmpManager.renderFlow();
						fDone();
					}
				);

				test
				(
					'should do nothing when layers are missing',
					function (fDone)
					{
						_MockFlowView._NodesLayer = null;
						_RenderManager.renderFlow();
						// Should not throw
						fDone();
					}
				);

				test
				(
					'should enrich port data from node type config',
					function (fDone)
					{
						_MockFlowView._NodeTypeProvider.getNodeType = function (pType)
						{
							if (pType === 'action')
							{
								return {
									DefaultPorts:
									[
										{ Direction: 'input', Label: 'In', PortType: 'data', Side: 'left' },
										{ Direction: 'output', Label: 'Out', PortType: 'data', Side: 'right' }
									]
								};
							}
							return null;
						};

						_MockFlowView._FlowData.Nodes = [
							{
								Hash: 'n-action',
								Type: 'action',
								X: 100, Y: 100,
								Width: 160, Height: 80,
								Ports:
								[
									{ Hash: 'p1', Direction: 'input', Label: 'In' },
									{ Hash: 'p2', Direction: 'output', Label: 'Out' }
								]
							}
						];
						_MockFlowView._FlowData.Connections = [];

						_RenderManager.renderFlow();

						// Ports should now have enriched PortType and Side
						let tmpNode = _MockFlowView._FlowData.Nodes[0];
						libExpect(tmpNode.Ports[0].PortType).to.equal('data');
						libExpect(tmpNode.Ports[0].Side).to.equal('left');
						libExpect(tmpNode.Ports[1].PortType).to.equal('data');
						libExpect(tmpNode.Ports[1].Side).to.equal('right');
						fDone();
					}
				);

				test
				(
					'should render panels and tethers when PropertiesPanelView exists',
					function (fDone)
					{
						let tmpPanelsRendered = false;
						_MockFlowView._PropertiesPanelView =
						{
							renderPanels: function () { tmpPanelsRendered = true; }
						};
						_MockFlowView._FlowData.OpenPanels = [{ Hash: 'panel-1', NodeHash: 'n1' }];

						_RenderManager.renderFlow();

						libExpect(tmpPanelsRendered).to.be.true;
						fDone();
					}
				);
			}
		);

		// ---- renderSingleConnection ----

		suite
		(
			'renderSingleConnection',
			function ()
			{
				test
				(
					'should remove and re-render a single connection',
					function (fDone)
					{
						// Pre-render
						_RenderManager.renderFlow();
						libExpect(_MockFlowView._ConnectionsLayer._children).to.have.length(1);

						// Re-render single
						_RenderManager.renderSingleConnection('c1');

						// Should still have 1 connection element
						libExpect(_MockFlowView._ConnectionsLayer._children).to.have.length(1);
						fDone();
					}
				);

				test
				(
					'should do nothing for non-existent connection',
					function (fDone)
					{
						_RenderManager.renderSingleConnection('non-existent');
						fDone();
					}
				);

				test
				(
					'should do nothing when ConnectionsLayer is null',
					function (fDone)
					{
						_MockFlowView._ConnectionsLayer = null;
						_RenderManager.renderSingleConnection('c1');
						fDone();
					}
				);
			}
		);

		// ---- renderSingleTether ----

		suite
		(
			'renderSingleTether',
			function ()
			{
				test
				(
					'should render a tether for an open panel',
					function (fDone)
					{
						_MockFlowView._FlowData.OpenPanels = [{ Hash: 'panel-1', NodeHash: 'n1' }];

						_RenderManager.renderSingleTether('panel-1');

						libExpect(_MockFlowView._TethersLayer._children).to.have.length(1);
						fDone();
					}
				);

				test
				(
					'should do nothing for non-existent panel',
					function (fDone)
					{
						_RenderManager.renderSingleTether('non-existent');
						fDone();
					}
				);

				test
				(
					'should do nothing when TethersLayer is null',
					function (fDone)
					{
						_MockFlowView._TethersLayer = null;
						_RenderManager.renderSingleTether('panel-1');
						fDone();
					}
				);

				test
				(
					'should do nothing when TetherService is null',
					function (fDone)
					{
						_MockFlowView._TetherService = null;
						_RenderManager.renderSingleTether('panel-1');
						fDone();
					}
				);
			}
		);

		// ---- updateNodePosition ----

		suite
		(
			'updateNodePosition',
			function ()
			{
				test
				(
					'should update node X and Y',
					function (fDone)
					{
						_RenderManager.renderFlow();

						_RenderManager.updateNodePosition('n1', 500, 300);

						let tmpNode = _MockFlowView._FlowData.Nodes.find((n) => n.Hash === 'n1');
						libExpect(tmpNode.X).to.equal(500);
						libExpect(tmpNode.Y).to.equal(300);
						fDone();
					}
				);

				test
				(
					'should snap to grid when enabled',
					function (fDone)
					{
						_MockFlowView.options.EnableGridSnap = true;
						_MockFlowView.options.GridSnapSize = 20;

						_RenderManager.renderFlow();

						_RenderManager.updateNodePosition('n1', 513, 307);

						let tmpNode = _MockFlowView._FlowData.Nodes.find((n) => n.Hash === 'n1');
						libExpect(tmpNode.X).to.equal(520);
						libExpect(tmpNode.Y).to.equal(300);
						fDone();
					}
				);

				test
				(
					'should call _resetHandlesForNode',
					function (fDone)
					{
						let tmpResetHash = null;
						_MockFlowView._resetHandlesForNode = function (pHash) { tmpResetHash = pHash; };

						_RenderManager.renderFlow();
						_RenderManager.updateNodePosition('n1', 200, 200);

						libExpect(tmpResetHash).to.equal('n1');
						fDone();
					}
				);

				test
				(
					'should re-render connections for the moved node',
					function (fDone)
					{
						let tmpRenderedConnHashes = [];
						_MockFlowView._ConnectionRenderer.renderConnection = function (pConn, pLayer)
						{
							tmpRenderedConnHashes.push(pConn.Hash);
							let tmpEl = createMockSVGChild('connection', pConn.Hash);
							pLayer.appendChild(tmpEl);
						};

						_RenderManager.renderFlow();
						tmpRenderedConnHashes = [];

						_RenderManager.updateNodePosition('n1', 200, 200);

						// c1 connects n1 and n2, so it should be re-rendered
						libExpect(tmpRenderedConnHashes).to.include('c1');
						fDone();
					}
				);

				test
				(
					'should do nothing for non-existent node',
					function (fDone)
					{
						_RenderManager.updateNodePosition('non-existent', 200, 200);
						fDone();
					}
				);

				test
				(
					'should do nothing when no FlowView',
					function (fDone)
					{
						let tmpManager = new libRenderManager(_Fable, {}, 'NoView');
						tmpManager.updateNodePosition('n1', 200, 200);
						fDone();
					}
				);
			}
		);

		// ---- renderConnectionsForNode ----

		suite
		(
			'renderConnectionsForNode',
			function ()
			{
				test
				(
					'should re-render connections involving the specified node',
					function (fDone)
					{
						_RenderManager.renderFlow();

						let tmpRenderCount = 0;
						_MockFlowView._ConnectionRenderer.renderConnection = function (pConn, pLayer)
						{
							tmpRenderCount++;
							let tmpEl = createMockSVGChild('connection', pConn.Hash);
							pLayer.appendChild(tmpEl);
						};

						_RenderManager.renderConnectionsForNode('n1');

						libExpect(tmpRenderCount).to.equal(1);
						fDone();
					}
				);

				test
				(
					'should not re-render connections for unrelated nodes',
					function (fDone)
					{
						_RenderManager.renderFlow();

						let tmpRenderCount = 0;
						_MockFlowView._ConnectionRenderer.renderConnection = function ()
						{
							tmpRenderCount++;
						};

						_RenderManager.renderConnectionsForNode('unrelated-node');

						libExpect(tmpRenderCount).to.equal(0);
						fDone();
					}
				);

				test
				(
					'should do nothing when ConnectionsLayer is null',
					function (fDone)
					{
						_MockFlowView._ConnectionsLayer = null;
						_RenderManager.renderConnectionsForNode('n1');
						fDone();
					}
				);
			}
		);

		// ---- renderTethersForNode ----

		suite
		(
			'renderTethersForNode',
			function ()
			{
				test
				(
					'should re-render tethers for panels attached to the node',
					function (fDone)
					{
						_MockFlowView._FlowData.OpenPanels = [{ Hash: 'panel-1', NodeHash: 'n1' }];

						let tmpRenderCount = 0;
						_MockFlowView._TetherService.renderTether = function (pPanel, pNodeData, pLayer)
						{
							tmpRenderCount++;
							let tmpEl = createMockSVGChild('panel', pPanel.Hash);
							pLayer.appendChild(tmpEl);
						};

						_RenderManager.renderTethersForNode('n1');

						libExpect(tmpRenderCount).to.equal(1);
						fDone();
					}
				);

				test
				(
					'should skip panels for other nodes',
					function (fDone)
					{
						_MockFlowView._FlowData.OpenPanels = [{ Hash: 'panel-1', NodeHash: 'n2' }];

						let tmpRenderCount = 0;
						_MockFlowView._TetherService.renderTether = function ()
						{
							tmpRenderCount++;
						};

						_RenderManager.renderTethersForNode('n1');

						libExpect(tmpRenderCount).to.equal(0);
						fDone();
					}
				);

				test
				(
					'should do nothing when no panels for node',
					function (fDone)
					{
						_MockFlowView._FlowData.OpenPanels = [];
						_RenderManager.renderTethersForNode('n1');
						fDone();
					}
				);

				test
				(
					'should do nothing when TethersLayer is null',
					function (fDone)
					{
						_MockFlowView._TethersLayer = null;
						_RenderManager.renderTethersForNode('n1');
						fDone();
					}
				);

				test
				(
					'should do nothing when TetherService is null',
					function (fDone)
					{
						_MockFlowView._TetherService = null;
						_RenderManager.renderTethersForNode('n1');
						fDone();
					}
				);
			}
		);

		// ---- reinjectMarkerDefs ----

		suite
		(
			'reinjectMarkerDefs',
			function ()
			{
				test
				(
					'should do nothing when ConnectorShapesProvider is null',
					function (fDone)
					{
						_MockFlowView._ConnectorShapesProvider = null;
						_RenderManager.reinjectMarkerDefs();
						fDone();
					}
				);

				test
				(
					'should do nothing when SVGElement is null',
					function (fDone)
					{
						_MockFlowView._SVGElement = null;
						_RenderManager.reinjectMarkerDefs();
						fDone();
					}
				);

				test
				(
					'should do nothing when no FlowView',
					function (fDone)
					{
						let tmpManager = new libRenderManager(_Fable, {}, 'NoView');
						tmpManager.reinjectMarkerDefs();
						fDone();
					}
				);
			}
		);
	}
);
