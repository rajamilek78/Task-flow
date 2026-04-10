// src/routes/auth.ts
import { Router } from 'express';
import {
  signup,
  login,
  getMe,
  inviteUser,
  getTeam,
  updateProfile,
} from '../controllers/authController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.post('/invite', authenticate, requireAdmin, inviteUser);
router.get('/team', authenticate, getTeam);

export default router;
