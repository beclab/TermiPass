<template>
	<q-scroll-area class="bind-terminus-vc-scroll">
		<div
			class="bind-terminus-vc-page column justify-start items-center"
			style="position: relative"
		>
			<q-img
				class="bind-terminus-vc-page__image"
				:src="getRequireImage('login/create_terminus_name.svg')"
			/>
			<span class="bind-terminus-vc-page__desc login-sub-title">{{
				t('bind_terminus_vc_desc')
			}}</span>
			<div
				class="bind-terminus-vc-page__title text-color-title text-h6"
				@click="googleTestUpdateCheck"
			>
				{{ t('verify_using_gmail') }}
			</div>
			<!-- <terminus-v-c-card
				style="margin-top: 12px"
				:type="TERMINUS_VC_TYPE.TWITTER"
				@click="request(TERMINUS_VC_TYPE.TWITTER)"
			/> -->
			<terminus-v-c-card
				style="margin-top: 20px"
				:type="TERMINUS_VC_TYPE.GOOGLE"
				@click="request(TERMINUS_VC_TYPE.GOOGLE)"
			/>
			<terminus-title-bar
				style="position: absolute; top: 0"
				:translate="true"
			/>
		</div>
	</q-scroll-area>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { getRequireImage } from '../../../../utils/imageUtils';
import { TERMINUS_VC_TYPE } from '../../../../utils/constants';
import { requestBindVC, readySubmitPresentation } from './BindVCBusiness';
import TerminusVCCard from '../../../../components/common/TerminusVCCard.vue';
import { useRouter } from 'vue-router';
import {
	BIND_STATUS,
	current_user_bind_status
} from '../../../../utils/terminusBindUtils';
import { useUserStore } from '../../../../stores/user';
import TerminusTitleBar from '../../../../components/common/TerminusTitleBar.vue';
// import { useMenuStore } from '../../../../stores/menu';
import { notifyFailed } from '../../../../utils/notifyRedefinedUtil';

const $q = useQuasar();
const { t } = useI18n();
const router = useRouter();
const userStore = useUserStore();
// const menuStore = useMenuStore();

async function request(request_type: TERMINUS_VC_TYPE) {
	$q.loading.show();
	await requestBindVC(request_type, null, {
		async onSuccess(data: any) {
			if (data) {
				const userBindStatus = current_user_bind_status();
				const terminusName = userStore.current_user?.name;
				const bindVCAndSelectedName =
					!terminusName && userBindStatus < BIND_STATUS.OS_NONE;
				if (bindVCAndSelectedName) {
					await readySubmitPresentation(data, null, {
						// data no use
						onSuccess() {
							router.replace({
								path: '/bind_vc_success'
							});
						},
						onFailure(message: string) {
							notifyFailed(message);
						}
					});
				} else {
					//router.replace('/home');
					router.replace({ path: '/connectLoading' });
				}
			} else {
				notifyFailed(t('errors.bind_vc_error'));
			}
		},
		onFailure(message: string) {
			notifyFailed(message);
		}
	});
	$q.loading.hide();
}

// let count = 0;

// let startTime: Date | undefined = undefined;

const googleTestUpdateCheck = () => {
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
	// 		menuStore.updateGoogleTest(true);
	// 		if (menuStore.googleTest) {
	// 			notifyFailed('current is google test');
	// 		}
	// 		startTime = nextTime;
	// 		count = 0;
	// 	}
	// }
	// count++;
};
</script>

<style lang="scss" scoped>
.bind-terminus-vc-scroll {
	width: 100%;
	height: 100%;
	background: $background;

	.bind-terminus-vc-page {
		width: 100%;
		height: 100%;
		padding-left: 20px;
		padding-right: 20px;

		&__image {
			width: 160px;
			height: 160px;
			margin-top: 32px;
		}

		&__desc {
			width: 100%;
			margin-top: 20px;
		}

		&__title {
			margin-top: 32px;
			width: 100%;
		}
	}
}
</style>
