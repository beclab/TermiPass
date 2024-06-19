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

export interface IntegrationAccount {
	name: string;
	type: AccountType;
	raw_data: IntegrationAccountData;
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

export abstract class OpendalIntegrationAuth {
	type: AccountType;
	abstract signIn(): Promise<IntegrationAccount>;
}

export interface OpendalService {
	supportAuthList: OpendalAccountInfo[];
	requestOpendalAuth(request_type: AccountType): Promise<OpendalAuthResult>;
	getInstanceByType(
		request_type: AccountType
	): OpendalIntegrationAuth | undefined;
}
