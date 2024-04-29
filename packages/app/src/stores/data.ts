import { defineStore } from 'pinia';
import { useUserStore } from './user';
import { baseURL as fileBaseURL } from '../utils/constants';
import { MenuItem, FilesSortType } from '../utils/contact';

export type CopyFromMode = 'Sync' | 'Drive' | '';

export type DataState = {
	user: any;
	req: any;
	oldReq: any;
	jwt: string;
	progress: number;
	loading: boolean;
	reload: boolean;
	selected: any;
	multiple: boolean;
	show: any;
	showShell: boolean;
	showConfirm: any;
	currentItem: string;
	showUploadModal: boolean;

	copyFiles: any;
	copyFrom: CopyFromMode;

	//mobile add
	activeMenu: MenuItem;
	// activeSort: FilesSortType;
	activeSort: {
		by: FilesSortType;
		asc: boolean;
	};

	preview: {
		isEditEnable: boolean;
		isEditing: boolean;
		isSaving: boolean;
		fullSize: boolean;
		isShow: boolean;
	};
};

export const useDataStore = defineStore('data', {
	state: () => {
		return {
			user: {
				viewMode: 'list'
			},
			req: {},
			oldReq: {},
			jwt: '',
			progress: 0,
			loading: false,
			reload: false,
			selected: [],
			multiple: false,
			show: null,
			showShell: false,
			showConfirm: null,
			currentItem: 'Home',
			showUploadModal: false,
			copyFiles: [],
			activeMenu: MenuItem.HOME,
			activeSort: {
				by: FilesSortType.Modified,
				asc: true
			},
			preview: {
				isEditEnable: false,
				isEditing: false,
				isSaving: false,
				fullSize: false,
				isShow: false
			}
		} as DataState;
	},

	getters: {
		isLogged(state) {
			return state.user !== null;
		},

		selectedCount: (state) => state.selected.length,
		currentItemDefaultPath(): string {
			if (this.currentItem == 'Data') {
				return '/Files/Application';
			}
			if (this.currentItem == 'Cache') {
				return '/Files/AppData';
			}
			return (
				'/Files/Home/' +
				(this.currentItem && this.currentItem != 'Home'
					? this.currentItem + '/'
					: '')
			);
		}
	},

	actions: {
		isFiles(route: any) {
			return (
				!this.loading &&
				(route.name === 'Files' ||
					route.name === 'Application' ||
					route.name === 'Seahub')
			);
		},

		isListing(route: any) {
			return (
				!this.loading &&
				(route.name === 'Files' ||
					route.name === 'Application' ||
					route.name === 'AppData' ||
					route.name === 'Seahub') &&
				this.req.isDir
			);
		},

		sortList(list: any) {
			if (list) {
				const list1 = list.sort((a, b) => {
					if (this.activeSort.by == FilesSortType.TYPE) {
						return this.activeSort.asc
							? a.type.localeCompare(b.type)
							: -a.type.localeCompare(b.type);
					} else if (this.activeSort.by == FilesSortType.NAME) {
						return this.activeSort.asc
							? a.name.localeCompare(b.name)
							: -a.name.localeCompare(b.name);
					} else if (this.activeSort.by == FilesSortType.SIZE) {
						return this.activeSort.asc ? a.size - b.size : b.size - a.size;
					} else {
						if (typeof a.modified == 'string') {
							return this.activeSort.asc
								? a.modified.localeCompare(b.modified)
								: -a.modified.localeCompare(b.modified);
						} else {
							return this.activeSort.asc
								? a.modified - b.modified
								: b.modified - a.modified;
						}
					}
				});
				return list1;
			}
		},

		closeHovers() {
			this.show = null;
			this.showConfirm = null;
		},

		toggleShell() {
			this.showShell = !this.showShell;
		},

		showHover(value: any) {
			if (typeof value !== 'object') {
				this.show = value;
				return;
			}
			this.show = value.prompt;
			this.showConfirm = value.confirm;
		},

		showError() {
			this.show = 'error';
		},

		showSuccess() {
			this.show = 'success';
		},

		setLoading(value: any) {
			this.loading = value;
		},

		setReload(value: any) {
			this.reload = value;
		},

		setUser(value: any) {
			if (value === null) {
				this.user = null;
				return;
			}
			this.user = value;
		},

		setJWT(value: any) {
			this.jwt = value;
		},

		setMultiple(value: any) {
			this.multiple = value;
		},

		addSelected(value: any) {
			this.selected.push(value);
		},

		removeSelected(value: any) {
			const i = this.selected.indexOf(value);
			if (i === -1) return;
			this.selected.splice(i, 1);
		},

		resetSelected() {
			this.selected = [];
		},

		updateUser(value: any) {
			if (typeof value !== 'object') return;
			for (const field in value) {
				if (field === 'id') {
					this.user.id = value[field];
				}
				if (field === 'viewMode') {
					this.user.viewMode = value[field];
				}
			}
		},

		updateRequest(value: any) {
			this.oldReq = this.req;
			this.req = value;
		},

		resetRequest() {
			this.req = this.oldReq;
		},

		changeItemMenu(item: string) {
			this.currentItem = item;
		},

		changeUploadModal(show: boolean) {
			this.showUploadModal = show;
		},

		updateCopyFiles(item: any, copyFrom: CopyFromMode) {
			this.copyFiles = item;
			this.copyFrom = copyFrom;
		},

		resetCopyFiles() {
			this.copyFiles = [];
			this.copyFrom = '';
		},

		baseURL() {
			const user = useUserStore();

			if (process.env.NODE_ENV === 'development') {
				return fileBaseURL;
			} else {
				if (
					process.env.PLATFORM == 'DESKTOP' ||
					process.env.PLATFORM == 'MOBILE'
				) {
					const baseURL = user.getModuleSever('files');
					return baseURL;
				} else {
					return fileBaseURL;
				}
			}
		},

		updateActiveMenu(activeMenu: MenuItem) {
			this.activeMenu = activeMenu;
		},

		updateActiveSort(type: FilesSortType, asc: boolean) {
			this.activeSort = {
				by: type,
				asc
			};
			this.req.items = this.sortList(this.req.items);
		}
	}
});
