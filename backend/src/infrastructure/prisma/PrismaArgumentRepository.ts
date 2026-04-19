import { PrismaClient } from '@prisma/client';
import { IArgumentRepository } from '../../core/interfaces/IArgumentRepository';
import { Argument } from '../../core/domain/Argument';
import { RoomStatus } from '../../core/domain/Room';

export class PrismaArgumentRepository implements IArgumentRepository {
  constructor(private prisma: PrismaClient) {}

  private map(model: any): Argument {
    return new Argument({
      id: model.id,
      roomId: model.roomId,
      userId: model.userId,
      content: model.content,
      timestamp: model.timestamp,
      sequenceNumber: model.sequenceNumber,
      phase: model.phase as RoomStatus
    });
  }

  async save(argument: Argument): Promise<Argument> {
    const model = await this.prisma.argument.create({
      data: {
        id: argument.id,
        roomId: argument.roomId,
        userId: argument.userId,
        content: argument.content,
        timestamp: argument.timestamp,
        sequenceNumber: argument.sequenceNumber,
        phase: argument.phase
      }
    });
    return this.map(model);
  }

  async findByRoomId(roomId: string): Promise<Argument[]> {
    const models = await this.prisma.argument.findMany({
      where: { roomId },
      orderBy: { sequenceNumber: 'asc' }
    });
    return models.map(m => this.map(m));
  }

  async findLastByRoomId(roomId: string): Promise<Argument | null> {
    const model = await this.prisma.argument.findFirst({
      where: { roomId },
      orderBy: { sequenceNumber: 'desc' }
    });
    return model ? this.map(model) : null;
  }

  async atomicSave(roomId: string, requestId: string, generator: (lastSeq: number) => Argument): Promise<Argument> {
    return await this.prisma.$transaction(async (tx) => {
      const lastArgument = await tx.argument.findFirst({
        where: { roomId },
        orderBy: { sequenceNumber: 'desc' }
      });
      const lastSeq = lastArgument?.sequenceNumber || 0;
      
      const newArgumentDomain = generator(lastSeq);
      
      const storedModel = await tx.argument.create({
        data: {
          id: newArgumentDomain.id,
          roomId: newArgumentDomain.roomId,
          userId: newArgumentDomain.userId,
          content: newArgumentDomain.content,
          timestamp: newArgumentDomain.timestamp,
          sequenceNumber: newArgumentDomain.sequenceNumber,
          phase: newArgumentDomain.phase
        }
      });
      return this.map(storedModel);
    }, {
      isolationLevel: 'Serializable'
    });
  }
}
