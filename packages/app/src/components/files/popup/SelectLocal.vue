<template>
	<q-dialog class="card-dialog" v-model="show" ref="dialogRef">
		<q-card class="card-continer" flat>
			<terminus-dialog-bar
				:label="`${t('prompts.syncRepo')}: ${item?.repo_name}`"
				icon=""
				titAlign="text-left"
				@close="close"
			/>

			<div class="card-content">
				<div class="text-caption text-grey-8 q-mb-xs">
					{{ t('download_location') }}
				</div>
				<div class="row items-center justify-center">
					<q-input outlined v-model="savePath" dense style="flex: 1" />
					<div class="viewBtn text-subtitle3" @click="selectSyncPath">
						{{ t('select') }}
					</div>
				</div>
			</div>
			<terminus-dialog-footer
				:okText="t('complete')"
				:cancelText="t('cancel')"
				showCancel
				:loading="loading"
				@close="close"
				@submit="submit"
			/>
		</q-card>
	</q-dialog>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { useDataStore } from '../../../stores/data';
import { useFilesStore } from '../../../stores/files';
import { getParams } from '../../../utils/utils';

import TerminusDialogBar from '../../common/TerminusDialogBar.vue';
import TerminusDialogFooter from '../../common/TerminusDialogFooter.vue';
import { useI18n } from 'vue-i18n';

const { dialogRef } = useDialogPluginComponent();

const props = defineProps({
	item: {
		type: Object,
		required: false
	}
});

const store = useDataStore();
const filesStore = useFilesStore();
const savePath = ref<string>('');
const show = ref(true);
const loading = ref(false);

const $q = useQuasar();

const { t } = useI18n();

filesStore.resetSelected();

const submit = async () => {
	if ($q.platform.is.electron) {
		const repo_id = getParams(props.item?.path, 'id');
		window.electron.api.files.repoAddSync({
			worktree: savePath.value,
			repo_id: repo_id,
			name: props.item?.name,
			password: '',
			readonly: props.item?.permission == 'r'
		});
	}
};

const selectSyncPath = async () => {
	if ($q.platform.is.electron) {
		savePath.value = await window.electron.api.files.selectSyncSavePath();
	}
};

const close = () => {
	store.closeHovers();
};

onMounted(async () => {
	if ($q.platform.is.electron) {
		savePath.value = await window.electron.api.files.defaultSyncSavePath();
	}
});
</script>

<style lang="scss" scoped>
.card-dialog {
	.card-continer {
		width: 400px;
		border-radius: 12px;

		.dialog-desc {
			padding-left: 20px;
			padding-right: 20px;
		}
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
</style>
