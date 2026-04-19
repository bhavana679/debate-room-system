import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthService } from '../../core/services/AuthService';
import { userRepository } from '../../infrastructure/database';
import { authRateLimit } from '../middleware/rate-limit.middleware';

const router = Router();

// Dependency Injection
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authRateLimit, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post('/login', authRateLimit, authController.login);

export default router;
