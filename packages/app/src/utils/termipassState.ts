import { TerminusInfo } from '@bytetrade/core';
import { ErrorCode, UserItem } from '@didvault/sdk/src/core';
// import axios from 'axios';
import { app, getSenderUrl, setSenderUrl } from 'src/globals';
import { useUserStore } from 'src/stores/user';
import {
	NetworkUpdateMode,
	NetworkErrorMode,
	busOn,
	networkErrorModeString,
	busEmit
} from './bus';
import { useDeviceStore } from 'src/stores/device';
import { useScaleStore } from 'src/stores/scale';
import { useTermipassStore } from 'src/stores/termipass';
import { BuildTransition, StateMachine } from './stateMachine';
// import { UserStatusActive } from './checkTerminusState';
import { axiosInstanceProxy } from 'src/platform/httpProxy';

export enum TermiPassStatus {
	INIT = 0,
	OfflineMode = 1,
	Offline,
	VPNConnecting,
	NetworkOffline,
	RequiresVpn,
	Reactivation,
	TokenInvalid,
	VaultTokenInvalid,
	P2P,
	DERP,
	Intranet,
	Internet
}

enum TermipassActionStatus {
	None = 0,
	UserSetupFinished,
	TerminusPinged,
	SrpChecking,
	SrpInvalid,
	SrpValid,
	TokenRefreshed,
	Completed
}

export interface TermiPassStateInterface {
	status: TermiPassStatus;
}

type TermiPassStateCacheInfo = 'termimusInfo' | 'vpnStateInfo';

type TermiPassCheckItem = 'termimusInfo' | 'srpToken' | 'refreshToken';

interface CacheInfo<T> {
	cacheDate?: Date;
	info: T;
}
// termipassStore.srpInvalid = false;
// 				termipassStore.ssoInvalid = false;
interface CheckHistoryResult {
	before?:
		| {
				reactivation: boolean;
				srpInvalid: boolean;
				ssoInvalid: boolean;
		  }
		| {
				access_token: string;
				refresh_token: string;
				session_id: string;
		  };
	after?:
		| {
				reactivation: boolean;
				srpInvalid: boolean;
				ssoInvalid: boolean;
		  }
		| {
				access_token: string;
				refresh_token: string;
				session_id: string;
		  };
	description: string;
}

type CheckLogHistoryType = 'reason' | 'check';

interface CheckLogHistoryInterface {
	type: CheckLogHistoryType;
	date: Date;
	result?: CheckHistoryResult;
	checkItem?: TermiPassCheckItem;
	reasonDesc?: string;
}

const GetVPNHostPeerInfoCountMax = 6;

const CheckTerminusInfoTimeInterval = 60 * 2;

const CheckVPNStatusInfoTimeInterval = 30;

const UserCheckHistoryMaxLength = 100;

export class TermiPassState {
	private getVPNHostPeerInfoTimer: NodeJS.Timer | undefined;

	private tokenRefresh = false;

	private tokenRefreshIng = false;

	private terminusInfoRefresh = false;

	private terminusInfoRefreshIng = false;

	private currentUser: UserItem;

	private termiPassStateUserLastCheckCacheInfo: Record<
		string,
		Record<
			TermiPassStateCacheInfo,
			CacheInfo<TermiPassStateCacheInfo> | undefined
		>
	> = {};

	private termiPassStateCheckHistory: Record<
		string,
		CheckLogHistoryInterface[]
	> = {};

	private srpTokenCheck = false;

	private srpTokenChecking = false;

	private appIsActive = true;

	private getVPNHostPeerInfoCount = 0;

	private lastErrorCheckNetworkTimer = 0;

	private checkEnable = false;

	private terminusCheckingRunLoopTimer: NodeJS.Timer | undefined;

	private termipassActionStatusOptions = {
		init: TermipassActionStatus.None,
		transitions: {
			step: [],
			reset: BuildTransition('*', TermipassActionStatus.None, async () => {
				// console.log(from, to);
			}),
			goto: BuildTransition<TermipassActionStatus>(
				'*',
				(state) => state,
				async (_from, to) => {
					if (to == TermipassActionStatus.SrpValid) {
						setTimeout(() => {
							this.stateMachine
								.transition()
								.goto(TermipassActionStatus.Completed);
						}, 100);
					}
				}
			)
		}
	};

	private stateMachine = new StateMachine(this.termipassActionStatusOptions);

	constructor() {
		busOn(
			'network_error',
			async (info: { type: NetworkErrorMode; error: any }) => {
				const now = new Date().getTime();
				if (now - this.lastErrorCheckNetworkTimer > 30 * 1000) {
					if (!this.needChecking()) {
						return;
					}
					this.lastErrorCheckNetworkTimer = now;
					if (this.currentUser) {
						this.addCheckHistory(this.currentUser.id, {
							date: new Date(),
							type: 'reason',
							reasonDesc:
								'network_error:' +
								' type =>' +
								networkErrorModeString(info.type) +
								' error:' +
								info.error
						});
					}

					this.srpTokenCheck = true;
				}
			}
		);

		busOn('account_update', async () => {
			await this.actions.init();
			this.resetTermipassState();
			if (!this.needChecking()) {
				return;
			}
			this.addCheckHistory(this.currentUser.id, {
				date: new Date(),
				type: 'reason',
				reasonDesc: 'account_update'
			});
			await this.actions.ping();
			this.srpTokenCheck = true;
		});

		busOn('network_update', async (mode: NetworkUpdateMode) => {
			if (!this.needChecking()) {
				return;
			}
			this.getVPNHostPeerInfoCount = 0;

			this.actions.getVPNHostPeerInfo();
			const userStore = useUserStore();
			if (
				mode == NetworkUpdateMode.update ||
				(userStore.current_user?.isLocal &&
					mode == NetworkUpdateMode.vpnStop) ||
				(!userStore.current_user?.isLocal && mode == NetworkUpdateMode.vpnStart)
			) {
				await this.actions.init();
				this.addCheckHistory(this.currentUser.id, {
					date: new Date(),
					type: 'reason',
					reasonDesc: 'network_update:'
				});
				await this.actions.ping();
				this.srpTokenCheck = true;
			}
		});

		busOn('appStateChange', async (state: { isActive: boolean }) => {
			this.appIsActive = state.isActive;
			if (!this.needChecking()) {
				return;
			}
			this.addCheckHistory(this.currentUser.id, {
				date: new Date(),
				type: 'reason',
				reasonDesc: 'appStateChange:' + state.isActive
			});
			await this.actions.init();
			this.srpTokenCheck = true;
		});

		this.resetCheckIntervalStatus();
	}

	publicActions = {
		startTerminusInfoRefresh: () => {
			this.terminusInfoRefresh = true;
		},
		startTokenRefresh: () => {
			this.tokenRefresh = true;
		},
		resetCheckEnable: (checkEnable: boolean) => {
			this.checkEnable = checkEnable;
		},
		startSrpTokenCheck: () => {
			this.srpTokenCheck = true;
		},
		getCheckHistory: () => {
			return this.termiPassStateCheckHistory[this.currentUser.id];
		}
	};

	private actions = {
		init: async () => {
			const userStore = useUserStore();
			const user = userStore.current_user;

			this.stateMachine.transition().reset();
			if (!user || !user.setup_finished) {
				return;
			}
			this.currentUser = user;
			this.stateMachine
				.transition()
				.goto(TermipassActionStatus.UserSetupFinished);
		},
		ping: async () => {
			if (this.stateMachine.state() < TermipassActionStatus.UserSetupFinished) {
				return;
			}
			const isLocal = await this.actions.getTerminusInfo(false, true);
			this.currentUser!.isLocal = isLocal != undefined;
			this.actions.resetSenderUrl();
			this.stateMachine.transition().goto(TermipassActionStatus.TerminusPinged);
		},
		resetSenderUrl: async () => {
			if (this.stateMachine.state() < TermipassActionStatus.UserSetupFinished) {
				return;
			}
			if (getSenderUrl() != this.currentUser!.vault_url) {
				setSenderUrl({
					url: this.currentUser!.vault_url
				});
			}
		},
		checkSRPValid: async () => {
			if (this.tokenRefreshIng) {
				return;
			}

			if (this.stateMachine.state() == TermipassActionStatus.SrpChecking) {
				return;
			}

			if (this.srpTokenChecking) {
				return;
			}

			this.srpTokenChecking = true;

			this.srpTokenCheck = false;
			const termipassStore = useTermipassStore();

			const checkResult: CheckHistoryResult = {
				before: {
					reactivation: termipassStore.reactivation,
					ssoInvalid: termipassStore.ssoInvalid,
					srpInvalid: termipassStore.srpInvalid
				},
				description: ''
			};

			if (termipassStore.reactivation) {
				await this.actions.getTerminusInfo(true, false);
				if (termipassStore.reactivation) {
					checkResult.after = {
						reactivation: termipassStore.reactivation,
						ssoInvalid: termipassStore.ssoInvalid,
						srpInvalid: termipassStore.srpInvalid
					};
					checkResult.description = 'No need to check again app.simpleSync';
					this.addCheckHistory(this.currentUser.id, {
						type: 'check',
						date: new Date(),
						result: checkResult,
						checkItem: 'srpToken'
					});
					this.srpTokenChecking = false;
					return;
				}
			}

			this.stateMachine.transition().goto(TermipassActionStatus.SrpChecking);

			const result = await app.simpleSync();
			if (result) {
				checkResult.description = result;
				this.stateMachine.transition().goto(TermipassActionStatus.SrpInvalid);
				if (result == ErrorCode.INVALID_SESSION) {
					termipassStore.srpInvalid = true;
					termipassStore.ssoInvalid = false;
				} else {
					if (result == ErrorCode.TOKE_INVILID) {
						// 400
						const terminusInfo = await this.actions.getTerminusInfo(false);
						if (
							terminusInfo &&
							terminusInfo.terminusId == this.currentUser!.terminus_id
						) {
							termipassStore.ssoInvalid = true;
							termipassStore.srpInvalid = false;
						} else {
							termipassStore.srpInvalid = true;
							termipassStore.ssoInvalid = false;
						}
					} else {
						//525
						if (result == ErrorCode.SERVER_NOT_EXIST) {
							termipassStore.reactivation = true;
							termipassStore.srpInvalid = false;
							termipassStore.ssoInvalid = false;
							await this.actions.getTerminusInfo(false);
						} else if (result == ErrorCode.SERVER_ERROR) {
							if (this.currentUser.isLocal) {
								await this.actions.ping();
							}
							if (!this.currentUser.isLocal) {
								await this.actions.getTerminusInfo(false);
							}
						}
					}
				}
			} else {
				termipassStore.srpInvalid = false;
				termipassStore.ssoInvalid = false;
				this.stateMachine.transition().goto(TermipassActionStatus.SrpValid);
			}

			checkResult.after = {
				reactivation: termipassStore.reactivation,
				ssoInvalid: termipassStore.ssoInvalid,
				srpInvalid: termipassStore.srpInvalid
			};

			this.addCheckHistory(this.currentUser.id, {
				type: 'check',
				date: new Date(),
				result: checkResult,
				checkItem: 'srpToken'
			});
			this.srpTokenChecking = false;
		},
		getTerminusInfo: async (addHistory = false, isPing = false) => {
			if (this.stateMachine.state() < TermipassActionStatus.UserSetupFinished) {
				return;
			}
			const userStore = useUserStore();

			if (this.terminusInfoRefreshIng) {
				return;
			}

			this.terminusInfoRefreshIng = true;

			const termipassStore = useTermipassStore();

			const checkUserId = this.currentUser.id;

			const checkResult: CheckHistoryResult = {
				before: {
					reactivation: termipassStore.reactivation,
					ssoInvalid: termipassStore.ssoInvalid,
					srpInvalid: termipassStore.srpInvalid
				},
				description: ''
			};

			try {
				const baseUrl = isPing
					? userStore.pingTerminusInfo
					: this.currentUser.terminus_url;

				const instance = axiosInstanceProxy({
					baseURL: baseUrl,
					headers: {
						'Content-Type': 'application/json'
					}
				});
				const data = await instance.get(baseUrl + '/api/terminus-info', {});
				const terminusInfo: TerminusInfo = data.data.data;

				termipassStore.reactivation = false;
				userStore.setUserTerminusInfo(this.currentUser.id, terminusInfo);
				this.currentUser.tailscale_activated = terminusInfo.tailScaleEnable;
				if (terminusInfo.tailScaleEnable) {
					this.currentUser.isLocal = true;
					this.actions.resetSenderUrl();
				}
				checkResult.description = JSON.stringify(terminusInfo);
				return terminusInfo;
			} catch (e) {
				const termipassStore = useTermipassStore();
				checkResult.description = e.message;
				if (!isPing && (e.response || process.env.PLATFORM == 'BEX')) {
					if (
						process.env.PLATFORM == 'BEX' ||
						e.response.status == 525 ||
						e.response.status == 522 ||
						e.response.status == 530 ||
						e.response.status > 1000
					) {
						if (this.currentUser.tailscale_activated) {
							const scaleStore = useScaleStore();
							if (!scaleStore.isOn) {
								termipassStore.reactivation = false;
								termipassStore.srpInvalid = false;
								termipassStore.ssoInvalid = false;
								return;
							}
						}
						termipassStore.reactivation = true;
					}
				}
			} finally {
				this.terminusInfoRefreshIng = false;
				this.setTermiPassStateUserLastCheckCacheInfo(
					checkUserId,
					'termimusInfo',
					{
						cacheDate: new Date(),
						info: 'termimusInfo'
					}
				);

				if (addHistory) {
					checkResult.after = {
						reactivation: termipassStore.reactivation,
						ssoInvalid: termipassStore.ssoInvalid,
						srpInvalid: termipassStore.srpInvalid
					};
					this.addCheckHistory(this.currentUser.id, {
						type: 'check',
						date: new Date(),
						result: checkResult,
						checkItem: 'termimusInfo'
					});
				}
			}
		},
		getVPNHostPeerInfo: async () => {
			const scaleStore = useScaleStore();
			if (!scaleStore.isOn) {
				scaleStore.hostPeerInfo = undefined;
				this.getVPNHostPeerInfoTimer = undefined;
				return;
			}
			if (this.getVPNHostPeerInfoTimer) {
				return;
			}
			await scaleStore.configHostPeerInfo();
			this.getVPNHostPeerInfoTimer = setTimeout(() => {
				this.getVPNHostPeerInfoTimer = undefined;
				this.getVPNHostPeerInfoCount += 1;
				if (this.getVPNHostPeerInfoCount < GetVPNHostPeerInfoCountMax) {
					this.actions.getVPNHostPeerInfo();
				}
			}, 10 * 1000);
		},
		refreshCurrentToken: async () => {
			const userStore = useUserStore();
			if (this.tokenRefreshIng) {
				return;
			}
			this.tokenRefreshIng = true;
			const result = await userStore.currentUserRefreshToken();
			this.stateMachine.transition().goto(TermipassActionStatus.TokenRefreshed);
			this.tokenRefreshIng = false;

			this.addCheckHistory(this.currentUser.id, {
				type: 'check',
				date: new Date(),
				result: {
					before: result.oldToken,
					after: result.newToken,
					description:
						'status:' + result.status + ' ' + 'message:' + result.message
				},
				checkItem: 'refreshToken'
			});
		},
		checkVPNStatusTask: async () => {
			const scaleStore = useScaleStore();
			if (!scaleStore.isOn) {
				return;
			}
			if (!this.currentUser.id) {
				return;
			}
			const date = new Date();
			const cacheVPNCheckInfo = this.getTermiPassStateUserLastCheckCacheInfo(
				this.currentUser.id,
				'vpnStateInfo'
			);
			if (
				cacheVPNCheckInfo == undefined ||
				!cacheVPNCheckInfo.cacheDate ||
				cacheVPNCheckInfo.cacheDate.getTime() / 1000 +
					CheckVPNStatusInfoTimeInterval <
					date.getTime() / 1000
			) {
				await this.actions.getVPNHostPeerInfo();
				this.setTermiPassStateUserLastCheckCacheInfo(
					this.currentUser.id,
					'vpnStateInfo',
					{
						cacheDate: date,
						info: 'vpnStateInfo'
					}
				);
			}
		},
		runloopTasks: async (ms: number) => {
			this.actions.checkVPNStatusTask();
			busEmit('runTask', ms);
		}
	};

	private needChecking() {
		const userStore = useUserStore();
		const deviceStore = useDeviceStore();
		return (
			userStore.current_user?.offline_mode == false &&
			deviceStore.networkOnLine &&
			userStore.current_user?.setup_finished == true &&
			this.appIsActive
		);
	}

	private resetTermipassState() {
		const termipassStore = useTermipassStore();
		termipassStore.srpInvalid = false;
		termipassStore.ssoInvalid = false;
		termipassStore.reactivation = false;
	}

	private getTermiPassStateUserLastCheckCacheInfo(
		userId: string,
		type: TermiPassStateCacheInfo
	) {
		try {
			if (!this.termiPassStateUserLastCheckCacheInfo[userId]) {
				this.termiPassStateUserLastCheckCacheInfo[userId] = {
					termimusInfo: {
						cacheDate: new Date(),
						info: 'termimusInfo'
					},
					vpnStateInfo: {
						cacheDate: undefined,
						info: 'termimusInfo'
					}
				};
			}
			return this.termiPassStateUserLastCheckCacheInfo[userId][type];
		} catch (error) {
			return undefined;
		}
	}

	private setTermiPassStateUserLastCheckCacheInfo(
		userId: string,
		type: TermiPassStateCacheInfo,
		cache?: CacheInfo<TermiPassStateCacheInfo>
	) {
		this.termiPassStateUserLastCheckCacheInfo[userId][type] = cache;
	}

	private addCheckHistory(userid: string, history: CheckLogHistoryInterface) {
		if (!this.termiPassStateCheckHistory[userid]) {
			this.termiPassStateCheckHistory[userid] = [];
		}
		if (
			UserCheckHistoryMaxLength > 0 &&
			this.termiPassStateCheckHistory[userid].length >=
				UserCheckHistoryMaxLength
		) {
			this.termiPassStateCheckHistory[userid].splice(
				UserCheckHistoryMaxLength - 1,
				this.termiPassStateCheckHistory[userid].length -
					UserCheckHistoryMaxLength +
					1
			);
		}
		this.termiPassStateCheckHistory[userid] = [
			history,
			...this.termiPassStateCheckHistory[userid]
		];
	}

	private resetCheckIntervalStatus() {
		if (this.terminusCheckingRunLoopTimer) {
			return;
		}
		const ms = 1000;
		this.terminusCheckingRunLoopTimer = setInterval(() => {
			this.actions.runloopTasks(ms);
			if (!this.checkEnable || !this.needChecking()) {
				return;
			}

			if (this.tokenRefresh) {
				this.tokenRefresh = false;
				this.actions.refreshCurrentToken();
			}

			if (this.srpTokenCheck) {
				this.actions.checkSRPValid();
			} else {
				const date = new Date();

				if (!this.currentUser) {
					return;
				}
				const cacheTerminusInfo = this.getTermiPassStateUserLastCheckCacheInfo(
					this.currentUser.id,
					'termimusInfo'
				);
				if (
					this.terminusInfoRefresh ||
					cacheTerminusInfo == undefined ||
					(cacheTerminusInfo !== undefined &&
						cacheTerminusInfo.cacheDate &&
						cacheTerminusInfo.cacheDate.getTime() / 1000 +
							CheckTerminusInfoTimeInterval <
							date.getTime() / 1000)
				) {
					this.terminusInfoRefresh = false;
					this.actions.getTerminusInfo(true);
					return;
				}
			}
		}, 1000);
	}
}
