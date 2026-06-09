const libFable = require('fable');
const libChai = require('chai');
const libExpect = libChai.expect;

const libInteractionManager = require('../source/services/PictService-Flow-InteractionManager.js');
const STATES = libInteractionManager.INTERACTION_STATES;

// EnableUndirectedConnections lets a connection be drawn between ANY two ports rather than only
// output -> input. A free-form canvas (a moodboard) turns it on so a card's ports connect in any
// direction; directed graphs (workflows) leave it off. These tests cover the start side of the drag
// (the gate that previously hard-required an output port). The completion side uses
// document.elementFromPoint, so it is exercised in the browser rather than here.
function makeFlowView(pUndirected)
{
	return {
		options: { EnableConnectionCreation: true, EnableUndirectedConnections: pUndirected },
		// Returning null skips the drag-line DOM creation, so no document is needed.
		getPortPosition: function () { return null; },
		_ViewportElement: { appendChild: function () {} }
	};
}

function makeManager(pFable, pFlowView)
{
	let tmpManager = new libInteractionManager(pFable, { FlowView: pFlowView }, 'IM-Test');
	tmpManager._SVGElement = { classList: { add: function () {}, remove: function () {} } };
	return tmpManager;
}

function makePort(pNodeHash, pPortHash, pDirection)
{
	let tmpAttrs = { 'data-node-hash': pNodeHash, 'data-port-hash': pPortHash, 'data-port-direction': pDirection };
	return { getAttribute: function (pName) { return Object.prototype.hasOwnProperty.call(tmpAttrs, pName) ? tmpAttrs[pName] : null; } };
}

suite('Flow undirected connections (EnableUndirectedConnections)',
function ()
{
	let _Fable;
	setup(function () { _Fable = new libFable({}); });

	test('directed mode (default): an input port does NOT start a connection',
	function ()
	{
		let tmpManager = makeManager(_Fable, makeFlowView(false));
		tmpManager._startConnection({ stopPropagation: function () {} }, makePort('n1', 'p1', 'input'));
		libExpect(tmpManager._State).to.not.equal(STATES.CONNECTING);
	});

	test('undirected mode: an input port DOES start a connection',
	function ()
	{
		let tmpManager = makeManager(_Fable, makeFlowView(true));
		tmpManager._startConnection({ stopPropagation: function () {} }, makePort('n1', 'p1', 'input'));
		libExpect(tmpManager._State).to.equal(STATES.CONNECTING);
		libExpect(tmpManager._ConnectSourceNodeHash).to.equal('n1');
		libExpect(tmpManager._ConnectSourcePortHash).to.equal('p1');
	});

	test('an output port starts a connection in either mode',
	function ()
	{
		[ false, true ].forEach(function (pUndirected)
		{
			let tmpManager = makeManager(_Fable, makeFlowView(pUndirected));
			tmpManager._startConnection({ stopPropagation: function () {} }, makePort('n1', 'p1', 'output'));
			libExpect(tmpManager._State).to.equal(STATES.CONNECTING);
		});
	});
});
