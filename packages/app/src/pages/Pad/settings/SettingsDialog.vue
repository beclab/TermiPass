<template>
	<q-dialog
		class="d-creatVault text-center"
		v-model="show"
		persistent
		ref="dialogRef"
	>
		<q-card class="q-dialog-plugin bg-background-3">
			<div class="header row items-center q-px-md">
				<q-btn dense flat icon="close" @click="onDialogCancel" v-close-popup>
					<q-tooltip>{{ t('buttons.close') }}</q-tooltip>
				</q-btn>
				<q-space />
				<div class="text-h5" style="font-weight: 500">
					{{ t('settings.settings') }}
				</div>
				<q-space />
				<q-btn style="display: none"> </q-btn>
			</div>

			<q-scroll-area style="height: 616px">
				<q-card-section class="q-px-md q-pt-none">
					<q-item class="q-mt-md item-centent">
						<q-item-section class="q-pa-md">
							<div class="row items-center justify-between text-ink-1 text-h6">
								{{ t('settings.themes.title') }}
							</div>
							<div
								class="checkbox-content row items-center q-mt-md"
								@click="updateTheme(ThemeDefinedMode.AUTO)"
							>
								<div
									class="checkbox-common row items-center justify-center"
									:class="
										isThemeAuto
											? 'checkbox-selected-yellow'
											: 'checkbox-unselect'
									"
								>
									<q-icon
										class="text-ink-on-brand"
										size="12px"
										v-if="isThemeAuto"
										name="sym_r_check"
									/>
								</div>
								<div class="text-body2 text-ink-2">Follow system theme</div>
							</div>
							<div class="q-mt-md">
								After being selected, TermiPass will follow the device's system
								settings to switch theme modes
							</div>
							<div
								class="q-mt-md row items-center justify-between theme-select"
							>
								<div
									class="theme-item-common"
									:class="isThemeLight ? 'theme-item-select' : ''"
									@click="updateTheme(ThemeDefinedMode.LIGHT)"
								>
									<q-img
										src="../../../assets/setting/theme-light.svg"
										class="image"
									/>
									<div class="content">
										<q-radio
											v-model="selectedTheme"
											:val="ThemeDefinedMode.LIGHT"
											label="Light"
											color="yellow-default"
										/>
									</div>
								</div>
								<div
									class="theme-item-common"
									:class="isThemeDark ? 'theme-item-select' : ''"
									@click="updateTheme(ThemeDefinedMode.DARK)"
								>
									<q-img
										src="../../../assets/setting/theme-dark.svg"
										class="image"
									/>
									<div class="content">
										<q-radio
											v-model="selectedTheme"
											:val="ThemeDefinedMode.DARK"
											label="Dark"
											color="yellow-default"
										/>
									</div>
								</div>
							</div>
						</q-item-section>
					</q-item>
					<q-item class="q-mt-lg item-centent">
						<q-item-section class="q-pa-md">
							<q-item-label class="text-body1 text-weight-bold">{{
								t('account')
							}}</q-item-label>
							<q-item-label class="q-pt-md text-color-sub-title">
								{{ t('settings.account_root_message') }}
							</q-item-label>

							<q-item-label class="text-grey-8">
								<div class="adminBtn q-mt-md" @click="toAccountCenter">
									<q-icon
										name="sym_r_account_circle"
										size="24px"
										class="q-mr-xs"
									/>
									{{ t('settings.account_administration') }}
								</div>
							</q-item-label>
						</q-item-section>
					</q-item>

					<q-item class="q-mt-lg item-centent">
						<q-item-section class="q-pa-md">
							<q-item-label class="text-body1 text-weight-bold">{{
								t('safety')
							}}</q-item-label>
							<q-item-label class="q-pt-md text-color-sub-title">
								{{ t('change_local_password') }}
							</q-item-label>

							<q-item-label class="text-grey-8">
								<div class="adminBtn q-mt-md" @click="toChangePassword">
									{{ t('settings.changePassword') }}
								</div>
							</q-item-label>
							<q-item-label class="q-pt-md text-grey-8">
								<div
									class="checkbox-content row items-center"
									@click="changeAutoLock(!settings.autoLock)"
								>
									<div
										class="checkbox-common row items-center justify-center"
										:class="
											settings.autoLock
												? 'checkbox-selected-green'
												: 'checkbox-unselect'
										"
									>
										<q-icon
											class="text-ink-on-brand"
											size="12px"
											v-if="settings.autoLock"
											name="sym_r_check"
										/>
									</div>
									<div class="text-body2 text-ink-2">
										{{ t('auto_lock_when_you_leave') }}
									</div>
								</div>
							</q-item-label>

							<q-slide-transition>
								<q-item-label
									v-if="settings.autoLock"
									class="text-grey-8 row items-center justify-between lock-slider"
									:class="!settings.autoLock ? 'hideSlider' : ''"
								>
									<span>10 {{ t('min') }}</span>
									<q-slider
										v-model="settings.lockTime"
										:min="10"
										:max="3 * 24 * 60"
										:step="5"
										label
										:label-value="formatMinutesTime(settings.lockTime)"
										color="yellow"
										style="flex: 1"
										class="q-mx-sm"
										label-text-color="color-title"
										@change="changeAutoLockDelay"
									/>
									<span>3 {{ t('time.days') }}</span>
								</q-item-label>
							</q-slide-transition>

							<q-item-label class="q-pt-md text-color-sub-title">
								The lock screen service will be applied in the following
								scenarios
							</q-item-label>
						</q-item-section>
					</q-item>
					<q-item class="q-mt-md item-centent">
						<q-item-section class="q-pa-md">
							<q-item-label class="text-body1 text-weight-bold">{{
								t('about')
							}}</q-item-label>
							<q-item-label class="text-grey-8 q-pt-md">
								{{ t('current_version') }}: {{ settings.appVersion }}
							</q-item-label>
						</q-item-section>
					</q-item>
				</q-card-section>
			</q-scroll-area>
		</q-card>
	</q-dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { useUserStore } from '../../../stores/user';
import { useI18n } from 'vue-i18n';
import { ThemeDefinedMode } from '@bytetrade/ui';
import { computed } from 'vue';
import UserManagentDialog from '../account/UserManagentDialog.vue';
import DialogResetPassword from '../../Desktop/SettingsPage/DialogResetPassword.vue';
import { reactive } from 'vue';
import { app } from '../../../globals';
import { formatMinutesTime } from '../../../utils/utils';
import { getPlatform } from '@didvault/sdk/src/core';

const { dialogRef, onDialogCancel } = useDialogPluginComponent();

const show = ref(true);

const router = useRouter();
const userStore = useUserStore();
const current_user = ref(userStore.current_user);
const { t } = useI18n();
const $q = useQuasar();

const isThemeAuto = computed(function () {
	return selectedTheme.value == ThemeDefinedMode.AUTO;
});

const isThemeDark = computed(function () {
	return selectedTheme.value == ThemeDefinedMode.DARK;
});

const isThemeLight = computed(function () {
	return selectedTheme.value == ThemeDefinedMode.LIGHT;
});

const selectedTheme = ref<ThemeDefinedMode>(ThemeDefinedMode.AUTO);

const updateTheme = (theme: ThemeDefinedMode) => {
	if (selectedTheme.value == theme) {
		return;
	}
	selectedTheme.value = theme;
};

const toAccountCenter = () => {
	show.value = false;
	$q.dialog({
		component: UserManagentDialog
	});
	return;
};

const toChangePassword = () => {
	$q.dialog({
		component: DialogResetPassword,
		componentProps: {
			title: 'Change Password',
			navigation: 'Cancel'
		}
	});
};

const settings = reactive({
	automatically: true,
	content: true,
	display: true,
	transmissionrKeep: true,
	transmissionDefaultLocation: true,
	autoLock: app.settings.autoLock,
	lockTime: app.settings.autoLockDelay,
	weakPassword: app.account?.settings.securityReport.weakPasswords,
	repeatPassword: app.account?.settings.securityReport.reusedPasswords,
	leakPassword: app.account?.settings.securityReport.compromisedPaswords,
	expiredPassword: app.account?.settings.securityReport.expiredItems,
	downloadLocation: '',
	appVersion: ''
});

const changeAutoLockDelay = (value: any) => {
	app.setSettings({ autoLockDelay: value });
};
const changeAutoLock = (value: any) => {
	settings.autoLock = value;
	app.setSettings({ autoLock: value });
};

const configVersion = async () => {
	if (!$q.platform.is.nativeMobile) {
		return;
	}
	settings.appVersion = (await getPlatform().getDeviceInfo()).appVersion;
};
configVersion();
</script>

<style lang="scss" scoped>
.d-creatVault {
	.q-dialog-plugin {
		width: 580px;
		height: 680px;
		border-radius: 12px;

		.header {
			height: 64px;
			width: 100%;
		}

		.current-user {
			padding: 4px 8px;
			border-radius: 4px;
			text-align: center;
			border: 1px solid $blue-4;
			color: $blue-4;
		}

		.account {
			background: $background-2;
			border-radius: 12px;

			.header {
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: space-between;

				.users {
					width: 40px;
					height: 40px;
					border-radius: 20px;
					overflow: hidden;
					margin-left: 10px;
				}

				.info {
					flex: 1;
					margin-left: 10px;
					margin-right: 20px;
					overflow: hidden;
					text-align: left;

					.name {
						color: $title;
					}

					.did {
						color: $sub-title;
						word-break: break-all;
					}
				}

				.delete {
					border: 1px solid $blue-4;
					color: $blue-4;
					padding: 4px 8px;
					border-radius: 6px;
				}
			}
		}

		.item-centent {
			background: $background-2;
			border-radius: 12px;
			width: 100%;
			text-align: left;

			.checkbox-content {
				width: 100%;
				height: 30px;
				.checkbox-common {
					width: 16px;
					height: 16px;
					margin-right: 10px;
					border-radius: 4px;
				}

				.checkbox-unselect {
					border: 1px solid $separator-2;
				}

				.checkbox-selected-yellow {
					background: $yellow-default;
				}
				.checkbox-selected-green {
					background: $positive;
				}
			}
			.adminBtn {
				border: 1px solid $yellow;
				background-color: $yellow-1;
				display: inline-block;
				color: $sub-title;
				padding: 6px 12px;
				border-radius: 8px;
				cursor: pointer;

				&:hover {
					background-color: $yellow-3;
				}
			}

			.lock-slider {
				height: 60px;
				transition: height 0.5s;
				min-height: 0 !important;
				padding-top: 0px !important;
				padding-bottom: 0px !important;
			}

			.hideSlider {
				height: 0 !important;
			}
		}

		.theme-select {
			width: 440px;
			height: 144px;
			// background-color: red;

			.theme-item-common {
				height: 144px;
				width: 210px;
				border: 1px solid $separator;
				border-radius: 12px;
				overflow: hidden;
				.image {
					width: 100%;
					height: 100px;
				}
				.content {
					width: 100%;
					height: 44px;
				}
			}

			.theme-item-select {
				border: 1px solid $yellow-default;
			}
		}
	}
}
</style>
