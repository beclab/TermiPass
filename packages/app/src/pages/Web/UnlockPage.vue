<template>
	<div class="terminus-unlock-page column justify-center items-center">
		<q-img
			class="terminus-unlock-page__brand"
			:src="getRequireImage('login/vault_brand_web.svg')"
		/>
		<div class="terminus-unlock-box column justify-start items-center">
			<span class="terminus-unlock-box__desc login-sub-title">{{
				t('terminus_unlock_vault_desc')
			}}</span>
			<terminus-edit
				v-model="passwordRef"
				:label="t('password')"
				:show-password-img="true"
				class="terminus-unlock-box__edit"
				@update:model-value="onTextChange"
				@keyup.enter="onSubmit"
			/>
			<confirm-button
				class="terminus-unlock-box__button"
				:btn-status="btnStatusRef"
				:btn-title="t('unlock')"
				@onConfirm="onSubmit()"
			/>
			<!-- :btn-status="btnStatusRef" -->
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ConfirmButtonStatus } from '../../utils/constants';
import TerminusEdit from '../../components/common/TerminusEdit.vue';
import ConfirmButton from '../../components/common/ConfirmButton.vue';
import '../../css/terminus.scss';
import { useI18n } from 'vue-i18n';
import { getRequireImage } from '../../utils/imageUtils';
import { UserItem } from '@didvault/sdk/src/core';
import { useUserStore } from '../../stores/user';
import { app } from '../../globals';
import { notifyFailed } from '../../utils/notifyRedefinedUtil';

const router = useRouter();
const passwordRef = ref('');
const { t } = useI18n();
const btnStatusRef = ref<ConfirmButtonStatus>(ConfirmButtonStatus.disable);
let failedCount = 0;
const userStore = useUserStore();

function onTextChange() {
	btnStatusRef.value =
		passwordRef.value.length < 8 || passwordRef.value.length > 32
			? ConfirmButtonStatus.disable
			: ConfirmButtonStatus.normal;
}

const loginByPassword = async (password: string) => {
	await userStore.users!.unlock(password);

	if (!userStore.current_user) {
		router.push({ path: '/import_mnemonic' });
	} else {
		let user: UserItem = userStore.users!.items.get(userStore.current_id!)!;
		await app.load(undefined);
		await app.unlock(user.mnemonic);
		router.push('/items');
	}
};

async function onSubmit() {
	await app.loaded;
	try {
		if (!passwordRef.value) {
			notifyFailed(t('password_not_empty'));
			return;
		}

		await loginByPassword(passwordRef.value);
	} catch (e) {
		notifyFailed(t('password_error'));
		failedCount++;
		if (failedCount > 3) {
			await app.logout();
			await userStore.clear();
			router.push({ path: '/login' });
			notifyFailed(t('failed_to_unlock_too_many_times'));
			return;
		}
		failedCount++;
	}
}
</script>

<style scoped lang="scss">
.terminus-unlock-page {
	width: 100%;
	height: 100%;
	background: $background;

	&__brand {
		width: 124px;
		height: 40px;
	}

	.terminus-unlock-box {
		width: 400px;
		margin-top: 32px;
		border-radius: 12px;
		padding: 20px;
		background: $background;
		border: 1px solid $grey-2;

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
	}
}
</style>
