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
			console.log('port2 receive:' + message.data);
			// port2.postMessage("i receive your messages:")
			const type = message.data.type;
			console.log('port2 type');
			console.log(type);
			if (type == 'ready') {
				port2.postMessage({
					type: 'start'
				});
			}

			if (type == 'network_status' && window) {
				console.log(message.data);
				const value = message.data.content;
				ipcSettingsMainSend(window, 'listenerNetworkUpdate', value);
			}
		});
		port2.start();
		child.on('message', (e) => {
			console.log('接收到消息了:', e);
		});
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
			console.log('enable ===>');
			console.log(enable);
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
	// 如果开关是关闭的 不需要启动sleep
	console.log(
		'setting set settingsPreventSleepBoot===>: ' + settingsPreventSleepBoot
	);
	if (!settingsPreventSleepBoot) {
		if (preventDisplaySleepId >= 0) {
			powerSaveBlocker.stop(preventDisplaySleepId);
			preventDisplaySleepId = -1;
		}
		return;
	}
	console.log(
		'if has sleep task ===>' +
			preventDisplaySleepTaskList.find((e) => e.status == true)
	);

	// 如果有需要阻止lsleep的任务 添加
	if (preventDisplaySleepTaskList.find((e) => e.status == true)) {
		if (preventDisplaySleepId < 0) {
			console.log('prevent-display-sleep start');
			preventDisplaySleepId = powerSaveBlocker.start('prevent-display-sleep');
		}
	} else {
		//没有sleep任务时 移除
		if (preventDisplaySleepId >= 0) {
			powerSaveBlocker.stop(preventDisplaySleepId);
			preventDisplaySleepId = -1;
		}
	}
};
