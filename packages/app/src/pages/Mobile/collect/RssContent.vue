<template>
	<div class="rss-content">
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
							v-if="item.status == RssStatus.none"
							name="sym_r_bookmark_add"
							size="20px"
							class="text-grey-8"
						/>
						<q-icon
							v-if="item.status == RssStatus.added"
							name="sym_r_bookmark_added"
							size="20px"
							class="text-yellow-7"
						/>
						<q-icon
							v-if="item.status == RssStatus.removed"
							name="sym_r_bookmark_remove"
							size="20px"
							class="text-negative"
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
import { RssInfo, RssStatus } from './utils';
import CollectionItemStatus from './CollectionItemStatus.vue';

const pagesList = ref<RssInfo[]>([
	{
		title: 'Upcoming releases - United States',
		detail: 'https://www.bbc.com/news/world-middle-east-67866346',
		logo: '',
		status: RssStatus.none
	},
	{
		title: 'Upcoming releases - United States',
		detail: 'https://www.bbc.com/news/world-middle-east-67866346',
		logo: '',
		status: RssStatus.added
	},
	{
		title: 'Upcoming releases - United States',
		detail: 'https://www.bbc.com/news/world-middle-east-67866346',
		logo: '',
		status: RssStatus.removed
	}
]);
</script>

<style scoped lang="scss">
.rss-content {
	width: 100%;
	height: 100%;
	.status-white-bg {
		background: #fff;
	}
}
</style>
