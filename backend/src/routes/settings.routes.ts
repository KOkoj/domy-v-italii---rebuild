import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { getSettings, putSettings } from '../controllers/settings.controller.js';

export const settingsRouter = Router();

settingsRouter.use(authenticate);
settingsRouter.get('/', getSettings);
settingsRouter.put('/', putSettings);
