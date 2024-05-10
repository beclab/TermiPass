<template>
	<div style="width: 100%; height: 60px">
		<div class="searchWrap" v-if="filterShowing === 'search'">
			<q-input
				class="searchInput"
				v-model="filterInput"
				debounce="500"
				borderless
				placeholder="Search"
				@update:model-value="search"
				input-style="height: 36px;lineHeight: 36px"
			>
				<template v-slot:prepend>
					<q-icon class="searchIcon" name="search" />
				</template>
				<template v-slot:append>
					<q-icon class="closeIcon" name="close" @click="closeSearch">
						<q-tooltip> {{ t('buttons.close') }} </q-tooltip>
					</q-icon>
				</template>
			</q-input>
		</div>

		<div
			class="row items-center justify-between"
			v-if="filterShowing === 'default'"
		>
			<div class="row items-center q-pl-md">
				<q-icon
					v-if="isMobile"
					name="sym_r_chevron_left"
					size="24px"
					@click="goBack"
				/>
				<q-icon :name="heading.icon" size="24px" />

				<div class="column q-pl-md" v-if="!isMobile">
					<div class="text-grey-8 text-caption">
						{{ org?.name }}
					</div>
					<div class="text-body2 text-weight-bold">
						{{ heading.title }}
					</div>
				</div>
			</div>

			<div class="column" v-if="isMobile">
				<div class="text-grey-8 text-caption">
					{{ org?.name }}
				</div>
				<div class="text-body2 text-weight-bold">
					{{ heading.title }}
				</div>
			</div>

			<div class="row items-center q-py-xs q-my-md">
				<q-icon
					class="q-mr-md"
					name="sym_r_search"
					size="24px"
					@click="() => (filterShowing = 'search')"
				>
					<q-tooltip>{{ t('search') }}</q-tooltip>
				</q-icon>
			</div>
		</div>
	</div>
	<q-list style="width: 100%; height: calc(100% - 60px); overflow-y: scroll">
		<q-scroll-area
			v-if="itemList.length > 0"
			style="height: 100%"
			:thumb-style="scrollBarStyle.thumbStyle"
		>
			<template v-for="(item, index) in itemList" :key="index">
				<q-card
					v-if="item.status === OrgMemberStatus.Active"
					clickable
					v-ripple
					@click="selectItem(item as OrgMember)"
					:active="isSelected(item as OrgMember)"
					active-class="text-blue"
					flat
					borderless
					dense
					class="member_card col-6 full-width q-pa-none q-mx-sm"
				>
					<q-card-section class="row items-center justify-center q-pa-none">
						<OrgMemberItem
							:member="(item as OrgMember)"
							:isSelected="isSelected(item as OrgMember) ? true : false"
						/>
					</q-card-section>
					<q-separator v-if="index < itemList.length - 2" />
				</q-card>
			</template>
		</q-scroll-area>

		<div
			class="column text-color-sub-title items-center justify-center full-height"
			v-else
		>
			<img src="../../../../assets/layout/nodata.svg" />
			<span class="text-grey-8" style="margin-top: 32px; margin-bottom: 70px">
				{{ t('not_have_any_members_yet') }}
			</span>
		</div>
	</q-list>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { app } from '../../../../globals';
import { debounce, OrgMember, OrgMemberStatus } from '@didvault/sdk/src/core';
import { useMenuStore } from '../../../../stores/menu';
import { scrollBarStyle } from '../../../../utils/contact';
import OrgMemberItem from './OrgMemberItem.vue';
// import VaultsMenu from '../../../../layouts/TermipassLayout/VaultsMenu.vue';
import { busOn, busOff } from '../../../../utils/bus';
import { useI18n } from 'vue-i18n';

export default defineComponent({
	name: 'OrgMembersIndex',
	components: {
		OrgMemberItem
		// VaultsMenu
	},
	setup() {
		const $q = useQuasar();
		const meunStore = useMenuStore();
		const router = useRouter();
		const route = useRoute();
		const values = ref('');
		const vaultItemRef = ref();
		const showArrow = ref(false);
		const arrowItemObj = ref({});
		const contentStyle = ref({
			height: 0
		});
		const checkBoxArr = ref([]);
		const filterInput = ref('');
		const filterShowing = ref('default');
		const isMobile = ref(
			process.env.PLATFORM == 'MOBILE' ||
				process.env.PLATFORM == 'BEX' ||
				$q.platform.is.mobile
		);
		const platform = ref(process.env.PLATFORM);
		const org = ref();

		const initOrg = () => {
			org.value = app.orgs.find((org) => org.id == meunStore.org_id);
		};

		const heading = computed(function () {
			return {
				icon: 'sym_r_groups',
				title: 'Members'
			};
		});

		function _getItems() {
			initOrg();
			const members_hasid = org.value!.members.filter((org) => org.id);

			const memFilter = filterInput.value.toLowerCase();
			const members = memFilter
				? members_hasid.filter(
						({ name, did }) =>
							did.toLowerCase().includes(memFilter) ||
							name.toLowerCase().includes(memFilter)
				  )
				: members_hasid;
			return members;
		}

		async function selectItem(item: OrgMember) {
			router.push({
				path: '/org/Members/' + (item.did ? item.did : '')
			});
		}

		function isSelected(item: OrgMember): boolean {
			return route.params.org_type == item.did;
		}
		let itemList = ref<OrgMember[]>(_getItems());

		function stateUpdate() {
			itemList.value = _getItems();
		}

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

		const goBack = () => {
			router.go(-1);
		};

		onMounted(() => {
			busOn('orgSubscribe', stateUpdate);

			meunStore.$subscribe(() => {
				updateItems();
			});
		});
		onUnmounted(() => {
			busOff('orgSubscribe', stateUpdate);
		});

		let updateItems = debounce(() => {
			itemList.value = _getItems();
		}, 50);

		const { t } = useI18n();

		return {
			selectItem,
			isSelected,
			search,
			closeSearch,

			heading,
			itemList,
			filterShowing,
			filterInput,
			org,
			values,
			showArrow,
			arrowItemObj,
			vaultItemRef,
			contentStyle,
			checkBoxArr,
			OrgMemberStatus,
			isMobile,
			goBack,
			scrollBarStyle,
			platform,
			t
		};
	}
});
</script>

<style lang="scss" scoped>
.itemWrap {
	height: 100%;

	.itemlist {
		height: 100%;
		border-right: 1px solid #e0e0e0;

		.searchWrap {
			height: 56px;
			line-height: 56px;
			text-align: center;

			.searchInput {
				width: 90%;
				height: 36px;
				line-height: 36px;
				border: 1px solid $blue;
				border-radius: 10px;
				margin: 17px auto;
				display: inline-block;

				.searchIcon {
					height: 36px;
					margin-left: 10px;
					margin-bottom: 20px;
				}

				.closeIcon {
					height: 36px;
					margin-right: 10px;
					margin-bottom: 20px;
				}
			}
		}

		.checkOperate {
			border-radius: 4px;
			padding: 4px;
		}

		.item-unit {
			border-radius: 5px;
			padding: 4px 20px;
			white-space: nowrap;
			position: relative;

			.item-unit-content {
				white-space: nowrap;
			}

			.hideCopied {
				position: absolute;
				width: 100%;
				height: 100%;
				opacity: 0;
				left: 0;
				top: 0;
			}
		}

		.member_card {
			border: 0;
			border-radius: 0;
			box-sizing: border-box;
			position: relative;
			cursor: pointer;
		}
	}
}
</style>
