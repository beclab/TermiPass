<template>
	<div
		class="container"
		:class="$q.dark.isActive ? 'container-bg-dark' : 'container-bg-light'"
	>
		<DesktopDefaultHeaderView
			class="headerBar"
			:height="30"
			v-if="
				$q.platform.is.win &&
				$q.platform.is.electron &&
				!dataStore.preview.isShow
			"
		/>
		<div
			class="contain-content"
			:style="
				$q.platform.is.win &&
				$q.platform.is.electron &&
				!dataStore.preview.isShow
					? 'height: calc(100vh - 30px);'
					: 'height: 100vh;padding-top:8px;'
			"
		>
			<TerminusMenu />

			<div class="contain-body">
				<FilesMainLayout
					v-if="menuStore.terminusActiveMenu === LayoutMenuIdetify.FILES"
				/>

				<VaultMainLayout
					v-if="
						menuStore.terminusActiveMenu === LayoutMenuIdetify.VAULT &&
						userStore.isUnlocked
					"
				/>
				<TermipassUnlockContent
					v-if="
						menuStore.terminusActiveMenu === LayoutMenuIdetify.VAULT &&
						!userStore.isUnlocked
					"
					:logo="
						$q.dark.isActive
							? 'login/vault_brand_web_dark.svg'
							: 'login/vault_brand_web_light.svg'
					"
					:detail-text="t('unlock.vault_unlock_introduce')"
					:cancel="false"
					:logo-width="144"
				/>

				<TransferLayout
					v-if="menuStore.terminusActiveMenu === LayoutMenuIdetify.TRANSMISSION"
				/>

				<SettingsPage
					v-if="
						menuStore.terminusActiveMenu === LayoutMenuIdetify.SYSTEM_SETTINGS
					"
				/>

				<AccountCenter
					v-if="
						menuStore.terminusActiveMenu === LayoutMenuIdetify.ACCOUNT_CENTER
					"
				/>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { ref, defineComponent, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { app } from '../globals';
import { getAppPlatform } from '../platform/appPlatform';
import { useUserStore } from '../stores/user';
import { useMenuStore } from '../stores/menu';

import FilesMainLayout from './FilesMainLayout.vue';
import VaultMainLayout from './MainLayout.vue';
import TransferLayout from './TransferLayout.vue';

import SwitchAccount from './../components/SwitchAccount.vue';
import SettingsPage from './../pages/Desktop/SettingsPage/Settings.vue';
import AccountCenter from './../pages/Desktop/SettingsPage/Account.vue';

import DesktopDefaultHeaderView from '../components/DesktopDefaultHeaderView.vue';
import { useDataStore } from '../stores/data';
import { useSocketStore } from '../stores/websocketStore';

import TerminusMenu from './../components/TerminusMenu.vue';

import { watch } from 'vue';
import { useScaleStore } from '../stores/scale';
import TermipassUnlockContent from '../components/unlock/desktop/TermipassUnlockContent.vue';

import { LayoutMenuIdetify } from '../utils/constants';
import { useI18n } from 'vue-i18n';

export default defineComponent({
	name: 'TermipassMainLayout',

	components: {
		FilesMainLayout,
		VaultMainLayout,
		TransferLayout,
		SettingsPage,
		AccountCenter,
		DesktopDefaultHeaderView,
		TerminusMenu,
		TermipassUnlockContent
	},

	setup() {
		const $q = useQuasar();
		// const router = useRouter();
		const route = useRoute();
		const scaleStore = useScaleStore();
		const userStore = useUserStore();
		const menuStore = useMenuStore();
		const dataStore = useDataStore();
		const socketStore = useSocketStore();
		const current_user = ref(userStore.current_user);
		const { t } = useI18n();

		const vpnToggleStatus = ref(scaleStore.isOn);

		onMounted(async () => {
			if (process.env.PLATFORM === 'DESKTOP') {
				import('../css/layout-desktop.scss').then(() => {});
			}

			menuStore.pushTerminusMenuCache(LayoutMenuIdetify.FILES);

			getAppPlatform().homeMounted();
		});

		watch(
			() => scaleStore.vpnStatus,
			async () => {
				vpnToggleStatus.value = scaleStore.isOn;
			}
		);

		watch(
			() => route.path,
			() => {
				if (process.env.PLATFORM == 'DESKTOP') {
					socketStore.restart();
				}
			},
			{
				immediate: true
			}
		);

		onUnmounted(() => {
			getAppPlatform().homeUnMounted();
		});

		async function lock() {
			await app.lock();
		}

		async function openOrCloseTailscale() {
			if (vpnToggleStatus.value) {
				scaleStore.start();
			} else {
				await scaleStore.stop();
				vpnToggleStatus.value = false;
			}
		}

		const handleSwitchAccount = () => {
			$q.dialog({
				component: SwitchAccount
			});
		};

		return {
			lock,
			openOrCloseTailscale,
			vpnToggleStatus,
			handleSwitchAccount,
			current_user,
			menuStore,
			dataStore,
			scaleStore,
			LayoutMenuIdetify,
			userStore,
			t
		};
	}
});
</script>

<style lang="scss" scoped>
.container-bg-light {
	background: linear-gradient(
			234.72deg,
			rgba(254, 251, 228, 0.9) 3.44%,
			rgba(255, 255, 255, 0.9) 24.04%,
			rgba(251, 251, 233, 0.9) 54.51%,
			rgba(255, 243, 183, 0.9) 77.26%,
			rgba(255, 255, 243, 0.9) 99.53%
		),
		linear-gradient(
			180deg,
			rgba(254, 255, 228, 0.3) 1.13%,
			rgba(255, 229, 135, 0.3) 98.87%
		);
}
.container-bg-dark {
	background: rgba(22, 22, 21, 1);
}

.container {
	width: 100vw;
	height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-between;

	.contain-content {
		width: 100vw;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-right: 8px;
		padding-bottom: 8px;

		.contain-body {
			width: 100%;
			height: 100%;
			border-radius: 12px;
			display: flex;
			align-items: self-start;
			justify-content: space-between;
			overflow: hidden;
			// background-color: red;
		}
	}

	.headerBar {
		width: 100%;
		height: 30px;
	}
}
</style>
