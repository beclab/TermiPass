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
import { useDataStore } from '../../../stores/data';
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
	return filesStore.currentFileList[filesStore.selected[0]].name;
};

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
