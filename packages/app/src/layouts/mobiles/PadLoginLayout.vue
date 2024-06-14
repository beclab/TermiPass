<template>
	<div class="login-layout-root">
		<div
			style="width: 100%; height: calc(100% - 38px)"
			class="row items-center justify-center"
		>
			<div class="login-layout-box row justify-center items-center">
				<div class="login-layout-page">
					<router-view />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.login-layout-root {
	height: 100vh;
	width: 100vw;
	background: $desktop-background;

	.login-layout-box {
		height: 692px;
		min-width: 1096px;
		padding-left: 52px;
		padding-right: 52px;
		padding-bottom: 38px;

		.login-layout-page {
			height: 100%;
			border-radius: 12px;
			width: 480px;
			border: 1px solid $grey-2;
		}
	}
}
</style>
