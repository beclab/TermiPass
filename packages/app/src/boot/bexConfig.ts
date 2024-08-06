import { boot } from 'quasar/wrappers';
import { app } from '../globals';
import { useUserStore } from '../stores/user';
import {
	setPlatform,
	base64ToString,
	bytesToBase64
} from '@didvault/sdk/src/core';
import { ExtensionPlatform } from '../platform/bex/front/platform';
import { busOn, busEmit } from '../utils/bus';
import {
	portMessageListenerBroadcast,
	portMessageRequestBroadcast,
	setBexController
} from '../extension/front/portMessageAction';
import { useBexStore } from '../stores/bex';
import { sendUnlock } from 'src/utils/bexFront';
import { unlockByPwd } from 'src/pages/Mobile/login/unlock/UnlockBusiness';
export default boot(async () => {
	setPlatform(new ExtensionPlatform());

	setBexController();

	const userStore = useUserStore();
	const bexStore = useBexStore();
	await userStore.load();

	portMessageListenerBroadcast((data) => {
		console.log('data ===>');
		console.log(data);

		busEmit(data.method, data.params);
	});

	busOn('BROADCAST_TO_BACKGROUND', (data) => {
		portMessageRequestBroadcast(data);
	});

	busOn('appSubscribe', async () => {
		console.log('front sendAppState');

		await bexStore.controller.sendAppState(
			bytesToBase64(app.state.toBytes()),
			userStore.users ? bytesToBase64(userStore.users!.items.toBytes()) : '',
			userStore.users
				? bytesToBase64(userStore.users!.mnemonics.toBytes())
				: '',
			userStore.current_id ? userStore.current_id : ''
		);
	});

	if (app.state.locked) {
		const password = await bexStore.controller.requestPassword();
		if (password) {
			// await userStore.users?.unlock(base64ToString(password));
			// userStore.password = base64ToString(password);
			const passwordStr = base64ToString(password);
			console.log('password', passwordStr);

			await unlockByPwd(passwordStr, {
				async onSuccess(data: any) {
					console.log('success ===>', data);

					sendUnlock();
				},
				onFailure(message: string) {
					console.log(message);
				}
			});
			sendUnlock();
		}
	}
});
