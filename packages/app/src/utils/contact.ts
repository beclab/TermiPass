import { i18n } from '../boot/i18n';

export enum MenuItem {
	DRIVE = 'Drive',
	SYNC = 'Sync',
	APPLICATION = 'Application',
	HOME = 'Home',
	DOCUMENTS = 'Documents',
	PICTURES = 'Pictures',
	MOVIES = 'Movies',
	DOWNLOADS = 'Downloads',
	MYLIBRARIES = 'My Libraries',
	SHAREDWITH = 'Shared Libraries',
	DATA = 'Data',
	CACHE = 'Cache',
	CODE = 'Code',
	MUSIC = 'Music'
}

export enum VaultMenuItem {
	VAULTCLASSIFICATION = 'Vault Classification',
	ALLVAULTS = 'All Vaults',
	RECENTLYUSED = 'Recently Used',
	FAVORITES = 'Favorites',
	ATTACHMENTS = 'Attachments',
	MyVault = 'My Vault',
	TAGS = 'Tags',
	MYTEAMS = 'Team Vaults',
	TEAMS = 'Teams',
	INVITES = 'Invites',
	TOOLS = 'Tools',
	SECURITYREPORT = 'Security Report',
	PASSWORDGENERATOR = 'Password Generator',
	UTILITY = 'Utility',
	LOCKSCREEN = 'Lock Screen',
	SETTINGS = 'Settings'
}

export enum OPERATE_ACTION {
	SHARE = 1,
	DELETE,
	RENAME,
	ATTRIBUTES,
	MOVE,
	COPY,
	CUT,
	PASTE,
	DOWNLOAD,
	UPLOAD_FILES,
	UPLOAD_FOLDER,
	LINK_SHARING,
	VERSION_HISTORY,
	CREATE_REPO,
	CREATE_FOLDER,
	REFRESH,
	SYNCHRONIZE_TO_LOCAL,
	OPEN_LOCAL_SYNC_FOLDER,
	UNSYNCHRONIZE,
	SYNC_IMMEDIATELY,
	SHARE_WITH,
	EXIT_SHARING
}

type PopupItem = {
	name: string;
	icon?: string;
	requiredSync: boolean | undefined;
	action: OPERATE_ACTION;
};

export const popupMenu: PopupItem[] = [
	{
		name: i18n.global.t('files_popup_menu.open_local_sync_folder'),
		icon: 'sym_r_folder_open',
		requiredSync: true,
		action: OPERATE_ACTION.OPEN_LOCAL_SYNC_FOLDER
	},
	{
		name: i18n.global.t('files_popup_menu.synchronize_to_local'),
		icon: 'sym_r_sync',
		requiredSync: false,
		action: OPERATE_ACTION.SYNCHRONIZE_TO_LOCAL
	},
	{
		name: i18n.global.t('files_popup_menu.unsynchronize'),
		icon: 'sym_r_sync_disabled',
		requiredSync: true,
		action: OPERATE_ACTION.UNSYNCHRONIZE
	},
	{
		name: i18n.global.t('files_popup_menu.sync_immediately'),
		icon: 'sym_r_autoplay',
		requiredSync: true,
		action: OPERATE_ACTION.SYNC_IMMEDIATELY
	},
	{
		name: i18n.global.t('files_popup_menu.share_with'),
		requiredSync: undefined,
		icon: 'sym_r_share',
		action: OPERATE_ACTION.SHARE_WITH
	},
	{
		name: i18n.global.t('files_popup_menu.exit_sharing'),
		requiredSync: undefined,
		icon: 'sym_r_share_off',
		action: OPERATE_ACTION.EXIT_SHARING
	},
	{
		name: i18n.global.t('files_popup_menu.rename'),
		icon: 'sym_r_edit_square',
		requiredSync: undefined,
		action: OPERATE_ACTION.RENAME
	},
	{
		name: i18n.global.t('files_popup_menu.delete'),
		icon: 'sym_r_delete',
		requiredSync: undefined,
		action: OPERATE_ACTION.DELETE
	},
	{
		name: i18n.global.t('files_popup_menu.attributes'),
		icon: 'sym_r_ballot',
		requiredSync: undefined,
		action: OPERATE_ACTION.ATTRIBUTES
	}
];

export interface SyncItem {
	id: string;
	key: string | number;
	label: string;
	icon: string;
	children?: SyncItem[];
}

export interface MenuItemType {
	label: string;
	key: string | number;
	icon: string;
	expationFlag?: boolean;
	children?: MenuItemType[];
}

export interface userInfoType {
	avatar_url: string;
	contact_email: string;
	name: string;
	nickname: string;
}

export interface SharedItemsType {
	is_admin: boolean;
	permission: string;
	share_type: string;
	user_info: userInfoType;
}

export interface DataState {
	menu: MenuItemType[];
	showShareUser: boolean;
	shareRepoInfo: any;
	userList: any;
	sharedItems: SharedItemsType[] | any;
	syncReposLastStatusMap: object;
	syncRepoIdsList: string[];
	syncRepoIdsUpdating: boolean;
	avtiveItem: any;
	syncStatus: boolean;
	canForward: boolean;
	activeMenu: string;
}

export enum SYNC_STATE {
	DISABLE,
	WAITING,
	INIT,
	ING,
	DONE,
	ERROR,
	UNKNOWN
}

export enum FilesSortType {
	DEFAULT = 0,
	NAME = 1, // a-z
	SIZE = 2,
	TYPE = 3, //A-Z
	Modified = 4 //By modification time
}

export const filesSortTypeInfo: Record<
	FilesSortType,
	{
		name: string;
		introduce: { asc: string; desc: string };
		icon: string;
		by: string;
	}
> = {
	[FilesSortType.NAME]: {
		name: i18n.global.t('sort.name.name'),
		introduce: {
			asc: i18n.global.t('sort.name.asc'),
			desc: i18n.global.t('sort.name.desc')
		},
		icon: 'sym_r_sort_by_alpha',
		by: 'name'
	},
	[FilesSortType.SIZE]: {
		name: i18n.global.t('sort.size.name'),
		introduce: {
			asc: i18n.global.t('sort.size.asc'),
			desc: i18n.global.t('sort.size.desc')
		},
		icon: 'sym_r_sort',
		by: 'size'
	},
	[FilesSortType.TYPE]: {
		name: i18n.global.t('sort.type.name'),
		introduce: {
			asc: i18n.global.t('sort.type.asc'),
			desc: i18n.global.t('sort.type.desc')
		},
		icon: 'sym_r_auto_awesome_motion',
		by: 'type'
	},
	[FilesSortType.Modified]: {
		name: i18n.global.t('sort.modified.name'),
		introduce: {
			asc: i18n.global.t('sort.modified.asc'),
			desc: i18n.global.t('sort.modified.desc')
		},
		icon: 'sym_r_acute',
		by: 'modified'
	},
	[FilesSortType.DEFAULT]: {
		name: 'By default',
		introduce: {
			asc: '',
			desc: ''
		},
		icon: '',
		by: ''
	}
};

export const scrollBarStyle = {
	contentStyle: {},
	contentActiveStyle: {},
	horizontalThumbStyle: {
		right: '2px',
		borderRadius: '3px',
		backgroundColor: '#BCBDBE',
		height: '6px',
		opacity: '1'
	},
	thumbStyle: {
		right: '2px',
		borderRadius: '3px',
		backgroundColor: '#BCBDBE',
		width: '6px',
		opacity: '1'
	}
};
