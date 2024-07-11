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
			{{ $t('prompts.replace') }}
		</div>

		<div class="card-content">
			{{ $t('prompts.replaceMessage') }}
		</div>

		<div class="card-action">
			<button
				class="button cancel"
				@click="store.closeHovers"
				:aria-label="$t('buttons.cancel')"
				:title="$t('buttons.cancel')"
			>
				{{ $t('buttons.cancel') }}
			</button>
			<button
				class="button replace"
				@click="(event) => store.showConfirm(event, 'overwrite')"
				:aria-label="$t('buttons.replace')"
				:title="$t('buttons.replace')"
			>
				{{ $t('buttons.replace') }}
			</button>
		</div>

		<Action class="card-close" icon="close" @click="store.closeHovers()" />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useDataStore } from '../../../stores/data';
import Action from '../header/Action.vue';

export default defineComponent({
	name: 'replace-rename',
	components: {
		Action
	},
	setup() {
		const store = useDataStore();
		return {
			store
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
		padding: 4px 16px 20px;
		line-height: 22px;
	}

	.card-action {
		padding-bottom: 20px;

		.button {
			width: 94px;
			height: 34px;
			border-radius: 5px;
			border: 0;
		}

		.cancel {
			background: $grey-1;
			color: $title;
			float: left;
		}

		.rename {
			background: $grey-1;
			color: $title;
			margin-right: 20px;
		}

		.replace {
			background: $blue;
			color: $white;
		}
	}

	.card-close {
		position: absolute;
		top: 12px;
		right: 12px;
	}
}
</style>
