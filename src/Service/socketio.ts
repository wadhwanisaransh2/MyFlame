import {io, Socket} from 'socket.io-client';
import {getAsyncStorage} from '../Utils/general';
import {ASYNC_KEYS} from '../Utils/constant';
import {SOCKET_URL} from './config';
import {socketEvents} from '../Constants/socket';

export let socket: Socket | null = null;

async function socketService() {
  const token = await getAsyncStorage(ASYNC_KEYS.ACCESS_TOKEN);

  socket = io(SOCKET_URL, {
    path: '/socket.io',
    forceNew: false,
    reconnectionAttempts: Infinity,
    timeout: 20000,
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  socket.on('connect', () => {
    });

  socket.on('disconnect', (reason: any) => {
    });
}

function sendMessage(
  receiverId: string,
  content: string,
  type: 'text' | 'gif' | 'post' | 'image',
  replyTo?: string,
  replyToMessageObject?: any,
): void {
  socket?.emit(
    'sendMessage',
    {receiverId, content, type, replyTo, replyToMessageObject},
    (error: any) => {
      if (error) {
        }
    },
  );
}

function onMessageReceived(callback: (data: any) => void): void {
  socket?.on('newMessage', callback);
}

function socketEmit(evt: string, data?: any) {
  socket?.emit(evt, data);
}

function socketListen(event: string, cb: any) {
  socket?.on(event, cb);
}

function socketDisconnect() {
  socket?.disconnect();
}

export {
  socketService,
  sendMessage,
  onMessageReceived,
  socketDisconnect,
  socketEmit,
  socketListen,
};
