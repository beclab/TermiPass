import { BrowserWindow, MessageChannelMain, utilityProcess } from 'electron';
import path from 'path';
import { ipcWinVPNMainHandle, ipcVPNMainPostMessage } from './interface';

export const registerWinVPNService = (window: BrowserWindow | undefined) => {
	listenerEvent(window);
};

const listenerEvent = (window: BrowserWindow | undefined) => {
	ipcWinVPNMainHandle('getCookie', async (_event, url: string) => {
		const cookies = await window?.webContents.session.cookies.get({
			url
		});
		let cookieStr = '';
		if (cookies) {
			cookieStr = cookies.map((e) => `${e.name}=${e.value}`).join(';');
		}
		return cookieStr;
	});

	ipcWinVPNMainHandle('winHadLoad', () => {
		if (!window) {
			return;
		}
		const child = utilityProcess.fork(path.resolve(__dirname, 'tailscale.js'));
		child.on('message', () => {});
		const { port1, port2 } = new MessageChannelMain();
		child.postMessage('port', [port2]);
		ipcVPNMainPostMessage(window, 'registerPort', [port1]);
	});
};
