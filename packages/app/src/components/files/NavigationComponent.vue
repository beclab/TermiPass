<template>
	<div style="width: 66px">
		<q-btn
			icon="chevron_left"
			flat
			dense
			:disabled="filesStore.hasBackPath ? false : true"
			@click="goBack"
			class="btn-no-text btn-no-border btn-size-sm"
			:class="filesStore.hasBackPath ? 'items-no-drag' : ''"
			color="ink-3"
			:style="{
				pointerEvents: `${filesStore.hasBackPath ? 'auto' : 'none'}`
			}"
		/>
		<q-btn
			icon="chevron_right"
			flat
			dense
			:disabled="filesStore.hasPrevPath ? false : true"
			@click="goForward"
			class="btn-no-text btn-no-border btn-size-sm"
			:class="filesStore.hasPrevPath ? 'items-no-drag' : ''"
			color="ink-3"
			:style="{
				pointerEvents: `${filesStore.hasPrevPath ? 'auto' : 'none'}`
			}"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFilesStore } from '../../stores/files';
// import { useNavigationStore } from './../../stores/navigation-stack';

const router = useRouter();
const filesStore = useFilesStore();
// const navigationStore = useNavigationStore();

const goBack = () => {
	filesStore.back();
};

const goForward = () => {
	filesStore.previous();
};
</script>

<style lang="scss" scoped></style>
