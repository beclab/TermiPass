<template>
	<div
		class="item text-ink-1"
		role="button"
		tabindex="0"
		:draggable="isDraggable"
		@dragstart="dragStart"
		@dragover="dragOver"
		@drop="drop"
		@click.stop="itemClick"
		:data-dir="item.isDir"
		:data-type="item.type"
		:aria-label="item.name"
		:aria-selected="isSelected"
	>
		<terminus-file-icon
			:name="item.name"
			:type="item.type"
			:path="item.path"
			:modified="item.modified"
			:is-dir="item.isDir"
			:origin="item.origin"
		/>

		<div v-if="viewMode === 'mosaic'" style="margin-top: 0.5rem">
			<span>{{ item.name }}</span>
		</div>
		<div v-else>
			<p class="name">{{ item.name }}</p>
			<p class="modified">
				<time :datetime="item.modified">
					{{ humanTime() }}
				</time>
			</p>
			<p class="type">{{ item.type || 'folder' }}</p>
			<p class="size" :data-order="humanSize()">
				{{ humanSize() }}
			</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	ref,
	computed,
	watch,
	nextTick,
	onMounted,
	defineProps,
	PropType,
	defineEmits
} from 'vue';
import { useDataStore } from '../../stores/data';
import { useOperateinStore } from '../../stores/operation';
import { format } from 'quasar';
import moment from 'moment';
import { files as api, seahub } from '../../api';
import { useRouter, useRoute } from 'vue-router';
import { checkSeahub } from '../../utils/file';
import TerminusFileIcon from '../common/TerminusFileIcon.vue';
import { useMenuStore } from '../../stores/files-menu';
import { notifyWarning } from '../../utils/notifyRedefinedUtil';

import { OPERATE_ACTION } from '../../utils/contact';
import { useI18n } from 'vue-i18n';

import { DriveItemType } from './../../api/common/encoding';

const props = defineProps({
	item: {
		type: DriveItemType,
		require: true
	},
	viewMode: {
		type: String,
		require: true
	}
});

const emits = defineEmits(['resetOpacity', 'closeMenu']);

const { humanStorageSize } = format;

const store = useDataStore();
const router = useRouter();
const menuStore = useMenuStore();
const route = useRoute();
const operateinStore = useOperateinStore();
const touches = ref<number>(0);
const selectIndex = ref<number | null>(null);
const renameRef = ref<any>(null);
const fileName = ref('');
const { t } = useI18n();

onMounted(() => {
	fileName.value = props.item.name;
});

watch(
	() => store.show,
	(newVal) => {
		if (newVal === 'rename') {
			store.addSelected(store.selected[0]);
			selectIndex.value = store.selected[0];
			nextTick(() => {
				renameRef.value.focus();
				renameRef.value.select();
				if (fileName.value.indexOf('.') > -1) {
					const endIndex = fileName.value.lastIndexOf('.');
					renameRef.value.setSelectionRange(0, endIndex, 'forward');
				} else {
					renameRef.value.setSelectionRange(0, -1);
				}
			});
		} else if (newVal === 'newFolder') {
			selectIndex.value = 0;
			nextTick(() => {
				renameRef.value.focus();
				renameRef.value.select();
			});
		} else {
			selectIndex.value = null;
		}
	}
);

const singleClick = computed(function () {
	return store.user.singleClick;
});

const isSelected = computed(function () {
	return store.selected.indexOf(props.item.index) !== -1;
});

const isDraggable = computed(function () {
	return store.user?.perm?.rename;
});

const canDrop = computed(function () {
	if (!props.item.isDir) return false;

	for (let i of store.selected) {
		if (store.req.items[i].url === props.item.url) {
			return false;
		}
	}

	return true;
});

const humanSize = () => {
	if (props.item.type == 'invalid_link') {
		return t('files.invalid_link');
	}

	if (
		(props.item.type == 'folder' || !props.item.type) &&
		props.item.fileSize
	) {
		return '-';
		// return humanStorageSize(props.item.fileSize) === '4.0KB'
		// 	? '0KB'
		// 	: humanStorageSize(props.item.fileSize);
	}

	return humanStorageSize(props.item.size) === '4.0KB'
		? '-'
		: humanStorageSize(props.item.size);
};

const humanTime = () => {
	if (store.user.dateFormat) {
		return moment(props.item.modified).format('L LT');
	}
	return moment(props.item.modified).fromNow();
};

const dragStart = () => {
	if (store.selectedCount === 0) {
		store.addSelected(props.item.index);
		return;
	}

	if (!isSelected.value) {
		store.resetSelected();
		store.addSelected(props.item.index);
	}
};

const dragOver = (event: any) => {
	if (!canDrop.value) return;

	event.preventDefault();
	let el = event.target;

	for (let i = 0; i < 5; i++) {
		if (!el.classList.contains('item')) {
			el = el.parentElement;
		}
	}

	el.style.opacity = 1;
};

const drop = async (event: any) => {
	let canMove = true;
	for (const item of store.selected) {
		if (operateinStore.disableMenuItem.includes(store.req.items[item].name)) {
			canMove = false;
			notifyWarning(t('files.the_files_contains_unmovable_items'));
			break;
		}
	}

	if (!canMove) return false;

	emits('resetOpacity');
	if (!canDrop.value) return;
	event.preventDefault();

	if (store.selectedCount === 0) return;

	operateinStore.handleFileOperate(
		event,
		{
			...route,
			path: props.item.url
		},
		OPERATE_ACTION.MOVE,
		async () => {}
	);
};

const itemClick = (event: any) => {
	emits('closeMenu');
	if (singleClick.value && !store.multiple) open();
	else click(event);
};

const click = (event: any) => {
	if (!singleClick.value && store.selectedCount !== 0) event.preventDefault();

	setTimeout(() => {
		touches.value = 0;
	}, 300);

	touches.value++;
	if (touches.value > 1) {
		open();
	}

	if (store.selected.indexOf(props.item.index) !== -1) {
		store.removeSelected(props.item.index);
		return;
	}

	if (event.shiftKey && store.selected.length > 0) {
		let fi = 0;
		let la = 0;

		if (props.item.index > store.selected[0]) {
			fi = store.selected[0] + 1;
			la = props.item.index;
		} else {
			fi = props.item.index;
			la = store.selected[0] - 1;
		}

		for (; fi <= la; fi++) {
			if (store.selected.indexOf(fi) == -1) {
				store.addSelected(fi);
			}
		}

		return;
	}

	if (
		!singleClick.value &&
		!event.ctrlKey &&
		!event.metaKey &&
		!store.multiple
	) {
		store.resetSelected();
	}

	store.addSelected(props.item.index);
};

const open = () => {
	if (props.item.isDir) {
		return router.push({
			path: props.item.url,
			query: {
				id: route.query.id,
				type: route.query.type
			}
		});
	}
	store.openFile(props.item, router);
};
</script>

<style lang="scss" scoped>
#listing.list .item {
	border-bottom: 1px solid $separator;
}

#listing .item[aria-selected='true'] {
	background: $background-selected;
}

#listing .item:hover {
	background: $background-hover;
}
</style>
