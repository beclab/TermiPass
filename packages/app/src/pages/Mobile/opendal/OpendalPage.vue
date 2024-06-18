<template>
	<div
		class="column items-center justify-center"
		style="width: 100%; height: 100%"
	>
		<q-btn flat q-mt-md>
			<div
				class="text-body3"
				@click="requestOpenalAuth(OpendalType.GoogleDrive)"
			>
				Google Drive
			</div>
		</q-btn>
		<q-btn flat q-pt-md @click="requestOpenalAuth(OpendalType.Dropbox)">
			<div class="text-body3">Dropbox</div>
		</q-btn>
		<!-- <q-btn flat>
			<div class="text-body3">Google Drive</div>
		</q-btn> -->
	</div>
</template>

<script setup lang="ts">
import { requestOpenalAuth } from './provider/bindOpendal';
import { OpendalType } from '../../../utils/opendal';
</script>

<style scoped lang="scss"></style>
