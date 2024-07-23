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
import { useRoute } from 'vue-router';

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

const route = useRoute();
const currentProps = ref();

watch(
	() => route.path,
	(newVal) => {
		if (newVal) {
			currentProps.value = {
				dragAndDrop: props.dragAndDrop,
				path: props.path,
				repoID: props.repoID
			};
		}
	}
);
</script>
