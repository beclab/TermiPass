<template>
	<input
		style="display: none"
		type="file"
		id="upload-input"
		@change="uploadInput($event)"
		multiple
	/>
	<input
		style="display: none"
		type="file"
		id="upload-folder-input"
		@change="uploadInput($event)"
		webkitdirectory
		multiple
	/>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { useDataStore } from '../../../stores/data';
import { checkConflict, createCopiedFile } from '../../../utils/upload';
import { detectType } from '../../../utils/utils';
import url from '../../../utils/url';
import { useFilesUploadStore } from '../../../stores/files-upload';
import { DriveType, useFilesStore } from '../../../stores/files';
import { useMenuStore } from '../../../stores/files-menu';

const store = useDataStore();
const route = useRoute();
const upload = useFilesUploadStore();
const filesStore = useFilesStore();
const menuStore = useMenuStore();

const uploadInput = async (event: any) => {
	store.closeHovers();
	if (!store.showUploadModal) {
		store.changeUploadModal(true);
	}
	let files = event.currentTarget.files;
	let folder_upload =
		files[0].webkitRelativePath !== undefined &&
		files[0].webkitRelativePath !== '';

	if (folder_upload) {
		for (let i = 0; i < files.length; i++) {
			let file = files[i];
			files[i].fullPath = file.webkitRelativePath;
		}
	}

	let path = route.path.endsWith('/')
		? decodeURIComponent(route.path)
		: decodeURIComponent(route.path) + '/';
	let conflict = checkConflict(files, filesStore.currentFileList);

	if (conflict) {
		const newfile = await createCopiedFile(files, filesStore.currentFileList);
		handleFiles(newfile, path, true);
		return;
	}

	handleFiles(files, path);
};

async function handleFiles(files, base, overwrite = false) {
	for (let i = 0; i < files.length; i++) {
		let id = upload.id;
		let path = base;
		let file = files[i];

		if (file.fullPath !== undefined) {
			path += url.encodePath(file.fullPath);
		} else {
			path += url.encodeRFC5987ValueChars(file.name);
		}

		if (file.isDir) {
			path += '/';
		}

		const item = {
			id,
			path,
			file,
			repo_name: menuStore.activeMenu.label,
			repo_id: '',
			overwrite,
			...(!file.isDir && { type: detectType(file.type) })
		};

		await (function () {
			return new Promise(async function (res) {
				await upload.upload(item, DriveType.Drive);
				res(true);
			});
		})();
	}
}
</script>
