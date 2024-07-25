<template>
	<div
		class="layoutHeader text-subtitle1 row items-center justify-between background-1"
	>
		<div
			class="row items-center justify-between header-content drag-content-header q-pl-md"
		>
			<div class="row items-center justify-start ellipsis" style="flex: 1">
				<NavigationComponent />
				<BreadcrumbsComponent base="/Files" />
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
							:from="watchFrom"
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
	</div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { users, common } from '../../../api';
import { useDataStore } from '../../../stores/data';
import { useMenuStore, ActiveMenuType } from '../../../stores/files-menu';
import { hideHeaderOpt } from './../../../utils/file';
import { bytetrade } from '@bytetrade/core';

import PopupMenu from '../../../components/files/popup/PopupMenu.vue';
import TerminusUserHeaderReminder from './../../../components/common/TerminusUserHeaderReminder.vue';
import BreadcrumbsComponent from './../../../components/files/BreadcrumbsComponent.vue';
import NavigationComponent from './../../../components/files/NavigationComponent.vue';
import { useI18n } from 'vue-i18n';
import { dataAPIs } from '../../../api';
import { DriveType } from '../../../stores/files';
import { getParams } from './../../../utils/utils';

const Route = useRoute();
const store = useDataStore();
const menuStore = useMenuStore();

const fileTitle = ref();
const hoverItemAvtive = ref();
const isSeahub = ref(false);
const hideOption = ref(false);

const viewMode = ref((store.user && store.user.viewMode) || 'list');

const watchFrom = ref();

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

watch(
	() => Route.path,
	async (newVal) => {
		const type = await common.formatUrltoDriveType(newVal);
		if (type === DriveType.Sync) {
			watchFrom.value = 'sync';
		} else {
			watchFrom.value = '';
		}
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

	let currentPath: ActiveMenuType = {
		label: 'Home',
		id: 'Home',
		driveType: DriveType.Drive
	};

	if (parts.findIndex((part: string) => ['Home'].includes(part)) >= 0) {
		currentPath = {
			label:
				parts[parts.findIndex((part: string) => ['Home'].includes(part)) + 1] ||
				'Home',
			id:
				parts[parts.findIndex((part: string) => ['Home'].includes(part)) + 1] ||
				'Home',

			driveType: DriveType.Drive
		};
	} else if (
		parts.findIndex((part: string) => ['Seahub'].includes(part)) >= 0
	) {
		const repo_id = getParams(Route.fullPath, 'id');
		currentPath = {
			label:
				parts[parts.findIndex((part: string) => ['Home'].includes(part)) + 1] ||
				'Home',
			id: repo_id,
			driveType: DriveType.Sync
		};
	} else if (
		parts.findIndex((part: string) =>
			['Application', 'AppData'].includes(part)
		) >= 0
	) {
		currentPath = {
			label:
				parts[
					parts.findIndex((part: string) =>
						['Application', 'AppData'].includes(part)
					) + 1
				],
			id: parts[
				parts.findIndex((part: string) =>
					['Application', 'AppData'].includes(part)
				) + 1
			],
			driveType: DriveType.Cache
		};
	}

	const defaultMenus: any = menuStore.menu[0].children;
	if (
		defaultMenus.find(
			(tab: { label: string }) => tab.label === currentPath.label
		)
	) {
		store.currentItem = currentPath.label;
		// menuStore.activeMenu = currentPath;
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

const uploadFiles = () => {
	const dataAPI = dataAPIs();
	dataAPI.uploadFiles();
};

const uploadFolder = () => {
	const dataAPI = dataAPIs();
	dataAPI.uploadFolder();
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
		(item) => item.label === menuStore.activeMenu.label
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
</style>
