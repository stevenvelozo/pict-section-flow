const libPictProvider = require('pict-provider');

const _DefaultNodeTypes =
{
	'default':
	{
		Hash: 'default',
		Label: 'Default',
		DefaultWidth: 180,
		DefaultHeight: 80,
		DefaultPorts:
		[
			{ Hash: null, Direction: 'input', Side: 'left', Label: 'In' },
			{ Hash: null, Direction: 'output', Side: 'right', Label: 'Out' }
		],
		TitleBarColor: '#2c3e50',
		BodyStyle: {}
	},
	'start':
	{
		Hash: 'start',
		Label: 'Start',
		DefaultWidth: 140,
		DefaultHeight: 80,
		DefaultPorts:
		[
			{ Hash: null, Direction: 'output', Side: 'right', Label: 'Out' }
		],
		TitleBarColor: '#27ae60',
		BodyStyle:
		{
			'fill': '#eafaf1',
			'stroke': '#27ae60'
		}
	},
	'end':
	{
		Hash: 'end',
		Label: 'End',
		DefaultWidth: 140,
		DefaultHeight: 80,
		DefaultPorts:
		[
			{ Hash: null, Direction: 'input', Side: 'left', Label: 'In' }
		],
		TitleBarColor: '#1abc9c',
		BodyStyle:
		{
			'fill': '#e8f8f5',
			'stroke': '#1abc9c'
		}
	},
	'halt':
	{
		Hash: 'halt',
		Label: 'Halt',
		DefaultWidth: 140,
		DefaultHeight: 80,
		DefaultPorts:
		[
			{ Hash: null, Direction: 'input', Side: 'left', Label: 'In' }
		],
		TitleBarColor: '#e74c3c',
		BodyStyle:
		{
			'fill': '#fdedec',
			'stroke': '#e74c3c'
		}
	},
	'decision':
	{
		Hash: 'decision',
		Label: 'Decision',
		DefaultWidth: 200,
		DefaultHeight: 100,
		DefaultPorts:
		[
			{ Hash: null, Direction: 'input', Side: 'left', Label: 'In' },
			{ Hash: null, Direction: 'output', Side: 'right', Label: 'Yes' },
			{ Hash: null, Direction: 'output', Side: 'bottom', Label: 'No' }
		],
		TitleBarColor: '#f39c12',
		BodyStyle:
		{
			'fill': '#fff9e6',
			'stroke': '#f39c12'
		}
	}
};

const _ProviderConfiguration =
{
	ProviderIdentifier: 'PictProviderFlowNodeTypes'
};

class PictProviderFlowNodeTypes extends libPictProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, _ProviderConfiguration, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'PictProviderFlowNodeTypes';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;

		// Initialize with default node types
		this._NodeTypes = JSON.parse(JSON.stringify(_DefaultNodeTypes));

		// Merge any additional node types passed in via options
		if (pOptions && pOptions.AdditionalNodeTypes && typeof pOptions.AdditionalNodeTypes === 'object')
		{
			let tmpAdditionalKeys = Object.keys(pOptions.AdditionalNodeTypes);
			for (let i = 0; i < tmpAdditionalKeys.length; i++)
			{
				this._NodeTypes[tmpAdditionalKeys[i]] = Object.assign(
					{},
					this._NodeTypes[tmpAdditionalKeys[i]] || {},
					JSON.parse(JSON.stringify(pOptions.AdditionalNodeTypes[tmpAdditionalKeys[i]]))
				);
			}
		}
	}

	/**
	 * Get a node type configuration by hash
	 * @param {string} pTypeHash - The node type hash
	 * @returns {Object|null} The node type configuration
	 */
	getNodeType(pTypeHash)
	{
		return this._NodeTypes[pTypeHash] || this._NodeTypes['default'];
	}

	/**
	 * Register a new node type or override an existing one
	 * @param {Object} pNodeTypeConfig - The node type configuration
	 * @returns {boolean}
	 */
	registerNodeType(pNodeTypeConfig)
	{
		if (!pNodeTypeConfig || !pNodeTypeConfig.Hash)
		{
			this.log.warn('PictProviderFlowNodeTypes registerNodeType: invalid config (missing Hash)');
			return false;
		}

		this._NodeTypes[pNodeTypeConfig.Hash] = Object.assign(
			{},
			this._NodeTypes[pNodeTypeConfig.Hash] || {},
			pNodeTypeConfig
		);

		return true;
	}

	/**
	 * Remove a node type
	 * @param {string} pTypeHash
	 * @returns {boolean}
	 */
	removeNodeType(pTypeHash)
	{
		if (pTypeHash === 'default')
		{
			this.log.warn('PictProviderFlowNodeTypes: cannot remove the default node type');
			return false;
		}

		if (this._NodeTypes[pTypeHash])
		{
			delete this._NodeTypes[pTypeHash];
			return true;
		}

		return false;
	}

	/**
	 * Get all registered node types
	 * @returns {Object} Map of type hash to type configuration
	 */
	getNodeTypes()
	{
		return JSON.parse(JSON.stringify(this._NodeTypes));
	}

	/**
	 * Get a list of node type hashes
	 * @returns {Array<string>}
	 */
	getNodeTypeList()
	{
		return Object.keys(this._NodeTypes);
	}

	/**
	 * Get all enabled node types that have FlowCard metadata.
	 * Returns only types that are cards and whose Enabled flag is true.
	 * @returns {Array<Object>} Array of node type configurations
	 */
	getEnabledCards()
	{
		let tmpCards = [];
		let tmpKeys = Object.keys(this._NodeTypes);
		for (let i = 0; i < tmpKeys.length; i++)
		{
			let tmpType = this._NodeTypes[tmpKeys[i]];
			if (tmpType.CardMetadata)
			{
				if (tmpType.CardMetadata.Enabled !== false)
				{
					tmpCards.push(JSON.parse(JSON.stringify(tmpType)));
				}
			}
		}
		return tmpCards;
	}

	/**
	 * Get all enabled cards grouped by category.
	 * @returns {Object} Map of category name to array of node type configurations
	 */
	getCardsByCategory()
	{
		let tmpCards = this.getEnabledCards();
		let tmpCategories = {};
		for (let i = 0; i < tmpCards.length; i++)
		{
			let tmpCategory = (tmpCards[i].CardMetadata && tmpCards[i].CardMetadata.Category)
				? tmpCards[i].CardMetadata.Category
				: 'General';
			if (!tmpCategories[tmpCategory])
			{
				tmpCategories[tmpCategory] = [];
			}
			tmpCategories[tmpCategory].push(tmpCards[i]);
		}
		return tmpCategories;
	}

	/**
	 * Check whether a node type hash refers to a FlowCard (has CardMetadata).
	 * @param {string} pTypeHash
	 * @returns {boolean}
	 */
	isFlowCard(pTypeHash)
	{
		let tmpType = this._NodeTypes[pTypeHash];
		return !!(tmpType && tmpType.CardMetadata);
	}
}

module.exports = PictProviderFlowNodeTypes;

module.exports.default_configuration = _ProviderConfiguration;
module.exports.DefaultNodeTypes = _DefaultNodeTypes;
