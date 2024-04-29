import { defineStore } from 'pinia';
import { app } from '../globals';
import { shareToUser } from '../api';
import { MenuItem, DataState, SYNC_STATE } from '../utils/contact';

export const syncStatusInfo: Record<number, { icon: string; color: string }> = {
	[SYNC_STATE.ING]: {
		icon: 'sym_r_sync',
		color: 'blue'
	},
	[SYNC_STATE.INIT]: {
		icon: 'sym_r_sync',
		color: 'blue'
	},
	[SYNC_STATE.WAITING]: {
		icon: 'sym_r_sync',
		color: 'blue'
	},
	[SYNC_STATE.DONE]: {
		icon: 'sym_r_check_circle',
		color: 'green'
	},
	[SYNC_STATE.ERROR]: {
		icon: 'sym_r_sync_problem',
		color: 'red'
	},
	[-1]: {
		icon: 'sym_r_pause_circle',
		color: 'yellow'
	}
};

export const useMenuStore = defineStore('filesMenu', {
	state: () => {
		return {
			showShareUser: false,
			shareRepoInfo: null,
			syncReposLastStatusMap: {},
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

			for (let index = 0; index < repo_ids.length; index++) {
				const repo_id = repo_ids[index];
				if (this.syncRepoIdsList.find((e) => e === repo_id)) {
					continue;
				}

				this.syncRepoIdsList.push(repo_id);
			}
			this.checkRepoSyncStatus();
		},
		async checkRepoSyncStatus() {
			if (this.syncReposTimer) {
				clearInterval(this.syncReposTimer);
			}
			this.syncReposTimer = setInterval(async () => {
				for (let index = 0; index < this.syncRepoIdsList.length; index++) {
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
			}, 1000);
		},
		closeSync() {
			if (this.syncReposTimer) {
				clearInterval(this.syncReposTimer);
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
		}
	}
});
