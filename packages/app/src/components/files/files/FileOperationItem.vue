<template>
	<q-item
		clickable
		v-close-popup
		class="file-operation-item q-pb-md"
		@click="handle($event, action!)"
	>
		<div class="file-operation-div row justify-start items-center">
			<q-icon :name="icon" size="20px" />
			<div class="file-operation-text text-body3">{{ label }}</div>
		</div>
	</q-item>
</template>

<script lang="ts" setup>
import { useOperateinStore } from './../../../stores/operation';
import { PropType } from 'vue';
import { useRoute } from 'vue-router';
import { OPERATE_ACTION } from '../../../utils/contact';

const props = defineProps({
	icon: String,
	label: String,
	action: Object as PropType<OPERATE_ACTION>,
	repo: {
		type: Boolean,
		default: false
	}
});

const route = useRoute();
const operateinStore = useOperateinStore();

const emit = defineEmits(['onItemClick', 'hideMenu']);

const handle = (e: any, action: OPERATE_ACTION) => {
	// if (props.repo) {
	// 	handleRepoOperate(e, action);
	// } else {
	emit('hideMenu');
	operateinStore.handleFileOperate(
		e,
		route,
		action,
		async (action: OPERATE_ACTION, data: any) => {
			if (!props.repo) {
				emit('onItemClick', action, data);
			}
		}
	);
	// }
};
</script>

<style scoped lang="scss">
.file-operation-item {
	// width: 135px;
	height: 36px;
	margin: 0;
	padding: 0;
	border-radius: 8px;

	.file-operation-div {
		width: 100%;
		height: 100%;
		padding: 8px;

		.file-operation-text {
			color: $sub-title;
			margin-left: 8px;
		}
	}
}
</style>
