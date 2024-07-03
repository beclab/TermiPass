<template>
	<div class="terminus-unlock-root column justify-start items-center">
		<q-scroll-area
			class="terminus-unlock-scroll"
			:class="keyboardOpen ? 'scroll-area-conf-open' : 'scroll-area-conf-close'"
		>
			<div class="terminus-unlock-page column justify-start items-center">
				<q-img
					class="terminus-unlock-page__brand"
					:src="getRequireImage('login/termipass_brand.svg')"
				/>
				<span class="terminus-unlock-page__desc login-sub-title">{{
					t('terminus_unlock_desc')
				}}</span>
				<terminus-edit
					v-model="passwordRef"
					:label="t('password')"
					:show-password-img="true"
					class="terminus-unlock-page__edit"
					@update:model-value="onTextChange"
				/>
				<div class="terminus-unlock-page__box" />
				<q-icon
					v-if="biometricIcon"
					size="48px"
					:name="`sym_r_${biometricIcon}`"
					@click="unlockByBiometric"
				/>
			</div>
		</q-scroll-area>
		<confirm-button
			class="terminus-unlock-root-button"
			:btn-title="t('unlock.title')"
			:btn-status="btnStatusRef"
			@onConfirm="loginByPassword(passwordRef)"
		/>
	</div>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useUserStore } from '../../../../stores/user';
import { BiometryType } from '@capgo/capacitor-native-biometric';
import { sendUnlock } from '../../../../utils/bexFront';
import { ConfirmButtonStatus } from '../../../../utils/constants';
import TerminusEdit from '../../../../components/common/TerminusEdit.vue';
import ConfirmButton from '../../../../components/common/ConfirmButton.vue';
import { getRequireImage } from '../../../../utils/imageUtils';
import MonitorKeyboard from '../../../../utils/monitorKeyboard';
import '../../../../css/terminus.scss';
import { useApproval } from '../../wallet/approval';
import { getUiType } from '../../../../utils/utils';
import { getNativeAppPlatform } from '../../../../platform/capacitor/capacitorPlatform';
import { useI18n } from 'vue-i18n';
import { unlockByPwd } from './UnlockBusiness';
import { notifyFailed } from '../../../../utils/notifyRedefinedUtil';

const $q = useQuasar();
const router = useRouter();
const passwordRef = ref('');
const { t } = useI18n();
const userStore = useUserStore();
const btnStatusRef = ref<ConfirmButtonStatus>(ConfirmButtonStatus.disable);
const biometricAvailable = ref(false);
const biometricIcon = ref();
let monitorKeyboard: MonitorKeyboard | undefined = undefined;
const keyboardOpen = ref(false);

function onTextChange() {
	btnStatusRef.value =
		passwordRef.value.length < 8 || passwordRef.value.length > 32
			? ConfirmButtonStatus.disable
			: ConfirmButtonStatus.normal;
}

const loginByPassword = async (password: string) => {
	await unlockByPwd(password, {
		async onSuccess(data: any) {
			if (data) {
				const UIType = getUiType();
				if (UIType.isNotification) {
					const { resolveApproval } = useApproval(router);
					sendUnlock();
					resolveApproval();
					return;
				}
				if (userStore.current_user) {
					if (userStore.current_user.name) {
						router.replace('/connectLoading');
					} else {
						router.replace('/bind_vc');
					}
				}
			} else {
				if (process.env.IS_BEX) {
					router.replace({ path: '/import_mnemonic' });
					return;
				}

				router.replace({ name: 'setupSuccess' });
			}
			sendUnlock();
		},
		onFailure(message: string) {
			notifyFailed(message);
		}
	});
};

const unlockByBiometric = async () => {
	const password = await getNativeAppPlatform().unlockByBiometric();
	if (!password || password.length === 0) {
		notifyFailed(
			t('errors.biometric_verify_error_please_unlock_with_password_try_again')
		);
		return;
	}
	await loginByPassword(password);
};

onMounted(async () => {
	await setBiometric();

	if ($q.platform.is.android) {
		monitorKeyboard = new MonitorKeyboard();
		monitorKeyboard.onStart();
		monitorKeyboard.onShow(() => (keyboardOpen.value = true));
		monitorKeyboard.onHidden(() => (keyboardOpen.value = false));
	}
});

const setBiometric = async () => {
	biometricAvailable.value = userStore.openBiometric;
	if (userStore.openBiometric) {
		try {
			const result =
				await getNativeAppPlatform().biometricKeyStore.isSupportedWithData();
			const type = result.biometryType;
			unlockByBiometric();
			if (type === BiometryType.NONE) {
				biometricIcon.value = '';
				return;
			}
			if (
				type == BiometryType.FACE_ID ||
				type == BiometryType.FACE_AUTHENTICATION
			) {
				biometricIcon.value = 'ar_on_you';
				return;
			}

			if (
				type == BiometryType.TOUCH_ID ||
				type == BiometryType.FINGERPRINT ||
				type == BiometryType.MULTIPLE
			) {
				biometricIcon.value = 'fingerprint';
				return;
			}

			if (type == BiometryType.IRIS_AUTHENTICATION) {
				biometricIcon.value = 'motion_sensor_active';
				return;
			}
		} catch (error) {
			console.error(error);
			notifyFailed(error.message);
		}
	}
};

onBeforeMount(() => {
	if (process.env.IS_BEX) {
		if (userStore.password) {
			loginByPassword(userStore.password);
		}
	}
});
</script>

<style scoped lang="scss">
.terminus-unlock-root {
	width: 100%;
	height: 100%;
	background: $background;

	.terminus-unlock-scroll {
		width: 100%;
		.terminus-unlock-page {
			width: 100%;
			height: calc(
				100vh - 48px - 48px - env(safe-area-inset-top) -
					env(safe-area-inset-bottom)
			);
			padding-left: 20px;
			padding-right: 20px;

			&__brand {
				margin-top: 80px;
				width: 96px;
			}

			&__desc {
				margin-top: 20px;
			}

			&__edit {
				margin-top: 64px;
				width: 100%;
			}
			&__box {
				height: calc(100% - 452px);
			}
		}
	}

	.terminus-unlock-root-button {
		width: calc(100% - 40px);
	}
}
</style>
