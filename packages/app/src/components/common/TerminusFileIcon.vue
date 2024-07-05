<template>
	<div class="row items-center justify-center">
		<template v-if="type === 'image' && isThumbsEnabled">
			<img
				style="border-radius: 4px"
				:src="thumbnailUrl"
				@error.once="
					(e) => {
						e.target.src = fileIcon(name);
					}
				"
			/>
		</template>

		<img
			v-else-if="isDir || !type || type === 'folder'"
			:src="folderIcon(name)"
			style="width: 32px; height: 32px"
		/>
		<img v-else :src="fileIcon(name)" style="width: 32px; height: 32px" />
	</div>
</template>

<script lang="ts" setup>
import { getFileType } from '../../utils/file';
import { computed, PropType } from 'vue';
import { enableThumbs } from '../../utils/constants';
import { common as api } from '../../api';
import { useSeahubStore } from '../../stores/seahub';
import { DriveItemType, OriginType } from './../../api/common/encoding';

const props = defineProps({
	name: {
		type: String,
		default: '',
		required: true
	},
	type: {
		type: String,
		default: '',
		required: true
	},
	modified: {
		type: String,
		default: '',
		required: false
	},
	path: {
		type: String,
		default: '',
		required: false
	},
	isDir: {
		type: Boolean,
		default: false,
		required: false
	},
	origin: {
		type: String as PropType<OriginType>,
		default: OriginType.DRIVE,
		required: false
	}
});

const seahubStore = useSeahubStore();

const folderIcon = (name: any) => {
	let src = '/img/folder-';

	if (process.env.PLATFORM == 'DESKTOP') {
		src = './img/folder-';
	}

	let arr = ['Documents', 'Pictures', 'Movies', 'Downloads', 'Music'];
	if (arr.includes(name)) {
		src = src + name + '.svg';
	} else {
		src = src + 'default.svg';
	}
	return src;
};

const fileIcon = (name: any) => {
	let src = '/img/file-';
	let folderSrc = '/img/file-blob.svg';

	if (process.env.PLATFORM == 'DESKTOP') {
		src = './img/file-';
		folderSrc = './img/file-blob.svg';
	}

	if (name.split('.').length > 1) {
		src = src + getFileType(name) + '.svg';
	} else {
		src = folderSrc;
	}

	return src;
};

const isThumbsEnabled = computed(function () {
	return enableThumbs;
});

const thumbnailUrl = computed(function () {
	const file: DriveItemType = {
		repo_id: seahubStore.repo_id,
		repo_name: seahubStore.repo_name,
		extension: '',
		isDir: false,
		isSymlink: false,
		mode: 0,
		modified: props.modified,
		name: props.name,
		path: props.path,
		size: 0,
		type: 'image',
		origin: props.origin
	};

	return api.getPreviewURL(file, 'thumb');
});
</script>
