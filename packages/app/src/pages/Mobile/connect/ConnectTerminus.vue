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
					<div class="row items-center justify-center">
						<div class="terminus-login-page__image">
							<TerminusAvatar :info="userStore.terminusInfo()" :size="64" />
						</div>
					</div>
					<div class="terminus-login-page__name text-h5 q-mt-md">
						{{ userStore.current_user?.local_name }}
					</div>

					<div class="terminus-login-page__desc text-body3 q-mt-xs">
						@{{ userStore.current_user?.domain_name }}
					</div>

					<q-checkbox v-if="isLocalTest" v-model="use_local"
						>local server</q-checkbox
					>
					<terminus-edit
						v-model="osPwd"
						:label="t('Password')"
						:show-password-img="true"
						class="terminus-login-page__edit"
						@update:model-value="pwdInputChange"
					/>
				</div>
			</template>
		</terminus-scroll-area>
		<confirm-button
			class="terminus-login-root-button"
			:btn-title="btnTitle"
			@onConfirm="onConfirm"
			:btn-status="btnStatusRef"
		/>
		<q-inner-loading :showing="loading" dark color="white" size="64px">
		</q-inner-loading>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../../stores/user';
import { TerminusInfo } from '@bytetrade/core';
import { useQuasar } from 'quasar';
import { UserItem } from '@didvault/sdk/src/core';
import TerminusEdit from '../../../components/common/TerminusEdit.vue';
import ConfirmButton from '../../../components/common/ConfirmButton.vue';
import TerminusScrollArea from '../../../components/common/TerminusScrollArea.vue';
import { ConfirmButtonStatus } from '../../../utils/constants';
import MonitorKeyboard from '../../../utils/monitorKeyboard';
import { useI18n } from 'vue-i18n';
import {
	connectTerminus,
	getTerminusInfo,
	loginTerminus
} from './BindTerminusBusiness';
import { busEmit } from '../../../utils/bus';
import { notifyFailed } from '../../../utils/notifyRedefinedUtil';
import { useTermipassStore } from '../../../stores/termipass';

const { t } = useI18n();
const $q = useQuasar();
const router = useRouter();
const terminusNameRef = ref<string>('');

const userStore = useUserStore();
const loading = ref(false);
const btnTitle = ref(t('complete'));

const termipassStore = useTermipassStore();

const osPwd = ref('');
const btnStatusRef = ref<ConfirmButtonStatus>(ConfirmButtonStatus.disable);
let monitorKeyboard: MonitorKeyboard | undefined = undefined;
const keyboardOpen = ref(false);

const user: UserItem = userStore.users!.items.get(userStore.current_id!)!;

terminusNameRef.value = user.name;

onMounted(() => {
	if ($q.platform.is.android) {
		monitorKeyboard = new MonitorKeyboard();
		monitorKeyboard.onStart();
		monitorKeyboard.onShow(() => (keyboardOpen.value = true));
		monitorKeyboard.onHidden(() => (keyboardOpen.value = false));
	}
	if (termipassStore.srpInvalid) {
		btnTitle.value = t('reconnect');
	} else if (termipassStore.ssoInvalid) {
		btnTitle.value = t('login');
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

const isLocalTest = computed(() => {
	return process.env.IS_PC_TEST;
});

const use_local = ref(false);

const onConfirm = async () => {
	loading.value = true;
	const pingResult: TerminusInfo | null = await getTerminusInfo(user); //terminus_name
	if (!pingResult) {
		notifyFailed(
			t(
				'errors.unable_to_connect_to_terminus_please_check_if_the_machine_and_network_are_functioning_properly'
			)
		);
		loading.value = false;
		return;
	}
	try {
		await connectTerminus(user, osPwd.value, use_local.value);
		await loginTerminus(user, osPwd.value, true, use_local.value);

		busEmit('account_update', true);

		//connect success set terminusid
		user.terminus_id = pingResult.terminusId;
		await userStore.users!.items.update(user);
		await userStore.save();

		if (process.env.PLATFORM == 'DESKTOP') {
			router.replace({ path: '/Files/Home/' });
		} else {
			router.replace({ path: '/home' });
		}
	} catch (e) {
		notifyFailed(e.message);
	} finally {
		loading.value = false;
	}
};
</script>

<style lang="scss" scoped>
.terminus-login-root {
	width: 100%;
	height: 100%;
	background: $background;

	.terminus-login-scroll {
		width: 100%;

		.terminus-login-page {
			width: 100%;
			height: 100%;
			padding-left: 20px;
			padding-right: 20px;

			&__image {
				width: 64px;
				height: 64px;
				margin-top: 82px;
				border-radius: 32px;
				overflow: hidden;
			}

			&__name {
				text-align: center;
				color: $title;
				margin-top: 12px;
			}

			&__desc {
				text-align: center;
				color: $sub-title;
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
