// import { checkSeahub } from '../../utils/file';
import { dataAPIs, DriveDataAPI, SyncDataAPI } from '../index';
import { DriveItemType, OriginType } from './encoding';

export async function shuntModel(
	origin: OriginType
): Promise<DriveDataAPI | SyncDataAPI> {
	if (origin === OriginType.SYNC) {
		return dataAPIs(OriginType.SYNC);
	} else {
		return dataAPIs(OriginType.DRIVE);
	}
}

export async function getDownloadURL(
	file: DriveItemType,
	download?: boolean
): Promise<string> {
	const dataAPI = await shuntModel(file.origin);
	return dataAPI.getDownloadURL(file, download);
}

export async function getPreviewURL(
	file: DriveItemType,
	size: string
): Promise<string> {
	const dataAPI = await shuntModel(file.origin);
	return dataAPI.getPreviewURL(file, size);
}
