import { IRoomRepository } from '../interfaces/IRoomRepository';
import { IParticipantRepository } from '../interfaces/IParticipantRepository';
import { Room, RoomStatus } from '../domain/Room';
import { RoomParticipant, DebateSide } from '../domain/RoomParticipant';
import { UserRole } from '../domain/User';
import { eventBus } from '../../realtime/EventBus';
import { SocketEvents } from '../../realtime/events';
import { ValidationError, NotFoundError, UnauthorizedError, ConflictError } from '../../utils/errors';

export interface CreateRoomDTO {
  topic: string;
  userId: string;
}

export interface JoinRoomDTO {
  userId: string;
  roomId: string;
  side: DebateSide;
  role: UserRole;
}

export interface AssignRoleDTO {
  moderatorId: string;
  targetUserId: string;
  roomId: string;
  role: UserRole;
  side: DebateSide;
}

export class RoomService {
  constructor(
    private roomRepository: IRoomRepository,
    private participantRepository: IParticipantRepository
  ) {}

  async createRoom(data: CreateRoomDTO): Promise<Room> {
    const newRoom = new Room({
      id: Math.random().toString(36).substring(7),
      topic: data.topic,
      status: RoomStatus.WAITING,
      createdBy: data.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      eventSequence: 0,
      history: []
    });

    const createdRoom = await this.roomRepository.create(newRoom);

    // Auto-join creator as MODERATOR
    const moderatorParticipant = new RoomParticipant({
      userId: data.userId,
      roomId: createdRoom.id,
      role: UserRole.MODERATOR,
      side: DebateSide.NEUTRAL,
      joinedAt: new Date()
    });
    await this.participantRepository.add(moderatorParticipant);

    return createdRoom;
  }

  async getAllRooms(): Promise<Room[]> {
    return await this.roomRepository.findAll();
  }

  async getRoomById(roomId: string): Promise<Room | null> {
    return await this.roomRepository.findById(roomId);
  }

  async getParticipants(roomId: string): Promise<RoomParticipant[]> {
    return await this.participantRepository.findByRoomId(roomId);
  }

  async joinRoom(data: JoinRoomDTO): Promise<RoomParticipant> {
    const room = await this.roomRepository.findById(data.roomId);
    if (!room) {
      throw new NotFoundError('Room not found');
    }

    const participants = await this.participantRepository.findByRoomId(data.roomId);
    
    const existingParticipant = participants.find(p => p.userId === data.userId);
    if (existingParticipant) {
      throw new ConflictError('User already in this room');
    }

    await this.validateRoleAvailability(data.roomId, data.role, data.side, participants);

    const newParticipant = new RoomParticipant({
      userId: data.userId,
      roomId: data.roomId,
      role: data.role,
      side: data.side,
      joinedAt: new Date()
    });

    const addedParticipant = await this.participantRepository.add(newParticipant);
    
    // Increment room event sequence atomically
    const updatedRoom = await this.roomRepository.transactionalUpdate(data.roomId, 'SYSTEM', async (room) => {
      room.eventSequence++;
      return room;
    });

    eventBus.emit(SocketEvents.ROOM_JOINED, {
      event: SocketEvents.ROOM_JOINED,
      data: {
        roomId: addedParticipant.roomId,
        userId: addedParticipant.userId,
        role: addedParticipant.role,
        side: addedParticipant.side,
        sequenceNumber: updatedRoom.eventSequence
      }
    });
    
    return addedParticipant;
  }

  async assignRole(data: AssignRoleDTO): Promise<RoomParticipant> {
    const moderator = await this.participantRepository.find(data.moderatorId, data.roomId);
    if (!moderator || moderator.role !== UserRole.MODERATOR) {
      throw new UnauthorizedError('Only moderators can assign roles');
    }

    const participants = await this.participantRepository.findByRoomId(data.roomId);
    const targetParticipant = participants.find(p => p.userId === data.targetUserId);
    
    if (!targetParticipant) {
      throw new NotFoundError('Target user is not in the room');
    }

    await this.validateRoleAvailability(data.roomId, data.role, data.side, participants, data.targetUserId);

    const updatedParticipant = new RoomParticipant({
      ...targetParticipant,
      role: data.role,
      side: data.side
    });

    return await this.participantRepository.update(updatedParticipant);
  }

  private async validateRoleAvailability(
    roomId: string, 
    role: UserRole, 
    side: DebateSide, 
    existingParticipants: RoomParticipant[],
    excludeUserId?: string
  ): Promise<void> {
    if (role === UserRole.AUDIENCE) return;

    if (role === UserRole.MODERATOR) {
      const existingModerator = existingParticipants.find(p => p.role === UserRole.MODERATOR && p.userId !== excludeUserId);
      if (existingModerator) {
        throw new ConflictError('Moderator role already assigned');
      }
    }

    if (role === UserRole.SPEAKER) {
      if (side === DebateSide.NEUTRAL) {
        throw new ValidationError('Speakers must be assigned to a side (PRO/CON)');
      }

      const existingSpeakerOnSide = existingParticipants.find(
        p => p.role === UserRole.SPEAKER && p.side === side && p.userId !== excludeUserId
      );

      if (existingSpeakerOnSide) {
        throw new ConflictError(`Speaker slot full: ${side} side is already taken`);
      }
    }
  }
}
