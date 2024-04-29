<template>
	<div class="pdf-preview-view">
		<div
			v-if="loading"
			style="width: 100%; height: 100%"
			class="row items-center justify-center"
		>
			<q-spinner-dots color="primary" size="3em" />
		</div>
		<div id="termipass-pdf-preview"></div>
	</div>
</template>

<script setup lang="ts">
import { useDataStore } from '../../../stores/data';
import { files as api } from '../../../api';
import Pdfh5 from 'pdfh5';
import { onMounted, ref } from 'vue';
import { axiosInstanceProxy } from '../../../platform/httpProxy';

const store = useDataStore();

const loading = ref(false);

const rawUrl = () => {
	return api.getDownloadURL(store.req, true);
};

onMounted(async () => {
	const config = {
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		responseType: 'arraybuffer'
	} as any;

	const instance = axiosInstanceProxy(config);
	instance.interceptResponse((res) => {
		if (typeof res.data === 'string') {
			res.data = atob(res.data);
		}
		return res;
	});

	try {
		loading.value = true;
		const response = await instance.get(rawUrl(), config);
		loading.value = false;
		new Pdfh5('#termipass-pdf-preview', {
			data: response.data
		});
	} catch (error) {
		loading.value = false;
	}
});
</script>

<style scoped lang="scss">
@import 'pdfh5/css/pdfh5.css';

.pdf-preview-view {
	width: 100%;
	height: 100%;
}
</style>
