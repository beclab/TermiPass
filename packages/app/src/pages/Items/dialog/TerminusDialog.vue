<template>
	<q-dialog class="d-creatVault text-center" ref="dialogRef">
		<q-card class="q-dialog-plugin button-bg-color">
			<div class="vc-card column justify-start items-center">
				<div class="title text-body1">{{ title }}</div>
				<div class="content text-body2">{{ content }}</div>
				<div
					class="row justify-between items-center"
					style="margin-top: 20px; width: 100%"
				>
					<confirm-button
						style="width: 45%"
						:btn-title="leftText"
						@onConfirm="onDialogCancel"
					/>
					<confirm-button
						style="width: 45%"
						:btn-title="rightText"
						@onConfirm="onDialogOK"
					/>
				</div>
			</div>
		</q-card>
	</q-dialog>
</template>
<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar';
import ConfirmButton from '../../../components/common/ConfirmButton.vue';
import '../../../css/terminus.scss';

defineProps({
	title: String,
	content: String,
	leftText: String,
	rightText: String
});

const { dialogRef, onDialogCancel, onDialogOK } = useDialogPluginComponent();
</script>

<style scoped lang="scss">
.d-creatVault {
	.q-dialog-plugin {
		width: 500px;

		.vc-card {
			width: 100%;
			height: auto;
			padding: 16px;

			.title {
				text-align: center;
			}

			.content {
				text-align: center;
				margin-top: 20px;
			}

			.btn {
				margin-top: 20px;
				margin-bottom: 8px;
			}
		}
	}
}
</style>
