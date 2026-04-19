import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { useAppStore } from '../../store/useAppStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;

  /**
   * Initialize a new socket connection with JWT authentication.
   */
  connect(token: string): void {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    useAppStore.getState().setSocketStatus('CONNECTING');

    this.socket.on('connect', () => {
      useAppStore.getState().setSocketStatus('CONNECTED');
    });

    this.socket.on('connect_error', (error) => {
      useAppStore.getState().setSocketStatus('ERROR', error.message);
    });

    this.socket.on('disconnect', (_reason) => {
      useAppStore.getState().setSocketStatus('DISCONNECTED');
    });
  }

  /**
   * Safely tear down the socket connection.
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Subscribe to a specific real-time event.
   * Returns an unsubscribe function for easy cleanup in useEffect.
   */
  subscribe<T = unknown>(event: string, handler: (data: T) => void): () => void {
    if (!this.socket) {
      return () => {};
    }

    this.socket.on(event, handler);

    // Return the cleanup function (important for React Hooks)
    return () => {
      this.socket?.off(event, handler);
    };
  }

  /**
   * Emit an event to the server.
   */
  emit(event: string, data?: unknown): void {
    if (!this.socket?.connected) {
      return;
    }
    this.socket.emit(event, data);
  }
}

// Export as a singleton
export const socketService = new SocketService();
