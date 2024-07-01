<template>
	<q-dialog
		ref="dialogRef"
		@hide="onDialogHide"
		maximized
		transition-show="slide-up"
		transition-hide="slide-down"
	>
		<q-card class="q-dialog-plugin column root">
			<TermipassUnlockContent
				@unlockSuccess="onDialogOK"
				@cancel="onDialogCancel"
				:detail-text="info"
				logo="login/termipass_brand.svg"
			/>
		</q-card>
	</q-dialog>
</template>
<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar';
import TermipassUnlockContent from './mobile/TermipassUnlockContent.vue';
import { i18n } from '../../boot/i18n';
const { dialogRef, onDialogCancel, onDialogOK } = useDialogPluginComponent();
defineProps({
	info: {
		type: String,
		required: false,
		default: i18n.global.t('unlock.auth_popup_unlock_introduce')
	}
});
</script>
