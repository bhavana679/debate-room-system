import { UserRole } from './User';

export enum DebateSide {
  PRO = 'PRO',
  CON = 'CON',
  NEUTRAL = 'NEUTRAL'
}

export class RoomParticipant {
  userId!: string;
  roomId!: string;
  role!: UserRole;
  side!: DebateSide;
  joinedAt!: Date;

  constructor(data: Partial<RoomParticipant>) {
    Object.assign(this, data);
    if (this.joinedAt) this.joinedAt = new Date(this.joinedAt);
  }
}
