import { defineStore } from 'pinia';
import { WebSocketStatusEnum, WebSocketBean } from '@bytetrade/core';
import { useUserStore } from './user';
import { busEmit } from '../utils/bus';
import { MessageBody, MessageTopic } from '@bytetrade/core';
import { getAppPlatform } from '../platform/appPlatform';
import { useDeviceStore } from './device';

export interface WebSocketState {
	websocket: WebSocketBean | null;
	connectedUserId: string | undefined;
}

export const useSocketStore = defineStore('websocket', {
	state: () => {
		return {
			websocket: null,
			connectedUserId: undefined
		} as WebSocketState;
	},

	actions: {
		getConnectUrl() {
			console.log(process.env.IS_PC_TEST);
			if (process.env.IS_PC_TEST) {
				return 'ws://localhost:5300';
			}

			const userStore = useUserStore();

			if (!userStore.connected) {
				console.log('userStore is not connected');
				return undefined;
			}

			const url = userStore.getModuleSever('vault', 'wss:', '/ws');
			return url;
		},
		start() {
			const userStore = useUserStore();
			const ws_url = this.getConnectUrl();
			console.log('ws_url', ws_url);
			this.connectedUserId = userStore.current_id;
			if (ws_url === undefined) {
				return;
			}

			this.websocket = new WebSocketBean({
				url: ws_url,
				needReconnect: true,
				reconnectMaxNum: 5,
				reconnectGapTime: 3000,
				heartSend: JSON.stringify({
					event: 'ping',
					data: {}
				}),
				onopen: async () => {
					console.log('websocket open ===>');
					const platform = getAppPlatform();
					const firebase_token = await platform.getFirebaseToken();
					if (userStore.current_user && firebase_token.length > 0) {
						this.send({
							event: 'login',
							data: {
								firebase_token: firebase_token,
								name: userStore.current_user.name,
								did: userStore.current_user.id
							}
						});
					}
				},
				onmessage: async (ev) => {
					try {
						const body: MessageBody = JSON.parse(ev.data);
						console.log('onmessage body=>');
						console.log(body);

						if (process.env.IS_PC_TEST) {
							if (body.topic == MessageTopic.Data) {
								if (body.event == 'onOpen') {
									if (userStore.current_user) {
										this.send({
											event: 'login',
											data: {
												firebase_token: '123456',
												name: userStore.current_user.name,
												did: userStore.current_user.id
											}
										});
									}
								}
							}
						}
						busEmit('receiveMessage', body);
					} catch (e) {
						console.log('message error');
						console.log(e);
					}
				},
				onerror: () => {
					console.log('socket error');
				},
				onreconnect: () => {
					console.log('socket start reconnect');
				},
				onFailReconnect: () => {
					console.log('socket fail reconnect');
				}
			});
			this.websocket.start();
			console.log('socket start !!!!');
		},

		isConnected() {
			if (!this.websocket) {
				return false;
			}
			return this.websocket.status == WebSocketStatusEnum.open;
		},

		isConnecting() {
			if (!this.websocket) {
				return false;
			}
			return this.websocket.status == WebSocketStatusEnum.load;
		},

		send(data: any, resend = false) {
			if (!this.websocket) {
				return;
			}
			const sendResult = this.websocket!.send(data, resend);
			return sendResult;
		},
		restart() {
			console.log('restart websocket');
			// return;
			const userStore = useUserStore();
			console.log(this.websocket?.status);
			if (
				(this.isConnected() || this.isConnecting()) &&
				this.connectedUserId == userStore.current_id
			) {
				console.log('no need restart');
				return;
			}

			const deviceStore = useDeviceStore();

			if (!deviceStore.networkOnLine) {
				console.log('network error, not start');
				return;
			}

			if (this.websocket) {
				this.websocket!.dispose();
			}
			this.start();
		},
		dispose() {
			console.log('dispose');
			if (this.websocket) {
				this.websocket!.dispose();
			}
			this.websocket = null;
		}
	}
});
