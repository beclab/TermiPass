<template>
	<q-card class="q-dialog-plugin">
		<div class="biometric-unlock-dialog column justify-center items-center">
			<div class="text-h5 biometric-unlock-dialog__title">
				{{ title }}
			</div>
			<div class="biometric-unlock-dialog__desc q-mt-md">
				{{ message }}
			</div>
			<div class="biometric-unlock-dialog__more">
				<slot name="more" />
			</div>
			<div
				class="biometric-unlock-dialog__group row justify-between items-center"
				v-if="!btnRedefined"
			>
				<confirm-button
					class="biometric-unlock-dialog__group__btn"
					:btn-title="btnTitle ?? t('confirm')"
					@onConfirm="onDialogOK"
				/>
			</div>
			<div
				v-else
				class="biometric-unlock-dialog__group row justify-between items-center"
			>
				<slot name="buttons" />
			</div>
		</div>
	</q-card>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import ConfirmButton from '../common/ConfirmButton.vue';
const { t } = useI18n();
defineProps({
	title: {
		type: String,
		required: false,
		default: ''
	},
	message: {
		type: String,
		required: false,
		default: ''
	},
	btnTitle: {
		type: String,
		required: false,
		default: ''
	},
	btnRedefined: {
		type: Boolean,
		required: false,
		default: false
	}
});

const onDialogOK = () => {
	emits('onDialogOK');
};

const emits = defineEmits(['onDialogOK']);
</script>

<style lang="scss" scoped>
.q-dialog-plugin {
	// width: 320px;
	border-radius: 12px;
	position: relative;

	.biometric-unlock-dialog {
		padding: 20px;

		&__title {
			color: $title;
		}

		&__desc {
			width: 100%;
			text-align: center;
			color: $sub-title;
			margin-bottom: 40px;
		}

		&__more {
			width: 100%;
		}

		&__img {
			width: 280px;
			background-color: $grey-1;
			border-radius: 8px;
		}

		&__group {
			width: 100%;
			&__btn {
				width: 100%;
			}
		}
	}
}
</style>
