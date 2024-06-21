import { getFileType } from '../../utils/file';
import { DriveResType, DriveItemType } from './encoding';

export function formatSeahub(url, data) {
	const selUrl = url.split('/')[url.split('/').length - 2];
	const dirent_lists = data.dirent_list;
	const hasDirLen = dirent_lists.filter((item) => item.type === 'dir').length;
	const hasFileLen = dirent_lists.filter((item) => item.type === 'file').length;

	const seahubDir: DriveResType = {
		path: url,
		name: selUrl,
		size: 0,
		extension: '',
		modified: '',
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
		fileSize: 0,
		numTotalFiles: 0,
		items: []
	};

	dirent_lists.forEach((el) => {
		const extension =
			el.name.indexOf('.') > -1
				? el.name.substring(el.name.lastIndexOf('.'))
				: '';
		const fileTypeName = el.type === 'dir' ? 'folder' : getFileType(el.name);

		const obj: DriveItemType = {
			path: `${url}${el.name}/`,
			name: el.name,
			size: el.size || 0,
			extension: extension,
			modified: el.mtime ? String(el.mtime * 1000) : '0',
			mode: 0,
			isDir: el.type === 'dir' ? true : false,
			isSymlink: false,
			type: fileTypeName,

			parentPath: url,
			sorting: {
				by: 'size',
				asc: false
			},
			numDirs: el.numDirs,
			numFiles: el.numFiles,
			numTotalFiles: el.numTotalFiles,
			encoded_thumbnail_src: el.encoded_thumbnail_src || undefined
		};
		seahubDir.items.push(obj);
	});

	return seahubDir;
}
