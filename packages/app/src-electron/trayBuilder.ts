import { BrowserWindow, Menu, Tray, nativeTheme } from 'electron';
import * as path from 'path';
import os from 'os';
const platform = process.platform || os.platform();

export class TrayBuilder {
	tray: Tray | undefined;
	mainWindow: BrowserWindow | undefined;
	backActions: any;

	constructor() {
		this.tray = undefined;
		this.mainWindow = undefined;
	}

	onClick = () => {
		if (this.tray == null) {
			return;
		}
		// const menu = [
		//  {
		//    label:
		//      this.mainWindow?.isFocused() && this.mainWindow?.isVisible()
		//        ? 'Hide'
		//        : 'Show',
		//    role: 'window',
		//    click: () => {
		//      if (this.mainWindow == undefined) {
		//        return;
		//      }
		//      if (
		//        this.mainWindow?.isFocused() &&
		//        this.mainWindow?.isVisible()
		//      ) {
		//        this.mainWindow.hide();
		//      } else {
		//        this.mainWindow.show();
		//      }
		//    }
		//  },
		//  {
		//    label: 'Quit TermiPass',
		//    role: 'quit',
		//    accelerator: 'Command+Q'
		//  }
		// ];
		// this.tray.popUpContextMenu(Menu.buildFromTemplate(menu as any));

		if (this.mainWindow == undefined) {
			return;
		}

		if (this.mainWindow.isFocused() && this.mainWindow.isVisible()) {
			this.mainWindow.hide();
		} else {
			this.mainWindow.show();
		}
	};

	onRightClick = () => {
		if (this.tray == null) {
			return;
		}
		const menu = [
			{
				role: 'quit',
				accelerator: 'Command+Q',
				label: 'Quit TermiPass'
			}
		];
		this.tray.popUpContextMenu(Menu.buildFromTemplate(menu as any));
	};

	build = () => {
		if (this.tray) {
			return;
		}
		this.tray = new Tray(this.getIcon());
		this.tray.setIgnoreDoubleClickEvents(true);

		this.tray.on('click', this.onClick);

		this.tray.on('right-click', this.onRightClick);

		// 监听系统主题变化
		nativeTheme.on('updated', () => {
			this.tray?.setImage(this.getIcon());
		});
	};

	setMainWindow = (mainWD: BrowserWindow | undefined) => {
		if (this.mainWindow != undefined) {
			this.mainWindow = undefined;
		}
		this.mainWindow = mainWD;
	};

	setImage = (iconName: string) => {
		if (!this.tray) {
			return;
		}
		let plat = '';
		if (platform == 'win32') {
			plat = '/win';
		} else if (platform == 'darwin') {
			plat = '/mac';
		}
		if (!plat) {
			this.tray.setImage(path.join(__dirname, 'icons/icon2.png'));
			return;
		}
		this.tray.setImage(path.join(__dirname, `icons${plat}/${iconName}.png`));
	};

	getIcon = () => {
		if (platform == 'win32') {
			return path.join(__dirname, 'icons/win/trayTemplate.png');
		}
		if (platform == 'darwin') {
			return path.join(__dirname, 'icons/mac/trayTemplate.png');
		}

		return path.join(__dirname, 'icons/icon2.png');
	};
}
