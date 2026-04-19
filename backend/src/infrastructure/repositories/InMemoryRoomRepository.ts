import { Room } from '../../core/domain/Room';
import { IRoomRepository } from '../../core/interfaces/IRoomRepository';
import { logger } from '../../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

export interface LockMetadata {
  roomId: string;
  lockedBy: string;
  acquiredAt: number;
}

export class InMemoryRoomRepository implements IRoomRepository {
  private rooms: Room[] = [];
  private locks: Map<string, LockMetadata> = new Map();
  private readonly filePath = path.join(process.cwd(), 'data', 'rooms.json');

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
        this.rooms = parsed.map((r: any) => new Room(r));
        logger.info({
          event: 'PERSISTENCE_LOADED',
          details: { count: this.rooms.length, source: 'rooms.json' }
        });
      } catch (err: any) {
        logger.error({
          event: 'PERSISTENCE_LOAD_ERROR',
          details: { error: err.message }
        });
      }
    }
  }

  private saveData() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.rooms, null, 2));
    } catch (err: any) {
      logger.error({
        event: 'PERSISTENCE_SAVE_ERROR',
        details: { error: err.message }
      });
    }
  }

  async create(room: Room): Promise<Room> {
    const roomInstance = new Room(room);
    this.rooms.push(roomInstance);
    this.saveData();
    return roomInstance;
  }

  async update(room: Room): Promise<Room> {
    const index = this.rooms.findIndex(r => r.id === room.id);
    if (index === -1) {
      throw new Error('Room not found');
    }
    const roomInstance = new Room(room);
    this.rooms[index] = roomInstance;
    this.saveData();
    return roomInstance;
  }

  async findById(id: string): Promise<Room | null> {
    const room = this.rooms.find(room => room.id === id);
    return room ? new Room(room) : null;
  }

  async findAll(): Promise<Room[]> {
    return this.rooms.map(r => new Room(r));
  }

  async transactionalUpdate(roomId: string, requestId: string, updateFn: (room: Room) => Promise<Room>): Promise<Room> {
    const LOCK_TIMEOUT_MS = 3000;
    const existingLock = this.locks.get(roomId);

    if (existingLock) {
      if (Date.now() - existingLock.acquiredAt > LOCK_TIMEOUT_MS) {
        logger.warn({
          event: 'LOCK_TIMEOUT_RELEASE',
          roomId,
          userId: requestId,
          details: { staleLockOwner: existingLock.lockedBy }
        });
        this.locks.delete(roomId);
      } else {
        throw new Error(`Concurrent update detected for room ${roomId} (lock active)`);
      }
    }

    // Begin transaction (acquire lock)
    this.locks.set(roomId, {
      roomId,
      lockedBy: requestId,
      acquiredAt: Date.now()
    });

    logger.info({
      event: 'LOCK_ACQUIRED',
      roomId,
      userId: requestId
    });

    try {
      // Re-fetch the latest room state inside transaction
      const room = await this.findById(roomId);
      if (!room) throw new Error(`Room ${roomId} not found during transaction`);

      const latestRoom = new Room(JSON.parse(JSON.stringify(room)));

      const updatedRoom = await updateFn(latestRoom);

      const index = this.rooms.findIndex(r => r.id === roomId);
      this.rooms[index] = new Room(updatedRoom);
      this.saveData();

      logger.info({
        event: 'TRANSACTION_COMMIT',
        roomId,
        userId: requestId
      });

      return updatedRoom;
    } catch (error) {
      logger.error({
        event: 'TRANSACTION_ABORT',
        roomId,
        userId: requestId,
        details: { error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    } finally {
      const currentLock = this.locks.get(roomId);
      if (currentLock && currentLock.lockedBy === requestId) {
        this.locks.delete(roomId);
        logger.info({
          event: 'LOCK_RELEASED',
          roomId,
          userId: requestId
        });
      }
    }
  }
}
