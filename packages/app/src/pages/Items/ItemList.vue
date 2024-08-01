<template>
	<div class="column itemlist">
		<div
			class="row items-center justify-between"
			style="height: 56px; width: 100%"
		>
			<div class="searchWrap" v-if="filterShowing === 'search'">
				<q-input
					class="searchInput text-yellow-7"
					v-model="filterInput"
					debounce="500"
					borderless
					dense
					placeholder="Search"
					@update:model-value="search"
				>
					<template v-slot:prepend>
						<q-icon name="sym_r_search" />
					</template>
					<template v-slot:append>
						<q-icon
							class="cursor-pointer"
							name="sym_r_close"
							@click="closeSearch"
						>
							<q-tooltip>{{ t('buttons.close') }}</q-tooltip>
						</q-icon>
					</template>
				</q-input>
			</div>
			<template v-if="filterShowing === 'default'">
				<div
					v-if="!isMobile"
					class="row items-center q-pl-md"
					@click="toggleDrawer"
				>
					<q-icon :name="heading.icon" size="22px" />
					<div
						class="q-ml-sm"
						:class="
							$q.platform.is.mobile
								? 'mobile-title text-subtitle2 text-ink-1'
								: 'text-ink-1 text-subtitle2'
						"
					>
						{{ heading.title }}
					</div>
				</div>
				<div v-else class="row items-center" style="padding-left: 20px">
					<TerminusAccountAvatar />
					<div @click="toggleDrawer">
						<div class="text-ink-1 text-h6 user-header__title">
							{{ t('vault') }}
						</div>
						<div class="text-ink-2 text-subtitle3 row items-center">
							{{ heading.title }}
							<q-icon name="chevron_right" size="16px" />
						</div>
					</div>
				</div>
				<div class="row items-center q-py-xs text-ink-1">
					<q-btn
						v-if="!isBex"
						class="text-ink-1 btn-size-sm btn-no-text btn-no-border"
						icon="sym_r_checklist"
						text-color="ink-2"
						@click="() => (filterShowing = 'checkbox')"
					>
						<q-tooltip>{{ t('select') }}</q-tooltip>
					</q-btn>

					<q-btn
						class="text-ink-1 btn-size-sm btn-no-text btn-no-border"
						icon="sym_r_add"
						text-color="ink-2"
						@click="onCreate"
					>
						<q-tooltip>{{ t('create') }}</q-tooltip>
					</q-btn>

					<q-btn
						class="text-ink-1 btn-size-sm btn-no-text btn-no-border q-mr-md"
						icon="sym_r_search"
						text-color="ink-2"
						@click="() => (filterShowing = 'search')"
					>
						<q-tooltip>{{ t('search') }}</q-tooltip>
					</q-btn>

					<div v-if="isMobile" class="q-mr-md" />
				</div>
			</template>

			<div
				class="row justify-between"
				style="width: 100%"
				v-if="filterShowing === 'checkbox'"
			>
				<div class="row items-center q-pl-md">
					<q-btn
						class="text-ink-1 btn-size-sm btn-no-text btn-no-border"
						icon="sym_r_chevron_left"
						text-color="ink-2"
						@click="() => (filterShowing = 'default')"
					>
						<q-tooltip>{{ t('return') }}</q-tooltip>
					</q-btn>

					<q-btn
						class="text-ink-1 btn-size-sm btn-no-text btn-no-border"
						icon="sym_r_done_all"
						text-color="ink-2"
						@click="toggleCheckbox"
					>
						<q-tooltip>{{ t('toggle') }}</q-tooltip>
					</q-btn>
				</div>
				<div class="row items-center text-h7">
					{{
						t('vault_t.count_items_selected', {
							count: checkBoxArr.length
						})
					}}
				</div>
				<div class="row items-center q-my-md">
					<span class="q-mr-xs cursor-pointer checkOperate">
						<q-btn
							v-if="checkBoxArr.length > 0"
							class="text-ink-1 btn-size-sm btn-no-text btn-no-border"
							icon="sym_r_low_priority"
							text-color="ink-2"
							@click="moveItems"
						>
							<q-tooltip>{{ t('move_to') }}</q-tooltip>
						</q-btn>

						<q-btn
							v-else
							class="text-grey-6 btn-size-sm btn-no-text btn-no-border"
							icon="sym_r_low_priority"
							text-color="ink-2"
							disabled
						>
							<q-tooltip>{{ t('move_to') }}</q-tooltip>
						</q-btn>
					</span>

					<span class="q-mr-md cursor-pointer checkOperate">
						<q-btn
							v-if="checkBoxArr.length > 0"
							class="text-ink-1 btn-size-sm btn-no-text btn-no-border"
							icon="sym_r_delete"
							text-color="ink-2"
							@click="removeItem"
						>
							<q-tooltip>{{ t('delete') }}</q-tooltip>
						</q-btn>
						<q-btn
							v-else
							class="text-ink-1 btn-size-sm btn-no-text btn-no-border"
							icon="sym_r_delete"
							text-color="ink-2"
							disabled
						>
							<q-tooltip>{{ t('delete') }}</q-tooltip>
						</q-btn>
					</span>
				</div>
			</div>
		</div>

		<q-list class="" style="width: 100%; height: calc(100% - 60px)">
			<TerminusUserHeaderReminder />
			<template v-if="itemList.length > 0">
				<q-scroll-area
					style="height: 100%"
					:thumb-style="scrollBarStyle.thumbStyle"
				>
					<template v-for="(item, index) in itemList" :key="index">
						<div
							class="authenticator q-my-sm row items-center justify-between"
							v-if="item.item.type === 3 && index === 0"
						>
							<div class="col-10">
								<div class="text-body2 text-black q-mb-xs text-weight-medium">
									{{ t('terminus_authenticator') }}
								</div>
								<div class="text-body2 text-black q-mt-xs">
									{{ myF2a }}
								</div>
							</div>
							<div class="col-2 row items-center justify-center">
								<span v-if="item.item.fields[0].type === 'totp'">
									<Totp2 :secret="item.item.fields[0].value" ref="myTotps2" />
								</span>
							</div>
						</div>
						<div style="width: 100%" v-else>
							<q-card
								clickable
								v-ripple
								@click="selectItem(item as ListItem)"
								:active="isSelected(item as ListItem)"
								active-class="text-blue"
								flat
								bordered
								class="vaultCard col-6 q-mx-md"
								:class="isSelected(item as ListItem) ? 'vaultCardActive' : ''"
							>
								<q-card-section
									class="row items-center justify-between q-pa-none q-mb-xs"
								>
									<div
										class="field-name"
										:style="{
											width: `calc(100% - ${showTags(item.item).tagWidth}px)`
										}"
									>
										<q-checkbox
											v-model="checkBoxArr"
											:val="item.item.id"
											size="30px"
											v-if="filterShowing === 'checkbox'"
											color="ink-1"
										/>
										<q-icon
											v-else
											:class="item.class"
											:name="showItemIcon(item.item.icon)"
											size="24px"
											color="ink-1"
										/>
										<div class="item-name q-ml-sm">
											<div class="label text-body3 text-ink-3">
												{{ item.vault.name }}
											</div>
											<div class="name text-subtitle2 text-ink-1">
												{{ item.item.name ? item.item.name : t('new_item') }}
											</div>
										</div>
									</div>
									<div
										class="tag-wrap text-ink-2"
										:style="{
											width: `${showTags(item.item).tagWidth}px`
										}"
									>
										<div
											class="tag q-mr-sm"
											v-for="(tag, index) in showTags(item.item).tags"
											:key="index"
										>
											<q-icon :name="tag.icon" />
											<span
												class="q-ml-xs tag-name text-overline"
												v-if="tag.name"
												>{{ tag.name }}</span
											>
										</div>
									</div>
								</q-card-section>
								<q-icon
									class="west"
									name="sym_r_arrow_circle_left"
									size="24px"
									v-if="arrowItemObj[item.item.id]"
									@click.stop="moveItem($event, 'west', index)"
								/>

								<q-icon
									class="east"
									name="sym_r_arrow_circle_right"
									size="24px"
									v-if="arrowItemObj[item.item.id]"
									@click.stop="moveItem($event, 'east', index)"
								/>

								<q-scroll-area
									ref="vaultItemRef"
									:thumb-style="contentStyle as any"
									:visible="true"
									style="height: 54px; width: 100%"
									@scroll="scrollItem($event, item.item.id)"
								>
									<q-card-section horizontal>
										<div
											v-for="(filed, index2) in item.item.fields"
											class="item-unit cursor-pointer q-px-sm q-py-xs"
											:key="`f` + index2"
										>
											<div class="text-light-blue-default item-header">
												<q-icon :name="filed.icon" size="20px" />
												<span class="text-caption text-body1 q-ml-xs">
													{{ filed.name }}
												</span>
											</div>
											<div
												v-if="filed.value"
												class="text-ink-2 text-left item-unit-content q-ml-xs"
											>
												<span v-if="filed.type === 'totp'">
													<Totp :secret="filed.value" ref="myTotps" />
												</span>
												<span v-else>
													{{ filed.format(true) }}
												</span>
											</div>
											<div v-else class="text-color-title">
												[{{ t('empty') }}]
											</div>
											<div
												class="hideCopied text-body3 text-ink-1"
												v-if="filed.value"
												@click="copyItem(filed, $event)"
											>
												<q-icon
													name="sym_r_check_circle"
													size="16px"
													class="q-mr-xs"
												/>
												Copied!
											</div>
										</div>

										<div
											v-for="(filed, index2) in item.item.attachments"
											class="item-unit cursor-pointer q-px-sm q-py-xs"
											:key="`f` + index2"
										>
											<div class="text-light-blue-default item-header">
												<q-icon name="sym_r_attach_file" size="20px" />
												<span class="text-caption text-body1 q-ml-xs">
													{{ filed.name }}
												</span>
											</div>
											<div
												v-if="filed.size"
												class="text-grey-9 text-left item-unit-content"
											>
												<span v-if="filed.type === 'totp'">
													<Totp :secret="filed.value" ref="myTotps" />
												</span>
												<span v-else>
													{{ format.humanStorageSize(filed.size) }}
												</span>
											</div>
											<div v-else class="text-color-title">
												[{{ t('empty') }}]
											</div>
										</div>

										<div
											v-if="
												item.item &&
												item.item.fields.length <= 0 &&
												item.item.attachments.length <= 0
											"
										>
											<div class="text-body2">
												{{ t('vault_t.no_fields') }}
											</div>
											<div class="text-caption">
												{{ t('vault_t.this_item_has_no_fields') }}
											</div>
										</div>
									</q-card-section>
								</q-scroll-area>
							</q-card>
							<q-separator v-if="!$q.platform.is.mobile" />
						</div>
					</template>
					<div
						style="padding-bottom: 60px; width: 100%; height: 1px"
						v-if="
							termipassStore &&
							termipassStore.totalStatus &&
							termipassStore.totalStatus.isError == 2
						"
					/>
				</q-scroll-area>
			</template>

			<div
				class="column text-ink-2 items-center justify-center"
				style="height: 100%"
				v-else
			>
				<img src="../../assets/layout/nodata.svg" />
				<span class="q-mb-md text-ink-2" style="margin-top: 32px">
					{{ t('vault_t.this_vault_don_not_have_any_items_yet') }}
				</span>
				<div
					class="newVault cursor-pointer q-px-md q-py-sm row items-center justify-center text-ink-2"
					@click="onCreate"
				>
					<q-icon class="q-mr-sm" name="add" />
					<span>
						{{ t('vault_t.new_vault_item') }}
					</span>
				</div>
			</div>
		</q-list>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
import { useQuasar, format } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import CreateItem from './dialog/CreateItem.vue';
import ExchangeViewAdd from './dialog/ExchangeViewAdd.vue';
import CryptoViewAdd from './dialog/CryptoViewAdd.vue';
import MoveItemsPC from './dialog/MoveItemsPC.vue';
import MoveItemsMobile from './dialog/MoveItemsMobile.vue';

import DeleteItem from './dialog/DeleteItem.vue';
import TerminusUserHeaderReminder from '../../components/common/TerminusUserHeaderReminder.vue';
import TerminusAccountAvatar from '../../components/common/TerminusAccountAvatar.vue';

import {
	CryptoTemplate,
	getPlatform,
	VaultItem,
	VaultType,
	escapeRegex,
	ExchangeTemplate,
	debounce
} from '@didvault/sdk/src/core';
import { app } from '../../globals';
import { ListItem } from '@didvault/sdk/src/types';
import { useMenuStore } from '../../stores/menu';
import Totp from './totp.vue';
import Totp2 from './totp2.vue';
import { noItemsTextForAudit } from '../../utils/audit';
import { showItemIcon } from './../../utils/utils';
import { scrollBarStyle, VaultMenuItem } from '../../utils/contact';
import { useUserStore } from '../../stores/user';

import { busOn, busOff } from '../../utils/bus';
import { notifyFailed } from '../../utils/notifyRedefinedUtil';
import { useI18n } from 'vue-i18n';
import { useTermipassStore } from '../../stores/termipass';
import { addItem } from '../../platform/addItem';
import { getAppPlatform } from '../../platform/appPlatform';
import { autofillById } from '../../utils/bexFront';

function filterByString(fs: string, rec: VaultItem) {
	if (!fs) {
		return true;
	}
	const content = [
		rec.name,
		...rec.tags,
		...rec.fields.map((f) => f.name),
		...rec.fields.map((f) => f.value)
	]
		.join(' ')
		.toLowerCase();
	return content.search(escapeRegex(fs.toLowerCase())) !== -1;
}
export default defineComponent({
	name: 'ItemList',
	components: {
		Totp,
		Totp2,
		// VaultsMenu,
		TerminusUserHeaderReminder,
		TerminusAccountAvatar
	},
	setup(props, context) {
		const $q = useQuasar();
		const Route = useRoute();
		const $router = useRouter();
		const meunStore = useMenuStore();
		const values = ref('');
		const vaultItemRef = ref();
		const showArrow = ref(false);
		const arrowItemObj = ref({});
		const contentStyle = ref({
			height: 0
		});
		const checkBoxArr = ref([]);
		const myTotps = ref();
		const myTotps2 = ref(null);

		const filterInput = ref('');
		const filterShowing = ref('default');

		// const accountName = ref(app.account!.name);

		const userStore = useUserStore();
		const termipassStore = useTermipassStore();
		const current_user = ref(userStore.current_user);
		const isMobile = ref(
			process.env.PLATFORM == 'MOBILE' ||
				process.env.PLATFORM == 'BEX' ||
				$q.platform.is.mobile
		);
		const platform = ref(process.env.PLATFORM);

		const myF2a = ref();

		const { t } = useI18n();

		const isBex = ref(process.env.IS_BEX);

		// async function addItem(
		// 	name: string,
		// 	icon: string,
		// 	fields: any,
		// 	tags: string[],
		// 	vault: any
		// ) {
		// 	const item: VaultItem = await app.createItem({
		// 		name,
		// 		vault,
		// 		icon,
		// 		fields: fields.map(
		// 			(f: Field) => new Field({ ...f, value: f.value || '' })
		// 		),
		// 		tags
		// 	});
		// 	if (item) {
		// 		context.emit('toolabClick', item.id);
		// 	}
		// }

		async function onCreate() {
			let option: any = null;

			if (meunStore.currentItem === 'vault' && meunStore.vaultId) {
				const vaul = app.getVault(meunStore.vaultId);
				option = {
					value: vaul?.id,
					label: `${vaul?.org?.name || ''}${vaul?.org?.name ? ' / ' : ''}${
						vaul?.name
					}`
				};
			} else {
				option = {
					value: app.mainVault?.id,
					label: `${app.mainVault?.org?.name || ''}${
						app.mainVault?.org?.name ? ' / ' : ''
					}${app.mainVault?.name}`
				};
			}

			$q.dialog({
				component: CreateItem,
				componentProps: {
					option: option
				}
			}).onOk(async ({ selectedTemplate, vault }) => {
				if (selectedTemplate.id == 'exchange') {
					$q.dialog({
						component: ExchangeViewAdd,
						componentProps: {}
					}).onOk(async (exchange: ExchangeTemplate) => {
						addItem(exchange.name, exchange.icon, exchange.fields, [], vault);
					});
				} else if (selectedTemplate.id == 'crypto') {
					$q.dialog({
						component: CryptoViewAdd,
						componentProps: {}
					}).onOk(async (template: CryptoTemplate) => {
						addItem(
							template.name!,
							template.icon,
							template.fields,
							template.tags,
							vault
						);
					});
				} else {
					meunStore.isEdit = true;
					const item = await addItem(
						'',
						selectedTemplate.icon,
						selectedTemplate.fields,
						[],
						vault
					);
					if (item) {
						context.emit('toolabClick', item.id);
					}
				}
			});
		}
		async function _getItems() {
			let filterUrl = '';
			if (process.env.PLATFORM == 'BEX') {
				const tab = await (getAppPlatform() as any).getCurrentTab();
				filterUrl = tab.url;
			}

			const filter = filterInput.value || '';
			const recentThreshold = new Date(
				Date.now() - app.settings.recentLimit * 24 * 60 * 60 * 1000
			);
			let items: ListItem[] = [];
			if (filter) {
				items = app.state.vaults.flatMap((vault) =>
					[...vault.items]
						.filter((item) => filterByString(filter || '', item))
						.map((item) => ({ vault, item }))
				);
			} else if (filterUrl) {
				items = app.getItemsForUrl(filterUrl);
			} else {
				for (const vault of app.state.vaults) {
					if (meunStore.vaultId && vault.id !== meunStore.vaultId) {
						continue;
					}

					for (const item of vault.items) {
						if (meunStore.vaultId && vault.id === meunStore.vaultId) {
							items.push({
								vault,
								item,
								section: '',
								firstInSection: false,
								lastInSection: false
							});
							continue;
						}

						const removeTypeArray = [VaultType.VC, VaultType.TerminusTotp];
						if (removeTypeArray.includes(item.type)) {
							continue;
						}
						switch (meunStore.currentItem) {
							case VaultMenuItem.ALLVAULTS:
								items.push({
									vault,
									item,
									section: '',
									firstInSection: false,
									lastInSection: false
								});
								break;
							case VaultMenuItem.RECENTLYUSED:
								if (
									app.state.lastUsed.has(item.id) &&
									app.state.lastUsed.get(item.id)! > recentThreshold
								) {
									items.push({
										vault,
										item,
										section: '',
										firstInSection: false,
										lastInSection: false
									});
								}
								break;
							case VaultMenuItem.FAVORITES:
								if (app.account?.favorites.has(item.id)) {
									items.push({
										vault,
										item,
										section: '',
										firstInSection: false,
										lastInSection: false
									});
								}
								break;
							case VaultMenuItem.ATTACHMENTS:
								if (!!item.attachments.length) {
									items.push({
										vault,
										item,
										section: '',
										firstInSection: false,
										lastInSection: false
									});
								}
								break;
							case VaultMenuItem.MyVault:
								if (app.account?.id === vault.owner) {
									items.push({
										vault,
										item,
										section: '',
										firstInSection: false,
										lastInSection: false
									});
								}
								break;
							default:
								if (item.tags.includes(meunStore.currentItem)) {
									items.push({
										vault,
										item,
										section: '',
										firstInSection: false,
										lastInSection: false
									});
								}
								break;
						}
					}
				}
			}
			items.sort((a, b) => {
				const x = a.item.name.toLowerCase();
				const y = b.item.name.toLowerCase();
				return x > y ? 1 : x < y ? -1 : 0;
			});

			moveObjToFront(items);

			return items;
		}

		const moveObjToFront = (array: any) => {
			const index = array.findIndex((obj: any) => obj.item.type === 3);
			if (index > -1) {
				const obj = array.splice(index, 1)[0];
				array.unshift(obj);
			}
			return array;
		};

		async function selectItem(item: ListItem) {
			if (process.env.PLATFORM == 'BEX') {
				autofillById(item.item.id);
				return;
			}
			if (item) {
				context.emit('toolabClick', item.item.id);
			}
		}

		function isSelected(item: ListItem): boolean {
			if (process.env.PLATFORM === 'MOBILE' || $q.platform.is.mobile) {
				return true;
			}

			if (
				filterShowing.value === 'checkbox' &&
				checkBoxArr.value.find((cell) => cell === item.item.id)
			) {
				return true;
			}
			if (item && item.item.id === Route.params.itemid) {
				return true;
			}
			return false;
		}

		async function stateUpdate() {
			itemList.value = await _getItems();
		}

		onMounted(() => {
			busOn('appSubscribe', stateUpdate);
			meunStore.$subscribe(() => {
				updateItems();
			});
		});
		onUnmounted(() => {
			busOff('appSubscribe', stateUpdate);
		});
		let itemList = ref<ListItem[]>([]);
		stateUpdate();
		const placeholder = computed(function () {
			return itemList.value.length
				? {}
				: filterShowing.value === 'search'
				? {
						icon: 'search',
						text: t('vault_t.your_seach_did_not_match_any_items')
				  }
				: meunStore.vaultId
				? {
						icon: 'vault',
						text: t('vault_t.this_vault_don_not_have_any_items_yet')
				  }
				: meunStore.attachments
				? {
						icon: 'attachment',
						text: t('vault_t.you_don_not_have_any_attachments_yet')
				  }
				: meunStore.favorites
				? {
						icon: 'favorite',
						text: t('vault_t.you_don_not_have_any_favorites_yet')
				  }
				: meunStore.recent
				? {
						icon: 'time',
						text: t('vault_t.you_don_not_have_any_recently_used_items')
				  }
				: meunStore.audit
				? {
						icon: 'audit-pass',
						text: noItemsTextForAudit(meunStore.audit)
				  }
				: {
						icon: 'vault',
						text: t('vault_t.you_don_not_have_any_items_yet')
				  };
		});
		const heading = computed(function () {
			interface messageProp {
				title: string;
				superTitle: string;
				icon: string;
			}
			let message: messageProp = {
				title: '',
				superTitle: '',
				icon: ''
			};

			switch (meunStore.currentItem) {
				case VaultMenuItem.ALLVAULTS:
					if (meunStore.vaultId) {
						message = {
							title: app.getVault(meunStore.vaultId)?.name || 'Vault',
							superTitle: '',
							icon: 'sym_r_deployed_code'
						};
					} else {
						message = {
							title: t('vault_t.all_vaults'),
							superTitle: '',
							icon: 'sym_r_apps'
						};
					}
					break;
				case VaultMenuItem.RECENTLYUSED:
					message = {
						title: t('vault_t.recently_used'),
						superTitle: '',
						icon: 'sym_r_schedule'
					};
					break;
				case VaultMenuItem.FAVORITES:
					message = {
						title: t('favorites'), //Favorites
						superTitle: '',
						icon: 'sym_r_star'
					};
					break;
				case VaultMenuItem.ATTACHMENTS:
					message = {
						title: t('attachments'),
						superTitle: '',
						icon: 'sym_r_lab_profile'
					};
					break;
				case VaultMenuItem.MyVault:
					message = {
						title: t('vault_t.my_vault'),
						superTitle: '',
						icon: 'sym_r_frame_person'
					};
					break;
				case VaultMenuItem.TAGS:
					message = {
						title: meunStore.currentItem,
						superTitle: '',
						icon: 'sym_r_more'
					};
					break;
				default:
					message = {
						title: meunStore.currentItem,
						superTitle: '',
						icon: 'sym_r_apps'
					};
			}
			return message;
		});

		let updateItems = debounce(async () => {
			itemList.value = await _getItems();
		}, 50);

		async function search() {
			updateItems();
		}

		function closeSearch() {
			if (filterInput?.value) {
				filterInput.value = '';
				updateItems();
			}
			filterShowing.value = 'default';
		}

		const toggleDrawer = () => {
			if (process.env.PLATFORM === 'MOBILE' || process.env.PLATFORM === 'BEX') {
				meunStore.leftDrawerOpen = !meunStore.leftDrawerOpen;
			}
		};

		const copyItem = (value: any, e: any) => {
			e.stopPropagation();
			let copyTxt = value.format(true);
			if (
				[
					'password',
					'pin',
					'apiSecret',
					'mnemonic',
					'cryptoaddress',
					'credit'
				].includes(value.type)
			) {
				copyTxt = value.value;
			}
			if (value.type === 'totp') {
				copyTxt = myTotps.value[0].token;
			}
			const fieldEl = e.target as HTMLElement;
			fieldEl.classList.add('copied');
			setTimeout(() => fieldEl.classList.remove('copied'), 1000);
			getPlatform()
				.setClipboard(copyTxt)
				.catch((e) => {
					notifyFailed(
						t('copy_failure_message', {
							message: e.message
						})
					);
				});
		};
		const scrollItem = (e: any, id: string) => {
			const scrollLeft = e.horizontalPosition;
			if (scrollLeft < 20) {
				arrowItemObj.value[id] = false;
			} else {
				arrowItemObj.value[id] = true;
			}
		};
		const moveItem = (_e: any, direction: string, index: number) => {
			if (direction === 'west') {
				vaultItemRef.value[index].setScrollPosition('horizontal', 0);
			} else {
				vaultItemRef.value[index].setScrollPosition('horizontal', 10000000);
			}
		};
		const removeItem = async () => {
			$q.dialog({
				component: DeleteItem,
				componentProps: {
					title: t('delete_vault'),
					content: t('are_you_sure_to_delete')
				}
			}).onOk(async () => {
				filterShowing.value = 'default';
				for (const vault of app.state.vaults) {
					for (const item of vault.items) {
						if (checkBoxArr.value.find((cell) => cell === item.id)) {
							app.deleteItems([item]);
						}
					}
				}
				resetCheckbox();
			});
		};

		const hasCheckBox = ref<any[]>([]);

		const moveItems = async () => {
			hasCheckBox.value = [];
			let hasAttachments = false;

			for (let i = 0; i < checkBoxArr.value.length; i++) {
				const element = checkBoxArr.value[i];
				const hasCheckItem = itemList.value.find((a) => a.item.id === element);
				if (
					hasCheckItem &&
					hasCheckItem.item.attachments &&
					hasCheckItem.item.attachments.length > 0
				) {
					hasAttachments = true;
				} else {
					hasCheckBox.value.push(hasCheckItem);
				}
			}

			if (hasAttachments) {
				await checkAttachments();
			} else {
				await checkHasCheckBox();
			}
		};

		const checkAttachments = () => {
			$q.dialog({
				title: t('confirm'),
				message: t('vault_t.some_items_not_have_white_access_message'),
				cancel: true,
				persistent: true
			}).onOk(async () => {
				for (let i = 0; i < checkBoxArr.value.length; i++) {
					const element = checkBoxArr.value[i];
					const hasCheckItem = itemList.value.find(
						(a) => a.item.id === element
					);
					if (
						!hasCheckItem ||
						!hasCheckItem.item.attachments ||
						hasCheckItem.item.attachments.length <= 0
					) {
						hasCheckBox.value.push(hasCheckItem);
					}
				}
				await checkHasCheckBox();
			});
		};

		const checkHasCheckBox = () => {
			if (
				hasCheckBox.value.some(({ vault }) => !app.hasWritePermissions(vault))
			) {
				$q.dialog({
					title: t('confirm'),
					message: t('vault_t.some_items_not_have_white_access_message'),
					cancel: true,
					persistent: true
				}).onOk(() => {
					hasCheckBox.value = hasCheckBox.value.filter(({ vault }) =>
						app.hasWritePermissions(vault)
					);
					showMoveItemsDialog();
				});
			} else {
				showMoveItemsDialog();
			}
		};

		const showMoveItemsDialog = () => {
			$q.dialog({
				component:
					process.env.PLATFORM == 'MOBILE' ? MoveItemsMobile : MoveItemsPC,
				componentProps: {
					selected: hasCheckBox.value,
					leftText: t('cancel'),
					rightText: t('vault_t.move_item')
				}
			})
				.onOk(() => {
					filterShowing.value = 'default';
					resetCheckbox();
				})
				.onCancel(() => {
					filterShowing.value = 'default';
					resetCheckbox();
				});
		};

		const toggleCheckbox = () => {
			if (checkBoxArr.value.length === itemList.value.length) {
				resetCheckbox();
			} else {
				resetCheckbox();
				for (let i = 0; i < itemList.value.length; i++) {
					const item = itemList.value[i];
					checkBoxArr.value.push(item.item.id);
				}
			}
		};

		const resetCheckbox = () => {
			checkBoxArr.value = [];
		};
		interface TagInter {
			name: string;
			icon: string;
			class: string;
		}
		const showTags = (item: any) => {
			const tags: TagInter[] = [];
			let tagWidth = 0;
			if (item.tags.length) {
				tags.push({
					icon: 'sym_r_style',
					name: item.tags[0],
					class: ''
				});
				tagWidth += 80;
				if (item.tags.length > 1) {
					tags.push({
						icon: 'sym_r_style',
						name: `+${item.tags.length - 1}`,
						class: ''
					});
					tagWidth += 54;
				}
			}
			const attCount = (item.attachments && item.attachments.length) || 0;
			if (attCount) {
				tags.push({
					name: attCount.toString(),
					icon: 'sym_r_attach_file',
					class: ''
				});
				tagWidth += 42;
			}
			if (app.account!.favorites.has(item.id)) {
				tags.push({
					name: '',
					icon: 'sym_r_grade',
					class: 'text-red'
				});
				tagWidth += 32;
			}

			return {
				tags,
				tagWidth
			};
		};

		function enterAccounts() {
			$router.push('/accounts');
		}

		const menu_showing = ref(false);

		return {
			itemList,
			onCreate,
			selectItem,
			isSelected,
			placeholder,
			heading,
			filterShowing,
			filterInput,
			search,
			closeSearch,
			values,
			toggleDrawer,
			copyItem,
			scrollItem,
			showArrow,
			arrowItemObj,
			moveItem,
			vaultItemRef,
			contentStyle,
			checkBoxArr,
			removeItem,
			resetCheckbox,
			toggleCheckbox,
			showTags,
			myTotps,
			myTotps2,
			moveItems,
			showItemIcon,
			format,
			// accountName,
			current_user,
			isMobile,
			enterAccounts,
			myF2a,
			scrollBarStyle,
			platform,
			userStore,
			menu_showing,
			t,
			isBex,
			termipassStore
		};
	}
});
</script>

<style lang="scss" scoped>
.itemlist {
	width: 100%;
	height: 100%;
	border-right: 1px solid $separator;

	.searchWrap {
		width: 100%;
		height: 56px;
		line-height: 56px;
		text-align: center;

		.searchInput {
			padding: 0 8px;
			border: 1px solid $blue;
			border-radius: 10px;
			margin: 8px 16px;
			display: inline-block;
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}

	.mobile-title {
		display: flex;
		align-items: center;
	}

	.menuAcion {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		background: rgba(246, 246, 246, 1);
	}

	.avator {
		width: 32px;
		height: 32px;
		border-radius: 16px;
		overflow: hidden;
	}

	.checkOperate {
		border-radius: 4px;
		padding: 4px;
	}

	.item-unit {
		border-radius: 5px;
		margin-right: 4px;
		white-space: nowrap;
		position: relative;
		max-width: 180px;
		min-width: 70px;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;

		.item-header {
			width: 100%;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
		}

		.item-unit-content {
			line-height: 1 !important;
			white-space: nowrap;
			span {
				display: inline-block;
				width: 100%;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				font-size: 14px;
			}
		}

		.hideCopied {
			position: absolute;
			width: 100%;
			height: 100%;
			left: 0;
			top: 0;
			opacity: 0;
			border-radius: 8px;

			display: flex;
			align-items: center;
			justify-content: center;
			background: $grey-2;
			border: 1px solid $separator;
		}

		.copied {
			opacity: 1;
			border: 1px solid $yellow-default;
			background: $background-1;

			&:after {
				width: 100%;
				height: 100%;
				background: $yellow-alpha;
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				z-index: 1;
			}
		}
	}

	.vaultCard {
		border: 0;
		box-sizing: border-box;
		position: relative;
		padding: 12px 12px 0px 12px;

		.tag-wrap {
			display: flex;
			align-items: center;
			justify-content: flex-end;

			.tag {
				border: 1px solid $ink-2;
				padding: 0 4px;
				border-radius: 4px;
				float: right;
				height: 20px;
				line-height: 20px;
				display: flex;
				align-items: center;
				justify-content: flex-start;

				.tag-name {
					max-width: 60px;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
			}
		}

		.field-name {
			display: flex;
			align-items: center;
			justify-content: flex-start;

			.item-name {
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;

				.label {
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
				}

				.name {
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
				}
			}
		}

		.west {
			position: absolute;
			left: 10px;
			bottom: 18px;
			margin: auto;
			z-index: 1;
			color: $ink-2;
			cursor: pointer;

			&:hover {
				color: $ink-1;
			}
		}

		.east {
			border-radius: 14px;
			position: absolute;
			right: 10px;
			bottom: 18px;
			margin: auto;
			z-index: 1;
			color: $ink-2;
			cursor: pointer;

			&:hover {
				color: $ink-1;
			}
		}
	}

	.newVault {
		border-radius: 8px;
		border: 1px solid $yellow-default;

		&:hover {
			background: $background-hover;
		}
	}

	.authenticator {
		height: 94px;
		border-radius: 12px;
		margin: 12px 16px;
		padding: 20px;
		border: 1px solid #e0e0e0;
		background: linear-gradient(
			180deg,
			rgba(253, 255, 203, 0.3) 0%,
			rgba(236, 255, 135, 0.3) 100%
		);
	}
}
</style>
