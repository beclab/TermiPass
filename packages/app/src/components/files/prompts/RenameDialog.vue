<template>
	<q-dialog class="card-dialog" v-model="show" ref="dialogRef" @hide="onCancel">
		<q-card class="card-continer" flat>
			<terminus-dialog-bar
				:label="t('prompts.rename')"
				icon=""
				titAlign="text-left"
				@close="onCancel"
			/>

			<div class="card-content">
				<div class="text-body3 text-ink-3 q-mb-xs">
					{{ t('prompts.renameMessage') }}
				</div>
				<input
					class="input input--block text-ink-1"
					v-focus
					type="text"
					v-model.trim="name"
				/>
			</div>

			<terminus-dialog-footer
				:okText="t('confirm')"
				:cancelText="t('cancel')"
				showCancel
				:loading="loading"
				@close="onCancel"
				@submit="submit"
			/>
		</q-card>
	</q-dialog>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
// import { files as api, seahub } from '../../../api';
// import url from '../../../utils/url';
import { useDataStore } from '../../../stores/data';
// import { checkSeahub } from '../../../utils/file';
import { useI18n } from 'vue-i18n';
import { useSeahubStore } from '../../../stores/seahub';
import { useFilesStore } from '../../../stores/files';
import {
	notifyHide,
	notifyWaitingShow
} from '../../../utils/notifyRedefinedUtil';
import { dataAPIs } from '../../../api';
import { useMenuStore } from '../../../stores/files-menu';

import TerminusDialogBar from '../../common/TerminusDialogBar.vue';
import TerminusDialogFooter from '../../common/TerminusDialogFooter.vue';

const name = ref();
const store = useDataStore();
const router = useRouter();
const route = useRoute();
const repo = useSeahubStore();
const filesStore = useFilesStore();
const menuStore = useMenuStore();
const { t } = useI18n();
const show = ref(true);
const loading = ref(false);

const { dialogRef, onDialogCancel, onDialogOK } = useDialogPluginComponent();

onMounted(() => {
	console.log('fileStorecurrentFileList', filesStore.currentFileList);
	name.value = oldName();
});

const oldName = () => {
	if (!store.isListing) {
		return filesStore.currentFileList[0];
	}
	return filesStore.currentFileList[filesStore.selected[0]].name;
};

// let notif: any = null;

const submit = async () => {
	const dataAPI = dataAPIs();

	notifyWaitingShow('Renaming...');
	loading.value = true;

	try {
		await dataAPI.renameItem(
			filesStore.currentFileList[filesStore.selected[0]],
			name.value
		);

		onDialogOK();
		loading.value = false;
		filesStore.resetSelected();
		filesStore.setBrowserUrl(route.fullPath, menuStore.activeMenu.driveType);
		notifyHide();
	} catch (error) {
		loading.value = false;
		notifyHide();
	}

	// let oldLink = '';
	// let newLink = '';
	// let isPreview = false;

	// let isDir = false;

	// if (name.value.length == 0) {
	// 	return;
	// }

	// if (!store.isListing) {
	// 	oldLink = store.req.url;
	// } else {
	// 	if (filesStore.currentFileList) {
	// 		oldLink = filesStore.currentFileList[filesStore.selected[0]].url;
	// 		isDir = filesStore.currentFileList[filesStore.selected[0]].isDir;
	// 	} else {
	// 		oldLink = store.req.url;
	// 		isPreview = true;
	// 	}
	// }

	// newLink = url.removeLastDir(oldLink) + '/' + encodeURIComponent(name.value);

	// // notif && notif();
	// notifyHide();
	// notifyWaitingShow('Renaming...');
	// loading.value = true;

	// if (checkSeahub(newLink)) {
	// 	if (!repo.repo_id) {
	// 		const id = filesStore.currentFileList[filesStore.selected[0]].id;
	// 		const url = `seahub/api2/repos/${id}/?op=rename`;
	// 		const data = {
	// 			repo_name: name.value
	// 		};
	// 		await seahub.reRepoName(url, data);
	// 		store.setReload(true);
	// 		notifyHide();
	// 		return false;
	// 	}

	// 	const pathLen =
	// 		oldLink.indexOf(store.currentItem) + store.currentItem.length;

	// 	const p = oldLink.slice(pathLen);

	// 	const parmas = {
	// 		operation: 'rename',
	// 		newname: name.value
	// 	};

	// 	const url = 'api/v2.1/repos';
	// 	await seahub.fileOperate(p, url, parmas, isDir ? 'dir' : 'file');
	// 	store.setReload(true);
	// 	notifyHide();
	// 	loading.value = false;
	// 	return false;
	// }

	// try {
	// 	await api.rename(oldLink, newLink);
	// 	if (!store.isListing || isPreview) {
	// 		r.push({ path: newLink });
	// 		return;
	// 	}
	// 	store.setReload(true);
	// 	notifyHide();
	// 	loading.value = false;
	// } catch (e) {
	// 	store.showError();
	// 	notifyHide();
	// 	loading.value = false;
	// }
	// notifyHide();
	// loading.value = false;

	// store.closeHovers();
};

const onCancel = () => {
	onDialogCancel();
	store.closeHovers();
};
</script>

<style lang="scss" scoped>
.card-dialog {
	.card-continer {
		width: 400px;
		border-radius: 8px;

		.card-content {
			padding: 0 20px;
			.input {
				border-radius: 5px;
				border: 1px solid $input-stroke;
				background-color: transparent;
				&:focus {
					border: 1px solid $yellow-disabled;
				}
			}
		}
	}
}
</style>
