<template>
	<div class="row items-center">
		<q-avatar :icon="SETTING_MENU.security.icon" @click="toggleDrawer" />
		<q-toolbar-title> {{ SETTING_MENU.security.name }} </q-toolbar-title>
	</div>

	<q-list class="q-ma-md sItem" separator>
		<q-item class="titleBg">
			<q-item-section>{{ t('master_password') }}</q-item-section>
		</q-item>
		<q-item>
			<q-item-section
				class="text-center cursor-pointer"
				@click="changePassword"
				>{{ t('Change Master Password') }}</q-item-section
			>
		</q-item>
	</q-list>

	<q-list class="q-ma-md sItem" separator>
		<q-item class="titleBg">
			<q-item-section>{{ t('auto_lock') }}</q-item-section>
		</q-item>
		<q-item class="row items-center justify-between">
			<q-item-label>{{ t('lock_automatically') }}</q-item-label>
			<q-item-label>
				<q-toggle
					v-model="lockStatus"
					color="blue"
					@update:model-value="changeAutoLock"
				/>
			</q-item-label>
		</q-item>
		<q-item
			class="row items-center justify-between lock-slider"
			:class="!lockStatus ? 'hideSlider' : ''"
		>
			<q-item-label>{{ t('after') }}</q-item-label>
			<q-slider
				v-model="lockTime"
				:step="1"
				:min="1"
				:max="10"
				style="margin: 0 20px"
				color="blue-6"
				@change="changeAutoLockDelay"
			/>
			<q-item-label>{{ lockTime }}{{ t('min') }}</q-item-label>
		</q-item>
	</q-list>

	<q-list class="q-ma-md sItem" separator>
		<q-item class="titleBg">
			<q-item-section>{{ t('multi_factor_authentication') }}</q-item-section>
		</q-item>
		<q-item>
			<q-item-section class="text-center">{{
				t('add_mfa_method')
			}}</q-item-section>
		</q-item>
	</q-list>

	<q-list class="q-ma-md sItem biometric" separator>
		<q-item class="titleBg">
			<q-item-section>{{ t('active_sessions') }}</q-item-section>
		</q-item>
		<q-item class="row items-center justify-between biometricItem">
			<q-avatar icon="desktop_windows" />
			<div class="text-left section q-pb-sm">
				<q-item-label class="text-color-sub-title q-mb-sm">{{
					t('macos_device')
				}}</q-item-label>
				<q-item-label>
					<span class="sectionTag1 text-body3">{{ t('current_device') }}</span>
					<span class="sectionTag2 text-body3">{{ t('not_supported') }}</span>
				</q-item-label>
			</div>
			<q-item-label>
				<q-avatar icon="construction" />
			</q-item-label>
		</q-item>
	</q-list>

	<q-list class="q-ma-md sItem biometric" separator>
		<q-item class="titleBg">
			<q-item-section>{{ t('trusted_devices') }}</q-item-section>
		</q-item>
		<q-item
			class="row items-center justify-between biometricItem"
			v-for="device in trustedDevices"
			:key="device.id"
		>
			<q-avatar icon="desktop_windows" />
			<div class="text-left section q-pb-sm">
				<q-item-label class="text-color-sub-title q-mb-sm">{{
					device?.description || t('unknown_device')
				}}</q-item-label>
				<q-item-label>
					<span class="sectionTag1 text-body3">{{ t('current_device') }}</span>
					<span class="sectionTag2 text-bodt3">{{ t('not_supported') }}</span>
				</q-item-label>
			</div>
			<q-item-label>
				<q-avatar icon="construction" />
			</q-item-label>
		</q-item>
	</q-list>

	<q-list class="q-ma-md sItem" separator>
		<q-item class="titleBg">
			<q-item-section>{{ t('security_report') }}</q-item-section>
		</q-item>
		<q-item class="row items-center justify-between">
			<q-item-label>{{ t('weak_passwords') }}</q-item-label>
			<q-item-label>
				<q-toggle
					v-model="selectionReport"
					color="blue"
					val="weakPasswords"
					@update:model-value="changeReport"
				/>
			</q-item-label>
		</q-item>
		<q-item class="row items-center justify-between">
			<q-item-label>{{ t('reused_passwords') }}</q-item-label>
			<q-item-label>
				<q-toggle
					v-model="selectionReport"
					color="blue"
					val="reusedPasswords"
					@update:model-value="changeReport"
				/>
			</q-item-label>
		</q-item>
		<q-item class="row items-center justify-between">
			<q-item-label>{{ t('compromised_passwords') }}</q-item-label>
			<q-item-label>
				<q-toggle
					v-model="selectionReport"
					color="blue"
					val="compromisedPaswords"
					@update:model-value="changeReport"
				/>
			</q-item-label>
		</q-item>
		<q-item class="row items-center justify-between">
			<q-item-label>{{ t('expiring_or_expired_items') }}</q-item-label>
			<q-item-label>
				<q-toggle
					v-model="selectionReport"
					color="blue"
					val="expiredItems"
					@update:model-value="changeReport"
				/>
			</q-item-label>
		</q-item>
	</q-list>
</template>

<script lang="ts">
import { useQuasar } from 'quasar';
import { defineComponent, ref, onMounted } from 'vue';
import { SETTING_MENU } from '../../../utils/constants';
import { useMenuStore } from '../../../stores/menu';
import UpdatePassWord from '../dialog/UpdatePassWord.vue';
import { app } from '../../../globals';
import { useI18n } from 'vue-i18n';

export default defineComponent({
	name: 'SecurityPage',
	components: {},
	setup() {
		const $q = useQuasar();

		const lockStatus = ref(app.settings.autoLock);
		const reportStatus = ref(true);
		const weakPasswords = ref(true);
		const reusedPasswords = ref(true);
		const compromisedPasswords = ref(true);
		const expiredItems = ref(true);
		const selectionReport = ref([] as string[]);

		const afterMin = ref(3);
		const meunStore = useMenuStore();
		const lockTime = ref(app.settings.autoLockDelay);

		const trustedDevices = app.authInfo?.trustedDevices;
		const sessions = app.authInfo?.sessions;

		const changePassword = () => {
			meunStore.dialogShow = true;
			$q.dialog({
				component: UpdatePassWord
			})
				.onOk(async () => {
					console.log('11');
				})
				.onCancel(() => {
					console.log('Cancel');
				})
				.onDismiss(() => {
					console.log('Called on OK or Cancel');
				});
		};

		const toggleDrawer = () => {
			meunStore.rightDrawerOpen = false;
		};

		const changeAutoLockDelay = (value: any) => {
			app.setSettings({ autoLockDelay: value });
		};

		const changeAutoLock = (value: any) => {
			app.setSettings({ autoLock: value });
		};

		const latestSession = (device: { id: string | undefined }) => {
			return (
				sessions &&
				sessions
					.filter((s) => s.device?.id === device.id)
					.sort((a, b) => Number(b.lastUsed) - Number(a.lastUsed))[0]
			);
		};

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const changeReport = (value: any[], _event: any) => {
			let weakPasswords = value.find((item: string) => item === 'weakPasswords')
				? true
				: false;
			let reusedPasswords = value.find(
				(item: string) => item === 'reusedPasswords'
			)
				? true
				: false;
			let compromisedPaswords = value.find(
				(item: string) => item === 'compromisedPaswords'
			)
				? true
				: false;
			let expiredItems = value.find((item: string) => item === 'expiredItems')
				? true
				: false;

			app.updateAccount(async (account) => {
				account.settings.securityReport.weakPasswords = weakPasswords;
				account.settings.securityReport.reusedPasswords = reusedPasswords;
				account.settings.securityReport.compromisedPaswords =
					compromisedPaswords;
				account.settings.securityReport.expiredItems = expiredItems;
			});
		};

		onMounted(() => {
			let securityReport = app.account?.settings.securityReport;
			for (const key in securityReport) {
				if (Object.prototype.hasOwnProperty.call(securityReport, key)) {
					const element = securityReport[key];
					if (element) {
						selectionReport.value.push(key);
					}
				}
			}
		});

		const { t } = useI18n();

		return {
			SETTING_MENU,
			lockStatus,
			reportStatus,
			weakPasswords,
			reusedPasswords,
			compromisedPasswords,
			expiredItems,
			selectionReport,

			afterMin,
			changePassword,
			toggleDrawer,
			lockTime,
			app,
			changeAutoLockDelay,
			changeAutoLock,
			trustedDevices,
			latestSession,
			changeReport,
			t
		};
	}
});
</script>

<style lang="scss" scoped>
.sItem {
	border: 1px solid $grey-2;
	border-radius: 10px;
}
.biometric {
	.biometricItem {
		.section {
			flex: 1;
			padding-left: 8px;
			.sectionTag1 {
				padding: 3px 5px;
				border: 1px solid $blue-4;
				border-radius: 4px;
				margin-right: 10px;
			}
			.sectionTag2 {
				padding: 3px 5px;
				border: 1px solid $grey-2;
				border-radius: 4px;
			}
		}
	}
}

.lock-slider {
	height: 60px;
	transition: height 0.5s;
	overflow: hidden;
	min-height: 0 !important;
	padding-top: 0px !important;
	padding-bottom: 0px !important;
}

.hideSlider {
	height: 0 !important;
}
</style>
