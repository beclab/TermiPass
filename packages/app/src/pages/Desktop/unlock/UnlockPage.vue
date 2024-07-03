<template>
	<div class="terminus-unlock-page column justify-center items-center">
		<q-img
			class="terminus-unlock-page__brand"
			:src="
				$q.dark.isActive
					? getRequireImage('login/Termipasstermipass_brand_desktop_dark.svg')
					: getRequireImage('login/Termipasstermipass_brand_desktop_light.svg')
			"
		/>
		<div class="terminus-unlock-box column justify-start items-center">
			<span class="terminus-unlock-box__desc login-sub-title">{{
				t('terminus_unlock_desc')
			}}</span>
			<terminus-edit
				v-model="passwordRef"
				:label="t('password')"
				:show-password-img="true"
				class="terminus-unlock-box__edit"
				@update:model-value="onTextChange"
				@keyup.enter="loginByPassword(passwordRef)"
			/>
			<confirm-button
				class="terminus-unlock-box__button"
				:btn-title="t('unlock.title')"
				:btn-status="btnStatusRef"
				@onConfirm="loginByPassword(passwordRef)"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { sendUnlock } from '../../../utils/bexFront';
import { ConfirmButtonStatus } from '../../../utils/constants';
import TerminusEdit from '../../../components/common/TerminusEdit.vue';
import ConfirmButton from '../../../components/common/ConfirmButton.vue';
import { getRequireImage } from '../../../utils/imageUtils';
import '../../../css/terminus.scss';
import { useI18n } from 'vue-i18n';
import { unlockPreviousUsersByPwd } from '../../Mobile/login/unlock/UnlockBusiness';
import { notifyFailed } from '../../../utils/notifyRedefinedUtil';

const $q = useQuasar();
const router = useRouter();
const passwordRef = ref('');
const { t } = useI18n();
const btnStatusRef = ref<ConfirmButtonStatus>(ConfirmButtonStatus.disable);

function onTextChange() {
	btnStatusRef.value =
		passwordRef.value.length < 8 || passwordRef.value.length > 32
			? ConfirmButtonStatus.disable
			: ConfirmButtonStatus.normal;
}

const loginByPassword = async (password: string) => {
	await unlockPreviousUsersByPwd(password, {
		async onSuccess(data: any) {
			if (data) {
				router.replace('/connectLoading');
			} else {
				router.replace({ path: '/import_mnemonic' });
			}
			sendUnlock();
		},
		onFailure(message: string) {
			notifyFailed(message);
		}
	});
};
</script>

<style scoped lang="scss">
.terminus-unlock-page {
	width: 100%;
	height: 100%;

	&__brand {
		width: 225px;
	}

	.terminus-unlock-box {
		width: 400px;
		margin-top: 32px;
		border-radius: 12px;
		padding: 20px;
		background: $background-2;
		border: 1px solid $separator;

		&__desc {
			margin-top: 12px;
		}

		&__edit {
			margin-top: 20px;
			width: 100%;
		}

		&__button {
			margin-top: 30px;
			width: calc(100%);
		}

		.item {
			border: 1px solid $grey-2;
			padding: 5rem;
			margin: 0.25rem;
			position: relative;
		}

		.header {
			position: absolute;
			top: 0;
			left: 0;
		}
	}
}
</style>
