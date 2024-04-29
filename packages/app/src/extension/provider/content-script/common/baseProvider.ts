import { EventEmitter } from 'events';
import PushEventHandlers from './pushEventHandlers';
import { $, domReadyCall } from './utils';
import ReadyPromise from './readyPromise';
import DedupePromise from './dedupePromise';
import WindowMessage from '../../../utils/message/windowMessage';

export interface StateProvider {
	didKey: string;
	isConnected: boolean;
	isUnlocked: boolean;
	isPermanentlyDisconnected: boolean;
}

export abstract class BaseProvider extends EventEmitter {
	_isReady = false;
	_initialized = false;

	_cacheRequestsBeforeReady: any[] = [];
	_cacheEventListenersBeforeReady: [string | symbol, () => any][] = [];

	_state: StateProvider = {
		didKey: '',
		isConnected: false,
		isUnlocked: false,
		isPermanentlyDisconnected: false
	};

	_pushEventHandlers: PushEventHandlers;
	_requestPromise = new ReadyPromise(2);
	_dedupePromise = new DedupePromise([]);
	_bcm = new WindowMessage();

	constructor({ maxListeners = 100 } = {}) {
		super();
		this.setMaxListeners(maxListeners);
		this.initialize();
		this._pushEventHandlers = new PushEventHandlers(this);
	}

	initialize = async () => {
		document.addEventListener(
			'visibilitychange',
			this._requestPromiseCheckVisibility
		);
		this._bcm.connect().on('message', this._handleBackgroundMessage);

		domReadyCall(() => {
			const origin = location.origin;

			const icon =
				($('head > link[rel~="icon"]') as HTMLLinkElement)?.href ||
				($('head > meta[itemprop="image"]') as HTMLMetaElement)?.content;

			const name =
				document.title ||
				($('head > meta[name="title"]') as HTMLMetaElement)?.content ||
				origin;

			const params = { icon, name, origin };
			this.requestInternalMethods({
				method: 'tabCheckin',
				params: params
			});
			this._requestPromise.check(2);
		});

		try {
			const { didKey, isUnlocked }: any = await this.requestInternalMethods({
				method: 'getProviderState'
			});
			this._pushEventHandlers.setUnlock(isUnlocked);
			this._pushEventHandlers.accountChanged(didKey);
		} catch (e) {
			console.error(`error ====>${e.message}`);
		} finally {
			this._initialized = true;
			this.emit('_initialized');
		}
	};

	private _requestPromiseCheckVisibility = () => {
		if (document.visibilityState === 'visible') {
			this._requestPromise.check(1);
		} else {
			this._requestPromise.uncheck(1);
		}
	};

	private _handleBackgroundMessage = ({ event, data }: any) => {
		if ((this._pushEventHandlers as any)[event]) {
			return (this._pushEventHandlers as any)[event](data);
		}

		this.emit(event, data);
	};

	isConnected = () => {
		return this._state.isConnected;
	};

	request = async (data: any) => {
		if (!this._isReady) {
			return new Promise((resolve, reject) => {
				this._cacheRequestsBeforeReady.push({
					data,
					resolve,
					reject
				});
			});
		}
		return this._dedupePromise.call(data.method, () => this._request(data));
	};

	_request = async (data: any) => {
		if (!data) {
			throw Error('invalidRequest');
		}
		this._requestPromiseCheckVisibility();

		return this._requestPromise.call(async () => {
			try {
				return await this._bcm.request({
					...data
				});
			} catch (err) {
				throw new Error(err.message);
			}
		});
	};

	requestInternalMethods = (data: any) => {
		return this._dedupePromise.call(data.method, () => this._request(data));
	};

	on = (event: string | symbol, handler: (...args: any[]) => void) => {
		if (!this._isReady) {
			this._cacheEventListenersBeforeReady.push([event, handler]);
			return this;
		}
		return super.on(event, handler);
	};
}
