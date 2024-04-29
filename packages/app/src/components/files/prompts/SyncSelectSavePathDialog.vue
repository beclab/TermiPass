<template>
	<q-dialog class="card-dialog" v-model="show" ref="dialogRef">
		<q-card class="card-continer">
			<terminus-dialog-bar
				:label="`${t('prompts.syncRepo')}: ${item.repo_name}`"
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

import TerminusDialogBar from '../../common/TerminusDialogBar.vue';
import TerminusDialogFooter from '../../common/TerminusDialogFooter.vue';
import { useI18n } from 'vue-i18n';

const { dialogRef } = useDialogPluginComponent();

const store = useDataStore();
const savePath = ref<string>('');
const show = ref(true);
const loading = ref(false);
const item = ref(store.selected[0]);

const $q = useQuasar();

const { t } = useI18n();

store.resetSelected();

const submit = async () => {
	store.closeHovers();
	if ($q.platform.is.electron) {
		window.electron.api.files.repoAddSync({
			worktree: savePath.value,
			repo_id: item.value.repo_id,
			name: item.value.repo_name,
			password: '',
			readonly: item.value.permission == 'r'
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
