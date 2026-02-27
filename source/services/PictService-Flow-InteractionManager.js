const libFableServiceProviderBase = require('fable-serviceproviderbase');

/**
 * Interaction states for the flow diagram
 */
const INTERACTION_STATES =
{
	IDLE: 'idle',
	DRAGGING_NODE: 'dragging-node',
	DRAGGING_PANEL: 'dragging-panel',
	DRAGGING_HANDLE: 'dragging-handle',
	CONNECTING: 'connecting',
	PANNING: 'panning'
};

class PictServiceFlowInteractionManager extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictServiceFlowInteractionManager';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;

		this._SVGElement = null;
		this._ViewportElement = null;

		// Interaction state
		this._State = INTERACTION_STATES.IDLE;

		// Drag state
		this._DragNodeHash = null;
		this._DragStartX = 0;
		this._DragStartY = 0;
		this._DragNodeStartX = 0;
		this._DragNodeStartY = 0;

		// Panel drag state
		this._DragPanelHash = null;
		this._DragPanelStartX = 0;
		this._DragPanelStartY = 0;
		this._DragPanelDataStartX = 0;
		this._DragPanelDataStartY = 0;

		// Handle drag state
		this._DragHandleConnectionHash = null;
		this._DragHandlePanelHash = null;
		this._DragHandleType = null;
		this._DragHandleIsTether = false;

		// Pan state
		this._PanStartX = 0;
		this._PanStartY = 0;
		this._PanStartPanX = 0;
		this._PanStartPanY = 0;

		// Connection drag state
		this._ConnectSourceNodeHash = null;
		this._ConnectSourcePortHash = null;
		this._ConnectDragLine = null;

		// Double-click detection
		this._LastClickTime = 0;
		this._LastClickNodeHash = null;
		this._DoubleClickThreshold = 400;

		// Double-click detection for handles
		this._LastHandleClickTime = 0;
		this._LastHandleClickHash = null;
		this._LastHandleClickType = null;

		// Bound event handlers (for removeEventListener)
		this._boundOnPointerDown = this._onPointerDown.bind(this);
		this._boundOnPointerMove = this._onPointerMove.bind(this);
		this._boundOnPointerUp = this._onPointerUp.bind(this);
		this._boundOnWheel = this._onWheel.bind(this);
		this._boundOnKeyDown = this._onKeyDown.bind(this);
	}

	/**
	 * Initialize event listeners on the SVG element
	 * @param {SVGSVGElement} pSVGElement
	 * @param {SVGGElement} pViewportElement
	 */
	initialize(pSVGElement, pViewportElement)
	{
		this._SVGElement = pSVGElement;
		this._ViewportElement = pViewportElement;

		if (!this._SVGElement) return;

		// Use pointer events for unified mouse/touch handling
		this._SVGElement.addEventListener('pointerdown', this._boundOnPointerDown);
		this._SVGElement.addEventListener('pointermove', this._boundOnPointerMove);
		this._SVGElement.addEventListener('pointerup', this._boundOnPointerUp);
		this._SVGElement.addEventListener('pointerleave', this._boundOnPointerUp);
		this._SVGElement.addEventListener('wheel', this._boundOnWheel, { passive: false });

		// Keyboard events for delete
		document.addEventListener('keydown', this._boundOnKeyDown);

		// Prevent context menu on right-click
		this._SVGElement.addEventListener('contextmenu', (pEvent) =>
		{
			pEvent.preventDefault();
		});
	}

	/**
	 * Remove all event listeners
	 */
	destroy()
	{
		if (this._SVGElement)
		{
			this._SVGElement.removeEventListener('pointerdown', this._boundOnPointerDown);
			this._SVGElement.removeEventListener('pointermove', this._boundOnPointerMove);
			this._SVGElement.removeEventListener('pointerup', this._boundOnPointerUp);
			this._SVGElement.removeEventListener('pointerleave', this._boundOnPointerUp);
			this._SVGElement.removeEventListener('wheel', this._boundOnWheel);
		}

		document.removeEventListener('keydown', this._boundOnKeyDown);
	}

	/**
	 * Handle pointer down event
	 * @param {PointerEvent} pEvent
	 */
	_onPointerDown(pEvent)
	{
		if (!this._FlowView) return;

		let tmpTarget = pEvent.target;
		let tmpElementType = this._getElementType(tmpTarget);

		// Check if click is inside a panel body — let HTML handle its own events
		if (tmpTarget.closest && tmpTarget.closest('.pict-flow-panel-body'))
		{
			return;
		}

		// Capture pointer for smooth dragging
		this._SVGElement.setPointerCapture(pEvent.pointerId);

		switch (tmpElementType)
		{
			case 'port':
				this._startConnection(pEvent, tmpTarget);
				break;

			case 'node':
			case 'node-body':
			case 'panel-indicator':
			{
				let tmpNodeHash = this._getNodeHash(tmpTarget);
				let tmpNow = Date.now();

				// Check for double-click on same node
				if (tmpNodeHash && tmpNodeHash === this._LastClickNodeHash
					&& (tmpNow - this._LastClickTime) < this._DoubleClickThreshold)
				{
					// Double-click: toggle panel
					this._LastClickTime = 0;
					this._LastClickNodeHash = null;
					this._FlowView.togglePanel(tmpNodeHash);
				}
				else
				{
					// Single click: start node drag
					this._LastClickTime = tmpNow;
					this._LastClickNodeHash = tmpNodeHash;
					this._startNodeDrag(pEvent, tmpTarget);
				}
				break;
			}

			case 'panel-titlebar':
				this._startPanelDrag(pEvent, tmpTarget);
				break;

			case 'panel-close':
			{
				let tmpPanelHash = this._getPanelHash(tmpTarget);
				if (tmpPanelHash)
				{
					this._FlowView.closePanel(tmpPanelHash);
				}
				break;
			}

			case 'connection-handle':
			{
				let tmpConnectionHash = this._getConnectionHash(tmpTarget);
				let tmpHandleType = tmpTarget.getAttribute('data-handle-type');
				let tmpNow = Date.now();

				// Check for double-click on handle to toggle mode
				if (tmpConnectionHash === this._LastHandleClickHash
					&& tmpHandleType === this._LastHandleClickType
					&& (tmpNow - this._LastHandleClickTime) < this._DoubleClickThreshold)
				{
					this._toggleConnectionLineMode(tmpConnectionHash);
					this._LastHandleClickTime = 0;
					this._LastHandleClickHash = null;
					this._LastHandleClickType = null;
				}
				else
				{
					this._LastHandleClickTime = tmpNow;
					this._LastHandleClickHash = tmpConnectionHash;
					this._LastHandleClickType = tmpHandleType;
					this._startHandleDrag(pEvent, tmpConnectionHash, null, tmpHandleType, false);
				}
				pEvent.stopPropagation();
				break;
			}

			case 'tether':
			case 'tether-hitarea':
				this._selectTether(tmpTarget);
				break;

			case 'tether-handle':
			{
				let tmpPanelHash = this._getPanelHash(tmpTarget);
				let tmpHandleType = tmpTarget.getAttribute('data-handle-type');
				let tmpNow = Date.now();

				// Check for double-click on tether handle to toggle mode
				if (tmpPanelHash === this._LastHandleClickHash
					&& tmpHandleType === this._LastHandleClickType
					&& (tmpNow - this._LastHandleClickTime) < this._DoubleClickThreshold)
				{
					this._toggleTetherLineMode(tmpPanelHash);
					this._LastHandleClickTime = 0;
					this._LastHandleClickHash = null;
					this._LastHandleClickType = null;
				}
				else
				{
					this._LastHandleClickTime = tmpNow;
					this._LastHandleClickHash = tmpPanelHash;
					this._LastHandleClickType = tmpHandleType;
					this._startHandleDrag(pEvent, null, tmpPanelHash, tmpHandleType, true);
				}
				pEvent.stopPropagation();
				break;
			}

			case 'connection':
			case 'connection-hitarea':
				this._selectConnection(tmpTarget);
				break;

			default:
				// Click on background - start panning or deselect
				if (pEvent.button === 0 && this._FlowView.options.EnablePanning)
				{
					this._startPanning(pEvent);
				}
				break;
		}
	}

	/**
	 * Handle pointer move event
	 * @param {PointerEvent} pEvent
	 */
	_onPointerMove(pEvent)
	{
		if (!this._FlowView) return;

		switch (this._State)
		{
			case INTERACTION_STATES.DRAGGING_NODE:
				this._onNodeDrag(pEvent);
				break;

			case INTERACTION_STATES.DRAGGING_PANEL:
				this._onPanelDrag(pEvent);
				break;

			case INTERACTION_STATES.DRAGGING_HANDLE:
				this._onHandleDrag(pEvent);
				break;

			case INTERACTION_STATES.CONNECTING:
				this._onConnectionDrag(pEvent);
				break;

			case INTERACTION_STATES.PANNING:
				this._onPan(pEvent);
				break;
		}
	}

	/**
	 * Handle pointer up event
	 * @param {PointerEvent} pEvent
	 */
	_onPointerUp(pEvent)
	{
		if (!this._FlowView) return;

		// Release pointer capture
		if (this._SVGElement.hasPointerCapture && this._SVGElement.hasPointerCapture(pEvent.pointerId))
		{
			this._SVGElement.releasePointerCapture(pEvent.pointerId);
		}

		switch (this._State)
		{
			case INTERACTION_STATES.DRAGGING_NODE:
				this._endNodeDrag(pEvent);
				break;

			case INTERACTION_STATES.DRAGGING_PANEL:
				this._endPanelDrag(pEvent);
				break;

			case INTERACTION_STATES.DRAGGING_HANDLE:
				this._endHandleDrag(pEvent);
				break;

			case INTERACTION_STATES.CONNECTING:
				this._endConnection(pEvent);
				break;

			case INTERACTION_STATES.PANNING:
				this._endPanning(pEvent);
				break;
		}
	}

	/**
	 * Handle mouse wheel for zoom
	 * @param {WheelEvent} pEvent
	 */
	_onWheel(pEvent)
	{
		if (!this._FlowView || !this._FlowView.options.EnableZooming) return;

		pEvent.preventDefault();

		let tmpDelta = pEvent.deltaY > 0 ? -this._FlowView.options.ZoomStep : this._FlowView.options.ZoomStep;
		let tmpNewZoom = this._FlowView.viewState.Zoom + tmpDelta;

		// Zoom toward mouse position
		let tmpRect = this._SVGElement.getBoundingClientRect();
		let tmpMouseX = pEvent.clientX - tmpRect.left;
		let tmpMouseY = pEvent.clientY - tmpRect.top;

		this._FlowView.setZoom(tmpNewZoom, tmpMouseX, tmpMouseY);
	}

	/**
	 * Handle keyboard events
	 * @param {KeyboardEvent} pEvent
	 */
	_onKeyDown(pEvent)
	{
		if (!this._FlowView) return;

		// Only handle events when the flow is focused/visible
		if (pEvent.key === 'Delete' || pEvent.key === 'Backspace')
		{
			// Don't delete if user is typing in an input or inside a panel
			if (pEvent.target && (pEvent.target.tagName === 'INPUT' || pEvent.target.tagName === 'TEXTAREA' || pEvent.target.tagName === 'SELECT'))
			{
				return;
			}
			if (pEvent.target && pEvent.target.closest && pEvent.target.closest('.pict-flow-panel'))
			{
				return;
			}

			this._FlowView.deleteSelected();
			pEvent.preventDefault();
		}
		else if (pEvent.key === 'Escape')
		{
			if (this._State === INTERACTION_STATES.CONNECTING)
			{
				this._cancelConnection();
			}

			// Exit fullscreen if currently in fullscreen mode
			if (this._FlowView._IsFullscreen)
			{
				this._FlowView.exitFullscreen();
				// Update the toolbar button text
				if (this._FlowView._ToolbarView)
				{
					let tmpFlowViewIdentifier = this._FlowView.options.ViewIdentifier;
					let tmpBtnElements = this._FlowView.pict.ContentAssignment.getElement(`#Flow-Toolbar-Fullscreen-${tmpFlowViewIdentifier}`);
					if (tmpBtnElements.length > 0)
					{
						tmpBtnElements[0].innerHTML = '&#x26F6; Fullscreen';
					}
				}
				pEvent.preventDefault();
				return;
			}

			this._FlowView.deselectAll();
		}
	}

	// ---- Node Dragging ----

	_startNodeDrag(pEvent, pTarget)
	{
		if (!this._FlowView.options.EnableNodeDragging) return;

		let tmpNodeHash = this._getNodeHash(pTarget);
		if (!tmpNodeHash) return;

		this._FlowView.selectNode(tmpNodeHash);

		let tmpNode = this._FlowView.getNode(tmpNodeHash);
		if (!tmpNode) return;

		this._State = INTERACTION_STATES.DRAGGING_NODE;
		this._DragNodeHash = tmpNodeHash;
		this._DragStartX = pEvent.clientX;
		this._DragStartY = pEvent.clientY;
		this._DragNodeStartX = tmpNode.X;
		this._DragNodeStartY = tmpNode.Y;

		this._SVGElement.classList.add('panning');

		let tmpNodeGroup = this._FlowView._NodesLayer.querySelector(`[data-node-hash="${tmpNodeHash}"]`);
		if (tmpNodeGroup)
		{
			tmpNodeGroup.classList.add('dragging');
		}
	}

	_onNodeDrag(pEvent)
	{
		if (!this._DragNodeHash) return;

		let tmpVS = this._FlowView.viewState;
		let tmpDX = (pEvent.clientX - this._DragStartX) / tmpVS.Zoom;
		let tmpDY = (pEvent.clientY - this._DragStartY) / tmpVS.Zoom;

		let tmpNewX = this._DragNodeStartX + tmpDX;
		let tmpNewY = this._DragNodeStartY + tmpDY;

		this._FlowView.updateNodePosition(this._DragNodeHash, tmpNewX, tmpNewY);
	}

	_endNodeDrag(pEvent)
	{
		this._SVGElement.classList.remove('panning');

		let tmpNodeGroup = this._FlowView._NodesLayer.querySelector(`[data-node-hash="${this._DragNodeHash}"]`);
		if (tmpNodeGroup)
		{
			tmpNodeGroup.classList.remove('dragging');
		}

		this._FlowView.renderFlow();
		this._FlowView.marshalFromView();

		let tmpNode = this._FlowView.getNode(this._DragNodeHash);
		if (tmpNode && this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onNodeMoved', tmpNode);
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowView.flowData);
		}

		this._State = INTERACTION_STATES.IDLE;
		this._DragNodeHash = null;
	}

	// ---- Panel Dragging ----

	_startPanelDrag(pEvent, pTarget)
	{
		let tmpPanelHash = this._getPanelHash(pTarget);
		if (!tmpPanelHash) return;

		let tmpPanel = this._FlowView._FlowData.OpenPanels.find((pPanel) => pPanel.Hash === tmpPanelHash);
		if (!tmpPanel) return;

		this._State = INTERACTION_STATES.DRAGGING_PANEL;
		this._DragPanelHash = tmpPanelHash;
		this._DragPanelStartX = pEvent.clientX;
		this._DragPanelStartY = pEvent.clientY;
		this._DragPanelDataStartX = tmpPanel.X;
		this._DragPanelDataStartY = tmpPanel.Y;

		this._SVGElement.classList.add('panning');
	}

	_onPanelDrag(pEvent)
	{
		if (!this._DragPanelHash) return;

		let tmpVS = this._FlowView.viewState;
		let tmpDX = (pEvent.clientX - this._DragPanelStartX) / tmpVS.Zoom;
		let tmpDY = (pEvent.clientY - this._DragPanelStartY) / tmpVS.Zoom;

		let tmpNewX = this._DragPanelDataStartX + tmpDX;
		let tmpNewY = this._DragPanelDataStartY + tmpDY;

		this._FlowView.updatePanelPosition(this._DragPanelHash, tmpNewX, tmpNewY);
	}

	_endPanelDrag(pEvent)
	{
		this._SVGElement.classList.remove('panning');

		this._FlowView.marshalFromView();

		let tmpPanel = this._FlowView._FlowData.OpenPanels.find((pPanel) => pPanel.Hash === this._DragPanelHash);
		if (tmpPanel && this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onPanelMoved', tmpPanel);
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowView.flowData);
		}

		this._State = INTERACTION_STATES.IDLE;
		this._DragPanelHash = null;
	}

	// ---- Handle Dragging ----

	_startHandleDrag(pEvent, pConnectionHash, pPanelHash, pHandleType, pIsTether)
	{
		this._State = INTERACTION_STATES.DRAGGING_HANDLE;
		this._DragHandleConnectionHash = pConnectionHash;
		this._DragHandlePanelHash = pPanelHash;
		this._DragHandleType = pHandleType;
		this._DragHandleIsTether = pIsTether;
		this._DragStartX = pEvent.clientX;
		this._DragStartY = pEvent.clientY;
		this._SVGElement.classList.add('panning');
	}

	_onHandleDrag(pEvent)
	{
		let tmpCoords = this._FlowView.screenToSVGCoords(pEvent.clientX, pEvent.clientY);

		if (this._DragHandleIsTether)
		{
			this._FlowView.updateTetherHandle(
				this._DragHandlePanelHash,
				this._DragHandleType,
				tmpCoords.x,
				tmpCoords.y
			);
		}
		else
		{
			this._FlowView.updateConnectionHandle(
				this._DragHandleConnectionHash,
				this._DragHandleType,
				tmpCoords.x,
				tmpCoords.y
			);
		}
	}

	_endHandleDrag(pEvent)
	{
		this._SVGElement.classList.remove('panning');

		this._FlowView.renderFlow();
		this._FlowView.marshalFromView();

		if (this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowView.flowData);

			if (this._DragHandleIsTether)
			{
				let tmpPanel = this._FlowView._FlowData.OpenPanels.find((pPanel) => pPanel.Hash === this._DragHandlePanelHash);
				if (tmpPanel)
				{
					this._FlowView._EventHandlerProvider.fireEvent('onTetherHandleMoved', tmpPanel);
				}
			}
			else
			{
				let tmpConnection = this._FlowView.getConnection(this._DragHandleConnectionHash);
				if (tmpConnection)
				{
					this._FlowView._EventHandlerProvider.fireEvent('onConnectionHandleMoved', tmpConnection);
				}
			}
		}

		this._State = INTERACTION_STATES.IDLE;
		this._DragHandleConnectionHash = null;
		this._DragHandlePanelHash = null;
		this._DragHandleType = null;
		this._DragHandleIsTether = false;
	}

	// ---- Line Mode Toggling ----

	_toggleConnectionLineMode(pConnectionHash)
	{
		let tmpConnection = this._FlowView.getConnection(pConnectionHash);
		if (!tmpConnection) return;

		if (!tmpConnection.Data) tmpConnection.Data = {};

		let tmpCurrentMode = tmpConnection.Data.LineMode || 'bezier';
		tmpConnection.Data.LineMode = (tmpCurrentMode === 'bezier') ? 'orthogonal' : 'bezier';

		// Reset handle positions when switching modes
		tmpConnection.Data.HandleCustomized = false;
		tmpConnection.Data.BezierHandleX = null;
		tmpConnection.Data.BezierHandleY = null;
		tmpConnection.Data.OrthoCorner1X = null;
		tmpConnection.Data.OrthoCorner1Y = null;
		tmpConnection.Data.OrthoCorner2X = null;
		tmpConnection.Data.OrthoCorner2Y = null;
		tmpConnection.Data.OrthoMidOffset = 0;

		this._FlowView.renderFlow();
		this._FlowView.marshalFromView();

		if (this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onConnectionModeChanged', tmpConnection);
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowView.flowData);
		}
	}

	_toggleTetherLineMode(pPanelHash)
	{
		let tmpPanel = this._FlowView._FlowData.OpenPanels.find((pPanel) => pPanel.Hash === pPanelHash);
		if (!tmpPanel) return;

		if (this._FlowView._TetherService)
		{
			this._FlowView._TetherService.toggleLineMode(tmpPanel);
		}

		this._FlowView.renderFlow();
		this._FlowView.marshalFromView();

		if (this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onTetherModeChanged', tmpPanel);
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowView.flowData);
		}
	}

	// ---- Tether Selection ----

	_selectTether(pTarget)
	{
		let tmpPanelHash = this._getPanelHash(pTarget);
		if (tmpPanelHash)
		{
			this._FlowView.selectTether(tmpPanelHash);
		}
	}

	// ---- Connection Creation ----

	_startConnection(pEvent, pTarget)
	{
		if (!this._FlowView.options.EnableConnectionCreation) return;

		let tmpNodeHash = pTarget.getAttribute('data-node-hash');
		let tmpPortHash = pTarget.getAttribute('data-port-hash');
		let tmpPortDirection = pTarget.getAttribute('data-port-direction');

		if (!tmpNodeHash || !tmpPortHash) return;

		if (tmpPortDirection !== 'output')
		{
			return;
		}

		this._State = INTERACTION_STATES.CONNECTING;
		this._ConnectSourceNodeHash = tmpNodeHash;
		this._ConnectSourcePortHash = tmpPortHash;

		this._SVGElement.classList.add('connecting');

		let tmpPortPos = this._FlowView.getPortPosition(tmpNodeHash, tmpPortHash);
		if (tmpPortPos)
		{
			this._ConnectDragLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			this._ConnectDragLine.setAttribute('class', 'pict-flow-drag-connection');
			this._ConnectDragLine.setAttribute('d', `M ${tmpPortPos.x} ${tmpPortPos.y} L ${tmpPortPos.x} ${tmpPortPos.y}`);
			this._FlowView._ViewportElement.appendChild(this._ConnectDragLine);
		}

		pEvent.stopPropagation();
	}

	_onConnectionDrag(pEvent)
	{
		if (!this._ConnectDragLine) return;

		let tmpSourcePos = this._FlowView.getPortPosition(this._ConnectSourceNodeHash, this._ConnectSourcePortHash);
		if (!tmpSourcePos) return;

		let tmpEndCoords = this._FlowView.screenToSVGCoords(pEvent.clientX, pEvent.clientY);

		let tmpDX = Math.abs(tmpEndCoords.x - tmpSourcePos.x) * 0.5;
		let tmpPath = `M ${tmpSourcePos.x} ${tmpSourcePos.y} C ${tmpSourcePos.x + tmpDX} ${tmpSourcePos.y}, ${tmpEndCoords.x - tmpDX} ${tmpEndCoords.y}, ${tmpEndCoords.x} ${tmpEndCoords.y}`;
		this._ConnectDragLine.setAttribute('d', tmpPath);
	}

	_endConnection(pEvent)
	{
		if (this._ConnectDragLine && this._ConnectDragLine.parentNode)
		{
			this._ConnectDragLine.parentNode.removeChild(this._ConnectDragLine);
		}
		this._ConnectDragLine = null;

		this._SVGElement.classList.remove('connecting');

		let tmpTarget = document.elementFromPoint(pEvent.clientX, pEvent.clientY);
		if (tmpTarget)
		{
			let tmpTargetPortHash = tmpTarget.getAttribute('data-port-hash');
			let tmpTargetNodeHash = tmpTarget.getAttribute('data-node-hash');
			let tmpTargetPortDirection = tmpTarget.getAttribute('data-port-direction');

			if (tmpTargetPortHash && tmpTargetNodeHash && tmpTargetPortDirection === 'input')
			{
				this._FlowView.addConnection(
					this._ConnectSourceNodeHash,
					this._ConnectSourcePortHash,
					tmpTargetNodeHash,
					tmpTargetPortHash
				);
			}
		}

		this._State = INTERACTION_STATES.IDLE;
		this._ConnectSourceNodeHash = null;
		this._ConnectSourcePortHash = null;
	}

	_cancelConnection()
	{
		if (this._ConnectDragLine && this._ConnectDragLine.parentNode)
		{
			this._ConnectDragLine.parentNode.removeChild(this._ConnectDragLine);
		}
		this._ConnectDragLine = null;

		this._SVGElement.classList.remove('connecting');

		this._State = INTERACTION_STATES.IDLE;
		this._ConnectSourceNodeHash = null;
		this._ConnectSourcePortHash = null;
	}

	// ---- Panning ----

	_startPanning(pEvent)
	{
		this._FlowView.deselectAll();

		this._State = INTERACTION_STATES.PANNING;
		this._PanStartX = pEvent.clientX;
		this._PanStartY = pEvent.clientY;
		this._PanStartPanX = this._FlowView.viewState.PanX;
		this._PanStartPanY = this._FlowView.viewState.PanY;

		this._SVGElement.classList.add('panning');
	}

	_onPan(pEvent)
	{
		let tmpDX = pEvent.clientX - this._PanStartX;
		let tmpDY = pEvent.clientY - this._PanStartY;

		this._FlowView.viewState.PanX = this._PanStartPanX + tmpDX;
		this._FlowView.viewState.PanY = this._PanStartPanY + tmpDY;

		this._FlowView.updateViewportTransform();
	}

	_endPanning(pEvent)
	{
		this._SVGElement.classList.remove('panning');
		this._State = INTERACTION_STATES.IDLE;
	}

	// ---- Connection Selection ----

	_selectConnection(pTarget)
	{
		let tmpConnectionHash = this._getConnectionHash(pTarget);
		if (tmpConnectionHash)
		{
			this._FlowView.selectConnection(tmpConnectionHash);
		}
	}

	// ---- Utilities ----

	_getElementType(pTarget)
	{
		if (!pTarget) return 'background';

		let tmpType = pTarget.getAttribute ? pTarget.getAttribute('data-element-type') : null;
		if (tmpType) return tmpType;

		let tmpParent = pTarget.parentElement;
		let tmpDepth = 0;
		while (tmpParent && tmpDepth < 5)
		{
			tmpType = tmpParent.getAttribute ? tmpParent.getAttribute('data-element-type') : null;
			if (tmpType) return tmpType;
			tmpParent = tmpParent.parentElement;
			tmpDepth++;
		}

		return 'background';
	}

	_getNodeHash(pTarget)
	{
		if (!pTarget) return null;

		let tmpHash = pTarget.getAttribute ? pTarget.getAttribute('data-node-hash') : null;
		if (tmpHash) return tmpHash;

		let tmpParent = pTarget.parentElement;
		let tmpDepth = 0;
		while (tmpParent && tmpDepth < 5)
		{
			tmpHash = tmpParent.getAttribute ? tmpParent.getAttribute('data-node-hash') : null;
			if (tmpHash) return tmpHash;
			tmpParent = tmpParent.parentElement;
			tmpDepth++;
		}

		return null;
	}

	_getPanelHash(pTarget)
	{
		if (!pTarget) return null;

		let tmpHash = pTarget.getAttribute ? pTarget.getAttribute('data-panel-hash') : null;
		if (tmpHash) return tmpHash;

		let tmpParent = pTarget.parentElement;
		let tmpDepth = 0;
		while (tmpParent && tmpDepth < 5)
		{
			tmpHash = tmpParent.getAttribute ? tmpParent.getAttribute('data-panel-hash') : null;
			if (tmpHash) return tmpHash;
			tmpParent = tmpParent.parentElement;
			tmpDepth++;
		}

		return null;
	}

	_getConnectionHash(pTarget)
	{
		if (!pTarget) return null;

		let tmpHash = pTarget.getAttribute ? pTarget.getAttribute('data-connection-hash') : null;
		if (tmpHash) return tmpHash;

		let tmpParent = pTarget.parentElement;
		let tmpDepth = 0;
		while (tmpParent && tmpDepth < 5)
		{
			tmpHash = tmpParent.getAttribute ? tmpParent.getAttribute('data-connection-hash') : null;
			if (tmpHash) return tmpHash;
			tmpParent = tmpParent.parentElement;
			tmpDepth++;
		}

		return null;
	}
}

module.exports = PictServiceFlowInteractionManager;
module.exports.INTERACTION_STATES = INTERACTION_STATES;
