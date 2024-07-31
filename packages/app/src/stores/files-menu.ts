import { defineStore } from 'pinia';
import { app } from '../globals';
import { shareToUser } from '../api';
import { MenuItem, SYNC_STATE } from '../utils/contact';
import { busOn } from 'src/utils/bus';
// import { dataAPI } from './../api';
import { dataAPIs, SyncDataAPI, DriveDataAPI } from './../api';

import { DriveType } from './files';
import { SyncRepoMineType } from './../api/sync/type';
import { IFilesSyncStatus } from 'src/platform/electron/interface';

export const syncStatusInfo: Record<number, { icon: string; color: string }> = {
	[SYNC_STATE.ING]: {
		icon: 'sym_r_sync',
		color: '#3377ff'
	},
	[SYNC_STATE.INIT]: {
		icon: 'sym_r_sync',
		color: '#3377ff'
	},
	[SYNC_STATE.WAITING]: {
		icon: 'sym_r_sync',
		color: '#3377ff'
	},
	[SYNC_STATE.DONE]: {
		icon: 'sym_r_check_small',
		color: '#19C553'
	},
	[SYNC_STATE.ERROR]: {
		icon: 'sym_r_exclamation',
		color: '#FF4D4D'
	},
	[-1]: {
		icon: 'sym_r_pause',
		color: '#ADADAD'
	}
};

let registerSyncStatusTask = false;

export interface MenuItemType {
	label: string;
	key: string | number;
	icon: string;
	expationFlag?: boolean;
	driveType?: DriveType;
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

export interface ActiveMenuType {
	label: string;
	id: string;
	driveType: DriveType;
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
	activeMenu: ActiveMenuType;
}

export const useMenuStore = defineStore('filesMenu', {
	state: () => {
		return {
			showShareUser: false,
			shareRepoInfo: null,
			syncReposLastStatusMap: {},
			syncRepoIdsUpdating: false,
			syncRepoIdsList: [],
			syncReposTimer: undefined,
			canForward: false,
			activeMenu: {
				label: 'Home',
				id: 'Home',
				driveType: DriveType.Drive
			},
			menu: [
				{
					label: MenuItem.DRIVE,
					key: MenuItem.DRIVE,
					icon: '',
					children: []
				},
				{
					label: MenuItem.SYNC,
					key: MenuItem.SYNC,
					icon: '',
					children: []
				},
				{
					label: MenuItem.APPLICATION,
					key: MenuItem.APPLICATION,
					icon: '',
					children: [
						{
							label: MenuItem.DATA,
							key: MenuItem.DATA,
							icon: 'sym_r_database',
							driveType: DriveType.Data
						},
						{
							label: MenuItem.CACHE,
							key: MenuItem.CACHE,
							icon: 'sym_r_analytics',
							driveType: DriveType.Cache
						}
					]
				}
			],
			userList: [],
			sharedItems: [],
			avtiveItem: null,
			syncStatus: false
		} as DataState;
	},

	getters: {
		reposHasSync(): boolean {
			return Object.values(this.syncReposLastStatusMap).find(
				(e) =>
					e.status &&
					e.status > SYNC_STATE.DISABLE &&
					e.status != SYNC_STATE.UNKNOWN
			);
		}
	},

	actions: {
		getMenuBrowserUrl(value) {
			console.log('getMenuBrowserUrl', value);
		},

		getMenu() {
			return this.menu;
		},

		fifterMenu() {
			if (process.env.PLATFORM === 'DESKTOP') {
				const menus = JSON.parse(JSON.stringify(this.menu));
				const newMenus: any = [];
				for (let i = 0; i < menus.length; i++) {
					const element = menus[i];
					if (element.label !== MenuItem.APPLICATION) {
						newMenus.push(element);
					}
				}
				this.menu = newMenus;
			}
		},

		updateMenu(newMenu: any) {
			this.menu = newMenu;
		},

		async listSharedItems() {
			this.sharedItems = await shareToUser.listSharedItems();
		},

		async getUserList() {
			// const userStore = useUserStore();

			let account = app.account?.name;

			if (!account) {
				const h = window.location.hostname;
				const s = h.split('.');
				const hasLocalIndex = s.findIndex((c) => c === 'local');
				const hasFilesIndex = s.findIndex((c) => c === 'files');

				if (hasLocalIndex >= 0) {
					account = s[hasLocalIndex + 1];
				} else if (hasFilesIndex >= 0) {
					account = s[hasFilesIndex + 1];
				}
			}

			const res = await shareToUser.getUserList();

			this.userList = res.filter((item: any) => {
				return (
					item.contact_email &&
					item.contact_email.indexOf('@seafile.com') &&
					item.name !== account
				);
			});
		},

		async addSyncUpdateRepos(repo_ids: string[]) {
			if (!window.electron) {
				return;
			}
			if (repo_ids.length == 0) {
				return;
			}
			this.syncRepoIdsUpdating = true;
			for (let index = 0; index < repo_ids.length; index++) {
				const repo_id = repo_ids[index];
				if (this.syncRepoIdsList.find((e) => e === repo_id)) {
					continue;
				}

				this.syncRepoIdsList.push(repo_id);
			}
			this.syncRepoIdsUpdating = false;
			if (registerSyncStatusTask) {
				return;
			}
			busOn('runTask', () => {
				this.checkRepoSyncStatus();
			});
			registerSyncStatusTask = true;
		},
		async checkRepoSyncStatus() {
			for (let index = 0; index < this.syncRepoIdsList.length; index++) {
				if (this.syncRepoIdsUpdating) {
					return;
				}
				const repo_id = this.syncRepoIdsList[index];

				const repoSyncInfo = await window.electron.api.files.repoSyncInfo(
					repo_id
				);
				if (repoSyncInfo.length == 0 || repoSyncInfo == 'repo not in sync') {
					if (
						!this.syncReposLastStatusMap[repo_id] ||
						this.syncReposLastStatusMap[repo_id].status != SYNC_STATE.DISABLE
					) {
						this.syncReposLastStatusMap[repo_id] = {
							status: SYNC_STATE.DISABLE
						};
					}
					continue;
				}
				const infoObject = JSON.parse(repoSyncInfo);

				let info = infoObject.info;
				if (typeof info == 'string') {
					info = JSON.parse(info);
				}

				if (infoObject.type == 'clone') {
					this.syncReposLastStatusMap[repo_id] = {
						status: SYNC_STATE.ING,
						percent: info.percentage
					};
				} else if (infoObject.type == 'local') {
					if (info.sync_state == SYNC_STATE.ING) {
						const percent =
							info.transfer_percentage > 100 || info.transfer_percentage < 0
								? 0
								: info.transfer_percentage;

						this.syncReposLastStatusMap[repo_id] = {
							status: SYNC_STATE.ING,
							percent
						};
					} else {
						if (
							this.syncReposLastStatusMap[repo_id] &&
							this.syncReposLastStatusMap[repo_id].status == info.sync_state
						) {
							continue;
						}
						this.syncReposLastStatusMap[repo_id] = {
							status: info.sync_state
						};
					}
				}
			}

			if (window.electron) {
				const status: IFilesSyncStatus = {
					syncing: false,
					error: false,
					pause: !this.syncStatus,
					done: false
				};
				Object.values(this.syncReposLastStatusMap).forEach((e) => {
					if (
						e.status == SYNC_STATE.ING ||
						e.status == SYNC_STATE.INIT ||
						e.status == SYNC_STATE.WAITING
					) {
						status.syncing = true;
					}
					if (e.status == SYNC_STATE.DONE) {
						status.done = true;
					}
					if (e.status == SYNC_STATE.ERROR) {
						status.error = true;
					}
				});
				window.electron.api.files.updateSyncStatus(status);
			}
		},

		async updateSyncStatus() {
			if (window.electron) {
				this.syncStatus = !this.syncStatus;
				const result = await window.electron.api.files.setAutoSyncEnable(
					this.syncStatus
				);
				if (!result) {
					this.syncStatus = !this.syncStatus;
				}
			}
		},
		async getSyncStatus() {
			if (!window.electron) {
				return;
			}
			this.syncStatus = await window.electron.api.files.isAutoSyncEnable();
		},

		repoIsInSync(repo_id: string) {
			const status = this.syncReposLastStatusMap[repo_id]
				? this.syncReposLastStatusMap[repo_id].status
				: 0;
			return status > SYNC_STATE.DISABLE && status != SYNC_STATE.UNKNOWN;
		},

		//	fetch sync menu data MYLIBRARIES/SHAREDWITH
		async getSyncMenu() {
			const menuStore = useMenuStore();
			const driveDataAPI = new DriveDataAPI();
			const syncDataAPI = new SyncDataAPI();

			this.menu[0].children = await driveDataAPI.fetchMenuRepo();
			const syncMenus: SyncRepoMineType[] = await syncDataAPI.fetchMenuRepo();
			this.menu[1].children = syncMenus;

			const syncIds: string[] = [];
			for (let i = 0; i < syncMenus.length; i++) {
				const selfMenu: SyncRepoMineType = syncMenus[i];
				// if (selfMenu.type === 'mine') {
				if (selfMenu.id) {
					syncIds.push(selfMenu.id);
				}
				// }
			}

			console.log('syncIds ===>', syncIds);

			menuStore.addSyncUpdateRepos(syncIds);
		},

		async fetchShareInfo(repo_id: string) {
			const dataAPI = dataAPIs(DriveType.Sync);
			const res: any = await (dataAPI as SyncDataAPI).fetchShareInfo(repo_id);
			return res;
		}
	}
});
