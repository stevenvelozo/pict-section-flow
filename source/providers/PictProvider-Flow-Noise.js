const libFableServiceProviderBase = require('fable-serviceproviderbase');

const _ProviderConfiguration =
{
	ProviderIdentifier: 'PictProviderFlowNoise'
};

/**
 * PictProvider-Flow-Noise
 *
 * Deterministic noise/jitter generator for hand-drawn visual effects.
 *
 * Uses seeded pseudo-random number generation so that the same node or
 * connection always receives the same jitter values across re-renders,
 * preventing visual "jumping" while still looking organic.
 */
class PictProviderFlowNoise extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, _ProviderConfiguration, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'PictProviderFlowNoise';
	}

	// ── Hashing / PRNG ────────────────────────────────────────────────────

	/**
	 * Convert a string to a 32-bit integer hash (djb2 algorithm).
	 * @param {string} pStr
	 * @returns {number}
	 */
	hashString(pStr)
	{
		let tmpHash = 5381;
		for (let i = 0; i < pStr.length; i++)
		{
			tmpHash = ((tmpHash << 5) + tmpHash) + pStr.charCodeAt(i);
			tmpHash = tmpHash & tmpHash; // Convert to 32-bit integer
		}
		return tmpHash >>> 0; // Ensure unsigned
	}

	/**
	 * Create a seeded pseudo-random number generator (Mulberry32).
	 * Returns a function that produces deterministic floats in [0, 1).
	 * @param {number} pSeed - 32-bit integer seed
	 * @returns {Function}
	 */
	seededRandom(pSeed)
	{
		let tmpSeed = pSeed | 0;
		return function()
		{
			tmpSeed = tmpSeed + 0x6D2B79F5 | 0;
			let t = Math.imul(tmpSeed ^ tmpSeed >>> 15, 1 | tmpSeed);
			t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
			return ((t ^ t >>> 14) >>> 0) / 4294967296;
		};
	}

	// ── Point Jitter ──────────────────────────────────────────────────────

	/**
	 * Apply random jitter to a point.
	 * @param {number} pX
	 * @param {number} pY
	 * @param {number} pAmplitude - Maximum offset in pixels
	 * @param {Function} pRNG - Seeded random function
	 * @returns {{x: number, y: number}}
	 */
	jitterPoint(pX, pY, pAmplitude, pRNG)
	{
		if (pAmplitude <= 0)
		{
			return { x: pX, y: pY };
		}
		return {
			x: pX + pAmplitude * (pRNG() - 0.5) * 2,
			y: pY + pAmplitude * (pRNG() - 0.5) * 2
		};
	}

	// ── Bracket Path Generation ───────────────────────────────────────────

	/**
	 * Generate an SVG path `d` string for a bracket-shaped node border.
	 *
	 * Draws true bracket shapes — `[` on the left and `]` on the right —
	 * with NO top/bottom connecting lines.  The serifs (horizontal turns)
	 * extend inward from each corner, giving a distinctive hand-drawn
	 * technical-diagram look that is immediately distinguishable from a
	 * regular rectangle at any zoom level.
	 *
	 * The bracket consists of:
	 * - Left bracket `[`: top serif → vertical left side → bottom serif
	 * - Right bracket `]`: top serif → vertical right side → bottom serif
	 * - Optional title divider line across the full width
	 *
	 * @param {number} pWidth - Node width
	 * @param {number} pHeight - Node height
	 * @param {number} pSerifLength - Length of corner serifs in px
	 * @param {number} pTitleBarHeight - Height of title bar (0 to skip divider)
	 * @param {number} pAmplitude - Noise amplitude (0 = precise)
	 * @param {string} pSeedString - Hash string for deterministic noise
	 * @returns {string} SVG path d attribute
	 */
	generateBracketPath(pWidth, pHeight, pSerifLength, pTitleBarHeight, pAmplitude, pSeedString)
	{
		let tmpRNG = this.seededRandom(this.hashString(pSeedString || 'default'));
		let tmpS = pSerifLength || 18;
		let tmpW = pWidth;
		let tmpH = pHeight;

		let tmpJ = (pX, pY) =>
		{
			return this.jitterPoint(pX, pY, pAmplitude, tmpRNG);
		};

		// Left bracket `[`: top serif → down left side → bottom serif
		let tmpTL_serif = tmpJ(tmpS, 0);
		let tmpTL_corner = tmpJ(0, 0);
		let tmpBL_corner = tmpJ(0, tmpH);
		let tmpBL_serif = tmpJ(tmpS, tmpH);

		// Right bracket `]`: top serif → down right side → bottom serif
		let tmpTR_serif = tmpJ(tmpW - tmpS, 0);
		let tmpTR_corner = tmpJ(tmpW, 0);
		let tmpBR_corner = tmpJ(tmpW, tmpH);
		let tmpBR_serif = tmpJ(tmpW - tmpS, tmpH);

		let tmpPath = '';

		// Left bracket `[`
		tmpPath += `M ${tmpTL_serif.x.toFixed(1)} ${tmpTL_serif.y.toFixed(1)}`;
		tmpPath += ` L ${tmpTL_corner.x.toFixed(1)} ${tmpTL_corner.y.toFixed(1)}`;
		tmpPath += ` L ${tmpBL_corner.x.toFixed(1)} ${tmpBL_corner.y.toFixed(1)}`;
		tmpPath += ` L ${tmpBL_serif.x.toFixed(1)} ${tmpBL_serif.y.toFixed(1)}`;

		// Right bracket `]`
		tmpPath += ` M ${tmpTR_serif.x.toFixed(1)} ${tmpTR_serif.y.toFixed(1)}`;
		tmpPath += ` L ${tmpTR_corner.x.toFixed(1)} ${tmpTR_corner.y.toFixed(1)}`;
		tmpPath += ` L ${tmpBR_corner.x.toFixed(1)} ${tmpBR_corner.y.toFixed(1)}`;
		tmpPath += ` L ${tmpBR_serif.x.toFixed(1)} ${tmpBR_serif.y.toFixed(1)}`;

		// No horizontal lines — the title bar fill rect provides visual
		// separation via its background color.  The bracket outline is
		// purely the `[` and `]` shapes on the sides.

		return tmpPath;
	}

	// ── Path Jitter (for connections) ─────────────────────────────────────

	/**
	 * Apply jitter to an existing SVG path string by offsetting coordinate
	 * pairs.  The first M and last coordinate pair receive reduced jitter
	 * to keep connections aligned with their port anchors.
	 *
	 * @param {string} pPathString - SVG path d attribute
	 * @param {number} pAmplitude - Noise amplitude (0 = no change)
	 * @param {string} pSeedString - Hash string for deterministic noise
	 * @returns {string} Modified path string
	 */
	jitterPath(pPathString, pAmplitude, pSeedString)
	{
		if (pAmplitude <= 0 || !pPathString)
		{
			return pPathString;
		}

		let tmpRNG = this.seededRandom(this.hashString(pSeedString || 'path'));

		// Parse path into tokens: commands and numbers
		let tmpTokens = pPathString.match(/[MLCQZmlcqz]|[-+]?[0-9]*\.?[0-9]+/g);
		if (!tmpTokens)
		{
			return pPathString;
		}

		// Collect all numeric coordinate indices
		let tmpNumericIndices = [];
		for (let i = 0; i < tmpTokens.length; i++)
		{
			if (/^[-+]?[0-9]*\.?[0-9]+$/.test(tmpTokens[i]))
			{
				tmpNumericIndices.push(i);
			}
		}

		// Process pairs of coordinates (x, y)
		for (let i = 0; i < tmpNumericIndices.length - 1; i += 2)
		{
			let tmpXIdx = tmpNumericIndices[i];
			let tmpYIdx = tmpNumericIndices[i + 1];

			// Reduce jitter for first and last coordinate pairs (port anchors)
			let tmpLocalAmplitude = pAmplitude;
			if (i === 0 || i >= tmpNumericIndices.length - 2)
			{
				tmpLocalAmplitude = pAmplitude * 0.15; // Minimal anchor jitter
			}
			else if (i === 2 || i >= tmpNumericIndices.length - 4)
			{
				tmpLocalAmplitude = pAmplitude * 0.5; // Reduced near anchors
			}

			let tmpX = parseFloat(tmpTokens[tmpXIdx]);
			let tmpY = parseFloat(tmpTokens[tmpYIdx]);
			let tmpJittered = this.jitterPoint(tmpX, tmpY, tmpLocalAmplitude, tmpRNG);

			tmpTokens[tmpXIdx] = tmpJittered.x.toFixed(1);
			tmpTokens[tmpYIdx] = tmpJittered.y.toFixed(1);
		}

		// Reassemble path string with spaces
		let tmpResult = '';
		for (let i = 0; i < tmpTokens.length; i++)
		{
			if (i > 0 && /^[MLCQZmlcqz]$/.test(tmpTokens[i]))
			{
				tmpResult += ' ' + tmpTokens[i];
			}
			else if (i > 0)
			{
				tmpResult += ' ' + tmpTokens[i];
			}
			else
			{
				tmpResult += tmpTokens[i];
			}
		}

		return tmpResult;
	}
}

module.exports = PictProviderFlowNoise;

module.exports.default_configuration = _ProviderConfiguration;
