import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { multerArray, uploadImages } from '../controllers/upload.controller.js';

export const uploadRouter = Router();

uploadRouter.use(authenticate);
uploadRouter.post('/', multerArray, uploadImages);
