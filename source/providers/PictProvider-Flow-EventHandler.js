const libPictProvider = require('pict-provider');

const _ProviderConfiguration =
{
	ProviderIdentifier: 'PictProviderFlowEventHandler'
};

/**
 * Event handler provider for the flow diagram.
 * Provides hook points for extensibility - consumers can register handlers
 * for flow events like node selection, movement, connection creation, etc.
 *
 * Supported events:
 * - onNodeSelected(node)              - A node was selected (or null for deselection)
 * - onNodeAdded(node)                 - A new node was added
 * - onNodeRemoved(node)               - A node was removed
 * - onNodeMoved(node)                 - A node was moved to a new position
 * - onConnectionSelected(conn)        - A connection was selected
 * - onConnectionCreated(conn)         - A new connection was created
 * - onConnectionRemoved(conn)         - A connection was removed
 * - onConnectionHandleMoved(conn)     - A connection's drag handle was repositioned
 * - onConnectionModeChanged(conn)     - A connection's line mode was toggled (bezier/orthogonal)
 * - onPanelOpened(panelData)          - A properties panel was opened
 * - onPanelClosed(panelData)          - A properties panel was closed
 * - onPanelMoved(panelData)           - A properties panel was moved
 * - onTetherSelected(panelData)       - A tether line was selected (or null for deselection)
 * - onTetherHandleMoved(panelData)    - A tether's drag handle was repositioned
 * - onTetherModeChanged(panelData)    - A tether's line mode was toggled (bezier/orthogonal)
 * - onFlowChanged(flowData)           - The flow data changed (catch-all)
 */
class PictProviderFlowEventHandler extends libPictProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, _ProviderConfiguration, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'PictProviderFlowEventHandler';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;

		// Event handler registry
		this._Handlers = {};
	}

	/**
	 * Register an event handler
	 * @param {string} pEventName - The event name (e.g., 'onNodeSelected')
	 * @param {Function} pHandler - The handler function
	 * @param {string} [pHandlerHash] - Optional unique identifier for this handler (for later removal)
	 * @returns {string} The handler hash
	 */
	registerHandler(pEventName, pHandler, pHandlerHash)
	{
		if (typeof pHandler !== 'function')
		{
			this.log.warn(`PictProviderFlowEventHandler registerHandler: handler for '${pEventName}' is not a function`);
			return null;
		}

		if (!this._Handlers[pEventName])
		{
			this._Handlers[pEventName] = [];
		}

		let tmpHash = pHandlerHash || `handler-${this.fable.getUUID()}`;

		this._Handlers[pEventName].push({
			Hash: tmpHash,
			Handler: pHandler
		});

		this.log.trace(`PictProviderFlowEventHandler registered handler '${tmpHash}' for event '${pEventName}'`);

		return tmpHash;
	}

	/**
	 * Remove a specific event handler
	 * @param {string} pEventName - The event name
	 * @param {string} pHandlerHash - The handler hash to remove
	 * @returns {boolean}
	 */
	removeHandler(pEventName, pHandlerHash)
	{
		if (!this._Handlers[pEventName]) return false;

		let tmpIndex = this._Handlers[pEventName].findIndex((pH) => pH.Hash === pHandlerHash);
		if (tmpIndex >= 0)
		{
			this._Handlers[pEventName].splice(tmpIndex, 1);
			return true;
		}

		return false;
	}

	/**
	 * Remove all handlers for a specific event
	 * @param {string} pEventName
	 */
	removeAllHandlers(pEventName)
	{
		if (pEventName)
		{
			this._Handlers[pEventName] = [];
		}
		else
		{
			this._Handlers = {};
		}
	}

	/**
	 * Fire an event, calling all registered handlers
	 * @param {string} pEventName - The event name
	 * @param {*} pEventData - The event data to pass to handlers
	 */
	fireEvent(pEventName, pEventData)
	{
		this.log.trace(`PictProviderFlowEventHandler firing event '${pEventName}'`);

		if (!this._Handlers[pEventName] || this._Handlers[pEventName].length === 0)
		{
			return;
		}

		for (let i = 0; i < this._Handlers[pEventName].length; i++)
		{
			let tmpEntry = this._Handlers[pEventName][i];
			try
			{
				tmpEntry.Handler(pEventData, this._FlowView);
			}
			catch (pError)
			{
				this.log.error(`PictProviderFlowEventHandler error in handler '${tmpEntry.Hash}' for event '${pEventName}': ${pError.message}`);
			}
		}
	}

	/**
	 * Check if any handlers are registered for a specific event
	 * @param {string} pEventName
	 * @returns {boolean}
	 */
	hasHandlers(pEventName)
	{
		return !!(this._Handlers[pEventName] && this._Handlers[pEventName].length > 0);
	}

	/**
	 * Get the count of handlers for a specific event
	 * @param {string} pEventName
	 * @returns {number}
	 */
	getHandlerCount(pEventName)
	{
		if (!this._Handlers[pEventName]) return 0;
		return this._Handlers[pEventName].length;
	}
}

module.exports = PictProviderFlowEventHandler;

module.exports.default_configuration = _ProviderConfiguration;
