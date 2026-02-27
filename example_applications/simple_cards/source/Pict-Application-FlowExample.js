const libPictApplication = require('pict-application');
const libPictRouter = require('pict-router');
const libPictSectionForm = require('pict-section-form');

// Views
const libViewLayout = require('./views/PictView-FlowExample-Layout.js');
const libViewTopBar = require('./views/PictView-FlowExample-TopBar.js');
const libViewBottomBar = require('./views/PictView-FlowExample-BottomBar.js');
const libViewMainWorkspace = require('./views/PictView-FlowExample-MainWorkspace.js');
const libViewAbout = require('./views/PictView-FlowExample-About.js');
const libViewDocumentation = require('./views/PictView-FlowExample-Documentation.js');
const libViewFileWriteInfo = require('./views/PictView-FlowExample-FileWriteInfo.js');

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

		// Add the file write info view (used by the View panel type example)
		this.pict.addView('FlowExample-FileWriteInfo', libViewFileWriteInfo.default_configuration, libViewFileWriteInfo);

		// Register pict-section-form service types so Form panels can use them
		this.pict.addServiceType('PictFormMetacontroller', libPictSectionForm.PictFormMetacontroller);
	}

	onAfterInitializeAsync(fCallback)
	{
		// Initialize application state
		this.pict.AppData.FlowExample =
		{
			CurrentRoute: 'home'
		};

		// Initialize sample flow data using FlowCard types.
		// Includes one of every node type for easy smoke testing:
		//   start, FREAD, ITE, EACH, GET, SET, SW, LOG (x2), FWRITE, end
		this.pict.AppData.FlowExample.SampleFlow =
		{
			Nodes:
			[
				// ── Entry ──────────────────────────────────────────────
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
				// ── I/O: File Read (Template panel) ────────────────────
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
				// ── Control: If-Then-Else (Markdown panel) ─────────────
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
				// ── Control: Each (no panel) ───────────────────────────
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
				// ── Data: Get Value (no panel) ─────────────────────────
				{
					Hash: 'node-get',
					Type: 'GET',
					X: 1090,
					Y: 110,
					Width: 170,
					Height: 80,
					Title: 'Read Item',
					Ports:
					[
						{ Hash: 'port-get-in', Direction: 'input', Side: 'left', Label: 'In' },
						{ Hash: 'port-get-value', Direction: 'output', Side: 'right', Label: 'Value' }
					],
					Data: {}
				},
				// ── Data: Set Value (Form panel) ───────────────────────
				{
					Hash: 'node-set',
					Type: 'SET',
					X: 1340,
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
				// ── Control: Switch (no panel) ─────────────────────────
				{
					Hash: 'node-switch',
					Type: 'SW',
					X: 1590,
					Y: 100,
					Width: 200,
					Height: 120,
					Title: 'Route Output',
					Ports:
					[
						{ Hash: 'port-sw-in', Direction: 'input', Side: 'left', Label: 'In' },
						{ Hash: 'port-sw-a', Direction: 'output', Side: 'right', Label: 'Case A' },
						{ Hash: 'port-sw-b', Direction: 'output', Side: 'right', Label: 'Case B' },
						{ Hash: 'port-sw-default', Direction: 'output', Side: 'bottom', Label: 'Default' }
					],
					Data: {}
				},
				// ── Debug: Log Values (Template panel) ─────────────────
				{
					Hash: 'node-log',
					Type: 'LOG',
					X: 1590,
					Y: 310,
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
				// ── I/O: File Write (View panel) ───────────────────────
				{
					Hash: 'node-fwrite',
					Type: 'FWRITE',
					X: 1870,
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
				// ── Exit ───────────────────────────────────────────────
				{
					Hash: 'node-end',
					Type: 'end',
					X: 2130,
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
				// ── Debug: Log Error (Template panel, error branch) ────
				{
					Hash: 'node-log-err',
					Type: 'LOG',
					X: 530,
					Y: 380,
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
				// Main flow: Start → Read Config
				{
					Hash: 'conn-1',
					SourceNodeHash: 'node-start',
					SourcePortHash: 'port-start-out',
					TargetNodeHash: 'node-fread',
					TargetPortHash: 'port-fread-in',
					Data: {}
				},
				// Read Config → Has Items?
				{
					Hash: 'conn-2',
					SourceNodeHash: 'node-fread',
					SourcePortHash: 'port-fread-data',
					TargetNodeHash: 'node-check',
					TargetPortHash: 'port-check-in',
					Data: {}
				},
				// Has Items? (Then) → Process Items
				{
					Hash: 'conn-3',
					SourceNodeHash: 'node-check',
					SourcePortHash: 'port-check-then',
					TargetNodeHash: 'node-each',
					TargetPortHash: 'port-each-in',
					Data: {}
				},
				// Process Items (Item) → Read Item (GET)
				{
					Hash: 'conn-4',
					SourceNodeHash: 'node-each',
					SourcePortHash: 'port-each-item',
					TargetNodeHash: 'node-get',
					TargetPortHash: 'port-get-in',
					Data: {}
				},
				// Read Item (GET) → Transform (SET)
				{
					Hash: 'conn-5',
					SourceNodeHash: 'node-get',
					SourcePortHash: 'port-get-value',
					TargetNodeHash: 'node-set',
					TargetPortHash: 'port-set-in',
					Data: {}
				},
				// Transform (SET) → Route Output (SW)
				{
					Hash: 'conn-6',
					SourceNodeHash: 'node-set',
					SourcePortHash: 'port-set-out',
					TargetNodeHash: 'node-switch',
					TargetPortHash: 'port-sw-in',
					Data: {}
				},
				// Route Output (SW Case A) → Write Output (data)
				{
					Hash: 'conn-7',
					SourceNodeHash: 'node-switch',
					SourcePortHash: 'port-sw-a',
					TargetNodeHash: 'node-fwrite',
					TargetPortHash: 'port-fwrite-data',
					Data: {}
				},
				// Route Output (SW Case B) → Log Results
				{
					Hash: 'conn-8',
					SourceNodeHash: 'node-switch',
					SourcePortHash: 'port-sw-b',
					TargetNodeHash: 'node-log',
					TargetPortHash: 'port-log-in',
					Data: {}
				},
				// Route Output (SW Default) → Log Error
				{
					Hash: 'conn-9',
					SourceNodeHash: 'node-switch',
					SourcePortHash: 'port-sw-default',
					TargetNodeHash: 'node-log-err',
					TargetPortHash: 'port-logerr-in',
					Data: {}
				},
				// Process Items (Done) → Log Results
				{
					Hash: 'conn-10',
					SourceNodeHash: 'node-each',
					SourcePortHash: 'port-each-done',
					TargetNodeHash: 'node-log',
					TargetPortHash: 'port-log-in',
					Data: {}
				},
				// Log Results → Write Output (path)
				{
					Hash: 'conn-11',
					SourceNodeHash: 'node-log',
					SourcePortHash: 'port-log-out',
					TargetNodeHash: 'node-fwrite',
					TargetPortHash: 'port-fwrite-path',
					Data: {}
				},
				// Write Output → End
				{
					Hash: 'conn-12',
					SourceNodeHash: 'node-fwrite',
					SourcePortHash: 'port-fwrite-done',
					TargetNodeHash: 'node-end',
					TargetPortHash: 'port-end-in',
					Data: {}
				},
				// Error branch: Read Config (Error) → Log Error
				{
					Hash: 'conn-13',
					SourceNodeHash: 'node-fread',
					SourcePortHash: 'port-fread-err',
					TargetNodeHash: 'node-log-err',
					TargetPortHash: 'port-logerr-in',
					Data: {}
				},
				// Error branch: Has Items? (Else) → Log Error
				{
					Hash: 'conn-14',
					SourceNodeHash: 'node-check',
					SourcePortHash: 'port-check-else',
					TargetNodeHash: 'node-log-err',
					TargetPortHash: 'port-logerr-in',
					Data: {}
				},
				// Error branch: Log Error → End
				{
					Hash: 'conn-15',
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
