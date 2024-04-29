<template>
	<div class="container">
		<errors v-if="error" :errorCode="error.status" />
		<component v-else :is="currentView"></component>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, watch } from 'vue';
import { files as api, seahub } from '../../api';
import HeaderBar from '../../components/files/header/HeaderBar.vue';
import Breadcrumbs from '../../components/files/Breadcrumbs.vue';
import Errors from './Errors.vue';
import FileEditor from './common-files/FileEditor.vue';
import ListingFiles from './common-files/ListingFiles.vue';
import { useDataStore } from '../../stores/data';
import { useRoute, onBeforeRouteUpdate } from 'vue-router';
// import { useUserStore } from '../../stores/user';
// import { useSeahubStore } from '../../stores/seahub';

import { UserStatusActive } from '../../utils/checkTerminusState';
import { checkSeahub } from '../../utils/file';
import {
	InOfflineMode,
	InOfflineModeCode
} from '../../utils/checkTerminusState';
import FilePreViewDialog from './preview/FilePreViewDialog.vue';
import { useQuasar } from 'quasar';
import { useTermipassStore } from '../../stores/termipass';

export default defineComponent({
	name: 'FilesPage',
	components: {
		HeaderBar,
		Breadcrumbs,
		Errors,
		ListingFiles,
		FileEditor
	},
	setup() {
		const store = useDataStore();
		const route = useRoute();
		const error = ref<any>(null);
		const $q = useQuasar();
		const routepath = ref(route.path);
		const termipassStore = useTermipassStore();

		watch(
			() => termipassStore.totalStatus?.isError,
			(newVal) => {
				checkUserStatus(newVal);
			}
		);

		const checkUserStatus = (status: any) => {
			if (status === UserStatusActive.error) {
				error.value = status;
				return false;
			}
			if (error.value != null || error.value != undefined) {
				setTimeout(() => {
					fetchData();
				}, 2000);
			}
			return true;
		};

		const fetchData = async (loading = true) => {
			if (!checkUserStatus(termipassStore.totalStatus?.isError)) {
				return false;
			}

			if (route.path !== routepath.value) {
				routepath.value = route.path;
				const isPre = route.query.type === 'preview';
				if (loading && !isPre) {
					store.req.items = null;
				}
			}

			store.setReload(false);
			store.setMultiple(false);
			store.setLoading(true);
			store.resetSelected();
			store.closeHovers();

			error.value = null;
			let url = decodeURIComponent(route.path);
			if (url === '') url = '/';
			if (url[0] !== '/') url = '/' + url;
			const currentItem = store.currentItem;

			if (checkSeahub(url)) {
				let pathname = decodeURIComponent(window.location.pathname).split('/');
				let hasRepoIndex = pathname.findIndex((item) => item === currentItem);
				if (!pathname[hasRepoIndex + 1]) {
					await seahub.getRepoId(route.query.id);
				}
			}

			try {
				const res = await api.fetch(url, loading, currentItem);
				if (res.type == 'video') {
					store.updateRequest(res);
				} else {
					store.updateRequest(res);
					document.title = `${res.name} - TermiPass`;
				}
			} catch (e: any) {
				if (e.message == InOfflineMode) {
					if (!e.status) {
						e.status = InOfflineModeCode;
					}
				}
				error.value = e;
			} finally {
				store.setLoading(false);
			}
		};

		const keyEvent = (event: any) => {
			if (event.keyCode === 112) {
				event.preventDefault();
				store.showHover('help');
			}
		};

		const currentView = ref('ListingFiles');

		watch(
			() => store.req,
			(newVal) => {
				if (!newVal.isDir) {
					isPreview.value = true;
					if (store.preview.isShow) {
						return;
					}
					$q.dialog({
						component: FilePreViewDialog
					});
				}
			}
		);

		const isPreview = ref(false);

		watch(
			() => route.path,
			(newVal) => {
				if (!isPreview.value && newVal.indexOf('Files/') > -1) {
					fetchData();
				}
			}
		);

		watch(
			() => store.preview.isShow,
			(newVal) => {
				if (!newVal) {
					fetchData(false);
				}
			}
		);

		watch(
			() => store.reload,
			(value) => {
				if (value === true) {
					fetchData(false);
				}
			}
		);

		onBeforeRouteUpdate((_to, from, next) => {
			if (from.query.type === 'preview') {
				isPreview.value = true;
			} else {
				isPreview.value = false;
			}
			next();
		});

		onMounted(() => {
			let url = route.path;
			if (url.indexOf('Files') < 0) return;
			fetchData();

			window.addEventListener('keydown', keyEvent);
		});

		onUnmounted(() => {
			window.removeEventListener('keydown', keyEvent);
			if (store.showShell) {
				store.toggleShell();
			}
		});

		return {
			store,
			currentView,
			error,
			width: window.innerWidth
		};
	}
});
</script>

<style lang="scss" scoped>
.container {
	width: 100%;
	height: 100%;
	position: absolute;
	left: 0;
	top: 0;
}
</style>
