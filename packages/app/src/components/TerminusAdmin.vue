<template>
	<q-card class="user-info">
		<div class="header q-mt-md">
			<div class="fill"></div>
			<div class="users">
				<TerminusAvatar :info="userStore.terminusInfo()" :size="40" />
			</div>

			<div class="info q-mt-sm">
				<span class="text-h6">{{ current_user?.local_name }}</span>
				<span class="text-body3 text-ink-1 q-mt-xs">{{
					'@' + current_user?.domain_name
				}}</span>
			</div>

			<terminus-user-status class="q-mt-sm" />
		</div>

		<q-list class="q-px-xs">
			<q-item
				tag="label"
				v-ripple
				dense
				class="row items-center justify-between q-px-sm item-li"
			>
				<div class="row items-center justify-start">
					<q-icon name="sym_r_sensors_off" size="20px" />
					<span class="text-body2 text-ink-1 q-ml-xs">{{
						t('user_current_status.offline_mode.title')
					}}</span>
				</div>
				<q-toggle
					v-model="offLineModeRef"
					@update:model-value="updateOffLineMode"
				/>
			</q-item>

			<q-item
				tag="label"
				v-ripple
				dense
				class="row items-center justify-between q-px-sm item-li"
			>
				<div class="row items-center justify-start">
					<q-icon name="sym_r_sync_lock" size="20px" />
					<span class="text-body2 text-ink-1 q-ml-xs">{{
						t('encrypted_connection')
					}}</span>
				</div>
				<q-toggle
					v-model="vpnToggleStatus"
					@update:model-value="updateVpnStatus"
				/>
			</q-item>

			<q-separator class="q-my-md" />

			<q-item
				dense
				clickable
				class="row items-center justify-between q-px-sm item-li"
				@click="accountCenter"
			>
				<div class="row items-center justify-start">
					<q-icon name="sym_r_account_circle" size="20px" />
					<span class="text-body2 text-ink-1 q-ml-xs">{{
						t('user_management_center')
					}}</span>
				</div>
			</q-item>

			<q-item
				dense
				clickable
				class="row items-center justify-between q-px-sm item-li"
				@click="changeAccount"
			>
				<div class="row items-center justify-start">
					<q-icon name="sym_r_swap_horizontal_circle" size="20px" />
					<span class="text-body2 text-ink-1 q-ml-xs">{{
						t('switch_accounts')
					}}</span>
				</div>
			</q-item>

			<q-item
				dense
				clickable
				@click="handleSettings"
				class="row items-center justify-between q-px-sm item-li"
			>
				<div class="row items-center justify-start">
					<q-icon name="sym_r_settings" size="20px" />
					<span class="text-body2 text-ink-1 q-ml-xs">{{
						t('settings.settings')
					}}</span>
				</div>
			</q-item>

			<!-- <q-item
				dense
				clickable
				@click="lock"
				class="row items-center justify-between q-px-sm item-li"
			>
				<div class="row items-center justify-start">
					<q-icon name="sym_r_lock" size="20px" />
					<span class="text-body2 text-ink-1 q-ml-xs">{{ t('lock') }}</span>
				</div>
			</q-item> -->
		</q-list>
	</q-card>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { app } from '../globals';
import { useUserStore } from '../stores/user';
import TerminusUserStatus from './common/TerminusUserStatus.vue';
import { useScaleStore } from '../stores/scale';
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['switchAccount', 'accountCenter', 'handleSettings']);

const { t } = useI18n();

const userStore = useUserStore();
const scaleStore = useScaleStore();

const current_user = ref(userStore.current_user);
const offLineModeRef = ref(userStore.current_user?.offline_mode || false);

const changeAccount = () => {
	emit('switchAccount');
};

const accountCenter = () => {
	emit('accountCenter');
};

const handleSettings = () => {
	emit('handleSettings');
};

// const lock = () => {
// 	app.lock();
// 	userStore.users?.lock();
// };

const updateOffLineMode = async () => {
	userStore.updateOfflineMode(offLineModeRef.value);
};

const vpnToggleStatus = ref(scaleStore.isOn || scaleStore.isConnecting);

const updateVpnStatus = async () => {
	if (vpnToggleStatus.value) {
		scaleStore.start();
	} else {
		await scaleStore.stop();
		vpnToggleStatus.value = false;
	}
};

watch(
	() => scaleStore.vpnStatus,
	() => {
		vpnToggleStatus.value = scaleStore.isOn || scaleStore.isConnecting;
	}
);
</script>

<style lang="scss" scoped>
.user-info {
	width: 300px;
	padding: 12px 8px;
	overflow: hidden;

	.header {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
		z-index: 0;

		.users {
			width: 40px;
			height: 40px;
			border-radius: 20px;
			overflow: hidden;
		}

		.info {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
		}

		.fill {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			margin: auto;
			width: 78px;
			height: 78px;
			z-index: -1;
			background: rgba(133, 211, 255, 0.7);
			filter: blur(50px);
		}
	}
	.item-li {
		border-radius: 8px;
	}
}
</style>
