import {
	ipcMain,
	IpcMainInvokeEvent,
	BrowserWindow,
	WebContents
} from 'electron';

export const ipcMainHandle = <T>(
	eventName: string,
	listener: (event: IpcMainInvokeEvent, ...args: any[]) => Promise<T> | void | T
): void => {
	ipcMain.handle(eventName, async (event, ...args: any[]) => {
		console.log('ipcMainHandle func start==> ', eventName);
		console.log('args ===> ' + args);
		const result = await listener(event, ...args);
		console.log('ipcMainHandle func end==> ', eventName);
		console.log(result);
		return result;
	});
};

export const ipcMainSend = (
	window: BrowserWindow,
	eventName: string,
	...args: any[]
): void => {
	// console.log('window webcontent send event start===> ', eventName);
	window.webContents.send(eventName, args);
	// console.log('window webcontent send event end===> ', eventName);
};

export const ipcWebContentsSend = (
	webContents: WebContents,
	eventName: string,
	...args: any[]
): void => {
	// console.log('webContents send event start===> ', eventName);
	// console.log(...args);
	webContents.send(eventName, ...args);
	// console.log('webContents send event end===> ', eventName);
};
