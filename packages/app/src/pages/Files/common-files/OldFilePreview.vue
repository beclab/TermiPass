<template>
	<div
		id="previewer"
		@mousemove="toggleNavigation"
		@touchstart="toggleNavigation"
	>
		<header-bar>
			<action icon="close" :label="$t('buttons.close')" @action="close()" />
			<title>{{ name }}</title>
			<action
				:disabled="store.loading"
				v-if="isResizeEnabled && store.req.type === 'image'"
				:icon="fullSize ? 'photo_size_select_large' : 'hd'"
				@action="toggleSize"
			/>

			<template #actions>
				<!-- <action
					:disabled="store.loading"
					v-if="store.user?.perm?.rename"
					icon="mode_edit"
					:label="$t('buttons.rename')"
					show="rename-dialog"
				/> -->
				<action
					:disabled="store.loading"
					v-if="store.user?.perm?.delete"
					icon="delete"
					:label="$t('buttons.delete')"
					@action="deleteFile"
					id="delete-button"
				/>
				<action
					:disabled="store.loading"
					v-if="store.user?.perm?.download"
					icon="file_download"
					:label="$t('buttons.download')"
					@action="download"
				/>
				<action
					:disabled="store.loading"
					icon="info"
					:label="$t('buttons.info')"
					show="info"
				/>
			</template>
		</header-bar>

		<BtLoading
			:show="true"
			v-if="store.loading"
			textColor="#4999ff"
			color="#4999ff"
			text=""
			backgroundColor="rgba(0, 0, 0, 0)"
		>
		</BtLoading>
		<template v-else>
			<div class="preview">
				<ExtendedImage
					v-if="store.req.type == 'image'"
					:src="raw"
				></ExtendedImage>
				<audio
					v-else-if="store.req.type == 'audio'"
					ref="player"
					:src="raw"
					controls
					:autoplay="autoPlay"
					@play="autoPlay = true"
				></audio>
				<!-- <video
					v-else-if="store.req.type == 'video'"
					ref="player"
					:src="raw"
					controls
					:autoplay="autoPlay"
					@play="autoPlay = true"
				>
					<track
						kind="captions"
						v-for="(sub, index) in subtitles"
						:key="index"
						:src="sub"
						:label="'Subtitle ' + index"
						:default="index === 0"
					/>
					Sorry, your browser doesn't support embedded videos, but
					don't worry, you can <a :href="downloadUrl">download it</a>
					and watch it with your favorite video player!
				</video> -->
				<video-player
					v-else-if="store.req.type == 'video'"
					src="seafhttp/files/8ee8f2ac-2a6b-4ddd-8299-851ec41e4f32/e0c23560410371e6c018e9b852168c.mp4"
					controls
					:loop="true"
					:volume="1"
				/>
				<object
					v-else-if="
						store.req?.extension?.toLowerCase() == '.pdf' &&
						!store.req.checkSeahub
					"
					class="pdf"
					:data="raw"
				></object>
				<div
					v-else-if="store.req.type == 'blob' || store.req.checkSeahub"
					class="info"
				>
					<div class="title">
						<i class="material-icons">feedback</i>
						{{ $t('files.noPreview') }}
					</div>
					<div>
						<a target="_blank" :href="downloadUrl" class="button button--flat">
							<div>
								<i class="material-icons">file_download</i
								>{{ $t('buttons.download') }}
							</div>
						</a>
						<a
							target="_blank"
							:href="raw"
							class="button button--flat"
							v-if="!store.req.isDir"
						>
							<div>
								<i class="material-icons">open_in_new</i
								>{{ $t('buttons.openFile') }}
							</div>
						</a>
					</div>
				</div>
			</div>
		</template>

		<button
			@click="prev"
			@mouseover="hoverNav = true"
			@mouseleave="hoverNav = false"
			:class="{ hidden: !hasPrevious || !showNav }"
			:aria-label="$t('buttons.previous')"
			:title="$t('buttons.previous')"
		>
			<i class="material-icons">chevron_left</i>
		</button>
		<button
			@click="next"
			@mouseover="hoverNav = true"
			@mouseleave="hoverNav = false"
			:class="{ hidden: !hasNext || !showNav }"
			:aria-label="$t('buttons.next')"
			:title="$t('buttons.next')"
		>
			<i class="material-icons">chevron_right</i>
		</button>
		<link rel="prefetch" :href="previousRaw" />
		<link rel="prefetch" :href="nextRaw" />
	</div>
</template>

<script lang="ts">
import {
	defineComponent,
	ref,
	onMounted,
	onUnmounted,
	computed,
	watch
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import url from '../../../utils/url';
import throttle from 'lodash.throttle';
import { files as api } from '../../../api';
import { useDataStore } from '../../../stores/data';
import { resizePreview } from '../../../utils/constants';
import { checkSeahub } from '../../../utils/file';
import HeaderBar from '../../../components/files/header/HeaderBar.vue';
import Action from '../../../components/files/header/Action.vue';
import ExtendedImage from '../../../components/files/ExtendedImage.vue';
import { VideoPlayer } from '@videojs-player/vue';
import 'video.js/dist/video-js.css';

const mediaTypes = ['image', 'video', 'audio', 'blob'];

export default defineComponent({
	name: 'FilePreview',
	components: {
		HeaderBar,
		Action,
		ExtendedImage,
		VideoPlayer
	},
	setup() {
		const store = useDataStore();
		const route = useRoute();
		const router = useRouter();

		watch(
			() => route.path,
			() => {
				updatePreview();
				toggleNavigation();
			}
		);

		const previousLink = ref('');
		const nextLink = ref('');
		const name = ref('');
		const previousRaw = ref();
		const nextRaw = ref();
		const fullSize = ref(false);
		const hoverNav = ref(false);
		const autoPlay = ref(false);
		const showNav = ref(true);
		const player = ref<any>(null);
		const subtitles = ref<any>([]);
		const listing = ref<any>([]);
		let navTimeout: any = null;

		const hasPrevious = computed(function () {
			return previousLink.value !== '';
		});

		const hasNext = computed(function () {
			return nextLink.value !== '';
		});

		const downloadUrl = computed(function () {
			return api.getDownloadURL(store.req, false, true);
		});

		const raw = computed(function () {
			if (store.req.type === 'image' && !fullSize.value) {
				return api.getPreviewURL(store.req, 'thumb');
			}
			return api.getDownloadURL(store.req, true);
		});

		const isResizeEnabled = computed(function () {
			return resizePreview;
		});

		onMounted(() => {
			window.addEventListener('keydown', key);
			listing.value = store.oldReq.items;
			updatePreview();
		});

		onUnmounted(() => {
			window.removeEventListener('keydown', key);
		});

		const deleteFile = () => {
			store.showHover({
				prompt: 'delete',
				confirm: () => {
					listing.value = listing.value.filter(
						(item: any) => item.name !== name.value
					);

					if (hasNext.value) {
						next();
					} else if (!hasPrevious.value && !hasNext.value) {
						close();
					} else {
						prev();
					}
				}
			});
		};

		const prev = () => {
			hoverNav.value = false;
			router.replace({ path: previousLink.value });
		};

		const next = () => {
			hoverNav.value = false;
			router.replace({ path: nextLink.value });
		};

		const key = (event: any) => {
			if (store.show !== null) {
				return;
			}

			if (event.which === 13 || event.which === 39) {
				// right arrow
				if (hasNext.value) next();
			} else if (event.which === 37) {
				// left arrow
				if (hasPrevious.value) prev();
			} else if (event.which === 27) {
				// esc
				close();
			}
		};

		const updatePreview = async () => {
			if (player.value && player.value.paused && !player.value.ended) {
				autoPlay.value = false;
			}

			if (store.req.subtitles) {
				subtitles.value = api.getSubtitlesURL(store.req);
			}

			let dirs = route.fullPath.split('/');
			name.value = decodeURIComponent(dirs[dirs.length - 1]);

			if (!listing.value) {
				try {
					const path = url.removeLastDir(route.path);
					const res = await api.fetch(path);
					listing.value = res.items;
				} catch (e) {
					//this.$showError(e);
				}
			}

			previousLink.value = '';
			nextLink.value = '';

			for (let i = 0; i < listing.value.length; i++) {
				if (listing.value[i].name !== name.value) {
					continue;
				}

				for (let j = i - 1; j >= 0; j--) {
					if (mediaTypes.includes(listing.value[j].type)) {
						previousLink.value = listing.value[j].url;
						previousRaw.value = prefetchUrl(listing.value[j]);
						break;
					}
				}
				for (let j = i + 1; j < listing.value.length; j++) {
					if (mediaTypes.includes(listing.value[j].type)) {
						nextLink.value = listing.value[j].url;
						nextRaw.value = prefetchUrl(listing.value[j]);
						break;
					}
				}

				return;
			}
		};

		const prefetchUrl = (item: any) => {
			if (item.type !== 'image') {
				return '';
			}
			return fullSize.value
				? api.getDownloadURL(item, true)
				: api.getPreviewURL(item, 'thumb');
		};

		const toggleSize = () => {
			fullSize.value = !fullSize.value;
		};

		const toggleNavigation = throttle(() => {
			showNav.value = true;

			if (navTimeout) {
				clearTimeout(navTimeout);
			}

			navTimeout = setTimeout(() => {
				showNav.value = false || hoverNav.value;
				navTimeout = null;
			}, 1500);
		}, 500);

		const close = async () => {
			if (!checkSeahub(store.req.path)) {
				router.back();
				store.updateRequest({});
			} else {
				store.resetRequest();
			}
		};

		const download = async () => {
			window.open(await downloadUrl.value);
		};

		return {
			store,
			isResizeEnabled,
			toggleNavigation,
			downloadUrl,
			player,
			previousLink,
			nextLink,
			listing,
			name,
			subtitles,
			fullSize,
			showNav,
			hoverNav,
			autoPlay,
			previousRaw,
			nextRaw,
			raw,
			hasPrevious,
			hasNext,
			toggleSize,
			deleteFile,
			download,
			close,
			prev,
			next
		};
	}
});
</script>
