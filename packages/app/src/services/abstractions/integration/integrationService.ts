export enum AccountType {
	Space = 'space',
	Google = 'google',
	Dropbox = 'dropbox',
	OneDrive = 'onedrive',
	AWSS3 = 'awss3'
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

export interface AWSS3IntegrationAccountData extends IntegrationAccountData {
	endpoint: string;
	bucket: string;
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

export interface AWSS3IntegrationAccount extends IntegrationAccount {
	raw_data: AWSS3IntegrationAccountData;
}

export interface IntegrationAuthResult {
	status: boolean;
	account?: IntegrationAccount;
	message: string;
	addMode: AccountAddMode;
}

export interface IntegrationAccountInfoDetail {
	name: string;
	icon: string;
}

export interface IntegrationAccountInfo {
	type: AccountType;
	// name: string;
	detail: IntegrationAccountInfoDetail;
}

export interface IntegrationScopesDetail {
	icon: string;
	introduce: string;
}

export interface IntegrationPermissions {
	title: string;
	scopes: IntegrationScopesDetail[];
}

export enum AccountAddMode {
	common = 1,
	direct = 2
}

export abstract class OperateIntegrationAuth<T extends IntegrationAccount> {
	type: AccountType;
	addMode: AccountAddMode;
	abstract signIn(options: any): Promise<T | undefined>;
	abstract permissions(): Promise<IntegrationPermissions>;
}

export interface IntegrationService {
	supportAuthList: IntegrationAccountInfo[];
	getAccountByType(
		request_type: AccountType
	): IntegrationAccountInfo | undefined;
	requestIntegrationAuth(
		request_type: AccountType,
		options: any
	): Promise<IntegrationAuthResult>;
	getInstanceByType(
		request_type: AccountType
	): OperateIntegrationAuth<IntegrationAccount> | undefined;
}

export interface IntegrationAccountMiniData {
	name: string;
	type: AccountType;
	expires_at: number;
	available: boolean;
	create_at: number;
}
