import { getPageRSS } from './utils';
import { browser } from 'webextension-polyfill-ts';

browser.runtime.onMessage.addListener(async (msg) => {
	if (msg.type === 'getPageRSS') {
		return getPageRSS();
	} else if (msg.type == 'getHTML') {
		return document.documentElement.innerHTML;
	}
});

browser.runtime.sendMessage(null, {
	module: 'rss',
	type: 'setPageRSS',
	feeds: getPageRSS()
});
