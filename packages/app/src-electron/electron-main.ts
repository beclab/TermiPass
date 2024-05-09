import { app, BrowserWindow, nativeTheme } from 'electron';
import path from 'path';
import os from 'os';
import { TrayBuilder } from './trayBuilder';
import { registerDownloadService, resetWin } from './download/main';
import { registerMacVpnService } from './mac-vpn/main';
import { registerFilesService } from './files/main';
import { registerStoreService } from './store/main';
import { registerTransferService } from './transfer/main';
import { registerWindowsService } from './windows/main';
import { registerSettingsService } from './settings/main';
import { registerWinVPNService } from './win-vpn/main';

// 禁用 Electron 的 crashReporter
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-renderer-process-reuse');
app.commandLine.appendSwitch('disable-metrics');

const platform = process.platform || os.platform();

try {
	if (platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
		require('fs').unlinkSync(
			path.join(app.getPath('userData'), 'DevTools Extensions')
		);
	}
} catch (err) {
	console.error(err);
}

let mainWindow: BrowserWindow | undefined;
let isQuitApp = false;

// crashReporter.start({
// 	ignoreSystemCrashHandler: true,
// 	submitURL: '',
// 	uploadToServer: false
// })

function createWindow() {
	/**
	 * Initial window options
	 */
	mainWindow = new BrowserWindow({
		icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon
		width: 1128,
		height: 768,
		minWidth: 1128,
		minHeight: 768,
		useContentSize: true,
		show: true,
		frame: true,
		fullscreenable: true,
		resizable: true,
		webPreferences: {
			contextIsolation: true,
			// More info: https://v2.quasar.dev/quasar-cli-webpack/developing-electron-apps/electron-preload-script
			preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD!),
			nodeIntegration: true
		},
		titleBarOverlay:
			platform == 'win32'
				? undefined
				: {
						color: '#f6f6f6',
						symbolColor: '#74b1be',
						height: 38
				  },
		titleBarStyle: platform === 'win32' ? 'hidden' : 'hiddenInset'
		// titleBarStyle: 'hiddenInset'
	});

	// mainWindow.loadURL(process.env.APP_URL!);
	mainWindow.loadFile(path.join(__dirname, 'index.html'));

	mainWindow.on('closed', () => {
		mainWindow = undefined;
		Tray.setMainWindow(undefined);
	});

	mainWindow.on('close', (event) => {
		if (!isQuitApp) {
			mainWindow?.hide();
			event.preventDefault();
		} else {
			// mainWindow?.destroy()
			// event.preventDefault();
			app.exit();
		}
	});

	Tray.build();
	Tray.setMainWindow(mainWindow);

	resetWin(mainWindow);
}
const Tray: TrayBuilder = new TrayBuilder();

app.whenReady().then(() => {
	createWindow();

	/**
	 * 注册store服务
	 */
	registerStoreService();
	/**
	 * 注册下载服务
	 */
	registerDownloadService();
	/**
	 * 注册传输服务
	 */
	registerTransferService();
	/**
	 * 注册设置服务
	 */
	registerSettingsService(mainWindow);

	if (!process.env.MOCKTEST) {
		/**
		 * 注册文件服务
		 */
		registerFilesService();
	}

	if (platform == 'win32') {
		registerWinVPNService(mainWindow);
	} else if (platform == 'darwin') {
		registerMacVpnService(mainWindow);
	}

	/**
	 * 注册windows服务 win
	 */
	registerWindowsService(mainWindow);
});

app.on('window-all-closed', () => {
	if (platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (mainWindow === undefined) {
		createWindow();
	} else {
		mainWindow.show();
	}
});

app.once('before-quit', () => {
	isQuitApp = true;
});
