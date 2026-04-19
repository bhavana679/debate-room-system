import { Response, NextFunction } from 'express';
import { UserRole } from '../../core/domain/User';
import { AuthRequest } from './auth.middleware';

/**
 * Middleware to restrict access based on user roles.
 * @param allowedRoles List of roles that are authorized to access the resource.
 */
export const authorize = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ 
        status: 'error', 
        message: 'Authentication required' 
      });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({ 
        status: 'error', 
        message: 'Forbidden: You do not have the required permissions' 
      });
      return;
    }

    next();
  };
};
