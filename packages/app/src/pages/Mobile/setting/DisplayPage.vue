<template>
	<terminus-title-bar :title="t('display')" />
	<div class="display-root">
		<q-list class="q-mt-lg">
			<q-item dense>
				<q-item-section>
					<div class="module-sub-title text-body3">
						{{ t('language') }}
					</div>
					<div
						class="q-mt-xs row items-center justify-between q-pl-md q-pr-md"
						style="
							height: 48px;
							width: 100%;
							border: 1px solid $grey-3;
							border-radius: 8px;
						"
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
						<div class="text-color-sub-title">
							{{ t('enable_approval_badge') }}
						</div>
						<q-toggle
							color="blue"
							size="xs"
							v-model="approvalBadgeEnableRef"
							@update:model-value="setApprovalBadgeEnable"
						/>
					</div>
					<q-separator style="color: $grey-3" />
					<div class="row items-center justify-between q-ml-md q-mr-md">
						<div class="text-color-sub-title">
							{{ t('enable_autofill_badge') }}
						</div>
						<q-toggle
							color="blue"
							size="xs"
							v-model="autofillBadgeEnableRef"
							@update:model-value="setAutofillBadgeEnable"
						/>
					</div>
					<q-separator style="color: $grey-3" />
					<div class="row items-center justify-between q-ml-md q-mr-md">
						<div class="text-color-sub-title">
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
import { useUserStore } from '../../../stores/user';
import { supportLanguages, supportLanguageType } from '../../../i18n';
import { useBexStore } from '../../../stores/bex';
import { onMounted, ref } from 'vue';
import { app } from '../../../globals';
import TerminusSettingsModuleItem from '../../../components/common/TerminusSettingsModuleItem.vue';

const { t, locale } = useI18n();
const userStore = useUserStore();
const bexStore = useBexStore();

const isBex = ref(process.env.IS_BEX);

const isExtensionBadge = ref(true);
const autofillBadgeEnableRef = ref(true);
const rssBadgeEnableRef = ref(true);
const approvalBadgeEnableRef = ref(true);

const updateLocale = async (language: supportLanguageType) => {
	if (language) {
		await userStore.updateLanguageLocale(language);
	}
};

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
</script>

<style scoped lang="scss">
.display-root {
	width: 100%;
	height: calc(100% - 56px);
	overflow-y: scroll;
}

.module-sub-title {
	text-align: left;
	color: $prompt-message;
	text-transform: capitalize;
}
</style>
