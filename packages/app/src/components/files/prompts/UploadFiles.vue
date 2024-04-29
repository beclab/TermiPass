<template>
	<div
		v-if="upload.filesInUploadCount > 0"
		class="upload-files"
		v-bind:class="{ closed: !open }"
	>
		<div class="card floating">
			<div class="card-title">
				<h2>
					{{
						$t('prompts.uploadFiles', {
							files: upload.filesInUploadCount
						})
					}}
				</h2>

				<button
					class="action"
					@click="toggle"
					aria-label="Toggle file upload list"
					title="Toggle file upload list"
				>
					<i class="material-icons">{{
						open ? 'keyboard_arrow_down' : 'keyboard_arrow_up'
					}}</i>
				</button>
			</div>

			<div class="card-content file-icons">
				<div
					class="file"
					v-for="file in upload.filesInUpload"
					:key="file.id"
					:data-dir="file.isDir"
					:data-type="file.type"
					:aria-label="file.name"
				>
					<div class="file-name">
						<i class="material-icons"></i> {{ file.name }}
					</div>
					<div class="file-progress">
						<div v-bind:style="{ width: file.progress + '%' }"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useUploadStore } from '../../../stores/upload';

export default defineComponent({
	name: 'uploadFiles',
	setup() {
		const upload = useUploadStore();
		const open = ref(false);

		const toggle = () => {
			open.value = !open.value;
		};

		return {
			upload,
			open,
			toggle
		};
	}
});
</script>
