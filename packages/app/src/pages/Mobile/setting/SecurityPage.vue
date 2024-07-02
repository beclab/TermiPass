<template>
	<terminus-title-bar :title="t('Safety')" />
	<div class="security-root">
		<q-list class="q-mt-lg">
			<q-item>
				<terminus-item img-bg-classes="bg-grey-1" @click="changePwd">
					<template v-slot:title>
						<div class="text-subtitle2 security-root__title">
							{{ t('change_local_password') }}
						</div>
					</template>
					<template v-slot:side>
						<q-icon name="keyboard_arrow_right" size="20px" color="grey-3" />
					</template>
				</terminus-item>
			</q-item>

			<q-item v-if="!isBex">
				<terminus-item img-bg-classes="bg-grey-1" :clickable="false">
					<template v-slot:title>
						<div class="text-subtitle2 security-root__title">
							{{ t('use_biometrics') }}
						</div>
					</template>
					<template v-slot:side>
						<q-toggle
							color="blue"
							size="xs"
							v-model="unlockByBiometricStatus"
							val="battery"
							@update:model-value="changeBiometric"
						/>
					</template>
				</terminus-item>
			</q-item>

			<q-item>
				<terminus-settings-module-item
					:show-content="lockStatus"
					:title="t('autolock.title')"
				>
					<template v-slot:side>
						<q-toggle
							color="blue"
							size="xs"
							v-model="lockStatus"
							val="battery"
							@update:model-value="changeAutoLock"
							class="q-mr-md"
						/>
					</template>
					<template v-slot:content>
						<q-slide-transition>
							<div v-show="lockStatus">
								<div
									class="row items-center justify-between q-ml-md q-mr-md"
									style="height: 60px"
								>
									<div class="text-body3 text-color-title">
										{{ t('after') }}
									</div>
									<q-slider
										v-model="lockTime"
										:step="5"
										:min="0"
										:max="3 * 24 * 60"
										style="width: 70%"
										color="yellow"
										@change="changeAutoLockDelay"
									/>
									<div class="text-body3 text-color-title">
										{{ formatMinutesTime(lockTime) }}
									</div>
								</div>
							</div>
						</q-slide-transition>
					</template>
				</terminus-settings-module-item>
			</q-item>
			<q-item class="q-py-none" v-if="lockStatus">
				<q-item-section class="userinfo">
					<q-item-label class="q-pt-md text-color-sub-title q-mb-sm">
						{{ t('autolock.reminderTitle') }}
					</q-item-label>
					<q-item-label
						class="row text-body3"
						v-for="item in reminderList"
						:key="item"
					>
						<div
							class="q-mb-sm text-grey-7 row justify-center"
							style="width: 20px; padding-top: 4px"
						>
							<div
								style="width: 8px; height: 8px; border-radius: 4px"
								class="bg-background-5"
							></div>
						</div>
						<div class="q-mb-sm text-ink-3" style="width: calc(100% - 20px)">
							{{ item }}
						</div>
					</q-item-label>
				</q-item-section>
			</q-item>
		</q-list>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { app } from '../../../globals';
import TerminusTitleBar from '../../../components/common/TerminusTitleBar.vue';
import '../../../css/terminus.scss';
import { useUserStore } from '../../../stores/user';
import { getNativeAppPlatform } from '../../../platform/capacitor/capacitorPlatform';

import { useI18n } from 'vue-i18n';
import TerminusItem from '../../../components/common/TerminusItem.vue';
import { useRouter } from 'vue-router';

import TerminusSettingsModuleItem from '../../../components/common/TerminusSettingsModuleItem.vue';
import { formatMinutesTime } from '../../../utils/utils';
import { notifyFailed } from '../../../utils/notifyRedefinedUtil';

const userStore = useUserStore();
const { t } = useI18n();
const $router = useRouter();

const isBex = ref(process.env.IS_BEX);

const lockTime = ref(app.settings.autoLockDelay);
const lockStatus = ref(app.settings.autoLock);
const reminderList = ref([
	t('autolock.reminder1'),
	t('autolock.reminder2'),
	t('autolock.reminder3')
]);

const changeAutoLockDelay = (value: number) => {
	app.setSettings({ autoLockDelay: value });
};

const changeAutoLock = (value: any) => {
	app.setSettings({ autoLock: value });
};

const unlockByBiometricStatus = ref<boolean>(userStore.openBiometric);
const changeBiometric = async () => {
	let result = {
		status: false,
		message: ''
	};

	if (!userStore.openBiometric) {
		result = await getNativeAppPlatform().openBiometric();
	} else {
		result = await getNativeAppPlatform().closeBiometric();
	}
	unlockByBiometricStatus.value = userStore.openBiometric;
	if (!result.status && result.message.length > 0) {
		notifyFailed(result.message);
	}
};

const changePwd = async () => {
	if (!(await userStore.unlockFirst())) {
		return;
	}
	$router.push({ path: '/change_pwd' });
};

const selectionReport = ref([] as string[]);

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
</script>

<style lang="scss" scoped>
.lock-slider {
	height: 60px;
	transition: height 0.5s;
	overflow: hidden;
	min-height: 0 !important;
	padding-top: 0px !important;
	padding-bottom: 0px !important;
}

.security-root {
	width: 100%;
	height: calc(100% - 56px);
	overflow-y: scroll;

	.security-root__title {
		color: $title;
	}
}
</style>
