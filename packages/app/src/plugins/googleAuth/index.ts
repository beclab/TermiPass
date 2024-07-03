import { registerPlugin } from '@capacitor/core';
import { GoogleAuthPluginInterface } from './definitions';

const GoogleAuth = registerPlugin<GoogleAuthPluginInterface>(
	'GoogleAuthPlugin',
	{
		web: () => import('./web').then((m) => new m.GoogleAuthWeb())
	}
);

export { GoogleAuth };
