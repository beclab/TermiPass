<template>
	<q-layout
		view="lHh LpR lFr"
		:container="platform == 'FILES' ? false : true"
		class="bg-background-1"
	>
		<q-header
			class="layoutHeader text-subtitle1 row items-center justify-between background-1"
		>
			<div
				class="row items-center justify-between header-content drag-content-header q-pl-md"
			>
				<div class="row items-center justify-start ellipsis" style="flex: 1">
					<div style="width: 66px">
						<q-btn
							icon="chevron_left"
							flat
							dense
							:disabled="!backFlag ? false : true"
							@click="goBack"
							class="btn-no-text btn-no-border btn-size-sm"
							:class="!backFlag ? 'items-no-drag' : ''"
							color="ink-3"
							:style="{ pointerEvents: `${!backFlag ? 'auto' : 'none'}` }"
						/>
						<q-btn
							icon="chevron_right"
							flat
							dense
							:disabled="!goFlag ? false : true"
							@click="goForward"
							class="btn-no-text btn-no-border btn-size-sm"
							:class="!goFlag ? 'items-no-drag' : ''"
							color="ink-3"
							:style="{ pointerEvents: `${!goFlag ? 'auto' : 'none'}` }"
						/>
					</div>

					<div class="ellipsis text-ink-1" style="flex: 1; font-weight: 800">
						{{ fileTitle }}
					</div>
				</div>

				<div
					class="row items-center justify-end items-no-drag"
					style="width: 220px"
				>
					<div v-if="hideOption">
						<q-btn
							class="btn-size-sm btn-no-text btn-no-border q-mr-xs"
							text-color="ink-2"
							icon="sym_r_drive_folder_upload"
						>
							<q-tooltip>{{ t('prompts.upload') }}</q-tooltip>
							<q-menu class="popup-menu bg-background-2">
								<q-list dense padding>
									<q-item
										class="popup-item text-ink-2"
										clickable
										@click="uploadFiles"
										v-close-popup
									>
										<q-item-section>
											{{ t('files.upload_files') }}
										</q-item-section>
									</q-item>

									<q-item
										class="popup-item text-ink-2"
										clickable
										v-close-popup
										@click="uploadFolder"
									>
										<q-item-section>
											{{ t('files.upload_folders') }}
										</q-item-section>
									</q-item>
								</q-list>
							</q-menu>
						</q-btn>

						<q-btn
							class="btn-size-sm btn-no-text btn-no-border q-mr-xs"
							icon="sym_r_create_new_folder"
							text-color="ink-2"
							@click="newFloder"
						>
							<q-tooltip>{{ t('prompts.newDir') }}</q-tooltip>
						</q-btn>

						<q-btn
							class="btn-size-sm btn-no-text btn-no-border q-mr-xs"
							icon="sym_r_more_horiz"
							text-color="ink-2"
							@click="openPopupMenu"
						>
							<q-tooltip>{{ t('buttons.more') }}</q-tooltip>
							<PopupMenu
								:item="hoverItemAvtive"
								:isSide="false"
								@showPopupProxy="showPopupProxy"
							/>
						</q-btn>
					</div>

					<div
						class="separator q-mx-md bg-separator"
						style="width: 1px; height: 20px"
					></div>

					<div class="row items-center q-mr-md swithMode">
						<q-btn
							class="btn-size-sm btn-no-text btn-no-border q-mr-xs"
							:class="{ 'bg-btn-bg-pressed': viewMode == 'list' }"
							icon="sym_r_dock_to_right"
							text-color="ink-2"
							@click="switchView('list')"
						/>
						<q-btn
							class="btn-size-sm btn-no-text btn-no-border"
							:class="{ 'bg-btn-bg-pressed': viewMode == 'mosaic' }"
							icon="sym_r_grid_view"
							text-color="ink-2"
							@click="switchView('mosaic')"
						/>
					</div>
				</div>
			</div>

			<TerminusUserHeaderReminder />
		</q-header>

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

		<UploadModal />
	</q-layout>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { users } from '../api';
import { useDataStore } from '../stores/data';
import { useQuasar } from 'quasar';
import { useMenuStore } from '../stores/files-menu';
import { MenuItem } from '../utils/contact';
import { hideHeaderOpt } from './../utils/file';
import { bytetrade } from '@bytetrade/core';

import PopupMenu from '../components/files/popup/PopupMenu.vue';
import UploadModal from '../components/files/UploadModal.vue';
import FilesPage from '../pages/Files/FilesPage.vue';
import PromptsComponent from '../components/files/prompts/PromptsComponent.vue';
import FilesDrawer from './TermipassLayout/FilesDrawer.vue';
import TerminusUserHeaderReminder from './../components/common/TerminusUserHeaderReminder.vue';
import { useI18n } from 'vue-i18n';

const $q = useQuasar();
const Router = useRouter();
const Route = useRoute();
const store = useDataStore();
const menuStore = useMenuStore();

const fileTitle = ref();
const hoverItemAvtive = ref();
const isSeahub = ref(false);
const hideOption = ref(false);

const platform = ref(process.env.PLATFORM);
const viewMode = ref((store.user && store.user.viewMode) || 'list');

const backFlag = ref(true);
const goFlag = ref(true);

const { t } = useI18n();

watch(
	() => store.user?.viewMode,
	(newVaule, oldVaule) => {
		if (oldVaule == newVaule) {
			return;
		}
		if (!newVaule) {
			return;
		}
		viewMode.value = newVaule;
	}
);

onMounted(async () => {
	hideOption.value = hideHeaderOpt(Route.path);
	getFileTitle(Route.path);
	nextTick(() => {
		bytetrade.observeUrlChange.childPostMessage({
			type: 'Files'
		});
	});
});

const checkMenuPath = (path: string) => {
	const parts = path.split('/');

	let currentPath = '';

	if (
		parts.findIndex((part: string) => ['Home', 'Seahub'].includes(part)) >= 0
	) {
		currentPath =
			parts[
				parts.findIndex((part: string) => ['Home', 'Seahub'].includes(part)) + 1
			] || 'Home';
	} else if (
		parts.findIndex((part: string) =>
			['Application', 'AppData'].includes(part)
		) >= 0
	) {
		currentPath =
			parts[
				parts.findIndex((part: string) =>
					['Application', 'AppData'].includes(part)
				) + 1
			];
	}

	const defaultMenus: any = menuStore.menu[0].children;
	if (
		defaultMenus.find((tab: { label: string }) => tab.label === currentPath)
	) {
		store.currentItem = currentPath;
		menuStore.activeMenu = currentPath;
	}
};

watch(
	() => Route.path,
	(newVaule, oldVaule) => {
		checkMenuPath(newVaule);

		const oldIsSeahubValue = isSeahub.value;
		if (newVaule.indexOf('/Files/Seahub') > -1) {
			isSeahub.value = true;
		} else {
			isSeahub.value = false;
		}

		if (oldVaule == newVaule) {
			return;
		}
		if (!newVaule) {
			return;
		}

		const splitPath = newVaule.split('/');
		let currentPath = false;
		if (!isSeahub.value) {
			currentPath =
				!splitPath[
					splitPath.findIndex((part) =>
						['Home', 'Application', 'AppData'].includes(part)
					) + 1
				];
		} else {
			currentPath =
				splitPath[splitPath.findIndex((part) => part === 'Seahub') + 2] == '';
		}

		if (currentPath) {
			backFlag.value = true;
		} else {
			backFlag.value = false;
		}

		if (
			window.history.state.forward &&
			menuStore.canForward &&
			oldIsSeahubValue == isSeahub.value
		) {
			goFlag.value = false;
		} else {
			goFlag.value = true;
		}

		getFileTitle(newVaule);
		hideOption.value = hideHeaderOpt(newVaule);
	}
);

const getFileTitle = (path: string) => {
	const splitVal = path.split('/').filter((s) => {
		return s && s.trim();
	});

	if (splitVal[splitVal.length - 1] === 'video') {
		return false;
	}

	fileTitle.value = decodeURIComponent(splitVal[splitVal.length - 1]);
};

const switchView = async (type: string) => {
	if (type === store.user.viewMode) {
		return false;
	}

	const data = {
		id: store.user.id,
		viewMode: type
	};

	users
		.update(data, ['viewMode'])
		.catch
		/*this.$showError*/
		();
	await store.updateUser(data);
};

const goBack = async () => {
	if (backFlag.value) {
		return false;
	}
	if (fileTitle.value === MenuItem.HOME) {
		return false;
	}
	menuStore.canForward = true;

	// if (!window.history.state.back.endsWith('a=111')) {
	// 	menuStore.canBack = false;
	// }

	const driveMenu = menuStore.menu[0].children;

	if (driveMenu?.find((menu) => menu.label === fileTitle.value)) {
		Router.push({
			path: '/Files/Home/'
		});
	} else {
		Router.go(-1);
	}
};

const goForward = async () => {
	Router.forward();
};

const uploadFiles = () => {
	let element: any = document.getElementById('upload-input');
	element.value = '';
	element.click();
};

const uploadFolder = () => {
	let element: any = document.getElementById('upload-folder-input');
	element.value = '';
	element.click();
};

const newFloder = () => {
	store.showHover('newDir');
};

const showPopupProxy = (value: any) => {
	if (!value) {
		hoverItemAvtive.value = null;
	}
};

const openPopupMenu = () => {
	if (menuStore.menu.length < 1) {
		return;
	}

	hoverItemAvtive.value = menuStore.menu[1].children?.find(
		(item) => item.label === store.currentItem
	);
};
</script>

<style lang="scss">
.layoutHeader {
	color: $title;
	padding: 0;
	background-color: $background-1;

	.header-content {
		height: 56px;
		width: 100%;
	}
}

.swithMode {
	.active {
		background-color: $grey-1;
	}
}

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
