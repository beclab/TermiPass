import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import * as WebSocket from 'ws';
import {
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import axios, { AxiosInstance } from 'axios';

@WebSocketGateway(5300, { transports: ['websocket'] })
export class WsStartGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private readonly logger = new Logger(WsStartGateway.name);
  private clients: Record<string, any> = {};
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: '',
      timeout: 2000,
      headers: {},
    });
  }

  @WebSocketServer() private server: any;
  wsClients = [];

  afterInit() {
    this.logger.log('afterInit');
  }

  handleConnection(client: any) {
    this.logger.log('handleConnection ');
    this.logger.log(client);

    this.wsClients.push(client);
    const id = '' + new Date().getTime();
    this.clients[id] = client;

    this.instance.post('http://localhost:3010/websocket/message', {
      action: 'open',
      conn_id: id,
      username: '',
      data: {},
    });
  }

  getClientId(client) {
    for (const key in this.clients) {
      if (this.clients[key] === client) {
        //return this.clients[key];
        return key;
      }
    }
  }

  handleDisconnect(client) {
    this.logger.log('handleDisconnect');
    for (let i = 0; i < this.wsClients.length; i++) {
      if (this.wsClients[i] === client) {
        this.logger.log('this.wsClients[i] removed');
        this.wsClients.splice(i, 1);

        const id = this.getClientId(client);
        console.log('handleDisconnect id', id);
        if (id) {
          delete this.clients[id];

          // for (const key in this.clients) {
          //   if (key === client) {
          //     id = this.clients[key];
          //     console.log('id', id);
          //     delete this.clients[key];
          //   }
          // }

          this.instance.post('http://localhost:3010/websocket/message', {
            action: 'close',
            conn_id: id,
            username: '',
            data: {},
          });
        }
      }
    }

    // this.broadcast('disconnect', {});
  }

  @SubscribeMessage('ping')
  async ping(
    @MessageBody() data: any,
    @ConnectedSocket() client: WebSocket,
  ): Promise<any> {
    this.logger.log('message');
    this.logger.log(data);

    const id = this.getClientId(client);
    this.logger.log('id ', id);

    this.instance.post('http://localhost:3010/websocket/message', {
      action: 'message',
      conn_id: id,
      username: '',
      data: {
        event: 'ping',
        data,
      },
    });
  }

  @SubscribeMessage('login')
  async login(
    @MessageBody() data: any,
    @ConnectedSocket() client: WebSocket,
  ): Promise<any> {
    this.logger.log('message');
    this.logger.log(data);

    const id = this.getClientId(client);
    this.logger.log('id ', id);

    this.instance.post('http://localhost:3010/websocket/message', {
      action: 'message',
      conn_id: id,
      username: '',
      data: {
        event: 'login',
        data,
      },
    });
  }

  public async sendMessage(id: string, data: any): Promise<void> {
    console.log(id);
    console.log(data);
    if (id in this.clients) {
      await this.clients[id].send(JSON.stringify(data));
    } else {
      this.logger.error('id ' + id + ' ' + 'not exists');
    }
  }

  public async broadcastMessage(data: any): Promise<void> {
    for (const key in this.clients) {
      await this.clients[key].send(JSON.stringify(data));
    }
  }
}
