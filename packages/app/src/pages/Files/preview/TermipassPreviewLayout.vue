<template>
	<div
		class="row justify-center content-center items-center preview-layout-root"
	>
		<router-view />
	</div>
	<prompts-component />
</template>

<script setup lang="ts">
import PromptsComponent from '../../../components/files/prompts/PromptsComponent.vue';
</script>

<style lang="scss" scoped>
.preview-layout-root {
	width: 100vw;
	height: 100vh;
}
</style>
