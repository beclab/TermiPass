import { PrivateJwk, GetResponseResponse } from '@bytetrade/core';
import { stringToBase64 } from '@didvault/sdk/src/core';
import { useSSIStore } from '../../../../stores/ssi';
import { ClientSchema } from '../../../../globals';
import {
	FacebookLogin,
	FacebookLoginResponse
} from '@capacitor-community/facebook-login';
import { i18n } from '../../../../boot/i18n';
import { VCCardInfo, getSubmitApplicationJWS } from 'src/utils/vc';

export async function facebookLogin(
	did: string,
	privateJWK: PrivateJwk
): Promise<VCCardInfo> {
	const ssiStore = useSSIStore();
	const schema: ClientSchema | undefined =
		await ssiStore.get_application_schema('Facebook');
	if (!schema) {
		throw Error(i18n.global.t('errors.get_schema_failure'));
	}
	const manifest = stringToBase64(JSON.stringify(schema?.manifest));

	await FacebookLogin.initialize({ appId: '549140590110570' });

	const FACEBOOK_PERMISSIONS = ['email'];
	const result: FacebookLoginResponse = await FacebookLogin.login({
		permissions: FACEBOOK_PERMISSIONS
	});

	if (!result.accessToken) {
		throw Error(i18n.global.t('errors.get_facebook_accessToken_failure'));
	}
	const jws = await getSubmitApplicationJWS(
		did!,
		privateJWK!,
		schema!.manifest,
		schema!.application_verifiable_credential.id,
		{ token: result.accessToken.token }
	);

	const response: any = await ssiStore.vc_instance!.post(
		'/get_facebook_info/',
		{ jws: jws }
	);
	if (response.status != 200 && response.data.code != 0) {
		throw Error(i18n.global.t('errors.get_facebook_result_failure'));
	}
	const facebook_result: GetResponseResponse = response.data.data;
	const verifiable_credential: string =
		facebook_result.verifiableCredentials![0];

	return { type: 'Facebook', manifest, verifiable_credential };
}
