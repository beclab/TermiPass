<template>
	<q-dialog class="card-dialog" v-model="show" ref="dialogRef" @hide="onCancel">
		<q-card class="card-continer" flat>
			<terminus-dialog-bar
				:label="t('delete')"
				icon=""
				titAlign="text-left"
				@close="onCancel"
			/>
			<div
				class="dialog-desc"
				:style="{ textAlign: isMobile ? 'center' : 'left' }"
			>
				{{
					filesStore.selectedCount <= 1
						? t('prompts.deleteMessageSingle')
						: t('prompts.deleteMessageMultiple', {
								count: filesStore.selectedCount
						  })
				}}
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
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { ref } from 'vue';

import TerminusDialogBar from '../../common/TerminusDialogBar.vue';
import TerminusDialogFooter from '../../common/TerminusDialogFooter.vue';
import {
	notifyWaitingShow,
	notifyHide
} from '../../../utils/notifyRedefinedUtil';

import { useDataStore } from '../../../stores/data';
import { useFilesStore } from '../../../stores/files';
import { dataAPIs } from '../../../api';
import { useMenuStore } from '../../../stores/files-menu';

const store = useDataStore();
const filesStore = useFilesStore();
const { t } = useI18n();
const { dialogRef, onDialogCancel, onDialogOK } = useDialogPluginComponent();

const $q = useQuasar();
const route = useRoute();
const isMobile = ref(process.env.PLATFORM == 'MOBILE' || $q.platform.is.mobile);

const show = ref(true);
const loading = ref(false);
const menuStore = useMenuStore();

const submit = async () => {
	loading.value = true;
	notifyWaitingShow('Deleting, Please wait...');

	try {
		const selectFiles = filesStore.currentFileList.filter((obj) =>
			filesStore.selected.includes(obj.index)
		);

		console.log('selectFilesselectFiles', selectFiles);
		const dataAPI = dataAPIs();
		await dataAPI.deleteItem(selectFiles);

		const url = route.fullPath;
		onDialogOK();
		loading.value = false;
		filesStore.resetSelected();
		const splitUrl = url.split('?');
		await filesStore.setFilePath(
			{
				path: splitUrl[0],
				isDir: true,
				driveType: menuStore.activeMenu.driveType,
				param: splitUrl[1] ? `?${splitUrl[1]}` : ''
			},
			false,
			false
		);
		notifyHide();
	} catch (error) {
		notifyHide();
		loading.value = false;
	}
};

const onCancel = () => {
	store.closeHovers();
	onDialogCancel();
};
</script>

<style lang="scss" scoped>
.card-dialog {
	.card-continer {
		width: 400px;
		border-radius: 12px;

		.dialog-desc {
			padding-left: 20px;
		}
	}
}
</style>
