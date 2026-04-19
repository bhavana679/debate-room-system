import { Vote, VoteResult } from '../domain/Vote';

export interface IVotingStrategy {
  calculate(roomId: string, votes: Vote[]): VoteResult;
}
