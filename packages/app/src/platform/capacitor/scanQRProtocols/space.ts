import { base64ToString } from '@didvault/sdk/src/core';
import {
	NativeScanQRProtocol,
	commonGetRealQRConent,
	commonResponseQRContent
} from './index';
import { MessageBody } from '@bytetrade/core';
import { busEmit } from 'src/utils/bus';

export const space: NativeScanQRProtocol = {
	protocol: 'space',
	method: async (result) => {
		try {
			const message = commonGetRealQRConent(result);
			const rawBody: MessageBody = JSON.parse(base64ToString(message));
			busEmit('signMessage', rawBody);
			return true;
		} catch (error) {
			return false;
		}
	},
	canResponseQRContent: async (result) => {
		return commonResponseQRContent(result, 'space');
	}
};
