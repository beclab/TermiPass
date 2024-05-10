import { BrowserWindow } from 'electron';
import {
	ipcVpnMainHandle,
	IOpenVpnInterface,
	ipcVpnMainSend
} from './interface';

export const registerVpnService = (window: BrowserWindow | undefined) => {
	listenerEvent(window);
};

const listenerEvent = (window: BrowserWindow | undefined) => {
	const { VpnAddon } = require('../../macAddonSDK/macAddonSDK.node');

	function vpnStatusUpdateNotification() {
		if (!window) {
			return;
		}
		ipcVpnMainSend(window, 'electronVpnStatusUpdate');
	}
	const vpnAddon = new VpnAddon(vpnStatusUpdateNotification);

	ipcVpnMainHandle('openVpn', async (_event, data: IOpenVpnInterface) => {
		const cookies = await window?.webContents.session.cookies.get({
			url: data.server
		});
		let cookieStr = '';
		if (cookies) {
			cookieStr = cookies.map((e) => `${e.name}=${e.value}`).join(';');
		}
		vpnAddon.open(data.server, data.authKey, cookieStr);
	});

	ipcVpnMainHandle('closeVpn', () => {
		vpnAddon.close();
	});

	ipcVpnMainHandle('statusVpn', () => {
		return vpnAddon.status();
	});

	ipcVpnMainHandle('currentNodeId', () => {
		return vpnAddon.currentNodeId();
	});

	ipcVpnMainHandle('peersState', () => {
		const peers = vpnAddon.peersState();
		return peers;
	});
};
