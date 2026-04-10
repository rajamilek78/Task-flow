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
} from '../controllers/taskController';
import { authenticate } from '../middleware/auth';

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

export default router;
