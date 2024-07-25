<template>
	<div class="container">
		<header>
			<files-header />
		</header>

		<main>
			<errors v-if="error" :errorCode="error.status" />
			<listing-files v-else />
		</main>

		<footer>
			<files-footer />
		</footer>

		<upload-Modal />
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useDataStore } from '../../stores/data';
import { useFilesStore } from '../../stores/files';
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router';
import { UserStatusActive } from '../../utils/checkTerminusState';
import { useTermipassStore } from '../../stores/termipass';
import FilesHeader from './common-files/FilesHeader.vue';
import FilesFooter from './common-files/FilesFooter.vue';
import ListingFiles from './common-files/ListingFiles.vue';
import Errors from './Errors.vue';
import UploadModal from '../../components/files/UploadModal.vue';

import { DriveType } from './../../stores/files';
import { useMenuStore } from './../../stores/files-menu';
import { common } from './../../api';
import { formatUrltoActiveMenu } from './../../api/common/common';

const store = useDataStore();
const route = useRoute();
const router = useRouter();
const error = ref<any>(null);
const $q = useQuasar();
const termipassStore = useTermipassStore();
const filesStore = useFilesStore();
const menuStore = useMenuStore();

// import dataAPI from './../../api/data';

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
		setTimeout(async () => {
			// fetchData();
			let url = route.fullPath;
			if (url.indexOf('Files') < 0) return;
			const splitUrl = url.split('?');
			await filesStore.setFilePath(
				{
					path: splitUrl[0],
					isDir: true,
					driveType: DriveType.Drive,
					param: splitUrl[1] ? `?${splitUrl[1]}` : ''
				},
				false,
				false
			);
		}, 2000);
	}
	return true;
};

const keyEvent = (event: any) => {
	if (event.keyCode === 112) {
		event.preventDefault();
		store.showHover('help');
	}
};

const isPreview = ref(false);

onBeforeRouteUpdate((_to, from, next) => {
	if (from.query.type === 'preview') {
		isPreview.value = true;
	} else {
		isPreview.value = false;
	}
	next();
});

onMounted(async () => {
	let url = route.fullPath;
	menuStore.activeMenu = await formatUrltoActiveMenu(url);
	const driveType = await common.formatUrltoDriveType(url);

	filesStore.setBrowserUrl(url, driveType, true);

	window.addEventListener('keydown', keyEvent);
});

onUnmounted(() => {
	window.removeEventListener('keydown', keyEvent);
	if (store.showShell) {
		store.toggleShell();
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
	display: flex;
	flex-direction: column;

	header,
	footer {
		flex: 0 0 auto;
	}

	main {
		flex: 1 1 auto;
		overflow-y: auto;
	}
}
</style>
