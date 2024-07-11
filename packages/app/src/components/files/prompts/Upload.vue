<template>
	<div class="card floating">
		<div class="card-title">
			<h4>{{ $t('prompts.upload') }}</h4>
		</div>

		<div class="card-content">
			<p>{{ $t('prompts.uploadMessage') }}</p>
		</div>

		<div class="card-action full">
			<div @click="uploadFile" class="action">
				<i class="material-icons">insert_drive_file</i>
				<div class="title">{{ $t('buttons.file') }}</div>
			</div>
			<div @click="uploadFolder" class="action">
				<i class="material-icons">folder</i>
				<div class="title">{{ $t('buttons.folder') }}</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'uploadComponent',
	setup() {
		const uploadFile = () => {
			let element: any = document.getElementById('upload-input');
			element.value = '';
			element.click();
		};

		const uploadFolder = () => {
			let element: any = document.getElementById('upload-folder-input');
			element.value = '';
			element.click();
		};

		return {
			uploadFile,
			uploadFolder
		};
	}
});
</script>
