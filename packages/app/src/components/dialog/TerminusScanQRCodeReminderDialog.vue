<template>
	<q-dialog class="user-status-common-dialog-root text-center" ref="dialogRef">
		<UserStatusCommonContent
			@on-dialog-o-k="onDialogOK"
			:title="title"
			:btn-title="btnTitle"
			:message="message"
		>
			<template v-slot:more>
				<div
					class="row items-center justify-between q-mb-lg"
					style="width: 100%"
				>
					<q-img
						src="../../assets/setting/active_qr_code_reminder_img.png"
						noSpinner
					/>
				</div>
			</template>
		</UserStatusCommonContent>
	</q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar';
import UserStatusCommonContent from '../userStatusDialog/UserStatusCommonContent.vue';

const { dialogRef, onDialogOK } = useDialogPluginComponent();
defineProps({
	title: String,
	message: String,
	navigation: String,
	btnTitle: String
});
</script>

<style lang="scss" scoped>
.user-status-common-dialog-root {
	.q-dialog__backdrop {
		background: rgba(0, 0, 0, 0.7);
	}
}
</style>
