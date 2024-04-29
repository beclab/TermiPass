import { BrowserWindow, app, powerSaveBlocker } from 'electron';
import {
	ipcSettingsMainHandle,
	ipcSettingsMainSend,
	PreventSleepTaskName
} from './interface';
import { MessageChannelMain, utilityProcess } from 'electron';
import os from 'os';
import path from 'path';
import stores from '../store/electron-store';

export const registerSettingsService = (window: BrowserWindow | undefined) => {
	listenerEvent(window);
};

// 添加主进程 ipc 调用事件
const listenerEvent = (window: BrowserWindow | undefined) => {
	const platform = process.platform || os.platform();

	if (platform == 'win32') {
		const { port1, port2 } = new MessageChannelMain();
		const child = utilityProcess.fork(
			path.resolve(__dirname, 'networkMonitor.js')
		);

		child.on('spawn', () => {
			child.postMessage('port', [port1]);
		});

		port2.on('message', (message) => {
			const type = message.data.type;
			if (type == 'ready') {
				port2.postMessage({
					type: 'start'
				});
			}

			if (type == 'network_status' && window) {
				const value = message.data.content;
				ipcSettingsMainSend(window, 'listenerNetworkUpdate', value);
			}
		});
		port2.start();
		child.on('message', () => {});
	}

	ipcSettingsMainHandle('getAutomaticallyStartBoot', () => {
		const exeName = path.basename(process.execPath);
		return app.getLoginItemSettings({
			args: ['--processStart', `${exeName}`]
		}).openAtLogin;
	});

	ipcSettingsMainHandle(
		'setAutomaticallyStartBoot',
		(_event, enable: boolean) => {
			const exeName = path.basename(process.execPath);
			app.setLoginItemSettings({
				openAtLogin: enable,
				openAsHidden: false,
				path: process.execPath,
				args: ['--processStart', `${exeName}`]
			});
		}
	);

	ipcSettingsMainHandle('getAppInfo', () => {
		return {
			version: app.getVersion()
		};
	});

	ipcSettingsMainHandle('getTaskPreventSleepBoot', () => {
		return stores.store.get(
			stores.TASKS_PRESENT_DISPLAY_SLEEP,
			true
		) as boolean;
	});

	ipcSettingsMainHandle(
		'setTaskPreventSleepBoot',
		(_event, status: boolean) => {
			stores.store.set(stores.TASKS_PRESENT_DISPLAY_SLEEP, status);
			updatePreventSleepTasks();
		}
	);
};

const preventDisplaySleepTaskList: {
	name: PreventSleepTaskName;
	status: boolean;
}[] = [];

export const updatePreventSleepTask = (
	taskName: PreventSleepTaskName,
	status: boolean
) => {
	// 查看当前是否有需要阻止sleep的任务
	let task = preventDisplaySleepTaskList.find((e) => e.name == taskName);

	if (!task) {
		task = {
			name: taskName,
			status
		};
		preventDisplaySleepTaskList.push(task);
	} else {
		task.status = status;
	}

	updatePreventSleepTasks();
};

let preventDisplaySleepId = -1;
const updatePreventSleepTasks = () => {
	const settingsPreventSleepBoot = stores.store.get(
		stores.TASKS_PRESENT_DISPLAY_SLEEP,
		true
	) as boolean;
	if (!settingsPreventSleepBoot) {
		if (preventDisplaySleepId >= 0) {
			powerSaveBlocker.stop(preventDisplaySleepId);
			preventDisplaySleepId = -1;
		}
		return;
	}
	if (preventDisplaySleepTaskList.find((e) => e.status == true)) {
		if (preventDisplaySleepId < 0) {
			preventDisplaySleepId = powerSaveBlocker.start('prevent-display-sleep');
		}
	} else {
		if (preventDisplaySleepId >= 0) {
			powerSaveBlocker.stop(preventDisplaySleepId);
			preventDisplaySleepId = -1;
		}
	}
};
