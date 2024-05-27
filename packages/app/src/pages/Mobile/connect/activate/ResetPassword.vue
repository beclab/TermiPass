<template>
	<div class="terminus-login-root">
		<terminus-wizard-view
			:btn-status="btnStatusRef"
			:btn-title="btnTextRef"
			:enable-overlay="false"
			@on-confirm="onConfirm"
			@onError="clearData"
		>
			<template v-slot:content>
				<div class="terminus-login-root__content">
					<div class="row items-center justify-center">
						<div class="terminus-login-root__content__image">
							<TerminusAvatar :info="userStore.terminusInfo()" :size="100" />
						</div>
					</div>
					<div class="terminus-login-root__content__name text-h5 q-mt-md">
						{{ userStore.current_user?.local_name }}
					</div>
					<div class="terminus-login-root__content__info text-body2 q-mt-xs">
						{{ t('reset_your_Terminus_device_password') }}
					</div>

					<terminus-password-validator
						class="q-mt-md"
						:edt-transaction="true"
						ref="passwordValidator"
						v-model:button-status="btnStatusRef"
						v-model:button-text="btnTextRef"
					/>
				</div>
			</template>
		</terminus-wizard-view>
	</div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../../../stores/user';

import { useQuasar } from 'quasar';
import { UserItem } from '@didvault/sdk/src/core';
import TerminusWizardView from '../../../../components/common/TerminusWizardView.vue';
import { ConfirmButtonStatus } from '../../../../utils/constants';
import { useI18n } from 'vue-i18n';
import { loginTerminus } from '../BindTerminusBusiness';
import { WizardInfo } from './wizard';
import axios from 'axios';
import TerminusPasswordValidator from '../../../../components/common/TerminusPasswordValidator.vue';
import { busEmit } from '../../../../utils/bus';
import { notifyFailed } from '../../../../utils/notifyRedefinedUtil';

const { t } = useI18n();
const $q = useQuasar();
const router = useRouter();
const terminusNameRef = ref<string>('');
const userStore = useUserStore();

const btnTextRef = ref(t('complete'));

const btnStatusRef = ref<ConfirmButtonStatus>(ConfirmButtonStatus.disable);
const user: UserItem = userStore.users!.items.get(userStore.current_id!)!;
const wizard: WizardInfo = JSON.parse(user.wizard);
terminusNameRef.value = user.name;

let baseURL = wizard.url;
if (process.env.IS_PC_TEST) {
	baseURL = window.location.origin;
} else {
	baseURL = user.auth_url;
}

if (baseURL.endsWith('/')) {
	baseURL = baseURL.slice(0, -1);
}

const onConfirm = async () => {
	if (btnStatusRef.value != ConfirmButtonStatus.normal) {
		return;
	}
	const newPassword = passwordValidator.value.getValidPassword();
	if (!newPassword) {
		notifyFailed(t('password_not_meet_rules'));
		return;
	}

	$q.loading.show();

	try {
		await loginTerminus(user, wizard.password!, true);
	} catch (e) {
		$q.loading.hide();
		notifyFailed(e.message);
		return;
	}

	try {
		await axios.put(
			baseURL + '/bfl/iam/v1alpha1/users/' + user.local_name + '/password',
			{
				current_password: wizard.password,
				password: newPassword
			}
		);
	} catch (e) {
		notifyFailed(e.message);
		$q.loading.hide();
		return;
	}

	user.setup_finished = true;
	user.wizard = '';
	await userStore.users!.items.update(user);
	await userStore.save();

	try {
		// await loginTerminus(user, newPassword, true);
		busEmit('account_update', true);

		user.terminus_id = userStore.getUserTerminusInfo(user.id).terminusId;
		await userStore.users!.items.update(user);
		await userStore.save();

		router.push({ path: '/home' });
	} catch (e) {
		notifyFailed(e.message);
	} finally {
		$q.loading.hide();
	}
};

const passwordValidator = ref();
const clearData = () => {
	passwordValidator.value.clearPassword();
};

watch(
	() => btnStatusRef.value,
	() => {
		if (btnStatusRef.value === ConfirmButtonStatus.error) {
			btnTextRef.value = t('reset');
		} else {
			btnTextRef.value = t('complete');
		}
	}
);
</script>

<style lang="scss" scoped>
.terminus-login-root {
	width: 100%;
	height: 100%;
	background: $background;
	position: relative;

	&__content {
		width: 100%;
		height: 100%;
		padding-top: 80px;

		&__image {
			height: 100px;
			width: 100px;
			border-radius: 50px;
			overflow: hidden;
		}

		&__name {
			text-align: center;
			color: $title;
		}

		&__info {
			text-align: center;
			color: $sub-title;
		}
	}
}
</style>
