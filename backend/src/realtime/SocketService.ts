import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { eventBus } from './EventBus';
import { SocketEvents } from './events';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';
import { UserRole } from '../core/domain/User';

interface SocketUser {
  userId: string;
  email: string;
  role: UserRole;
}

declare module 'socket.io' {
  interface Socket {
    user?: SocketUser;
  }
}

export class SocketService {
  private io: SocketServer;

  constructor(httpServer: HttpServer) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.registerMiddleware();
    this.registerConnectionHandlers();
    this.subscribeToEventBus();
  }

  private registerMiddleware(): void {
    const secret = process.env.JWT_SECRET || 'fallback_secret';

    this.io.use((socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        logger.warn({
          event: 'SOCKET_AUTH_FAILED',
          details: { socketId: socket.id, reason: 'No token provided' }
        });
        return next(new Error('Authentication error: Token missing'));
      }

      try {
        const decoded = jwt.verify(token, secret) as any;
        socket.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        };
        next();
      } catch (err) {
        logger.warn({
          event: 'SOCKET_AUTH_FAILED',
          details: { socketId: socket.id, reason: 'Invalid token' }
        });
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  private registerConnectionHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      logger.info({
        event: 'SOCKET_CONNECTED',
        details: { 
          socketId: socket.id, 
          userId: socket.user?.userId,
          role: socket.user?.role
        }
      });

      socket.on('join_room', (roomId: string) => {
        socket.join(roomId);
        logger.info({
          event: 'SOCKET_ROOM_JOINED',
          roomId,
          details: { socketId: socket.id }
        });
      });

      socket.on('leave_room', (roomId: string) => {
        socket.leave(roomId);
        logger.info({
          event: 'SOCKET_ROOM_LEFT',
          roomId,
          details: { socketId: socket.id }
        });
      });

      socket.on('disconnect', () => {
        logger.info({
          event: 'SOCKET_DISCONNECTED',
          details: { socketId: socket.id }
        });
      });
    });
  }

  /**
   * Subscribe to all internal domain events from the EventBus
   * and broadcast them to the correct socket room.
   * No business logic lives here; only broadcasting.
   */
  private subscribeToEventBus(): void {
    eventBus.on(SocketEvents.ROOM_JOINED, (payload) => {
      this.io.to(payload.roomId).emit(SocketEvents.ROOM_JOINED, payload);
    });

    eventBus.on(SocketEvents.DEBATE_STARTED, (payload) => {
      this.io.to(payload.roomId).emit(SocketEvents.DEBATE_STARTED, payload);
    });

    eventBus.on(SocketEvents.STATE_CHANGED, (payload) => {
      this.io.to(payload.roomId).emit(SocketEvents.STATE_CHANGED, payload);
    });

    eventBus.on(SocketEvents.TIMER_TICK, (payload) => {
      this.io.to(payload.roomId).emit(SocketEvents.TIMER_TICK, payload);
    });

    eventBus.on(SocketEvents.ARGUMENT_SUBMITTED, (payload) => {
      this.io.to(payload.roomId).emit(SocketEvents.ARGUMENT_SUBMITTED, payload);
    });

    eventBus.on(SocketEvents.VOTE_UPDATED, (payload) => {
      this.io.to(payload.roomId).emit(SocketEvents.VOTE_UPDATED, payload);
    });

    eventBus.on(SocketEvents.RESULT_DECLARED, (payload) => {
      this.io.to(payload.roomId).emit(SocketEvents.RESULT_DECLARED, payload);
    });
  }

  getServer(): SocketServer {
    return this.io;
  }
}
