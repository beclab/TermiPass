import internalMethod from './internalMethod';
import { sessionService } from '../service';
import { browser } from 'webextension-polyfill-ts';
import flow from './flow';

browser.tabs.onRemoved.addListener((tabId) => {
	sessionService.deleteSession(tabId.toString());
});

export default async (req) => {
	const {
		data: { method }
	} = req;

	if (internalMethod[method]) {
		return internalMethod[method](req);
	}

	return await flow(req);
};
