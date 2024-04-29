import axios from 'axios';
export const WebSocketURL = 'http://localhost:40010';
import { MessageBody } from '@bytetrade/core';
export interface WebSocketConnection {
  id: string;
  userAgent: string;
}

export interface WebSocketUser {
  name: string;
  conns: WebSocketConnection[];
}

export interface WebSocketSendResult {
  code: number;
  message: string;
}

export interface WebSocketMessage {
  action: 'open' | 'close' | 'message';
  conn_id: string;
  user_name: string;
  data: any;
}

export interface SendWebSocketMessage {
  conn_id: string;
  user_name: string;
  payload: any;
}

export async function getWSConnectionList(): Promise<
  WebSocketUser[] | undefined
> {
  try {
    const response = await axios.get(WebSocketURL + '/tapr/ws/conn/list');
    if (!response.data || response.data.code != 0) {
      return undefined;
    }
    return response.data.data;
  } catch (e) {
    console.log(e);
    return undefined;
  }
}

export async function broadcastWebsocketMessage(payload: any): Promise<number> {
  try {
    const users = await getWSConnectionList();
    if (users.length == 0) {
      return 0;
    }

    const usernames = users.map((u) => u.name);
    const data = {
      payload,
    };

    data['users'] = usernames;

    await axios.post(WebSocketURL + '/tapr/ws/conn/send', data);

    //return response.data;
    return users.length;
  } catch (e) {
    console.log(e);
    return 0;
  }
}

export async function sendWebsocketMessage(
  payload: MessageBody,
  connection_id: string,
  usernames: string[],
): Promise<WebSocketSendResult | undefined> {
  try {
    const data = {
      data: payload,
    };
    if (connection_id) {
      data['conn_id'] = connection_id;
    }
    if (usernames && usernames.length > 0) {
      data['users'] = usernames;
    }

    const response = await axios.post(
      WebSocketURL + '/tapr/ws/conn/send',
      data,
    );

    return response.data;
  } catch (e) {
    console.log(e);
    return undefined;
  }
}

export async function closeWebsocketConnection(
  connections: string[],
  usernames: string[],
): Promise<WebSocketSendResult | undefined> {
  try {
    const data = {};
    if (connections && connections.length > 0) {
      data['conns'] = connections;
    }
    if (usernames && usernames.length > 0) {
      data['users'] = usernames;
    }

    const response = await axios.post(
      WebSocketURL + '/tapr/ws/conn/close',
      data,
    );

    return response.data;
  } catch (e) {
    console.log(e);
    return undefined;
  }
}
