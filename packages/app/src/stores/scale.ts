import { defineStore } from 'pinia';
import { useUserStore } from './user';
import { axiosInstanceProxy } from '../platform/httpProxy';
import { AxiosInstance } from 'axios';
import { utcToDate } from '../utils/utils';
import { getAppPlatform } from '../platform/appPlatform';
import {
	ConfigVPNInterface,
	HostPeerInfo,
	instanceOfConfigVPNInterface,
	TermiPassVpnStatus
} from '../platform/terminusCommon/terminusCommonInterface';
import { app } from '../globals';
import { PreAuthKey } from '@didvault/sdk/src/core/api';
import { notifyFailed } from 'src/utils/notifyRedefinedUtil';
import { useTermipassStore } from './termipass';

export type DataState = {
	owner: string;
	authKey: PreAuthKey | undefined;
	scaleServer: string;
	instance?: AxiosInstance;
	vpnStatus: TermiPassVpnStatus;
	hostPeerInfo?: HostPeerInfo;
};

export const useScaleStore = defineStore('scale', {
	state: () => {
		return {
			authKey: undefined,
			scaleServer: '',
			vpnStatus: TermiPassVpnStatus.off
		} as DataState;
	},

	getters: {
		isOn(): boolean {
			return this.vpnStatus == TermiPassVpnStatus.on;
		},
		isConnecting(): boolean {
			return this.vpnStatus == TermiPassVpnStatus.connecting;
		},
		isDirect(): boolean {
			if (!this.isOn || !this.hostPeerInfo) {
				return false;
			}
			if (this.hostPeerInfo.Relay && !this.hostPeerInfo.CurAddr) {
				return false;
			} else if (this.hostPeerInfo.CurAddr) {
				return true;
			}
			return false;
		}
	},

	actions: {
		async init() {
			const userStore = useUserStore();
			if (!userStore.current_user) {
				this.instance = undefined;
				return;
			}
			this.owner = userStore.current_user.name;
			this.scaleServer = userStore.getModuleSever('headscale');
			const data = await this.getDecryptData(this.owner);
			this.instance = axiosInstanceProxy({
				baseURL: this.scaleServer,
				timeout: 10000,
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (data) {
				if (typeof data == 'string') {
					this.authKey = new PreAuthKey().fromJSON(data);
				} else {
					this.authKey = data;
				}
			}
		},
		async setEncryptData(key: string, value: any) {
			await getAppPlatform().userStorage.setItem(key, value);
		},

		async getDecryptData(key: string) {
			return await getAppPlatform().userStorage.getItem(key);
		},

		async clearAuthkey() {
			this.authKey = undefined;
			await getAppPlatform().userStorage.removeItem(this.owner);
		},

		async reLogin(): Promise<boolean> {
			const userStore = useUserStore();
			if (userStore.current_user?.name !== this.owner) {
				await this.init();
			}
			if (
				!this.authKey ||
				utcToDate(this.authKey.expiration).getTime() <= new Date().getTime()
			) {
				try {
					const data = await app.getPreAuthKey(
						userStore.current_user!.access_token
					);
					if (!data) {
						throw Error('get preauthKey error');
					}
					this.authKey = data;
					await this.setEncryptData(this.owner, data.toJSON());
				} catch (e) {
					console.error('get preauthKey error', e);
				}
			}

			return (
				!!this.authKey &&
				utcToDate(this.authKey.expiration).getTime() > new Date().getTime() &&
				!!this.scaleServer
			);
		},
		async start() {
			const termipassStore = useTermipassStore();
			if (!termipassStore.notifyUserCannotCorrespondMethod()) {
				this.vpnStatus = TermiPassVpnStatus.off;
				return;
			}
			if (await this.reLogin()) {
				if (!this.authKey) {
					this.vpnStatus = TermiPassVpnStatus.off;
					return;
				}
				const platform = getAppPlatform();
				if (instanceOfConfigVPNInterface(platform)) {
					const userStore = useUserStore();
					(platform as any as ConfigVPNInterface).vpnOpen({
						authKey: this.authKey.key,
						server: userStore.getModuleSever(
							'headscale',
							undefined,
							undefined,
							false
						)
					});
					this.vpnStatus = TermiPassVpnStatus.connecting;

					setTimeout(() => {
						if (this.vpnStatus == TermiPassVpnStatus.connecting) {
							this.vpnStatus = TermiPassVpnStatus.Invalid;
							this.reset();
						}
					}, 30000);
				}
			} else {
				notifyFailed('');
				this.vpnStatus = TermiPassVpnStatus.off;
			}
		},
		async stop() {
			const platform = getAppPlatform();
			if (instanceOfConfigVPNInterface(platform)) {
				if (this.isOn || this.isConnecting) {
					await (platform as any as ConfigVPNInterface).vpnStop();
				}
				this.vpnStatus = TermiPassVpnStatus.off;
			}
		},
		reset() {
			if (this.owner) {
				this.stop();
				this.clearAuthkey();
				this.owner = '';
				this.scaleServer = '';
			}
		},
		async configHostPeerInfo() {
			const platform = getAppPlatform();
			if (!instanceOfConfigVPNInterface(platform)) {
				return undefined;
			}
			this.hostPeerInfo = await (
				platform as any as ConfigVPNInterface
			).hostPeerInfo();

			console.log('hostPeerInfo ===>', this.hostPeerInfo);
			return this.hostPeerInfo;
		}
	}
});
