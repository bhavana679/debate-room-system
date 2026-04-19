import { Vote } from '../../core/domain/Vote';
import { IVoteRepository } from '../../core/interfaces/IVoteRepository';
import { logger } from '../../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

export class InMemoryVoteRepository implements IVoteRepository {
  private votes: Vote[] = [];
  private readonly filePath = path.join(process.cwd(), 'data', 'votes.json');
  private locks: Set<string> = new Set(); // Simple userId:roomId lock

  constructor() {
    this.ensureDirectory();
    this.loadData();
  }

  private ensureDirectory() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadData() {
    if (fs.existsSync(this.filePath)) {
      try {
        const rawData = fs.readFileSync(this.filePath, 'utf-8');
        this.votes = JSON.parse(rawData);
      } catch (err: any) {
        logger.error({
          event: 'PERSISTENCE_LOAD_ERROR',
          details: { error: err.message, source: 'votes.json' }
        });
      }
    }
  }

  private saveData() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.votes, null, 2));
    } catch (err: any) {
      logger.error({
        event: 'PERSISTENCE_SAVE_ERROR',
        details: { error: err.message, source: 'votes.json' }
      });
    }
  }

  async save(vote: Vote): Promise<Vote> {
    const lockKey = `${vote.userId}:${vote.roomId}`;
    
    if (this.locks.has(lockKey)) {
      throw new Error(`Concurrent vote detected for user ${vote.userId} in room ${vote.roomId}`);
    }

    this.locks.add(lockKey);

    try {
      // Re-fetch/check unique constraint (simulating DB unique constraint)
      const existing = await this.findByUser(vote.userId, vote.roomId);
      if (existing) {
        throw new Error('User has already voted in this room');
      }

      this.votes.push(vote);
      this.saveData();
      return vote;
    } finally {
      this.locks.delete(lockKey);
    }
  }

  async findByRoomId(roomId: string): Promise<Vote[]> {
    return this.votes.filter(v => v.roomId === roomId);
  }

  async findByUser(userId: string, roomId: string): Promise<Vote | null> {
    return this.votes.find(v => v.userId === userId && v.roomId === roomId) || null;
  }
}
