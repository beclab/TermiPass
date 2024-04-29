<template>
	<q-drawer
		v-model="store.leftDrawerOpen"
		:behavior="behavior"
		show-if-above
		bordered
		:width="240"
		class="drawer"
	>
		<VaultsMenu />
	</q-drawer>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useMenuStore } from '../../stores/menu';
import VaultsMenu from './VaultsMenu.vue';

const store = useMenuStore();

const behavior = ref();

onMounted(async () => {
	if (process.env.PLATFORM === 'MOBILE' || process.env.PLATFORM === 'BEX') {
		behavior.value = 'default';
	} else {
		behavior.value = 'desktop';
	}
});
</script>

<style lang="scss">
.drawer {
	padding-top: 6px;
	overflow: hidden !important;
	background-color: #fff;
}
</style>
