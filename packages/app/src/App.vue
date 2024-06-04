<template>
	<bt-theme />
	<div
		@touchstart="startSwipe"
		@touchmove="handleSwipe"
		@touchend="endSwipe"
		v-if="$q.platform.is.ios"
	>
		<router-view />
	</div>
	<ShadowRoot v-else-if="isBex" id="webos-content-root">
		<router-view />
	</ShadowRoot>
	<router-view v-else />
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, watchEffect } from 'vue';
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';
import { configPlatform } from './platform/appFirstLoadCommon';
import { useQuasar } from 'quasar';
import { getAppPlatform } from './platform/appPlatform';
import { getNativeAppPlatform } from './platform/capacitor/capacitorPlatform';
import { useUserStore } from './stores/user';
import { ShadowRoot } from 'vue-shadow-dom';

import { login } from './utils/auth';
import { ref } from 'vue';
import { watch } from 'vue';
import urlUtils from './utils/url';

const searchParamsObj = urlUtils.getSearchParamsObj();

//@ts-ignore
// split this style file
(() => import('./css/styles.css'))();

export default defineComponent({
	name: 'App',
	components: {
		ShadowRoot
	},
	async preFetch({ redirect, currentRoute }) {
		if (process.env.PLATFORM !== 'FILES') {
			await getAppPlatform().appRedirectUrl(redirect, currentRoute);
		}
		await login('', '');
	},
	setup() {
		const userStore = useUserStore();
		const $q: any = useQuasar();
		const isBex =
			process.env.IS_BEX &&
			process.env.NODE_ENV !== 'development' &&
			!searchParamsObj.notification;
		const route = useRoute();
		const router = useRouter();
		if (process.env.PLATFORM !== 'FILES') {
			configPlatform($q);
			getAppPlatform().appLoadPrepare({
				route,
				router,
				quasar: $q
			});
		}

		onMounted(async () => {
			if (process.env.PLATFORM === 'FILES') {
				router.replace({
					path: '/Files/Home/'
				});
			}

			let state = $q.platform.is.mobile;
			if (state) {
				import('./css/listing-mobile.css').then(() => {});
			} else {
				import('./css/listing.css').then(() => {});
			}

			if (process.env.PLATFORM !== 'FILES') {
				getAppPlatform().appMounted();
			}
		});

		onUnmounted(() => {
			if (process.env.PLATFORM !== 'FILES') {
				getAppPlatform().appUnMounted();
			}
		});

		const transitionName = ref();

		onBeforeRouteUpdate((to, from, next) => {
			transitionName.value = '';
			next();
		});

		const position = ref(-1);

		watch(
			() => route.path,
			() => {
				if (router.options.history.state) {
					if ($q.platform.is.mobile && position.value != -1) {
						if (route.meta.tabIdentify) {
							transitionName.value =
								Number(router.options.history.state.position) >= position.value
									? ''
									: 'slide-right';
						} else {
							if (route.meta.noReturn || route.path.startsWith('/files')) {
								transitionName.value = '';
							} else {
								transitionName.value =
									Number(router.options.history.state.position) >=
									position.value
										? 'slide-left'
										: 'slide-right';
							}
						}
					}
					position.value = Number(router.options.history.state.position);
				}
			}
		);

		watchEffect(() => {
			$q?.bex?.send('webos.user.status', {
				login:
					!!userStore.current_id &&
					!!userStore.password &&
					userStore?.current_user?.access_token
			});
		});

		let startX = 0;
		let deltaX = 0;
		let isSwiping = false;

		const startSwipe = (event: any) => {
			if (!$q.platform.is.ios || !$q.platform.is.nativeMobile) {
				return;
			}
			startX = event.touches[0].clientX;
			deltaX = 0;
			if (startX > 50) {
				return;
			}
			isSwiping = true;
		};

		const handleSwipe = (event: any) => {
			if (!$q.platform.is.ios || !$q.platform.is.nativeMobile) {
				return;
			}
			if (!isSwiping) return;

			deltaX = event.touches[0].clientX - startX;

			// You can add additional logic to handle vertical swipes if needed
		};

		const endSwipe = () => {
			if (!$q.platform.is.ios || !$q.platform.is.nativeMobile) {
				return;
			}
			if (!isSwiping) return;

			if (deltaX > 30) {
				// Swipe to the right, trigger back navigation
				getNativeAppPlatform().hookBackAction();
			}

			startX = 0;
			deltaX = 0;
			isSwiping = false;
		};

		return {
			transitionName,
			startSwipe,
			handleSwipe,
			endSwipe,
			isBex
		};
	}
});
</script>

<style>
/* @import './css/styles.css'; */

.slide-right-enter-active,
.slide-left-enter-active,
.slide-right-leave-active,
.slide-left-leave-active {
	box-shadow: -20px 0 20px 0px rgba(0, 0, 0, 0.1);
	will-change: transform;
	transition: all 0.3s ease-out;
	position: absolute;
}

.slide-right-enter-from {
	opacity: 0;
	transform: translateX(-50%);
}

.slide-right-leave-to {
	z-index: 100;
	transform: translateX(102%);
}

.slide-right-leave-from {
	box-shadow: -20px 0 20px 0px rgba(0, 0, 0, 0.1);
}

.slide-left-enter-from {
	z-index: 100;
	transform: translateX(100%);
	box-shadow: -20px 0 20px 0px rgba(0, 0, 0, 0.1);
}

.slide-left-leave-to {
	opacity: 0.4;
	transform: translateX(-50%);
}
</style>
