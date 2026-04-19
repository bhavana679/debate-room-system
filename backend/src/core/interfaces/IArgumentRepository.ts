import { Argument } from '../domain/Argument';

export interface IArgumentRepository {
  save(argument: Argument): Promise<Argument>;
  findByRoomId(roomId: string): Promise<Argument[]>;
  findLastByRoomId(roomId: string): Promise<Argument | null>;
  atomicSave(roomId: string, requestId: string, generator: (lastSeq: number) => Argument): Promise<Argument>;
}
