<template>
	<!-- <PadLoginLayout v-if="isPad" /> -->
	<PhoneLoginLayout />
</template>

<script setup lang="ts">
// import { useQuasar } from 'quasar';
// import PadLoginLayout from './mobiles/PadLoginLayout.vue';
import PhoneLoginLayout from './mobiles/PhoneLoginLayout.vue';
// import { computed } from 'vue';

// const $q = useQuasar();

// const isPad = computed(() => {
// 	return $q.platform.is.nativeMobile && $q.platform.is.ipad;
// });
</script>

<style lang="scss" scoped></style>
