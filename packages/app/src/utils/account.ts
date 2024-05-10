import { Token } from '@bytetrade/core';
import { axiosInstanceProxy } from 'src/platform/httpProxy';

export const onFirstFactor = async (
	baseURL: string,
	terminus_name: string,
	osUser: string,
	osPwd: string,
	acceptCookie = true,
	needTwoFactor = false
): Promise<Token> => {
	const instanceProxy = axiosInstanceProxy({
		baseURL: baseURL,
		timeout: 1000 * 10,
		headers: {
			'Content-Type': 'application/json'
		},
		withCredentials: true
	});

	let targetURL =
		'https://vault.' + terminus_name.replace('@', '.') + '/' + 'server';

	if (needTwoFactor) {
		targetURL = 'https://desktop.' + terminus_name.replace('@', '.') + '/';
	}

	try {
		const response = await instanceProxy.post(
			'/api/firstfactor',
			{
				username: osUser,
				password: osPwd,
				keepMeLoggedIn: false,
				requestMethod: 'POST',
				targetURL,
				acceptCookie
			},
			{
				params: {
					hideCookie: true
				}
			}
		);

		if (!response || response.status != 200 || !response.data) {
			throw Error('Network error, please try again later');
		}
		if (response.data.status != 'OK') {
			throw new Error('Password Error');
		}
		const token = response.data.data;
		if (!token) {
			throw new Error('Password Error');
		}

		return token;
	} catch (error) {
		console.error('error ===>', error);
		if (error.response) {
			if (error.response.data && error.response.data.message) {
				throw new Error(error.response.data.message);
			}
			throw new Error(error.message);
		}
		throw error;
	}
};

export interface SSOTokenRaw {
	exp: number;
	iat: number;
	iss: string;
	sub: string;
	token_type: string;
	username: string;
	extra: {
		uninitialized: string[];
	};
}

export const refresh_token = async (
	baseURL: string,
	refreshToken: string,
	access_token: string
) => {
	const instanceProxy = axiosInstanceProxy({
		baseURL: baseURL,
		timeout: 1000 * 10,
		headers: {
			'Content-Type': 'application/json',
			'X-Authorization': access_token
		},
		withCredentials: true
	});

	const response = await instanceProxy.post('/api/refresh', {
		refreshToken
	});

	if (!response || response.status != 200 || !response.data) {
		throw Error('Network error, please try again later');
	}
	if (response.data.status != 'OK') {
		// throw Error('Network error, please try again later')
		throw new Error('refresh token error');
	}
	// const token = response.data.data;
	// if (!token) {
	// 	throw new Error('Password Error');
	// }

	return response.data.data;
};
