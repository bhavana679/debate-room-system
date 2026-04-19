import { IRoomRepository } from '../interfaces/IRoomRepository';
import { IParticipantRepository } from '../interfaces/IParticipantRepository';
import { IArgumentRepository } from '../interfaces/IArgumentRepository';
import { Argument } from '../domain/Argument';
import { RoomStatus } from '../domain/Room';
import { UserRole } from '../domain/User';
import { DebateSide } from '../domain/RoomParticipant';
import { eventBus } from '../../realtime/EventBus';
import { SocketEvents } from '../../realtime/events';
import { logger } from '../../utils/logger';
import { DebateService } from './DebateService';
import { ValidationService } from './ValidationService';
import { ValidationError, NotFoundError, InvalidStateError, UnauthorizedError } from '../../utils/errors';

const ARGUMENT_ALLOWED_STATES: RoomStatus[] = [
  RoomStatus.OPENING,
  RoomStatus.REBUTTAL,
  RoomStatus.CLOSING
];

export interface SubmitArgumentDTO {
  roomId: string;
  userId: string;
  content: string;
}

export class ArgumentService {
  constructor(
    private roomRepository: IRoomRepository,
    private participantRepository: IParticipantRepository,
    private argumentRepository: IArgumentRepository,
    private debateService: DebateService,
    private validator: ValidationService
  ) {}

  async submitArgument(data: SubmitArgumentDTO): Promise<Argument> {
    this.validator.validateInput(data, ['roomId', 'userId', 'content']);
    const { roomId, userId, content } = data;

    const room = await this.validator.getValidRoom(roomId);
    this.validator.ensureState(room.status, ARGUMENT_ALLOWED_STATES);
    await this.validator.ensureIsSpeaker(userId, roomId);

    const speaker = await this.participantRepository.find(userId, roomId);
    if (!speaker) throw new UnauthorizedError('User is not a participant');

    const requestId = Math.random().toString(36).substring(7);
    const savedArgument = await this.argumentRepository.atomicSave(roomId, requestId, (lastSeq) => {
      return new Argument({
        id: Math.random().toString(36).substring(7),
        roomId,
        userId,
        content: content.trim(),
        timestamp: new Date(),
        phase: room.status,
        side: speaker.side,
        sequenceNumber: lastSeq + 1
      });
    });

    const updatedRoom = await this.roomRepository.transactionalUpdate(roomId, 'SYSTEM', async (room) => {
      room.eventSequence++;
      return room;
    });

    eventBus.emit(SocketEvents.ARGUMENT_SUBMITTED, {
      event: SocketEvents.ARGUMENT_SUBMITTED,
      data: {
        roomId: savedArgument.roomId,
        speakerId: savedArgument.userId,
        side: savedArgument.side,
        content: savedArgument.content,
        timestamp: savedArgument.timestamp.toISOString(),
        sequenceNumber: updatedRoom.eventSequence,
        argumentSequence: savedArgument.sequenceNumber,
        phase: savedArgument.phase
      }
    });

    logger.info({
      event: 'ARGUMENT_SUBMITTED',
      roomId: savedArgument.roomId,
      userId: savedArgument.userId,
      details: { contentLength: savedArgument.content.length }
    });

    await this.debateService.switchNextSpeaker(roomId);

    return savedArgument;
  }

  async getArgumentsByRoom(roomId: string): Promise<Argument[]> {
    await this.validator.getValidRoom(roomId);
    return await this.argumentRepository.findByRoomId(roomId);
  }
}
