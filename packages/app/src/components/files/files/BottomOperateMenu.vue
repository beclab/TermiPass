<template>
	<!-- <q-list class="bottom-menu-list row items-center text-ink-3"> -->

	<q-scroll-area
		class="bottom-menu-list"
		:thumb-style="contentStyle as any"
		:visible="true"
		content-style="height: 100%;"
	>
		<q-card-section
			horizontal
			class="row items-center justify-center text-ink-3"
			style="height: 48px"
		>
			<template v-for="(item, index) in menuListSelf" :key="index">
				<div
					class="menu-item text-body2 row items-center justify-center"
					:style="`width: calc(100% / ${menuListSelf.length})`"
					v-if="showDisabled(item)"
					@click="handle($event, item)"
				>
					<q-icon rounded :name="item.icon" size="1.2em"></q-icon>
					<span class="q-ml-sm">
						{{ item.name }}
					</span>
				</div>
			</template>
		</q-card-section>
	</q-scroll-area>

	<!-- </q-list> -->
</template>

<script setup lang="ts">
import { defineEmits, defineProps, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useDataStore } from '../../../stores/data';
import { useQuasar } from 'quasar';
import { handleFileOperate } from './OperateAction';
import { INewDownloadFile } from '../../../platform/electron/interface';
import { useMenuStore } from '../../../stores/files-menu';
import { SYNC_STATE, OPERATE_ACTION } from '../../../utils/contact';
import { downloadFile } from '../../../utils/utils';
import { notifySuccess } from '../../../utils/notifyRedefinedUtil';
import { useI18n } from 'vue-i18n';

const props = defineProps({
	menuList: Object,
	isCopy: Boolean
});

const Route = useRoute();
const dataStore = useDataStore();
const menuStore = useMenuStore();

const emit = defineEmits(['changeVisible']);
const menuListSelf = ref<any[]>([]);
const { t } = useI18n();

const copyed = ref(false);

const $q = useQuasar();

const itemMenuList = ref([
	{
		name: 'Open Local Sync Folder',
		icon: 'sym_r_folder_open',
		type: 'seahub',
		action: OPERATE_ACTION.OPEN_LOCAL_SYNC_FOLDER
	},
	{
		name: 'Download',
		icon: 'sym_r_browser_updated',
		action: OPERATE_ACTION.DOWNLOAD
	},
	{
		name: 'Copy',
		icon: 'sym_r_content_copy',
		action: OPERATE_ACTION.COPY
	},
	{
		name: 'Rename',
		icon: 'bi-pencil-square',
		action: OPERATE_ACTION.RENAME
	},
	{
		name: 'Delete',
		icon: 'sym_r_delete',
		action: OPERATE_ACTION.DELETE
	},
	{
		name: 'Attributes',
		icon: 'sym_r_error',
		action: OPERATE_ACTION.ATTRIBUTES
	}
]);
const disableRename = ref(menuStore.disableMenuItem);

watch(
	() => props.menuList,
	() => {
		console.log('props.menuList ===>');
		console.log(props.menuList);
		reloadMenus();
	},
	{
		deep: true
	}
);

const reloadMenus = () => {
	let result: any = [];
	if (props.isCopy) {
		const hasCopy = dataStore.copyFiles && dataStore.copyFiles.length;
		copyed.value = hasCopy;
		if (copyed.value) {
			result = [
				{
					name: 'Paste',
					icon: 'sym_r_content_copy',
					action: OPERATE_ACTION.PASTE
				},
				{
					name: 'Cancel',
					icon: 'sym_r_cancel',
					action: OPERATE_ACTION.CANCEL
				}
			];
		}
	} else if (props.menuList) {
		dataStore.resetSelectedByValue(props.menuList);
		result = itemMenuList.value;
	}

	// const hasCopy = dataStore.copyFiles && dataStore.copyFiles.length;
	const items: any = [];
	for (let index = 0; index < result.length; index++) {
		const item = result[index];
		if (showDisabled(item)) {
			items.push(item);
		}
	}
	console.log('items ++++');
	console.log(items);

	menuListSelf.value = items;
};

const showDisabled = (item: any) => {
	if (
		(item.action === OPERATE_ACTION.RENAME ||
			item.action === OPERATE_ACTION.ATTRIBUTES) &&
		props.menuList &&
		props.menuList.length > 1
	) {
		return false;
	}

	if (item.type === 'seahub') {
		const repo_id = Route.query.id;
		if (repo_id) {
			const status = menuStore.syncReposLastStatusMap[repo_id]
				? menuStore.syncReposLastStatusMap[repo_id].status
				: 0;

			let statusFalg =
				status > SYNC_STATE.DISABLE && status != SYNC_STATE.UNKNOWN;
			if (dataStore.selectedCount === 1 && statusFalg) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	if (
		item.action === OPERATE_ACTION.RENAME &&
		dataStore.req.items[dataStore.selected[0]] &&
		disableRename.value.includes(
			dataStore.req.items[dataStore.selected[0]].name
		)
	) {
		return false;
	}

	if (
		item.action === OPERATE_ACTION.RENAME ||
		item.action === OPERATE_ACTION.DELETE
	) {
		for (let index = 0; index < dataStore.selected.length; index++) {
			const element = dataStore.selected[index];
			const item = dataStore.req.items[element];
			if (disableRename.value.includes(item.name)) {
				return false;
			}
		}
	}

	if (item.action === OPERATE_ACTION.PASTE && !copyed.value) {
		return false;
	}

	return true;
};

const hideMenu = () => {
	emit('changeVisible');
};

const handle = (e: any, item: any) => {
	if (item.action == OPERATE_ACTION.CANCEL) {
		copyed.value = false;
		dataStore.resetCopyFiles();
		return;
	}
	handleFileOperate(
		e,
		Route,
		item.action,
		async (action: OPERATE_ACTION, data: any) => {
			console.log('cation ===>', action);

			if (action === OPERATE_ACTION.DOWNLOAD) {
				const isElectron = $q.platform.is.electron;

				if (!isElectron && data) {
					// window.open(data);
					await downloadFile(data);
					return;
				}

				if (isElectron && data && data.url && data.url.length > 0) {
					const savePath = await window.electron.api.download.getDownloadPath();
					console.log(savePath);

					const formData: INewDownloadFile = {
						url: data.url,
						fileName: dataStore.req.items[dataStore.selected[0]].isDir
							? dataStore.req.items[dataStore.selected[0]].name + '.zip'
							: dataStore.req.items[dataStore.selected[0]].name,
						path: savePath,
						totalBytes: dataStore.req.items[dataStore.selected[0]].size
					};
					console.log(formData);

					await window.electron.api.download.newDownloadFile(formData);
				}
				return;
			} else if (action == OPERATE_ACTION.COPY) {
				// copyed.value = true;
				notifySuccess(t('copy_success'));
				dataStore.resetMutilSelected();
			} else if (action == OPERATE_ACTION.PASTE) {
				copyed.value = false;
				dataStore.resetMutilSelected();
				dataStore.resetCopyFiles();
			} else if (action == OPERATE_ACTION.OPEN_LOCAL_SYNC_FOLDER) {
				const repo_id = Route.query.id as string;
				const isElectron = $q.platform.is.electron;
				if (isElectron) {
					window.electron.api.files.openLocalRepo(repo_id, data);
				}
			}
		}
	);
	hideMenu();
};
reloadMenus();

const contentStyle = ref({
	height: 0
});
</script>

<style scoped lang="scss">
.bottom-menu-list {
	width: 100%;
	height: 100%;
	// background-color: red;
	.menu-item {
		// width: 100%;
		min-width: 120px;
		border-radius: 5px;
		// background-color: green;
		min-height: 36px !important;
		padding-left: 8px !important;
		padding-right: 2px !important;
		padding-top: 2px !important;
		padding-bottom: 2px !important;

		&:hover {
			background-color: $background-hover;
		}
	}
}
</style>
