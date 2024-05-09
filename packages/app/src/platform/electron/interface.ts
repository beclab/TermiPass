export type IPCVpnEventName =
	| 'openVpn'
	| 'closeVpn'
	| 'statusVpn'
	| 'currentNodeId'
	| 'peersState'
	| 'electronVpnStatusUpdate';

export type IPCFilesEventName =
	| 'loginAccount'
	| 'setAutoSyncEnable'
	| 'isAutoSyncEnable'
	| 'hasLocalRepo'
	| 'openLocalRepo'
	| 'repoAddSync'
	| 'repoRemoveSync'
	| 'syncRepoImmediately'
	| 'repoSyncInfo'
	| 'defaultSyncSavePath'
	| 'selectSyncSavePath'
	| 'removeCurrentAccount';

export type IPCDownloadEventName =
	| 'newDownloadFile'
	| 'pauseOrResume'
	| 'allPauseOrResume'
	| 'removeDownloadItem'
	| 'removeAllDownloadItems'
	| 'newDownloadItem'
	| 'downloadItemUpdate'
	| 'downloadItemDone'
	| 'getDownloadPath'
	| 'setDownloadPath'
	| 'selectDownloadPath';

export type IPCStoreEventName =
	| 'electronStoreGet'
	| 'electronStoreSet'
	| 'electronStoreRemove'
	| 'electronStoreClear';

export type IPCTransferEventName =
	| 'getDownloadData'
	| 'getUploadData'
	| 'getCompleteData'
	| 'clearCompleteData'
	| 'openFile'
	| 'openFileInFolder';

export type IPCWindowsHeaderMenusEventName =
	| 'minimize'
	| 'maximize'
	| 'close'
	| 'isMaximized'
	| 'winMove';

export type IPCSettingsEventName =
	| 'getAutomaticallyStartBoot'
	| 'setAutomaticallyStartBoot'
	| 'getAppInfo'
	| 'listenerNetworkUpdate'
	| 'getTaskPreventSleepBoot'
	| 'setTaskPreventSleepBoot';

export type IPCWinVPNEventName = 'getCookie' | 'registerPort' | 'winHadLoad';

export interface IOpenVpnInterface {
	server: string;
	authKey: string;
}

export interface IFilesLoginAccountInterface {
	url: string;
	username: string;
}

export interface IFilesRepoAddSyncInterface {
	worktree: string;
	repo_id: string;
	name: string;
	password: string;
	readonly: boolean;
}

export type DownloadItemState =
	| 'progressing'
	| 'completed'
	| 'cancelled'
	| 'interrupted';

export enum TransferFront {
	download = 1,
	upload = 2
}

export interface ITransferFile {
	id: string;
	fileName: string;
	icon: string;
	totalBytes: number;
	front: TransferFront;
	from: string;
	to: string;
	startTime: number;
	endTime: number;
	openPath: string;
	speed: number;
	progress: number;
	leftTimes: number; //unit s
}

export interface ITransferDownloadFile extends ITransferFile {
	receivedBytes: number;
	paused: boolean;
	state: DownloadItemState;
}

export interface ITransferUploadFile extends ITransferFile {
	paused: boolean;
	extensionInfo: any;
}

export interface IPagination {
	pageIndex: number;
	pageCount: number;
}

export interface INewDownloadFile {
	url: string;
	fileName?: string;
	path: string;
	totalBytes: number;
}

export interface IAppInfo {
	version: string;
}

declare global {
	interface Window {
		electron: {
			api: {
				vpn: {
					openVpn: (data: IOpenVpnInterface) => void;
					closeVpn: () => void;
					statusVpn: () => Promise<number>;
					currentNodeId: () => Promise<string>;
					peersState: () => Promise<string>;
					listenerVpnStatusUpdate: (callback: () => void) => void;
				};
				files: {
					/** seafile **/
					loginAccount: (data: IFilesLoginAccountInterface) => Promise<boolean>;
					setAutoSyncEnable: (authSync: boolean) => Promise<boolean>;
					isAutoSyncEnable: () => Promise<boolean>;
					hasLocalRepo: (repo_id: string) => Promise<boolean>;
					openLocalRepo: (repo_id: string, subPath?: string) => void;
					repoAddSync: (data: IFilesRepoAddSyncInterface) => Promise<boolean>;
					repoRemoveSync: (repo_id: string) => Promise<boolean>;
					syncRepoImmediately: (repo_id: string) => Promise<boolean>;
					repoSyncInfo: (repo_id: string) => Promise<string>;
					defaultSyncSavePath: () => Promise<string>;
					selectSyncSavePath: () => Promise<string>;
					removeCurrentAccount: (
						data: IFilesLoginAccountInterface
					) => Promise<boolean>;
				};
				download: {
					newDownloadFile: (
						formData: INewDownloadFile
					) => Promise<ITransferDownloadFile | null>;

					pauseOrResume: (id: string) => Promise<ITransferDownloadFile>;
					allPauseOrResume: (
						pause: boolean,
						list: string[]
					) => Promise<boolean>;
					removeDownloadItem: (
						item: ITransferDownloadFile
					) => Promise<ITransferDownloadFile>;
					removeAllDownloadItems: (list: string[]) => Promise<boolean>;
					clearDownloadDone: () => Promise<ITransferDownloadFile[]>;
					listenerNewDownloadItem: (
						callback: (_event: any, item: ITransferDownloadFile) => void
					) => void;
					listenerDownloadItemUpdate: (
						callback: (_event: any, item: ITransferDownloadFile) => void
					) => void;
					listenerDownloadItemDone: (
						callback: (_event: any, item: ITransferDownloadFile) => void
					) => void;
					getDownloadPath: () => Promise<string>;
					setDownloadPath: (path: string) => Promise<boolean>;
					selectDownloadPath: () => Promise<string>;
				};
				transfer: {
					getDownloadData: () => Promise<ITransferDownloadFile[]>;
					getUploadData: () => Promise<ITransferUploadFile[]>;
					getCompleteData: () => Promise<ITransferFile[]>;
					clearCompleteData: (list: string[]) => Promise<boolean>;
					openFileInFolder: (path: string) => Promise<boolean>;
					openFile: (path: string) => Promise<string>;
				};

				windows: {
					minimize: () => Promise<void>;
					maximize: () => Promise<void>;
					close: () => Promise<void>;
					isMaximized: () => Promise<boolean>;
					winMove: (isMove: boolean) => Promise<void>;
				};

				settings: {
					getAutomaticallyStartBoot: () => Promise<boolean>;
					setAutomaticallyStartBoot: (enable: boolean) => Promise<void>;
					getAppInfo: () => Promise<IAppInfo>;
					listenerNetworkUpdate: (
						callback: (_event: any, value: any) => void
					) => void;
					getTaskPreventSleepBoot: () => Promise<boolean>;
					setTaskPreventSleepBoot: (status: boolean) => Promise<void>;
				};

				winVPN: {
					getCookie: () => Promise<string>;
					registerPort: (callback: (_event: any) => void) => void;
					winHadLoad: () => Promise<void>;
				};
			};

			store: {
				get: (key: string) => any;
				set: (key: string, val: any) => void;
				remove: (key: string) => void;
				clear: () => void;
			};
		};
	}
}
