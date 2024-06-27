export type ExtensionMessageMode = 'rss' | 'autofill' | 'provider' | 'download';

export interface ExtensionMessage {
	module: ExtensionMessageMode;
	type: string;
}
