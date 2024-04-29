import { registerPlugin } from '@capacitor/core';
import { DownloadFilePlugin } from './definitions';

const DownloadFile = registerPlugin<DownloadFilePlugin>('DownloadFilePlugin', {
	web: () => import('./web').then((m) => new m.DownloadFileWeb())
});

export { DownloadFile };
