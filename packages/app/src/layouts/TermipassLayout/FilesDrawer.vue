<template>
	<q-drawer
		show-if-above
		behavior="desktop"
		:width="240"
		:bordered="platform === 'DESKTOP' ? false : true"
		class="myDrawer"
	>
		<!-- <BtScrollArea style="height: 100%"> -->
		<q-scroll-area
			style="height: 100%; width: 100%"
			:thumb-style="scrollBarStyle.thumbStyle"
		>
			<bt-menu
				:items="menuStore.menu"
				:modelValue="menuStore.activeMenu"
				:sameActiveable="true"
				@select="selectHandler"
				style="width: 100%"
				class="title-norla"
				:active-class="
					platform === 'WEB'
						? 'files-active-link-web'
						: 'files-active-link title-active text-subtitle2'
				"
			>
				<template #extra-MyLibraries>
					<q-btn
						class="btn-size-sm btn-no-text btn-no-border text-grey-8"
						icon="sym_r_add_circle"
						@click="handleNewLib($event)"
					>
						<q-tooltip> {{ t('files.new_library') }}</q-tooltip>
					</q-btn>
				</template>

				<template #extra-Sync>
					<q-item-section
						class="text-subtitle1 q-pr-none"
						side
						v-if="$q.platform.is.electron"
					>
						<q-btn
							v-if="menuStore.syncStatus"
							class="btn-size-sm btn-no-text btn-no-border text-grey-8"
							icon="sym_r_pause_circle"
							@click="menuStore.updateSyncStatus"
						>
							<q-tooltip> {{ t('files.click_to_pause') }}</q-tooltip>
						</q-btn>

						<q-btn
							v-if="!menuStore.syncStatus"
							class="btn-size-sm btn-no-text btn-no-border text-green"
							icon="sym_r_sync"
							@click="menuStore.updateSyncStatus"
						>
							<q-tooltip> {{ t('files.click_to_continue') }}</q-tooltip>
						</q-btn>
					</q-item-section>
				</template>

				<template
					v-slot:[`icon-${menu.id}`]
					v-for="menu in menuStore.menu[1].children"
					:key="menu.id"
				>
					<q-icon class="item-icon" rounded :name="menu.icon" size="24px">
						<q-icon
							v-if="
								$q.platform.is.electron &&
								syncStatusInfo[getSyncStatus(menu.id)]
							"
							:name="syncStatusInfo[getSyncStatus(menu.id)].icon"
							size="12px"
							:color="syncStatusInfo[getSyncStatus(menu.id)].color"
							style="
								position: absolute;
								left: -1.5px;
								top: 10px;
								cursor: pointer;
								background: white;
								border-radius: 12px;
							"
						>
						</q-icon>
					</q-icon>
				</template>

				<template
					v-slot:[`extra-${menu.id}`]
					v-for="menu in menuStore.menu[1].children"
					:key="menu.id"
				>
					<q-btn
						class="btn-size-xs btn-no-text btn-no-border text-grey-8"
						icon="more_horiz"
					>
						<q-tooltip>{{ t('files.operate') }}</q-tooltip>
						<PopupMenu :item="menu" from="sync" :isSide="true" />
					</q-btn>
				</template>
			</bt-menu>
		</q-scroll-area>
	</q-drawer>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDataStore } from '../../stores/data';
import { syncStatusInfo, useMenuStore } from '../../stores/files-menu';
import { useSeahubStore } from '../../stores/seahub';
import { sync } from '../../api';
import { handleFileOperate } from '../../components/files/files/OperateAction';
import PopupMenu from '../../components/files/popup/PopupMenu.vue';
import { scrollBarStyle, OPERATE_ACTION } from '../../utils/contact';
import { useI18n } from 'vue-i18n';

const $q = useQuasar();
const Router = useRouter();
const Route = useRoute();
const store = useDataStore();
const menuStore = useMenuStore();
const seahubStore = useSeahubStore();

const platform = ref(process.env.PLATFORM);

const { t } = useI18n();

onMounted(async () => {
	await menuStore.fifterMenu();
	await sync.getSyncMenu();
});

onUnmounted(() => {
	menuStore.closeSync();
});

const selectHandler = (value) => {
	if (value.key === 'MyLibraries' || value.key === 'SharedLibraries') {
		return false;
	}
	if (value.item.repo_id) {
		store.showUploadModal = false;
		changeItemMenu(value.item.label, value.item.id, value.item);
	} else {
		seahubStore.setRepoId({ id: '', name: '' });
		changeItemMenu(value.item.label);
	}
};

const changeItemMenu = async (
	itemName: string,
	id?: string,
	item?: any
): Promise<void> => {
	// menuStore.canForward = true;
	store.changeItemMenu(itemName);

	if (id) {
		menuStore.activeMenu = item.key;
		menuStore.avtiveItem = item;
		Router.replace({
			path: menuStore.currentItemDefaultPath,
			query: {
				id: item.id,
				type: item.type ? item.type : 'mine',
				p: item.permission ? item.permission.trim() : 'rw'
			}
		});
	} else {
		menuStore.activeMenu = itemName;
		Router.push({
			path: store.currentItemDefaultPath
		});
	}
};

const handleNewLib = (e: any) => {
	handleFileOperate(
		e,
		Route,
		OPERATE_ACTION.CREATE_REPO,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		async (_action: OPERATE_ACTION, _data: any) => {
			//Do nothing
			store.closeHovers();
		}
	);
};

const getSyncStatus = (repo_id: string) => {
	const status = menuStore.syncReposLastStatusMap[repo_id]
		? menuStore.syncReposLastStatusMap[repo_id].status
		: 0;

	if (status > 0) {
		if (!menuStore.syncStatus) {
			return -1;
		}
	}
	return status;
};
</script>

<style lang="scss">
.files-active-link {
	color: rgba(31, 24, 20, 1);
	background: rgba(255, 235, 59, 0.1);
}
.files-active-link-web {
	color: rgba(100, 96, 93, 1);
	background: rgba(244, 219, 195, 1);
}

.myDrawer {
	background-color: $white;
	overflow: hidden;
	padding-top: 6px;

	.title-active {
		color: $title;
	}
}
</style>
