<template>
	<div class="setting">
		<div class="flur1"></div>
		<div class="flur2"></div>
		<TerminusUserHeader :title="t('setting')">
			<template v-slot:add v-if="$q.platform.is.nativeMobile">
				<div
					class="scan-icon row items-center justify-center"
					@click="scanQrCode"
				>
					<q-img src="../../../assets/common/scan_qr.svg" width="24px" />
				</div>
			</template>
		</TerminusUserHeader>
		<terminus-scroll-area class="setting-content q-mt-sm">
			<template v-slot:content>
				<div class="terminus-info q-pt-xs">
					<bind-terminus-name :border-show="false">
						<template v-slot:success>
							<div class="home-module-title">
								{{ t('settings.authenticator') }}
							</div>
							<auth-item-card class="q-mt-sm" />
							<div class="home-module-title q-mt-lg">
								{{ t('settings.equipment_usage') }}
							</div>
							<div class="terminus-info__name text-body3">
								{{ userName }}
							</div>
							<div
								class="terminus-bind__system-info row justify-between items-center"
							>
								<div
									class="info-item column items-center justify-top q-pt-md"
									:style="`background:${monitorStore.background[index]}`"
									v-for="(item, index) in monitorStore.usages"
									:key="`d` + index"
								>
									<q-knob
										readonly
										v-model="item.ratio"
										size="58px"
										:thickness="0.5"
										:color="item.color"
										track-color="grey-1"
									/>
									<div class="amount text-body2 text-color-title">
										{{ item.ratio }}%
									</div>
									<div class="name text-body3 text-color-sub-title">
										{{ item.name?.toUpperCase() }}
									</div>
								</div>
							</div>
						</template>
					</bind-terminus-name>

					<div class="home-module-title q-mt-lg">
						{{ t('settings.settings') }}
					</div>

					<terminus-item
						v-for="(cell, index) in setting"
						:key="index"
						class="q-mt-xs"
						img-bg-classes="bg-grey-1"
						:icon-name="cell.icon"
						:whole-picture-size="32"
						:side-style="index == 0 ? 'width: 50%' : ''"
						@click="setPath(cell.path)"
					>
						<template v-slot:title>
							<div class="text-subtitle1">
								{{ cell.label }}
							</div>
						</template>
						<template v-slot:side>
							<div class="row items-center justify-end" style="width: 100%">
								<div
									class="row items-center justify-end q-mr-xs"
									style="width: calc(100% - 30px)"
									v-if="index == 0 && !isBex && !userStore.currentUserBackup"
								>
									<div class="not-backup text-body3 q-ml-xs">
										{{ t('not_backed_up') }}
									</div>
								</div>
								<q-icon name="sym_r_keyboard_arrow_right" size="20px" />
							</div>
						</template>
					</terminus-item>

					<terminus-item
						img-bg-classes="bg-grey-1"
						class="q-mt-xs"
						icon-name="sym_r_ballot"
						:whole-picture-size="32"
						v-if="$q.platform.is.nativeMobile"
					>
						<template v-slot:title>
							<div class="text-subtitle1">
								{{ t('version') }}
							</div>
						</template>
						<template v-slot:side>
							<div class="row items-center justify-end">
								<div
									class="app-version text-body2 text-color-sub-title q-pr-xs"
								>
									{{ appVersion }}
								</div>
								<q-icon name="sym_r_keyboard_arrow_right" />
							</div>
						</template>
					</terminus-item>
					<div
						style="padding-bottom: 60px; width: 100%; height: 1px"
						v-if="
							termipassStore &&
							termipassStore.totalStatus &&
							termipassStore.totalStatus.isError == 2
						"
					/>
					<div v-else style="padding-bottom: 30px; width: 100%; height: 1px" />
				</div>
			</template>
		</terminus-scroll-area>
	</div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { ref, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '../../../stores/user';
import { UserItem, getPlatform } from '@didvault/sdk/src/core';
import { useQuasar } from 'quasar';
import TerminusUserHeader from '../../../components/common/TerminusUserHeader.vue';
import '../../../css/terminus.scss';
import { useMonitorStore } from '../../../stores/monitor';
import TerminusItem from '../../../components/common/TerminusItem.vue';
import BindTerminusName from '../../../components/common/BindTerminusName.vue';
import TerminusScrollArea from '../../../components/common/TerminusScrollArea.vue';

import AuthItemCard from '../items/AuthItemCard.vue';

import { useI18n } from 'vue-i18n';
import { useTermipassStore } from '../../../stores/termipass';
const { t } = useI18n();
const isBex = ref(process.env.IS_BEX);

const settingMenu = [
	{
		label: t('account'),
		icon: 'sym_r_account_circle',
		path: '/setting/account'
	},
	{
		label: 'Integration',
		icon: 'sym_r_stacks',
		path: '/integration'
	},
	{
		label: t('Safety'),
		icon: 'sym_r_arming_countdown',
		path: '/setting/security'
	}
];

const $router = useRouter();
const userStore = useUserStore();
const termipassStore = useTermipassStore();
const $q = useQuasar();

const monitorStore = useMonitorStore();

const settingsMenus = [...settingMenu];

if ($q.platform.is.nativeMobile) {
	settingsMenus.push({
		label: t('autofill'),
		icon: 'sym_r_ink_highlighter',
		path: '/setting/autofill'
	});
}

const setting = ref(settingsMenus);

const connected = ref(false);
const userName = ref('');
const userId = ref('');

let user: UserItem = userStore.users!.items.get(userStore.current_id!)!;
if (user.setup_finished) {
	connected.value = true;
	userName.value = user.name;
	userId.value = user.id;
} else {
	connected.value = false;
}

let moniter = ref<any>(null);

onMounted(async () => {
	monitorStore.loadMonitor();
	moniter.value = setInterval(() => monitorStore.loadMonitor(), 1000 * 30);
});

onUnmounted(() => {
	if (moniter.value) {
		clearInterval(moniter.value);
	}
});

const setPath = (path: string) => {
	$router.push({
		path
	});
};

const appVersion = ref('');

const configVersion = async () => {
	if (!$q.platform.is.nativeMobile) {
		return;
	}
	appVersion.value = (await getPlatform().getDeviceInfo()).appVersion;
};

const scanQrCode = () => {
	$router.push({
		path: '/scanQrCode'
	});
};

configVersion();
</script>

<style lang="scss" scoped>
.setting {
	height: 100%;
	width: 100%;
	background: $white;
	position: relative;
	z-index: 0;

	.flur1 {
		width: 135px;
		height: 135px;
		background: rgba(133, 211, 255, 0.7);
		filter: blur(70px);
		position: absolute;
		right: 20vw;
		top: 20vh;
		z-index: -1;
	}

	.flur2 {
		width: 110px;
		height: 110px;
		background: rgba(217, 255, 109, 0.6);
		filter: blur(70px);
		position: absolute;
		left: 20vw;
		top: 30vh;
		z-index: -1;
	}

	.setting-content {
		height: calc(100% - 56px);
		width: 100%;

		.terminus-info {
			width: 100%;
			padding-left: 20px;
			padding-right: 20px;

			&__name {
				color: $sub-title;
				/* 133.333% */
			}

			.terminus-bind {
				width: 100%;
				padding: 0px 16px;

				&__system-info {
					width: 100%;
					padding: 8px 0px;

					.info-item {
						height: 138px;
						width: calc((100% - 24px) / 3);
						border-radius: 16px;
						border: 1px solid $grey-2;

						.amount {
							text-align: center;
							margin-top: 12px;
						}

						.name {
							text-align: center;
							margin-top: 4px;
						}
					}
				}
			}

			.app-version {
				text-align: right;
			}
		}
	}

	.not-backup {
		text-align: right;
		color: $grey-5;
	}
}
</style>
