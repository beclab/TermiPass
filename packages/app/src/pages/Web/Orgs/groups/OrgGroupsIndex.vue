<template>
	<div class="column grouplist">
		<div style="width: 100%; height: 60px">
			<div class="row justify-between" v-if="filterShowing === 'default'">
				<div class="row items-center q-pl-md">
					<BtIcon :src="heading.icon" />
					<div class="column">
						<div>{{ org?.name }}</div>
						<q-toolbar-title>{{ heading.title }}</q-toolbar-title>
					</div>
				</div>
				<div class="row items-center q-py-xs q-my-md">
					<BtIcon
						class="q-mr-md cursor-pointer"
						:width="16"
						:height="16"
						src="add"
						@click="onCreate"
					/>
				</div>
			</div>
		</div>
		<q-list style="width: 100%; height: calc(100% - 60px); overflow-y: scroll">
			<template v-if="itemList.length > 0">
				<q-card
					v-for="(item, index) in itemList"
					:key="index"
					clickable
					v-ripple
					@click="selectItem(item as Group)"
					:active="isSelected(item as Group)"
					active-class="text-blue"
					flat
					bordered
					class="vaultCard col-6 full-width q-pa-md"
					:class="isSelected(item as Group) ? 'vaultCardActive' : ''"
				>
					<q-card-section
						class="row items-center justify-between q-pa-none q-mb-md"
					>
						<OrgGroupItem :group="(item as Group)" />
					</q-card-section>
				</q-card>
			</template>

			<div
				class="column text-color-sub-title items-center justify-center"
				style="height: 100%"
				v-else
			>
				<BtIcon class="q-mb-lg" src="itemSelect" :width="215" :height="148" />
				<span style="margin-bottom: 50px">
					{{ t('do_not_have_any_groups_yet') }}
				</span>
			</div>
		</q-list>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed } from 'vue';
import { app } from '../../../../globals';
import { debounce, Group } from '@didvault/sdk/src/core';
import { useMenuStore } from '../../../../stores/menu';
import OrgGroupItem from './OrgGroupItem.vue';
import { busOn, busOff } from '../../../../utils/bus';
import { useI18n } from 'vue-i18n';

export default defineComponent({
	name: 'OrgGroupsIndex',
	components: {
		OrgGroupItem
	},
	setup() {
		const meunStore = useMenuStore();
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

		const org = computed(function () {
			return app.orgs.find((org) => org.id == meunStore.org_id);
		});

		const heading = computed(function () {
			return {
				icon: 'settings',
				title: t('members')
			};
		});

		async function onCreate() {
			meunStore.org_mode_id = 'new';
		}

		function _getItems() {
			if (!org.value) {
				return [];
			}
			const groups = org.value.groups.sort((a, b) =>
				a.name < b.name ? -1 : 1
			);
			return groups;
		}
		async function selectItem(item: Group) {
			meunStore.org_mode_id = encodeURIComponent(item.name);
		}

		function isSelected(item: Group): boolean {
			return meunStore.org_mode_id == encodeURIComponent(item.name);
		}
		let itemList = ref<Group[]>(_getItems());

		function stateUpdate() {
			itemList.value = _getItems();
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

		let updateItems = debounce(() => {
			itemList.value = _getItems();
		}, 50);

		const { t } = useI18n();

		return {
			itemList,
			onCreate,
			selectItem,
			isSelected,
			heading,
			filterShowing,
			filterInput,
			org,
			values,

			showArrow,
			arrowItemObj,

			vaultItemRef,
			contentStyle,
			checkBoxArr,
			t
		};
	}
});
</script>

<style lang="scss" scoped>
.grouplist {
	height: 100%;

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

	.vaultCard {
		border: 0;
		border-radius: 0;
		box-sizing: border-box;
		position: relative;
	}
}
</style>
