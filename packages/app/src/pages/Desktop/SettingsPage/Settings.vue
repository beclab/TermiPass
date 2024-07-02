<template>
	<div class="wrap-settings">
		<q-scroll-area
			ref="scrollAreaRef"
			:thumb-style="scrollBarStyle.thumbStyle"
			style="height: calc(100vh - 40px)"
		>
			<div class="row items-center q-mt-sm q-mb-lg q-pt-sm">
				<q-icon class="q-ml-md q-mr-xs" name="sym_r_settings" size="24px" />
				<q-toolbar-title class="q-pl-none text-body2 text-weight-bold">{{
					t('settings.settings')
				}}</q-toolbar-title>
				<q-avatar
					class="q-mr-lg cursor-pointer"
					icon="sym_r_close"
					@click="goBack"
				>
					<q-tooltip :offset="[0, 0]">Close</q-tooltip>
				</q-avatar>
			</div>

			<q-list class="settingList">
				<q-item class="setting_item q-mb-sm" id="setting_1">
					<q-item-section>
						<q-item-label
							class="text-body1 text-weight-bold q-pl-sm q-ml-xs q-mb-sm"
							>{{ t('settings.autostart_settings') }}</q-item-label
						>
						<q-item-label class="text-grey-8">
							<q-checkbox
								v-model="settings.automatically"
								color="green-14"
								size="md"
								checked-icon="check_box"
								unchecked-icon="check_box_outline_blank"
								label="Termipass automatically starts at boot"
								@update:model-value="updateAutomatically"
							/>
						</q-item-label>
					</q-item-section>
				</q-item>

				<q-item id="setting_4" class="q-mb-lg setting_item">
					<q-item-section>
						<q-item-label
							class="text-body1 text-weight-bold q-pl-sm q-ml-xs q-mb-sm"
							>{{ t('account') }}</q-item-label
						>
						<q-item-label class="q-pl-sm q-ml-xs text-color-sub-title">
							{{ t('settings.account_root_message') }}
						</q-item-label>

						<q-item-label class="text-grey-8 q-pl-sm q-ml-xs">
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

				<q-item id="setting_5" class="q-mb-md setting_item">
					<q-item-section>
						<q-item-label
							class="text-body1 text-weight-bold q-pl-sm q-ml-xs q-mb-sm"
							>{{ t('settings.safety') }}</q-item-label
						>
						<q-item-label class="text-color-sub-title q-pl-sm q-ml-xs">
							{{ t('change_local_password') }}
						</q-item-label>

						<q-item-label class="text-grey-8 q-pl-sm q-ml-xs q-mb-md">
							<div class="adminBtn q-mt-sm" @click="changePassword">
								{{ t('settings.changePassword') }}
							</div>
						</q-item-label>

						<q-item-label class="text-grey-8">
							<q-checkbox
								v-model="settings.autoLock"
								color="green-14"
								checked-icon="check_box"
								unchecked-icon="check_box_outline_blank"
								@update:model-value="changeAutoLock"
							/>
							{{ t('autolock.title') }}
						</q-item-label>

						<q-item-label
							class="text-grey-8 q-pl-sm q-ml-xs row items-center justify-between lock-slider"
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
					</q-item-section>
				</q-item>

				<q-item id="setting_6" class="q-mb-lg setting_item">
					<q-item-section>
						<q-item-label
							class="text-body1 text-weight-bold q-pl-sm q-ml-xs q-mb-sm"
						>
							{{ t('transmission.title') }}
						</q-item-label>
						<q-item-label class="text-grey-8 q-mb-md">
							<q-checkbox
								v-model="settings.transmissionrKeep"
								color="green-14"
								checked-icon="check_box"
								unchecked-icon="check_box_outline_blank"
								@update:model-value="transmissionrKeepUpdate"
							/>
							{{ t('computer_does_not_sleep_when_there_is_a_task') }}
						</q-item-label>

						<q-item-label class="text-grey-8 q-pl-sm q-ml-xs">
							<div class="q-mb-sm text-grey-7">
								{{ t('download_location') }}
							</div>
							<div class="row items-center justify-center">
								<q-input
									outlined
									v-model="settings.downloadLocation"
									dense
									style="flex: 1"
								/>
								<div class="viewBtn" @click="updateDownloadLocation">
									{{ t('select_folder') }}
								</div>
							</div>
						</q-item-label>
					</q-item-section>
				</q-item>

				<q-item class="q-mb-sm">
					<q-item-section>
						<q-item-label
							class="text-body1 text-weight-bold q-pl-sm q-ml-xs q-mb-sm"
							>{{ t('about') }}</q-item-label
						>
						<q-item-label class="text-grey-8 q-pl-sm q-ml-xs">
							{{ t('current_version') }}: {{ settings.appVersion }}
						</q-item-label>
					</q-item-section>
				</q-item>
			</q-list>
		</q-scroll-area>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { app } from './../../../globals';
import { scrollBarStyle } from '../../../utils/contact';
import { useUserStore } from '../../../stores/user';
import { useMenuStore } from '../../../stores/menu';
import { supportLanguages, supportLanguageType } from '../../../i18n';
import { useQuasar } from 'quasar';
import { getPlatform } from '@didvault/sdk/src/core';
import { formatMinutesTime } from '../../../utils/utils';
import { LayoutMenuIdetify } from 'src/utils/constants';

import DialogResetPassword from './DialogResetPassword.vue';

export default defineComponent({
	name: 'SettingsPage',
	components: {},
	setup() {
		const userStore = useUserStore();
		const menuStore = useMenuStore();
		const { locale, t } = useI18n();

		const $q = useQuasar();

		const languageOptions = ref(supportLanguages);

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

		const router = useRouter();
		const route = useRoute();
		const scrollAreaRef = ref();
		const isScroll = ref(false);
		const scrollTimer = ref();

		watch(
			() => route.params.direction,
			(newVal) => {
				if (!isScroll.value) {
					clicks(newVal);
				}
			}
		);

		const scrollHandler = (info: any) => {
			clearTimeout(scrollTimer);
			scrollTimer.value = setTimeout(function () {
				isScroll.value = false;
			}, 200);

			let sections = document.querySelectorAll('.setting_item');
			for (let i = sections.length - 1; i >= 0; i--) {
				if (info.verticalPosition >= sections[i].offsetTop - 80) {
					isScroll.value = true;

					router.push({
						path: `/systemSettings/${i + 1}`
					});
					break;
				}
			}
		};

		const updateLocale = async (language: supportLanguageType) => {
			if (language) {
				await userStore.updateLanguageLocale(language);
			}
		};

		const clicks = (index: string) => {
			let itemScrollTop =
				document.querySelector(`#setting_${index}`) &&
				document.querySelector(`#setting_${index}`)?.offsetTop;

			if (index === '1') {
				itemScrollTop = itemScrollTop - 80;
			} else {
				itemScrollTop = itemScrollTop - 20;
			}
			scrollAreaRef.value.setScrollPosition('vertical', itemScrollTop, 300);
		};

		const toAccountCenter = () => {
			menuStore.pushTerminusMenuCache(LayoutMenuIdetify.ACCOUNT_CENTER);
			router.push({
				path: '/accountCenter'
			});
		};

		const changeAutoLockDelay = (value: any) => {
			app.setSettings({ autoLockDelay: value });
		};

		const changeAutoLock = (value: any) => {
			app.setSettings({ autoLock: value });
		};

		const updateWeakPassword = (value: boolean) => {
			app.updateAccount(async (account) => {
				account.settings.securityReport.weakPasswords = value;
			});
		};

		const updateRepeatPassword = (value: boolean) => {
			app.updateAccount(async (account) => {
				account.settings.securityReport.reusedPasswords = value;
			});
		};

		const updateLeakPassword = (value: boolean) => {
			app.updateAccount(async (account) => {
				account.settings.securityReport.compromisedPaswords = value;
			});
		};

		const updateExpiredPassword = (value: boolean) => {
			app.updateAccount(async (account) => {
				account.settings.securityReport.expiredItems = value;
			});
		};

		const changePassword = async () => {
			if (!(await userStore.unlockFirst())) {
				return;
			}
			$q.dialog({
				component: DialogResetPassword,
				componentProps: {
					title: t('settings.changePassword'),
					navigation: t('cancel')
				}
			});
		};

		const goBack = () => {
			menuStore.popTerminusMenuCache();
			router.go(-1);
		};

		onMounted(async () => {
			if ($q.platform.is.electron) {
				settings.downloadLocation =
					await window.electron.api.download.getDownloadPath();

				settings.automatically =
					await window.electron.api.settings.getAutomaticallyStartBoot();

				settings.appVersion = (await getPlatform().getDeviceInfo()).appVersion;

				settings.transmissionrKeep =
					await window.electron.api.settings.getTaskPreventSleepBoot();
			}
		});

		const updateDownloadLocation = async () => {
			if ($q.platform.is.electron) {
				settings.downloadLocation =
					await window.electron.api.download.selectDownloadPath();
				await window.electron.api.download.setDownloadPath(
					settings.downloadLocation
				);
			}
		};

		const updateAutomatically = async () => {
			if ($q.platform.is.electron) {
				await window.electron.api.settings.setAutomaticallyStartBoot(
					settings.automatically
				);
				settings.automatically =
					await window.electron.api.settings.getAutomaticallyStartBoot();
			}
		};

		const transmissionrKeepUpdate = async () => {
			if ($q.platform.is.electron) {
				await window.electron.api.settings.setTaskPreventSleepBoot(
					settings.transmissionrKeep
				);
				settings.transmissionrKeep =
					await window.electron.api.settings.getTaskPreventSleepBoot();
			}
		};

		return {
			settings,
			languageOptions,
			toAccountCenter,
			changeAutoLockDelay,
			changeAutoLock,
			updateWeakPassword,
			updateRepeatPassword,
			updateLeakPassword,
			updateExpiredPassword,
			updateLocale,
			locale,
			goBack,
			scrollBarStyle,
			scrollAreaRef,
			scrollHandler,
			updateDownloadLocation,
			updateAutomatically,
			changePassword,
			transmissionrKeepUpdate,
			formatMinutesTime,
			t
		};
	}
});
</script>

<style scoped lang="scss">
.wrap-settings {
	width: 100%;
	height: 100%;
	background: $white;
	border-radius: 12px;
}

.settingList {
	width: 500px;

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

	.viewBtn {
		background: $yellow;
		border-radius: 8px;
		width: 76px;
		height: 40px;
		line-height: 40px;
		text-align: center;
		margin-left: 20px;
		cursor: pointer;
		color: $title;
		font-weight: 500;
		padding: 0 16px;

		&:hover {
			background: $yellow-13;
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
</style>
