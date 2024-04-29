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
//import axios, { AxiosInstance } from 'axios';
//import { Cloud_URL } from './utils';
//import * as qs from 'qs';

//const TERMINUS_NAME = process.env.TERMINUS_NAME || 'did';

@Controller('')
export class LoginController {
  private readonly logger = new Logger(LoginController.name);
  //private instance: AxiosInstance;

  //private token = '';

  private signMessage: Record<string, MessageBody> = {};

  constructor(private readonly gateway: WsStartGateway) {
    // this.instance = axios.create({
    //   baseURL: Cloud_URL,
    //   timeout: 1000 * 10,
    //   headers: {},
    // });
  }

  @Post('/sign/requestSecondVerify')
  @HttpCode(200)
  async getTerminusNames(
    @Body() { userid, token }: { userid: string; token: string },
  ): Promise<Result<null>> {
    const id = '' + new Date().getTime();
    this.signMessage[id] = {
      topic: MessageTopic.SIGN,
      event: 'system/secondVerify',
      notification: {
        title: 'Login Terminus Web',
        body: 'Your Terminus Name is being used to log in to Terminus web. Please confirm whether it is done by you. Click Confirm to authorize the action, or Cancel to deny the action.',
      },
      app: {
        id: 'system',
        icon: 'https://file.bttcdn.com/appstore/settings/icon.png',
        title: 'System',
      },
      message: {
        id: id,
        sign: {
          callback_url: 'http://127.0.0.1:3190/sign/secondVerify',
          sign_body: {
            userid: userid,
            token: token,
          },
        },
      },
    };
    //payload
    await this.gateway.broadcastMessage(this.signMessage[id]);

    return returnSucceed(null);
  }

  @Post('/sign/secondVerify')
  @HttpCode(200)
  async bindTerminusNames(
    @Body()
    { id, token, userid }: { id: string; token: string; userid: string },
  ): Promise<Result<null>> {
    try {
      if (!(id in this.signMessage)) {
        throw new Error('invalid id');
      }
      delete this.signMessage[id];

      await this.gateway.broadcastMessage({
        topic: MessageTopic.CANCEL_SIGN,
        event: 'system/secondVerify',
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
}
