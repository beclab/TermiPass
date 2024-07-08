import { getFileType } from '../../utils/file';
import { useSeahubStore } from 'src/stores/seahub';
import { DriveResType, DriveItemType, OriginType } from './encoding';

export function formatSeahub(url: string, data: { dirent_list: any }) {
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
		items: [],
		origin: OriginType.SYNC
	};

	dirent_lists.forEach((el) => {
		const seahubStore = useSeahubStore();
		const extension = getextension(el.name);
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
			encoded_thumbnail_src: el.encoded_thumbnail_src || undefined,
			origin: OriginType.SYNC,
			repo_id: seahubStore.repo_id,
			repo_name: seahubStore.repo_name
		};
		seahubDir.items.push(obj);
	});

	return seahubDir;
}

export function formatDrive(data) {
	data.origin = OriginType.DRIVE;
	data.items &&
		data.items.map((el) => {
			const extension = getextension(el.name);

			el.origin = OriginType.DRIVE;
			el.extension = extension;
		});

	return data;
}

export function formatAppDataNode(url, data) {
	const nodeDir: DriveResType = {
		path: url,
		name: 'AppData',
		size: 0,
		extension: '',
		modified: '',
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
		items: [],
		origin: OriginType.CACHE
	};

	if (data.code == 200) {
		nodeDir.numDirs = data.data.length;

		data.data.forEach((el) => {
			const extension = getextension(el.name);

			const item: DriveItemType = {
				path: url,
				name: el.metadata.name,
				size: 4096,
				extension: extension,
				modified: String(0),
				mode: 0,
				isDir: true,
				isSymlink: false,
				type: '',
				sorting: {
					by: 'size',
					asc: false
				},
				origin: OriginType.CACHE
			};

			nodeDir.items.push(item);
		});
	}

	return nodeDir;
}

export const getextension = (name: string) => {
	return name.indexOf('.') > -1 ? name.substring(name.lastIndexOf('.')) : '';
};
