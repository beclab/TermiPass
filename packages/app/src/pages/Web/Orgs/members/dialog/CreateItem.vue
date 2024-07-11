<template>
	<q-dialog
		class="d-creatVault text-center"
		ref="dialogRef"
		@hide="onDialogHide"
	>
		<q-card class="q-dialog-plugin-web">
			<q-card-section class="q-pt-xs">
				<div class="text-h5 q-my-lg">
					{{ t('invite_new_members') }}
				</div>
				<div class="text-subtitle1 text-grey text-center">
					{{ t('invite_new_members_message') }}
				</div>
			</q-card-section>

			<q-card-section class="row">
				<div class="email-wrap">
					<input
						type="text"
						placeholder="Enter DID"
						v-model="email"
						maxlength="50"
					/>
					<span>{{ email.length }}/50</span>
				</div>
			</q-card-section>

			<q-card-actions class="row q-col-gutter-md q-mb-lg">
				<div class="col-6">
					<q-item
						clickable
						v-ripple
						class="bg-blue text-body1 q-mx-xs q-px-md items-center justify-center but-creat-web"
						@click="onOKClick"
					>
						{{ t('create') }}
					</q-item>
				</div>
				<div class="col-6">
					<q-item
						clickable
						v-ripple
						class="bg-grey-11 text-body1 text-ink-2 q-mx-xs q-px-md items-center justify-center but-cancel-web"
						@click="onDialogCancel"
					>
						{{ t('cancel') }}
					</q-item>
				</div>
			</q-card-actions>
		</q-card>
	</q-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { notifyWarning } from '../../../../../utils/notifyRedefinedUtil';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const email = ref('');

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
	useDialogPluginComponent();

async function onOKClick() {
	if (!email.value.length) {
		notifyWarning(t('please_enter_at_least_one_did'));
		return;
	}
	onDialogOK(email.value);
}
</script>

<style lang="scss" scoped>
.d-creatVault {
	.q-dialog-plugin-web {
		width: 500px;
		border-radius: 20px;

		.email-wrap {
			width: 90%;
			height: 40px;
			margin: 0 auto;
			border-radius: 6px;
			border: 1px solid $separator;
			display: flex;
			align-items: center;
			justify-content: space-between;
			overflow: hidden;

			&:hover {
				border: 1px solid $blue;
			}

			input {
				width: 84%;
				height: 40px;
				outline: none;
				border: none;
				text-indent: 10px;
			}
			span {
				display: inline-block;
				width: 16%;
				text-align: center;
			}
		}

		.but-creat-web {
			border-radius: 10px;
		}
		.but-cancel-web {
			border-radius: 10px;
		}
	}
}
</style>
