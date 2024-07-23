<template>
	<q-drawer
		show-if-above
		behavior="desktop"
		:width="240"
		class="myDrawer"
		:dark="$q.dark.isActive"
		:class="isFiles ? 'files-border' : ''"
	>
		<BtScrollArea style="height: 100%; width: 100%">
			<bt-menu
				:items="menuStore.menu"
				:modelValue="menuStore.activeMenu.id"
				:sameActiveable="true"
				@select="selectHandler"
				style="width: 100%"
				class="title-norla"
				active-class="text-subtitle2 bg-yellow-soft text-ink-1"
			>
				<template #extra-MyLibraries>
					<q-btn
						class="btn-size-xs btn-no-text btn-no-border text-grey-8"
						icon="sym_r_add_circle"
						text-color="ink-2"
						@click="handleNewLib($event)"
					>
						<q-tooltip> {{ t('files.new_library') }}</q-tooltip>
					</q-btn>
				</template>

				<template #extra-Sync>
					<q-item-section
						class="text-subtitle1 q-pr-none"
						side
						v-if="$q.platform.is.electron && menuStore.reposHasSync"
					>
						<q-btn
							v-if="menuStore.syncStatus"
							class="btn-size-xs btn-no-text btn-no-border text-grey-5"
							icon="sym_r_pause_circle"
							text-color="ink-2"
							@click="menuStore.updateSyncStatus"
						>
							<q-tooltip> {{ t('files.click_to_pause') }}</q-tooltip>
						</q-btn>

						<q-btn
							v-if="!menuStore.syncStatus"
							class="btn-size-xs btn-no-text btn-no-border text-grey-5"
							icon="sym_r_autoplay"
							text-color="ink-2"
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
							color="white"
							class="sync-icon"
							:style="{
								background: syncStatusInfo[getSyncStatus(menu.id)].color
							}"
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
						text-color="ink-2"
					>
						<q-tooltip>{{ t('files.operate') }}</q-tooltip>
						<PopupMenu :item="menu" from="sync" :isSide="true" />
					</q-btn>
				</template>
			</bt-menu>
		</BtScrollArea>
	</q-drawer>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDataStore } from '../../stores/data';
import { syncStatusInfo, useMenuStore } from '../../stores/files-menu';
import { useOperateinStore } from './../../stores/operation';
import PopupMenu from '../../components/files/popup/PopupMenu.vue';
import { OPERATE_ACTION } from '../../utils/contact';
import { useI18n } from 'vue-i18n';
import { useFilesStore, DriveType } from './../../stores/files';

const $q = useQuasar();
const Router = useRouter();
const Route = useRoute();
const store = useDataStore();
const menuStore = useMenuStore();
const operateinStore = useOperateinStore();
const filesStore = useFilesStore();
const isFiles = process.env.PLATFORM == 'FILES';

const { t } = useI18n();

onMounted(async () => {
	await menuStore.getSyncMenu();
	menuStore.fifterMenu();
});

const selectHandler = async (value) => {
	menuStore.activeMenu = {
		driveType: value.item.driveType,
		label: value.item.label,
		id: value.item.key
	};
	console.log('valueitemvalueitemvalueitem', value.item);
	const path = await filesStore.formatRepotoPath(value.item);

	console.log('pathpathpath', path);

	filesStore.setBrowserUrl(path, value.item.driveType);
	filesStore.resetSelected();
};

const handleNewLib = (e: any) => {
	operateinStore.handleFileOperate(
		e,
		Route,
		OPERATE_ACTION.CREATE_REPO,
		DriveType.Sync,
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
.myDrawer {
	overflow: hidden;
	padding-top: 6px;
	// border-right: 1px solid red;
	// .title-active {
	// 	color: $ink-1;
	// }
}

.files-border {
	border-right: 1px solid $separator;
}

.sync-icon {
	position: absolute;
	left: -1.5px;
	top: 12px;
	cursor: pointer;
	border-radius: 12px;
	font-variation-settings: 'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 20;
}
</style>
