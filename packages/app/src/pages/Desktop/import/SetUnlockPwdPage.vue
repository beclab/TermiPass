<template>
	<div class="set-unlock-pwd-page column justify-start items-center">
		<terminus-page-title
			:center="true"
			class="page-title"
			:label="t('password_settings')"
			:desc="t('create_a_password_desc')"
		/>

		<terminus-password-validator
			ref="passwordValidator"
			v-model:button-status="btnStatusRef"
			v-model:button-text="btnTextRef"
			@keyup.enter="verifyPassword"
		/>

		<confirm-button
			class="set-unlock-pwd-page__button"
			:btn-title="btnTextRef"
			@onConfirm="verifyPassword"
			@onError="clearData"
			:btn-status="btnStatusRef"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import ConfirmButton from '../../../components/common/ConfirmButton.vue';
import '../../../css/terminus.scss';
import { useI18n } from 'vue-i18n';
import { ConfirmButtonStatus } from '../../../utils/constants';
import { savePassword } from '../../Mobile/login/unlock/UnlockBusiness';
import TerminusPageTitle from '../../../components/common/TerminusPageTitle.vue';
import TerminusPasswordValidator from '../../../components/common/TerminusPasswordValidator.vue';
import { notifyFailed } from '../../../utils/notifyRedefinedUtil';

const $router = useRouter();
const $q = useQuasar();
const { t } = useI18n();

const btnTextRef = ref(t('next'));
const btnStatusRef = ref<ConfirmButtonStatus>(ConfirmButtonStatus.disable);
const passwordValidator = ref();

function clearData() {
	passwordValidator.value.clearPassword();
}

const verifyPassword = async () => {
	const password = passwordValidator.value.getValidPassword();
	if (!password) {
		notifyFailed(t('password_not_meet_rules'));
		return;
	}
	$q.loading.show();
	await savePassword(password, {
		async onSuccess() {
			$router.push({
				name: 'InputMnemonic'
			});
		},
		onFailure(message: string) {
			notifyFailed(message);
		}
	});
	$q.loading.hide();
};
</script>

<style lang="scss" scoped>
.set-unlock-pwd-page {
	width: 100%;
	height: 100%;
	background: $background;
	padding-top: 20px;
	padding-left: 32px;
	padding-right: 32px;
	position: relative;

	&__button {
		position: absolute;
		bottom: 52px;
		width: calc(100% - 64px);
		left: 32px;
		right: 32px;
	}
}
</style>
