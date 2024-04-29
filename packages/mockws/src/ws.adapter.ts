import * as WebSocket from 'ws';
import {
  WebSocketAdapter,
  INestApplicationContext,
  Logger,
} from '@nestjs/common';
import { MessageMappingProperties } from '@nestjs/websockets';
import { Observable, fromEvent, EMPTY } from 'rxjs';
import { mergeMap, filter } from 'rxjs/operators';

export class WsAdapter implements WebSocketAdapter {
  private readonly logger = new Logger(WsAdapter.name);
  constructor(private app: INestApplicationContext) {}

  create(port: number, options: any = {}): any {
    console.log('ws create ' + port);
    console.log(options);
    return new WebSocket.Server({ port, ...options });
  }

  bindClientConnect(server, callback) {
    //console.log('ws bindClientConnect, server:\n', server);
    server.on('connection', callback);
  }

  bindClientDisconnect(server, callback) {
    //console.log('ws bindClientDisconnect, server:\n', server);
    server.on('close', callback);
  }

  bindMessageHandlers(
    client: WebSocket,
    handlers: MessageMappingProperties[],
    process: (data: any) => Observable<any>,
  ) {
    this.logger.debug('[waAdapter]有新的连接进来 ');
    // JSON.stringify(client);
    try {
      fromEvent(client, 'message')
        .pipe(
          mergeMap((data) =>
            this.bindMessageHandler(client, data, handlers, process),
          ),
          filter((result) => result),
        )
        .subscribe({
          next: (response) => client.send(JSON.stringify(response)),
          complete: () => console.log('complete'),
          error: (err) => console.log('error', err),
        });
    } catch (err) {
      console.log(err);
    }
  }

  //   bindClientDisconnect?(client: any, callback: any): any {
  //     console.log(callback);
  //     this.logger.debug('[waAdapter]bindClientDisconnect ');
  //   }

  bindMessageHandler(
    client: WebSocket,
    buffer,
    handlers: MessageMappingProperties[],
    process: (data: any) => Observable<any>,
  ): Observable<any> {
    let message = null;
    try {
      message = JSON.parse(buffer.data);
    } catch (error) {
      this.logger.debug('ws解析json出错', error);
      return EMPTY;
    }

    const messageHandler = handlers.find(
      (handler) => handler.message === message.event,
    );
    if (!messageHandler) {
      return EMPTY;
    }
    return process(messageHandler.callback(message.data));
  }

  close(server) {
    this.logger.debug('ws server close');
    server.close();
  }
}
