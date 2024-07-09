import {
	AccountAddMode,
	AccountType,
	AWSS3IntegrationAccount,
	IntegrationAccountMiniData,
	OperateIntegrationAuth
} from '../abstractions/integration/integrationService';

export class AWSS3AuthService extends OperateIntegrationAuth<AWSS3IntegrationAccount> {
	type = AccountType.AWSS3;
	addMode = AccountAddMode.direct;

	async signIn(options: any) {
		// const appPlatform = getAppPlatform();
		if (options.router) {
			options.router.push('/integration/aws/add');
		}
		return undefined;
	}

	detailPath(account: IntegrationAccountMiniData) {
		return '/integration/common/detail/' + account.type + '/' + account.name;
	}

	async permissions() {
		return {
			title: '',
			scopes: []
		};
	}
}
