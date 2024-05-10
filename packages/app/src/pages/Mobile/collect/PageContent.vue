<template>
	<div class="page-content">
		<collect-item
			v-for="(item, index) in collectStore.pagesList"
			:key="index"
			:item="item"
			class="q-mt-md"
		>
			<template v-slot:image>
				<q-img
					:src="
						item.image
							? item.image
							: getRequireImage('rss/page_default_img.svg')
					"
					class="image-avatar"
				>
					<template v-slot:loading>
						<q-img
							:src="getRequireImage('rss/page_default_img.svg')"
							class="image-avatar"
						/>
					</template>
					<template v-slot:error>
						<q-img
							:src="getRequireImage('rss/page_default_img.svg')"
							class="image-avatar"
						/>
					</template>
				</q-img>
			</template>
			<template v-slot:side>
				<collection-item-status class="status-white-bg">
					<template v-slot:status>
						<q-icon
							v-if="item.status === RssStatus.none"
							name="sym_r_bookmark_add"
							size="20px"
							class="text-grey-8"
							@click="onSaveEntry(item)"
						/>
						<q-icon
							v-if="item.status === RssStatus.added"
							name="sym_r_bookmark_added"
							size="20px"
							class="text-yellow-7"
						/>
						<q-icon
							v-if="item.status === RssStatus.removed"
							name="sym_r_bookmark_remove"
							size="20px"
							class="text-negative"
						/>
					</template>
				</collection-item-status>
			</template>
		</collect-item>
	</div>
</template>

<script setup lang="ts">
import { RssInfo, RssStatus } from './utils';
import CollectionItemStatus from './CollectionItemStatus.vue';
import CollectItem from './CollectItem.vue';
import { useCollectStore } from '../../../stores/collect';
import { useQuasar } from 'quasar';
import { getRequireImage } from '../../../utils/imageUtils';
const collectStore = useCollectStore();
const $q = useQuasar();

const onSaveEntry = async (item: RssInfo) => {
	$q.loading.show();
	await collectStore.addEntry(item);
	$q.loading.hide();
};
</script>

<style scoped lang="scss">
.page-content {
	width: 100%;
	height: 100%;
	.image-avatar {
		width: 44px;
		height: 44px;
		border-radius: 8px;
	}
	.status-white-bg {
		background: #fff;
	}
}
</style>
