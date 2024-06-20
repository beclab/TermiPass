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
		<div style="margin-top: 100px">
			<div
				v-for="item in dataList"
				:key="item.name + item.type"
				class="row items-center justify-between"
				style="margin-bottom: 30px"
			>
				<div>{{ item.type }}</div>
				<div>{{ item.name }}</div>
				<q-btn
					flat
					no-caps
					label="Delete"
					@click="opendalStore.deleteAccount(item)"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useOpendalStore } from '../../../stores/opendal';
import { onMounted } from 'vue';
import opendalService from '../../../services/opendal';
import { ref } from 'vue';
import { IntegrationAccountMiniData } from '../../../services/abstractions/opendal/opendalService';
const opendalStore = useOpendalStore();
const dataList = ref<IntegrationAccountMiniData[]>([]);
onMounted(async () => {
	dataList.value = await opendalStore.getAccount('all');
});
</script>

<style scoped lang="scss"></style>
