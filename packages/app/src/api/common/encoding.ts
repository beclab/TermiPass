import { checkSeahub, checkAppData } from '../../utils/file';
import { OPERATE_ACTION } from '../../utils/contact';

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

export interface CopyStoragesType {
	from: any;
	to: string;
	name: any;
	src_repo_id?: any;
	key?: string;
}

export interface ShareInfoResType {
	shared_group_ids: string[];
	shared_user_emails: string[];
}

export interface EventType {
	type?: OriginType;
	isSelected: boolean; //	true: Right click on a certain item; false: Right click on a blank area on the files
	hasCopied: boolean;
	showRename: boolean;
	isHomePage: boolean;
}
export interface ContextType {
	name: string;
	icon: string;
	type?: string;
	action: OPERATE_ACTION.OPEN_LOCAL_SYNC_FOLDER;
	condition: (event: EventType) => boolean;
}
