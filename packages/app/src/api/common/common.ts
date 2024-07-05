// import { checkSeahub } from '../../utils/file';
import { dataAPIs, DriveDataAPI, SyncDataAPI } from '../index';
import { DriveItemType, OriginType } from './encoding';

export function shuntModel(origin: OriginType): DriveDataAPI | SyncDataAPI {
	if (origin === OriginType.SYNC) {
		return dataAPIs(OriginType.SYNC);
	} else {
		return dataAPIs(OriginType.DRIVE);
	}
}

export function getDownloadURL(
	file: DriveItemType,
	inline: boolean,
	download = false
): string {
	const dataAPI = shuntModel(file.origin);
	return dataAPI.getDownloadURL(file, inline, download);
}

export function getPreviewURL(file: DriveItemType, size: string): string {
	const dataAPI = shuntModel(file.origin);

	return dataAPI.getPreviewURL(file, size);
}
