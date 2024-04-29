<template>
	<div v-if="invite" class="inviteItemView">
		<div class="row justify-around">
			<div class="stretch large padded">{{ t('invite') }}</div>
			<div class="small tag ${status.class}">
				<div icon="${status.icon}" class="inline"></div>
			</div>
		</div>

		<div class="stretch">
			<div class="double-margined padded box">
				<div class="margined text-centering">
					{{
						invite?.purpose === 'confirm_membership'
							? t('a_membership_confirmation_request_was_send_to')
							: t('an_invite_was_send_to')
					}}
				</div>

				<div class="bold large text-centering">{{ invite?.did }}</div>

				<div class="double-margined text-centering">
					{{
						t(
							'following_confirmation_code_shuould_communicate_to_them_separately'
						)
					}}
				</div>

				<div>
					{{ secret }}
				</div>

				<div
					class="horziontal margined evenly stretching spacing horizontal layout"
				>
					<div v-if="invite?.accepted">
						<pl-button
							?disabled="${expired}"
							id="confirmButton"
							class="tap primary"
							@click="onConfirm()"
						>
							<pl-icon icon="invite" class="right-margined" />
							<div>
								{{
									invite?.purpose === 'confirm_membership'
										? t('confirm')
										: t('add_member')
								}}
							</div>
						</pl-button>
					</div>
					<div v-else>
						<pl-button id="resendButton" class="tap" @click="onResend()">
							<pl-icon icon="mail" class="right-margined" />

							<div>{{ t('resend') }}</div>
						</pl-button>
					</div>

					<div id="deleteButton" class="tap negative" @click="onDelete()">
						<pl-icon icon="delete" class="right-margined" />
						<div>{{ t('delete') }}</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div
		class="inviteItemView text-color-sub-title row items-center justify-center"
		v-else
	>
		<BtIcon class="q-mb-lg" src="itemSelect" :width="215" :height="148" />
		{{ t('no_invite_selected') }}
	</div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted, watch } from 'vue';
import { UnlockedOrg, UnlockedAccount } from '@didvault/sdk/src/core';
import { formatDateFromNow, formatDateTime } from '@didvault/sdk/src/util';
import { app } from '../../../../globals';
import { Dialog } from 'quasar';
import { useMenuStore } from '../../../../stores/menu';
import {
	notifyFailed,
	notifySuccess
} from '../../../../utils/notifyRedefinedUtil';
import { useI18n } from 'vue-i18n';

export default defineComponent({
	name: 'OrgInvitesView',
	props: {},
	components: {},
	setup() {
		const meunStore = useMenuStore();
		const now = new Date();
		const nameRef = ref();

		const org = computed(function () {
			return app.orgs.find((org) => org.id == meunStore.org_id);
		});

		const invite = computed(function () {
			if (org.value && meunStore.org_mode_id) {
				return org.value.getInvite(meunStore.org_mode_id);
			} else {
				return null;
			}
		});

		let secret = ref<string>('');
		async function updateSecert() {
			if (!invite.value || !org.value || !app.account || app.account.locked) {
				return '';
			}
			await org.value.unlock(app.account as UnlockedAccount);
			await invite.value.unlock((org.value as UnlockedOrg).invitesKey);
			secret.value = invite.value.secret!;
		}

		watch(
			() => meunStore.org_mode_id,
			async (newVaule: any, oldVaule: any) => {
				if (oldVaule == newVaule) {
					return;
				}
				await updateSecert();
			}
		);

		onMounted(async () => {
			await updateSecert();
		});

		async function onResend() {
			try {
				const newInvite = (
					await app.createInvites(
						org.value!,
						[invite.value!.did],
						invite.value!.purpose
					)
				)[0];
				meunStore.org_mode_id = newInvite.id;
			} catch (e) {
				notifyFailed(e.message);
			}
		}

		async function onConfirm() {
			try {
				const member = await app.confirmInvite(invite.value!);
				notifySuccess(
					t('membe_was_successfully_added_to_your_organization', {
						member: member.did
					})
				);
			} catch (e) {
				notifyFailed(e.message);
			}
		}

		async function onDelete() {
			const confirmed = await new Promise((resolve) =>
				Dialog.create({
					title: t('delete_invite'),
					message: t('are_you_sure_you_want_to_delete_this_invite'),
					cancel: true,
					persistent: true
				})
					.onOk(() => {
						resolve(true);
					})
					.onCancel(() => {
						resolve(false);
					})
			);
			if (confirmed) {
				try {
					await app.deleteInvite(invite.value!);
					notifySuccess(t('delete_invite_success'));
					meunStore.org_mode_id = '';
				} catch (e) {
					notifyFailed(e.message);
				}
			}
		}

		const { t } = useI18n();

		return {
			formatDateFromNow,
			formatDateTime,
			org,
			invite,
			onDelete,
			onResend,
			onConfirm,
			now,
			secret,
			nameRef,
			t
		};
	}
});
</script>

<style lang="scss" scoped>
.inviteItemView {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
}

.q-field__control {
	height: 34px !important;
}

.text-li-title {
	margin-left: 5px;
}
</style>
