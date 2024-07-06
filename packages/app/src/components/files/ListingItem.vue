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
		:data-dir="isDir"
		:data-type="type"
		:aria-label="name"
		:aria-selected="isSelected"
	>
		<terminus-file-icon
			:name="name"
			:type="type"
			:read-only="readOnly"
			:path="path"
			:modified="modified"
			:is-dir="isDir"
		/>

		<div v-if="viewMode === 'mosaic'" style="margin-top: 0.5rem">
			<span>{{ name }}</span>
		</div>
		<div v-else>
			<p class="name">{{ name }}</p>
			<p class="modified">
				<time :datetime="modified">
					{{ humanTime() }}
				</time>
			</p>
			<p class="type">{{ type || 'folder' }}</p>
			<p class="size" :data-order="humanSize()">
				{{ humanSize() }}
			</p>
		</div>
	</div>
</template>

<script lang="ts">
import {
	defineComponent,
	ref,
	computed,
	watch,
	nextTick,
	onMounted
} from 'vue';
import { useDataStore } from '../../stores/data';
import { useFilesStore } from '../../stores/files';
import { useOperateinStore } from '../../stores/operation';
import { format } from 'quasar';
const { humanStorageSize } = format;
import moment from 'moment';
import { files as api, seahub } from '../../api';
import { useRouter, useRoute } from 'vue-router';
//import url from './../../utils/url';
//import { checkSeahub } from '../../utils/file';
import TerminusFileIcon from '../common/TerminusFileIcon.vue';
import { useMenuStore } from '../../stores/files-menu';
import { notifyWarning } from '../../utils/notifyRedefinedUtil';

import { OPERATE_ACTION } from '../../utils/contact';
import { useI18n } from 'vue-i18n';

export default defineComponent({
	name: 'ListingItem',
	components: { TerminusFileIcon },
	props: [
		'name',
		'isDir',
		'url',
		'type',
		'size',
		'fileSize',
		'modified',
		'index',
		'readOnly',
		'path',
		'viewMode',
		'extension'
	],

	setup(props, { emit }) {
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
		const filesStore = useFilesStore();

		onMounted(() => {
			fileName.value = props.name;
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
			return props.readOnly == undefined && store.user.singleClick;
		});

		const isSelected = computed(function () {
			return store.selected.indexOf(props.index) !== -1;
		});

		const isDraggable = computed(function () {
			return props.readOnly == undefined && store.user?.perm?.rename;
		});

		const canDrop = computed(function () {
			if (!props.isDir || props.readOnly !== undefined) return false;

			for (let i of store.selected) {
				if (store.req.items[i].url === props.url) {
					return false;
				}
			}

			return true;
		});

		const humanSize = () => {
			if (props.type == 'invalid_link') {
				return t('files.invalid_link');
			}

			if ((props.type == 'folder' || !props.type) && props.fileSize) {
				return '-';
				// return humanStorageSize(props.fileSize) === '4.0KB'
				// 	? '0KB'
				// 	: humanStorageSize(props.fileSize);
			}

			return humanStorageSize(props.size) === '4.0KB'
				? '-'
				: humanStorageSize(props.size);
		};

		const humanTime = () => {
			if (props.readOnly == undefined && store.user.dateFormat) {
				return moment(props.modified).format('L LT');
			}
			return moment(props.modified).fromNow();
		};

		const dragStart = () => {
			if (store.selectedCount === 0) {
				store.addSelected(props.index);
				return;
			}

			if (!isSelected.value) {
				store.resetSelected();
				store.addSelected(props.index);
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
				if (
					operateinStore.disableMenuItem.includes(store.req.items[item].name)
				) {
					canMove = false;
					notifyWarning(t('files.the_files_contains_unmovable_items'));
					break;
				}
			}

			if (!canMove) return false;

			emit('resetOpacity');
			if (!canDrop.value) return;
			event.preventDefault();

			if (store.selectedCount === 0) return;

			operateinStore.handleFileOperate(
				event,
				{
					...route,
					path: props.url
				},
				OPERATE_ACTION.MOVE,
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				async () => {}
			);
		};

		const itemClick = (event: any) => {
			emit('closeMenu');
			if (singleClick.value && !store.multiple) open();
			else click(event);
		};

		const click = (event: any) => {
			if (!singleClick.value && store.selectedCount !== 0)
				event.preventDefault();

			setTimeout(() => {
				touches.value = 0;
			}, 300);

			touches.value++;
			if (touches.value > 1) {
				open();
			}

			if (store.selected.indexOf(props.index) !== -1) {
				store.removeSelected(props.index);
				return;
			}

			if (event.shiftKey && store.selected.length > 0) {
				let fi = 0;
				let la = 0;

				if (props.index > store.selected[0]) {
					fi = store.selected[0] + 1;
					la = props.index;
				} else {
					fi = props.index;
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

			store.addSelected(props.index);
		};

		const open = async () => {
			let item = { ...props };
			// if (checkSeahub(item.path) && item.isDir === false) {
			// 	item = await seahub.formatFileContent(item);
			// 	store.updateRequest(item);
			// } else {
			// 	if (item.isDir === false) {
			// 		router.push({
			// 			path: props.url,
			// 			query: {
			// 				type: 'preview'
			// 			}
			// 		});
			// 	} else {
			// 		router.push({
			// 			path: props.url,
			// 			query: {
			// 				id: route.query.id,
			// 				type: route.query.type
			// 			}
			// 		});
			// 	}
			// }
			filesStore.setFilePath({
				path: item.url,
				isDir: item.isDir,
				driveType: item.driveType,
				param: ''
			});
		};

		return {
			humanTime,
			humanSize,
			dragStart,
			dragOver,
			drop,
			itemClick,
			touches,
			isSelected,
			isDraggable,
			selectIndex,
			renameRef,
			fileName
		};
	}
});
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
