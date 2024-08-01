<template>
	<q-dialog class="card-dialog" v-model="show" ref="dialogRef">
		<q-card class="card-continer" flat>
			<terminus-dialog-bar
				:label="t('prompts.newDir')"
				titAlign="text-left"
				@close="store.closeHovers()"
			/>

			<div class="card-content">
				<p class="text-ink-3">{{ t('prompts.newFileMessage') }}</p>
				<input
					class="input input--block text-ink-1"
					v-focus
					ref="inputRef"
					type="text"
					@keyup.enter="submit"
					v-model.trim="name"
				/>
			</div>

			<terminus-dialog-footer
				:okText="t('buttons.create')"
				:cancelText="t('buttons.cancel')"
				showCancel
				:loading="loading"
				@close="store.closeHovers()"
				@submit="submit"
			/>
		</q-card>
	</q-dialog>
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue';
import { useDataStore } from '../../../stores/data';
import { useSeahubStore } from '../../../stores/seahub';
import { dataAPIs } from '../../../api';
import { useMenuStore } from '../../../stores/files-menu';
import { useFilesStore } from '../../../stores/files';

import TerminusDialogBar from '../../common/TerminusDialogBar.vue';
import TerminusDialogFooter from '../../common/TerminusDialogFooter.vue';

import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const store = useDataStore();
const seahubStore = useSeahubStore();
const menuStore = useMenuStore();
const filesStore = useFilesStore();
const name = ref<string>('');
const route = useRoute();
const inputRef = ref();
const show = ref(true);
const { t } = useI18n();
const loading = ref(false);

const submit = async (_event: any) => {
	if (name.value === '') return;
	const dataAPI = dataAPIs();
	loading.value = true;

	try {
		await dataAPI.createDir(name.value, route.path);
		const splitUrl = route.fullPath.split('?');
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
		loading.value = false;
		store.closeHovers();
	} catch (error) {
		console.log(error);
	}
};

nextTick(() => {
	setTimeout(() => {
		inputRef.value && inputRef.value.focus();
	}, 100);
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
