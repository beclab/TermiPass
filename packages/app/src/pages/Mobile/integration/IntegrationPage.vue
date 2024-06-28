<template>
	<div
		class="column items-center justify-center"
		style="width: 100%; height: 100%"
	>
		<q-btn
			v-for="item in integrationService.supportAuthList"
			:key="item.type"
			flat
			no-caps
			style="margin-top: 30px"
		>
			<div
				class="text-body3"
				@click="integrationService.requestIntegrationAuth(item.type)"
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
					@click="integrationStore.deleteAccount(item)"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useIntegrationStore } from '../../../stores/integration';
import { onMounted } from 'vue';
import integrationService from '../../../services/integration';
import { ref } from 'vue';
import { IntegrationAccountMiniData } from '../../../services/abstractions/integration/integrationService';
const integrationStore = useIntegrationStore();
const dataList = ref<IntegrationAccountMiniData[]>([]);
onMounted(async () => {
	dataList.value = await integrationStore.getAccount('all');
});
</script>

<style scoped lang="scss"></style>
