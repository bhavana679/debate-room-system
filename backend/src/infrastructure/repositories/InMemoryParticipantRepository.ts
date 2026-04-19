import { RoomParticipant } from '../../core/domain/RoomParticipant';
import { IParticipantRepository } from '../../core/interfaces/IParticipantRepository';
import { logger } from '../../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

export class InMemoryParticipantRepository implements IParticipantRepository {
  private participants: RoomParticipant[] = [];
  private readonly filePath = path.join(process.cwd(), 'data', 'participants.json');

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
        const parsed = JSON.parse(rawData);
        this.participants = parsed.map((p: any) => new RoomParticipant(p));
      } catch (err: any) {
        logger.error({
          event: 'PERSISTENCE_LOAD_ERROR',
          details: { error: err.message, source: 'participants.json' }
        });
      }
    }
  }

  private saveData() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.participants, null, 2));
    } catch (err: any) {
      logger.error({
        event: 'PERSISTENCE_SAVE_ERROR',
        details: { error: err.message, source: 'participants.json' }
      });
    }
  }

  async add(participant: RoomParticipant): Promise<RoomParticipant> {
    this.participants.push(participant);
    this.saveData();
    return participant;
  }

  async update(participant: RoomParticipant): Promise<RoomParticipant> {
    const index = this.participants.findIndex(
      p => p.userId === participant.userId && p.roomId === participant.roomId
    );
    if (index === -1) {
      throw new Error('Participant not found');
    }
    this.participants[index] = participant;
    this.saveData();
    return participant;
  }

  async find(userId: string, roomId: string): Promise<RoomParticipant | null> {
    return this.participants.find(p => p.userId === userId && p.roomId === roomId) || null;
  }

  async findByRoomId(roomId: string): Promise<RoomParticipant[]> {
    return this.participants.filter(p => p.roomId === roomId);
  }
}
