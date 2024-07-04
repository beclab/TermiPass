import { checkSeahub } from '../../utils/file';
import { dataAPIs } from '../index';
import { OriginType } from './encoding';

export function getDownloadURL(
	file: any,
	inline: boolean,
	download?: boolean
): string {
	let dataAPI: any;
	if (checkSeahub(file.path)) {
		dataAPI = dataAPIs(OriginType.SYNC);
		return dataAPI.getDownloadURL(file, download);
	} else {
		dataAPI = dataAPIs(OriginType.DRIVE);
		return dataAPI.getDownloadURL(file, inline);
	}
}

export function getPreviewURL(file: any, size: any): string {
	let dataAPI: any;
	if (checkSeahub(file.path)) {
		dataAPI = dataAPIs(OriginType.SYNC);
	} else {
		dataAPI = dataAPIs(OriginType.DRIVE);
	}

	return dataAPI.getPreviewURL(file, size);
}
