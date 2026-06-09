const libChai = require('chai');
const libExpect = libChai.expect;

const libPictViewFlowToolbar = require('../source/views/PictView-Flow-Toolbar.js');

// The card palette and the add-node list render one row per card type. Each row's icon / swatch / code
// pieces are conditional, but the pict template engine does NOT parse a nested {~D:~} inside a {~NE:~}
// (the NE `~}` terminator collides with the inner tag's), which left the palette showing raw template
// literals like "{~D:Record.IconHTML ~}~};">~} Image". The fix pre-renders each piece into a complete
// HTML block in the popup builder and renders it with a plain {~D:~}. These tests guard that the
// broken pattern does not return.
suite('Flow card palette + add-node row templates',
function ()
{
	function templateByHash(pHash)
	{
		let tmpTemplate = libPictViewFlowToolbar.default_configuration.Templates.find((pT) => pT.Hash === pHash);
		return tmpTemplate ? tmpTemplate.Template : null;
	}

	// A {~NE:Addr^ ... {~ ... ~} ... ~} block: an NE whose content contains a nested template tag.
	const _NESTED_NE = /\{~NE:[^^]+\^[^~]*\{~/;

	test('the card-palette row renders pre-built blocks, with no nested tag inside an NE',
	function ()
	{
		let tmpTemplate = templateByHash('Flow-Cards-Card');
		libExpect(tmpTemplate, 'Flow-Cards-Card template exists').to.be.a('string');
		libExpect(_NESTED_NE.test(tmpTemplate), 'no nested {~..~} inside an {~NE:~}').to.equal(false);
		libExpect(tmpTemplate).to.contain('{~D:Record.IconBlock~}');
		libExpect(tmpTemplate).to.contain('{~D:Record.SwatchBlock~}');
		libExpect(tmpTemplate).to.contain('{~D:Record.CodeBlock~}');
	});

	test('the add-node row renders a pre-built code block, with no nested tag inside an NE',
	function ()
	{
		let tmpTemplate = templateByHash('Flow-AddNode-Row');
		libExpect(tmpTemplate, 'Flow-AddNode-Row template exists').to.be.a('string');
		libExpect(_NESTED_NE.test(tmpTemplate), 'no nested {~..~} inside an {~NE:~}').to.equal(false);
		libExpect(tmpTemplate).to.contain('{~D:Record.CodeBlock~}');
	});
});
