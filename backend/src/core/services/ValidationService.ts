import { IRoomRepository } from '../interfaces/IRoomRepository';
import { IParticipantRepository } from '../interfaces/IParticipantRepository';
import { RoomStatus } from '../domain/Room';
import { UserRole } from '../domain/User';
import { NotFoundError, UnauthorizedError, InvalidStateError, ValidationError } from '../../utils/errors';

export class ValidationService {
  constructor(
    private roomRepository: IRoomRepository,
    private participantRepository: IParticipantRepository
  ) {}

  async getValidRoom(roomId: string) {
    const room = await this.roomRepository.findById(roomId);
    if (!room) throw new NotFoundError('Room not found');
    return room;
  }

  async ensureIsModerator(userId: string, roomId: string) {
    const participant = await this.participantRepository.find(userId, roomId);
    if (!participant || participant.role !== UserRole.MODERATOR) {
      throw new UnauthorizedError('Action requires Moderator role');
    }
    return participant;
  }

  async ensureIsSpeaker(userId: string, roomId: string) {
    const participant = await this.participantRepository.find(userId, roomId);
    if (!participant || participant.role !== UserRole.SPEAKER) {
      throw new UnauthorizedError('Action requires Speaker role');
    }
    return participant;
  }

  async ensureRole(userId: string, roomId: string, allowedRoles: UserRole[]) {
    const participant = await this.participantRepository.find(userId, roomId);
    if (!participant || !allowedRoles.includes(participant.role)) {
      throw new UnauthorizedError(`Action requires one of the following roles: ${allowedRoles.join(', ')}`);
    }
    return participant;
  }

  ensureState(roomStatus: RoomStatus, allowedStates: RoomStatus[]) {
    if (!allowedStates.includes(roomStatus)) {
      throw new InvalidStateError(`Action not permitted in the '${roomStatus}' state`);
    }
  }

  validateInput(input: any, requiredFields: string[]) {
    for (const field of requiredFields) {
      if (input[field] === undefined || input[field] === null || (typeof input[field] === 'string' && input[field].trim() === '')) {
        throw new ValidationError(`Field '${field}' is required and cannot be empty`);
      }
    }
  }
}
