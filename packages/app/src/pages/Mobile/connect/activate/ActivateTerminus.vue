<template>
	<div class="active-terminus-root">
		<div class="float-wrap">
			<div class="float" style="background: #fffdc1"></div>
			<div class="float" style="background: #fbffed"></div>
		</div>
		<terminus-wizard-view
			:btn-title="t('scan_the_qr_code')"
			:bottom-more-height="50"
			btn-icon="sym_r_qr_code_scanner"
			@on-confirm="goToScanPage"
		>
			<template v-slot:content>
				<div
					class="active-terminus-root__content column justify-center items-center"
				>
					<q-img
						:src="pictureImg"
						class="active-terminus-root__content__image"
					/>
					<div
						class="active-terminus-root__content__reminder text-body2 q-mt-md"
					>
						{{ reminderInfoRef }}
						<span
							class="active-terminus-root__content__reminder__detail"
							@click="showDetail"
							>{{ t('view_details') }}</span
						>
					</div>
					<div
						class="active-terminus-root__content__user q-mt-md column items-center justify-center"
					>
						<div class="active-terminus-root__content__user__image">
							<TerminusAvatar :info="userStore.terminusInfo()" :size="40" />
						</div>

						<div class="text-h6 text-ink-1 q-mt-xs">
							{{ userStore.current_user?.local_name }}
						</div>
						<div
							class="active-terminus-root__content__user__info text-body3 q-mt-xs"
						>
							@{{ userStore.current_user?.domain_name }}
						</div>
					</div>
				</div>
			</template>
			<template v-slot:bottom-bottom>
				<TerminusExportMnemonicRoot class="q-mt-lg" />
			</template>
		</terminus-wizard-view>
		<div
			class="active-terminus-root__img row items-center justify-center"
			:style="`top:${
				$q.platform.is.ios ? 'calc(env(safe-area-inset-top) + 20px);' : '57px'
			}`"
		>
			<TerminusChangeUserHeader :scan="false" />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { useUserStore } from '../../../../stores/user';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { UserItem } from '@didvault/sdk/src/core';
import TerminusWizardView from '../../../../components/common/TerminusWizardView.vue';
import pictureImg from '../../../../assets/wizard/activate.svg';
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { getTerminusInfo } from '../../../../utils/BindTerminusBusiness';
import { TerminusInfo } from '@bytetrade/core';
import TerminusExportMnemonicRoot from '../../../../components/common/TerminusExportMnemonicRoot.vue';
import TerminusChangeUserHeader from '../../../../components/common/TerminusChangeUserHeader.vue';
import ActivateTipDialog from './ActivateTipDialog.vue';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const $q = useQuasar();

const disableLeave = route.params.disableLeave;
const user: UserItem = userStore.users!.items.get(userStore.current_id!)!;
if (!disableLeave) {
	if (user.terminus_activate_status == 'completed' || user.setup_finished) {
		router.push({ path: '/home' });
	} else if (user.terminus_activate_status == 'wait_reset_password') {
		router.push({ path: '/ResetPassword' });
	} else if (
		user.terminus_activate_status == 'wait_activate_vault' ||
		user.terminus_activate_status == 'vault_activating' ||
		user.terminus_activate_status == 'vault_activate_failed'
	) {
		// do nothing
	} else {
		router.push({ path: 'activateWizard' });
	}
}

async function goToScanPage() {
	if (!(await userStore.unlockFirst())) {
		return;
	}
	if (userStore.current_user?.access_token) {
		userStore.current_user.access_token = '';
	}
	if (process.env.IS_PC_TEST) {
		router.push({ path: '/scan_local' });
	} else {
		if ($q.platform.is.nativeMobile) {
			router.push({ path: '/scan' });
		} else {
			router.push({ path: '/scan_local' });
		}
	}
}

const reminderInfoRef = ref(t('complete_your_terminus_device_activation'));

const showDetail = () => {
	$q.dialog({
		component: ActivateTipDialog,
		componentProps: {
			title: 'Tips',
			message: t('complete_your_terminus_device_activation'),
			btnTitle: t('i_got_it')
		}
	});
};

let timer: any | undefined = undefined;
let curCount = 0;
onMounted(async () => {
	if (!userStore.current_user?.setup_finished) {
		//
		timer = setInterval(async () => {
			const info: TerminusInfo | null = await getTerminusInfo(user); //terminus_name
			curCount = curCount + 1;
			if (curCount > 5) {
				clearInterval(timer);
			}
			if (info && info.wizardStatus == 'completed') {
				clearInterval(timer);
				router.replace({ path: '/ConnectTerminus' });
			}
		}, 5000);
	}
});

onBeforeUnmount(() => {
	if (timer) {
		clearInterval(timer);
		timer = undefined;
	}
});
</script>

<style lang="scss" scoped>
.active-terminus-root {
	width: 100%;
	height: 100%;
	position: relative;

	&__img {
		width: calc(100% - 40px);
		height: 40px;
		position: absolute;
		right: 20px;
		border-radius: 16px;
		overflow: hidden;

		.header-content {
			width: 100%;
			.scan-icon {
				width: 40px;
				height: 40px;
			}
		}
		.avatar {
			height: 40px;
			width: 40px;
			overflow: hidden;
			border-radius: 20px;
		}
	}

	&__content {
		width: 100%;
		height: 100%;

		&__image {
			width: 124px;
			height: 124px;
		}

		&__reminder {
			text-align: center;
			color: $ink-2;

			&__detail {
				color: $blue;
				text-decoration: underline;
				cursor: pointer;
			}
		}

		&__user {
			border: 1px solid $separator;
			width: 100%;
			border-radius: 12px;
			padding-top: 20px;
			padding-bottom: 20px;

			&__image {
				width: 40px;
				height: 40px;
				border-radius: 20px;
				overflow: hidden;
			}

			&__info {
				text-align: center;
				color: $ink-2;
			}
		}
	}
}
</style>
