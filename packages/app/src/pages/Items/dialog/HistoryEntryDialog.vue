<template>
	<q-dialog
		class="d-creatVault text-center"
		ref="dialogRef"
		persistent
		v-model="dialogModel"
		@hide="onDialogHide"
	>
		<q-card class="q-dialog-plugin-web">
			<q-bar class="bg-grey-11">
				<div class="text-subtitle2">{{ t('history') }}</div>
				<q-space />
				<q-btn dense flat icon="close" @click="onDialogCancel" v-close-popup>
					<q-tooltip>{{ t('buttons.close') }}</q-tooltip>
				</q-btn>
			</q-bar>

			<q-card-section class="q-pt-xs">
				<div class="row items-center justify-start q-mb-lg">
					<BtIcon
						src="historyIcon"
						:width="30"
						:height="30"
						class="historyIcon"
					/>
					<div class="column items-start justify-start">
						<div class="text-blue text-body1 name">
							{{ itemState.name }}
						</div>
						<div class="text-color-title text-body1 date">
							{{ formatDateTime(updated) }}
						</div>
						<div class="text-ink-2 text-body1 updated">
							<span class="semibold">
								{{ formatDateFromNow(updated) }}
							</span>
						</div>
					</div>
				</div>
				<q-scroller class="stretch">
					<div class="layout">
						<div class="horizontal row items-center justify-start">
							<div class="row items-center justify-start">
								<BtIcon src="name" :width="14" :height="14" />
								<span class="text-ink-2 q-ml-xs">{{ t('name') }}</span>
							</div>
							<div class="q-mx-md text-color-title">
								<span v-if="name !== item.name">
									<s>{{ item.name }}</s> {{ name }}
								</span>
								<span v-else>
									{{ name }}
								</span>
							</div>
						</div>

						<div class="horizontal row items-center justify-start">
							<div class="row items-center justify-center">
								<BtIcon src="tags" :width="14" :height="14" />
								<span class="text-ink-2 q-ml-xs">{{ t('tags') }}</span>
							</div>
							<div class="q-mx-md text-color-title">
								<template v-for="(tag, index) in unchanged" :key="index">
									<span class="tagSpan"
										><i class="row items-center justify-center">
											<BtIcon src="tagChip" :width="14" :height="14" />{{ tag }}
										</i></span
									>
								</template>
								<template v-for="(tag, index) in added" :key="index">
									<span class="tagSpan"
										><s class="row items-center justify-center">
											<BtIcon src="tagChip" :width="14" :height="14" /><span>{{
												tag
											}}</span>
										</s></span
									>
								</template>
								<template v-for="(tag, index) in removed" :key="index">
									<span class="text-blue tagSpan highlighted"
										><i class="row items-center justify-center">
											<BtIcon src="tagChipActive" :width="14" :height="14" />{{
												tag
											}}
										</i></span
									>
								</template>
							</div>
						</div>

						<div class="horizontal row items-center justify-start">
							<div class="row items-center justify-center">
								<BtIcon src="fileds" :width="14" :height="14" />
								<span class="text-ink-2 q-ml-xs">{{ t('fields') }}</span>
							</div>
						</div>

						<div
							class="horizontal column items-start justify-start"
							v-for="(field, index) in itemState.fields"
							:key="index"
						>
							<div class="row items-center justify-center field-name">
								<s
									v-if="
										!historyField(index) ||
										field.name !== historyField(index).name
									"
								>
									<span
										class="row items-center justify-start text-blue fieldItem"
									>
										<q-icon :name="fieldDef(field).icon" size="18px" />
										<span class="q-ml-xs">{{ field.name }}</span>
									</span>
								</s>
								<span
									class="row items-center justify-start text-blue fieldItem"
									v-if="historyField(index)"
								>
									<q-icon :name="fieldDef(field).icon" size="18px" />
									<span class="q-ml-xs">{{ historyField(index).name }}</span>
								</span>
							</div>
							<div class="field-value">
								<s
									class="text-ink-2"
									v-if="
										!historyField(index) ||
										field.value !== historyField(index).value
									"
								>
									{{ field.value }}
								</s>
								<span v-if="historyField(index)">
									{{ historyField(index).value }}
								</span>
							</div>
						</div>
					</div>
				</q-scroller>
			</q-card-section>

			<q-card-actions class="row justify-end items-center q-mb-sm">
				<q-item
					clickable
					dense
					class="but-cancel-web text-body3 row justify-center items-center q-px-md q-mr-lg text-grey-8"
					@click="onCancel"
				>
					{{ t('cancel') }}
				</q-item>
				<q-item
					clickable
					dense
					class="but-creat-web text-body3 row justify-center items-center q-px-md q-mr-md text-grey-8"
					@click="onRestore"
				>
					{{ t('restore') }}
				</q-item>
			</q-card-actions>
		</q-card>
	</q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { formatDateFromNow, formatDateTime } from '@didvault/sdk/src/util';
import { useDialogPluginComponent } from 'quasar';
import { FIELD_DEFS } from '@didvault/sdk/src/core';
import { useI18n } from 'vue-i18n';

export default defineComponent({
	name: 'HistoryEntryDialog',
	props: {
		// ...your custom props
		item: {
			type: Object,
			required: true
		},
		vault: {
			type: Object,
			required: true
		},
		historyIndex: {
			type: Number,
			required: true
		}
	},
	components: {},

	emits: [...useDialogPluginComponent.emits],
	setup(props) {
		const { dialogRef, onDialogHide, onDialogCancel, onDialogOK } =
			useDialogPluginComponent();
		const itemState = ref(props.item.value.toRaw());
		const vaultState = ref(props.vault.value.toRaw());

		const dialogModel = ref(true);
		const historyEntry = ref(itemState.value.history[props.historyIndex]);

		const { updated, updatedBy, name } = historyEntry.value;

		const added = itemState.value.tags.filter(
			(tag: any) => !historyEntry.value.tags.includes(tag)
		);
		const removed = historyEntry.value.tags.filter(
			(tag: any) => !itemState.value.tags.includes(tag)
		);
		const unchanged = historyEntry.value.tags.filter((tag: any) =>
			itemState.value.tags.includes(tag)
		);

		const historyField = (index: number) => {
			return historyEntry.value.fields[index];
		};

		const fieldDef = (field: any) => {
			return FIELD_DEFS[field.type] || FIELD_DEFS.text;
		};

		const historyFieldDef = (index: number) => {
			(historyField(index) && FIELD_DEFS[historyField(index).type]) ||
				FIELD_DEFS.text;
		};

		const onRestore = () => {
			onDialogOK();
		};

		const onCancel = () => {
			onDialogCancel();
		};

		const { t } = useI18n();

		return {
			dialogModel,
			dialogRef,
			onDialogHide,
			formatDateTime,
			formatDateFromNow,
			historyEntry,
			updated,
			updatedBy,
			name,
			itemState,
			vaultState,
			added,
			removed,
			unchanged,
			historyField,
			fieldDef,
			historyFieldDef,
			onRestore,
			onCancel,
			t
		};
	}
});
</script>

<style lang="scss" scoped>
.d-creatVault {
	.q-dialog-plugin-web {
		width: 500px;
		border-radius: 12px;

		.historyIcon {
			margin: 0 10px 0 20px;
		}

		.stretch {
			.horizontal {
				border-bottom: 1px solid $separator;
				padding: 0 20px;
				line-height: 44px;

				.tagSpan {
					height: 22px;
					line-height: 22px;
					padding: 0px 4px;
					border: 1px solid $separator;
					border-radius: 4px;
					display: inline-block;
					margin-right: 10px;
					margin-top: 4px;

					i {
						height: 100%;
					}
				}

				.highlighted {
					border: 1px solid $blue;
				}

				.fieldItem {
					line-height: 24px;
				}

				.field-name {
					height: 32px;
				}

				.field-value {
					height: 32px;
					line-height: 22px;
					padding-left: 18px;

					s {
						margin-right: 10px;
					}
				}
			}
		}

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
