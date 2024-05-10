<template>
	<div class="active-wizard-root">
		<div class="wizard-content">
			<check-system
				:wizardStatus="wizardStatus"
				v-if="
					wizardStatus == 'wait_activate_system' ||
					wizardStatus == 'system_activating' ||
					wizardStatus == 'system_activate_failed'
				"
			/>
			<CheckNetwork
				:wizard="wizard"
				:baseURL="baseURL"
				:wizardStatus="wizardStatus"
				v-else-if="
					wizardStatus == 'wait_activate_network' ||
					wizardStatus == 'network_activating' ||
					wizardStatus == 'network_activate_failed'
				"
				@onNetworkSetup="configNetwork"
			/>

			<CheckDNS
				:wizard="wizard"
				:failed="failed"
				:wizardStatus="wizardStatus"
				@dns-retry="dnsConfigRetry"
				v-else-if="wizardStatus == 'wait_reset_password'"
			/>
			<div v-else>{{ t('loading') }}</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue';
import { useUserStore } from '../../../../stores/user';
import { TerminusInfo } from '@bytetrade/core';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { WizardInfo } from './wizard';
import axios from 'axios';
import CheckSystem from './CheckSystem.vue';
import CheckNetwork from './CheckNetwork.vue';
import CheckDNS from './CheckDNS.vue';
import { UserItem } from '@didvault/sdk/src/core';
import { setSenderUrl } from '../../../../globals';
import { getAppPlatform } from '../../../../platform/appPlatform';
import { StatusBar } from '@capacitor/status-bar';
import { useI18n } from 'vue-i18n';
import './wizard.scss';

const failed = ref(false);

const userStore = useUserStore();
const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();

const user: UserItem = userStore.users!.items.get(userStore.current_id!)!;
const wizard: WizardInfo = JSON.parse(user.wizard);

const wizardStatus = ref<string>(user.terminus_activate_status);

let user_info_interval: any = null;

let baseURL = wizard.url;
if (process.env.IS_PC_TEST) {
	baseURL = window.location.origin;
} else {
	if (baseURL.endsWith('/server')) {
		baseURL = baseURL.substring(0, baseURL.length - 7);
	}
}

let times = 0;

async function updateUserStatus(status: string) {
	user.terminus_activate_status = status;
	await userStore.users!.items.update(user);
	await userStore.save();
}

async function gotoResetPassword() {
	wizardStatus.value = 'wait_reset_password';
	await updateUserStatus('wait_reset_password');

	setSenderUrl({
		url: user.vault_url
	});

	router.push({ path: '/ResetPassword' });
}

async function updateTerminusInfo(): Promise<string | null> {
	if (wizardStatus.value == 'wait_reset_password') {
		return null;
	}

	try {
		const data: TerminusInfo = await axios.get(
			baseURL + '/bfl/info/v1/terminus-info'
		);

		if (
			(data as any) ==
			"<h1><a href='https://www.bytetradelab.io/'>Bytetrade</a></h1>"
		) {
			return;
		}
		userStore.setUserTerminusInfo(user.id, data);

		wizardStatus.value = data.wizardStatus;
		if (user.terminus_activate_status != wizardStatus.value) {
			await updateUserStatus(wizardStatus.value);
		}
		return wizardStatus.value;
	} catch (e) {
		try {
			return await authRequestTerminusInfo();
		} catch (error) {
			failed.value = true;
			return null;
		}
	}
}

async function authRequestTerminusInfo() {
	const data: TerminusInfo = await axios.get(
		user.auth_url + 'bfl/info/v1/terminus-info'
	);
	if (
		(data as any) ==
		"<h1><a href='https://www.bytetradelab.io/'>Bytetrade</a></h1>"
	) {
		return;
	}
	userStore.setUserTerminusInfo(user.id, data);

	wizardStatus.value = data.wizardStatus;

	if (user.terminus_activate_status != wizardStatus.value) {
		await updateUserStatus(wizardStatus.value);
	}
	return wizardStatus.value;
}

async function configSystem() {
	wizardStatus.value = 'system_activating';
	try {
		await axios.post(
			baseURL + '/bfl/settings/v1alpha1/config-system',
			wizard.system
		);
	} catch (e) {
		wizardStatus.value = 'system_activate_failed';
	}
	await updateTerminusInfo();
}

async function configNetwork() {
	wizardStatus.value = 'network_activating';
	try {
		let ob: any = {};
		if (wizard.network.enable_tunnel) {
			ob.enable_tunnel = true;
			ob.ip = '';
		} else {
			ob.enable_tunnel = false;
			ob.ip = wizard.network.external_ip;
		}

		await axios.post(baseURL + '/bfl/settings/v1alpha1/ssl/enable', ob);
	} catch (e) {
		wizardStatus.value = 'network_activate_failed';
	}
	await updateTerminusInfo();
}

async function updateInfo() {
	await updateTerminusInfo();

	if (
		wizardStatus.value == 'vault_activate_failed' ||
		wizardStatus.value == 'system_activate_failed' ||
		wizardStatus.value == 'network_activate_failed'
	) {
		return;
	}

	if (
		wizardStatus.value == 'vault_activating' ||
		wizardStatus.value == 'system_activating' ||
		wizardStatus.value == 'network_activating'
	) {
		return;
	}

	if (wizardStatus.value == 'completed') {
		router.push({ path: '/home' });
	} else if (wizardStatus.value == 'wait_activate_system') {
		await configSystem();
	} else if (wizardStatus.value == 'wait_activate_network') {
		await configNetwork();
	} else if (wizardStatus.value == 'wait_reset_password') {
		if (process.env.IS_PC_TEST) {
			times++;
			if (times > 5) {
				await gotoResetPassword();
				return;
			}
		}
		try {
			await authRequestTerminusInfo();
			await gotoResetPassword();
		} catch (e) {
			console.error(e);
		}
	}
}

onMounted(async () => {
	if ($q.platform.is.android) {
		StatusBar.setOverlaysWebView({ overlay: true });
	}
	user_info_interval = setInterval(async () => {
		await updateInfo();
	}, 2 * 1000);

	await updateInfo();
	getAppPlatform().hookServerHttp = false;
});

onUnmounted(() => {
	if (user_info_interval) {
		clearInterval(user_info_interval);
	}
	getAppPlatform().hookServerHttp = true;
});

if (user.terminus_activate_status == 'wait_reset_password') {
	setSenderUrl({
		url: user.vault_url
	});
	router.push({ path: '/ResetPassword' });
} else if (user.terminus_activate_status == 'completed') {
	router.push({ path: '/home' });
}

const dnsConfigRetry = () => {
	failed.value = false;
	updateInfo();
};

onBeforeUnmount(() => {
	if ($q.platform.is.android) {
		StatusBar.setOverlaysWebView({ overlay: false });
	}
});
</script>

<style lang="scss" scoped>
.active-wizard-root {
	width: 100%;
	height: 100%;

	&__content {
		width: 100%;
		height: 100%;
	}
}
</style>
