<template>
	<terminus-title-bar :title="t('display')" />
	<div class="display-root">
		<q-list class="q-mt-lg">
			<q-item dense>
				<!-- <q-item-section>
					<div class="module-sub-title text-body3">
						{{ t('language') }}
					</div>
					<div
						class="q-mt-xs row items-center justify-between q-pl-md q-pr-md"
						style="height: 48px; width: 100%; border-radius: 8px"
					>
						<q-select
							v-model="locale"
							:options="supportLanguages"
							dense
							borderless
							emit-value
							map-options
							options-dense
							style="width: 100%"
							@update:model-value="updateLocale"
						/>
					</div>
				</q-item-section> -->
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
									isThemeAuto ? 'checkbox-selected-yellow' : 'checkbox-unselect'
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
						<div class="q-mt-md row items-center justify-between theme-select">
							<div
								class="theme-item-common"
								:class="isThemeLight ? 'theme-item-select' : ''"
								@click="updateTheme(ThemeDefinedMode.LIGHT)"
							>
								<q-img
									src="../../../assets/setting/theme-light.svg"
									class="image"
								/>
								<div class="content row items-center q-pl-md">
									<q-radio
										dense
										v-model="deviceStore.theme"
										:val="ThemeDefinedMode.LIGHT"
										label="Light"
										color="yellow-default"
										@update:model-value="updateTheme(ThemeDefinedMode.LIGHT)"
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
								<div class="content row items-center q-pl-md">
									<q-radio
										v-model="deviceStore.theme"
										:val="ThemeDefinedMode.DARK"
										label="Dark"
										color="yellow-default"
										dense
										@update:model-value="updateTheme(ThemeDefinedMode.DARK)"
									/>
								</div>
							</div>
						</div>
					</q-item-section>
				</q-item>
			</q-item>
		</q-list>
		<q-item v-if="isBex">
			<terminus-settings-module-item :title="t('enable_badges')">
				<template v-slot:side>
					<q-toggle
						color="blue"
						size="xs"
						v-model="isExtensionBadge"
						val="battery"
						@update:model-value="setExtensionBadge"
						class="q-mr-md"
					/>
				</template>
				<template v-slot:content>
					<div class="row items-center justify-between q-ml-md q-mr-md">
						<div class="text-ink-2">
							{{ t('enable_approval_badge') }}
						</div>
						<q-toggle
							color="blue"
							size="xs"
							v-model="approvalBadgeEnableRef"
							@update:model-value="setApprovalBadgeEnable"
						/>
					</div>
					<q-separator class="bg-grey-3" />
					<div class="row items-center justify-between q-ml-md q-mr-md">
						<div class="text-ink-2">
							{{ t('enable_autofill_badge') }}
						</div>
						<q-toggle
							color="blue"
							size="xs"
							v-model="autofillBadgeEnableRef"
							@update:model-value="setAutofillBadgeEnable"
						/>
					</div>
					<q-separator class="bg-grey-3" />
					<div class="row items-center justify-between q-ml-md q-mr-md">
						<div class="text-ink-2">
							{{ t('enable_rss_badge') }}
						</div>
						<q-toggle
							color="blue"
							size="xs"
							v-model="rssBadgeEnableRef"
							@update:model-value="setRssBadgeEnable"
						/>
					</div>
				</template>
			</terminus-settings-module-item>
		</q-item>
	</div>
</template>

<script lang="ts" setup>
import TerminusTitleBar from '../../../components/common/TerminusTitleBar.vue';
import '../../../css/terminus.scss';
import { useI18n } from 'vue-i18n';
// import { useUserStore } from '../../../stores/user';
// import { supportLanguages, supportLanguageType } from '../../../i18n';
import { useBexStore } from '../../../stores/bex';
import { onMounted, ref } from 'vue';
import { app } from '../../../globals';
import TerminusSettingsModuleItem from '../../../components/common/TerminusSettingsModuleItem.vue';
import { computed } from 'vue';
import { ThemeDefinedMode } from '@bytetrade/ui';
import { useDeviceStore } from '../../../stores/device';

const { t } = useI18n();
// const userStore = useUserStore();
const bexStore = useBexStore();

const isBex = ref(process.env.IS_BEX);

const isExtensionBadge = ref(true);
const autofillBadgeEnableRef = ref(true);
const rssBadgeEnableRef = ref(true);
const approvalBadgeEnableRef = ref(true);
const deviceStore = useDeviceStore();

// const updateLocale = async (language: supportLanguageType) => {
// 	if (language) {
// 		await userStore.updateLanguageLocale(language);
// 	}
// };

const setAutofillBadgeEnable = async (enable: boolean) => {
	return bexStore.controller.setAutofillBadgeEnable(enable);
};

const setRssBadgeEnable = async (enable: boolean) => {
	return bexStore.controller.setRssBadgeEnable(enable);
};

const setApprovalBadgeEnable = async (enable: boolean) => {
	return bexStore.controller.setApprovalBadgeEnable(enable);
};

const setExtensionBadge = async (enable) => {
	await app.setSettings({ extensionBadge: enable });
};

onMounted(async () => {
	if (isBex.value) {
		isExtensionBadge.value = app.settings.extensionBadge;
		autofillBadgeEnableRef.value =
			await bexStore.controller.getAutofillBadgeEnable();
		rssBadgeEnableRef.value = await bexStore.controller.getRssBadgeEnable();
		approvalBadgeEnableRef.value =
			await bexStore.controller.getApprovalBadgeEnable();
	}
});

const isThemeAuto = computed(function () {
	return deviceStore.theme == ThemeDefinedMode.AUTO;
});

const isThemeDark = computed(function () {
	return deviceStore.theme == ThemeDefinedMode.DARK;
});

const isThemeLight = computed(function () {
	return deviceStore.theme == ThemeDefinedMode.LIGHT;
});
const updateTheme = (theme: ThemeDefinedMode) => {
	deviceStore.setTheme(theme);
};
</script>

<style scoped lang="scss">
.display-root {
	width: 100%;
	height: calc(100% - 56px);
	overflow-y: scroll;
	.item-centent {
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
			color: $ink-2;
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
		width: 100%;
		// height: 144px;
		// background-color: red;

		.theme-item-common {
			// height: 144px;
			width: calc(50% - 10px);
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

.module-sub-title {
	text-align: left;
	color: $prompt-message;
	text-transform: capitalize;
}
</style>
