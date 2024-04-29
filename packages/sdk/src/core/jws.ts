import { PublicJwk, ResolutionResult } from '@bytetrade/core';
import { base64ToString } from './encoding';
import { Err, ErrorCode } from './error';
import * as jose from 'jose';
import axios from 'axios';

const DID_GATE = 'https://did-gate-v3.bttcdn.com/';
const DID_GATE_TIMEOUT = 1000 * 10;

function getPublicJWKFromX(did: string, x: string): PublicJwk {
	return {
		alg: 'EdDSA',
		crv: 'Ed25519',
		kid: did,
		kty: 'OKP',
		use: 'sig',
		x: x
	};
}

const recordResult: Record<string, any> = {};

export async function checkJWS(
	jws: string
): Promise<{ terminus_name: string; body: any; kid: string }> {
	let kid: string | undefined = undefined;
	let name: string | undefined = undefined;
	let time = 0;
	let domain = '';
	let request_body: any = undefined;
	try {
		const segs = jws.split('.');
		if (segs.length != 3) {
			throw new Err(ErrorCode.JWS_INVALID, 'Invalid jws');
		}

		const request_header = JSON.parse(base64ToString(segs[0]));
		console.log(request_header);
		kid = request_header.kid;
		request_body = JSON.parse(base64ToString(segs[1]));

		name = request_body.name;
		time = request_body.time;
		domain = request_body.domain;
	} catch (err) {
		console.log(err);
		throw new Err(ErrorCode.JWS_INVALID, 'Invalid jws');
	}

	if (!name || !kid || time === 0) {
		throw new Err(ErrorCode.JWS_INVALID, 'Invalid jws');
	}
	console.log('kid ' + kid);
	console.log('name ' + name);
	console.log('time ' + time);
	console.log('domain ' + domain);
	console.log('now ' + new Date().getTime());
	console.log('diff ' + (new Date().getTime() - time));

	if (new Date().getTime() - time > 60 * 20 * 1000) {
		console.log('time ' + time + ' now ' + new Date().getTime());
		throw new Err(ErrorCode.JWS_INVALID, 'Timestamp is out of range');
	}

	if (jws in recordResult) {
		console.log('jws hit cache');
		return recordResult[jws];
	}

	const did_instance = axios.create({
		baseURL: DID_GATE,
		timeout: DID_GATE_TIMEOUT,
		headers: {}
	});

	const get_name_response = await did_instance.get(
		'/1.0/name/' + name.replace('@', '.')
	);
	console.log('get_name_response ===>');
	console.log(get_name_response);
	if (!get_name_response || get_name_response.status != 200) {
		throw new Err(ErrorCode.JWS_INVALID, 'Resolve name error');
	}
	const data: ResolutionResult = get_name_response.data;
	console.log(JSON.stringify(data, null, 2));

	if (data.didDocument.id != kid) {
		console.log('did not match ' + data.didDocument.id + ' ' + kid);
		throw new Err(ErrorCode.JWS_INVALID, 'Invalid jws');
	}
	if (
		!data.didDocument.verificationMethod ||
		data.didDocument.verificationMethod.length == 0 ||
		!data.didDocument.verificationMethod[0].publicKeyJwk
	) {
		throw new Err(ErrorCode.JWS_INVALID, 'Invalid Diddocument');
	}
	const x = data.didDocument.verificationMethod[0].publicKeyJwk.x;
	console.log('x ' + x);

	try {
		const ecPublicKey = await jose.importJWK(
			getPublicJWKFromX(kid, x),
			'ES256'
		);
		await jose.compactVerify(jws, ecPublicKey);

		console.log(data);

		const res = { terminus_name: name, body: request_body, kid };
		recordResult[jws] = res;
		return res;
	} catch (err) {
		console.log(err);
		throw new Err(ErrorCode.JWS_INVALID, 'Invalid jws');
	}
}
