<template>
	<q-list
		class="menu-list text-ink-2 bg-background-2"
		v-if="visible"
		:style="{ top: top + 'px', left: left + 'px' }"
	>
		<template v-for="(item, index) in menuListSelf" :key="index">
			<div
				class="menu-item text-body2 row items-center justify-start"
				v-if="showDisabled(item)"
				@click="handle($event, item)"
			>
				<q-icon rounded :name="item.icon" size="1.2em"></q-icon>
				<span class="q-ml-sm">
					{{ item.name }}
				</span>
			</div>
		</template>
	</q-list>
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

const props = defineProps({
	clientX: Number,
	clientY: Number,
	offsetRight: Number,
	offsetBottom: Number,
	menuVisible: Boolean,
	menuList: Object
});

const Route = useRoute();
const dataStore = useDataStore();
const menuStore = useMenuStore();

const emit = defineEmits(['changeVisible']);
const menuListSelf = ref<any[]>([]);

const copyed = ref(false);

const visible = ref(false);
const top = ref<number>(props.clientY!);
const left = ref<number>(props.clientX!);

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
		icon: 'bi-download',
		action: OPERATE_ACTION.DOWNLOAD
	},
	{
		name: 'Copy',
		icon: 'bi-stickies',
		action: OPERATE_ACTION.COPY
	},
	{
		name: 'Rename',
		icon: 'bi-pencil-square',
		action: OPERATE_ACTION.RENAME
	},
	{
		name: 'Delete',
		icon: 'bi-trash3',
		action: OPERATE_ACTION.DELETE
	},
	{
		name: 'Attributes',
		icon: 'bi-exclamation-circle',
		action: OPERATE_ACTION.ATTRIBUTES
	}
]);

const hasPasteMenu = [
	{
		name: 'New Folder',
		icon: 'bi-folder-plus',
		action: OPERATE_ACTION.CREATE_FOLDER
	},
	{
		name: 'Upload Files',
		icon: 'bi-file-earmark-arrow-up',
		action: OPERATE_ACTION.UPLOAD_FILES
	},
	{
		name: 'Upload Folder',
		icon: 'bi-folder-minus',
		action: OPERATE_ACTION.UPLOAD_FOLDER
	},
	{
		name: 'Paste',
		icon: 'bi-subtract',
		action: OPERATE_ACTION.PASTE
	},
	{
		name: 'Refresh',
		icon: 'bi-arrow-clockwise',
		action: OPERATE_ACTION.REFRESH
	}
];
const noHasPasteMenu = [
	{
		name: 'New Folder',
		icon: 'bi-folder-plus',
		action: OPERATE_ACTION.CREATE_FOLDER
	},
	{
		name: 'Upload Files',
		icon: 'bi-file-earmark-arrow-up',
		action: OPERATE_ACTION.UPLOAD_FILES
	},
	{
		name: 'Upload Folder',
		icon: 'bi-folder-minus',
		action: OPERATE_ACTION.UPLOAD_FOLDER
	},
	{
		name: 'Refresh',
		icon: 'bi-arrow-clockwise',
		action: OPERATE_ACTION.REFRESH
	}
];

const panelMenuList = ref();

const disableRename = ref(menuStore.disableMenuItem);

watch(
	() => [props.menuList, Route.query.type, Route.query.p],
	(newVal) => {
		if (newVal[0]) {
			menuListSelf.value = itemMenuList.value;
		} else {
			const hasCopy = dataStore.copyFiles && dataStore.copyFiles.length;
			let copied = false;
			if (hasCopy) {
				copied = true;
			}

			if (copied) {
				menuListSelf.value = hasPasteMenu;
				copyed.value = true;
			} else {
				menuListSelf.value = noHasPasteMenu;
				copyed.value = false;
			}

			if (newVal[1] && newVal[1] !== 'mine' && newVal[2] === 'r') {
				menuListSelf.value = [
					{
						name: 'Refresh',
						icon: 'bi-arrow-clockwise',
						action: OPERATE_ACTION.REFRESH
					}
				];
			}
		}

		const menuHeight = menuListSelf.value.length * 36;
		if (props.offsetBottom && props.offsetBottom < menuHeight) {
			top.value = props.clientY - menuHeight;
		} else {
			top.value = props.clientY || 0;
		}
	}
);

watch(
	() => dataStore.copyFiles,
	(newVaule) => {
		if (newVaule) {
			panelMenuList.value = hasPasteMenu;
		} else {
			panelMenuList.value = noHasPasteMenu;
		}
	}
);

watch(
	() => props.clientX,
	(newVaule) => {
		if (props.offsetRight && props.offsetRight < 144) {
			left.value = (newVaule as number) - 144;
		} else {
			left.value = newVaule || 0;
		}
	}
);
watch(
	() => props.clientY,
	(newVaule) => {
		const menuHeight = menuListSelf.value.length * 36 + 10;
		if (props.offsetBottom && props.offsetBottom < menuHeight) {
			top.value = (newVaule as number) - menuHeight;
		} else {
			top.value = newVaule || 0;
		}
	}
);
watch(
	() => props.menuVisible,
	(newVaule) => {
		visible.value = newVaule;
	}
);

const showDisabled = (item: any) => {
	if (item.name === 'Rename' && dataStore.selectedCount > 1) {
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
		item.name === 'Rename' &&
		dataStore.req.items[dataStore.selected[0]] &&
		disableRename.value.includes(
			dataStore.req.items[dataStore.selected[0]].name
		)
	) {
		return false;
	}

	if (
		item.name === 'Delete' &&
		dataStore.req.items[dataStore.selected[0]] &&
		disableRename.value.includes(
			dataStore.req.items[dataStore.selected[0]].name
		)
	) {
		return false;
	}

	if (item.name === 'Paste' && !copyed.value) {
		return false;
	}

	return true;
};

const hideMenu = () => {
	emit('changeVisible');
};

const handle = (e: any, item: any) => {
	handleFileOperate(
		e,
		Route,
		item.action,
		async (action: OPERATE_ACTION, data: any) => {
			if (action === OPERATE_ACTION.DOWNLOAD) {
				const isElectron = $q.platform.is.electron;

				if (!isElectron && data) {
					// window.open(data);
					await downloadFile(data);
					return '';
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
				copyed.value = true;
			} else if (action == OPERATE_ACTION.PASTE) {
				copyed.value = false;
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
</script>

<style scoped lang="scss">
.menu-list {
	border-radius: 10px;
	cursor: pointer;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 5px 8px;
	position: fixed;
	z-index: 10;
	box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.2);

	.menu-item {
		width: 100%;
		border-radius: 5px;
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
