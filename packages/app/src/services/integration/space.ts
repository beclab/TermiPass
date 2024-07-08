import { TokenData, useCloudStore } from 'src/stores/cloud';
import {
	AccountAddMode,
	AccountType,
	OperateIntegrationAuth,
	SpaceIntegrationAccount
} from '../abstractions/integration/integrationService';
import { useUserStore } from 'src/stores/user';
import { uid } from 'quasar';
import { getDID, getPrivateJWK } from 'src/did/did-key';
import { PrivateJwk } from '@bytetrade/core';
import { signJWS } from 'src/layouts/dialog/sign';
import axios from 'axios';
import { Loading } from 'quasar';

export class SpaceAuthService extends OperateIntegrationAuth<SpaceIntegrationAccount> {
	type = AccountType.Space;
	addMode = AccountAddMode.common;
	async signIn(): Promise<SpaceIntegrationAccount> {
		return new Promise(async (resolve, reject) => {
			Loading.hide();
			const cloudStore = useCloudStore();
			const userStore = useUserStore();

			const time = new Date().getTime();
			const secret = uid().replace(/-/g, '');
			const sign_body = {
				did: userStore.current_user?.id,
				secret,
				time
			};

			if (!(await userStore.unlockFirst())) {
				reject('Need login');
			}
			Loading.show();

			const did = await getDID(userStore.current_mnemonic?.mnemonic);
			const privateJWK: PrivateJwk | undefined = await getPrivateJWK(
				userStore.current_mnemonic?.mnemonic
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
					name: userStore.current_user?.name || did,
					type: AccountType.Space,
					raw_data: {
						refresh_token: loginToken.token,
						access_token: loginToken.token,
						expires_in: 30 * 60 * 1000,
						expires_at: Math.trunc(loginToken.expired),
						userid: did
					}
				});
			} else {
				reject('Login fail');
			}
		});
	}
	async permissions() {
		return {
			title: '',
			scopes: []
		};
	}
}
