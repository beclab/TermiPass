import { BaseProvider } from './baseProvider';

class PushEventHandlers {
	provider: BaseProvider;

	constructor(provider: any) {
		this.provider = provider;
	}

	_emit(event: any, data: any) {
		if (this.provider._initialized && this.provider._isReady) {
			this.provider.emit(event, data);
		}
	}

	connect = (didKey: string) => {
		if (!this.provider._state.isConnected) {
			this.provider._state.isConnected = true;
			this._emit('connect', didKey);
		}
	};

	setUnlock = (unlock: boolean) => {
		this.provider._state.isUnlocked = unlock;
	};

	disconnect = () => {
		this.provider._state.isConnected = false;
		this.provider._state.didKey = '';
		this._emit('accountChanged', '');
		this._emit('disconnect', { disconnectError: 'disconnected' });
	};

	accountChanged = (didKey: any) => {
		this.provider._state.didKey = didKey;
		this._emit('accountChanged', didKey);
	};
}

export default PushEventHandlers;
