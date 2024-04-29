import { registerPlugin } from '@capacitor/core';
import { PluginListenerHandle } from '@capacitor/core';

export interface ScanPhotoQRPlugin {
	scan(options: { content: string }): Promise<{ result: string[] }>;
}

export interface ProxyInfoPlugin {
	getServerInfo(): Promise<{
		serverUrl: string;
		scheme: string;
		host: string;
		port: string;
	}>;
}

export declare type onVpnStatusUpdate = (status: string) => void;

export interface TailScalePluginInterface {
	open(options: { authKey: string | undefined; server: string }): void;
	close(): void;

	addListener(
		eventName: 'vpnStatusUpdate',
		listenerFunc: onVpnStatusUpdate
	): Promise<PluginListenerHandle> & PluginListenerHandle;

	status(): Promise<{
		/// tailscale状态
		status: string;
		/// 可选参数map
		options: any;
	}>;

	currentNodeId(): Promise<{
		nodeId: string;
	}>;

	peersState(): Promise<{
		isRunning: boolean;
		state: string;
	}>;
}

const ScanPhotoQR = registerPlugin<ScanPhotoQRPlugin>('ScanPhotoQR');
const ProxyInfo = registerPlugin<ProxyInfoPlugin>('ProxyInfoPlugin');
const TailscalePlugin =
	registerPlugin<TailScalePluginInterface>('TailScalePlugin');

export default {
	ScanPhotoQR,
	ProxyInfo,
	TailscalePlugin
};
