<template>
	<div class="vault-continer">
		<VaultsDrawer />
		<div class="vault-content">
			<ItemList @toolabClick="onItemClicked" />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import VaultsDrawer from '../../../layouts/TermipassLayout/VaultsDrawer.vue';
import ItemList from './../../Items/ItemList.vue';
// import { ref } from 'vue';
// const isBex = ref(process.env.IS_BEX);

const Router = useRouter();

function onItemClicked(itemid: string) {
	Router.push({
		path: '/items/' + (itemid ? itemid : '')
	});
}
</script>

<style lang="scss" scoped>
.vault-continer {
	width: 100%;
	height: 100%;
	background: $white;
	.vault-content {
		width: 100%;
		height: 100%;
	}
}
</style>
