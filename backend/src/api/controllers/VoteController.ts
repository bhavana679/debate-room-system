import { Response, NextFunction } from 'express';
import { VotingService } from '../../core/services/VotingService';
import { AuthRequest } from '../middleware/auth.middleware';
import { UnauthorizedError, ValidationError } from '../../utils/errors';

export class VoteController {
  constructor(private votingService: VotingService) {}

  cast = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id: roomId } = req.params;
      const { candidateId } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return next(new UnauthorizedError('Unauthorized'));
      }

      if (!candidateId) {
        return next(new ValidationError('candidateId is required'));
      }

      const vote = await this.votingService.castVote({
        roomId: roomId as string,
        userId,
        candidateId
      });

      res.status(201).json({ success: true, data: vote });
    } catch (err: any) {
      next(err);
    }
  };

  result = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id: roomId } = req.params;

      const result = await this.votingService.getResult(roomId as string);
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      next(err);
    }
  };

  leaderboard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { limit } = req.query;
      const data = await this.votingService.getLeaderboard(Number(limit) || 10);
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      next(err);
    }
  };

  stats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new UnauthorizedError('Unauthorized');
      
      const data = await this.votingService.getUserStats(userId);
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      next(err);
    }
  };
}
