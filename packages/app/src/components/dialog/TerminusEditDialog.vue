<template>
	<q-dialog class="termipass-edit-root text-center" ref="dialogRef">
		<q-card class="q-dialog-plugin">
			<div class="termipass-edit-dialog column justify-center items-center">
				<div class="text-h5 termipass-edit-dialog__title">
					{{ title }}
				</div>
				<div class="termipass-edit-dialog__desc login-sub-title">
					{{ message }}
				</div>

				<terminus-edit class="termipass-edit-dialog__edit" v-model="input" />

				<div
					class="termipass-edit-dialog__group row justify-between items-center"
				>
					<confirm-button
						class="termipass-edit-dialog__group__btn cancel"
						:btn-title="navigation ?? t('cancel')"
						bg-classes="bg-white"
						:btn-status="ConfirmButtonStatus.normal"
						@onConfirm="onDialogCancel"
					/>
					<confirm-button
						class="termipass-edit-dialog__group__btn"
						:btn-title="navigation ?? t('confirm')"
						:btn-status="ConfirmButtonStatus.normal"
						@onConfirm="onConfirm"
					/>
				</div>
			</div>
		</q-card>
	</q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar';
import { useI18n } from 'vue-i18n';
import { ConfirmButtonStatus } from '../../utils/constants';
import ConfirmButton from '../common/ConfirmButton.vue';
import TerminusEdit from '../common/TerminusEdit.vue';
import { ref } from 'vue';

const { t } = useI18n();
const { dialogRef, onDialogCancel, onDialogOK } = useDialogPluginComponent();

defineProps({
	title: String,
	message: String,
	label: String,
	navigation: String,
	position: String
});

const input = ref('');

const onConfirm = () => {
	onDialogOK(input.value);
};
</script>

<style lang="scss" scoped>
.termipass-edit-root {
	.q-dialog__backdrop {
		background: rgba(0, 0, 0, 0.7);
	}

	.q-dialog-plugin {
		width: 440px;
		height: 248px;
		border-radius: 12px;
		position: relative;

		.termipass-edit-dialog {
			padding: 20px;

			&__title {
				color: $title;
			}

			&__edit {
				margin-top: 12px;
				width: 100%;
				margin-bottom: 12px;
			}

			&__desc {
				width: 100%;
				text-align: center;
				margin-top: 12px;
			}

			&__group {
				margin-top: 40px;
				width: 100%;

				&__btn {
					width: calc(50% - 6px);
				}
				.cancel {
					border: 1px solid $grep-2;
				}
			}
		}
	}
}
</style>
