<template>
	<q-splitter v-model="splitterModel" :limits="[30, 70]" style="height: 100vh">
		<template v-slot:before>
			<IndexList />
		</template>

		<template v-slot:after>
			<IndexView v-if="settingMode" :settingMode="settingMode" />
		</template>
	</q-splitter>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import IndexView from './IndexView.vue';
import IndexList from './IndexList.vue';

const settingMenu = ['Account', 'Security', 'Display', 'Tools', 'Rebinding'];

export default defineComponent({
	name: 'SettingsIndex',
	components: {
		IndexView,
		IndexList
	},
	setup() {
		let mode = ref(1);
		const setting = ref(settingMenu);
		const Router = useRouter();
		const Route = useRoute();

		const settingMode = ref(1);
		const splitterModel = ref(40);

		watch(
			() => Route.params.mode,
			(newValue, oldValue) => {
				if (newValue == oldValue) {
					return;
				}

				settingMode.value = newValue;
			}
		);

		const setMode = (menu: number) => {
			mode.value = menu;
			Router.push({
				path: '/settings/' + (mode.value ? mode.value : '')
			});

			console.log('Route.params', Route.params);
		};

		const myTweak = () => {
			return { height: '100%' };
		};

		return {
			mode,
			setting,
			setMode,
			myTweak,
			settingMode,
			splitterModel
		};
	}
});
</script>

<style scoped lang="scss">
.setting {
	padding-top: 20px;

	.settingItem {
		height: 58px;
		line-height: 58px;
		border-bottom: 0.5px solid #ececec;
		box-sizing: border-box;

		&.itemActive {
			border-left: 2px solid $blue;
		}
	}
}
</style>
