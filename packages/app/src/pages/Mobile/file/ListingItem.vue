<template>
	<div
		class="mobile-item"
		role="button"
		tabindex="0"
		:draggable="isDraggable"
		@dragstart="dragStart"
		@dragover="dragOver"
		@drop="drop"
		@click="itemClick"
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

		<q-icon
			v-if="viewMode === 'mosaic'"
			name="sym_r_more_horiz"
			size="20px"
			@click.stop="fileOperation"
			style="
				position: absolute;
				right: 0px;
				top: 0px;
				cursor: pointer;
				border-radius: 12px;
			"
		>
		</q-icon>

		<div v-if="viewMode === 'mosaic'" style="margin-top: 0.3rem">
			<span class="name text-color-title">{{ name }}</span>
			<div class="modified text-color-sub-title">
				{{ formatFileModified(modified, 'YYYY-MM-DD') + ' · ' + humanSize() }}
			</div>
		</div>
		<div v-else style="width: 100%" class="q-pl-md">
			<div style="width: 100%" class="row items-center justify-between">
				<div class="column justify-center" style="width: calc(100% - 32px)">
					<div class="name text-color-title">{{ name }}</div>
					<div class="modified text-color-sub-title" style="max-width: 100%">
						{{ formatFileModified(modified) + ' · ' + humanSize() }}
					</div>
				</div>
				<div
					class="column justify-center items-center"
					style="height: 32px; width: 32px"
					@click.stop="fileOperation"
				>
					<q-icon name="sym_r_more_horiz" size="20px" class="grey-8"> </q-icon>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useDataStore } from '../../../stores/data';
import { format, useQuasar } from 'quasar';
const { humanStorageSize } = format;
import { files as api, seahub } from '../../../api';
import * as upload from '../../../utils/upload';
import { useRouter, useRoute } from 'vue-router';
import { checkSeahub } from '../../../utils/file';
import { fetchURL } from '../../../api/utils';
import { useSeahubStore } from '../../../stores/seahub';
import TerminusFileIcon from '../../../components/common/TerminusFileIcon.vue';
import FileOperationDialog from './FileOperationDialog.vue';
import { formatFileModified } from '../../../utils/file';

export default defineComponent({
	name: 'ListingItem',
	components: { TerminusFileIcon },
	props: [
		'name',
		'isDir',
		'url',
		'type',
		'size',
		'modified',
		'index',
		'readOnly',
		'path',
		'viewMode',
		'extension',
		'id'
	],

	setup(props) {
		const store = useDataStore();
		const router = useRouter();
		const route = useRoute();

		const seahubStore = useSeahubStore();

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
			return props.type == 'invalid_link'
				? 'invalid link'
				: humanStorageSize(props.size);
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
			if (!canDrop.value) return;
			event.preventDefault();

			if (store.selectedCount === 0) return;
			let el = event.target;
			for (let i = 0; i < 5; i++) {
				if (el !== null && !el.classList.contains('item')) {
					el = el.parentElement;
				}
			}

			let items: any = [];

			for (let i of store.selected) {
				items.push({
					from: store.req.items[i].url,
					to: props.url + encodeURIComponent(store.req.items[i].name),
					name: store.req.items[i].name
				});
			}

			const splitVal = route.path.split('/').filter((s) => {
				return s && s.trim();
			});
			let path = splitVal[splitVal.length - 1];
			let baseItems = (await api.fetch(path)).items;
			let action = (overwrite: any, rename: any) => {
				if (checkSeahub(route.path)) {
					const pathLen =
						route.path.indexOf(store.currentItem) + store.currentItem.length;

					const dst_parent_dir = items[0].to.slice(
						pathLen,
						items[0].to.indexOf(items[0].name) - 1
					);
					const src_parent_dir = items[0].from.slice(
						pathLen,
						items[0].from.indexOf(items[0].name)
					);
					const prams = {
						dst_parent_dir: dst_parent_dir,
						dst_repo_id: seahubStore.repo_id,
						src_dirents: <any>[],
						src_parent_dir: src_parent_dir,
						src_repo_id: seahubStore.repo_id
					};
					for (let i = 0; i < items.length; i++) {
						const el = items[i];
						prams.src_dirents.push(el.name);
					}

					seahub.batchMoveItem(prams);
					store.setReload(true);
					return false;
				}

				api
					.move(items, overwrite, rename)
					.then(() => {
						store.setReload(true);
					})
					.catch(/*this.$showError*/);
			};
			let conflict = upload.checkConflict(items, baseItems);
			let overwrite = false;
			let rename = false;
			if (conflict) {
				store.showHover({
					prompt: 'replace-rename',
					confirm: (event: any, option: any) => {
						overwrite = option == 'overwrite';
						rename = option == 'rename';

						event.preventDefault();
						store.closeHovers();
						action(overwrite, rename);
					}
				});
				return;
			}
			action(overwrite, rename);
		};

		const itemClick = () => {
			open();
		};

		const fetchFileContent = async (file: any) => {
			const currentItemLength = store.currentItem.length;
			const startIndex =
				file.path.indexOf(store.currentItem) + currentItemLength;
			const hasSeahub = file.path.slice(startIndex);
			const res = await fetchURL(
				`/seahub/lib/${seahubStore.repo_id}/file${hasSeahub}?dict=1`,
				{}
			);
			return res;
		};

		const $q = useQuasar();

		const fileOperation = () => {
			console.log(props.index);
			$q.dialog({
				component: FileOperationDialog,
				componentProps: {
					id: props.id,
					index: props.index,
					name: props.name,
					modified: props.modified,
					type: props.type,
					readOnly: props.readOnly,
					isDir: props.isDir
				}
			});
		};

		const open = async () => {
			let item = { ...props, checkSeahub: checkSeahub(props.url) };
			if (checkSeahub(item.path) && item.isDir === false) {
				if (['audio', 'video'].includes(item.type)) {
					const res: any = await fetchFileContent(item);
					item.url = store.baseURL() + res.data.raw_path; //res.data.raw_path
					console.log(item.url);
				} else if (['text', 'txt', 'textImmutable'].includes(item.type)) {
					const res: any = await fetchFileContent(item);
					(item as any).content = res.data.file_content;
				}
				store.updateRequest(item);
			} else {
				if (item.isDir === false) {
					router.push({
						path: props.url,
						query: {
							name: props.name
						}
					});
				} else {
					let id = route.query.id;
					if (!id && props.id) {
						seahubStore.setRepoId({
							id: props.id,
							name: props.name
						});
						store.changeItemMenu(props.name);
						id = props.id;
					}
					router.push({
						path: props.url,
						query: {
							id: id,
							name: props.name
						}
					});
				}
			}
		};

		return {
			humanSize,
			dragStart,
			dragOver,
			drop,
			fileOperation,
			itemClick,
			isSelected,
			isDraggable,
			formatFileModified
		};
	}
});
</script>
