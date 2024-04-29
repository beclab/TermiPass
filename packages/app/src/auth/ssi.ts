import { AuthClient } from '@didvault/sdk/src/core/auth';
import { AuthType } from '@didvault/sdk/src/core';
import { useUserStore } from '../stores/user';

export class SSIAuthClient implements AuthClient {
	supportsType(type: AuthType) {
		return type === AuthType.SSI;
	}

	async prepareRegistration(params: { challenge: string }) {
		console.log(params);
		// const userStore = useUserStore();
		// if (
		// 	!userStore.current_id ||
		// 	!userStore.current_user ||
		// 	!userStore.current_user_private_key
		// ) {
		// 	throw Error('prepareRegistration current_user_private_key is null');
		// }
		// const jws = await userStore.signJWS({
		// 	name: userStore.current_user.name,
		// 	did: userStore.current_id,
		// 	domain: userStore.current_user.url,
		// 	time: '' + new Date().getTime(),
		// 	challenge: params.challenge
		// });
		// if (!jws) {
		// 	console.error('jws is null');
		// 	throw Error('jws is null');
		// }
		// return { jws };
	}

	async prepareAuthentication(params: { challenge: any }) {
		console.log('challenge ' + params.challenge.value);
		const userStore = useUserStore();
		if (
			!userStore.current_id ||
			!userStore.current_user ||
			!userStore.current_user_private_key
		) {
			throw Error('prepareAuthentication current_user_private_key is null');
		}
		const jws = await userStore.signJWS({
			name: userStore.current_user.name,
			did: userStore.current_id,
			domain: userStore.current_user.url,
			time: '' + new Date().getTime(),
			challenge: params.challenge.value
		});
		if (!jws) {
			console.error('jws is null');
			throw Error('jws is null');
		}

		return { jws };
	}
}
