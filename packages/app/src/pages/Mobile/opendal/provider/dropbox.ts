// import { PrivateJwk } from '@bytetrade/core';
// import { useSSIStore } from 'src/stores/ssi';
import { DropboxAuth } from 'src/plugins/dropbox';

export async function dropboxAuth() {
	// const ssiStore = useSSIStore();
	// const schema: ClientSchema | undefined =
	// 	await ssiStore.get_application_schema('Google');
	// if (!schema) {
	// 	throw Error(i18n.global.t('errors.get_schema_failure'));
	// }
	// const manifest = stringToBase64(JSON.stringify(schema?.manifest));

	// await GoogleAuth.signOut();
	console.log('dropboxAuth ===>');

	const dropboxSignInResponse = await DropboxAuth.signIn();

	console.log(dropboxSignInResponse);
}
