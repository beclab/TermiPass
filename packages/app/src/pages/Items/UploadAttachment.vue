<template>
	<q-dialog
		class="d-creatVault text-center"
		persistent
		ref="dialogRef"
		@hide="onDialogHide"
	>
		<q-card class="q-dialog-plugin">
			<q-bar class="bg-grey-11">
				<div class="text-subtitle2">
					{{ t('vault_t.upload_attachment') }}
				</div>
				<q-space />
				<q-btn dense flat icon="close" @click="onDialogCancel" v-close-popup>
					<q-tooltip>{{ t('buttons.close') }}</q-tooltip>
				</q-btn>
			</q-bar>

			<q-card-section class="q-pt-xs">
				<div class="text-color-title row flex flex-start q-pl-sm">
					<div class="text-grey-7 q-mt-lg q-mb-sm">
						{{ t('vault_t.attachment_name') }}
					</div>
					<q-input
						outlined
						dense
						class="full-width"
						color="text-grey-4"
						v-model="name"
					/>
				</div>

				<q-card-section
					v-if="error"
					class="row flex flex-start q-pa-none q-pl-sm q-py-sm text-grey-9"
				>
					<div class="text-negative" v-if="error">
						{{ error || t('error') }}
					</div>
				</q-card-section>

				<q-card-section class="row flex flex-start q-pl-sm q-py-sm text-grey-9">
					{{
						progress
							? t('vault_t.uploading_loaded_total', {
									loaded: fileSize(progress.loaded),
									total: fileSize(progress.total)
							  })
							: (this.file.type || t('vault_t.unkown_file_type')) +
							  ' - ' +
							  fileSize(this.file.size)
					}}
				</q-card-section>
			</q-card-section>

			<q-card-actions class="row justify-end items-center q-mb-sm q-pt-none">
				<q-btn
					clickable
					unelevated
					no-caps
					class="but-cancel-web text-body3 row justify-center items-center q-mr-sm text-grey-8"
					@click="onDialogCancel"
				>
					{{ t('vault_t.discard') }}
				</q-btn>
				<q-btn
					clickable
					unelevated
					no-caps
					:loading="loading"
					class="but-creat-web text-body3 row justify-center items-center q-mr-sm text-grey-8"
					@click="onOKClick"
				>
					{{ t('vault_t.upload') }}
				</q-btn>
			</q-card-actions>
		</q-card>
	</q-dialog>
</template>

<script lang="ts">
import { ref } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { app } from '../../globals';
import { fileSize } from '@didvault/sdk/src/util';
import { ErrorCode } from '@didvault/sdk/src/core';
import { useI18n } from 'vue-i18n';
export default {
	name: 'UploadAttachment',
	props: {
		itemID: {
			type: String,
			required: true
		},
		file: {
			type: File,
			required: true
		}
	},
	emits: [...useDialogPluginComponent.emits],
	setup(props: any) {
		const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
			useDialogPluginComponent();
		const loading = ref(false);
		const error = ref('');
		const name = ref(props.file.name);
		let progress: any = ref(null);
		async function onOKClick() {
			if (loading.value) {
				return;
			}
			loading.value = true;
			progress.value = null;
			error.value = '';
			if (!name.value) {
				error.value = t('please_enter_a_name');
				return;
			}
			const att = await app.createAttachment(
				props.itemID!,
				props.file!,
				name.value
			);

			const upload = att.uploadProgress!;

			const handler = () => (progress.value = upload.progress);
			upload.addEventListener('progress', handler);
			try {
				await upload.completed;
			} catch (e) {
				console.log(e);
			}
			upload.removeEventListener('progress', handler);

			progress.value = null;
			loading.value = false;
			if (upload.error) {
				error.value =
					upload.error.code === ErrorCode.PROVISIONING_QUOTA_EXCEEDED
						? t('vault_t.storage_limit_exceeded')
						: t('vault_t.upload_failed_please_try_again');
			} else {
				loading.value = false;
				onDialogOK();
			}
		}

		const { t } = useI18n();

		return {
			dialogRef,
			onDialogHide,
			onOKClick,
			onDialogCancel,
			loading,
			progress,
			fileSize,
			error,
			name,
			t
		};
	}
};
</script>

<style lang="scss" scoped>
.d-creatVault {
	.q-dialog-plugin {
		width: 500px;
		border-radius: 12px;

		.item-web {
			border-radius: 10px;
			border: 1px solid $grey-2;
		}

		.but-creat-web {
			border-radius: 6px;
			background: $yellow;
		}

		.but-cancel-web {
			border-radius: 6px;
			border: 1px solid $grey-2;
		}
	}
}
</style>
