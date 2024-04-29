import { defineStore } from 'pinia';
import { useUserStore } from './user';
import { Moniter, Usage, Net } from '@bytetrade/core';
import { axiosInstanceProxy } from '../platform/httpProxy';
import { i18n } from '../boot/i18n';
import { NetworkErrorMode, busEmit } from 'src/utils/bus';

export enum TerminusStatus {
	UNKNOWN = 0,
	NORMAL = 1,
	ERROR = 2
}

export type MonitorStoreState = {
	usages: Usage[] | undefined;
	background: string[];
	net: Net | undefined;
	status: TerminusStatus;
};

export const useMonitorStore = defineStore('monitor', {
	state: () => {
		return {
			usages: undefined,
			net: undefined,
			status: TerminusStatus.UNKNOWN,
			background: [
				'linear-gradient(127.05deg,#fffef3 4.41%,#f9fec7 49.41%,#f3fec2 84.8%)',
				'linear-gradient(121.71deg, #FFFEF7 4.54%, rgba(223, 255, 208, 0.5) 51.95%, rgba(210, 255, 188, 0.5) 89.25%);',
				'linear-gradient(127.31deg, #F7FEFF 4.44%, rgba(199, 251, 254, 0.5) 49.68%, rgba(170, 240, 255, 0.5) 85.27%);'
			]
		} as MonitorStoreState;
	},
	getters: {
		formatNetReceived(state) {
			if (!state.net) {
				return '-- B/s';
			}
			const bytes = state.net.received;
			if (bytes < 1024) {
				return bytes.toFixed(2) + 'B/s';
			}

			const kb = bytes / 1024;

			if (kb < 1024) {
				return kb.toFixed(2) + ' KB/s';
			}

			const m = kb / 1024;
			return m.toFixed(2) + ' M/s';
		},
		formatNetTransmitted(state) {
			if (!state.net) {
				return '-- B/s';
			}
			const bytes = state.net.transmitted;
			if (bytes < 1024) {
				return bytes.toFixed(2) + 'B/s';
			}

			const kb = bytes / 1024;

			if (kb < 1024) {
				return kb.toFixed(2) + ' KB/s';
			}

			const m = kb / 1024;
			return m.toFixed(2) + ' M/s';
		}
	},
	actions: {
		clear() {
			this.usages = undefined;
			this.net = undefined;
			this.status = TerminusStatus.UNKNOWN;
		},
		error() {
			this.usages = undefined;
			this.net = undefined;
			this.status = TerminusStatus.ERROR;
		},
		async loadMonitor() {
			const userStore = useUserStore();
			console.log('monitor');
			if (!userStore.current_user) {
				this.clear();
				return;
			}

			if (!userStore.current_user.setup_finished) {
				this.clear();
				return;
			}

			if (process.env.IS_PC_TEST) {
				const data: Moniter = {
					cpu: {
						name: i18n.global.t('monitor.cpu.title'),
						color: 'yellow',
						uint: '40',
						ratio: 40,
						total: 100,
						usage: 40
					},
					memory: {
						name: i18n.global.t('monitor.memory.title'),
						color: 'light-green-12',
						uint: '40',
						ratio: 40,
						total: 100,
						usage: 40
					},
					disk: {
						name: i18n.global.t('monitor.disk.title'),
						color: 'cyan-4',
						uint: '40',
						ratio: 40,
						total: 100,
						usage: 30
					},
					net: {
						received: 100000,
						transmitted: 200000
					}
				};
				console.log(data);

				this.usages = [];
				this.usages.push(data.cpu);
				this.usages.push(data.memory);
				this.usages.push(data.disk);
				this.net = data.net;
				this.status = TerminusStatus.NORMAL;
				console.log('monitor');
				console.log(data);
				return;
			}

			const baseURL = userStore.current_user.auth_url;
			const instance = axiosInstanceProxy({
				baseURL: baseURL,
				timeout: 1000 * 10,
				headers: {
					'Content-Type': 'application/json',
					'X-Authorization': userStore.current_user.access_token
				}
			});

			try {
				const response = await instance.get(
					'/bfl/monitor/v1alpha1/cluster',
					{}
				);

				console.log('response ===>');
				console.log(response);

				if (!response || response.status != 200 || !response.data) {
					this.error();
					throw Error('Network error, please try again later');
				}

				console.log(response.data);
				if (response.data.code != 0) {
					this.error();
					if (response.data.code == '100001' || response.data.code == 100001) {
						busEmit('network_error', {
							type: NetworkErrorMode.monitor
						});
					}
				} else {
					const data = response.data.data;
					this.usages = [];
					this.usages.push(data.cpu);
					this.usages.push(data.memory);
					this.usages.push(data.disk);

					this.usages[0].name = i18n.global.t('monitor.cpu.title');
					this.usages[0].color = 'yellow';
					this.usages[0].uint = '40';

					this.usages[1].name = i18n.global.t('monitor.memory.title');
					this.usages[1].color = 'light-green-12';
					this.usages[1].uint = '40';

					this.usages[2].name = i18n.global.t('monitor.disk.title');
					this.usages[2].color = 'cyan-4';
					this.usages[2].uint = '40';

					this.net = data.net;
					this.status = TerminusStatus.NORMAL;
				}
			} catch (error) {
				console.log('monitor request error code');
				console.log(error);
				busEmit('network_error', {
					type: NetworkErrorMode.monitor
				});
			}
		}
	}
});
