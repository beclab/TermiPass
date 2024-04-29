<template>
	<div style="width: 100%; height: 60px">
		<div class="searchWrap" v-if="filterShowing === 'search'">
			<q-input
				class="searchInput"
				v-model="filterInput"
				debounce="500"
				borderless
				dense
				placeholder="Search"
				@update:model-value="search"
			>
				<template v-slot:prepend>
					<q-icon class="searchIcon q-ml-sm" name="search"> </q-icon>
				</template>
				<template v-slot:append>
					<q-icon class="closeIcon q-mr-sm" name="close" @click="closeSearch">
						<q-tooltip>{{ t('buttons.close') }}</q-tooltip>
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
					class="q-mr-md cursor-pointer"
					name="sym_r_search"
					size="24px"
					@click="() => (filterShowing = 'search')"
				>
					<q-tooltip>{{ t('search') }}</q-tooltip>
				</q-icon>

				<q-icon
					class="q-mr-md cursor-pointer"
					name="sym_r_add"
					size="24px"
					clickable
					@click="onCreate"
				>
					<q-tooltip>{{ t('add_vault') }}</q-tooltip>
				</q-icon>
			</div>
		</div>
	</div>
	<q-list style="width: 100%; height: calc(100% - 60px)">
		<template v-if="itemList.length > 0">
			<q-scroll-area
				style="height: 100%"
				content-style="height: 100%;"
				:thumb-style="scrollBarStyle.thumbStyle"
			>
				<template v-for="(item, index) in itemList" :key="index">
					<div class="card-wrap full-width">
						<q-card
							clickable
							v-ripple
							@click="selectItem(item)"
							:active="isSelected(item)"
							active-class="text-blue"
							flat
							class="vaultsCard row items-center justify-start q-my-sm q-pa-md"
							:class="isSelected(item) ? 'vaultCardActive' : ''"
						>
							<q-card-section
								class="row items-center justify-between q-pa-none"
							>
								<q-icon name="sym_r_deployed_code" size="24px" />
							</q-card-section>
							<q-card-section
								class="column items-start justify-start q-pa-none q-ml-sm"
							>
								<div>{{ item.name }}</div>
								<div class="row items-center justify-start">
									<div
										class="members text-body3 row items-center justify-center"
									>
										<q-icon name="sym_r_person" size="20px" class="q-mr-xs" />
										{{ getMembers(item)?.length }}
									</div>
								</div>
							</q-card-section>
						</q-card>
					</div>
				</template>
			</q-scroll-area>
		</template>
		<div
			class="text-color-sub-title column items-center justify-center full-height"
			v-else
		>
			<img src="../../../../assets/layout/nodata.svg" />
			<span class="q-mt-md">
				{{ t('not_have_any_vaults_yet') }}
			</span>
		</div>
	</q-list>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { translate } from '@didvault/locale/src/translate';
import { app } from '../../../../globals';
import { debounce, Vault } from '@didvault/sdk/src/core';
import { useMenuStore } from '../../../../stores/menu';
import { scrollBarStyle } from '../../../../utils/contact';
import { busOn, busOff } from '../../../../utils/bus';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';

export default defineComponent({
	name: 'OrgVaultsIndex',
	components: {},
	setup() {
		const router = useRouter();
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
		// const platform = ref(process.env.PLATFORM);
		const $q = useQuasar();
		const isMobile = ref(
			process.env.PLATFORM == 'MOBILE' ||
				process.env.PLATFORM == 'BEX' ||
				$q.platform.is.mobile
		);

		const org = computed(function () {
			return app.orgs.find((org) => org.id == meunStore.org_id);
		});

		const heading = computed(function () {
			return {
				icon: 'sym_r_apps',
				title: 'Vaults'
			};
		});

		const getMembers = (vault) => {
			return org.value?.getMembersForVault(vault);
		};

		async function onCreate() {
			router.push({
				path: '/org/Vaults/new'
			});
		}
		function _getItems() {
			const memFilter = filterInput.value?.toLowerCase();
			console.log('memFilter', memFilter);
			console.log('appvaults', app.vaults);
			console.log('appaccountid', app.account?.id);

			const vault = app.vaults.filter(
				({ name, id }) =>
					name?.toLowerCase().includes(memFilter) && app.mainVault?.id != id
			);
			return vault;
		}
		async function selectItem(item: Vault) {
			router.push({
				path: '/org/Vaults/' + (item.id ? item.id : '')
			});
			meunStore.org_mode_id = item.id;
		}

		function isSelected(item: Vault): boolean {
			return meunStore.org_mode_id == item.id;
		}
		let itemList = ref<Vault[]>(_getItems());

		function stateUpdate() {
			itemList.value = _getItems();
			console.log('itemListitemListitemList', itemList.value);
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

		//let unsubscribe : any;
		onMounted(() => {
			busOn('appSubscribe', stateUpdate);
			// unsubscribe = meunStore.$subscribe((mutation, state) => {
			//     updateItems();
			// });
			meunStore.$subscribe(() => {
				updateItems();
			});
		});
		onUnmounted(() => {
			busOff('appSubscribe', stateUpdate);
			//unsubscribe();
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
			translate,
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
			search,
			closeSearch,
			// getGroups,
			getMembers,
			goBack,
			scrollBarStyle,
			isMobile,
			t
		};
	}
});
</script>

<style lang="scss" scoped>
.searchWrap {
	text-align: center;
	.searchInput {
		width: 90%;
		height: 40px;
		line-height: 40px;
		border: 1px solid $blue;
		border-radius: 10px;
		margin: 17px auto;
		display: inline-block;
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

.card-wrap {
	display: flex;
	align-items: center;
	justify-content: center;
	border-bottom: 1px solid #e0e0e0;
	.vaultsCard {
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

		.groups,
		.members {
			border: 1px solid $grey-2;
			border-radius: 4px;
			padding: 0px 6px;
		}
	}
}
</style>
