import { BaseProvider } from '../common/baseProvider';
import urlUtils from '../../../../utils/url';

export class TermiPassProvider extends BaseProvider {
	isTermiPass = true;

	getUserInfo = async () => {
		return this.request({
			method: 'getUserInfo'
		});
	};

	signCredential = async (
		credentialSubject: any,
		schema: any,
		didKey: string
	) => {
		return this.request({
			method: 'signCredential',
			params: {
				didKey,
				credentialSubject,
				schema
			}
		});
	};

	submitVCInfo = async (response: any, schema: any, didKey: string) => {
		return this.request({
			method: 'submitVCInfo',
			params: {
				didKey,
				response,
				schema
			}
		});
	};

	hasVC = async (name: string, didKey: string) => {
		return this.request({
			method: 'hasVC',
			params: {
				didKey,
				name
			}
		});
	};

	signPresentation = async (definition: any, didKey: string) => {
		return this.request({
			method: 'signPresentation',
			params: {
				didKey,
				definition
			}
		});
	};

	signJwtPayload = async (jwtPayload: any, didKey: string) => {
		return this.request({
			method: 'signJwtPayload',
			params: {
				didKey,
				jwtPayload
			}
		});
	};
	signTypeData = async (
		domain: any,
		types: any,
		data: any,
		primaryType: any
	) => {
		return this.request({
			method: 'signTypeData',
			params: {
				domain,
				types,
				data,
				primaryType
			}
		});
	};
}

declare global {
	interface Window {
		TermiPass: any;
	}
}

const provider = new TermiPassProvider();

const proxyProvider = new Proxy(provider, {
	deleteProperty: (target, prop) => {
		if (prop === 'on') {
			delete (target as any)[prop];
		}
		return true;
	}
});

setTimeout(() => {
	provider._isReady = true;
	provider._cacheEventListenersBeforeReady.forEach(([event, handler]) => {
		provider.on(event, handler);
	});
	provider._cacheRequestsBeforeReady.forEach(({ resolve, reject, data }) => {
		provider.request(data).then(resolve).catch(reject);
	});
}, 500);

window.TermiPass = proxyProvider;

const searchParamsObj = urlUtils.getSearchParamsObj();
if (searchParamsObj.webos_app_plugin_id) {
	//@ts-ignore
	window.webos_app_plugin_id = searchParamsObj.webos_app_plugin_id;
}

Object.defineProperty(window, 'TermiPass', {
	get() {
		return proxyProvider;
	}
});

window.dispatchEvent(new Event('TermiPass#initialized'));
