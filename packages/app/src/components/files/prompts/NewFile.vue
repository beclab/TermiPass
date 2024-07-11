<template>
	<div
		class="card floating"
		:class="
			$q.platform.is.mobile || $q.platform.is.bex
				? 'card-mobile'
				: 'card-others'
		"
	>
		<div class="card-title text-subtitle1">
			{{ $t('prompts.newFile') }}
		</div>

		<div class="card-content">
			<p>{{ $t('prompts.newFileMessage') }}</p>
			<input
				class="input input--block"
				v-focus
				type="text"
				@keyup.enter="submit"
				v-model.trim="name"
			/>
		</div>

		<div class="card-action">
			<button
				class="button cancel"
				@click="store.closeHovers()"
				:aria-label="$t('buttons.cancel')"
				:title="$t('buttons.cancel')"
			>
				{{ $t('buttons.cancel') }}
			</button>
			<button
				class="button create"
				@click="submit"
				:aria-label="$t('buttons.create')"
				:title="$t('buttons.create')"
			>
				{{ $t('buttons.create') }}
			</button>
		</div>

		<ActionComponent
			class="card-close"
			icon="close"
			@click="store.closeHovers()"
		/>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useDataStore } from '../../../stores/data';
import { files as api } from '../../../api';
import url from '../../../utils/url';
import { useRoute, useRouter } from 'vue-router';
import ActionComponent from '../header/Action.vue';

export default defineComponent({
	name: 'new-file',
	components: {
		ActionComponent
	},
	setup() {
		const store = useDataStore();
		const name = ref<string>('');
		const route = useRoute();
		const router = useRouter();

		const submit = async (event: any) => {
			event.preventDefault();
			if (name.value === '') return;

			// Build the path of the new directory.
			let uri = store.isFiles(route) ? route.path + '/' : '/';

			if (!store.isListing(route)) {
				uri = url.removeLastDir(uri) + '/';
			}

			uri += encodeURIComponent(name.value);
			uri = uri.replace('//', '/');

			try {
				await api.resourceAction(uri, 'post');
				router.push({ path: uri });
			} catch (e) {
				//this.$showError(e);
			}

			store.closeHovers();
		};

		return {
			store,
			name,
			submit
		};
	}
});
</script>

<style lang="scss" scoped>
.card {
	box-shadow: 0px 2px 10px $grey-2;
	border-radius: 10px;
	padding-left: 4px;
	padding-right: 4px;
	.card-title {
		color: $title;
	}

	.card-content {
		padding: 4px 16px 0;
		.input {
			border-radius: 5px;
			&:focus {
				border: 1px solid $blue;
			}
		}
	}

	.card-action {
		.button {
			width: 94px;
			height: 34px;
			border-radius: 5px;
		}
		.cancel {
			background: $grey-1;
			color: $title;
		}
		.create {
			background: $blue;
			color: $white;
			margin-left: 20px;
		}
	}

	.card-close {
		position: absolute;
		top: 12px;
		right: 12px;
	}
}
</style>
