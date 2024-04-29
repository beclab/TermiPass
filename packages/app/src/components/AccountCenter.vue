<template>
	<q-dialog
		class="d-creatVault text-center"
		v-model="show"
		persistent
		ref="dialogRef"
	>
		<q-card class="q-dialog-plugin">
			<q-bar style="background-color: #f8f8f8">
				<div class="text-subtitle2">Account Center</div>
				<q-space />
				<q-btn dense flat icon="close" @click="onDialogCancel" v-close-popup>
					<q-tooltip>Close</q-tooltip>
				</q-btn>
			</q-bar>

			<q-card-section class="q-pt-lg">
				<q-list class="list">
					<q-item
						v-for="user in users"
						:key="user.id"
						class="q-my-sm list-item"
						clickable
						v-ripple
						bordered
					>
						<q-item-section avatar>
							<q-avatar color="primary" text-color="white">
								<TerminusAvatar
									:did="user.local_name"
									:account="user.local_name"
									:size="40"
								/>
							</q-avatar>
						</q-item-section>

						<q-item-section class="userinfo">
							<q-item-label
								class="text-left text-body1 full-width text-weight-bold"
								>{{ user.name }}</q-item-label
							>
							<q-item-label class="text-left text-grey-8 full-width did">
								{{ user.id }}</q-item-label
							>
						</q-item-section>
					</q-item>

					<q-item
						v-for="user in users"
						:key="user.id"
						class="q-my-sm list-item"
						clickable
						bordered
						@click="handleCopy"
					>
						<q-item-section class="userinfo">
							{{ current_user.mnemonic }}
						</q-item-section>
					</q-item>
				</q-list>
			</q-card-section>
		</q-card>
	</q-dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { Clipboard } from '@capacitor/clipboard';
import { useUserStore } from '../stores/user';
import { notifySuccess } from '../utils/notifyRedefinedUtil';

const show = ref(true);
const userStore = useUserStore();
const current_user = ref(userStore.current_user);
const users = ref(userStore.users?.items);

const handleCopy = () => {
	if (!current_user.value) {
		return;
	}
	const copyTxt = current_user.value.mnemonic;
	console.log('copyTxt', copyTxt);
	Clipboard.write({
		string: copyTxt
	});
	// $q.notify('Copied successful!');
	notifySuccess('Copied successful!');
};
</script>

<style lang="scss" scoped>
.d-creatVault {
	.q-dialog-plugin {
		width: 400px;
		border-radius: 12px;

		.list {
			.list-item {
				border: 1px solid #e0e0e0;
				border-radius: 8px;
				.userinfo {
					display: flex;
					align-items: center;
					justify-content: center;
					flex-direction: column;
					.did {
						word-wrap: break-word;
						white-space: normal;
					}
				}
			}
		}
	}
}
</style>
