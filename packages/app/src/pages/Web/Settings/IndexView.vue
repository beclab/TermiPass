<template>
	<div class="indexView full-height">
		<AccountPage v-if="settingMode == '1'" />
		<SecurityPage v-if="settingMode == '2'" />
		<DisplayPage v-if="settingMode == '3'" />
		<ToolsPage v-if="settingMode == '4'" />
		<Binding v-if="settingMode == '5'" />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AccountPage from './AccountPage.vue';
import SecurityPage from './SecurityPage.vue';
import DisplayPage from './DisplayPage.vue';
import ToolsPage from './ToolsPage.vue';
import Binding from './Binding.vue';

export default defineComponent({
	name: 'IndexView',
	props: {
		settingMode: {
			type: String,
			required: true
		}
	},
	components: {
		AccountPage,
		SecurityPage,
		DisplayPage,
		ToolsPage,
		Binding
	},
	setup() {
		return {};
	}
});
</script>

<style lang="scss" scoped>
.indexView {
	width: 100%;
	background: $white;
}
</style>
