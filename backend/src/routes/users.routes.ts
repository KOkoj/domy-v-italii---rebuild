import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { createUser, deleteUser, getUser, listUsers, updateMyProfile, updateUser } from '../controllers/users.controller.js';

export const usersRouter = Router();

usersRouter.use(authenticate);
usersRouter.get('/', listUsers);
usersRouter.get('/:id', getUser);
usersRouter.post('/', createUser); // ADMIN required (enforce in UI; keep simple here)
usersRouter.put('/:id', updateUser);
usersRouter.delete('/:id', deleteUser);
usersRouter.put('/profile/me', updateMyProfile);
