import { bus } from './bus';
import { BtNotify, NotifyDefinedType } from '@bytetrade/ui';

export const showNotify = (message: string, type: NotifyDefinedType) => {
	BtNotify.show({
		type,
		message: message
	});
};

export const notifySuccess = (info = 'Success') => {
	showNotify(info, NotifyDefinedType.SUCCESS);
};

export const notifyFailed = (info = 'Failed') => {
	showNotify(info, NotifyDefinedType.FAILED);
};

export const notifyWarning = (info = 'Warning') => {
	showNotify(info, NotifyDefinedType.WARNING);
};

export const notifyWaitingShow = (info = 'Waiting') => {
	BtNotify.show({
		type: NotifyDefinedType.LOADING,
		message: info,
		closeTimeout: true
	});
};

export const notifyHide = () => {
	BtNotify.hide();
};

export const notifyProgress = (info = 'Waiting', caption = '0%') => {
	BtNotify.show({
		type: NotifyDefinedType.PROGRESS,
		message: info,
		closeTimeout: true,
		caption
	});
};

export const notifyEventBus = bus;
