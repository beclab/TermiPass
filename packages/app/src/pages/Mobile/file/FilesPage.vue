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
			<component v-else-if="currentView" :is="currentView" />
			<div v-else></div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useDataStore } from '../../../stores/data';
import { useSeahubStore } from '../../../stores/seahub';

import { onMounted } from 'vue';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { checkSeahub } from '../../../utils/file';
import { seahub } from '../../../api';
import Errors from '../../Files/Errors.vue';
import { watch } from 'vue';
import ListingFiles from './ListingFiles.vue';
import TerminusTitleBar from '../../../components/common/TerminusTitleBar.vue';
import DirOperationDialog from './DirOperationDialog.vue';
import { useQuasar } from 'quasar';

const store = useDataStore();
const error = ref<any>(null);
const route = useRoute();
const $router = useRouter();
const seahubStore = useSeahubStore();
const $q = useQuasar();

const title = ref('');

const rightIcon = ref('sym_r_more_horiz');

const isDark = ref(false);

const fetchData = async () => {
	if (route.query.name) {
		title.value = route.query.name as string;
	}

	if (!route.query.id) {
		seahubStore.setRepoId({ id: '', name: '' });
	}

	store.setReload(false);
	store.setMultiple(false);
	store.setLoading(true);
	store.resetSelected();
	store.closeHovers();
	error.value = null;
	let url = route.path;
	if (url === '') url = '/';
	if (url[0] !== '/') url = '/' + url;

	if (checkSeahub(url)) {
		if (route.query.id) {
			await seahub.getRepoId(route.query.id);
		}
	}

	try {
		const res = await store.fetchList(url);
		store.updateRequest(res);
		if (res.type != 'video') {
			store.req.items = store.sortList(store.req.items);
		}
	} catch (e: any) {
		error.value = e;
	} finally {
		store.setLoading(false);
	}
};

const currentView = ref();
watch(
	() => store.req,
	(newVal) => {
		isDark.value = false;

		if (newVal.type == undefined) {
			return null;
		}

		currentView.value = undefined;

		if (newVal.isDir) {
			rightIcon.value = 'sym_r_more_horiz';
			store.preview.isEditEnable = false;
			return (currentView.value = ListingFiles);
		} else {
			if (checkSeahub(route.path)) {
				$router.push({
					path: '/file_preview_view'
				});
			} else {
				$router.replace({
					path: '/file_preview_view'
				});
			}
		}
	}
);

watch(
	() => store.reload,
	(value) => {
		if (value === true) {
			fetchData();
		}
	}
);

watch(
	() => route.path,
	() => {
		if (!route.path.toLowerCase().startsWith('/files')) {
			return;
		}
		fetchData();
	}
);

const showOperation = () => {
	$q.dialog({
		component: DirOperationDialog,
		componentProps: {}
	});
};

onMounted(() => {
	fetchData();
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
