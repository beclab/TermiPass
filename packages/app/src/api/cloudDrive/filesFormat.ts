import { FileItem, DriveType, FileResType } from './../../stores/files';
import { getFileType } from './../../utils/utils';

export function formatGd(data, url) {
	const name = url.split('/')[2];
	const dirent_lists = data;
	const hasDirLen = dirent_lists.length;
	const hasFileLen = 0;

	const seahubDir: FileResType = {
		path: '/',
		name,
		size: 0,
		extension: '',
		modified: 0,
		mode: 0,
		isDir: true,
		isSymlink: false,
		type: '',
		numDirs: hasDirLen,
		numFiles: hasFileLen,
		sorting: {
			by: 'modified',
			asc: true
		},
		numTotalFiles: 0,
		items: [],
		driveType: DriveType.GoogleDrive
	};

	console.log('dirent_lists', dirent_lists);
	dirent_lists.forEach((el, index) => {
		const pathname = window.location.pathname;
		const itemPath = `${pathname}${el.name}`;

		const obj: FileItem = {
			path: itemPath,
			name: el.name.endsWith('/') ? el.name.slice(0, -1) : el.name,
			size: el.size || 0,
			extension: '',
			modified: Date.parse(el.last_modified) || 0,
			mode: 0,
			isDir: el.isDir,
			isSymlink: false,
			type: getFileType(el.name),
			sorting: {
				by: 'size',
				asc: false
			},
			numDirs: el.numDirs,
			numFiles: el.numFiles,
			numTotalFiles: el.numTotalFiles,
			index,
			url: '',
			driveType: DriveType.CloudDrive,
			param: ''
		};
		seahubDir.items.push(obj);
	});
	return seahubDir;
}
