import { DIDKey, getDID, getPrivateJWK } from '../../../../did/did-key';
import { GeneralJwsSigner } from '../../../../jose/jws/general/signer';
import { UserItem } from '@didvault/sdk/src/core';
import { app } from '../../../../globals';
import { useSSIStore } from '../../../../stores/ssi';
import { useUserStore } from '../../../../stores/user';
import { getAppPlatform } from 'src/platform/appPlatform';
import { i18n } from '../../../../boot/i18n';

function getFullyQualifiedVerificationMethodID(did: string): string {
	const [, , id] = did.split(':');
	return did + '#' + id;
}

export async function createUser() {
	try {
		const mnemonic = await DIDKey.generate();
		if (!mnemonic) {
			throw new Error(i18n.global.t('errors.mnemonic_generate_failure')); //mnemonic generate failure
		}
		const did = await getDID(mnemonic);
		const privateJWK = await getPrivateJWK(mnemonic);

		if (!did) {
			throw new Error(i18n.global.t('errors.mnemonic_generate_failure'));
		}

		const signer = await GeneralJwsSigner.create(
			new TextEncoder().encode(
				JSON.stringify({
					did: getFullyQualifiedVerificationMethodID(did)
				})
			),
			[
				{
					privateJwk: privateJWK!,
					protectedHeader: {
						alg: 'EdDSA',
						kid: getFullyQualifiedVerificationMethodID(did)
					}
				}
			]
		);
		const jws = signer.getJws();
		const ssiStore = useSSIStore();
		const userStore = useUserStore();
		await ssiStore.pre_did_register(jws);
		if (userStore.current_id) {
			const current_user: UserItem = userStore.users!.items.get(
				userStore.current_id
			)!;
			if (current_user && current_user.url) {
				await app.lock();
			}
		}

		const user = await userStore.importUser(did, '', mnemonic);
		if (user) {
			await userStore.setCurrentID(user.id);
			await app.load(user.id, getAppPlatform().reconfigAppStateDefaultValue);
			await app.new(user.id, user.mnemonic);
		}
		return { data: userStore.current_id };
	} catch (e) {
		console.error(e.message);
		return { message: e.message };
	}
}
