import express from 'express';
import { createTask, getTasks, getTaskDetails, deleteTask } from '../controllers/taskController.js';
import { authenticateToken } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/security.js';

const router = express.Router();

// All task routes require authentication and rate limiting
router.use(authenticateToken);
router.use(apiLimiter);

router.post('/', createTask);
router.get('/', getTasks);
router.get('/:id', getTaskDetails);
router.delete('/:id', deleteTask);

export default router;
