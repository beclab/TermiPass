import { ElectronPlatform } from '../electronPlatform';
import {
	ConfigVPNInterface,
	TermiPassVpnStatus,
	LocalVPNSDKStatus,
	HostPeerInfo
} from '../../terminusCommon/terminusCommonInterface';
import { useScaleStore } from '../../../stores/scale';
import { NetworkUpdateMode, busEmit } from 'src/utils/bus';
import { useDeviceStore } from '../../../stores/device';

export class WinPlatform
	extends ElectronPlatform
	implements ConfigVPNInterface
{
	vpnDiscriminator = 'ConfigVPNInterface';
	myport: any;
	resp: string[];
	respMap: Map<string, any[]> = new Map([
		['status', []],
		['prefs', []],
		['netcheck', []]
	]);

	async appMounted(): Promise<void> {
		const scaleStore = useScaleStore();
		window.onmessage = (event) => {
			if (event.source === window && event.data === 'main-world-port') {
				const [port] = event.ports;
				this.myport = port;

				port.onmessage = (event) => {
					const messagetype = event.data.messagetype;

					if (messagetype == 'watchipn-resp') {
						const obj = JSON.parse(event.data.resp);
						if (
							obj.State == LocalVPNSDKStatus.NoState ||
							obj.State == LocalVPNSDKStatus.InUseOtherUser ||
							obj.State == LocalVPNSDKStatus.NeedsLogin ||
							obj.State == LocalVPNSDKStatus.NeedsMachineAuth
						) {
							scaleStore.vpnStatus = TermiPassVpnStatus.Invalid;
						} else if (obj.State == LocalVPNSDKStatus.Stopped) {
							scaleStore.vpnStatus = TermiPassVpnStatus.off;
						} else if (obj.State == LocalVPNSDKStatus.Starting) {
							scaleStore.vpnStatus = TermiPassVpnStatus.connecting;
						} else if (obj.State == LocalVPNSDKStatus.Running) {
							scaleStore.vpnStatus = TermiPassVpnStatus.on;
							if (scaleStore.isOn) {
								setTimeout(() => {
									busEmit('network_update', NetworkUpdateMode.vpnStart);
								}, 10000);
								busEmit('device_update');
							}
						}
					} else if (messagetype == 'prefs-resp') {
						const obj = JSON.parse(event.data.resp);
						this.resp.push(obj.Config.NodeID);
					} else if (messagetype == 'status-resp') {
						const obj = JSON.parse(event.data.resp);
						this.respMap.get('status')?.push(obj);
					} else if (messagetype == 'netcheck-resp') {
						const obj = JSON.parse(event.data.resp);
						this.respMap.get('netcheck')?.push(obj);
					}
				};
				port.postMessage({ messagetype: 'watchipn', initial: true });
				setTimeout(() => {
					port.postMessage({
						messagetype: 'watchipn',
						initial: false
					});
				}, 1000);
			}
		};
		const deviceStore = useDeviceStore();

		window.electron.api.settings.listenerNetworkUpdate(
			async (_event, value) => {
				if (value.length > 0) {
					deviceStore.networkOnLine = value[0];
					busEmit('network_update', NetworkUpdateMode.update);
				}
			}
		);
	}

	/****** ConfigVPNInterface start****/

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async vpnOpen(_options: { authKey: string; server: string }): Promise<void> {
		const cookies = await window.winapi.getCookie();
		for (const cookie of cookies) {
			if (_options.server.endsWith(cookie.domain)) {
				const args = `${cookie.name}=${cookie.value}`;
				this.myport.postMessage({ messagetype: 'setcookie', args: args });
				break;
			}
		}
		const args = `up --login-server=${_options.server} --accept-routes=true --accept-dns=false --auth-key=${_options.authKey} --unattended --force-reauth=true --reset --shields-up=true --timeout=90s`;
		this.myport.postMessage({ messagetype: 'up', args: args });
	}

	async vpnStop(): Promise<void> {
		this.myport.postMessage({ messagetype: 'logout' });
		setTimeout(() => {
			busEmit('network_update', NetworkUpdateMode.vpnStop);
		}, 5000);
	}

	async getTailscaleId() {
		return await this.currentNodeId();
	}

	async currentNodeId() {
		this.resp = [];
		this.myport.postMessage({ messagetype: 'prefs' });
		let NodeID = '-';
		let exit = false;
		for (let i = 0; i < 20; i++) {
			await new Promise((resolve, reject) =>
				setTimeout(() => {
					if (this.resp.length > 0) {
						const n = this.resp.pop();
						if (n) {
							NodeID = n;
							exit = true;
							resolve(NodeID);
							return;
						}
					}
					reject(NodeID);
				}, 50)
			).then(
				() => {},
				(err) => console.error(err)
			);
			if (exit) {
				break;
			}
		}
		return NodeID;
	}

	async getTailscaleStaus() {
		return await this.status();
	}

	async hostPeerInfo() {
		return await this.status();
	}

	async status() {
		this.respMap.set('status', []);
		const respStatus = this.respMap.get('status');
		this.myport.postMessage({ messagetype: 'status' });
		let status: HostPeerInfo | undefined;
		let exit = false;
		for (let i = 0; i < 20; i++) {
			await new Promise((resolve, reject) =>
				setTimeout(() => {
					if (respStatus?.length != undefined && respStatus.length > 0) {
						const peer = respStatus?.pop().Peer;
						if (peer) {
							Object.keys(peer).forEach(function (key) {
								if (peer[key].PrimaryRoutes != undefined) {
									status = peer[key];
									exit = true;
									resolve(status);
									return;
								}
							});
						}
					}
					reject(status);
				}, 50)
			).then(
				() => {},
				(err) => console.error(err)
			);
			if (exit) {
				break;
			}
		}
		return status;
	}

	async getTailscaleNetcheck() {
		return await this.netcheck();
	}

	async netcheck() {
		this.resp = [];
		this.myport.postMessage({ messagetype: 'netcheck' });
		let netcheck = '-';
		let exit = false;
		for (let i = 0; i < 20 * 5; i++) {
			await new Promise((resolve, reject) =>
				setTimeout(() => {
					if (this.resp.length > 0) {
						const n = this.resp.pop();
						if (n) {
							netcheck = n;
							exit = true;
							resolve(netcheck);
							return;
						}
					}
					reject(netcheck);
				}, 50)
			).then(
				() => {},
				(err) => console.error(err)
			);
			if (exit) {
				break;
			}
		}
		return netcheck;
	}
}
