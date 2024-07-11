<template>
	<q-dialog class="biometric-unlock-root text-center" ref="dialogRef">
		<q-card class="q-dialog-plugin">
			<div class="biometric-unlock-dialog column justify-center items-center">
				<div class="text-h5 biometric-unlock-dialog__title">
					{{ title }}
				</div>
				<div class="biometric-unlock-dialog__desc login-sub-title">
					{{ message }}
				</div>

				<div
					class="biometric-unlock-dialog__group row justify-between items-center"
				>
					<confirm-button
						class="biometric-unlock-dialog__group__btn cancel"
						:btn-title="navigation ?? t('cancel')"
						bg-classes="bg-white"
						:btn-status="ConfirmButtonStatus.normal"
						@onConfirm="onDialogCancel"
					/>
					<confirm-button
						class="biometric-unlock-dialog__group__btn"
						:btn-title="position ?? t('confirm')"
						:btn-status="ConfirmButtonStatus.normal"
						@onConfirm="onDialogOK"
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

const { t } = useI18n();
const { dialogRef, onDialogCancel, onDialogOK } = useDialogPluginComponent();

defineProps({
	title: String,
	message: String,
	navigation: String,
	position: String
});
</script>

<style lang="scss" scoped>
.biometric-unlock-root {
	.q-dialog__backdrop {
		background: rgba(0, 0, 0, 0.7);
	}

	.q-dialog-plugin {
		width: 440px;
		border-radius: 12px;
		position: relative;

		.biometric-unlock-dialog {
			padding: 20px;

			&__title {
				color: $ink-1;
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
					border: 1px solid $separator;
				}
			}
		}
	}
}
</style>
