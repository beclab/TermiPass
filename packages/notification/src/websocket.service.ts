import axios from 'axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  NotificationMessage,
  FireBaseToken,
  TerminusInfo,
} from '@bytetrade/core';
import { sendWebsocketMessage } from './websocketClient';
@Injectable()
export class WebSocketService implements OnModuleInit {
  private readonly logger = new Logger(WebSocketService.name);
  private clients: Record<FireBaseToken, string> = {};

  constructor() {
    this.logger.log('init service');
  }

  public terminusInfo: TerminusInfo | null = null;

  public async updateTerminusInfo(): Promise<TerminusInfo> {
    const response: any = await axios.get(
      'http://bfl/bfl/backend/v1/terminus-info',
    );
    if (response.status !== 200) {
      throw new Error(response.statusText);
    }
    if (response.data.code != 0) {
      throw new Error(response.data);
    }
    this.terminusInfo = response.data.data;
    this.logger.log('terminusInfo');
    this.logger.log(this.terminusInfo);
    return response.data.data;
  }

  async onModuleInit(): Promise<void> {
    this.logger.log(`The module start initialize`);

    await this.updateTerminusInfo();
  }

  setFirebaseToken(firebase_token: FireBaseToken, client_id: string) {
    this.logger.debug('setFirebaseToken ' + firebase_token);
    for (const key in this.clients) {
      if (this.clients[key] == client_id) {
        delete this.clients[key];
        this.logger.debug('removePreviousToken ' + key);
      }
    }
    this.clients[firebase_token] = client_id;
  }

  disConnectByClientId(client_id: string) {
    this.logger.debug('disConnectByClientId ' + client_id);

    for (const key in this.clients) {
      if (this.clients[key] == client_id) {
        delete this.clients[key];
        this.logger.debug('disConnectByClientId remove succeed');
        return;
      }
    }
    this.logger.error('disConnectByClientId remove failed');
  }

  // public removeFirebaseToken(firebase_token: FireBaseToken) {
  //   this.logger.debug('removeFirebaseToken ' + firebase_token);
  //   delete this.clients[firebase_token];
  // }

  public async sendMessage(n: NotificationMessage): Promise<boolean> {
    if (!(n.recipient.token in this.clients)) {
      this.logger.debug(this.clients);
      this.logger.debug('id not in clients ' + n.recipient.token);
      return false;
    }

    try {
      const result = await sendWebsocketMessage(
        n.message,
        this.clients[n.recipient.token],
        null,
      );

      console.log('send result');
      console.log(result);
      if (result && result.code == 0) {
        return true;
      }
      return false;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
