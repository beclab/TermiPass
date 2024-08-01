<template>
	<terminus-title-bar :title="t('settings.themes.title')" />
	<div class="display-root">
		<q-list class="q-mt-lg">
			<!-- <q-item dense> -->
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
			<q-item>
				<q-item-section>
					<terminus-item :clickable="false">
						<template v-slot:title>
							<div class="text-subtitle2 security-root__title">
								{{ t('settings.themes.follow_system_theme') }}
							</div>
						</template>
						<template v-slot:side>
							<q-toggle
								color="light-blue-default"
								size="xs"
								v-model="isThemeAuto"
								val="battery"
								@update:model-value="changeAutoTheme"
							/>
						</template>
					</terminus-item>
					<div class="q-mt-sm text-ink-3">
						After being selected, TermiPass will follow the device's system
						settings to switch theme modes
					</div>
					<div
						class="q-mt-md row items-center justify-between theme-select"
						:style="isThemeAuto ? 'opacity: 0.4' : ''"
					>
						<div
							class="theme-item-common"
							@click="updateTheme(ThemeDefinedMode.LIGHT)"
						>
							<q-img
								src="../../../assets/setting/mobile-theme-light.svg"
								class="image"
								:class="isThemeLight ? 'theme-item-select' : ''"
							/>
							<div class="content row items-center justify-center q-pl-md">
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
							@click="updateTheme(ThemeDefinedMode.DARK)"
						>
							<q-img
								src="../../../assets/setting/mobile-theme-dark.svg"
								class="image"
								:class="isThemeDark ? 'theme-item-select' : ''"
							/>
							<div class="content row items-center justify-center q-pl-md">
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
import TerminusItem from '../../../components/common/TerminusItem.vue';

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

// const isThemeAuto = computed(function () {
// 	return deviceStore.theme == ThemeDefinedMode.AUTO;
// });

const isThemeAuto = ref(deviceStore.theme == ThemeDefinedMode.AUTO);

const changeAutoTheme = (value: boolean) => {
	if (value) {
		updateTheme(ThemeDefinedMode.AUTO);
	} else {
		updateTheme(ThemeDefinedMode.LIGHT);
	}
};

const isThemeDark = computed(function () {
	return deviceStore.theme == ThemeDefinedMode.DARK;
});

const isThemeLight = computed(function () {
	return deviceStore.theme == ThemeDefinedMode.LIGHT;
});
const updateTheme = (theme: ThemeDefinedMode) => {
	if (theme != ThemeDefinedMode.AUTO) {
		isThemeAuto.value = false;
	}
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

			overflow: hidden;
			.image {
				border: 2px solid transparent;
				border-radius: 12px;
				width: 100%;
				// height: 100px;
			}
			.theme-item-select {
				border: 2px solid $yellow-default;
				border-radius: 16px;
			}
		}
		.content {
			width: 100%;
			height: 44px;
		}
	}
}

.module-sub-title {
	text-align: left;
	color: $prompt-message;
	text-transform: capitalize;
}
</style>
