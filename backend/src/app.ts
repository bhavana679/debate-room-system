import express, { Application, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './api/routes';
import { debateService } from './api/routes/debate.routes';
import { SocketService } from './realtime/SocketService';
import { logger } from './utils/logger';
import { AppError } from './utils/errors';

// Load environment variables
dotenv.config();

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';
  const code = err instanceof AppError ? err.code : 'INTERNAL_ERROR';

  logger.error({
    event: 'APP_ERROR',
    details: { 
      message, 
      code,
      stack: err.stack, 
      path: req.path, 
      method: req.method 
    }
  });

  res.status(statusCode).json({
    success: false,
    message,
    code
  });
});

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);

// Boot Socket.io - attached to the same HTTP server
new SocketService(httpServer);

httpServer.listen(PORT, async () => {
  logger.info({
    event: 'SERVER_START',
    details: { port: PORT, mode: process.env.NODE_ENV || 'development' }
  });

  // Attempt to recover internal states/timers dynamically
  try {
    await debateService.recoverTimers();
  } catch (err: any) {
    logger.error({
      event: 'RECOVERY_ERROR',
      details: { message: err.message }
    });
  }
});

export default app;
