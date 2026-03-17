#!/usr/bin/env node
/**
 * generate-card-help.js
 *
 * Reads markdown files from docs/card-help/ and generates a CommonJS module
 * that exports an object mapping card codes to rendered HTML strings.
 *
 * Each markdown file is named by its card code (e.g. ITE.md, SET.md).
 * The file content is converted from markdown to HTML and embedded as a
 * string in the generated module.
 *
 * Usage:
 *   node scripts/generate-card-help.js [source_dir] [output_file]
 *
 * Defaults:
 *   source_dir  = docs/card-help
 *   output_file = example_applications/simple_cards/source/card-help-content.js
 *
 * If the source directory does not exist or contains no markdown files the
 * script writes an empty map and exits cleanly — the build never fails due
 * to missing documentation.
 */

const libFS = require('fs');
const libPath = require('path');

// ---------------------------------------------------------------------------
// Minimal markdown-to-HTML converter
// ---------------------------------------------------------------------------
// Handles the subset of markdown used in card help documentation:
//   headings (#, ##, ###), bold (**), italic (*), inline code (`),
//   unordered lists (- or *), ordered lists (1.), paragraphs, line breaks,
//   and horizontal rules (---).
// ---------------------------------------------------------------------------

function convertMarkdownToHTML(pMarkdown)
{
	let tmpLines = pMarkdown.split('\n');
	let tmpHTML = [];
	let tmpInList = false;
	let tmpListType = '';
	let tmpParagraph = [];

	function flushParagraph()
	{
		if (tmpParagraph.length > 0)
		{
			tmpHTML.push('<p>' + tmpParagraph.join(' ') + '</p>');
			tmpParagraph = [];
		}
	}

	function closeList()
	{
		if (tmpInList)
		{
			tmpHTML.push(tmpListType === 'ul' ? '</ul>' : '</ol>');
			tmpInList = false;
			tmpListType = '';
		}
	}

	function inlineFormat(pText)
	{
		// Inline code
		pText = pText.replace(/`([^`]+)`/g, '<code>$1</code>');
		// Bold (** or __)
		pText = pText.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
		pText = pText.replace(/__([^_]+)__/g, '<b>$1</b>');
		// Italic (* or _)
		pText = pText.replace(/\*([^*]+)\*/g, '<i>$1</i>');
		pText = pText.replace(/(?<!\w)_([^_]+)_(?!\w)/g, '<i>$1</i>');
		// Links
		pText = pText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
		return pText;
	}

	for (let i = 0; i < tmpLines.length; i++)
	{
		let tmpLine = tmpLines[i];
		let tmpTrimmed = tmpLine.trim();

		// Empty line — flush paragraph
		if (tmpTrimmed === '')
		{
			flushParagraph();
			continue;
		}

		// Horizontal rule
		if (/^-{3,}$/.test(tmpTrimmed) || /^\*{3,}$/.test(tmpTrimmed))
		{
			flushParagraph();
			closeList();
			tmpHTML.push('<hr>');
			continue;
		}

		// Headings
		let tmpHeadingMatch = tmpTrimmed.match(/^(#{1,6})\s+(.*)$/);
		if (tmpHeadingMatch)
		{
			flushParagraph();
			closeList();
			let tmpLevel = tmpHeadingMatch[1].length;
			tmpHTML.push('<h' + tmpLevel + '>' + inlineFormat(tmpHeadingMatch[2]) + '</h' + tmpLevel + '>');
			continue;
		}

		// Unordered list item (- or *)
		let tmpULMatch = tmpTrimmed.match(/^[-*]\s+(.*)$/);
		if (tmpULMatch)
		{
			flushParagraph();
			if (!tmpInList || tmpListType !== 'ul')
			{
				closeList();
				tmpHTML.push('<ul>');
				tmpInList = true;
				tmpListType = 'ul';
			}
			tmpHTML.push('<li>' + inlineFormat(tmpULMatch[1]) + '</li>');
			continue;
		}

		// Ordered list item (1. 2. etc)
		let tmpOLMatch = tmpTrimmed.match(/^\d+\.\s+(.*)$/);
		if (tmpOLMatch)
		{
			flushParagraph();
			if (!tmpInList || tmpListType !== 'ol')
			{
				closeList();
				tmpHTML.push('<ol>');
				tmpInList = true;
				tmpListType = 'ol';
			}
			tmpHTML.push('<li>' + inlineFormat(tmpOLMatch[1]) + '</li>');
			continue;
		}

		// Regular text — accumulate into paragraph
		closeList();
		tmpParagraph.push(inlineFormat(tmpTrimmed));
	}

	flushParagraph();
	closeList();

	return tmpHTML.join('');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

let tmpModuleRoot = libPath.resolve(__dirname, '..');
let tmpSourceDir = process.argv[2]
	? libPath.resolve(process.argv[2])
	: libPath.join(tmpModuleRoot, 'docs', 'card-help');
let tmpOutputFile = process.argv[3]
	? libPath.resolve(process.argv[3])
	: libPath.join(tmpModuleRoot, 'example_applications', 'simple_cards', 'source', 'card-help-content.js');

let tmpHelpMap = {};

// Gracefully handle missing source directory
if (libFS.existsSync(tmpSourceDir))
{
	let tmpFiles = libFS.readdirSync(tmpSourceDir).filter(
		(pFile) => { return pFile.endsWith('.md'); }
	);

	for (let i = 0; i < tmpFiles.length; i++)
	{
		let tmpFile = tmpFiles[i];
		let tmpCode = libPath.basename(tmpFile, '.md');
		try
		{
			let tmpContent = libFS.readFileSync(libPath.join(tmpSourceDir, tmpFile), 'utf8');
			let tmpHTML = convertMarkdownToHTML(tmpContent);
			if (tmpHTML.length > 0)
			{
				tmpHelpMap[tmpCode] = tmpHTML;
			}
		}
		catch (pError)
		{
			// Skip files that cannot be read — never fail the build
			console.warn('generate-card-help: skipping ' + tmpFile + ' (' + pError.message + ')');
		}
	}

	console.log('generate-card-help: processed ' + Object.keys(tmpHelpMap).length + ' card help files from ' + tmpSourceDir);
}
else
{
	console.log('generate-card-help: no docs/card-help directory found — generating empty map');
}

// Ensure output directory exists
let tmpOutputDir = libPath.dirname(tmpOutputFile);
if (!libFS.existsSync(tmpOutputDir))
{
	libFS.mkdirSync(tmpOutputDir, { recursive: true });
}

// Write the generated module
let tmpOutput = '// Auto-generated by scripts/generate-card-help.js — do not edit manually.\n';
tmpOutput += '// Source markdown files are in docs/card-help/\n';
tmpOutput += 'module.exports = ' + JSON.stringify(tmpHelpMap, null, '\t') + ';\n';

libFS.writeFileSync(tmpOutputFile, tmpOutput, 'utf8');
console.log('generate-card-help: wrote ' + tmpOutputFile);
