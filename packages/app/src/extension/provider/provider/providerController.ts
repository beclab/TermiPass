import 'reflect-metadata';
import { base64ToString } from '@didvault/sdk/src/core';
import { getExtensionBackgroundPlatform } from '../../background/extensionBackgroundPlatform';
import {
	VCCardItem,
	getPresentationJWS,
	signJwtPayload,
	convertVault2CardItem
} from '../../../utils/vc';
import {
	getChannelCredentialJWS,
	submitChannelVCInfo
} from '../../../utils/channeVC';
import { notificationService } from '../service';

import { APPROVAL_TYPE } from '../utils';

class ProviderController {
	@Reflect.metadata('SAFE', true)
	getUserInfo = async (): Promise<any> => {
		const dataCenter = getExtensionBackgroundPlatform().dataCenter;
		const didKey = await dataCenter.getCurrentDidKey();
		const name = await dataCenter.getCurrentName();
		return { name, didKey };
	};

	private _getSignInfo = async () => {
		const dataCenter = getExtensionBackgroundPlatform().dataCenter;
		const didKey = await dataCenter.getCurrentDidKey();
		const privateJWK = await dataCenter.getCurrentPrivateJWK();

		if (!didKey) {
			throw new Error('get DID failure');
		}
		if (!privateJWK) {
			throw new Error('get privateJWK failure');
		}

		return { didKey, privateJWK };
	};

	@Reflect.metadata('APPROVAL', [APPROVAL_TYPE.SIGN_CREDENTIAL, true])
	signCredential = async (info: any): Promise<string> => {
		const {
			data: {
				params: { credentialSubject, schema }
			}
		} = info;
		const { didKey, privateJWK } = await this._getSignInfo();

		return await getChannelCredentialJWS(
			didKey,
			privateJWK,
			credentialSubject,
			schema
		);
	};

	@Reflect.metadata('APPROVAL', [APPROVAL_TYPE.SUBMIT_VC_INFO, true])
	submitVCInfo = async (info: any): Promise<any> => {
		const {
			data: {
				params: { response, schema }
			},
			session: { origin, name, icon }
		} = info;
		const vcCardInfo = await submitChannelVCInfo(response, schema);
		try {
			const { code } = await notificationService.requestApproval({
				params: { origin, name, icon, vcInfo: vcCardInfo },
				routerPath: '/submit',
				origin: origin,
				session: { origin, name, icon }
			});
			return { code };
		} catch (e) {
			return e;
		}
	};

	@Reflect.metadata('APPROVAL', [APPROVAL_TYPE.SIGN_PRESENTATION, true])
	signPresentation = async (info: any): Promise<string> => {
		const {
			data: {
				params: { definition }
			},
			vc
		} = info;

		const { didKey, privateJWK } = await this._getSignInfo();
		const result = await getPresentationJWS(didKey, privateJWK, definition, vc);
		return result;
	};

	@Reflect.metadata('APPROVAL', [APPROVAL_TYPE.SIGN_JWT_PAYLOAD, true])
	signJwtPayload = async (info: any): Promise<string> => {
		const {
			data: {
				params: { jwtPayload }
			}
		} = info;
		const { privateJWK } = await this._getSignInfo();
		return await signJwtPayload(jwtPayload, privateJWK);
	};

	hasVC = async (info: any): Promise<boolean> => {
		const {
			data: {
				params: { name }
			}
		} = info;
		const vcList: VCCardItem[] = [];
		const dataCenter = getExtensionBackgroundPlatform().dataCenter;
		for (const vault of dataCenter.getVaults()) {
			for (const item of vault.items) {
				const card = convertVault2CardItem(item);

				if (card && card?.type === 'Channel') {
					vcList.push(card);
				}
			}
		}
		if (vcList.length > 0) {
			const result = vcList.find((cardItem) => {
				const vc = JSON.parse(
					base64ToString(cardItem.verifiable_credential.split('.')[1])
				).vc;
				return vc.credentialSubject['name'] === name;
			});
			return !!result;
		}
		return false;
	};

	@Reflect.metadata('SAFE', true)
	@Reflect.metadata('APPROVAL', [APPROVAL_TYPE.SIGN_TYPE_DATA, true])
	signTypeData = async (info: any): Promise<any> => {
		const {
			data: {
				params: { domain, types, data, primaryType }
			}
		} = info;
		const result = await this.signStatement(domain, types, data, primaryType);
		if (!result) {
			throw new Error('sign error');
		}
		const dataCenter = getExtensionBackgroundPlatform().dataCenter;
		const didKey = await dataCenter.getCurrentDidKey();
		const name = await dataCenter.getCurrentName();
		return {
			result,
			didKey,
			name
		};
	};

	private async signStatement(
		signDomain: any,
		types: any,
		signData: any,
		primaryType: any
	) {
		const dataCenter = getExtensionBackgroundPlatform().dataCenter;
		const privateKey = await dataCenter.getDefaultEthPrivatekey();
		const { EthereumMessageSigner } = await dataCenter.getWalletCore();

		const signMessage = JSON.stringify({
			types: types,
			domain: signDomain,
			message: signData,
			primaryType
		});

		try {
			const outputData = EthereumMessageSigner.signTypedMessage(
				privateKey,
				signMessage
			);
			return `0x${outputData}`;
		} catch (error) {
			console.error('error ===>', error);
		}
	}
}

export default new ProviderController();
