import { BrowserWindow, Menu, Tray } from 'electron';
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
		this.tray = new Tray(
			path.join(
				__dirname,
				platform == 'win32' ? 'icons/icon2.png' : 'icons/tray.png'
			)
		);
		this.tray.setIgnoreDoubleClickEvents(true);

		this.tray.on('click', this.onClick);

		this.tray.on('right-click', this.onRightClick);
	};

	setMainWindow = (mainWD: BrowserWindow | undefined) => {
		if (this.mainWindow != undefined) {
			this.mainWindow = undefined;
		}
		this.mainWindow = mainWD;
	};

	/**
	 * 状态优先 4种状态 从上到下
	 * 开关关闭 -> 暂停
	 * 有任何同步中的repo -> 同步中
	 * 有任何错误的repo => 错误
	 * 同步完成
	 */
	setImage = (iconName: string) => {
		if (!this.tray) {
			return;
		}

		this.tray.setImage(path.join(__dirname, `icons/${iconName}.png`));
	};
}