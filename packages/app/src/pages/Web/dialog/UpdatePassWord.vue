<template>
	<q-dialog ref="root" @hide="onDialogHide">
		<q-card class="q-dialog-plugin row root">
			<div class="text-color-title text-subtitle1 title">{{ title }}</div>
			<div class="text-color-title text-body1 content" v-if="message">
				{{ message }}
			</div>
			<div class="password">
				<q-input v-model="password" :label="label" borderless type="password" />
			</div>

			<div class="row iterm-center justify-between button">
				<q-btn class="bg-blue confirm" :label="confirmTxt" @click="onOKClick" />
				<q-btn
					class="bg-grey-11 text-color-sub-title cancel"
					:label="cancelTxt"
					@click="onCancelClick"
				/>
			</div>
		</q-card>
	</q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { app } from '../../../globals';
import { useMenuStore } from '../../../stores/menu';
import { useUserStore } from '../../../stores/user';
import { notifyFailed } from '../../../utils/notifyRedefinedUtil';
import { useI18n } from 'vue-i18n';
import { i18n } from '../../../boot/i18n';
defineProps({
	confirmTxt: {
		type: String,
		default: i18n.global.t('ok'),
		required: false
	},
	cancelTxt: {
		type: String,
		default: i18n.global.t('cancel'),
		required: false
	}
});
const store = useMenuStore();
const userStore = useUserStore();
const { t } = useI18n();

const emit = defineEmits(['hide']);
const root = ref<any>(null);
const password = ref('');
const newPassword = ref('');
const oldPassword = ref('');
const passwordStatus = ref('pending');

const title = ref(t('change_master_password'));
const message = ref(t('please_enter_your_current_password'));
const label = ref(t('enter_current_password'));

const hide = () => {
	store.dialogShow = false;
	root.value.hide();
};

const onDialogHide = () => {
	emit('hide');
};

const onOKClick = async () => {
	switch (passwordStatus.value) {
		case 'pending':
			try {
				if (!userStore.users || userStore.users.locked) {
					notifyFailed(t('please_unlock_first'));
					return;
				}
				await userStore.users.unlock(password.value).then(() => {
					passwordStatus.value = 'newPassword';
					message.value = t('now_choose_a_new_master_password');
					label.value = t('enter_New_password');
					oldPassword.value = password.value;
					password.value = '';
				});
			} catch (error) {
				notifyFailed(t('wrong_password_please_try_again'));
			}
			break;

		case 'newPassword':
			message.value = t('please_confirm_your_new_password');
			label.value = t('repert_new_password');
			newPassword.value = password.value;
			password.value = '';
			passwordStatus.value = 'repertPassword';
			break;

		case 'repertPassword':
			if (newPassword.value === password.value) {
				try {
					const resetPasswordStatus = await userStore.updateUserPassword(
						oldPassword.value,
						newPassword.value
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
			} else {
				notifyFailed(t('wrong_password_please_try_again'));
			}
	}
};

const onCancelClick = () => {
	hide();
};
</script>

<style lang="scss" scoped>
.root {
	border-radius: 10px;
	padding: 20px;

	.title {
		text-align: center;
		margin: 10px auto 20px;
	}

	.password {
		width: 100%;
		margin-top: 10px;
		border: 1px solid $grey-2;
		border-radius: 10px;
		padding: 0 10px;
	}

	.button {
		width: 100%;
		margin-top: 20px;

		.confirm {
			width: 150px;
			height: 48px;
			border-radius: 10px;
			border: 0;

			&:before {
				box-shadow: none;
			}
		}

		.cancel {
			width: 150px;
			height: 48px;
			border-radius: 10px;
			box-shadow: none;

			&:before {
				box-shadow: none;
			}
		}
	}
}
</style>
