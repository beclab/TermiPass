import { Controller, Logger, Get, Post, Body, Param } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import {
  Result,
  ProviderRequest,
  returnSucceed,
  returnError,
} from '@bytetrade/core';
import { NotificationMessage, NotificationResultCode } from '@bytetrade/core';
import { Cron } from '@nestjs/schedule';
import { WebSocketService } from './websocket.service';

@Controller('/notification')
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);
  private instance: AxiosInstance;
  private results: Record<number, any> = {};
  private messages: NotificationMessage[] = [];

  constructor(private readonly webSocketService: WebSocketService) {
    this.instance = axios.create({
      baseURL: '',
      timeout: 2000,
      headers: {},
    });
  }

  updateNotification(data: Result<number>) {
    this.results[data.data] = data;
    this.results[data.data].timestamp = new Date().getTime();
    return data;
  }

  @Post('/create')
  async push_notification(
    @Body() data: ProviderRequest<NotificationMessage>,
  ): Promise<Result<number>> {
    this.logger.debug('create_notification');
    this.logger.debug(data);
    const notification = data.data;

    this.logger.debug(notification);
    this.messages.push(notification);
    return this.updateNotification({
      code: NotificationResultCode.Waiting,
      message: '',
      data: notification.id,
    });
  }

  @Post('/query')
  async query_notification(
    @Body() data: ProviderRequest<NotificationMessage>,
  ): Promise<Result<number>> {
    this.logger.debug('query_notification');
    this.logger.debug(data);
    const notification = data.data;

    if (notification.id in this.results) {
      return this.results[notification.id];
    }
    return {
      code: NotificationResultCode.NotFound,
      message: 'Notification Not Found',
      data: notification.id,
    };
  }

  @Cron('0/1 * * * * *')
  async handleSendMessage() {
    //this.logger.debug('handleSendMessage ' + this.messages.length);
    if (this.messages.length == 0) {
      return;
    }
    const notification = this.messages.shift();
    try {
      //const push_ws = await this.ws.sendMessage(notification);
      const push_ws = await this.webSocketService.sendMessage(notification);
      this.logger.debug('push_ws ' + push_ws);
      if (push_ws) {
        return this.updateNotification({
          code: NotificationResultCode.Success,
          message: 'Push Notification By Websocket',
          data: notification.id,
        });
      }

      const response = await this.instance.post(
        'https://firebase-push-test.bttcdn.com/v1/api/push',
        notification,
      );
      this.logger.debug('firebase response');
      this.logger.debug(response.data);
      if (response.status != 200 || !response.data || response.data.code != 0) {
        return this.updateNotification({
          code: NotificationResultCode.NetworkError,
          message: 'Push Notification Error',
          data: notification.id,
        });
      }

      return this.updateNotification({
        code: NotificationResultCode.Success,
        message: 'Push Notification By Firebase',
        data: notification.id,
      });
    } catch (e) {
      this.logger.debug(e);
      return this.updateNotification({
        code: NotificationResultCode.NetworkError,
        message: 'Push Notification Error',
        data: notification.id,
      });
    }
  }

  @Cron('0 * * * * *')
  async handleCron() {
    // this.logger.debug('handleCron');
    const now = new Date().getTime();
    for (const id in this.results) {
      if (this.results[id].timestamp + 1000 * 60 > now) {
        this.logger.debug(
          'Remove from results ' + id + ' ' + this.results[id].timestamp,
        );
        delete this.results[id];
      } else {
        this.logger.debug(
          'Result not removed ' + id + ' ' + this.results[id].timestamp,
        );
      }
    }
  }

  // @Post('/token')
  // async addToken(@Body() data: any): Promise<Result<null>> {
  //   console.log('addToken start');
  //   console.log(data);
  //   // const device = session.device;
  //   // console.log(device);
  //   // const name = device?.userAgent + ' ' + device?.platform;
  //   // console.log(name);

  //   // const acessToken = await getAccessToken(
  //   //   'service.notification',
  //   //   'token',
  //   //   'Create',
  //   // );
  //   // console.log('get token acesstoken ' + acessToken);
  //   // if (acessToken) {
  //   //   const res = await createToken(acessToken, data.name, data.firebase_token);
  //   //   console.log(res);
  //   //   return returnSucceed(null);
  //   // } else {
  //   //   return returnError(100, 'create Token Failed');
  //   // }

  //   try {
  //     const res = await this.client.execute('/Create', {
  //       token: data.firebase_token,
  //       name: data.name,
  //     });
  //     console.log(res);
  //     return returnSucceed(null);
  //   } catch (e) {
  //     console.log(e);
  //     return returnError(100, 'create Token Failed');
  //   }
  // }
}
