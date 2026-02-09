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
			'stroke': '#27ae60',
			'rx': '25',
			'ry': '25'
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
		TitleBarColor: '#e74c3c',
		BodyStyle:
		{
			'fill': '#fdedec',
			'stroke': '#e74c3c',
			'rx': '25',
			'ry': '25'
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
}

module.exports = PictProviderFlowNodeTypes;

module.exports.default_configuration = _ProviderConfiguration;
module.exports.DefaultNodeTypes = _DefaultNodeTypes;
