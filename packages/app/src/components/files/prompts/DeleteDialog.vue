<template>
	<q-dialog class="card-dialog" v-model="show" ref="dialogRef" @hide="onCancel">
		<q-card class="card-continer">
			<terminus-dialog-bar
				:label="t('delete')"
				icon=""
				titAlign="text-left"
				@close="onCancel"
			/>

			<div
				class="dialog-desc"
				:style="{ textAlign: isMobile ? 'center' : 'left' }"
			>
				{{
					store.selectedCount <= 1
						? t('prompts.deleteMessageSingle')
						: t('prompts.deleteMessageMultiple', {
								count: store.selectedCount
						  })
				}}
			</div>

			<terminus-dialog-footer
				:okText="t('confirm')"
				:cancelText="t('cancel')"
				showCancel
				:loading="loading"
				@close="onCancel"
				@submit="submit"
			/>
		</q-card>
	</q-dialog>
</template>

<script lang="ts" setup>
import { useDataStore } from '../../../stores/data';
import { files as api, seahub } from '../../../api';
import { useRoute } from 'vue-router';
import { checkSeahub } from '../../../utils/file';
import { useSeahubStore } from '../../../stores/seahub';
import { useI18n } from 'vue-i18n';
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { ref } from 'vue';

import TerminusDialogBar from '../../common/TerminusDialogBar.vue';
import TerminusDialogFooter from '../../common/TerminusDialogFooter.vue';
import {
	notifyWaitingShow,
	notifyHide
} from '../../../utils/notifyRedefinedUtil';

const store = useDataStore();
const seahubStore = useSeahubStore();
const repo = useSeahubStore();
const { t } = useI18n();
const { dialogRef, onDialogCancel } = useDialogPluginComponent();

const $q = useQuasar();
const route = useRoute();
const isMobile = ref(process.env.PLATFORM == 'MOBILE' || $q.platform.is.mobile);

const show = ref(true);
const loading = ref(false);
const submit = async () => {
	loading.value = true;
	if (
		checkSeahub(route.path) ||
		(!store.req.isDir && checkSeahub(store.req.path))
	) {
		notifyWaitingShow('Deleting, Please wait...');
		if (!repo.repo_id) {
			const id = store.req.items[store.selected[0]].id;
			const path = `seahub/api/v2.1/repos/${id}/`;
			await seahub.deleteRepo(path);
			loading.value = false;
			store.setReload(true);
			notifyHide();
			return;
		}

		const dirents = [];

		let parent_dir = '';
		if (!store.req.isDir && checkSeahub(store.req.path)) {
			const pathLen =
				store.req.path.indexOf(store.currentItem) + store.currentItem.length;
			parent_dir = store.req.path.slice(pathLen);
			console.log(parent_dir);
			const nameLen = parent_dir.indexOf(store.req.name);
			dirents.push(store.req.name);
			parent_dir = parent_dir.substring(0, nameLen);
			console.log(parent_dir);
		} else if (checkSeahub(route.path)) {
			const dec = decodeURI(route.path);
			const pathLen = dec.indexOf(store.currentItem) + store.currentItem.length;
			parent_dir = dec.slice(pathLen);
			for (let index of store.selected) {
				dirents.push(store.req.items[index].name);
			}
			console.log('pathLen ===>' + pathLen);
		}

		console.log('dirents ===>' + dirents);

		const parmas = {
			dirents: dirents,
			parent_dir: parent_dir,
			repo_id: seahubStore.repo_id
		};

		try {
			await seahub.batchDeleteItem(parmas);
			loading.value = false;
			notifyHide();
		} catch (error) {
			notifyHide();
			loading.value = false;
		}

		if (!store.req.isDir) {
			store.showConfirm();
			store.closeHovers();
		}

		store.setReload(true);
		return false;
	}

	try {
		if (!store.isListing(route)) {
			notifyWaitingShow('Deleting, Please wait...');

			if (!store.req.isDir) {
				await api.remove(store.req.url);
			} else {
				await api.remove(route.path);
			}
			notifyHide();
			store.showConfirm();
			store.closeHovers();
			return;
		}

		store.closeHovers();
		let promises = [];
		notifyWaitingShow('Deleting, Please wait...');

		if (store.selectedCount === 0 && !store.req.isDir) {
			console.log(4);
			await promises.push(api.remove(store.req.url));
		} else {
			for (let index of store.selected) {
				promises.push(api.remove(store.req.items[index].url));
			}
		}
		await Promise.all(promises);
		notifyHide();
		store.setReload(true);
	} catch (e) {
		notifyHide();
		if (store.isListing(route)) store.setReload(true);
	}
};

const onCancel = () => {
	store.closeHovers();
	store.selected = [];
	onDialogCancel();
};
</script>

<style lang="scss" scoped>
.card-dialog {
	.card-continer {
		width: 400px;
		border-radius: 12px;

		.dialog-desc {
			padding-left: 20px;
		}
	}
}
</style>
