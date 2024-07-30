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
import { ref, onMounted } from 'vue';
import { useFilesStore } from '../../stores/files';
import FilesHeader from './common-files/FilesHeader.vue';
import FilesFooter from './common-files/FilesFooter.vue';
import ListingFiles from './common-files/ListingFiles.vue';
import Errors from './Errors.vue';
import UploadModal from '../../components/files/UploadModal.vue';

import { DriveType } from './../../stores/files';
import { dataAPIs } from './../../api';

const error = ref<any>(null);
const filesStore = useFilesStore();
const dataAPI = dataAPIs(DriveType.Cache);

onMounted(async () => {
	filesStore.currentFileList = await (await dataAPI.fetch('/AppData')).items;
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
