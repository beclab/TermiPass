import { Controller, Logger, Get, Post, Body, Param } from '@nestjs/common';
import { Result, returnSucceed } from '@bytetrade/core';
import { WsStartGateway } from './ws.gateway';
import { SendWebSocketMessage } from './websocketClient';
import axios, { AxiosInstance } from 'axios';
import { Cloud_URL } from './utils';

@Controller('/callback')
export class CallbackController {
  private readonly logger = new Logger(CallbackController.name);

  constructor(private readonly gateway: WsStartGateway) {}

  @Post('/push')
  async push_notification(
    @Body() data: SendWebSocketMessage,
  ): Promise<Result<null>> {
    this.logger.debug('create_notification');
    this.logger.debug(data);
    await this.gateway.sendMessage(data.conn_id, data.payload);
    return returnSucceed(null);
  }
}
