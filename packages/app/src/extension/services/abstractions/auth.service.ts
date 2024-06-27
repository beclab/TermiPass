import { AuthenticationStatus } from '../../utils/enums';

export abstract class AuthService {
	abstract getAuthStatus: () => Promise<AuthenticationStatus>;
	abstract isBooted: () => Promise<boolean>;
}
