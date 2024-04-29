<template>
	<div class="row itemWrap">
		<div
			class="column col-6"
			:style="{
				borderRight: `${!$q.platform.is.mobile ? '1px solid #e0e0e0' : 0} `
			}"
		>
			<OrgVaultsList />
		</div>

		<div class="col-6">
			<OrgVaultsView />
		</div>
	</div>
</template>

<script lang="ts" setup>
import OrgVaultsList from './OrgVaultsList.vue';
import OrgVaultsView from './OrgVaultsView.vue';
import { useQuasar } from 'quasar';
const $q = useQuasar();
</script>

<style lang="scss" scoped>
.itemWrap {
	height: 100%;
}
</style>
