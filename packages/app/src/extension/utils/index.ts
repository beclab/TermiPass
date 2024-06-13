import { Merge } from 'type-fest';
import { parse, getHostname } from 'tldts';
import { browser } from 'webextension-polyfill-ts';

const nodeURL = typeof window === 'undefined' ? require('url') : null;

export class Utils {
	static inited = false;
	static isNode = false;
	static isBrowser = true;
	static global: any;
	static readonly validHosts: string[] = ['localhost'];

	static init() {
		if (Utils.inited) {
			return;
		}

		Utils.inited = true;
		Utils.isNode =
			typeof process !== 'undefined' &&
			(process as any).release != null &&
			(process as any).release.name === 'node';
		Utils.isBrowser = typeof window !== 'undefined';

		if (Utils.isNode) {
			Utils.global = global;
		} else if (Utils.isBrowser) {
			Utils.global = window;
		} else {
			// If it's not browser or node then it must be a service worker
			Utils.global = self;
		}
	}

	static isNullOrWhitespace(str: string | null | undefined): boolean {
		return str == null || typeof str !== 'string' || str.trim() === '';
	}

	static fromB64ToArray(str: string): Uint8Array | null {
		if (str == null) {
			return null;
		}

		if (Utils.isNode) {
			return new Uint8Array(Buffer.from(str, 'base64'));
		} else {
			const binaryString = Utils.global.atob(str);
			const bytes = new Uint8Array(binaryString.length);
			for (let i = 0; i < binaryString.length; i++) {
				bytes[i] = binaryString.charCodeAt(i);
			}
			return bytes;
		}
	}
	static fromBufferToB64(buffer: ArrayBuffer): string | null {
		if (buffer == null) {
			return null;
		}
		if (Utils.isNode) {
			return Buffer.from(buffer).toString('base64');
		} else {
			let binary = '';
			const bytes = new Uint8Array(buffer);
			for (let i = 0; i < bytes.byteLength; i++) {
				binary += String.fromCharCode(bytes[i]);
			}
			return Utils.global.btoa(binary);
		}
	}

	static getDomain(uriString: string | undefined | null): string | null {
		if (Utils.isNullOrWhitespace(uriString)) {
			return null;
		}

		uriString = uriString!.trim();

		if (uriString.startsWith('data:')) {
			return null;
		}

		if (uriString.startsWith('about:')) {
			return null;
		}

		try {
			const parseResult = parse(uriString, {
				validHosts: this.validHosts
			});
			if (parseResult != null && parseResult.hostname != null) {
				if (parseResult.hostname === 'localhost' || parseResult.isIp) {
					return parseResult.hostname;
				}

				if (parseResult.domain != null) {
					return parseResult.domain;
				}
				return null;
			}
		} catch {
			return null;
		}
		return null;
	}

	static getHostname(uriString: string): string | null {
		if (Utils.isNullOrWhitespace(uriString)) {
			return null;
		}

		uriString = uriString.trim();

		if (uriString.startsWith('data:')) {
			return null;
		}

		if (uriString.startsWith('about:')) {
			return null;
		}

		if (uriString.startsWith('file:')) {
			return null;
		}

		// Does uriString contain invalid characters
		// TODO Needs to possibly be extended, although '!' is a reserved character
		if (uriString.indexOf('!') > 0) {
			return null;
		}

		try {
			const hostname = getHostname(uriString, {
				validHosts: this.validHosts
			});
			if (hostname != null) {
				return hostname;
			}
		} catch {
			return null;
		}
		return null;
	}

	static getUrl(uriString: string): URL | null {
		if (this.isNullOrWhitespace(uriString)) {
			return null;
		}

		uriString = uriString.trim();

		let url = Utils.getUrlObject(uriString);
		if (url == null) {
			const hasHttpProtocol =
				uriString.indexOf('http://') === 0 ||
				uriString.indexOf('https://') === 0;
			if (!hasHttpProtocol && uriString.indexOf('.') > -1) {
				url = Utils.getUrlObject('http://' + uriString);
			}
		}
		return url;
	}

	static getHost(uriString: string): string | null {
		const url = Utils.getUrl(uriString);
		try {
			return url != null && url.host !== '' ? url.host : null;
		} catch {
			return null;
		}
	}

	private static getUrlObject(uriString: string): URL | null {
		try {
			if (nodeURL != null) {
				return new nodeURL.URL(uriString);
			} else if (typeof URL === 'function') {
				return new URL(uriString);
			} else if (typeof window !== 'undefined') {
				const hasProtocol = uriString.indexOf('://') > -1;
				if (!hasProtocol && uriString.indexOf('.') > -1) {
					uriString = 'http://' + uriString;
				} else if (!hasProtocol) {
					return null;
				}
				const anchor = window.document.createElement('a');
				anchor.href = uriString;
				return anchor as any;
			}
		} catch (e) {
			// Ignore error
		}

		return null;
	}

	static fromBufferToByteString(buffer: ArrayBuffer): string {
		return String.fromCharCode.apply(
			null,
			new Uint8Array(buffer) as unknown as number[]
		);
	}

	static merge<Destination, Source>(
		destination: Destination,
		source: Source
	): Merge<Destination, Source> {
		return Object.assign(destination as any, source) as unknown as Merge<
			Destination,
			Source
		>;
	}

	static fromByteStringToArray(str: string): Uint8Array | null {
		if (str == null) {
			return null;
		}
		const arr = new Uint8Array(str.length);
		for (let i = 0; i < str.length; i++) {
			arr[i] = str.charCodeAt(i);
		}
		return arr;
	}

	static recordToMap<K extends string | number, V>(
		record: Record<K, V>
	): Map<K, V> | null {
		if (record == null) {
			return null;
		} else if (record instanceof Map) {
			return record;
		}

		const entries = Object.entries(record);
		if (entries.length === 0) {
			return new Map();
		}

		if (isNaN(Number(entries[0][0]))) {
			return new Map(entries) as Map<K, V>;
		} else {
			return new Map(entries.map((e) => [Number(e[0]), e[1]])) as Map<K, V>;
		}
	}

	static mapToRecord<K extends string | number, V>(
		map: Map<K, V>
	): Record<string, V> | null {
		if (map == null) {
			return null;
		}
		if (!(map instanceof Map)) {
			return map;
		}
		return Object.fromEntries(map);
	}

	static newGuid(): string {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
			const r = (Math.random() * 16) | 0;
			const v = c === 'x' ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	}

	static fromUtf8ToArray(str: string): Uint8Array {
		if (Utils.isNode) {
			return new Uint8Array(Buffer.from(str, 'utf8'));
		} else {
			const strUtf8 = unescape(encodeURIComponent(str));
			const arr = new Uint8Array(strUtf8.length);
			for (let i = 0; i < strUtf8.length; i++) {
				arr[i] = strUtf8.charCodeAt(i);
			}
			return arr;
		}
	}
}

export function debounce(fn: (...args: any[]) => any, delay: number) {
	let timeout: any;

	return function (...args: any[]) {
		clearTimeout(timeout);
		timeout = setTimeout(() => fn(...args), delay);
	};
}

export const getActiveTab = async () => {
	const [tab] = await browser.tabs.query({
		currentWindow: true,
		active: true
	});
	return tab || null;
};

Utils.init();
