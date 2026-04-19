import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import roomRoutes from './room.routes';
import debateRoutes from './debate.routes';
import voteRoutes from './vote.routes';

const router = Router();

// Register routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);
router.use('/rooms', voteRoutes);
router.use('/debate', debateRoutes);

export default router;
