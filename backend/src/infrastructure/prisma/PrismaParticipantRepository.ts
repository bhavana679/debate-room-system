import { PrismaClient } from '@prisma/client';
import { IParticipantRepository } from '../../core/interfaces/IParticipantRepository';
import { RoomParticipant, DebateSide } from '../../core/domain/RoomParticipant';
import { UserRole } from '../../core/domain/User';

export class PrismaParticipantRepository implements IParticipantRepository {
  constructor(private prisma: PrismaClient) {}

  private map(model: any): RoomParticipant {
    return new RoomParticipant({
      userId: model.userId,
      roomId: model.roomId,
      role: model.role as UserRole,
      side: model.side as DebateSide,
      joinedAt: model.joinedAt
    });
  }

  async add(participant: RoomParticipant): Promise<RoomParticipant> {
    const model = await this.prisma.roomParticipant.create({
      data: {
        userId: participant.userId,
        roomId: participant.roomId,
        role: participant.role,
        side: participant.side,
        joinedAt: participant.joinedAt
      }
    });
    return this.map(model);
  }

  async update(participant: RoomParticipant): Promise<RoomParticipant> {
    const model = await this.prisma.roomParticipant.update({
      where: {
        roomId_userId: {
          roomId: participant.roomId,
          userId: participant.userId
        }
      },
      data: {
        role: participant.role,
        side: participant.side
      }
    });
    return this.map(model);
  }

  async find(userId: string, roomId: string): Promise<RoomParticipant | null> {
    const model = await this.prisma.roomParticipant.findUnique({
      where: {
        roomId_userId: { roomId, userId }
      }
    });
    return model ? this.map(model) : null;
  }

  async findByRoomId(roomId: string): Promise<RoomParticipant[]> {
    const models = await this.prisma.roomParticipant.findMany({
      where: { roomId },
      orderBy: { joinedAt: 'asc' }
    });
    return models.map(m => this.map(m));
  }

  async findByUserId(userId: string): Promise<RoomParticipant[]> {
    const models = await this.prisma.roomParticipant.findMany({
      where: { userId },
      orderBy: { joinedAt: 'desc' }
    });
    return models.map(m => this.map(m));
  }
}
