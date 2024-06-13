<template>
	<div v-show="!scanIng" class="itemView">
		<div class="header">
			<div
				class="row items-center justify-between q-px-md"
				style="height: 56px"
			>
				<div
					:class="[
						'row',
						'items-center',
						'justify-start',
						'view-hearder',
						'q-px-sm',
						{ isedit: editing_t1 }
					]"
					:style="{
						width: editing_t1 ? 'calc(100% - 40px)' : 'calc(100% - 120px)'
					}"
				>
					<q-icon
						v-if="isMobile && !editing_t1"
						name="sym_r_chevron_left"
						size="24px"
						@click="goBack"
					/>
					<q-icon
						v-if="!isMobile && item"
						:name="showItemIcon(item.icon)"
						size="24px"
					/>

					<div class="hearder-input q-ml-sm">
						<div v-if="editing_t1">
							<q-input
								borderless
								v-model="name"
								dense
								ref="nameRef"
								:placeholder="t('vault_t.enter_item_name')"
								input-style="margin-bottom: 2px;"
								input-class="text-body3"
							/>
						</div>
						<div v-else class="full-height column items-start justify-center">
							<template v-if="!name">
								{{ t('new_item') }}
							</template>
							<template v-else>
								<span class="text-grey-5 text-overline">
									{{ vault.label }}
								</span>
								<span class="text-grey-10 text-subtitle2">
									{{ name }}
								</span>
							</template>
						</div>
					</div>
				</div>
				<div
					class="row view-option items-center justify-end"
					:style="{ width: editing_t1 ? '40px' : '120px' }"
				>
					<div class="optionItem" v-if="!editing_t1">
						<q-btn
							class="btn-size-sm btn-no-text btn-no-border"
							:class="isFavorite ? 'text-yellow-6' : 'text-grey-8'"
							:icon="isFavorite ? 'star' : 'sym_r_star'"
							@click="setFavorite(!isFavorite)"
						>
							<q-tooltip>{{ t('favorite') }}</q-tooltip>
						</q-btn>
					</div>

					<div
						class="optionItem q-mt-xs q-mx-xs"
						@click="onEdit"
						v-if="!editing_t1"
					>
						<q-btn
							class="btn-size-sm btn-no-text btn-no-border"
							icon="sym_r_edit_note"
						>
							<q-tooltip>{{ t('buttons.edit') }}</q-tooltip>
						</q-btn>
					</div>

					<div class="optionItem" v-if="editing_t1">
						<q-btn
							class="btn-size-sm btn-no-text btn-no-border"
							icon="sym_r_add"
						>
							<q-tooltip>"{{ t('vault_t.add_field') }}"</q-tooltip>
							<q-menu class="filedMenu" v-model="showAddField">
								<q-list style="min-width: 200px">
									<template
										v-for="(filed, index) in [...Object.values(FIELD_DEFS)]"
										:key="index"
									>
										<q-item
											class="menuItem row items-center justify-center"
											clickable
											v-close-popup
											@click="addFieldClick(filed)"
										>
											<span class="bg-grey-11-hover optionIcon">
												<q-icon :name="filed.icon" size="24px" />
											</span>
											<q-item-section class="q-ml-sm">{{
												filed.name
											}}</q-item-section>
										</q-item>
									</template>
								</q-list>
							</q-menu>
						</q-btn>
					</div>

					<div class="optionItem" v-if="!editing_t1">
						<q-btn
							class="btn-size-sm btn-no-text btn-no-border"
							icon="sym_r_more_horiz"
						>
							<q-tooltip>{{ t('buttons.more') }}</q-tooltip>
							<q-menu class="popup-menu">
								<q-list dense padding>
									<q-item
										class="popup-item row items-center justify-start text-caption"
										clickable
										dense
										v-close-popup
										@click="moveItem"
										style="white-space: nowrap"
									>
										<q-icon size="16px" name="sym_r_move_up" class="q-mr-sm" />
										{{ t('vault_t.move_to_vault') }}
									</q-item>
									<q-item
										class="popup-item row items-center justify-start text-caption"
										clickable
										dense
										v-close-popup
										@click="deleteItem"
									>
										<q-icon size="16px" name="sym_r_delete" class="q-mr-sm" />
										{{ t('vault_t.delete_item') }}
									</q-item>
								</q-list>
							</q-menu>
						</q-btn>
					</div>
				</div>
			</div>
		</div>
		<div class="container2">
			<q-scroll-area
				style="height: 100%"
				:thumb-style="scrollBarStyle.thumbStyle"
			>
				<div>
					<div class="tags listRow">
						<div class="row items-center justify-start q-px-lg q-py-sm">
							<q-icon name="sym_r_more" size="24px" />
							<span class="text-color-sub-title q-ml-xs">
								{{ t('tags') }}
							</span>
						</div>
					</div>

					<div class="tags listRow">
						<q-select
							class="tagSelect q-pl-md"
							v-model="tags"
							behavior="menu"
							use-input
							use-chips
							multiple
							borderless
							stack-label
							hide-bottom-space
							hide-dropdown-icon
							:placeholder="t('vault_t.add_tags_placeholder')"
							:options="filterTagOptions"
							option-label="name"
							option-value="name"
							emit-value
							map-options
							@new-value="createTagValue"
							@filter="filterTagFn"
							@focus="focusTagFn"
						>
							<template v-slot:selected-item="scope">
								<q-chip
									:removable="
										chipShowRemoveIcon &&
										chipShowRemoveIcon.index === scope.index
											? true
											: false
									"
									square
									icon="sym_r_sell"
									@remove="scope.removeAtIndex(scope.index)"
									@mouseover="chipMouseOver(scope)"
									@mouseleave="chipMouseLeave(scope)"
									:tabindex="scope.tabindex"
									class="q-ma-none tagChip"
								>
									{{ scope.opt.name }}
								</q-chip>
							</template>

							<template v-slot:option="scope">
								<q-item
									class="row items-center justify-between"
									dense
									v-bind="scope.itemProps"
								>
									<span class="row items-center">
										<q-icon class="q-mr-sm" name="sym_r_sell" />
										<q-item-label>{{ scope.opt.name }}</q-item-label>
									</span>
									<q-item-label>{{ scope.opt.count }}</q-item-label>
								</q-item>
							</template>
						</q-select>
					</div>

					<div
						class="listRow row items-center justify-start text-color-sub-title q-py-md q-px-lg q-py-sm"
					>
						<q-icon name="sym_r_article" size="20px" />
						<span class="q-ml-xs">{{ t('fields') }}</span>
					</div>

					<div class="fileds column">
						<div
							v-for="(field, index) in item?.fields"
							:key="itemID + 'fa' + index"
						>
							<FiledComponent2
								:field="field"
								:index="index"
								:editing="editing_t1"
								:masked="false"
								@fieldUpdate="updateFiled"
								:canMoveUp="!!index"
								:canMoveDown="index < (item?.fields.length || 0) - 1"
								@remove="removeField(index)"
								@moveup="moveField(index, 'up')"
								@movedown="moveField(index, 'down')"
								@onEdit="onEdit"
								@startScan="startScan"
							/>
						</div>
					</div>

					<div
						class="listRow row items-center justify-center cursor-pointer text-color-sub-title q-py-md"
						@click="openMenu"
					>
						<q-icon name="sym_r_add" size="20px" />
						<span class="q-ml-xs">{{ t('vault_t.add_field') }}</span>
					</div>

					<div class="listRow q-pa-md row items-center">
						<q-icon name="sym_r_attach_file" size="20px" />
						<span class="text-color-sub-title text-li-title">
							{{ t('attachments') }}
						</span>
					</div>

					<div
						class="listRow attach q-pa-md row justify-start"
						v-for="(attach, index3) in attachments"
						:key="itemID + 'aa' + index3"
						@click="
							() => {
								if (!editing_t1) {
									openAttachment(attach);
								}
							}
						"
					>
						<div
							class="reduce row items-center justify-left"
							:class="editing_t1 ? 'atchEdit' : ''"
							@click.stop="onDelete(attach)"
						>
							<q-icon
								name="sym_r_do_not_disturb_on"
								size="20px"
								style="padding-left: 2px"
							/>
						</div>
						<div class="attachment row justify-start">
							<q-icon
								name="sym_r_attach_file"
								size="20px"
								class="text-blue q-mb-xs"
							/>
							<AttachmentComponent
								:itemID="item?.id!"
								:attach="attach"
								:index="index3"
								:editing="editing_t1"
								@remove="removeAttach(attach)"
							/>
						</div>
					</div>

					<div class="listRow q-pa-md">
						<div class="row items-center justify-center uploadFile">
							<BtIcon src="add" :width="14" :height="14" />
							<span class="text-color-sub-title text-li-title">
								{{ t('vault_t.click_or_drag_files_here_to_add_an_attachment') }}
							</span>
							<q-input
								class="uploadInput"
								@update:model-value="chooseAttachment"
								filled
								type="file"
							/>
						</div>
					</div>

					<div class="listRow q-pa-md row items-center text-color-sub-title">
						<q-icon name="sym_r_today" size="20px" />
						<span class="text-li-title">
							{{ t('expiration') }}
						</span>
					</div>

					<div
						class="listRow q-pa-md row items-center justify-center"
						v-if="!isEditExpir && !expiresAfter_t1"
						@click="handleEditExpir(1)"
					>
						<q-icon name="sym_r_add" size="20px" />
						<span class="text-color-sub-title text-li-title">
							{{ t('vault_t.add_expiration') }}
						</span>
					</div>

					<div
						class="listRow q-pa-md row items-center justify-center"
						v-if="!isEditExpir && expiresAfter_t1"
					>
						<span class="text-li-title">
							<span class="text-color-sub-title"
								>{{
									item?.expiresAt && item.expiresAt > now
										? t('expires') + ' '
										: t('expired') + ' '
								}}
							</span>
							<span class="text-color-title text-weight-bold"
								>{{
									item?.expiresAt ? formatDateFromNow(item.expiresAt) : ''
								}}.</span
							>
						</span>
					</div>

					<div
						class="listRow q-pa-md row items-center justify-center"
						v-if="isEditExpir"
					>
						<span>{{ t('expire') }}</span>
						<q-input
							class="q-mx-sm expireInput"
							outlined
							dense
							type="number"
							v-model.number="expiresAfter_t1"
							onkeyup="this.value=this.value.replace(/\D|^0/g,'')"
						/>
						<span>{{ t('vault_t.days_after_being_updated') }}</span>
					</div>

					<div
						class="listRow q-pa-md row items-center justify-center text-color-sub-title"
						v-if="isEditExpir"
						@click="handleEditExpir(0)"
					>
						<q-icon name="sym_r_do_not_disturb_on" size="20px" />
						<span class="text-li-title">
							{{ t('vault_t.remove_expiratio') }}
						</span>
					</div>

					<div class="listRow q-pa-md row items-center">
						<q-icon name="sym_r_history" size="20px" />
						<span class="text-color-sub-title text-li-title">
							{{ t('history') }}
						</span>
					</div>

					<div class="listRow">
						<template
							v-for="(history, index) in item?.history"
							:key="'hs' + index"
						>
							<div
								class="listRow q-pa-md row items-center justify-between history"
								@click="showHistoryEntry(index)"
								style="border-bottom: 0"
							>
								<div class="hisData">
									<q-icon class="q-mr-sm" name="sym_r_schedule" size="20px" />
									<span class="q-mr-xs">{{
										formatDateTime(history.updated)
									}}</span>
									<span class="text-color-sub-title"
										>({{ formatDateFromNow(history.updated) }})</span
									>
								</div>
								<div
									v-if="index === 0"
									class="text-grey-8 currenetVersion q-pa-xs text-caption"
								>
									{{ t('vault_t.current_version') }}
								</div>
								<q-icon
									class="visibility"
									v-else
									name="sym_r_visibility"
									size="24px"
								/>

								<span class="guide"></span>
							</div>
						</template>
					</div>
				</div>
			</q-scroll-area>
		</div>
		<div v-if="editing_t1" class="footer row iterm-center justify-around">
			<button class="reset" type="reset" @click="onCancel">
				{{ t('cancel') }}
			</button>
			<button class="bg-yellow confirm" type="submit" @click="onSave">
				{{ t('buttons.save') }}
			</button>
		</div>
	</div>
	<ScanComponent
		v-if="scanIng"
		@cancel="scanCancel"
		@scan-result="scanResult"
	/>
</template>

<script lang="ts">
import {
	defineComponent,
	computed,
	ref,
	watch,
	onMounted,
	nextTick
} from 'vue';
import { VaultItem, FIELD_DEFS, FieldDef, Field } from '@didvault/sdk/src/core';
import { formatDateFromNow, formatDateTime } from '@didvault/sdk/src/util';
import { app } from '../../globals';
import FiledComponent2 from './FiledComponent2.vue';
import { AttachmentInfo } from '@didvault/sdk/src/core';
import { auditVaults } from '../../utils/audit';
import { Dialog, useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import UploadAttachment from './UploadAttachment.vue';
import AttachmentComponent from './AttachmentComponent.vue';
import OpenAttachment from './OpenAttachment.vue';
import BtDialog from '../../components/base/BtDialog.vue';
import HistoryEntryDialog from './dialog/HistoryEntryDialog.vue';
import { useMenuStore } from '../../stores/menu';

import MoveItemsPC from './dialog/MoveItemsPC.vue';
import MoveItemsMobile from './dialog/MoveItemsMobile.vue';
import DeleteItem from './dialog/DeleteItem.vue';

import { showItemIcon } from './../../utils/utils';
import { scrollBarStyle } from '../../utils/contact';
import ScanComponent from '../../components/common/ScanComponent.vue';
import { notifyFailed } from '../../utils/notifyRedefinedUtil';
import { useI18n } from 'vue-i18n';
import { NotifyDefinedType } from '@bytetrade/ui';
import { bexVaultUpdate } from 'src/utils/bexFront';

export default defineComponent({
	name: 'ItemView',
	props: {
		itemID: {
			type: String,
			required: true
		},
		isNew: {
			type: Boolean,
			required: true
		}
	},
	components: {
		FiledComponent2,
		AttachmentComponent,
		ScanComponent
	},
	setup(props) {
		const $q = useQuasar();
		const Router = useRouter();
		const editing_t1 = ref(props.isNew);
		const showAddField = ref(false);
		const meunStore = useMenuStore();
		const now = new Date();

		const nameValue = ref();

		const item = ref<VaultItem | null>();
		const expiresAfter_t1 = ref<number>(30);
		const isFavorite = ref(false);

		const name = ref();
		const attachments: any = ref([]);
		const file = ref(null);
		const isEditExpir = ref(false);
		const nameRef = ref();
		const fieldsForm = ref();
		const field_defs_filter = ref();

		const tags: any = ref([]);
		let stringOptions: any[] = [];
		const chipShowRemoveIcon = ref();

		const { t } = useI18n();

		let filterTagOptions = ref(stringOptions);
		const isMobile = ref(
			process.env.PLATFORM == 'MOBILE' ||
				process.env.PLATFORM == 'BEX' ||
				$q.platform.is.mobile
		);

		const focusTagFn = (): void => {
			editing_t1.value = true;
		};

		function createTagValue(val: string, done: any) {
			if (val.length > 0) {
				const hasOption = stringOptions.find((item) => item.name === val);
				if (!hasOption) {
					const obj = {
						name: val,
						count: 1,
						readonly: 0
					};
					stringOptions.push(obj);
				}
				done(val, 'toggle');
			}
		}

		function filterTagFn(val: string, update: any) {
			update(() => {
				if (val === '') {
					filterTagOptions.value = stringOptions;
				} else {
					const needle = val.toLowerCase();
					filterTagOptions.value = stringOptions.filter(
						(v) => v.name.toLowerCase().indexOf(needle) > -1
					);
				}
			});
		}

		function refreshItem(itemID: string, isField?: boolean) {
			if (app.getItem(itemID)) {
				let item2 = app.getItem(itemID)!.item.clone();
				app.updateLastUsed(item2);
				item.value = item2;

				if (isField) {
					fieldsForm.value = [...item.value.fields];
				}

				isFavorite.value = app.account!.favorites.has(props.itemID);

				name.value = item.value.name;
				expiresAfter_t1.value = item.value.expiresAfter || 0;
				tags.value = [...item.value.tags];
				stringOptions = app.tags;
				filterTagOptions.value = app.tags;
				attachments.value = item.value.attachments;
			} else {
				item.value = null;
			}
		}

		watch(
			() => props.itemID,
			(newVaule, oldVaule) => {
				if (oldVaule == newVaule) {
					return;
				}
				if (!newVaule) {
					return;
				}
				editing_t1.value = false;
				refreshItem(newVaule, true);
			}
		);

		watch(
			() => props.isNew,
			(newVal) => {
				if (newVal) {
					setTimeout(() => {
						editing_t1.value = newVal;
						nameRef.value && nameRef.value.focus();
					}, 500);
				}
			}
		);

		onMounted(() => {
			field_defs_filter.value = FIELD_DEFS;
			delete field_defs_filter.value.note;
			delete field_defs_filter.value.apiSecret;

			refreshItem(props.itemID, true);
			if (props.isNew) {
				nextTick(() => {
					nameRef.value && nameRef.value.focus();
				});
			}
		});

		const vault = computed(function () {
			if (!props.itemID) {
				return null;
			}
			return app.getItem(props.itemID)?.vault;
		});

		const setFavorite = async (favorite: boolean) => {
			isFavorite.value = favorite;
			await app.toggleFavorite(props.itemID, favorite);
		};

		const isBlank = computed(function () {
			if (app.state.locked || !item.value || !vault.value) {
				return true;
			}
			return false;
		});

		function onEdit() {
			if (!editing_t1.value) {
				editing_t1.value = true;
			}

			let item2 = app.getItem(props.itemID)!.item.clone();
			isEditExpir.value = item2.expiresAfter ? true : false;
		}

		function onCancel() {
			meunStore.isEdit = false;

			isEditExpir.value = false;
			if (editing_t1.value) {
				editing_t1.value = false;
			}

			let item2 = app.getItem(props.itemID)!.item.clone();

			expiresAfter_t1.value = item2.expiresAfter || 0;

			item.value = item2;

			clearChanges();
		}

		const clearChanges = async () => {
			if (props.isNew) {
				Router.push({
					path: '/items/'
				});
				await app.deleteItems([item.value!]);
				bexVaultUpdate();
			}
		};

		async function deleteItem() {
			$q.dialog({
				component: DeleteItem,
				componentProps: {
					title: t('delete_vault'),
					content: t('delete_vault_message')
				}
			}).onOk(async () => {
				await app.deleteItems([item.value!]);
				bexVaultUpdate();
				editing_t1.value = false;
				Router.push({
					path: '/items/'
				});
			});
		}

		async function onSave() {
			if (!name.value) {
				notifyFailed(t('vault_t.item_name_is_null'));
				return;
			}

			if (
				item.value!.fields.find((cell) => cell.type === 'totp' && !cell.value)
			) {
				notifyFailed(t('vault_t.one_time_password_is_required'));
				return;
			}

			isEditExpir.value = false;
			meunStore.isEdit = false;

			await app.updateItem(item.value!, {
				name: name.value,
				fields: fieldsForm.value,
				tags: [...tags.value],
				auditResults: [],
				lastAudited: undefined,
				expiresAfter: expiresAfter_t1.value,
				attachments: attachments.value
			});

			refreshItem(props.itemID);
			bexVaultUpdate();

			auditVaults([vault.value!], {
				updateOnlyItemWithId: item.value!.id
			});

			if (editing_t1.value) {
				editing_t1.value = false;
			}
		}

		async function _addField(fieldDef: FieldDef) {
			const fileObj = new Field({
				name: fieldDef.name,
				value: '',
				type: fieldDef.type
			});
			item.value!.fields.push(fileObj);
			fieldsForm.value.push(fileObj);
		}

		const openMenu = () => {
			showAddField.value = true;
			editing_t1.value = true;
		};

		async function addFieldClick(chooseField) {
			if (!chooseField) {
				return;
			}
			_addField(chooseField);
		}

		function updateFiled(ob: any) {
			fieldsForm.value[ob.index].value = ob.value;
		}

		async function removeField(index: number) {
			$q.dialog({
				component: BtDialog,
				componentProps: {
					title: t('vault_t.remove_field'),
					message: t('vault_t.remove_field_message'),
					icon: 'removeFile'
				}
			}).onOk(() => {
				item.value!.fields = item.value!.fields.filter((_, i) => i !== index);
				fieldsForm.value = [...item.value.fields];
			});
		}

		function moveField(index: number, target: 'up' | 'down' | number) {
			const field = item.value!.fields[index];
			item.value!.fields.splice(index, 1);
			const targetIndex =
				target === 'up' ? index - 1 : target === 'down' ? index + 1 : target;

			item.value!.fields.splice(targetIndex, 0, field);

			fieldsForm.value = [...item.value.fields];
		}

		function openAttachment(attach: AttachmentInfo) {
			if (editing_t1.value) {
				return;
			}

			$q.dialog({
				component: OpenAttachment,
				componentProps: {
					itemID: props.itemID,
					info: attach
				}
			}).onOk((isModify) => {
				if (isModify) {
					refreshItem(props.itemID);
				}
			});
		}

		async function _addFileAttachment(file: File) {
			if (!file) {
				return;
			}

			if (file.size > 1024 * 1024 * 1024) {
				notifyFailed(
					t(
						'vault_t.the_selected_file_is_too_large_only_files_of_up_to_1t_are_supported'
					)
				);
				return;
			}

			$q.dialog({
				component: UploadAttachment,
				componentProps: {
					itemID: props.itemID,
					file: file
				}
			}).onOk(() => {
				$q.notify({
					type: NotifyDefinedType.SUCCESS,
					timeout: 1000,
					message: t('vault_t.upload_complete'),
					caption: t('vault_t.upload_complete_successfully')
				});

				if (app.getItem(props.itemID)) {
					let item2 = app.getItem(props.itemID)!.item.clone();
					attachments.value = item2.attachments;
				}
			});
		}

		function chooseAttachment(filelist: FileList) {
			if (filelist.length != 1) {
				return;
			}

			let f: File = filelist[0];

			_addFileAttachment(f);
		}

		async function removeAttach(att: AttachmentInfo) {
			const confirmed = await new Promise((resolve) =>
				Dialog.create({
					title: t('vault_t.delete_attachment'),
					message: t('vault_t.delete_attachment_message'),
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
				await app.deleteAttachment(props.itemID, att);
				refreshItem(props.itemID);
			}
		}

		const handleEditExpir = (type: number) => {
			if (!type) {
				isEditExpir.value = false;
				expiresAfter_t1.value = 0;
			} else {
				isEditExpir.value = true;
				editing_t1.value = true;
			}
		};

		const onDelete = (attach) => {
			meunStore.dialogShow = true;
			$q.dialog({
				component: BtDialog,
				componentProps: {
					title: t('vault_t.delete_attachment'),
					message: t('vault_t.delete_attachment_message'),
					icon: 'removeFile'
				}
			}).onOk(async () => {
				await app.deleteAttachment(props.itemID, attach);
				await refreshItem(props.itemID);
			});
		};

		const toggleDrawer = () => {
			meunStore.rightDrawerOpen = false;
		};

		const showHistoryEntry = (historyIndex: number) => {
			if (historyIndex === 0) {
				return false;
			}

			$q.dialog({
				component: HistoryEntryDialog,
				componentProps: {
					item,
					vault,
					historyIndex
				}
			}).onOk(async () => {
				restoreHistoryEntry(item.value, historyIndex);
			});
		};

		const restoreHistoryEntry = (item, historyIndex) => {
			Dialog.create({
				title: t('vault_t.restore_version'),
				message: t('vault_t.restore_version_message'),
				cancel: true,
				persistent: true
			}).onOk(async () => {
				const historyEntry = item!.history[historyIndex];
				app.updateItem(item!, {
					name: historyEntry.name,
					fields: historyEntry.fields,
					tags: historyEntry.tags,
					auditResults: [],
					lastAudited: undefined,
					attachments: attachments.value
				});

				refreshItem(props.itemID);
				auditVaults([vault.value!], {
					updateOnlyItemWithId: item.value!.id
				});
				Router.push({
					path: '/items/' + (props.itemID ? props.itemID : '')
				});
			});
		};

		const chipMouseOver = (item) => {
			chipShowRemoveIcon.value = item;
		};

		const chipMouseLeave = () => {
			chipShowRemoveIcon.value = null;
		};

		const moveItem = async () => {
			if (item.value?.attachments && item.value.attachments.length > 0) {
				$q.dialog({
					title: t('confirm'),
					message: t('vault_t.can_not_move_item_message'),
					cancel: true,
					persistent: true
				});
			} else {
				await showMoveItemsDialog();
			}
		};

		const showMoveItemsDialog = () => {
			const hasCheckBox = [{ item: item.value, vault: vault }];

			$q.dialog({
				component: isMobile.value ? MoveItemsMobile : MoveItemsPC,
				componentProps: {
					selected: hasCheckBox,
					leftText: t('cancel'),
					rightText: t('vault_t.move_item')
				}
			});
		};

		const goBack = () => {
			Router.go(-1);
		};

		const scanCancel = () => {
			scanIng.value = false;
		};

		const scanResult = (result: string) => {
			let url = new URL(result);
			let params = new URLSearchParams(url.search);
			let secret = params.get('secret');

			if (!result.startsWith('otpauth') || !secret) {
				notifyFailed(t('errors.invalid_code_please_try_again'));
				return false;
			}

			fieldsForm.value[scanIndex.value].value = secret;
			item.value.fields[scanIndex.value].value = secret;
			scanIng.value = false;
			scanIndex.value = undefined;
		};

		const startScan = (index: any) => {
			scanIndex.value = index;
			scanIng.value = true;
		};

		const scanIng = ref(false);
		const scanIndex = ref();

		return {
			formatDateFromNow,
			formatDateTime,
			item,
			vault,
			editing_t1,
			onEdit,
			isBlank,
			onSave,
			onCancel,
			deleteItem,
			FIELD_DEFS,
			showAddField,
			addFieldClick,
			updateFiled,
			removeField,
			moveField,
			isFavorite,
			setFavorite,
			filterTagOptions,
			tags,
			createTagValue,
			filterTagFn,
			focusTagFn,
			name,
			file,
			chooseAttachment,
			attachments,
			removeAttach,
			openAttachment,
			nameValue,
			isEditExpir,
			handleEditExpir,
			expiresAfter_t1,
			onDelete,
			openMenu,
			toggleDrawer,
			now,
			nameRef,
			showHistoryEntry,
			showItemIcon,
			chipMouseOver,
			chipMouseLeave,
			chipShowRemoveIcon,
			moveItem,
			isMobile,
			goBack,
			scrollBarStyle,
			scanIng,
			scanCancel,
			scanResult,
			startScan,
			t
		};
	}
});
</script>

<style lang="scss" scoped>
.itemView {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	background: $white;
	overflow: hidden;
	float: right;

	.view-hearder {
		border-radius: 10px;

		.hearder-input {
			width: calc(100% - 40px);
			display: inline-block;
			height: 40px;

			.text {
				height: 40px;
				line-height: 40px;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
			}
		}

		&:focus-within {
			border: 1px solid $blue;
		}
	}

	.isedit {
		height: 40px;
		border: 1px solid $grey-2;
	}

	.view-option {
		.optionItem {
			text-align: center;
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;

			span.optionIcon {
				display: inline-block;

				&:hover {
					border-radius: 4px;
				}
			}
		}
	}

	.container2 {
		flex: 1 1 auto;

		.tagSelect {
			width: 90%;

			.tagChip {
				background: $white;
				margin-right: 5px;
				margin-bottom: 4px;
				border: 1px solid $grey-8;
			}
		}
	}
}

.header {
	flex: 0 0 auto;
}

.footer {
	width: 100%;
	height: 56px;
	padding: 10px 20px;

	button {
		border: none;
		background: transparent;
		padding: 0;
		margin: 0;
		cursor: pointer;
		outline: none;
		width: 46%;
		height: 32px;
		border-radius: 8px;
	}

	.confirm {
		background: $yellow;
		color: $grey-10;
	}

	.reset {
		border: 1px solid $grey-2;
		background: $white;
		color: $grey-10;
	}
}

.history:not(:first-child) {
	.visibility {
		opacity: 0;
	}

	position: relative;

	.guide {
		position: absolute;
		left: 25px;
		top: -18px;
		width: 0px;
		height: 32px;
		border-left: 1px solid $grey-2;
	}

	&:hover {
		cursor: pointer;
		background-color: $grey-12;

		.visibility {
			opacity: 1;
		}
	}
}

.listRow {
	.uploadFile {
		position: relative;
		overflow: hidden;

		.uploadInput {
			position: absolute;
			width: 100%;
			height: 100%;
			top: 0;
			left: 0;
			outline: none;
			filter: alpha(opacity=0);
			-moz-opacity: 0;
			-khtml-opacity: 0;
			opacity: 0;
		}
	}

	.expireInput {
		width: 75px;
		font-size: map-get($map: $body2, $key: size);
	}

	.attachment {
		width: 80%;
		word-break: break-all;
	}

	.hisData {
		width: calc(100% - 104px);
		line-height: 100%;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.currenetVersion {
		border: 1px solid $yellow;
		border-radius: 4px;
		background: rgba(255, 235, 59, 0.1);
	}
}

.attach {
	overflow: hidden;

	.reduce {
		width: 38px;
		margin-left: -38px;
		cursor: pointer;

		&.atchEdit {
			margin-left: 0px;
		}
	}

	.attach {
		flex: 1;
	}
}

.q-field__control {
	height: 34px !important;
}

.text-li-title {
	margin-left: 5px;
}
</style>
