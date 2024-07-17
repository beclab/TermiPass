import { defineStore } from 'pinia';
import { useUserStore } from './user';
import { baseURL as fileBaseURL } from '../utils/constants';
import { MenuItem } from '../utils/contact';
import { dataAPIs } from './../api';

// import { CopyStoragesType } from './operation';
// import { FileItem } from './files';

export type DataState = {
	user: any;
	req: any;
	oldReq: any;
	jwt: string;
	progress: number;
	loading: boolean;
	reload: boolean;
	// selected: any;
	show: any;
	showShell: boolean;
	showConfirm: any;
	currentItem: string;
	showUploadModal: boolean;
	// copyFiles: {
	// 	items: any;
	// 	from: DriveType;
	// };

	//mobile add
	activeMenu: MenuItem;
	// activeSort: FilesSortType;

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
			// selected: [],
			show: null,
			showShell: false,
			showConfirm: null,
			currentItem: 'Home',
			showUploadModal: false,
			// copyFiles: {
			// 	items: [],
			// 	from: DriveType.Drive
			// },
			activeMenu: MenuItem.HOME,
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
		}

		// selectedCount: (state) => state.selected.length
	},

	actions: {
		async fetchList(url: string) {
			const dataAPI = dataAPIs();
			console.log('dataAPI', dataAPI);
			return dataAPI.fetch(url);
		},

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

		// addSelected(value: any) {
		// 	this.selected.push(value);
		// },

		// removeSelected(value: any) {
		// 	const i = this.selected.indexOf(value);
		// 	if (i === -1) return;
		// 	this.selected.splice(i, 1);
		// },

		// resetSelected() {
		// 	this.selected = [];
		// },

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

		// updateCopyFiles(copyStorages: {
		// 	items: CopyStoragesType[];
		// 	from: DriveType;
		// }) {
		// 	this.copyFiles = copyStorages;
		// },

		// resetCopyFiles() {
		// 	this.copyFiles = {
		// 		items: [],
		// 		from: DriveType.Drive
		// 	};
		// },

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
		}
	}
});
