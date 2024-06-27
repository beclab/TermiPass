export type CommonScriptInjectionDetails = {
	/**
	 * Script injected into the document.
	 * Overridden by `mv2Details` and `mv3Details`.
	 */
	file?: string;
	/**
	 * Identifies the frame targeted for script injection. Defaults to the top level frame (0).
	 * Can also be set to "all_frames" to inject into all frames in a tab.
	 */
	frame?: 'all_frames' | number;
	/**
	 * When the script executes. Defaults to "document_start".
	 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/content_scripts
	 */
	runAt?: 'document_start' | 'document_end' | 'document_idle';
};

export type ScriptInjectionDetails = {
	file: string;
	/**
	 * The world in which the script should be executed. Defaults to "ISOLATED".
	 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/scripting/ExecutionWorld
	 */
	world?: chrome.scripting.ExecutionWorld;
};

export type ScriptInjectionConfig = {
	tabId: number;
	injectDetails: CommonScriptInjectionDetails;
	details?: ScriptInjectionDetails;
};
