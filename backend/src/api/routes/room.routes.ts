import { Router } from 'express';
import { RoomController } from '../controllers/RoomController';
import { RoomService } from '../../core/services/RoomService';
import { ArgumentController } from '../controllers/ArgumentController';
import { ArgumentService } from '../../core/services/ArgumentService';
import { DebateService } from '../../core/services/DebateService';
import { VotingService } from '../../core/services/VotingService';
import { MajorityStrategy } from '../../core/services/strategies/MajorityStrategy';
import { roomRepository, participantRepository, argumentRepository, voteRepository, timerService, validationService } from '../../infrastructure/database';
import { authenticate } from '../middleware/auth.middleware';
import { debateActionRateLimit } from '../middleware/rate-limit.middleware';

const router = Router();

// Dependency Injection
const roomService = new RoomService(roomRepository, participantRepository);
const roomController = new RoomController(roomService);

const votingStrategy = new MajorityStrategy();
const votingService = new VotingService(roomRepository, participantRepository, voteRepository, votingStrategy, validationService);
const debateService = new DebateService(roomRepository, participantRepository, timerService, votingService, validationService);
const argumentService = new ArgumentService(roomRepository, participantRepository, argumentRepository, debateService, validationService);
const argumentController = new ArgumentController(argumentService);

/**
 * @route   POST /api/rooms
 * @desc    Create a new debate room
 * @access  Private
 */
router.post('/', authenticate, debateActionRateLimit, roomController.create);

/**
 * @route   GET /api/rooms
 * @desc    List all debate rooms
 * @access  Private
 */
router.get('/', authenticate, roomController.list);

/**
 * @route   GET /api/rooms/:id
 * @desc    Get a single debate room by ID
 * @access  Private
 */
router.get('/:id', authenticate, roomController.getById);

/**
 * @route   GET /api/rooms/:id/participants
 * @desc    Get all participants in a room
 * @access  Private
 */
router.get('/:id/participants', authenticate, roomController.getParticipants);

/**
 * @route   POST /api/rooms/:id/join
 * @desc    Join a debate room
 * @access  Private
 */
router.post('/:id/join', authenticate, debateActionRateLimit, roomController.join);

/**
 * @route   POST /api/rooms/:id/assign-role
 * @desc    Assign a role to a participant (Moderator only)
 * @access  Private
 */
router.post('/:id/assign-role', authenticate, debateActionRateLimit, roomController.assignRole);

/**
 * @route   POST /api/rooms/:id/argument
 * @desc    Submit a debate argument (Active speaker only)
 * @access  Private
 */
router.post('/:id/argument', authenticate, debateActionRateLimit, argumentController.submit);

/**
 * @route   GET /api/rooms/:id/arguments
 * @desc    Retrieve all arguments for a room
 * @access  Private
 */
router.get('/:id/arguments', authenticate, argumentController.list);

export default router;
