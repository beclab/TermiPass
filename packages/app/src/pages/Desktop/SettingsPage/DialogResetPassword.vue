<template>
	<q-dialog class="card-dialog" v-model="show" ref="dialogRef">
		<q-card class="card-continer">
			<terminus-dialog-bar
				:label="title"
				icon=""
				titAlign="text-left"
				@close="onDialogCancel"
			/>

			<div
				class="dialog-desc"
				:style="{ textAlign: isMobile ? 'center' : 'left' }"
			>
				<terminus-edit
					v-model="oldPasswordRef"
					:label="t('please_enter_the_old_password')"
					:show-password-img="true"
					class="change-password-root__scroll__page__edit"
					@update:model-value="oldPwdInputChange"
				/>

				<terminus-password-validator
					ref="passwordValidator"
					v-model:button-status="newPasswordStatusRef"
					v-model:button-text="btnTextRef"
					:repeat-enable="false"
				/>
			</div>

			<terminus-dialog-footer
				okText="Confirm"
				cancelText="Cancel"
				showCancel
				@close="onCancel"
				@submit="onOK"
			/>
		</q-card>
	</q-dialog>
</template>

<script lang="ts" setup>
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { ref, defineProps, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '../../../stores/user';
import { ConfirmButtonStatus } from '../../../utils/constants';

import TerminusDialogBar from '../../../components/common/TerminusDialogBar.vue';
import TerminusDialogFooter from '../../../components/common/TerminusDialogFooter.vue';
import TerminusEdit from '../../../components/common/TerminusEdit.vue';
import TerminusPasswordValidator from '../../../components/common/TerminusPasswordValidator.vue';
import { notifyFailed } from '../../../utils/notifyRedefinedUtil';
import { app } from '../../../globals';

const { dialogRef, onDialogCancel, onDialogOK } = useDialogPluginComponent();
const $q = useQuasar();
const isMobile = ref(process.env.PLATFORM == 'MOBILE' || $q.platform.is.mobile);
const show = ref(true);
const { t } = useI18n();

defineProps({
	title: String
});

const oldPasswordRef = ref();

const btnTextRef = ref(t('next'));

const passwordValidator = ref();

const newPasswordStatusRef = ref<ConfirmButtonStatus>(
	ConfirmButtonStatus.disable
);
const totalBtnStatusRef = ref(ConfirmButtonStatus.disable);

watch(
	() => newPasswordStatusRef.value,
	() => {
		setButtonStatus();
	}
);

function oldPwdInputChange() {
	setButtonStatus();
}

function setButtonStatus() {
	if (!oldPasswordRef.value) {
		totalBtnStatusRef.value = ConfirmButtonStatus.disable;
		btnTextRef.value = t('next');
		return;
	}
	totalBtnStatusRef.value = newPasswordStatusRef.value;
}

function clearData() {
	passwordValidator.value.clearPassword();
	oldPasswordRef.value = '';
	oldPwdInputChange();
}

const userStore = useUserStore();

const verifyPassword = async () => {
	if (!oldPasswordRef.value) {
		notifyFailed(t('password_not_empty'));
		return;
	}

	const newPassword = passwordValidator.value.getValidPassword();
	if (!newPassword) {
		notifyFailed(t('password_not_meet_rules'));
		return;
	}

	try {
		if (!userStore.users || userStore.users.locked) {
			notifyFailed(t('please_unlock_first'));
			return;
		}
		await userStore.users.unlock(oldPasswordRef.value).then(() => {
			resetPasswordConfirm();
		});
		await onDialogOK();
	} catch (error) {
		notifyFailed(t('wrong_password_please_try_again'));
	}
};

const resetPasswordConfirm = async () => {
	const newPassword = passwordValidator.value.getValidPassword();
	try {
		const resetPasswordStatus = await userStore.updateUserPassword(
			oldPasswordRef.value,
			newPassword
		);
		if (resetPasswordStatus.status) {
			app.lock();
		} else {
			notifyFailed(resetPasswordStatus.message);
		}
	} catch (error) {
		if (error.message) {
			notifyFailed(error.message);
		}
	}
};

const onCancel = () => {
	clearData();
	onDialogCancel();
};

const onOK = async () => {
	await verifyPassword();
};
</script>

<style lang="scss" scoped>
.card-dialog {
	.card-continer {
		width: 400px;
		border-radius: 12px;

		.dialog-desc {
			padding-left: 20px;
			padding-right: 20px;
		}
	}
}
</style>
