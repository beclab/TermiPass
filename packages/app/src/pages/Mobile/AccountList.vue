<template>
	<div class="account-list-root">
		<terminus-title-bar
			v-if="!approvalUserIdRef"
			:title="t('switch_accounts')"
		/>
		<terminus-scroll-area class="account-list-scroll">
			<template v-slot:content>
				<terminus-account-item
					v-for="(user, index) in userStore.users?.items"
					:key="'ii' + index"
					:user="user"
					@click="choose(user.id)"
					style="margin-top: 12px"
				>
					<template
						v-slot:side
						v-if="
							user.id === userStore.current_id || user.id === approvalUserIdRef
						"
					>
						<div
							v-if="
								user.id === userStore.current_id &&
								user.id !== approvalUserIdRef
							"
							class="current-user text-body3"
						>
							{{ t('logged_in') }}
						</div>
						<div
							v-if="user.id === approvalUserIdRef"
							class="request-user text-body3"
						>
							{{ t('request_user') }}
						</div>
					</template>
				</terminus-account-item>

				<terminus-item
					img-bg-classes="bg-grey-1"
					style="margin-top: 12px"
					icon-name="sym_r_person_add"
					:img-b-g-size="40"
					:border-radius="12"
					@click="addAccount"
					v-if="!approvalUserIdRef"
					title-classes="add-new-terminus-name"
				>
					<template v-slot:title>
						{{ t('add_new_terminus_name') }}
					</template>
				</terminus-item>
			</template>
		</terminus-scroll-area>
	</div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/user';
import { UserItem } from '@didvault/sdk/src/core';
import { app, clearSenderUrl, resetAPP, setSenderUrl } from '../../globals';
import TerminusItem from '../../components/common/TerminusItem.vue';
import { ref } from 'vue';
import { getDID } from '../../did/did-key';
import { getUiType } from '../../utils/utils';
import { useBexStore } from '../../stores/bex';
import { useApproval } from './wallet/approval';
import { sendUnlock } from '../../utils/bexFront';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useSocketStore } from '../../stores/websocketStore';
import TerminusTitleBar from '../../components/common/TerminusTitleBar.vue';
import TerminusAccountItem from '../../components/common/TerminusAccountItem.vue';
import TerminusScrollArea from '../../components/common/TerminusScrollArea.vue';
import { getNativeAppPlatform } from '../../platform/capacitor/capacitorPlatform';

const $router = useRouter();
const userStore = useUserStore();
const bexStore = useBexStore();
const approvalUserIdRef = ref('');
const $q = useQuasar();
const { t } = useI18n();

if (process.env.IS_BEX) {
	bexStore.controller.getApproval().then((approval) => {
		if (approval) {
			approvalUserIdRef.value = approval.data.params.requestDidKey as string;
		}
	});
}

const choose = async (id: string) => {
	if (id == userStore.current_id!) {
		if ($q.platform.is.nativeMobile) {
			getNativeAppPlatform().hookBackAction();
			return;
		}
		$router.back();
		return;
	}
	let user: UserItem = userStore.users!.items.get(id)!;
	userStore.userUpdating = true;
	await app.lock(false);
	await userStore.setCurrentID(user.id);
	let mnemonicItem = userStore.current_mnemonic;

	if (user.setup_finished) {
		setSenderUrl({
			url: user.vault_url
		});
	} else {
		clearSenderUrl();
	}

	resetAPP();

	await app.load(user.id);

	if (mnemonicItem) {
		await app.unlock(mnemonicItem.mnemonic);
	}

	const UIType = getUiType();
	if (UIType.isNotification) {
		const { resolveApproval } = useApproval($router);
		sendUnlock();
		if (mnemonicItem) {
			const selectedDidKey = await getDID(mnemonicItem.mnemonic);
			resolveApproval({ selectedDidKey });
		}
		return;
	}

	if (process.env.IS_BEX && userStore.current_id) {
		await bexStore.controller.changeAccount(userStore.current_id);
	}

	const websocketStore = useSocketStore();
	websocketStore.dispose();

	if (userStore.current_user) {
		if (userStore.current_user.name) {
			$router.replace('/connectLoading');
		} else {
			$router.replace('/bind_vc');
		}
	}
	userStore.userUpdating = false;
};

const addAccount = () => {
	$router.push({
		name: 'setupSuccess'
	});
};
</script>

<style lang="scss" scoped>
.account-list-root {
	width: 100%;
	height: 100%;

	.account-list-scroll {
		height: calc(100% - 56px);
		width: 100%;
		padding-left: 20px;
		padding-right: 20px;
	}

	.current-user {
		padding: 4px 8px;
		border-radius: 4px;
		text-align: center;
		border: 1px solid $blue-4;
		color: $blue-4;
	}

	.request-user {
		@extend .current-user;
		border: 1px solid $green;
		color: $green;
	}
}
</style>
