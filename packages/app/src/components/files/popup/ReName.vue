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
import { seahub } from '../../../api';
import { useMenuStore } from '../../../stores/files-menu';

import TerminusDialogBar from '../../common/TerminusDialogBar.vue';
import TerminusDialogFooter from '../../common/TerminusDialogFooter.vue';

const props = defineProps({
	item: {
		type: Object,
		required: false
	}
});

const { onDialogHide, dialogRef, onDialogCancel } = useDialogPluginComponent();

const $q = useQuasar();
const menuStore = useMenuStore();

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
	const url = `seahub/api2/repos/${props.item!.repo_id}/?op=rename`;
	const data = {
		repo_name: name.value
	};
	await seahub.reRepoName(url, data);
	menuStore.getSyncMenu();
	onDialogHide();
	submitLoading.value = false;
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
