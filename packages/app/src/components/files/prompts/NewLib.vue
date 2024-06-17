<template>
	<q-dialog class="card-dialog" v-model="show" ref="dialogRef" @hide="close">
		<q-card class="card-continer" flat>
			<terminus-dialog-bar
				:label="t('files.new_library')"
				icon=""
				titAlign="text-left"
				@close="close"
			/>

			<div class="card-content">
				<div class="text-body3 text-ink-3 q-mb-xs">
					{{ t('please_enter_a_library_name') }}
				</div>
				<input
					class="input input--block text-ink-1"
					v-focus
					type="text"
					v-model.trim="name"
				/>
			</div>

			<terminus-dialog-footer
				:okText="t('create')"
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
import { ref } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { createLibrary } from '../../../api/seahub';
import { sync } from '../../../api';
import { useDataStore } from '../../../stores/data';

import TerminusDialogBar from '../../common/TerminusDialogBar.vue';
import TerminusDialogFooter from '../../common/TerminusDialogFooter.vue';
import { useI18n } from 'vue-i18n';

const { dialogRef } = useDialogPluginComponent();

const store = useDataStore();
const name = ref<string>('');
const show = ref(true);
const loading = ref(false);

const { t } = useI18n();

const submit = async () => {
	if (name.value === '') return;
	loading.value = true;
	try {
		await createLibrary(name.value);
		loading.value = false;
	} catch (e) {
		loading.value = false;
	}

	sync.getSyncMenu();
	store.setReload(true);
	store.closeHovers();
};

const close = () => {
	store.closeHovers();
};
</script>

<style lang="scss" scoped>
.card-dialog {
	box-shadow: none !important;
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
