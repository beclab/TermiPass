import { TokenData, useCloudStore } from 'src/stores/cloud';
import {
	AccountType,
	IntegrationAccount,
	OpendalIntegrationAuth
} from '../abstractions/opendal/opendalService';
import { useUserStore } from 'src/stores/user';
import { uid } from 'quasar';
import { getDID, getPrivateJWK } from 'src/did/did-key';
import { PrivateJwk } from '@bytetrade/core';
import { signJWS } from 'src/layouts/dialog/sign';
import axios from 'axios';

export class SpaceAuthService extends OpendalIntegrationAuth {
	type = AccountType.Space;
	async signIn(): Promise<IntegrationAccount> {
		return new Promise(async (resolve, reject) => {
			const cloudStore = useCloudStore();
			const userStore = useUserStore();

			const time = new Date().getTime();
			const secret = uid().replace(/-/g, '');
			const sign_body = {
				did: userStore.current_user?.id,
				secret,
				time
			};

			const user = userStore.users!.items.get(userStore.current_id!)!;

			const did = await getDID(user.mnemonic);
			const privateJWK: PrivateJwk | undefined = await getPrivateJWK(
				user.mnemonic
			);

			const jws = await signJWS(did, sign_body, privateJWK);

			const postData = {
				id: secret,
				jws,
				did,
				body: sign_body
			};
			const loginUrl = cloudStore.url + '/v2/user/login';
			await axios.post(loginUrl, postData);
			const activeLogin = cloudStore.url + '/v2/user/activeLogin';
			const response: any = await axios.post(activeLogin, {
				secret
			});

			const loginToken: TokenData = response.data;
			if (response.code == 200) {
				resolve({
					name: loginToken.userid,
					type: AccountType.Space,
					raw_data: {
						refresh_token: loginToken.token,
						access_token: loginToken.token,
						expires_in: 30 * 60 * 1000,
						expires_at: Math.trunc(loginToken.expired)
					}
				});
			} else {
				reject('Login fail');
			}
		});
	}
}
