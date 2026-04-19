import { EventEmitter } from 'events';
import { eventBus } from '../../realtime/EventBus';
import { SocketEvents } from '../../realtime/events';
import { logger } from '../../utils/logger';

export interface TimerTick {
  roomId: string;
  remainingTime: number;
}

export class TimerService extends EventEmitter {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private timers: Map<string, number> = new Map();

  /**
   * Starts a countdown timer for a specific room.
   * @param roomId Target room ID
   * @param durationInSeconds Duration of the phase
   * @param onComplete Callback triggered when timer reaches zero
   */
  startTimer(roomId: string, durationInSeconds: number, onComplete: () => void): void {
    this.stopTimer(roomId);

    this.timers.set(roomId, durationInSeconds);
    
    logger.info({
      event: 'TIMER_START',
      roomId,
      details: { durationInSeconds }
    });

    const interval = setInterval(() => {
      let remaining = this.timers.get(roomId) || 0;
      
      if (remaining <= 0) {
        this.stopTimer(roomId);
        onComplete();
        return;
      }

      remaining -= 1;
      this.timers.set(roomId, remaining);
      // Emit tick for WebSocket consumption via global eventBus
      eventBus.emit(SocketEvents.TIMER_TICK, {
        event: SocketEvents.TIMER_TICK,
        data: {
          roomId,
          remainingTime: remaining
        }
      });

    }, 1000);

    this.intervals.set(roomId, interval);
  }

  stopTimer(roomId: string): void {
    const existingInterval = this.intervals.get(roomId);
    if (existingInterval) {
      clearInterval(existingInterval);
      this.intervals.delete(roomId);
      logger.info({
        event: 'TIMER_STOP',
        roomId
      });
    }
    this.timers.delete(roomId);
  }

  getRemainingTime(roomId: string): number {
    return this.timers.get(roomId) || 0;
  }
}
