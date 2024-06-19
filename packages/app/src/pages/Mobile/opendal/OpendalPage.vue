<template>
	<div
		class="column items-center justify-center"
		style="width: 100%; height: 100%"
	>
		<q-btn
			v-for="item in OpendalService.supportAuthList"
			:key="item.type"
			flat
			no-caps
			style="margin-top: 30px"
		>
			<div
				class="text-body3"
				@click="OpendalService.requestOpendalAuth(item.type)"
			>
				{{ item.name }}
			</div>
		</q-btn>
	</div>
</template>

<script setup lang="ts">
import { useOpendalStore } from '../../../stores/opendal';
import { onMounted } from 'vue';
import OpendalService from '../../../services/opendal';
const opendalStore = useOpendalStore();

onMounted(() => {
	opendalStore.getAccount('all');
});
</script>

<style scoped lang="scss"></style>
