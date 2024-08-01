/* global chrome */
// This file is used only for manifest version 3

// Represents if importAllScripts has been run
// eslint-disable-next-line
chrome.runtime.onInstalled.addListener(() => {
	chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});
let scriptsLoadInitiated = false;

const loadTimeLogs = [];

function tryImport(...fileNames) {
	try {
		const startTime = new Date().getTime();
		importScripts(...fileNames);
		const endTime = new Date().getTime();
		loadTimeLogs.push({
			name: fileNames[0],
			value: endTime - startTime,
			children: [],
			startTime,
			endTime
		});

		return true;
	} catch (e) {
		console.error(e);
	}

	return false;
}

function importAllScripts() {
	// Bail if we've already imported scripts
	if (scriptsLoadInitiated) {
		return;
	}

	scriptsLoadInitiated = true;
	const files = [];

	// In testMode individual files are imported, this is to help capture load time stats
	const loadFile = (fileName) => {
		files.push(fileName);
	};

	// value of applyLavaMoat below is dynamically replaced at build time with actual value
	const rawFileList = [
		'www/js/webextension-polyfill.js',
		'www/js/bex-background.js'
	];
	rawFileList.forEach((fileName) => loadFile(fileName));

	// Import all required resources
	tryImport(...files);

	// In testMode load time logs are output to console
}

// Ref: https://stackoverflow.com/questions/66406672/chrome-extension-mv3-modularize-service-worker-js-file
// eslint-disable-next-line no-undef
// chrome.runtime.onInstalled.addListener(()=> {
//   importAllScripts
// });

// /*
//  * A keepalive message listener to prevent Service Worker getting shut down due to inactivity.
//  * UI sends the message periodically, in a setInterval.
//  * Chrome will revive the service worker if it was shut down, whenever a new message is sent, but only if a listener was defined here.
//  *
//  * chrome below needs to be replaced by cross-browser object,
//  * but there is issue in importing webextension-polyfill into service worker.
//  * chrome does seems to work in at-least all chromium based browsers
//  */
// chrome.runtime.onMessage.addListener(() => {
//   importAllScripts();
//   return false;
// });

importAllScripts();
