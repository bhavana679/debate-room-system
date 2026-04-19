import { Argument } from '../../core/domain/Argument';
import { IArgumentRepository } from '../../core/interfaces/IArgumentRepository';
import { logger } from '../../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

export class InMemoryArgumentRepository implements IArgumentRepository {
  private arguments: Argument[] = [];
  private readonly filePath = path.join(process.cwd(), 'data', 'arguments.json');
  private locks: Set<string> = new Set();

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
        this.arguments = JSON.parse(rawData).map((a: any) => new Argument(a));
      } catch (err: any) {
        logger.error({
          event: 'PERSISTENCE_LOAD_ERROR',
          details: { error: err.message, source: 'arguments.json' }
        });
      }
    }
  }

  private saveData() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.arguments, null, 2));
    } catch (err: any) {
      logger.error({
        event: 'PERSISTENCE_SAVE_ERROR',
        details: { error: err.message, source: 'arguments.json' }
      });
    }
  }

  async save(argument: Argument): Promise<Argument> {
    const index = this.arguments.findIndex(a => a.id === argument.id);
    if (index !== -1) {
      this.arguments[index] = argument;
    } else {
      this.arguments.push(argument);
    }
    this.saveData();
    return argument;
  }

  async findByRoomId(roomId: string): Promise<Argument[]> {
    return this.arguments
      .filter(arg => arg.roomId === roomId)
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber);
  }

  async findLastByRoomId(roomId: string): Promise<Argument | null> {
    const roomArguments = await this.findByRoomId(roomId);
    return roomArguments.length > 0 ? roomArguments[roomArguments.length - 1] || null : null;
  }

  async atomicSave(roomId: string, requestId: string, generator: (lastSeq: number) => Argument): Promise<Argument> {
    if (this.locks.has(roomId)) {
      throw new Error(`Concurrent argument submission in room ${roomId}`);
    }

    this.locks.add(roomId);

    try {
      const roomArguments = this.arguments.filter(a => a.roomId === roomId);
      const lastSeq = roomArguments.length > 0 
        ? Math.max(...roomArguments.map(a => a.sequenceNumber)) 
        : 0;

      const newArgument = generator(lastSeq);
      this.arguments.push(newArgument);
      this.saveData();

      return newArgument;
    } finally {
      this.locks.delete(roomId);
    }
  }
}
