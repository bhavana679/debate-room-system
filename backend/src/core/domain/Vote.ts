import { DebateSide } from './RoomParticipant';
import { RoomStatus } from './Room';
import { InvalidStateError, ConflictError } from '../../utils/errors';

export class Vote {
  userId!: string;
  roomId!: string;
  candidateId!: string;

  constructor(data: Partial<Vote>) {
    Object.assign(this, data);
  }

  static validateVote(userId: string, existingVotes: Vote[], roomStatus: RoomStatus, votingStartTime?: Date | null, votingEndTime?: Date | null) {
    if (roomStatus !== RoomStatus.VOTING) {
      throw new InvalidStateError('Voting is only allowed during the VOTING state');
    }

    const now = Date.now();
    if (votingStartTime && now < new Date(votingStartTime).getTime()) {
      throw new InvalidStateError('Voting has not started yet');
    }
    if (votingEndTime && now > new Date(votingEndTime).getTime()) {
      throw new InvalidStateError('Voting has already ended');
    }

    const hasVoted = existingVotes.some(v => v.userId === userId);
    if (hasVoted) {
      throw new ConflictError('User has already voted in this room');
    }
  }
}

export interface VoteResult {
  roomId: string;
  winner: string | 'DRAW' | null;
  tally: Record<string, number>;
  totalVotes: number;
  winningPercentage?: number;
}
