<template>
	<div class="cloud-domain-manager-root">
		<DomainsList />
		<terminus-title-bar style="position: absolute; top: 0">
			<template v-slot:right>
				<div
					class="scan-icon row items-center justify-center"
					@click="scanQrCode"
				>
					<q-img src="../../../../assets/common/scan_qr.svg" width="24px" />
				</div>
			</template>
		</terminus-title-bar>
	</div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import TerminusTitleBar from '../../../../components/common/TerminusTitleBar.vue';
import DomainsList from './DomainsList.vue';

const router = useRouter();
const scanQrCode = () => {
	router.push({
		path: '/scanQrCode'
	});
};
</script>

<style lang="scss" scoped>
.cloud-domain-manager-root {
	width: 100%;
	height: 100%;
	position: relative;
}
</style>
