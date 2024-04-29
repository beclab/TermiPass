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
		console.log('--> win appMounted');

		window.onmessage = (event) => {
			if (event.source === window && event.data === 'main-world-port') {
				const [port] = event.ports;
				this.myport = port;

				port.onmessage = (event) => {
					console.log('renderer received:', event.data);
					const messagetype = event.data.messagetype;
					console.log(messagetype);

					if (messagetype == 'watchipn-resp') {
						const obj = JSON.parse(event.data.resp);
						console.log(obj.State);
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
						console.log(obj);
						console.log(obj.Config.NodeID);
						this.resp.push(obj.Config.NodeID);
						console.log('resppppppppppppppppppppppppppppppppppp-prefs');
					} else if (messagetype == 'status-resp') {
						const obj = JSON.parse(event.data.resp);
						console.log(obj);
						this.respMap.get('status')?.push(obj);
						console.log('resppppppppppppppppppppppppppppppppppp-status');
					} else if (messagetype == 'netcheck-resp') {
						const obj = JSON.parse(event.data.resp);
						console.log(obj);
						this.respMap.get('netcheck')?.push(obj);
						console.log('resppppppppppppppppppppppppppppppppppp-netcheck');
					}
				};
				console.log('post initial true');
				port.postMessage({ messagetype: 'watchipn', initial: true });
				setTimeout(() => {
					console.log('post initial false');
					port.postMessage({
						messagetype: 'watchipn',
						initial: false
					});
				}, 1000);

				// setTimeout(async () => {
				// 	console.log('test...................');
				// 	console.log(await this.getTailscaleNetcheck());
				// 	console.log('end....................');
				// }, 3000);
			}
		};
		const deviceStore = useDeviceStore();

		window.electron.api.settings.listenerNetworkUpdate(
			async (_event, value) => {
				console.log('receive listenerNetworkUpdate');
				console.log(value);
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
		console.log('get cookieeeeeeeeeeeee');
		const cookies = await window.winapi.getCookie();
		console.log(cookies);
		for (const cookie of cookies) {
			console.log(_options.server);
			console.log(cookie.domain);
			if (_options.server.endsWith(cookie.domain)) {
				console.log('get cookie：', cookie);
				const args = `${cookie.name}=${cookie.value}`;
				console.log(args);
				this.myport.postMessage({ messagetype: 'setcookie', args: args });
				break;
			}
		}
		console.log('upppppppppppppppppppppppp');
		const args = `up --login-server=${_options.server} --accept-routes=true --accept-dns=false --auth-key=${_options.authKey} --unattended --force-reauth=true --reset`;
		this.myport.postMessage({ messagetype: 'up', args: args });
	}

	async vpnStop(): Promise<void> {
		console.log('logouttttttttttttttttttttt');
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
			console.log('currentNodeId -> take a peek', i);
			await new Promise((resolve, reject) =>
				setTimeout(() => {
					console.log('resp:>', this.resp);
					console.log('length:', this.resp.length);
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
				(msg) => console.log(msg),
				(err) => console.log(err)
			);
			if (exit) {
				break;
			}
		}
		console.log('nodeIDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD', NodeID);
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
			console.log('status -> take a peek', i);
			await new Promise((resolve, reject) =>
				setTimeout(() => {
					console.log('resp:>', respStatus);
					console.log('length:', respStatus?.length);
					if (respStatus?.length != undefined && respStatus.length > 0) {
						const peer = respStatus?.pop().Peer;
						if (peer) {
							Object.keys(peer).forEach(function (key) {
								if (peer[key].PrimaryRoutes != undefined) {
									console.log(
										'CurAddr',
										peer[key].CurAddr,
										'Relay',
										peer[key].Relay
									);
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
				(msg) => console.log(msg),
				(err) => console.log(err)
			);
			if (exit) {
				break;
			}
		}
		console.log('statusssssssssssssssssssssssssss', status);
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
			console.log('netcheck -> take a peek', i);
			await new Promise((resolve, reject) =>
				setTimeout(() => {
					console.log('resp:>', this.resp);
					console.log('length:', this.resp.length);
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
				(msg) => console.log(msg),
				(err) => console.log(err)
			);
			if (exit) {
				break;
			}
		}
		console.log('netcheckkkkkkkkkkkkkkkkk', netcheck);
		return netcheck;
	}
}
