import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from '../prisma/PrismaUserRepository';
import { PrismaRoomRepository } from '../prisma/PrismaRoomRepository';
import { PrismaParticipantRepository } from '../prisma/PrismaParticipantRepository';
import { PrismaArgumentRepository } from '../prisma/PrismaArgumentRepository';
import { PrismaVoteRepository } from '../prisma/PrismaVoteRepository';

import { TimerService } from '../../core/services/TimerService';
import { ValidationService } from '../../core/services/ValidationService';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter, log: ['error', 'warn'] });

export const userRepository = new PrismaUserRepository(prisma);
export const roomRepository = new PrismaRoomRepository(prisma);
export const participantRepository = new PrismaParticipantRepository(prisma);
export const argumentRepository = new PrismaArgumentRepository(prisma);
export const voteRepository = new PrismaVoteRepository(prisma);

export const timerService = new TimerService();
export const validationService = new ValidationService(roomRepository, participantRepository);
