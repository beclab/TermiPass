<template>
	<div class="pdf-content">
		<collec-item
			v-for="(item, index) in pagesList"
			:key="index"
			:item="item"
			class="q-mt-md"
		>
			<template v-slot:side>
				<CollectionItemStatus class="status-white-bg">
					<template v-slot:status>
						<q-icon
							v-if="item.status == PDFStatus.none"
							name="sym_r_add_box"
							size="20px"
							class="text-grey-8"
						/>
						<q-knob
							v-if="item.status == PDFStatus.loading"
							v-model="item.progress"
							size="20px"
							:min="0"
							:max="1"
							:thickness="0.22"
							color="yellow-7"
							track-color="grey-1"
							class=""
						/>
						<q-icon
							v-if="item.status == PDFStatus.error"
							name="sym_r_error"
							size="20px"
							class="text-negative"
						/>
						<q-icon
							v-if="item.status == PDFStatus.success"
							name="sym_r_check_circle"
							size="20px"
							class="text-positive"
						/>
					</template>
				</CollectionItemStatus>
			</template>
		</collec-item>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CollecItem from './CollecItem.vue';
import { PDFInfo, PDFStatus } from './utils';
import CollectionItemStatus from './CollectionItemStatus.vue';

const pagesList = ref<PDFInfo[]>([
	{
		title: 'Upcoming releases - United States',
		detail: 'https://www.bbc.com/news/world-middle-east-67866346',
		logo: '',
		status: PDFStatus.none
	},
	{
		title: 'Upcoming releases - United States',
		detail: 'https://www.bbc.com/news/world-middle-east-67866346',
		logo: '',
		status: PDFStatus.loading,
		progress: 0.3
	},
	{
		title: 'Upcoming releases - United States',
		detail: 'https://www.bbc.com/news/world-middle-east-67866346',
		logo: '',
		status: PDFStatus.error
	},
	{
		title: 'Upcoming releases - United States',
		detail: 'https://www.bbc.com/news/world-middle-east-67866346',
		logo: '',
		status: PDFStatus.success
	}
]);
</script>

<style scoped lang="scss">
.pdf-content {
	width: 100%;
	height: 100%;
	.status-white-bg {
		background: #fff;
	}
}
</style>
