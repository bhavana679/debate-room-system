import { Router } from 'express';
import { VoteController } from '../controllers/VoteController';
import { VotingService } from '../../core/services/VotingService';
import { MajorityStrategy } from '../../core/services/strategies/MajorityStrategy';
import { roomRepository, participantRepository, voteRepository, validationService } from '../../infrastructure/database';
import { authenticate } from '../middleware/auth.middleware';
import { debateActionRateLimit } from '../middleware/rate-limit.middleware';

const router = Router();

// Dependency Injection; strategy is injected here, easily swappable
const votingStrategy = new MajorityStrategy();
const votingService = new VotingService(roomRepository, participantRepository, voteRepository, votingStrategy, validationService);
const voteController = new VoteController(votingService);

/**
 * @route   POST /api/rooms/:id/vote
 * @desc    Cast a vote (VOTING state only, one per user)
 * @access  Private
 */
router.post('/:id/vote', authenticate, debateActionRateLimit, voteController.cast);

/**
 * @route   GET /api/rooms/:id/result
 * @desc    Get the vote result for a room
 * @access  Private
 */
router.get('/:id/result', authenticate, voteController.result);

export default router;
