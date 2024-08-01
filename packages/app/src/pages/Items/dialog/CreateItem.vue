<template>
	<q-dialog
		class="d-creatVault text-center"
		ref="dialogRef"
		v-model="dialogModel"
		persistent
		@hide="onDialogHide"
	>
		<q-card class="q-dialog-plugin-web" v-if="isWeb">
			<q-bar class="bg-background-3">
				<span class="text-subtitle3 text-ink-1">
					{{ t('vault_t.new_vault_item') }}
				</span>
				<q-space />
				<q-btn
					dense
					flat
					color="ink-3"
					icon="close"
					@click="onDialogCancel"
					v-close-popup
				>
					<q-tooltip>{{ t('buttons.close') }}</q-tooltip>
				</q-btn>
			</q-bar>

			<q-card-section class="q-pt-xs">
				<div
					class="text-left text-body2 q-mt-md q-mb-sm text-ink-3 text-weight-medium"
				>
					{{ t('vault_t.select_vault') }}
				</div>
				<div class="row align-center justify-center">
					<q-select
						class="select-vault q-px-sm"
						borderless
						dense
						color="yellow-6"
						v-model="model.label"
						dropdown-icon="sym_r_expand_more"
						:options="
							vaults.map((v) => ({
								value: v.id,
								label: `${v.org?.name || ''}${v.org?.name ? ' / ' : ''}${
									v.name
								}`
							}))
						"
						@update:model-value="changeModel"
						style="width: 100%"
					/>
				</div>
			</q-card-section>

			<div class="text-body3 text-ink-3 text-left q-pl-md q-mb-sm">
				{{ t('vault_t.what_kind_of_item_you_would_like_to_add') }}
			</div>
			<q-card-section class="row q-col-gutter-md" style="padding-top: 0">
				<div v-for="(item, index) in templates" class="col-6" :key="index">
					<q-item
						clickable
						v-ripple
						dense
						@click="selectTemplate(item)"
						:active="isSelected(item)"
						class="item-web q-px-sm"
						active-class="border-color-yellow activeItem text-black"
						style="padding-top: 5px; padding-bottom: 5px"
					>
						<q-item-section side class="q-ml-xs q-pr-sm">
							<q-icon :name="showItemIcon(item.icon)" />
						</q-item-section>

						<q-item-section class="text-left text-body3 text-ink-2">{{
							item.toString()
						}}</q-item-section>
					</q-item>
				</div>
			</q-card-section>
			<q-card-actions class="row justify-end items-center q-mb-sm">
				<q-item
					clickable
					dense
					class="but-cancel-web text-body3 text-ink-2 row justify-center items-center q-px-md q-mr-lg text-ink-1"
					@click="onDialogCancel"
				>
					{{ t('cancel') }}
				</q-item>
				<q-item
					clickable
					dense
					class="but-creat-web text-body3 text-ink-on-brand-black row justify-center items-center q-px-md q-mr-md text-ink-1"
					@click="onOKClick"
				>
					{{ t('create') }}
				</q-item>
			</q-card-actions>
		</q-card>

		<q-card class="q-dialog-plugin" v-else>
			<q-card-section>
				<div class="text-body1 title">
					{{ t('vault_t.new_vault_item') }}
				</div>
			</q-card-section>

			<q-card-section class="q-pt-none">
				<div class="text-left text-body2 q-mb-sm text-ink-1 text-weight-medium">
					{{ t('vault_t.select_vault') }}
				</div>
				<div class="row align-center justify-center">
					<q-select
						class="select-vault"
						outlined
						dense
						behavior="menu"
						color="yellow-6"
						v-model="model.label"
						:options="
							vaults.map((v) => ({
								value: v.id,
								label: `${v.org?.name || ''}${v.org?.name ? ' / ' : ''}${
									v.name
								}`
							}))
						"
						@update:model-value="changeModel"
						style="width: 100%"
					/>
				</div>
			</q-card-section>

			<div class="text-caption text-ink-1 text-left q-pl-md q-mb-xs">
				{{ t('vault_t.what_kind_of_item_you_would_like_to_add') }}
			</div>
			<q-card-section class="row q-col-gutter-sm" style="padding-top: 0">
				<div
					v-for="(item, index) in templates"
					:key="index"
					style="width: calc(50% - 8px)"
				>
					<q-item
						clickable
						v-ripple
						@click="selectTemplate(item)"
						:active="isSelected(item)"
						class="item-web q-mx-xs q-px-xs q-py-sm"
						active-class="border-color-yellow activeItem text-black"
					>
						<q-item-section side class="q-ml-xs q-pr-sm">
							<q-icon :name="showItemIcon(item.icon)" />
						</q-item-section>

						<q-item-section class="text-left text-body3 text-ink-2">
							{{ item.toString() }}
						</q-item-section>
					</q-item>
				</div>
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
					{{ t('create') }}
				</q-item>
			</q-card-actions>
		</q-card>
	</q-dialog>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import {
	FieldType,
	ITEM_TEMPLATES,
	ItemTemplate
} from '@didvault/sdk/src/core';
import { getAppPlatform } from '../../../platform/appPlatform';
import { ExtensionPlatform } from '../../../platform/bex/front/platform';
import { app } from '../../../globals';
import { useI18n } from 'vue-i18n';

const props = defineProps({
	option: Object
});

const vaults = ref([]);
const model = ref(props.option);
const dialogModel = ref(true);

const { t } = useI18n();

const isWeb = ref(
	process.env.PLATFORM == 'WEB' || process.env.PLATFORM == 'DESKTOP'
);

let templates: ItemTemplate[] = ITEM_TEMPLATES;

templates = templates.slice(1);

templates = templates.filter(
	(item) =>
		item.toString() !== 'Crypto Wallet' && item.toString() !== 'Exchange'
);

let selectedTemplate = ref(templates[0]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
	useDialogPluginComponent();

async function selectTemplate(template: ItemTemplate) {
	selectedTemplate.value = template;
}

function isSelected(template: ItemTemplate): boolean {
	return selectedTemplate.value.toString() == template.toString();
}

async function onOKClick() {
	try {
		if (process.env.PLATFORM == 'BEX') {
			if (selectedTemplate.value.icon == 'web') {
				const url = selectedTemplate.value.fields.find((it) => {
					return it.type == FieldType.Url;
				});
				const tab = await (
					getAppPlatform() as unknown as ExtensionPlatform
				).getCurrentTab();
				if (url && tab && tab.url) {
					url.value = tab.url;
				}
			}
		}

		const hasVault = vaults.value.find((c) => c.id === model.value?.value);

		onDialogOK({
			selectedTemplate: selectedTemplate.value,
			vault: hasVault
		});
	} catch (e) {
		console.error(e);
	}
}

const changeModel = (value) => {
	model.value = value;
};

const showItemIcon = (name: string) => {
	switch (name) {
		case 'vault':
			return 'sym_r_language';
		case 'web':
			return 'sym_r_language';
		case 'computer':
			return 'sym_r_computer';
		case 'creditCard':
			return 'sym_r_credit_card';
		case 'bank':
			return 'sym_r_account_balance';
		case 'wifi':
			return 'sym_r_wifi_password';
		case 'passport':
			return 'sym_r_assignment_ind';
		case 'authenticator':
			return 'sym_r_password';
		case 'document':
			return 'sym_r_list_alt';
		case 'custom':
			return 'sym_r_chrome_reader_mode';

		default:
			break;
	}
};

function moveMineToFront(array, key, value) {
	const index = array.findIndex((obj) => obj[key] === value);
	if (index > -1) {
		const obj = array.splice(index, 1)[0];
		array.unshift(obj);
	}
	return array;
}

onMounted(async () => {
	vaults.value = await moveMineToFront(app.vaults, 'id', props.option?.value);
});
</script>

<style lang="scss" scoped>
.d-creatVault {
	.q-dialog-plugin-web {
		width: 400px;
		border-radius: 12px;

		.select-vault {
			border: 1px solid $input-stroke;
			border-radius: 8px;
		}

		.item-web {
			border-radius: 8px;
			border: 1px solid $btn-stroke;
		}

		.but-creat-web {
			border-radius: 8px;
			background: $yellow-default;
		}

		.but-cancel-web {
			border-radius: 8px;
			border: 1px solid $btn-stroke;
		}
	}

	.q-dialog-plugin {
		width: 400px;
		border-radius: 12px;

		// .select-vault {
		// 	border: 1px solid $input-stroke;
		// 	border-radius: 8px;
		// }

		.item-web {
			border-radius: 8px;
			border: 1px solid $btn-stroke;
		}

		.title {
			text-align: center;
		}
	}

	.but-creat {
		width: 40%;
		border-radius: 8px;
		height: 48px;

		line-height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.but-cancel2 {
		width: 40%;
		height: 48px;
		border-radius: 8px;

		line-height: 48px;
		border: 1px solid $separator;
		display: flex;
		align-items: center;
		justify-content: center;
	}
}
</style>
