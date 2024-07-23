<template>
	<div class="files-list-root">
		<terminus-title-bar
			:title="title"
			:is-dark="isDark"
			:right-icon="rightIcon"
			@on-right-click="showOperation"
		/>
		<div class="content">
			<div
				v-if="store.loading"
				style="width: 100%; height: 100%"
				class="row items-center justify-center"
			>
				<q-spinner-dots color="primary" size="3em" />
			</div>
			<errors v-else-if="error" :errorCode="error.status" />
			<listing-files v-else />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { useDataStore } from '../../../stores/data';

import { onMounted } from 'vue';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Errors from '../../Files/Errors.vue';
import ListingFiles from './ListingFiles.vue';
import TerminusTitleBar from '../../../components/common/TerminusTitleBar.vue';
import DirOperationDialog from './DirOperationDialog.vue';
import { useQuasar } from 'quasar';
import { useMenuStore } from '../../../stores/files-menu';
import { useFilesStore, DriveType } from '../../../stores/files';
import { common, seahub } from './../../../api';
import { MenuItem } from '../../../utils/contact';
import { formatSeahubRepos } from './../../../api/sync/filesFormat';

// import { DriveType } from '../../../stores/files';
// import { useFilesStore } from './../../../stores/files';

const store = useDataStore();
const menuStore = useMenuStore();
const filesStore = useFilesStore();
const error = ref<any>(null);
const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const title = ref('');

const rightIcon = ref('sym_r_more_horiz');

const isDark = ref(false);

// const onReturnAction = () => {
// 	router.go(-1);

// 	getBackFetch();
// };

// const getBackFetch = async () => {
// 	console.log('routeroute', route.fullPath);

// 	const splitUrl = route.fullPath.split('?');

// 	const driveType = await common.formatUrltoDriveType(route.fullPath);

// 	if (driveType === DriveType.Sync && route.query.name) {
// 		const menu = route.query.name;
// 		if (menu === MenuItem.MYLIBRARIES) {
// 			const res = await seahub.fetchMineRepo();
// 			console.log('resres', res);
// 			filesStore.currentFileList = await formatSeahubRepos(menu, res).items;
// 		} else if (menu === MenuItem.SHAREDWITH) {
// 			const res2 = await seahub.fetchtosharedRepo();
// 			const res3 = await seahub.fetchsharedRepo();
// 			filesStore.currentFileList = await formatSeahubRepos(menu, [
// 				...res2,
// 				...res3
// 			]).items;
// 		}
// 	} else {
// 		await filesStore.setFilePath(
// 			{
// 				path: splitUrl[0],
// 				isDir: true,
// 				driveType: driveType,
// 				param: splitUrl[1] ? `?${splitUrl[1]}` : ''
// 			},
// 			false
// 		);

// 		filesStore.resetSelected();
// 	}
// };

const showOperation = () => {
	$q.dialog({
		component: DirOperationDialog,
		componentProps: {}
	});
};

onMounted(async () => {
	console.log('routeroute', route.query);

	console.log('menumenu', menuStore.menu);

	// const fileStore = useFilesStore();
	// let url = route.fullPath;
	// console.log('onMountedurlurl', url);
	// const driveType = await common.formatUrltoDriveType(url)
	// fileStore.setBrowserUrl(url, DriveType.Drive);
});
</script>

<style lang="scss" scoped>
.files-list-root {
	width: 100%;
	height: 100%;

	.content {
		width: 100%;
		height: calc(100% - 56px);
	}
}
</style>
