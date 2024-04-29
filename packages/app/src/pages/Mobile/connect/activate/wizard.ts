export interface SystemOption {
	location: string;
	language: string;
}

export interface NetworkOption {
	use_frps: boolean;
	frps_region: string;
	external_ip: string | null;
}

export interface WizardInfo {
	username: string;
	password: string;
	url: string;
	system: SystemOption;
	network: NetworkOption;
}
