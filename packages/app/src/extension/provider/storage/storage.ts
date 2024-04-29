import { browser } from 'webextension-polyfill-ts';

let cacheMap;

const get = async (prop, dValue) => {
	if (cacheMap) {
		return cacheMap.get(prop);
	}

	const result = await browser.storage.local.get(null);
	cacheMap = new Map(Object.entries(result ?? {}).map(([k, v]) => [k, v]));

	return result[prop] == undefined || null || '' ? dValue : result[prop];
};

const set = async (prop, value): Promise<void> => {
	await browser.storage.local.set({ [prop]: value });
	cacheMap.set(prop, value);
};

const remove = async (prop: string): Promise<void> => {
	await browser.storage.local.remove(prop);
	cacheMap.delete(prop);
};

export default {
	get,
	set,
	remove
};
