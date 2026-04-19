import { Response, NextFunction } from 'express';
import { RoomService } from '../../core/services/RoomService';
import { AuthRequest } from '../middleware/auth.middleware';
import { UnauthorizedError, ValidationError } from '../../utils/errors';

export class RoomController {
  constructor(private roomService: RoomService) {}

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { topic } = req.body;
      const userId = req.user?.userId;

      if (!topic) {
        return next(new ValidationError('Topic is required'));
      }

      if (!userId) {
        return next(new UnauthorizedError('Unauthorized'));
      }

      const room = await this.roomService.createRoom({ topic, userId });
      res.status(201).json({ success: true, data: room });
    } catch (err: any) {
      next(err);
    }
  };

  list = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rooms = await this.roomService.getAllRooms();
      res.status(200).json({ success: true, data: rooms });
    } catch (err: any) {
      next(err);
    }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id: roomId } = req.params;
      const room = await this.roomService.getRoomById(roomId as string);
      if (!room) {
        res.status(404).json({ success: false, message: 'Room not found' });
        return;
      }
      res.status(200).json({ success: true, data: room });
    } catch (err: any) {
      next(err);
    }
  };

  getParticipants = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id: roomId } = req.params;
      const participants = await this.roomService.getParticipants(roomId as string);
      res.status(200).json({ success: true, data: participants });
    } catch (err: any) {
      next(err);
    }
  };

  join = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id: roomId } = req.params;
      const { side } = req.body;
      const user = req.user;

      if (!user) {
        return next(new UnauthorizedError('Unauthorized'));
      }

      if (!roomId) {
        return next(new ValidationError('Room ID is required'));
      }

      const participant = await this.roomService.joinRoom({
        userId: user.userId,
        roomId: roomId as string,
        side: side || 'NEUTRAL',
        role: user.role
      });

      res.status(200).json({ success: true, data: participant });
    } catch (err: any) {
      next(err);
    }
  };

  assignRole = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id: roomId } = req.params;
      const { userId: targetUserId, role, side } = req.body;
      const moderatorId = req.user?.userId;

      if (!moderatorId) {
        return next(new UnauthorizedError('Unauthorized'));
      }

      if (!targetUserId || !role || !side) {
        return next(new ValidationError('targetUserId, role, and side are required'));
      }

      const participant = await this.roomService.assignRole({
        moderatorId,
        targetUserId,
        roomId: roomId as string,
        role,
        side
      });

      res.status(200).json({ success: true, data: participant });
    } catch (err: any) {
      next(err);
    }
  };
}

