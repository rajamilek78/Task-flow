// src/routes/columns.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { WORKFLOW_COLUMNS } from '../utils/columns';

const router = Router();

/**
 * @route   GET /api/columns
 * @desc    Get all workflow columns in order
 * @access  Private
 */
router.get('/', authenticate, (req, res) => {
  res.json({ success: true, columns: WORKFLOW_COLUMNS });
});

export default router;
