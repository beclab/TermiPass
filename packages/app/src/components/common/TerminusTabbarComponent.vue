<template>
	<div class="tabs-root">
		<div class="tabs-content">
			<div class="bg-grey-2" style="width: 100%; height: 1px"></div>
			<div class="items-bg" />
		</div>

		<div class="tabs-items row items-center justify-evenly">
			<div
				v-for="(item, index) in tabs"
				:key="item.identify"
				:style="`width:calc((100% - 20px)/${tabs.length})`"
				@click="updateCurrent(index)"
				class="tab-item column justify-end items-center"
			>
				<div v-if="current !== index">
					<img
						:src="getRequireImage(`tabs/${item.normalImage}.svg`)"
						class="tab-icon-size"
					/>
				</div>
				<div v-else class="tab-icon-active-bg"></div>

				<div
					class="tab-title-base text-body3"
					:class="current !== index ? 'text-grey-6' : 'text-title'"
				>
					{{ item.name }}
				</div>

				<div class="active-circle-bg" v-if="current == index"></div>
				<div
					class="row items-center justify-center active-icon"
					v-if="current == index"
				>
					<img
						:src="getRequireImage(`tabs/${item.activeImage}.svg`)"
						class="tab-icon-size"
					/>
				</div>
			</div>
		</div>

		<div class="safe-area-bottom"></div>
	</div>
</template>

<script setup lang="ts">
import { TabbarItem } from '../../utils/constants';
import { PropType } from 'vue';

import { getRequireImage } from '../../utils/imageUtils';
import { useRouter } from 'vue-router';

const props = defineProps({
	tabs: {
		type: Object as PropType<TabbarItem[]>,
		default: [] as TabbarItem[],
		required: true
	},
	current: {
		type: Number,
		default: 0,
		required: true
	}
});

const emit = defineEmits(['updateCurrent']);

const $router = useRouter();

const updateCurrent = (index: number) => {
	if (index === props.current) {
		return;
	}
	if (props.tabs[index].to) {
		$router.push(props.tabs[index].to);
		return;
	}
	emit('updateCurrent', index);
};
</script>

<style scoped lang="scss">
.tabs-root {
	width: 100%;

	.tabs-content {
		height: 80px;
		width: 100%;
		padding-top: 16px;

		.items-bg {
			width: 100%;
			height: 64px;
			background-color: $white;
		}
	}

	.tabs-items {
		height: 85px;
		width: 100%;
		margin-top: -85px;

		.tab-item {
			height: 100%;

			.tab-title-base {
				line-height: 14px;
				text-align: center;
				margin-bottom: 5px;
			}

			.tab-icon-size {
				height: 24px;
				width: 24px;
			}

			.tab-icon-active-bg {
				margin-top: 5px;
				border-radius: 30px;
				background-color: $white;
				width: 60px;
				height: 60px;
				border-color: $grey-2;
				border-width: 1px;
				border-style: solid;
				border-top: 50%;
			}
		}
	}

	.safe-area-bottom {
		width: 100%;
		height: calc(env(safe-area-inset-bottom));
	}

	.active-icon {
		width: 46px;
		height: 46px;
		position: absolute;
		top: 10px;
		border-radius: 23px;
		border-width: 1px;
		border-color: $grey-2;
		border-style: solid;
	}

	.active-circle-bg {
		position: absolute;
		top: 17px;
		width: 65px;
		height: 46px;
		background-color: $white;
	}
}
</style>
