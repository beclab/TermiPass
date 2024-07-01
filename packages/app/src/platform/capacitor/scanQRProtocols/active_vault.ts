// import { notifyFailed } from 'src/utils/notifyRedefinedUtil';
import {
	NativeScanQRProtocol,
	// commonGetRealQRConent,
	commonResponseQRContent
} from './index';
import { i18n } from 'src/boot/i18n';
// import { useUserStore } from 'src/stores/user';
import { getCapacitorPlatform } from '../capacitorPlatform';
// import { useUserStore } from 'src/stores/user';
import TerminusScanQRCodeReminderDialog from '../../../components/dialog/TerminusScanQRCodeReminderDialog.vue';
// import { base64ToString, UserItem } from '@didvault/sdk/src/core';
// import { WizardInfo } from 'src/pages/Mobile/connect/activate/wizard';
// import { userBindTerminus } from '../../../utils/BindTerminusBusiness';

export const active_vault: NativeScanQRProtocol = {
	protocol: 'active_vault',
	method: async () => {
		return true;
		// if (result.startsWith('http')) {
		// 	notifyFailed(i18n.global.t('qr_code_error'));
		// 	return false;
		// }
		// if (result.startsWith('https://file.bttcdn.com')) {
		// 	notifyFailed(i18n.global.t('qr_code_error'));
		// 	return false;
		// }
		// const userStore = useUserStore();
		// if (!userStore.current_id) {
		// 	notifyFailed(i18n.global.t('please_choose_user'));
		// 	return false;
		// }
		// const content = commonGetRealQRConent(result);
		// try {
		// 	getCapacitorPlatform().hookServerHttp = false;
		// 	const obj: WizardInfo = JSON.parse(base64ToString(content));
		// 	if (obj.username?.split('@').length != 2) {
		// 		notifyFailed(
		// 			i18n.global.t('errors.username_is_error_please_retry_scan', {
		// 				username: userStore.current_user?.name
		// 			})
		// 		);
		// 		return false;
		// 	}
		// 	if (obj.username !== userStore.current_user?.name) {
		// 		notifyFailed(
		// 			i18n.global.t('errors.username_is_error_please_retry_scan', {
		// 				username: userStore.current_user?.name
		// 			})
		// 		);
		// 		return false;
		// 	}
		// 	getCapacitorPlatform().quasar?.loading.show();
		// 	const user = userStore.users!.items.get(userStore.current_id!)!;
		// 	if (user?.access_token) {
		// 		user.access_token = '';
		// 	}
		// 	return new Promise(async (resolve, reject) => {
		// 		await userBindTerminus(user, obj.url, obj.password!, {
		// 			async onSuccess() {
		// 				const new_user: UserItem = userStore.users!.items.get(
		// 					userStore.current_id!
		// 				)!;
		// 				new_user.wizard = JSON.stringify(obj);
		// 				new_user.terminus_activate_status = 'wait_activate_system';
		// 				new_user.setup_finished = false;
		// 				userStore.users!.items.update(new_user);
		// 				await userStore.save();
		// 				resolve(true);
		// 			},
		// 			onFailure(message: string) {
		// 				getCapacitorPlatform().hookServerHttp = true;
		// 				getCapacitorPlatform().quasar?.loading.hide();
		// 				notifyFailed(message);
		// 				reject(false);
		// 			}
		// 		});
		// 		resolve(false);
		// 	});
		// } catch (error) {
		// 	getCapacitorPlatform().quasar?.loading.hide();
		// 	notifyFailed(error.message);
		// 	return false;
		// }
		// return false;
	},
	canResponseQRContent: async (result) => {
		return commonResponseQRContent(result, 'active_vault');
	},
	success: async () => {
		// const userStore = useUserStore();
		// if (userStore.current_user?.access_token) {
		// 	userStore.current_user.access_token = '';
		// }
		// if (userStore.current_user?.setup_finished) {
		// 	return;
		// }
		// let path = '/scan';
		// if (
		// 	process.env.IS_PC_TEST ||
		// 	!getCapacitorPlatform().quasar?.platform.is.nativeMobile
		// ) {
		// 	path = '/scan_local';
		// }
		// setTimeout(() => {
		// 	getCapacitorPlatform().router?.push({ path });
		// }, 100);

		setTimeout(() => {
			getCapacitorPlatform().quasar?.dialog({
				component: TerminusScanQRCodeReminderDialog,
				componentProps: {
					title: i18n.global.t('tips'),
					message:
						'The behavior of activating users is not supported here. \
					Please scan the QR code as shown in the figure below to activate this user.',
					btnTitle: i18n.global.t('ok')
				}
			});
		}, 100);
	}
};
