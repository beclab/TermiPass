<template>
	<div class="files-list-root">
		<terminus-title-bar
			:title="filesStore.getCurrentRepo"
			:is-dark="isDark"
			:right-icon="rightIcon"
			:hook-back-action="true"
			@on-return-action="onReturnAction"
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

// import { onMounted } from 'vue';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Errors from '../../Files/Errors.vue';
import ListingFiles from './ListingFiles.vue';
import TerminusTitleBar from '../../../components/common/TerminusTitleBar.vue';
import DirOperationDialog from './DirOperationDialog.vue';
import { useQuasar } from 'quasar';
import { useMenuStore } from '../../../stores/files-menu';
import { useFilesStore } from '../../../stores/files';

// import { common, seahub } from './../../../api';
// import { MenuItem } from '../../../utils/contact';
// import { formatSeahubRepos } from './../../../api/sync/filesFormat';

// import { DriveType } from '../../../stores/files';
// import { useFilesStore } from './../../../stores/files';

const store = useDataStore();
const filesStore = useFilesStore();
const menuStore = useMenuStore();
const error = ref<any>(null);
const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const title = ref('');

const rightIcon = ref('sym_r_more_horiz');

const isDark = ref(false);

const showOperation = () => {
	$q.dialog({
		component: DirOperationDialog,
		componentProps: {}
	});
};

const onReturnAction = () => {
	router.go(-1);
	filesStore.back();
};
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
