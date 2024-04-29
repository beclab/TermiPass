<template>
	<div class="row items-center justify-end header-content">
		<div class="scan-icon row items-center justify-center" @click="scanQrCode">
			<q-img src="../../assets/common/scan_qr.svg" width="24px" />
		</div>

		<div class="avatar q-ml-xs">
			<TerminusAvatar
				:info="userStore.terminusInfo()"
				:size="40"
				@click="enterAccounts"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/user';
const userStore = useUserStore();

const router = useRouter();

const enterAccounts = () => {
	router.push('/accounts');
};

const scanQrCode = () => {
	router.push({
		path: '/scanQrCode'
	});
};
</script>

<style scoped lang="scss">
.header-content {
	width: 100%;
	.scan-icon {
		width: 40px;
		height: 40px;
	}
}
.avatar {
	height: 40px;
	width: 40px;
	overflow: hidden;
	border-radius: 20px;
}
</style>
