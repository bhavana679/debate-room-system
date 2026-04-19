import { IRoomRepository } from '../interfaces/IRoomRepository';
import { IParticipantRepository } from '../interfaces/IParticipantRepository';
import { IVoteRepository } from '../interfaces/IVoteRepository';
import { IVotingStrategy } from '../interfaces/IVotingStrategy';
import { Vote, VoteResult } from '../domain/Vote';
import { RoomStatus } from '../domain/Room';
import { UserRole } from '../domain/User';
import { eventBus } from '../../realtime/EventBus';
import { SocketEvents } from '../../realtime/events';
import { logger } from '../../utils/logger';
import { ValidationService } from './ValidationService';
import { NotFoundError, UnauthorizedError } from '../../utils/errors';

export interface CastVoteDTO {
  roomId: string;
  userId: string;
  candidateId: string;
}

export class VotingService {
  constructor(
    private roomRepository: IRoomRepository,
    private participantRepository: IParticipantRepository,
    private voteRepository: IVoteRepository,
    private strategy: IVotingStrategy,
    private validator: ValidationService
  ) {}

  async castVote(data: CastVoteDTO): Promise<Vote> {
    this.validator.validateInput(data, ['roomId', 'userId', 'candidateId']);
    const { roomId, userId, candidateId } = data;

    const room = await this.validator.getValidRoom(roomId);
    await this.validator.ensureRole(userId, roomId, Object.values(UserRole)); // Must be in room

    const existingVotes = await this.voteRepository.findByRoomId(roomId);
    Vote.validateVote(
      userId, 
      existingVotes, 
      room.status, 
      room.votingStartTime, 
      room.votingEndTime
    );

    // candidateId must be a valid participant in the room
    const candidate = await this.participantRepository.find(candidateId, roomId);
    if (!candidate) {
      throw new NotFoundError('Candidate is not a participant in this room');
    }

    const vote = new Vote({ userId, roomId, candidateId });
    const savedVote = await this.voteRepository.save(vote);
    
    // Compute current results to broadcast tally
    const result = await this.getResult(roomId);

    // Increment room event sequence atomically
    const updatedRoom = await this.roomRepository.transactionalUpdate(roomId, 'SYSTEM', async (room) => {
      room.eventSequence++;
      return room;
    });

    eventBus.emit(SocketEvents.VOTE_UPDATED, {
      event: SocketEvents.VOTE_UPDATED,
      data: {
        roomId: savedVote.roomId,
        voteCounts: result.tally,
        sequenceNumber: updatedRoom.eventSequence
      }
    });

    logger.info({
      event: 'VOTE_SUBMITTED',
      roomId: savedVote.roomId,
      userId: savedVote.userId,
      details: { candidateId: savedVote.candidateId }
    });
    
    return savedVote;
  }

  async getResult(roomId: string): Promise<VoteResult> {
    await this.validator.getValidRoom(roomId);
    const votes = await this.voteRepository.findByRoomId(roomId);
    return this.strategy.calculate(roomId, votes);
  }

  async getLeaderboard(limit: number = 10): Promise<any[]> {
    return this.voteRepository.getLeaderboard(limit);
  }

  async getUserStats(userId: string): Promise<any> {
    // In a real system, we'd have a separate stats table, but for now we aggregate
    const leaderboard = await this.voteRepository.getLeaderboard(1000); // Get all
    const userRank = leaderboard.find(u => u.userId === userId);
    
    return {
      reputation: userRank?.votes || 0,
      rank: userRank?.rank || 'Unranked',
      wins: userRank?.wins || 0
    };
  }
}
