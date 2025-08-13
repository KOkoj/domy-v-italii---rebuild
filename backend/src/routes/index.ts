import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { usersRouter } from './users.routes.js';
import { propertiesRouter } from './properties.routes.js';
import { blogRouter } from './blog.routes.js';
import { inquiriesRouter } from './inquiries.routes.js';
import { settingsRouter } from './settings.routes.js';
import { uploadRouter } from './upload.routes.js';
import dashboardRouter from './dashboard.routes.js';
import { healthRouter } from './health.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/properties', propertiesRouter);
apiRouter.use('/blog', blogRouter);
apiRouter.use('/inquiries', inquiriesRouter);
apiRouter.use('/settings', settingsRouter);
apiRouter.use('/upload', uploadRouter);
apiRouter.use('/dashboard', dashboardRouter);
