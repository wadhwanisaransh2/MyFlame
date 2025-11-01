import {BASE_URL} from './config';
import {getAsyncStorage} from '../Utils/general';
import {ASYNC_KEYS} from '../Utils/constant';

// Convert HTTP/HTTPS URL to WebSocket URL (ws/wss)
const getWebSocketUrl = () => {
  const baseUrl = BASE_URL.replace('http://', 'ws://').replace(
    'https://',
    'wss://',
  );
  return baseUrl.endsWith('/') ? `${baseUrl}ws` : `${baseUrl}/ws`;
};
class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private messageListeners: ((message: any) => void)[] = [];
  private connectionListeners: ((status: boolean) => void)[] = [];

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public async connect(): Promise<void> {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const token = await getAsyncStorage(ASYNC_KEYS.ACCESS_TOKEN);
      const wsUrl = `${getWebSocketUrl()}?token=${token}`;

      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        this.notifyConnectionListeners(true);
      };

      this.socket.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          this.notifyMessageListeners(data);
        } catch (error) {
          }
      };

      this.socket.onerror = error => {
        };

      this.socket.onclose = event => {
        this.notifyConnectionListeners(false);
        this.attemptReconnect();
      };
    } catch (error) {
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }

      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  public sendMessage(data: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      // Queue message to be sent when connection is established
      this.connect().then(() => {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify(data));
        }
      });
    }
  }

  public addMessageListener(listener: (message: any) => void): void {
    this.messageListeners.push(listener);
  }

  public removeMessageListener(listener: (message: any) => void): void {
    this.messageListeners = this.messageListeners.filter(l => l !== listener);
  }

  public addConnectionListener(listener: (status: boolean) => void): void {
    this.connectionListeners.push(listener);
  }

  public removeConnectionListener(listener: (status: boolean) => void): void {
    this.connectionListeners = this.connectionListeners.filter(
      l => l !== listener,
    );
  }

  private notifyMessageListeners(message: any): void {
    this.messageListeners.forEach(listener => listener(message));
  }

  private notifyConnectionListeners(status: boolean): void {
    this.connectionListeners.forEach(listener => listener(status));
  }

  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}

export default WebSocketService.getInstance();
