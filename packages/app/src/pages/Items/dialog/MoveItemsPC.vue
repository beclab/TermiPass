<template>
	<q-dialog
		class="d-creatVault text-center"
		v-model="show"
		persistent
		ref="dialogRef"
	>
		<q-card class="q-dialog-plugin">
			<q-bar class="bg-brey-11">
				<div class="text-subtitle2">
					{{ t('vault_t.move_item_to') }}
				</div>
				<q-space />
				<q-btn dense flat icon="close" @click="onDialogCancel" v-close-popup>
					<q-tooltip>{{ t('buttons.close') }}</q-tooltip>
				</q-btn>
			</q-bar>

			<q-card-section class="q-pt-md">
				<q-select
					outlined
					dense
					behavior="menu"
					v-model="model"
					:options="
						vaults.map((v) => ({
							value: v.id,
							label: v.name,
							disable: !app.isEditable(v)
						}))
					"
					@update:model-value="changeModel"
					style="width: 100%"
				/>
			</q-card-section>

			<q-card-actions class="row justify-end items-center q-mb-sm full-width">
				<q-item
					clickable
					dense
					class="but-cancel-web text-body3 row justify-center items-center q-px-md q-mr-lg text-grey-8"
					@click="onDialogCancel"
				>
					{{ t('cancel') }}
				</q-item>
				<q-item
					clickable
					dense
					class="but-creat-web text-body3 row justify-center items-center q-px-md q-mr-sm text-grey-8"
					@click="handleOk"
				>
					{{ t('create') }}
				</q-item>
			</q-card-actions>
		</q-card>
	</q-dialog>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { Vault } from '@didvault/sdk/src/core';
import '../../../css/terminus.scss';
import { app } from '../../../globals';
import { useI18n } from 'vue-i18n';

const props = defineProps({
	selected: Array,
	leftText: String,
	rightText: String
});

const { dialogRef, onDialogCancel, onDialogOK } = useDialogPluginComponent();
const model = ref();
const items = ref();
const vaults = ref<any[]>([]);
const vaultSelect = ref();
const show = ref(true);

const { t } = useI18n();

const changeModel = (value) => {
	vaultSelect.value = vaults.value.find((item) => item.id === value.value);
};

const handleOk = async () => {
	try {
		await app.moveItems(
			items.value.map((i: { item: any }) => i.item),
			vaultSelect.value!
		);
		onDialogOK();
	} catch (e) {
		console.error('catch', e);
	}
};

onMounted(() => {
	items.value = props.selected;
	const sourceVaults = items.value.reduce(
		(sv, i) => sv.add(i.vault),
		new Set<Vault>()
	);

	vaults.value =
		sourceVaults.size === 1
			? app.vaults.filter(
					(v) =>
						app.hasWritePermissions(v) &&
						v !== sourceVaults.values().next().value
			  )
			: app.vaults.filter((v) => app.hasWritePermissions(v));
});
</script>

<style scoped lang="scss">
.d-creatVault {
	.q-dialog-plugin {
		width: 400px;
		border-radius: 12px;

		.but-creat-web {
			border-radius: 8px;
			background: $yellow;
		}

		.but-cancel-web {
			border-radius: 8px;
			border: 1px solid $separator;
		}
	}
}
</style>
