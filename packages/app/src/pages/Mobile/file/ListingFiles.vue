<template>
	<div
		@click.stop="leftClick"
		:style="{ paddingBottom: '24px', width: '100%', height: '100%' }"
		class="q-px-md q-py-xs"
	>
		<div
			class="empty column items-center justify-center"
			style="height: calc(100% - 4em)"
			v-if="store.req.numDirs + store.req.numFiles == 0"
		>
			<img src="../../../assets/images/empty.png" alt="empty" />
			<span class="text-body2 text-grey-8">{{ t('files.lonely') }}</span>
			<input
				style="display: none"
				type="file"
				id="upload-input"
				@change="uploadInput($event)"
				multiple
			/>
			<input
				style="display: none"
				type="file"
				id="upload-folder-input"
				@change="uploadInput($event)"
				webkitdirectory
				multiple
			/>
		</div>
		<div v-else style="height: 100%; width: 100%">
			<div style="height: 32px; width: 100%">
				<div
					style="width: 100%; height: 100%"
					class="row items-center justify-between"
				>
					<div class="row items-center" @click="updateSort">
						<q-icon
							:name="filesSortTypeInfo[store.activeSort.by].icon"
							size="20px"
							color="grey-8"
						/>
						<div class="q-mx-xs text-grey-8">
							{{ filesSortTypeInfo[store.activeSort.by].name }}
						</div>
						<div>
							<q-icon name="sym_r_expand_more" size="20px" color="grey-8" />
						</div>
					</div>
					<div
						style="height: 32px; width: 32px"
						class="row items-center justify-center"
						@click="switchView(viewMode == 'list' ? 'mosaic' : 'list')"
					>
						<q-icon
							name="sym_r_grid_view"
							size="20px"
							v-if="viewMode == 'list'"
							color="grey-8"
						/>
						<q-icon
							name="sym_r_dock_to_right"
							size="20px"
							v-if="viewMode == 'mosaic'"
							color="grey-8"
						/>
					</div>
				</div>
			</div>
			<terminus-scroll-area style="width: 100%; height: calc(100% - 32px)">
				<template v-slot:content>
					<div
						id="listing"
						ref="listing"
						:class="store.user.viewMode + ' file-icons'"
						style="width: 100%; height: 100%"
					>
						<ListingItem
							v-for="item in dirs"
							:key="base64(item.name)"
							v-bind:index="item.index"
							v-bind:name="item.name"
							v-bind:isDir="item.isDir"
							v-bind:url="item.url"
							v-bind:modified="item.modified"
							v-bind:type="item.type"
							v-bind:size="item.size"
							v-bind:path="item.path"
							v-bind:extension="item.extension"
							v-bind:viewMode="store.user.viewMode"
							v-bind:id="item.id"
						>
						</ListingItem>
						<ListingItem
							v-for="item in files"
							:key="base64(item.name)"
							v-bind:index="item.index"
							v-bind:name="item.name"
							v-bind:isDir="item.isDir"
							v-bind:url="item.url"
							v-bind:modified="item.modified"
							v-bind:type="item.type"
							v-bind:size="item.size"
							v-bind:path="item.path"
							v-bind:extension="item.extension"
							v-bind:viewMode="store.user.viewMode"
						>
						</ListingItem>

						<input
							style="display: none"
							type="file"
							id="upload-input"
							@change="uploadInput($event)"
							multiple
						/>
						<input
							style="display: none"
							type="file"
							id="upload-folder-input"
							@change="uploadInput($event)"
							webkitdirectory
							multiple
						/>
					</div>
				</template>
			</terminus-scroll-area>
		</div>
	</div>

	<prompts-component />
</template>

<script lang="ts">
import {
	defineComponent,
	ref,
	onMounted,
	onUnmounted,
	computed,
	watch,
	nextTick
} from 'vue';
import { format, useQuasar } from 'quasar';
import { useRoute } from 'vue-router';
import throttle from 'lodash.throttle';
import { useDataStore } from '../../../stores/data';
import { users, files as api } from '../../../api';
import { checkConflict, scanFiles, handleFiles } from '../../../utils/upload';
import ListingItem from './ListingItem.vue';
import { filesSortTypeInfo } from '../../../utils/contact';
import FileSortDialog from './FileSortDialog.vue';
import PromptsComponent from '../../../components/files/prompts/PromptsComponent.vue';
import TerminusScrollArea from '../../../components/common/TerminusScrollArea.vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
	name: 'ListingFiles',
	components: {
		PromptsComponent,
		ListingItem,
		TerminusScrollArea
	},
	setup() {
		const store = useDataStore();
		const route = useRoute();

		const dragCounter = ref<number>(0);
		const itemWeight = ref<number>(0);
		const listing = ref<any>(null);
		const width = ref<number>(window.innerWidth);

		let showLimit = 50;
		const viewMode = ref((store.user && store.user.viewMode) || 'list');
		const $q = useQuasar();
		watch(
			() => store.req,
			() => {
				showLimit = 50;
				nextTick(() => {
					setItemWeight();
					fillWindow(true);
				});
			}
		);

		const items = computed(function () {
			const dirs: any = [];
			const files: any = [];
			store.req.items.forEach((item: any) => {
				if (item.isDir) {
					dirs.push(item);
				} else {
					files.push(item);
				}
			});

			return { dirs, files };
		});

		const dirs = computed(function () {
			return items.value.dirs;
		});

		const files = computed(function () {
			return items.value.files;
		});

		onMounted(() => {
			// How much every listing item affects the window height
			setItemWeight();

			// Fill and fit the window with listing items
			fillWindow(true);

			// Add the needed event listeners to the window and document.
			window.addEventListener('scroll', scrollEvent);

			if (!store.user?.perm?.create) return;
			document.addEventListener('dragover', preventDefault);
			document.addEventListener('dragenter', dragEnter);
			document.addEventListener('dragleave', dragLeave);
			document.addEventListener('drop', drop);
		});

		onUnmounted(() => {
			// Remove event listeners before destroying this page.
			window.removeEventListener('scroll', scrollEvent);

			if (store.user && !store.user?.perm?.create) return;
			document.removeEventListener('dragover', preventDefault);
			document.removeEventListener('dragenter', dragEnter);
			document.removeEventListener('dragleave', dragLeave);
			document.removeEventListener('drop', drop);
		});

		const base64 = (name: string) => {
			return window.btoa(unescape(encodeURIComponent(name)));
		};

		const preventDefault = (event: any) => {
			// Wrapper around prevent default.
			event.preventDefault();
		};

		const scrollEvent = throttle(() => {
			const totalItems = store.req.numDirs + store.req.numFiles;

			// All items are displayed
			if (showLimit >= totalItems) return;

			const currentPos = window.innerHeight + window.scrollY;

			// Trigger at the 75% of the window height
			const triggerPos = document.body.offsetHeight - window.innerHeight * 0.25;

			if (currentPos > triggerPos) {
				// Quantity of items needed to fill 2x of the window height
				const showQuantity = Math.ceil(
					(window.innerHeight * 2) / itemWeight.value
				);

				// Increase the number of displayed items
				showLimit += showQuantity;
			}
		}, 100);

		const dragEnter = () => {
			dragCounter.value++;

			// When the user starts dragging an item, put every
			// file on the listing with 50% opacity.
			let items: any = document.getElementsByClassName('item');

			Array.from(items).forEach((file: any) => {
				file.style.opacity = 0.5;
			});
		};

		const dragLeave = () => {
			dragCounter.value--;

			if (dragCounter.value == 0) {
				resetOpacity();
			}
		};

		const drop = async (event: any) => {
			event.preventDefault();

			dragCounter.value = 0;
			resetOpacity();

			let dt = event.dataTransfer;
			let el = event.target;

			if (dt.files.length <= 0) return;
			if (!store.showUploadModal) {
				store.changeUploadModal(true);
			}

			for (let i = 0; i < 5; i++) {
				if (el !== null && !el.classList.contains('item')) {
					el = el.parentElement;
				}
			}
			let files = await scanFiles(dt);
			let items = store.req.items;
			let path = route.path.endsWith('/') ? route.path : route.path + '/';

			if (
				el !== null &&
				el.classList.contains('item') &&
				el.dataset.dir === 'true'
			) {
				// Get url from ListingItem instance
				path = el.__vue__.url;

				try {
					items = (await store.fetchList(path)).items;
				} catch (error) {
					//this.$showError(error);
				}
			}

			let conflict = await checkConflict(files, items);
			if (conflict) {
				store.showHover({
					prompt: 'replace',
					confirm: (event: any) => {
						event.preventDefault();
						store.closeHovers();
						handleFiles(files, path, true);
					}
				});

				return;
			}

			await handleFiles(files, path);
		};

		const uploadInput = (event: any) => {
			store.closeHovers();
			if (!store.showUploadModal) {
				store.changeUploadModal(true);
			}
			let files = event.currentTarget.files;
			let folder_upload =
				files[0].webkitRelativePath !== undefined &&
				files[0].webkitRelativePath !== '';

			if (folder_upload) {
				for (let i = 0; i < files.length; i++) {
					let file = files[i];
					files[i].fullPath = file.webkitRelativePath;
				}
			}

			let path = route.path.endsWith('/') ? route.path : route.path + '/';
			let conflict = checkConflict(files, store.req.items);

			if (conflict) {
				store.showHover({
					prompt: 'replace',
					confirm: (event: any) => {
						event.preventDefault();
						store.closeHovers();
						handleFiles(files, path, true);
					}
				});

				return;
			}

			handleFiles(files, path);
		};

		const resetOpacity = () => {
			let items = document.getElementsByClassName('item');

			Array.from(items).forEach((file: any) => {
				file.style.opacity = 1;
			});
		};

		const setItemWeight = () => {
			// Listing element is not displayed
			if (listing.value == null) return;

			let itemQuantity = store.req.numDirs + store.req.numFiles;
			if (itemQuantity > showLimit) itemQuantity = showLimit;

			// How much every listing item affects the window height
			itemWeight.value = listing.value.offsetHeight / itemQuantity;
		};

		const fillWindow = (fit = false) => {
			const totalItems = store.req.numDirs + store.req.numFiles;

			// More items are displayed than the total
			if (showLimit >= totalItems && !fit) return;

			const windowHeight = window.innerHeight;

			// Quantity of items needed to fill 2x of the window height
			const showQuantity = Math.ceil(
				(windowHeight + windowHeight * 2) / itemWeight.value
			);

			// Less items to display than current
			if (showLimit > showQuantity && !fit) return;

			// Set the number of displayed items
			showLimit = showQuantity > totalItems ? totalItems : showQuantity;
		};

		const leftClick = () => {
			store.resetSelected();
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
			store.updateUser(data);
		};

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

		const updateSort = () => {
			$q.dialog({
				component: FileSortDialog
			}).onOk(async () => {
				// sort();
			});
		};

		const { t } = useI18n();

		return {
			store,
			listing,
			files,
			dirs,
			base64,
			uploadInput,
			width,
			leftClick,
			format,
			filesSortTypeInfo,
			switchView,
			viewMode,
			updateSort,
			t
		};
	}
});
</script>

<style scoped lang="scss">
.empty {
	img {
		width: 226px;
		height: 170px;
		margin-bottom: 20px;
	}
}
</style>
