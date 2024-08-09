<template>
	<div class="row items-center justify-end header-content">
		<div
			v-if="scan"
			class="scan-icon row items-center justify-center"
			@click="scanQrCode"
		>
			<q-img
				:src="
					$q.dark.isActive
						? getRequireImage('common/dark_scan_qr.svg')
						: getRequireImage('common/scan_qr.svg')
				"
				width="20px"
			/>
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
import { getRequireImage } from 'src/utils/imageUtils';

const props = defineProps({
	scan: {
		type: Boolean,
		required: false,
		default: true
	}
});

const userStore = useUserStore();

const router = useRouter();

const enterAccounts = () => {
	router.push('/accounts');
};

const scanQrCode = () => {
	if (!props.scan) {
		return;
	}
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
