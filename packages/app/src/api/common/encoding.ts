import { checkSeahub, checkAppData } from '../../utils/file';

export enum OriginType {
	DRIVE = 'drive',
	SYNC = 'sync',
	CACHE = 'cache'
}

export function checkOrigin(url: string) {
	console.log('checkOrigincheckOrigin', url);

	if (checkSeahub(url)) {
		return OriginType.SYNC;
	}

	if (checkAppData(url)) {
		console.log('into', url);
		return OriginType.CACHE;
	}

	return OriginType.DRIVE;
}

export interface DriveResType {
	extension: string;
	fileSize?: number;
	isDir: boolean;
	isSymlink: boolean;
	mode: number;
	modified: string;
	name: string;
	numDirs: number;
	numFiles: number;
	numTotalFiles?: number;
	path: string;
	size: number;
	type?: string;
	items: DriveItemType[];
	sorting: DriveSortingType;
	url?: string;
}

export interface DriveItemType {
	extension: string;
	isDir: boolean;
	isSymlink: boolean;
	mode: number;
	modified: string;
	name: string;
	path: string;
	size: number;
	type: string;
	parentPath?: string;
	sorting?: DriveSortingType;
	numDirs?: number;
	numFiles?: number;
	numTotalFiles?: number;
	encoded_thumbnail_src?: string;
	index?: number;
	url?: string;
}

export interface DriveSortingType {
	asc: boolean;
	by: string;
}

export interface SyncResType {
	dir_id: string;
	user_perm: string;
	dirent_list: DirentListType[];
}

export interface DirentListType {
	encoded_thumbnail_src: string;
	id: string;
	modifier_contact_email: string;
	modifier_email: string;
	modifier_name: string;
	mtime: number;
	name: string;
	parent_dir: string;
	permission: string;
	size: number;
	starred: boolean;
	type: string;
}

export interface SyncRepoItemType {
	encrypted: boolean;
	last_modified: string;
	modifier_contact_email: string;
	modifier_email: string;
	modifier_name: string;
	monitored: boolean;
	owner_contact_email: string;
	owner_email: string;
	owner_name: string;
	permission: string;
	repo_id: string;
	repo_name: string;
	salt: string;
	size: number;
	starred: boolean;
	status: string;
	type: string;
}

export interface SyncRepoMineType extends SyncRepoItemType {
	share_type: any;
	repo_id: any;
	label: string;
	key: string;
	icon: string;
	id: string;
	defaultHide: boolean;
}

export interface SyncRepoSharedItemType {
	contact_email: string;
	encrypted: boolean;
	is_admin: boolean;
	modifier_contact_email: string;
	modifier_email: string;
	modifier_name: string;
	repo_id: string;
	repo_name: string;
	share_permission: string;
	share_type: string;
	user_email: string;
	user_name: string;
}

export interface SyncRepoSharedType extends SyncRepoSharedItemType {
	label: string;
	key: string;
	name: string;
	icon: string;
	id: string;
	defaultHide: boolean;
}

// export interface SyncRepoType {
// 	label: string;
// 	key: string;
// 	name: string;
// 	icon: string;
// 	id: string;
// 	defaultHide: boolean;
// }

export interface CopyStoragesType {
	from: any;
	to: string;
	name: any;
	src_repo_id?: any;
	parentPath: string;
}
