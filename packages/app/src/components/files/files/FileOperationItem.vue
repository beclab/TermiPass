<template>
	<q-item
		clickable
		v-close-popup
		class="file-operation-item q-pb-md"
		@click="handle($event, action!)"
	>
		<div class="file-operation-div row justify-start items-center text-ink-1">
			<q-icon :name="icon" size="20px" />
			<div class="file-operation-text text-body3">{{ label }}</div>
		</div>
	</q-item>
</template>

<script lang="ts" setup>
import { useOperateinStore } from './../../../stores/operation';
import { useQuasar } from 'quasar';
import { PropType } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { OPERATE_ACTION } from '../../../utils/contact';
import { getParams } from '../../../utils/utils';
import { useFilesStore } from '../../../stores/files';
import { useMenuStore } from '../../../stores/files-menu';
import DeleteRepo from './../popup/DeleteRepo.vue';
import ReName from './../popup/ReName.vue';

const props = defineProps({
	icon: String,
	label: String,
	action: Object as PropType<OPERATE_ACTION>
});

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const operateinStore = useOperateinStore();
const filesStore = useFilesStore();
const menuStore = useMenuStore();

const emit = defineEmits(['onItemClick', 'hideMenu']);

const handle = (e: any, action: OPERATE_ACTION) => {
	console.log('handlehandle', action);
	console.log('handlehandle e', e);

	if (action === OPERATE_ACTION.REPO_DELETE) {
		return deleteRepo();
	}

	if (action === OPERATE_ACTION.REPO_RENAME) {
		return renameRepo();
	}

	// if (props.repo) {
	// 	handleRepoOperate(e, action);
	// } else {
	emit('hideMenu');
	operateinStore.handleFileOperate(
		e,
		route,
		action,
		menuStore.activeMenu.driveType,
		async (action: OPERATE_ACTION, data: any) => {
			emit('onItemClick', action, data);

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

			if (action == OPERATE_ACTION.PASTE) {
				operateinStore.resetCopyFiles();
			} else if (action == OPERATE_ACTION.OPEN_LOCAL_SYNC_FOLDER) {
				const repo_id = route.query.id as string;
				const isElectron = $q.platform.is.electron;
				if (isElectron) {
					window.electron.api.files.openLocalRepo(repo_id, data);
				}
			}
		}
	);
	// }
};

const deleteRepo = async () => {
	const foucsItem = filesStore.currentFileList[filesStore.selected[0]];
	const repo_id = getParams(foucsItem.path, 'id');
	const res = await menuStore.fetchShareInfo(repo_id);

	const shared_user_emails_length = res.shared_user_emails.length || 0;

	$q.dialog({
		component: DeleteRepo,
		componentProps: {
			item: { repo_id, ...foucsItem },
			shared_length: shared_user_emails_length
		}
	});
};

const renameRepo = async () => {
	const foucsItem = filesStore.currentFileList[filesStore.selected[0]];
	const repo_id = getParams(foucsItem.path, 'id');

	$q.dialog({
		component: ReName,
		componentProps: {
			item: { repo_id, ...foucsItem }
		}
	});
};
</script>

<style scoped lang="scss">
.file-operation-item {
	// width: 135px;
	height: 36px;
	margin: 0;
	padding: 0;
	border-radius: 8px;

	.file-operation-div {
		width: 100%;
		height: 100%;
		padding: 8px;

		.file-operation-text {
			margin-left: 8px;
		}
	}
}
</style>
