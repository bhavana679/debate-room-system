import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../core/services/AuthService';
import { ValidationError } from '../../utils/errors';

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, role } = req.body;
      
      if (!email || !password) {
        return next(new ValidationError('Email and password are required'));
      }

      const result = await this.authService.register({ email, password, role });
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ValidationError('Email and password are required'));
      }

      const result = await this.authService.login({ email, password });
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      next(err);
    }
  };
}
