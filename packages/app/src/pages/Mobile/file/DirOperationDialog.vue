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
				<div class="dir-operation-title-module row justify-start items-center">
					<terminus-file-icon
						class="q-mr-md"
						:name="nameRef"
						:type="typeRef"
						:isDir="isDir"
						:read-only="readOnlyRef"
						style="width: 30px; height: 30px"
					/>
					<div class="column justify-center" style="width: calc(100% - 50px)">
						<div class="title text-subtitle2">{{ nameRef }}</div>
						<div class="detail text-body3">{{ modifiedRef }}</div>
					</div>
				</div>
			</template>
			<template v-slot:content>
				<q-list style="margin: 8px">
					<file-operation-item
						v-if="copied"
						icon="sym_r_content_paste"
						:label="t('paste')"
						:action="OPERATE_ACTION.PASTE"
						@on-item-click="onItemClick"
					/>
					<file-operation-item
						v-if="isSeahub && isRepo"
						icon="sym_r_add_notes"
						:label="t('files.new_library')"
						:action="OPERATE_ACTION.CREATE_REPO"
						@on-item-click="onItemClick"
					/>
					<file-operation-item
						v-if="!isRepo"
						icon="sym_r_format_list_bulleted_add"
						:label="t('prompts.newDir')"
						:action="OPERATE_ACTION.CREATE_FOLDER"
						@on-item-click="onItemClick"
					/>
					<file-operation-item
						icon="bi-arrow-clockwise"
						:label="t('files.refresh')"
						:action="OPERATE_ACTION.REFRESH"
						@on-item-click="onItemClick"
					/>
				</q-list>
			</template>
		</terminus-dialog-display-content>
	</q-dialog>
</template>

<script setup lang="ts">
import { useDataStore } from '../../../stores/data';
import TerminusDialogDisplayContent from '../../../components/common/TerminusDialogDisplayContent.vue';
import FileOperationItem from '../../../components/files/files/FileOperationItem.vue';
import { OPERATE_ACTION } from '../../../utils/contact';
import TerminusFileIcon from '../../../components/common/TerminusFileIcon.vue';
import { useDialogPluginComponent } from 'quasar';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { checkSeahub, formatFileModified } from '../../../utils/file';
import { useSeahubStore } from '../../../stores/seahub';
import { useI18n } from 'vue-i18n';

const { dialogRef } = useDialogPluginComponent();
const dataStore = useDataStore();
const copied = ref(false);
const router = useRouter();
const nameRef = ref();
const modifiedRef = ref();
const typeRef = ref();
const isDir = ref(true);
const readOnlyRef = ref();
const isSeahub = ref();
const isRepo = ref();
const seahubStore = useSeahubStore();
const { t } = useI18n();

const onShow = () => {
	nameRef.value = dataStore.req.name;
	modifiedRef.value = formatFileModified(dataStore.req.modified);
	typeRef.value = dataStore.req.type;
	isDir.value = dataStore.req.isDir;
	readOnlyRef.value = dataStore.req.readOnly;
	isSeahub.value = checkSeahub(dataStore.req.url);
	if (isSeahub.value) {
		isRepo.value = !seahubStore.repo_id;
	} else {
		isRepo.value = false;
	}

	const hasCopy = dataStore.copyFiles && dataStore.copyFiles.length;

	if (
		hasCopy &&
		((!isRepo.value && isSeahub.value && dataStore.copyFrom == 'Sync') ||
			(!isSeahub.value && dataStore.copyFrom == 'Drive'))
	) {
		copied.value = true;
	}
};

const onItemClick = async (action: any, data: any) => {
	if (OPERATE_ACTION.PASTE) {
		if (data) {
			router.push({ path: data });
		}
	}
};
</script>

<style lang="scss" scoped>
.dir-operation-title-module {
	width: 100%;
	height: 100%;

	.title {
		color: $ink-1;
	}

	.detail {
		text-align: left;
		color: $ink-3;
		max-width: 100%;
		width: 100%;

		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}
}
</style>
