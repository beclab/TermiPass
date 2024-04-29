<template>
	<q-dialog class="card-dialog" v-model="show" ref="dialogRef">
		<q-card class="card-continer">
			<terminus-dialog-bar
				:label="t('prompts.newDir')"
				titAlign="text-left"
				@close="store.closeHovers()"
			/>

			<div class="card-content">
				<p>{{ t('prompts.newFileMessage') }}</p>
				<input
					class="input input--block"
					v-focus
					ref="inputRef"
					type="text"
					@keyup.enter="submit"
					v-model.trim="name"
				/>
			</div>

			<terminus-dialog-footer
				:okText="t('buttons.create')"
				:cancelText="t('buttons.cancel')"
				showCancel
				:loading="loading"
				@close="store.closeHovers()"
				@submit="submit"
			/>
		</q-card>
	</q-dialog>
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue';
import { useDataStore } from '../../../stores/data';
import { useSeahubStore } from '../../../stores/seahub';
import { files as api, seahub } from '../../../api';
import url from '../../../utils/url';
import { checkSeahub, checkSameName } from '../../../utils/file';

import TerminusDialogBar from '../../common/TerminusDialogBar.vue';
import TerminusDialogFooter from '../../common/TerminusDialogFooter.vue';

import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const store = useDataStore();
const seahubStore = useSeahubStore();
const name = ref<string>('');
const route = useRoute();
// const router = useRouter();
const inputRef = ref();
const submitLoading = ref(false);
const show = ref(true);
const { t } = useI18n();
const loading = ref(false);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const submit = async (_event: any) => {
	// event.preventDefault();
	if (name.value === '') return;
	submitLoading.value = true;
	loading.value = true;
	// Build the path of the new directory.
	let uri = store.isFiles(route) ? route.path + '/' : '/';

	if (!store.isListing(route)) {
		uri = url.removeLastDir(uri) + '/';
	}

	if (checkSeahub(uri)) {
		const pathlen =
			decodeURIComponent(route.path).indexOf(seahubStore.repo_name) +
			seahubStore.repo_name.length;
		const p = `${decodeURIComponent(route.path).slice(pathlen)}${name.value}`;

		const parmas = {
			operation: 'mkdir'
		};
		const url = 'api2/repos';
		await seahub.fileOperate(p, url, parmas, 'dir');
		store.closeHovers();
		store.setReload(true);
		loading.value = false;
		return false;
	}

	try {
		const newName = await checkSameName(name.value, store.req.items);

		uri += encodeURIComponent(newName) + '/';
		uri = uri.replace('//', '/');

		await api.resourceAction(uri, 'post');
		store.setReload(true);
	} catch (e) {
		//this.$showError(e);
	}
	loading.value = false;
	store.closeHovers();
	submitLoading.value = false;
};

nextTick(() => {
	setTimeout(() => {
		inputRef.value && inputRef.value.focus();
	}, 100);
});
</script>

<style lang="scss" scoped>
.card-dialog {
	.card-continer {
		width: 400px;
		border-radius: 12px;

		.card-content {
			padding: 0 20px;
			.input {
				border-radius: 5px;
				&:focus {
					border: 1px solid $blue;
				}
			}
		}
	}
}
</style>
