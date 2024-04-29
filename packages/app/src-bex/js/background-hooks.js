// Hooks added here have a bridge allowing communication between the BEX Background Script and the BEX Content Script.
// Note: Events sent from this background script using `bridge.send` can be `listen`'d for by all client BEX bridges for this BEX

// More info: https://quasar.dev/quasar-cli/developing-browser-extensions/background-hooks
import { bexBackground } from 'quasar/wrappers';
import { default as background } from '../../src/extension/background';
import { browser } from 'webextension-polyfill-ts';

export default bexBackground((bridge /* , allActiveConnections */) => {
	bridge.on('storage.get', ({ data, respond }) => {
		if (data.key === null) {
			chrome.storage.local.get(null, (items) => {
				// Group the values up into an array to take advantage of the bridge's chunk splitting.
				respond(Object.values(items));
			});
		} else {
			chrome.storage.local.get([data.key], (items) => {
				respond(items[data.key]);
			});
		}
	});
	bridge.on('storage.set', ({ data, respond }) => {
		chrome.storage.local.set({ [data.key]: data.value }, () => {
			respond();
		});
	});
	bridge.on('storage.remove', ({ data, respond }) => {
		chrome.storage.local.remove(data.key, () => {
			respond();
		});
	});
});

background.init();
