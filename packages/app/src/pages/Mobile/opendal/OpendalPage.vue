<template>
	<div
		class="column items-center justify-center"
		style="width: 100%; height: 100%"
	>
		<q-btn
			v-for="item in opendalService.supportAuthList"
			:key="item.type"
			flat
			no-caps
			style="margin-top: 30px"
		>
			<div
				class="text-body3"
				@click="opendalService.requestOpendalAuth(item.type)"
			>
				{{ item.name }}
			</div>
		</q-btn>
		<div style="margin-top: 30px">
			{{ dataList }}
		</div>
	</div>
</template>

<script setup lang="ts">
import { useOpendalStore } from '../../../stores/opendal';
import { onMounted } from 'vue';
import opendalService from '../../../services/opendal';
import { ref } from 'vue';
const opendalStore = useOpendalStore();
const dataList = ref();
onMounted(async () => {
	dataList.value = await opendalStore.getAccount('all');
});
</script>

<style scoped lang="scss"></style>
