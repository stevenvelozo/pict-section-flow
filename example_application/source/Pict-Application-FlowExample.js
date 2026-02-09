const libPictApplication = require('pict-application');
const libPictRouter = require('pict-router');

// Views
const libViewLayout = require('./views/PictView-FlowExample-Layout.js');
const libViewTopBar = require('./views/PictView-FlowExample-TopBar.js');
const libViewBottomBar = require('./views/PictView-FlowExample-BottomBar.js');
const libViewMainWorkspace = require('./views/PictView-FlowExample-MainWorkspace.js');
const libViewAbout = require('./views/PictView-FlowExample-About.js');
const libViewDocumentation = require('./views/PictView-FlowExample-Documentation.js');

class FlowExampleApplication extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		// Add the router provider with routes
		this.pict.addProvider('PictRouter', require('./providers/PictRouter-FlowExample-Configuration.json'), libPictRouter);

		// Add the layout view (the shell that contains top bar, workspace, bottom bar)
		this.pict.addView('FlowExample-Layout', libViewLayout.default_configuration, libViewLayout);

		// Add the top bar and bottom bar views
		this.pict.addView('FlowExample-TopBar', libViewTopBar.default_configuration, libViewTopBar);
		this.pict.addView('FlowExample-BottomBar', libViewBottomBar.default_configuration, libViewBottomBar);

		// Add the main content workspace view
		this.pict.addView('FlowExample-MainWorkspace', libViewMainWorkspace.default_configuration, libViewMainWorkspace);

		// Add the about page view
		this.pict.addView('FlowExample-About', libViewAbout.default_configuration, libViewAbout);

		// Add the documentation page view
		this.pict.addView('FlowExample-Documentation', libViewDocumentation.default_configuration, libViewDocumentation);
	}

	onAfterInitializeAsync(fCallback)
	{
		// Initialize application state
		this.pict.AppData.FlowExample =
		{
			CurrentRoute: 'home'
		};

		// Initialize sample flow data
		this.pict.AppData.FlowExample.SampleFlow =
		{
			Nodes:
			[
				{
					Hash: 'node-start',
					Type: 'start',
					X: 50,
					Y: 150,
					Width: 140,
					Height: 80,
					Title: 'Start',
					Ports:
					[
						{ Hash: 'port-start-out', Direction: 'output', Side: 'right', Label: 'Out' }
					],
					Data: {}
				},
				{
					Hash: 'node-process-1',
					Type: 'default',
					X: 300,
					Y: 80,
					Width: 180,
					Height: 80,
					Title: 'Validate',
					Ports:
					[
						{ Hash: 'port-proc1-in', Direction: 'input', Side: 'left', Label: 'In' },
						{ Hash: 'port-proc1-out', Direction: 'output', Side: 'right', Label: 'Out' }
					],
					Data: {}
				},
				{
					Hash: 'node-decision',
					Type: 'decision',
					X: 580,
					Y: 100,
					Width: 200,
					Height: 100,
					Title: 'Valid?',
					Ports:
					[
						{ Hash: 'port-dec-in', Direction: 'input', Side: 'left', Label: 'In' },
						{ Hash: 'port-dec-yes', Direction: 'output', Side: 'right', Label: 'Yes' },
						{ Hash: 'port-dec-no', Direction: 'output', Side: 'bottom', Label: 'No' }
					],
					Data: {}
				},
				{
					Hash: 'node-process-2',
					Type: 'default',
					X: 880,
					Y: 80,
					Width: 180,
					Height: 80,
					Title: 'Process',
					Ports:
					[
						{ Hash: 'port-proc2-in', Direction: 'input', Side: 'left', Label: 'In' },
						{ Hash: 'port-proc2-out', Direction: 'output', Side: 'right', Label: 'Out' }
					],
					Data: {}
				},
				{
					Hash: 'node-error',
					Type: 'default',
					X: 600,
					Y: 320,
					Width: 180,
					Height: 80,
					Title: 'Error',
					Ports:
					[
						{ Hash: 'port-err-in', Direction: 'input', Side: 'top', Label: 'In' },
						{ Hash: 'port-err-out', Direction: 'output', Side: 'right', Label: 'Out' }
					],
					Data: {}
				},
				{
					Hash: 'node-end',
					Type: 'end',
					X: 1160,
					Y: 150,
					Width: 140,
					Height: 80,
					Title: 'End',
					Ports:
					[
						{ Hash: 'port-end-in', Direction: 'input', Side: 'left', Label: 'In' }
					],
					Data: {}
				}
			],
			Connections:
			[
				{
					Hash: 'conn-1',
					SourceNodeHash: 'node-start',
					SourcePortHash: 'port-start-out',
					TargetNodeHash: 'node-process-1',
					TargetPortHash: 'port-proc1-in',
					Data: {}
				},
				{
					Hash: 'conn-2',
					SourceNodeHash: 'node-process-1',
					SourcePortHash: 'port-proc1-out',
					TargetNodeHash: 'node-decision',
					TargetPortHash: 'port-dec-in',
					Data: {}
				},
				{
					Hash: 'conn-3',
					SourceNodeHash: 'node-decision',
					SourcePortHash: 'port-dec-yes',
					TargetNodeHash: 'node-process-2',
					TargetPortHash: 'port-proc2-in',
					Data: {}
				},
				{
					Hash: 'conn-4',
					SourceNodeHash: 'node-decision',
					SourcePortHash: 'port-dec-no',
					TargetNodeHash: 'node-error',
					TargetPortHash: 'port-err-in',
					Data: {}
				},
				{
					Hash: 'conn-5',
					SourceNodeHash: 'node-process-2',
					SourcePortHash: 'port-proc2-out',
					TargetNodeHash: 'node-end',
					TargetPortHash: 'port-end-in',
					Data: {}
				},
				{
					Hash: 'conn-6',
					SourceNodeHash: 'node-error',
					SourcePortHash: 'port-err-out',
					TargetNodeHash: 'node-end',
					TargetPortHash: 'port-end-in',
					Data: {}
				}
			],
			ViewState:
			{
				PanX: 0,
				PanY: 0,
				Zoom: 1,
				SelectedNodeHash: null,
				SelectedConnectionHash: null
			}
		};

		// Render the layout shell first, then the initial content
		this.pict.views['FlowExample-Layout'].render();

		return super.onAfterInitializeAsync(fCallback);
	}

	/**
	 * Navigate to a route using the pict-router.
	 *
	 * @param {string} pRoute - The route path to navigate to (e.g. '/About')
	 */
	navigateTo(pRoute)
	{
		this.pict.providers.PictRouter.navigate(pRoute);
	}

	/**
	 * Render a specific content view into the main workspace area.
	 * This is called by the router when a route is matched.
	 *
	 * @param {string} pViewIdentifier - The view identifier to render
	 */
	showView(pViewIdentifier)
	{
		if (pViewIdentifier in this.pict.views)
		{
			this.pict.AppData.FlowExample.CurrentRoute = pViewIdentifier;
			this.pict.views[pViewIdentifier].render();
		}
		else
		{
			this.pict.log.warn(`View [${pViewIdentifier}] not found; falling back to main workspace.`);
			this.pict.views['FlowExample-MainWorkspace'].render();
		}
	}
}

module.exports = FlowExampleApplication;

module.exports.default_configuration = require('./Pict-Application-FlowExample-Configuration.json');
