import { ipcRenderer, IpcRendererEvent } from 'electron';

/**
 * 添加 ipc 调用监听事件
 * @param eventName - ipc 事件名
 * @param callback - 回调函数
 */
export const ipcRendererListener = (
	eventName: string,
	callback: (event: IpcRendererEvent, ...args: any[]) => void
): void => {
	ipcRenderer.on(eventName, (event, ...args: any[]) => {
		callback(event, ...args);
	});
};

/**
 * 调用 ipc 的处理事件
 * @param eventName - ipc 事件名
 * @param args - 参数
 * @returns `Promise<any>`
 */
export const ipcRendererInvoke = <T>(
	eventName: string,
	...args: any[]
): Promise<T> => ipcRenderer.invoke(eventName, ...args);
