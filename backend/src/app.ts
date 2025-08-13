import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { apiRateLimiter } from './middlewares/rateLimit.js';
import { corsMiddleware } from './config/cors.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';
import { apiRouter } from './routes/index.js';
import { swaggerSpec } from './config/swagger.js';
import { ok } from './utils/response.js';

export const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(corsMiddleware());
app.use(morgan('combined'));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', (req, _res, next) => {
  // rate limit only API routes
  return (apiRateLimiter as any)(req, _res, next);
});

// Root endpoint
app.get('/', (_req, res) => ok(res, { message: 'API server is running', version: '1.0.0' }));

// Liveness
app.get('/health', (_req, res) => ok(res, { status: 'ok' }));

// Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API
app.use('/api', apiRouter);

// 404 & errors
app.use(notFound);
app.use(errorHandler);
