import { AuthType, AccountStatus, AuthPurpose } from './core';

import { completeAuthRequest, startAuthRequest } from './core';
import { AccountProvisioning } from './core';
import { StartAuthRequestResponse } from './core';

import { ErrorCode } from './core';

export async function _authenticate({
	did,
	type,
	purpose,
	pendingRequest: req,
	authenticatorIndex = 0
}: {
	did: string;
	type: AuthType;
	purpose: AuthPurpose;
	authenticatorIndex?: number;
	pendingRequest?: StartAuthRequestResponse;
}): Promise<{
	did: string;
	token: string;
	accountStatus: AccountStatus;
	provisioning: AccountProvisioning;
	deviceTrusted: boolean;

	//legacyData?: PBES2Container;
} | null> {
	try {
		if (!req) {
			console.log('req  1');
			req = await startAuthRequest({
				//type: AuthType.PublicKey,
				type: type,
				purpose: purpose,
				did: did,

				authenticatorIndex
			});
			console.log('req  ' + JSON.stringify(req));
			//await this.app.storage.save(req);
			// this.router.setParams({ pendingAuth: req.id });
		}

		try {
			const res = await completeAuthRequest(req);
			console.log('res  ' + JSON.stringify(res));
			return res;
		} finally {
			// this.router.setParams({ pendingAuth: undefined });
			// this.app.storage.delete(req);
		}
	} catch (e: any) {
		console.log(e);

		if (e.code === ErrorCode.NOT_FOUND) {
			// await alert(e.message, { title: $l("Authentication Failed"), options: [$l("Cancel")] });
			return null;
		}

		// const choice = await alert(e.message, {
		//     title: $l("Authentication Failed"),
		//     options: [$l("Try Again"), $l("Try Another Method"), $l("Cancel")],
		// });
		// switch (choice) {
		//     case 0:
		//         return this._authenticate({ email, authenticatorIndex });
		//     case 1:
		//         return this._authenticate({ email, authenticatorIndex: authenticatorIndex + 1 });
		//     default:
		//         return null;
		// }
		return null;
	}
}
