import { BrowserWindow, screen } from 'electron';
import { ipcWindowsMainHandle } from './interface';
import os from 'os';

export const registerWindowsService = (window: BrowserWindow | undefined) => {
	listenerEvent(window);
};

const listenerEvent = (window: BrowserWindow | undefined) => {
	const platform = process.platform || os.platform();

	ipcWindowsMainHandle('close', () => {
		window?.close();
	});

	ipcWindowsMainHandle('minimize', () => {
		window?.minimize();
	});

	ipcWindowsMainHandle('maximize', () => {
		if (window?.isMaximized()) {
			window?.unmaximize();
		} else {
			window?.maximize();
		}
	});

	ipcWindowsMainHandle('isMaximized', () => {
		return window?.isMaximized() || false;
	});

	let movingInterval: NodeJS.Timer | null = null;

	ipcWindowsMainHandle('winMove', (_event, isMove: boolean) => {
		// window?.setPosition(params.x,params.y,true)

		let winStartPosition = { x: 0, y: 0 };
		let mouseStartPosition = { x: 0, y: 0 };
		const currentWindow = window;
		const currentWindowSize = window?.getSize() || [0, 0];
		if (currentWindow) {
			if (isMove) {
				// 读取原位置
				const winPosition = currentWindow.getPosition();
				winStartPosition = { x: winPosition[0], y: winPosition[1] };
				// 获取当前鼠标聚焦的窗口
				mouseStartPosition = screen.getCursorScreenPoint();
				// 清除旧的定时器
				if (movingInterval) {
					clearInterval(movingInterval);
				}
				// 创建定时器，每10毫秒更新一次窗口位置，保证一致
				movingInterval = setInterval(() => {
					// 窗口销毁判断，高频率的更新有可能窗口已销毁，定时器还没结束，此时就会出现执行销毁窗口方法的错误
					if (!currentWindow.isDestroyed()) {
						// 如果窗口失去焦点，则停止移动
						if (!currentWindow.isFocused() && movingInterval) {
							clearInterval(movingInterval);
							movingInterval = null;
						}
						// 实时更新位置
						const cursorPosition = screen.getCursorScreenPoint();
						const x =
							winStartPosition.x + cursorPosition.x - mouseStartPosition.x;
						const y =
							winStartPosition.y + cursorPosition.y - mouseStartPosition.y;

						if (platform === 'win32') {
							currentWindow.setBounds({
								x: x,
								y: y,
								width: currentWindowSize[0],
								height: currentWindowSize[1]
							});
						} else {
							currentWindow.setPosition(x, y, false);
						}
					}
				}, 10);
			} else {
				if (movingInterval) {
					clearInterval(movingInterval);
					movingInterval = null;
				}
			}
		}
	});
};
