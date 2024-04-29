import axios from 'axios';
import * as bcrypt from 'bcrypt';

// const providerUrl = 'http://' + process.env.OS_SYSTEM_SERVER;
// const OS_APP_KEY = process.env.OS_APP_KEY;
// const OS_APP_SECRET = process.env.OS_APP_SECRET;
// const IS_DEBUG = process.env.IS_DEBUG || false;

export class ProviderClient {
  token = null;

  expire_at = null;

  constructor(
    private providerUrl: string,
    private OS_APP_KEY: string,
    private OS_APP_SECRET: string,
    private name: string,
    private group: string,
    private dataType: string,
    private ops: string[],
    private IS_DEBUG: boolean,
  ) {
    console.log('init provider client: ' + this.name);
    console.log('providerUrl: ' + providerUrl);
    console.log('OS_APP_KEY: ' + OS_APP_KEY);
    console.log('OS_APP_SECRET: ' + OS_APP_SECRET);
    console.log('IS_DEBUG: ' + IS_DEBUG);
  }

  get client_name() {
    return this.name;
  }

  async getAccessToken() {
    const instance = axios.create({
      baseURL: this.providerUrl,
      timeout: 10000,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
        'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
      },
    });

    const timestamp = (new Date().getTime() / 1000).toFixed(0);
    const text = this.OS_APP_KEY! + timestamp + this.OS_APP_SECRET;
    const token = await bcrypt.hash(text, 10);

    const response = await instance.post('/permission/v1alpha1/access', {
      app_key: this.OS_APP_KEY,
      timestamp: Number(timestamp),
      token: token,
      perm: {
        group: this.group,
        dataType: this.dataType,
        version: 'v1',
        ops: this.ops,
      },
    });

    if (this.IS_DEBUG) {
      console.log(response);
    }

    if (!response || response.status != 200 || !response.data) {
      throw Error('Network error, error 10001');
    }

    const data = response.data;
    if (this.IS_DEBUG) {
      console.log(data.data);
    }
    if (data.code === 0) {
      this.token = null;
      this.expire_at = null;
      this.token = data.data.access_token;
      this.expire_at = new Date(data.data.expired_at).getTime();
    } else {
      throw Error('Network error, error 10002');
    }
  }

  isTokenValid(): boolean {
    if (!this.token || !this.expire_at) {
      return false;
    }

    const now = new Date().getTime();

    if (now >= this.expire_at || this.expire_at - now < 60 * 2 * 1000) {
      if (this.IS_DEBUG) {
        console.log('isTokenValid false');
      }
      return false;
    }

    return true;
  }

  async execute(path: string, data: any) {
    if (!this.isTokenValid()) {
      await this.getAccessToken();
    }
    const instance = axios.create({
      baseURL: this.providerUrl,
      timeout: 3000,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
        'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
        'X-Access-Token': this.token,
      },
    });

    const url =
      '/system-server/v1alpha1/' +
      this.dataType +
      '/' +
      this.group +
      '/v1' +
      path;

    const response = await instance.post(url, data);

    if (!response) {
      throw Error('Network error, error 10003');
    }
    if (this.IS_DEBUG) {
      console.log(response.data);
    }

    console.log(response.data);

    // if (!response.data || response.data.code != 0) {
    //   throw Error('response error, code ' + response.data.code);
    // }

    if (response.data.code === 0) {
      return response.data;
    } else {
      throw Error('Network error, res.code ' + response.data.code);
    }
  }
}
