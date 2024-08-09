<template>
	<component
		:is="repoID ? SyncUploader : DriveUploader"
		v-bind="currentProps"
	></component>
</template>

<script setup lang="ts">
import DriveUploader from './DriveUploader.vue';
import SyncUploader from './SyncUploader.vue';
import { ref, watch } from 'vue';
// import { useRoute } from 'vue-router';
import { useMenuStore } from './../../../stores/files-menu';

const props = defineProps({
	dragAndDrop: {
		type: Boolean,
		required: false
	},
	path: {
		type: String,
		required: false
	},
	repoID: {
		type: String,
		required: false
	}
});

// const route = useRoute();
const menuStore = useMenuStore();
const currentProps = ref();

watch(
	() => [props.path, props.repoID],
	(newVal) => {
		if (newVal) {
			currentProps.value = {
				dragAndDrop: props.dragAndDrop,
				path: props.path,
				repoID: props.repoID
			};
		}
	},
	{
		immediate: true
	}
);
</script>
