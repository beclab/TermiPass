<template>
	<div class="page-content">
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
							v-if="item.status == PageStatus.none"
							name="sym_r_add_box"
							size="20px"
							class="text-grey-8"
						/>
						<q-icon
							v-if="item.status == PageStatus.error"
							name="sym_r_error"
							size="20px"
							class="text-negative"
						/>
						<q-knob
							v-if="item.status == PageStatus.loading"
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
							v-if="item.status == PageStatus.cancel"
							name="sym_r_cancel"
							size="20px"
							class="text-negative"
						/>
						<q-icon
							v-if="item.status == PageStatus.success"
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
import { PageInfo, PageStatus } from './utils';
import CollectionItemStatus from './CollectionItemStatus.vue';

const pagesList = ref<PageInfo[]>([
	{
		title: 'Upcoming releases - United States',
		detail: 'https://www.bbc.com/news/world-middle-east-67866346',
		logo: '',
		status: PageStatus.none
	},
	{
		title: 'Upcoming releases - United States',
		detail: 'https://www.bbc.com/news/world-middle-east-67866346',
		logo: '',
		status: PageStatus.error
	},
	{
		title: 'Upcoming releases - United States',
		detail: 'https://www.bbc.com/news/world-middle-east-67866346',
		logo: '',
		status: PageStatus.loading,
		progress: 0.5
	},
	{
		title: 'Upcoming releases - United States',
		detail: 'https://www.bbc.com/news/world-middle-east-67866346',
		logo: '',
		status: PageStatus.cancel
	},
	{
		title: 'Upcoming releases - United States',
		detail: 'https://www.bbc.com/news/world-middle-east-67866346',
		logo: '',
		status: PageStatus.success
	}
]);
</script>

<style scoped lang="scss">
.page-content {
	width: 100%;
	height: 100%;
	.status-white-bg {
		background: #fff;
	}
}
</style>
