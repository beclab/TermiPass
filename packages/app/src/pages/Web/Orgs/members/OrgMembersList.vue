<template>
	<div
		class="row justify-between items-center bg-white"
		style="width: 100%; height: 60px"
	>
		<div class="row items-center justify-between">
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
		</div>
	</div>
	<q-list
		class="bg-white"
		style="width: 100%; height: calc(100% - 60px); overflow: hidden"
	>
		<q-scroll-area
			v-if="itemList.length > 0"
			style="height: 100%"
			:thumb-style="scrollBarStyle.thumbStyle"
		>
			<template v-for="(item, index) in itemList" :key="index">
				<div class="card-wrap full-width">
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
						class="memberCard full-widthrow items-center justify-start q-my-sm q-pa-xs"
						:class="isSelected(item) ? 'memberActive' : ''"
					>
						<q-card-section class="row items-center justify-between q-pa-none">
							<OrgMemberItem
								:member="(item as OrgMember)"
								:isSelected="isSelected(item as OrgMember) ? true : false"
							/>
							<q-separator />
						</q-card-section>
					</q-card>
				</div>
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
import { busOn, busOff } from '../../../../utils/bus';
import { useI18n } from 'vue-i18n';

export default defineComponent({
	name: 'OrgMembersIndex',
	components: {
		OrgMemberItem
	},
	setup() {
		const $q = useQuasar();
		const meunStore = useMenuStore();
		const router = useRouter();
		const route = useRoute();
		const isMobile = ref(
			process.env.PLATFORM == 'MOBILE' ||
				process.env.PLATFORM == 'BEX' ||
				$q.platform.is.mobile
		);
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
			return org.value!.members.filter((org) => org.id);
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
			heading,
			itemList,
			org,
			OrgMemberStatus,
			isMobile,
			goBack,
			scrollBarStyle,
			t
		};
	}
});
</script>

<style lang="scss" scoped>
.itemWrap {
	height: 100%;
	.card-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom: 1px solid #e0e0e0;

		.memberCard {
			width: 90%;
			border: 0;
			border-radius: 0;
			box-sizing: border-box;
			position: relative;
			border-radius: 8px;
			cursor: pointer;

			&:hover {
				background: $grey-1;
			}
			&.memberActive {
				background: $grey-1;
			}
		}
	}
}
</style>
