import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { createInquiry, getInquiry, listInquiries, updateInquiry } from '../controllers/inquiries.controller.js';

export const inquiriesRouter = Router();

inquiriesRouter.post('/', createInquiry);

inquiriesRouter.use(authenticate);
inquiriesRouter.get('/', listInquiries);
inquiriesRouter.get('/:id', getInquiry);
inquiriesRouter.put('/:id', updateInquiry);
