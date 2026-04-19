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

  async getLeaderboard(limit: number): Promise<any[]> {
    const groups = await this.prisma.vote.groupBy({
      by: ['candidateId'],
      _count: {
        candidateId: true
      },
      orderBy: {
        _count: {
          candidateId: 'desc'
        }
      },
      take: limit
    });

    // Enhance with user details
    const leaderboard = await Promise.all(groups.map(async (group, i) => {
      const user = await this.prisma.user.findUnique({
        where: { id: group.candidateId },
        select: { email: true }
      });
      return {
        rank: i + 1,
        userId: group.candidateId,
        name: user?.email?.split('@')[0] || 'Unknown',
        votes: group._count.candidateId,
        wins: Math.floor(group._count.candidateId / 2), // Mocking some wins for now based on votes
        avatar: user?.email?.charAt(0).toUpperCase() || '?'
      };
    }));

    return leaderboard;
  }
}
