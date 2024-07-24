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
						type="folder"
						:isDir="true"
						style="width: 30px; height: 30px"
					/>
					<div class="column justify-center" style="width: calc(100% - 50px)">
						<div class="title text-subtitle2">
							{{ nameRef }}
						</div>
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
						v-if="driveType === DriveType.Sync"
						icon="sym_r_add_notes"
						:label="t('files.new_library')"
						:action="OPERATE_ACTION.CREATE_REPO"
						@on-item-click="onItemClick"
					/>
					<file-operation-item
						v-if="driveType !== DriveType.Sync"
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
import TerminusDialogDisplayContent from '../../../components/common/TerminusDialogDisplayContent.vue';
import FileOperationItem from '../../../components/files/files/FileOperationItem.vue';
import { OPERATE_ACTION } from '../../../utils/contact';
import TerminusFileIcon from '../../../components/common/TerminusFileIcon.vue';
import { useDialogPluginComponent } from 'quasar';
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { formatFileModified } from '../../../utils/file';
import { useI18n } from 'vue-i18n';
import { DriveType } from './../../../stores/files';
import { useOperateinStore } from './../../../stores/operation';
import { formatUrltoDriveType } from './../../../api/common/common';

const { dialogRef } = useDialogPluginComponent();
const copied = ref(false);
const router = useRouter();
const route = useRoute();
const nameRef = ref();
const modifiedRef = ref();
const typeRef = ref();
const isDir = ref(true);
const driveType = ref();
const { t } = useI18n();
const operateinStore = useOperateinStore();

const onShow = async () => {
	nameRef.value = route.query.name;
	modifiedRef.value = formatFileModified(Number(route.query.modified));

	driveType.value = await formatUrltoDriveType(route.fullPath);

	if (operateinStore.copyFiles && operateinStore.copyFiles.length > 0) {
		copied.value = true;
	} else {
		copied.value = false;
	}
};

const onItemClick = async (action: any, data: any) => {
	console.log(action, data);
};
</script>

<style lang="scss" scoped>
.dir-operation-title-module {
	width: 100%;
	height: 100%;

	.title {
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
