import {
	CommonScriptInjectionDetails,
	ScriptInjectionConfig
} from './interface';
import { ExtensionTypes, browser, Tabs } from 'webextension-polyfill-ts';

export const inject = async (config: ScriptInjectionConfig) => {
	const { tabId, injectDetails, details } = config;
	const file = getScriptFile(config);
	if (!file) {
		throw new Error('No file specified for script injection');
	}

	const injectionDetails = buildInjectionDetails(injectDetails, file);

	try {
		await executeScriptInTab(tabId, injectionDetails, {
			world: details?.world ?? 'ISOLATED'
		});
	} catch (error) {
		// Swallow errors for host permissions, since this is believed to be a Manifest V3 Chrome bug
		// @TODO remove when the bugged behaviour is resolved
		if (
			error.message !==
			'Cannot access contents of the page. Extension manifest must request permission to access the respective host.'
		) {
			throw error;
		}
	}
};

/**
 * Retrieves the script file to inject based on the configuration.
 *
 * @param config - The configuration for the script injection.
 */
const getScriptFile = (config: ScriptInjectionConfig) => {
	const { injectDetails, details } = config;
	return details?.file ?? injectDetails.file;
};

const buildInjectionDetails = (
	injectDetails: CommonScriptInjectionDetails,
	file: string
): ExtensionTypes.InjectDetails => {
	const { frame, runAt } = injectDetails;
	const injectionDetails: ExtensionTypes.InjectDetails = { file };

	if (runAt) {
		injectionDetails.runAt = runAt;
	}

	if (!frame) {
		return { ...injectionDetails, frameId: 0 };
	}

	if (frame !== 'all_frames') {
		return { ...injectionDetails, frameId: frame };
	}

	return { ...injectionDetails, allFrames: true };
};

export const executeScriptInTab = async (
	tabId: number,
	details: ExtensionTypes.InjectDetails,
	scriptingApiDetails?: {
		world: chrome.scripting.ExecutionWorld;
	}
): Promise<unknown> => {
	return chrome.scripting.executeScript({
		target: {
			tabId: tabId,
			allFrames: details.allFrames,
			frameIds: details.frameId ? [details.frameId] : undefined
		},
		files: details.file ? [details.file] : [],
		injectImmediately: details.runAt === 'document_start',
		world: scriptingApiDetails?.world || 'ISOLATED'
	});
};

export const getTabFromCurrentWindowId = async (): Promise<
	Tabs.Tab | undefined
> => {
	const tabs = await browser.tabs.query({
		active: true,
		windowId: chrome.windows.WINDOW_ID_CURRENT
	});
	if (tabs.length > 0) {
		return tabs[0];
	}
	return undefined;
};

export const getTabFromCurrentWindow = async (): Promise<
	Tabs.Tab | undefined
> => {
	const tabs = await browser.tabs.query({
		active: true,
		currentWindow: true
	});
	if (tabs.length > 0) {
		return tabs[0];
	}
	return undefined;
};
