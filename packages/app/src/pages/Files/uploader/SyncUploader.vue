<template>
	<input
		id="uploader-input"
		className="upload-input"
		type="file"
		ref="uploadInput"
		multiple
	/>
</template>

<script lang="ts" setup>
import MD5 from 'MD5';
// import { watch } from 'vue';
import { useRoute } from 'vue-router';
import Resumablejs from '@seafile/resumablejs';
import { seafileAPI } from '../../../api/sync/seafileAPI';
import { useDataStore } from '../../../stores/data';
import { useMenuStore } from '../../../stores/files-menu';
import { useFilesUploadStore } from '../../../stores/files-upload';
import { DriveType } from '../../../stores/files';
import { detectType } from '../../../utils/utils';

import { ref, reactive, onMounted, onUnmounted } from 'vue';

const props = defineProps({
	repoID: String,
	filetypes: String,
	chunkSize: Number,
	withCredentials: Boolean,
	testMethod: String,
	testChunks: Number,
	fileParameterName: String,
	dragAndDrop: Boolean,
	path: String,
	isCustomPermission: Boolean
});

type uploadObjType = {
	maxNumberOfFilesForFileupload: number;
	maxUploadFileSize: number;
	resumableUploadFileBlockSize: number;
	simultaneousUploads: number;
};

const emits = defineEmits(['onFileUploadSuccess']);

const route = useRoute();
const dataStore = useDataStore();
const upload = useFilesUploadStore();
const menuStore = useMenuStore();

const retryFileList = ref<any[]>([]);
const uploadFileList = ref<any[]>([]);
const totalProgress = ref(0);
// const isUploadRemindDialogShow = ref(false);
// const currentResumableFile = ref(null);
const allFilesUploaded = ref(false);

const uploadInput = ref(null);
const notifiedFolders = ref<any[]>([]);

const isUploadLinkLoaded = ref(false);

let resumable: any = null;

const uploadObj = reactive<uploadObjType>({
	maxNumberOfFilesForFileupload: 99,
	maxUploadFileSize: 1000 * 50,
	resumableUploadFileBlockSize: 5,
	simultaneousUploads: 3
});

onMounted(() => {
	resumable = new Resumablejs({
		target: '',
		query: setQuery || {},
		fileType: [],
		maxFiles: uploadObj.maxNumberOfFilesForFileupload,
		maxFileSize: uploadObj.maxUploadFileSize * 1000 * 1000,
		testMethod: props.testMethod || 'post',
		testChunks: props.testChunks || false,
		headers: setHeaders || {},
		withCredentials: props.withCredentials || false,
		chunkSize:
			uploadObj.resumableUploadFileBlockSize * 1024 * 1024 || 1 * 1024 * 1024,
		simultaneousUploads: uploadObj.simultaneousUploads || 1,
		fileParameterName: props.fileParameterName,
		generateUniqueIdentifier: generateUniqueIdentifier,
		forceChunkSize: true,
		maxChunkRetries: 3,
		minFileSize: 0
	});

	resumable.assignBrowse(uploadInput.value, true);

	//Enable or Disable DragAnd Drop
	if (props.dragAndDrop === true) {
		resumable.enableDropOnDocument();
	}

	bindEventHandler();
});

onUnmounted(() => {
	if (props.dragAndDrop === true) {
		resumable.disableDropOnDocument();
	}
});

const bindEventHandler = () => {
	resumable.on('chunkingComplete', onChunkingComplete.bind(this));
	resumable.on('fileAdded', onFileAdded.bind(this));
	resumable.on('filesAddedComplete', filesAddedComplete.bind(this));
	// resumable.on('fileProgress', onFileProgress.bind(this));
	resumable.on('fileSuccess', onFileUploadSuccess.bind(this));
	resumable.on('progress', onProgress.bind(this));
	resumable.on('complete', onComplete.bind(this));
	resumable.on('fileError', onFileError.bind(this));
	resumable.on('error', onError.bind(this));
	resumable.on('dragstart', onDragStart.bind(this));

	resumable.on('pause', onPause.bind(this));
	resumable.on('fileRetry', onFileRetry.bind(this));
	resumable.on('beforeCancel', onBeforeCancel.bind(this));
	resumable.on('cancel', onCancel.bind(this));
};

const onChunkingComplete = (resumableFile) => {
	if (allFilesUploaded.value === true) {
		allFilesUploaded.value = false;
	}

	//get parent_dir relative_path
	let path = props.path === '/' ? '/' : props.path + '/';
	let fileName = resumableFile.fileName;
	let relativePath = resumableFile.relativePath;
	let isFile = fileName === relativePath;

	//update formdata
	resumableFile.formData = {};
	if (isFile) {
		// upload file
		resumableFile.formData = {
			parent_dir: path
		};
	} else {
		// upload folder
		let relative_path = relativePath.slice(
			0,
			relativePath.lastIndexOf('/') + 1
		);
		resumableFile.formData = {
			parent_dir: path,
			relative_path: relative_path
		};
	}
};

const onFileAdded = (resumableFile, files) => {
	let isFile = resumableFile.fileName === resumableFile.relativePath;

	// uploading is file and only upload one file
	if (isFile && files.length === 1) {
		setUploadFileList();
		let { repoID, path = '/' } = props;
		if (!repoID) return false;

		seafileAPI
			.getFileServerUploadLink(repoID, path)
			.then((res) => {
				const baseURL = dataStore.baseURL();
				resumable.opts.target = baseURL + res.data + '?ret-json=1';
				resumableUpload(resumableFile);
			})
			.catch((error) => {
				console.error('errMessage', error);
			});
		// }
	} else {
		setUploadFileList();
		if (!isUploadLinkLoaded.value) {
			isUploadLinkLoaded.value = true;
			let { repoID, path = '/' } = props;
			if (!repoID) return false;

			seafileAPI
				.getFileServerUploadLink(repoID, path)
				.then((res) => {
					const baseURL = dataStore.baseURL();
					resumable.opts.target = baseURL + res.data + '?ret-json=1';
					resumable.upload();
				})
				.catch((error) => {
					console.error('errMessage', error);
				});
		}
	}

	JoinDownloadProcess(files);
};

const JoinDownloadProcess = async (files: any) => {
	dataStore.changeUploadModal(true);

	for (let i = 0; i < files.length; i++) {
		let id = upload.id;
		let path = route.path + files[i].fileName + '/';
		let file = files[i].file;

		let item = {
			id,
			path: path,
			file,
			repo_name: menuStore.activeMenu.label,
			repo_id: menuStore.activeMenu.id,
			overwrite: false,
			...(!file.isDir && { type: detectType(file.type) })
		};

		await (function () {
			return new Promise(async function (res) {
				await upload.upload(item, DriveType.Sync);
				res(true);
			});
		})();
	}
};

const resumableUpload = (resumableFile) => {
	let { repoID, path } = props;
	if (!repoID) return false;

	seafileAPI
		.getFileUploadedBytes(repoID, path, resumableFile.fileName)
		.then((res) => {
			let uploadedBytes = res.data.uploadedBytes;
			let blockSize =
				uploadObj.resumableUploadFileBlockSize * 1024 * 1024 || 1024 * 1024;

			let offset = Math.floor(uploadedBytes / blockSize);

			resumableFile.markChunksCompleted(offset);
			resumable.upload();
		})
		.catch((error) => {
			console.error('errMessage000', error);
		});
};

const filesAddedComplete = (resumable, files) => {
	if (files.length === 0) {
		totalProgress.value = 100;
	}
};

const setUploadFileList = () => {
	let uploadFileListTemp = resumable.files;

	uploadFileList.value = uploadFileListTemp;
};

// const onFileProgress = (resumableFile) => {
// console.info('onFileProgress', resumableFile);
// let uploadFileListTemp = uploadFileList.value.map((item) => {
// 	return item;
// });
// uploadFileList.value = uploadFileListTemp;
// };

const onProgress = () => {
	let progress = Math.round(resumable.progress() * 100);
	totalProgress.value = progress;

	let uploadingList: any[] = [];
	let uploadedList: any[] = [];
	for (let i = 0; i < resumable.files.length; i++) {
		const el: any = resumable.files[i];
		el.process = Math.round(el.progress() * 100);
		if (el.isSaved || el.process === 100) {
			uploadedList.push(el);
		} else {
			uploadingList.push(el);
		}
	}
	uploadFileList.value = [...uploadingList, ...uploadedList];

	upload.processSyncUploads(uploadFileList.value);
};

const onFileUploadSuccess = (resumableFile, message) => {
	let formData = resumableFile.formData;
	let currentTime = new Date().getTime() / 1000;
	message = formData.replace ? message : JSON.parse(message)[0];
	if (formData.relative_path) {
		// upload folder
		let relative_path = formData.relative_path;
		let dir_name = relative_path.slice(0, relative_path.indexOf('/'));

		let dirent = {
			id: (message && message.id) || new Date().getTime(),
			name: dir_name,
			type: 'dir',
			mtime: currentTime
		};

		// update folders cache
		let isExist = notifiedFolders.value.some((item: any) => {
			return item.name === dirent.name;
		});
		if (!isExist) {
			notifiedFolders.value.push(dirent);
			// emits('onFileUploadSuccess', dirent);
		}

		// update uploadFileList
		let uploadFileListTemp = uploadFileList.value.map((item) => {
			if (item.uniqueIdentifier === resumableFile.uniqueIdentifier) {
				item.newFileName = relative_path + message.name;
				item.isSaved = true;
			}
			return item;
		});

		uploadFileList.value = uploadFileListTemp;
		// dataStore.setReload(true);
		return;
	}

	if (formData.replace) {
		// upload file -- replace exist file
		let fileName = resumableFile.fileName;
		// let dirent = {
		// 	id: (message && message.id) || new Date().getTime(),
		// 	name: fileName,
		// 	type: 'file',
		// 	mtime: currentTime
		// };
		// emits('onFileUploadSuccess', dirent);

		let uploadFileListTemp = uploadFileList.value.map((item) => {
			if (item.uniqueIdentifier === resumableFile.uniqueIdentifier) {
				item.newFileName = fileName;
				item.isSaved = true;
			}
			return item;
		});
		uploadFileList.value = uploadFileListTemp;
		// dataStore.setReload(true);
		return;
	}

	// upload file -- add files
	// let dirent = {
	// 	id: (message && message.id) || new Date().getTime(),
	// 	type: 'file',
	// 	name: message.name,
	// 	size: message.size,
	// 	mtime: currentTime
	// };

	// emits('onFileUploadSuccess', dirent); // this contance:  no repetition file

	let uploadFileListTemp = uploadFileList.value.map((item) => {
		if (item.uniqueIdentifier === resumableFile.uniqueIdentifier) {
			item.newFileName = message.name;
			item.isSaved = true;
		}
		return item;
	});

	uploadFileList.value = uploadFileListTemp;
	// dataStore.setReload(true);
};

const onFileError = (resumableFile, message) => {
	let error = '';
	if (!message) {
		error = 'Network error';
	} else {
		// eg: '{"error": "Internal error" \n }'
		let errorMessage = message.replace(/\n/g, '');
		errorMessage = JSON.parse(errorMessage);
		error = errorMessage.error;
	}

	let uploadFileListTemp = uploadFileList.value.map((item) => {
		if (item.uniqueIdentifier === resumableFile.uniqueIdentifier) {
			retryFileList.value.push(item);
			item.error = error;
		}
		return item;
	});

	uploadFileList.value = uploadFileListTemp;
};

const onComplete = () => {
	notifiedFolders.value = [];
	// reset upload link loaded
	isUploadLinkLoaded.value = false;
	allFilesUploaded.value = true;
};

const onError = () => {
	// reset upload link loaded
	isUploadLinkLoaded.value = false;
};

const onPause = () => {
	// console.log('onPause');
};

const onFileRetry = () => {
	// todo, cancel upload file, uploded again;
	// console.log('onFileRetry');
};

const onBeforeCancel = () => {
	// todo, giving a pop message ?
	// console.log('onBeforeCancel');
};

const onCancel = () => {
	// console.log('onCancel');
};

const setHeaders = (resumableFile, resumable) => {
	let offset = resumable.offset;
	let chunkSize = resumable.getOpt('chunkSize');
	let fileSize = resumableFile.size === 0 ? 1 : resumableFile.size;
	let startByte = offset !== 0 ? offset * chunkSize : 0;
	let endByte = Math.min(fileSize, (offset + 1) * chunkSize) - 1;

	if (
		fileSize - resumable.endByte < chunkSize &&
		!resumable.getOpt('forceChunkSize')
	) {
		endByte = fileSize;
	}

	let headers = {
		Accept: 'application/json; text/javascript, */*; q=0.01',
		'Content-Disposition':
			'attachment; filename="' + encodeURI(resumableFile.fileName) + '"',
		'Content-Range': 'bytes ' + startByte + '-' + endByte + '/' + fileSize
	};

	return headers;
};

const setQuery = (resumableFile) => {
	let formData = resumableFile.formData;
	return formData;
};

const generateUniqueIdentifier = (file) => {
	let relativePath =
		file.webkitRelativePath || file.relativePath || file.fileName || file.name;
	return MD5(relativePath + new Date()) + relativePath;
};

const onDragStart = () => {
	// console.log('onDragStart');
	// uploadInput.value.setAttribute('webkitdirectory', 'webkitdirectory');
};

const onCloseUploadDialog = () => {
	resumable.files = [];
	// reset upload link loaded
	isUploadLinkLoaded.value = false;
	uploadFileList.value = [];
};
</script>

<style lang="scss" scoped>
.upload-input {
	display: none;
}
</style>
