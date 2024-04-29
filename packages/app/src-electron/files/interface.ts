import { IpcMainInvokeEvent, IpcRendererEvent } from 'electron';
import { Worker } from 'worker_threads';
import {
	IPCFilesEventName,
	IFilesLoginAccountInterface as LoginAccountInterface,
	IFilesRepoAddSyncInterface as RepoAddSyncInterface
} from '../../src/platform/electron/interface';

import { ipcRendererInvoke, ipcRendererListener } from '../utils/preload';
import { ipcMainHandle } from '../utils/main';
import path from 'path';

export const ipcFilesRendererInvoke = <T>(
	eventName: IPCFilesEventName,
	...args: any[]
): Promise<T> => {
	return ipcRendererInvoke(eventName, ...args);
};

export const ipcFilesRendererListener = (
	eventName: IPCFilesEventName,
	callback: (event: IpcRendererEvent, ...args: any[]) => void
): void => {
	ipcRendererListener(eventName, callback);
};

export const ipcFilesMainHandle = <T>(
	eventName: IPCFilesEventName,
	listener: (event: IpcMainInvokeEvent, ...args: any[]) => Promise<T> | void | T
): void => {
	ipcMainHandle(eventName, listener);
};

export type IFilesLoginAccountInterface = LoginAccountInterface;

export type IFilesRepoAddSyncInterface = RepoAddSyncInterface;

const resolveCallback: Map<string, (value: any) => void> = new Map();
const dealMessageResultBlockMap: Map<string, (value: any) => void> = new Map();

let worker: Worker | undefined = undefined;

export const filesMainHandleCallBack = (
	type: IPCFilesEventName,
	params: any,
	resolveAppendKey?: string,
	isVoid = false,
	dealMessageResult?: (result: any) => void
) =>
	new Promise<any>((resolve) => {
		const resolveKey = resolveAppendKey ? `${type}-${resolveAppendKey}` : type;
		if (!isVoid) {
			resolveCallback.set(resolveKey, resolve);
		}

		if (dealMessageResult) {
			dealMessageResultBlockMap.set(resolveKey, dealMessageResult);
		}

		worker?.postMessage({
			type: type,
			params: params,
			resolveKey: resolveAppendKey ? `${type}-${resolveAppendKey}` : type
		});

		if (isVoid) {
			resolve(undefined);
		}
	});

export const filesWorkerInit = () => {
	worker = new Worker(path.resolve(__dirname, 'filesAsync.js'));
	worker.on('message', (message) => {
		if (message.resolveKey && resolveCallback.get(message.resolveKey)) {
			const resolve = resolveCallback.get(message.resolveKey);
			if (resolve) {
				resolve(message.result);
			}
			resolveCallback.delete(message.resolveKey);
		}

		if (
			message.resolveKey &&
			dealMessageResultBlockMap.get(message.resolveKey)
		) {
			const resolve = dealMessageResultBlockMap.get(message.resolveKey);
			if (resolve) {
				resolve(message.result);
			}
			dealMessageResultBlockMap.delete(message.resolveKey);
		}
	});

	worker.postMessage({
		type: 'init',
		params: {}
	});
};
