import {
	ipcMain,
	IpcMainInvokeEvent,
	BrowserWindow,
	WebContents,
	MessagePortMain
} from 'electron';

export const ipcMainHandle = <T>(
	eventName: string,
	listener: (event: IpcMainInvokeEvent, ...args: any[]) => Promise<T> | void | T
): void => {
	ipcMain.handle(eventName, async (event, ...args: any[]) => {
		const result = await listener(event, ...args);
		return result;
	});
};

export const ipcMainSend = (
	window: BrowserWindow,
	eventName: string,
	...args: any[]
): void => {
	window.webContents.send(eventName, args);
};

export const ipcMainPostMessage = (
	window: BrowserWindow,
	eventName: string,
	transfer?: MessagePortMain[]
): void => {
	window.webContents.postMessage(eventName, null, transfer);
};

export const ipcWebContentsSend = (
	webContents: WebContents,
	eventName: string,
	...args: any[]
): void => {
	webContents.send(eventName, ...args);
};
