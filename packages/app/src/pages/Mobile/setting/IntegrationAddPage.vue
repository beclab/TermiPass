<template>
	<div class="integration-root">
		<terminus-title-bar
			right-icon="sym_r_add"
			@on-right-click="addClick"
			:title="t('add_account')"
		/>
		<terminus-scroll-area class="integration-scroll">
			<template v-slot:content> </template>
		</terminus-scroll-area>
	</div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style scoped lang="scss"></style>
