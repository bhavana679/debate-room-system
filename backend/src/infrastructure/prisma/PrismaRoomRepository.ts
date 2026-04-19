import { PrismaClient } from '@prisma/client';
import { IRoomRepository } from '../../core/interfaces/IRoomRepository';
import { Room, RoomStatus } from '../../core/domain/Room';

export class PrismaRoomRepository implements IRoomRepository {
  constructor(private prisma: PrismaClient) {}

  private map(model: any): Room {
    return new Room({
      id: model.id,
      topic: model.topic,
      status: model.status as RoomStatus,
      activeSpeakerId: model.activeSpeakerId,
      stateStartTime: model.stateStartTime,
      phaseDuration: model.phaseDuration,
      votingStartTime: model.votingStartTime,
      votingEndTime: model.votingEndTime,
      eventSequence: model.eventSequence,
      history: model.history as any,
      createdBy: model.createdBy,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt
    });
  }

  async create(room: Room): Promise<Room> {
    const model = await this.prisma.room.create({
      data: {
        id: room.id,
        topic: room.topic,
        status: room.status,
        createdBy: room.createdBy,
        eventSequence: room.eventSequence,
        history: room.history as any,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt
      }
    });
    return this.map(model);
  }

  async update(room: Room): Promise<Room> {
    const model = await this.prisma.room.update({
      where: { id: room.id },
      data: {
        topic: room.topic,
        status: room.status,
        activeSpeakerId: room.activeSpeakerId || null,
        stateStartTime: room.stateStartTime || null,
        phaseDuration: room.phaseDuration || null,
        votingStartTime: room.votingStartTime || null,
        votingEndTime: room.votingEndTime || null,
        eventSequence: room.eventSequence,
        history: room.history as any,
        updatedAt: new Date()
      }
    });
    return this.map(model);
  }

  async findById(id: string): Promise<Room | null> {
    const model = await this.prisma.room.findUnique({ where: { id } });
    return model ? this.map(model) : null;
  }

  async findAll(): Promise<Room[]> {
    const models = await this.prisma.room.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return models.map(m => this.map(m));
  }

  async transactionalUpdate(roomId: string, requestId: string, updateFn: (room: Room) => Promise<Room>): Promise<Room> {
    return await this.prisma.$transaction(async (tx) => {
      // Fetch the current row with serializable isolation via Prisma
      const model = await tx.room.findUnique({ where: { id: roomId } });
      if (!model) throw new Error(`Room ${roomId} not found during transaction`);
      
      const domainRoom = this.map(model);
      const updatedDomainRoom = await updateFn(domainRoom);
      
      const updatedModel = await tx.room.update({
        where: { id: roomId },
        data: {
          status: updatedDomainRoom.status,
          activeSpeakerId: updatedDomainRoom.activeSpeakerId || null,
          stateStartTime: updatedDomainRoom.stateStartTime || null,
          phaseDuration: updatedDomainRoom.phaseDuration || null,
          votingStartTime: updatedDomainRoom.votingStartTime || null,
          votingEndTime: updatedDomainRoom.votingEndTime || null,
          eventSequence: updatedDomainRoom.eventSequence,
          history: updatedDomainRoom.history as any,
          updatedAt: new Date()
        }
      });
      return this.map(updatedModel);
    }, {
      isolationLevel: 'Serializable' // Crucial for state machine and race conditions
    });
  }
}
