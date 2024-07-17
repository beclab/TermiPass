import { getFileType } from '../../utils/file';
import { FileItem, DriveType, FileResType } from './../../stores/files';
import { getParams } from './../../utils/utils';
import { getextension } from '../../utils/utils';

export function formatSeahub(url: string, data: { dirent_list: any }) {
	const selUrl = url.split('/')[url.split('/').length - 2];
	const dirent_lists = data.dirent_list;
	const hasDirLen = dirent_lists.filter((item) => item.type === 'dir').length;
	const hasFileLen = dirent_lists.filter((item) => item.type === 'file').length;
	const repo_name = decodeURIComponent(window.location.href.split('/')[5]);
	const repo_id = getParams(window.location.href, 'id');
	const type = getParams(window.location.href, 'type');
	const p = getParams(window.location.href, 'p');
	const seahubDir: FileResType = {
		path: url,
		name: selUrl,
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
		driveType: DriveType.Sync
	};

	// console.log('dirent_lists', dirent_lists);

	dirent_lists.forEach((el, index) => {
		const extension = getextension(el.name);
		const fileTypeName = el.type === 'dir' ? 'folder' : getFileType(el.name);
		const itemPath = `/Files/Seahub/${repo_name}${el.parent_dir.replace(
			/\/$/,
			''
		)}${el.path || ''}/?id=${repo_id}&type=${type}&p=${p}`;

		const obj: FileItem = {
			path: itemPath,
			name: el.name,
			size: el.size || 0,
			extension: extension,
			modified: el.mtime * 1000 || 0,
			mode: 0,
			isDir: el.type === 'dir' ? true : false,
			isSymlink: false,
			type: fileTypeName,

			parentPath: el.parent_dir,
			sorting: {
				by: 'size',
				asc: false
			},
			numDirs: el.numDirs,
			numFiles: el.numFiles,
			numTotalFiles: el.numTotalFiles,
			encoded_thumbnail_src: el.encoded_thumbnail_src || undefined,
			driveType: DriveType.Sync,
			param: '',
			url: '',
			index
		};
		seahubDir.items.push(obj);
	});

	// console.log('seahubDirseahubDir', seahubDir);

	return seahubDir;
}
