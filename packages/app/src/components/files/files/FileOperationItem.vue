<template>
	<q-item
		clickable
		v-close-popup
		class="file-operation-item q-pb-md"
		@click="handle($event, action!)"
	>
		<div class="file-operation-div row justify-start items-center">
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
import { useFilesStore, DriveType } from '../../../stores/files';
import { useMenuStore } from '../../../stores/files-menu';

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
			console.log('action', action);
			console.log('data', data);

			console.log('operateinStore', route);
			let url = route.fullPath;
			if (url.indexOf('Files') < 0) return;
			console.log('handleFileOperate - path', url);
			filesStore.setBrowserUrl(url, menuStore.activeMenu.driveType, router);

			if (action == OPERATE_ACTION.PASTE) {
				// operateinStore.resetCopyFiles();
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
			color: $sub-title;
			margin-left: 8px;
		}
	}
}
</style>
