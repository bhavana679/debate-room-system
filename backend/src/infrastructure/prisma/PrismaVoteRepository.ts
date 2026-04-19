import { PrismaClient } from '@prisma/client';
import { IVoteRepository } from '../../core/interfaces/IVoteRepository';
import { Vote } from '../../core/domain/Vote';

export class PrismaVoteRepository implements IVoteRepository {
  constructor(private prisma: PrismaClient) {}

  private map(model: any): Vote {
    return new Vote({
      userId: model.voterId,
      roomId: model.roomId,
      candidateId: model.candidateId
    });
  }

  async save(vote: Vote): Promise<Vote> {
    const model = await this.prisma.vote.upsert({
      where: {
        roomId_voterId: {
          roomId: vote.roomId,
          voterId: vote.userId
        }
      },
      update: {
        candidateId: vote.candidateId
      },
      create: {
        roomId: vote.roomId,
        voterId: vote.userId,
        candidateId: vote.candidateId
      }
    });
    return this.map(model);
  }

  async findByRoomId(roomId: string): Promise<Vote[]> {
    const models = await this.prisma.vote.findMany({
      where: { roomId },
      orderBy: { timestamp: 'asc' }
    });
    return models.map(m => this.map(m));
  }

  async findByUser(userId: string, roomId: string): Promise<Vote | null> {
    const model = await this.prisma.vote.findUnique({
      where: {
        roomId_voterId: {
          roomId,
          voterId: userId
        }
      }
    });
    return model ? this.map(model) : null;
  }
}
