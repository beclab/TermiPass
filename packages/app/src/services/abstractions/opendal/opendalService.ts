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

export interface GoogleAccountData extends IntegrationAccountData {
	scope: string;
	id_token: string;
}

export interface SpaceAccountData extends IntegrationAccountData {
	userid: string;
}

export interface IntegrationAccount {
	name: string;
	type: AccountType;
	raw_data: IntegrationAccountData;
}

export interface GoogleIntegrationAccount extends IntegrationAccount {
	raw_data: GoogleAccountData;
}

export interface SpaceIntegrationAccount extends IntegrationAccount {
	raw_data: SpaceAccountData;
}

export interface OpendalAuthResult {
	status: boolean;
	account?: IntegrationAccount;
	message: string;
}

export interface OpendalAccountInfo {
	type: AccountType;
	name: string;
}

export abstract class OpendalIntegrationAuth<T extends IntegrationAccount> {
	type: AccountType;
	abstract signIn(): Promise<T>;
}

export interface OpendalService {
	supportAuthList: OpendalAccountInfo[];
	requestOpendalAuth(request_type: AccountType): Promise<OpendalAuthResult>;
	getInstanceByType(
		request_type: AccountType
	): OpendalIntegrationAuth<IntegrationAccount> | undefined;
}

export interface IntegrationAccountMiniData {
	name: string;
	type: AccountType;
	expires_at: number;
}
