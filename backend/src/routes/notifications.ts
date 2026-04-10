// src/routes/notifications.ts
import { Router } from 'express';
import {
  getNotifications,
  markAllRead,
  markRead,
} from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.put('/mark-read', markAllRead);
router.put('/:id/read', markRead);

export default router;
