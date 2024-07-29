import { FileItem, DriveType } from './../../stores/files';
import { getextension } from '../../utils/utils';
import { filterPcvPath } from './../common/common';

export function formatAppData(node, data) {
	data.origin = DriveType.Cache;
	data.items &&
		data.items.map((el) => {
			const extension = getextension(el.name);
			const splitPath = filterPcvPath(el.path).split('/');
			splitPath.splice(splitPath.indexOf('AppData') + 1, 0, node);
			const joinPath = splitPath.join('/');
			el.path = `/Cache${joinPath}`;
			el.driveType = DriveType.Cache;
			el.extension = extension;
			el.modified = new Date(el.modified).getTime();
		});

	console.log('datadata', data);

	return data;
}

export function formatAppDataNode(url, data) {
	console.log('formatAppDataNode', url);
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
			const extension = getextension(el.metadata.name);

			const item: FileItem = {
				path: '/Cache/' + el.metadata.name,
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

	console.log('nodeDirnodeDir', nodeDir);

	return nodeDir;
}
