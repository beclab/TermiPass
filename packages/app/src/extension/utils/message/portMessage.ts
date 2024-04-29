import { browser } from 'webextension-polyfill-ts';
import Message from './index';
class PortMessage extends Message {
	port: any;
	listenCallback: any;

	constructor(port?: any) {
		super();

		if (port) {
			this.port = port;
		}
	}

	connect = (name?: string, autoReconnect = false) => {
		this.port = browser.runtime.connect(undefined, name ? { name } : undefined);
		this.port.onMessage.addListener(({ _type_, data }: any) => {
			if (_type_ === `${this._EVENT_PRE}message`) {
				this.emit('message', data);
				return;
			}

			if (_type_ === `${this._EVENT_PRE}response`) {
				this.onResponse(data);
			}
		});

		if (autoReconnect) {
			this.port.onDisconnect.addListener(() => {
				this.connect(name, autoReconnect);
			});
		}

		return this;
	};

	listen = (listenCallback: any) => {
		if (!this.port) return;
		this.listenCallback = listenCallback;
		this.port.onMessage.addListener(({ _type_, data }: any) => {
			if (_type_ === `${this._EVENT_PRE}request`) {
				this.onRequest(data);
			}
		});

		return this;
	};

	send = (type: any, data: any) => {
		if (!this.port) return;
		try {
			this.port.postMessage({
				_type_: `${this._EVENT_PRE}${type}`,
				data
			});
		} catch (e) {
			// DO NOTHING BUT CATCH THIS ERROR
		}
	};

	dispose = () => {
		this._dispose();
		this.port?.disconnect();
	};
}

export default PortMessage;
