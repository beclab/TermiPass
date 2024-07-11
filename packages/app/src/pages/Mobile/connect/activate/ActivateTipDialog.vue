<template>
	<q-dialog class="activate-tip-dialog-root text-center" ref="dialogRef">
		<q-card class="q-dialog-plugin">
			<div class="biometric-unlock-dialog column justify-center items-center">
				<div class="text-h5 biometric-unlock-dialog__title">
					{{ title }}
				</div>
				<div class="biometric-unlock-dialog__desc q-mt-md">
					{{ message }}
				</div>
				<div class="biometric-unlock-dialog__img q-mt-md q-px-lg q-py-md">
					<q-img src="../../../../assets/wizard/wizard_qr_code.svg" />
				</div>
				<div
					class="biometric-unlock-dialog__group row justify-between items-center"
				>
					<confirm-button
						class="biometric-unlock-dialog__group__btn"
						:btn-title="btnTitle ?? t('confirm')"
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
import { ConfirmButtonStatus } from '../../../../utils/constants';
import ConfirmButton from '../../../../components/common/ConfirmButton.vue';

const { t } = useI18n();
const { dialogRef, onDialogOK } = useDialogPluginComponent();

defineProps({
	title: String,
	message: String,
	navigation: String,
	btnTitle: String
});
</script>

<style lang="scss" scoped>
.activate-tip-dialog-root {
	.q-dialog__backdrop {
		background: rgba(0, 0, 0, 0.7);
	}

	.q-dialog-plugin {
		width: 320px;
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
				color: $grey-8;
			}

			&__img {
				width: 280px;
				background-color: $grey-1;
				border-radius: 8px;
			}

			&__group {
				margin-top: 40px;
				width: 100%;

				&__btn {
					width: 100%;
				}
			}
		}
	}
}
</style>
