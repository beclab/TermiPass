<template>
	<div
		class="text-color- root row items-center justify-start"
		@click="toggle(name)"
		:style="{
			border: check ? '1px solid $blue' : ''
		}"
		:class="check ? 'text-blue' : 'text-ink-2'"
	>
		<q-icon class="walletIcon" :name="icon" />
		<div class="text-subtitle1">
			{{ name }}
		</div>
	</div>
</template>

<script setup lang="ts">
defineProps({
	name: {
		type: String,
		default: 'ETH',
		required: false
	},
	icon: {
		type: String,
		default: 'fa-brands fa-facebook',
		required: false
	},
	check: {
		type: Boolean,
		default: false,
		required: false
	}
});
const emit = defineEmits(['toggle']);

const toggle = (name: string) => {
	emit('toggle', name);
};
</script>

<style lang="scss" scoped>
.root {
	height: 56px;
	line-height: 56px;
	border-radius: 4px;
	border-radius: 10px;
	border: 1px solid $separator;
	cursor: pointer;
	&:hover {
		border: 1px solid $blue;
	}

	.walletIcon {
		margin-left: 18px;
		margin-right: 8px;
	}
}
</style>
