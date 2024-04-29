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
		console.log('Hi! vpn status update');
		if (!window) {
			return;
		}
		ipcVpnMainSend(window, 'electronVpnStatusUpdate');
	}
	const vpnAddon = new VpnAddon(vpnStatusUpdateNotification);

	console.log('add openVpn handle');

	ipcVpnMainHandle('openVpn', async (_event, data: IOpenVpnInterface) => {
		const cookies = await window?.webContents.session.cookies.get({
			url: data.server
		});
		let cookieStr = '';
		if (cookies) {
			cookieStr = cookies.map((e) => `${e.name}=${e.value}`).join(';');
		}
		console.log('cookieStr ===>');
		console.log(cookieStr);
		vpnAddon.open(data.server, data.authKey, cookieStr);
	});

	console.log('add closeVpn handle');

	ipcVpnMainHandle('closeVpn', () => {
		console.log('backend close vpn');
		vpnAddon.close();
	});

	console.log('add statusVpn handle');
	ipcVpnMainHandle('statusVpn', () => {
		return vpnAddon.status();
	});

	ipcVpnMainHandle('currentNodeId', () => {
		return vpnAddon.currentNodeId();
	});

	ipcVpnMainHandle('peersState', () => {
		return vpnAddon.peersState();
	});
};
