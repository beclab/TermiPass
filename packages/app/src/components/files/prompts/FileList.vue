<template>
	<div>
		<ul class="file-list">
			<li
				@click="itemClick($event)"
				@touchstart="touchstart($event)"
				@dblclick="next($event)"
				role="button"
				tabindex="0"
				:aria-label="item.name"
				:aria-selected="selected == item.url"
				:key="item.name"
				v-for="item in items"
				:data-url="item.url"
			>
				{{ item.name }}
			</li>
		</ul>

		<p>
			{{ $t('prompts.currentlyNavigating') }} <code>{{ nav }}</code
			>.
		</p>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useDataStore } from '../../../stores/data';
import url from '../../../utils/url';
import { files } from '../../../api';

type FillOptionstype = {
	isDir: boolean;
	name: string;
	url: string;
};

export default defineComponent({
	name: 'file-list',
	emits: ['update:selected'],

	setup(props, { emit }) {
		const store = useDataStore();
		const items = ref();
		const touches = ref({
			id: '',
			count: 0
		});
		const selected = ref(null);
		const current = ref(window.location.pathname);

		const nav = computed(() => {
			return decodeURIComponent(current.value);
		});

		onMounted(() => {
			fillOptions(store.req);
		});

		const fillOptions = (req: { url: string; items: FillOptionstype[] }) => {
			// Sets the current path and resets
			// the current items.
			current.value = req.url;
			items.value = [];

			emit('update:selected', current.value);

			// If the path isn't the root path,
			// show a button to navigate to the previous
			// directory.
			if (req.url !== '/files/') {
				items.value.push({
					name: '..',
					url: url.removeLastDir(req.url) + '/'
				});
			}

			// If this folder is empty, finish here.
			if (req.items === null) return;

			// Otherwise we add every directory to the
			// move options.
			for (let item of req.items) {
				if (!item.isDir) continue;

				items.value.push({
					name: item.name,
					url: item.url
				});
			}
		};

		const next = (event: any) => {
			// Retrieves the URL of the directory the user
			// just clicked in and fill the options with its
			// content.
			let uri = event.currentTarget.dataset.url;
			files.fetch(uri).then(fillOptions).catch(store.showError);
		};

		const touchstart = (event: any) => {
			let url = event.currentTarget.dataset.url;

			// In 300 milliseconds, we shall reset the count.
			setTimeout(() => {
				touches.value.count = 0;
			}, 300);

			// If the element the user is touching
			// is different from the last one he touched,
			// reset the count.
			if (touches.value.id !== url) {
				touches.value.id = url;
				touches.value.count = 1;
				return;
			}

			touches.value.count++;

			// If there is more than one touch already,
			// open the next screen.
			if (touches.value.count > 1) {
				next(event);
			}
		};

		const itemClick = (event: any) => {
			if (store.user.singleClick) next(event);
			else select(event);
		};

		const select = (event: { currentTarget: { dataset: { url: null } } }) => {
			// If the element is already selected, unselect it.
			if (selected.value === event.currentTarget.dataset.url) {
				selected.value = null;
				emit('update:selected', current.value);
				return;
			}

			// Otherwise select the element.
			selected.value = event.currentTarget.dataset.url;
			emit('update:selected', selected.value);
		};

		return {
			selected,
			items,
			nav,
			next,
			touchstart,
			itemClick
		};
	}
});
</script>
