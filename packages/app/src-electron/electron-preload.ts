import { contextBridge, ipcRenderer } from 'electron';
import { registerDownloadMethods } from './download/preload';
import { registerVpnMethods } from './vpn/preload';
import { registerFilesMethods } from './files/preload';
import { registerStoreMethods } from './store/preload';
import { registerTransferMethods } from './transfer/preload';
import { registerWindowsMethods } from './windows/preload';
import { registerSettingsMethods } from './settings/preload';

contextBridge.exposeInMainWorld('electron', {
	api: {
		/* vpn */
		vpn: registerVpnMethods,
		/* files */
		files: registerFilesMethods,
		/* download */
		download: registerDownloadMethods,

		transfer: registerTransferMethods,

		windows: registerWindowsMethods,

		settings: registerSettingsMethods
	},
	store: registerStoreMethods
});

const platform = await ipcRenderer.invoke('platform');
console.log('platform:', platform);
if (platform === 'win32') {
	const windowLoaded = new Promise((resolve) => {
		window.onload = resolve;
	});

	console.log('isolated world');
	ipcRenderer.on('port', async (e) => {
		await windowLoaded;
		window.postMessage('main-world-port', '*', e.ports);

		console.log('transfer port to main world');
	});
}

contextBridge.exposeInMainWorld('winapi', {
	getCookie: async () => {
		return await ipcRenderer.invoke('cookie');
	}
});
