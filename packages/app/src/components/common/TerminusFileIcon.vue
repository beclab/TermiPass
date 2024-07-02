<template>
	<div class="row items-center justify-center">
		<template
			v-if="readOnly == undefined && type === 'image' && isThumbsEnabled"
		>
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
import { computed } from 'vue';
import { enableThumbs } from '../../utils/constants';
import { common as api } from '../../api';
import { useSeahubStore } from '../../stores/seahub';

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
	readOnly: {
		default: undefined,
		required: false
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
	const file = {
		path: props.path,
		modified: props.modified,
		repo_id: seahubStore.repo_id,
		repo_name: seahubStore.repo_name
	};

	return api.getPreviewURL(file, 'thumb');
});
</script>
