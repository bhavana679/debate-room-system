import { UnauthorizedError } from '../../utils/errors';
import { RoomStatus } from './Room';

export class Argument {
  id!: string;
  roomId!: string;
  userId!: string;
  content!: string;
  timestamp!: Date;
  sequenceNumber!: number;
  phase!: RoomStatus;

  constructor(data: Partial<Argument>) {
    Object.assign(this, data);
    if (this.timestamp) this.timestamp = new Date(this.timestamp);
  }

  static validateSubmission(userId: string, activeSpeakerId?: string | null) {
    if (activeSpeakerId !== userId) {
      throw new UnauthorizedError('You are not the active speaker for this turn');
    }
  }
}
