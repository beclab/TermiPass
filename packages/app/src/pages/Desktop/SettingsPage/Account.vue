<template>
	<div class="wrap_account">
		<q-scroll-area ref="scrollAreaRef" style="height: calc(100vh - 40px)">
			<div class="row items-center q-mt-sm q-mb-lg q-pt-sm">
				<q-icon
					class="q-ml-md q-mr-xs"
					name="sym_r_account_circle"
					size="24px"
				/>
				<q-toolbar-title class="q-pl-none text-body2 text-weight-bold">{{
					t('account')
				}}</q-toolbar-title>
				<q-avatar
					class="q-mr-lg cursor-pointer"
					icon="sym_r_close"
					@click="goBack"
				/>
			</div>

			<q-list class="settingList">
				<q-item>
					<q-item-section class="header">
						<div class="users">
							<TerminusAvatar :info="userStore.terminusInfo()" :size="40" />
						</div>

						<div class="info">
							<div class="name text-body1">{{ currentUser?.local_name }}</div>
							<div class="did">@{{ userStore.current_user?.domain_name }}</div>
						</div>

						<div
							class="delete cursor-pointer text-body3"
							@click="deleteAccount"
						>
							{{ t('delete_account') }}
						</div>
					</q-item-section>
				</q-item>

				<q-item class="q-mt-md">
					<q-item-section>
						<q-item-label
							class="text-body1 text-weight-bold q-pl-sm q-ml-xs q-mb-md"
						>
							{{ t('mnemonic_backup') }}
						</q-item-label>
						<q-item-label class="text-grey-8 q-pl-sm q-ml-xs">
							<div class="q-mb-xs text-grey-7">{{ t('mnemonics') }}</div>
							<div class="mnemonics_wrap">
								<MnemonicsComponent ref="mnemonicRef" :mnemonic="mnemonic" />
								<div class="mnemonics_login" v-if="encrypting">
									<q-icon name="visibility_off" />
									<div class="q-my-md content">
										{{ t('backup_mnemonics_reminder_info') }}
									</div>
									<div class="click" @click="openCheckLogin">
										{{ t('click_to_view') }}
									</div>
								</div>
							</div>
						</q-item-label>
					</q-item-section>
				</q-item>
			</q-list>
		</q-scroll-area>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { app, setSenderUrl, clearSenderUrl } from '../../../globals';
import { useUserStore } from '../../../stores/user';
import { useMenuStore } from '../../../stores/menu';
import { useSocketStore } from '../../../stores/websocketStore';
import MnemonicsComponent from './MnemonicsComponent.vue';
import DialogLogin from './DialogLogin.vue';
import DialogDelete from './DialogDelete.vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
	name: 'AccountPage',
	components: {
		MnemonicsComponent
	},
	setup(_props: any, context: any) {
		const $q = useQuasar();
		const userStore = useUserStore();
		const menuStore = useMenuStore();
		const encrypting = ref(true);
		const router = useRouter();

		const { t } = useI18n();

		const currentUser = userStore.users?.items.get(userStore.current_id || '');

		const mnemonic = ref(currentUser?.mnemonic || '');
		const openCheckLogin = () => {
			$q.dialog({
				component: DialogLogin
			}).onOk(() => {
				encrypting.value = false;
			});
		};

		const goBack = (to: string) => {
			if (to === '-1') {
				context.emit('setMode', '1');
			} else {
				menuStore.popTerminusMenuCache();
				router.back();
			}
		};

		const deleteAccount = () => {
			$q.dialog({
				component: DialogDelete,
				componentProps: {
					title: t('delete_account'),
					message: t('delete_account_message'),
					navigation: t('cancel')
				}
			}).onOk(() => {
				_deleteAccount();
			});
		};

		const _deleteAccount = async () => {
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
				router.push({
					name: 'welcome'
				});
			} else {
				await userStore.users!.unlock(userStore.password!);
				const user = userStore.current_user;
				if (user) {
					$q.loading.show();
					if (user.setup_finished) {
						setSenderUrl({
							url: user.auth_url
						});
					} else {
						clearSenderUrl();
					}
					await app.load(user.id);

					await app.unlock(user.mnemonic);
					$q.loading.hide();
				} else {
					console.error('user not found');
				}
				router.replace('/connectLoading');
			}
			userStore.userUpdating = false;
		};

		return {
			mnemonic,
			currentUser,
			openCheckLogin,
			encrypting,
			goBack,
			deleteAccount,
			userStore,
			t
		};
	}
});
</script>

<style scoped lang="scss">
.wrap_account {
	width: 100%;
	height: 100%;
	background: $white;
	border-radius: 12px;
}

.settingList {
	width: 500px;

	.header {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;

		.users {
			width: 40px;
			height: 40px;
			border-radius: 20px;
			overflow: hidden;
			margin-left: 10px;
		}

		.info {
			flex: 1;
			margin-left: 10px;
			margin-right: 20px;
			overflow: hidden;

			.name {
				color: $title;
			}

			.did {
				color: $sub-title;
				word-break: break-all;
			}
		}

		.delete {
			border: 1px solid $blue-4;
			color: $blue-4;
			padding: 4px 8px;
			border-radius: 6px;
		}
	}

	.mnemonics_wrap {
		position: relative;

		.mnemonics_login {
			width: 100%;
			height: 100%;
			position: absolute;
			top: 0;
			left: 0;
			fill: rgba(31, 24, 20, 0.6);
			backdrop-filter: blur(8px);
			background: rgba(0, 0, 0, 0.5);
			border-radius: 8px;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 0 20px;
			color: $white;

			.content {
				line-height: 24px;
				text-align: center;
			}

			.click {
				padding: 8px;
				border-radius: 8px;
				background: $yellow;
				color: $title;
				cursor: pointer;

				&:hover {
					background: $yellow-13;
				}
			}
		}
	}
}
</style>
