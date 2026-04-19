import { Response, NextFunction } from 'express';
import { ArgumentService } from '../../core/services/ArgumentService';
import { AuthRequest } from '../middleware/auth.middleware';
import { UnauthorizedError, ValidationError } from '../../utils/errors';

export class ArgumentController {
  constructor(private argumentService: ArgumentService) {}

  submit = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id: roomId } = req.params;
      const { content } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return next(new UnauthorizedError('Unauthorized'));
      }

      if (!content) {
        return next(new ValidationError('Content is required'));
      }

      const argument = await this.argumentService.submitArgument({
        roomId: roomId as string,
        userId,
        content
      });

      res.status(201).json({ success: true, data: argument });
    } catch (err: any) {
      next(err);
    }
  };

  list = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id: roomId } = req.params;

      const args = await this.argumentService.getArgumentsByRoom(roomId as string);
      res.status(200).json({ success: true, data: args });
    } catch (err: any) {
      next(err);
    }
  };
}
