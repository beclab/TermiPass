import { UserItem, ErrorCode } from '@didvault/sdk/src/core';
import { useUserStore } from '../stores/user';
import { getSenderUrl, setSenderUrl, app } from '../globals';
import axios from 'axios';
import { useScaleStore } from 'src/stores/scale';
import { initPing } from '@bytetrade/core';
import { TerminusInfo } from '@bytetrade/core';
import { i18n } from '../boot/i18n';

export enum UserStatus {
	Intranet = 1,
	Internet,
	VPNConnecting,
	OfflineMode,
	Offline,
	RequiresVpn,
	TokenInvalid,
	VaultTokenInvalid,
	Reactivation
}

export const InOfflineMode = i18n.global.t('in_offline_mode');
export const InOfflineModeCode = UserStatus.OfflineMode;

export enum UserStatusActive {
	normal,
	active,
	error
}

export interface UserStatusInfo {
	status: UserStatus;
	isError: UserStatusActive;
	icon: string;
	title: string;
	description?: string;
	descriptionEx?: string;
}

export enum ConnectActionType {
	Passed = 1,
	Connect = 2,
	Offline = 3,
	ReLogin = 4,
	ReActivate = 5,
	ReConnect = 6,
	OpenTailScale = 7,
	Activate = 8
}

export interface PingResult {
	pinged: boolean;
	passed: boolean;
}

export async function getTerminusInfo(
	user: UserItem
): Promise<TerminusInfo | null> {
	try {
		const data: TerminusInfo = await axios.get(
			user.terminus_url + '/api/terminus-info',
			{
				timeout: 5000
			}
		);
		return data;
	} catch (e) {
		console.error(e);
		return null;
	}
}

async function checkSRPValid(user: UserItem): Promise<number> {
	if (!user.setup_finished) {
		return -2;
	}

	const result = await app.simpleSync();
	if (result == undefined) {
		return 1;
	}

	if (result == ErrorCode.INVALID_SESSION) {
		return 0;
	}

	return -1;
}

export async function checkTerminusState(): Promise<ConnectActionType[]> {
	const userStore = useUserStore();
	const scaleStore = useScaleStore();

	const user = userStore.current_user;
	if (!user) {
		throw new Error('user is null');
	}
	// const isLocal = await initPing(
	// 	'',
	// 	3000,
	// 	'https://healthz.local.' + user.name.replace('@', '.') + '/ping'
	// );
	// user.isLocal = isLocal;

	// if (getSenderUrl() != user.vault_url) {
	// 	setSenderUrl({
	// 		url: user.vault_url
	// 	});
	// }

	const pingResult = await getTerminusInfo(user);
	if (pingResult) {
		userStore.setUserTerminusInfo(user.id, pingResult);
		user.tailscale_activated = pingResult.tailScaleEnable;
		if (pingResult.tailScaleEnable) {
			user.isLocal = true;
			resetSenderUrl();
		}
		if (user.setup_finished) {
			if (user.tailscale_activated) {
				if (!scaleStore.isOn) {
					return [ConnectActionType.OpenTailScale];
				}
			}
			const srpValid = await checkSRPValid(user);
			if (srpValid > 0) {
				return [ConnectActionType.Passed];
			} else {
				if (srpValid == 0) {
					return [
						ConnectActionType.ReConnect,
						ConnectActionType.Offline,
						ConnectActionType.ReActivate
					];
				}
				if (user.terminus_id != pingResult.terminusId) {
					return [
						ConnectActionType.ReConnect,
						ConnectActionType.Offline,
						ConnectActionType.ReActivate
					];
				}
				return [
					ConnectActionType.ReLogin,
					ConnectActionType.Offline,
					ConnectActionType.ReConnect
				];
			}

			// const SSOValid = await checkSSO(user);
			// if (SSOValid) {
			// } else {
			// 	const srpValid = await checkSRPValid(user);
			// 	if (srpValid > 0) {
			// 		return [
			// 			ConnectActionType.ReLogin,
			// 			ConnectActionType.Offline,
			// 			ConnectActionType.ReActivate
			// 		];
			// 	}
			// 	if (srpValid == 0) {
			// 		return [
			// 			ConnectActionType.ReConnect,
			// 			ConnectActionType.Offline,
			// 			ConnectActionType.ReActivate
			// 		];
			// 	}
			// 	return [
			// 		ConnectActionType.ReLogin,
			// 		ConnectActionType.ReConnect,
			// 		ConnectActionType.ReActivate
			// 	];
			// }
		} else {
			return [ConnectActionType.Connect];
		}
	} else {
		if (user.setup_finished) {
			if (user.tailscale_activated) {
				if (!scaleStore.isOn) {
					return [ConnectActionType.OpenTailScale];
				}
			}
			return [
				ConnectActionType.ReActivate,
				//ConnectActionType.ReConnect,
				ConnectActionType.Offline
			];
		} else {
			return [ConnectActionType.Activate];
		}
	}
}

const resetSenderUrl = () => {
	const userStore = useUserStore();

	const user = userStore.current_user;
	if (!user) {
		throw new Error('user is null');
	}

	if (getSenderUrl() != user.vault_url) {
		setSenderUrl({
			url: user.vault_url
		});
	}
};

export const checkInitPing = async (): Promise<void> => {
	const userStore = useUserStore();

	const user = userStore.current_user;
	if (!user) {
		throw new Error('user is null');
	}

	const isLocal = await initPing(
		'',
		3000,
		'https://healthz.local.' + user.name.replace('@', '.') + '/ping'
	);

	user.isLocal = isLocal;

	resetSenderUrl();
};
