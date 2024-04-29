import {
  Controller,
  Logger,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
} from '@nestjs/common';
import {
  Result,
  returnError,
  returnSucceed,
  MessageBody,
  MessageTopic,
} from '@bytetrade/core';
import { WsStartGateway } from './ws.gateway';
import axios, { AxiosInstance } from 'axios';
import { Cloud_URL } from './utils';
import * as qs from 'qs';

const TERMINUS_NAME = process.env.TERMINUS_NAME || 'did';

@Controller('')
export class SettingsController {
  private readonly logger = new Logger(SettingsController.name);
  private instance: AxiosInstance;

  private userid = '';
  private token = '';

  private signMessage: Record<string, MessageBody> = {};
  private rawMessage: Record<string, any> = {};

  constructor(private readonly gateway: WsStartGateway) {
    this.instance = axios.create({
      baseURL: Cloud_URL,
      timeout: 1000 * 10,
      headers: {},
    });
  }

  @Post('/sign/getTerminusNames')
  @HttpCode(200)
  async getTerminusNames(
    @Body() { userid, token }: { userid: string; token: string },
  ): Promise<Result<null>> {
    try {
      const response = await this.instance.post(
        '/v1/bind/getTerminusNames',
        qs.stringify({
          userid,
          token,
        }),
      );
      console.log(response.data);

      this.userid = userid;
      this.token = token;

      if (response.data.code != 200) {
        throw new Error(response.data.message);
      }

      this.logger.debug(response.data.data.terminusNames.length);

      const found = response.data.data.terminusNames.find(
        (f) => f.status == 'Active' && f.terminusName == TERMINUS_NAME,
      );

      console.log('found');
      console.log(found);

      if (!found) {
        const id = '' + new Date().getTime();
        this.signMessage[id] = {
          topic: MessageTopic.SIGN,
          event: 'bind/cloud',
          notification: {
            title: 'Bind Terminus Space',
            body: 'Your Terminus Name is applying to bind a Terminus Space account. Please confirm whether it is done by you. Click Confirm to authorize the action, or Cancel to deny the action.',
          },
          app: {
            id: 'settings',
            icon: 'https://file.bttcdn.com/appstore/settings/icon.png',
            title: 'Settings',
          },
          message: {
            id: id,
            sign: {
              callback_url: 'http://127.0.0.1:3190/sign/bindTerminusNames',
              sign_body: {
                userid: userid,
                terminusName: TERMINUS_NAME,
              },
            },
          },
        };
        //payload
        await this.gateway.broadcastMessage(this.signMessage[id]);
      }
      return returnSucceed(response.data.data);
    } catch (e) {
      console.log(e);
      return returnError(500, e.message || 'internal error');
    }
  }

  @Post('/sign/bindTerminusNames')
  @HttpCode(200)
  async bindTerminusNames(
    @Body()
    {
      id,
      did,
      jws,
      terminusName,
      userid,
    }: {
      id: string;
      did: string;
      jws: string;
      terminusName: string;
      userid: string;
    },
  ): Promise<Result<null>> {
    try {
      if (!(id in this.signMessage)) {
        throw new Error('invalid id');
      }
      delete this.signMessage[id];
      delete this.rawMessage[id];

      const response = await this.instance.post(
        '/v1/bind/bindTerminusName',
        qs.stringify({
          userid: userid,
          isAdmin: false,
          token: this.token,
          terminusName,
          jwt: jws,
          did,
        }),
      );

      if (response.data.code != 200) {
        throw new Error(response.data.message);
      }

      console.log(response.data);

      await this.gateway.broadcastMessage({
        topic: MessageTopic.CANCEL_SIGN,
        event: 'bind/cloud',
        message: {
          id: id,
        },
      });

      return returnSucceed(response.data.data);
      //return returnSucceed(null);
    } catch (e) {
      console.log(e);
      return returnError(500, e.message || 'internal error');
    }
  }

  @Post('/sign/unBindTerminusNames')
  @HttpCode(200)
  async unBindTerminusNames(
    @Body()
    { userid, token, id }: { userid: string; token: string; id: number },
  ): Promise<Result<null>> {
    try {
      const response = await this.instance.post(
        '/v1/bind/unbindTerminusName',
        qs.stringify({
          userid,
          token,
          id,
        }),
      );

      if (response.data.code != 200) {
        throw new Error(response.data.message);
      }

      console.log(response.data);

      return returnSucceed(response.data.data);
    } catch (e) {
      console.log(e);
      return returnError(500, e.message || 'internal error');
    }
  }

  @Post('/sign/getEthAddress')
  @HttpCode(200)
  async getEthAddress(
    @Body()
    { terminusName }: { terminusName?: string },
  ): Promise<Result<null>> {
    try {
      const response = await this.instance.post(
        '/v1/bind/getEthAddress',
        qs.stringify({
          userid: this.userid,
          token: this.token,
          terminusName,
        }),
      );
      console.log(response.data);

      if (response.data.code != 200) {
        throw new Error(response.data.message);
      }

      return returnSucceed(response.data.data);
    } catch (e) {
      console.log(e);
      return returnError(500, e.message || 'internal error');
    }
  }

  @Post('/sign/requestTermiPassSignEthAddress')
  @HttpCode(200)
  async requestTermiPassSignEthAddress(
    @Body()
    {
      sigFromAddressPrivKey,
      signData,
      uuid,
    }: {
      sigFromAddressPrivKey?: string;
      signData: {
        action: number;
        addr: string;
        algorithm: number;
        domain: string;
        signAt: number;
      };
      uuid: string;
    },
  ): Promise<Result<null>> {
    if (!this.userid) {
      return returnError(500, 'Please login Terminus Space first');
    }
    if (signData.domain != TERMINUS_NAME.replace('@', '.')) {
      return returnError(500, 'Terminus Name is not match');
    }
    try {
      const id = '' + new Date().getTime();
      this.signMessage[id] = {
        topic: MessageTopic.SIGN,
        event: 'bind/address',
        notification: {
          title: 'Bind New Ethereum Address',
          body: 'Your Terminus Name is applying for authorization to complete the private key signature. Please confirm whether it is done by you. Click Confirm to authorize the action, or Cancel to deny the action.',
        },
        app: {
          id: 'profile',
          icon: 'https://file.bttcdn.com/appstore/profile/icon.png',
          title: 'Profile',
        },
        message: {
          id: id,
          sign: {
            callback_url: 'http://127.0.0.1:3190/sign/bindEthAddress',
            sign_body: {
              userid: this.userid,
              terminusName: TERMINUS_NAME,
            },
            sign_eth: {
              domain: {
                name: 'DID',
                version: '1',
                chainId: 11155420,
                verifyingContract: '0xaA5bE49799b6A71Eda74d22D01F7A808aFf41b3f',
              },
              types: {
                EIP712Domain: [
                  { name: 'name', type: 'string' },
                  { name: 'version', type: 'string' },
                  { name: 'chainId', type: 'uint256' },
                  { name: 'verifyingContract', type: 'address' },
                ],
                AuthAddressReq: [
                  { name: 'addr', type: 'address' },
                  { name: 'algorithm', type: 'uint8' },
                  { name: 'domain', type: 'string' },
                  { name: 'signAt', type: 'uint256' },
                  { name: 'action', type: 'uint8' },
                ],
              },
              data: signData,
              primaryType: 'AuthAddressReq',
            },
          },
        },
      };

      this.rawMessage[id] = {
        sigFromAddressPrivKey,
        signData,
        uuid,
        address: signData.addr,
      };

      //payload
      await this.gateway.broadcastMessage(this.signMessage[id]);
      return returnSucceed(null);
    } catch (e) {
      console.log(e);
      return returnError(500, e.message || 'internal error');
    }
  }

  @Post('/sign/bindEthAddress')
  @HttpCode(200)
  async bindEthAddress(
    @Body()
    {
      id,
      did,
      jws,
      terminusName,
      userid,
      eth721_sign,
    }: {
      id: string;
      did: string;
      jws: string;
      terminusName: string;
      userid: string;
      eth721_sign: string;
    },
  ): Promise<Result<null>> {
    try {
      if (!(id in this.signMessage)) {
        throw new Error('invalid id');
      }
      delete this.signMessage[id];

      const sigFromAddressPrivKey = this.rawMessage[id].sigFromAddressPrivKey;
      const signData = this.rawMessage[id].signData;
      const uuid = this.rawMessage[id].uuid;
      const address = this.rawMessage[id].address;

      const response = await this.instance.post(
        '/v1/bind/bindEthAddress',
        qs.stringify({
          userid: userid,
          token: this.token,
          terminusName,
          jwt: jws,
          did,
          sigFromAddressPrivKey,
          sigFromDomainOwnerPrivKey: eth721_sign,
          signData: JSON.stringify(signData),
          uuid,
          address,
        }),
        { timeout: 1000 * 60 },
      );

      if (response.data.code != 200) {
        throw new Error(response.data.message);
      }

      console.log(response.data);

      await this.gateway.broadcastMessage({
        topic: MessageTopic.CANCEL_SIGN,
        event: 'bind/address',
        message: {
          id: id,
        },
      });

      return returnSucceed(response.data.data);
    } catch (e) {
      console.log(e);
      return returnError(500, e.message || 'internal error');
    }
  }

  @Post('/sign/requestTermiPassSignRemoveEthAddress')
  @HttpCode(200)
  async requestTermiPassSignRemoveEthAddress(
    @Body()
    {
      sigFromAddressPrivKey,
      signData,
      uuid,
      index,
    }: {
      sigFromAddressPrivKey?: string;
      signData: {
        action: number;
        addr: string;
        algorithm: number;
        domain: string;
        signAt: number;
      };
      uuid: string;
      index: number;
    },
  ): Promise<Result<null>> {
    if (!this.userid) {
      return returnError(500, 'Please login Terminus Space first');
    }
    if (signData.domain != TERMINUS_NAME.replace('@', '.')) {
      return returnError(500, 'Terminus Name is not match');
    }
    try {
      const id = '' + new Date().getTime();
      this.signMessage[id] = {
        topic: MessageTopic.SIGN,
        event: 'bind/address',
        notification: {
          title: 'Remove Bind New Ethereum Address',
          body: 'Unbind Address',
        },
        app: {
          id: 'profile',
          icon: 'https://file.bttcdn.com/appstore/profile/icon.png',
          title: 'Profile',
        },
        message: {
          id: id,
          sign: {
            callback_url: 'http://127.0.0.1:3190/sign/unBindEthAddress',
            sign_body: {
              userid: this.userid,
              terminusName: TERMINUS_NAME,
            },
            sign_eth: {
              domain: {
                name: 'DID',
                version: '1',
                chainId: 11155420,
                verifyingContract: '0xaA5bE49799b6A71Eda74d22D01F7A808aFf41b3f',
              },
              types: {
                EIP712Domain: [
                  { name: 'name', type: 'string' },
                  { name: 'version', type: 'string' },
                  { name: 'chainId', type: 'uint256' },
                  { name: 'verifyingContract', type: 'address' },
                ],
                AuthAddressReq: [
                  { name: 'addr', type: 'address' },
                  { name: 'algorithm', type: 'uint8' },
                  { name: 'domain', type: 'string' },
                  { name: 'signAt', type: 'uint256' },
                  { name: 'action', type: 'uint8' },
                ],
              },
              data: signData,
              primaryType: 'AuthAddressReq',
            },
          },
        },
      };

      this.rawMessage[id] = {
        sigFromAddressPrivKey,
        signData,
        uuid,
        address: signData.addr,
        index,
      };

      //payload
      await this.gateway.broadcastMessage(this.signMessage[id]);
      return returnSucceed(null);
    } catch (e) {
      console.log(e);
      return returnError(500, e.message || 'internal error');
    }
  }

  @Post('/sign/unBindEthAddress')
  @HttpCode(200)
  async unBindEthAddress(
    @Body()
    {
      id,
      did,
      jws,
      terminusName,
      userid,
      eth721_sign,
    }: {
      id: string;
      did: string;
      jws: string;
      terminusName: string;
      userid: string;
      eth721_sign: string;
    },
  ): Promise<Result<null>> {
    try {
      if (!(id in this.signMessage)) {
        throw new Error('invalid id');
      }
      delete this.signMessage[id];

      const sigFromAddressPrivKey = this.rawMessage[id].sigFromAddressPrivKey;
      const signData = this.rawMessage[id].signData;
      const uuid = this.rawMessage[id].uuid;
      const address = this.rawMessage[id].address;
      const index = this.rawMessage[id].index;

      const response = await this.instance.post(
        '/v1/bind/unBindEthAddress',
        qs.stringify({
          userid: userid,
          token: this.token,
          terminusName,
          jwt: jws,
          did,
          sigFromAddressPrivKey,
          sigFromDomainOwnerPrivKey: eth721_sign,
          signData: JSON.stringify(signData),
          uuid,
          address,
          index,
        }),
        { timeout: 1000 * 60 },
      );

      if (response.data.code != 200) {
        throw new Error(response.data.message);
      }

      console.log(response.data);

      await this.gateway.broadcastMessage({
        topic: MessageTopic.CANCEL_SIGN,
        event: 'bind/address',
        message: {
          id: id,
        },
      });

      return returnSucceed(response.data.data);
    } catch (e) {
      console.log(e);
      return returnError(500, e.message || 'internal error');
    }
  }

  @Post('/sign/requestTermiPassSignNFT')
  @HttpCode(200)
  async requestTermiPassSignNFT(
    @Body()
    {
      token_id,
      token_address,
      token_name,
      nft_name,
      image,
      chain_type,
      owner,
    }: {
      token_id: string;
      token_address: string;
      token_name: string;
      nft_name: string;
      image: string;
      chain_type: string;
      owner: string;
    },
  ): Promise<Result<null>> {
    if (!this.userid) {
      return returnError(500, 'Please login Terminus Space first');
    }

    try {
      const data = {
        token_id,
        token_address,
        token_name,
        nft_name,
        image,
        chain_type,
        owner,
        cloud_id: this.userid,
        terminusName: TERMINUS_NAME,
      };
      const id = '' + new Date().getTime();
      this.signMessage[id] = {
        topic: MessageTopic.SIGN,
        event: 'bind/nft',
        notification: {
          title: 'Bind NFT Avatar',
          body: 'Your Terminus Name is applying to bind an NFT avatar, please confirm whether it is done by you. Click Confirm to authorize the action, or Cancel to deny the action.',
        },
        app: {
          id: 'profile',
          icon: 'https://file.bttcdn.com/appstore/profile/icon.png',
          title: 'Profile',
        },
        message: {
          id: id,
          sign: {
            callback_url: 'http://127.0.0.1:3190/sign/bindNFT',
            sign_body: {
              userid: this.userid,
              terminusName: TERMINUS_NAME,
            },
            sign_vc: {
              type: 'NFT',
              name: nft_name,
              request_path: '/get_nft_info',
              data,
            },
          },
        },
      };

      //payload
      await this.gateway.broadcastMessage(this.signMessage[id]);
      return returnSucceed(null);
    } catch (e) {
      console.log(e);
      return returnError(500, e.message || 'internal error');
    }
  }

  @Post('/sign/bindNFT')
  @HttpCode(200)
  async bindNFT(
    @Body()
    { id }: { id: string },
  ): Promise<Result<null>> {
    try {
      if (!(id in this.signMessage)) {
        throw new Error('invalid id');
      }
      delete this.signMessage[id];

      await this.gateway.broadcastMessage({
        topic: MessageTopic.CANCEL_SIGN,
        event: 'bind/nft',
        message: {
          id: id,
        },
      });

      return returnSucceed(null);
    } catch (e) {
      console.log(e);
      return returnError(500, e.message || 'internal error');
    }
  }
}
