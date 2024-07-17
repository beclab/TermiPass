<template>
	<q-dialog
		position="bottom"
		ref="dialogRef"
		@show="onShow"
		transition-show="jump-up"
		transition-hide="jump-down"
		transition-duration="300"
	>
		<terminus-dialog-display-content :dialog-ref="dialogRef">
			<template v-slot:title>
				<div class="operate-dialog-title-module row justify-start items-center">
					<terminus-file-icon
						class="q-mr-md"
						:name="name"
						:type="type"
						:is-dir="isDir"
						style="width: 30px; height: 30px"
					/>
					<div class="column justify-center" style="width: calc(100% - 50px)">
						<div class="text-subtitle2 title">{{ name }}</div>
						<div class="text-body3 detail">
							{{ formatFileModified(modified) }}
						</div>
					</div>
				</div>
			</template>
			<template v-slot:content>
				<q-list style="margin: 8px">
					<file-operation-item
						v-if="driveType === DriveType.Drive"
						icon="sym_r_move_up"
						:label="t('files.cut')"
						:action="OPERATE_ACTION.CUT"
						@on-item-click="onItemClick"
					/>
					<file-operation-item
						v-if="driveType === DriveType.Drive"
						icon="sym_r_content_copy"
						:label="t('copy')"
						:action="OPERATE_ACTION.COPY"
						@on-item-click="onItemClick"
					/>
					<file-operation-item
						v-if="driveType === DriveType.Drive && !$q.platform.is.mobile"
						icon="sym_r_browser_updated"
						:label="t('download')"
						:action="OPERATE_ACTION.DOWNLOAD"
						@on-item-click="onItemClick"
					/>
					<file-operation-item
						v-if="driveType === DriveType.Sync"
						icon="sym_r_share_windows"
						:label="t('buttons.share')"
						:action="OPERATE_ACTION.SHARE"
					/>
					<file-operation-item
						icon="sym_r_delete"
						:label="t('delete')"
						:action="OPERATE_ACTION.DELETE"
					/>
					<file-operation-item
						icon="sym_r_edit_square"
						:label="t('buttons.rename')"
						:action="OPERATE_ACTION.RENAME"
					/>
					<file-operation-item
						icon="sym_r_contract"
						:label="t('files.attributes')"
						:action="OPERATE_ACTION.ATTRIBUTES"
					/>
				</q-list>
			</template>
		</terminus-dialog-display-content>
	</q-dialog>
</template>

<script setup lang="ts">
import { useDataStore } from '../../../stores/data';
import { useMenuStore } from '../../../stores/files-menu';

import TerminusDialogDisplayContent from '../../../components/common/TerminusDialogDisplayContent.vue';
import FileOperationItem from '../../../components/files/files/FileOperationItem.vue';
import { stopScrollMove } from '../../../utils/utils';
import TerminusFileIcon from '../../../components/common/TerminusFileIcon.vue';
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { ref, PropType } from 'vue';
import { useRouter } from 'vue-router';
import { INewDownloadFile } from '../../../platform/electron/interface';
import { formatFileModified } from '../../../utils/file';
import { notifySuccess } from '../../../utils/notifyRedefinedUtil';
import { OPERATE_ACTION } from '../../../utils/contact';
import { useI18n } from 'vue-i18n';
import { DriveType, useFilesStore } from './../../../stores/files';

const { dialogRef } = useDialogPluginComponent();

const props = defineProps({
	driveType: {
		type: String as PropType<DriveType>,
		default: '',
		required: true
	},
	name: {
		type: String,
		default: '',
		required: true
	},
	modified: {
		type: String,
		default: '',
		required: true
	},
	type: {
		type: String,
		default: '',
		required: true
	},
	index: {
		type: Number,
		default: -1,
		required: true
	},
	isDir: {
		type: Boolean,
		required: false,
		default: false
	}
});

const { t } = useI18n();

const dataStore = useDataStore();
const menuStore = useMenuStore();
const filesStore = useFilesStore();
const $q = useQuasar();
const copied = ref(false);
const router = useRouter();

const onShow = () => {
	const index = filesStore.currentFileList.findIndex(
		(item) => item.index === props.index
	);
	if (index !== -1) {
		menuStore.shareRepoInfo = filesStore.currentFileList[index];
		stopScrollMove();
		filesStore.resetSelected();
		filesStore.addSelected(index);
	}
};

const onItemClick = async (action, data) => {
	if (action === OPERATE_ACTION.DOWNLOAD) {
		const isElectron = $q.platform.is.electron;

		if (!isElectron && data) {
			window.open(data);
			return '';
		}

		if (isElectron && data && data.length > 0) {
			const savePath = await window.electron.api.download.getDownloadPath();
			const formData: INewDownloadFile = {
				url: data,
				fileName: filesStore.currentFileList[filesStore.selected[0]].name,
				path: savePath,
				totalBytes: filesStore.currentFileList[filesStore.selected[0]].size
			};
			await window.electron.api.download.newDownloadFile(formData);
		}
		return;
	} else if (action === OPERATE_ACTION.COPY) {
		copied.value = true;
		notifySuccess(t('files.copied_to_clipboard'));
	} else if (action === OPERATE_ACTION.CUT) {
		copied.value = true;
		notifySuccess(t('files.cut_to_clipboard'));
	} else if (action === OPERATE_ACTION.PASTE) {
		copied.value = false;
	}
};
</script>

<style lang="scss" scoped>
.operate-dialog-title-module {
	width: 100%;
	height: 100%;

	.title {
		text-align: left;
		color: $title;
	}

	.detail {
		text-align: left;
		color: $sub-title;
		max-width: 100%;
		width: 100%;

		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}
}
</style>
