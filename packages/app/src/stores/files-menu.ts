import { defineStore } from 'pinia';
import { app } from '../globals';
import { shareToUser } from '../api';
import { MenuItem, DataState, SYNC_STATE } from '../utils/contact';
import { busOn } from 'src/utils/bus';
// import { dataAPI } from './../api';
import { dataAPIsa } from './../api';
import { SyncRepoMineType, SyncRepoSharedType } from '../api/common/encoding';
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
			activeMenu: 'Home',
			menu: [
				{
					label: MenuItem.DRIVE,
					key: MenuItem.DRIVE,
					icon: '',
					children: [
						{
							label: MenuItem.HOME,
							key: MenuItem.HOME,
							icon: 'sym_r_other_houses'
						},
						{
							label: MenuItem.DOCUMENTS,
							key: MenuItem.DOCUMENTS,
							icon: 'sym_r_news'
						},
						{
							label: MenuItem.PICTURES,
							key: MenuItem.PICTURES,
							icon: 'sym_r_art_track'
						},
						{
							label: MenuItem.MOVIES,
							key: MenuItem.MOVIES,
							icon: 'sym_r_smart_display'
						},
						{
							label: MenuItem.DOWNLOADS,
							key: MenuItem.DOWNLOADS,
							icon: 'sym_r_browser_updated'
						}
					]
				},
				{
					label: MenuItem.SYNC,
					key: MenuItem.SYNC,
					icon: '',
					children: []
					// children: [
					// {
					// 	label: MenuItem.MYLIBRARIES,
					// 	key: 'MyLibraries',
					// 	icon: 'sym_r_library_books',
					// 	expationFlag: true,
					// 	children: []
					// },
					// {
					// 	label: MenuItem.SHAREDWITH,
					// 	key: 'SharedLibraries',
					// 	icon: 'sym_r_folder_copy',
					// 	expationFlag: false,
					// 	children: []
					// }
					// ]
				},
				{
					label: MenuItem.APPLICATION,
					key: MenuItem.APPLICATION,
					icon: '',
					children: [
						{
							label: MenuItem.DATA,
							key: MenuItem.DATA,
							icon: 'bi-database'
						},
						{
							label: MenuItem.CACHE,
							key: MenuItem.CACHE,
							icon: 'bi-file-bar-graph'
						}
					]
				}
			],
			userList: [],
			sharedItems: [],
			avtiveItem: null,
			syncStatus: false,
			disableMenuItem: [
				MenuItem.HOME,
				MenuItem.DOCUMENTS,
				MenuItem.PICTURES,
				MenuItem.MOVIES,
				MenuItem.DOWNLOADS,
				MenuItem.DATA,
				MenuItem.CACHE
			]
		} as DataState;
	},

	getters: {
		// path: '/Files/Seahub/' + item.label + '/',
		currentItemDefaultPath(): string {
			return '/Files/Seahub/' + this.avtiveItem.label + '/';
		},
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
			const menu = JSON.parse(JSON.stringify(menuStore.getMenu()));
			const dataAPI = dataAPIsa();
			const [res2, res3]: any = await dataAPI.fetchSyncRepo(
				MenuItem.SHAREDWITH
			);
			const shareChildren: SyncRepoSharedType[] = [];
			for (let i = 0; i < res2.length; i++) {
				const el = res2[i];
				const hsaShareRepo = shareChildren.find(
					(item) => item.id === el.repo_id
				);
				if (hsaShareRepo) {
					continue;
				}

				shareChildren.push({
					label: el.repo_name,
					key: el.repo_id,
					icon: 'sym_r_folder_shared',
					id: el.repo_id,
					defaultHide: true,
					...el
				});
			}

			const sharedme: SyncRepoSharedType[] = [];
			for (let i = 0; i < res3.length; i++) {
				const el = res3[i];
				sharedme.push({
					label: el.repo_name,
					key: el.repo_id,
					name: el.repo_name,
					icon: 'sym_r_folder_supervised',
					id: el.repo_id,
					defaultHide: true,
					...el
				});
			}

			const res1: any = await dataAPI.fetchSyncRepo(MenuItem.MYLIBRARIES);
			const mineChildren: SyncRepoMineType[] = [];
			for (let i = 0; i < res1.length; i++) {
				const el = res1[i];

				const hasShareWith = shareChildren.find(
					(item) => item.repo_id === el.repo_id
				);
				const hasShareMe = sharedme.find((item) => item.repo_id === el.repo_id);
				const hasShare = hasShareWith || hasShareMe;

				mineChildren.push({
					label: el.repo_name,
					key: el.repo_id,
					icon: 'sym_r_folder',
					id: el.repo_id,
					name: el.repo_name,
					shard_user_hide_flag: hasShare ? false : true,
					share_type: hasShare ? hasShare.share_type : undefined,
					user_email: hasShare ? hasShare.user_email : undefined,
					defaultHide: true,
					...el
				});
			}

			const myLibraries = {
				label: MenuItem.MYLIBRARIES,
				key: 'MyLibraries',
				icon: '',
				expationFlag: true,
				muted: true,
				disableClickable: true
			};
			const shardWith = {
				label: MenuItem.SHAREDWITH,
				key: 'SharedLibraries',
				icon: '',
				expationFlag: false,
				muted: true,
				disableClickable: true
			};

			for (let index = 0; index < menu.length; index++) {
				const el = menu[index];
				if (el.label === MenuItem.SYNC) {
					let shardArr: any = [];
					if (shareChildren.length > 0 || sharedme.length > 0) {
						shardArr = [shardWith, ...shareChildren, ...sharedme];
					}
					el.children = [myLibraries, ...mineChildren, ...shardArr];
				}
			}

			menuStore.menu = menu;

			const syncIds = mineChildren
				.map((e) => e.id)
				.concat(shareChildren.map((e) => e.id));

			menuStore.addSyncUpdateRepos(syncIds);
		}
	}
});
