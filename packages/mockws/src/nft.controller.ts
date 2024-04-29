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
export class NFTController {
  private readonly logger = new Logger(NFTController.name);
  private instance: AxiosInstance;

  private token = '';

  private signMessage: Record<string, MessageBody> = {};

  constructor(private readonly gateway: WsStartGateway) {
    this.instance = axios.create({
      baseURL: Cloud_URL,
      timeout: 1000 * 10,
      headers: {},
    });
  }

  @Post('/sign/getNFTAddress')
  @HttpCode(200)
  async getNFTAddress(
    @Body()
    {
      userid,
      token,
      address,
    }: {
      userid: string;
      token: string;
      address?: string;
    },
  ): Promise<Result<null>> {
    try {
      const response = await this.instance.post(
        '/v1/bind/getNFTAddress',
        qs.stringify({
          userid,
          token,
        }),
      );
      console.log(response.data);

      this.token = token;

      if (response.data.code != 200) {
        throw new Error(response.data.message);
      }

      if (address) {
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
              callback_url: 'http://127.0.0.1:3190/sign/bindNFTAddress',
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

  @Post('/sign/bindNFTAddress')
  @HttpCode(200)
  async bindNFTAddress(
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

      // const response = await this.instance.post(
      //   '/v1/bind/bindTerminusName',
      //   qs.stringify({
      //     userid: userid,
      //     isAdmin: false,
      //     token: this.token,
      //     terminusName,
      //     jwt: jws,
      //     did,
      //   }),
      // );

      // if (response.data.code != 200) {
      //   throw new Error(response.data.message);
      // }

      // console.log(response.data);

      await this.gateway.broadcastMessage({
        topic: MessageTopic.CANCEL_SIGN,
        event: 'bind/nft',
        message: {
          id: id,
        },
      });

      //return returnSucceed(response.data.data);
      return returnSucceed(null);
    } catch (e) {
      console.log(e);
      return returnError(500, e.message || 'internal error');
    }
  }

  @Post('/sign/unBindNftAddress')
  @HttpCode(200)
  async unBindTerminusNames(
    @Body()
    { userid, token, id }: { userid: string; token: string; id: number },
  ): Promise<Result<null>> {
    try {
      const response = await this.instance.post(
        '/v1/bind/unBindNftAddress',
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
}
