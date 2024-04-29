import { Controller, Logger, Post, Body, HttpCode } from '@nestjs/common';
import { sendWebsocketMessage, WebSocketMessage } from './websocketClient';
import { WebSocketService } from './websocket.service';
import { MessageBody, MessageTopic } from '@bytetrade/core';
import { ProviderClient } from './provider.client';
import { v4 as uuidv4 } from 'uuid';

const providerUrl = 'http://' + process.env.OS_SYSTEM_SERVER;
const OS_APP_KEY = process.env.OS_APP_KEY;
const OS_APP_SECRET = process.env.OS_APP_SECRET;
const IS_DEBUG = process.env.IS_DEBUG || false;

@Controller('/websocket')
export class WebSocketController {
  private readonly logger = new Logger(WebSocketController.name);
  client: ProviderClient;

  constructor(private readonly webSocketService: WebSocketService) {
    //
    this.client = new ProviderClient(
      providerUrl,
      OS_APP_KEY!,
      OS_APP_SECRET!,
      'notification',
      'service.notification',
      'token',
      ['Create'],
      false,
    );
  }

  @Post('/message')
  @HttpCode(200)
  async onMessage(@Body() message: WebSocketMessage): Promise<void> {
    this.logger.debug('websocket/message');
    this.logger.debug(message);

    if (message.action == 'open') {
      await this.onOpen(message);
    } else if (message.action == 'close') {
      this.onClose(message);
    } else if (message.action == 'message') {
      if (message.data.event == 'ping') {
        await this.onPing(message);
      } else if (message.data.event == 'login') {
        await this.onLogin(message);
      } else {
        this.logger.warn('unknown topic ' + message.data.event);
      }
    } else {
      this.logger.warn('unknown action ' + message.action);
      this.logger.warn(message);
    }

    return;
  }

  private async onOpen(message: WebSocketMessage) {
    this.logger.debug('onOpen: ' + message.conn_id);
    sendWebsocketMessage(
      {
        topic: MessageTopic.Data,
        event: 'onOpen',
        message: {
          id: await uuidv4(),
        },
        terminusName: this.webSocketService.terminusInfo.terminusName,
      },
      message.conn_id,
      null,
    );
  }

  private async onPing(message: WebSocketMessage) {
    this.logger.debug('onOpen: ' + message.conn_id);
    sendWebsocketMessage(
      {
        topic: MessageTopic.PONG,
        event: 'pong',
        message: {
          id: await uuidv4(),
        },
        terminusName: this.webSocketService.terminusInfo.terminusName,
      },
      message.conn_id,
      null,
    );
  }

  private onClose(message: WebSocketMessage) {
    this.webSocketService.disConnectByClientId(message.conn_id);
  }

  private async onLogin(message: WebSocketMessage) {
    this.logger.log('login');
    this.logger.log(message.data.data);
    if (message.data.data.firebase_token) {
      this.webSocketService.setFirebaseToken(
        message.data.data.firebase_token,
        message.conn_id,
      );

      if (process.env.OS_SYSTEM_SERVER) {
        try {
          await this.client.execute('/Create', {
            token: message.data.data.firebase_token,
            name: message.data.data.name,
            did: message.data.data.did,
          });
          this.logger.debug('Post Firebase succeed');
        } catch (e) {
          console.log(e);
          this.logger.error('Post Firebase failed');
        }
      } else {
        this.logger.error('Not set OS_SYSTEM_SERVER;skip set firebase token');
      }

      try {
        sendWebsocketMessage(
          {
            topic: MessageTopic.Data,
            event: 'login',
            message: {
              id: await uuidv4(),
              data: {
                code: 0,
                msg: 'success',
              },
            },
            terminusName: this.webSocketService.terminusInfo.terminusName,
          },
          message.conn_id,
          null,
        );
      } catch (e) {
        console.log(e);
        sendWebsocketMessage(
          {
            topic: MessageTopic.Data,
            event: 'login',
            message: {
              id: await uuidv4(),
              data: {
                code: 1,
                msg: 'failed',
              },
            },
            terminusName: this.webSocketService.terminusInfo.terminusName,
          },
          message.conn_id,
          null,
        );
      }
    } else {
      sendWebsocketMessage(
        {
          topic: MessageTopic.Data,
          event: 'login',
          message: {
            id: await uuidv4(),
            data: {
              code: 1,
              msg: 'failed',
            },
          },
          terminusName: this.webSocketService.terminusInfo.terminusName,
        },
        message.conn_id,
        null,
      );
    }
  }
}
