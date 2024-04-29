import { ElectronPlatform } from '../electronPlatform';
import {
	ConfigVPNInterface,
	HostPeerInfo,
	TermiPassVpnStatus
} from '../../terminusCommon/terminusCommonInterface';
import { useScaleStore } from '../../../stores/scale';
import { NetworkUpdateMode, busEmit } from 'src/utils/bus';

export class MacPlatform
	extends ElectronPlatform
	implements ConfigVPNInterface
{
	vpnDiscriminator = 'ConfigVPNInterface';

	async appLoadPrepare(data: any): Promise<void> {
		super.appLoadPrepare(data);
		const scaleStore = useScaleStore();

		if (this.quasar?.platform.is.electron) {
			window.electron.api.vpn.listenerVpnStatusUpdate(async () => {
				console.log('window receive vpn status update');
				const status = await window.electron.api.vpn.statusVpn();
				if (!scaleStore.isOn && status == TermiPassVpnStatus.on) {
					setTimeout(() => {
						busEmit('network_update', NetworkUpdateMode.vpnStart);
					}, 10000);
					busEmit('device_update');
				}
				scaleStore.vpnStatus = status;
			});
		}
		if (this.quasar?.platform.is.electron) {
			scaleStore.vpnStatus = await window.electron.api.vpn.statusVpn();
		}
	}

	async getTailscaleId() {
		return await this.currentNodeId();
	}

	/****** ConfigVPNInterface start****/

	async vpnOpen(options: { authKey: string; server: string }): Promise<void> {
		window.electron.api.vpn.openVpn(options);
	}

	async vpnStop(): Promise<void> {
		window.electron.api.vpn.closeVpn();
		setTimeout(() => {
			busEmit('network_update', NetworkUpdateMode.vpnStop);
			busEmit('device_update');
		}, 5000);
	}

	async currentNodeId() {
		if (!window.electron) {
			return '';
		}
		const nodeId = await window.electron.api.vpn.currentNodeId();

		return nodeId;
	}

	async hostPeerInfo() {
		const peersInfoJsonString = await window.electron.api.vpn.peersState();
		console.log('peersInfoJsonString ===>', peersInfoJsonString);
		let result: HostPeerInfo | undefined;
		try {
			const { Peer } = JSON.parse(peersInfoJsonString);
			Object.keys(Peer).forEach((key) => {
				if (Peer[key].PrimaryRoutes != undefined) {
					result = Peer[key];
					return;
				}
			});
		} catch (error) {
			console.log(error);
		}
		return result;
	}
}
