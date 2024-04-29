import { registerPlugin } from '@capacitor/core';
import { SeafilePlugin } from './definitions';

const Seafile = registerPlugin<SeafilePlugin>('SeafilePlugin', {
	web: () => import('./web').then((m) => new m.SeafileWebPlugin())
});

export { Seafile as SeafilePlugin };
