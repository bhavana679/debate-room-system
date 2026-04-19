export enum RoomStatus {
  WAITING = 'WAITING',
  OPENING = 'OPENING',
  REBUTTAL = 'REBUTTAL',
  CLOSING = 'CLOSING',
  VOTING = 'VOTING',
  ENDED = 'ENDED'
}

export type TransitionTrigger = 'MODERATOR' | 'TIMER';

import { InvalidStateError, ValidationError } from '../../utils/errors';

export interface StateTransition {
  from: RoomStatus;
  to: RoomStatus;
  triggeredBy: TransitionTrigger;
  timestamp: Date;
}

export class Room {
  id!: string;
  topic!: string;
  status!: RoomStatus;
  activeSpeakerId?: string | null;
  stateStartTime?: Date | null;
  phaseDuration?: number | null;
  votingStartTime?: Date | null;
  votingEndTime?: Date | null;
  eventSequence: number = 0;
  history: StateTransition[] = [];
  winnerSide?: string | null;
  winningPercentage?: number | null;
  createdBy!: string;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<Room>) {
    Object.assign(this, data);
    if (this.createdAt) this.createdAt = new Date(this.createdAt);
    if (this.updatedAt) this.updatedAt = new Date(this.updatedAt);
    if (this.stateStartTime) this.stateStartTime = new Date(this.stateStartTime);
    if (this.votingStartTime) this.votingStartTime = new Date(this.votingStartTime);
    if (this.votingEndTime) this.votingEndTime = new Date(this.votingEndTime);
    
    if (this.history) {
      this.history = this.history.map(t => ({
        ...t,
        timestamp: new Date(t.timestamp)
      }));
    }
  }

  validateCanStart(speakersCount: number) {
    if (this.status !== RoomStatus.WAITING) {
      throw new InvalidStateError('Debate can only be started from WAITING state');
    }
    if (speakersCount < 2) {
      throw new ValidationError('Debate requires at least two speakers to start');
    }
  }
}
