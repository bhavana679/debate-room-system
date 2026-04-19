import { RoomParticipant } from '../domain/RoomParticipant';

export interface IParticipantRepository {
  add(participant: RoomParticipant): Promise<RoomParticipant>;
  update(participant: RoomParticipant): Promise<RoomParticipant>;
  find(userId: string, roomId: string): Promise<RoomParticipant | null>;
  findByRoomId(roomId: string): Promise<RoomParticipant[]>;
  findByUserId?(userId: string): Promise<RoomParticipant[]>;
}
