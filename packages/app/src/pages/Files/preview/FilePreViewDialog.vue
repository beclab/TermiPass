<template>
	<q-dialog
		v-model="dialog"
		persistent
		:maximized="maximizedToggle"
		transition-show="slide-up"
		transition-hide="slide-down"
	>
		<q-card>
			<div id="previewer">
				<header-bar>
					<title
						class="q-ml-md"
						:style="
							$q.platform.is.electron && $q.platform.is.mac
								? 'margin-left: 90px;'
								: ''
						"
					>
						{{ title }}
					</title>
					<template #info v-if="store.req.type === 'image'">
						<div
							class="q-px-md q-py-xs view-another-image text-overline cursor-pointer"
							@click="store.preview.fullSize = !store.preview.fullSize"
							style="-webkit-app-region: no-drag"
						>
							{{
								!store.preview.fullSize
									? $t('files.view_original_image') + ' ' + size
									: $t('files.view_preview_image')
							}}
						</div>
					</template>

					<template #actions>
						<action
							:disabled="store.loading"
							v-if="store.preview.isEditEnable"
							:icon="store.preview.isEditing ? 'save' : 'edit_square'"
							:label="$t('buttons.edit')"
							style="-webkit-app-region: no-drag"
							@action="showOperation"
						/>

						<action
							:disabled="store.loading"
							v-if="store.user?.perm?.delete"
							icon="delete"
							:label="$t('buttons.delete')"
							style="-webkit-app-region: no-drag"
							@action="deleteFile"
						/>

						<action
							:disabled="store.loading"
							v-if="store.user?.perm?.download"
							icon="browser_updated"
							:label="$t('buttons.download')"
							style="-webkit-app-region: no-drag"
							@action="download"
						/>

						<action
							:disabled="store.loading"
							icon="close"
							:label="$t('buttons.close')"
							style="-webkit-app-region: no-drag"
							@action="close"
						/>
					</template>
				</header-bar>
				<div class="content">
					<BtLoading
						:show="true"
						v-if="store.loading"
						textColor="#4999ff"
						color="#4999ff"
						text=""
						backgroundColor="rgba(0, 0, 0, 0)"
					>
					</BtLoading>
					<template v-else>
						<component :is="currentView"></component>
					</template>

					<button
						@click="prev"
						:class="{ hidden: !hasPrevious }"
						:aria-label="$t('buttons.previous')"
						:title="$t('buttons.previous')"
					>
						<i class="material-icons">chevron_left</i>
					</button>
					<button
						@click="next"
						:class="{ hidden: !hasNext }"
						:aria-label="$t('buttons.next')"
						:title="$t('buttons.next')"
					>
						<i class="material-icons">chevron_right</i>
					</button>
				</div>
			</div>
		</q-card>
	</q-dialog>
</template>

<script setup lang="ts">
import HeaderBar from '../../../components/files/header/HeaderBar.vue';
import Action from '../../../components/files/header/Action.vue';

import { useDataStore } from '../../../stores/data';
import FilePreview from '../common-files/FilePreview.vue';
import FileEditor from '../common-files/FileEditor.vue';
import FileUnavailable from '../common-files/FileUnavailable.vue';

import { onMounted, onUnmounted, ref, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { format, useQuasar } from 'quasar';
import { computed } from 'vue';

import { files as api, seahub } from '../../../api';
import { INewDownloadFile } from '../../../platform/electron/interface';
import { watch } from 'vue';
import { checkSeahub } from '../../../utils/file';

const dialog = ref(false);

const maximizedToggle = ref(true);

const { humanStorageSize } = format;

const store = useDataStore();

const title = ref(store.req.name);

const isDark = ref(false);

const $router = useRouter();

const size = ref(humanStorageSize(store.req.size ?? 0));

const currentView = ref();

const $q = useQuasar();

const hasPrevious = computed(function () {
	if (!store.oldReq || !store.oldReq.items || store.oldReq.items.length <= 1) {
		return false;
	}
	const items = store.oldReq.items.filter((e) => !e.isDir);
	const index = items.findIndex((e) => e.name == store.req.name);

	return index > 0;
});

const hasNext = computed(function () {
	if (!store.oldReq || !store.oldReq.items || store.oldReq.items.length <= 1) {
		return false;
	}
	const items = store.oldReq.items.filter((e) => !e.isDir);
	const index = items.findIndex((e) => e.name == store.req.name);
	return index < items.length - 1;
});

onBeforeMount(() => {
	store.preview.isShow = true;
});

onMounted(() => {
	isDark.value = false;

	const newVal = store.req;

	if (newVal.type == undefined) {
		return null;
	}

	currentView.value = undefined;

	if (
		newVal.type === 'text' ||
		newVal.type === 'txt' ||
		newVal.type === 'textImmutable'
	) {
		store.preview.isEditEnable = true;
		return (currentView.value = FileEditor);
	} else {
		store.preview.isEditEnable = false;

		if (newVal.name) {
			title.value = newVal.name as string;
		}
		if (
			newVal.type == 'image' ||
			newVal.type == 'video' ||
			newVal.type == 'audio' ||
			newVal.type == 'pdf'
		) {
			isDark.value = true;
			return (currentView.value = FilePreview);
		}

		if (newVal.extension == '.doc') {
			return (currentView.value = FilePreview);
		}

		if (newVal.extension == '.xlsx') {
			return (currentView.value = FilePreview);
		}

		return (currentView.value = FileUnavailable);
	}
});

const deleteFile = () => {
	store.showHover({
		prompt: 'delete',
		confirm: () => {
			close();
		}
	});
};

const prev = async () => {
	const items = store.oldReq.items.filter((e) => !e.isDir);
	console.log('items ==>' + items);

	const index = items.findIndex((e) => e.name == store.req.name);
	if (index < 1) {
		return;
	}

	let preItem = items[index - 1];
	if (
		preItem.type == 'audio' ||
		preItem.type == 'video' ||
		preItem.type == 'pdf'
	) {
		if (checkSeahub(preItem.path) && preItem.isDir === false) {
			preItem = await seahub.formatFileContent(preItem);
		}
	}

	store.req = preItem;
};

const next = async () => {
	const items = store.oldReq.items.filter((e) => !e.isDir);
	const index = items.findIndex((e) => e.name == store.req.name);
	if (index + 1 > items.length) {
		return;
	}
	let nextItem = items[index + 1];
	console.log(nextItem);
	if (
		nextItem.type == 'audio' ||
		nextItem.type == 'video' ||
		nextItem.type == 'pdf'
	) {
		if (checkSeahub(nextItem.path) && nextItem.isDir === false) {
			nextItem = await seahub.formatFileContent(nextItem);
		}
	}
	console.log(nextItem);
	store.req = nextItem;
};

watch(
	() => store.req,
	async (newVal) => {
		if (newVal.type == undefined) {
			return null;
		}
		console.log('store.req ===>');
		console.log(store.req);
		title.value = store.req.name;
		currentView.value = undefined;

		if (
			newVal.type === 'text' ||
			newVal.type === 'txt' ||
			newVal.type === 'textImmutable'
		) {
			store.preview.isEditEnable = true;
			return (currentView.value = FileEditor);
		} else {
			store.preview.isEditEnable = false;

			if (newVal.name) {
				title.value = newVal.name as string;
			}

			if (
				newVal.type == 'image' ||
				newVal.type == 'video' ||
				newVal.type == 'audio' ||
				newVal.type == 'pdf'
			) {
				isDark.value = true;
				return (currentView.value = FilePreview);
			}

			return (currentView.value = FileUnavailable);
		}
	},
	{
		deep: true
	}
);

const downloadUrl = computed(function () {
	return api.getDownloadURL(store.req, false, true);
});

const download = async () => {
	const data = await downloadUrl.value;
	const isElectron = $q.platform.is.electron;
	if (!isElectron) {
		window.open(data);
		return;
	}
	if (isElectron && data && data.length > 0) {
		const savePath = await window.electron.api.download.getDownloadPath();
		const formData: INewDownloadFile = {
			url: data,
			fileName: store.req.name,
			path: savePath,
			totalBytes: store.req.size
		};
		await window.electron.api.download.newDownloadFile(formData);
	}
};

const close = () => {
	if (!checkSeahub(store.req.path)) {
		$router.back();
		store.resetRequest();
	} else {
		store.resetRequest();
	}
	dialog.value = false;
};

onUnmounted(() => {
	store.preview.fullSize = false;
	store.preview.isShow = false;
});

const showOperation = () => {
	if (store.preview.isEditEnable) {
		if (!store.preview.isEditing) {
			store.preview.isEditing = true;
		} else {
			store.preview.isSaving = true;
		}
	}
};
</script>

<style scoped lang="scss">
.view-another-image {
	height: 20px;
	background: $grey-2;
	border-radius: 4px;
	text-align: center;
}
</style>
