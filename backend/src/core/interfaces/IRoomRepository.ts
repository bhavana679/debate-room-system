import { Room } from '../domain/Room';

export interface IRoomRepository {
  create(room: Room): Promise<Room>;
  update(room: Room): Promise<Room>;
  findById(id: string): Promise<Room | null>;
  findAll(): Promise<Room[]>;
  transactionalUpdate(roomId: string, requestId: string, updateFn: (room: Room) => Promise<Room>): Promise<Room>;
}
