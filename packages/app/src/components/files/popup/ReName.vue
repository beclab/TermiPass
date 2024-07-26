<template>
	<q-dialog class="card-dialog" v-model="showDialog" ref="dialogRef">
		<q-card class="card-continer" flat>
			<terminus-dialog-bar
				:label="$t('prompts.rename')"
				icon=""
				titAlign="text-left"
				@close="onCancel"
			/>

			<div
				class="dialog-desc"
				:style="{ textAlign: isMobile ? 'center' : 'left' }"
			>
				<input
					class="input input--block text-ink-1"
					v-focus
					type="text"
					v-model.trim="name"
				/>
			</div>

			<terminus-dialog-footer
				:okText="$t('confirm')"
				:cancelText="$t('cancel')"
				showCancel
				:loading="submitLoading"
				@close="onCancel"
				@submit="submit"
			/>
		</q-card>
	</q-dialog>
</template>

<script lang="ts" setup>
import { useQuasar, useDialogPluginComponent } from 'quasar';
import { ref, onMounted } from 'vue';
import { dataAPIs } from '../../../api';
import { DriveType } from '../../../stores/files';
import { useMenuStore } from '../../../stores/files-menu';
import TerminusDialogBar from '../../common/TerminusDialogBar.vue';
import TerminusDialogFooter from '../../common/TerminusDialogFooter.vue';

const props = defineProps({
	item: {
		type: Object,
		required: false
	}
});

const { onDialogOK, dialogRef, onDialogCancel } = useDialogPluginComponent();

const $q = useQuasar();
const menuStore = useMenuStore();

const dataAPI = dataAPIs(DriveType.Sync);
const name = ref('');
const showDialog = ref(true);
const submitLoading = ref(false);
const isMobile = $q.platform.is.mobile;

const onCancel = () => {
	onDialogCancel();
};

onMounted(() => {
	name.value = props.item!.name;
});

const submit = async () => {
	if (name.value.length == 0) {
		return;
	}

	submitLoading.value = true;

	try {
		await dataAPI.renameRepo(props.item, name.value);
		submitLoading.value = false;
		onDialogOK();
		await menuStore.getSyncMenu();
	} catch (error) {
		submitLoading.value = false;
	}
};
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
