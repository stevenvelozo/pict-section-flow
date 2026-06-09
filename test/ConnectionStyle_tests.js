const libFable = require('fable');
const libChai = require('chai');
const libExpect = libChai.expect;

const libConnectorShapes = require('../source/providers/PictProvider-Flow-ConnectorShapes.js');
const libConnectionRenderer = require('../source/services/PictService-Flow-ConnectionRenderer.js');

// Per-connection appearance: a host (a moodboard) styles its own edges by stamping Data on a
// connection -- stroke color / width / style and the marker at each end ('none' | 'arrow' | 'dot' |
// 'square'). The renderer applies these only when present, so default (workflow) edges are untouched.
suite('Flow connection appearance',
function ()
{
	suite('marker defs',
	function ()
	{
		test('generateMarkerDefs includes the generic arrow / dot / square markers (color-matched)',
		function ()
		{
			let tmpProvider = new libConnectorShapes(new libFable({}), {}, 'CS-Test');
			let tmpDefs = tmpProvider.generateMarkerDefs('view1');
			libExpect(tmpDefs).to.contain('flow-marker-arrow-end-view1');
			libExpect(tmpDefs).to.contain('flow-marker-arrow-start-view1');
			libExpect(tmpDefs).to.contain('flow-marker-dot-view1');
			libExpect(tmpDefs).to.contain('flow-marker-square-view1');
			libExpect(tmpDefs).to.contain('context-stroke');
		});
	});

	suite('_connectionMarkerId',
	function ()
	{
		let _Resolve = libConnectionRenderer.prototype._connectionMarkerId;

		test('resolves marker names to def ids per end; none / unknown -> null',
		function ()
		{
			libExpect(_Resolve('arrow', 'end', 'v')).to.equal('flow-marker-arrow-end-v');
			libExpect(_Resolve('arrow', 'start', 'v')).to.equal('flow-marker-arrow-start-v');
			libExpect(_Resolve('dot', 'end', 'v')).to.equal('flow-marker-dot-v');
			libExpect(_Resolve('square', 'end', 'v')).to.equal('flow-marker-square-v');
			libExpect(_Resolve('none', 'end', 'v')).to.equal(null);
			libExpect(_Resolve(undefined, 'end', 'v')).to.equal(null);
		});
	});

	suite('_applyConnectionStyle',
	function ()
	{
		let _Self = { _connectionMarkerId: libConnectionRenderer.prototype._connectionMarkerId };
		function makePath()
		{
			let tmpAttrs = {};
			// Stroke color / width / dash are set via inline style (they must outrank the .pict-flow-connection
			// CSS rule); markers are SVG attributes.
			return { style: {}, setAttribute: function (pK, pV) { tmpAttrs[pK] = pV; }, removeAttribute: function (pK) { delete tmpAttrs[pK]; }, attrs: tmpAttrs };
		}

		test('applies stroke color / width / dash via inline style + markers via attributes',
		function ()
		{
			let tmpPath = makePath();
			libConnectionRenderer.prototype._applyConnectionStyle.call(_Self, tmpPath, { StrokeColor: '#abcdef', StrokeWidth: 4, StrokeStyle: 'dashed', SourceMarker: 'dot', TargetMarker: 'arrow' }, 'v');
			libExpect(tmpPath.style.stroke).to.equal('#abcdef');
			libExpect(tmpPath.style.strokeWidth).to.equal('4');
			libExpect(tmpPath.style.strokeDasharray).to.equal('7,5');
			libExpect(tmpPath.attrs['marker-start']).to.equal('url(#flow-marker-dot-v)');
			libExpect(tmpPath.attrs['marker-end']).to.equal('url(#flow-marker-arrow-end-v)');
		});

		test('solid sets the dash to none; a none marker clears that end',
		function ()
		{
			let tmpPath = makePath();
			tmpPath.setAttribute('marker-end', 'url(#old)');
			libConnectionRenderer.prototype._applyConnectionStyle.call(_Self, tmpPath, { StrokeStyle: 'solid', TargetMarker: 'none' }, 'v');
			libExpect(tmpPath.style.strokeDasharray).to.equal('none');
			libExpect(tmpPath.attrs['marker-end']).to.equal(undefined);
		});

		test('Data with no style keys leaves the element untouched',
		function ()
		{
			let tmpPath = makePath();
			libConnectionRenderer.prototype._applyConnectionStyle.call(_Self, tmpPath, {}, 'v');
			libExpect(Object.keys(tmpPath.attrs).length).to.equal(0);
			libExpect(Object.keys(tmpPath.style).length).to.equal(0);
		});
	});
});
