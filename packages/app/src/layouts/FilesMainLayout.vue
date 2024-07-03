<template>
	<q-layout
		view="lHh LpR lFr"
		:container="platform == 'FILES' ? false : true"
		class="bg-background-1"
	>
		<FilesDrawer />

		<q-page-container>
			<q-page
				class="files-content"
				:class="
					$q.platform.is.win && $q.platform.is.electron
						? 'files-content-win'
						: 'files-content-common'
				"
			>
				<FilesPage />
			</q-page>
		</q-page-container>

		<prompts-component />
	</q-layout>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { bytetrade } from '@bytetrade/core';

import FilesPage from '../pages/Files/FilesPage.vue';
import PromptsComponent from '../components/files/prompts/PromptsComponent.vue';
import FilesDrawer from './TermipassLayout/FilesDrawer.vue';

const $q = useQuasar();

const platform = ref(process.env.PLATFORM);

onMounted(async () => {
	nextTick(() => {
		bytetrade.observeUrlChange.childPostMessage({
			type: 'Files'
		});
	});
});
</script>

<style lang="scss">
.files-content {
	width: 100%;
}

.files-content-common {
	height: calc(100vh - 73px) !important;
}
.files-content-win {
	height: calc(100vh - 145px) !important;
}
</style>
