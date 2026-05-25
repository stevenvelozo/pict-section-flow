// Application Code for the Flow playground.
//
// `Base` is the synthesized PictApplication wrapper that registers the
// Flow view from your Pict Config (under `FlowViewConfig`). The view
// reads its data from `AppData.FlowData` (set in Initial AppData) via
// the configured `FlowDataAddress`.
//
// Return a class that extends `Base` to add lifecycle hooks or
// register additional views/providers. Most playgrounds need nothing
// custom here — edit the data/config tabs and click Run.
//
// Example: log the current flow data after the diagram renders so you
// can inspect node hashes, connection wiring, and saved viewport state
// in the browser console.
//
return class extends Base
{
	onAfterInitialize()
	{
		super.onAfterInitialize();
		console.log('[playground] Initial FlowData =', this.pict.AppData.FlowData);
	}
};
