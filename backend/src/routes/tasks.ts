// src/routes/tasks.ts
import { Router } from 'express';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  moveTask,
  deleteTask,
  addComment,
  getTaskActivity,
  getDashboardStats,
  uploadAttachment,
  deleteAttachment,
} from '../controllers/taskController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// All task routes require authentication
router.use(authenticate);

router.get('/stats/dashboard', getDashboardStats);
router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', createTask);
router.put('/:id', updateTask);
router.put('/:id/move', moveTask);
router.delete('/:id', deleteTask);
router.post('/:id/comments', addComment);
router.get('/:id/activity', getTaskActivity);
router.post('/:id/attachments', upload.single('file'), uploadAttachment);
router.delete('/:id/attachments/:attachmentId', deleteAttachment);

export default router;
