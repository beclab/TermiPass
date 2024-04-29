<template>
	<div class="item-status-bg row items-center justify-center">
		<slot name="status" />
	</div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.item-status-bg {
	width: 32px;
	height: 32px;
	border-radius: 8px;
}
</style>
