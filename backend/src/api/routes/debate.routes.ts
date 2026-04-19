import { Router } from 'express';
import { DebateController } from '../controllers/DebateController';
import { DebateService } from '../../core/services/DebateService';
import { roomRepository, participantRepository, timerService, voteRepository, validationService } from '../../infrastructure/database';
import { authenticate } from '../middleware/auth.middleware';
import { debateActionRateLimit } from '../middleware/rate-limit.middleware';
import { VotingService } from '../../core/services/VotingService';
import { MajorityStrategy } from '../../core/services/strategies/MajorityStrategy';

const router = Router();

// Dependency Injection
const votingStrategy = new MajorityStrategy();
const votingService = new VotingService(roomRepository, participantRepository, voteRepository, votingStrategy, validationService);
export const debateService = new DebateService(roomRepository, participantRepository, timerService, votingService, validationService);
const debateController = new DebateController(debateService);

/**
 * @route   POST /api/debate/:id/start
 * @desc    Start the debate (Moderator only)
 * @access  Private
 */
router.post('/:id/start', authenticate, debateActionRateLimit, debateController.start);

/**
 * @route   POST /api/debate/:id/next
 * @desc    Transition to the next state (Moderator only)
 * @access  Private
 */
router.post('/:id/next', authenticate, debateActionRateLimit, debateController.next);

/**
 * @route   GET /api/debate/:id/timer
 * @desc    Get remaining time for the current phase
 * @access  Private
 */
router.get('/:id/timer', authenticate, debateController.timerStatus);

export default router;
