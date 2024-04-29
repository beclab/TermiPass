import { defineStore } from 'pinia';
import { ITransferFile } from '../platform/electron/interface';
import { notifySuccess } from '../utils/notifyRedefinedUtil';
import { i18n } from '../boot/i18n';

export enum MenuType {
	// Upload,
	Download,
	Complete
}

export type DataState = {
	activeItem: MenuType;
	menus: {
		label: string;
		icon: string;
		key: string;
		children: {
			label: string;
			icon: string;
			key: string;
		}[];
	}[];
	datas: ITransferFile[];
	hasRegisterListen: boolean;
	transferPageActive: boolean;
	selectList: ITransferFile[];
};

export const useTransferStore = defineStore('transfer', {
	state: () => {
		return {
			menus: [
				{
					label: i18n.global.t('transmission.title'),
					key: 'transmission',
					icon: '',
					children: [
						{
							label: i18n.global.t('transmission.download.title'),
							icon: 'sym_r_browser_updated',
							key: `${MenuType.Download}`
						},
						{
							label: i18n.global.t('transmission.complete.title'),
							icon: 'sym_r_file_download_done',
							key: `${MenuType.Complete}`
						}
					]
				}
				// {
				// 	name: 'Upload',
				// 	icon: 'sym_r_cloud_download',
				// 	type: MenuType.Upload
				// },
			],
			activeItem: MenuType.Download,
			hasRegisterListen: false,
			transferPageActive: false,
			datas: [
				// {
				//   id: '',
				//   fileName: 'string',
				//   icon: 'string',
				//   totalBytes: 1,
				//   front: 1,
				//   from: 'string',
				//   to: 'string',
				//   startTime: 1,
				//   endTime: 1,
				//   openPath: '',
				//   speed: 1,
				//   progress: 0.3,
				//   leftTimes: 1,
				//   paused: false
				// } as any
			],
			selectList: []
		} as DataState;
	},

	getters: {},

	actions: {
		addTransferEventListener() {
			this.refreshData();
			if (this.hasRegisterListen) {
				return;
			}

			if (!window.electron || !window.electron.api) {
				return;
			}

			window.electron.api.download.listenerNewDownloadItem((_event, item) => {
				if (this.activeItem == MenuType.Download) {
					this.refreshData();
				}
				notifySuccess(
					i18n.global.t('transmission.download.start_notify', {
						fileName: item.fileName
					})
				);
			});

			window.electron.api.download.listenerDownloadItemUpdate(() => {
				if (this.activeItem == MenuType.Download) {
					this.refreshData();
				}
			});

			window.electron.api.download.listenerDownloadItemDone((_event, item) => {
				if (
					this.activeItem == MenuType.Download ||
					this.activeItem == MenuType.Complete
				) {
					this.refreshData();
				}
				notifySuccess(
					i18n.global.t('transmission.download.completed_notify', {
						fileName: item.fileName
					})
				);
			});
		},

		async refreshData() {
			if (!window.electron) {
				return;
			}
			if (this.activeItem == MenuType.Complete) {
				this.datas = await window.electron.api.transfer.getCompleteData();
			} else if (this.activeItem == MenuType.Download) {
				this.datas = await window.electron.api.transfer.getDownloadData();
			} else {
				this.datas = await window.electron.api.transfer.getUploadData();
			}
		},

		formatFileSize(bytes: number, isUnit?: boolean) {
			const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
			isUnit = isUnit ?? true;

			if (bytes === 0) {
				return isUnit ? '0B' : '0';
			}

			const i = Math.floor(Math.log(bytes) / Math.log(1024));
			if (i === 0) {
				return bytes + (isUnit ? sizes[i] : '');
			}
			return (bytes / 1024 ** i).toFixed(2) + (isUnit ? sizes[i] : '');
		},

		formatLeftTimes(leftTimes: number) {
			if (leftTimes == -1) {
				return '--';
			}
			const seconds = (leftTimes % 60).toFixed(0);
			const minutes = leftTimes / 60;
			const hours = minutes / 60;
			return (
				hours.toFixed(0) +
				':' +
				minutes.toFixed(0).padStart(2, '0') +
				':' +
				seconds.padStart(2, '0') +
				''
			);
		}
	}
});
