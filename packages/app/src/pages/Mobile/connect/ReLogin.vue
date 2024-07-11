<template>
	<div class="terminus-login-root column justify-start items-center">
		<terminus-scroll-area
			class="terminus-login-scroll"
			:class="keyboardOpen ? 'scroll-area-conf-open' : 'scroll-area-conf-close'"
		>
			<template v-slot:content>
				<div
					class="terminus-login-page column justify-start items-center"
					style="position: relative"
				>
					<terminus-title-bar
						style="position: absolute; top: 0"
						:translate="true"
					/>
					<q-img
						class="terminus-login-page__image"
						:src="getRequireImage('login/terminus_login.svg')"
					/>
					<div
						v-if="terminusNameRef"
						class="terminus-login-page-bind column justify-center items-center"
					>
						<span class="terminus-login-page-bind__desc text-body3">{{
							t('Login Terminus')
						}}</span>
						<span class="terminus-login-page-bind__name text-h5">{{
							terminusNameRef
						}}</span>
					</div>
					<span class="terminus-login-page__desc login-sub-title">{{
						t('Please enter your terminus password')
					}}</span>
					<terminus-edit
						v-model="osPwd"
						:label="t('Password')"
						:show-password-img="false"
						class="terminus-login-page__edit"
						@update:model-value="pwdInputChange"
					/>
				</div>
			</template>
		</terminus-scroll-area>
		<confirm-button
			class="terminus-login-root-button"
			:btn-title="t('complete')"
			@onConfirm="onConfirm"
			:btn-status="btnStatusRef"
		/>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../../stores/user';

import { useQuasar } from 'quasar';
import { UserItem, MnemonicItem } from '@didvault/sdk/src/core';
import TerminusEdit from '../../../components/common/TerminusEdit.vue';
import ConfirmButton from '../../../components/common/ConfirmButton.vue';
import TerminusScrollArea from '../../../components/common/TerminusScrollArea.vue';
import { ConfirmButtonStatus } from '../../../utils/constants';
import MonitorKeyboard from '../../../utils/monitorKeyboard';
import { useI18n } from 'vue-i18n';
import { connectTerminus } from '../../../utils/BindTerminusBusiness';
import { getRequireImage } from '../../../utils/imageUtils';
import TerminusTitleBar from '../../../components/common/TerminusTitleBar.vue';
import { notifyFailed } from '../../../utils/notifyRedefinedUtil';

const { t } = useI18n();
const $q = useQuasar();
const router = useRouter();
const terminusNameRef = ref<string>('');
const userStore = useUserStore();

const osPwd = ref('');
const btnStatusRef = ref<ConfirmButtonStatus>(ConfirmButtonStatus.disable);
let monitorKeyboard: MonitorKeyboard | undefined = undefined;
const keyboardOpen = ref(false);

const user: UserItem = userStore.users!.items.get(userStore.current_id!)!;
const mnemonic: MnemonicItem = userStore.users!.mnemonics.get(
	userStore.current_id!
)!;

terminusNameRef.value = user.name;

onMounted(() => {
	if ($q.platform.is.android) {
		monitorKeyboard = new MonitorKeyboard();
		monitorKeyboard.onStart();
		monitorKeyboard.onShow(() => (keyboardOpen.value = true));
		monitorKeyboard.onHidden(() => (keyboardOpen.value = false));
	}
});

const calNextButtonEnable = () => {
	btnStatusRef.value =
		osPwd.value.length >= 6
			? ConfirmButtonStatus.normal
			: ConfirmButtonStatus.disable;
};

const pwdInputChange = () => {
	calNextButtonEnable();
};

const onConfirm = async () => {
	$q.loading.show();

	try {
		await connectTerminus(user, mnemonic.mnemonic, osPwd.value);
		router.push({ path: '/home' });
	} catch (e) {
		notifyFailed(e.message);
	} finally {
		$q.loading.hide();
	}
};
</script>

<style lang="scss" scoped>
.terminus-login-root {
	width: 100%;
	height: 100%;

	.terminus-login-scroll {
		width: 100%;

		.terminus-login-page {
			width: 100%;
			height: 100%;
			padding-left: 20px;
			padding-right: 20px;

			&__image {
				width: 160px;
				height: 160px;
				margin-top: 32px;
			}

			.terminus-login-page-bind {
				margin-top: 20px;
				padding: 32px;
				width: 100%;
				border-radius: 8px;
				background: linear-gradient(
						180deg,
						rgba(253, 255, 203, 0.3) 0%,
						rgba(236, 255, 135, 0.3) 100%
					),
					linear-gradient(
						91.55deg,
						#fefbe4 1.07%,
						#f9fdc2 22.09%,
						#feffb7 53.16%,
						#f0ffb4 83.15%,
						#f3fec2 99.07%
					);

				&__desc {
					text-align: center;
					color: $ink-2;
				}

				&__name {
					text-align: center;
					color: $ink-1;
					margin-top: 12px;
				}
			}

			&__desc {
				margin-top: 20px;
			}

			&__edit {
				margin-top: 20px;
				width: 100%;
			}

			&__box {
				height: calc(100vh - 572px - 138px);
			}

			&__scan {
				margin-top: 20px;
				margin-bottom: 10px;
				color: $blue-4;
			}
		}
	}

	.terminus-login-root-button {
		width: calc(100% - 40px);
	}
}
</style>
