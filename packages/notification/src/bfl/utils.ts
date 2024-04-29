import axios, { AxiosInstance } from 'axios';
import { parse } from 'cookie';

export function createInstance(request: Request): AxiosInstance {
  let token = request.headers['x-authorization'];
  console.log('x-authorization: ' + token);
  const host = request.headers['host'];
  if (!host) {
    throw Error('host error');
  }

  const rawCookie = request.headers['cookie'];
  console.log(rawCookie);

  if (token || rawCookie) {
    if (!token) {
      const cookies = parse(rawCookie);
      console.log(cookies);
      token = cookies['auth_token'];
      console.log(token);
    }

    if (!token) {
      throw Error('token error');
    }

    return axios.create({
      baseURL: process.env.BFL || 'http://bfl',
      timeout: 5000,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
        'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
        'X-Authorization': token,
        'Client-Host': host,
      },
    });
  } else {
    return axios.create({
      baseURL: process.env.BFL || 'http://bfl',
      timeout: 5000,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
        'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
        'Client-Host': host,
      },
    });
  }
}
