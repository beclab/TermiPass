<template>
	<div
		class="text-body2 text-blue row items-center justify-center export-root"
		@click="exportMnemonics"
	>
		{{ $t('export_mnemonic_phrase') }}
	</div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/user';

const router = useRouter();
const userStore = useUserStore();

const exportMnemonics = async () => {
	if (!(await userStore.unlockFirst())) {
		return;
	}
	router.push('/backup_mnemonics');
};
</script>

<style scoped lang="scss">
.export-root {
	width: 100%;
	height: 30px;
}
</style>
