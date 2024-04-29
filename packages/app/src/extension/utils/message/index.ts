/**
 * this script is live in content-script / dapp's page
 */

import { EventEmitter } from 'events';

abstract class Message extends EventEmitter {
	// max concurrent request limit
	private _requestIdPool = [...Array(1000).keys()];
	protected _EVENT_PRE = 'TermiPass_';
	protected listenCallback: any;

	private _waitingMap = new Map<
		number,
		{
			data: any;
			resolve: (arg: any) => any;
			reject: (arg: any) => any;
		}
	>();

	abstract send(type: string, data: any): void;

	request = (data: any) => {
		if (!this._requestIdPool.length) {
			throw new Error('_requestIdPool length !');
		}
		const ident = this._requestIdPool.shift()!;

		return new Promise((resolve, reject) => {
			this._waitingMap.set(ident, {
				data,
				resolve,
				reject
			});
			this.send('request', { ident, data });
		});
	};

	onResponse = async ({ ident, res, err }: any = {}) => {
		const result = this._waitingMap.get(ident);
		if (!result) {
			return;
		}
		this._requestIdPool.push(ident);
		this._waitingMap.delete(ident);
		err ? result.reject(err) : result.resolve(res);
	};

	onRequest = async ({ ident, data }: any) => {
		if (this.listenCallback) {
			let res, err;

			try {
				res = await this.listenCallback(data);
			} catch (e: any) {
				err = {
					message: e.message,
					stack: e.stack
				};
				if (e.code) {
					err = {
						...err,
						code: e.code
					};
				}
				if (e.data) {
					err = {
						...err,
						code: e.data
					};
				}
			}
			this.send('response', { ident, res, err });
		}
	};

	_dispose = () => {
		for (const request of this._waitingMap.values()) {
			request.reject('user reject request');
		}

		this._waitingMap.clear();
	};
}

export default Message;
