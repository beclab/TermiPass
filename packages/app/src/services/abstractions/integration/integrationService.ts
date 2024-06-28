export enum AccountType {
	Space = 'space',
	Google = 'google',
	Dropbox = 'dropbox',
	OneDrive = 'onedrive'
}

export interface IntegrationAccountData {
	refresh_token: string;
	access_token: string;
	expires_in: number;
	expires_at: number;
}

export interface GoogleIntegrationAccountData extends IntegrationAccountData {
	scope: string;
	id_token: string;
}

export interface SpaceIntegrationAccountData extends IntegrationAccountData {
	userid: string;
}

export interface IntegrationAccount {
	name: string;
	type: AccountType;
	raw_data: IntegrationAccountData;
}

export interface GoogleIntegrationAccount extends IntegrationAccount {
	raw_data: GoogleIntegrationAccountData;
}

export interface SpaceIntegrationAccount extends IntegrationAccount {
	raw_data: SpaceIntegrationAccountData;
}

export interface IntegrationAuthResult {
	status: boolean;
	account?: IntegrationAccount;
	message: string;
}

export interface IntegrationAccountInfo {
	type: AccountType;
	name: string;
}

export abstract class OperateIntegrationAuth<T extends IntegrationAccount> {
	type: AccountType;
	abstract signIn(): Promise<T>;
}

export interface IntegrationService {
	supportAuthList: IntegrationAccountInfo[];
	requestIntegrationAuth(
		request_type: AccountType
	): Promise<IntegrationAuthResult>;
	getInstanceByType(
		request_type: AccountType
	): OperateIntegrationAuth<IntegrationAccount> | undefined;
}

export interface IntegrationAccountMiniData {
	name: string;
	type: AccountType;
	expires_at: number;
}
