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

		// Initialize sample flow data using FlowCard types
		this.pict.AppData.FlowExample.SampleFlow =
		{
			Nodes:
			[
				{
					Hash: 'node-start',
					Type: 'start',
					X: 50,
					Y: 180,
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
					Hash: 'node-fread',
					Type: 'FREAD',
					X: 270,
					Y: 160,
					Width: 180,
					Height: 80,
					Title: 'Read Config',
					Ports:
					[
						{ Hash: 'port-fread-in', Direction: 'input', Side: 'left', Label: 'Path' },
						{ Hash: 'port-fread-data', Direction: 'output', Side: 'right', Label: 'Data' },
						{ Hash: 'port-fread-err', Direction: 'output', Side: 'bottom', Label: 'Error' }
					],
					Data: {}
				},
				{
					Hash: 'node-check',
					Type: 'ITE',
					X: 530,
					Y: 140,
					Width: 200,
					Height: 100,
					Title: 'Has Items?',
					Ports:
					[
						{ Hash: 'port-check-in', Direction: 'input', Side: 'left', Label: 'In' },
						{ Hash: 'port-check-then', Direction: 'output', Side: 'right', Label: 'Then' },
						{ Hash: 'port-check-else', Direction: 'output', Side: 'bottom', Label: 'Else' }
					],
					Data: {}
				},
				{
					Hash: 'node-each',
					Type: 'EACH',
					X: 810,
					Y: 120,
					Width: 200,
					Height: 100,
					Title: 'Process Items',
					Ports:
					[
						{ Hash: 'port-each-in', Direction: 'input', Side: 'left', Label: 'Collection' },
						{ Hash: 'port-each-item', Direction: 'output', Side: 'right', Label: 'Item' },
						{ Hash: 'port-each-done', Direction: 'output', Side: 'bottom', Label: 'Done' }
					],
					Data: {}
				},
				{
					Hash: 'node-set',
					Type: 'SET',
					X: 1090,
					Y: 110,
					Width: 170,
					Height: 80,
					Title: 'Transform',
					Ports:
					[
						{ Hash: 'port-set-in', Direction: 'input', Side: 'left', Label: 'In' },
						{ Hash: 'port-set-out', Direction: 'output', Side: 'right', Label: 'Out' }
					],
					Data: {}
				},
				{
					Hash: 'node-log',
					Type: 'LOG',
					X: 1090,
					Y: 260,
					Width: 160,
					Height: 80,
					Title: 'Log Results',
					Ports:
					[
						{ Hash: 'port-log-in', Direction: 'input', Side: 'left', Label: 'Values' },
						{ Hash: 'port-log-out', Direction: 'output', Side: 'right', Label: 'Pass' }
					],
					Data: {}
				},
				{
					Hash: 'node-fwrite',
					Type: 'FWRITE',
					X: 1340,
					Y: 160,
					Width: 180,
					Height: 80,
					Title: 'Write Output',
					Ports:
					[
						{ Hash: 'port-fwrite-path', Direction: 'input', Side: 'left', Label: 'Path' },
						{ Hash: 'port-fwrite-data', Direction: 'input', Side: 'left', Label: 'Data' },
						{ Hash: 'port-fwrite-done', Direction: 'output', Side: 'right', Label: 'Done' },
						{ Hash: 'port-fwrite-err', Direction: 'output', Side: 'bottom', Label: 'Error' }
					],
					Data: {}
				},
				{
					Hash: 'node-end',
					Type: 'end',
					X: 1600,
					Y: 180,
					Width: 140,
					Height: 80,
					Title: 'End',
					Ports:
					[
						{ Hash: 'port-end-in', Direction: 'input', Side: 'left', Label: 'In' }
					],
					Data: {}
				},
				{
					Hash: 'node-log-err',
					Type: 'LOG',
					X: 530,
					Y: 360,
					Width: 160,
					Height: 80,
					Title: 'Log Error',
					Ports:
					[
						{ Hash: 'port-logerr-in', Direction: 'input', Side: 'left', Label: 'Values' },
						{ Hash: 'port-logerr-out', Direction: 'output', Side: 'right', Label: 'Pass' }
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
					TargetNodeHash: 'node-fread',
					TargetPortHash: 'port-fread-in',
					Data: {}
				},
				{
					Hash: 'conn-2',
					SourceNodeHash: 'node-fread',
					SourcePortHash: 'port-fread-data',
					TargetNodeHash: 'node-check',
					TargetPortHash: 'port-check-in',
					Data: {}
				},
				{
					Hash: 'conn-3',
					SourceNodeHash: 'node-check',
					SourcePortHash: 'port-check-then',
					TargetNodeHash: 'node-each',
					TargetPortHash: 'port-each-in',
					Data: {}
				},
				{
					Hash: 'conn-4',
					SourceNodeHash: 'node-each',
					SourcePortHash: 'port-each-item',
					TargetNodeHash: 'node-set',
					TargetPortHash: 'port-set-in',
					Data: {}
				},
				{
					Hash: 'conn-5',
					SourceNodeHash: 'node-set',
					SourcePortHash: 'port-set-out',
					TargetNodeHash: 'node-fwrite',
					TargetPortHash: 'port-fwrite-data',
					Data: {}
				},
				{
					Hash: 'conn-6',
					SourceNodeHash: 'node-each',
					SourcePortHash: 'port-each-done',
					TargetNodeHash: 'node-log',
					TargetPortHash: 'port-log-in',
					Data: {}
				},
				{
					Hash: 'conn-7',
					SourceNodeHash: 'node-log',
					SourcePortHash: 'port-log-out',
					TargetNodeHash: 'node-fwrite',
					TargetPortHash: 'port-fwrite-path',
					Data: {}
				},
				{
					Hash: 'conn-8',
					SourceNodeHash: 'node-fwrite',
					SourcePortHash: 'port-fwrite-done',
					TargetNodeHash: 'node-end',
					TargetPortHash: 'port-end-in',
					Data: {}
				},
				{
					Hash: 'conn-9',
					SourceNodeHash: 'node-fread',
					SourcePortHash: 'port-fread-err',
					TargetNodeHash: 'node-log-err',
					TargetPortHash: 'port-logerr-in',
					Data: {}
				},
				{
					Hash: 'conn-10',
					SourceNodeHash: 'node-check',
					SourcePortHash: 'port-check-else',
					TargetNodeHash: 'node-log-err',
					TargetPortHash: 'port-logerr-in',
					Data: {}
				},
				{
					Hash: 'conn-11',
					SourceNodeHash: 'node-log-err',
					SourcePortHash: 'port-logerr-out',
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
