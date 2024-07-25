import { FileItem, DriveType } from './../../stores/files';
import { getextension } from '../../utils/utils';

export function formatDrive(data) {
	data.origin = DriveType.Drive;
	data.items &&
		data.items.map((el) => {
			const extension = getextension(el.name);
			el.path = `/Files${el.path}`;
			el.driveType = DriveType.Drive;
			el.extension = extension;
			el.modified = new Date(el.modified).getTime();
		});

	return data;
}

export function formatAppDataNode(url, data) {
	const nodeDir = {
		path: url,
		name: 'AppData',
		size: 0,
		extension: '',
		modified: 0,
		mode: 0,
		isDir: true,
		isSymlink: false,
		type: '',
		numDirs: 0,
		numFiles: 0,
		sorting: {
			by: 'modified',
			asc: true
		},
		fileSize: 0,
		numTotalFiles: 0,
		items: <FileItem[]>[],
		driveType: DriveType.Cache
	};

	if (data.code == 200) {
		nodeDir.numDirs = data.data.length;

		data.data.forEach((el, index) => {
			const extension = getextension(el.name);

			const item: FileItem = {
				path: url,
				name: el.metadata.name,
				size: 4096,
				extension: extension,
				modified: 0,
				mode: 0,
				isDir: true,
				isSymlink: false,
				type: '',
				sorting: {
					by: 'size',
					asc: false
				},
				driveType: DriveType.Cache,
				param: '',
				url: '',
				index: index
			};

			nodeDir.items.push(item);
		});
	}

	return nodeDir;
}
