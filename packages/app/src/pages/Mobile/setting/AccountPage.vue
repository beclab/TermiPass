<template>
	<div class="account-root">
		<div class="flur1"></div>
		<div class="flur2"></div>
		<terminus-title-bar
			right-icon="sym_r_more_horiz"
			@on-right-click="moreClick"
		/>
		<terminus-scroll-area class="account-scroll">
			<template v-slot:content>
				<q-list class="accountCentent">
					<div class="column items-center">
						<div class="accountCentent__avatar">
							<TerminusAvatar
								:info="userStore.terminusInfo()"
								:size="64"
								@click="updateShowCheckHistory"
							/>
						</div>

						<div class="accountCentent__name q-mt-xs text-h5">
							{{ userStore.current_user?.local_name }}
						</div>
						<div class="accountCentent__info text-body3 q-mt-xs">
							@{{ userStore.current_user?.domain_name }}
						</div>
						<terminus-user-status class="q-mt-xs" />
					</div>

					<div class="row items-center justify-between q-mt-xl">
						<div
							class="accountCentent__action_base accountCentent__action_offline q-px-md q-pt-md q-pb-lg column justify-between"
						>
							<div class="row items-center justify-between">
								<div class="icon-bg row items-center justify-center">
									<q-icon name="sym_r_public_off" size="20px" />
								</div>
								<q-toggle
									color="blue"
									size="md"
									v-model="offLineModeRef"
									@update:model-value="updateOffLineMode"
								/>
							</div>
							<div class="title text-subtitle2">
								{{
									offLineModeRef
										? t('user_current_status.offline_mode.enabled')
										: t('user_current_status.offline_mode.disabled')
								}}
							</div>
						</div>
						<div
							class="accountCentent__action_base q-px-md accountCentent__action_vpn q-px-md q-pt-md q-pb-lg column justify-between"
						>
							<div class="row items-center justify-between">
								<div class="icon-bg row items-center justify-center">
									<q-icon
										:name="TermiPassVpnStatusInfo[scaleStore.vpnStatus].icon"
										size="20px"
										:style="`color:${
											TermiPassVpnStatusInfo[scaleStore.vpnStatus].color
										};`"
									/>
								</div>
								<q-toggle
									color="blue"
									size="md"
									v-model="vpnToggleStatus"
									@update:model-value="updateVpnStatus"
								/>
							</div>
							<div class="title text-subtitle2">
								{{ TermiPassVpnStatusInfo[scaleStore.vpnStatus].description }}
							</div>
						</div>
					</div>

					<terminus-item
						v-if="isBex || userStore.currentUserBackup"
						:show-board="true"
						img-bg-classes="bg-color-yellow"
						:item-height="88"
						icon-name="sym_r_fact_check"
						:whole-picture-size="48"
						class="q-mt-lg"
						@click="startBackUp"
					>
						<template v-slot:title> {{ t('mnemonics') }} </template>
						<template v-slot:detail>
							{{ t('view_your_mnemonic_phrase') }}
						</template>
						<template v-slot:side>
							<q-icon name="sym_r_keyboard_arrow_right" size="20px" />
						</template>
					</terminus-item>

					<div
						class="accountCentent__backup-mneminic q-mt-lg q-pl-lg q-py-lg row items-center justify-between"
						v-else
					>
						<div class="accountCentent__backup-mneminic__introduce">
							<div class="title text-h5">
								{{ t('please_backup_your_mnemonic_phrase') }}
							</div>
							<div class="detail text-body2">
								{{ t('back_up_your_mnemonic_phrase_immediately_to_safe') }}
							</div>
							<div
								class="backup text-subtitle3 q-mt-md row items-center justify-center"
								@click="startBackUp"
							>
								{{ t('start_backup') }}
							</div>
						</div>
						<div class="accountCentent__backup-mneminic__image">
							<img src="../../../assets/account/backup_mnemonic_image.svg" />
						</div>
					</div>

					<terminus-item
						:show-board="true"
						img-bg-classes="bg-color-yellow"
						:item-height="88"
						icon-name="sym_r_fact_check"
						:whole-picture-size="48"
						class="q-mt-lg"
						@click="enterVCManagement"
					>
						<template v-slot:title> {{ t('vc_management') }} </template>
						<template v-slot:detail>
							{{ t('bind_your_social_account') }}
						</template>
						<template v-slot:side>
							<q-icon name="sym_r_keyboard_arrow_right" size="20px" />
						</template>
					</terminus-item>

					<terminus-item
						v-if="showCheckHistory"
						:show-board="true"
						img-bg-classes="bg-color-yellow"
						:item-height="88"
						icon-name="sym_r_fact_check"
						:whole-picture-size="48"
						class="q-mt-lg"
						@click="enterCheckHistory"
					>
						<template v-slot:title> CheckHistory </template>
						<template v-slot:side>
							<q-icon name="sym_r_keyboard_arrow_right" size="20px" />
						</template>
					</terminus-item>

					<terminus-item
						v-if="!userStore.current_user?.cloud_id"
						:show-board="true"
						img-bg-classes="bg-color-yellow"
						:item-height="88"
						icon-name="sym_r_badge"
						:whole-picture-size="48"
						class="q-mt-lg"
						@click="onLoginCloud"
					>
						<template v-slot:title>
							{{ t('terminus_space_management') }}
						</template>
						<template v-slot:detail>
							{{ t('domain_management_etc') }}
						</template>
						<template v-slot:side>
							<div class="row items-center justify-end">
								<q-icon name="sym_r_keyboard_arrow_right" />
							</div>
						</template>
					</terminus-item>
				</q-list>
			</template>
		</terminus-scroll-area>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useUserStore } from '../../../stores/user';
import { useQuasar } from 'quasar';
import TerminusTitleBar from '../../../components/common/TerminusTitleBar.vue';
import { useRouter } from 'vue-router';
import TerminusScrollArea from '../../../components/common/TerminusScrollArea.vue';
import TerminusUserStatus from '../../../components/common/TerminusUserStatus.vue';
import TerminusItem from '../../../components/common/TerminusItem.vue';
import { TermiPassVpnStatusInfo } from '../../../platform/terminusCommon/terminusCommonInterface';
import { useScaleStore } from '../../../stores/scale';
import { watch } from 'vue';
import AccoutMoreDialog from './AccoutMoreDialog.vue';
import { useI18n } from 'vue-i18n';
// import { walletService } from '../../../wallet';
// import { defaultDriverPath, mnemonicToKey } from '../../../layouts/dialog/sign';

const $router = useRouter();
const userStore = useUserStore();
const $q = useQuasar();
const scaleStore = useScaleStore();

const isBex = ref(process.env.IS_BEX);

const { t } = useI18n();

const startBackUp = () => {
	$router.push({ path: '/backup_mnemonics' });
	// const message =
	// 	'{"types":{"Complaint":[{"name":"srcChainId","type":"uint64"},{"name":"srcAddress","type":"uint256"},{"name":"srcToken","type":"string"},{"name":"dstChainId","type":"uint64"},{"name":"dstAddress","type":"uint256"},{"name":"dstToken","type":"string"},{"name":"srcAmount","type":"string"},{"name":"dstAmount","type":"string"},{"name":"dstNativeAmount","type":"string"},{"name":"requestor","type":"string"},{"name":"lpId","type":"string"},{"name":"stepTimeLock","type":"uint64"},{"name":"agreementReachedTime","type":"uint64"},{"name":"userSign","type":"string"},{"name":"lpSign","type":"string"}]},"domain":{"name":"Otmoic Reputation","version":"1","chainId":11155420,"verifyingContract":"0xe69257d83b2c50b2d7496348d053d76c744753e4"},"message":{"srcChainId":60,"srcAddress":"0x3c73D73a500373C7689b480a0f7b4b3F35600d52","srcToken":"0x30DfEC4d5Cd6f819492A04c34E20f5F15171e934","dstChainId":60,"dstAddress":"0x597bab881d340e359a4e6264fe9ac5a656d297d5","dstToken":"0x1016A0886b4AeD69043367d501a99cfBAaB052B5","srcAmount":"100000000000000000","dstAmount":"2057574550000000000","dstNativeAmount":"0","requestor":"0x597bab881d340e359a4e6264fe9ac5a656d297d5","stepTimeLock":240,"agreementReachedTime":1713244298,"userSign":"0xfd1bcbdf36e6d86305f69946e9ff9e2ee6c4dc78b06d1c0dbc6a115568d976905f3712e7a7f2bcd4aadcf51ec49e6270a775de2c03a391cd82a95ba988c651fa1b","lpSign":"0x575a6759e6ee9f32c66adcf454c3d19a643c3f2672d2cd100bbd100c0645d0820ff67315d6d4411c60b16cf73e1c6b59bfa3d3315893a7fdc8f8cd3e1d95e2c51c"}}';
	// const { EthereumMessageSigner } = walletService.walletCore;
	// const ownerKey = mnemonicToKey(
	// 	userStore.current_user!.mnemonic,
	// 	defaultDriverPath(0)
	// );
	// const outputData = EthereumMessageSigner.signTypedMessage(
	// 	ownerKey,
	// 	JSON.stringify(message)
	// );
	// // return `0x${outputData}`;
	// console.log('messae ===>', outputData);
};

const enterVCManagement = () => {
	$router.push({ path: '/vc_manage' });
};

const offLineModeRef = ref(userStore.current_user?.offline_mode || false);

const updateOffLineMode = async () => {
	userStore.updateOfflineMode(offLineModeRef.value);
};

const moreClick = () => {
	$q.dialog({
		component: AccoutMoreDialog,
		componentProps: {}
	});
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

const enterCheckHistory = () => {
	$router.push({ path: '/checkHistory' });
};

const onLoginCloud = () => {
	$router.push({ path: '/space_management' });
};

const showCheckHistory = ref(false);

// let count = 0;

// let startTime: Date | undefined = undefined;

const updateShowCheckHistory = () => {
	// if (count === 0) {
	// 	startTime = new Date();
	// } else if (count >= 1) {
	// 	let nextTime = new Date();
	// 	if (
	// 		nextTime.getMilliseconds() - (startTime?.getMilliseconds() || 0) >=
	// 		5000
	// 	) {
	// 		startTime = nextTime;
	// 		count = 0;
	// 	}
	// 	if (count === 3) {
	// 		showCheckHistory.value = !showCheckHistory.value;
	// 		startTime = nextTime;
	// 		count = 0;
	// 	}
	// }
	// count++;
	// console.log(count);
};
</script>

<style scoped lang="scss">
.account-root {
	width: 100%;
	height: 100%;
	position: relative;
	z-index: 0;
}

.flur1 {
	width: 135px;
	height: 135px;
	background: rgba(133, 211, 255, 0.7);
	filter: blur(70px);
	position: absolute;
	right: 20vw;
	top: 10vh;
	z-index: -1;
}

.flur2 {
	width: 110px;
	height: 110px;
	background: rgba(217, 255, 109, 0.6);
	filter: blur(70px);
	position: absolute;
	left: 20vw;
	top: 20vh;
	z-index: -1;
}

.account-scroll {
	width: 100%;
	height: calc(100% - 56px);
}

.accountCentent {
	width: 100%;
	padding-left: 20px;
	padding-right: 20px;

	&__avatar {
		width: 64px;
		height: 64px;
		border-radius: 32px;
		overflow: hidden;
	}

	&__name {
		color: $title;
	}

	&__info {
		text-align: center;
		color: $sub-title;
	}

	&__action_base {
		border: 1px solid $grey-2;
		border-radius: 16px;
		width: calc(50% - 10px);
		height: 128px;

		.icon-bg {
			width: 32px;
			height: 32px;
			overflow: hidden;
			border-radius: 16px;
			background-color: $white;
			color: $grey-8;
		}

		.title {
			color: $title;
		}
	}

	&__action_offline {
		background: linear-gradient(
			127.05deg,
			#fffef7 4.41%,
			rgba(249, 254, 199, 0.5) 49.41%,
			rgba(243, 254, 194, 0.5) 84.8%
		);
	}

	&__action_vpn {
		background: linear-gradient(
			125.16deg,
			#fcfff7 4.57%,
			rgba(216, 255, 222, 0.5) 51.18%,
			rgba(226, 255, 219, 0.5) 87.85%
		);
	}

	&__backup-mneminic {
		border: 1px solid $grey-2;
		width: 100%;
		background: linear-gradient(
			127.05deg,
			#fffef7 4.41%,
			rgba(249, 254, 199, 0.5) 49.41%,
			rgba(243, 254, 194, 0.5) 84.8%
		);
		border-radius: 16px;
		position: relative;

		&__introduce {
			width: calc(100% - 135px);
			height: 100%;

			.title {
				color: $title;
			}

			.detail {
				color: $sub-title;
			}

			.backup {
				background: $yellow;
				border-radius: 8px;
				height: 32px;
				text-align: center;
				color: $title;
				width: 93px;
			}
		}

		&__image {
			width: 127px;
			position: absolute;
			right: 15px;
			bottom: 20px;
		}
	}
}
</style>
