import { RouteRecordRaw } from 'vue-router';

const web: RouteRecordRaw[] = [
	{
		path: '/',
		component: () => import('layouts/WebLoginLayout.vue'),
		children: [
			{
				path: 'error',
				component: () => import('pages/ErrorNotFound.vue')
			},
			{
				path: 'binding',
				component: () => import('pages/Web/BindingPage.vue')
			},
			{
				path: 'import_mnemonic',
				component: () => import('pages/Web/InputMnemonicPage.vue')
			},
			{
				path: 'setUnlockPassword',
				component: () => import('pages/Web/SetUnlockPwdPage.vue')
			},
			{
				path: 'unlock',
				component: () => import('pages/Web/UnlockPage.vue')
			}
		]
	}
];
export default web;
