<template>
	<header class="q-pa-xs header-bar">
		<slot />

		<div>
			<slot name="info" />
		</div>

		<div
			id="dropdown"
			:class="{ active: store.show === 'more' }"
			class="q-pr-md"
		>
			<slot name="actions" />
		</div>

		<!-- <action v-if="$slots.actions" id="more" icon="more_vert" :label="$t('buttons.more')"
      @action="store.showHover('more')" /> -->

		<!-- <div class="overlay" v-show="store.show == 'more'" @click="store.closeHovers()" /> -->
	</header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useDataStore } from '../../../stores/data';
import { logoURL } from '../../../utils/constants';

// import Action from './Action.vue';

export default defineComponent({
	name: 'header-bar',
	props: {
		showLogo: {
			type: Boolean,
			required: false
		},
		showMenu: {
			type: Boolean,
			required: false
		}
	},
	components: {
		// Action
	},
	setup() {
		const store = useDataStore();
		const openSidebar = () => {
			store.showHover('sidebar');
		};

		return {
			store,
			logoURL,
			openSidebar
		};
	}
});
</script>

<style lang="scss">
header.header-bar {
	z-index: 1000;
	position: fixed;
	top: 0;
	left: 0;
	padding: 0;
	display: flex;
	padding: 0.5em 0.5em 0.5em 1em;
	align-items: center;

	> * {
		flex: 0 0 auto;
	}

	title {
		display: block;
		flex: 1 1 auto;
		padding: 0 1em;
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: 1.2em;
	}

	.overlay {
		width: 0;
		height: 0;
	}

	a,
	a:hover {
		color: inherit;
	}

	> div:first-child > .action,
	img {
		margin-right: 1em;
	}

	img {
		height: 2.5em;
	}

	.action span {
		display: none;
	}

	> div div {
		vertical-align: middle;
		position: relative;
	}
}
</style>
