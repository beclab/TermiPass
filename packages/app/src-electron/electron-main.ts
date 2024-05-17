import { app, BrowserWindow, nativeTheme, ipcMain } from 'electron';
import path from 'path';
import os from 'os';
import { TrayBuilder } from './trayBuilder';
import { registerDownloadService, resetWin } from './download/main';
import { registerVpnService } from './vpn/main';
import { registerFilesService } from './files/main';
import { registerStoreService } from './store/main';
import { registerTransferService } from './transfer/main';
import { registerWindowsService } from './windows/main';
import { registerSettingsService } from './settings/main';
// import { updateElectronApp, UpdateSourceType } from 'update-electron-app';

// updateElectronApp({
// 	updateInterval: '1 hour',
// 	logger: require('electron-log'),
// 	updateSource: {
// 		type: UpdateSourceType.ElectronPublicUpdateService,
// 		repo: 'beclab/TermiPass',
// 		host: 'https://update.electronjs.org'
// 	}
// });

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
		show: false,
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

	if (platform === 'win32') {
		connectUtilityIsolatedWrold();
	}
	mainWindow.on('ready-to-show', () => {
		mainWindow?.show();
	});

	mainWindow.loadURL(process.env.APP_URL!);
	// mainWindow.loadFile(path.join(__dirname, 'index.html'));
	// mainWindow.webContents.openDevTools();

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
		registerFilesService((updateTray) => {
			Tray.setImage(updateTray);
		});
	}

	if (platform !== 'win32' && !process.env.MOCKTEST) {
		/**
		 * 注册vpn服务 mac
		 */
		registerVpnService(mainWindow);
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

function connectUtilityIsolatedWrold() {
	const { utilityProcess } = require('electron');

	const child = utilityProcess.fork(path.resolve(__dirname, 'tailscale.js'));
	child.on('message', () => {});
	const { MessageChannelMain } = require('electron');
	const { port1, port2 } = new MessageChannelMain();

	child.postMessage('port', [port2]);

	mainWindow?.once('ready-to-show', () => {
		mainWindow?.webContents.postMessage('port', null, [port1]);
	});
}

ipcMain.handle('platform', async () => {
	return platform;
});

ipcMain.handle('cookie', async () => {
	return mainWindow?.webContents.session.cookies
		.get({})
		.then((cookies) => {
			return cookies;
		})
		.catch((error) => {
			console.error(error);
			return '';
		});
});

// process.on('uncaughtException', (error) =>{
//   console.error('Uncaught exception:', error);
//   app.exit(1)
// })
