import { Vote } from '../domain/Vote';

export interface IVoteRepository {
  save(vote: Vote): Promise<Vote>;
  findByRoomId(roomId: string): Promise<Vote[]>;
  findByUser(userId: string, roomId: string): Promise<Vote | null>;
}
