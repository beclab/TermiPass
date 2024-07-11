<template>
	<div class="card floating">
		<div class="card-title">
			<h4>{{ $t('prompts.copy') }}</h4>
		</div>

		<div class="card-content">
			<p>{{ $t('prompts.copyMessage') }}</p>
			<FileList @update:selected="updateSelect($event)"></FileList>
		</div>

		<div class="card-action">
			<button
				class="button button--flat button--grey"
				@click="store.closeHovers()"
				:aria-label="$t('buttons.cancel')"
				:title="$t('buttons.cancel')"
			>
				{{ $t('buttons.cancel') }}
			</button>
			<button
				class="button button--flat"
				@click="copy($event)"
				:aria-label="$t('buttons.copy')"
				:title="$t('buttons.copy')"
			>
				{{ $t('buttons.copy') }}
			</button>
		</div>
	</div>
</template>

<script lang="ts">
import FileList from './FileList.vue';
import { files as api } from '../../../api';
import buttons from '../../../utils/buttons';
import * as upload from '../../../utils/upload';

import { ref, defineComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDataStore } from '../../../stores/data';

export default defineComponent({
	name: 'CopyComponent',
	components: { FileList },
	setup() {
		const store = useDataStore();
		const route = useRoute();
		const router = useRouter();
		const dest = ref();

		const updateSelect = (event: any) => {
			dest.value = event;
		};

		const copy = async (event: { preventDefault: () => void }) => {
			event.preventDefault();
			let items: { from: any; to: string; name: any }[] = [];
			// Create a new promise for each file.
			for (let item of store.selected) {
				items.push({
					from: store.req.items[item].url,
					to: dest.value + encodeURIComponent(store.req.items[item].name),
					name: store.req.items[item].name
				});
			}

			if (route.path === dest.value) {
				store.closeHovers();
				action(false, true, items);

				return;
			}

			let dstItems = (await api.fetch(dest.value)).items;
			let conflict = upload.checkConflict(items, dstItems);

			let overwrite = false;
			let rename = false;

			if (conflict) {
				store.showHover({
					prompt: 'replace-rename',
					confirm: (event: { preventDefault: () => void }, option: string) => {
						overwrite = option == 'overwrite';
						rename = option == 'rename';

						event.preventDefault();
						store.closeHovers();
						action(overwrite, rename, items);
					}
				});

				return;
			}

			action(overwrite, rename, items);
		};

		const action = async (
			overwrite: boolean | undefined,
			rename: boolean | undefined,
			items: { from: any; to: string; name: any }[]
		) => {
			await api
				.copy(items, overwrite, rename)
				.then(() => {
					buttons.success('copy');
					if (route.path === dest.value) {
						store.setReload(true);

						return;
					}

					router.push({ path: dest.value });
				})
				.catch(() => {
					buttons.done('copy');
				});
		};

		return {
			copy,
			updateSelect,
			store
		};
	}
});
</script>
