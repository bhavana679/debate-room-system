import { EventEmitter } from 'events';

/**
 * Application-wide internal event bus.
 * Services emit domain events here.
 * The socket server subscribes and broadcasts to clients.
 * This decouples the service layer from WebSocket infrastructure entirely.
 */
class EventBus extends EventEmitter {}

export const eventBus = new EventBus();
