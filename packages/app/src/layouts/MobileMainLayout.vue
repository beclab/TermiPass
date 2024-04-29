<template>
	<q-layout view="lhr lpr lfr" class="lauout lauout-app">
		<div
			class="mainlayout"
			:style="{ width: isBex ? '100%' : '100vw' }"
			:class="{
				'mainlayout-ios': $q.platform.is.ios && menuStore.useSafeArea,
				'background-white': !menuStore.hideBackground
			}"
		>
			<q-page-container style="width: 100%; height: 100%">
				<div
					:class="
						defaultIndex >= 0 && defaultIndex < tabs.length
							? 'container-show-tabbar'
							: 'container-hide-tabbar'
					"
				>
					<router-view />
				</div>
				<tabbar-component
					v-if="defaultIndex >= 0 && defaultIndex < tabs.length"
					class="tabbar"
					:class="$q.platform.is.ios ? 'tabbar-ios' : ''"
					:tabs="tabs"
					:current="defaultIndex"
					@update-current="updateCurrent"
				/>
			</q-page-container>
		</div>
	</q-layout>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import TabbarComponent from '../components/common/TerminusTabbarComponent.vue';
import { getAppPlatform } from '../platform/appPlatform';
import '../css/terminus.scss';
import { useMenuStore } from '../stores/menu';
import { useSocketStore } from '../stores/websocketStore';

export default defineComponent({
	name: 'MobileMainLayout',
	components: {
		TabbarComponent
	},
	setup() {
		const Route = useRoute();

		const menuStore = useMenuStore();
		const socketStore = useSocketStore();
		const isBex = process.env.IS_BEX;

		onMounted(async () => {
			getAppPlatform().homeMounted();
		});

		onUnmounted(() => {
			getAppPlatform().homeUnMounted();
		});

		let tabs = ref(getAppPlatform().tabbarItems);

		const defaultIndex = ref(-1);

		const updateCurrent = (index: number) => {
			defaultIndex.value = index;
		};

		watch(
			() => Route.meta,
			() => {
				if (!Route.meta || !(Route.meta as any).tabIdentify) {
					defaultIndex.value = -1;
					return;
				}
				defaultIndex.value = tabs.value.findIndex(
					(e) => e.identify === (Route.meta as any).tabIdentify
				);
			},
			{
				immediate: true
			}
		);

		watch(
			() => Route.path,
			() => {
				if (process.env.PLATFORM == 'MOBILE') {
					socketStore.restart();
				}
			},
			{
				immediate: true
			}
		);

		return {
			tabs,
			defaultIndex,
			updateCurrent,
			menuStore,
			isBex
		};
	}
});
</script>

<style lang="scss" scoped>
.mainlayout-ios {
	@extend .mainlayout;
	padding-top: env(safe-area-inset-top);
	padding-bottom: env(safe-area-inset-bottom);
}

.lauout-app {
	perspective: 500;
	-webkit-perspective: 500;

	touch-callout: none;
	-webkit-touch-callout: none;
	user-select: none;
	-webkit-user-select: none;
}

.mainlayout {
	position: absolute;
}

.mainlayout {
	height: 100vh;
}

.background-white {
	background-color: $white;
}

// }
.container-show-tabbar {
	height: calc(100% - 65px);
	width: 100%;
}

.container-hide-tabbar {
	height: 100%;
	width: 100%;
}

.rotate {
	animation: aniRotate 0.8s linear infinite;

	&:hover {
		background: transparent !important;
	}
}

@keyframes aniRotate {
	0% {
		transform: rotate(0deg);
	}

	50% {
		transform: rotate(180deg);
	}

	100% {
		transform: rotate(360deg);
	}
}

.tabbar {
	position: absolute;
	bottom: 1px;
	width: 100%;
}
</style>
