<template>
	<q-dialog
		ref="dialogRef"
		position="bottom"
		transition-show="jump-up"
		transition-hide="jump-down"
		transition-duration="500"
	>
		<terminus-dialog-display-content
			:title="t('account')"
			:dialog-ref="dialogRef"
		>
			<template v-slot:content>
				<q-item
					v-if="
						termipassStore.totalStatus?.status == TermiPassStatus.Reactivation
					"
					clickable
					v-close-popup
					class="account-operation-item q-pb-lg"
					@click="reactivationAction"
				>
					<div class="account-operation-div row justify-start items-center">
						<q-icon name="sym_r_devices" size="20px" />
						<div class="account-operation-text text-body3">
							{{ t('reactivation') }}
						</div>
					</div>
				</q-item>

				<q-item
					clickable
					v-close-popup
					class="account-operation-item q-pb-lg"
					@click="deleteAction"
				>
					<div class="account-operation-div row justify-start items-center">
						<q-icon name="sym_r_delete" size="20px" />
						<div class="account-operation-text text-body3">
							{{ t('delete') }}
						</div>
					</div>
				</q-item>
				<div style="width: 100%; height: 20px"></div>
			</template>
		</terminus-dialog-display-content>
	</q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent, useQuasar } from 'quasar';

import TerminusDialogDisplayContent from '../../../components/common/TerminusDialogDisplayContent.vue';
import { useUserStore } from '../../../stores/user';
import { TermiPassStatus } from '../../../utils/termipassState';
import { app, clearSenderUrl, setSenderUrl } from '../../../globals';
import { useSocketStore } from '../../../stores/websocketStore';
import { useRouter } from 'vue-router';
import { useBexStore } from '../../../stores/bex';
import TerminusTipDialog from '../../../components/dialog/TerminusTipDialog.vue';
import { useI18n } from 'vue-i18n';
import { TerminusCommonPlatform } from '../../../platform/terminusCommon/terminalCommonPlatform';
import { getPlatform } from '../../../../../sdk/src/core';
import { useTermipassStore } from '../../../stores/termipass';

const { dialogRef, onDialogOK } = useDialogPluginComponent();

const userStore = useUserStore();

const termipassStore = useTermipassStore();

const $router = useRouter();

const $q = useQuasar();

const bexStore = useBexStore();

const { t } = useI18n();

const reactivationAction = () => {
	onDialogOK();
	const platform = getPlatform() as TerminusCommonPlatform;
	platform.userStatusUpdateAction();
};

const deleteAction = () => {
	showDeleteAccountDialog();
};

const deleteAccount = async () => {
	if (await userStore.unlockFirst()) {
		return;
	}
	userStore.userUpdating = true;

	if ($q.platform.is.electron) {
		window.electron.api.files.removeCurrentAccount({
			url: userStore.getModuleSever('seafile'),
			username: app.account?.name + '@seafile.com'
		});
	}

	await userStore.removeUser(userStore.current_id!);
	await app.lock();
	const websocketStore = useSocketStore();
	websocketStore.dispose();
	if (userStore.users?.items.size == 0) {
		$router.replace({
			name: 'setupSuccess'
		});
		if (process.env.IS_BEX) {
			await bexStore.controller.changeAccount('');
		}
	} else {
		await userStore.users!.unlock(userStore.password!);
		const user = userStore.current_user;
		if (user) {
			if (user.setup_finished) {
				setSenderUrl({
					url: user.vault_url
				});
			} else {
				clearSenderUrl();
			}
			await app.load(user.id);
			if (userStore.current_mnemonic?.mnemonic) {
				await app.unlock(userStore.current_mnemonic.mnemonic);
			}
		}
		websocketStore.restart();
		if (process.env.IS_BEX && userStore.current_id) {
			await bexStore.controller.changeAccount(userStore.current_id);
		}
		// $router.push('/home');
		if (userStore.current_user) {
			if (userStore.current_user.name) {
				$router.replace('/connectLoading');
			} else {
				$router.replace('/bind_vc');
			}
		}
	}
	userStore.userUpdating = false;
};

const showDeleteAccountDialog = async () => {
	const message = userStore.current_user?.name
		? userStore.current_user.name
		: '';
	await new Promise((resolve) =>
		$q
			.dialog({
				component: TerminusTipDialog,
				componentProps: {
					title: t('delete_account'),
					message,
					navigation: t('cancel'),
					position: t('delete')
				}
			})
			.onOk(async () => {
				deleteAccount();
			})
			.onDismiss(() => {
				resolve(false);
			})
	);
};
</script>

<style lang="scss" scoped>
.account-operation-item {
	height: 48px;
	min-height: 48px;
	margin: 0;
	padding-left: 0;
	padding-right: 0;

	.account-operation-div {
		width: 100%;
		height: 100%;
		padding: 8px;

		.account-operation-text {
			color: $sub-title;
			margin-left: 8px;
		}
	}
}
</style>
