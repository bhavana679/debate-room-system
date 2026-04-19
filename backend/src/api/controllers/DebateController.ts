import { Response, NextFunction } from 'express';
import { DebateService } from '../../core/services/DebateService';
import { AuthRequest } from '../middleware/auth.middleware';
import { UnauthorizedError, ValidationError } from '../../utils/errors';

export class DebateController {
  constructor(private debateService: DebateService) {}

  start = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id: roomId } = req.params;
      const moderatorId = req.user?.userId;

      if (!moderatorId) {
        return next(new UnauthorizedError('Unauthorized'));
      }

      const room = await this.debateService.startDebate(roomId as string, moderatorId);
      res.status(200).json({ success: true, data: room });
    } catch (err: any) {
      next(err);
    }
  };

  next = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id: roomId } = req.params;
      const moderatorId = req.user?.userId;

      if (!moderatorId) {
        return next(new UnauthorizedError('Unauthorized'));
      }

      const room = await this.debateService.transitionState(roomId as string, moderatorId);
      res.status(200).json({ success: true, data: room });
    } catch (err: any) {
      next(err);
    }
  };

  timerStatus = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      const { id: roomId } = req.params;

      if (!roomId) {
        res.status(400).json({ status: 'error', message: 'Room ID is required' });
        return;
      }

      const remainingTime = this.debateService.getRemainingTime(roomId as string);
      res.status(200).json({
        success: true,
        data: {
          roomId,
          remainingTime
        }
      });
    } catch (err: any) {
      next(err);
    }
  };
}
