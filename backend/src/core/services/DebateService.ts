import { IRoomRepository } from '../interfaces/IRoomRepository';
import { IParticipantRepository } from '../interfaces/IParticipantRepository';
import { Room, RoomStatus, TransitionTrigger, StateTransition } from '../domain/Room';
import { UserRole } from '../domain/User';
import { DebateSide } from '../domain/RoomParticipant';
import { TimerService } from './TimerService';
import { VotingService } from './VotingService';
import { eventBus } from '../../realtime/EventBus';
import { SocketEvents } from '../../realtime/events';
import { logger } from '../../utils/logger';
import { InvalidStateError, NotFoundError, ConflictError, UnauthorizedError, ValidationError } from '../../utils/errors';
import { ValidationService } from './ValidationService';

export class DebateService {
  private readonly validTransitions: Record<RoomStatus, RoomStatus[]> = {
    [RoomStatus.WAITING]: [RoomStatus.OPENING],
    [RoomStatus.OPENING]: [RoomStatus.REBUTTAL],
    [RoomStatus.REBUTTAL]: [RoomStatus.CLOSING],
    [RoomStatus.CLOSING]: [RoomStatus.VOTING],
    [RoomStatus.VOTING]: [RoomStatus.ENDED],
    [RoomStatus.ENDED]: []
  };

  private readonly phaseDurations: Record<RoomStatus, number> = {
    [RoomStatus.WAITING]: 0,
    [RoomStatus.OPENING]: 60,   // 1 minute
    [RoomStatus.REBUTTAL]: 120, // 2 minutes
    [RoomStatus.CLOSING]: 60,   // 1 minute
    [RoomStatus.VOTING]: 30,    // 30 seconds
    [RoomStatus.ENDED]: 0
  };

  constructor(
    private roomRepository: IRoomRepository,
    private participantRepository: IParticipantRepository,
    private timerService: TimerService,
    private votingService: VotingService,
    private validator: ValidationService
  ) {}

  async startDebate(roomId: string, moderatorId: string): Promise<Room> {
    const room = await this.validator.getValidRoom(roomId);
    await this.validator.ensureIsModerator(moderatorId, roomId);
    
    const participants = await this.participantRepository.findByRoomId(roomId);
    const speakers = participants.filter(p => p.role === UserRole.SPEAKER);
    room.validateCanStart(speakers.length);

    const startedRoom = await this.executeTransition(roomId, RoomStatus.OPENING, RoomStatus.WAITING, 'MODERATOR');
    eventBus.emit(SocketEvents.DEBATE_STARTED, {
      event: SocketEvents.DEBATE_STARTED,
      data: {
        roomId: startedRoom.id,
        state: startedRoom.status
      }
    });
    return startedRoom;
  }

  async transitionState(roomId: string, moderatorId: string): Promise<Room> {
    const room = await this.validator.getValidRoom(roomId);
    await this.validator.ensureIsModerator(moderatorId, roomId);
    return await this.executeNextState(room, 'MODERATOR');
  }

  private async executeNextState(room: Room, triggeredBy: TransitionTrigger): Promise<Room> {
    const allowedTransitions = this.validTransitions[room.status];
    if (!allowedTransitions || allowedTransitions.length === 0) {
      throw new InvalidStateError(`Cannot transition from current state: ${room.status}`);
    }

    const nextStatus = allowedTransitions[0];
    if (!nextStatus) throw new InvalidStateError('No next state available');

    return await this.executeTransition(room.id, nextStatus, room.status, triggeredBy);
  }

  private async executeTransition(roomId: string, nextStatus: RoomStatus, expectedCurrentStatus: RoomStatus, triggeredBy: TransitionTrigger): Promise<Room> {
    let updatedRoom: Room | null = null;
    let attempts = 0;
    const maxRetries = 1;
    const requestId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

    logger.info({
      event: 'TRANSACTION_START',
      roomId,
      userId: requestId
    });

    while (attempts <= maxRetries) {
      try {
        updatedRoom = await this.roomRepository.transactionalUpdate(roomId, requestId, async (latestRoom) => {
          if (latestRoom.status !== expectedCurrentStatus) {
            logger.error({
              event: 'VALIDATION_FAILED',
              roomId,
              userId: requestId,
              details: { expected: expectedCurrentStatus, actual: latestRoom.status }
            });
            throw new ConflictError(`Concurrent update detected: Room state is already ${latestRoom.status}`);
          }

          const allowedTransitions = this.validTransitions[latestRoom.status] || [];
          if (!allowedTransitions.includes(nextStatus)) {
            logger.error({
              event: 'VALIDATION_FAILED',
              roomId,
              userId: requestId,
              details: { invalidTransition: nextStatus }
            });
            throw new InvalidStateError(`Invalid transition from ${latestRoom.status} to ${nextStatus}`);
          }

          const fromStatus = latestRoom.status;
          latestRoom.status = nextStatus;
          latestRoom.updatedAt = new Date();
          latestRoom.stateStartTime = new Date();
          latestRoom.phaseDuration = this.phaseDurations[nextStatus] || 0;
          latestRoom.eventSequence++; 

          // Add to history
          if (!latestRoom.history) latestRoom.history = [];
          latestRoom.history.push({
            from: fromStatus,
            to: nextStatus,
            triggeredBy,
            timestamp: new Date()
          });

          logger.info({
            event: 'STATE_TRANSITION',
            roomId,
            userId: requestId,
            details: { from: fromStatus, to: nextStatus, triggeredBy }
          });

          if ([RoomStatus.OPENING, RoomStatus.REBUTTAL, RoomStatus.CLOSING].includes(nextStatus)) {
            // Reset to PRO for the start of the phase
            latestRoom.activeSpeakerId = null;
            latestRoom.activeSpeakerId = await this.getNextSpeaker(latestRoom);
          } else {
            latestRoom.activeSpeakerId = null;
          }

          if (nextStatus === RoomStatus.VOTING) {
            latestRoom.votingStartTime = new Date();
            latestRoom.votingEndTime = new Date(Date.now() + (latestRoom.phaseDuration || 0) * 1000);
          }
          
          if (nextStatus === RoomStatus.ENDED) {
            latestRoom.votingStartTime = null;
            latestRoom.votingEndTime = null;
          }

          return latestRoom;
        });
        break; // Successfully updated
      } catch (err: any) {
        if (err.message.includes('Concurrent update detected') && attempts < maxRetries) {
          attempts++;
          logger.info({
            event: 'LOCK_RETRY',
            roomId,
            userId: requestId,
            details: { attempt: attempts }
          });
          await new Promise(resolve => setTimeout(resolve, 50));
          continue;
        }
        throw err;
      }
    }

    if (!updatedRoom) throw new ConflictError('Failed to update room state after max retries');

    // Manage Timers
    const duration = this.phaseDurations[nextStatus];
    if (duration > 0) {
      this.timerService.startTimer(updatedRoom.id, duration, () => {
        this.handleTimerExpiration(updatedRoom.id, nextStatus);
      });
    } else {
      this.timerService.stopTimer(updatedRoom.id);
    }

    eventBus.emit(SocketEvents.STATE_CHANGED, {
      event: SocketEvents.STATE_CHANGED,
      data: {
        roomId: updatedRoom.id,
        state: updatedRoom.status,
        activeSpeaker: updatedRoom.activeSpeakerId,
        remainingTime: this.timerService.getRemainingTime(updatedRoom.id),
        sequenceNumber: updatedRoom.eventSequence
      }
    });

    if (nextStatus === RoomStatus.ENDED) {
      const result = await this.votingService.getResult(updatedRoom.id);
      
      // Increment sequence for the distinct result event
      const finalRoom = await this.roomRepository.transactionalUpdate(updatedRoom.id, 'SYSTEM', async (room) => {
        room.eventSequence++;
        room.winnerSide = result.winner;
        room.winningPercentage = result.winningPercentage ?? null;
        return room;
      });

      eventBus.emit(SocketEvents.RESULT_DECLARED, {
        event: SocketEvents.RESULT_DECLARED,
        data: {
          roomId: finalRoom.id,
          winner: finalRoom.winnerSide,
          stats: {
            tally: result.tally,
            totalVotes: result.totalVotes,
            winningPercentage: finalRoom.winningPercentage
          },
          sequenceNumber: finalRoom.eventSequence
        }
      });
    }

    return updatedRoom;
  }

  private async handleTimerExpiration(roomId: string, expectedState: RoomStatus): Promise<void> {
    try {
      const room = await this.roomRepository.findById(roomId);
      if (!room) return;

      if (room.status !== expectedState) {
        logger.info({
          event: 'TIMER_SKIPPED_STALE',
          roomId,
          details: { expected: expectedState, actual: room.status }
        });
        return;
      }

      if (room.status !== RoomStatus.ENDED) {
        await this.executeNextState(room, 'TIMER');
      }
    } catch (err: any) {
      if (err.code === 'CONFLICT_ERROR' || err.message.includes('Concurrent update')) {
        logger.info({
          event: 'TIMER_SKIPPED_CONFLICT',
          roomId,
          details: { reason: 'State changed by moderator during timer execution' }
        });
        return;
      }

      logger.error({
        event: 'TIMER_EXPIRATION_ERROR',
        roomId,
        details: { error: err.message }
      });
    }
  }



  async getNextSpeaker(room: Room): Promise<string | null> {
    const participants = await this.participantRepository.findByRoomId(room.id);
    const speakers = participants.filter(p => p.role === UserRole.SPEAKER);
    
    if (!room.activeSpeakerId) {
      const proSpeaker = speakers.find(s => s.side === DebateSide.PRO);
      return proSpeaker ? proSpeaker.userId : null;
    }
    
    const currentParticipant = speakers.find(s => s.userId === room.activeSpeakerId);
    if (!currentParticipant) return null;
    
    const nextSide = currentParticipant.side === DebateSide.PRO ? DebateSide.CON : DebateSide.PRO;
    const nextSpeaker = speakers.find(s => s.side === nextSide);
    return nextSpeaker ? nextSpeaker.userId : null;
  }

  async switchNextSpeaker(roomId: string): Promise<Room> {
    await this.validator.getValidRoom(roomId);
    const requestId = Math.random().toString(36).substring(7);
    return await this.roomRepository.transactionalUpdate(roomId, requestId, async (room) => {
      room.eventSequence++;
      room.activeSpeakerId = await this.getNextSpeaker(room);
      room.updatedAt = new Date();
      return room;
    });
  }

  getRemainingTime(roomId: string): number {
    return this.timerService.getRemainingTime(roomId);
  }

  async recoverTimers(): Promise<void> {
    const rooms = await this.roomRepository.findAll();
    for (const room of rooms) {
      if (room.status === RoomStatus.ENDED || room.status === RoomStatus.WAITING) continue;
      
      const start = room.stateStartTime;
      const duration = room.phaseDuration;
      
      if (!start || !duration) continue;
      
      const elapsedMs = Date.now() - new Date(start).getTime();
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      const remaining = duration - elapsedSeconds;
      
      if (remaining > 0) {
        logger.info({
          event: 'TIMER_RECOVERED',
          roomId: room.id,
          details: { remaining }
        });
        this.timerService.startTimer(room.id, remaining, () => {
          this.handleTimerExpiration(room.id, room.status);
        });
      } else {
        // Expired while offline
        logger.info({
          event: 'TIMER_EXPIRED_OFFLINE',
          roomId: room.id
        });
        // We'll treat this as a TIMER triggered transition during recovery
        await this.handleTimerExpiration(room.id, room.status).catch(err => {
           logger.error({
             event: 'TIMER_EXPIRED_OFFLINE_ERROR',
             roomId: room.id,
             details: { error: err.message }
           });
        });
      }
    }
  }
}
