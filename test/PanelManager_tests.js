const libFable = require('fable');
const libChai = require('chai');
const libExpect = libChai.expect;

const libPanelManager = require('../source/services/PictService-Flow-PanelManager.js');

/**
 * Connection (edge) properties panels. The node-panel path is well covered through the view; these
 * focus on the connection additions: gating on ConnectionPropertiesPanel, placement near the edge
 * midpoint, the open/toggle/close lifecycle, and that node panels are not disturbed.
 */
suite
(
	'PictService-Flow-PanelManager (connection panels)',
	function ()
	{
		let _Fable;
		let _PanelManager;
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
					options:
					{
						ViewIdentifier: 'Test-Flow',
						ConnectionPropertiesPanel: false
					},
					_FlowData:
					{
						Nodes:
						[
							{ Hash: 'n1', Type: 'state', X: 0, Y: 0, Width: 100, Height: 60, Ports: [ { Hash: 'n1-out', Direction: 'output' } ] },
							{ Hash: 'n2', Type: 'state', X: 300, Y: 0, Width: 100, Height: 60, Ports: [ { Hash: 'n2-in', Direction: 'input' } ] }
						],
						Connections:
						[
							{ Hash: 'c1', SourceNodeHash: 'n1', SourcePortHash: 'n1-out', TargetNodeHash: 'n2', TargetPortHash: 'n2-in', Data: {} }
						],
						OpenPanels: [],
						ViewState: { SelectedTetherHash: null }
					},
					getConnection: function (pHash) { return this._FlowData.Connections.find((pConn) => pConn.Hash === pHash) || null; },
					getNode: function (pHash) { return this._FlowData.Nodes.find((pNode) => pNode.Hash === pHash) || null; },
					getConnectionMidpoint: function (pHash) { return this.getConnection(pHash) ? { x: 200, y: 30 } : null; },
					_NodeTypeProvider:
					{
						getNodeType: function () { return { Label: 'State', PropertiesPanel: { PanelType: 'Form', DefaultWidth: 300, DefaultHeight: 220, Title: 'State' } }; }
					},
					renderFlow: function () {},
					marshalFromView: function () {},
					_PropertiesPanelView: { destroyPanel: function () {} },
					_EventHandlerProvider: { fireEvent: function () {} }
				};

				_PanelManager = new libPanelManager(_Fable, { FlowView: _MockFlowView }, 'PM-Test');
			}
		);

		test
		(
			'openConnectionPanel returns false when no ConnectionPropertiesPanel is configured',
			function ()
			{
				let tmpResult = _PanelManager.openConnectionPanel('c1');
				libExpect(tmpResult).to.equal(false);
				libExpect(_MockFlowView._FlowData.OpenPanels.length).to.equal(0);
			}
		);

		test
		(
			'openConnectionPanel returns false for an unknown connection',
			function ()
			{
				_MockFlowView.options.ConnectionPropertiesPanel = { PanelType: 'Form' };
				let tmpResult = _PanelManager.openConnectionPanel('no-such-connection');
				libExpect(tmpResult).to.equal(false);
			}
		);

		test
		(
			'openConnectionPanel opens a panel carrying the ConnectionHash, placed near the midpoint',
			function ()
			{
				_MockFlowView.options.ConnectionPropertiesPanel = { PanelType: 'Form', DefaultWidth: 320, DefaultHeight: 240, Title: 'Transition' };
				let tmpPanel = _PanelManager.openConnectionPanel('c1');

				libExpect(tmpPanel).to.be.an('object');
				libExpect(tmpPanel.ConnectionHash).to.equal('c1');
				libExpect(tmpPanel.NodeHash).to.equal(null);
				libExpect(tmpPanel.Title).to.equal('Transition');
				libExpect(tmpPanel.Width).to.equal(320);
				libExpect(tmpPanel.Height).to.equal(240);
				// Midpoint is (200, 30); the panel is offset from it.
				libExpect(tmpPanel.X).to.equal(240);
				libExpect(tmpPanel.Y).to.equal(50);
				libExpect(_MockFlowView._FlowData.OpenPanels.length).to.equal(1);
			}
		);

		test
		(
			'openConnectionPanel is idempotent: a second open returns the same panel',
			function ()
			{
				_MockFlowView.options.ConnectionPropertiesPanel = { PanelType: 'Form' };
				let tmpFirst = _PanelManager.openConnectionPanel('c1');
				let tmpSecond = _PanelManager.openConnectionPanel('c1');
				libExpect(tmpSecond.Hash).to.equal(tmpFirst.Hash);
				libExpect(_MockFlowView._FlowData.OpenPanels.length).to.equal(1);
			}
		);

		test
		(
			'toggleConnectionPanel opens then closes',
			function ()
			{
				_MockFlowView.options.ConnectionPropertiesPanel = { PanelType: 'Form' };
				let tmpOpened = _PanelManager.toggleConnectionPanel('c1');
				libExpect(tmpOpened).to.be.an('object');
				libExpect(_MockFlowView._FlowData.OpenPanels.length).to.equal(1);

				let tmpClosed = _PanelManager.toggleConnectionPanel('c1');
				libExpect(tmpClosed).to.equal(false);
				libExpect(_MockFlowView._FlowData.OpenPanels.length).to.equal(0);
			}
		);

		test
		(
			'closePanelForConnection removes the connection panel',
			function ()
			{
				_MockFlowView.options.ConnectionPropertiesPanel = { PanelType: 'Form' };
				_PanelManager.openConnectionPanel('c1');
				let tmpRemoved = _PanelManager.closePanelForConnection('c1');
				libExpect(tmpRemoved).to.equal(true);
				libExpect(_MockFlowView._FlowData.OpenPanels.length).to.equal(0);
			}
		);

		test
		(
			'node panels still open alongside connection panels, keyed separately',
			function ()
			{
				_MockFlowView.options.ConnectionPropertiesPanel = { PanelType: 'Form' };
				let tmpNodePanel = _PanelManager.openPanel('n1');
				let tmpConnPanel = _PanelManager.openConnectionPanel('c1');

				libExpect(tmpNodePanel.NodeHash).to.equal('n1');
				libExpect(tmpConnPanel.ConnectionHash).to.equal('c1');
				libExpect(_MockFlowView._FlowData.OpenPanels.length).to.equal(2);

				// Closing the connection panel leaves the node panel intact.
				_PanelManager.closePanelForConnection('c1');
				libExpect(_MockFlowView._FlowData.OpenPanels.length).to.equal(1);
				libExpect(_MockFlowView._FlowData.OpenPanels[0].NodeHash).to.equal('n1');
			}
		);
	}
);
