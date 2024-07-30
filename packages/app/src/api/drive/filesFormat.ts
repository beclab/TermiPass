import { DriveType } from './../../stores/files';
import { getextension } from '../../utils/utils';
import { filterPcvPath } from './../common/common';

export function formatDrive(data) {
	data.origin = DriveType.Drive;
	data.path = filterPcvPath(data.path);

	data.items &&
		data.items.map((el) => {
			const extension = getextension(el.name);
			const pvcPath = filterPcvPath(el.path);

			// Temporary code
			// if (pvcPath.startsWith('/Data')) {
			// 	pvcPath = pvcPath.replace('/Data', '/Application');
			// }
			el.path = `/Files${pvcPath}`;
			el.driveType = DriveType.Drive;
			el.extension = extension;
			el.modified = new Date(el.modified).getTime();
		});

	return data;
}
