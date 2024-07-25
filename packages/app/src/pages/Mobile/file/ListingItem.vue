<template>
	<div
		class="mobile-item"
		role="button"
		tabindex="0"
		:draggable="isDraggable"
		@dragstart="dragStart"
		@dragover="dragOver"
		@drop="drop"
		@click="itemClick"
		:aria-label="item.name"
		:aria-selected="isSelected"
	>
		<terminus-file-icon
			:name="item.name"
			:type="item.type"
			:path="item.path"
			:modified="item.modified"
			:is-dir="item.isDir"
		/>

		<q-icon
			v-if="viewMode === 'mosaic'"
			name="sym_r_more_horiz"
			size="20px"
			@click.stop="fileOperation"
			style="
				position: absolute;
				right: 0px;
				top: 0px;
				cursor: pointer;
				border-radius: 12px;
			"
		>
		</q-icon>

		<div v-if="viewMode === 'mosaic'" style="margin-top: 0.3rem">
			<span class="name text-color-title">{{ item.name }}</span>
			<div class="modified text-color-sub-title">
				{{
					formatFileModified(item.modified, 'YYYY-MM-DD') + ' · ' + humanSize()
				}}
			</div>
		</div>
		<div v-else style="width: 100%" class="q-pl-md">
			<div style="width: 100%" class="row items-center justify-between">
				<div class="column justify-center" style="width: calc(100% - 32px)">
					<div class="name text-color-title">{{ item.name }}</div>
					<div class="modified text-color-sub-title" style="max-width: 100%">
						{{ formatFileModified(item.modified) + ' · ' + humanSize() }}
					</div>
				</div>
				<div
					class="column justify-center items-center"
					style="height: 32px; width: 32px"
					@click.stop="fileOperation"
				>
					<q-icon name="sym_r_more_horiz" size="20px" class="grey-8"> </q-icon>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, PropType } from 'vue';
import { useDataStore } from '../../../stores/data';
import { format, useQuasar } from 'quasar';
const { humanStorageSize } = format;
import { useRoute } from 'vue-router';
// import { fetchURL } from '../../../api/utils';
// import { useSeahubStore } from '../../../stores/seahub';
import TerminusFileIcon from '../../../components/common/TerminusFileIcon.vue';
import FileOperationDialog from './FileOperationDialog.vue';
import { formatFileModified } from '../../../utils/file';
import { useFilesStore, FileItem, DriveType } from './../../../stores/files';
import { useMenuStore } from './../../../stores/files-menu';
import { useOperateinStore } from '../../../stores/operation';
import { OPERATE_ACTION } from '../../../utils/contact';
import { formatUrltoDriveType } from './../../../api/common/common';

import FilePreviewPage from './FilePreviewPage.vue';
import { getParams } from '../../../utils/utils';

const props = defineProps({
	item: {
		type: Object as PropType<FileItem>,
		required: true
	},
	viewMode: {
		type: String,
		required: true
	}
});
const store = useDataStore();
const filesStore = useFilesStore();
const menuStore = useMenuStore();
const route = useRoute();
const operateinStore = useOperateinStore();

// const seahubStore = useSeahubStore();

const isSelected = computed(function () {
	return filesStore.selected.indexOf(props.item.index) !== -1;
});

const isDraggable = computed(function () {
	return store.user?.perm?.rename;
});

const canDrop = computed(function () {
	if (!props.item.isDir) return false;

	for (let i of filesStore.selected) {
		if (filesStore.currentFileList[i].url === props.item.url) {
			return false;
		}
	}

	return true;
});

const humanSize = () => {
	return props.item.type == 'invalid_link'
		? 'invalid link'
		: humanStorageSize(props.item.size);
};

const dragStart = () => {
	if (filesStore.selectedCount === 0) {
		filesStore.addSelected(props.item.index);
		return;
	}

	if (!isSelected.value) {
		filesStore.resetSelected();
		filesStore.addSelected(props.item.index);
	}
};

const dragOver = (event: any) => {
	if (!canDrop.value) return;

	event.preventDefault();
	let el = event.target;

	for (let i = 0; i < 5; i++) {
		if (!el.classList.contains('item')) {
			el = el.parentElement;
		}
	}

	el.style.opacity = 1;
};

const drop = async (event: any) => {
	let canMove = true;
	for (const item of filesStore.selected) {
		if (
			operateinStore.disableMenuItem.includes(
				filesStore.currentFileList[item].name
			)
		) {
			canMove = false;
			break;
		}
	}

	if (!canMove) return false;

	if (!canDrop.value) return;
	event.preventDefault();

	if (filesStore.selectedCount === 0) return;

	operateinStore.handleFileOperate(
		event,
		{
			...route,
			path: props.item.path
		},
		OPERATE_ACTION.MOVE,
		props.item.driveType,
		async (action: OPERATE_ACTION, data: any) => {
			const url = route.fullPath;

			const splitUrl = url.split('?');
			await filesStore.setFilePath(
				{
					path: splitUrl[0],
					isDir: true,
					driveType: menuStore.activeMenu.driveType,
					param: splitUrl[1] ? `?${splitUrl[1]}` : ''
				},
				false,
				false
			);
		}
	);
};

const itemClick = () => {
	open();
};

// const fetchFileContent = async (file: any) => {
// 	const currentItemLength = store.currentItem.length;
// 	const startIndex = file.path.indexOf(store.currentItem) + currentItemLength;
// 	const hasSeahub = file.path.slice(startIndex);
// 	const res = await fetchURL(
// 		`/seahub/lib/${seahubStore.repo_id}/file${hasSeahub}?dict=1`,
// 		{}
// 	);
// 	return res;
// };

const $q = useQuasar();

const fileOperation = () => {
	filesStore.addSelected(props.item.index);
	$q.dialog({
		component: FileOperationDialog,
		componentProps: {
			index: props.item.index,
			name: props.item.name,
			modified: props.item.modified,
			type: props.item.type,
			isDir: props.item.isDir,
			driveType: props.item.driveType
		}
	});
};

const open = async () => {
	filesStore.addSelected(props.item.index);

	const splitUrl = props.item.path.split('?');
	const driveType = await formatUrltoDriveType(props.item.path);

	if (driveType === DriveType.Sync) {
		const repo_id = getParams(splitUrl[1], 'id');
		if (repo_id) {
			menuStore.activeMenu = {
				driveType: driveType,
				label: props.item.name,
				id: repo_id
			};
		}
	} else if (driveType === DriveType.Drive) {
		menuStore.activeMenu = {
			driveType: driveType,
			label: props.item.name,
			id: props.item.name
		};
	}

	if (!props.item.isDir) {
		if (store.preview.isShow) {
			return;
		}

		$q.dialog({
			component: FilePreviewPage
		});
	}
	await filesStore.setFilePath(
		{
			path: splitUrl[0],
			isDir: props.item.isDir,
			driveType: props.item.driveType,
			param: splitUrl[1] ? `?${splitUrl[1]}` : ''
		},
		false
	);

	filesStore.resetSelected();
};
</script>
