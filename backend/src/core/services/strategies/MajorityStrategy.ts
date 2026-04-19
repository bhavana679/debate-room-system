import { Vote, VoteResult } from '../../../core/domain/Vote';
import { IVotingStrategy } from '../../../core/interfaces/IVotingStrategy';
import { DebateSide } from '../../../core/domain/RoomParticipant';

export class MajorityStrategy implements IVotingStrategy {
  calculate(roomId: string, votes: Vote[]): VoteResult {
    const tally: Record<string, number> = {};

    for (const vote of votes) {
      tally[vote.candidateId] = (tally[vote.candidateId] || 0) + 1;
    }

    let topCandidate: string | null = null;
    let topCount = 0;
    let isTie = false;

    for (const [candidateId, count] of Object.entries(tally)) {
      if (count > topCount) {
        topCandidate = candidateId;
        topCount = count;
        isTie = false;
      } else if (count === topCount && topCount > 0) {
        isTie = true;
      }
    }

    let winner: string | 'DRAW' | null = null;
    let winningPercentage = 0;

    if (votes.length > 0) {
      if (isTie) {
        winner = 'DRAW';
      } else if (topCandidate) {
        winner = topCandidate;
        winningPercentage = Math.round((topCount / votes.length) * 100);
      }
    }

    return {
      roomId,
      winner,
      tally,
      totalVotes: votes.length,
      winningPercentage
    };
  }
}
