<template>
	<q-dialog
		ref="dialogRef"
		@hide="onDialogHide"
		:maximized="$q.platform.is.mobile"
		transition-show="slide-up"
		transition-hide="slide-down"
		class="d-creatVault"
	>
		<q-card
			class="column root"
			:class="isDesktop ? 'q-dialog-plugin' : 'd-createVault-mobile'"
		>
			<DesktopTermipassUnlockContent
				v-if="isDesktop"
				@unlockSuccess="onDialogOK"
				@cancel="onDialogCancel"
				:detail-text="info"
				:logo="
					$q.dark.isActive
						? 'login/Termipasstermipass_brand_desktop_dark.svg'
						: 'login/Termipasstermipass_brand_desktop_light.svg'
				"
			/>
			<MobileTermipassUnlockContent
				v-else-if="isMobile"
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
import MobileTermipassUnlockContent from './mobile/TermipassUnlockContent.vue';
import DesktopTermipassUnlockContent from './desktop/TermipassUnlockContent.vue';
import { i18n } from '../../boot/i18n';
import { ref } from 'vue';
const { dialogRef, onDialogCancel, onDialogOK, onDialogHide } =
	useDialogPluginComponent();
defineProps({
	info: {
		type: String,
		required: false,
		default: i18n.global.t('unlock.auth_popup_unlock_introduce')
	}
});
const isDesktop = ref(process.env.PLATFORM == 'DESKTOP');
const isMobile = ref(process.env.PLATFORM == 'MOBILE' || process.env.IS_BEX);
</script>
<style lang="scss" scoped>
.d-creatVault {
	.q-dialog-plugin {
		width: 800px;
		height: 600px;
		border-radius: 12px;
	}
	.d-createVault-mobile {
		width: 100%;
		height: 100%;
	}
}
</style>
