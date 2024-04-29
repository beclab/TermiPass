import { HttpOptions, HttpResponse } from '@capacitor/core';

export interface HookCapacitorHttpPlugin {
	request(options: HttpOptions): Promise<HttpResponse>;
	get(options: HttpOptions): Promise<HttpResponse>;
	post(options: HttpOptions): Promise<HttpResponse>;
	put(options: HttpOptions): Promise<HttpResponse>;
	patch(options: HttpOptions): Promise<HttpResponse>;
	delete(options: HttpOptions): Promise<HttpResponse>;
}
