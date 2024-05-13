<template>
	<q-dialog class="card-dialog" v-model="showDialog" ref="dialogRef">
		<q-card class="card-continer">
			<terminus-dialog-bar
				label="Delete"
				icon=""
				titAlign="text-left"
				@close="onCancel"
			/>

			<div class="q-pa-lg">
				<div class="prompt-name q-mb-xs">{{ t('delete_vault_message') }}</div>
				<q-input
					class="prompt-input"
					v-model="promptModel"
					borderless
					dense
					no-error-icon
					:placeholder="t('type_delete_to_confirm')"
					:rules="[
						(val) =>
							(!val || val.toLowerCase() != 'delete') &&
							t('type_delete_to_confirm')
					]"
				/>
			</div>

			<terminus-dialog-footer
				okText="Confirm"
				cancelText="Cancel"
				showCancel
				:loading="submitLoading"
				@close="onCancel"
				@submit="submit"
			/>
		</q-card>
	</q-dialog>
</template>

<script lang="ts" setup>
import { useDialogPluginComponent } from 'quasar';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import TerminusDialogBar from 'src/components/common/TerminusDialogBar.vue';
import TerminusDialogFooter from 'src/components/common/TerminusDialogFooter.vue';

defineProps({
	item: {
		type: Object,
		required: false
	},
	shared_length: {
		type: Number,
		require: false
	}
});

const { dialogRef, onDialogCancel, onDialogOK } = useDialogPluginComponent();

const { t } = useI18n();
const showDialog = ref(true);
const submitLoading = ref(false);
const promptModel = ref();

const onCancel = () => {
	onDialogCancel();
};

const submit = async () => {
	onDialogOK(promptModel.value);
};
</script>

<style lang="scss" scoped>
.card-dialog {
	.card-continer {
		width: 400px;
		border-radius: 12px;

		.prompt-name {
			color: rgba(173, 173, 173, 1);
			font-size: 12px;
			line-height: 16px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.prompt-input {
			border: 1px solid rgba(235, 235, 235, 1);
			border-radius: 8px;
			padding: 0 10px;
		}
	}
}
</style>
