import { Router } from 'express';
import { login } from './auth.controller';
import { authLimiter } from '@/middlewares/rateLimit.middleware';

const router = Router();

router.post('/login', authLimiter, login);

export default router;
