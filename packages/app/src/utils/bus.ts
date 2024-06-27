import { EventBus } from 'quasar';

export const bus = new EventBus();

export const busOn = (event: BusEventName, block: (...args: any[]) => void) => {
	bus.on(event, block);
};

export const busOff = (
	event: BusEventName,
	block?: (...args: any[]) => void
) => {
	bus.off(event, block);
};

export const busEmit = (event: BusEventName, ...args: any[]) => {
	bus.emit(event, ...args);
};

export enum NetworkUpdateMode {
	update = 1,
	vpnStart = 2,
	vpnStop = 3
}

export enum NetworkErrorMode {
	axois = 1,
	vault = 2,
	monitor = 3,
	file = 4
}

export const networkErrorModeString = (mode: NetworkErrorMode) => {
	switch (mode) {
		case NetworkErrorMode.axois:
			return 'axios';
		case NetworkErrorMode.vault:
			return 'vault';
		case NetworkErrorMode.monitor:
			return 'monitor';
		case NetworkErrorMode.file:
			return 'file';
		default:
			break;
	}
};

export type BusEventName =
	// error
	| 'network_error'
	| 'account_update'
	| 'device_update'
	| 'network_update'

	// android
	| 'appStateChange'
	| 'backButton'
	//capacitor
	| 'pushNotificationReceived'
	| 'receiveMessage'
	| 'cancel_sign'
	| 'signMessage'

	//bex
	| 'BROADCAST_TO_UI'
	| 'BROADCAST_TO_BACKGROUND'
	| 'updateVaultComplete'
	| 'autofillById'

	// app
	| 'appSubscribe'
	| 'orgSubscribe'

	// others
	| 'runTask';

export type BroadcastToUIMethod = 'UNLOCKED_UPDATE';
