import { getExtensionPlatform } from '../../platform/bex/front/platform';
import { getUITypeName } from '../../utils/utils';
import { ControllerType } from '../../utils/controllerContextUtil';
import { useBexStore } from '../../stores/bex';

const _getPortMessage = () => {
	return getExtensionPlatform().portMessage;
};

export const setBexController = () => {
	const portMessage = _getPortMessage();
	portMessage.connect(getUITypeName());

	const controllerProxy = new Proxy(
		{},
		{
			get(_obj, key) {
				return function (...params: any) {
					return _portMessageRequestController(key, params);
				};
			}
		}
	) as ControllerType;

	const store = useBexStore();
	store.setController(controllerProxy);
};

const _portMessageRequestController = (method, params) => {
	return _getPortMessage().request({
		type: 'controller',
		method,
		params
	});
};

export const portMessageListenerBroadcast = (call: (data: any) => void) => {
	_getPortMessage().listen((data: any) => {
		if (data.type === 'broadcast') {
			call(data);
		}
	});
};

export const portMessageRequestBroadcast = (data: any) => {
	_getPortMessage().request({
		type: 'broadcast',
		method: data.method,
		params: data.data
	});
};
