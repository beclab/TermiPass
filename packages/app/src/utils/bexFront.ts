import { stringToBase64 } from '@didvault/sdk/src/core';
import { useBexStore } from '../stores/bex';
import { useUserStore } from '../stores/user';

export const sendUnlock = () => {
	if (process.env.PLATFORM !== 'BEX') {
		return;
	}
	const bex = useBexStore();
	const user = useUserStore();

	bex.controller.sendUnlocked(stringToBase64(user.password as string));
};

export const sendLock = () => {
	if (process.env.PLATFORM !== 'BEX') {
		return;
	}
	const bex = useBexStore();
	bex.controller.sendLocked();
};
