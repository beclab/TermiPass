<template>
	<div
		@contextmenu.prevent="rightClick($event, undefined)"
		@click.stop="leftClick"
		class="files-body"
	>
		<div
			class="empty column items-center justify-center full-height"
			v-if="
				filesStore.currentDirItems.length +
					filesStore.currentFileItems.length ==
				0
			"
		>
			<img src="../../../assets/images/empty.png" alt="empty" />
			<span class="text-body2 text-ink-1">{{ $t('files.lonely') }}</span>
		</div>
		<div
			v-else
			id="listing"
			ref="listing"
			:class="store.user.viewMode + ' file-icons'"
		>
			<BtScrollArea style="height: 100%">
				<div class="common-div" style="padding: 0 34px">
					<div class="item header">
						<div></div>
						<div>
							<p
								:class="{ active: nameSorted }"
								class="name"
								role="button"
								tabindex="0"
								@click="sort('name')"
								:title="$t('files.sortByName')"
								:aria-label="$t('files.sortByName')"
							>
								<span>{{ $t('files.name') }}</span>
								<i class="material-icons">{{ nameIcon }}</i>
							</p>

							<p
								:class="{ active: modifiedSorted }"
								class="modified"
								role="button"
								tabindex="0"
								@click="sort('modified')"
								:title="$t('files.sortByLastModified')"
								:aria-label="$t('files.sortByLastModified')"
							>
								<span>{{ $t('files.lastModified') }}</span>
								<i class="material-icons">{{ modifiedIcon }}</i>
							</p>

							<p
								:class="{ active: typeSorted }"
								class="type"
								role="button"
								tabindex="0"
								@click="sort('type')"
								:title="$t('files.typeBySize')"
								:aria-label="$t('files.typeBySize')"
							>
								<span>{{ $t('files.type') }}</span>
								<i class="material-icons">{{ typeIcon }}</i>
							</p>

							<p
								:class="{ active: sizeSorted }"
								class="size"
								role="button"
								tabindex="0"
								@click="sort('size')"
								:title="$t('files.sortBySize')"
								:aria-label="$t('files.sortBySize')"
							>
								<span>{{ $t('files.size') }}</span>
								<i class="material-icons">{{ sizeIcon }}</i>
							</p>
						</div>
					</div>
				</div>

				<div class="common-div" style="padding: 0 34px 40px">
					<ListingItem
						v-for="item in filesStore.currentDirItems"
						:key="base64(item.name)"
						:item="item"
						v-bind:viewMode="store.user.viewMode"
						@contextmenu.stop="rightClick($event, item)"
						@closeMenu="changeVisible"
						@resetOpacity="resetOpacity"
					>
					</ListingItem>

					<ListingItem
						v-for="item in filesStore.currentFileItems"
						:key="base64(item.name)"
						:item="item"
						v-bind:viewMode="store.user.viewMode"
						@contextmenu.stop="rightClick($event, item)"
						@closeMenu="changeVisible"
						@resetOpacity="resetOpacity"
					>
					</ListingItem>
				</div>
			</BtScrollArea>
		</div>

		<index-uploader
			:dragAndDrop="true"
			:path="fileUploaderPath"
			:repoID="repoId"
		/>

		<OperateMenuVue
			:clientX="clientX"
			:clientY="clientY"
			:offsetRight="offsetRight"
			:offsetBottom="offsetBottom"
			:menuVisible="menuVisible"
			:menuList="menuList"
			@changeVisible="changeVisible"
		/>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
// import { format } from 'quasar';
import { useRoute } from 'vue-router';
import throttle from 'lodash.throttle';
import { useDataStore } from '../../../stores/data';
import { files as api } from '../../../api';
import {
	checkConflict,
	createCopiedFile,
	scanFiles,
	handleFiles
} from '../../../utils/upload';
import { stopScrollMove, startScrollMove } from '../../../utils/utils';
import { disabledClick } from '../../../utils/file';
import ListingItem from '../../../components/files/ListingItem.vue';
import OperateMenuVue from '../../../components/files/files/OperateMenu.vue';
import { OPERATE_ACTION } from '../../../utils/contact';

import { useOperateinStore } from './../../../stores/operation';

import IndexUploader from './../uploader/IndexUploader.vue';

import { useFilesStore } from './../../../stores/files';
import { useMenuStore } from './../../../stores/files-menu';

const store = useDataStore();
const route = useRoute();
const operateinStore = useOperateinStore();

const dragCounter = ref<number>(0);
const itemWeight = ref<number>(0);
const listing = ref<any>(null);
const clientX = ref<number>(0);
const clientY = ref<number>(0);
const offsetRight = ref<number>(0);
const offsetBottom = ref<number>(0);
const menuVisible = ref(false);
const menuList = ref<undefined | object>({});
const width = ref<number>(window.innerWidth);
let showLimit = 50;
const repoId = ref();
const fileUploaderPath = ref();

const filesStore = useFilesStore();
const menuStore = useMenuStore();

watch(
	() => filesStore.currentFileList,
	(newVal) => {
		showLimit = 50;

		nextTick(() => {
			setItemWeight();
			fillWindow(true);
		});
	},
	{
		deep: true
	}
);

watch(
	() => route.path,
	() => {
		menuVisible.value = false;
		repoId.value = route.query.id;

		const currentItem = menuStore.activeMenu.label;

		fileUploaderPath.value =
			route.path.slice(route.path.indexOf(currentItem) + currentItem.length) ||
			'/';
	}
);

const nameSorted = computed(function () {
	// return store.req.sorting.by === 'name';
	return filesStore.activeSort.by === 1;
});

const sizeSorted = computed(function () {
	// return store.req.sorting.by === 'size';
	return filesStore.activeSort.by === 2;
});

const typeSorted = computed(function () {
	// return store.req.sorting.by === 'type';
	return filesStore.activeSort.by === 3;
});

const modifiedSorted = computed(function () {
	// return store.req.sorting.by === 'modified';
	return filesStore.activeSort.by === 4;
});

const ascOrdered = computed(function () {
	// return store.req.sorting.asc;
	return filesStore.activeSort.asc;
});

const nameIcon = computed(function () {
	if (nameSorted.value && ascOrdered.value) {
		return 'arrow_upward';
	}
	return 'arrow_downward';
});

const sizeIcon = computed(function () {
	if (sizeSorted.value && ascOrdered.value) {
		return 'arrow_upward';
	}
	return 'arrow_downward';
});

const modifiedIcon = computed(function () {
	if (modifiedSorted.value && ascOrdered.value) {
		return 'arrow_upward';
	}
	return 'arrow_downward';
});

const typeIcon = computed(function () {
	if (typeSorted.value && ascOrdered.value) {
		return 'arrow_upward';
	}
	return 'arrow_downward';
});

onMounted(() => {
	// How much every listing item affects the window height
	setItemWeight();

	// Fill and fit the window with listing items
	fillWindow(true);

	// Add the needed event listeners to the window and document.
	window.addEventListener('keydown', keyEvent);
	window.addEventListener('scroll', scrollEvent);
	window.addEventListener('resize', windowsResize);

	if (!store.user?.perm?.create) return;
	document.addEventListener('dragover', preventDefault);
	document.addEventListener('dragenter', dragEnter);
	document.addEventListener('dragleave', dragLeave);
	document.addEventListener('drop', drop);
});

onUnmounted(() => {
	// Remove event listeners before destroying this page.
	window.removeEventListener('keydown', keyEvent);
	window.removeEventListener('scroll', scrollEvent);
	window.removeEventListener('resize', windowsResize);

	if (store.user && !store.user?.perm?.create) return;
	document.removeEventListener('dragover', preventDefault);
	document.removeEventListener('dragenter', dragEnter);
	document.removeEventListener('dragleave', dragLeave);
	document.removeEventListener('drop', drop);
});

const base64 = (name: string) => {
	return window.btoa(unescape(encodeURIComponent(name)));
};

const keyEvent = (event: any) => {
	// No prompts are shown
	if (store.show !== null) {
		return;
	}

	// Esc!
	if (event.keyCode === 27) {
		// Reset files selection.
		filesStore.resetSelected();
	}

	// Del!
	if (event.keyCode === 46) {
		if (!store.user.perm.delete || filesStore.selectedCount == 0) return;

		// Show delete prompt.
		store.showHover('delete');
	}

	// F2!
	if (event.keyCode === 113) {
		if (!store.user.perm.rename || filesStore.selectedCount !== 1) return;

		// Show rename prompt.
		store.showHover('rename');
	}

	// Ctrl is pressed
	if (!event.ctrlKey && !event.metaKey) {
		return;
	}

	let key = String.fromCharCode(event.which).toLowerCase();

	switch (key) {
		case 'f':
			event.preventDefault();
			store.showHover('search');
			break;
		case 'c':
			optionAction(event, OPERATE_ACTION.COPY);
			break;
		case 'x':
			optionAction(event, OPERATE_ACTION.CUT);
			break;
		case 'v':
			optionAction(event, OPERATE_ACTION.PASTE);
			break;
		case 'a':
			event.preventDefault();
			for (let file of filesStore.currentFileItems) {
				if (filesStore.selected.indexOf(file.index) === -1) {
					filesStore.addSelected(file.index);
				}
			}
			for (let dir of filesStore.currentDirItems) {
				if (filesStore.selected.indexOf(dir.index) === -1) {
					filesStore.addSelected(dir.index);
				}
			}
			break;
		case 's':
			event.preventDefault();
			document.getElementById('download-button')?.click();
			break;
	}
};

const preventDefault = (event: any) => {
	// Wrapper around prevent default.
	event.preventDefault();
};

const optionAction = (event: any, type: OPERATE_ACTION) => {
	operateinStore.handleFileOperate(event, route, type, async () => {});
};

const scrollEvent = throttle(() => {
	const totalItems =
		filesStore.currentDirItems.length + filesStore.currentFileItems.length;

	// All items are displayed
	if (showLimit >= totalItems) return;

	const currentPos = window.innerHeight + window.scrollY;

	// Trigger at the 75% of the window height
	const triggerPos = document.body.offsetHeight - window.innerHeight * 0.25;

	if (currentPos > triggerPos) {
		// Quantity of items needed to fill 2x of the window height
		const showQuantity = Math.ceil((window.innerHeight * 2) / itemWeight.value);

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
		const newfile = await createCopiedFile(files, items);
		handleFiles(newfile, path, true);
		return;
	}

	await handleFiles(files, path);
};

const resetOpacity = () => {
	let items = document.getElementsByClassName('item');

	Array.from(items).forEach((file: any) => {
		file.style.opacity = 1;
	});
};

const sort = async (by: string) => {
	let asc = true;
	let selfBy = 0;

	if (by === 'name') {
		selfBy = 1;
		if (nameIcon.value === 'arrow_upward') {
			asc = false;
		}
	} else if (by === 'size') {
		selfBy = 2;
		if (sizeIcon.value === 'arrow_upward') {
			asc = false;
		}
	} else if (by === 'type') {
		selfBy = 3;
		if (typeIcon.value === 'arrow_upward') {
			asc = false;
		}
	} else if (by === 'modified') {
		selfBy = 4;
		if (modifiedIcon.value === 'arrow_upward') {
			asc = false;
		}
	}

	filesStore.updateActiveSort(selfBy, asc);

	// try {
	// 	await users.update(
	// 		{ id: store.user.id, sorting: { by, asc } },
	// 		['sorting']
	// 	);
	// } catch (e) {
	// 	//this.$showError(e);
	// }

	// store.setReload(true);
};

const windowsResize = throttle(() => {
	width.value = window.innerWidth;

	// Listing element is not displayed
	if (listing.value == null) return;

	// How much every listing item affects the window height
	setItemWeight();

	// Fill but not fit the window
	fillWindow();
}, 100);

const setItemWeight = () => {
	// Listing element is not displayed
	if (listing.value == null) return;

	let itemQuantity =
		filesStore.currentDirItems.length + filesStore.currentFileItems.length;
	if (itemQuantity > showLimit) itemQuantity = showLimit;

	// How much every listing item affects the window height
	itemWeight.value = listing.value.offsetHeight / itemQuantity;
};

const fillWindow = (fit = false) => {
	const totalItems =
		filesStore.currentDirItems.length + filesStore.currentFileItems.length;

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

const rightClick = (e: any, item?: any) => {
	console.log('currentFileList', filesStore.currentFileList);
	console.log('rightClickrightClick', item);
	if (!disabledClick(route.path)) {
		return false;
	}

	if (e.target.offsetParent!.classList[1] === 'header') {
		return false;
	}

	offsetRight.value = document.body.clientWidth - e.clientX;
	offsetBottom.value = document.body.clientHeight - e.clientY;

	e.preventDefault();

	if (process.env.PLATFORM !== 'FILES') {
		clientX.value = e.clientX - 216;
		clientY.value = e.clientY - 12;
	} else {
		clientX.value = e.clientX;
		clientY.value = e.clientY;
	}

	menuList.value = item;
	menuVisible.value = true;
	stopScrollMove(e);
	if (filesStore.selected.length === 0) {
		item && filesStore.addSelected(item.index);
		return;
	}
	if (item && filesStore.selected.indexOf(item.index) === -1) {
		filesStore.resetSelected();
		filesStore.addSelected(item.index);
	}
};

const leftClick = (e: any) => {
	if (menuVisible.value) {
		menuVisible.value = false;
		startScrollMove(e);
	}
	filesStore.resetSelected();
};

const changeVisible = (e: any) => {
	menuVisible.value = false;
	startScrollMove(e);
};
</script>

<style scoped lang="scss">
.empty {
	img {
		width: 226px;
		height: 170px;
		margin-bottom: 20px;
	}
}

#listing {
	position: relative;
	overflow: hidden;
}

.files-body {
	width: 100%;
	height: 100%;
}
</style>
