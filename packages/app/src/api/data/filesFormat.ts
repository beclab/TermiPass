import { DriveType } from './../../stores/files';
import { getextension } from '../../utils/utils';
import { filterPcvPath } from './../common/common';

export function formatData(data) {
	data.origin = DriveType.Data;
	data.items &&
		data.items.map((el) => {
			const extension = getextension(el.name);
			let pvcPath = filterPcvPath(el.path);
			pvcPath = pvcPath.replace('/Data', '/Application');
			el.path = `/Files${pvcPath}`;
			el.driveType = DriveType.Data;
			el.extension = extension;
			el.modified = new Date(el.modified).getTime();
		});

	return data;
}
