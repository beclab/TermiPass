import { getFileType } from './file';

export function formatSeahub(url, data) {
	const selUrl = url.split('/')[url.split('/').length - 2];
	const dirent_lists = data.dirent_list;
	const hasDirLen = dirent_lists.filter((item) => item.type === 'dir').length;
	const hasFileLen = dirent_lists.filter((item) => item.type === 'file').length;

	const seahubDir = {
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

		numTotalFiles: 0,
		items: []
	};
	dirent_lists.forEach((el) => {
		let extension =
			el.name.indexOf('.') > -1
				? el.name.substring(el.name.lastIndexOf('.'))
				: '';
		let fileTypeName = el.type === 'dir' ? 'folder' : getFileType(el.name);
		const obj = {
			path: `${url}${el.name}/`,
			name: el.name,
			size: el.size || 0,
			extension: extension,
			modified: el.mtime ? el.mtime * 1000 : 0,
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

export function formatSeahubRepos(name, datas) {
	const dirent_lists = datas.repos;
	const hasDirLen = dirent_lists.length;
	const hasFileLen = 0;

	const seahubDir = {
		path: '',
		name,
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
		numTotalFiles: 0,
		items: []
	};

	dirent_lists.forEach((el) => {
		const obj = {
			path: '/',
			name: el.repo_name,
			size: el.size || 0,
			extension: '',
			modified: Date.parse(el.last_modified) || 0,
			mode: 0,
			isDir: true,
			isSymlink: false,
			type: el.type,
			sorting: {
				by: 'size',
				asc: false
			},
			numDirs: el.numDirs,
			numFiles: el.numFiles,
			numTotalFiles: el.numTotalFiles,
			id: el.repo_id
		};
		seahubDir.items.push(obj);
	});
	return seahubDir;
}
