<template>
	<div class="files-page-root">
		<div class="flur1"></div>
		<div class="flur2"></div>
		<Terminus-user-header :title="t('Files')" />
		<terminus-scroll-area class="files-content-mobile q-mt-sm">
			<template v-slot:content>
				<bind-terminus-name :border-show="false">
					<template v-slot:success>
						<div class="home-module-title">
							{{ t('files.drive') }}
						</div>
						<div class="module-content q-mt-md bg-color-white">
							<div v-for="(cell, index) in driveMenus" :key="index">
								<terminus-item
									:show-board="false"
									img-bg-classes="bg-grey-1"
									:image-path="cell.icon"
									:whole-picture-size="32"
									:icon-size="16"
									@click="seahubAtion(cell.menu, cell.name)"
								>
									<template v-slot:title>
										<div class="text-subtitle1">{{ cell.name }}</div>
									</template>
									<template v-slot:side>
										<q-icon name="sym_r_keyboard_arrow_right" size="20px" />
									</template>
								</terminus-item>
								<q-separator
									inset
									color="grey-2"
									v-if="index + 1 < driveMenus.length"
								/>
							</div>
						</div>

						<div class="home-module-title q-mt-lg">
							{{ $t('files.sync') }}
						</div>
						<div class="module-content q-mt-md bg-color-white">
							<div v-for="(cell, index) in syncMenus" :key="index">
								<terminus-item
									:show-board="false"
									img-bg-classes="bg-grey-1"
									:icon-name="cell.icon"
									:whole-picture-size="32"
									@click="seahubAtion(cell.menu, cell.name)"
								>
									<template v-slot:title>
										<div class="text-subtitle1">{{ cell.name }}</div>
									</template>
									<template v-slot:side>
										<q-icon name="sym_r_keyboard_arrow_right" size="20px" />
									</template>
								</terminus-item>
								<q-separator
									inset
									color="grey-2"
									v-if="index + 1 < syncMenus.length"
								/>
							</div>
						</div>
						<div
							v-if="
								termipassStore &&
								termipassStore.totalStatus &&
								termipassStore.totalStatus.isError == 2
							"
							style="padding-bottom: 60px; width: 100%; height: 1px"
						/>
						<div
							v-else
							style="padding-bottom: 30px; width: 100%; height: 1px"
						/>
					</template>
				</bind-terminus-name>
			</template>
		</terminus-scroll-area>
	</div>
</template>

<script lang="ts" setup>
import TerminusUserHeader from '../../../components/common/TerminusUserHeader.vue';
import TerminusItem from '../../../components/common/TerminusItem.vue';
import { useI18n } from 'vue-i18n';
import { ref, onMounted } from 'vue';
import { MenuItem } from '../../../utils/contact';
import { useDataStore } from '../../../stores/data';
import { useRouter, useRoute } from 'vue-router';
import BindTerminusName from '../../../components/common/BindTerminusName.vue';
import TerminusScrollArea from '../../../components/common/TerminusScrollArea.vue';
// import { useUserStore } from '../../../stores/user';
// import { UserStatusActive } from '../../../utils/checkTerminusState';
// import { notifyFailed } from '../../../utils/notifyRedefinedUtil';
import { useTermipassStore } from '../../../stores/termipass';
import { useMenuStore } from '../../../stores/files-menu';
import { DriveType, useFilesStore } from '../../../stores/files';
import { DriveDataAPI, seahub } from './../../../api';
import { formatSeahubRepos } from './../../../api/sync/filesFormat';
import { route } from 'quasar/wrappers';

const { t } = useI18n();

const dataStore = useDataStore();
const menuStore = useMenuStore();
const fileStore = useFilesStore();

const Router = useRouter();
const Route = useRoute();
// const userStore = useUserStore();
const termipassStore = useTermipassStore();

const driveList = ref();

const driveMenus = ref([
	{
		name: t('files.home'),
		icon: 'images/files-home.svg',
		menu: MenuItem.HOME
	},
	{
		name: t('files.driveMenus.document'),
		icon: 'images/files-document.svg',
		menu: MenuItem.DOCUMENTS
	},
	{
		name: t('files.driveMenus.picture'),
		icon: 'images/files-picture.svg',
		menu: MenuItem.PICTURES
	},
	{
		name: t('files.driveMenus.movies'),
		icon: 'images/files-video.svg',
		menu: MenuItem.MOVIES
	},
	{
		name: t('files.driveMenus.download'),
		icon: 'images/files-download.svg',
		menu: MenuItem.DOWNLOADS
	}
]);

const seahubAtion = (menu: MenuItem, name?: string) => {
	// const userStore = useUserStore();
	// const termipassStore = useTermipassStore();
	// if (termipassStore.totalStatus?.isError != UserStatusActive.active) {
	// 	notifyFailed(
	// 		t('the_current_status_this_module_cannot_be_accessed', {
	// 			status: termipassStore.totalStatus?.title
	// 		})
	// 	);
	// 	return;
	// }

	// dataStore.updateActiveMenu(menu);

	const query = {
		name: name ? name : menu
	};

	switch (menu) {
		case MenuItem.DATA:
			Router.push({
				path: '/Files/Application/'
			});

			// menuStore.activeMenu = {
			// 	driveType: DriveType.Drive,
			// 	label: menu,
			// 	id: menu
			// };

			break;

		case MenuItem.CACHE:
			Router.push({
				path: '/Files/AppData'
			});

			// menuStore.activeMenu = {
			// 	driveType: DriveType.Cache,
			// 	label: menu,
			// 	id: menu
			// };

			break;

		case MenuItem.MYLIBRARIES:
		case MenuItem.SHAREDWITH:
			Router.push({
				path: `/repo/${menu}`,
				query
			});
			// openSyncFolder(menu, query);
			break;

		default:
			if (menu === MenuItem.HOME) {
				const url = `/Files/Home`;
				openDriveFolder(menu, url);
			} else {
				const url = `/Files/Home/${menu}/`;
				openDriveFolder(menu, url);
			}

			// menuStore.activeMenu = {
			// 	driveType: DriveType.Drive,
			// 	label: menu,
			// 	id: menu
			// };
			break;
	}
};

const openDriveFolder = (menu: string, url: string) => {
	fileStore.setBrowserUrl(url, DriveType.Drive);
};

const syncMenus = ref([
	{
		name: t('files.syncMenus.myLibraries'),
		icon: 'sym_r_library_books',
		menu: MenuItem.MYLIBRARIES
	},
	{
		name: t('files.syncMenus.sharedLibraries'),
		icon: 'sym_r_folder_copy',
		menu: MenuItem.SHAREDWITH
	}
]);

onMounted(async () => {
	const driveDataApi = new DriveDataAPI();

	const data = await driveDataApi.fetch('/Files/Home/');
	driveList.value = data.items;
});
</script>

<style scoped lang="scss">
.files-page-root {
	height: 100%;
	width: 100%;
	position: relative;
	z-index: 0;

	.flur1 {
		width: 135px;
		height: 135px;
		background: rgba(133, 211, 255, 0.7);
		filter: blur(70px);
		position: absolute;
		right: 10vw;
		top: 10vh;
		z-index: -1;
	}

	.flur2 {
		width: 110px;
		height: 110px;
		background: rgba(217, 255, 109, 0.6);
		filter: blur(70px);
		position: absolute;
		left: 10vw;
		top: 30vh;
		z-index: -1;
	}

	.files-content-mobile {
		height: calc(100% - 56px);
		width: 100%;

		padding-left: 20px;
		padding-right: 20px;

		.module-content {
			border: 1px solid $grey-2;
			border-radius: 20px;
		}
	}
}
</style>
