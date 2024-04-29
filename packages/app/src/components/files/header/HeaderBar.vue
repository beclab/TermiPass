<template>
	<header class="q-pa-xs">
		<slot />

		<div>
			<slot name="info" />
		</div>

		<div
			id="dropdown"
			:class="{ active: store.show === 'more' }"
			class="q-pr-xs"
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

<style></style>
