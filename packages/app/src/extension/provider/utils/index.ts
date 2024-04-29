export enum APPROVAL_TYPE {
	SIGN_CREDENTIAL = 'signCredential',
	SUBMIT_VC_INFO = 'submitVCInfo',
	SIGN_PRESENTATION = 'signPresentation',
	SIGN_JWT_PAYLOAD = 'signJwtPayload',
	SIGN_TYPE_DATA = 'signTypeData'
}

export const getOriginFromUrl = (url: string) => {
	const urlObj = new URL(url);
	return urlObj.origin;
};
