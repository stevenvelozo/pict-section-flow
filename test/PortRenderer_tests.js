const libFable = require('fable');
const libChai = require('chai');
const libExpect = libChai.expect;

const libPortRenderer = require('../source/services/PictService-Flow-PortRenderer.js');
const libGeometry = require('../source/providers/PictProvider-Flow-Geometry.js');

suite
(
	'PictService-Flow-PortRenderer',
	function ()
	{
		let _Fable;
		let _PortRenderer;
		let _GeometryProvider;
		let _MockFlowView;

		// Simple mock SVG element for testing
		function createMockSVGElement()
		{
			let tmpSelf =
			{
				_tag: '',
				_attrs: {},
				_children: [],
				textContent: '',
				setAttribute: function (pKey, pVal)
				{
					tmpSelf._attrs[pKey] = pVal;
				},
				getAttribute: function (pKey)
				{
					return tmpSelf._attrs[pKey] || null;
				},
				appendChild: function (pChild)
				{
					tmpSelf._children.push(pChild);
				}
			};
			return tmpSelf;
		}

		setup
		(
			function ()
			{
				_Fable = new libFable({});

				_GeometryProvider = new libGeometry(_Fable, {}, 'Geometry-Test');

				_MockFlowView =
				{
					_GeometryProvider: _GeometryProvider,
					_ConnectorShapesProvider: null,
					_SVGHelperProvider:
					{
						createSVGElement: function (pTag)
						{
							let tmpEl = createMockSVGElement();
							tmpEl._tag = pTag;
							return tmpEl;
						}
					}
				};

				_PortRenderer = new libPortRenderer(
					_Fable, { FlowView: _MockFlowView }, 'PortRend-Test');
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
						libExpect(_PortRenderer.serviceType).to.equal('PictServiceFlowPortRenderer');
						fDone();
					}
				);

				test
				(
					'should store FlowView reference',
					function (fDone)
					{
						libExpect(_PortRenderer._FlowView).to.equal(_MockFlowView);
						fDone();
					}
				);

				test
				(
					'should handle missing FlowView',
					function (fDone)
					{
						let tmpRenderer = new libPortRenderer(_Fable, {}, 'NoView');
						libExpect(tmpRenderer._FlowView).to.be.null;
						fDone();
					}
				);
			}
		);

		// ---- renderPorts ----

		suite
		(
			'renderPorts',
			function ()
			{
				test
				(
					'should render port circles into the group',
					function (fDone)
					{
						let tmpGroup = createMockSVGElement();
						let tmpNodeData =
						{
							Hash: 'node-1',
							Ports:
							[
								{ Hash: 'p1', Direction: 'input', Label: null },
								{ Hash: 'p2', Direction: 'output', Label: null }
							]
						};

						_PortRenderer.renderPorts(tmpNodeData, tmpGroup, 180, 80, null, 22);

						// Should have appended port circle elements
						libExpect(tmpGroup._children.length).to.be.at.least(2);

						// Verify at least one circle element was created
						let tmpCircles = tmpGroup._children.filter(function (pChild)
						{
							return pChild._tag === 'circle';
						});
						libExpect(tmpCircles.length).to.equal(2);
						fDone();
					}
				);

				test
				(
					'should render port labels when Label is set',
					function (fDone)
					{
						let tmpGroup = createMockSVGElement();
						let tmpNodeData =
						{
							Hash: 'node-2',
							Ports:
							[
								{ Hash: 'p1', Direction: 'input', Label: 'Trigger' }
							]
						};

						_PortRenderer.renderPorts(tmpNodeData, tmpGroup, 180, 80, null, 22);

						// Should have badge bg, border path, stripe, circle, text = 5 elements
						libExpect(tmpGroup._children.length).to.equal(5);

						// Verify text element exists with correct content
						let tmpTextEls = tmpGroup._children.filter(function (pChild)
						{
							return pChild._tag === 'text';
						});
						libExpect(tmpTextEls.length).to.equal(1);
						libExpect(tmpTextEls[0].textContent).to.equal('Trigger');
						fDone();
					}
				);

				test
				(
					'should do nothing for empty ports array',
					function (fDone)
					{
						let tmpGroup = createMockSVGElement();
						let tmpNodeData = { Hash: 'node-3', Ports: [] };

						_PortRenderer.renderPorts(tmpNodeData, tmpGroup, 180, 80, null, 22);

						libExpect(tmpGroup._children.length).to.equal(0);
						fDone();
					}
				);

				test
				(
					'should do nothing when Ports is missing',
					function (fDone)
					{
						let tmpGroup = createMockSVGElement();
						let tmpNodeData = { Hash: 'node-4' };

						_PortRenderer.renderPorts(tmpNodeData, tmpGroup, 180, 80, null, 22);

						libExpect(tmpGroup._children.length).to.equal(0);
						fDone();
					}
				);

				test
				(
					'should do nothing when no FlowView',
					function (fDone)
					{
						let tmpRenderer = new libPortRenderer(_Fable, {}, 'NoView');
						let tmpGroup = createMockSVGElement();
						let tmpNodeData =
						{
							Hash: 'node-5',
							Ports: [{ Hash: 'p1', Direction: 'input' }]
						};

						tmpRenderer.renderPorts(tmpNodeData, tmpGroup, 180, 80, null, 22);
						libExpect(tmpGroup._children.length).to.equal(0);
						fDone();
					}
				);

				test
				(
					'should use ConnectorShapesProvider when available',
					function (fDone)
					{
						let tmpCreatePortCalled = false;
						_MockFlowView._ConnectorShapesProvider =
						{
							createPortElement: function (pPort, pPos, pNodeHash)
							{
								tmpCreatePortCalled = true;
								let tmpEl = createMockSVGElement();
								tmpEl._tag = 'circle';
								return tmpEl;
							}
						};

						let tmpGroup = createMockSVGElement();
						let tmpNodeData =
						{
							Hash: 'node-6',
							Ports: [{ Hash: 'p1', Direction: 'input' }]
						};

						_PortRenderer.renderPorts(tmpNodeData, tmpGroup, 180, 80, null, 22);
						libExpect(tmpCreatePortCalled).to.be.true;

						// Clean up
						_MockFlowView._ConnectorShapesProvider = null;
						fDone();
					}
				);

				test
				(
					'should set port-type data attribute when PortType is set',
					function (fDone)
					{
						let tmpGroup = createMockSVGElement();
						let tmpNodeData =
						{
							Hash: 'node-7',
							Ports:
							[
								{ Hash: 'p1', Direction: 'input', PortType: 'event-in' }
							]
						};

						_PortRenderer.renderPorts(tmpNodeData, tmpGroup, 180, 80, null, 22);

						let tmpCircles = tmpGroup._children.filter(function (pChild)
						{
							return pChild._tag === 'circle';
						});
						libExpect(tmpCircles.length).to.equal(1);
						libExpect(tmpCircles[0]._attrs['data-port-type']).to.equal('event-in');
						fDone();
					}
				);

				test
				(
					'should group ports by Side value',
					function (fDone)
					{
						let tmpGroup = createMockSVGElement();
						let tmpNodeData =
						{
							Hash: 'node-8',
							Ports:
							[
								{ Hash: 'p1', Direction: 'input', Side: 'left' },
								{ Hash: 'p2', Direction: 'input', Side: 'left' },
								{ Hash: 'p3', Direction: 'output', Side: 'right' },
								{ Hash: 'p4', Direction: 'output', Side: 'bottom' }
							]
						};

						_PortRenderer.renderPorts(tmpNodeData, tmpGroup, 180, 80, null, 22);

						let tmpCircles = tmpGroup._children.filter(function (pChild)
						{
							return pChild._tag === 'circle';
						});
						libExpect(tmpCircles.length).to.equal(4);
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
					'should delegate to GeometryProvider',
					function (fDone)
					{
						let tmpPos = _PortRenderer.getPortLocalPosition('left', 0, 1, 180, 80, 22, {});

						libExpect(tmpPos).to.have.property('x');
						libExpect(tmpPos).to.have.property('y');
						libExpect(tmpPos.x).to.equal(0); // left edge
						fDone();
					}
				);

				test
				(
					'should return right edge position',
					function (fDone)
					{
						let tmpPos = _PortRenderer.getPortLocalPosition('right', 0, 1, 180, 80, 22, {});

						libExpect(tmpPos.x).to.equal(180); // right edge
						fDone();
					}
				);

				test
				(
					'should pass title bar height correctly',
					function (fDone)
					{
						// Port should be below the title bar
						let tmpPos = _PortRenderer.getPortLocalPosition('left', 0, 1, 180, 80, 22, {});
						libExpect(tmpPos.y).to.be.greaterThan(22);
						fDone();
					}
				);
			}
		);
	}
);
