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
