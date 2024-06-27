import { getExtensionBackgroundPlatform } from '../background/extensionBackgroundPlatform';
import storage from '../provider/storage/storage';
import { AuthenticationStatus } from '../utils/enums';
import { AuthService as AuthServiceAbstraction } from './abstractions/auth.service';
export class AuthService implements AuthServiceAbstraction {
	async getAuthStatus(): Promise<AuthenticationStatus> {
		if (!(await this.isBooted())) {
			return AuthenticationStatus.LoggedOut;
		}
		const userAuthStatus =
			getExtensionBackgroundPlatform().dataCenter.isLocked()
				? AuthenticationStatus.Locked
				: AuthenticationStatus.Unlocked;
		return userAuthStatus;
	}

	async isBooted() {
		return (await storage.get('local-user-id', undefined)) != undefined;
	}
}
