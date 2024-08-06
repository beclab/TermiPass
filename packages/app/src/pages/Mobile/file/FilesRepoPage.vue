<template>
	<div class="files-list-root">
		<terminus-title-bar :title="title" :is-dark="isDark" />
		<!-- :right-icon="rightIcon"
			@on-right-click="showOperation" -->
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

import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Errors from '../../Files/Errors.vue';
import ListingFiles from './ListingFiles.vue';
import TerminusTitleBar from '../../../components/common/TerminusTitleBar.vue';
// import DirOperationDialog from './DirOperationDialog.vue';
// import { useQuasar } from 'quasar';
import { useFilesStore } from '../../../stores/files';
import { seahub } from './../../../api';
import { MenuItem } from '../../../utils/contact';
import { formatSeahubRepos } from './../../../api/sync/filesFormat';

const store = useDataStore();
const filesStore = useFilesStore();
const error = ref<any>(null);
const route = useRoute();
// const $q = useQuasar();

const title = ref(route.query.name);

const rightIcon = ref('sym_r_more_horiz');

const isDark = ref(false);

const showOperation = () => {
	// $q.dialog({
	// 	component: DirOperationDialog,
	// 	componentProps: {}
	// });
};

onMounted(async () => {
	filesStore.currentFileList = [];
	if (route.params.repo === MenuItem.MYLIBRARIES) {
		const res = await seahub.fetchMineRepo();
		filesStore.currentFileList = await formatSeahubRepos(route.params.repo, res)
			.items;
	} else if (route.params.repo === MenuItem.SHAREDWITH) {
		const res2 = await seahub.fetchtosharedRepo();
		const res3 = await seahub.fetchsharedRepo();
		filesStore.currentFileList = await formatSeahubRepos(route.params.repo, [
			...res2,
			...res3
		]).items;
	}
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
