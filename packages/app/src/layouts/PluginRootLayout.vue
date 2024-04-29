<template>
	<router-view v-if="isnotification"></router-view>
	<template v-else>
		<!-- <div class="webos-app-wrapper" style="margin-bottom: 16px" v-if="extraShow">
			<PluginGoogleSearch></PluginGoogleSearch>
			<PluginYoutebuSearch></PluginYoutebuSearch>
		</div> -->
		<div
			class="webos-app-container"
			style="position: fixed; top: 0; right: 0; bottom: 0"
		>
			<div
				v-show="show"
				style="position: relative; overflow-x: hidden; width: 450px"
			>
				<router-view></router-view>
			</div>
			<div class="aside-wrapper" @click="toggle" :style="asideStyle">
				<img
					class="aside-icon"
					:style="asideIconStyle"
					src="~assets/images/vault-plugin.svg"
					alt=""
				/>
			</div>
		</div>
	</template>
</template>

<script setup lang="ts">
// import PluginGoogleSearch from '../pages/Plugin/GoogleSearch.vue';
// import PluginYoutebuSearch from 'pages/Plugin/YoutebuSearch.vue';
import { useQuasar } from 'quasar';
import { ref, watchEffect } from 'vue';
import { useUserStore } from '../stores/user';
import { setAssetsUrl } from '../stores/bex-url';
import urlUtils from '../utils/url';
const userStore = useUserStore();
const searchParamsObj = urlUtils.getSearchParamsObj();

const $q = useQuasar();
const show = ref(false);
const extraShow = ref(false);
const isnotification = ref(searchParamsObj.notification);
const toggle = () => {
	show.value = !show.value;
	console.log(
		'getSearchParamsObj',
		searchParamsObj,
		searchParamsObj.q,
		searchParamsObj.v
	);
};

$q?.bex?.on('webos.app.status', ({ data, respond }) => {
	console.log(data);
	toggle();
	respond();
});

const initExtensionURL = async () => {
	const data = await $q?.bex?.send('webos.app.url', {
		init: true
	});
	setAssetsUrl(data.data);
};

initExtensionURL();

watchEffect(() => {
	extraShow.value =
		!!userStore.current_id &&
		!!userStore?.current_user?.access_token &&
		!!searchParamsObj.q;
});

const asideWidth = '48px';
const asideStyle: any = {
	position: 'absolute',
	top: '50%',
	left: `calc(-1 * ${asideWidth})`,
	width: asideWidth,
	height: '40px',
	cursor: 'pointer',
	display: 'flex',
	alignItems: 'center',
	borderRadius: '20px 0 0 20px',
	background: '#fff'
};

const asideIconStyle: any = {
	width: '32px',
	height: '32px',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	borderRadius: '50%',
	marginLeft: '4px'
};
</script>

<style></style>
<style lang="scss" scoped>
.webos-app-container {
	background: #ffffff;
	z-index: 5999;
	filter: drop-shadow(0px 0px 12px rgba(0, 0, 0, 0.12));
	text-align: left;
}
</style>
