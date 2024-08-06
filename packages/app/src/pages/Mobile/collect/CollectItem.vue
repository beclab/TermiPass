<template>
	<q-item class="collect-item">
		<q-item>
			<q-item-section avatar>
				<slot name="image" />
			</q-item-section>

			<q-item-section style="max-width: 200px">
				<q-item-label lines="1" class="text-subtitle3 text-grey-10">{{
					item.title
				}}</q-item-label>
				<q-item-label lines="1" class="text-overline text-grey-5">{{
					item.detail
				}}</q-item-label>
			</q-item-section>

			<q-item-section side style="padding-left: 5px">
				<slot name="side" />
			</q-item-section>
		</q-item>
	</q-item>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { BaseCollectInfo } from './utils';

defineProps({
	item: {
		type: Object as PropType<BaseCollectInfo>,
		required: true
	}
});
</script>

<style scoped lang="scss">
.collect-item {
	height: 68px;
	width: 100%;
	padding: 0;
	border-radius: 12px;
	border: 1px solid $grey-2;
}
</style>
