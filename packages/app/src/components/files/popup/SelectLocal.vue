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
import { useFilesStore } from '../../../stores/files';

import TerminusDialogBar from '../../common/TerminusDialogBar.vue';
import TerminusDialogFooter from '../../common/TerminusDialogFooter.vue';
import { useI18n } from 'vue-i18n';

const { dialogRef, onDialogCancel, onDialogOK } = useDialogPluginComponent();

const props = defineProps({
	item: {
		type: Object,
		required: false
	}
});

const filesStore = useFilesStore();
const savePath = ref<string>('');
const show = ref(true);
const loading = ref(false);

const $q = useQuasar();

const { t } = useI18n();

filesStore.resetSelected();

const submit = async () => {
	if ($q.platform.is.electron) {
		window.electron.api.files.repoAddSync({
			worktree: savePath.value,
			repo_id: props.item?.repo_id,
			name: props.item?.name,
			password: '',
			readonly: props.item?.permission == 'r'
		});
	}
	onDialogOK();
};

const selectSyncPath = async () => {
	if ($q.platform.is.electron) {
		savePath.value = await window.electron.api.files.selectSyncSavePath();
	}
};

const close = () => {
	onDialogCancel();
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

		.card-content {
			padding: 0 20px;

			.input {
				border-radius: 5px;

				&:focus {
					border: 1px solid $blue;
				}
			}

			.viewBtn {
				background: $yellow-1;
				border-radius: 8px;
				width: 76px;
				height: 32px;
				line-height: 32px;

				text-align: center;
				margin-left: 20px;
				cursor: pointer;
				color: $title;

				border: 1px solid $yellow;

				&:hover {
					background: $yellow-13;
				}
			}
		}
	}
}
</style>
