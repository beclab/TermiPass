import { defineStore } from 'pinia';
import { ClientSchema } from '../globals';
import {
	GetResponseResponse,
	PresentationDefinition,
	ResolutionResult,
	Submission
} from '@bytetrade/core';
import { axiosInstanceProxy } from '../platform/httpProxy';
import { AxiosInstance } from 'axios';

export type SSIState = {
	did_url: string | undefined;
	vc_url: string | undefined;
	did_instance: AxiosInstance | undefined;
	vc_instance: AxiosInstance | undefined;
};

export const useSSIStore = defineStore('did', {
	state: () => {
		return {
			did_url: undefined,
			vc_url: undefined,
			did_instance: undefined,
			vc_instance: undefined
		} as SSIState;
	},
	getters: {},
	actions: {
		async pre_did_register(jws: string) {
			const data = await this.did_instance!.post('/create_local', {
				jws
			});

			if (!data.data || data.data.code != 0) {
				throw new Error(
					data.data.message ? data.data.message : 'create local faild'
				);
			}
		},
		async get_name_by_did(did: string): Promise<string | null | undefined> {
			try {
				const get_did_response = await this.did_instance!.get(
					'/get_name_by_did/' + did
				);

				if (get_did_response && get_did_response.status == 200) {
					if (get_did_response.data.code == 0) {
						return get_did_response.data.data;
					} else {
						return null;
					}
				}
				return null;
			} catch (err) {
				return undefined;
			}
		},
		async resolve_did(did: string): Promise<ResolutionResult | null> {
			try {
				const get_did_response = await this.did_instance!.get(
					'/1.0/identifiers/' + did
				);

				if (get_did_response && get_did_response.status == 200) {
					return get_did_response.data;
				}
				return null;
			} catch (err) {
				return null;
			}
		},
		async resolve_name(name: string): Promise<ResolutionResult | null> {
			try {
				const get_name_response = await this.did_instance!.get(
					'/1.0/name/' + name.replace('@', '.')
				);
				if (get_name_response && get_name_response.status == 200) {
					return get_name_response.data;
				}
				return null;
			} catch (err) {
				return null;
			}
		},
		async get_application_schema(
			type: string
		): Promise<ClientSchema | undefined> {
			const response: any = await this.vc_instance!.get(
				'/get_application_schema/' + type
			);
			if (response.status != 200 && response.data.code != 0) {
				return undefined;
			}
			return response.data.data;
		},
		async get_application_response(
			id: string
		): Promise<GetResponseResponse | undefined> {
			const response: any = await this.vc_instance!.get(
				'/get_application_response/' + id
			);
			if (response.status != 200 || response.data.code != 0) {
				return undefined;
			}
			return response.data.data;
		},
		async get_presentation_definition(
			type: string
		): Promise<PresentationDefinition | undefined> {
			const response = await this.vc_instance!.get(
				'/get_presentation_definition/' + type
			);
			if (response.status != 200 || response.data.code != 0) {
				return undefined;
			}
			return response.data.data;
		},
		async submit_presentation(
			jws: string,
			address: string,
			domain: string | null
		): Promise<Submission> {
			const obj: any = {
				jws,
				address
			};
			if (domain) {
				obj.domain = domain;
			}

			const response: any = await this.vc_instance!.post(
				'/submit_presentation',
				obj
			);

			if (
				(response.status != 201 && response.status != 200) ||
				response.data.code != 0
			) {
				throw Error(response.data.message || 'Submit Presentation Failure');
			}
			return response.data.data;
		},
		setDIDUrl(did_url: string) {
			this.did_url = did_url;
			this.did_instance = axiosInstanceProxy({
				baseURL: this.did_url,
				timeout: 10000,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		},
		setVCUrl(vc_url: string) {
			this.vc_url = vc_url;
			this.vc_instance = axiosInstanceProxy({
				baseURL: this.vc_url,
				timeout: 1000 * 300,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}
	}
});
