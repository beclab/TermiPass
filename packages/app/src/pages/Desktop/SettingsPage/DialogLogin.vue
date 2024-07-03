<template>
	<q-dialog
		class="d-creatVault text-center"
		v-model="show"
		persistent
		ref="dialogRef"
	>
		<q-card class="q-dialog-plugin">
			<q-bar class="bg-grey-11">
				<div class="text-subtitle2">
					{{ t('check_password') }}
				</div>
				<q-space />
				<q-btn dense flat icon="close" @click="onDialogCancel" v-close-popup>
					<q-tooltip>{{ t('buttons.close') }}</q-tooltip>
				</q-btn>
			</q-bar>

			<q-card-section>
				<div class="text-center text-body2">
					{{ t('terminus_unlock_desc') }}
				</div>
				<div class="q-pt-sm q-mb-xs text-left text-grey-7 text-caption">
					{{ t('password') }}
				</div>
				<q-input
					outlined
					dense
					fill
					v-model="password"
					:type="isPwd ? 'password' : 'text'"
				>
					<template v-slot:append>
						<q-icon
							:name="isPwd ? 'sym_r_visibility_off' : 'sym_r_visibility'"
							@click="isPwd = !isPwd"
							class="cursor-pointer"
						/>
					</template>
				</q-input>
				<div class="login" @click="login">{{ t('unlock.title') }}</div>
			</q-card-section>
		</q-card>
	</q-dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { useUserStore } from '../../../stores/user';
import { notifyFailed } from '../../../utils/notifyRedefinedUtil';
import { useI18n } from 'vue-i18n';
const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const show = ref(true);
const password = ref();
const userStore = useUserStore();
const isPwd = ref(false);
const { t } = useI18n();

const login = () => {
	if (!password.value) {
		notifyFailed(t('password_empty'));
		return;
	}
	loginByPassword(password.value);
};

const loginByPassword = async (password: string) => {
	if (password === userStore.password) {
		onDialogOK();
	} else {
		notifyFailed(t('password_error'));
	}
};
</script>

<style lang="scss" scoped>
.d-creatVault {
	.q-dialog-plugin {
		width: 400px;
		border-radius: 12px;

		.login {
			margin-top: 30px;
			line-height: 40px;
			border-radius: 8px;
			background: $yellow;
		}
	}
}
</style>
