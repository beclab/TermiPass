import {
	ipcVpnRendererInvoke,
	ipcVpnRendererListener,
	IOpenVpnInterface
} from './interface';

const openVpn = async (data: IOpenVpnInterface): Promise<void> => {
	await ipcVpnRendererInvoke<void>('openVpn', data);
	// await ipcRendererInvoke('openVpn', data)
};

const closeVpn = async (): Promise<void> => {
	await ipcVpnRendererInvoke<void>('closeVpn');
};

const statusVpn = async (): Promise<number> => {
	return ipcVpnRendererInvoke('statusVpn');
};

const currentNodeId = async (): Promise<string> => {
	return ipcVpnRendererInvoke('currentNodeId');
};

const peersState = async (): Promise<string> => {
	return ipcVpnRendererInvoke('peersState');
};

export const listenerVpnStatusUpdate = (callback: () => void): void =>
	ipcVpnRendererListener('electronVpnStatusUpdate', callback);

export const registerVpnMethods = {
	openVpn,
	closeVpn,
	statusVpn,
	currentNodeId,
	peersState,
	listenerVpnStatusUpdate
};
