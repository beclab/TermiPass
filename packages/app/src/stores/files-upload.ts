import { format } from 'quasar';
import { defineStore } from 'pinia';
import { dataAPIs, DriveDataAPI } from '../api';
// import { files as api } from '../api';
import throttle from 'lodash.throttle';
import { useDataStore } from './data';
import { OriginType } from '../api/common/encoding';
const { humanStorageSize } = format;

const UPLOADS_LIMIT = 5;
const beforeUnload = (event: any) => {
	event.preventDefault();
	event.returnValue = '';
};

const humanSize = (type: string, mode: number) => {
	return type == 'invalid_link' ? 'invalid link' : humanStorageSize(mode);
};

const promote = (arr: any[]) => {
	const progressingFile: any[] = [];
	const progressedFile: any[] = [];
	for (let i = 0; i < arr.length; i++) {
		if (arr[i].progress && arr[i].progress < 100 && arr[i].status !== 0) {
			progressingFile.push(arr[i]);
		} else {
			progressedFile.unshift(arr[i]);
		}
	}
	return [...progressingFile, ...progressedFile];
};

export type UploadState = {
	id: number;
	sizes: any;
	progress: any;
	queue: any;
	uploads: any;
	uploadQueue: any;
	timer: boolean;
};

export const useFilesUploadStore = defineStore('upload', {
	state: () => {
		return {
			id: 0,
			sizes: [],
			progress: [],
			queue: [],
			uploads: {},
			uploadQueue: [],
			timer: true
		} as UploadState;
	},
	getters: {
		getProgress(): any {
			if (this.progress?.length == 0) {
				return 0;
			}

			const totalSize = this.sizes.reduce((a: any, b: any) => a + b, 0);
			const sum = this.progress.reduce((acc: any, val: any) => acc + val);
			return Math.floor((sum / totalSize) * 100) > 100
				? 100
				: Math.floor((sum / totalSize) * 100);
		},

		filesInUploadCount(): any {
			const total = Object.keys(this.uploads).length + this.queue.length;
			return total;
		},

		filesInUpload(): any {
			for (const index in this.uploads) {
				const upload = this.uploads[index];

				const id = upload.id;
				const type = upload.type;
				const name = upload.file.name;
				const size = this.sizes[id];
				const isDir = upload.file.isDir;

				const progress =
					(isDir ? 100 : Math.floor((this.progress[id] / size) * 100)) || 0;
				const currentSize = upload.file.chunkNumber;
				const progressNumber = upload.file.progressSize;
				const progressSize = this.progress[id];
				const sizeFormat = size ? humanSize(type, size) : null;
				const progressFormat = progressSize
					? humanSize(type, progressSize)
					: null;

				const cIndex = this.uploadQueue.findIndex(
					(c: { id: any }) => c.id == id
				);

				this.uploadQueue[cIndex] = {
					...this.uploadQueue[cIndex],
					...{
						id,
						name,
						progress,
						type,
						isDir,
						size,
						progressSize,
						sizeFormat,
						progressFormat,
						currentSize,
						progressNumber
					}
				};
			}

			return promote(this.uploadQueue);
		}
	},

	actions: {
		setProgress({ id, loaded }: { id: any; loaded: any }) {
			this.progress[id] = loaded;
		},

		reset() {
			this.sizes = [];
			this.progress = [];
		},

		addJob(item: any) {
			this.queue.push(item);
			this.sizes[this.id] = item.file.size;
			this.id++;
		},

		moveJob() {
			const item = this.queue[0];
			this.queue.shift();
			this.uploads[item.id] = item;
		},

		removeJob(id: any) {
			delete this.uploads[id];
		},

		async upload(item: any, type: OriginType) {
			const uploadsCount = Object.keys(this.uploads).length;
			const isQueueEmpty = this.queue.length == 0;
			const isUploadsEmpty = uploadsCount == 0;
			if (isQueueEmpty && isUploadsEmpty) {
				window.addEventListener('beforeunload', beforeUnload);
			}
			if (!item.file.isDir) {
				this.uploadQueue.unshift(item);
			}
			this.addJob(item);

			if (type === OriginType.DRIVE) {
				this.processUploads();
			}
		},

		async finishUpload(item: any, type?: OriginType) {
			const store = useDataStore();
			// if (!from) {
			// 	store.setReload(true);
			// }
			this.setProgress({ id: item.id, loaded: item.file.size });
			for (let i = 0; i < this.uploadQueue.length; i++) {
				const el = this.uploadQueue[i];
				if (item.id === el.id) {
					el.status = 0;
					el.progressSize = el.size;
					el.progressFormat = el.sizeFormat;
					break;
				}
			}

			await this.removeJob(item.id);
			if (type !== OriginType.SYNC) {
				await this.processUploads();
			}
			store.setReload(true);
		},

		async processUploads() {
			const dataAPI = dataAPIs(OriginType.DRIVE);
			const uploadsCount = Object.keys(this.uploads).length;

			const isBellowLimit = uploadsCount < UPLOADS_LIMIT;
			const isQueueEmpty = this.queue.length == 0;
			const isUploadsEmpty = uploadsCount == 0;

			const isFinished = isQueueEmpty && isUploadsEmpty;
			const canProcess = isBellowLimit && !isQueueEmpty;

			if (isFinished) {
				window.removeEventListener('beforeunload', beforeUnload);
				this.reset();
			}

			if (canProcess) {
				const item = this.queue[0];
				this.moveJob();

				if (item.file.isDir) {
					await (dataAPI as DriveDataAPI).fetchUploader(
						item.path,
						'',
						false,
						0
					);
					this.finishUpload(item);
				} else {
					const onUpload = throttle(
						(event: any) => {
							this.setProgress({
								id: item.id,
								loaded: event.loaded
							});

							if (event.loaded >= event.total) {
								this.finishUpload(item);
							}
						},
						100,
						{ leading: true, trailing: false }
					);

					await (dataAPI as DriveDataAPI)
						.fetchUploader(item.path, item.file, item.overwrite, 0, onUpload)
						.then(() => {
							this.finishUpload(item);
						})
						.catch(() => {
							this.reStartUpload(item);
						});
				}
			}
		},

		reStartUpload(item: any) {
			this.progress[item.id] = 0;
			this.sizes[item.id] = 0;
			this.removeJob(item.id);
			for (let i = 0; i < this.uploadQueue.length; i++) {
				const el = this.uploadQueue[i];
				if (item.id === el.id) {
					el.status = 1;
					break;
				}
			}
		},

		async processSyncUploads(uploadFileList: any) {
			for (let i = 0; i < uploadFileList.length; i++) {
				const file = uploadFileList[i];
				const curFile = this.uploadQueue.find(
					(fil) => fil.file.name === file.fileName
				);

				if (curFile) {
					const queueHasFile = this.queue.find(
						(item) => item.file.name === curFile.file.name
					);
					if (queueHasFile) {
						this.moveJob();
					}

					const onUpload = throttle(
						() => {
							this.setProgress({
								id: curFile.id,
								loaded: Math.round(curFile.file.size * file.progress())
							});

							this.uploads[curFile.id] = curFile;

							if (file.progress() * 100 >= 100) {
								this.finishUpload(curFile, OriginType.SYNC);
							}
						},
						100,
						{ leading: true, trailing: false }
					);

					onUpload();
				}
			}
		}
	}
});
