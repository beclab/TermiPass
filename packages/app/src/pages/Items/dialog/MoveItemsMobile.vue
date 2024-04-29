<template>
	<q-dialog
		class="d-creatVault text-center"
		v-model="show"
		persistent
		ref="dialogRef"
	>
		<q-card class="q-dialog-plugin">
			<q-card-section>
				<div class="title text-body1">{{ t('vault_t.move_item') }}</div>
				<div class="q-mt-sm text-body text-grey-7">
					{{
						t('vault_t.move_leng_items_selected_to', {
							length: items.length
						})
					}}
				</div>
			</q-card-section>

			<q-card-section class="q-pt-md">
				<div class="text-caption text-left q-mb-xs text-grey-7">
					{{ t('vault') }}
				</div>
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

			<q-card-actions class="row items-center justify-around q-mb-sm">
				<q-item
					clickable
					v-ripple
					class="text-body1 but-cancel2"
					@click="onDialogCancel"
				>
					{{ t('cancel') }}
				</q-item>
				<q-item
					clickable
					v-ripple
					class="bg-yellow text-body1 but-creat"
					@click="onOKClick"
				>
					{{ t('vault_t.move_item') }}
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

const onOKClick = async () => {
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

		.item-web {
			border-radius: 10px;
			border: 1px solid $grey-2;
		}

		.title {
			text-align: center;
		}

		.but-creat {
			width: 42%;
			border-radius: 8px;
			height: 48px;
			line-height: 48px;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.but-cancel2 {
			width: 42%;
			height: 48px;
			border-radius: 8px;
			line-height: 48px;
			border: 1px solid $grey-2;
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}
}
</style>
