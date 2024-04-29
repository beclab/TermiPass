<template>
	<div class="card floating" id="download">
		<div class="card-title">
			<h4>{{ $t('prompts.download') }}</h4>
		</div>

		<div class="card-content">
			<p>{{ $t('prompts.downloadMessage') }}</p>

			<button
				v-for="(ext, format) in formats"
				:key="format"
				class="button button--block"
				@click="store.showConfirm(format)"
				v-focus
			>
				{{ ext }}
			</button>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useDataStore } from '../../../stores/data';

export default defineComponent({
	name: 'downloadComponent',
	setup() {
		const store = useDataStore();

		return {
			store,
			formats: {
				zip: 'zip',
				tar: 'tar',
				targz: 'tar.gz',
				tarbz2: 'tar.bz2',
				tarxz: 'tar.xz',
				tarlz4: 'tar.lz4',
				tarsz: 'tar.sz'
			}
		};
	}
});
</script>
