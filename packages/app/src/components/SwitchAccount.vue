<template>
	<q-dialog
		class="d-creatVault text-center"
		v-model="show"
		persistent
		ref="dialogRef"
	>
		<q-card class="q-dialog-plugin">
			<q-bar class="bg-grey-1">
				<div class="text-subtitle2">
					{{ t('switch_accounts') }}
				</div>
				<q-space />
				<q-btn dense flat icon="close" @click="onDialogCancel" v-close-popup>
					<q-tooltip>{{ t('buttons.close') }}</q-tooltip>
				</q-btn>
			</q-bar>

			<q-card-section>
				<terminus-account-item
					v-for="(user, index) in userStore.users?.items"
					:key="'ii' + index"
					:user="user"
					@click="choose(user.id)"
					style="margin-top: 12px"
				>
					<template v-slot:side v-if="user.id === userStore.current_id">
						<div
							class="current-user text-body3"
							v-if="user.id === current_user?.id"
						>
							{{ t('logged_in') }}
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
					title-classes="add-new-terminus-name"
				>
					<template v-slot:title>
						{{ t('add_new_terminus_name') }}
					</template>
				</terminus-item>
			</q-card-section>
		</q-card>
	</q-dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDialogPluginComponent } from 'quasar';
import { app, clearSenderUrl, resetAPP, setSenderUrl } from './../globals';
import { getUiType } from './../utils/utils';
import { useApproval } from '../pages/Mobile/wallet/approval';
import { sendUnlock } from '../utils/bexFront';
import { getDID } from '../did/did-key';
import { useUserStore } from '../stores/user';
import { useI18n } from 'vue-i18n';
import TerminusAccountItem from './common/TerminusAccountItem.vue';
import TerminusItem from './common/TerminusItem.vue';

const { dialogRef, onDialogCancel } = useDialogPluginComponent();

const show = ref(true);

const router = useRouter();
const userStore = useUserStore();
const current_user = ref(userStore.current_user);
const { t } = useI18n();

const choose = async (id: string) => {
	if (id == current_user.value?.id) {
		onDialogCancel();
		return;
	}

	let user = userStore.users!.items.get(id)!;

	await app.lock(false);
	await userStore.setCurrentID(user.id);
	await userStore.users!.unlock(userStore.password!);

	userStore.userUpdating = true;

	if (user.setup_finished) {
		setSenderUrl({
			url: user.vault_url
		});
	} else {
		clearSenderUrl();
	}
	resetAPP();

	if (userStore.current_mnemonic?.mnemonic) {
		await app.load(user.id);
		await app.unlock(userStore.current_mnemonic?.mnemonic);
	}

	userStore.userUpdating = false;

	const UIType = getUiType();
	if (UIType.isNotification && userStore.current_mnemonic?.mnemonic) {
		const { resolveApproval } = useApproval(router);
		sendUnlock();
		const selectedDidKey = await getDID(userStore.current_mnemonic?.mnemonic);
		resolveApproval({ selectedDidKey });
		return;
	}

	router.replace('/connectLoading');

	onDialogCancel();
};

const addAccount = () => {
	router.push({
		path: '/import_mnemonic'
	});
	onDialogCancel();
};
</script>

<style lang="scss" scoped>
.d-creatVault {
	.q-dialog-plugin {
		width: 400px;
		border-radius: 12px;

		.current-user {
			padding: 4px 8px;
			border-radius: 4px;
			text-align: center;
			border: 1px solid $blue-4;
			color: $blue-4;
		}
	}
}
</style>
